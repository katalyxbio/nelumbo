import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Velvet LoadingIndicator (Material 3 Expressive style)
 *
 *   <LoadingIndicator />                       // aria-label defaults to "Loading"
 *   <LoadingIndicator contained />
 *   <LoadingIndicator color="brand" size={64} />
 *
 * A soft shape that morphs through seven forms (burst, cookie, pentagon,
 * pill, sun, clover, oval) while it turns, springing into each one. Use it
 * for short waits you can't measure, where a spinner would feel mechanical:
 * pull to refresh, a card or page loading, a button that has handed off its
 * work. For progress you can measure, use Progress or CircularProgress.
 *
 * - `contained`: on a filled circle, for use over images or busy content.
 * - `color`: "default" (black, white in dark mode) or "brand".
 * - `size`: the container in px (default 48); the shape is 38/48 of it.
 *
 * With reduced motion the shape stays still and gently pulses.
 */

const POINTS = 72

type Radius = (theta: number) => number

const cookie = (lobes: number, depth: number): Radius => (t) => 1 + depth * Math.cos(lobes * t)
const ellipse = (ratio: number, turn: number): Radius => (t) => {
  const a = t - turn
  return ratio / Math.hypot(ratio * Math.cos(a), Math.sin(a))
}
const polygon = (sides: number, softness: number): Radius => (t) => {
  const seg = (Math.PI * 2) / sides
  const m = (((t % seg) + seg) % seg) - seg / 2
  const sharp = Math.cos(seg / 2) / Math.cos(m)
  return sharp * (1 - softness) + softness * (1 + Math.cos(seg / 2)) / 2
}

// The sequence, as radius functions of the angle from 12 o'clock.
const SHAPES: Radius[] = [
  cookie(10, 0.085), // soft burst
  cookie(9, 0.065), // cookie
  polygon(5, 0.45), // pentagon
  ellipse(0.56, Math.PI / 4), // pill
  cookie(8, 0.045), // sunny
  cookie(4, 0.13), // clover
  ellipse(0.74, -Math.PI / 4), // oval
]

function toPolygon(r: Radius) {
  const rs = Array.from({ length: POINTS }, (_, k) => r((k / POINTS) * Math.PI * 2))
  const peak = Math.max(...rs)
  const pts = rs.map((v, k) => {
    const t = (k / POINTS) * Math.PI * 2
    const n = v / peak
    return `${(50 + 50 * n * Math.sin(t)).toFixed(2)}% ${(50 - 50 * n * Math.cos(t)).toFixed(2)}%`
  })
  return `polygon(${pts.join(",")})`
}

const STEP_MS = 650
const TURN = 720 / SHAPES.length // two turns per cycle, so the loop is seamless

const CSS = (() => {
  const polys = SHAPES.map(toPolygon)
  const frames = [...polys, polys[0]]
    .map((poly, i) => {
      const at = ((i / SHAPES.length) * 100).toFixed(3)
      return `${at}% { clip-path: ${poly}; transform: rotate(${(i * TURN).toFixed(2)}deg); animation-timing-function: var(--ease-spring, cubic-bezier(0.2, 0, 0, 1)) }`
    })
    .join("\n")
  return `
@keyframes vlv-morph {
${frames}
}
@keyframes vlv-pulse { 50% { transform: scale(0.86); opacity: 0.7 } }
.vlv-morph { clip-path: ${polys[0]}; animation: vlv-morph ${STEP_MS * SHAPES.length}ms infinite }
@media (prefers-reduced-motion: reduce) {
  .vlv-morph { animation: vlv-pulse 2s ease-in-out infinite }
}
`
})()

const TONES = {
  default: { plain: "text-primary", contained: "bg-secondary text-secondary-foreground" },
  brand: { plain: "text-brand", contained: "bg-brand-container text-brand-container-foreground" },
}

type LoadingIndicatorProps = Omit<React.ComponentProps<"div">, "color" | "children"> & {
  contained?: boolean
  color?: keyof typeof TONES
  size?: number
}

function LoadingIndicator({
  className,
  style,
  contained = false,
  color = "default",
  size = 48,
  "aria-label": ariaLabel = "Loading",
  ...props
}: LoadingIndicatorProps) {
  return (
    <div
      data-slot="loading-indicator"
      role="progressbar"
      aria-label={ariaLabel}
      className={cn(
        "inline-grid shrink-0 place-items-center rounded-full",
        contained ? TONES[color].contained : TONES[color].plain,
        className
      )}
      style={{ width: size, height: size, ...style }}
      {...props}
    >
      <style href="velvet-loading-indicator" precedence="default">
        {CSS}
      </style>
      <span aria-hidden className="vlv-morph block size-[79.2%] bg-current" />
    </div>
  )
}

export { LoadingIndicator, type LoadingIndicatorProps }
