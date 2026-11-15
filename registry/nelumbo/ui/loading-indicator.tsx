import * as React from "react"

import { cn } from "@/lib/utils"

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

const POINTS = 144

type Radius = (theta: number) => number

/** Radius along each ray of a star-shaped polygon (vertices clockwise from 12 o'clock). */
const fromVertices = (verts: [number, number][]): Radius => (theta) => {
  const dx = Math.sin(theta)
  const dy = -Math.cos(theta)
  let best = Infinity
  for (let i = 0; i < verts.length; i++) {
    const [ax, ay] = verts[i]
    const [bx, by] = verts[(i + 1) % verts.length]
    const ex = bx - ax
    const ey = by - ay
    const den = dx * ey - dy * ex
    if (Math.abs(den) < 1e-9) continue
    const r = (ax * ey - ay * ex) / den
    const u = (ax * dy - ay * dx) / den
    if (r > 0 && u >= -1e-9 && u <= 1 + 1e-9) best = Math.min(best, r)
  }
  return best
}
const at = (r: number, a: number): [number, number] => [r * Math.sin(a), -r * Math.cos(a)]

/** Rounds every corner of a polygon (convex or concave) with a curve tangent to both edges. */
function rounded(verts: [number, number][], radius: number): [number, number][] {
  const out: [number, number][] = []
  const n = verts.length
  for (let i = 0; i < n; i++) {
    const [px, py] = verts[(i + n - 1) % n]
    const [vx, vy] = verts[i]
    const [nx, ny] = verts[(i + 1) % n]
    const l1 = Math.hypot(px - vx, py - vy)
    const l2 = Math.hypot(nx - vx, ny - vy)
    const cut = Math.min(radius, l1 / 2, l2 / 2)
    const a: [number, number] = [vx + ((px - vx) / l1) * cut, vy + ((py - vy) / l1) * cut]
    const b: [number, number] = [vx + ((nx - vx) / l2) * cut, vy + ((ny - vy) / l2) * cut]
    for (let k = 0; k <= 12; k++) {
      const t = k / 12
      const u = 1 - t
      out.push([u * u * a[0] + 2 * u * t * vx + t * t * b[0], u * u * a[1] + 2 * u * t * vy + t * t * b[1]])
    }
  }
  return out
}
const star = (points: number, inner: number, corner: number) =>
  fromVertices(rounded(Array.from({ length: points * 2 }, (_, i) => at(i % 2 ? inner : 1, (i * Math.PI) / points)), corner))
const regular = (sides: number, corner: number) =>
  fromVertices(rounded(Array.from({ length: sides }, (_, i) => at(1, (i * 2 * Math.PI) / sides)), corner))
/** A capsule: a rectangle whose short ends are fully round, turned. */
const pill = (ratio: number, turn: number) => {
  const c = Math.cos(turn)
  const s = Math.sin(turn)
  const rect: [number, number][] = [[-1, -ratio], [1, -ratio], [1, ratio], [-1, ratio]].map(([x, y]) => [x * c - y * s, x * s + y * c])
  return fromVertices(rounded(rect, ratio * 2))
}
/** Round bumps with crisp notches between them. */
const scallop = (lobes: number, depth: number): Radius => (t) => 1 - depth + depth * Math.abs(Math.cos((lobes * t) / 2))
/** A superellipse, turned; high exponents give flatter sides and tighter corners. */
const squircle = (ratio: number, exp: number, turn: number): Radius => (t) => {
  const a = t - turn
  return Math.pow(Math.pow(Math.abs(Math.cos(a) / ratio), exp) + Math.pow(Math.abs(Math.sin(a)), exp), -1 / exp)
}

// The sequence: [shape, extra softening (samples to average over)].
const SHAPES: [Radius, number][] = [
  [star(10, 0.74, 0.12), 0], // soft burst
  [scallop(9, 0.16), 2], // cookie
  [regular(5, 0.32), 0], // pentagon
  [pill(0.5, Math.PI / 4), 0], // pill
  [star(8, 0.8, 0.16), 0], // sunny
  [scallop(4, 0.3), 3], // clover
  [squircle(0.66, 2, -Math.PI / 4), 0], // oval
]

/** Sample the radius, round the corners with a circular moving average, and scale to fit. */
function toPolygon([r, soften]: [Radius, number]) {
  const raw = Array.from({ length: POINTS }, (_, k) => r((k / POINTS) * Math.PI * 2))
  const rs = raw.map((_, k) => {
    let sum = 0
    for (let j = -soften; j <= soften; j++) sum += raw[(k + j + POINTS) % POINTS]
    return sum / (soften * 2 + 1)
  })
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
      <style href="nelumbo-loading-indicator" precedence="default">
        {CSS}
      </style>
      <span aria-hidden className="vlv-morph block size-[79.2%] bg-current" />
    </div>
  )
}

export { LoadingIndicator, type LoadingIndicatorProps }
