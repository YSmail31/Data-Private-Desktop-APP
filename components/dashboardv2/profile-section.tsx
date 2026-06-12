"use client"
import React from "react"
import { useApp } from "@/lib/store"
import { translations, getInitials } from "@/lib/translations"
import api from "@/lib/api"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Lock, Rocket, ShieldCheck, Check, Settings, EyeOff, Eye, Unlock, Zap, Copy, Square } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

import { cn } from "@/lib/utils"
import { PricingSection } from "@/components/pricing-section"



export function ProfileSection() {
    const { lang, user, setUser, userConsumption, apiKeys, openRouterKeyInfo } = useApp()
    const t = translations[lang]

    const [isEditingProfile, setIsEditingProfile] = React.useState(false)
    const [editedUser, setEditedUser] = React.useState({ full_name: user?.full_name || "", company: user?.company || "" })
    const [isUpdatingProfile, setIsUpdatingProfile] = React.useState(false)

    const [isChangingPassword, setIsChangingPassword] = React.useState(false)
    const [passwordData, setPasswordData] = React.useState({ old_password: "", new_password: "", confirm_password: "" })
    const [isUpdatingPassword, setIsUpdatingPassword] = React.useState(false)
    const [showOldPassword, setShowOldPassword] = React.useState(false)
    const [showNewPassword, setShowNewPassword] = React.useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = React.useState(false)

    const [isPlanModalOpen, setIsPlanModalOpen] = React.useState(false)
    const [isProcessingPlan, setIsProcessingPlan] = React.useState(false)
    const [selectedBillingCycle, setSelectedBillingCycle] = React.useState<'monthly' | 'yearly'>('monthly')

    const isTokenBased = userConsumption?.type === 'token'
    const usageValue = isTokenBased ? userConsumption?.usage : apiKeys.reduce((acc, k) => acc + k.request_count, 0)
    const usageLimit = isTokenBased ? userConsumption?.limit : (user?.user_plan?.request_limit || 50)
    const usageLabel = isTokenBased ? (lang === 'fr' ? 'Tokens' : 'Tokens') : t.overview.apiUsage.requests
    const usagePercent = Math.min(100, Math.max(0, (usageValue / (usageLimit || 1)) * 100))

    const handleUpdateProfile = async () => {
        if (!editedUser.full_name.trim()) {
            toast.error(lang === 'fr' ? "Le nom complet est requis" : "Full name is required")
            return
        }
        setIsUpdatingProfile(true)
        try {
            const res = await api.put('/auth/me', editedUser)
            setUser(res.data)
            setIsEditingProfile(false)
            toast.success(t.profile.updateSuccess)
        } catch (err) {
            toast.error(t.profile.updateError)
        } finally {
            setIsUpdatingProfile(false)
        }
    }

    const handleUpdatePassword = async () => {
        const hasPassword = user?.has_password !== false;
        if ((hasPassword && !passwordData.old_password) || !passwordData.new_password || !passwordData.confirm_password) {
            toast.error(lang === 'fr' ? "Veuillez remplir tous les champs" : "Please fill in all fields")
            return
        }
        if (passwordData.new_password !== passwordData.confirm_password) {
            toast.error(t.profile.passwordMismatch)
            return
        }
        if (passwordData.new_password.length < 8) {
            toast.error(lang === 'fr' ? "Le mot de passe doit contenir au moins 8 caractères" : "Password must be at least 8 characters long")
            return
        }

        setIsUpdatingPassword(true)
        try {
            await api.put('/auth/me/password', {
                old_password: passwordData.old_password,
                new_password: passwordData.new_password
            })
            toast.success(t.profile.passwordSuccess)
            setPasswordData({ old_password: "", new_password: "", confirm_password: "" })
            setIsChangingPassword(false)
        } catch (err: any) {
            const errorMsg = err.response?.data?.detail || t.profile.passwordError
            toast.error(errorMsg)
        } finally {
            setIsUpdatingPassword(false)
        }
    }

    const handleOpenStripePortal = async (isUpdate: boolean = false) => {
        try {
            const res = await api.get('/stripe/portal');
            if (res.data.url) {
                let finalUrl = res.data.url;
                if (isUpdate && user?.stripe_subscription_id) {
                    finalUrl += `/subscriptions/${user.stripe_subscription_id}/update`;
                }
                window.location.href = finalUrl;
            }
        } catch (err: any) {
            toast.error(err.response?.data?.detail || "Erreur lors de l'accès au portail");
        }
    }

    const handleUpdatePlan = async (planId: string) => {
        setIsProcessingPlan(true);
        try {
            await api.post('/stripe/update', { plan_name: planId, billing_cycle: selectedBillingCycle });
            toast.success(lang === 'fr' ? "Abonnement mis à jour avec succès (appliqué à la prochaine facture si proration=none)." : "Subscription updated successfully.");
            const res = await api.get('/auth/me');
            setUser(res.data);
            setIsPlanModalOpen(false);
        } catch (err: any) {
            toast.error(err.response?.data?.detail || "Erreur");
        } finally {
            setIsProcessingPlan(false);
        }
    }

    const handleBuyCredits = async (packId: string) => {
        try {
            const res = await api.post('/stripe/create-credits-checkout', { pack_id: packId });
            if (res.data.checkout_url) {
                window.location.href = res.data.checkout_url;
            }
        } catch (err: any) {
            toast.error(err.response?.data?.detail || "Erreur");
        }
    }

    return (
        <div className="flex-1 p-6 lg:p-10 overflow-y-auto">
            <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="space-y-2">
                    <h1 className="text-3xl font-black tracking-tight text-foreground">{t.profile.title}</h1>
                    <p className="text-muted-foreground font-medium">{t.profile.subtitle}</p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Infos persos */}
                    <div className="space-y-6">
                        <Card className="border-border/50 bg-card/50 shadow-sm relative overflow-hidden">
                            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/10 space-y-0">
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <User className="w-5 h-5 text-primary" />
                                    {t.profile.personalInfo}
                                </CardTitle>
                                {!isEditingProfile ? (
                                    <button
                                        className="h-8 px-2 flex items-center gap-2 text-xs font-bold rounded-lg hover:bg-primary/10 hover:text-primary transition-all text-muted-foreground"
                                        onClick={() => {
                                            setEditedUser({ full_name: user?.full_name || "", company: user?.company || "" })
                                            setIsEditingProfile(true)
                                        }}
                                    >
                                        <Settings className="h-3.5 w-3.5" />
                                        {t.profile.edit}
                                    </button>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <button
                                            className="h-8 px-2 text-xs font-bold rounded-lg hover:bg-muted text-muted-foreground"
                                            onClick={() => setIsEditingProfile(false)}
                                            disabled={isUpdatingProfile}
                                        >
                                            {t.profile.cancel}
                                        </button>
                                        <button
                                            className="h-8 px-3 text-xs font-bold rounded-lg bg-primary text-primary-foreground flex items-center gap-1"
                                            onClick={handleUpdateProfile}
                                            disabled={isUpdatingProfile}
                                        >
                                            {isUpdatingProfile ? (
                                                <div className="h-3.5 w-3.5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                                            ) : (
                                                <Check className="h-3.5 w-3.5" />
                                            )}
                                            {t.profile.save}
                                        </button>
                                    </div>
                                )}
                            </CardHeader>
                            <CardContent className="space-y-6 pt-6">
                                <div className="flex items-center gap-4 border-b border-border/50 pb-4">
                                    <div className="h-16 w-16 bg-primary/10 border-2 border-primary/20 rounded-full flex items-center justify-center">
                                        <span className="text-primary text-xl font-black uppercase">
                                            {getInitials(user?.full_name)}
                                        </span>
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="font-bold text-lg leading-none">{user?.full_name || "---"}</h3>
                                        <p className="text-sm text-muted-foreground/80 font-medium">{user?.email}</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{t.profile.fullName}</label>
                                        {isEditingProfile ? (
                                            <Input
                                                value={editedUser.full_name}
                                                onChange={(e) => setEditedUser(prev => ({ ...prev, full_name: e.target.value }))}
                                                className="h-10 rounded-xl bg-background/50 border-border/50 focus:border-primary/20 transition-all font-medium text-sm"
                                                placeholder={t.profile.fullName}
                                            />
                                        ) : (
                                            <div className="p-3 rounded-xl bg-muted/30 border border-border/50 font-medium text-sm">
                                                {user?.full_name || "---"}
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{t.profile.email}</label>
                                        <div className="p-3 rounded-xl bg-muted/30 border border-border/50 font-medium text-sm text-muted-foreground flex items-center justify-between group">
                                            {user?.email}
                                            <Lock className="h-3 w-3 opacity-20 group-hover:opacity-50 transition-opacity" />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{t.profile.company}</label>
                                        {isEditingProfile ? (
                                            <Input
                                                value={editedUser.company}
                                                onChange={(e) => setEditedUser(prev => ({ ...prev, company: e.target.value }))}
                                                className="h-10 rounded-xl bg-background/50 border-border/50 focus:border-primary/20 transition-all font-medium text-sm"
                                                placeholder={t.profile.company}
                                            />
                                        ) : (
                                            <div className="p-3 rounded-xl bg-muted/30 border border-border/50 font-medium text-sm">
                                                {user?.company || "—"}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border-border/50 bg-card/50 shadow-sm relative">
                            <CardHeader className="pb-3 border-b border-border/10">
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Lock className="w-5 h-5 text-primary" />
                                    {t.profile.security}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                {!isChangingPassword && false ? (
                                    <button
                                        onClick={() => setIsChangingPassword(true)}
                                        className="w-full justify-start h-12 rounded-xl flex items-center gap-3 px-4 bg-muted/30 border border-border/50 hover:bg-primary/5 hover:text-primary hover:border-primary/20 transition-all font-bold text-sm"
                                    >
                                        <Unlock className="w-4 h-4" />
                                        {t.profile.changePassword}
                                    </button>
                                ) : (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                        {user?.has_password !== false && (
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">{t.profile.oldPassword}</label>
                                                <div className="relative">
                                                    <Input
                                                        type={showOldPassword ? "text" : "password"}
                                                        value={passwordData.old_password}
                                                        onChange={(e) => setPasswordData(prev => ({ ...prev, old_password: e.target.value }))}
                                                        className="rounded-xl pr-10"
                                                        placeholder="••••••••"
                                                    />
                                                    <button
                                                        className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground"
                                                        onClick={() => setShowOldPassword(!showOldPassword)}
                                                    >
                                                        {showOldPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">{t.profile.newPassword}</label>
                                            <div className="relative">
                                                <Input
                                                    type={showNewPassword ? "text" : "password"}
                                                    value={passwordData.new_password}
                                                    onChange={(e) => setPasswordData(prev => ({ ...prev, new_password: e.target.value }))}
                                                    className="rounded-xl pr-10"
                                                    placeholder="••••••••"
                                                />
                                                <button
                                                    className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground"
                                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                                >
                                                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">{t.profile.confirmPassword}</label>
                                            <div className="relative">
                                                <Input
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    value={passwordData.confirm_password}
                                                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirm_password: e.target.value }))}
                                                    className="rounded-xl pr-10"
                                                    placeholder="••••••••"
                                                />
                                                <button
                                                    className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                >
                                                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 pt-2">
                                            <Button
                                                onClick={handleUpdatePassword}
                                                disabled={isUpdatingPassword}
                                                className="flex-1 rounded-xl h-10 font-bold"
                                            >
                                                {isUpdatingPassword ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                                                        <span>{t.profile.save}...</span>
                                                    </div>
                                                ) : t.profile.save}
                                            </Button>
                                            {/* <Button
                                                variant="outline"
                                                onClick={() => {
                                                    setIsChangingPassword(false)
                                                    setPasswordData({ old_password: "", new_password: "", confirm_password: "" })
                                                }}
                                                disabled={isUpdatingPassword}
                                                className="rounded-xl h-10 font-bold"
                                            >
                                                {t.profile.cancel}
                                            </Button> */}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                    <div className="space-y-6">
                        <Card className="border-border/50 bg-card/50 shadow-sm relative overflow-hidden">
                            <CardHeader className="pb-3 border-b border-border/10">
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Rocket className="w-5 h-5 text-primary" />
                                    {lang === 'fr' ? 'Abonnement & Crédits' : 'Subscription & Credits'}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-6">
                                <div className="flex items-center justify-between p-4 rounded-2xl bg-primary/5 border border-primary/10">
                                    <div>
                                        <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">{t.profile.currentPlan}</p>
                                        <h3 className="text-2xl font-black flex items-center gap-2">
                                            {user?.user_plan?.name?.toUpperCase() || "FREE"}
                                            {user?.billing_cycle ? (user.billing_cycle === 'yearly' ? ' (An)' : ' (Mois)') : ''}
                                            {user?.stripe_status === 'trialing' && (
                                                <Badge className="bg-amber-500 hover:bg-amber-600 text-white font-black px-2 py-0.5 rounded-md border-none shadow-sm animate-pulse">
                                                    {t.profile.trial}
                                                </Badge>
                                            )}
                                        </h3>
                                        <p className="text-[10px] text-muted-foreground uppercase font-bold mt-1">
                                            {user?.stripe_status === 'trialing'
                                                ? (lang === 'fr' ? `Période d'essai active` : 'Active Trial Period')
                                                : (user?.stripe_status === 'active' ? (lang === 'fr' ? 'Abonnement Actif' : 'Active Subscription') : (lang === 'fr' ? 'Paiement en attente' : 'Payment pending'))}
                                        </p>
                                    </div>
                                    <div className="text-right flex flex-col items-end">
                                        <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">{lang === 'fr' ? 'Crédits OpenRouter' : 'OpenRouter Credits'}</p>
                                        <h3 className="text-2xl font-black text-emerald-500 mb-1">
                                            {openRouterKeyInfo?.limit
                                                ? ((openRouterKeyInfo.limit_remaining ?? (openRouterKeyInfo.limit - openRouterKeyInfo.usage)) * 100).toLocaleString(undefined, { maximumFractionDigits: 1 }) + ' Crédits'
                                                : ((user?.credits_balance || 0) * 100).toLocaleString() + ' Crédits'}
                                        </h3>
                                        {openRouterKeyInfo && (
                                            <div className="w-32 mt-1 animate-in fade-in slide-in-from-right-2">
                                                <div className="flex justify-between text-[9px] text-muted-foreground mb-1.5 font-bold uppercase tracking-wider">
                                                    <span>{((openRouterKeyInfo.limit - (openRouterKeyInfo.limit_remaining ?? (openRouterKeyInfo.limit - openRouterKeyInfo.usage))) * 100).toLocaleString(undefined, { maximumFractionDigits: 1 })} {lang === 'fr' ? 'Utilisés' : 'Used'}</span>
                                                    <span>{(openRouterKeyInfo.limit * 100).toLocaleString(undefined, { maximumFractionDigits: 0 })} MAX</span>
                                                </div>
                                                <Progress value={Math.min(100, Math.max(0, ((openRouterKeyInfo.limit - (openRouterKeyInfo.limit_remaining ?? (openRouterKeyInfo.limit - openRouterKeyInfo.usage))) / (openRouterKeyInfo.limit || 1)) * 100))} className="h-1.5 bg-emerald-500/20 [&>div]:bg-emerald-500" />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="font-medium text-muted-foreground">{lang === 'fr' ? 'Renouvellement mensuel' : 'Monthly renewal'}</span>
                                        <span className="font-bold">{((user?.monthly_credit || 0) * 100).toLocaleString(undefined, { maximumFractionDigits: 0 })} Crédits</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="font-medium text-muted-foreground">{user?.stripe_status === 'trialing' ? t.profile.trialExpiresAt : (lang === 'fr' ? 'Prochain crédit' : 'Next credit grant')}</span>
                                        <span className="font-bold">
                                            {user?.stripe_status === 'trialing'
                                                ? ((user as any).trial_end_date || user.stripe_period_end ? new Date((user as any).trial_end_date || user.stripe_period_end!).toLocaleDateString() : '---')
                                                : (user?.next_credit_grant ? new Date(user.next_credit_grant).toLocaleDateString() : '---')}
                                        </span>
                                    </div>
                                </div>


                                <div className="flex flex-col gap-3">
                                    <div className="grid grid-rows-2 gap-3">
                                        <Button
                                            onClick={() => setIsPlanModalOpen(true)}
                                            className="w-full bg-primary text-primary-foreground font-bold rounded-xl h-11 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                            disabled={user?.stripe_status === 'canceled'}
                                        >
                                            <Settings className="w-4 h-4" />
                                            {lang === 'fr' ? 'Modifier l\'abonnement' : 'Modify Subscription'}
                                        </Button>
                                        <Button
                                            onClick={() => handleOpenStripePortal(false)}
                                            variant="destructive"
                                            className="w-full font-bold rounded-xl h-11 shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                            disabled={user?.stripe_status === 'canceled' || !user?.stripe_subscription_id}
                                        >
                                            {lang === 'fr' ? 'Résilier' : 'Cancel or Manage'}
                                        </Button>
                                    </div>
                                    <p className="text-[10px] text-center text-muted-foreground font-medium italic">
                                        {lang === 'fr' ? '* Le nouveau plan s\'appliquera après la fin de celui en cours.' : '* New plan will apply after current one ends.'}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-border/50 bg-card/50 shadow-sm relative overflow-hidden">
                            <CardHeader className="pb-3 border-b border-border/10">
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Zap className="w-5 h-5" />
                                    {lang === 'fr' ? 'Recharge ponctuelle' : 'One-time Top-up'}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-4">
                                <div className="grid grid-cols-3 gap-3 gap-y-13">
                                    {[
                                        { id: '7', euros: 10, credits: 600 },
                                        { id: '8', euros: 50, credits: 4000, best: true },
                                        { id: '9', euros: 100, credits: 9000 }
                                    ].map(pack => (
                                        <button
                                            key={pack.id}
                                            onClick={() => handleBuyCredits(pack.id)}
                                            className={cn(
                                                "relative p-3 rounded-2xl border transition-all flex flex-col items-center gap-1 group overflow-hidden",
                                                pack.best
                                                    ? "bg-zinc-950 text-white z-10 dark:bg-zinc-50 dark:text-zinc-90 hover:bg-primary hover:ring-2 hover:ring-primary"
                                                    : "bg-muted/30 border-border/50 hover:border-primary/20 hover:bg-primary/5 hover:ring-2 hover:ring-primary"
                                            )}
                                        >
                                            <span className="text-xl font-black">{pack.credits}</span>
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase">{lang === 'fr' ? 'Crédits' : 'Credits'}</span>
                                            <div className={cn("mt-2 text-sm font-black bg-foreground/5 w-full py-1 rounded-lg", pack.best ? "bg-white text-black" : "")}>
                                                {pack.euros}€
                                            </div>
                                        </button>
                                    ))}
                                    {[
                                        { id: '10', euros: 10, requests: 1000 },
                                        { id: '11', euros: 50, requests: 6000, best: true },
                                        { id: '12', euros: 100, requests: 15000 }
                                    ].map(pack => (
                                        <button
                                            key={pack.id}
                                            onClick={() => handleBuyCredits(pack.id)}
                                            className={cn(
                                                "relative p-3 rounded-2xl border transition-all flex flex-col items-center gap-1 group overflow-hidden",
                                                pack.best
                                                    ? "bg-zinc-950 text-white z-10 dark:bg-zinc-50 dark:text-zinc-90 hover:bg-primary hover:ring-2 hover:ring-primary"
                                                    : "bg-muted/30 border-border/50 hover:border-primary/20 hover:bg-primary/5 hover:ring-2 hover:ring-primary"
                                            )}
                                        >
                                            <span className="text-xl font-black">{pack.requests}</span>
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase">{lang === 'fr' ? 'Requêtes' : 'Requests'}</span>
                                            <div className={cn("mt-2 text-sm font-black bg-foreground/5 w-full py-1 rounded-lg", pack.best ? "bg-white text-black" : "")}>
                                                {pack.euros}€
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            <Dialog open={isPlanModalOpen} onOpenChange={setIsPlanModalOpen}>
                <DialogContent className="max-w-[95vw] lg:max-w-6xl max-h-[90vh] overflow-y-auto bg-card/95 border-border/50 backdrop-blur-xl p-0">
                    <PricingSection
                        isModal={true}
                        currentPlanId={user?.plan_id ? user?.user_plan?.name?.toLowerCase() : undefined}
                        currentBillingCycle={user?.billing_cycle}
                    />
                </DialogContent>
            </Dialog>
        </div>
    )
}
