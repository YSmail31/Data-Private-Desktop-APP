"use client"

import * as React from "react"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
    SidebarSeparator,
    useSidebar,
} from "@/components/ui/sidebar"
import {
    LayoutDashboard,
    Key,
    Tags,
    MessageSquare,
    FileText,
    Monitor,
    Smartphone,
    Box,
    Cpu,
    Sun,
    Moon,
    PanelLeftIcon,
    ChevronLeft,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Button } from "./ui/button"

export function AppSidebar({
    t,
    activeTab,
    setActiveTab,
    isDark,
    setIsDark
}: {
    t: any,
    activeTab: string,
    setActiveTab: (tab: any) => void,
    isDark: boolean,
    setIsDark: (dark: boolean) => void
}) {
    const { isMobile, setOpenMobile } = useSidebar()

    const handleNavigation = (tab: string) => {
        setActiveTab(tab)
        if (isMobile) {
            setOpenMobile(false)
        }
    }

    return (
        <Sidebar collapsible="icon" className="border-r bg-background">
            <SidebarHeader className="h-16 flex flex-row items-center px-4 bg-background shrink-0 overflow-hidden border-b justify-between">
                <div
                    className="flex items-center gap-3 px-2 group cursor-pointer transition-all hover:opacity-80"
                    onClick={() => handleNavigation("overview")}
                >
                    <div className="w-8 h-8 shrink-0 flex items-center justify-center">
                        <img src="/dark.svg" alt="Logo" className="w-full h-full object-contain dark:hidden" />
                        <img src="/light.svg" alt="Logo" className="w-full h-full object-contain hidden dark:block" />
                    </div>
                    <span className="font-bold text-xl tracking-tight truncate group-data-[collapsible=icon]:hidden animate-in fade-in duration-500">
                        Data Private
                    </span>
                    <span className="ml-auto text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">Beta</span>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 lg:hidden "
                    onClick={() => setOpenMobile(false)}
                >
                    <ChevronLeft className="h-5 w-5 " />
                </Button>
            </SidebarHeader>

            {/* <SidebarSeparator /> */}

            <SidebarContent className="overflow-x-hidden overflow-y-auto bg-background [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
                <SidebarGroup>
                    <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-wider px-4 mb-2">
                        {t.sidebar.principal}
                    </SidebarGroupLabel>
                    <SidebarMenu className="px-2 space-y-1">
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

                <SidebarSeparator className="my-2 w-80% opacity-50" />
                <SidebarGroup>
                    <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-wider px-4 mb-2">
                        {t.sidebar.dev}
                    </SidebarGroupLabel>
                    <SidebarMenu className="px-2 space-y-1">
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

                <SidebarSeparator className="my-2 w-80% opacity-50" />
                <SidebarGroup>
                    <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-wider px-4 mb-2">
                        {t.sidebar.applications}
                    </SidebarGroupLabel>
                    <SidebarMenu className="px-2 space-y-1">
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

                <SidebarSeparator className="my-2 w-80% opacity-50" />

                <SidebarGroup>
                    <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-wider px-4 mb-2">
                        {t.sidebar.infrastructure}
                    </SidebarGroupLabel>
                    <SidebarMenu className="px-2 space-y-1">
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
            </SidebarContent>

            <SidebarFooter className="p-4 border-t bg-background transition-colors group-data-[collapsible=icon]:p-2">
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
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
