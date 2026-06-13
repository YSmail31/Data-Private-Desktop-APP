"use client";

import * as React from "react";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";
import api, { API_BASE_URL } from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";

import {
  Terminal, Key, Lock, Rocket, ShieldCheck, Copy, Box, Play, ArrowRight, HelpCircle, Zap, Check, Plus
} from "lucide-react";

import { translations } from "@/lib/translations";

export function ApiDocsSection() {
  const { lang, apiKeys, setActiveView } = useApp();
  const isMobile = useIsMobile();
  const t = translations[lang] || translations.en;

  const [selectedApiKey, setSelectedApiKey] = React.useState<string>("");
  const [selectedTestLang, setSelectedTestLang] = React.useState<'python' | 'javascript' | 'curl' | 'php'>('python');
  const [testPayload, setTestPayload] = React.useState<string>(`{
    "text": "Hello, my name is John Doe.",
    "labels": ["personal_identity"]
}`);
  const [isTestSnippetCopied, setIsTestSnippetCopied] = React.useState(false);
  const [isTestingApi, setIsTestingApi] = React.useState(false);
  const [testResult, setTestResult] = React.useState<any>(null);

  React.useEffect(() => {
    if (apiKeys && apiKeys.length > 0) {
      const activeKeys = apiKeys.filter(k => k.is_active);
      if (activeKeys.length > 0 && !selectedApiKey) {
        setSelectedApiKey(activeKeys[0].key);
      }
    }
  }, [apiKeys, selectedApiKey]);

  const handleCopyTestSnippet = () => {
    let snippet = '';
    const endpoint = `${API_BASE_URL}/public/extract`;
    if (selectedTestLang === 'python') {
      snippet = `import requests

url = "${endpoint}"
headers = {
    "X-API-Key": "${selectedApiKey}"
}
data = ${testPayload}

response = requests.post(url, json=data, headers=headers)
print(response.json())`;
    } else if (selectedTestLang === 'javascript') {
      snippet = `const url = "${endpoint}";
const headers = {
  "X-API-Key": "${selectedApiKey}"
};
const data = ${testPayload};

const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(data) });
console.log(await res.json());`;
    } else if (selectedTestLang === 'curl') {
      snippet = `curl -X POST "${endpoint}" \\
  -H "X-API-Key: ${selectedApiKey}" \\
  -d '${testPayload}'`;
    } else if (selectedTestLang === 'php') {
      snippet = `<?php
$url = "${endpoint}";
$headers = [
    "X-API-Key: ${selectedApiKey}"
];
$data = ${testPayload};

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
$res = curl_exec($ch);
echo $res;`;
    }

    navigator.clipboard.writeText(snippet);
    setIsTestSnippetCopied(true);
    toast.success(lang === 'fr' ? 'Extrait copié !' : 'Snippet copied!');
    setTimeout(() => setIsTestSnippetCopied(false), 2000);
  };

  const handleTestApi = async (endpoint: string) => {
    if (!selectedApiKey) {
      toast.error(lang === 'fr' ? "Veuillez sélectionner une clé API" : "Please select an API key");
      return;
    }

    try {
      JSON.parse(testPayload);
    } catch (e) {
      toast.error(lang === 'fr' ? "Le JSON fourni est invalide" : "Invalid JSON payload");
      return;
    }

    setIsTestingApi(true);
    setTestResult(null);
    try {
      const payloadObj = JSON.parse(testPayload);
      // We purposefully do not use our internal 'api' client because we want to test with the user's specific token
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': selectedApiKey
        },
        body: JSON.stringify(payloadObj)
      });

      const data = await response.json();
      setTestResult({ ...data, status: response.status, isError: !response.ok });
    } catch (err: any) {
      setTestResult({ error: err.message || "Request failed", isError: true });
    } finally {
      setIsTestingApi(false);
    }
  };

  return (
    <ScrollArea className="flex-1 w-full h-full bg-background">
      <div className="flex-1 p-6 lg:p-10 overflow-y-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h1 className="text-3xl font-black tracking-tighter bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            {t.apiDocs.title}
          </h1>
          <p className="text-muted-foreground text-sm font-medium">
            {t.apiDocs.introParagraph}
          </p>
        </div>

        <div className="w-full space-y-12 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150 fill-mode-both">

          {/* Developer Journey / Steps */}
          <div className="space-y-8">
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
              <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-border/40 to-transparent -translate-y-1/2 z-0" />

              {[
                {
                  step: "01",
                  data: t.apiDocs.developerSteps.step1,
                  icon: Key,
                  color: "text-amber-500",
                  bg: "bg-amber-500/10",
                  action: {
                    label: lang === 'fr' ? 'Gérer les clés' : 'Manage keys',
                    onClick: () => setActiveView("api-keys")
                  }
                },
                {
                  step: "02",
                  data: t.apiDocs.developerSteps.step2,
                  icon: Lock,
                  color: "text-blue-500",
                  bg: "bg-blue-500/10"
                },
                {
                  step: "03",
                  data: t.apiDocs.developerSteps.step3,
                  icon: Rocket,
                  color: "text-emerald-500",
                  bg: "bg-emerald-500/10"
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

            {/* Authentication Details */}
            <section className="space-y-4">
              <div className={cn("flex ", isMobile ? "flex-col justify-start gap-4" : "items-center justify-between flex-row")}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/5 flex items-center justify-center text-amber-600 border border-amber-500/20 shadow-inner">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h2 className="text-xl font-bold tracking-tight">{t.apiDocs.authentication.title}</h2>
                    <div className="h-0.5 w-8 bg-amber-500/40 rounded-full" />
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn("text-[10px] font-bold uppercase tracking-wider text-amber-600 hover:text-amber-700 hover:bg-amber-500/10 gap-2 transition-all rounded-lg", isMobile ? "border border-amber-500/20" : "")}
                  onClick={() => setActiveView("api-keys")}
                >
                  <Key className="w-3.5 h-3.5" />
                  {lang === 'fr' ? 'Gérer les clés' : 'Manage keys'}
                  <ArrowRight className="w-3 h-3" />
                </Button>
              </div>

              <div className="grid lg:grid-cols-5 gap-6">
                <div className="lg:col-span-2 space-y-4">
                  <Card className="border border-border/40 shadow-sm bg-card/60 backdrop-blur-xl h-full hover:border-amber-500/20 transition-all duration-300">
                    <CardContent className="p-6 space-y-6">
                      <div className="space-y-2">
                        <h3 className="font-bold text-sm tracking-tight flex items-center gap-2">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 text-[10px]">1</span>
                          {lang === 'fr' ? 'Sélectionner une clé' : 'Select a key'}
                        </h3>
                        <p className="text-muted-foreground text-xs leading-relaxed">
                          {lang === 'fr'
                            ? "Choisissez une clé API existante pour personnaliser vos exemples de code."
                            : "Choose an existing API key to customize your code examples."}
                        </p>
                      </div>

                      <Select
                        value={selectedApiKey}
                        onValueChange={(value) => {
                          if (value === "create_new") {
                            setActiveView("api-keys");
                          } else {
                            setSelectedApiKey(value);
                          }
                        }}
                      >
                        <SelectTrigger className="w-full bg-background/50 border-border/40 h-11 rounded-xl shadow-sm transition-all hover:border-amber-500/30">
                          <div className="flex items-center gap-2">
                            <Key className="w-3.5 h-3.5 text-amber-500" />
                            <SelectValue placeholder={lang === 'fr' ? "Sélectionner une clé API" : "Select an API key"} />
                          </div>
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-border/40 shadow-2xl">
                          {apiKeys.filter(k => k.is_active).length > 0 ? (
                            apiKeys.filter(k => k.is_active).map((key) => (
                              <SelectItem key={key.id} value={key.key} className="py-2.5 rounded-lg focus:bg-amber-500/5 focus:text-amber-900">
                                <div className="flex flex-col gap-0.5">
                                  <span className="font-bold text-xs">{key.name}</span>
                                  <span className="text-[10px] text-muted-foreground font-mono">{key.key.replace(/(.{4}).+(.{4})/, '$1...$2')}</span>
                                </div>
                              </SelectItem>
                            ))
                          ) : (
                            <div className="px-2 py-3 text-center space-y-2">
                              <p className="text-[10px] text-muted-foreground font-medium italic">{lang === 'fr' ? "Aucune clé active trouvée" : "No active keys found"}</p>
                            </div>
                          )}
                          <div className="p-1 border-t border-border/40 mt-1">
                            <Button
                              variant="ghost"
                              className="w-full justify-start gap-2 h-9 text-[10px] font-bold text-amber-600 hover:text-amber-700 hover:bg-amber-500/10 rounded-lg"
                              onClick={(e) => {
                                e.preventDefault();
                                setActiveView("api-keys");
                              }}
                            >
                              <Plus className="w-3.5 h-3.5" />
                              {lang === 'fr' ? 'Aller aux clés API' : 'Go to API keys'}
                            </Button>
                          </div>
                        </SelectContent>
                      </Select>

                      <div className="pt-2">
                        <div className="rounded-xl bg-amber-500/5 border border-amber-500/10 p-3 flex gap-3">
                          <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          <p className="text-[10px] text-amber-700/80 leading-relaxed font-medium">
                            {lang === 'fr'
                              ? "Toutes les requêtes doivent être authentifiées via le header X-API-Key."
                              : "All requests must be authenticated via the X-API-Key header."}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="lg:col-span-3 space-y-4 ">
                  <Card className="border border-border/40 shadow-sm bg-[#0f111a] dark:bg-slate-900 overflow-hidden h-full group">
                    <CardContent className="p-0 flex flex-col h-full bg-[#0f111a]">
                      <div className="p-4 border-b border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-rose-500/40" />
                            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/40" />
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/40" />
                          </div>
                          <span className="text-[9px] uppercase font-bold text-slate-500 tracking-widest ml-2">Header HTTP</span>
                        </div>
                        <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-[10px] font-black uppercase tracking-widest px-2 py-0.5">Required</Badge>
                      </div>

                      <div className="p-6 flex-1 flex flex-col justify-center font-mono">
                        <div className="relative group/code">
                          <div className="absolute -inset-4 bg-amber-500/10 rounded-xl blur-xl opacity-0 group-hover/code:opacity-100 transition-opacity duration-500" />
                          <div className="relative space-y-1">
                            <span className="text-emerald-400 text-xs">X-API-Key</span>
                            <span className="text-slate-500 mx-2">:</span>
                            <span className="text-amber-400 text-sm font-bold break-all drop-shadow-[0_0_8px_rgba(251,191,36,0.3)]">
                              {selectedApiKey || "YOUR_API_KEY"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 border-t border-white/5">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full h-9 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all gap-2 text-[10px] font-bold uppercase tracking-wider"
                          onClick={() => {
                            if (!selectedApiKey) return;
                            navigator.clipboard.writeText(`X-API-Key: ${selectedApiKey}`)
                            toast.success(t.apiDocs.examples.copied)
                          }}
                        >
                          <Copy className="h-3.5 w-3.5" />
                          {lang === 'fr' ? 'Copier le header' : 'Copy header'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </section>

            {/* Endpoint Details */}
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/5 flex items-center justify-center text-blue-600 border border-blue-500/20 shadow-inner">
                  <Zap className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-xl font-bold tracking-tight">{t.apiDocs.endpoints.title}</h2>
                  <div className="h-0.5 w-8 bg-blue-500/40 rounded-full" />
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white border-none px-4 py-1 font-black text-xs shadow-md shadow-emerald-500/30 uppercase tracking-[0.2em] rounded-full">POST</Badge>
                    <div className="bg-card/80 backdrop-blur-xl px-4 py-2 rounded-xl border border-border/40 shadow-sm flex items-center gap-2 ring-1 ring-white/5">
                      <code className="text-sm font-bold tracking-tight text-primary">/api/v1/public/extract</code>
                      <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-primary/10 rounded-lg transition-colors" onClick={() => { navigator.clipboard.writeText("/api/v1/public/extract"); toast.success(t.apiDocs.examples.copied) }}>
                        <Copy className="h-3 w-3 text-muted-foreground" />
                      </Button>
                    </div>
                  </div>

                  <p className="text-muted-foreground text-sm leading-relaxed font-medium">
                    {t.apiDocs.endpoints.extract.description}
                  </p>

                  <Card className="border border-border/40 shadow-xl bg-card/40 backdrop-blur-xl overflow-hidden rounded-2xl ring-1 ring-white/5">
                    <CardHeader className="border-b border-border/40 bg-muted/20 py-4 px-6">
                      <CardTitle className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                        <Box className="w-3.5 h-3.5 text-primary" />
                        {t.apiDocs.parameters.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-border/40 bg-muted/5">
                            <th className="text-left p-4 font-black text-[8px] uppercase tracking-[0.2em] text-muted-foreground">{t.apiDocs.parameters.name}</th>
                            <th className="text-left p-4 font-black text-[8px] uppercase tracking-[0.2em] text-muted-foreground">{t.apiDocs.parameters.type}</th>
                            <th className="text-left p-4 font-black text-[8px] uppercase tracking-[0.2em] text-muted-foreground">{t.apiDocs.parameters.required}</th>
                            <th className="text-left p-4 font-black text-[8px] uppercase tracking-[0.2em] text-muted-foreground">{t.apiDocs.parameters.description}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/30">
                          <tr className="group hover:bg-primary/[0.02] transition-colors">
                            <td className="p-4"><code className="px-2 py-1 rounded-md bg-primary/5 text-primary font-bold">text</code></td>
                            <td className="p-4 text-muted-foreground"><Badge variant="outline" className="font-mono text-[10px] px-1.5 h-5">string</Badge></td>
                            <td className="p-4"><Badge variant="outline" className="text-emerald-500 border-emerald-500/20 bg-emerald-500/5 uppercase text-[10px] font-black tracking-widest px-2 py-0.5 rounded-full">{lang === 'fr' ? 'Oui' : 'Yes'}</Badge></td>
                            <td className="p-4 text-muted-foreground font-medium leading-relaxed">{t.apiDocs.parameters.fields.text}</td>
                          </tr>
                          <tr className="group hover:bg-primary/[0.02] transition-colors">
                            <td className="p-4"><code className="px-2 py-1 rounded-md bg-primary/5 text-primary font-bold">labels</code></td>
                            <td className="p-4 text-muted-foreground"><Badge variant="outline" className="font-mono text-[10px] px-1.5 h-5">string[]</Badge></td>
                            <td className="p-4"><Badge variant="outline" className="text-muted-foreground/40 border-border/40 uppercase text-[10px] font-black tracking-widest px-2 py-0.5 rounded-full">{lang === 'fr' ? 'Non' : 'No'}</Badge></td>
                            <td className="p-4 text-muted-foreground font-medium leading-relaxed">{t.apiDocs.parameters.fields.labels}</td>
                          </tr>
                          <tr className="group hover:bg-primary/[0.02] transition-colors">
                            <td className="p-4"><code className="px-2 py-1 rounded-md bg-primary/5 text-primary font-bold">confidence_threshold</code></td>
                            <td className="p-4 text-muted-foreground"><Badge variant="outline" className="font-mono text-[10px] px-1.5 h-5">float</Badge></td>
                            <td className="p-4"><Badge variant="outline" className="text-muted-foreground/40 border-border/40 uppercase text-[10px] font-black tracking-widest px-2 py-0.5 rounded-full">{lang === 'fr' ? 'Non' : 'No'}</Badge></td>
                            <td className="p-4 text-muted-foreground font-medium leading-relaxed">{t.apiDocs.parameters.fields.threshold}</td>
                          </tr>
                        </tbody>
                      </table>
                    </CardContent>
                  </Card>

                  {/* Integrated Test Section */}
                  <div className="pt-4 space-y-4">
                    <div className="flex items-center justify-between px-2">
                      <h3 className="text-sm font-bold flex items-center gap-2">
                        <Play className="w-4 h-4 text-primary" />
                        {t.apiDocs.examples.test}
                      </h3>
                      <div className="flex items-center gap-2">
                        {testResult && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground"
                            onClick={() => setTestResult(null)}
                          >
                            {lang === 'fr' ? 'Effacer' : 'Clear'}
                          </Button>
                        )}
                        <Button
                          size="sm"
                          className="bg-primary hover:opacity-90 text-primary-foreground font-bold rounded-lg h-8 gap-2 shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
                          onClick={() => handleTestApi('/public/extract')}
                          disabled={isTestingApi}
                        >
                          {isTestingApi ? (
                            <>
                              <div className="h-3 w-3 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                              {t.apiDocs.examples.testing}
                            </>
                          ) : (
                            <>
                              <Zap className="w-3 h-3 fill-current" />
                              {t.apiDocs.examples.test}
                            </>
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 items-stretch">
                      <div className="flex flex-col space-y-2">
                        <div className="flex items-center justify-between ml-1">
                          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground min-h-6">
                            {lang === 'fr' ? 'Configuration du Test' : 'Test Configuration'}
                          </label>
                          <div className="flex items-center gap-1 bg-muted/50 p-0.5 rounded-lg border border-border/50">
                            {[
                              { id: 'python', label: 'Python' },
                              { id: 'javascript', label: 'Node.js' },
                              { id: 'curl', label: 'cURL' },
                              { id: 'php', label: 'PHP' },
                            ].map((l) => (
                              <button
                                key={l.id}
                                onClick={() => setSelectedTestLang(l.id as any)}
                                className={cn(
                                  "px-2 py-0.5 text-[8px] font-black uppercase tracking-tighter rounded-md transition-all",
                                  selectedTestLang === l.id
                                    ? "bg-primary text-primary-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                                )}
                              >
                                {l.label}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="relative group flex-1">
                          <div className="relative flex flex-col h-full bg-[#0f111a] rounded-xl overflow-hidden border border-white/5 shadow-2xl min-h-6">
                            <div className="px-4 py-2 bg-[#0f111a] border-b border-white/5 flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="flex gap-1.5">
                                  <div className="w-2 h-2 rounded-full bg-rose-500/40" />
                                  <div className="w-2 h-2 rounded-full bg-amber-500/40" />
                                  <div className="w-2 h-2 rounded-full bg-emerald-500/40" />
                                </div>
                                <div className="h-3 w-[1px] bg-white/10 mx-1" />
                                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                                  {selectedTestLang === 'python' && 'test_api.py'}
                                  {selectedTestLang === 'javascript' && 'test_api.js'}
                                  {selectedTestLang === 'curl' && 'terminal'}
                                  {selectedTestLang === 'php' && 'test_api.php'}
                                </span>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-5 px-1.5 ml-1 text-slate-500 hover:text-white transition-colors"
                                  onClick={handleCopyTestSnippet}
                                >
                                  {isTestSnippetCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                </Button>
                              </div>
                            </div>
                            <div className="p-4 bg-[#0f111a] font-mono text-sm leading-[1.8] custom-scrollbar overflow-auto h-[400px]">
                              <div className="text-slate-400">
                                {selectedTestLang === 'python' && (
                                  <>
                                    <span className="text-purple-400">import</span> requests<br /><br />
                                    url = <span className="text-emerald-400">"{API_BASE_URL}/public/extract"</span><br />
                                    <div className="mt-1">
                                      <span>headers = {"{"}</span>
                                      <span className="text-emerald-400">"X-API-Key"</span>: <span className="text-emerald-400">"{selectedApiKey || 'YOUR_API_KEY'}"</span>
                                      <span>{"}"}</span>
                                    </div>
                                    <div className="mt-2">
                                      <span className="text-purple-400">data</span> = {"{"}
                                      <div className="pl-4">
                                        <textarea
                                          className="bg-transparent border-none text-emerald-400 outline-none w-full h-48 resize-none transition-all text-sm font-mono custom-scrollbar p-0 leading-[1.8]"
                                          value={testPayload.replace(/^{/, '').replace(/}$/, '')}
                                          onChange={(e) => {
                                            const content = e.target.value;
                                            setTestPayload(content.trim().startsWith('{') ? content : `{${content}}`);
                                          }}
                                          spellCheck={false}
                                        />
                                      </div>
                                      <span>{"}"}</span>
                                    </div>
                                    <div className="mt-2 text-slate-500">
                                      response = requests.post(url, json=data, headers=headers)<br />
                                      <span className="text-purple-400">print</span>(response.json())
                                    </div>
                                  </>
                                )}
                                {selectedTestLang === 'javascript' && (
                                  <>
                                    <span className="text-purple-400">const</span> url = <span className="text-emerald-400">"{API_BASE_URL}/public/extract"</span>;<br />
                                    <div className="mt-1">
                                      <span className="text-purple-400">const</span> headers = {"{"}<br />
                                      {"  "}<span className="text-emerald-400">"X-API-Key"</span>: <span className="text-emerald-400">"{selectedApiKey || 'YOUR_API_KEY'}"</span><br />
                                      {"}"};
                                    </div>
                                    <div className="mt-2">
                                      <span className="text-purple-400">const</span> data = {"{"}
                                      <div className="pl-4">
                                        <textarea
                                          className="bg-transparent border-none text-emerald-400 outline-none w-full h-48 resize-none transition-all text-sm font-mono custom-scrollbar p-0 leading-[1.8]"
                                          value={testPayload.replace(/^{/, '').replace(/}$/, '')}
                                          onChange={(e) => {
                                            const content = e.target.value;
                                            setTestPayload(content.trim().startsWith('{') ? content : `{${content}}`);
                                          }}
                                          spellCheck={false}
                                        />
                                      </div>
                                      <span>{"}"};</span>
                                    </div>
                                    <div className="mt-2 text-slate-500">
                                      <span className="text-purple-400">const</span> res = <span className="text-purple-400">await</span> fetch(url, {"{"} method: <span className="text-emerald-400">'POST'</span>, headers, body: JSON.stringify(data) {"}"});<br />
                                      <span className="text-purple-400">console.log</span>(<span className="text-purple-400">await</span> res.json());
                                    </div>
                                  </>
                                )}
                                {selectedTestLang === 'curl' && (
                                  <div className="flex flex-col gap-2">
                                    <div>
                                      curl -X POST <span className="text-emerald-400">"{API_BASE_URL}/public/extract"</span> \\
                                    </div>
                                    <div>
                                      {"  "}-H <span className="text-emerald-400">"X-API-Key: {selectedApiKey || 'YOUR_API_KEY'}"</span> \\
                                    </div>
                                    <div className="flex gap-1">
                                      {"  "}-d <span className="text-emerald-400">'</span>
                                      <div className="flex-1">
                                        <textarea
                                          className="bg-transparent border-none text-emerald-400 outline-none w-full h-48 resize-none transition-all text-sm font-mono custom-scrollbar p-0 leading-[1.8]"
                                          value={testPayload}
                                          onChange={(e) => setTestPayload(e.target.value)}
                                          spellCheck={false}
                                        />
                                      </div>
                                      <span className="text-emerald-400">'</span>
                                    </div>
                                  </div>
                                )}
                                {selectedTestLang === 'php' && (
                                  <>
                                    <span className="text-purple-400">&lt;?php</span><br /><br />
                                    $url = <span className="text-emerald-400">"{API_BASE_URL}/public/extract"</span>;<br />
                                    $headers = [<br />
                                    {"  "}<span className="text-emerald-400">"X-API-Key: {selectedApiKey || 'YOUR_API_KEY'}"</span><br />
                                    ];<br />
                                    <div className="mt-2">
                                      $data = [
                                      <div className="pl-4">
                                        <textarea
                                          className="bg-transparent border-none text-emerald-400 outline-none w-full h-48 resize-none transition-all text-sm font-mono custom-scrollbar p-0 leading-[1.8]"
                                          value={testPayload.replace(/^{/, '').replace(/}$/, '').replace(/"([^"]+)":/g, "'$1' =>")}
                                          onChange={(e) => {
                                            const content = e.target.value;
                                            let fullJson = content.replace(/' =>/g, '":').replace(/'/g, '"');
                                            setTestPayload(fullJson.trim().startsWith('{') ? fullJson : `{${fullJson}}`);
                                          }}
                                          spellCheck={false}
                                        />
                                      </div>
                                      ];
                                    </div>
                                    <div className="mt-2 text-slate-500">
                                      $ch = curl_init($url);<br />
                                      curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);<br />
                                      curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));<br />
                                      $res = curl_exec($ch);<br />
                                      <span className="text-purple-400">echo</span> $res;
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col space-y-2">
                        <div className="flex items-center justify-between ml-1">
                          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 min-h-6">{lang === 'fr' ? 'Résultat de l\'exécution' : 'Execution Result'}</label>
                        </div>
                        <div className="relative flex-1">
                          <div className="absolute inset-0 bg-[#0f111a] rounded-xl border border-white/5 shadow-inner overflow-hidden flex flex-col h-full">
                            <div className="px-4 py-2 bg-[#0f111a] border-b border-white/5 flex items-center justify-between">
                              <div className="flex items-center gap-2 min-h-6">
                                <Terminal className="w-3 h-3 text-slate-500" />
                                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">stdout</span>
                              </div>
                              {testResult && (
                                <Badge
                                  variant="outline"
                                  className={cn("text-[7px] font-mono uppercase px-1.5 h-4", testResult.isError ? 'text-rose-500 border-rose-500/20' : 'text-emerald-500 border-emerald-500/20')}
                                >
                                  {testResult.isError ? `Error ${testResult.status}` : 'Success'}
                                </Badge>
                              )}
                            </div>
                            {testResult ? (
                              <div className="flex-1 overflow-auto p-4 custom-scrollbar">
                                <pre className={cn("font-mono text-sm leading-[1.8]", testResult.isError ? 'text-rose-400' : 'text-emerald-400')}>
                                  {JSON.stringify(testResult, null, 2)}
                                </pre>
                              </div>
                            ) : (
                              <div className="flex-1 flex flex-col items-center justify-center text-slate-600 gap-3 p-6 text-center">
                                <Terminal className="w-8 h-8 opacity-20" />
                                <p className="text-xs font-medium leading-relaxed italic max-w-[150px]">
                                  {t.apiDocs.examples.noResponse}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Response Section */}
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/5 flex items-center justify-center text-purple-600 border border-purple-500/20 shadow-inner">
                  <Terminal className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-xl font-bold tracking-tight">{t.apiDocs.response.title}</h2>
                  <div className="h-0.5 w-8 bg-purple-500/40 rounded-full" />
                </div>
              </div>
              <Card className="border border-border/40 shadow-xl bg-[#0f111a] text-slate-300 overflow-hidden rounded-2xl ring-1 ring-white/10">
                <div className="px-6 py-4 bg-[#0f111a] border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2 bg-[#0f111a]">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-red-500/40" />
                      <div className="w-2 h-2 rounded-full bg-amber-500/40" />
                      <div className="w-2 h-2 rounded-full bg-emerald-500/40" />
                    </div>
                    <div className="h-3 w-[1px] bg-white/10 mx-2" />
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[8px] font-black text-emerald-500 uppercase tracking-[0.2em]">200 OK</span>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-mono text-white/30 border-white/10 uppercase tracking-widest px-2 py-0.5">application/json</Badge>
                </div>
                <CardContent className="p-0">
                  <div className="grid md:grid-cols-2 divide-x divide-white/5">
                    <div className="p-6 font-mono text-xs overflow-x-auto bg-[#0a0c14]">
                      <pre className="text-slate-100 leading-relaxed">
                        <span className="text-slate-500">{"{"}</span><br />
                        {"  "}<span className="text-purple-400">"text"</span>: <span className="text-emerald-400">"Hello [FIRST_NAME_1]..."</span>,<br />
                        {"  "}<span className="text-purple-400">"entities"</span>: <span className="text-slate-500">[</span><br />
                        {"    "}<span className="text-slate-500">{"{"}</span><br />
                        {"      "}<span className="text-purple-400">"value"</span>: <span className="text-emerald-400">"Jean"</span>,<br />
                        {"      "}<span className="text-purple-400">"type"</span>: <span className="text-emerald-400">"first_name"</span>,<br />
                        {"      "}<span className="text-purple-400">"score"</span>: <span className="text-amber-400">0.98</span>,<br />
                        {"      "}<span className="text-purple-400">"start"</span>: <span className="text-amber-400">6</span>,<br />
                        {"      "}<span className="text-purple-400">"end"</span>: <span className="text-amber-400">10</span><br />
                        {"    "}<span className="text-slate-500">{"}"}</span><br />
                        {"  "}<span className="text-slate-500">]</span>,<br />
                        {"  "}<span className="text-purple-400">"duration"</span>: <span className="text-amber-400">124.5</span><br />
                        <span className="text-slate-500">{"}"}</span>
                      </pre>
                    </div>
                    <div className="p-6 space-y-6 bg-white/[0.01]">
                      <div className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Field Definitions</div>
                      {[
                        { field: "text", desc: t.apiDocs.response.fields.text, type: "string" },
                        { field: "entities", desc: t.apiDocs.response.fields.entities, type: "array" },
                        { field: "duration", desc: t.apiDocs.response.fields.duration, type: "float" }
                      ].map((f, i) => (
                        <div key={i} className="space-y-1.5 group">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <code className="text-emerald-400 font-bold text-xs bg-emerald-500/5 px-1.5 py-0.5 rounded border border-emerald-500/10 transition-colors">{f.field}</code>
                              <span className="text-[8px] text-slate-600 font-mono italic">{f.type}</span>
                            </div>
                            <Badge className="bg-white/5 text-white/40 border-white/5 text-[10px] font-black uppercase tracking-tighter px-1.5 h-4">Required</Badge>
                          </div>
                          <p className="text-[10px] leading-relaxed text-slate-400 font-medium transition-colors">{f.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>

          {/* Help Card */}
          <div className="space-y-8">
            <div className="sticky top-8 space-y-8">
              <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm ring-1 ring-border/50 text-foreground overflow-hidden ">
                <CardContent className="p-8 relative">
                  <div className="relative z-10 space-y-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <HelpCircle className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold">{t.apiDocs.help.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed font-medium">
                      {t.apiDocs.help.description}
                    </p>
                    <Button variant="default" className="text-primary-foreground font-bold rounded-xl mt-4">
                      Contact Support
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}
