"use client";

import * as React from "react";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useIsMobile } from "@/hooks/use-mobile"

import {
  Shield, ArrowRight, Copy, Zap, Trash2, Settings, Tags, ChevronDown, ChevronLeft,
  User, Smartphone, Key, Activity, Box, Monitor, Cpu, Bell, Check, Unlock, Lock
} from "lucide-react";

import { translations, labels_dict, getPiiColor } from "@/lib/translations";

export function EntityDetectionSection() {
  const { lang, refreshData } = useApp();
  const isMobile = useIsMobile();
  const t = translations[lang] || translations.en;

  const categoryIcons: Record<string, any> = {
    personal_identity: User,
    contact_information: Smartphone,
    financial_information: Key,
    health_information: Activity,
    sensitive_personal_information: Shield,
    professional_information: Box,
    vehicle_and_travel: Monitor,
    technical_and_digital: Cpu,
    date_and_time: Bell,
    other: Tags
  }

  // --- States ---
  const [detectionInput, setDetectionInput] = React.useState("")
  const [detectionResult, setDetectionResult] = React.useState("")
  const [originalDetectionResult, setOriginalDetectionResult] = React.useState("")
  const [detectedEntities, setDetectedEntities] = React.useState<any[]>([])
  const [isDetecting, setIsDetecting] = React.useState(false)
  const [isCopied, setIsCopied] = React.useState(false)
  const [detectionDuration, setDetectionDuration] = React.useState<number | null>(null)
  
  const [entitySidebarOpen, setEntitySidebarOpen] = React.useState(true)
  const [detectionThreshold, setDetectionThreshold] = React.useState<number>(0.1)
  
  const allLabels = React.useMemo(() => Object.values(labels_dict).flat(), [])
  const [selectedLabels, setSelectedLabels] = React.useState<string[]>(allLabels)
  const [expandedCategories, setExpandedCategories] = React.useState<string[]>(Object.keys(labels_dict))
  
  // Fetch initial PII settings
  React.useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/pii/')
        if (res.data.selected_labels && res.data.selected_labels.length > 0) {
          setSelectedLabels(res.data.selected_labels)
        }
      } catch (err) {
        console.error("Failed to fetch PII settings", err)
      }
    }
    fetchSettings()
  }, [])

  // Check if we need to close sidebar on mobile
  React.useEffect(() => {
    if (isMobile) setEntitySidebarOpen(false)
    else setEntitySidebarOpen(true)
  }, [isMobile])

  // --- Handlers ---
  const handleClearInput = () => {
    setDetectionInput("")
    setDetectionResult("")
    setOriginalDetectionResult("")
    setDetectedEntities([])
    setDetectionDuration(null)
  }

  const handleDetection = async () => {
    if (!detectionInput.trim()) return

    if (selectedLabels.length === 0) {
      setDetectionResult(detectionInput)
      setOriginalDetectionResult(detectionInput)
      setDetectedEntities([])
      setDetectionDuration(null)
      return
    }

    setIsDetecting(true)
    setDetectionDuration(null)

    try {
      const response = await api.post('/pii/extract', {
        text: detectionInput,
        labels: selectedLabels,
        threshold: detectionThreshold
      })

      const entities = response.data.entities
      const duration = response.data.duration
      setDetectedEntities(entities)
      setDetectionDuration(duration)
      let result = detectionInput
      let originalResult = detectionInput

      const sortedEntities = [...entities].sort((a: any, b: any) => b.value.length - a.value.length)
      const entityCounts: Record<string, number> = {}

      sortedEntities.forEach((ent: any) => {
        const typeKey = ent.entity.toUpperCase().replace(/[ -]/g, '_')
        if (!entityCounts[typeKey]) entityCounts[typeKey] = 1

        const count = entityCounts[typeKey]
        const placeholder = `[${typeKey}_${count}]`
        const coloredPlaceholder = `__COLOR_PII_${typeKey}_${count}__`

        const regex = new RegExp(ent.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');

        if (regex.test(result)) {
          result = result.replace(regex, coloredPlaceholder);
          originalResult = originalResult.replace(regex, placeholder);
          entityCounts[typeKey]++;
        }
      })

      setDetectionResult(result)
      setOriginalDetectionResult(originalResult)
      toast.success(lang === 'fr' ? "Détection terminée" : "Detection completed")
      if (refreshData) refreshData()
    } catch (err: any) {
      console.error("Detection failed", err)
      const errorMsg = err.response?.data?.detail || (lang === 'fr' ? "Erreur lors de la détection" : "Detection error")
      toast.error(errorMsg)
    } finally {
      setIsDetecting(false)
    }
  }

  const handleCopyResult = () => {
    if (!originalDetectionResult) return
    navigator.clipboard.writeText(originalDetectionResult)
    setIsCopied(true)
    toast.success(t.entityDetection.copied)
    setTimeout(() => setIsCopied(false), 2000)
  }

  const togglePiiLock = async (val: string) => {
    try {
      const curEntity = detectedEntities.find(e => e.value === val);
      if (!curEntity) return;
      setDetectedEntities(prev => prev.map(e => e.value === val ? { ...e, locked: !e.locked } : e));
      toast.success(lang === 'fr' ? "Statut mis à jour" : "Status updated");
    } catch (err) {
      console.error(err);
      toast.error(lang === 'fr' ? "Erreur lors de la mise à jour" : "Failed to update status");
    }
  }

  const renderDetectionResult = () => {
    if (!detectionResult) return <div className="text-muted-foreground/20 p-6 italic">{t.entityDetection.resultPlaceholder}</div>

    if (detectedEntities.length === 0) return <div className="p-6 whitespace-pre-wrap text-sm font-medium leading-[1.5]">{detectionResult}</div>

    let content = detectionResult
    const parts: React.ReactNode[] = []
    let lastIdx = 0

    const placeholderRegex = /__COLOR_PII_([A-Z0-9_]+)_(\d+)__/g
    let match

    while ((match = placeholderRegex.exec(content)) !== null) {
      const fullMatch = match[0]
      const typeKey = match[1] 
      const index = match.index

      if (index > lastIdx) {
        parts.push(<span key={`text-${lastIdx}`}>{content.slice(lastIdx, index)}</span>)
      }

      let originalType = typeKey.toLowerCase().replace(/_/g, ' ')

      Object.values(labels_dict).flat().forEach(lbl => {
        if (lbl.toUpperCase().replace(/[ -]/g, '_') === typeKey) {
          originalType = lbl
        }
      })

      const isPiiLocked = (type: string, val: string) => {
        return detectedEntities.some(e => e.value === val && (e.entity === type || e.entity.toUpperCase().replace(/[ -]/g, '_') === typeKey) && e.locked)
      }

      const entityData = detectedEntities.find(e => e.entity === originalType || e.entity.toUpperCase().replace(/[ -]/g, '_') === typeKey);

      parts.push(
        <DropdownMenu key={`badge-${index}`}>
          <DropdownMenuTrigger asChild>
            <span
              className={cn(
                "mx-1 cursor-help transition-all duration-300 font-bold",
                getPiiColor(originalType).replace(/bg-[^ ]+/g, '').replace(/border-[^ ]+/g, '')
              )}
            >
              {isPiiLocked(originalType, entityData?.value || "")
                ? entityData?.value
                : `[${typeKey}_${match[2]}]`}
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="text-xs font-bold p-2 min-w-[120px]">
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-muted-foreground uppercase tracking-widest">
                <span>{originalType}</span>
              </div>
              {entityData && (
                <div className="flex flex-col gap-1.5 mt-1 border-t border-border pt-1">
                  <div className="flex items-center justify-between">
                    <span>Confiance</span>
                    <span className={cn(
                      "font-black tracking-tighter",
                      (entityData.confidence || 0) > 0.8 ? "text-emerald-500" : "text-amber-500"
                    )}>
                      {((entityData.confidence || 0) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-foreground transition-all duration-500"
                      style={{ width: `${(entityData.confidence || 0) * 100}%` }}
                    />
                  </div>
                  <div className="flex flex-col gap-0.5 mt-1 border-t border-border pt-1">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground uppercase tracking-widest text-[8px]">{t.entityDetection.entitiesTable.value}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 rounded-md hover:bg-muted"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const val = entityData.value;
                          if (val) togglePiiLock(val);
                        }}
                      >
                        {entityData.locked ? <Unlock className="h-3 w-3 text-emerald-500" /> : <Lock className="h-3 w-3 text-muted-foreground/40" />}
                      </Button>
                    </div>
                    <span className="text-foreground break-all">{entityData.value}</span>
                  </div>
                </div>
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      )

      lastIdx = index + fullMatch.length
    }

    if (lastIdx < content.length) {
      parts.push(<span key="text-end">{content.slice(lastIdx)}</span>)
    }

    return <div className="p-6 whitespace-pre-wrap text-sm font-medium text-foreground leading-relaxed animate-in fade-in duration-500">{parts}</div>
  }

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    )
  }

  const toggleLabel = async (label: string) => {
    const newLabels = selectedLabels.includes(label)
      ? selectedLabels.filter(l => l !== label)
      : [...selectedLabels, label]

    setSelectedLabels(newLabels)
    try {
      await api.post('/pii/', { selected_labels: newLabels })
    } catch (err) {
      console.error("Failed to save settings", err)
    }
  }

  const toggleAllInCategory = async (category: string) => {
    const labels = labels_dict[category]
    const allSelected = labels.every(l => selectedLabels.includes(l))

    let newLabels: string[]
    if (allSelected) {
      newLabels = selectedLabels.filter(l => !labels.includes(l))
    } else {
      newLabels = [...new Set([...selectedLabels, ...labels])]
    }

    setSelectedLabels(newLabels)
    try {
      await api.post('/pii/', { selected_labels: newLabels })
    } catch (err) {
      console.error("Failed to save settings", err)
    }
  }

  const handleClearAllLabels = async () => {
    setSelectedLabels([])
    try {
      await api.post('/pii/', { selected_labels: [] })
    } catch (err) {
      console.error("Failed to save settings", err)
    }
  }

  return (
    <div className="flex flex-1 w-full h-full overflow-hidden bg-background">
      <div className="flex-1 flex flex-col p-4 lg:p-12 space-y-6 overflow-y-auto min-h-0 w-full">
        {!entitySidebarOpen && (
          <div className="lg:hidden flex justify-end absolute right-4 bottom-4 z-50">
            <Button variant="default" size="icon" className="h-10 w-10 rounded-full bg-primary transition-colors hover:scale-105" onClick={() => setEntitySidebarOpen(true)}>
              <Settings className="h-5 w-5 text-secondary" />
            </Button>
          </div>
        )}
        <div className="flex flex-col animate-reveal mb-2">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-black tracking-tighter bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">{t.entityDetection.title}</h1>
            <p className="text-muted-foreground text-sm font-medium">{t.entityDetection.subtitle}</p>
          </div>
        </div>

        <div className={cn("animate-reveal", isMobile ? "flex flex-col gap-2" : "flex-1 grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] lg:gap-6 items-stretch")} style={{ animationDelay: '100ms' }}>
          {/* Input Text Area */}
          <div className={cn("flex flex-col border border-border bg-card/30 overflow-hidden rounded-xl transition-all hover:border-primary/30", isMobile ? "w-full h-[400px]" : "h-[400px] lg:h-[550px]")}>
            <div className="py-3 px-5 border-b border-border/50 bg-muted/10 flex flex-row items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">{t.entityDetection.originalText}</span>
                {detectionInput && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 rounded-md hover:bg-rose-500/10 hover:text-rose-500 transition-all active:scale-90"
                    onClick={handleClearInput}
                    title={lang === 'fr' ? "Effacer" : "Clear"}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
              <Badge variant="outline" className="text-xs font-semibold uppercase border-muted-foreground/10 text-muted-foreground/40 h-6">Input</Badge>
            </div>
            <div className="flex-1 overflow-hidden h-full group/input">
              <textarea
                className="w-full h-full p-6 bg-transparent border-none focus:ring-0 resize-none text-[15px] font-medium leading-relaxed placeholder:text-muted-foreground/30 selection:bg-primary/10 transition-all focus:bg-primary/[0.01] focus:placeholder:text-muted-foreground/20 overflow-y-auto custom-scrollbar"
                placeholder={t.entityDetection.inputPlaceholder}
                value={detectionInput}
                onChange={(e) => setDetectionInput(e.target.value)}
              />
            </div>
          </div>

          {/* Central Button */}
          <div className={cn("flex flex-col items-center justify-center py-2 lg:py-0 ", isMobile ? "w-full" : "h-[400px] lg:h-[550px]")}>
            <Button
              size="icon"
              className={cn(
                " rounded-full shadow-sm transition-all group z-10",
                isDetecting ? "bg-muted text-muted-foreground animate-pulse" : "bg-primary text-primary-foreground hover:scale-105 active:scale-95",
                isMobile ? "w-[80%] " : "h-10 w-10 lg:h-12 lg:w-12"
              )}
              onClick={handleDetection}
              disabled={isDetecting}
            >
              {isDetecting ? (
                <div className="w-4 h-4 lg:w-5 lg:h-5 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
              ) : (
                isMobile ? <>Detecter Entités</> : <ArrowRight className="h-4 w-4 lg:h-5 lg:w-5 transition-transform duration-300" />
              )}
            </Button>
          </div>

          {/* Result Text Area */}
          <div className={cn(
            "h-[400px] lg:h-[550px] flex flex-col border border-border bg-card/30 overflow-hidden rounded-xl transition-all hover:border-primary/30 relative",
            isDetecting && "opacity-60"
          )}>
            <div className="py-3 px-5 border-b border-border/50 bg-muted/10 flex flex-row items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">{t.entityDetection.detectionResult}</span>
                {detectionResult && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 rounded-md hover:bg-primary/5 hover:text-primary transition-all active:scale-90"
                    onClick={handleCopyResult}
                    title={t.entityDetection.copy}
                  >
                    {isCopied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="text-xs font-semibold uppercase border-primary/10 text-primary bg-primary/5 h-6 shrink-0">Anonymized</Badge>
                {detectionDuration !== null && (
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 animate-in fade-in zoom-in duration-300">
                    <Zap className="w-2.5 h-2.5 text-amber-500" />
                    <span className="text-[9px] font-black text-amber-600 dark:text-amber-400 tabular-nums">
                      {Math.round(detectionDuration)}ms
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex-1 relative overflow-y-auto custom-scrollbar">
              {isDetecting && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/20 backdrop-blur-[1px] gap-3">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary/70 animate-pulse">
                    {lang === 'fr' ? 'Anonymisation...' : 'Anonymizing...'}
                  </span>
                </div>
              )}
              {renderDetectionResult()}
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar for settings */}
      {entitySidebarOpen && (
        <div className={cn(
          "fixed inset-0 z-50 bg-background flex flex-col lg:relative lg:w-72 lg:inset-auto lg:z-10 lg:border-l animate-in duration-300",
          isMobile ? "slide-in-from-left" : "slide-in-from-right"
        )}>
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-bold text-sm flex items-center gap-2.5 tracking-tight">
              <div className="p-1 rounded-lg bg-primary/10 text-primary">
                <Shield className="h-4 w-4" />
              </div>
              <span className="text-sm font-bold tracking-tight">{t.entityDetection.sidebarTitle || "Configuration"}</span>
            </h3>
            {isMobile && (<Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted/50 rounded-lg" onClick={() => setEntitySidebarOpen(false)}>
              <ChevronLeft className="h-5 w-5" />
            </Button>)}
          </div>

          <div className="p-6 border-b space-y-4">
            <h3 className="font-bold text-sm flex items-center gap-2.5 tracking-tight">
              {lang === 'fr' ? 'Seuils & Paramètres' : 'Thresholds & Settings'}
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">{t.entityDetection.confidenceThreshold}</label>
                <span className="text-xs font-black tracking-tighter text-primary">{Math.round(detectionThreshold * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={detectionThreshold}
                onChange={(e) => setDetectionThreshold(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-[9px] font-bold text-muted-foreground/40 uppercase">
                <span>Flexible (0%)</span>
                <span>Précis (100%)</span>
              </div>
            </div>
          </div>

          <div className="p-6 border-b space-y-1.5 bg-muted/5">
            <h3 className="font-bold text-sm flex items-center gap-2.5 tracking-tight">
              <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                <Tags className="h-4 w-4" />
              </div>
              {t.entityDetection.labelsTitle}
            </h3>
            <p className="text-[11px] text-muted-foreground pl-8 font-medium opacity-80">{t.entityDetection.labelsSubtitle}</p>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-4 space-y-3">
              {Object.entries(labels_dict).map(([category, labels], i) => {
                const isExpanded = expandedCategories.includes(category);
                const categoryLabel = t.entityDetection.categories[category] || category;
                const selectedCount = labels.filter(l => selectedLabels.includes(l)).length;
                const allSelected = labels.every(l => selectedLabels.includes(l));
                const Icon = categoryIcons[category] || Tags;

                return (
                  <div key={category} className="animate-reveal" style={{ animationDelay: `${(i + 3) * 30}ms` }}>
                    <div
                      className={`flex items-center gap-3 p-1 rounded-xl cursor-pointer transition-all group ${isExpanded ? "border border-border" : "hover:bg-muted/40"
                        }`}
                    >
                      <Button
                        className={cn(
                          "h-8 w-8 rounded-lg transition-all duration-300",
                          selectedCount > 0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground group-hover:text-primary"
                        )}
                        onClick={() => toggleAllInCategory(category)}>
                        <Icon className="h-4 w-4" />
                      </Button>

                      <div
                        className="flex-1 flex flex-row items-center justify-between overflow-hidden px-2"
                        onClick={() => toggleCategory(category)}
                      >
                        <div className="flex flex-col overflow-hidden">
                          <span className={cn("text-xs font-semibold truncate transition-colors", selectedCount > 0 ? "text-foreground" : "text-muted-foreground group-hover:text-foreground")}>{categoryLabel}</span>
                        </div>
                        <div className="flex items-center gap-2 pl-2">
                          {selectedCount > 0 && (
                            <span className="text-[10px] font-bold text-primary">{selectedCount}</span>
                          )}
                          <ChevronDown className={cn("h-3.5 w-3.5 shrink-0 transition-transform duration-300 text-muted-foreground/40", isExpanded ? "rotate-0" : "-rotate-90")} />
                        </div>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="ml-5 pl-4 border-l border-border flex flex-col gap-1 py-1 mt-1 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div
                          className="flex items-center gap-2.5 p-2 rounded-lg cursor-pointer hover:bg-muted/30 transition-all group/all"
                          onClick={() => toggleAllInCategory(category)}
                        >
                          <Checkbox
                            checked={allSelected}
                            onCheckedChange={() => toggleAllInCategory(category)}
                            onClick={(e) => e.stopPropagation()}
                            className="h-3.5 w-3.5 rounded"
                          />
                          <span className="text-[10px] font-semibold text-muted-foreground group-hover/all:text-primary transition-colors uppercase tracking-wider">
                            {lang === 'fr' ? "Tout sélectionner" : "Select all"}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 gap-0.5">
                          {labels.map(label => (
                            <div
                              key={label}
                              className={cn(
                                "flex items-center gap-2.5 p-2 px-3 rounded-lg cursor-pointer transition-all group/label",
                                selectedLabels.includes(label)
                                  ? "text-primary bg-primary/5"
                                  : "text-muted-foreground/80 hover:text-foreground hover:bg-muted/30"
                              )}
                              onClick={() => toggleLabel(label)}
                            >
                              <Checkbox
                                checked={selectedLabels.includes(label)}
                                onCheckedChange={() => toggleLabel(label)}
                                onClick={(e) => e.stopPropagation()}
                                className="h-3.5 w-3.5 rounded"
                              />
                              <span className="text-[12px] font-medium capitalize leading-none tracking-tight">{label.replace(/_/g, ' ')}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>

          <div className="p-4 border-t bg-muted/5">
            <Button
              variant="ghost"
              size="sm"
              className="w-full h-9 text-[10px] font-bold rounded-lg border border-border hover:bg-muted transition-all uppercase tracking-wider"
              onClick={handleClearAllLabels}
            >
              {lang === 'fr' ? 'Tout désélectionner' : 'Deselect all'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
