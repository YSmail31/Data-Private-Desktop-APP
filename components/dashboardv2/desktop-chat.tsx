"use client";

import React, { useEffect } from "react";
import { AppProvider, useApp } from "@/lib/store";
import { ChatSection } from "./chat-section";

// Vue dédiée à l'app desktop : on n'affiche que la section Chat,
// sans sidebar ni garde d'authentification.
function DesktopChatInner() {
    const { setActiveView } = useApp();

    useEffect(() => {
        setActiveView("chatbot");
    }, []);

    return (
        <div className="flex h-screen w-full bg-background overflow-hidden font-sans text-foreground">
            <div className="flex-1 flex flex-col min-w-0 w-full overflow-hidden">
                <div className="flex-1 flex flex-col relative min-h-0 min-w-0 w-full">
                    <ChatSection />
                </div>
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
