"use client";

import { useApp } from "@/lib/store";
import { translations } from "@/lib/translations";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Activity, Key, Tags, MessageSquare, ShieldCheck, Database, Zap, Rocket, TrendingUp, ArrowRight, LayoutDashboard, BookOpen } from "lucide-react";

export function OverviewSection() {
    const { lang, user, apiKeys, detectionStats, userConsumption, openRouterKeyInfo, setActiveView } = useApp();
    const t = translations[lang];

    const isTokenBased = userConsumption?.type === 'token' || !!openRouterKeyInfo;
    
    // For OpenRouter, true usage is often represented by limit - limit_remaining if limit_remaining is precise
    // The user instructed: limit=100, limit_remaining=74.5, usage=0 will be the user consumption.
    // So we use OpenRouter data if available. 
    const isOpenRouter = !!openRouterKeyInfo;
    const usageValue = isOpenRouter 
        ? ((openRouterKeyInfo.limit && openRouterKeyInfo.limit_remaining != null ? openRouterKeyInfo.limit - openRouterKeyInfo.limit_remaining : openRouterKeyInfo.usage || 0) * 100)
        : (isTokenBased ? userConsumption?.usage : apiKeys.reduce((acc, k) => acc + k.request_count, 0));
        
    const usageLimit = isOpenRouter 
        ? (openRouterKeyInfo.limit * 100)
        : (isTokenBased ? userConsumption?.limit : (user?.user_plan?.request_limit || 50));
        
    const usageLabel = isOpenRouter ? "Crédits" : (isTokenBased ? (lang === 'fr' ? 'Tokens' : 'Tokens') : t.overview.apiUsage.requests);

    const stats = [
        { title: t.overview.stats.apiRequests, value: detectionStats.requests.toLocaleString(), change: `${detectionStats.requestsChange >= 0 ? '+' : ''}${detectionStats.requestsChange}%`, trend: detectionStats.requestsChange >= 0 ? "up" : "down", icon: Activity, color: "text-foreground", bg: "bg-muted/50" },
        { title: t.overview.stats.detectedEntities, value: detectionStats.total.toLocaleString(), change: `${detectionStats.change >= 0 ? '+' : ''}${detectionStats.change}%`, trend: detectionStats.change >= 0 ? "up" : "down", icon: Tags, color: "text-foreground", bg: "bg-muted/50" },
        { 
            title: isOpenRouter ? (lang === 'fr' ? "Crédits Consommés" : "Credits Consumed") : (isTokenBased ? (lang === 'fr' ? "Consommation" : "Consumption") : (lang === 'fr' ? "Requêtes" : "Requests")), 
            value: isOpenRouter ? (usageValue || 0).toLocaleString(undefined, { maximumFractionDigits: 1 }) : usageValue?.toLocaleString() || "0", 
            change: `/ ${isOpenRouter ? (usageLimit ? usageLimit.toLocaleString(undefined, { maximumFractionDigits: 0 }) : "∞") : usageLimit?.toLocaleString() || "∞"}`, 
            trend: "up", 
            icon: Zap, color: "text-foreground", bg: "bg-muted/50" 
        },
        { 
            title: t.overview.stats.plan, 
            value: user?.stripe_status === 'trialing' ? "TRIAL" : (user?.user_plan?.name?.toUpperCase() || "FREE"), 
            change: user?.stripe_status === 'trialing' 
                ? (user.stripe_period_end ? (lang === 'fr' ? `Expire le ${new Date(user.stripe_period_end).toLocaleDateString()}` : `Expires ${new Date(user.stripe_period_end).toLocaleDateString()}`) : "Active")
                : "Active", 
            trend: "up", 
            icon: Rocket, 
            color: "text-foreground", 
            bg: "bg-muted/50" 
        },
    ];

    const recentActivity = [
        { type: "api", message: lang === 'fr' ? "Requête d'extraction effectuée" : "Extraction request performed", time: lang === 'fr' ? "À l'instant" : "Just now" },
        { type: "detection", message: `${detectionStats.total.toLocaleString()} ${lang === 'fr' ? 'entités anonymisées' : 'entities anonymized'}`, time: lang === 'fr' ? "À l'instant" : "Just now" },
        { type: "chatbot", message: "Session chatbot terminee", time: "Il y a 1 heure" },
        { type: "api", message: "Limite API augmentee", time: "Il y a 3 heures" },
    ];

    return (
        <div className="flex-1 p-6 lg:p-10 overflow-y-auto">
            <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-black tracking-tighter bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                        {t.overview.title}
                    </h1>
                    <p className="text-muted-foreground text-sm font-medium">
                        {t.overview.subtitle}
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {stats.map((stat, i) => (
                        <Card key={i} className="group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border-border/50 bg-card shadow-sm relative overflow-hidden ring-1 ring-border/50">
                            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{stat.title}</CardTitle>
                                <div className={`p-2 rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:shadow-md ${stat.bg}`}>
                                    <stat.icon className={`h-4 w-4 ${stat.color}`} />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-black tracking-tighter mb-1 transition-all group-hover:scale-[1.02] origin-left">{stat.value}</div>
                                <div className="flex items-center gap-1.5 mt-2">
                                    <div className={`flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold shadow-sm transition-transform hover:scale-110 ${stat.trend === "up" ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" : "bg-rose-500/10 text-rose-600 border border-rose-500/20"}`}>
                                        <TrendingUp className="h-2.5 w-2.5" />
                                        {stat.change} {lang === 'fr' ? "ce mois" : "this month"}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    <Card className="border-none shadow-sm bg-card ring-1 ring-border/50">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg font-bold text-primary">{t.overview.quickActions.title}</CardTitle>
                            <CardDescription>{t.overview.quickActions.subtitle}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-3 mt-2">
                                {[
                                    { id: "chatbot", label: t.overview.quickActions.openChatbot, icon: MessageSquare },
                                    { id: "entity-detection", label: t.overview.quickActions.detectEntities, icon: Tags },
                                    { id: "api-keys", label: t.overview.quickActions.manageApiKeys, icon: Key },
                                    { id: "api-docs", label: t.sidebar.documentation, icon: BookOpen },
                                ].map((action) => (
                                    <button
                                        key={action.id}
                                        className="h-auto p-4 flex flex-col gap-2 items-center text-center hover:bg-foreground hover:text-background transition-all hover:scale-[1.02] active:scale-[0.98] border border-dashed border-border/50 shadow-sm group rounded-2xl"
                                        onClick={() => setActiveView(action.id as any)}
                                    >
                                        <action.icon className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                                        <span className="text-[11px] font-bold">{action.label}</span>
                                    </button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm bg-card ring-1 ring-border/50">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div>
                                <CardTitle className="text-lg font-bold">{t.overview.recentActivity.title}</CardTitle>
                                <CardDescription>{t.overview.recentActivity.subtitle}</CardDescription>
                            </div>
                            <button className="h-8 px-3 text-xs text-primary font-bold hover:bg-primary/10 rounded-lg transition-colors">{t.overview.recentActivity.viewAll}</button>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {recentActivity.map((activity, index) => (
                                    <div key={index} className="flex items-center gap-4 group p-3 rounded-2xl hover:bg-muted/50 transition-all duration-300 cursor-pointer border border-transparent hover:border-border/50">
                                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-background shadow-sm border border-border/50 shrink-0 group-hover:scale-110 group-hover:shadow-md transition-all duration-300">
                                            {activity.type === "api" && <Key className="h-5 w-5 text-muted-foreground" />}
                                            {activity.type === "detection" && <Tags className="h-5 w-5 text-muted-foreground" />}
                                            {activity.type === "chatbot" && <MessageSquare className="h-5 w-5 text-muted-foreground" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold truncate group-hover:text-primary transition-colors">{activity.message}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                                                    <Activity className="h-2.5 w-2.5" /> {activity.time}
                                                </span>
                                            </div>
                                        </div>
                                        <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-all duration-300" />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

