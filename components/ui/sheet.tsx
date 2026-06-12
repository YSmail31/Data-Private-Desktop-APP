"use client"

import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

const Sheet = ({ children, open, onOpenChange }: { children: React.ReactNode, open?: boolean, onOpenChange?: (open: boolean) => void }) => {
  const [isOpen, setIsOpen] = React.useState(open || false)

  React.useEffect(() => {
    if (open !== undefined) setIsOpen(open)
  }, [open])

  const handleOpenChange = (val: boolean) => {
    setIsOpen(val)
    onOpenChange?.(val)
  }

  return (
    <SheetContext.Provider value={{ isOpen, setIsOpen: handleOpenChange }}>
      {children}
    </SheetContext.Provider>
  )
}

const SheetContext = React.createContext<{ isOpen: boolean, setIsOpen: (val: boolean) => void }>({
  isOpen: false,
  setIsOpen: () => { },
})

const SheetTrigger = ({ children, asChild }: { children: React.ReactNode, asChild?: boolean }) => {
  const { setIsOpen } = React.useContext(SheetContext)
  return (
    <div onClick={() => setIsOpen(true)}>
      {children}
    </div>
  )
}

const SheetContent = ({ side = "right", className, children }: { side?: "left" | "right", className?: string, children: React.ReactNode }) => {
  const { isOpen, setIsOpen } = React.useContext(SheetContext)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex">
      <div
        className="fixed inset-0 bg-black/80 transition-opacity"
        onClick={() => setIsOpen(false)}
      />
      <div className={cn(
        "fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out h-full w-3/4 sm:max-w-sm",
        side === "right" ? "right-0 border-l" : "left-0 border-r",
        className
      )}>
        {children}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
      </div>
    </div>
  )
}

const SheetHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-2 text-center sm:text-left", className)} {...props} />
)

const SheetTitle = ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={cn("text-lg font-semibold text-foreground", className)} {...props} />
)

const SheetClose = ({ children, asChild }: { children: React.ReactNode, asChild?: boolean }) => {
  const { setIsOpen } = React.useContext(SheetContext)
  return (
    <div onClick={() => setIsOpen(false)} className="cursor-pointer">
      {children}
    </div>
  )
}

export { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetClose }
