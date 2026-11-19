import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Nelumbo Shape (Material 3 Expressive shape library)
 *
 * Thirty-five soft shapes, from circle and pill to cookies, clovers, bursts,
 * a heart and pixel shapes, for avatars, image crops, icon containers and
 * decorative accents.
 *
 *   <Shape name="cookie-9" className="size-24 bg-brand-container" />
 *   <Shape name="arch" className="size-40"><img src="…" alt="…" /></Shape>
 *   <div style={{ clipPath: shapePath("clover-4") }} />
 *
 * - Every shape is drawn with the same number of points, starting at 12
 *   o'clock, so changing `name` morphs smoothly from one shape to the next
 *   (turn it off with `morph={false}`; it is instant with reduced motion).
 * - Shapes fill their box and keep their proportions, centered.
 * - The shape is a clip-path, so it also clips shadows and focus rings:
 *   put those on a wrapper.
 * - `shapePath(name)` returns the CSS `polygon()` for your own elements, and
 *   `SHAPE_NAMES` lists them all. LoadingIndicator takes `shapes` from here.
 */

/* ------------------------------------------------------------------ */
/* Geometry                                                            */
/* ------------------------------------------------------------------ */

type Pt = [number, number]
/** Distance from the center to the edge along the ray at angle theta (0 = 12 o'clock, clockwise). */
type Radius = (theta: number) => number

const dir = (t: number): Pt => [Math.sin(t), -Math.cos(t)]
const at = (r: number, a: number): Pt => [r * Math.sin(a), -r * Math.cos(a)]

/** Radius along each ray of a polygon that is star-shaped around the origin. */
const fromVertices =
  (verts: Pt[]): Radius =>
  (theta) => {
    const [dx, dy] = dir(theta)
    let best = Infinity
    for (let i = 0; i < verts.length; i++) {
      const [ax, ay] = verts[i]
      const [bx, by] = verts[(i + 1) % verts.length]
      const ex = bx - ax
      const ey = by - ay
      const den = dx * ey - dy * ex
      if (Math.abs(den) < 1e-12) continue
      const r = (ax * ey - ay * ex) / den
      const u = (ax * dy - ay * dx) / den
      if (r > 0 && u >= -1e-9 && u <= 1 + 1e-9) best = Math.min(best, r)
    }
    return best
  }

/** Rounds every corner of a polygon with a curve tangent to both edges. `radius` may differ per corner. */
function rounded(verts: Pt[], radius: number | number[]): Pt[] {
  const out: Pt[] = []
  const n = verts.length
  for (let i = 0; i < n; i++) {
    const [px, py] = verts[(i + n - 1) % n]
    const [vx, vy] = verts[i]
    const [nx, ny] = verts[(i + 1) % n]
    const l1 = Math.hypot(px - vx, py - vy)
    const l2 = Math.hypot(nx - vx, ny - vy)
    const want = Array.isArray(radius) ? radius[i] : radius
    const cut = Math.min(want, l1 / 2, l2 / 2)
    if (cut <= 1e-6 || !l1 || !l2) {
      out.push([vx, vy])
      continue
    }
    const a: Pt = [vx + ((px - vx) / l1) * cut, vy + ((py - vy) / l1) * cut]
    const b: Pt = [vx + ((nx - vx) / l2) * cut, vy + ((ny - vy) / l2) * cut]
    for (let k = 0; k <= 12; k++) {
      const t = k / 12
      const u = 1 - t
      out.push([u * u * a[0] + 2 * u * t * vx + t * t * b[0], u * u * a[1] + 2 * u * t * vy + t * t * b[1]])
    }
  }
  return out
}

const poly = (verts: Pt[], corner: number | number[] = 0) => fromVertices(corner ? rounded(verts, corner) : verts)
const star = (points: number, inner: number, corner: number) =>
  poly(
    Array.from({ length: points * 2 }, (_, i) => at(i % 2 ? inner : 1, (i * Math.PI) / points)),
    corner
  )
const regular = (sides: number, corner: number, turn = 0, sx = 1, sy = 1) =>
  poly(
    Array.from({ length: sides }, (_, i) => {
      const [x, y] = at(1, (i * 2 * Math.PI) / sides + turn)
      return [x * sx, y * sy] as Pt
    }),
    corner
  )
/** A rectangle (half-width w, half-height h), optionally sheared sideways, with rounded corners (TL, TR, BR, BL). */
const rect = (w: number, h: number, corner: number | number[], shear = 0) =>
  poly(
    (
      [
        [-w, -h],
        [w, -h],
        [w, h],
        [-w, h],
      ] as Pt[]
    ).map(([x, y]) => [x - shear * y, y] as Pt),
    corner
  )
/** A capsule: a rectangle whose short ends are fully round, turned. */
const pill = (ratio: number, turn: number) => {
  const c = Math.cos(turn)
  const s = Math.sin(turn)
  const verts = (
    [
      [-1, -ratio],
      [1, -ratio],
      [1, ratio],
      [-1, ratio],
    ] as Pt[]
  ).map(([x, y]) => [x * c - y * s, x * s + y * c] as Pt)
  return poly(verts, ratio * 2)
}
/** Round bumps with crisp notches between them. */
const scallop =
  (lobes: number, depth: number): Radius =>
  (t) =>
    1 - depth + depth * Math.abs(Math.cos((lobes * t) / 2))
/** Smooth waves, no notches. */
const wave =
  (lobes: number, depth: number): Radius =>
  (t) =>
    1 - (depth * (1 - Math.cos(lobes * t))) / 2
/** A superellipse, turned; high exponents give flatter sides and tighter corners. */
const squircle =
  (ratio: number, exp: number, turn: number): Radius =>
  (t) => {
    const a = t - turn
    return Math.pow(Math.pow(Math.abs(Math.cos(a) / ratio), exp) + Math.pow(Math.abs(Math.sin(a)), exp), -1 / exp)
  }
/** Where the ray at angle t leaves an ellipse centered at (cx, cy). */
const ellipseHit = (t: number, cx: number, cy: number, a: number, b: number) => {
  const [dx, dy] = dir(t)
  const A = (dx * dx) / (a * a) + (dy * dy) / (b * b)
  const B = -2 * ((dx * cx) / (a * a) + (dy * cy) / (b * b))
  const C = (cx * cx) / (a * a) + (cy * cy) / (b * b) - 1
  const disc = B * B - 4 * A * C
  return disc < 0 ? 0 : (-B + Math.sqrt(disc)) / (2 * A)
}
const times =
  (f: Radius, g: Radius): Radius =>
  (t) =>
    f(t) * g(t)

/** A polygon traced through dense points (arcs, curves). */
const traced = (n: number, f: (u: number) => Pt, corner = 0) => poly(Array.from({ length: n }, (_, i) => f(i / n)), corner)

/** Stair-stepped outline from row half-widths (top to bottom), for the pixel shapes. */
function pixels(rows: number[]): Radius {
  const h = rows.length
  const right: Pt[] = []
  const left: Pt[] = []
  rows.forEach((w, i) => {
    const y0 = i - h / 2
    right.push([w, y0], [w, y0 + 1])
    left.unshift([-w, y0 + 1], [-w, y0])
  })
  return poly([...right, ...left])
}

const heart = traced(
  240,
  (u) => {
    const t = u * Math.PI * 2
    const x = 16 * Math.sin(t) ** 3
    const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)
    return [x / 16, -(y - 2.5) / 16]
  },
  0
)

/** Half circles over a flat base, with softly rounded base corners. */
const halfCircle = (cy: number, base: number, corner: number) => {
  const arc: Pt[] = Array.from({ length: 48 }, (_, i) => {
    const a = Math.PI + (i / 47) * Math.PI
    return [Math.cos(a), Math.sin(a) + cy] as Pt
  })
  return poly(base > cy ? [...arc, [1, base], [-1, base]] : arc, corner)
}
const arch = halfCircle(0, 1, 0.3)
const semicircle = halfCircle(0.4, 0.4, 0.22)

const ghost = traced(
  120,
  (u) => {
    if (u < 0.5) {
      const a = Math.PI + u * 2 * Math.PI
      return [Math.cos(a), Math.sin(a) - 0.15]
    }
    const k = (u - 0.5) * 2
    if (k < 0.2) return [1, -0.15 + (k / 0.2) * 1.0]
    if (k < 0.8) {
      const x = 1 - ((k - 0.2) / 0.6) * 2
      return [x, 0.85 + 0.15 * Math.abs(Math.sin((3 * Math.PI * (1 - x)) / 2))]
    }
    return [-1, 0.85 - ((k - 0.8) / 0.2) * 1.0]
  },
  0
)

const bun: Radius = (t) => Math.max(ellipseHit(t, 0, -0.3, 1, 0.6), ellipseHit(t, 0, 0.42, 0.92, 0.48))

const diamondR = poly(
  [
    [0, -1],
    [0.82, 0],
    [0, 1],
    [-0.82, 0],
  ],
  0.32
)

/** [radius, extra softening (samples to average over)] */
const LIBRARY = {
  circle: [() => 1, 0],
  square: [rect(1, 1, 0.42), 0],
  slanted: [rect(0.82, 0.9, 0.32, 0.28), 0],
  arch: [arch, 0],
  semicircle: [semicircle, 0],
  oval: [squircle(0.66, 2, -Math.PI / 4), 0],
  pill: [pill(0.5, Math.PI / 4), 0],
  triangle: [regular(3, 0.42, 0, 1, 1), 0],
  arrow: [
    poly(
      [
        [0, -1],
        [0.95, 0.85],
        [0, 0.42],
        [-0.95, 0.85],
      ],
      0.3
    ),
    0,
  ],
  fan: [rect(1, 1, [0.22, 2, 0.22, 0.22]), 0],
  diamond: [diamondR, 0],
  clamshell: [regular(8, 0.26, Math.PI / 8, 1, 0.76), 0],
  pentagon: [regular(5, 0.32), 0],
  gem: [regular(6, 0.3, 0, 0.9, 1), 0],
  "very-sunny": [star(8, 0.7, 0.1), 0],
  sunny: [star(8, 0.8, 0.16), 0],
  "cookie-4": [scallop(4, 0.14), 4],
  "cookie-6": [scallop(6, 0.13), 3],
  "cookie-7": [scallop(7, 0.14), 3],
  "cookie-9": [scallop(9, 0.16), 2],
  "cookie-12": [scallop(12, 0.1), 2],
  ghostish: [ghost, 2],
  "clover-4": [scallop(4, 0.3), 3],
  "clover-8": [scallop(8, 0.24), 2],
  burst: [star(12, 0.72, 0.05), 0],
  "soft-burst": [star(10, 0.74, 0.12), 0],
  boom: [star(15, 0.62, 0.03), 0],
  "soft-boom": [star(12, 0.6, 0.15), 0],
  flower: [wave(8, 0.2), 0],
  puffy: [times(squircle(1, 3.2, 0), scallop(12, 0.07)), 2],
  "puffy-diamond": [times(diamondR, scallop(16, 0.08)), 1],
  "pixel-circle": [pixels([2, 3.5, 4.5, 5, 5, 5, 5, 4.5, 3.5, 2]), 0],
  "pixel-triangle": [pixels([1, 1, 2, 2, 3, 3, 4, 4, 5, 5]), 0],
  bun: [bun, 2],
  heart: [heart, 2],
} satisfies Record<string, [Radius, number]>

type ShapeName = keyof typeof LIBRARY
const SHAPE_NAMES = Object.keys(LIBRARY) as ShapeName[]

/* ------------------------------------------------------------------ */
/* Polygons                                                            */
/* ------------------------------------------------------------------ */

type ShapePathOptions = {
  /** Points around the outline. Shapes only morph into shapes with the same count. */
  points?: number
  /** "box" fills the element's box; "circle" fits the shape inside a circle, for shapes that turn. */
  fit?: "box" | "circle"
}

const cache = new Map<string, string>()

/** The CSS `polygon()` for a shape, cached. */
function shapePath(name: ShapeName, { points = 144, fit = "box" }: ShapePathOptions = {}): string {
  const key = `${name}:${points}:${fit}`
  const hit = cache.get(key)
  if (hit) return hit
  const [r, soften] = LIBRARY[name] as [Radius, number]
  const raw = Array.from({ length: points }, (_, k) => r((k / points) * Math.PI * 2))
  const s = Math.round((soften * points) / 144)
  const rs = raw.map((_, k) => {
    let sum = 0
    for (let j = -s; j <= s; j++) sum += raw[(k + j + points) % points]
    return sum / (s * 2 + 1)
  })
  let pts: Pt[] = rs.map((v, k) => at(v, (k / points) * Math.PI * 2))
  if (fit === "circle") {
    const peak = Math.max(...rs)
    pts = pts.map(([x, y]) => [x / peak, y / peak])
  } else {
    const xs = pts.map((p) => p[0])
    const ys = pts.map((p) => p[1])
    const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)]
    const scale = 2 / Math.max(x1 - x0, y1 - y0)
    const [cx, cy] = [(x0 + x1) / 2, (y0 + y1) / 2]
    pts = pts.map(([x, y]) => [(x - cx) * scale, (y - cy) * scale])
  }
  const out = `polygon(${pts.map(([x, y]) => `${(50 + 50 * x).toFixed(2)}% ${(50 + 50 * y).toFixed(2)}%`).join(",")})`
  cache.set(key, out)
  return out
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

type ShapeProps = React.ComponentProps<"div"> & {
  name: ShapeName
  /** Morph when `name` changes (default true). */
  morph?: boolean
}

function Shape({ name, morph = true, className, style, ...props }: ShapeProps) {
  return (
    <div
      data-slot="shape"
      data-shape={name}
      className={cn(
        "relative aspect-square shrink-0 overflow-hidden [&>:is(img,video,canvas,svg)]:size-full [&>:is(img,video)]:object-cover",
        morph && "transition-[clip-path] duration-500 ease-[cubic-bezier(0.2,0,0,1)] motion-reduce:transition-none",
        className
      )}
      style={{ clipPath: shapePath(name), ...style }}
      {...props}
    />
  )
}

export { Shape, shapePath, SHAPE_NAMES, type ShapeName, type ShapeProps, type ShapePathOptions }
