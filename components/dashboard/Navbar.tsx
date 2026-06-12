import * as React from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  Search as SearchIcon, Bell, ChevronDown, User as UserIcon,
  Settings, HelpCircle, LogOut, Menu, Shield, LayoutDashboard, Key, Tags, MessageSquare, FileText
} from "lucide-react"
import { getInitials } from "@/lib/dashboard-utils"

interface NavbarProps {
  user: any
  t: any
  activeTab: string
  setActiveTab: (tab: any) => void
  handleLogout: () => void
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  t,
  activeTab,
  setActiveTab,
  handleLogout
}) => {
  return (
    <header className="h-16 border-b bg-background/50 backdrop-blur-md flex items-center justify-between px-4 lg:px-8 shrink-0 z-10">
      <div className="flex items-center gap-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <div className="flex flex-col h-full bg-sidebar">
              <div className="p-6">
                <div className="flex items-center gap-3">
                  <img src="/logo-light.png" width="32px" />
                  <span className="font-bold text-2xl text-secondary">Data Private</span>
                  <span className="ml-auto text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">Beta</span>
                </div>
              </div>
              <div className="px-4 flex-1 space-y-6">
                <div>
                  <div className="px-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">{t.sidebar.principal}</div>
                  <div className="space-y-1">
                    <Button variant={activeTab === "overview" ? "secondary" : "ghost"} className="w-full justify-start gap-3 h-9 text-sm rounded-xl" onClick={() => setActiveTab("overview")}>
                      <LayoutDashboard className="w-4 h-4" /> {t.sidebar.overview}
                    </Button>
                    <Button variant={activeTab === "api-keys" ? "secondary" : "ghost"} className="w-full justify-start gap-3 h-9 text-sm rounded-xl" onClick={() => setActiveTab("api-keys")}>
                      <Key className="w-4 h-4" /> {t.sidebar.apiKeys}
                    </Button>
                    <Button variant={activeTab === "entity-detection" ? "secondary" : "ghost"} className="w-full justify-start gap-3 h-9 text-sm rounded-xl" onClick={() => setActiveTab("entity-detection")}>
                      <Tags className="w-4 h-4" /> {t.sidebar.entityDetection}
                    </Button>
                    <Button variant={activeTab === "chatbot" ? "secondary" : "ghost"} className="w-full justify-start gap-3 h-9 text-sm rounded-xl" onClick={() => setActiveTab("chatbot")}>
                      <MessageSquare className="w-4 h-4" /> {t.sidebar.chatbot}
                    </Button>
                    <Button variant={activeTab === "api-docs" ? "secondary" : "ghost"} className="w-full justify-start gap-3 h-9 text-sm rounded-xl" onClick={() => setActiveTab("api-docs")}>
                      <FileText className="w-4 h-4" /> {t.sidebar.documentation}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        <div className="hidden md:flex items-center bg-muted/50 border border-border/50 px-3 py-1.5 rounded-xl w-64 lg:w-80 group focus-within:bg-background focus-within:ring-1 focus-within:ring-primary/20 transition-all">
          <SearchIcon className="h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder={t.navbar.search}
            className="bg-transparent border-none outline-none text-sm ml-2 w-full placeholder:text-muted-foreground/60"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 lg:gap-4">
        <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground rounded-xl">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-background" />
        </Button>

        <div className="h-8 w-[1px] bg-border/50 mx-1 hidden sm:block" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="pl-1 pr-2 h-10 rounded-xl hover:bg-muted/50 gap-2 transition-all">
              <Avatar className="h-8 w-8 border border-border/50 shadow-sm">
                <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">
                  {getInitials(user?.full_name || "User")}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start hidden sm:flex">
                <span className="text-xs font-bold leading-none">{user?.full_name || "Utilisateur"}</span>
                <span className="text-[10px] text-muted-foreground mt-1">Free Plan</span>
              </div>
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-xl border-border/40 shadow-2xl p-1">
            <DropdownMenuLabel className="px-2 py-1.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">{t.navbar.monCompte}</DropdownMenuLabel>
            <DropdownMenuItem className="rounded-lg gap-2 py-2 cursor-pointer">
              <UserIcon className="h-4 w-4" /> {t.navbar.profil}
            </DropdownMenuItem>
            <DropdownMenuItem className="rounded-lg gap-2 py-2 cursor-pointer">
              <Settings className="h-4 w-4" /> {t.navbar.settings}
            </DropdownMenuItem>
            <DropdownMenuItem className="rounded-lg gap-2 py-2 cursor-pointer">
              <HelpCircle className="h-4 w-4" /> Support
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border/40" />
            <DropdownMenuItem
              className="rounded-lg gap-2 py-2 text-rose-500 focus:text-rose-500 focus:bg-rose-500/5 cursor-pointer"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" /> {t.navbar.logout}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
