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
    User, Eye, EyeOff, Copy, RotateCcw,
    Square, Loader2, FileText, X, Paperclip, ChevronDown, Sparkles, Check, CheckCircle2,
    XCircle, FileIcon, Lock, Unlock, Menu, ChevronLeft, ChevronRight
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
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { fetchAIProviders, DEFAULT_AI_PROVIDERS, AIProvider } from "@/lib/ai-config";
import { labels_dict, translations } from "@/lib/translations";

interface PII {
    id: string;
    value: string;
    type: string;
    placeholder?: string;
    locked: boolean;
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

export function ChatbotSection() {
    const { lang, user, userConsumption, activeView } = useApp();
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
    
    const [aiProviders, setAiProviders] = React.useState<AIProvider[]>(DEFAULT_AI_PROVIDERS);
    const [aiConfig, setAiConfig] = React.useState({ provider: "openai", model: "gpt-4o", api_key: "" });
    const [savedCredentials, setSavedCredentials] = React.useState<Record<string, string>>({});

    const scrollRef = React.useRef<HTMLDivElement>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);
    const [abortController, setAbortController] = React.useState<AbortController | null>(null);
    const currentContentRef = React.useRef("");
    
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
                ...m, timestamp: new Date(m.timestamp), showPiiValues: false
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

    const getDeAnonymizedContent = (content: string, allMessages: Message[], extraMappings?: Record<string, string>) => {
        if (!content) return content;
        const reverseMap: Record<string, string> = {};

        if (extraMappings) {
            Object.entries(extraMappings).forEach(([placeholder, realVal]) => {
                reverseMap[placeholder] = realVal;
            });
        }

        allMessages.forEach(m => {
            if (m.piis && m.piis.length > 0) {
                m.piis.forEach(p => {
                    if (p.placeholder && p.value) reverseMap[p.placeholder] = p.value;
                });
            }
            if (m.filePiiMappings) {
                Object.entries(m.filePiiMappings).forEach(([realVal, placeholder]) => {
                    reverseMap[placeholder as string] = realVal;
                });
            }
        });

        let result = content;
        let previousResult = "";
        let pass = 0;
        while (result !== previousResult && pass < 3) {
            previousResult = result;
            pass++;
            const sortedEntries = Object.entries(reverseMap).sort((a, b) => b[0].length - a[0].length);
            if (sortedEntries.length === 0) break;

            sortedEntries.forEach(([placeholder, realVal]) => {
                const cleanRealVal = realVal.replace(/^\[+|\]+$/g, '');
                const escaped = placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                result = result.replace(new RegExp('\\[?' + escaped + '\\]?', 'gi'), cleanRealVal);
            });
        }
        return result;
    }

    const handleStopStreaming = async () => {
        if (abortController) {
            abortController.abort();
            setAbortController(null);
            setIsStreaming(false);
            setIsLoading(false);

            setMessages(prev => prev.map(m => {
                if (String(m.id).startsWith("assistant-") && m.isLoading) {
                    return { ...m, isLoading: false };
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

    const handleSend = async () => {
        if (!aiConfig.api_key && aiConfig.provider !== 'google-free') {
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
            showPiiValues: false,
            raw_content: input,
        };
        setMessages(prev => [...prev, userMsg]);

        const currentInput = input;
        setInput("");
        if (textareaRef.current) textareaRef.current.style.height = 'auto';
        
        const currentAttachedFiles = [...attachedFiles];
        setAttachedFiles([]);
        if (fileInputRef.current) fileInputRef.current.value = '';

        let processedInput = currentInput;
        const detectedPiis: PII[] = [];
        const globalValToPlaceholder: Record<string, string> = {};
        let globalCount = 0;

        messages.forEach(m => {
            if (m.piis && m.piis.length > 0) {
                m.piis.forEach(pii => {
                    if (pii.value && pii.placeholder && !globalValToPlaceholder[pii.value]) {
                        globalValToPlaceholder[pii.value] = pii.placeholder;
                        const match = pii.placeholder.match(/_(\d+)\]$/);
                        if (match) {
                            const num = parseInt(match[1]);
                            if (!isNaN(num) && num > globalCount) globalCount = num;
                        }
                    }
                });
            }
        });

        try {
            const settingsRes = await api.get('/pii/');
            const labels = settingsRes.data.selected_labels;

            if (labels && labels.length > 0 && currentInput.trim()) {
                const detectionRes = await api.post('/pii/extract', { text: currentInput, labels: [] });
                const entities = detectionRes.data.entities;
                if (entities && entities.length > 0) {
                    const sortedEntities = [...entities].sort((a: any, b: any) => b.value.length - a.value.length);
                    
                    sortedEntities.forEach((ent: any, idx: number) => {
                        const typeKey = ent.entity.toLowerCase().replace(/[ -]/g, '_');
                        let placeholder = globalValToPlaceholder[ent.value];
                        if (!placeholder) {
                            globalCount++;
                            placeholder = `[${typeKey}_${globalCount}]`;
                            globalValToPlaceholder[ent.value] = placeholder;
                        }

                        const regex = new RegExp(ent.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
                        if (regex.test(processedInput)) {
                            processedInput = processedInput.replace(regex, placeholder);
                            if (!detectedPiis.some(p => p.value === ent.value && p.type === ent.entity)) {
                                detectedPiis.push({
                                    id: `pii-${Date.now()}-${idx}`,
                                    value: ent.value,
                                    type: ent.entity,
                                    placeholder,
                                    locked: false
                                });
                            }
                        }
                    });
                }
            }
            setMessages(prev => prev.map(m => m.id === userMsg.id ? { ...m, piis: detectedPiis, content: processedInput, raw_content: currentInput } : m));
        } catch (err) {
            console.error("PII detection failed", err);
        } finally {
            setIsDetecting(false);
        }

        try {
            let processedFilesForAi: { mime_type: string, data: string }[] = [];
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
                    body: formData
                });

                if (!fileResponse.ok) throw new Error('File processing failed');

                const reader = fileResponse.body?.getReader();
                if (!reader) throw new Error('No reader available for files');

                const decoder = new TextDecoder();
                let partialData = "";
                const completedFilesMap: Record<string, { mime_type: string, data: string }> = {};

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
            }

            setIsStreaming(true);
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

            const controller = new AbortController();
            setAbortController(controller);

            const currentStreamMappings: Record<string, string> = { ...globalValToPlaceholder };
            if (completedPiiMappings) {
                Object.entries(completedPiiMappings).forEach(([realVal, placeholder]) => {
                    currentStreamMappings[placeholder as string] = realVal;
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
                    model: aiConfig.model,
                    provider: aiConfig.provider 
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
                            } else if (data.content) {
                                setIsLoading(false);
                                accumulatedContent += data.content;
                                currentContentRef.current = accumulatedContent;
                                const displayContent = getDeAnonymizedContent(accumulatedContent, messages, currentStreamMappings);
                                setMessages(prev => prev.map(m => m.id === assistantMsgId ? { ...m, content: displayContent, isLoading: false, fileProcessingStatus: m.fileProcessingStatus } : m));
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
        }
    }

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
        if (msg.fileProcessingStatus && msg.fileProcessingStatus.length > 0 && !displayContentFlag) {
            const allFinished = msg.fileProcessingStatus.every(f => f.status === 'finished');
            const hasError = msg.fileProcessingStatus.some(f => f.status === 'error');
            return (
                <div className="flex flex-col gap-3 w-full min-w-[280px] p-1 text-sm bg-muted/20 border border-border/50 rounded-xl px-4 py-3">
                    <div className="flex flex-col gap-2">
                         {msg.fileProcessingStatus.map(file => (
                             <div key={file.id} className="flex items-center justify-between gap-2 text-xs">
                                <span className="font-medium truncate max-w-[150px]">{file.filename}</span>
                                {file.status === 'pending' || file.status === 'loader' || file.status === 'anonymisation' ? 
                                    <span className="flex items-center gap-1 text-primary"><Loader2 className="w-3 h-3 animate-spin"/> {file.status}</span>
                                    : file.status === 'finished' ? <span className="flex items-center gap-1 text-emerald-500"><Check className="w-3 h-3"/> Done</span> 
                                    : <span className="flex items-center gap-1 text-rose-500"><XCircle className="w-3 h-3"/> Error</span>}
                             </div>
                         ))}
                    </div>
                </div>
            );
        }

        let displayContent = msg.role === "user" ? ((msg as any).raw_content || msg.content) : msg.content;
        if (msg.role === "assistant") {
            displayContent = getDeAnonymizedContent(displayContent, messages);
            return (
                <div className="break-words text-sm leading-relaxed">
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                            code: ({ node, inline, className, children, ...props }: any) => {
                                return inline ? (
                                    <code className="bg-muted/50 px-1.5 py-0.5 rounded font-mono text-xs border border-border/50" {...props}>{children}</code>
                                ) : (
                                    <div className="relative my-3">
                                        <pre className="bg-muted/50 p-4 rounded-xl overflow-x-auto border border-border/50 shadow-sm"><code className="font-mono text-xs" {...props}>{children}</code></pre>
                                    </div>
                                )
                            }
                        }}
                    >
                        {displayContent}
                    </ReactMarkdown>
                </div>
            )
        }
        
        return <div className="whitespace-pre-wrap break-words">{displayContent}</div>;
    }

    const togglePiiVisibility = (msgId: string) => {
        setMessages(prev => prev.map(m => m.id === msgId ? { ...m, showPiiValues: !m.showPiiValues } : m));
    }

    return (
        <div className="flex-1 flex flex-col xl:flex-row h-full overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
            
            {/* History Sidebar */}
            {historyOpen && (
                <div className="fixed inset-0 z-50 bg-background flex flex-col md:relative md:w-72 md:inset-auto md:z-10 md:border-r border-border shrink-0 transition-all duration-300">
                    <div className="flex items-center gap-2 p-4 border-b">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setHistoryOpen(false)}>
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                        <h3 className="font-bold">{lang === 'fr' ? 'Historique' : 'History'}</h3>
                    </div>
                    <div className="p-4 space-y-4">
                        <Button className="w-full justify-start gap-2 bg-primary text-primary-foreground font-bold rounded-xl" onClick={() => { setActiveSessionId(null); setMessages(exampleMessages); }}>
                            <Plus className="w-4 h-4" /> {t.sidebar?.newChat || "Nouveau Chat"}
                        </Button>
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder={t.chatbot?.piiPanel?.search || "Search..."} className="h-9 pl-9 rounded-xl" value={sessionSearch} onChange={(e) => setSessionSearch(e.target.value)} />
                        </div>
                    </div>
                    <ScrollArea className="flex-1">
                        <div className="p-2 space-y-1">
                            {sessions.map((session) => (
                                <div key={session.id} className={cn("group flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all", activeSessionId === session.id ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/40 hover:text-foreground")} onClick={() => { setActiveSessionId(session.id); fetchMessages(session.id); if (isMobile) setHistoryOpen(false); }}>
                                    <div className="flex items-center gap-2.5 overflow-hidden">
                                        <MessageSquare className="h-4 w-4 shrink-0" />
                                        <span className="text-sm font-semibold truncate tracking-tight">{session.title}</span>
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 hover:text-rose-500" onClick={(e) => { e.stopPropagation(); deleteSession(session.id); }}>
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
            )}

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col min-w-0 h-full relative z-0">
                <div className="h-16 border-b bg-background/50 backdrop-blur-md flex items-center justify-between px-6 shrink-0 z-10 sticky top-0">
                    <div className="flex items-center gap-3">
                        {!historyOpen && (
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => setHistoryOpen(true)}>
                                <Menu className="h-4 w-4" />
                            </Button>
                        )}
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                            <Bot className="h-4 w-4" />
                        </div>
                        <div className="hidden sm:block">
                            <h2 className="text-sm font-bold tracking-tight">{t.chatbot?.title || "Assistant Sécurisé"}</h2>
                            <p className="text-[10px] text-muted-foreground font-medium">{t.chatbot?.subtitle || ""}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {!piiOpen && (
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => setPiiOpen(true)}>
                                <Shield className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>

                <ScrollArea ref={scrollRef} className="flex-1 p-4 lg:p-6 bg-background">
                    <div className={cn("max-w-4xl mx-auto space-y-8 pb-12", messages.length > 1 ? "" : "h-full flex flex-col items-center justify-center")}>
                        {messages.length > 1 ? (
                            messages.filter(msg => msg.role !== "system").map((msg, idx) => (
                                <div key={msg.id} className={cn("flex flex-col animate-in fade-in duration-300", msg.role === "user" ? "items-end" : "items-start")}>
                                    <div className={cn("flex w-full items-end gap-3", msg.role === "user" ? "justify-end flex-row-reverse" : "justify-start")}>
                                        <div className="flex flex-col gap-2 max-w-[85%]">
                                            {msg.fileProcessingStatus && msg.fileProcessingStatus.length > 0 && renderMessage(msg, false)}
                                            
                                            <div className="flex gap-3 items-end w-full">
                                                <div className={cn("px-5 py-3.5 rounded-3xl text-[15px] font-medium leading-relaxed shadow-sm flex-1", msg.role === "user" ? "bg-muted/80 border text-foreground rounded-tr-none" : "bg-card border text-foreground rounded-tl-none")}>
                                                    {msg.isLoading ? (
                                                        <div className="flex items-center gap-2 text-[10px] font-bold text-primary uppercase animate-pulse">
                                                            <Shield className="h-3 w-3" /> {isDetecting ? (lang === 'fr' ? 'Anonymisation...' : 'Anonymizing...') : (t.chatbot?.thinking || "Génération...")}
                                                        </div>
                                                    ) : renderMessage(msg)}
                                                </div>
                                            </div>

                                            <div className={cn("flex items-center gap-3 px-1", msg.role === "user" ? "justify-end" : "justify-start")}>
                                                {msg.piis && msg.piis.length > 0 && (
                                                    <>
                                                        <button onClick={() => togglePiiVisibility(msg.id)} className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground/60 hover:text-primary transition-colors uppercase bg-muted/30 px-2 py-1 rounded-md">
                                                            {msg.showPiiValues ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                                            {msg.showPiiValues ? (t.chatbot?.piiPanel?.hidePii || "Masquer") : (t.chatbot?.piiPanel?.revealPii || "Révéler")}
                                                        </button>
                                                    </>
                                                )}
                                                <button onClick={() => { navigator.clipboard.writeText(msg.role === "user" ? ((msg as any).raw_content || msg.content) : getDeAnonymizedContent(msg.content, messages)); toast.success(lang === 'fr' ? 'Copié' : 'Copied'); }} className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground/60 hover:text-primary transition-colors uppercase bg-muted/30 px-2 py-1 rounded-md">
                                                    <Copy className="h-3 w-3" /> {lang === 'fr' ? 'Copier' : 'Copy'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center text-center py-20 gap-4 max-w-lg mx-auto">
                                <Shield className="w-16 h-16 text-primary mb-2 opacity-50" />
                                <h1 className="text-3xl font-black tracking-tight text-foreground">{t.chatbot?.title || "Assistant"}</h1>
                                <p className="text-muted-foreground font-medium">{t.chatbot?.subtitle || "Vos données sont sécurisées."}</p>
                            </div>
                        )}
                    </div>
                </ScrollArea>

                <div className="p-4 lg:p-6 bg-gradient-to-t from-background via-background/80 to-transparent shrink-0">
                    <div className="max-w-4xl mx-auto relative cursor-text">
                        <div className="relative bg-background/50 backdrop-blur-2xl border border-border rounded-2xl shadow-xl overflow-hidden focus-within:border-primary/50 transition-all">
                            <div className="p-4 px-5 flex items-start gap-3">
                                <textarea
                                    ref={textareaRef}
                                    className="flex-1 min-h-[40px] max-h-[200px] text-[15px] leading-relaxed bg-transparent border-none outline-none resize-none placeholder:text-muted-foreground/50"
                                    placeholder={t.chatbot?.placeholder || "Message..."}
                                    rows={1}
                                    value={input}
                                    onChange={(e) => {
                                        setInput(e.target.value);
                                        e.target.style.height = 'auto';
                                        e.target.style.height = `${e.target.scrollHeight}px`;
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            if (input.trim() || attachedFiles.length > 0) { e.preventDefault(); handleSend(); } else e.preventDefault();
                                        }
                                    }}
                                />
                                <button
                                    onClick={isStreaming ? handleStopStreaming : handleSend}
                                    disabled={(!isStreaming && !input.trim() && !attachedFiles.length) || (isLoading && !isStreaming)}
                                    className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 self-end transition-all", (isStreaming || input.trim() || attachedFiles.length) ? "bg-primary text-primary-foreground shadow-md" : "bg-muted text-muted-foreground opacity-50")}
                                >
                                    {isStreaming ? <Square size={16} fill="currentColor" /> : (isLoading || isDetecting) ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send size={18} />}
                                </button>
                            </div>
                            
                            {attachedFiles.length > 0 && (
                                <div className="flex flex-wrap gap-2 px-5 pb-3">
                                    {attachedFiles.map((file, i) => (
                                        <div key={i} className="flex items-center gap-2 pl-2.5 pr-1.5 h-8 rounded-xl bg-background border border-border">
                                            <FileText className="h-3.5 w-3.5 text-primary/70" />
                                            <span className="text-[10px] font-bold max-w-[100px] truncate">{file.name}</span>
                                            <Button variant="ghost" size="icon" className="h-5 w-5 rounded-lg" onClick={() => setAttachedFiles(prev => prev.filter((_, idx) => idx !== i))}>
                                                <X className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="p-3 px-5 border-t border-border/10 flex items-center justify-between bg-muted/10">
                                <div className="flex gap-4">
                                    <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground font-medium">
                                        <Paperclip size={16} /> <span className="hidden sm:inline">{lang === 'fr' ? 'Fichiers' : 'Files'}</span>
                                    </button>
                                    <input type="file" ref={fileInputRef} className="hidden" multiple onChange={(e) => {
                                        if (e.target.files) setAttachedFiles(prev => [...prev, ...Array.from(e.target.files as FileList)]);
                                    }} />
                                </div>
                                <div>
                                    <Menubar className="border-none bg-transparent h-auto p-0">
                                        <MenubarMenu>
                                            <MenubarTrigger className="gap-2 px-3 py-1.5 rounded-lg text-xs font-bold bg-muted/50 cursor-pointer">
                                                <Sparkles size={14} className="text-primary"/> {aiConfig.model} <ChevronDown size={14}/>
                                            </MenubarTrigger>
                                            <MenubarContent align="end" className="w-56 rounded-xl">
                                                {aiProviders.map(p => (
                                                    <MenubarSub key={p.id}>
                                                        <MenubarSubTrigger className="rounded-lg">{p.name}</MenubarSubTrigger>
                                                        <MenubarPortal>
                                                            <MenubarSubContent>
                                                                {p.models.map(m => (
                                                                    <MenubarItem key={m.id} className="rounded-lg cursor-pointer" onClick={() => setAiConfig({ ...aiConfig, provider: p.id, model: m.id })}>
                                                                        {m.name} {aiConfig.model === m.id && <Check className="h-3 w-3 ml-2 text-primary"/>}
                                                                    </MenubarItem>
                                                                ))}
                                                            </MenubarSubContent>
                                                        </MenubarPortal>
                                                    </MenubarSub>
                                                ))}
                                            </MenubarContent>
                                        </MenubarMenu>
                                    </Menubar>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* PII Sidebar */}
            {piiOpen && (
                <div className="fixed inset-0 z-50 bg-background flex flex-col xl:relative xl:w-80 xl:inset-auto xl:z-10 xl:border-l border-border shrink-0 transition-all duration-300">
                    <div className="flex items-center justify-between p-4 border-b">
                        <h3 className="font-bold flex items-center gap-2"><Shield className="h-4 w-4 text-primary" /> {t.chatbot?.piiPanel?.title || "Entités"}</h3>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setPiiOpen(false)}>
                            <ChevronRight className="h-5 w-5" />
                        </Button>
                    </div>
                    <div className="p-4 border-b">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder={t.chatbot?.piiPanel?.search || "Search..."} className="h-9 pl-9 rounded-xl" value={piiSearch} onChange={(e) => setPiiSearch(e.target.value)} />
                        </div>
                    </div>
                    <ScrollArea className="flex-1 p-4">
                        <div className="space-y-3">
                            {filteredPiis.length > 0 ? filteredPiis.map((pii, i) => (
                                <div key={i} className="p-3.5 rounded-xl bg-card border border-border/50">
                                    <div className="flex items-center justify-between gap-2 mb-2">
                                        <Badge className={cn("text-[10px] font-black uppercase", getPiiColor(pii.type))}>{getPiiLabel(pii.type)}</Badge>
                                        {pii.locked ? <Unlock className="h-3.5 w-3.5 text-emerald-500"/> : <Lock className="h-3.5 w-3.5 text-muted-foreground/50"/>}
                                    </div>
                                    <p className="text-xs font-bold break-all">{pii.value}</p>
                                </div>
                            )) : (
                                <div className="text-center py-12 opacity-50">
                                    <Shield className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
                                    <p className="text-xs font-bold uppercase">{t.chatbot?.piiPanel?.noEntities || "Aucune entité"}</p>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </div>
            )}
        </div>
    )
}
