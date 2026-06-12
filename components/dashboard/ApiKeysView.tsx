import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Plus, Copy, Trash2, FileText } from "lucide-react"
import { toast } from "sonner"

interface ApiKeysViewProps {
  t: any
  lang: string
  apiKeys: any[]
  user: any
  detectionStats: any
  setIsNewKeyModalOpen: (open: boolean) => void
  handleDeleteApiKey: (id: number) => void
}

export const ApiKeysView: React.FC<ApiKeysViewProps> = ({
  t,
  lang,
  apiKeys,
  user,
  detectionStats,
  setIsNewKeyModalOpen,
  handleDeleteApiKey
}) => {
  return (
    <ScrollArea className="flex-1 p-4 lg:p-8 bg-muted/30">
      <div className="max-w-7xl mx-auto space-y-8 animate-reveal">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-black tracking-tighter bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              {t.apiKeys.title}
            </h1>
            <p className="text-muted-foreground text-sm font-medium">
              {t.apiKeys.subtitle}
            </p>
          </div>
          <Button
            className="bg-black dark:bg-white text-white dark:text-black hover:opacity-90 gap-2 h-10 px-4 rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95 border-none font-bold"
            onClick={() => setIsNewKeyModalOpen(true)}
          >
            <Plus className="w-4 h-4" />
            {t.apiKeys.newKey}
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-none shadow-sm bg-card ring-1 ring-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t.apiKeys.stats.activeKeys}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{apiKeys.filter(k => k.is_active).length} / 10</div>
              <p className="text-[10px] text-muted-foreground mt-1">{t.apiKeys.stats.accordingToPlan}</p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-card ring-1 ring-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t.apiKeys.stats.totalRequests}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{detectionStats.currentMonthRequests.toLocaleString()}</div>
              <p className="text-[10px] text-muted-foreground mt-1">{t.apiKeys.stats.thisMonth}</p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm bg-card ring-1 ring-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t.apiKeys.stats.monthlyLimit}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{user?.user_plan?.request_limit?.toLocaleString() || "50"}</div>
              <p className="text-[10px] text-muted-foreground mt-1">{t.apiKeys.stats.remaining}: {((user?.user_plan?.request_limit || 50) - detectionStats.currentMonthRequests).toLocaleString()}</p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-none shadow-sm bg-card ring-1 ring-border/50 overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg font-bold">{t.apiKeys.table.title}</CardTitle>
            <CardDescription>{t.apiKeys.table.description}</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-border/50 pb-4 bg-muted/20">
                    <th className="font-bold py-4 px-6">{t.apiKeys.table.name}</th>
                    <th className="font-bold py-4 px-2">{t.apiKeys.table.key}</th>
                    <th className="font-bold py-4 px-2">{t.apiKeys.table.created}</th>
                    <th className="font-bold py-4 px-2">{t.apiKeys.table.lastUsed}</th>
                    <th className="font-bold py-4 px-2 text-center">{t.apiKeys.table.status}</th>
                    <th className="font-bold py-4 px-2 text-right">{t.apiKeys.table.requests}</th>
                    <th className="font-bold py-4 px-6 text-right">{t.apiKeys.table.actions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {apiKeys.length > 0 ? apiKeys.map((key) => (
                    <tr key={key.id} className="group hover:bg-muted/30 transition-colors">
                      <td className="py-4 px-6 font-bold">
                        <div className="flex items-center gap-2">
                          {key.name}
                          <Badge variant="outline" className="text-[8px] uppercase font-black px-1.5 h-4">{key.type}</Badge>
                        </div>
                      </td>
                      <td
                        className="py-4 px-2 font-mono text-[10px] text-muted-foreground cursor-pointer hover:text-primary transition-colors"
                        onClick={() => {
                          navigator.clipboard.writeText(key.key)
                          toast.success(lang === 'fr' ? "Clé copiée !" : "Key copied!")
                        }}
                      >
                        <div className="flex items-center gap-2">
                          {key.key.replace(/(.{8}).+/, '$1...')}
                          <Copy className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </td>
                      <td className="py-4 px-2 text-xs text-muted-foreground">{new Date(key.created_at).toLocaleDateString()}</td>
                      <td className="py-4 px-2 text-xs text-muted-foreground">{lang === 'fr' ? "Récemment" : "Recently"}</td>
                      <td className="py-4 px-2 text-center">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full transition-all",
                            key.is_active
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                              : "bg-rose-500/10 text-rose-600 border-rose-500/20"
                          )}
                        >
                          {key.is_active ? (lang === 'fr' ? "Active" : "Active") : (lang === 'fr' ? "Inactive" : "Inactive")}
                        </Badge>
                      </td>
                      <td className="py-4 px-2 text-right font-bold text-xs">{key.request_count.toLocaleString()}</td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl hover:bg-background">
                            <FileText className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-xl hover:bg-rose-500/10 hover:text-rose-500"
                            onClick={() => handleDeleteApiKey(key.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-muted-foreground italic">
                        {lang === 'fr' ? "Aucune clé API trouvée" : "No API keys found"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  )
}
