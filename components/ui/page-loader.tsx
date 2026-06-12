"use client"

import * as React from "react"
import { Shield } from "lucide-react"
import { Badge } from "./badge"

export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background fixed inset-0 z-[100]">
      <div className="flex flex-col items-center gap-4">
        <img src="/dark.svg" className="w-20 dark:hidden" alt="Logo" />
        <img src="/light.svg" className="w-20 hidden dark:block" alt="Logo" />
        <div className="font-bold text-2xl text-primary">Data Private</div>
        <span className="ml-auto text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">Beta</span>
        <div className="w-48 h-1.5 bg-muted rounded-full overflow-hidden">
          <div className="w-full h-full bg-foreground animate-progress origin-left" />
        </div>
      </div>
    </div>
  )
}
