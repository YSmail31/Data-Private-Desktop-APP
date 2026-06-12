"use client"

import React, { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { ArrowRight } from "lucide-react"

export interface Tag {
  value: string
  fr_type: string
  en_type: string
  initialRevealed?: boolean
}

export interface RevealTagsProps {
  /** Array of tag objects with type and value */
  tags: Tag[]
  /** Additional container classes */
  className?: string
  /** Number of marquee rows */
  rows?: number
  /** Base duration for marquee animation */
  speed?: number
  /** Current language (fr or en) */
  lang?: 'fr' | 'en'
}

/**
 * RevealTags displays multiple rows of moving tags.
 * Background tags are semi-transparent/watermarked.
 * Hovering a tag reveals its secure value with a vibrant animation.
 */
export function RevealTags({
  tags = [],
  className,
  rows = 6,
  speed = 1.5,
  lang = 'en'
}: RevealTagsProps) {
  // Centralize the 4 signature colors
  const COLORS = [
    { text: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
    { text: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    { text: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/20" },
    { text: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/20" }
  ]

  // Prepare rows with consistent rotated order and unique revealed states
  const tagRows = useMemo(() => {
    return Array.from({ length: rows }).map((_, rIdx) => {
      // Rotate tags based on row index for a staggered but consistent look
      const shift = rIdx % tags.length
      const rotated = [...tags.slice(shift), ...tags.slice(0, shift)]

      // Repeat to ensure marquee coverage
      const fullRow = [...rotated, ...rotated, ...rotated, ...rotated]

      // Track which tag values have already been marked as revealed in this row
      const revealedInRow = new Set<string>()

      return fullRow.map((tag, tInRowIdx) => {
        // Find index of the tag in original array to assign a consistent color
        const originalIdx = tags.findIndex(t => t.value === tag.value && t.en_type === tag.en_type)
        const color = COLORS[originalIdx % COLORS.length]

        // Reveal the first instance of each tag within this row
        const key = `${tag.value}::${tag.en_type}`
        const isFirstInRow = !revealedInRow.has(key)
        if (isFirstInRow) revealedInRow.add(key)

        return {
          ...tag,
          color,
          initialRevealed: isFirstInRow
        }
      })
    })
  }, [tags, rows])

  return (
    <div
      className={cn(
        "relative w-[120%] -left-[10%] h-full overflow-hidden flex flex-col justify-center gap-6 py-12 select-none",
        "bg-background [mask-image:radial-gradient(circle_at_center,black_20%,transparent_80%)]",
        className
      )}
    >
      {tagRows.map((row, idx) => (
        <MarqueeRow
          key={idx}
          rowIndex={idx}
          tags={row}
          direction={idx % 2 === 0 ? "left" : "right"}
          // Consistent speed based on the provided prop duration
          speed={60 / (speed || 1)}
          // Opacity distribution: 50% are fully opaque, others are 0.5 - 0.8
          baseOpacity={idx % 4 === 0 ? 0.5 : idx % 4 === 1 ? 0.8 : 1.0}
          blur={idx % 5 === 0 ? "blur-[1px]" : "blur-none"}
          lang={lang}
        />
      ))}
    </div>
  )
}

function MarqueeRow({
  tags,
  direction,
  speed,
  baseOpacity,
  blur,
  rowIndex,
  lang
}: {
  tags: (Tag & { color: any })[],
  direction: "left" | "right",
  speed: number,
  baseOpacity: number,
  blur: string,
  rowIndex: number,
  lang: 'fr' | 'en'
}) {
  return (
    <div className={cn("flex gap-8 whitespace-nowrap", blur)}>
      <motion.div
        className="flex gap-8"
        animate={{
          x: direction === "left" ? [0, "-50%"] : ["-50%", 0]
        }}
        transition={{
          duration: speed,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        {tags.map((tag, i) => (
          <TagItem
            key={`${tag.en_type}-${i}`}
            tag={tag}
            color={tag.color}
            baseOpacity={baseOpacity}
            blur={i % 3 === 0}
            initialRevealed={tag.initialRevealed}
            lang={lang}
          />
        ))}
      </motion.div>
    </div>
  )
}

function TagItem({ tag, color, baseOpacity, blur, initialRevealed = false, lang }: {
  tag: Tag,
  color: { text: string, bg: string, border: string },
  baseOpacity: number,
  blur?: boolean,
  initialRevealed?: boolean,
  lang: 'fr' | 'en'
}) {
  const [isRevealed, setIsRevealed] = useState(initialRevealed)

  const label = lang === 'fr' ? tag.fr_type : tag.en_type

  return (
    <motion.div
      onClick={() => setIsRevealed(!isRevealed)}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      animate={{
        scale: isRevealed ? 1.05 : 1,
        opacity: isRevealed ? 1 : baseOpacity,
        zIndex: isRevealed ? 50 : 1
      }}
      className={cn(
        "flex items-center gap-4 px-4 py-1.5 transition-all cursor-pointer mx-1 rounded-full",
        !isRevealed && blur && "blur-[2px]",
        isRevealed
          ? cn("bg-background shadow-xl border-2", color.text, color.border)
          : cn("text-foreground/40")
      )}
    >
      <span className="font-black text-1xl lg:text-[20px] tracking-tighter uppercase font-mono text-center">
        {isRevealed ? tag.value : label}
      </span>
    </motion.div>
  )
}
