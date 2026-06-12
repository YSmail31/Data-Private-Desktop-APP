"use client";

import * as React from "react";
import { useApp } from "@/lib/store";
import { getInitials, translations } from "@/lib/translations";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import {
    LayoutDashboard,
    MessageSquare,
    Key,
    Tags,
    FileText,
    Monitor,
    Smartphone,
    Box,
    Cpu,
    Sun,
    Moon,
    LogOut
} from "lucide-react";
import {
    Sidebar as SidebarRoot,
    SidebarContent,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarSeparator,
    SidebarFooter,
    SidebarHeader,
    useSidebar,
} from "@/components/ui/sidebar";
import { AvatarFallback, Avatar } from "../ui/avatar";

export function Sidebar() {
    const { lang, activeView, setActiveView } = useApp();
    const t = translations[lang] || translations.en;
    const { state } = useSidebar();
    const [isDark, setIsDark] = React.useState(false);
    const [user, setUser] = React.useState<any>(null)


    React.useEffect(() => {
        const isDarkMode = document.documentElement.classList.contains("dark");
        setIsDark(isDarkMode);
    }, []);

    React.useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    }, [isDark]);

    React.useEffect(() => {
        const fetchUser = async () => {
            try {
                const [userRes] = await Promise.all([
                    api.get('/auth/me'),
                    api.get('/api-keys/'),
                    api.get('/pii/'),
                    api.get('/pii/stats'),
                    api.get('/chatbot/sessions'),
                    api.get('/chatbot-config/'),
                    api.get('/auth/me/consumption')
                ]);
                setUser(userRes.data);
            } catch (err) {
                console.error("Failed to fetch user data", err);
            }
        };
        fetchUser();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        window.location.href = "/login";
    };

    const handleNavigation = (view: any) => {
        setActiveView(view);
    };

    const activeTab = activeView;

    // const getInitials = (name: string) => {
    //     if (!name) return "U"
    //     const parts = name.trim().split(/\s+/)
    //     if (parts.length === 1) return parts[0].substring(0, 1).toUpperCase()
    //     return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    // }

    return (
        <SidebarRoot collapsible="icon" className="border-r border-border transition-all duration-300">
            <SidebarHeader className="flex items-center p-4 border-b border-border/50 bg-background/20">
                <div className="flex items-center gap-3 overflow-hidden">
                    <div className="flex items-center gap-3">
                        <img src={`/${!isDark ? "dark" : "light"}.svg`} width="28px" />
                        <span className="font-bold text-xl text-primary">Data Private</span>
                        <span className="ml-auto text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">Beta</span>
                    </div>
                </div>
            </SidebarHeader>

            <SidebarContent className="overflow-x-hidden overflow-y-auto bg-background/20 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
                <SidebarGroup>
                    <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-wider px-4 mb-2">
                        {t.sidebar.principal}
                    </SidebarGroupLabel>
                    <SidebarMenu className="px-3 space-y-1">
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                isActive={activeTab === "overview"}
                                onClick={() => handleNavigation("overview")}
                                tooltip={t.sidebar.overview}
                                className={cn(
                                    "transition-all duration-200",
                                    activeTab === "overview" && "bg-primary/10 text-primary font-bold shadow-sm"
                                )}
                            >
                                <LayoutDashboard className={cn("w-4 h-4", activeTab === "overview" && "text-primary")} />
                                <span className="text-sm">{t.sidebar.overview}</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                isActive={activeTab === "chatbot"}
                                onClick={() => handleNavigation("chatbot")}
                                tooltip={t.sidebar.chatbot}
                                className={cn(
                                    "transition-all duration-200",
                                    activeTab === "chatbot" && "bg-primary/10 text-primary font-bold shadow-sm"
                                )}
                            >
                                <MessageSquare className={cn("w-4 h-4", activeTab === "chatbot" && "text-primary")} />
                                <span className="text-sm">{t.sidebar.chatbot}</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroup>

                {/* <SidebarSeparator className="w-80% opacity-50" /> */}
                <SidebarGroup>
                    <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-wider px-4 mb-2">
                        {t.sidebar.dev}
                    </SidebarGroupLabel>
                    <SidebarMenu className="px-3 space-y-1">
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                isActive={activeTab === "api-keys"}
                                onClick={() => handleNavigation("api-keys")}
                                tooltip={t.sidebar.apiKeys}
                                className={cn(
                                    "transition-all duration-200",
                                    activeTab === "api-keys" && "bg-primary/10 text-primary font-bold shadow-sm"
                                )}
                            >
                                <Key className={cn("w-4 h-4", activeTab === "api-keys" && "text-primary")} />
                                <span className="text-sm">{t.sidebar.apiKeys}</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                isActive={activeTab === "entity-detection"}
                                onClick={() => handleNavigation("entity-detection")}
                                tooltip={t.sidebar.entityDetection}
                                className={cn(
                                    "transition-all duration-200",
                                    activeTab === "entity-detection" && "bg-primary/10 text-primary font-bold shadow-sm"
                                )}
                            >
                                <Tags className={cn("w-4 h-4", activeTab === "entity-detection" && "text-primary")} />
                                <span className="text-sm">{t.sidebar.entityDetection}</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                isActive={activeTab === "api-docs"}
                                onClick={() => handleNavigation("api-docs")}
                                tooltip={t.sidebar.documentation}
                                className={cn(
                                    "transition-all duration-200",
                                    activeTab === "api-docs" && "bg-primary/10 text-primary font-bold shadow-sm"
                                )}
                            >
                                <FileText className={cn("w-4 h-4", activeTab === "api-docs" && "text-primary")} />
                                <span className="text-sm">{t.sidebar.documentation}</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroup>

                {/* <SidebarSeparator className="w-80% opacity-50" /> */}
                <SidebarGroup>
                    <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-wider px-4 mb-2">
                        {t.sidebar.applications}
                    </SidebarGroupLabel>
                    <SidebarMenu className="px-3 space-y-1">
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                isActive={activeTab === "desktop"}
                                onClick={() => handleNavigation("desktop")}
                                tooltip={t.sidebar.desktop}
                                className={cn(
                                    "transition-all duration-200",
                                    activeTab === "desktop" && "bg-primary/10 text-primary font-bold shadow-sm"
                                )}
                            >
                                <Monitor className={cn("w-4 h-4", activeTab === "desktop" && "text-primary")} />
                                <span className="text-sm">{t.sidebar.desktop}</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton disabled className="opacity-50 cursor-not-allowed" tooltip={t.sidebar.comingSoon}>
                                <Smartphone className="w-4 h-4 text-muted-foreground/50" />
                                <span className="text-sm">{t.sidebar.mobile}</span>
                                <Badge variant="outline" className="ml-auto text-[7px] px-1.5 h-3.5 bg-muted/30 text-muted-foreground/40 border-border/30 font-black uppercase tracking-tighter group-data-[collapsible=icon]:hidden">
                                    {t.sidebar.comingSoon}
                                </Badge>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton disabled className="opacity-50 cursor-not-allowed" tooltip={t.sidebar.comingSoon}>
                                <img src="/microsoft-word-document-file-icon.svg" alt="word" className="w-4 h-4 text-muted-foreground/50 invert-0 dark:invert" />
                                <span className="text-sm">{t.sidebar.word}</span>
                                <Badge variant="outline" className="ml-auto text-[7px] px-1.5 h-3.5 bg-muted/30 text-muted-foreground/40 border-border/30 font-black uppercase tracking-tighter group-data-[collapsible=icon]:hidden">
                                    {t.sidebar.comingSoon}
                                </Badge>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton className="opacity-50 cursor-not-allowed" tooltip={t.sidebar.comingSoon}>
                                <img src="/n8n_logo.svg" alt="n8n" className="w-4 h-4 invert-0 dark:invert" />
                                <span className="text-sm">{t.sidebar.n8n}</span>
                                <Badge variant="outline" className="ml-auto text-[7px] px-1.5 h-3.5 bg-muted/30 text-muted-foreground/40 border-border/30 font-black uppercase tracking-tighter group-data-[collapsible=icon]:hidden">
                                    {t.sidebar.comingSoon}
                                </Badge>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroup>

                {/* <SidebarSeparator className="w-80% opacity-50" /> */}
                <SidebarGroup>
                    <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-wider px-4 mb-2">
                        {t.sidebar.infrastructure}
                    </SidebarGroupLabel>
                    <SidebarMenu className="px-3 space-y-1">
                        <SidebarMenuItem>
                            <SidebarMenuButton disabled className="opacity-50 cursor-not-allowed" tooltip={t.sidebar.comingSoon}>
                                <Box className="w-4 h-4 text-muted-foreground/50" />
                                <span className="text-sm">{t.sidebar.docker}</span>
                                <Badge variant="outline" className="ml-auto text-[7px] px-1.5 h-3.5 bg-muted/30 text-muted-foreground/40 border-border/30 font-black uppercase tracking-tighter group-data-[collapsible=icon]:hidden">
                                    {t.sidebar.comingSoon}
                                </Badge>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarMenuButton disabled className="opacity-50 cursor-not-allowed" tooltip={t.sidebar.comingSoon}>
                                <Cpu className="w-4 h-4 text-muted-foreground/50" />
                                <span className="text-sm">{t.sidebar.hardware}</span>
                                <Badge variant="outline" className="ml-auto text-[7px] px-1.5 h-3.5 bg-muted/30 text-muted-foreground/40 border-border/30 font-black uppercase tracking-tighter group-data-[collapsible=icon]:hidden">
                                    {t.sidebar.comingSoon}
                                </Badge>
                            </SidebarMenuButton>
                        </SidebarMenuItem>

                    </SidebarMenu>
                </SidebarGroup>

                <div className="px-4 py-2 mt-auto">
                    <div className="flex items-center bg-muted/50 rounded-xl p-1 shadow-inner border border-border/50 group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:gap-1">
                        <button
                            onClick={() => setIsDark(false)}
                            className={cn(
                                "flex-1 h-8 flex items-center justify-center text-[11px] rounded-lg transition-all duration-300",
                                !isDark ? "bg-background shadow-sm font-bold text-primary" : "text-muted-foreground hover:bg-muted/80"
                            )}
                            title={t.sidebar.light}
                        >
                            <Sun className={cn("w-3.5 h-3.5", !isDark && "text-primary")} />
                            <span className="ml-1.5 font-bold group-data-[collapsible=icon]:hidden animate-in fade-in slide-in-from-left-2 duration-300">{t.sidebar.light}</span>
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
                            <span className="ml-1.5 font-bold group-data-[collapsible=icon]:hidden animate-in fade-in slide-in-from-left-2 duration-300">{t.sidebar.dark}</span>
                        </button>
                    </div>
                </div>
            </SidebarContent>

            <SidebarFooter className="p-2 border-t bg-background/20 transition-colors group-data-[collapsible=icon]:p-2 flex flex-col gap-2">
                <div className="flex flex-row items-center gap-2 cursor-pointer hover:bg-background p-2 rounded-xl" onClick={() => handleNavigation("profile")}>
                    <div className="relative group shrink-0">
                        <Avatar className="h-10 w-10 hover:ring-2 ring-primary/20 transition-all border border-border/50 shadow-sm">
                            <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold uppercase">{getInitials(user?.full_name)}</AvatarFallback>
                        </Avatar>
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                    </div>
                    <div className="flex flex-col min-w-0 group-data-[collapsible=icon]:hidden animate-in fade-in slide-in-from-left-2 duration-300">
                        <span className="text-sm font-bold text-foreground truncate">{user?.full_name}</span>
                        <span className="text-[12px] text-muted-foreground truncate">{user?.email}</span>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 h-9 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-all group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
                    onClick={handleLogout}
                >
                    <LogOut className="w-4 h-4" />
                    <span className="text-xs font-bold group-data-[collapsible=icon]:hidden">{lang === 'fr' ? 'Déconnexion' : 'Logout'}</span>
                </Button>
            </SidebarFooter>
        </SidebarRoot>
    );
}