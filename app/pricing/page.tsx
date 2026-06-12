'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { PricingSection } from '@/components/pricing-section'
import { PageLoader } from '@/components/ui/page-loader'
import { Shield, Lock, ArrowLeft, Check } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

function PricingContent() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const darkMode = localStorage.getItem('theme') === 'dark' ||
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
    setIsDark(darkMode)
    if (darkMode) document.documentElement.classList.add('dark')
  }, [])

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500">
      {/* Mini Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/dark.svg" className="w-8 dark:hidden" alt="Logo" />
            <img src="/light.svg" className="w-8 hidden dark:block" alt="Logo" />
            <span className="font-bold text-xl text-primary">Data Private</span>
            <span className="ml-auto text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">Beta</span>
          </Link>
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="font-bold">
              Accéder au Dashboard
            </Button>
          </Link>
        </div>
      </nav>

      <main className="pt-20">
        <div className="max-w-7xl mx-auto px-4 mb-8">
          <Link href="/dashboard">
            <Button variant="link" className="text-muted-foreground p-0 mb-8 flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Retour
            </Button>
          </Link>
        </div>

        <Suspense fallback={<div className="min-h-[500px] flex items-center justify-center"><PageLoader /></div>}>
          <PricingSection />
        </Suspense>
      </main>
    </div>
  )
}

export default function PricingPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <PricingContent />
    </Suspense>
  )
}
