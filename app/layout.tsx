import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { Toaster } from "sonner"
import InactivityHandler from "@/components/auth/InactivityHandler"
import Script from "next/script"

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Data Private - Protection de données personnelles pour LLMs",
  description:
    "Solution d'entreprise pour détecter et anonymiser vos données sensibles avant d'utiliser les LLMs.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <InactivityHandler />
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  )
}
