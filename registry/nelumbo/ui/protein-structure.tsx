"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/registry/nelumbo/ui/button"
import { Icon } from "@/registry/nelumbo/ui/icon"

/**
 * Nelumbo ProteinStructure
 *
 * A 3D view of a protein's backbone, drawn as a shaded tube through the
 * C-alpha atoms, with no 3D library. Drag to turn it, use the arrow keys, or
 * let it spin. Thicker tube marks helices and strands.
 *
 *   <ProteinStructure residues={ubiquitin} highlight={[{ residue: 48, label: "K48" }]} />
 *   <ProteinStructure residues={parsePdb(text)} colorBy="plddt" />
 *
 * - `residues`: C-alpha coordinates in Å, with optional one-letter `aa`,
 *   secondary structure `ss` ("H" helix, "E" strand, "C" coil) and `plddt`.
 *   `parsePdb(text)` reads them from a PDB file: the first chain's CA atoms,
 *   HELIX and SHEET records, and the B-factor column as pLDDT (AlphaFold).
 * - `colorBy`: "structure" (helix, strand, coil), "plddt" (AlphaFold's
 *   confidence bands, in their standard colors), "rainbow" (N to C terminus)
 *   or "plain". Color is used because it carries the meaning here.
 * - `highlight`: residues marked with a sphere and an optional label.
 * - `hovered` and `onHoveredChange`: the residue under the pointer, so a
 *   sequence view can follow along (and drive it back).
 * - `spin`: turn slowly until someone drags it. Off with reduced motion.
 * - Keyboard: arrows turn it, + and − zoom, 0 resets the view. Screen readers
 *   hear the residue under the pointer.
 */

type ProteinResidue = {
  x: number
  y: number
  z: number
  /** One-letter amino acid code. */
  aa?: string
  /** Secondary structure: helix, strand or coil. */
  ss?: "H" | "E" | "C"
  /** AlphaFold per-residue confidence, 0 to 100. */
  plddt?: number
}

type ProteinColorBy = "structure" | "plddt" | "rainbow" | "plain"
type ProteinHighlight = { residue: number; label?: string }

/* ------------------------------------------------------------------ */
/* Parsing                                                             */
/* ------------------------------------------------------------------ */

const THREE_TO_ONE: Record<string, string> = {
  ALA: "A", ARG: "R", ASN: "N", ASP: "D", CYS: "C", GLN: "Q", GLU: "E", GLY: "G", HIS: "H", ILE: "I",
  LEU: "L", LYS: "K", MET: "M", PHE: "F", PRO: "P", SER: "S", THR: "T", TRP: "W", TYR: "Y", VAL: "V",
}
const ONE_TO_NAME: Record<string, string> = Object.fromEntries(
  Object.entries(THREE_TO_ONE).map(([k, v]) => [v, k[0] + k.slice(1).toLowerCase()])
)

/** Reads the first chain's C-alpha atoms (first model), HELIX/SHEET records and B-factors (as pLDDT) from a PDB file. */
function parsePdb(text: string, { plddt = false }: { plddt?: boolean } = {}): ProteinResidue[] {
  const lines = text.split(/\r?\n/)
  const helix: [number, number][] = []
  const sheet: [number, number][] = []
  const out: (ProteinResidue & { n: number })[] = []
  let chain: string | null = null
  for (const l of lines) {
    const rec = l.slice(0, 6).trim()
    if (rec === "HELIX") helix.push([parseInt(l.slice(21, 25)), parseInt(l.slice(33, 37))])
    else if (rec === "SHEET") sheet.push([parseInt(l.slice(22, 26)), parseInt(l.slice(33, 37))])
    else if (rec === "ENDMDL") break
    else if ((rec === "ATOM" || rec === "HETATM") && l.slice(12, 16).trim() === "CA") {
      const c = l[21]
      if (chain === null) chain = c
      if (c !== chain) continue
      const alt = l[16]
      if (alt !== " " && alt !== "A") continue
      const res = l.slice(17, 20).trim()
      if (rec === "HETATM" && !THREE_TO_ONE[res]) continue
      const n = parseInt(l.slice(22, 26))
      out.push({
        n,
        x: parseFloat(l.slice(30, 38)),
        y: parseFloat(l.slice(38, 46)),
        z: parseFloat(l.slice(46, 54)),
        aa: THREE_TO_ONE[res] ?? "X",
        ...(plddt ? { plddt: parseFloat(l.slice(60, 66)) } : {}),
      })
    }
  }
  const inRange = (n: number, rs: [number, number][]) => rs.some(([a, b]) => n >= a && n <= b)
  return out.map(({ n, ...r }) => ({
    ...r,
    ss: helix.length || sheet.length ? (inRange(n, helix) ? "H" : inRange(n, sheet) ? "E" : "C") : undefined,
  }))
}

/* ------------------------------------------------------------------ */
/* Geometry                                                            */
/* ------------------------------------------------------------------ */

type V3 = [number, number, number]
type M3 = [number, number, number, number, number, number, number, number, number]

const mul = (a: M3, b: M3): M3 => [
  a[0] * b[0] + a[1] * b[3] + a[2] * b[6], a[0] * b[1] + a[1] * b[4] + a[2] * b[7], a[0] * b[2] + a[1] * b[5] + a[2] * b[8],
  a[3] * b[0] + a[4] * b[3] + a[5] * b[6], a[3] * b[1] + a[4] * b[4] + a[5] * b[7], a[3] * b[2] + a[4] * b[5] + a[5] * b[8],
  a[6] * b[0] + a[7] * b[3] + a[8] * b[6], a[6] * b[1] + a[7] * b[4] + a[8] * b[7], a[6] * b[2] + a[7] * b[5] + a[8] * b[8],
]
const rotY = (t: number): M3 => [Math.cos(t), 0, Math.sin(t), 0, 1, 0, -Math.sin(t), 0, Math.cos(t)]
const rotX = (t: number): M3 => [1, 0, 0, 0, Math.cos(t), -Math.sin(t), 0, Math.sin(t), Math.cos(t)]
const apply = (m: M3, [x, y, z]: V3): V3 => [m[0] * x + m[1] * y + m[2] * z, m[3] * x + m[4] * y + m[5] * z, m[6] * x + m[7] * y + m[8] * z]
const START: M3 = mul(rotX(-0.35), rotY(0.6))

const SUB = 6 // spline points per residue

/** Catmull-Rom spline through the C-alpha atoms, centered, with each point's residue and tube width. */
function buildTube(residues: ProteinResidue[]) {
  const n = residues.length
  const c: V3 = [0, 0, 0]
  residues.forEach((r) => {
    c[0] += r.x / n
    c[1] += r.y / n
    c[2] += r.z / n
  })
  const P: V3[] = residues.map((r) => [r.x - c[0], r.y - c[1], r.z - c[2]])
  // fit the folded core, not a floppy tail: the 90th percentile distance from the center
  const ds = P.map(([x, y, z]) => Math.hypot(x, y, z)).sort((a, b) => a - b)
  const radius = Math.max(1, (ds[Math.floor((ds.length - 1) * 0.9)] ?? 1) * 1.12)
  const widthOf = (r: ProteinResidue) => (r.ss === "H" || r.ss === "E" ? 1 : 0.55)
  const pts: { p: V3; res: number; w: number }[] = []
  for (let i = 0; i < n - 1; i++) {
    const p0 = P[Math.max(0, i - 1)]
    const p1 = P[i]
    const p2 = P[i + 1]
    const p3 = P[Math.min(n - 1, i + 2)]
    for (let s = 0; s < SUB; s++) {
      const t = s / SUB
      const t2 = t * t
      const t3 = t2 * t
      const p = [0, 1, 2].map(
        (k) => 0.5 * (2 * p1[k] + (-p0[k] + p2[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t2 + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t3)
      ) as V3
      const w = widthOf(residues[i]) * (1 - t) + widthOf(residues[i + 1]) * t
      pts.push({ p, res: t < 0.5 ? i : i + 1, w })
    }
  }
  if (n) pts.push({ p: P[n - 1], res: n - 1, w: widthOf(residues[n - 1]) })
  return { P, pts, radius }
}

/* ------------------------------------------------------------------ */
/* Color                                                               */
/* ------------------------------------------------------------------ */

type RGB = [number, number, number]
const colorCache = new Map<string, RGB>()
let probe: CanvasRenderingContext2D | null = null
/** Any CSS color (oklch included) to RGB, through a 1px canvas. */
function toRgb(css: string): RGB {
  const hit = colorCache.get(css)
  if (hit) return hit
  if (!probe) {
    const c = document.createElement("canvas")
    c.width = c.height = 1
    probe = c.getContext("2d", { willReadFrequently: true })
  }
  if (!probe) return [128, 128, 128]
  probe.clearRect(0, 0, 1, 1)
  probe.fillStyle = "#808080"
  probe.fillStyle = css
  probe.fillRect(0, 0, 1, 1)
  const [r, g, b] = probe.getImageData(0, 0, 1, 1).data
  const out: RGB = [r, g, b]
  colorCache.set(css, out)
  return out
}
const mix = (a: RGB, b: RGB, t: number): RGB => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]
const css = ([r, g, b]: RGB, a = 1) => `rgba(${r | 0},${g | 0},${b | 0},${a})`

/** AlphaFold's confidence bands and their standard colors. */
const PLDDT_BANDS = [
  { min: 90, label: "Very high", hex: "#0053d6" },
  { min: 70, label: "Confident", hex: "#65cbf3" },
  { min: 50, label: "Low", hex: "#ffdb13" },
  { min: 0, label: "Very low", hex: "#ff7d45" },
]
const plddtHex = (v = 0) => PLDDT_BANDS.find((b) => v >= b.min)!.hex

const SS_NAME = { H: "Helix", E: "Strand", C: "Coil" } as const

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

type ProteinStructureProps = Omit<React.ComponentProps<"div">, "children"> & {
  residues: ProteinResidue[]
  colorBy?: ProteinColorBy
  highlight?: ProteinHighlight[]
  /** The number of the first residue, for labels (default 1). */
  firstResidue?: number
  /** Residue under the pointer (numbered from firstResidue), when controlled. */
  hovered?: number | null
  onHoveredChange?: (residue: number | null) => void
  spin?: boolean
  /** Shows turn, zoom and reset buttons. */
  controls?: boolean
  /** Shows what the colors mean. */
  legend?: boolean
  /** Accessible name, e.g. "Ubiquitin, PDB 1UBQ". */
  label?: string
}

function ProteinStructure({
  residues,
  colorBy = "structure",
  highlight = [],
  firstResidue = 1,
  hovered: hoveredProp,
  onHoveredChange,
  spin = false,
  controls = true,
  legend = true,
  label = "Protein structure",
  className,
  ...props
}: ProteinStructureProps) {
  const frameRef = React.useRef<HTMLDivElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const tube = React.useMemo(() => buildTube(residues), [residues])
  const [innerHover, setInnerHover] = React.useState<number | null>(null)
  const hovered = hoveredProp !== undefined ? hoveredProp : innerHover
  const [spinning, setSpinning] = React.useState(spin)
  const reduced = React.useRef(false)

  const view = React.useRef({ rot: START, zoom: 1, vx: 0, vy: 0, dragging: false, last: [0, 0] as [number, number], moved: 0 })
  const live = React.useRef({ colorBy, highlight, hovered, firstResidue, spinning })
  live.current = { colorBy, highlight, hovered, firstResidue, spinning }

  const frame = React.useRef(0)
  const drawRef = React.useRef<() => void>(() => {})
  const request = React.useCallback(() => {
    if (!frame.current) frame.current = requestAnimationFrame(() => drawRef.current())
  }, [])

  const setHover = React.useCallback(
    (r: number | null) => {
      if (hoveredProp === undefined) setInnerHover(r)
      onHoveredChange?.(r)
    },
    [hoveredProp, onHoveredChange]
  )

  React.useEffect(() => {
    reduced.current = matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduced.current) setSpinning(false)
  }, [])
  React.useEffect(() => setSpinning(spin && !reduced.current), [spin])

  // project once per draw; kept for hit-testing
  const projected = React.useRef<{ x: number; y: number; z: number; s: number }[]>([])

  drawRef.current = () => {
    frame.current = 0
    const canvas = canvasRef.current
    const el = frameRef.current
    if (!canvas || !el) return
    const v = view.current
    const { colorBy, highlight, hovered, firstResidue, spinning } = live.current

    // motion: spin and drag momentum
    let more = false
    if (spinning && !v.dragging) {
      v.rot = mul(rotY(0.006), v.rot)
      more = true
    }
    if (!v.dragging && (Math.abs(v.vx) > 1e-4 || Math.abs(v.vy) > 1e-4)) {
      v.rot = mul(rotX(v.vy), mul(rotY(v.vx), v.rot))
      v.vx *= 0.92
      v.vy *= 0.92
      more = true
    }

    const w = el.clientWidth
    const h = canvas.clientHeight
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
    }
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, w, h)

    const cs = getComputedStyle(el)
    const bg = toRgb(cs.backgroundColor)
    const fg = toRgb(cs.color)
    const varColor = (name: string, fallback: string) => toRgb(cs.getPropertyValue(name).trim() || fallback)
    const white: RGB = [255, 255, 255]

    const n = residues.length
    const resColor = (i: number): RGB => {
      const r = residues[i]
      if (colorBy === "plddt") return toRgb(plddtHex(r.plddt))
      if (colorBy === "rainbow") return toRgb(`hsl(${Math.round(250 - (250 * i) / Math.max(1, n - 1))} 72% 52%)`)
      if (colorBy === "plain") return fg
      if (r.ss === "H") return varColor("--brand", "#3355cc")
      if (r.ss === "E") return varColor("--amber", "#d08a00")
      return mix(fg, bg, 0.45)
    }
    const colors = residues.map((_, i) => resColor(i))

    const { pts, P, radius } = tube
    const base = (Math.min(w, h) / 2) * 0.82
    const scale = (base / radius) * v.zoom
    const F = radius * 4
    const proj = (p: V3) => {
      const [x, y, z] = apply(v.rot, p)
      const s = F / (F - z)
      return { x: w / 2 + x * scale * s, y: h / 2 - y * scale * s, z, s }
    }
    const SP = pts.map((q) => proj(q.p))
    projected.current = P.map((p) => proj(p))
    const tubeW = Math.max(3, Math.min(w, h) * 0.026) * Math.sqrt(v.zoom)

    type Item = { z: number; draw: () => void }
    const items: Item[] = []
    for (let k = 0; k < SP.length - 1; k++) {
      const a = SP[k]
      const b = SP[k + 1]
      const q = pts[k]
      const z = (a.z + b.z) / 2
      const fog = Math.min(0.45, Math.max(0, (radius - z) / (2 * radius)) * 0.55)
      const col = mix(colors[q.res], bg, fog)
      const lw = tubeW * ((q.w + pts[k + 1].w) / 2) * ((a.s + b.s) / 2)
      items.push({
        z,
        draw: () => {
          ctx.lineCap = "butt"
          ctx.strokeStyle = css(bg)
          ctx.lineWidth = lw + Math.max(1.6, lw * 0.32)
          ctx.beginPath()
          ctx.moveTo(a.x, a.y)
          ctx.lineTo(b.x, b.y)
          ctx.stroke()
          ctx.lineCap = "round"
          ctx.strokeStyle = css(col)
          ctx.lineWidth = lw
          ctx.stroke()
        },
      })
    }
    const marks = highlight.filter((m) => m.residue - firstResidue >= 0 && m.residue - firstResidue < n)
    const hov = hovered != null && hovered - firstResidue >= 0 && hovered - firstResidue < n ? hovered - firstResidue : null
    for (const m of marks) {
      const p = projected.current[m.residue - firstResidue]
      const r = tubeW * 1.15 * p.s
      items.push({
        z: p.z + 0.01,
        draw: () => {
          ctx.fillStyle = css(bg)
          ctx.beginPath()
          ctx.arc(p.x, p.y, r + 1.5, 0, Math.PI * 2)
          ctx.fill()
          const g = ctx.createRadialGradient(p.x - r * 0.35, p.y - r * 0.35, r * 0.1, p.x, p.y, r)
          g.addColorStop(0, css(mix(fg, white, 0.5)))
          g.addColorStop(1, css(fg))
          ctx.fillStyle = g
          ctx.beginPath()
          ctx.arc(p.x, p.y, r, 0, Math.PI * 2)
          ctx.fill()
        },
      })
    }
    items.sort((a, b) => a.z - b.z).forEach((it) => it.draw())

    // labels on top
    const family = cs.fontFamily
    const pill = (text: string, x: number, y: number, sub?: string) => {
      ctx.font = `600 12px ${family}`
      const tw = ctx.measureText(text).width
      ctx.font = `400 11px ${family}`
      const sw = sub ? ctx.measureText(sub).width : 0
      const pw = Math.max(tw, sw) + 16
      const ph = sub ? 36 : 22
      let px = x + 10
      let py = y - ph - 6
      if (px + pw > w - 4) px = x - pw - 10
      if (py < 4) py = y + 10
      ctx.fillStyle = css(fg)
      ctx.beginPath()
      ctx.roundRect(px, py, pw, ph, 6)
      ctx.fill()
      ctx.fillStyle = css(bg)
      ctx.textBaseline = "middle"
      ctx.font = `600 12px ${family}`
      ctx.fillText(text, px + 8, py + (sub ? 12 : ph / 2))
      if (sub) {
        ctx.font = `400 11px ${family}`
        ctx.fillStyle = css(mix(bg, fg, 0.3))
        ctx.fillText(sub, px + 8, py + 26)
      }
    }
    for (const m of marks) {
      if (!m.label || m.residue - firstResidue === hov) continue
      const p = projected.current[m.residue - firstResidue]
      pill(m.label, p.x, p.y)
    }
    if (hov !== null) {
      const p = projected.current[hov]
      const r = residues[hov]
      ctx.strokeStyle = css(fg)
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(p.x, p.y, tubeW * 1.2 * p.s + 3, 0, Math.PI * 2)
      ctx.stroke()
      pill(describe(r, hov + firstResidue).title, p.x, p.y, describe(r, hov + firstResidue).meta)
    }

    if (more) request()
  }

  React.useEffect(() => {
    request()
  }, [request, colorBy, highlight, hovered, firstResidue, spinning, tube])

  React.useEffect(() => {
    const el = frameRef.current
    if (!el) return
    const ro = new ResizeObserver(() => request())
    ro.observe(el)
    // theme switches change the colors
    const mo = new MutationObserver(() => request())
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "style", "data-theme"] })
    const mq = matchMedia("(prefers-color-scheme: dark)")
    mq.addEventListener("change", request)
    return () => {
      ro.disconnect()
      mo.disconnect()
      mq.removeEventListener("change", request)
      cancelAnimationFrame(frame.current)
      frame.current = 0
    }
  }, [request])

  const turn = (dx: number, dy: number) => {
    const v = view.current
    v.rot = mul(rotX(dy), mul(rotY(dx), v.rot))
    request()
  }
  const zoomBy = (f: number) => {
    view.current.zoom = Math.min(3, Math.max(0.5, view.current.zoom * f))
    request()
  }
  const reset = () => {
    Object.assign(view.current, { rot: START, zoom: 1, vx: 0, vy: 0 })
    request()
  }

  const hitTest = (x: number, y: number) => {
    let best: number | null = null
    let bestScore = Infinity
    projected.current.forEach((p, i) => {
      const d = Math.hypot(p.x - x, p.y - y)
      if (d > 14) return
      const score = d - p.z * 0.05
      if (score < bestScore) {
        bestScore = score
        best = i
      }
    })
    return best === null ? null : (best as number) + firstResidue
  }

  const onPointerDown = (e: React.PointerEvent) => {
    const v = view.current
    v.dragging = true
    v.moved = 0
    v.vx = v.vy = 0
    v.last = [e.clientX, e.clientY]
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    setSpinning(false)
  }
  const onPointerMove = (e: React.PointerEvent) => {
    const v = view.current
    if (v.dragging) {
      const dx = (e.clientX - v.last[0]) * 0.01
      const dy = (e.clientY - v.last[1]) * 0.01
      v.last = [e.clientX, e.clientY]
      v.moved += Math.abs(dx) + Math.abs(dy)
      v.vx = reduced.current ? 0 : dx
      v.vy = reduced.current ? 0 : dy
      turn(dx, dy)
      return
    }
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const hit = hitTest(e.clientX - r.left, e.clientY - r.top)
    if (hit !== hovered) setHover(hit)
  }
  const onPointerUp = (e: React.PointerEvent) => {
    const v = view.current
    v.dragging = false
    ;(e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId)
    request()
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    const step = 0.17
    const map: Record<string, () => void> = {
      ArrowLeft: () => turn(-step, 0),
      ArrowRight: () => turn(step, 0),
      ArrowUp: () => turn(0, -step),
      ArrowDown: () => turn(0, step),
      "+": () => zoomBy(1.15),
      "=": () => zoomBy(1.15),
      "-": () => zoomBy(1 / 1.15),
      "0": reset,
    }
    const f = map[e.key]
    if (f) {
      e.preventDefault()
      setSpinning(false)
      f()
    }
  }

  const hovRes = hovered != null ? residues[hovered - firstResidue] : undefined
  const announce = hovRes ? `${describe(hovRes, hovered!).title}, ${describe(hovRes, hovered!).meta}` : ""

  const legendItems =
    colorBy === "plddt"
      ? PLDDT_BANDS.map((b) => ({ label: `${b.label} ${b.min === 90 ? "> 90" : b.min === 0 ? "< 50" : `${b.min}–${b.min + 20}`}`, style: { background: b.hex } }))
      : colorBy === "structure"
        ? [
            { label: "Helix", style: { background: "var(--brand)" } },
            { label: "Strand", style: { background: "var(--amber)" } },
            { label: "Coil", style: { background: "color-mix(in oklch, var(--foreground) 55%, transparent)" } },
          ]
        : colorBy === "rainbow"
          ? [
              { label: "N terminus", style: { background: "hsl(250 72% 52%)" } },
              { label: "C terminus", style: { background: "hsl(0 72% 52%)" } },
            ]
          : []

  return (
    <div data-slot="protein-structure" className={cn("flex min-w-0 flex-col gap-3", className)} {...props}>
      <div
        ref={frameRef}
        className="relative min-w-0 overflow-hidden rounded-3xl bg-surface-container-low text-foreground dark:bg-surface-container"
      >
        <canvas
          ref={canvasRef}
          role="application"
          aria-roledescription="3D structure viewer"
          aria-label={`${label}. ${residues.length} residues. Drag or use the arrow keys to turn, plus and minus to zoom, 0 to reset.`}
          tabIndex={0}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onPointerLeave={() => !view.current.dragging && hovered !== null && setHover(null)}
          onKeyDown={onKeyDown}
          className="block aspect-[4/3] w-full cursor-grab touch-none rounded-3xl outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring active:cursor-grabbing"
        />
        <span role="status" className="sr-only">
          {announce}
        </span>
        {controls && (
          <div className="absolute right-3 bottom-3 flex items-center gap-1 rounded-full bg-card p-1 shadow-e2 dark:bg-surface-container-highest">
            <Button
              size="icon-sm"
              variant="ghost"
              aria-label={spinning ? "Stop turning" : "Turn slowly"}
              aria-pressed={spinning}
              onClick={() => setSpinning((s) => !s)}
            >
              <Icon name={spinning ? "pause" : "3d_rotation"} />
            </Button>
            <Button size="icon-sm" variant="ghost" aria-label="Zoom out" onClick={() => zoomBy(1 / 1.2)}>
              <Icon name="remove" />
            </Button>
            <Button size="icon-sm" variant="ghost" aria-label="Zoom in" onClick={() => zoomBy(1.2)}>
              <Icon name="add" />
            </Button>
            <Button size="icon-sm" variant="ghost" aria-label="Reset view" onClick={reset}>
              <Icon name="center_focus_strong" />
            </Button>
          </div>
        )}
      </div>
      {legend && legendItems.length > 0 && (
        <ul aria-label="Color key" className="flex flex-wrap gap-x-4 gap-y-1.5 px-1 type-label-md text-muted-foreground">
          {legendItems.map((it) => (
            <li key={it.label} className="flex items-center gap-1.5">
              <span aria-hidden className="size-2.5 rounded-full" style={it.style} />
              {it.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function describe(r: ProteinResidue, n: number) {
  const name = r.aa ? (ONE_TO_NAME[r.aa] ?? r.aa) : "Residue"
  const meta = [r.ss ? SS_NAME[r.ss] : null, r.plddt != null ? `pLDDT ${Math.round(r.plddt)}` : null].filter(Boolean).join(", ")
  return { title: `${name} ${n}`, meta: meta || "C-alpha" }
}

export {
  ProteinStructure,
  parsePdb,
  PLDDT_BANDS,
  type ProteinStructureProps,
  type ProteinResidue,
  type ProteinColorBy,
  type ProteinHighlight,
}
