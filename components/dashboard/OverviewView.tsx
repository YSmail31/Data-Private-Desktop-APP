import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  Activity, Tags, MessageSquare, Shield, TrendingUp, ArrowRight,
  Database, Key, LayoutDashboard, Sparkles, Bot, Zap, Box, ShieldCheck, Lock, Eye
} from "lucide-react"

interface OverviewViewProps {
  t: any
  lang: string
  stats: any[]
  dashboardStats: string[]
  apiKeys: any[]
  user: any
  recentActivity: any[]
  setActiveTab: (tab: any) => void
  detectionStats: any
  userConsumption: any
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  t,
  lang,
  stats,
  dashboardStats,
  apiKeys,
  user,
  recentActivity,
  setActiveTab,
  detectionStats,
  userConsumption
}) => {
  const isTokenBased = userConsumption?.type === 'token';
  const usageValue = isTokenBased ? userConsumption?.usage : apiKeys.reduce((acc, k) => acc + k.request_count, 0);
  const usageLimit = isTokenBased ? userConsumption?.limit : (user?.user_plan?.request_limit || 50);
  const usageLabel = isTokenBased ? (lang === 'fr' ? 'Tokens' : 'Tokens') : t.overview.apiUsage.requests;
  const usagePercent = Math.min(100, Math.max(0, (usageValue / (usageLimit || 1)) * 100));

  return (
    <ScrollArea className="flex-1 p-4 lg:p-8 bg-muted/30">
      <div className="max-w-7xl mx-auto space-y-8 animate-reveal">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-black tracking-tighter bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            {t.overview.title}
          </h1>
          <p className="text-muted-foreground text-sm font-medium">
            {t.overview.subtitle}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => {
            const statTitle = dashboardStats[i]
            return (
              <Card key={stat.title} className="group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border-none bg-card shadow-sm relative overflow-hidden ring-1 ring-border/50 animate-reveal" style={{ animationDelay: `${i * 100}ms` }}>
                <div className={cn("absolute top-0 left-0 w-1 h-full opacity-0 group-hover:opacity-100 transition-opacity", stat.bg.replace('/10', ''))} />
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{statTitle}</CardTitle>
                  <div className={cn("p-2 rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:shadow-md", stat.bg)}>
                    <stat.icon className={cn("h-4 w-4", stat.color)} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-black tracking-tighter mb-1 transition-all group-hover:scale-[1.02] origin-left">{stat.value}</div>
                  <div className="flex items-center gap-1.5 mt-2">
                    <div className={cn("flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold shadow-sm transition-transform hover:scale-110", stat.trend === "up" ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" : "bg-rose-500/10 text-rose-600 border border-rose-500/20")}>
                      <TrendingUp className="h-2.5 w-2.5" />
                      {stat.change} {lang === 'fr' ? "ce mois" : "this month"}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-none shadow-sm bg-card ring-1 ring-border/50 animate-reveal" style={{ animationDelay: '400ms' }}>
            <CardHeader>
              <div>
                <CardTitle className="text-lg font-bold">{t.overview.apiUsage.title}</CardTitle>
                <CardDescription>{t.overview.apiUsage.subtitle}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-foreground" />
                    <span className="font-semibold">{usageLabel}</span>
                  </div>
                  <span className="font-bold">
                    {usageValue?.toLocaleString()}{" "}
                    <span className="text-muted-foreground font-medium">/ {usageLimit?.toLocaleString() || "∞"}</span>
                  </span>
                </div>
                <Progress
                  value={usagePercent}
                  className="h-2 bg-muted/50 overflow-hidden"
                />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-foreground" />
                    <span className="font-semibold">{t.overview.apiUsage.storage}</span>
                  </div>
                  <span className="font-bold">2.4 GB <span className="text-muted-foreground font-medium">/ 10 GB</span></span>
                </div>
                <Progress value={24} className="h-2 bg-muted/50 overflow-hidden" />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Key className="h-4 w-4 text-foreground" />
                    <span className="font-semibold">{t.overview.apiUsage.activeKeys}</span>
                  </div>
                  <span className="font-bold">{apiKeys.filter(k => k.is_active).length} <span className="text-muted-foreground font-medium">/ 10</span></span>
                </div>
                <Progress value={apiKeys.filter(k => k.is_active).length * 10} className="h-2 bg-muted/50 overflow-hidden" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-card ring-1 ring-border/50 animate-reveal" style={{ animationDelay: '500ms' }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold text-primary">{t.overview.quickActions.title}</CardTitle>
              <CardDescription>{t.overview.quickActions.subtitle}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 mt-2">
                {[
                  { id: "overview", label: t.sidebar.overview, icon: LayoutDashboard },
                  { id: "api-keys", label: t.overview.quickActions.manageApiKeys, icon: Key },
                  { id: "entity-detection", label: t.overview.quickActions.detectEntities, icon: Tags },
                  { id: "chatbot", label: t.overview.quickActions.openChatbot, icon: MessageSquare },
                ].map((action) => (
                  <Button
                    key={action.id}
                    variant="outline"
                    className="h-auto py-4 flex flex-col gap-2 items-center text-center hover:bg-foreground hover:text-background transition-all hover:scale-[1.05] active:scale-[0.95] border-dashed shadow-sm group rounded-2xl"
                    onClick={() => setActiveTab(action.id)}
                  >
                    <action.icon className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                    <span className="text-[11px] font-bold">{action.label}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-card ring-1 ring-border/50 animate-reveal" style={{ animationDelay: '600ms' }}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-lg font-bold">{t.overview.recentActivity.title}</CardTitle>
                <CardDescription>{t.overview.recentActivity.subtitle}</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="h-8 text-xs text-primary font-bold">{t.overview.recentActivity.viewAll}</Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => {
                  const activityMsg = lang === 'fr' ? activity.message : (
                    activity.message === "Requête d'extraction effectuée" ? "Extraction request performed" :
                      activity.message === "Nouvelle cle API creee" ? "New API key created" :
                        activity.message.includes("entites anonymisees") ? `${detectionStats.total.toLocaleString()} entities anonymized` :
                          activity.message === "Session chatbot terminee" ? "Chatbot session ended" :
                            activity.message === "Limite API augmentee" ? "API limit increased" : activity.message
                  )
                  const activityTime = lang === 'fr' ? activity.time : activity.time
                  return (
                    <div key={index} className="flex items-center gap-4 group p-3 rounded-2xl hover:bg-muted/50 transition-all duration-300 cursor-pointer border border-transparent hover:border-border/50" onClick={() => activity.type === "api" ? setActiveTab("api-keys") : activity.type === "chatbot" ? setActiveTab("chatbot") : null}>
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-background shadow-sm border border-border/50 shrink-0 group-hover:scale-110 group-hover:shadow-md transition-all duration-300">
                        {activity.type === "api" && <Key className="h-5 w-5" />}
                        {activity.type === "detection" && <Tags className="h-5 w-5" />}
                        {activity.type === "chatbot" && <MessageSquare className="h-5 w-5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate group-hover:text-primary transition-colors">{activityMsg}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                            <Activity className="h-2.5 w-2.5" /> {activityTime}
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-all duration-300" />
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-none shadow-xl bg-card relative ring-1 ring-border/50 animate-reveal" style={{ animationDelay: '700ms' }}>
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <ShieldCheck className="h-32 w-32 text-foreground animate-float" />
            </div>
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary animate-pulse" />
                {lang === 'fr' ? "Protection & Conformité" : "Protection & Compliance"}
              </CardTitle>
              <CardDescription>{lang === 'fr' ? "Analyse de la sécurité de vos flux" : "Security analysis of your streams"}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: lang === 'fr' ? "Score de Confidentialité" : "Privacy Score", status: "98%", color: "bg-emerald-500", icon: ShieldCheck },
                  { label: lang === 'fr' ? "Risques Identifiés" : "Identified Risks", status: lang === 'fr' ? "0 Critique" : "0 Critical", color: "bg-emerald-500", icon: Activity },
                  { label: lang === 'fr' ? "Conformité RGPD" : "GDPR Compliance", status: lang === 'fr' ? "Conforme" : "Compliant", color: "bg-emerald-500", icon: Lock },
                  { label: lang === 'fr' ? "Audit IA" : "AI Audit", status: lang === 'fr' ? "Activé" : "Enabled", color: "bg-emerald-500", icon: Eye },
                ].map((item, i) => (
                  <div key={i} className="flex flex-col gap-3 p-4 rounded-2xl bg-background border border-border/50 hover:border-primary/30 hover:bg-primary/[0.02] hover:scale-105 transition-all duration-300 group cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="p-2 rounded-lg bg-muted group-hover:bg-primary group-hover:text-white transition-colors">
                        <item.icon className="h-4 w-4 text-muted-foreground group-hover:text-inherit transition-colors" />
                      </div>
                      <span className={cn("w-2 h-2 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse", item.color)} />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1 group-hover:text-primary transition-colors">{item.label}</p>
                      <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] font-bold px-2 py-0">
                        {item.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ScrollArea>
  )
}
