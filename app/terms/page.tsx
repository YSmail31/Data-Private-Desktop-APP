'use client'

import React, { useState, useEffect } from "react"
import { PageLoader } from "@/components/ui/page-loader"
import { Shield, Lock, FileText, Scale, ShoppingCart, ArrowLeft, ChevronRight, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

export default function TermsPage() {
    const [isPageLoading, setIsPageLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'privacy' | 'cgu' | 'cgv'>('privacy')

    useEffect(() => {
        const darkMode = localStorage.getItem('theme') === 'dark' ||
            (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
        if (darkMode) document.documentElement.classList.add('dark')

        const timer = setTimeout(() => {
            setIsPageLoading(false)
        }, 500)
        return () => clearTimeout(timer)
    }, [])

    if (isPageLoading) return <PageLoader />

    const tabs = [
        { id: 'privacy', label: 'Confidentialité', icon: Shield },
        { id: 'cgu', label: 'CGU', icon: Scale },
        { id: 'cgv', label: 'CGV', icon: ShoppingCart },
    ]

    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-primary/10 transition-colors duration-500">
            {/* Header */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                    <div className="flex items-center justify-between h-16">
                        <Link href="/" className="flex items-center gap-2 group">
                            <img src="/dark.svg" className="w-8 dark:hidden" alt="Logo" />
                            <img src="/light.svg" className="w-8 hidden dark:block" alt="Logo" />
                            <span className="font-bold text-xl text-primary">Data Private</span>
                            <span className="ml-auto text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">Beta</span>
                        </Link>
                        <Link href="/">
                            <button className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                                <ArrowLeft className="w-4 h-4" />
                                Retour
                            </button>
                        </Link>
                    </div>
                </div>
            </nav>

            <main className="pt-32 pb-20 px-4 sm:px-6">
                <div className="max-w-5xl mx-auto">
                    {/* Hero Section */}
                    <div className="mb-12 animate-reveal">
                        <h1 className="text-4xl sm:text-5xl font-black mb-6 tracking-tighter">
                            Cadre <span className="text-muted-foreground">Légal</span>
                        </h1>
                        <p className="text-lg text-muted-foreground font-medium max-w-2xl">
                            Consultez nos conditions générales et notre politique de protection des données pour comprendre comment nous opérons.
                        </p>
                    </div>

                    {/* Tabs */}
                    <div className="flex flex-wrap gap-2 mb-12 animate-reveal" style={{ animationDelay: '50ms' }}>
                        {tabs.map((tab) => {
                            const Icon = tab.icon
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={cn(
                                        "flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all duration-300",
                                        activeTab === tab.id
                                            ? "bg-foreground text-background shadow-lg shadow-foreground/10"
                                            : "bg-muted/50 hover:bg-muted text-muted-foreground"
                                    )}
                                >
                                    <Icon className="w-4 h-4" />
                                    {tab.label}
                                </button>
                            )
                        })}
                    </div>

                    {/* Content Area */}
                    <div className="grid lg:grid-cols-[1fr_280px] gap-12 items-start animate-reveal" style={{ animationDelay: '100ms' }}>
                        <div className="bg-card rounded-[32px] border border-border p-8 sm:p-12 shadow-sm min-h-[600px]">
                            {activeTab === 'privacy' && <PrivacyContent />}
                            {activeTab === 'cgu' && <CGUContent />}
                            {activeTab === 'cgv' && <CGVContent />}
                        </div>

                        {/* Sidebar info */}
                        <aside className="space-y-6 sticky top-24 hidden lg:block">
                            <div className="p-6 rounded-3xl bg-primary/5 border border-primary/10">
                                <h3 className="font-bold mb-3 flex items-center gap-2">
                                    <Lock className="w-4 h-4 text-primary" />
                                    Sécurité Maximale
                                </h3>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    Toutes vos données sont traitées conformément aux standards de sécurité les plus stricts et hébergées en France.
                                </p>
                            </div>
                            <div className="p-6 rounded-3xl bg-muted/30 border border-border">
                                <h3 className="font-bold mb-3">Besoin d'aide ?</h3>
                                <p className="text-xs text-muted-foreground mb-4">
                                    Des questions sur nos conditions ? Contactez notre équipe juridique.
                                </p>
                                <a href="mailto:contact@private-data.ai" className="text-xs font-bold underline hover:text-primary transition-colors">
                                    contact@private-data.ai
                                </a>
                            </div>
                        </aside>
                    </div>
                </div>
            </main>
        </div>
    )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
    return <h2 className="text-2xl font-black mb-6 mt-12 first:mt-0 flex items-center gap-3 tracking-tighter">{children}</h2>
}

function SubTitle({ children }: { children: React.ReactNode }) {
    return <h3 className="text-lg font-bold mb-4 mt-8 text-foreground/80">{children}</h3>
}

function Text({ children }: { children: React.ReactNode }) {
    return <p className="text-muted-foreground leading-relaxed mb-4">{children}</p>
}

function List({ items }: { items: string[] }) {
    return (
        <ul className="space-y-3 mb-6">
            {items.map((item, i) => (
                <li key={i} className="flex gap-3 text-sm text-muted-foreground leading-relaxed">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    {item}
                </li>
            ))}
        </ul>
    )
}

function PrivacyContent() {
    return (
        <div className="prose prose-sm dark:prose-invert max-w-none">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-border">
                <h1 className="text-3xl font-black tracking-tighter">Politique de confidentialité</h1>
                <span className="text-xs font-bold bg-muted px-3 py-1 rounded-full text-muted-foreground">Maj : 2 Mars 2026</span>
            </div>

            <SectionTitle>1. Responsable du traitement</SectionTitle>
            <div className="bg-muted/50 p-6 rounded-2xl border border-border mb-8">
                <p className="font-bold mb-2">Private AI</p>
                <p className="text-sm text-muted-foreground">RC : 26B1022508-00/16</p>
                <p className="text-sm text-muted-foreground">Dounia Parc, Dely Brahim, Hébergée chez Algeria Venture, Alger, Algérie</p>
                <p className="text-sm font-bold mt-2 text-primary">Email : contact@private-data.ai</p>
            </div>

            <SectionTitle>2. Données collectées</SectionTitle>
            <Text>Nous collectons uniquement les données strictement nécessaires à nos activités :</Text>
            <List items={[
                "Données d’identification (nom, prénom, email professionnel)",
                "Données de contact",
                "Données liées à l’utilisation de la plateforme",
                "Données techniques (logs, IP, métadonnées techniques)"
            ]} />
            <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 text-sm font-medium mb-8">
                💡 Aucune donnée sensible n’est conservée en clair dans le cadre du fonctionnement normal de la plateforme.
            </div>

            <SectionTitle>3. Finalités du traitement</SectionTitle>
            <Text>Les données sont collectées pour :</Text>
            <List items={[
                "Fournir et exploiter la plateforme Private Data",
                "Assurer la sécurité des systèmes",
                "Améliorer nos services",
                "Répondre aux demandes de contact",
                "Respecter nos obligations légales"
            ]} />

            <SectionTitle>4. Base légale</SectionTitle>
            <List items={[
                "L’exécution d’un contrat (clients)",
                "L’intérêt légitime (sécurité, amélioration des services)",
                "Le consentement (formulaires de contact)"
            ]} />

            <SectionTitle>5. Hébergement des données</SectionTitle>
            <Text>Les services sont hébergés sur Amazon Web Services (AWS) – Région France (Paris).</Text>
            <Text>Des mesures techniques et organisationnelles sont mises en place afin d’assurer la confidentialité, l’intégrité et la disponibilité des données.</Text>

            <SectionTitle>6. Conservation des données</SectionTitle>
            <Text>Les données sont conservées :</Text>
            <List items={[
                "Pendant la durée contractuelle",
                "Puis archivées ou supprimées conformément aux obligations légales",
                "Les logs techniques sont conservés pour une durée limitée à des fins de sécurité"
            ]} />

            <SectionTitle>7. Droits des utilisateurs</SectionTitle>
            <Text>Conformément au RGPD, vous disposez des droits suivants :</Text>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-8">
                {['Accès', 'Rectification', 'Effacement', 'Opposition', 'Limitation', 'Portabilité'].map(d => (
                    <div key={d} className="px-4 py-2 bg-muted/50 rounded-lg text-xs font-bold text-center border border-border/50">{d}</div>
                ))}
            </div>
            <Text>Pour exercer ces droits : <span className="font-bold underline">contact@private-data.ai</span></Text>

            <SectionTitle>8. Sécurité</SectionTitle>
            <List items={[
                "Chiffrement des données",
                "Contrôle d’accès strict",
                "Journalisation et monitoring",
                "Isolation des environnements"
            ]} />
        </div>
    )
}

function CGUContent() {
    return (
        <div className="prose prose-sm dark:prose-invert max-w-none">
            <h1 className="text-3xl font-black tracking-tighter mb-8 pb-4 border-b border-border">Conditions Générales d’Utilisation</h1>

            <SectionTitle>1. Objet</SectionTitle>
            <Text>Les présentes CGU définissent les conditions d’accès et d’utilisation du site private-data.ai et de la plateforme associée.</Text>

            <SectionTitle>2. Accès au service</SectionTitle>
            <Text>L’accès à la plateforme peut nécessiter :</Text>
            <List items={[
                "La création d’un compte professionnel",
                "Une validation contractuelle préalable"
            ]} />
            <Text>Private AI se réserve le droit de suspendre ou restreindre l’accès en cas de non-respect des présentes conditions.</Text>

            <SectionTitle>3. Propriété intellectuelle</SectionTitle>
            <Text>Tous les contenus, technologies, modèles et codes sources sont la propriété exclusive de Private AI.</Text>
            <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-bold mb-8">
                Toute reproduction ou exploitation non autorisée est interdite.
            </div>

            <SectionTitle>4. Responsabilité</SectionTitle>
            <Text>Private AI met en œuvre tous les moyens raisonnables pour assurer la disponibilité et la sécurité du service.</Text>
            <SubTitle>Limitations</SubTitle>
            <Text>La société ne saurait être tenue responsable en cas d’interruption temporaire, de mauvaise utilisation du service ou de force majeure.</Text>

            <SectionTitle>5. Droit applicable</SectionTitle>
            <Text>Les présentes CGU sont régies par le droit algérien.</Text>
        </div>
    )
}

function CGVContent() {
    return (
        <div className="prose prose-sm dark:prose-invert max-w-none">
            <h1 className="text-3xl font-black tracking-tighter mb-8 pb-4 border-b border-border">Conditions Générales de Vente</h1>

            <SectionTitle>1. Objet</SectionTitle>
            <Text>Les présentes CGV encadrent la fourniture de la plateforme Private Data en mode SaaS ou licence.</Text>

            <SectionTitle>2. Prestations</SectionTitle>
            <Text>Private AI fournit :</Text>
            <List items={[
                "Accès à la plateforme d’anonymisation",
                "Support technique selon contrat",
                "Maintenance corrective"
            ]} />

            <SectionTitle>3. Tarification</SectionTitle>
            <Text>Les prix sont définis contractuellement. Les conditions de paiement sont précisées dans le devis ou contrat signé.</Text>

            <SectionTitle>4. Confidentialité</SectionTitle>
            <Text>Les parties s’engagent à conserver confidentielles les informations échangées.</Text>

            <SectionTitle>5. Protection des données</SectionTitle>
            <Text>Private AI agit soit comme sous-traitant (si traitement pour le compte du client), soit comme responsable de traitement selon le contexte. Un DPA (Data Processing Agreement) peut être annexé au contrat.</Text>

            <SectionTitle>6. Limitation de responsabilité</SectionTitle>
            <Text>La responsabilité de Private AI est limitée au montant payé par le client sur la période contractuelle en cours.</Text>

            <SectionTitle>7. Résiliation</SectionTitle>
            <Text>Les modalités de résiliation sont définies contractuellement.</Text>
        </div>
    )
}
