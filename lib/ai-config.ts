import api from "@/lib/api"
import { isTauriRuntime } from "@/lib/platform"
import { LOCAL_MODELS, LOCAL_PROVIDER_ID } from "@/lib/local-models"

// Provider "LOCAL" : modèles exécutés localement (Rust/candle), seulement en desktop.
const LOCAL_PROVIDER: AIProvider = {
    id: LOCAL_PROVIDER_ID,
    name: "Local",
    models: LOCAL_MODELS.map((m) => ({ id: m.id, name: m.name })),
}

// Ajoute le provider LOCAL en tête si on tourne dans l'app Tauri.
const withLocal = (providers: AIProvider[]): AIProvider[] =>
    isTauriRuntime() ? [LOCAL_PROVIDER, ...providers] : providers

export interface AIModel {
    id: string
    name: string
    supportsReasoning?: boolean
    options?: {
        simple?: any;
        think?: any;
        pro?: any;
    }
}

export interface AIProvider {
    id: string
    name: string
    models: AIModel[]
}

export const DEFAULT_AI_PROVIDERS: AIProvider[] = [
    {
        id: "openai",
        name: "OpenAI",
        models: [
            { id: "gpt-4o", name: "GPT-4o" },
            { id: "gpt-4o-mini", name: "GPT-4o Mini" },
            { id: "gpt-4-turbo", name: "GPT-4 Turbo" },
        ]
    },
    {
        id: "openrouter",
        name: "OpenRouter",
        models: [
            { id: "openai/gpt-5.4-mini", name: "GPT-5.4 Mini" },
            { id: "anthropic/claude-sonnet-4.5", name: "Claude 4.5 Sonnet" },
            { id: "google/gemini-3.1-pro-preview", name: "Gemini 3.1 Pro" },
            { id: "deepseek/deepseek-chat", "name": "DeepSeek V3" },
            { id: "deepseek/deepseek-r1", "name": "DeepSeek R1" },
        ]
    }
]

export const fetchAIProviders = async (): Promise<AIProvider[]> => {
    try {
        const response = await api.get('/chatbot-config/providers')
        const data = response.data
        if (!data || !Array.isArray(data)) {
            // fallback if backend didn't return an array
            return withLocal(Array.isArray(data) ? data as AIProvider[] : DEFAULT_AI_PROVIDERS)
        }

        const providersMap: Record<string, AIProvider> = {
            "google": { id: "google", name: "Google", models: [] },
            "openai": { id: "openai", name: "OpenAI", models: [] },
            "anthropic": { id: "anthropic", name: "Anthropic", models: [] },
            "deepseek": { id: "deepseek", name: "DeepSeek", models: [] }
        }

        // We use 4 main categories as requested
        for (const item of data) {
            if (!item || !item.id) continue;

            const idStr = item.id as string;
            const providerPrefix = idStr.split("/")[0].toLowerCase();
            const rawName = item.canonical_slug ? item.canonical_slug : idStr;
            const modelName = typeof rawName === 'string' ? rawName.replace(/^[^/]+\//, '') : String(rawName);
            const supportsReasoning = Array.isArray(item.supported_parameters) && item.supported_parameters.includes("reasoning");

            const model: AIModel = {
                id: idStr,
                name: modelName,
                supportsReasoning,
                options: item.options
            }

            if (providersMap[providerPrefix]) {
                providersMap[providerPrefix].models.push(model)
            } else {
                if (!providersMap[providerPrefix]) {
                    providersMap[providerPrefix] = { id: providerPrefix, name: providerPrefix.charAt(0).toUpperCase() + providerPrefix.slice(1), models: [] }
                }
                providersMap[providerPrefix].models.push(model)
            }
        }

        return withLocal(Object.values(providersMap).filter(p => p.models.length > 0))
    } catch (error) {
        console.error("Failed to fetch AI providers", error)
        return withLocal(DEFAULT_AI_PROVIDERS)
    }
}

// Helper functions now require the provider list to be passed, 
// as it's no longer a static global constant.
export const getProviderForModel = (modelId: string, providers: AIProvider[]): string => {
    return providers.find(p => p.models.some(m => m.id === modelId))?.id || "openai"
}

export const getModelName = (modelId: string, providers: AIProvider[]): string => {
    for (const provider of providers) {
        const model = provider.models.find(m => m.id === modelId)
        if (model) return model.name
    }
    return modelId
}

export const getModelSupportsReasoning = (modelId: string, providers: AIProvider[]): boolean => {
    for (const provider of providers) {
        const model = provider.models.find(m => m.id === modelId)
        if (model && model.supportsReasoning) return true
    }
    return false
}
