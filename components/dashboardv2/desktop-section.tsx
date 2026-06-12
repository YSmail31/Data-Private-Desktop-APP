"use client";

import { useApp } from "@/lib/store"
import { translations } from "@/lib/translations"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Monitor, Apple, Wind, Terminal, Download, ShieldCheck, Check, Cpu, Zap, Shield } from "lucide-react"
import { cn } from "@/lib/utils"

export function DesktopSection() {
  const { lang } = useApp()
  const t = translations[lang] || translations.en

  return (
    <ScrollArea className="flex-1 w-full h-full bg-background">
      <div className="flex-1 p-6 lg:p-10 overflow-y-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h1 className="text-3xl font-black tracking-tighter bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            {t.desktop.title}
          </h1>
          <p className="text-muted-foreground text-sm font-medium">
            {t.desktop.subtitle}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100 fill-mode-both">
          {t.desktop.features.map((feature: any, idx: number) => {
            const icons = [ShieldCheck, Cpu, Zap]
            const Icon = icons[idx] || ShieldCheck
            return (
              <Card key={idx} className="border border-border/40 shadow-sm bg-card/60 backdrop-blur-xl hover:border-primary/30 transition-all duration-300">
                <CardContent className="pt-6">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-bold mb-1 tracking-tight">{feature.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{feature.desc}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Platforms */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200 fill-mode-both mt-12">
          {[
            {
              id: 'mac',
              name: 'macOS',
              icon: Apple,
              version: 'v1.2.0',
              requirements: lang === 'fr' ? 'macOS 12.0 ou ultérieur' : 'macOS 12.0 or later',
              downloads: [
                { label: 'Apple Silicon (M1/M2/M3)', link: '#' },
                { label: 'Intel Chip', link: '#' }
              ]
            },
            {
              id: 'windows',
              name: 'Windows',
              icon: Wind,
              version: 'v1.2.0',
              requirements: lang === 'fr' ? 'Windows 10/11 (64-bit)' : 'Windows 10/11 (64-bit)',
              downloads: [
                { label: lang === 'fr' ? 'Installer (.exe)' : 'Installer (.exe)', link: '#' },
                { label: lang === 'fr' ? 'Portable (.zip)' : 'Portable (.zip)', link: '#' }
              ]
            },
            {
              id: 'linux',
              name: 'Linux',
              icon: Terminal,
              version: 'v1.1.5',
              requirements: lang === 'fr' ? 'Ubuntu 20.04+, Fedora 35+' : 'Ubuntu 20.04+, Fedora 35+',
              downloads: [
                { label: 'AppImage', link: '#' },
                { label: 'Debian (.deb)', link: '#' }
              ]
            }
          ].map((platform) => (
            <Card key={platform.id} className="border border-border/40 shadow-sm bg-card/60 backdrop-blur-xl flex flex-col hover:border-primary/30 transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center shadow-inner border border-primary/10">
                    <platform.icon className="w-6 h-6 text-foreground" />
                  </div>
                  <Badge variant="secondary" className="font-bold text-[10px] bg-secondary/50 text-secondary-foreground">{platform.version}</Badge>
                </div>
                <CardTitle className="text-xl font-bold tracking-tight">{platform.name}</CardTitle>
                <CardDescription className="text-xs font-medium">{platform.requirements}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 mt-auto">
                {platform.downloads.map((dl, dlIdx) => (
                  <Button
                    key={dlIdx}
                    variant={dlIdx === 0 ? "default" : "outline"}
                    className={cn(
                      "w-full h-11 rounded-xl font-bold flex items-center justify-between px-4 transition-all active:scale-[0.98]",
                      dlIdx === 0 ? "shadow-md shadow-primary/20" : "border-dashed hover:bg-muted/50"
                    )}
                  >
                    <span className="text-xs">{dl.label}</span>
                    <Download className={cn("w-4 h-4", dlIdx !== 0 && "opacity-50")} />
                  </Button>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Why Desktop Card */}
        <Card className="border border-border/40 shadow-xl bg-card/40 backdrop-blur-sm rounded-3xl mt-12 overflow-hidden relative animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300 fill-mode-both ring-1 ring-white/5">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Shield className="w-48 h-48 text-primary" />
          </div>
          <CardContent className="p-8 md:p-12 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-2xl font-black text-primary tracking-tighter mb-6">
                  {t.desktop.securityTitle}
                </h2>
                <div className="space-y-4">
                  {t.desktop.securityPoints.map((point: string, idx: number) => (
                    <div key={idx} className="flex gap-3">
                      <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-primary" />
                      </div>
                      <p className="text-sm font-medium text-foreground/90 leading-relaxed">
                        {point}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="hidden md:flex justify-center">
                <div className="relative">
                  <div className="w-48 h-48 rounded-full bg-primary/5 animate-pulse flex items-center justify-center border border-primary/10">
                    <Monitor className="w-24 h-24 opacity-20 text-primary" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  )
}
