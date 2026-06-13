"use client";

import React, { useEffect } from "react";
import { AppProvider, useApp } from "@/lib/store";
import { ChatSection } from "./chat-section";
import { ProfileSection } from "./profile-section";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { translations } from "@/lib/translations";

// Vue dédiée à l'app desktop : on n'affiche que la section Chat (et la section
// Profil quand l'utilisateur clique sur son compte), sans la sidebar complète.
function DesktopChatInner() {
    const { lang, activeView, setActiveView } = useApp();
    const t = translations[lang] || translations.en;

    useEffect(() => {
        setActiveView("chatbot");
    }, []);

    const isProfile = activeView === "profile";

    return (
        <div className="flex h-screen w-full bg-background overflow-hidden font-sans text-foreground">
            <div className="flex-1 flex flex-col min-w-0 w-full overflow-hidden">
                {isProfile ? (
                    <div className="flex-1 flex flex-col min-h-0 w-full overflow-hidden">
                        {/* En-tête avec retour vers le chat (il n'y a pas de sidebar en desktop) */}
                        <div className="h-16 border-b bg-background flex items-center gap-2 px-4 shrink-0">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-lg"
                                onClick={() => setActiveView("chatbot")}
                                title={lang === 'fr' ? 'Retour au chat' : 'Back to chat'}
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </Button>
                            <h2 className="text-sm font-bold tracking-tight">{t.profile?.title || (lang === 'fr' ? 'Profil' : 'Profile')}</h2>
                        </div>
                        <div className="flex-1 flex min-h-0 w-full overflow-hidden">
                            <ProfileSection />
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col relative min-h-0 min-w-0 w-full">
                        <ChatSection />
                    </div>
                )}
            </div>
        </div>
    );
}

export function DesktopChat() {
    return (
        <AppProvider>
            <DesktopChatInner />
        </AppProvider>
    );
}
