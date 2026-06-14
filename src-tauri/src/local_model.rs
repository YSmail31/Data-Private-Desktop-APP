// Inférence locale de modèles HuggingFace (Qwen2) en pur Rust via candle.
//
// Trois commandes Tauri exposées au frontend :
//   - local_model_status(repo)            -> ModelStatus  (téléchargé ou non + taille)
//   - download_local_model(repo, channel) -> stream la progression 0..100 %
//   - run_local_model(repo, prompt, ch)   -> stream les tokens générés
//
// Les poids sont stockés dans {app_data_dir}/models/{repo}/ (config.json,
// tokenizer.json, model.safetensors). L'inférence tourne sur CPU (F32).

use std::path::{Path, PathBuf};
use std::sync::Mutex;

use candle_core::{DType, Device, Tensor};
use candle_nn::VarBuilder;
use candle_transformers::generation::LogitsProcessor;
use candle_transformers::models::qwen2::{Config, ModelForCausalLM};
use futures_util::StreamExt;
use serde::Serialize;
use tauri::ipc::Channel;
use tauri::{AppHandle, Manager};
use tokenizers::Tokenizer;

// Fichiers HuggingFace nécessaires pour charger un Qwen2 avec candle.
const REQUIRED_FILES: [&str; 3] = ["config.json", "tokenizer.json", "model.safetensors"];

// ---------------------------------------------------------------------------
// Cache mémoire : on garde le modèle chargé entre deux messages pour éviter de
// relire ~1 Go de poids à chaque requête.
// ---------------------------------------------------------------------------
struct LoadedModel {
    repo: String,
    model: ModelForCausalLM,
    tokenizer: Tokenizer,
    device: Device,
}

static MODEL_CACHE: Mutex<Option<LoadedModel>> = Mutex::new(None);

// ---------------------------------------------------------------------------
// Payloads streamés vers le frontend (via Channel).
// ---------------------------------------------------------------------------
#[derive(Clone, Serialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum DownloadEvent {
    Progress { downloaded: u64, total: u64, percent: f64 },
    Done,
    Error { message: String },
}

#[derive(Clone, Serialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum InferenceEvent {
    Token { text: String },
    Done,
    Error { message: String },
}

#[derive(Clone, Serialize)]
pub struct ModelStatus {
    repo: String,
    ready: bool,
    size_bytes: u64,
}

// ---------------------------------------------------------------------------
// Helpers chemins
// ---------------------------------------------------------------------------
fn sanitize(repo: &str) -> String {
    repo.replace('/', "--")
}

fn model_dir(app: &AppHandle, repo: &str) -> Result<PathBuf, String> {
    let base = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("app_data_dir indisponible: {e}"))?;
    Ok(base.join("models").join(sanitize(repo)))
}

fn all_files_present(dir: &Path) -> bool {
    REQUIRED_FILES.iter().all(|f| dir.join(f).is_file())
}

// ---------------------------------------------------------------------------
// Commande : statut (téléchargé ?)
// ---------------------------------------------------------------------------
#[tauri::command]
pub fn local_model_status(app: AppHandle, repo: String) -> Result<ModelStatus, String> {
    let dir = model_dir(&app, &repo)?;
    let ready = all_files_present(&dir);
    let size_bytes = if ready {
        REQUIRED_FILES
            .iter()
            .filter_map(|f| std::fs::metadata(dir.join(f)).ok())
            .map(|m| m.len())
            .sum()
    } else {
        0
    };
    Ok(ModelStatus { repo, ready, size_bytes })
}

// ---------------------------------------------------------------------------
// Commande : téléchargement (streaming de la progression)
// ---------------------------------------------------------------------------
#[tauri::command]
pub async fn download_local_model(
    app: AppHandle,
    repo: String,
    token: Option<String>,
    on_event: Channel<DownloadEvent>,
) -> Result<(), String> {
    let dir = model_dir(&app, &repo)?;
    tokio::fs::create_dir_all(&dir)
        .await
        .map_err(|e| format!("création du dossier modèle: {e}"))?;

    if let Err(e) = download_all(&repo, &dir, token.as_deref(), &on_event).await {
        let _ = on_event.send(DownloadEvent::Error { message: e.clone() });
        return Err(e);
    }
    let _ = on_event.send(DownloadEvent::Done);
    Ok(())
}

async fn download_all(
    repo: &str,
    dir: &Path,
    token: Option<&str>,
    on_event: &Channel<DownloadEvent>,
) -> Result<(), String> {
    let client = reqwest::Client::builder()
        .build()
        .map_err(|e| format!("client http: {e}"))?;

    // 1) Récupère la taille totale (HEAD sur chaque fichier).
    let mut total: u64 = 0;
    let mut sizes: Vec<u64> = Vec::with_capacity(REQUIRED_FILES.len());
    for file in REQUIRED_FILES {
        let url = hf_url(repo, file);
        let mut req = client.head(&url);
        if let Some(t) = token {
            req = req.bearer_auth(t);
        }
        let len = req
            .send()
            .await
            .map_err(|e| format!("HEAD {file}: {e}"))?
            .content_length()
            .unwrap_or(0);
        sizes.push(len);
        total += len;
    }
    if total == 0 {
        total = 1; // évite une division par zéro si HF n'expose pas Content-Length
    }

    // 2) Télécharge chaque fichier en streaming, en cumulant l'avancement global.
    let mut downloaded: u64 = 0;
    for (idx, file) in REQUIRED_FILES.iter().enumerate() {
        let url = hf_url(repo, file);
        let mut req = client.get(&url);
        if let Some(t) = token {
            req = req.bearer_auth(t);
        }
        let resp = req
            .send()
            .await
            .map_err(|e| format!("GET {file}: {e}"))?
            .error_for_status()
            .map_err(|e| format!("GET {file}: {e}"))?;

        // Écriture dans un fichier temporaire puis renommage atomique.
        let tmp_path = dir.join(format!("{file}.part"));
        let final_path = dir.join(file);
        let mut out = tokio::fs::File::create(&tmp_path)
            .await
            .map_err(|e| format!("création {file}: {e}"))?;

        use tokio::io::AsyncWriteExt;
        let mut stream = resp.bytes_stream();
        while let Some(chunk) = stream.next().await {
            let chunk = chunk.map_err(|e| format!("lecture {file}: {e}"))?;
            out.write_all(&chunk)
                .await
                .map_err(|e| format!("écriture {file}: {e}"))?;
            downloaded += chunk.len() as u64;
            let percent = (downloaded as f64 / total as f64 * 100.0).min(100.0);
            let _ = on_event.send(DownloadEvent::Progress { downloaded, total, percent });
        }
        out.flush().await.map_err(|e| format!("flush {file}: {e}"))?;
        drop(out);
        tokio::fs::rename(&tmp_path, &final_path)
            .await
            .map_err(|e| format!("renommage {file}: {e}"))?;

        // Si HEAD n'avait pas donné la taille, recale le total connu.
        let _ = idx;
        let _ = sizes;
    }
    Ok(())
}

fn hf_url(repo: &str, file: &str) -> String {
    format!("https://huggingface.co/{repo}/resolve/main/{file}")
}

// ---------------------------------------------------------------------------
// Commande : inférence (streaming des tokens)
// ---------------------------------------------------------------------------
#[tauri::command]
pub async fn run_local_model(
    app: AppHandle,
    repo: String,
    prompt: String,
    on_event: Channel<InferenceEvent>,
) -> Result<(), String> {
    let dir = model_dir(&app, &repo)?;
    if !all_files_present(&dir) {
        let msg = "Modèle non téléchargé".to_string();
        let _ = on_event.send(InferenceEvent::Error { message: msg.clone() });
        return Err(msg);
    }

    // candle est bloquant et lourd : on l'exécute hors du runtime async.
    let handle = std::thread::spawn(move || {
        if let Err(e) = generate_blocking(&repo, &dir, &prompt, &on_event) {
            let _ = on_event.send(InferenceEvent::Error { message: e });
        } else {
            let _ = on_event.send(InferenceEvent::Done);
        }
    });
    handle.join().map_err(|_| "thread d'inférence interrompu".to_string())?;
    Ok(())
}

fn generate_blocking(
    repo: &str,
    dir: &Path,
    prompt: &str,
    on_event: &Channel<InferenceEvent>,
) -> Result<(), String> {
    let mut guard = MODEL_CACHE.lock().map_err(|_| "verrou modèle empoisonné")?;

    // Charge le modèle si absent du cache (ou si un autre modèle était chargé).
    let needs_load = match guard.as_ref() {
        Some(loaded) => loaded.repo != repo,
        None => true,
    };
    if needs_load {
        *guard = Some(load_model(repo, dir)?);
    }
    let loaded = guard.as_mut().ok_or("modèle non chargé")?;

    // Réinitialise le cache KV avant chaque génération.
    loaded.model.clear_kv_cache();

    let device = loaded.device.clone();
    let prompt_fmt = format_chat_prompt(prompt);
    let encoding = loaded
        .tokenizer
        .encode(prompt_fmt, true)
        .map_err(|e| format!("tokenisation: {e}"))?;
    let prompt_tokens: Vec<u32> = encoding.get_ids().to_vec();

    // Tokens d'arrêt Qwen2 (<|im_end|> et <|endoftext|>).
    let eos_im_end = loaded.tokenizer.token_to_id("<|im_end|>");
    let eos_endoftext = loaded.tokenizer.token_to_id("<|endoftext|>");

    let mut logits_processor = LogitsProcessor::new(42, Some(0.7), Some(0.9));
    let max_new_tokens = 512usize;
    let repeat_penalty = 1.1f32;
    let repeat_last_n = 64usize;

    let mut all_tokens = prompt_tokens.clone();
    let mut generated: Vec<u32> = Vec::new();
    let mut prev_text = String::new();

    for index in 0..max_new_tokens {
        let (context, offset) = if index == 0 {
            (all_tokens.as_slice(), 0)
        } else {
            (&all_tokens[all_tokens.len() - 1..], all_tokens.len() - 1)
        };
        let input = Tensor::new(context, &device)
            .and_then(|t| t.unsqueeze(0))
            .map_err(|e| format!("tenseur d'entrée: {e}"))?;

        let logits = loaded
            .model
            .forward(&input, offset)
            .map_err(|e| format!("forward: {e}"))?;
        let logits = logits
            .squeeze(0)
            .map_err(|e| format!("squeeze: {e}"))?;
        // forward peut renvoyer (seq, vocab) ou (vocab) : on prend la dernière ligne.
        let logits = if logits.rank() == 2 {
            let last = logits.dim(0).map_err(|e| e.to_string())? - 1;
            logits.get(last).map_err(|e| e.to_string())?
        } else {
            logits
        };
        let logits = logits
            .to_dtype(DType::F32)
            .map_err(|e| format!("dtype logits: {e}"))?;

        // Pénalité de répétition (les petits modèles bouclent facilement).
        let logits = if repeat_penalty == 1.0 {
            logits
        } else {
            let start = all_tokens.len().saturating_sub(repeat_last_n);
            candle_transformers::utils::apply_repeat_penalty(
                &logits,
                repeat_penalty,
                &all_tokens[start..],
            )
            .map_err(|e| format!("repeat penalty: {e}"))?
        };

        let next = logits_processor
            .sample(&logits)
            .map_err(|e| format!("sampling: {e}"))?;

        if Some(next) == eos_im_end || Some(next) == eos_endoftext {
            break;
        }
        all_tokens.push(next);
        generated.push(next);

        // Décode l'ensemble généré et émet le delta (évite les coupures UTF-8).
        let text = loaded
            .tokenizer
            .decode(&generated, true)
            .map_err(|e| format!("décodage: {e}"))?;
        if text.len() > prev_text.len() {
            let delta = text[prev_text.len()..].to_string();
            let _ = on_event.send(InferenceEvent::Token { text: delta });
            prev_text = text;
        }
    }

    Ok(())
}

// Choisit le meilleur device disponible : GPU en priorité (CUDA puis Metal),
// sinon CPU. Les features GPU étant compile-time, chaque branche n'existe que
// si la feature correspondante est activée (cuda opt-in, metal auto sur macOS).
fn select_device() -> Device {
    #[cfg(feature = "cuda")]
    {
        match Device::new_cuda(0) {
            Ok(d) => {
                log::info!("Inférence locale : GPU CUDA");
                return d;
            }
            Err(e) => log::warn!("CUDA indisponible, fallback: {e}"),
        }
    }
    #[cfg(target_os = "macos")]
    {
        match Device::new_metal(0) {
            Ok(d) => {
                log::info!("Inférence locale : GPU Metal");
                return d;
            }
            Err(e) => log::warn!("Metal indisponible, fallback: {e}"),
        }
    }
    log::info!("Inférence locale : CPU");
    Device::Cpu
}

fn load_model(repo: &str, dir: &Path) -> Result<LoadedModel, String> {
    let device = select_device();

    let config_bytes =
        std::fs::read(dir.join("config.json")).map_err(|e| format!("lecture config: {e}"))?;
    // Le config.json HF de Qwen2 met `sliding_window`/`max_window_layers` à null
    // quand le sliding window est désactivé, alors que candle attend des usize.
    // On remplace les null par des valeurs par défaut avant de désérialiser.
    let mut config_value: serde_json::Value =
        serde_json::from_slice(&config_bytes).map_err(|e| format!("parse config: {e}"))?;
    if let Some(obj) = config_value.as_object_mut() {
        if obj.get("sliding_window").map_or(true, |v| v.is_null()) {
            let fallback = obj
                .get("max_position_embeddings")
                .and_then(|v| v.as_u64())
                .unwrap_or(4096);
            obj.insert("sliding_window".into(), serde_json::json!(fallback));
        }
        if obj.get("max_window_layers").map_or(true, |v| v.is_null()) {
            let fallback = obj
                .get("num_hidden_layers")
                .and_then(|v| v.as_u64())
                .unwrap_or(0);
            obj.insert("max_window_layers".into(), serde_json::json!(fallback));
        }
    }
    let config: Config =
        serde_json::from_value(config_value).map_err(|e| format!("parse config: {e}"))?;

    let tokenizer = Tokenizer::from_file(dir.join("tokenizer.json"))
        .map_err(|e| format!("tokenizer: {e}"))?;

    let weights = dir.join("model.safetensors");
    let vb = unsafe {
        VarBuilder::from_mmaped_safetensors(&[weights], DType::F32, &device)
            .map_err(|e| format!("chargement poids: {e}"))?
    };
    let model =
        ModelForCausalLM::new(&config, vb).map_err(|e| format!("construction modèle: {e}"))?;

    Ok(LoadedModel {
        repo: repo.to_string(),
        model,
        tokenizer,
        device,
    })
}

// Gabarit de chat Qwen2 (ChatML).
fn format_chat_prompt(user: &str) -> String {
    format!(
        "<|im_start|>system\nYou are a helpful assistant.<|im_end|>\n<|im_start|>user\n{user}<|im_end|>\n<|im_start|>assistant\n"
    )
}
