'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

import { DesktopChat } from "@/components/dashboardv2/desktop-chat"
import { isTauriRuntime } from "@/lib/platform"
import { PageLoader } from '@/components/ui/page-loader'

// En desktop (Tauri) on ouvre directement le chat ; en web on garde la landing.
export default function Page() {
  const [mounted, setMounted] = useState(false)
  const [isDesktop, setIsDesktop] = useState(false)
  const [hasToken, setHasToken] = useState(false)

  useEffect(() => {
    setMounted(true)
    const desktop = isTauriRuntime()
    setIsDesktop(desktop)
    if (desktop) {
      // App desktop : on garde l'authentification. Sans token, on envoie
      // l'utilisateur sur la page de login avant d'afficher le chat.
      const token = localStorage.getItem('token')
      if (!token) {
        window.location.href = '/login'
        return
      }
      setHasToken(true)
    }
  }, [])

  if (mounted && isDesktop) {
    return hasToken ? <DesktopChat /> : null
  }

  return <LandingPage />
}

function LandingPage() {
  const [isDark, setIsDark] = useState(false)
  return (
    <div className={cn("min-h-screen", isDark && "dark")}>
      <PageLoader />
    </div>
  )
}




