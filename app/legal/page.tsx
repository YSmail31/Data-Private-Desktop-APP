'use client'

import React, { useState, useEffect } from "react"
import { PageLoader } from "@/components/ui/page-loader"
import { Shield, Mail, MapPin, Building2, User, Globe, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Badge } from "@/components/ui/badge"

export default function LegalPage() {
    const [isDark, setIsDark] = useState(false)
    const [isPageLoading, setIsPageLoading] = useState(true)

    useEffect(() => {
        const darkMode = localStorage.getItem('theme') === 'dark' ||
            (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
        setIsDark(darkMode)
        if (darkMode) document.documentElement.classList.add('dark')

        const timer = setTimeout(() => {
            setIsPageLoading(false)
        }, 500)
        return () => clearTimeout(timer)
    }, [])

    if (isPageLoading) return <PageLoader />

    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-primary/10 transition-colors duration-500">
            {/* Header */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
                <div className="max-w-5xl mx-auto px-4 sm:px-6">
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
                <div className="max-w-3xl mx-auto">
                    {/* Hero Section */}
                    <div className="mb-16 animate-reveal">
                        <h1 className="text-4xl sm:text-5xl font-black mb-6 tracking-tighter">
                            Mentions <span className="text-muted-foreground">légales</span>
                        </h1>
                        <p className="text-lg text-muted-foreground font-medium">
                            Informations obligatoires concernant l'éditeur du site et l'hébergement.
                        </p>
                    </div>

                    <div className="space-y-12 animate-reveal" style={{ animationDelay: '100ms' }}>
                        {/* Editeur */}
                        <section className="group p-8 rounded-3xl bg-muted/30 border border-border hover:border-primary/20 transition-all duration-300">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                    <Building2 className="w-5 h-5 text-primary" />
                                </div>
                                <h2 className="text-xl font-bold">Éditeur du site</h2>
                            </div>

                            <div className="space-y-4">
                                <p className="text-muted-foreground leading-relaxed">
                                    Le site <span className="text-foreground font-semibold font-mono">private-data.ai</span> est édité par :
                                </p>
                                <div className="bg-background/50 p-6 rounded-2xl border border-border/50 space-y-3">
                                    <p className="font-bold text-lg">Private AI</p>
                                    <p className="text-sm text-muted-foreground">
                                        Entreprise innovante bénéficiant du statut <span className="text-foreground font-semibold">Projet Innovant</span> délivré par le Ministère de l’Économie de la Connaissance, des Startups et des Micro-entreprises en Algérie.
                                    </p>
                                    <p className="text-sm flex items-center gap-2">
                                        <span className="text-muted-foreground">RC :</span>
                                        <span className="font-mono bg-muted px-2 py-0.5 rounded text-xs font-bold">26B1022508-00/16</span>
                                        <span className="text-muted-foreground">Enregistrée à Alger.</span>
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Adresse */}
                        <section className="group p-8 rounded-3xl bg-muted/30 border border-border hover:border-primary/20 transition-all duration-300">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                    <MapPin className="w-5 h-5 text-primary" />
                                </div>
                                <h2 className="text-xl font-bold">Adresse</h2>
                            </div>
                            <div className="bg-background/50 p-6 rounded-2xl border border-border/50 text-muted-foreground leading-relaxed">
                                <p>Dounia Parc, Dely Brahim</p>
                                <p>Hébergée au sein de l’accélérateur Algeria Venture</p>
                                <p>Alger, Algérie</p>
                            </div>
                        </section>

                        {/* Direction */}
                        <section className="group p-8 rounded-3xl bg-muted/30 border border-border hover:border-primary/20 transition-all duration-300">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                    <User className="w-5 h-5 text-primary" />
                                </div>
                                <h2 className="text-xl font-bold">Direction</h2>
                            </div>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div className="bg-background/50 p-6 rounded-2xl border border-border/50">
                                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Présidente / CEO</p>
                                    <p className="font-bold">Nadia Khedrougui</p>
                                </div>
                                <div className="bg-background/50 p-6 rounded-2xl border border-border/50">
                                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Directrice publication</p>
                                    <p className="font-bold">Nadia Khedrougui</p>
                                </div>
                            </div>
                        </section>

                        {/* Contact */}
                        <section className="group p-8 rounded-3xl bg-muted/30 border border-border hover:border-primary/20 transition-all duration-300">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                    <Mail className="w-5 h-5 text-primary" />
                                </div>
                                <h2 className="text-xl font-bold">Contact</h2>
                            </div>
                            <div className="bg-background/50 p-6 rounded-2xl border border-border/50">
                                <p className="text-muted-foreground mb-3">Pour toute demande d’information :</p>
                                <a href="mailto:contact@private-data.ai" className="text-xl font-black hover:text-primary transition-colors flex items-center gap-2 underline decoration-primary/30 underline-offset-4">
                                    contact@private-data.ai
                                </a>
                            </div>
                        </section>

                        {/* Hébergement */}
                        <section className="group p-8 rounded-3xl bg-muted/30 border border-border hover:border-primary/20 transition-all duration-300">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                    <Globe className="w-5 h-5 text-primary" />
                                </div>
                                <h2 className="text-xl font-bold">Hébergement</h2>
                            </div>
                            <div className="bg-background/50 p-6 rounded-2xl border border-border/50 space-y-4">
                                <p className="text-muted-foreground italic">Le site est hébergé par :</p>
                                <div>
                                    <p className="font-bold text-lg mb-1">Amazon Web Services (AWS)</p>
                                    <p className="text-sm font-semibold text-primary mb-3">Région d’hébergement : France (Paris)</p>
                                </div>
                                <div className="text-sm text-muted-foreground leading-relaxed pt-4 border-t border-border/50">
                                    <p>Amazon Web Services EMEA SARL</p>
                                    <p>38 Avenue John F. Kennedy</p>
                                    <p>L-1855 Luxembourg</p>
                                </div>
                            </div>
                        </section>
                    </div>

                    <footer className="mt-20 pt-8 border-t border-border/50 text-center">
                        <p className="text-sm text-muted-foreground">
                            © 2026 Private AI. Tous droits réservés.
                        </p>
                    </footer>
                </div>
            </main>
        </div>
    )
}
