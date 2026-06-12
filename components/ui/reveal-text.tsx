"use client"

import React, { useState, useRef, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

export interface PIIToken {
  value: string
  type: string
  id?: string
}

export interface RevealTextProps {
  /** The full text to display */
  text: string
  /** Array of PIIs to mask and handle */
  piis?: PIIToken[]
  /** Radius of the reveal gradient in pixels */
  radius?: number
  /** Additional className for the container */
  className?: string
  /** Tailwing class for flashy color (e.g. text-pink-500) */
  flashyClass?: string
  /** Tailwind class for primary color (e.g. text-primary) */
  primaryClass?: string
  /** Whether to show a subtle glow following the mouse */
  showGlow?: boolean
  /** Opacity of the text when NOT revealed (0 to 1) */
  hiddenOpacity?: number
}

/**
 * RevealText component hides text by matching its color to the background.
 * A radial gradient follows the mouse to reveal the text within a certain radius.
 * PII entities are displayed as flashy badges containing their values when revealed, 
 * and switch to their [TYPE] labels in primary color when directly hovered.
 */
export function RevealText({
  text,
  piis = [],
  radius = 160,
  className,
  flashyClass = "text-blue-500",
  primaryClass = "text-primary",
  showGlow = true,
  hiddenOpacity = 0
}: RevealTextProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [mousePos, setMousePos] = useState({ x: -2000, y: -2000 })
  const [isInside, setIsInside] = useState(false)

  // Track mouse movement
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent | TouchEvent) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY

      setMousePos({
        x: clientX - rect.left,
        y: clientY - rect.top,
      })
      if (!isInside) setIsInside(true)
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("touchmove", handleMouseMove)
    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("touchmove", handleMouseMove)
    }
  }, [isInside])

  // Tokenize text into regular blocks and PII blocks
  const tokens = useMemo(() => {
    if (!piis || piis.length === 0) return [{ text, isPII: false }]

    // Collect all matches
    const matches: { start: number; end: number; type: string; value: string; id?: string }[] = []

    // We sort PIIs by length descending to match longer strings first (e.g. email before name)
    const sortedPiis = [...piis].sort((a, b) => b.value.length - a.value.length)

    // Basic greedy matching for each PII
    // Note: In a production app, this should handle overlapping matches more robustly
    sortedPiis.forEach((pii) => {
      let pos = text.indexOf(pii.value)
      while (pos !== -1) {
        // Only add if not overlapping with existing match
        const isOverlapping = matches.some(m =>
          (pos >= m.start && pos < m.end) ||
          (pos + pii.value.length > m.start && pos + pii.value.length <= m.end)
        )

        if (!isOverlapping) {
          matches.push({
            start: pos,
            end: pos + pii.value.length,
            type: pii.type,
            value: pii.value,
            id: pii.id
          })
        }
        pos = text.indexOf(pii.value, pos + 1)
      }
    })

    // Sort matches by position
    matches.sort((a, b) => a.start - b.start)

    const result: any[] = []
    let lastIndex = 0

    matches.forEach((m) => {
      // Add preceding text
      if (m.start > lastIndex) {
        result.push({ text: text.substring(lastIndex, m.start), isPII: false })
      }
      // Add PII token
      result.push({ text: m.value, type: m.type, id: m.id, isPII: true })
      lastIndex = m.end
    })

    // Add remaining text
    if (lastIndex < text.length) {
      result.push({ text: text.substring(lastIndex), isPII: false })
    }

    return result
  }, [text, piis])

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative cursor-default select-none overflow-hidden p-4 bg-background",
        className
      )}
    >
      {/* 1. Base Layer: Text shown at low opacity outside the reveal radius */}
      {/* <div 
        className="pointer-events-none transition-opacity duration-300" 
        style={{ opacity: hiddenOpacity }}
        aria-hidden="true"
      >
        {tokens.map((t, i) => (
          <span key={i} className="inline whitespace-pre-wrap">
            {t.isPII ? (
              <span className="inline-grid place-items-start">
                <span className="row-start-1 col-start-1 font-bold">[{t.type}]</span>
                <span className="row-start-1 col-start-1 font-bold">[{t.text}]</span>
              </span>
            ) : t.text}
          </span>
        ))}
      </div> */}

      {/* 2. Reveal Mask Layer: Shown within the radial gradient */}
      <div
        className="absolute inset-0 p-4 pointer-events-none select-none z-10 box-border"
        style={{
          maskImage: `radial-gradient(circle at ${mousePos.x}px ${mousePos.y}px, black 0%, transparent ${radius}px)`,
          WebkitMaskImage: `radial-gradient(circle at ${mousePos.x}px ${mousePos.y}px, black 0%, transparent ${radius}px)`,
        }}
      >
        {tokens.map((t, i) => (
          t.isPII ? (
            <InteractivePIIToken
              key={`reveal-${i}`}
              token={t}
              flashyClass={flashyClass}
            />
          ) : (
            <span
              key={`reveal-${i}`}
              className="inline whitespace-pre-wrap text-foreground"
            >
              {t.text}
            </span>
          )
        ))}
      </div>


      {/* 4. Ambient Glow Effect */}
      {showGlow && isInside && (
        <div
          className="absolute inset-0 pointer-events-none z-0 mix-blend-soft-light opacity-20"
          style={{
            background: `radial-gradient(circle at ${mousePos.x}px ${mousePos.y}px, rgba(255,255,255,0.2) 0%, transparent ${radius}px)`
          }}
        />
      )}
    </div>
  )
}

function InteractivePIIToken({
  token,
  flashyClass
}: {
  token: any,
  flashyClass: string
}) {
  const [isToggled, setIsToggled] = useState(false)

  // Format ID to match text length: uppercase, bold, and padded with spaces
  const displayId = useMemo(() => {
    const rawId = (token.id || token.type || "").toUpperCase()
    const targetLen = token.text.length

    if (rawId.length >= targetLen) {
      return rawId.substring(0, targetLen)
    }
    // Pad with spaces to keep length exactly equal to t.text
    return rawId.padEnd(targetLen, " ")
  }, [token.id, token.type, token.text])

  return (
    <span
      onClick={(e) => {
        e.stopPropagation()
        setIsToggled(!isToggled)
      }}
      className={cn(
        "inline-flex items-center px-4 py-1 mx-0.2 font-medium transition-all duration-200 pointer-events-auto cursor-pointer whitespace-pre mx-20 my-5",
        isToggled
          ? "text-white bg-background border border-background"
          : cn("rounded-lg bg-blue-500/10 border border-blue-500/20", flashyClass)
      )}
    >
      {isToggled ? token.text : token.type}
    </span>
  )
}
