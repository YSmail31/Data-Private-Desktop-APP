"use client";

import * as React from "react";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import {
  MessageSquare, Send, Shield, Search, Plus, Trash2, Bot, Settings,
  User, Eye, EyeOff, Copy, RotateCcw, BrainCircuit,
  Square, Loader2, FileText, X, Paperclip, ChevronDown, Sparkles, Check, CheckCircle2,
  XCircle, FileIcon, Lock, Unlock, Menu, ChevronLeft, ChevronRight,
  Brain, Zap, Sun, Moon, LogOut, Download
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarSub,
  MenubarSubTrigger,
  MenubarSubContent,
  MenubarItem,
  MenubarSeparator,
  MenubarLabel,
  MenubarPortal
} from "@/components/ui/menubar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  PopoverAnchor,
} from "@/components/ui/popover";
import { fetchAIProviders, DEFAULT_AI_PROVIDERS, AIProvider, getModelSupportsReasoning } from "@/lib/ai-config";
import { getInitials, labels_dict, translations } from "@/lib/translations";
import {
  LOCAL_PROVIDER_ID, isLocalModel, getLocalRepo,
  getAllLocalModels, addCustomLocalModel,
  localModelStatus, downloadLocalModel, runLocalModel,
} from "@/lib/local-models";

interface PII {
  id: string;
  value: string;
  type: string;
  placeholder?: string;
  locked: boolean;
  isPrivate?: boolean;
  start?: number;
  end?: number;
}

interface FileProcessingStatus {
  id: string;
  filename: string;
  status: "pending" | "loader" | "anonymisation" | "finished" | "error";
  error?: string;
  output_base64?: string;
  mime_type?: string;
  pii_map?: Record<string, string>;
}

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  piis: PII[];
  showPiiValues: boolean;
  isLoading?: boolean;
  error?: boolean;
  isProcessingFiles?: boolean;
  fileProcessingStatus?: FileProcessingStatus[];
  filePiiMappings?: Record<string, string>;
  raw_content?: string;
  reasoning?: string;
  isReasoning?: boolean;
  files?: Array<{
    mime_type: string;
    data: string;
    filename: string;
    anonymized_markdown?: string;
  }>;
}

const getPiiColor = (type: string) => {
  const typeLower = type.toLowerCase().replace(/ /g, '_');
  for (const [category, labels] of Object.entries(labels_dict)) {
    if (labels.some(l => l.toLowerCase().replace(/ /g, '_') === typeLower)) {
      switch (category) {
        case 'personal_identity': return "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30";
        case 'contact_information': return "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30";
        case 'financial_information': return "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30";
        case 'health_information': return "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30";
        case 'sensitive_personal_information': return "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30";
        case 'professional_information': return "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30";
        case 'vehicle_and_travel': return "bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30";
        case 'technical_and_digital': return "bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30";
        case 'date_and_time': return "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/30";
        default: return "bg-muted text-foreground border-border";
      }
    }
  }
  return "bg-muted text-foreground border-border";
}

const getPiiLabel = (type: string) => {
  if (type.startsWith('user_')) {
    return type.split('_pii_')[0].replace(/_/g, ' ');
  }
  return type;
}

export function ChatSection() {
  const { lang, user, userConsumption, activeView, setActiveView, refreshData, openRouterKeyInfo } = useApp();
  const activeTab = activeView;
  const isMobile = useIsMobile();
  const t = translations[lang] || translations.en;

  const [messages, setMessages] = React.useState<Message[]>([]);
  const [input, setInput] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [isDetecting, setIsDetecting] = React.useState(false);
  const [isStreaming, setIsStreaming] = React.useState(false);
  const [attachedFiles, setAttachedFiles] = React.useState<File[]>([]);

  const [sessions, setSessions] = React.useState<any[]>([]);
  const [activeSessionId, setActiveSessionId] = React.useState<number | null>(null);
  const [sessionSearch, setSessionSearch] = React.useState("");
  const [historyOpen, setHistoryOpen] = React.useState(true);

  const [piiOpen, setPiiOpen] = React.useState(false);
  const [piiSearch, setPiiSearch] = React.useState("");

  // Thème clair/sombre + déconnexion (footer de la sidebar Historique)
  const [isDark, setIsDark] = React.useState(false);
  React.useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);
  React.useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);
  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const [aiProviders, setAiProviders] = React.useState<AIProvider[]>(DEFAULT_AI_PROVIDERS);
  const [aiConfig, setAiConfig] = React.useState({ provider: "openrouter", model: "google/gemini-2.0-flash-lite:free", api_key: "" });
  const [savedCredentials, setSavedCredentials] = React.useState<Record<string, string>>({});

  // État des modèles locaux (téléchargés via Rust/candle). Clé = id du modèle.
  type LocalState = { state: "unknown" | "idle" | "downloading" | "ready"; percent: number };
  const [localStatus, setLocalStatus] = React.useState<Record<string, LocalState>>({});

  // Modale d'ajout d'un modèle HuggingFace personnalisé.
  const [addLocalOpen, setAddLocalOpen] = React.useState(false);
  const [newRepo, setNewRepo] = React.useState("");
  const [newHfKey, setNewHfKey] = React.useState("");

  // Au montage (desktop uniquement) : vérifie quels modèles locaux sont déjà téléchargés.
  React.useEffect(() => {
    getAllLocalModels().forEach(async (m) => {
      try {
        const st = await localModelStatus(m.repo);
        setLocalStatus((s) => ({ ...s, [m.id]: { state: st.ready ? "ready" : "idle", percent: st.ready ? 100 : 0 } }));
      } catch {
        setLocalStatus((s) => ({ ...s, [m.id]: { state: "idle", percent: 0 } }));
      }
    });
  }, []);

  const handleDownloadLocal = async (modelId: string, token?: string) => {
    const repo = getLocalRepo(modelId);
    if (!repo) return;
    setLocalStatus((s) => ({ ...s, [modelId]: { state: "downloading", percent: 0 } }));
    try {
      await downloadLocalModel(repo, (percent) => {
        setLocalStatus((s) => ({ ...s, [modelId]: { state: "downloading", percent } }));
      }, token);
      setLocalStatus((s) => ({ ...s, [modelId]: { state: "ready", percent: 100 } }));
      toast.success(lang === "fr" ? "Modèle téléchargé" : "Model downloaded");
    } catch (e: any) {
      setLocalStatus((s) => ({ ...s, [modelId]: { state: "idle", percent: 0 } }));
      toast.error(e?.message || (lang === "fr" ? "Échec du téléchargement" : "Download failed"));
    }
  };

  // Ajoute un modèle HF saisi dans la modale, l'insère dans le picker et lance le download.
  const handleAddLocalModel = async () => {
    const repo = newRepo.trim();
    if (!repo.includes("/")) {
      toast.error(lang === "fr" ? "Format attendu : organisation/modele" : "Expected format: org/model");
      return;
    }
    const def = addCustomLocalModel(repo);
    // Insère le modèle dans le provider LOCAL du picker (immédiatement visible).
    setAiProviders((prev) => {
      const hasLocal = prev.some((p) => p.id === LOCAL_PROVIDER_ID);
      if (hasLocal) {
        return prev.map((p) => p.id === LOCAL_PROVIDER_ID
          ? { ...p, models: [...p.models.filter((m) => m.id !== def.id), { id: def.id, name: def.name }] }
          : p);
      }
      return [{ id: LOCAL_PROVIDER_ID, name: "Local", models: [{ id: def.id, name: def.name }] }, ...prev];
    });
    const token = newHfKey.trim();
    setAddLocalOpen(false);
    setNewRepo("");
    setNewHfKey("");
    await handleDownloadLocal(def.id, token || undefined);
  };

  const scrollRef = React.useRef<HTMLDivElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const previewDivRef = React.useRef<HTMLDivElement>(null);
  const [abortController, setAbortController] = React.useState<AbortController | null>(null);
  const currentContentRef = React.useRef("");

  const [isAiConfigModalOpen, setIsAiConfigModalOpen] = React.useState(false);
  const [showAddProvider, setShowAddProvider] = React.useState(false);
  const [editingProvider, setEditingProvider] = React.useState<string | null>(null);
  const [providerDialogConfig, setProviderDialogConfig] = React.useState({ provider: "openai", model: "", api_key: "" });
  const [showApiKey, setShowApiKey] = React.useState(false);
  const [isTestingConfig, setIsTestingConfig] = React.useState(false);
  const [isSavingAiConfig, setIsSavingAiConfig] = React.useState(false);

  const [activeSelection, setActiveSelection] = React.useState<{ rect: DOMRect, msgId?: string, text?: string, start?: number, end?: number } | null>(null);
  const [manualAnonymizeStep, setManualAnonymizeStep] = React.useState<'init' | 'labels'>('init');
  const [manualLabelsSearch, setManualLabelsSearch] = React.useState("");
  const [isAnonymized, setIsAnonymized] = React.useState(false);
  const [currentEntities, setCurrentEntities] = React.useState<PII[]>([]);
  const [originalInput, setOriginalInput] = React.useState("");
  const [modelSearch, setModelSearch] = React.useState("");
  const [reasoningEffort, setReasoningEffort] = React.useState("low");
  const modelOptions = React.useMemo(() => {
    let currentModel: any = null;
    let parentModel: any = null;

    for (const p of aiProviders) {
      const found = p.models.find(m => m.id === aiConfig.model);
      if (found) {
        currentModel = found;
        parentModel = found;
        break;
      }
    }

    if (!currentModel) {
      for (const p of aiProviders) {
        for (const m of p.models) {
          if (m.options) {
            const isOption = Object.values(m.options).some((opt: any) => opt?.id === aiConfig.model);
            if (isOption) {
              currentModel = m;
              parentModel = m;
              break;
            }
          }
        }
        if (currentModel) break;
      }
    }

    if (!currentModel) return null;

    const options: any = {
      auto: { id: currentModel.id, name: "Auto" }
    };

    if (currentModel.options) {
      Object.assign(options, currentModel.options);
    } else if (currentModel.supportsReasoning) {
      options.simple = { id: currentModel.id, name: currentModel.name };
      options.think = { id: currentModel.id, name: currentModel.name };
    }

    return {
      type: 'multi-model' as const,
      options,
      allowed_models: Array.from(new Set(
        Object.entries(options)
          .filter(([key]) => key !== 'auto')
          .map(([_, opt]: any) => opt.id)
      )).filter(Boolean)
    };
  }, [aiConfig.model, aiProviders]);

  const isThinkingModel = React.useMemo(() => {
    if (modelOptions) return true;
    const modelId = aiConfig.model?.toLowerCase() || "";
    const nameMatch = modelId.includes(":thinking") ||
      modelId.includes("o1") ||
      modelId.includes("o3") ||
      modelId.includes("deepseek-r1") ||
      modelId.includes("gemini-3.1") ||
      modelId.includes("reasoning");
    return nameMatch || getModelSupportsReasoning(aiConfig.model, aiProviders);
  }, [aiConfig.model, aiProviders, modelOptions]);

  const [activeModeModelId, setActiveModeModelId] = React.useState<string>(aiConfig.model);
  const [activeOption, setActiveOption] = React.useState<string>("auto");

  React.useEffect(() => {
    if (aiConfig.model) {
      setActiveModeModelId(aiConfig.model);
      // Determine activeOption based on modelOptions logic
      if (modelOptions?.type === 'multi-model') {
        if (aiConfig.model === modelOptions.options.auto?.id) setActiveOption("auto");
        else if (aiConfig.model === modelOptions.options.simple?.id) setActiveOption("simple");
        else if (aiConfig.model === modelOptions.options.think?.id) setActiveOption("think");
        else if (aiConfig.model === modelOptions.options.pro?.id) setActiveOption("pro");
        else if (aiConfig.model === modelOptions.options.research?.id) setActiveOption("research");
      } else {
        setActiveOption("auto");
      }
    }
  }, [aiConfig.model, modelOptions]);

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success(lang === 'fr' ? "Copié dans le presse-papier" : "Copied to clipboard");
  };

  const handleRetry = (msgId: string) => {
    const msgIndex = messages.findIndex(m => m.id === msgId);
    if (msgIndex > 0) {
      const lastUserMsg = messages.slice(0, msgIndex).reverse().find(m => m.role === 'user');
      if (lastUserMsg) {
        setInput(lastUserMsg.raw_content || lastUserMsg.content);
        setMessages(prev => prev.slice(0, messages.indexOf(lastUserMsg)));
        handleSend();
      }
    }
  };

  const handleDeleteProvider = async (providerId: string) => {
    try {
      await api.delete(`/chatbot-config/credentials/${providerId}`);
      const newCredentials = { ...savedCredentials };
      delete newCredentials[providerId];
      setSavedCredentials(newCredentials);
      toast.success(lang === 'fr' ? "Fournisseur supprimé" : "Provider deleted");
      if (aiConfig.provider === providerId) {
        setAiConfig({ provider: 'google-free', model: 'gemini-2.0-flash', api_key: '' });
      }
    } catch (err) {
      console.error("Failed to delete provider", err);
      toast.error(lang === 'fr' ? "Erreur lors de la suppression" : "Error deleting provider");
    }
  };

  const handleSaveProviderConfig = async () => {
    setIsSavingAiConfig(true);
    try {
      await api.post('/chatbot-config/credentials', providerDialogConfig);
      await fetchSavedCredentials();
      setShowAddProvider(false);
      setEditingProvider(null);
      toast.success(lang === 'fr' ? "Configuration enregistrée" : "Configuration saved");
    } catch (err) {
      console.error("Failed to save config", err);
      toast.error(lang === 'fr' ? "Erreur lors de l'enregistrement" : "Error saving configuration");
    } finally {
      setIsSavingAiConfig(false);
    }
  };

  const handleTestAiConfig = async () => {
    setIsTestingConfig(true);
    try {
      await api.post('/chatbot-config/test-connection', providerDialogConfig);
      toast.success(lang === 'fr' ? "Connexion réussie" : "Connection successful");
    } catch (err) {
      console.error("Test failed", err);
      toast.error(lang === 'fr' ? "Échec de la connexion" : "Connection failed");
    } finally {
      setIsTestingConfig(false);
    }
  };

  const handleManualAnonymize = async (label: string) => {
    if (!activeSelection || !activeSelection.text) return;

    setCurrentEntities(prev => {
      const newEntity: PII = {
        id: `manual-${Date.now()}`,
        value: activeSelection.text!,
        type: label,
        locked: false,
        isPrivate: true,
        start: activeSelection.start,
        end: activeSelection.end
      };
      return [...prev, newEntity];
    });

    setActiveSelection(null);
    toast.success(lang === 'fr' ? "Anonymisé manuellement" : "Manually anonymized");
  };

  const handleDeleteManualEntity = (id: string) => {
    setCurrentEntities(prev => prev.filter(ent => ent.id !== id));
    toast.success(lang === 'fr' ? "Anonymisation supprimée" : "Anonymization removed");
  };

  const handleTextSelection = () => {
    if (!isAnonymized) return;
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return;

    const range = selection.getRangeAt(0);
    const text = selection.toString().trim();
    if (!text) return;

    if (!previewDivRef.current || !previewDivRef.current.contains(range.commonAncestorContainer)) return;

    const rect = range.getBoundingClientRect();
    const rawStart = getSelectionOffset(previewDivRef.current, range.startContainer, range.startOffset);
    const rawEnd = rawStart + text.length;

    // Expand to word boundaries
    const { start, end, expandedText } = expandToWordBoundaries(originalInput, rawStart, rawEnd);

    // Check for overlaps with existing entities
    const hasOverlap = currentEntities.some(ent =>
      (start >= ent.start! && start < ent.end!) ||
      (end > ent.start! && end <= ent.end!) ||
      (ent.start! >= start && ent.start! < end)
    );
    if (hasOverlap) {
      selection.removeAllRanges();
      return;
    }

    // Visual selection expansion
    const startNodeInfo = getNodeAndOffsetAt(previewDivRef.current, start);
    const endNodeInfo = getNodeAndOffsetAt(previewDivRef.current, end);
    if (startNodeInfo && endNodeInfo) {
      try {
        const newRange = document.createRange();
        newRange.setStart(startNodeInfo.node, startNodeInfo.offset);
        newRange.setEnd(endNodeInfo.node, endNodeInfo.offset);
        selection.removeAllRanges();
        selection.addRange(newRange);
      } catch (e) {
        console.error("Failed to update visual selection", e);
      }
    }

    setActiveSelection({ rect, text: expandedText, start, end });
  };

  const handleAnonymize = async () => {
    if (!input.trim()) return;
    setIsDetecting(true);
    try {
      const detectionRes = await api.post('/pii/extract', { text: input });
      const entities = detectionRes.data.entities || [];

      const mappedEntities: PII[] = [];
      const currentInput = input;

      // Sort entities by value length descending to prioritize longer matches (like emails over names)
      const sortedDetections = [...entities].sort((a: any, b: any) => b.value.length - a.value.length);

      sortedDetections.forEach((ent: any) => {
        const val = ent.value;
        const type = ent.entity || ent.type;

        const addEntity = (start: number, end: number) => {
          // Check for overlaps
          const hasOverlap = mappedEntities.some(e =>
            (start >= e.start! && start < e.end!) ||
            (end > e.start! && end <= e.end!) ||
            (e.start! >= start && e.start! < end)
          );
          if (!hasOverlap) {
            mappedEntities.push({
              id: `pii-${Date.now()}-${mappedEntities.length}`,
              value: val,
              type: type,
              locked: false,
              isPrivate: true,
              start,
              end
            });
          }
        };

        if (ent.start !== undefined && ent.end !== undefined) {
          addEntity(ent.start, ent.end);
        } else {
          let pos = currentInput.indexOf(val);
          while (pos !== -1) {
            addEntity(pos, pos + val.length);
            pos = currentInput.indexOf(val, pos + 1);
          }
        }
      });

      // Sort final entities by position for the renderer
      setCurrentEntities(mappedEntities.sort((a, b) => a.start! - b.start!));
      setOriginalInput(input);
      setIsAnonymized(true);
    } catch (err) {
      console.error("PII detection failed", err);
      toast.error(lang === 'fr' ? "Échec de l'anonymisation" : "Anonymization failed");
    } finally {
      setIsDetecting(false);
    }
  };

  const handleRestoreInput = () => {
    setIsAnonymized(false);
    setInput(originalInput);
    setCurrentEntities([]);
  };

  const toggleEntityPrivacy = (id: string | number) => {
    setCurrentEntities(prev => prev.map(ent =>
      ent.id === id ? { ...ent, isPrivate: !ent.isPrivate } : ent
    ));
  };

  const togglePiiLock = (piiValue: string) => {
    setMessages(prev => prev.map(m => ({
      ...m,
      piis: m.piis.map(p => p.value === piiValue ? { ...p, locked: !p.locked } : p)
    })));
  };

  const handleDeletePii = (piiValue: string) => {
    setMessages(prev => prev.map(m => ({
      ...m,
      piis: m.piis.filter(p => p.value !== piiValue)
    })));
  };

  const exampleMessages: Message[] = [
    {
      id: "1", role: "assistant", content: t.chatbot.welcome + " ! " + t.chatbot.iam + " Data Private. " + t.chatbot.subtitle, timestamp: new Date(), piis: [], showPiiValues: false
    }
  ];

  React.useEffect(() => {
    if (messages.length === 0) setMessages(exampleMessages);
  }, []);

  React.useEffect(() => {
    const loadProviders = async () => {
      const providers = await fetchAIProviders();
      setAiProviders(providers);
    };
    loadProviders();
    fetchSavedCredentials();
    fetchAiConfig();
  }, []);

  React.useEffect(() => {
    if (activeView === 'chatbot') {
      fetchSessions(sessionSearch);
      api.post('/pii/wakeup').catch(e => console.error("Wakeup failed", e));
    }
  }, [activeView, sessionSearch]);

  React.useEffect(() => {
    if (piiOpen && historyOpen) setHistoryOpen(false);
  }, [piiOpen]);

  React.useEffect(() => {
    if (historyOpen && piiOpen) setPiiOpen(false);
  }, [historyOpen]);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchSavedCredentials = async () => {
    try {
      const res = await api.get('/chatbot-config/credentials');
      setSavedCredentials(res.data);
    } catch (err) {
      console.error("Failed to fetch credentials", err);
    }
  }

  const fetchAiConfig = async () => {
    try {
      const res = await api.get('/chatbot-config/');
      if (res.data && res.data.model) {
        setAiConfig({ provider: res.data.provider, model: res.data.model, api_key: res.data.api_key });
      } else {
        setAiConfig({ provider: 'google-free', model: 'gemini-2.0-flash', api_key: '' });
      }
    } catch (err) {
      console.error("Failed to fetch AI config", err);
    }
  }

  const fetchSessions = async (search?: string) => {
    try {
      const res = await api.get('/chatbot/sessions', { params: { search } });
      setSessions(res.data);
    } catch (err) {
      console.error("Failed to fetch sessions", err);
    }
  }

  const fetchMessages = async (sessionId: number) => {
    try {
      const res = await api.get(`/chatbot/sessions/${sessionId}/messages`);
      setMessages(res.data.map((m: any) => ({
        ...m,
        timestamp: new Date(m.timestamp),
        showPiiValues: m.role === 'user' && m.piis?.some((p: any) => !p.id?.startsWith('doc-pii-'))
      })));
    } catch (err) {
      console.error("Failed to fetch messages", err);
    }
  }

  const createSession = async (title: string = "Nouveau Chat") => {
    try {
      const res = await api.post('/chatbot/sessions', { title });
      setSessions(prev => [res.data, ...prev]);
      setActiveSessionId(res.data.id);
      setMessages([]);
      return res.data;
    } catch (err) {
      console.error("Failed to create session", err);
    }
  }

  const deleteSession = async (sessionId: number) => {
    try {
      await api.delete(`/chatbot/sessions/${sessionId}`);
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      if (activeSessionId === sessionId) {
        setActiveSessionId(null);
        setMessages(exampleMessages);
      }
      toast.success(lang === 'fr' ? "Conversation supprimée" : "Conversation deleted");
    } catch (err) {
      console.error("Failed to delete session", err);
    }
  }

  const getDeAnonymizedContent = (content: string, allMessages: Message[], extraMappings?: Record<string, any>) => {
    if (!content) return content;
    const reverseMap: Record<string, string> = {};

    // Standardize mapping: placeholder (no brackets) -> realValue
    const addToMap = (placeholder: string, val: any) => {
      if (!val) return;
      const cleanPlaceholder = placeholder.replace(/^\[+|\]+$/g, '').replace(/\\/g, '');
      const realValue = typeof val === 'string' ? val : val.value;
      if (realValue) reverseMap[cleanPlaceholder] = realValue;
    };

    if (extraMappings) {
      Object.entries(extraMappings).forEach(([ph, val]) => addToMap(ph, val));
    }

    allMessages.forEach(m => {
      if (m.piis && m.piis.length > 0) {
        m.piis.forEach(p => {
          if (p.placeholder && p.value) addToMap(p.placeholder, p.value);
        });
      }
      if (m.filePiiMappings) {
        Object.entries(m.filePiiMappings).forEach(([realVal, placeholder]) => {
          addToMap(placeholder as string, realVal);
        });
      }
    });

    let result = content.replace(/\\_/g, '_').replace(/\\\[/g, '[').replace(/\\\]/g, ']');
    // Sort by placeholder length desc to avoid partial replacements (e.g. money_10 before money_1)
    const sortedEntries = Object.entries(reverseMap).sort((a, b) => b[0].length - a[0].length);

    sortedEntries.forEach(([placeholder, realVal]) => {
      const escaped = placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      // Match exactly [placeholder] or placeholder (case insensitive)
      // We prioritize bracketed version to avoid matching placeholder inside other words
      result = result.replace(new RegExp('\\[' + escaped + '\\]', 'gi'), realVal);
      result = result.replace(new RegExp('\\b' + escaped + '\\b', 'gi'), realVal);
    });

    const formatted_result = result.replace(/\n{2,}/g, "\n")
      .replace(/\n\s+\n/g, "\n")
      .trim();
    return formatted_result;
  };

  const handleStopStreaming = async () => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
      setIsStreaming(false);
      setIsLoading(false);

      setMessages(prev => prev.map(m => {
        if (m.isLoading || m.isReasoning || m.isProcessingFiles) {
          return {
            ...m,
            isLoading: false,
            isReasoning: false,
            isProcessingFiles: false,
            fileProcessingStatus: m.fileProcessingStatus?.map(f =>
              ["pending", "loader", "anonymisation"].includes(f.status) ? { ...f, status: "error", error: lang === 'fr' ? "Annulé" : "Cancelled" } : f
            )
          };
        }
        return m;
      }));

      toast.info(lang === 'fr' ? "Génération arrêtée" : "Generation stopped");

      if (currentContentRef.current && activeSessionId) {
        try {
          await api.post(`/chatbot/sessions/${activeSessionId}/messages`, {
            role: "assistant",
            content: currentContentRef.current,
            piis: [],
            raw_content: ""
          });
        } catch (e) {
          console.error("Failed to save partial message", e);
        }
      }
      fetchSessions(sessionSearch);
    }
  }

  const handleFiles = (files: File[]) => {
    const validExtensions = ['.pdf', '.png', '.jpg', '.jpeg', '.csv', '.txt', '.docx'];
    const validTypes = [
      'application/pdf',
      'image/png',
      'image/jpeg',
      'text/csv',
      'text/plain',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    const validFiles = files.filter(file => {
      const extension = ('.' + file.name.split('.').pop()).toLowerCase();
      return validTypes.includes(file.type) || validExtensions.includes(extension);
    });

    const invalidFiles = files.filter(file => {
      const extension = ('.' + file.name.split('.').pop()).toLowerCase();
      return !validTypes.includes(file.type) && !validExtensions.includes(extension);
    });

    if (invalidFiles.length > 0) {
      toast.error(lang === 'fr'
        ? `Format non supporté pour: ${invalidFiles.map(f => f.name).join(', ')}. Veuillez utiliser PDF, PNG, JPG, CSV, TXT ou DOCX.`
        : `Unsupported format for: ${invalidFiles.map(f => f.name).join(', ')}. Please use PDF, PNG, JPG, CSV, TXT or DOCX.`);
    }

    if (validFiles.length > 0) {
      setAttachedFiles(prev => [...prev, ...validFiles]);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (items) {
      const files: File[] = [];
      for (let i = 0; i < items.length; i++) {
        if (items[i].kind === 'file') {
          const file = items[i].getAsFile();
          if (file) {
            files.push(file);
          }
        }
      }
      if (files.length > 0) {
        handleFiles(files);
      }
    }
  };

  // Envoi via un modèle LOCAL : aucune anonymisation, aucun appel serveur.
  // Les tokens sont générés en Rust (candle) et streamés directement.
  const handleLocalSend = async () => {
    const modelId = activeModeModelId || aiConfig.model;
    const repo = getLocalRepo(modelId);
    if (!repo || !input.trim()) return;

    const st = localStatus[modelId];
    if (st?.state !== "ready") {
      toast.error(lang === "fr" ? "Téléchargez d'abord le modèle" : "Download the model first");
      return;
    }

    const userText = input;
    const userMsg: Message = {
      id: "temp-" + Date.now().toString(),
      role: "user",
      content: userText,
      timestamp: new Date(),
      piis: [],
      showPiiValues: true,
      raw_content: userText,
    };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsAnonymized(false);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    setIsStreaming(true);
    setIsLoading(true);
    const assistantMsgId = "assistant-" + Date.now().toString();
    setMessages(prev => [...prev, {
      id: assistantMsgId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
      piis: [],
      showPiiValues: false,
      isLoading: true,
    } as any]);

    let acc = "";
    try {
      await runLocalModel(repo, userText, (token) => {
        setIsLoading(false);
        acc += token;
        setMessages(prev => prev.map(m => m.id === assistantMsgId ? { ...m, content: acc, isLoading: false } : m));
      });
    } catch (e: any) {
      toast.error(e?.message || (lang === "fr" ? "Erreur du modèle local" : "Local model error"));
      setMessages(prev => prev.map(m => m.id === assistantMsgId ? { ...m, content: acc, isLoading: false } : m));
    } finally {
      setIsStreaming(false);
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    // Modèle local : pipeline dédié (pas d'anonymisation, pas de backend).
    if (isLocalModel(activeModeModelId || aiConfig.model)) {
      return handleLocalSend();
    }
    setIsStreaming(true);
    if (!user?.openrouter_api_key && !aiConfig.api_key && aiConfig.provider !== 'google-free') {
      toast.error(lang === 'fr' ? "Veuillez configurer votre clé API" : "Please configure your API key");
      return;
    }
    if (!input.trim() && !attachedFiles.length) return;


    let sessionId = activeSessionId;
    if (!sessionId) {
      const newSession = await createSession(input.substring(0, 30) + (input.length > 30 ? "..." : ""));
      if (!newSession) return;
      sessionId = newSession.id;
    }

    setIsLoading(true);
    setIsDetecting(true);

    const userMsg: Message = {
      id: "temp-" + Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
      piis: [],
      showPiiValues: true, // User message with PII revealed by default
      raw_content: input,
    };
    setMessages(prev => [...prev, userMsg]);

    const currentInput = isAnonymized ? originalInput : input;
    const currentIsAnonymized = isAnonymized;

    setInput("");
    setIsAnonymized(false);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    const currentAttachedFiles = [...attachedFiles];
    setAttachedFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = '';

    let processedInput = currentInput;
    const detectedPiis: PII[] = currentIsAnonymized ? [...currentEntities] : [];
    const globalValToPlaceholder: Record<string, string> = {};
    let globalCount = 0;

    messages.forEach(m => {
      if (m.piis && m.piis.length > 0) {
        m.piis.forEach(pii => {
          if (pii.value && pii.placeholder && !globalValToPlaceholder[pii.value]) {
            globalValToPlaceholder[pii.value] = pii.placeholder;
            // Support hex IDs and bracketed/unbracketed placeholders
            const cleanPh = pii.placeholder.replace(/^\[+|\]+$/g, '');
            const match = cleanPh.match(/_([0-9a-f]+)$/i);
            if (match) {
              const num = parseInt(match[1], 16);
              if (!isNaN(num) && num > globalCount) globalCount = num;
            }
          }
        });
      }
    });

    try {
      if (currentIsAnonymized) {
        // Use existing entities to process input and prepare detectedPiis
        detectedPiis.forEach((ent) => {
          if (!ent.isPrivate) return; // Skip public entities

          const typeKey = ent.type.toLowerCase().replace(/[ -]/g, '_');
          let placeholder = globalValToPlaceholder[ent.value];
          if (!placeholder) {
            globalCount++;
            const hexId = globalCount.toString(16).toLowerCase();
            placeholder = `${typeKey}_${hexId}`;
            globalValToPlaceholder[ent.value] = placeholder;
          }
          const cleanPh = placeholder.replace(/^\[+|\]+$/g, '');
          ent.placeholder = `[${cleanPh}]`;

          const regex = new RegExp(ent.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
          processedInput = processedInput.replace(regex, `[${cleanPh}]`);
        });
      } else {
        if (currentInput.trim()) {
          const detectionRes = await api.post('/pii/extract', { text: currentInput });
          const entities = detectionRes.data.entities;
          if (entities && entities.length > 0) {
            const sortedEntities = [...entities].sort((a: any, b: any) => b.value.length - a.value.length);

            sortedEntities.forEach((ent: any, idx: number) => {
              const typeKey = (ent.entity || ent.type).toLowerCase().replace(/[ -]/g, '_');
              let placeholder = globalValToPlaceholder[ent.value];
              if (!placeholder) {
                globalCount++;
                const hexId = globalCount.toString(16).toLowerCase();
                placeholder = `${typeKey}_${hexId}`;
                globalValToPlaceholder[ent.value] = placeholder;
              }
              const cleanPh = placeholder.replace(/^\[+|\]+$/g, '');

              const regex = new RegExp(ent.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
              if (regex.test(processedInput)) {
                processedInput = processedInput.replace(regex, `[${cleanPh}]`);
                if (!detectedPiis.some(p => p.value === ent.value && p.type === ent.entity)) {
                  detectedPiis.push({
                    id: `pii-${Date.now()}-${idx}`,
                    value: ent.value,
                    type: ent.entity || ent.type,
                    placeholder: `[${cleanPh}]`,
                    locked: false
                  });
                }
              }
            });
          }
        }
      }
      setMessages(prev => prev.map(m => m.id === userMsg.id ? {
        ...m,
        piis: detectedPiis,
        content: processedInput,
        raw_content: currentInput,
        showPiiValues: detectedPiis.some(p => !p.id?.startsWith('doc-pii-'))
      } : m));
    } catch (err) {
      console.error("PII detection failed", err);
    } finally {
      setIsDetecting(false);
    }

    try {
      const controller = new AbortController();
      setAbortController(controller);

      let processedFilesForAi: Message['files'] = [];
      const completedPiiMappings: Record<string, string> = {};
      let fileStatuses: FileProcessingStatus[] | undefined = undefined;

      if (currentAttachedFiles.length > 0) {
        const processingMsgId = "processing-" + Date.now().toString();
        const initialFileStatuses: FileProcessingStatus[] = currentAttachedFiles.map(f => ({
          id: f.name, filename: f.name, status: "pending"
        }));
        fileStatuses = initialFileStatuses;

        setMessages(prev => [...prev, {
          id: processingMsgId,
          role: "assistant",
          content: "",
          timestamp: new Date(),
          piis: [],
          showPiiValues: false,
          isProcessingFiles: true,
          fileProcessingStatus: initialFileStatuses,
          isLoading: true
        } as any]);

        const formData = new FormData();
        currentAttachedFiles.forEach(f => formData.append('files', f));

        const token = localStorage.getItem('token');
        const baseUrl = api.defaults.baseURL;
        const urlObj = new URL(`${baseUrl || ''}/chatbot/sessions/${sessionId}/files`, window.location.origin);

        const fileResponse = await fetch(urlObj.toString(), {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData,
          signal: controller.signal
        });

        if (!fileResponse.ok) throw new Error('File processing failed');

        const reader = fileResponse.body?.getReader();
        if (!reader) throw new Error('No reader available for files');

        const decoder = new TextDecoder();
        let partialData = "";
        const completedFilesMap: Record<string, Required<Message>['files'][number]> = {};

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = (partialData + chunk).split('\n');
          partialData = lines.pop() || "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed === "data: [DONE]") continue;

            try {
              let data;
              if (trimmed.startsWith("data: ")) {
                data = JSON.parse(trimmed.slice(6));
              } else {
                data = JSON.parse(trimmed);
              }

              if (data.type === 'init') {
                fileStatuses = data.files as FileProcessingStatus[];
                setMessages(prev => prev.map(m => m.id === processingMsgId ? { ...m, fileProcessingStatus: fileStatuses } : m));
              } else if (data.type === 'update') {
                if (fileStatuses) {
                  fileStatuses = fileStatuses.map(f => f.id === data.file.id ? { ...f, ...(data.file as FileProcessingStatus) } : f);
                }
                setMessages(prev => prev.map(m => m.id === processingMsgId ? { ...m, fileProcessingStatus: fileStatuses } : m));

                if (data.file.status === 'finished') {
                  if (data.file.output_base64) {
                    completedFilesMap[data.file.id] = {
                      mime_type: data.file.mime_type || "application/pdf",
                      data: data.file.output_base64,
                      filename: data.file.filename,
                      anonymized_markdown: data.file.anonymized_markdown,
                    } as any;
                  }
                  if (data.file.pii_map) Object.assign(completedPiiMappings, data.file.pii_map);
                }
              }
            } catch (e) {
              console.error("Error parsing stream JSON", e, trimmed);
            }
          }
        }
        processedFilesForAi = Object.values(completedFilesMap);
        setMessages(prev => prev.map(m => m.id === userMsg.id ? { ...m, files: processedFilesForAi } : m));
      }


      currentContentRef.current = "";

      let assistantMsgId = "assistant-" + Date.now().toString();

      setMessages(prev => {
        const lastProcessingIdx = prev.findIndex(m => m.isProcessingFiles);
        if (lastProcessingIdx !== -1 && currentAttachedFiles.length > 0) {
          assistantMsgId = prev[lastProcessingIdx].id;
          return prev.map((m, i) => i === lastProcessingIdx ? {
            ...m,
            isProcessingFiles: false,
            isLoading: true,
            filePiiMappings: Object.keys(completedPiiMappings).length > 0 ? completedPiiMappings : undefined,
          } : m);
        } else {
          return [...prev, {
            id: assistantMsgId,
            role: "assistant",
            content: "",
            timestamp: new Date(),
            piis: [],
            showPiiValues: false,
            isLoading: true,
            filePiiMappings: Object.keys(completedPiiMappings).length > 0 ? completedPiiMappings : undefined,
            fileProcessingStatus: fileStatuses || undefined
          } as any];
        }
      });

      // Abort controller is now defined at the top of the try block

      const currentStreamMappings: Record<string, string> = {};
      Object.entries(globalValToPlaceholder).forEach(([val, ph]) => {
        const cleanPh = ph.replace(/^\[+|\]+$/g, '');
        currentStreamMappings[cleanPh] = val;
      });
      if (completedPiiMappings) {
        Object.entries(completedPiiMappings).forEach(([realVal, placeholder]) => {
          const cleanPh = (placeholder as string).replace(/^\[+|\]+$/g, '');
          currentStreamMappings[cleanPh] = realVal;
        });
      }

      const finalPiis = [...detectedPiis];
      if (completedPiiMappings && Object.keys(completedPiiMappings).length > 0) {
        Object.entries(completedPiiMappings).forEach(([original, placeholder], idx) => {
          const placeholderStr = placeholder as string;
          const cleanPlaceholder = placeholderStr.replace(/^\[|\]$/g, '');
          const match = cleanPlaceholder.match(/^(.*)_([a-zA-Z0-9]+)$/);
          const type = match ? match[1] : "UNKNOWN";
          if (!finalPiis.some(p => p.value === original && p.type.toLowerCase() === type.toLowerCase())) {
            finalPiis.push({
              id: `doc-pii-${Date.now()}-${idx}`,
              value: original, type, placeholder: placeholderStr, locked: false,
            });
          }
        });
      }

      console.log(activeModeModelId, activeOption, activeOption === "auto" ? modelOptions?.allowed_models : undefined)
      const token = localStorage.getItem('token');
      const baseUrl = api.defaults.baseURL;
      const fetchResponse = await fetch(`${baseUrl}/chatbot/sessions/${sessionId}/messages/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          role: "user",
          content: processedInput,
          piis: finalPiis,
          raw_content: currentInput,
          files: processedFilesForAi,
          model: activeModeModelId || aiConfig.model,
          provider: "openrouter",// aiConfig.provider,
          effort: activeOption === "simple" ? "low" : "high",
          mode: activeOption,
          allowed_models: activeOption === "auto" ? modelOptions?.allowed_models : undefined
        }),
        signal: controller.signal
      });

      if (!fetchResponse.ok) throw new Error('Streaming failed');

      const reader = fetchResponse.body?.getReader();
      if (!reader) throw new Error('No reader available');

      const decoder = new TextDecoder();
      let accumulatedContent = "";
      let partialLine = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = (partialLine + chunk).split('\n');
        partialLine = lines.pop() || "";

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine) continue;

          if (trimmedLine.startsWith('data: ')) {
            const dataStr = trimmedLine.slice(6);
            if (dataStr === '[DONE]') continue;
            try {
              const data = JSON.parse(dataStr);
              if (data.error) {
                toast.error(data.error);
              } else if (data.reasoning) {
                setIsLoading(false);
                setMessages(prev => prev.map(m => m.id === assistantMsgId ? {
                  ...m,
                  reasoning: (m.reasoning || "") + data.reasoning,
                  isReasoning: true,
                  isLoading: false
                } : m));
              } else if (data.content) {
                setIsLoading(false);
                accumulatedContent += data.content;
                currentContentRef.current = accumulatedContent;
                const displayContent = getDeAnonymizedContent(accumulatedContent, messages, currentStreamMappings);
                setMessages(prev => prev.map(m => m.id === assistantMsgId ? {
                  ...m,
                  content: displayContent,
                  isLoading: false,
                  isReasoning: false,
                  fileProcessingStatus: m.fileProcessingStatus
                } : m));
              }
            } catch (e) {
              console.error("Error parsing stream chunk", e);
            }
          }
        }
      }

      fetchMessages(sessionId!);
      fetchSessions(sessionSearch);
      setIsStreaming(false);
      setIsLoading(false);

      if (detectedPiis.length > 0) {
        toast.info(lang === 'fr' ? "PII Détectées" : "PII Detected", {
          description: lang === 'fr' ? "Données sensibles identifiées dans votre message" : "Sensitive data identified in your message",
          icon: <Shield className="h-4 w-4 text-emerald-500" />,
        });
        setHistoryOpen(false);
        setPiiOpen(true);
      }

      setAbortController(null);
      currentContentRef.current = "";
      refreshData();
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setAbortController(null);
        setIsStreaming(false);
        setIsLoading(false);
        return;
      }
      console.error("Chat failed", err);
      toast.error(lang === 'fr' ? "Erreur réseau" : "Network error");
      setIsStreaming(false);
      setIsLoading(false);
      setAbortController(null);
      setMessages(prev => prev.filter(m => !(String(m.id).startsWith("assistant-") && m.isLoading)));
      refreshData();
    }
  }

  const usageValue = openRouterKeyInfo?.limit
    ? ((openRouterKeyInfo.limit_remaining ?? (openRouterKeyInfo.limit - openRouterKeyInfo.usage)) * 100).toLocaleString(undefined, { maximumFractionDigits: 1 })
    : ((user?.credits_balance || 0) * 100).toLocaleString();

  const usagePercent = React.useMemo(() => {
    if (openRouterKeyInfo?.limit) {
      const remaining = openRouterKeyInfo.limit_remaining ?? (openRouterKeyInfo.limit - openRouterKeyInfo.usage);
      const used = openRouterKeyInfo.limit - remaining;
      return Math.min(100, Math.max(0, (used / (openRouterKeyInfo.limit || 1)) * 100));
    } else {
      const remaining = user?.credits_balance || 0;
      const total = user?.monthly_credit || remaining || 1;
      const used = Math.max(0, total - remaining);

      return Math.min(100, Math.max(0, (used / (total || 1)) * 100));
    }
  }, [openRouterKeyInfo, user]);

  const allPiis = React.useMemo(() => {
    const piiMap = new Map<string, PII>();
    messages.forEach(msg => msg.piis.forEach(pii => piiMap.set(pii.value, pii)));
    return Array.from(piiMap.values());
  }, [messages]);

  const filteredPiis = React.useMemo(() => {
    if (!piiSearch) return allPiis;
    return allPiis.filter(pii =>
      pii.value.toLowerCase().includes(piiSearch.toLowerCase()) ||
      getPiiLabel(pii.type).toLowerCase().includes(piiSearch.toLowerCase())
    );
  }, [allPiis, piiSearch]);

  const renderMessage = (msg: Message, displayContentFlag: boolean = true) => {
    // 1. Meta Content (Reasoning or File Processing) - displayed above/beside the main bubble
    if (!displayContentFlag) {
      // File Processing UI or User Files Display
      if (msg.role === 'user' && msg.files && msg.files.length > 0) {
        return (
          <div className="flex flex-col gap-2 mb-2 justify-end items-end">
            {msg.files.map((file, i) => (
              <div key={i} className="flex items-center gap-3 bg-muted/30 border border-border/20 px-3 py-2 rounded-2xl text-[13px] font-semibold text-foreground hover:bg-muted/50 transition-all group w-[280px] shadow-sm">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border-2 border-primary/20 shadow-inner text-primary transition-transform group-hover:scale-105">
                  <FileIcon className="h-5 w-5" />
                </div>
                <div className="flex flex-col gap-0.5 overflow-hidden pr-2">
                  <span className="truncate font-bold tracking-tight">{file.filename}</span>
                  <span className="text-[10px] text-muted-foreground/80 uppercase font-black tracking-widest">{file.mime_type.split('/')[1]?.toUpperCase() || file.mime_type.split('/')[0]?.toUpperCase()}</span>
                </div>
              </div>
            ))}
          </div>
        );
      }

      if (msg.fileProcessingStatus && msg.fileProcessingStatus.length > 0) {
        const allFinished = msg.fileProcessingStatus.every(f => f.status === 'finished');
        const hasError = msg.fileProcessingStatus.some(f => f.status === 'error');
        const isCancelled = msg.fileProcessingStatus.some(f => f.status === 'error' && (f.error === 'Annulé' || f.error === 'Cancelled'));
        return (
          <div className="flex flex-col gap-3 w-full min-w-[280px] p-1">
            <Accordion type="single" collapsible>
              <AccordionItem value="item-1">
                <AccordionTrigger><div className="flex items-center gap-2.5 font-bold text-sm">
                  {allFinished ? (
                    <div className="h-8 w-8 flex items-center justify-center">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    </div>
                  ) : hasError ? (
                    <div className="h-8 w-8 flex items-center justify-center">
                      <Square className={cn("h-5 w-5", isCancelled ? "text-amber-500" : "text-rose-500")} />
                    </div>
                  ) : (
                    <div className="h-8 w-8 flex items-center justify-center">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="text-sm font-bold">
                      {allFinished ? (lang === 'fr' ? "Fichiers traités" : "Files processed") :
                        isCancelled ? (lang === 'fr' ? "Traitement annulé" : "Processing Cancelled") :
                          hasError ? (lang === 'fr' ? "Erreur de traitement" : "Processing Error") :
                            (lang === 'fr' ? "Anonymisation des documents en cours..." : "Anonymizing files...")}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-medium text-left">
                      {msg.fileProcessingStatus.filter(f => f.status === 'finished').length}/{msg.fileProcessingStatus.length} {lang === 'fr' ? "terminés" : "done"}
                    </span>
                  </div>
                </div></AccordionTrigger>
                <AccordionContent className="gap-2 px-1">
                  {msg.fileProcessingStatus.map(file => (
                    <div key={file.id} className="flex flex-col gap-2 mt-1 bg-black/5 dark:bg-white/5 rounded-xl p-3 border border-black/5 dark:border-white/5">
                      <div className="flex items-center justify-between text-xs group">
                        <div className="flex items-center gap-2 overflow-hidden text-muted-foreground group-hover:text-foreground transition-colors">
                          <FileIcon className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate max-w-[160px] font-medium">{file.filename}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {['pending', 'loader', 'anonymisation'].includes(file.status) && (
                            <span className="text-primary flex items-center gap-1.5 text-[10px] font-bold bg-primary/10 px-2 py-0.5 rounded-full">
                              <Loader2 className="h-2.5 w-2.5 animate-spin" />
                              {file.status === 'loader' ? 'OCR' : file.status === 'pending' ? 'Pending' : 'Anonymizing'}
                            </span>
                          )}
                          {file.status === 'finished' && (
                            <span className="text-emerald-500 flex items-center gap-1 text-[10px] font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                              <Check className="h-2.5 w-2.5" />
                              Done
                            </span>
                          )}
                          {file.status === 'error' && (
                            <span className={cn(
                              "flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full",
                              (file.error === 'Annulé' || file.error === 'Cancelled') ? "text-amber-500 bg-amber-500/10" : "text-rose-500 bg-rose-500/10"
                            )}>
                              {(file.error === 'Annulé' || file.error === 'Cancelled') ? (
                                <>
                                  <XCircle className="h-2.5 w-2.5" />
                                  {file.error}
                                </>
                              ) : (
                                <>
                                  <XCircle className="h-2.5 w-2.5" />
                                  Error
                                </>
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        );
      }

      // Reasoning UI
      if (msg.reasoning || msg.isReasoning) {
        return (
          <div className="flex flex-col gap-3 w-full min-w-[280px] p-1">
            <Accordion type="single" collapsible>
              <AccordionItem value="item-1">
                <AccordionTrigger><div className="flex items-center gap-2.5 font-bold text-sm">
                  {msg.isReasoning ? (
                    <div className="h-8 w-8 flex items-center justify-center">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    </div>
                  ) : (
                    <div className="h-8 w-8 flex items-center justify-center text-emerald-500">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="text-sm font-bold">
                      {msg.isReasoning ? (lang === 'fr' ? "L'assistant est en train de raisonner..." : "Assistant is reasoning...") :
                        (lang === 'fr' ? "Réflexion terminée" : "Thought process")}
                    </span>
                  </div>
                </div>
                </AccordionTrigger>
                <AccordionContent className="mt-2 text-muted-foreground text-xs leading-relaxed border-l-2 border-muted-500/30 ml-4.5 pl-5 py-4 bg-gradient-to-r from-muted-500/5 to-transparent rounded-r-2xl font-mono">
                  <div className="opacity-80">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.reasoning || "..."}
                    </ReactMarkdown>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        );
      }
      return null;
    }

    // 2. Main Content UI (inside the chat bubble)
    return (
      <div className={cn(
        "w-full",
        msg.role === "assistant" ? "break-words text-sm leading-relaxed flex flex-col" : "whitespace-pre-wrap break-words",
      )}>
        {msg.role === "assistant" ? (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              // 🔹 Paragraphes (compact)
              p: ({ children }) => (
                <p className="my-1 leading-relaxed">{children}</p>
              ),

              // 🔹 Titres
              h1: ({ children }) => (
                <h1 className="text-lg font-semibold mt-1 mb-1">{children}</h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-base font-semibold mt-1 mb-1">{children}</h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-sm font-semibold mt-1 mb-1">{children}</h3>
              ),

              // 🔹 Listes
              ul: ({ children }) => (
                <ul className="pl-4 my-1 list-disc">{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className="pl-4 my-1 list-decimal">{children}</ol>
              ),
              li: ({ children }) => (
                <li className="leading-relaxed">
                  <span className="[&>p]:inline [&>p]:m-0">{children}</span>
                </li>
              ),

              // 🔹 Gras / italique
              strong: ({ children }) => (
                <strong className="font-semibold">{children}</strong>
              ),

              // 🔹 Liens
              a: ({ href, children }) => (
                <a
                  href={href}
                  className="text-blue-500 hover:underline"
                  target="_blank"
                >
                  {children}
                </a>
              ),

              // 🔥 Inline code
              code: ({ node, className, children, ...props }: any) => {
                const match = /language-(\w+)/.exec(className || "");
                if (match) {
                  return (
                    <pre className="bg-muted/50 p-3 rounded-xl overflow-x-auto my-2 border border-border/50">
                      <code className={cn("text-xs font-mono", className)} {...props}>
                        {children}
                      </code>
                    </pre>
                  );
                }

                return (
                  <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono" {...props}>
                    {children}
                  </code>
                );
              },

              // 🔹 Blockquote
              blockquote: ({ children }) => (
                <blockquote className="border-l-2 pl-3 italic text-muted-foreground my-2">
                  {children}
                </blockquote>
              ),
            }}
          >
            {getDeAnonymizedContent(msg.content, messages)}
          </ReactMarkdown>
        ) : (
          (() => {
            const rawContent = (msg as any).raw_content || msg.content;
            if (!msg.piis || msg.piis.length === 0) return rawContent;

            let parts = [{ text: rawContent, isPii: false, type: "" }];
            const sortedPiis = [...msg.piis]
              .filter(p => !p.id?.startsWith('doc-pii-') && p.value)
              .sort((a, b) => b.value.length - a.value.length);

            sortedPiis.forEach(pii => {
              const newParts: { text: string; isPii: boolean; type: string }[] = [];
              parts.forEach(part => {
                if (part.isPii) {
                  newParts.push(part);
                } else {

                  const escapedValue = pii.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                  const regex = new RegExp(`(${escapedValue})`, 'g');
                  const splitText = part.text.split(regex);
                  splitText.forEach((text: string) => {
                    if (text === pii.value) {
                      newParts.push({ text: pii.value, isPii: true, type: pii.type });
                    } else if (text) {
                      newParts.push({ text, isPii: false, type: "" });
                    }
                  });
                }
              });
              parts = newParts;
            });

            return (
              <>
                {parts.map((part, i) =>
                  part.isPii ? (
                    <Badge
                      key={i}
                      variant="outline"
                      className={cn(
                        "text-sm h-5 px-2 py-0 mx-1 border border-primary bg-background text-primary font-semibold transition-all duration-300",
                        !msg.showPiiValues && "blur-[4px] select-none bg-foreground/20 text-transparent border-transparent"
                      )}
                      title={part.type}
                    >
                      {part.text}
                    </Badge>
                  ) : (
                    <span key={i}>{part.text}</span>
                  )
                )}
              </>
            );
          })()
        )}
      </div>
    );
  }

  const togglePiiVisibility = (msgId: string) => {
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, showPiiValues: !m.showPiiValues } : m));
  }

  return (
    <>
      {activeTab === "chatbot" && (
        <div className="flex flex-1 w-full h-full overflow-hidden bg-background">

          {/* Chat Sidebar (History) */}
          {historyOpen && (
            <div className="fixed inset-0 z-50 bg-background flex flex-col md:relative md:w-64 md:inset-auto md:z-10 md:border-r animate-in slide-in-from-left duration-300 border-r">
              <div className="flex items-center gap-2 p-4 border-b">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setHistoryOpen(false)}>
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <h3 className="font-bold">{lang === 'fr' ? 'Historique' : 'History'}</h3>
              </div>
              <div className="p-4 space-y-4">
                <Button
                  className="w-full justify-start gap-2 bg-black dark:bg-white text-white dark:text-black hover:opacity-90 shadow-sm h-9 text-xs font-bold rounded-xl"
                  onClick={() => {
                    setActiveSessionId(null);
                    setMessages(exampleMessages);
                  }}
                >
                  <Plus className="w-3.5 h-3.5" />
                  {t.sidebar.newChat}
                </Button>
                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    placeholder={t.chatbot.piiPanel.search}
                    className="h-9 pl-9 text-sm rounded-xl bg-background border-border/50 focus:border-primary/20 transition-all"
                    value={sessionSearch}
                    onChange={(e) => setSessionSearch(e.target.value)}
                  />
                </div>
              </div>
              <ScrollArea className="flex-1 ">
                <div className="p-2 space-y-1 border-t border-border/50">
                  {sessions.map((session) => (
                    <div
                      key={session.id}
                      className={cn(
                        "group flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all",
                        activeSessionId === session.id ? "bg-muted/80 text-foreground" : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                      )}
                      onClick={() => {
                        setActiveSessionId(session.id);
                        fetchMessages(session.id);
                        // Close history on mobile after selection
                        if (window.innerWidth < 768) setHistoryOpen(false);
                      }}
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <MessageSquare className="h-4 w-4 shrink-0" />
                        <span className="text-sm font-semibold truncate tracking-tight">{session.title}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 rounded-lg hover:bg-rose-500/10 hover:text-rose-500 transition-all"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteSession(session.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Footer : thème clair/sombre + compte + déconnexion (comme la sidebar) */}
              <div className="mt-auto border-t bg-background/20">
                <div className="px-4 py-2">
                  <div className="flex items-center bg-muted/50 rounded-xl p-1 shadow-inner border border-border/50">
                    <button
                      onClick={() => setIsDark(false)}
                      className={cn(
                        "flex-1 h-8 flex items-center justify-center text-[11px] rounded-lg transition-all duration-300",
                        !isDark ? "bg-background shadow-sm font-bold text-primary" : "text-muted-foreground hover:bg-muted/80"
                      )}
                      title={t.sidebar.light}
                    >
                      <Sun className={cn("w-3.5 h-3.5", !isDark && "text-primary")} />
                      <span className="ml-1.5 font-bold">{t.sidebar.light}</span>
                    </button>
                    <button
                      onClick={() => setIsDark(true)}
                      className={cn(
                        "flex-1 h-8 flex items-center justify-center text-[11px] rounded-lg transition-all duration-300",
                        isDark ? "bg-background shadow-sm font-bold text-primary" : "text-muted-foreground hover:bg-muted/80"
                      )}
                      title={t.sidebar.dark}
                    >
                      <Moon className={cn("w-3.5 h-3.5", isDark && "text-primary")} />
                      <span className="ml-1.5 font-bold">{t.sidebar.dark}</span>
                    </button>
                  </div>
                </div>
                <div className="p-2 pt-0 flex flex-col gap-2">
                  <div
                    className="flex flex-row items-center gap-2 cursor-pointer hover:bg-background p-2 rounded-xl"
                    onClick={() => setActiveView("profile")}
                  >
                    <div className="relative group shrink-0">
                      <Avatar className="h-10 w-10 hover:ring-2 ring-primary/20 transition-all border border-border/50 shadow-sm">
                        <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold uppercase">{getInitials(user?.full_name)}</AvatarFallback>
                      </Avatar>
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-bold text-foreground truncate">{user?.full_name}</span>
                      <span className="text-[12px] text-muted-foreground truncate">{user?.email}</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 h-9 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-all"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-xs font-bold">{lang === 'fr' ? 'Déconnexion' : 'Logout'}</span>
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="flex-1 flex flex-col min-w-0 relative">
            {/* Chat Header */}
            <div className="h-16 border-b bg-background backdrop-blur-md flex items-center justify-between px-6 shrink-0 z-10">
              <div className="flex items-center gap-3">
                {!historyOpen && (
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg flex" onClick={() => setHistoryOpen(!historyOpen)}>
                      <Menu className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg text-primary hover:bg-primary/10"
                      onClick={() => {
                        setActiveSessionId(null);
                        setMessages(exampleMessages);
                        toast.info(lang === 'fr' ? "Nouveau chat ouvert" : "New chat started");
                      }}
                      title={t.sidebar.newChat}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                {isMobile ?
                  (aiConfig?.provider == 'google-free' && <div className="flex items-center gap-2"><span className="text-[0.75rem] text-muted-foreground font-bold tabular-nums">Usage {userConsumption?.usage | 0}/{userConsumption?.limit}</span></div>)
                  : (
                    <>
                      <div>
                        <h2 className="text-sm font-bold tracking-tight">
                          {t.chatbot.title}
                        </h2>
                        <p className="text-[10px] text-muted-foreground font-medium">
                          {t.chatbot.subtitle}
                        </p>
                      </div>
                    </>
                  )
                }
              </div>
              <div className="flex items-center gap-4">
                <div
                  className="hidden md:flex flex-col items-end cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => setActiveView("profile")}
                >
                  <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">{lang === 'fr' ? 'Crédits Restants' : 'Remaining Credits'}</span>
                  <span className={cn("text-sm font-black", usagePercent > 90 ? "text-red-500" : usagePercent > 75 ? "text-amber-500" : "text-emerald-500")}>
                    {usageValue} {lang === 'fr' ? 'Crédits' : 'Credits'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {/* Removed Settings Button */}
                  {!piiOpen && <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => setPiiOpen(!piiOpen)}>
                    <Shield className={cn("h-4 w-4 transition-colors", piiOpen ? "text-primary" : "text-muted-foreground")} />
                  </Button>}
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-rose-500 hover:bg-rose-500/10" onClick={() => setMessages(exampleMessages)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <ScrollArea ref={scrollRef} className="flex-1 p-4 lg:p-6">
              <div className={cn("w-full space-y-8 pb-12", messages.length > 1 ? "" : "h-full flex items-center justify-center")}>
                {messages.length > 1 ?
                  (messages
                    .filter(msg => msg.role !== "system")
                    .map((msg, idx) => (
                      <div
                        key={msg.id}
                        className={cn(
                          "flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-500",
                          msg.role === "user" ? "items-end" : "items-start"
                        )}
                        style={{ animationDelay: `${idx * 100}ms` }}
                      >
                        <div className="w-1/2">
                          {msg.fileProcessingStatus && msg.fileProcessingStatus.length > 0 && (
                            renderMessage(msg, false)
                          )}
                          {(msg.reasoning || msg.isReasoning) && (
                            renderMessage(msg, false)
                          )}
                          {msg.role === 'user' && msg.files && msg.files.length > 0 && (
                            renderMessage(msg, false)
                          )}
                        </div>
                        <div className={cn(
                          "flex gap-3 max-w-[85%]",
                          msg.role === "user" ? "flex-row-reverse" : "flex-row"
                        )}>
                          <div className={cn(
                            "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border shadow-sm transition-transform hover:scale-110",
                            msg.role === "user" ? "bg-muted/80 text-foreground border-border/50" : "bg-card text-muted-foreground border-border/50"
                          )}>
                            {msg.role === "user" ? (user?.full_name ? <span className="text-xs font-bold">{getInitials(user.full_name)}</span> : <User className="h-5 w-5" />) : <Bot className="h-5 w-5" />}
                          </div>
                          <div className="flex flex-col gap-2">
                            <div className={cn(
                              "px-5 py-3.5 rounded-3xl text-[15px] font-medium leading-relaxed shadow-sm transition-all whitespace-pre-wrap break-words",
                              msg.role === "user"
                                ? "bg-muted/80 border border-border/50 rounded-tr-none shadow-none"
                                : "bg-muted/80 border border-border/50 rounded-tl-none shadow-none"
                            )}>
                              {(msg as any).isLoading ? (
                                <div className="flex flex-col gap-2 min-w-[150px]">
                                  <div className="flex items-center gap-2 text-[10px] font-bold text-primary uppercase tracking-widest animate-pulse">
                                    <Shield className="h-3 w-3" />
                                    {isDetecting ? (lang === 'fr' ? 'Anonymisation...' : 'Anonymizing...') : t.chatbot.thinking}
                                  </div>
                                  <div className="flex gap-1.5 px-1 py-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce [animation-delay:-0.3s]" />
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce [animation-delay:-0.15s]" />
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce" />
                                  </div>
                                </div>
                              ) : renderMessage(msg)}
                            </div>


                            {/* Message Actions */}
                            <div className={cn(
                              "flex items-center gap-3 px-1",
                              msg.role === "user" ? "justify-end" : "justify-start"
                            )}>
                              {msg.role === 'user' && msg.piis && msg.piis.length > 0 && msg.piis.some(p => !p.id?.startsWith('doc-pii-')) && (
                                <>
                                  <button
                                    onClick={() => togglePiiVisibility(msg.id)}
                                    className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground/60 hover:text-primary transition-colors uppercase tracking-widest bg-muted/30 px-2 py-1 rounded-md"
                                  >
                                    {msg.showPiiValues ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                    {msg.showPiiValues ? t.chatbot.piiPanel.hidePii : t.chatbot.piiPanel.revealPii}
                                  </button>
                                </>
                              )}

                              {/* Copy Button */}
                              <button
                                onClick={() => handleCopy(msg.role === "user" ? ((msg as any).raw_content || msg.content) : getDeAnonymizedContent(msg.content, messages))}
                                className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground/60 hover:text-primary transition-colors uppercase tracking-widest bg-muted/30 px-2 py-1 rounded-md"
                              >
                                <Copy className="h-3 w-3" />
                                {lang === 'fr' ? 'Copier' : 'Copy'}
                              </button>

                              {(msg as any).error && (
                                <button
                                  onClick={() => handleRetry(msg.id)}
                                  className="flex items-center gap-1.5 text-[10px] font-bold text-rose-500 hover:text-rose-600 transition-colors uppercase tracking-widest bg-rose-500/10 px-2 py-1 rounded-md"
                                >
                                  <RotateCcw className="h-3 w-3" />
                                  {lang === 'fr' ? 'Réessayer' : 'Retry'}
                                </button>
                              )}

                              {msg.role === 'user' && msg.piis && msg.piis.length > 0 && (
                                <>
                                  <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest bg-muted/20 px-2 py-1 rounded-md">
                                    {msg.piis.length} {t.chatbot.piiPanel.detected}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>

                        </div>
                      </div>
                    ))) : (
                    <div className="flex flex-col items-center justify-center flex-1 text-center py-20 gap-4">
                      <h1 className="text-3xl sm:text-lg md:text-5xl lg:text-5xl font-extrabold mb-2 tracking-tight text-[var(--accent-primary)] animate-fade-in">
                        {t.chatbot.welcome}, <span className="lg:blur-md lg:border-none blur-none rounded-full border-black/10 border px-2 rounded-sm font-bold select-none hover:blur-none transition-all duration-500 cursor-help">{user?.full_name.toUpperCase()}</span>
                      </h1>
                      <p className="text-[var(--accent-primary)] sm:text-sm md:text-2xl lg:text-xl animate-slide-up">
                        {t.chatbot.iam} <span className="lg:blur-sm lg:border-none blur-none rounded-full border-black/10 border px-2 rounded-sm font-bold select-none hover:blur-none transition-all duration-500 cursor-help">Data Private</span>. {t.chatbot.principle}: <span className="lg:blur-sm lg:border-none blur-none rounded-full border-black/10 border px-2 rounded-sm font-bold select-none hover:blur-none transition-all duration-500 cursor-help">{t.chatbot.joke}</span>
                        <br />
                      </p>
                      <p className="text-[var(--accent-primary)] text-[1.1rem] max-w-[500px] animate-slide-up">
                        {t.chatbot.privacy_active_desc}
                      </p>
                      <div className="h-1/2">
                      </div>
                    </div>
                  )}

              </div>
            </ScrollArea>

            <div className="p-4 lg:p-6 bg-gradient-to-t from-background via-background/80 to-transparent shrink-0">
              <div className="w-full relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-border/40 to-primary/20 rounded-3xl blur-xl opacity-0 group-focus-within:opacity-100 transition-all duration-700" />

                <div className="relative bg-background/50 backdrop-blur-2xl border border-border/50 rounded-2xl shadow-2xl overflow-hidden focus-within:border-primary/50 transition-all duration-500 group-focus-within:bg-background/80">
                  <div className="p-4 px-5 flex items-end gap-3">
                    {isAnonymized ? (
                      <div
                        ref={previewDivRef}
                        onMouseUp={handleTextSelection}
                        onKeyUp={handleTextSelection}
                        className="flex-1 min-h-[72px] max-h-[200px] text-[15px] leading-relaxed p-0 bg-transparent overflow-y-auto scrollbar-hide py-2"
                      >
                        {(() => {
                          if (!originalInput) return null;
                          const sortedEntities = [...currentEntities]
                            .filter(e => e.start !== undefined && e.end !== undefined)
                            .sort((a, b) => a.start! - b.start!);
                          const elements = [];
                          let lastIndex = 0;
                          sortedEntities.forEach((ent) => {
                            if (ent.start! > lastIndex) {
                              elements.push(originalInput.substring(lastIndex, ent.start));
                            }
                            elements.push(
                              <Popover key={ent.id}>
                                <PopoverTrigger asChild>
                                  {/* <Badge className={cn("text-xs font-black h-5 px-2 border-none", getPiiColor(pii.type))}></Badge> */}
                                  {/* <Badge
                                    className={cn(
                                      "font-black h-5 px-2 mx-1 border-none cursor-pointer transition-colors shadow-sm rounded-full py-1",
                                      ent.isPrivate
                                        ? "bg-primary/15 text-primary dark:text-primary-400 border-primary-500/30"
                                        // : "bg-primary/15 text-primary dark:text-primary-400 border-primary-500/30"
                                        : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                                    )}
                                  > */}
                                  <Badge
                                    className={cn(
                                      "text-sm h-5 px-2 py-1 mx-1 border-1 cursor-pointer border-primary bg-background text-primary hover:bg-primary hover:text-background")}
                                  >
                                    {!ent.isPrivate && <Unlock className="w-3 h-3 mr-2" />}{ent.value}
                                  </Badge>
                                </PopoverTrigger>
                                <PopoverContent className="w-48 p-0">
                                  <div className="flex flex-col gap-2">
                                    {!ent.id.startsWith('manual-') && (<Button
                                      variant="ghost"
                                      size="sm"
                                      className="justify-start h-8 text-xs font-medium p-2"
                                      onClick={() => toggleEntityPrivacy(ent.id)}
                                    >
                                      {ent.isPrivate ? <Unlock className="w-3 h-3 mr-2" /> : <Lock className="w-3 h-3 mr-2" />}
                                      {ent.isPrivate ? (lang === 'fr' ? 'Rendre public' : 'Make public') : (lang === 'fr' ? 'Rendre privé' : 'Make private')}
                                    </Button>)}
                                    {ent.id.startsWith('manual-') && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="justify-start h-8 text-xs font-medium text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                                        onClick={() => handleDeleteManualEntity(ent.id)}
                                      >
                                        <Trash2 className="w-3 h-3 mr-2" />
                                        {lang === 'fr' ? 'Supprimer' : 'Delete'}
                                      </Button>
                                    )}
                                  </div>
                                </PopoverContent>
                              </Popover>
                            );
                            lastIndex = ent.end!;
                          });
                          if (lastIndex < originalInput.length) {
                            elements.push(originalInput.substring(lastIndex));
                          }
                          return <div className="whitespace-pre-wrap">{elements}</div>;
                        })()}
                      </div>
                    ) : (
                      <textarea
                        ref={textareaRef}
                        className="flex-1 min-h-[72px] max-h-[200px] text-[15px] leading-relaxed p-0 bg-transparent border-none outline-none resize-none text-foreground placeholder:text-muted-foreground/30 scrollbar-hide"
                        placeholder={t.chatbot.placeholder}
                        rows={1}
                        disabled={false}
                        value={input}
                        onPaste={handlePaste}
                        onChange={(e) => {
                          setInput(e.target.value);
                          e.target.style.height = 'auto';
                          e.target.style.height = `${e.target.scrollHeight}px`;
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            if (input.trim()) {
                              e.preventDefault();
                              handleSend();
                            } else {
                              e.preventDefault();
                            }
                          }
                        }}
                      />
                    )}
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="outline"
                        onClick={isAnonymized ? handleRestoreInput : (isStreaming ? handleStopStreaming : handleAnonymize)}
                        disabled={(!isAnonymized && (isLoading && !isStreaming)) || (!isAnonymized && !isStreaming && !input.trim() && !attachedFiles.length)}
                        className={cn(
                          "h-8 px-4 rounded-full flex items-center justify-start shrink-0 transition-all shadow-md min-w-[120px]",
                          (isAnonymized || isStreaming || input.trim() || attachedFiles.length || isDetecting)
                            ? "text-primary hover:scale-110 active:scale-95 shadow-primary/20"
                            : "bg-muted text-muted-foreground opacity-50 cursor-not-allowed",
                          (isStreaming && "hidden"), (isLoading || isDetecting && "disabled")
                        )}
                      >
                        {isStreaming ? (
                          <div className="flex items-center gap-2">
                            <Square size={16} />
                            <span className="text-xs font-bold group-data-[collapsible=icon]:hidden">
                              {lang === 'fr' ? 'Arrêter' : 'Stop'}
                            </span>
                          </div>
                        ) : isLoading || isDetecting ? (
                          <div className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="text-xs font-bold group-data-[collapsible=icon]:hidden">
                              {lang === 'fr' ? 'Chargement...' : 'Loading...'}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Shield size={16} />
                            <span className="text-xs font-bold group-data-[collapsible=icon]:hidden">
                              {isAnonymized ? (lang === 'fr' ? 'Modifier texte' : 'Edit text') : 'Anonymiser'}
                            </span>
                          </div>
                        )}
                      </Button>
                      <Button
                        onClick={isStreaming ? handleStopStreaming : handleSend}
                        disabled={(isLoading && !isStreaming) || (!isStreaming && !input.trim() && !attachedFiles.length)}
                        className={cn(
                          "h-8 px-4 rounded-full flex items-center justify-start shrink-0 transition-all shadow-md min-w-[120px]",
                          (isStreaming || input.trim() || attachedFiles.length || isDetecting)
                            ? "bg-primary text-primary-foreground hover:scale-110 active:scale-95 shadow-primary/20"
                            : "bg-muted text-muted-foreground opacity-50 cursor-not-allowed"
                        )}
                      >
                        {isStreaming ? (
                          <div className="flex items-center gap-2">
                            <Square size={16} />
                            <span className="text-xs font-bold group-data-[collapsible=icon]:hidden">
                              {lang === 'fr' ? 'Arrêter' : 'Stop'}
                            </span>
                          </div>
                        ) : isLoading || isDetecting ? (
                          <div className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="text-xs font-bold group-data-[collapsible=icon]:hidden">
                              {lang === 'fr' ? 'Chargement...' : 'Loading...'}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Send size={16} />
                            <span className="text-xs font-bold group-data-[collapsible=icon]:hidden">Envoyer</span>
                          </div>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Attachments Display inside the box if any */}
                  {attachedFiles.length > 0 && (
                    <div className="flex flex-wrap gap-2 px-5 pb-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                      {attachedFiles.map((file, i) => (
                        <div key={i} className="group/file relative flex items-center gap-2.5 pl-2.5 pr-1.5 h-8 rounded-xl bg-background/50 border border-border/50 hover:bg-background/80 hover:border-primary/20 transition-all">
                          <FileText className="h-3.5 w-3.5 text-primary/70" />
                          <div className="flex flex-col -space-y-0.5">
                            <span className="text-[9px] font-bold text-foreground max-w-[100px] truncate">{file.name}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5 ml-1 rounded-lg opacity-0 group-hover/file:opacity-100 hover:bg-rose-500/10 hover:text-rose-500 transition-all"
                            onClick={() => setAttachedFiles(prev => prev.filter((_, idx) => idx !== i))}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="p-3 px-5 border-t border-border/20 flex items-center justify-between bg-muted/20 transition-colors">
                    <div className="flex gap-4 text-muted-foreground">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={false}
                        className={cn(
                          "flex items-center gap-2 text-[0.85rem] font-medium hover:text-primary transition-colors",
                          false && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        <Paperclip size={18} />
                        <span className="hidden sm:block md:block lg:block xl:block">{lang === 'fr' ? 'Joindre' : 'Attach'}</span>
                      </button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        multiple
                        accept=".pdf,.png,.jpg,.jpeg,.csv,.txt,.docx"
                        onChange={(e) => {
                          if (e.target.files) {
                            handleFiles(Array.from(e.target.files));
                          }
                        }}
                      />
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild disabled={!isThinkingModel}>
                          <Button
                            variant="outline"
                            className={cn(
                              "flex justify-between gap-2 px-3 py-1.5 rounded-xl bg-background/50 border border-border/50 text-[0.85rem] font-bold",
                              "text-primary  transition-all shadow-sm cursor-pointer data-[state=open]:drop-shadow-lg data-[state=open]:bg-background",
                              "hover:bg-background hover:border-1 hover:border-primary/30 shadow-sm",
                              "min-w-[150px]",
                              !isThinkingModel && "opacity-50 cursor-not-allowed disabled"
                            )}
                          >
                            {activeOption === "auto" && <Sparkles size={18} className="text-primary" />}
                            {activeOption === "simple" && <MessageSquare size={18} />}
                            {activeOption === "think" && <Brain size={18} />}
                            {activeOption === "research" && <Search size={18} />}
                            {activeOption === "pro" && <Zap size={18} />}
                            <span className="hidden sm:block">
                              {activeOption === "auto" && (lang === 'fr' ? 'Auto' : 'Auto')}
                              {activeOption === "simple" && (lang === 'fr' ? 'Instant' : 'Instant')}
                              {activeOption === "think" && (lang === 'fr' ? 'Thinking' : 'Thinking')}
                              {activeOption === "pro" && (lang === 'fr' ? 'Pro' : 'Pro')}
                              {activeOption === "research" && (lang === 'fr' ? 'Research' : 'Research')}
                            </span>
                            <ChevronDown size={18} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-80 rounded-2xl shadow-2xl p-2 border border-border/50 bg-background/95 backdrop-blur-md z-[100] gap-1 flex flex-col">
                          {modelOptions?.options.auto && (
                            <DropdownMenuItem
                              className={cn(
                                "rounded-xl cursor-pointer flex items-center justify-between py-3 px-4 focus:bg-primary/5 transition-all group",
                                activeOption === "auto" && "bg-primary/5"
                              )}
                              onClick={() => {
                                setActiveModeModelId(modelOptions.options.auto.id);
                                setActiveOption("auto");
                              }}
                            >
                              <div className="flex flex-col gap-0.5">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-[14px]">{lang === 'fr' ? 'Auto' : 'Auto'}</span>
                                  <Sparkles size={14} className="text-primary opacity-60" />
                                </div>
                                <p className="text-[11px] text-muted-foreground leading-tight font-medium">
                                  {lang === 'fr' ? 'Sélectionne automatiquement le meilleur modèle' : 'Automatically selects the best model'}
                                </p>
                              </div>
                              {activeOption === "auto" && (
                                <Check className="h-4 w-4 text-primary" />
                              )}
                            </DropdownMenuItem>
                          )}

                          {modelOptions?.options.simple && (
                            <DropdownMenuItem
                              className={cn(
                                "rounded-xl cursor-pointer flex items-center justify-between py-3 px-4 focus:bg-primary/5 transition-all group",
                                activeOption === "simple" && "bg-primary/5"
                              )}
                              onClick={() => {
                                if (modelOptions.type === 'multi-model') {
                                  setActiveModeModelId(modelOptions.options.simple.id);
                                  setActiveOption("simple");
                                } else {
                                  setReasoningEffort("low");
                                  setActiveModeModelId(aiConfig.model);
                                  setActiveOption("simple");
                                }
                              }}
                            >
                              <div className="flex flex-col gap-0.5">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-[14px]">{lang === 'fr' ? 'Instant' : 'Instant'}</span>
                                  <span className="text-[10px] text-muted-foreground font-medium opacity-60">{modelOptions.options.simple.id?.match(/\d+\.\d+/)?.[0]}</span>
                                </div>
                                <p className="text-[11px] text-muted-foreground leading-tight font-medium">
                                  {lang === 'fr' ? 'Pour les chats quotidiens' : 'For everyday chats'}
                                </p>
                              </div>
                              {activeOption === "simple" && (
                                <Check className="h-4 w-4 text-primary" />
                              )}
                            </DropdownMenuItem>
                          )}

                          {modelOptions?.options.think && (
                            <DropdownMenuItem
                              className={cn(
                                "rounded-xl cursor-pointer flex items-center justify-between py-3 px-4 focus:bg-primary/5 transition-all group",
                                activeOption === "think" && "bg-primary/5"
                              )}
                              onClick={() => {
                                if (modelOptions.type === 'multi-model') {
                                  setActiveModeModelId(modelOptions.options.think.id);
                                  setActiveOption("think");
                                } else {
                                  setReasoningEffort("high");
                                  setActiveModeModelId(aiConfig.model);
                                  setActiveOption("think");
                                }
                              }}
                            >
                              <div className="flex flex-col gap-0.5">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-[14px]">{lang === 'fr' ? 'Thinking' : 'Thinking'}</span>
                                  <span className="text-[10px] text-muted-foreground font-medium opacity-60">{modelOptions.options.think.id?.match(/\d+\.\d+/)?.[0]}</span>
                                </div>
                                <p className="text-[11px] text-muted-foreground leading-tight font-medium">
                                  {lang === 'fr' ? 'Pour les questions complexes' : 'For complex questions'}
                                </p>
                              </div>
                              {activeOption === "think" && (
                                <Check className="h-4 w-4 text-primary" />
                              )}
                            </DropdownMenuItem>
                          )}

                          {modelOptions?.options.research && (
                            <DropdownMenuItem
                              className={cn(
                                "rounded-xl cursor-pointer flex items-center justify-between py-3 px-4 focus:bg-primary/5 transition-all group",
                                activeOption === "research" && "bg-primary/5"
                              )}
                              onClick={() => {
                                setActiveModeModelId(modelOptions.options.research.id);
                                setActiveOption("research");
                              }}
                            >
                              <div className="flex flex-col gap-0.5">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-[14px]">{lang === 'fr' ? 'Research' : 'Research'}</span>
                                  <span className="text-[10px] text-muted-foreground font-medium opacity-60">{modelOptions.options.research.id?.match(/\d+\.\d+/)?.[0]}</span>
                                </div>
                                <p className="text-[11px] text-muted-foreground leading-tight font-medium">
                                  {lang === 'fr' ? 'Analyse approfondie du web' : 'Deep web analysis'}
                                </p>
                              </div>
                              {activeOption === "research" && (
                                <Check className="h-4 w-4 text-primary" />
                              )}
                            </DropdownMenuItem>
                          )}

                          {modelOptions?.options.pro && (
                            <DropdownMenuItem
                              className={cn(
                                "rounded-xl cursor-pointer flex items-center justify-between py-3 px-4 focus:bg-primary/5 transition-all group",
                                activeOption === "pro" && "bg-primary/5"
                              )}
                              onClick={() => {
                                const isPro = user?.user_plan?.name?.toLowerCase().includes('pro') || user?.user_plan?.name?.toLowerCase().includes('business');
                                if (!isPro) {
                                  setActiveView("profile");
                                  toast.info(lang === 'fr' ? "Veuillez passer à un forfait supérieur" : "Please upgrade your plan");
                                  return;
                                }
                                setActiveModeModelId(modelOptions.options.pro.id);
                                setActiveOption("pro");
                              }}
                            >
                              <div className="flex flex-col gap-0.5 max-w-[180px]">
                                <span className="font-bold text-[14px]">{lang === 'fr' ? 'Pro' : 'Pro'}</span>
                                <p className="text-[11px] text-muted-foreground leading-tight font-medium">
                                  {lang === 'fr' ? "Passez à un forfait supérieur pour des fonctions d'intelligence de niveau recherche" : "Upgrade for research-level intelligence features"}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                {activeOption === "pro" ? (
                                  <Check className="h-4 w-4 text-primary" />
                                ) : (
                                  !(user?.user_plan?.name?.toLowerCase().includes('pro') || user?.user_plan?.name?.toLowerCase().includes('business')) && (
                                    <Button
                                      size="sm"
                                      className="h-7 px-3 rounded-full text-[10px] font-bold bg-foreground text-background hover:bg-foreground/90"
                                      onClick={(e) => {
                                        if (!(user?.user_plan?.name?.toLowerCase().includes('pro') || user?.user_plan?.name?.toLowerCase().includes('business'))) {
                                          e.stopPropagation();
                                          setActiveView("profile");
                                        }
                                      }}
                                    >
                                      {lang === 'fr' ? 'Mettre à niveau' : 'Upgrade'}
                                    </Button>
                                  )
                                )}
                              </div>
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="flex items-center gap-4">
                      <Menubar className="border-none bg-transparent shadow-none p-0 h-auto">
                        <MenubarMenu>
                          <MenubarTrigger className="flex justify-between min-w-[200px] gap-2 px-3 py-1.5 rounded-xl bg-background/50 border border-border/50 text-[0.85rem] font-bold hover:text-primary hover:border-primary/30 transition-all shadow-sm cursor-pointer data-[state=open]:bg-background/80 focus:bg-background/80">
                            <Sparkles size={14} className="text-primary" />
                            <span className="uppercase tracking-tight">{aiConfig.model?.split('/').pop()}</span>
                            {/* {isThinkingModel && (
                              <Badge className="h-4 px-1 text-[8px] bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 shadow-none -ml-1 border-emerald-500/20">{lang === 'fr' ? 'Raisonnement' : 'Thinking'}</Badge>
                            )} */}
                            <ChevronDown size={14} className="text-muted-foreground opacity-50" />
                          </MenubarTrigger>
                          <MenubarContent align="end" className="w-72 p-2 rounded-2xl shadow-2xl">
                            {/* <MenubarLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-2 py-1.5">{lang === 'fr' ? 'Modèles Disponibles' : 'Available Models'}</MenubarLabel> */}
                            {/* <MenubarSeparator className="mb-4" /> */}
                            {(() => {
                              const groups: Record<string, any[]> = {};
                              aiProviders.forEach(provider => {
                                provider.models.forEach(m => {
                                  if (modelSearch && !m.name.toLowerCase().includes(modelSearch.toLowerCase())) return;
                                  const cat = provider.name;
                                  if (!groups[cat]) groups[cat] = [];
                                  groups[cat].push({ ...m, providerId: provider.id, displayName: m.name });
                                });
                              });

                              return (
                                <div className="flex flex-col max-h-[60vh] overflow-y-auto custom-scrollbar">
                                  <div className="sticky top-0 bg-background z-20 p-2 border-b border-border/10 mb-2 shadow-sm rounded-t-xl bg-background/95 backdrop-blur-md">
                                    <div className="relative group/search">
                                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground group-focus-within/search:text-primary transition-colors" />
                                      <Input
                                        placeholder={lang === 'fr' ? "Rechercher..." : "Search..."}
                                        className="h-7 pl-7 py-0.5 text-[10px] font-bold rounded-lg border-none bg-muted/30 focus-visible:ring-1 focus-visible:ring-primary/20"
                                        value={modelSearch}
                                        onChange={(e) => setModelSearch(e.target.value)}
                                        onKeyDown={(e) => e.stopPropagation()}
                                        autoFocus
                                      />
                                    </div>
                                  </div>

                                  {Object.keys(groups).length === 0 ? (
                                    <div className="py-8 text-center px-4">
                                      <Search className="h-4 w-4 mx-auto text-muted-foreground/30 mb-2" />
                                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-tight">
                                        {lang === 'fr' ? "Aucun modèle trouvé" : "No model found"}
                                      </p>
                                    </div>
                                  ) : (
                                    <div className="flex flex-col gap-1 p-1">
                                      {Object.entries(groups).map(([category, models]) => (
                                        <MenubarSub key={category}>
                                          <MenubarSubTrigger className="rounded-xl px-2 py-2 cursor-pointer transition-colors mx-1 data-[state=open]:bg-primary/5 data-[state=open]:text-primary focus:bg-muted/40 hover:bg-muted/40">
                                            <div className="flex items-center gap-2">
                                              <span className="text-[11px] font-bold uppercase tracking-wider opacity-60 group-data-[state=open]:opacity-100">{category}</span>
                                              <Badge className="h-4 p-0 px-1.5 text-[8px] font-bold bg-muted/50 text-muted-foreground border-none opacity-50">{models.length}</Badge>
                                            </div>
                                          </MenubarSubTrigger>
                                          <MenubarPortal>
                                            <MenubarSubContent className="w-72 p-2 rounded-2xl shadow-2xl border-border/50 animate-in slide-in-from-left-1 duration-200">
                                              {/* Bouton d'ajout d'un modèle HF, en haut de la pile LOCAL. */}
                                              {category === "Local" && (
                                                <MenubarItem
                                                  onSelect={(e) => e.preventDefault()}
                                                  onClick={() => setAddLocalOpen(true)}
                                                  className="flex items-center gap-2 rounded-xl px-3 py-2 cursor-pointer transition-colors mx-1 mb-1 text-primary border border-dashed border-primary/30 hover:bg-primary/5"
                                                >
                                                  <Plus size={14} />
                                                  <span className="text-[11px] font-bold">{lang === 'fr' ? "Ajouter un modèle" : "Add a model"}</span>
                                                </MenubarItem>
                                              )}
                                              {models.map(model => {
                                                const isLocal = (model as any).providerId === LOCAL_PROVIDER_ID;
                                                const lst = isLocal ? (localStatus[model.id] || { state: "unknown", percent: 0 }) : null;
                                                const localReady = !isLocal || lst?.state === "ready";
                                                return (
                                                <MenubarItem
                                                  key={model.id}
                                                  onSelect={(e) => { if (isLocal && !localReady) e.preventDefault(); }}
                                                  className={cn(
                                                    "flex items-center justify-between rounded-xl px-3 py-2 cursor-pointer transition-colors mx-1 mb-0.5",
                                                    aiConfig.model === model.id ? "bg-primary/5 text-primary border border-primary/20" : "hover:bg-muted/40"
                                                  )}
                                                  onClick={async () => {
                                                    if (isLocal) {
                                                      // Pas encore prêt : un clic lance (ou ignore si déjà en cours) le téléchargement.
                                                      if (!localReady) {
                                                        if (lst?.state !== "downloading") handleDownloadLocal(model.id);
                                                        return;
                                                      }
                                                      // Modèle local prêt : sélection sans appel backend.
                                                      setAiConfig({ ...aiConfig, model: model.id, provider: LOCAL_PROVIDER_ID, api_key: "" });
                                                      setActiveModeModelId(model.id);
                                                      toast.success(lang === 'fr' ? `Modèle local : ${model.name}` : `Local model: ${model.name}`);
                                                      return;
                                                    }
                                                    const newConfig = { ...aiConfig, model: model.id, provider: "openrouter", api_key: "" };
                                                    setAiConfig(newConfig);
                                                    try {
                                                      await api.post('/chatbot-config/', newConfig);
                                                      toast.success(lang === 'fr' ? `Modèle changé pour ${model.name}` : `Model changed to ${model.name}`);
                                                    } catch (err: any) {
                                                      console.error("Failed to save model change", err);
                                                      toast.error(lang === 'fr' ? "Erreur lors de la sauvegarde du modèle" : "Error saving model change");
                                                    }
                                                  }}
                                                >
                                                  <div className="flex gap-2 items-center justify-between w-full">
                                                    <span className="text-[11px] font-bold">{isLocal ? model.name : model.id}</span>
                                                    <div className="flex items-center gap-1.5">
                                                      {isLocal ? (
                                                        lst?.state === "downloading" ? (
                                                          <Loader2 size={14} className="text-primary animate-spin" />
                                                        ) : lst?.state === "ready" ? (
                                                          <Check size={14} className="text-emerald-500" />
                                                        ) : (
                                                          <Download size={14} className="text-primary" />
                                                        )
                                                      ) : (
                                                        <>
                                                          <MessageSquare size={12} />
                                                          {((model as any).options?.think || (model as any).supportsReasoning) && <Brain size={12} />}
                                                          {(model as any).options?.research && <Search size={12} />}
                                                          {(model as any).options?.pro && <Zap size={12} />}
                                                        </>
                                                      )}
                                                    </div>
                                                  </div>
                                                </MenubarItem>
                                                );
                                              })}
                                            </MenubarSubContent>
                                          </MenubarPortal>
                                        </MenubarSub>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              );
                            })()}

                            <MenubarSeparator />
                            {/* Manage Providers hidden */}
                          </MenubarContent>
                        </MenubarMenu>
                      </Menubar>
                      <div
                        className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full border border-border/50 relative overflow-hidden bg-muted/40 cursor-pointer hover:bg-muted/60 transition-colors"
                        onClick={() => setActiveView("profile")}
                      >
                        <div
                          className={cn(
                            "absolute left-0 top-0 bottom-0 opacity-20 transition-all duration-500",
                            usagePercent > 90 ? "bg-red-500" : usagePercent > 75 ? "bg-amber-500" : "bg-primary"
                          )}
                          style={{ width: `${usagePercent}%` }}
                        />
                        <span className="text-[0.75rem] text-foreground font-bold tabular-nums relative z-10">{usageValue} {lang === 'fr' ? 'Crédits' : 'Credits'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* PII Side Panel (Right) */}
          {piiOpen && (
            <div className="fixed inset-0 z-50 bg-background flex flex-col xl:relative xl:w-72 xl:inset-auto xl:z-10 xl:border-l animate-in slide-in-from-right duration-300">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="font-bold flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  {t.chatbot.piiPanel.title}
                </h3>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setPiiOpen(false)}>
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
              <div className="p-6 border-b space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] text-muted-foreground font-medium opacity-80 leading-tight">
                    {t.chatbot.piiPanel.subtitle}
                  </p>
                  <Badge variant="outline" className="bg-primary/5 text-primary border-primary/10 text-xs h-6">{allPiis.length}</Badge>
                </div>
                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    placeholder={t.chatbot.piiPanel.search}
                    className="h-8 pl-8 text-[11px] rounded-lg bg-background border-border/50 focus:border-primary/20 transition-all"
                    value={piiSearch}
                    onChange={(e) => setPiiSearch(e.target.value)}
                  />
                </div>
              </div>

              <ScrollArea className="flex-1">
                <div className="p-4 space-y-3">
                  {filteredPiis.length > 0 ? (
                    filteredPiis.map((pii) => (
                      <div key={pii.id} className="p-3.5 rounded-xl bg-card border border-border/50 hover:border-primary/20 transition-all group">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <Badge className={cn("text-xs font-black h-5 px-2 border-none", getPiiColor(pii.type))}>
                            {getPiiLabel(pii.type).toUpperCase()}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 rounded-md hover:bg-muted"
                            onClick={() => togglePiiLock(pii.value)}
                            title={pii.locked ? (lang === 'fr' ? "Rendre privé (anonymiser)" : "Make private (anonymize)") : (lang === 'fr' ? "Rendre public (ne pas anonymiser)" : "Make public (do not anonymize)")}
                          >
                            {pii.locked ? <Unlock className="h-3 w-3 text-emerald-500" /> : <Lock className="h-3 w-3 text-muted-foreground/40" />}
                          </Button>
                          {pii.type.startsWith('user_') && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 rounded-md hover:bg-rose-500/10 hover:text-rose-500"
                              onClick={() => handleDeletePii(pii.value)}
                              title={lang === 'fr' ? "Supprimer l'entité" : "Delete entity"}
                            >
                              <Trash2 className="h-3 w-3 text-rose-500" />
                            </Button>
                          )}
                        </div>
                        <p className="text-[11px] font-bold break-all leading-tight group-hover:text-primary transition-colors">{pii.value}</p>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest">Status</span>
                          <span className={cn(
                            "text-[9px] font-black uppercase tracking-tighter",
                            pii.locked ? "text-emerald-500" : "text-amber-500"
                          )}>
                            {pii.locked ? (lang === 'fr' ? "Public" : "Public") : (lang === 'fr' ? "Privé" : "Private")}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center opacity-40 grayscale">
                      <Shield className="h-8 w-8 mb-3 text-muted-foreground" />
                      <p className="text-[10px] font-bold uppercase tracking-widest">{t.chatbot.piiPanel.noEntities}</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
      )}

      {/* Modale : ajouter un modèle local HuggingFace */}
      <Dialog open={addLocalOpen} onOpenChange={setAddLocalOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="h-4 w-4 text-primary" />
              {lang === 'fr' ? "Ajouter un modèle local" : "Add a local model"}
            </DialogTitle>
            <DialogDescription>
              {lang === 'fr'
                ? "Saisis le nom du dépôt HuggingFace. La clé API n'est requise que pour les modèles privés ou à accès restreint."
                : "Enter the HuggingFace repo name. The API key is only needed for private or gated models."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">{lang === 'fr' ? "Modèle HuggingFace" : "HuggingFace model"}</Label>
              <Input
                placeholder="ex: unsloth/Qwen2-0.5B-Instruct"
                value={newRepo}
                onChange={(e) => setNewRepo(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAddLocalModel(); }}
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">
                {lang === 'fr' ? "Clé API HuggingFace" : "HuggingFace API key"}
                <span className="ml-1 font-normal text-muted-foreground">{lang === 'fr' ? "(optionnelle)" : "(optional)"}</span>
              </Label>
              <Input
                type="password"
                placeholder="hf_..."
                value={newHfKey}
                onChange={(e) => setNewHfKey(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAddLocalModel(); }}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setAddLocalOpen(false)}>
              {lang === 'fr' ? "Annuler" : "Cancel"}
            </Button>
            <Button onClick={handleAddLocalModel} disabled={!newRepo.trim().includes('/')}>
              <Download className="h-4 w-4 mr-1.5" />
              {lang === 'fr' ? "Télécharger" : "Download"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isAiConfigModalOpen}
        onOpenChange={(open) => {
          if (!open) {
            setShowAddProvider(false);
            setEditingProvider(null);
          }
          setIsAiConfigModalOpen(open);
        }}
      >
        <DialogContent className="w-[95vw] sm:max-w-[600px] rounded-2xl max-h-[90vh] overflow-y-auto">
          {!showAddProvider ? (
            // LIST VIEW
            <div className="space-y-6">
              <DialogHeader>
                <DialogTitle>{t.chatbot.config.title}</DialogTitle>
                <DialogDescription>{t.chatbot.config.subtitle}</DialogDescription>
              </DialogHeader>

              <div className="grid gap-4">
                {Array.from(new Set([...Object.keys(savedCredentials), 'google-free'])).map(providerId => {
                  const providerInfo = aiProviders.find(p => p.id === providerId);
                  // Skip if provider info not found (e.g. old ID)
                  if (!providerInfo && providerId !== 'google-free') return null;
                  // Mock provider info for google-free if needed (though it should be in AI_PROVIDERS now)

                  return (
                    <Card key={providerId} className="flex items-center justify-between p-4 bg-muted/30 border shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center border font-bold text-xs">
                          {providerInfo?.name.substring(0, 2).toUpperCase() || "??"}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold">{providerInfo?.name || providerId}</span>
                          <span className="text-[10px] text-muted-foreground uppercase tracking-widest">{providerId}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs h-8"
                          disabled={providerId === 'google-free'}
                          onClick={() => {
                            // Initialize dialog config, not aiConfig
                            setProviderDialogConfig({
                              provider: providerId,
                              model: "",
                              api_key: savedCredentials[providerId] || ""
                            });
                            setEditingProvider(providerId);
                            setShowAddProvider(true);
                          }}
                        >
                          {lang === 'fr' ? 'Modifier' : 'Edit'}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={providerId === 'google-free'}
                          className="h-8 w-8 text-destructive/70 hover:text-destructive hover:bg-destructive/10 disabled:opacity-30 disabled:hover:bg-transparent"
                          onClick={() => handleDeleteProvider(providerId)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
                  );
                })}

                {Object.keys(savedCredentials).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground text-sm border-2 border-dashed rounded-xl">
                    {lang === 'fr' ? "Aucun founisseur configuré" : "No provider configured"}
                  </div>
                )}
              </div>

              <Button
                className="w-full h-12 rounded-xl text-base font-bold shadow-lg"
                onClick={() => {
                  setEditingProvider(null);
                  // Default to OpenAI or first available non-free provider, NOT google-free
                  setProviderDialogConfig({ provider: "openai", model: "", api_key: "" });
                  setShowAddProvider(true);
                }}
              >
                {lang === 'fr' ? 'Ajouter un fournisseur' : 'Add Provider'}
              </Button>
            </div>
          ) : (
            // ADD/EDIT VIEW
            <div className="space-y-6">
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8 -ml-2" onClick={() => setShowAddProvider(false)}>
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                  <DialogTitle>{editingProvider ? (lang === 'fr' ? 'Modifier le fournisseur' : 'Edit Provider') : (lang === 'fr' ? 'Ajouter un fournisseur' : 'Add Provider')}</DialogTitle>
                </div>
              </DialogHeader>

              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label>{t.chatbot.config.provider}</Label>
                  <Select
                    value={providerDialogConfig.provider}
                    onValueChange={(val) => {
                      const savedKey = savedCredentials[val] || "";
                      let defaultModel = "";
                      if (val === 'openrouter') defaultModel = "google/gemini-2.0-flash-lite:free";
                      else if (val === 'openai') defaultModel = "gpt-4o-mini";
                      else if (val === 'google') defaultModel = "gemini-1.5-flash";

                      setProviderDialogConfig(prev => ({ ...prev, provider: val, api_key: savedKey, model: defaultModel }));
                    }}
                    disabled={!!editingProvider}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {aiProviders.filter(p => {
                        // Allow if it's the provider currently being edited
                        if (editingProvider && p.id === editingProvider) return true;
                        // Always exclude google-free 
                        if (p.id === 'google-free') return false;
                        // Exclude if already configured (in savedCredentials)
                        if (savedCredentials[p.id]) return false;
                        return true;
                      }).map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{t.chatbot.config.apiKey}</Label>
                  {providerDialogConfig.provider === 'google-free' ? (
                    <div className="p-3 bg-muted rounded-md text-sm text-muted-foreground border border-dashed flex items-center gap-2">
                      <Shield className="w-4 h-4 text-green-500" />
                      {lang === 'fr' ? 'Géré par le système (Plan Gratuit)' : 'Managed by System (Free Tier)'}
                    </div>
                  ) : (
                    <div className="relative">
                      <Input
                        type={showApiKey ? "text" : "password"}
                        value={providerDialogConfig.api_key}
                        onChange={(e) => setProviderDialogConfig({ ...providerDialogConfig, api_key: e.target.value })}
                        placeholder={t.chatbot.config.apiKeyPlaceholder}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleTestAiConfig}
                  disabled={isTestingConfig || (!providerDialogConfig.api_key && providerDialogConfig.provider !== 'google-free')}
                >
                  {isTestingConfig ? (
                    <>
                      <div className="w-4 h-4 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin mr-2" />
                      Testing...
                    </>
                  ) : (
                    lang === 'fr' ? 'Tester la connexion' : 'Test Connection'
                  )}
                </Button>

                <Button
                  className="w-full"
                  onClick={handleSaveProviderConfig}
                  disabled={isSavingAiConfig || (!providerDialogConfig.api_key && providerDialogConfig.provider !== 'google-free')}
                >
                  {isSavingAiConfig ? t.chatbot.config.saving : t.chatbot.config.save}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {activeSelection && activeSelection.rect && (
        <Popover
          open={!!activeSelection}
          onOpenChange={(open) => {
            if (!open) {
              setActiveSelection(null);
              setManualAnonymizeStep('init');
              setManualLabelsSearch("");
            }
          }}
        >
          <PopoverAnchor
            style={{
              position: 'fixed',
              left: activeSelection.rect.left,
              top: activeSelection.rect.top,
              width: activeSelection.rect.width,
              height: activeSelection.rect.height,
              pointerEvents: 'none',
              zIndex: 9999
            }}
          />
          <PopoverContent
            className={cn(
              "p-0 border-none shadow-2xl rounded-lg backdrop-blur-md anonymize-popover transition-all duration-300",
              (activeSelection.msgId || manualAnonymizeStep === 'init') ? "w-auto" : "w-64 max-h-[400px] overflow-y-auto"
            )}
            side="top"
            align="center"
            sideOffset={8}
          >
            {activeSelection.msgId ? (
              <Button
                variant="ghost"
                size="sm"
                className="w-full h-8 text-[10px] font-bold rounded-lg flex items-center gap-2 border-1"
                onClick={() => handleManualAnonymize(activeSelection.msgId!)}
              >
                <Shield className="h-3 w-3" />
                {lang === 'fr' ? 'Anonymiser' : 'Anonymize'}
              </Button>
            ) : manualAnonymizeStep === 'init' ? (
              <Button
                variant="ghost"
                size="sm"
                className="w-full h-8 text-[10px] font-bold rounded-lg flex items-center gap-2 animate-in fade-in zoom-in-95 duration-200 border-1"
                onClick={() => setManualAnonymizeStep('labels')}
              >
                <Shield className="h-3 w-3" />
                {lang === 'fr' ? 'Anonymiser' : 'Anonymize'}
              </Button>
            ) : (
              <div className="flex flex-col gap-1 p-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center justify-between px-2 py-1 border-b mb-1">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">Choisissez un Label</p>
                </div>
                <div className="relative group px-2 pb-1 border-b">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    placeholder={lang === 'fr' ? 'Rechercher...' : 'Search...'}
                    className="h-7 pl-8 text-[11px] rounded-lg bg-background border-border/50 focus:border-primary/20 transition-all font-medium"
                    value={manualLabelsSearch}
                    onChange={(e) => setManualLabelsSearch(e.target.value)}
                    autoFocus
                  />
                </div>
                <ScrollArea className="max-h-[300px] overflow-y-auto">
                  <div className="flex flex-col gap-1 p-2">
                    {Object.entries(labels_dict).map(([category, labels]) => {
                      const filteredLabels = labels.filter(label =>
                        label.toLowerCase().includes(manualLabelsSearch.toLowerCase()) ||
                        category.replace(/_/g, ' ').toLowerCase().includes(manualLabelsSearch.toLowerCase())
                      );

                      if (filteredLabels.length === 0) return null;

                      return (
                        <div key={category} className="space-y-0.5">
                          <p className="text-[9px] font-black text-primary/40 uppercase tracking-tighter px-2 py-1 mt-1">{category.replace(/_/g, ' ')}</p>
                          {filteredLabels.map(label => (
                            <Button
                              key={label}
                              variant="ghost"
                              size="sm"
                              className="justify-start h-8 text-[11px] font-bold w-full px-2 rounded-md hover:bg-primary/5 hover:text-primary transition-all group/item"
                              onClick={() => {
                                handleManualAnonymize(label);
                                setManualAnonymizeStep('init');
                                setManualLabelsSearch("");
                              }}
                            >
                              <Shield className="h-3 w-3 mr-2 opacity-0 group-hover/item:opacity-100 transition-opacity" />
                              {label.replace(/_/g, ' ').toUpperCase()}
                            </Button>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </div>
            )}
          </PopoverContent>
        </Popover>
      )}
    </>
  );
}

function getSelectionOffset(root: HTMLElement, targetNode: Node, targetOffset: number): number {
  let offset = 0;
  const nodeIterator = document.createNodeIterator(root, NodeFilter.SHOW_TEXT);
  let currentNode: Node | null;
  while ((currentNode = nodeIterator.nextNode())) {
    if (currentNode === targetNode) {
      return offset + targetOffset;
    }
    offset += currentNode.textContent?.length || 0;
  }
  return offset;
}

function getNodeAndOffsetAt(root: HTMLElement, targetOffset: number): { node: Node, offset: number } | null {
  let offset = 0;
  const nodeIterator = document.createNodeIterator(root, NodeFilter.SHOW_TEXT);
  let currentNode: Node | null;
  while ((currentNode = nodeIterator.nextNode())) {
    const len = currentNode.textContent?.length || 0;
    if (offset + len >= targetOffset) {
      return { node: currentNode, offset: targetOffset - offset };
    }
    offset += len;
  }
  return null;
}

function expandToWordBoundaries(text: string, start: number, end: number): { start: number, end: number, expandedText: string } {
  let newStart = start;
  let newEnd = end;

  const isWordChar = (char: string) => char && /[^\s.,!?;:()\[\]{}"']/.test(char);

  while (newStart > 0 && isWordChar(text[newStart - 1])) {
    newStart--;
  }
  while (newEnd < text.length && isWordChar(text[newEnd])) {
    newEnd++;
  }

  return { start: newStart, end: newEnd, expandedText: text.substring(newStart, newEnd) };
}
