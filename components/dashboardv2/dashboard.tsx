"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useApp } from "@/lib/store";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Sidebar } from "./sidebar";
import { SidebarInset } from "@/components/ui/sidebar";
import { OverviewSection } from "./overview-section";
import { ChatSection } from "./chat-section";
import { ApiKeysSection } from "./api-keys-section";
import { EntityDetectionSection } from "./entity-detection-section";
import { ApiDocsSection } from "./api-docs-section";
import { ProfileSection } from "./profile-section";
import { DesktopSection } from "./desktop-section";
import { Shield, X, Loader2 } from "lucide-react";

function ViewWrapper({ active, children }: { active: boolean; children: React.ReactNode }) {
    if (!active) return null;

    return (
        <div className="h-full w-full flex flex-col min-h-0 min-w-0 flex-1">
            {children}
        </div>
    );
}

function DashboardContent() {
    const { activeView, isAuthenticating, user, refreshData } = useApp();
    const searchParams = useSearchParams();

    useEffect(() => {
        const sessionId = searchParams?.get("session_id");
        if (sessionId) {
            toast.success("Opération Stripe réussie !");
            refreshData();
            const currentHash = window.location.hash;
            window.history.replaceState({}, "", "/dashboard" + currentHash);
        }
    }, [searchParams, refreshData]);

    if (isAuthenticating) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-500 text-center">
                    <Loader2 className="h-12 w-12 text-primary animate-spin" />
                    <p className="text-muted-foreground font-medium animate-pulse">Chargement de votre espace...</p>
                </div>
            </div>
        )
    }

    if (!user) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-500">
                    <div className="relative">
                        <Shield className="w-16 h-16 text-muted-foreground/20" />
                        <X className="w-8 h-8 text-destructive absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    </div>
                    <div className="text-center space-y-2">
                        <h1 className="text-2xl font-bold tracking-tight">404 - Accès Non Autorisé</h1>
                        <p className="text-muted-foreground max-w-[250px]">
                            Nous n'avons pas pu charger votre profil. Veuillez vous reconnecter.
                        </p>
                        <button className="mt-4 px-4 py-2 border rounded-xl hover:bg-muted font-bold text-sm" onClick={() => window.location.href = '/login'}>
                            Retour à la connexion
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex h-screen w-full bg-background overflow-hidden font-sans text-foreground">
            <Sidebar />

            <SidebarInset className="flex-1 flex flex-col min-w-0 w-full overflow-hidden">
                <div className="flex-1 flex flex-col relative min-h-0 min-w-0 w-full">
                    <ViewWrapper active={activeView === "overview"}>
                        <OverviewSection />
                    </ViewWrapper>
                    <ViewWrapper active={activeView === "chatbot"}>
                        <ChatSection />
                    </ViewWrapper>
                    <ViewWrapper active={activeView === "api-keys"}>
                        <ApiKeysSection />
                    </ViewWrapper>
                    <ViewWrapper active={activeView === "entity-detection"}>
                        <EntityDetectionSection />
                    </ViewWrapper>
                    <ViewWrapper active={activeView === "api-docs"}>
                        <ApiDocsSection />
                    </ViewWrapper>
                    <ViewWrapper active={activeView === "profile"}>
                        <ProfileSection />
                    </ViewWrapper>
                    <ViewWrapper active={activeView === "desktop"}>
                        <DesktopSection />
                    </ViewWrapper>
                </div>
            </SidebarInset>
        </div>
    );
}

export function Dashboard() {
    return (
        <Suspense fallback={null}>
            <DashboardContent />
        </Suspense>
    );
}
