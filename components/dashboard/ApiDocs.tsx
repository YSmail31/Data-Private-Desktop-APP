"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Terminal, Key, Lock, Rocket, ArrowRight, Copy, Check, Play, Code2, Eye, EyeOff, ShieldCheck, Zap
} from "lucide-react"
import { toast } from "sonner"

interface ApiDocsProps {
  t: any
  lang: string
  setActiveTab?: (tab: string) => void
}

export const ApiDocs: React.FC<ApiDocsProps> = ({ t, lang, setActiveTab }) => {
  const [copiedText, setCopiedText] = React.useState<string | null>(null)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedText(text)
    toast.success(lang === 'fr' ? 'Copié dans le presse-papier' : 'Copied to clipboard')
    setTimeout(() => setCopiedText(null), 2000)
  }

  // API Documentation Test State
  const [testEndpoint, setTestEndpoint] = React.useState("https://api.Data Private.ai/v1/detect")
  const [testMethod, setTestMethod] = React.useState("POST")
  const [testPayload, setTestPayload] = React.useState(`{
  "text": "Bonjour, je m'appelle Jean Dupont et j'habite au 123 rue de la Paix à Paris.",
  "labels": ["PERSON", "ADDRESS", "CITY"],
  "threshold": 0.5
}`)
  const [testResponse, setTestResponse] = React.useState(`{
  "anonymized_text": "Bonjour, je m'appelle <PERSON> et j'habite au <ADDRESS> à <CITY>.",
  "entities": [
    {
      "entity": "Jean Dupont",
      "label": "PERSON",
      "start": 21,
      "end": 32,
      "score": 0.98
    },
    {
      "entity": "123 rue de la Paix",
      "label": "ADDRESS",
      "start": 46,
      "end": 64,
      "score": 0.95
    },
    {
      "entity": "Paris",
      "label": "CITY",
      "start": 67,
      "end": 72,
      "score": 0.99
    }
  ]
}`)
  const [isTestRunning, setIsTestRunning] = React.useState(false)

  const runTest = () => {
    setIsTestRunning(true)
    setTimeout(() => {
      setIsTestRunning(false)
      toast.success(lang === 'fr' ? 'Test effectué avec succès' : 'Test completed successfully')
    }, 1500)
  }

  return (
    <ScrollArea className="flex-1 p-4 lg:p-8 bg-muted/30">
      <div className="max-w-5xl mx-auto space-y-12 pb-20 animate-reveal">

        {/* Header */}
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-950 via-slate-900 to-black dark:from-white dark:via-slate-50 dark:to-slate-100 p-8 lg:p-12 text-white dark:text-black shadow-2xl ring-1 ring-white/10 dark:ring-black/5">
          <div className="relative z-10 space-y-6 max-w-3xl">
            <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary dark:border-primary/20 dark:text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-[0.2em] backdrop-blur-md">Documentation API</Badge>
            <div className="space-y-4">
              <h1 className="text-3xl lg:text-5xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-white/50 dark:from-black dark:to-black/60">
                {t.apiDocs.title}
              </h1>
              <p className="text-lg lg:text-xl text-white/80 dark:text-black/80 font-medium leading-tight">
                {t.apiDocs.subtitle}
              </p>
            </div>
            <p className="text-white/60 dark:text-black/60 text-sm lg:text-base leading-relaxed font-medium">
              {t.apiDocs.introParagraph}
            </p>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 animate-pulse" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-blue-500/20 rounded-full blur-[80px]" />
        </div>

        {/* Developer Journey / Steps */}
        <div className="space-y-8" id="quick-start">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
              <Terminal className="w-6 h-6 text-primary" />
              {t.apiDocs.developerSteps.title}
            </h2>
            <p className="text-muted-foreground text-sm font-medium">
              {lang === 'fr' ? 'Suivez ces étapes pour intégrer Data Private en quelques minutes.' : 'Follow these steps to integrate Data Private in minutes.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* Connection lines for desktop */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-border/40 to-transparent -translate-y-1/2 z-0" />

            {[
              {
                step: "01",
                data: t.apiDocs.developerSteps.step1,
                icon: Key,
                color: "text-amber-500",
                bg: "bg-amber-500/10",
                action: setActiveTab ? {
                  label: lang === 'fr' ? 'Gérer les clés' : 'Manage keys',
                  onClick: () => setActiveTab("api-keys")
                } : undefined
              },
              {
                step: "02",
                data: t.apiDocs.developerSteps.step2,
                icon: Lock,
                color: "text-blue-500",
                bg: "bg-blue-500/10",
                action: setActiveTab ? {
                  label: lang === 'fr' ? 'Voir Authentification' : 'View Authentication',
                  onClick: () => setActiveTab("auth")
                } : undefined
              },
              {
                step: "03",
                data: t.apiDocs.developerSteps.step3,
                icon: Rocket,
                color: "text-emerald-500",
                bg: "bg-emerald-500/10",
                action: setActiveTab ? {
                  label: lang === 'fr' ? 'Tester l\'API' : 'Test API',
                  onClick: () => setActiveTab("tester")
                } : undefined
              }
            ].map((item, i) => (
              <Card key={i} className="relative z-10 border border-border/40 shadow-sm bg-card/50 backdrop-blur-xl overflow-hidden group hover:border-primary/30 transition-all duration-500">
                <CardContent className="p-6 space-y-6">
                  <div className="flex items-start justify-between">
                    <div className={cn("p-4 rounded-2xl transition-transform duration-500 group-hover:scale-110", item.bg)}>
                      <item.icon className={cn("w-6 h-6", item.color)} />
                    </div>
                    <span className="text-4xl font-black text-muted-foreground/[0.07] group-hover:text-primary/[0.1] transition-colors tabular-nums">{item.step}</span>
                  </div>
                  <div className="space-y-3">
                    <h3 className="font-bold text-lg tracking-tight">{item.data.title}</h3>
                    <p className="text-sm font-bold text-primary/80 leading-relaxed">
                      {item.data.description}
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {item.data.paragraph}
                    </p>
                  </div>
                  {item.action && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-4 bg-primary/5 border-primary/20 hover:bg-primary hover:text-primary-foreground transition-all duration-300 gap-2 font-bold"
                      onClick={item.action.onClick}
                    >
                      {item.action.label}
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="space-y-12">
          {/* Content from original documentation_content.tsx would go here */}
          {/* I will add a placeholder and then populate it with the relevant parts of the documentation */}
          <div className="space-y-12">

            {/* Authentication Details */}
            <section className="space-y-4" id="auth">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/5 flex items-center justify-center text-amber-600 border border-amber-500/20 shadow-inner">
                    <Key className="w-5 h-5" />
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight">{t.apiDocs.auth.title}</h2>
                </div>
              </div>
              <Card className="border-border/40 bg-card/50 backdrop-blur-sm overflow-hidden">
                <CardContent className="p-0">
                  <div className="bg-muted/50 p-4 border-b border-border/40">
                    <p className="text-sm font-medium text-muted-foreground">{t.apiDocs.auth.description}</p>
                  </div>
                  <div className="p-6 bg-slate-950 dark:bg-slate-900 relative group">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-500/20" />
                        <div className="w-3 h-3 rounded-full bg-amber-500/20" />
                        <div className="w-3 h-3 rounded-full bg-emerald-500/20" />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-white"
                        onClick={() => copyToClipboard("Authorization: Bearer YOUR_API_KEY")}
                      >
                        {copiedText === "Authorization: Bearer YOUR_API_KEY" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                    <pre className="text-sm font-mono text-slate-300 leading-relaxed overflow-x-auto">
                      <code>Authorization: Bearer YOUR_API_KEY</code>
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Endpoints section */}
            <section className="space-y-8" id="endpoints">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/5 flex items-center justify-center text-blue-600 border border-blue-500/20 shadow-inner">
                  <Code2 className="w-5 h-5" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight">{t.apiDocs.endpoints.title}</h2>
              </div>

              {/* Detect Entity Endpoint */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20 px-2 font-mono">POST</Badge>
                      <code className="text-sm font-bold tracking-tight">/v1/detect</code>
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {t.apiDocs.endpoints.detect.description}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground">{t.apiDocs.endpoints.detect.parameters}</h4>
                    <div className="space-y-3">
                      {[
                        { name: "text", type: "string", desc: t.apiDocs.endpoints.detect.params.text, required: true },
                        { name: "labels", type: "array", desc: t.apiDocs.endpoints.detect.params.labels, required: false },
                        { name: "threshold", type: "float", desc: t.apiDocs.endpoints.detect.params.threshold, required: false }
                      ].map((param, i) => (
                        <div key={i} className="flex items-start gap-4 p-3 rounded-xl bg-card/30 border border-border/40 group hover:border-primary/20 transition-colors">
                          <div className="shrink-0 flex flex-col items-center gap-1">
                            <code className="text-xs font-bold text-primary">{param.name}</code>
                            {param.required && <span className="text-[10px] font-black text-red-500 uppercase tracking-tighter">Required</span>}
                          </div>
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase">{param.type}</span>
                            <p className="text-xs text-muted-foreground leading-snug">{param.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground">{t.apiDocs.endpoints.detect.example}</h4>
                  <Card className="border-border/40 bg-slate-950 dark:bg-slate-900 overflow-hidden shadow-2xl">
                    <CardContent className="p-0">
                      <div className="flex items-center justify-between p-3 border-b border-white/5 bg-white/5">
                        <div className="flex gap-2">
                          <div className="w-2.5 h-2.5 rounded-full bg-red-500/40" />
                          <div className="w-2.5 h-2.5 rounded-full bg-amber-500/40" />
                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/40" />
                        </div>
                        <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">json</span>
                      </div>
                      <div className="p-6">
                        <pre className="text-xs font-mono text-slate-300 leading-relaxed">
                          {`{
  "text": "Jean Dupont habite à Paris.",
  "labels": ["PERSON", "CITY"],
  "threshold": 0.5
}`}
                        </pre>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </section>

            {/* Live API Tester */}
            <section className="space-y-8" id="tester">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/5 flex items-center justify-center text-emerald-600 border border-emerald-500/20 shadow-inner">
                  <Play className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">{t.apiDocs.tester.title}</h2>
                  <p className="text-sm text-muted-foreground">{t.apiDocs.tester.subtitle}</p>
                </div>
              </div>

              <Card className="border-border/40 bg-card/50 backdrop-blur-xl overflow-hidden shadow-xl">
                <div className="grid grid-cols-1 lg:grid-cols-2">
                  <div className="p-6 border-r border-border/40 space-y-6 bg-card/30">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="font-mono text-[10px] h-5 px-1.5">{testMethod}</Badge>
                        <code className="text-xs font-bold text-muted-foreground">{testEndpoint}</code>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Request Body</label>
                        <div className="relative group">
                          <textarea
                            value={testPayload}
                            onChange={(e) => setTestPayload(e.target.value)}
                            className="w-full h-[300px] p-4 font-mono text-xs bg-slate-950 dark:bg-slate-900 text-slate-300 rounded-2xl border border-border/40 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
                          />
                          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-500 hover:text-white" onClick={() => copyToClipboard(testPayload)}>
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button
                      className="w-full h-11 rounded-xl font-bold gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-[0.98]"
                      onClick={runTest}
                      disabled={isTestRunning}
                    >
                      {isTestRunning ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>{t.apiDocs.tester.running}</span>
                        </div>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 fill-current" />
                          {t.apiDocs.tester.runTest}
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="flex flex-col bg-slate-950 dark:bg-slate-900 overflow-hidden">
                    <div className="p-4 border-b border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Response</span>
                      </div>
                      <span className="text-[10px] font-mono text-white/40">200 OK • 124ms</span>
                    </div>
                    <ScrollArea className="flex-1 p-6">
                      <pre className={cn(
                        "text-xs font-mono text-emerald-400/90 leading-relaxed transition-opacity duration-300",
                        isTestRunning ? "opacity-30" : "opacity-100"
                      )}>
                        {testResponse}
                      </pre>
                    </ScrollArea>
                    <div className="p-4 border-t border-white/5 bg-white/[0.02] flex items-center justify-between">
                      <div className="flex gap-4">
                        <div className="flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-[10px] font-medium text-white/60">Data Protected</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5 text-amber-500" />
                          <span className="text-[10px] font-medium text-white/60">High Precision</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-white/20 hover:text-white" onClick={() => copyToClipboard(testResponse)}>
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </section>

            {/* Supported Labels section */}
            <section className="space-y-6" id="labels">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary border border-primary/20 shadow-inner">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">{t.apiDocs.supportedLabels.title}</h2>
                  <p className="text-sm text-muted-foreground">{t.apiDocs.supportedLabels.description}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {t.apiDocs.supportedLabels.list.map((label: string, i: number) => (
                  <Badge
                    key={i}
                    variant="outline"
                    className="px-3 py-1 bg-card/50 hover:bg-primary/10 hover:border-primary/30 transition-all duration-300 cursor-default font-mono text-[10px] uppercase tracking-wider"
                  >
                    {label}
                  </Badge>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </ScrollArea>
  )
}
