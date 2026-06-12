"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { isTauriRuntime } from "@/lib/platform";

export type ViewType = "overview" | "chatbot" | "api-keys" | "entity-detection" | "api-docs" | "profile" | "desktop";

interface DetectionStats {
    total: number;
    change: number;
    requests: number;
    requestsChange: number;
    currentMonthRequests: number;
    daily_usage: any[];
}

interface AppState {
    activeView: ViewType;
    setActiveView: (view: ViewType) => void;
    lang: 'fr' | 'en';
    setLang: (lang: 'fr' | 'en') => void;
    user: any;
    setUser: (user: any) => void;
    apiKeys: any[];
    setApiKeys: React.Dispatch<React.SetStateAction<any[]>>;
    userConsumption: any;
    openRouterKeyInfo: any;
    detectionStats: DetectionStats;
    setDetectionStats: React.Dispatch<React.SetStateAction<DetectionStats>>;
    isAuthenticating: boolean;
    refreshData: () => Promise<void>;
}

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
    const router = useRouter();
    const [activeView, _setActiveView] = useState<ViewType>("overview");
    const [lang, setLang] = useState<'fr' | 'en'>('fr');

    const validViews: ViewType[] = ["overview", "chatbot", "api-keys", "entity-detection", "api-docs", "profile", "desktop"];

    const setActiveView = (view: ViewType) => {
        if (typeof window !== "undefined") {
            window.location.hash = view;
            if (window.history.state?.view !== view) {
                window.history.pushState({ view }, "");
            }
        }
        _setActiveView(view);
    };

    useEffect(() => {
        if (typeof window !== "undefined") {
            const hash = window.location.hash.replace('#', '');
            if (hash && validViews.includes(hash as ViewType)) {
                _setActiveView(hash as ViewType);
                if (!window.history.state?.view) {
                    window.history.replaceState({ view: hash }, "");
                }
            } else if (!window.history.state?.view) {
                window.history.replaceState({ view: activeView }, "");
            }
        }

        const handlePopState = (e: PopStateEvent) => {
            if (e.state && e.state.view) {
                _setActiveView(e.state.view);
            }
        };

        const handleHashChange = () => {
            const hash = window.location.hash.replace('#', '');
            if (hash && validViews.includes(hash as ViewType)) {
                _setActiveView(hash as ViewType);
            }
        };

        window.addEventListener("popstate", handlePopState);
        window.addEventListener("hashchange", handleHashChange);
        return () => {
            window.removeEventListener("popstate", handlePopState);
            window.removeEventListener("hashchange", handleHashChange);
        };
    }, []);
    
    // Global User State
    const [user, setUser] = useState<any>(null);
    const [isAuthenticating, setIsAuthenticating] = useState(true);
    const [apiKeys, setApiKeys] = useState<any[]>([]);
    const [userConsumption, setUserConsumption] = useState<any>(null);
    const [openRouterKeyInfo, setOpenRouterKeyInfo] = useState<any>(null);
    const [detectionStats, setDetectionStats] = useState<DetectionStats>({
        total: 0,
        change: 0,
        requests: 0,
        requestsChange: 0,
        currentMonthRequests: 0,
        daily_usage: []
    });

    const refreshData = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            // App desktop : pas de login imposé, on reste sur le chat sans rediriger.
            if (isTauriRuntime()) {
                setIsAuthenticating(false);
                return;
            }
            router.push('/login');
            return;
        }

        try {
            const [userRes, apiKeysRes, statsRes, consumptionRes, openRouterRes] = await Promise.all([
                api.get('/auth/me'),
                api.get('/api-keys/'),
                api.get('/pii/stats'),
                api.get('/auth/me/consumption'),
                api.get('/auth/me/openrouter-key-info').catch(() => ({ data: null }))
            ]);
            
            setUser(userRes.data);
            setApiKeys(apiKeysRes.data);
            setUserConsumption(consumptionRes.data);
            setOpenRouterKeyInfo(openRouterRes.data?.data || openRouterRes.data);
            setDetectionStats({
                total: statsRes.data.total_entities,
                change: statsRes.data.entities_change_percentage,
                requests: statsRes.data.total_requests,
                requestsChange: statsRes.data.requests_change_percentage,
                currentMonthRequests: statsRes.data.current_month_requests,
                daily_usage: statsRes.data.daily_usage || []
            });
            setIsAuthenticating(false);
        } catch (err) {
            console.error("Data fetching failed", err);
        }
    };

    useEffect(() => {
        refreshData();
    }, []);

    return (
        <AppContext.Provider value={{
            activeView, setActiveView,
            lang, setLang,
            user, setUser,
            apiKeys, setApiKeys,
            userConsumption,
            openRouterKeyInfo,
            detectionStats, setDetectionStats,
            isAuthenticating,
            refreshData
        }}>
            {children}
        </AppContext.Provider>
    );
}

export function useApp() {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error("useApp must be used within an AppProvider");
    }
    return context;
}
