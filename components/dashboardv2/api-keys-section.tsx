"use client"

import React, { useState } from "react"
import { useApp } from "@/lib/store"
import { translations } from "@/lib/translations"
import api from "@/lib/api"
import { toast } from "sonner"
import { useIsMobile } from "@/hooks/use-mobile"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Copy, Trash2, Key } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { ScrollArea } from "../ui/scroll-area"

export function ApiKeysSection() {
    const { lang, apiKeys, setApiKeys, detectionStats, userConsumption, user } = useApp()
    const t = translations[lang]
    const isMobile = useIsMobile()

    const [isNewKeyModalOpen, setIsNewKeyModalOpen] = useState(false)
    const [newKeyData, setNewKeyData] = useState({ name: "", type: "dev", request_limit: null as number | null, expires_at: "" })
    const [createdKey, setCreatedKey] = useState<string | null>(null)
    const [isCreatingKey, setIsCreatingKey] = useState(false)

    const isTokenBased = userConsumption?.type === 'token'
    const usageValue = isTokenBased ? userConsumption?.usage : apiKeys.reduce((acc, k) => acc + k.request_count, 0)
    const usageLimit = isTokenBased ? userConsumption?.limit : (user?.user_plan?.request_limit || 50)

    const handleCreateApiKey = async () => {
        if (!newKeyData.name) {
            toast.error(lang === 'fr' ? "Le nom de la clé est requis" : "Key name is required")
            return
        }
        setIsCreatingKey(true)
        try {
            const dataToSubmit = { ...newKeyData }
            if (!dataToSubmit.expires_at) delete (dataToSubmit as any).expires_at
            if (dataToSubmit.request_limit === null) delete (dataToSubmit as any).request_limit

            const res = await api.post('/api-keys/', dataToSubmit)
            const newKey = res.data
            setCreatedKey(newKey.key)

            const refreshRes = await api.get('/api-keys/')
            setApiKeys(refreshRes.data)
            toast.success(lang === 'fr' ? "Clé créée avec succès" : "Key created successfully")
        } catch (err) {
            toast.error(lang === 'fr' ? "Erreur lors de la création de la clé" : "Error creating key")
        } finally {
            setIsCreatingKey(false)
        }
    }

    const handleDeleteApiKey = async (id: string) => {
        if (!confirm(lang === 'fr' ? "Êtes-vous sûr de vouloir supprimer cette clé ?" : "Are you sure you want to delete this key?")) return
        try {
            await api.delete(`/api-keys/${id}`)
            setApiKeys(apiKeys.filter(k => k.id !== id))
            toast.success(lang === 'fr' ? "Clé supprimée" : "Key deleted")
        } catch (err) {
            toast.error(lang === 'fr' ? "Erreur lors de la suppression" : "Error deleting key")
        }
    }

    const handleCopyApiKey = (keyString: string) => {
        navigator.clipboard.writeText(keyString)
        toast.success(lang === 'fr' ? "Clé copiée !" : "Key copied!")
    }

    return (
        <ScrollArea className="flex-1 w-full h-full bg-background">
            <div className="flex-1 p-6 lg:p-10 overflow-y-auto space-y-6">
                <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                        <div className="space-y-1">
                            <h1 className="text-3xl font-black tracking-tight text-foreground">{t.apiKeys.title}</h1>
                            <p className="text-muted-foreground font-medium">{t.apiKeys.subtitle}</p>
                        </div>
                        <Button
                            onClick={() => setIsNewKeyModalOpen(true)}
                            className="bg-foreground text-background hover:bg-foreground/90 gap-2 h-11 px-8 rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95 font-bold"
                        >
                            <Plus className="w-4 h-4" />
                            {t.apiKeys.newKey}
                        </Button>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card className="border-border/50 bg-card/50 shadow-sm transition-all hover:shadow-md">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t.apiKeys.stats.activeKeys}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-black">{apiKeys.filter(k => k.is_active).length} / 10</div>
                                <p className="text-xs font-medium text-muted-foreground mt-1">{t.apiKeys.stats.accordingToPlan}</p>
                            </CardContent>
                        </Card>
                        <Card className="border-border/50 bg-card/50 shadow-sm transition-all hover:shadow-md">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t.apiKeys.stats.totalRequests}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-black">{detectionStats?.currentMonthRequests?.toLocaleString() || 0}</div>
                                <p className="text-xs font-medium text-muted-foreground mt-1">{t.apiKeys.stats.thisMonth}</p>
                            </CardContent>
                        </Card>
                        <Card className="border-border/50 bg-card/50 shadow-sm transition-all hover:shadow-md">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                    {isTokenBased ? (lang === 'fr' ? 'Limite (Tokens)' : 'Limit (Tokens)') : t.apiKeys.stats.monthlyLimit}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-black">{usageLimit?.toLocaleString() || "50"}</div>
                                <p className="text-xs font-medium text-muted-foreground mt-1">
                                    {isTokenBased ? (lang === 'fr' ? 'Restants' : 'Remaining') : t.apiKeys.stats.remaining}: {((usageLimit || 50) - (usageValue || 0)).toLocaleString()}
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="border-border/50 bg-card shadow-sm overflow-hidden">
                        <CardHeader className="border-b border-border/50 bg-muted/30 pb-4">
                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                <Key className="w-5 h-5 text-primary" />
                                {t.apiKeys.table.title}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                {apiKeys.length === 0 ? (
                                    <div className="p-12 text-center flex flex-col items-center justify-center">
                                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4 border border-border">
                                            <Key className="w-8 h-8 text-muted-foreground/50" />
                                        </div>
                                        <p className="text-muted-foreground font-medium mb-6">
                                            {lang === 'fr' ? "Vous n'avez pas encore de clé API." : "You don't have any API keys yet."}
                                        </p>
                                        <Button onClick={() => setIsNewKeyModalOpen(true)} className="rounded-xl px-8 font-bold">
                                            <Plus className="w-4 h-4 mr-2" />
                                            {t.apiKeys.newKey}
                                        </Button>
                                    </div>
                                ) : (
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-border bg-muted/20">
                                                <th className="font-bold py-4 px-6 text-left">{t.apiKeys.table.name}</th>
                                                {!isMobile && <th className="font-bold py-4 px-6 text-left">{t.apiKeys.table.key}</th>}
                                                {!isMobile && <th className="font-bold py-4 px-6 text-left">{t.apiKeys.table.created}</th>}
                                                <th className="font-bold py-4 px-6 text-center">{t.apiKeys.table.status}</th>
                                                {!isMobile && <th className="font-bold py-4 px-6 text-right">{t.apiKeys.table.requests}</th>}
                                                <th className="font-bold py-4 px-6 text-right">{t.apiKeys.table.actions}</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border/50">
                                            {apiKeys.map((key) => (
                                                <tr key={key.id} className="group hover:bg-muted/30 transition-colors">
                                                    <td className="py-4 px-6">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-bold">{key.name}</span>
                                                            <Badge variant="secondary" className="text-[9px] uppercase font-bold tracking-wider">{key.type}</Badge>
                                                        </div>
                                                    </td>
                                                    {!isMobile && (
                                                        <td className="py-4 px-6 font-mono text-xs text-muted-foreground" >
                                                            <div
                                                                className="flex items-center gap-2 hover:text-primary transition-colors cursor-pointer w-fit"
                                                                onClick={() => handleCopyApiKey(key.key)}
                                                            >
                                                                <span>{key.key.replace(/(.{8}).+/, '$1...')}</span>
                                                                <Copy className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                            </div>
                                                        </td>
                                                    )}
                                                    {!isMobile && <td className="py-4 px-6 text-muted-foreground font-medium">{new Date(key.created_at).toLocaleDateString()}</td>}
                                                    <td className="py-4 px-6 text-center">
                                                        <Badge
                                                            variant="outline"
                                                            className={cn(
                                                                "text-[10px] uppercase font-bold px-3 py-1 border-transparent",
                                                                key.is_active
                                                                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                                                                    : "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                                                            )}
                                                        >
                                                            {key.is_active ? (lang === 'fr' ? "Active" : "Active") : (lang === 'fr' ? "Inactive" : "Inactive")}
                                                        </Badge>
                                                    </td>
                                                    {!isMobile && <td className="py-4 px-6 text-right font-bold text-muted-foreground">{key.request_count?.toLocaleString()}</td>}
                                                    <td className="py-4 px-6 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-muted" onClick={() => handleCopyApiKey(key.key)}>
                                                                <Copy className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 rounded-lg hover:bg-rose-500/10 hover:text-rose-600 text-rose-500/70 transition-colors"
                                                                onClick={() => handleDeleteApiKey(key.id)}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Dialog
                        open={isNewKeyModalOpen}
                        onOpenChange={(open) => {
                            setIsNewKeyModalOpen(open);
                            if (!open) setCreatedKey(null);
                        }}
                    >
                        <DialogContent className="sm:max-w-[425px] rounded-2xl p-6">
                            <DialogHeader className="mb-4">
                                <DialogTitle className="text-xl font-bold">{t.apiKeys.modal.title}</DialogTitle>
                                <DialogDescription className="font-medium text-sm">
                                    {createdKey
                                        ? (lang === 'fr'
                                            ? "Votre nouvelle clé API a été générée. Veuillez la copier maintenant."
                                            : "Your new API key has been generated. Please copy it now.")
                                        : t.apiKeys.subtitle}
                                </DialogDescription>
                            </DialogHeader>

                            {createdKey ? (
                                <div className="space-y-6">
                                    <div className="p-4 bg-muted border-2 border-primary/20 rounded-xl flex items-center justify-between gap-3 shadow-inner">
                                        <code className="text-sm font-mono break-all font-medium text-foreground">{createdKey}</code>
                                        <Button
                                            variant="default"
                                            size="icon"
                                            className="shrink-0 rounded-lg shadow-sm"
                                            onClick={() => handleCopyApiKey(createdKey)}
                                        >
                                            <Copy className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                                        <p className="text-[11px] text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider text-center flex items-center justify-center gap-2">
                                            <span>⚠️</span>
                                            {lang === 'fr'
                                                ? "Cette clé ne sera plus jamais affichée"
                                                : "This key will never be shown again"}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-5">
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">{t.apiKeys.modal.nameLabel}</label>
                                        <Input
                                            placeholder={t.apiKeys.modal.namePlaceholder}
                                            value={newKeyData.name}
                                            onChange={(e) => setNewKeyData(prev => ({ ...prev, name: e.target.value }))}
                                            className="h-11 rounded-xl font-medium"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">{t.apiKeys.modal.typeLabel}</label>
                                        <Select
                                            value={newKeyData.type}
                                            onValueChange={(val) => setNewKeyData(prev => ({ ...prev, type: val }))}
                                        >
                                            <SelectTrigger className="h-11 rounded-xl font-medium">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl">
                                                <SelectItem value="dev">Development</SelectItem>
                                                <SelectItem value="test">Test</SelectItem>
                                                <SelectItem value="prod">Production</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">{t.apiKeys.modal.expirationLabel}</label>
                                            <Input
                                                type="date"
                                                className="h-11 rounded-xl font-medium"
                                                onChange={(e) => setNewKeyData(prev => ({ ...prev, expires_at: e.target.value }))}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">{t.apiKeys.modal.limitLabel}</label>
                                            <Input
                                                type="number"
                                                placeholder={t.apiKeys.modal.unlimited}
                                                className="h-11 rounded-xl font-medium"
                                                onChange={(e) => setNewKeyData(prev => ({ ...prev, request_limit: parseInt(e.target.value) || null }))}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <DialogFooter className="mt-6 gap-2 sm:gap-0">
                                {createdKey ? (
                                    <Button
                                        onClick={() => {
                                            setIsNewKeyModalOpen(false)
                                            setCreatedKey(null)
                                            setNewKeyData({ name: "", type: "dev", request_limit: null, expires_at: "" })
                                        }}
                                        className="w-full bg-foreground text-background h-11 rounded-xl font-bold text-base"
                                    >
                                        {lang === 'fr' ? "Terminer" : "Done"}
                                    </Button>
                                ) : (
                                    <>
                                        <Button variant="ghost" onClick={() => setIsNewKeyModalOpen(false)} className="h-11 rounded-xl font-bold">
                                            {t.apiKeys.modal.cancel}
                                        </Button>
                                        <Button
                                            onClick={handleCreateApiKey}
                                            disabled={isCreatingKey}
                                            className="h-11 rounded-xl font-bold bg-foreground text-background px-6 shadow-md"
                                        >
                                            {isCreatingKey ? (lang === 'fr' ? "Création..." : "Creating...") : t.apiKeys.modal.create}
                                        </Button>
                                    </>
                                )}
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </ScrollArea>
    )
}
