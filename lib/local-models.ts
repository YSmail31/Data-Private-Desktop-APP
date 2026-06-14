// Pont vers le moteur d'inférence local (Rust/candle exposé par Tauri).
//
// Côté web (non-Tauri) ces fonctions ne sont pas appelées : le provider LOCAL
// n'est injecté dans le picker que lorsqu'on tourne dans l'app desktop.

import { invoke, Channel } from "@tauri-apps/api/core"
import { isTauriRuntime } from "@/lib/platform"

export const LOCAL_PROVIDER_ID = "local"

export interface LocalModelDef {
  id: string // sert d'identifiant modèle dans le picker (= repo HuggingFace)
  name: string
  repo: string
}

// Premier modèle proposé. Pour en ajouter d'autres, compléter cette liste.
export const LOCAL_MODELS: LocalModelDef[] = [
  {
    id: "unsloth/Qwen2-0.5B-Instruct",
    name: "Qwen2-0.5B-Instruct",
    repo: "unsloth/Qwen2-0.5B-Instruct",
  },
]

// ---------------------------------------------------------------------------
// Modèles ajoutés par l'utilisateur (nom de repo HF saisi dans la modale).
// Persistés en localStorage pour réapparaître au prochain lancement.
// ---------------------------------------------------------------------------
const CUSTOM_KEY = "local_models_custom"

export function getCustomLocalModels(): LocalModelDef[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(CUSTOM_KEY)
    const arr = raw ? JSON.parse(raw) : []
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}

export function addCustomLocalModel(repo: string): LocalModelDef {
  const name = repo.split("/").pop() || repo
  const def: LocalModelDef = { id: repo, name, repo }
  const current = getCustomLocalModels()
  const exists = current.some((m) => m.id === repo) || LOCAL_MODELS.some((m) => m.id === repo)
  if (!exists && typeof window !== "undefined") {
    localStorage.setItem(CUSTOM_KEY, JSON.stringify([...current, def]))
  }
  return def
}

// Modèles intégrés + personnalisés (dédupliqués).
export function getAllLocalModels(): LocalModelDef[] {
  const custom = getCustomLocalModels().filter((c) => !LOCAL_MODELS.some((b) => b.id === c.id))
  return [...LOCAL_MODELS, ...custom]
}

export function isLocalModel(modelId: string | undefined | null): boolean {
  if (!modelId) return false
  return getAllLocalModels().some((m) => m.id === modelId)
}

export function getLocalRepo(modelId: string): string | undefined {
  return getAllLocalModels().find((m) => m.id === modelId)?.repo
}

// ---------------------------------------------------------------------------
// Statut (téléchargé ?)
// ---------------------------------------------------------------------------
export interface ModelStatus {
  repo: string
  ready: boolean
  size_bytes: number
}

export async function localModelStatus(repo: string): Promise<ModelStatus> {
  if (!isTauriRuntime()) return { repo, ready: false, size_bytes: 0 }
  return invoke<ModelStatus>("local_model_status", { repo })
}

// ---------------------------------------------------------------------------
// Téléchargement (progression streamée 0..100 %)
// ---------------------------------------------------------------------------
type DownloadEvent =
  | { type: "progress"; downloaded: number; total: number; percent: number }
  | { type: "done" }
  | { type: "error"; message: string }

export async function downloadLocalModel(
  repo: string,
  onProgress: (percent: number) => void,
  token?: string,
): Promise<void> {
  const channel = new Channel<DownloadEvent>()
  return new Promise<void>((resolve, reject) => {
    channel.onmessage = (msg) => {
      if (msg.type === "progress") onProgress(msg.percent)
      else if (msg.type === "done") resolve()
      else if (msg.type === "error") reject(new Error(msg.message))
    }
    invoke("download_local_model", { repo, token: token || null, onEvent: channel }).catch(reject)
  })
}

// ---------------------------------------------------------------------------
// Inférence (tokens streamés)
// ---------------------------------------------------------------------------
type InferenceEvent =
  | { type: "token"; text: string }
  | { type: "done" }
  | { type: "error"; message: string }

export async function runLocalModel(
  repo: string,
  prompt: string,
  onToken: (text: string) => void,
): Promise<void> {
  const channel = new Channel<InferenceEvent>()
  return new Promise<void>((resolve, reject) => {
    channel.onmessage = (msg) => {
      if (msg.type === "token") onToken(msg.text)
      else if (msg.type === "done") resolve()
      else if (msg.type === "error") reject(new Error(msg.message))
    }
    invoke("run_local_model", { repo, prompt, onEvent: channel }).catch(reject)
  })
}
