"use client"

import { useCallback, useEffect, useMemo, useRef } from "react"
import { cn } from "@/lib/utils"

export interface DotPatternProps {
    className?: string
    children?: React.ReactNode
    /** Dot diameter in pixels */
    dotSize?: number
    /** Gap between dots in pixels */
    gap?: number
    /** Base dot color (hex) */
    baseColor?: string
    /** Glow color on hover (hex) */
    glowColor?: string
    /** Mouse proximity radius for highlighting */
    proximity?: number
    /** Glow intensity multiplier */
    glowIntensity?: number
    /** Wave animation speed (0 to disable) */
    waveSpeed?: number
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
        ? {
            r: Number.parseInt(result[1], 16),
            g: Number.parseInt(result[2], 16),
            b: Number.parseInt(result[3], 16),
        }
        : { r: 0, g: 0, b: 0 }
}

interface Dot {
    x: number
    y: number
    baseOpacity: number
}

export function DotPattern({
    className,
    children,
    dotSize = 2,
    gap = 24,
    baseColor = "#a1a1aa", // Changed default to neutral-400 equivalent for better visibility in both modes if not overridden
    glowColor = "#22d3ee",
    proximity = 120,
    glowIntensity = 1,
    waveSpeed = 0.5,
}: DotPatternProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const dotsRef = useRef<Dot[]>([])
    const mouseRef = useRef({ x: -1000, y: -1000 })
    const animationRef = useRef<number>(0)
    const startTimeRef = useRef(Date.now())

    const baseRgb = useMemo(() => hexToRgb(baseColor), [baseColor])
    const glowRgb = useMemo(() => hexToRgb(glowColor), [glowColor])

    const buildGrid = useCallback(() => {
        const canvas = canvasRef.current
        const container = containerRef.current
        if (!canvas || !container) return

        const rect = container.getBoundingClientRect()
        const dpr = window.devicePixelRatio || 1

        canvas.width = rect.width * dpr
        canvas.height = rect.height * dpr
        canvas.style.width = `${rect.width}px`
        canvas.style.height = `${rect.height}px`

        const ctx = canvas.getContext("2d")
        if (ctx) ctx.scale(dpr, dpr)

        const cellSize = dotSize + gap
        const cols = Math.ceil(rect.width / cellSize) + 1
        const rows = Math.ceil(rect.height / cellSize) + 1

        const offsetX = (rect.width - (cols - 1) * cellSize) / 2
        const offsetY = (rect.height - (rows - 1) * cellSize) / 2

        const dots: Dot[] = []

        // Create dots grid
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                // Only push dots that are strictly inside the bounding box to avoid edge artifacts
                // or just accept all and let them be drawn
                dots.push({
                    x: offsetX + col * cellSize,
                    y: offsetY + row * cellSize,
                    baseOpacity: 0.1 + Math.random() * 0.2, // Lowered opacity for subtle background
                })
            }
        }
        dotsRef.current = dots

        // Draw immediately after building to avoid flash
        draw()
    }, [dotSize, gap])

    const draw = useCallback(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext("2d")
        if (!ctx) return

        const dpr = window.devicePixelRatio || 1
        ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr)

        const { x: mx, y: my } = mouseRef.current
        const proxSq = proximity * proximity
        const time = (Date.now() - startTimeRef.current) * 0.001 * waveSpeed

        // Optimize loop
        const dots = dotsRef.current;

        for (let i = 0; i < dots.length; i++) {
            const dot = dots[i];
            const dx = dot.x - mx
            const dy = dot.y - my
            const distSq = dx * dx + dy * dy

            // Wave animation
            const wave = Math.sin(dot.x * 0.02 + dot.y * 0.02 + time) * 0.5 + 0.5
            const waveOpacity = dot.baseOpacity + wave * 0.15
            const waveScale = 1 + wave * 0.2

            let opacity = waveOpacity
            let scale = waveScale
            let r = baseRgb.r
            let g = baseRgb.g
            let b = baseRgb.b
            let glow = 0

            // Mouse proximity effect
            if (distSq < proxSq) {
                const dist = Math.sqrt(distSq)
                const t = 1 - dist / proximity
                const easedT = t * t * (3 - 2 * t) // smoothstep

                // Interpolate color
                r = Math.round(baseRgb.r + (glowRgb.r - baseRgb.r) * easedT)
                g = Math.round(baseRgb.g + (glowRgb.g - baseRgb.g) * easedT)
                b = Math.round(baseRgb.b + (glowRgb.b - baseRgb.b) * easedT)

                opacity = Math.min(1, waveOpacity + easedT * 0.7)
                scale = waveScale + easedT * 0.8
                glow = easedT * glowIntensity
            }

            const radius = (dotSize / 2) * scale

            // Draw glow
            if (glow > 0) {
                // Use a simpler glow for performance if many dots, but radial is requested
                const gradient = ctx.createRadialGradient(dot.x, dot.y, 0, dot.x, dot.y, radius * 4)
                gradient.addColorStop(0, `rgba(${glowRgb.r}, ${glowRgb.g}, ${glowRgb.b}, ${glow * 0.4})`)
                gradient.addColorStop(1, `rgba(${glowRgb.r}, ${glowRgb.g}, ${glowRgb.b}, 0)`)

                ctx.beginPath()
                ctx.arc(dot.x, dot.y, radius * 4, 0, Math.PI * 2)
                ctx.fillStyle = gradient
                ctx.fill()
            }

            // Draw dot
            ctx.beginPath()
            ctx.arc(dot.x, dot.y, radius, 0, Math.PI * 2)
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`
            ctx.fill()
        }

        animationRef.current = requestAnimationFrame(draw)
    }, [proximity, baseRgb, glowRgb, dotSize, glowIntensity, waveSpeed])

    useEffect(() => {
        buildGrid()

        const container = containerRef.current
        if (!container) return

        const ro = new ResizeObserver(buildGrid)
        ro.observe(container)

        return () => ro.disconnect()
    }, [buildGrid])

    useEffect(() => {
        animationRef.current = requestAnimationFrame(draw)
        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current)
        }
    }, [draw])

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            // Mouse coordinates relative to the container
            const container = containerRef.current
            if (!container) return
            const rect = container.getBoundingClientRect()

            // Update mouse position reference
            mouseRef.current = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
            }
        }

        const handleMouseLeave = () => {
            mouseRef.current = { x: -1000, y: -1000 }
        }

        // Attach event listeners to the container instead of canvas 
        // to ensure we capture mouse events over the whole area
        const container = containerRef.current
        if (container) {
            container.addEventListener("mousemove", handleMouseMove)
            container.addEventListener("mouseleave", handleMouseLeave)
        }

        return () => {
            if (container) {
                container.removeEventListener("mousemove", handleMouseMove)
                container.removeEventListener("mouseleave", handleMouseLeave)
            }
        }
    }, [])

    return (
        <div
            ref={containerRef}
            className={cn("absolute inset-0 overflow-hidden", className)}
            style={{ isolation: 'isolate' }}
        >
            <canvas ref={canvasRef} className="absolute inset-0 h-full w-full pointer-events-none" />

            {/* Vignette overlay - optional, can be controlled via className or removed if not needed */}
            <div
                className="pointer-events-none absolute inset-0"
                style={{
                    background:
                        "radial-gradient(ellipse at center, transparent 0%, transparent 40%, var(--background) 100%)",
                    opacity: 0.5
                }}
            />

            {/* Content layer */}
            {children && <div className="relative z-10 h-full w-full">{children}</div>}
        </div>
    )
}
