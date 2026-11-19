import * as React from "react"

import { cn } from "@/lib/utils"
import { shapePath, type ShapeName } from "@/registry/nelumbo/ui/shape"

/**
 * Nelumbo LoadingIndicator (Material 3 Expressive style)
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

/** Material's seven, drawn from the Shape library. */
const DEFAULT_SHAPES: ShapeName[] = ["soft-burst", "cookie-9", "pentagon", "pill", "sunny", "clover-4", "oval"]
const STEP_MS = 650

/** Keyframes for one shape sequence; the name is derived from the sequence so each is emitted once. */
const sequences = new Map<string, { id: string; css: string }>()
function sequenceCss(shapes: ShapeName[]) {
  const id = shapes.join("_")
  const hit = sequences.get(id)
  if (hit) return hit
  const polys = shapes.map((n) => shapePath(n, { fit: "circle" }))
  const turn = 720 / shapes.length // two turns per cycle, so the loop is seamless
  const frames = [...polys, polys[0]]
    .map((poly, i) => {
      const at = ((i / shapes.length) * 100).toFixed(3)
      return `${at}% { clip-path: ${poly}; animation-timing-function: var(--ease-spring, cubic-bezier(0.2, 0, 0, 1)) }`
    })
    .join("\n")
  const ms = STEP_MS * shapes.length
  const out = {
    id,
    css: `
@keyframes vlv-morph-${id} {
${frames}
}
@keyframes vlv-pulse { 50% { transform: scale(0.86); opacity: 0.7 } }
/* the turn is its own steady, linear animation, so only the shape eases and the spin never stalls between shapes */
@keyframes vlv-turn-${id} { to { rotate: ${turn * shapes.length}deg } }
.vlv-morph-${id} { clip-path: ${polys[0]}; animation: vlv-morph-${id} ${ms}ms infinite, vlv-turn-${id} ${ms}ms linear infinite }
@media (prefers-reduced-motion: reduce) {
  .vlv-morph-${id} { animation: vlv-pulse 2s ease-in-out infinite }
}
`,
  }
  sequences.set(id, out)
  return out
}

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
  const { id, css } = sequenceCss(DEFAULT_SHAPES)
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
      <style href={`nelumbo-loading-indicator-${id}`} precedence="default">
        {css}
      </style>
      <span aria-hidden className={`vlv-morph-${id} block size-[79.2%] bg-current`} />
    </div>
  )
}

export { LoadingIndicator, type LoadingIndicatorProps }
