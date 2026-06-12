import * as React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import {
  Shield, LayoutDashboard, Key, Tags, MessageSquare, FileText,
  Smartphone, Monitor, Box, Cpu, Sun, Moon
} from "lucide-react"

interface SidebarProps {
  activeTab: string
  setActiveTab?: (tab: any) => void
  t: any
  isDark: boolean
  toggleDarkMode: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  t,
  isDark,
  toggleDarkMode
}) => {
  const handleTabClick = (tab: string) => {
    if (tab === "api-docs" && window.location.pathname !== "/documentation") {
      window.location.href = "/documentation"
      return
    }
    if (setActiveTab) {
      setActiveTab(tab)
    }
  }

  const NavItem = ({ tab, icon: Icon, label, comingSoon, enterprise }: { tab: string, icon: any, label: string, comingSoon?: boolean, enterprise?: boolean }) => {
    const isActive = activeTab === tab

    if (comingSoon || enterprise) {
      return (
        <div className="flex items-center justify-between px-3 py-2 text-sm text-muted-foreground group cursor-not-allowed opacity-60">
          <div className="flex items-center gap-3">
            <Icon className="w-4 h-4" /> {label}
          </div>
          <Badge variant="outline" className="text-[8px] font-black uppercase px-1.5 h-4 border-muted-foreground/30">
            {comingSoon ? t.sidebar.comingSoon : "Enterprise"}
          </Badge>
        </div>
      )
    }

    const content = (
      <>
        <Icon className="w-4 h-4" /> {label}
      </>
    )

    if (setActiveTab) {
      return (
        <Button
          variant={isActive ? "secondary" : "ghost"}
          className="w-full justify-start gap-3 h-9 text-sm rounded-xl transition-all"
          onClick={() => handleTabClick(tab)}
        >
          {content}
        </Button>
      )
    }

    const href = tab === "api-docs" ? "/documentation" : `/dashboard?tab=${tab}`

    return (
      <Link href={href} className="w-full">
        <Button
          variant={isActive ? "secondary" : "ghost"}
          className="w-full justify-start gap-3 h-9 text-sm rounded-xl transition-all"
        >
          {content}
        </Button>
      </Link>
    )
  }

  return (
    <div className="w-64 bg-sidebar border-r flex flex-col shrink-0 hidden lg:flex">
      <div className="p-6">
        <Link href="/" className="flex items-center gap-3 group">
          <img src="/logo-light.png" width="32px" />
          <span className="font-bold text-xl tracking-tight">Data Private</span>
          <span className="ml-auto text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">Beta</span>
        </Link>
      </div>

      <ScrollArea className="flex-1 px-3">
        <div className="space-y-6">
          <div>
            <div className="px-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">{t.sidebar.principal}</div>
            <div className="space-y-1">
              <NavItem tab="overview" icon={LayoutDashboard} label={t.sidebar.overview} />
              <NavItem tab="api-keys" icon={Key} label={t.sidebar.apiKeys} />
              <NavItem tab="entity-detection" icon={Tags} label={t.sidebar.entityDetection} />
              <NavItem tab="chatbot" icon={MessageSquare} label={t.sidebar.chatbot} />
              <NavItem tab="api-docs" icon={FileText} label={t.sidebar.documentation} />
            </div>
          </div>

          <div>
            <div className="px-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">{t.sidebar.applications}</div>
            <div className="space-y-1">
              <NavItem tab="desktop" icon={Monitor} label={t.sidebar.desktop} />
              <NavItem tab="mobile" icon={Smartphone} label={t.sidebar.mobile} comingSoon />
            </div>
          </div>

          <div>
            <div className="px-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">{t.sidebar.infrastructure}</div>
            <div className="space-y-1">
              <NavItem tab="docker" icon={Box} label={t.sidebar.docker} enterprise />
              <NavItem tab="hardware" icon={Cpu} label={t.sidebar.hardware} enterprise />
            </div>
          </div>
        </div>
      </ScrollArea>

      <div className="p-4 border-t">
        <Button
          variant="outline"
          className="w-full justify-start gap-3 h-10 rounded-xl bg-muted/30 border-border/50 hover:bg-muted/50 transition-all text-sm font-medium"
          onClick={toggleDarkMode}
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4" />}
          {isDark ? t.sidebar.light : t.sidebar.dark}
        </Button>
      </div>
    </div>
  )
}
