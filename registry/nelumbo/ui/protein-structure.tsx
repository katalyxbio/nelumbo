"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/registry/nelumbo/ui/button"
import { Icon } from "@/registry/nelumbo/ui/icon"

/**
 * Nelumbo ProteinStructure
 *
 * A 3D protein viewer with no 3D library. Drag to turn it, use the arrow
 * keys, or let it spin.
 *
 *   <ProteinStructure residues={ubiquitin} highlight={[{ residue: 48, label: "K48" }]} />
 *   <ProteinStructure residues={parsePdb(text)} representation="surface" />
 *
 * - `representation`:
 *   - "cartoon" (default): helices as ribbons, strands as arrows, loops as tubes.
 *   - "tube": one smooth tube, thicker through helices and strands.
 *   - "trace": a thin line through the C-alpha atoms.
 *   - "ball-and-stick": atoms and bonds.
 *   - "spacefill": every atom at its van der Waals radius.
 *   - "surface": a smooth molecular surface.
 *   The last three use every atom when `atoms` are given, and the C-alpha
 *   atoms otherwise.
 * - `outline`: "black" (default), "background" (a gap that separates
 *   crossings), "none", or any CSS color.
 * - `shading`: "flat" (default) draws plain colors with no shadows and a
 *   slightly bolder outline; "lit" adds lighting and ambient occlusion.
 * - `colorBy`: "structure" (helix, strand, coil), "plddt" (AlphaFold's
 *   confidence bands, in their standard colors), "rainbow" (N to C terminus)
 *   or "plain". Atom views also color nitrogen, oxygen and sulfur.
 * - `highlight`: residues marked with a label; with atoms, their side chains
 *   are drawn as ball-and-stick in the cartoon, tube and trace views.
 * - `hovered` and `onHoveredChange`: the residue under the pointer, so a
 *   sequence view can follow along (and drive it back).
 * - `parsePdb(text)` reads the first chain of a PDB file: atoms, HELIX and
 *   SHEET records, and the B-factor column as pLDDT for AlphaFold models.
 * - Keyboard: arrows turn it, + and − zoom, 0 resets. Screen readers hear the
 *   residue under the pointer. `spin` is off with reduced motion.
 */

type ProteinAtom = { name: string; element: string; x: number; y: number; z: number }

type ProteinResidue = {
  /** C-alpha position in Å. */
  x: number
  y: number
  z: number
  /** One-letter amino acid code. */
  aa?: string
  /** Secondary structure: helix, strand or coil. */
  ss?: "H" | "E" | "C"
  /** AlphaFold per-residue confidence, 0 to 100. */
  plddt?: number
  /** Heavy atoms, for the atom views and highlighted side chains. */
  atoms?: ProteinAtom[]
}

type ProteinColorBy = "structure" | "plddt" | "rainbow" | "plain"
type ProteinRepresentation = "cartoon" | "tube" | "trace" | "ball-and-stick" | "spacefill" | "surface"
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

/** Reads the first chain (first model) of a PDB file: heavy atoms, HELIX/SHEET records, and B-factors as pLDDT. */
function parsePdb(text: string, { plddt = false }: { plddt?: boolean } = {}): ProteinResidue[] {
  const helix: [number, number][] = []
  const sheet: [number, number][] = []
  const byRes = new Map<string, { n: number; res: string; atoms: ProteinAtom[]; b?: number }>()
  let chain: string | null = null
  for (const l of text.split(/\r?\n/)) {
    const rec = l.slice(0, 6).trim()
    if (rec === "HELIX") helix.push([parseInt(l.slice(21, 25)), parseInt(l.slice(33, 37))])
    else if (rec === "SHEET") sheet.push([parseInt(l.slice(22, 26)), parseInt(l.slice(33, 37))])
    else if (rec === "ENDMDL") break
    else if (rec === "ATOM" || rec === "HETATM") {
      const res = l.slice(17, 20).trim()
      if (!THREE_TO_ONE[res]) continue
      const c = l[21]
      if (chain === null) chain = c
      if (c !== chain) continue
      const alt = l[16]
      if (alt !== " " && alt !== "A") continue
      const name = l.slice(12, 16).trim()
      const element = (l.slice(76, 78).trim() || name.replace(/[^A-Z]/g, "")[0] || "C").toUpperCase()
      if (element === "H") continue
      const key = l.slice(22, 27)
      let r = byRes.get(key)
      if (!r) byRes.set(key, (r = { n: parseInt(l.slice(22, 26)), res, atoms: [] }))
      r.atoms.push({ name, element, x: parseFloat(l.slice(30, 38)), y: parseFloat(l.slice(38, 46)), z: parseFloat(l.slice(46, 54)) })
      if (name === "CA") r.b = parseFloat(l.slice(60, 66))
    }
  }
  const inRange = (n: number, rs: [number, number][]) => rs.some(([a, b]) => n >= a && n <= b)
  const out: ProteinResidue[] = []
  for (const r of byRes.values()) {
    const ca = r.atoms.find((a) => a.name === "CA")
    if (!ca) continue
    out.push({
      x: ca.x,
      y: ca.y,
      z: ca.z,
      aa: THREE_TO_ONE[r.res],
      ss: helix.length || sheet.length ? (inRange(r.n, helix) ? "H" : inRange(r.n, sheet) ? "E" : "C") : undefined,
      ...(plddt && r.b != null ? { plddt: r.b } : {}),
      atoms: r.atoms,
    })
  }
  return out
}

/* ------------------------------------------------------------------ */
/* Vector math                                                         */
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
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]]
const scl = (a: V3, k: number): V3 => [a[0] * k, a[1] * k, a[2] * k]
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
const norm = (a: V3): V3 => {
  const l = Math.hypot(a[0], a[1], a[2]) || 1
  return [a[0] / l, a[1] / l, a[2] / l]
}
const START: M3 = mul(rotX(-0.35), rotY(0.6))

/* ------------------------------------------------------------------ */
/* Model: spline frames, atoms and bonds                               */
/* ------------------------------------------------------------------ */

const SUB = 6 // spline points per residue
const VDW: Record<string, number> = { C: 1.7, N: 1.55, O: 1.52, S: 1.8, P: 1.8 }

type SplinePt = { p: V3; res: number; t: number; N: V3; B: V3 }
type ModelAtom = { p: V3; res: number; el: string; r: number }

function buildModel(residues: ProteinResidue[]) {
  const n = residues.length
  const all = residues.flatMap((r) => r.atoms ?? [])
  const src = all.length ? all : residues
  const c: V3 = [0, 0, 0]
  src.forEach((a) => {
    c[0] += a.x / src.length
    c[1] += a.y / src.length
    c[2] += a.z / src.length
  })
  const P: V3[] = residues.map((r) => [r.x - c[0], r.y - c[1], r.z - c[2]])
  // fit the folded core, not a floppy tail: the 90th percentile distance from the center
  const ds = P.map((p) => Math.hypot(...p)).sort((a, b) => a - b)
  const radius = Math.max(1, (ds[Math.floor((ds.length - 1) * 0.9)] ?? 1) * 1.12)

  // per-residue frames from the C-alpha trace: N points across the curve, kept from flipping
  const T: V3[] = P.map((_, i) => norm(sub(P[Math.min(n - 1, i + 1)], P[Math.max(0, i - 1)])))
  const N0: V3[] = P.map((_, i) => {
    if (i === 0 || i === n - 1) return [0, 0, 0]
    return norm(sub(add(P[i - 1], P[i + 1]), scl(P[i], 2)))
  })
  if (n > 2) {
    N0[0] = N0[1]
    N0[n - 1] = N0[n - 2]
  }
  // strands pleat, so their normals alternate: flip every other one. Helices turn about 100° a residue, so leave them.
  for (let i = 1; i < n; i++) if (residues[i].ss !== "H" && dot(N0[i], N0[i - 1]) < 0) N0[i] = scl(N0[i], -1)
  const Nr: V3[] = N0.map((v, i) => {
    // strands pleat back and forth: smooth so the arrow lies flat in the sheet
    const s = residues[i].ss === "E" ? norm(add(add(N0[Math.max(0, i - 1)], scl(v, 2)), N0[Math.min(n - 1, i + 1)])) : v
    return norm(sub(s, scl(T[i], dot(s, T[i]))))
  })

  const pts: SplinePt[] = []
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
      pts.push({ p, res: i, t, N: norm(add(scl(Nr[i], 1 - t), scl(Nr[i + 1], t))), B: [0, 0, 0] })
    }
  }
  if (n) pts.push({ p: P[n - 1], res: n - 1, t: 0, N: Nr[n - 1], B: [0, 0, 0] })
  pts.forEach((q, k) => {
    const tan = norm(sub(pts[Math.min(pts.length - 1, k + 1)].p, pts[Math.max(0, k - 1)].p))
    q.N = norm(sub(q.N, scl(tan, dot(q.N, tan))))
    q.B = norm(cross(tan, q.N))
  })

  // atoms and bonds
  const atoms: ModelAtom[] = []
  const firstAtom: number[] = []
  residues.forEach((r, i) => {
    firstAtom.push(atoms.length)
    for (const a of r.atoms ?? []) atoms.push({ p: [a.x - c[0], a.y - c[1], a.z - c[2]], res: i, el: a.element, r: VDW[a.element] ?? 1.7 })
  })
  firstAtom.push(atoms.length)
  const bonds: [number, number][] = []
  const near = (a: number, b: number) => {
    const lim = atoms[a].el === "S" || atoms[b].el === "S" ? 2.1 : 1.9
    const d = sub(atoms[a].p, atoms[b].p)
    return dot(d, d) < lim * lim
  }
  residues.forEach((r, i) => {
    const s = firstAtom[i]
    const e = firstAtom[i + 1]
    for (let a = s; a < e; a++) for (let b = a + 1; b < e; b++) if (near(a, b)) bonds.push([a, b])
    // peptide bond to the next residue
    const cAt = (r.atoms ?? []).findIndex((x) => x.name === "C")
    const nAt = (residues[i + 1]?.atoms ?? []).findIndex((x) => x.name === "N")
    if (cAt >= 0 && nAt >= 0 && near(s + cAt, firstAtom[i + 1] + nAt)) bonds.push([s + cAt, firstAtom[i + 1] + nAt])
  })
  const sideChain = residues.map((r, i) => {
    const ids: number[] = []
    ;(r.atoms ?? []).forEach((a, k) => {
      if (!["N", "C", "O"].includes(a.name)) ids.push(firstAtom[i] + k)
    })
    return ids
  })

  return { P, pts, radius, atoms, bonds, sideChain, hasAtoms: atoms.length > 0 }
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
const shade = (a: RGB, k: number): RGB => [Math.min(255, a[0] * k), Math.min(255, a[1] * k), Math.min(255, a[2] * k)]
const css = ([r, g, b]: RGB, a = 1) => `rgba(${r | 0},${g | 0},${b | 0},${a})`

/** AlphaFold's confidence bands and their standard colors. */
const PLDDT_BANDS = [
  { min: 90, label: "Very high", hex: "#0053d6" },
  { min: 70, label: "Confident", hex: "#65cbf3" },
  { min: 50, label: "Low", hex: "#ffdb13" },
  { min: 0, label: "Very low", hex: "#ff7d45" },
]
const plddtHex = (v = 0) => PLDDT_BANDS.find((b) => v >= b.min)!.hex
/** Conventional element colors for the atoms that aren't carbon. */
const ELEMENT_HEX: Record<string, string> = { N: "#3a62e8", O: "#e8382e", S: "#e8b62e", P: "#f08a1c" }

const SS_NAME = { H: "Helix", E: "Strand", C: "Coil" } as const
const LIGHT = norm([-0.45, 0.55, 0.72])
const HALF = norm(add(LIGHT, [0, 0, 1]))

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

type CanvasStructureProps = Omit<React.ComponentProps<"div">, "children"> & {
  residues: ProteinResidue[]
  representation?: ProteinRepresentation
  colorBy?: ProteinColorBy
  /** "black" (default), "background", "none", or any CSS color. */
  outline?: "black" | "background" | "none" | (string & {})
  /** "flat" (default): plain colors and no shadows, with a bolder outline. "lit": lighting and shadows. */
  shading?: "flat" | "lit"
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

type Prim = { z: number; draw: () => void }

/** The built-in canvas renderer: no WebGL, no dependencies. ProteinStructure falls back to it. */
function CanvasStructure({
  residues,
  representation = "cartoon",
  colorBy = "structure",
  outline = "black",
  shading = "flat",
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
}: CanvasStructureProps) {
  const frameRef = React.useRef<HTMLDivElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const model = React.useMemo(() => buildModel(residues), [residues])
  const [innerHover, setInnerHover] = React.useState<number | null>(null)
  const hovered = hoveredProp !== undefined ? hoveredProp : innerHover
  const [spinning, setSpinning] = React.useState(spin)
  const reduced = React.useRef(false)

  const view = React.useRef({ rot: START, zoom: 1, vx: 0, vy: 0, dragging: false, last: [0, 0] as [number, number] })
  const live = React.useRef({ representation, colorBy, outline, shading, highlight, hovered, firstResidue, spinning })
  live.current = { representation, colorBy, outline, shading, highlight, hovered, firstResidue, spinning }

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

  // kept from the last draw, for hit-testing
  const hits = React.useRef<{ ca: { x: number; y: number; z: number }[]; ids: Int32Array | null; rw: number; rs: number; atomRes: number[] }>({
    ca: [],
    ids: null,
    rw: 0,
    rs: 1,
    atomRes: [],
  })
  const raster = React.useRef<{ w: number; h: number; z: Float32Array; id: Int32Array; tmp: Float32Array; tmp2: Float32Array; img: ImageData | null; off: HTMLCanvasElement | null }>({
    w: 0,
    h: 0,
    z: new Float32Array(0),
    id: new Int32Array(0),
    tmp: new Float32Array(0),
    tmp2: new Float32Array(0),
    img: null,
    off: null,
  })

  drawRef.current = () => {
    frame.current = 0
    const canvas = canvasRef.current
    const el = frameRef.current
    if (!canvas || !el) return
    const v = view.current
    const { representation, colorBy, outline, shading, highlight, hovered, firstResidue, spinning } = live.current
    const isFlat = shading === "flat"

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
    const oc: RGB | null = outline === "none" ? null : outline === "background" ? bg : toRgb(outline === "black" ? "#000" : outline)

    const n = residues.length
    const resColor = (i: number): RGB => {
      const r = residues[i]
      if (colorBy === "plddt") return toRgb(plddtHex(r.plddt))
      if (colorBy === "rainbow") return toRgb(`hsl(${Math.round(250 - (250 * i) / Math.max(1, n - 1))} 72% 52%)`)
      if (colorBy === "plain") return mix(fg, bg, 0.25)
      if (r.ss === "H") return varColor("--brand", "#3355cc")
      if (r.ss === "E") return varColor("--amber", "#d08a00")
      return mix(fg, bg, 0.45)
    }
    const colors = residues.map((_, i) => resColor(i))
    const atomColor = (a: ModelAtom) => (ELEMENT_HEX[a.el] ? toRgb(ELEMENT_HEX[a.el]) : colors[a.res])

    const { P, pts, radius, atoms, bonds, sideChain, hasAtoms } = model
    // atom views are fatter than the backbone: fit their extra radius in the frame too
    const extra = representation === "surface" ? (hasAtoms ? 3.1 : 4.2) : representation === "spacefill" ? (hasAtoms ? 1.7 : 3) : 0
    const base = (Math.min(w, h) / 2) * 0.82
    const scale = (base / (radius + extra)) * v.zoom
    const F = radius * 4
    const proj = (p: V3) => {
      const [x, y, z] = apply(v.rot, p)
      const s = F / (F - z)
      return { x: w / 2 + x * scale * s, y: h / 2 - y * scale * s, z, s }
    }
    const fogOf = (z: number) => Math.min(0.42, Math.max(0, (radius - z) / (2 * radius)) * 0.5)
    const ow = Math.max(1.1, Math.min(2.2, Math.min(w, h) * 0.0026)) * Math.sqrt(v.zoom) * (isFlat ? 1.45 : 1)
    const caProj = P.map((p) => proj(p))
    hits.current.ca = caProj
    hits.current.ids = null

    const hov = hovered != null && hovered - firstResidue >= 0 && hovered - firstResidue < n ? hovered - firstResidue : null
    const marks = highlight.filter((m) => m.residue - firstResidue >= 0 && m.residue - firstResidue < n)
    const markSet = new Set(marks.map((m) => m.residue - firstResidue))

    const prims: Prim[] = []

    /* ---------- ribbons and tubes ---------- */
    const ribbon = (mode: "cartoon" | "tube") => {
      const sp = pts.map((q) => proj(q.p))
      const isE = (i: number) => residues[i]?.ss === "E"
      const kind = (j: number) => {
        const ss = residues[j]?.ss
        if (mode === "tube") return ss === "H" || ss === "E" ? 0.55 : 0.32
        return ss === "H" ? 1.25 : ss === "E" ? 1.0 : 0.3
      }
      const flat = (j: number) => (mode === "cartoon" && (residues[j]?.ss === "H" || residues[j]?.ss === "E") ? 1 : 0)
      const shape = (k: number) => {
        const { res: i, t } = pts[k]
        // strand arrowheads: widen at the last strand residue, narrow into the loop
        if (mode === "cartoon" && isE(i) && !isE(i + 1)) return { hw: 1.75 * (1 - t) + 0.3 * t, f: t < 0.85 ? 1 : 0 }
        const j = Math.min(n - 1, i + 1)
        return { hw: kind(i) * (1 - t) + kind(j) * t, f: flat(i) * (1 - t) + flat(j) * t }
      }
      let side = 1
      const edges = pts.map((q, k) => {
        const a = sp[Math.max(0, k - 1)]
        const b = sp[Math.min(sp.length - 1, k + 1)]
        const tl = Math.hypot(b.x - a.x, b.y - a.y) || 1
        const perp = [-(b.y - a.y) / tl, (b.x - a.x) / tl]
        const { hw, f } = shape(k)
        const px = hw * scale * sp[k].s
        const Bv = apply(v.rot, q.B)
        const bx = Bv[0]
        const by = -Bv[1]
        // a ribbon seen edge-on keeps some thickness, on the side it was already leaning to, so it never collapses to crossed lines
        const lean = bx * perp[0] + by * perp[1]
        if (Math.abs(lean) > 0.3) side = lean > 0 ? 1 : -1
        const ox = (f * (bx + perp[0] * side * 0.24) + (1 - f) * perp[0]) * px
        const oy = (f * (by + perp[1] * side * 0.24) + (1 - f) * perp[1]) * px
        const nz = apply(v.rot, q.N)[2]
        return { x: sp[k].x, y: sp[k].y, ox, oy, f, nz, r: px }
      })
      for (let k = 0; k < edges.length - 1; k++) {
        const a = edges[k]
        const b = edges[k + 1]
        const res = pts[k].res
        const z = (sp[k].z + sp[k + 1].z) / 2
        const f = (a.f + b.f) / 2
        // ribbons shade by how squarely they face you; tubes are flat with a light band
        const nz = (a.nz + b.nz) / 2
        const facing = isFlat ? 1 : f > 0.5 ? (0.62 + 0.38 * Math.abs(nz)) * (nz < 0 ? 0.88 : 1) : 1
        const col = mix(shade(colors[res], facing), bg, fogOf(z))
        // the fill reaches a little into the next piece, so no anti-aliasing seam shows between them
        const c2 = edges[Math.min(edges.length - 1, k + 2)]
        const e = { x: b.x + (c2.x - b.x) * 0.2, y: b.y + (c2.y - b.y) * 0.2, ox: b.ox + (c2.ox - b.ox) * 0.2, oy: b.oy + (c2.oy - b.oy) * 0.2 }
        prims.push({
          z,
          draw: () => {
            ctx.beginPath()
            ctx.moveTo(a.x + a.ox, a.y + a.oy)
            ctx.lineTo(e.x + e.ox, e.y + e.oy)
            ctx.lineTo(e.x - e.ox, e.y - e.oy)
            ctx.lineTo(a.x - a.ox, a.y - a.oy)
            ctx.closePath()
            ctx.fillStyle = css(col)
            ctx.fill()
            if (!isFlat && f < 0.5) {
              // a light band on the side facing the light
              const sa = a.ox * -0.6 + a.oy * -0.8 > 0 ? 1 : -1
              const sb = b.ox * -0.6 + b.oy * -0.8 > 0 ? 1 : -1
              if (sa === sb) {
                ctx.beginPath()
                ctx.moveTo(a.x + a.ox * 0.15 * sa, a.y + a.oy * 0.15 * sa)
                ctx.lineTo(e.x + e.ox * 0.15 * sb, e.y + e.oy * 0.15 * sb)
                ctx.lineTo(e.x + e.ox * 0.6 * sb, e.y + e.oy * 0.6 * sb)
                ctx.lineTo(a.x + a.ox * 0.6 * sa, a.y + a.oy * 0.6 * sa)
                ctx.closePath()
                ctx.fillStyle = css(mix(col, white, 0.28))
                ctx.fill()
              }
            }
            if (oc) {
              ctx.strokeStyle = css(oc)
              ctx.lineWidth = ow
              ctx.lineCap = "round"
              ctx.beginPath()
              // outlines run into the next piece too, so a neighbor drawn later can't leave a gap in them
              ctx.moveTo(a.x + a.ox, a.y + a.oy)
              ctx.lineTo(e.x + e.ox, e.y + e.oy)
              ctx.moveTo(a.x - a.ox, a.y - a.oy)
              ctx.lineTo(e.x - e.ox, e.y - e.oy)
              ctx.stroke()
            }
          },
        })
      }
      // round caps at both ends of the chain
      for (const k of [0, edges.length - 1]) {
        const e = edges[k]
        if (!e) continue
        const col = mix(colors[pts[k].res], bg, fogOf(sp[k].z))
        prims.push({
          z: sp[k].z - 0.01,
          draw: () => {
            ctx.beginPath()
            ctx.arc(e.x, e.y, Math.max(1, e.r), 0, Math.PI * 2)
            ctx.fillStyle = css(col)
            ctx.fill()
            if (oc) {
              ctx.strokeStyle = css(oc)
              ctx.lineWidth = ow
              ctx.stroke()
            }
          },
        })
      }
    }

    /* ---------- trace ---------- */
    const trace = () => {
      const lw = Math.max(1.5, 0.35 * scale)
      for (let i = 0; i < n - 1; i++) {
        const a = caProj[i]
        const b = caProj[i + 1]
        const z = (a.z + b.z) / 2
        const col = mix(colors[i], bg, fogOf(z))
        prims.push({
          z,
          draw: () => {
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            if (oc) {
              ctx.lineCap = "butt"
              ctx.strokeStyle = css(oc)
              ctx.lineWidth = lw + ow * 2
              ctx.stroke()
            }
            ctx.lineCap = "round"
            ctx.strokeStyle = css(col)
            ctx.lineWidth = lw
            ctx.stroke()
          },
        })
      }
    }

    /* ---------- ball-and-stick ---------- */
    const ballAndStick = (only?: Set<number>) => {
      const useAtoms = hasAtoms
      const pos = useAtoms ? atoms.map((a) => proj(a.p)) : caProj
      const colorOf = (i: number) => (useAtoms ? atomColor(atoms[i]) : colors[i])
      const include = (i: number) => !only || only.has(i)
      const pairs: [number, number][] = useAtoms ? bonds : P.slice(1).map((_, i) => [i, i + 1] as [number, number])
      const ballR = (useAtoms ? 0.42 : 0.9) * scale
      const stickW = (useAtoms ? 0.26 : 0.45) * scale
      for (const [i, j] of pairs) {
        if (!include(i) || !include(j)) continue
        const a = pos[i]
        const b = pos[j]
        const mx = (a.x + b.x) / 2
        const my = (a.y + b.y) / 2
        const z = (a.z + b.z) / 2 - 0.05
        const ca = mix(colorOf(i), bg, fogOf(a.z))
        const cb = mix(colorOf(j), bg, fogOf(b.z))
        const lw = stickW * ((a.s + b.s) / 2)
        prims.push({
          z,
          draw: () => {
            ctx.lineCap = "butt"
            if (oc) {
              ctx.strokeStyle = css(oc)
              ctx.lineWidth = lw + ow * 2
              ctx.beginPath()
              ctx.moveTo(a.x, a.y)
              ctx.lineTo(b.x, b.y)
              ctx.stroke()
            }
            ctx.lineWidth = lw
            ctx.strokeStyle = css(ca)
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(mx, my)
            ctx.stroke()
            ctx.strokeStyle = css(cb)
            ctx.beginPath()
            ctx.moveTo(mx, my)
            ctx.lineTo(b.x, b.y)
            ctx.stroke()
          },
        })
      }
      pos.forEach((p, i) => {
        if (!include(i)) return
        const r = ballR * p.s
        const col = mix(colorOf(i), bg, fogOf(p.z))
        prims.push({
          z: p.z,
          draw: () => {
            let fill: string | CanvasGradient = css(col)
            if (!isFlat) {
              const g = ctx.createRadialGradient(p.x - r * 0.35, p.y - r * 0.35, r * 0.1, p.x, p.y, r)
              g.addColorStop(0, css(mix(col, white, 0.45)))
              g.addColorStop(1, css(col))
              fill = g
            }
            ctx.beginPath()
            ctx.arc(p.x, p.y, r, 0, Math.PI * 2)
            ctx.fillStyle = fill
            ctx.fill()
            if (oc) {
              ctx.strokeStyle = css(oc)
              ctx.lineWidth = ow
              ctx.stroke()
            }
          },
        })
      })
    }

    /* ---------- spacefill and surface: a small z-buffer ---------- */
    const rasterize = (mode: "spacefill" | "surface") => {
      const rs = Math.min(1.5, dpr)
      const RW = Math.max(1, Math.round(w * rs))
      const RH = Math.max(1, Math.round(h * rs))
      const R = raster.current
      if (R.w !== RW || R.h !== RH || !R.img) {
        R.w = RW
        R.h = RH
        R.z = new Float32Array(RW * RH)
        R.id = new Int32Array(RW * RH)
        R.tmp = new Float32Array(RW * RH)
        R.tmp2 = new Float32Array(RW * RH)
        R.img = new ImageData(RW, RH)
        R.off = document.createElement("canvas")
        R.off.width = RW
        R.off.height = RH
      }
      const zb = R.z
      const idb = R.id
      zb.fill(-Infinity)
      idb.fill(-1)
      const useAtoms = hasAtoms
      const probeR = mode === "surface" && useAtoms ? 1.4 : 0
      const sph = useAtoms
        ? atoms.map((a) => ({ p: a.p, r: a.r + probeR, res: a.res, el: a.el }))
        : P.map((p, i) => ({ p, r: mode === "surface" ? 4.2 : 3.0, res: i, el: "C" }))
      const sx = new Float32Array(sph.length)
      const sy = new Float32Array(sph.length)
      const sr = new Float32Array(sph.length)
      const k = scale * rs
      sph.forEach((s, i) => {
        const q = proj(s.p)
        sx[i] = q.x * rs
        sy[i] = q.y * rs
        const r = (sr[i] = s.r * k * q.s)
        const cz = q.z * k
        const x0 = Math.max(0, Math.floor(sx[i] - r))
        const x1 = Math.min(RW - 1, Math.ceil(sx[i] + r))
        const y0 = Math.max(0, Math.floor(sy[i] - r))
        const y1 = Math.min(RH - 1, Math.ceil(sy[i] + r))
        const r2 = r * r
        for (let y = y0; y <= y1; y++) {
          const dy = y + 0.5 - sy[i]
          const row = y * RW
          for (let x = x0; x <= x1; x++) {
            const dx = x + 0.5 - sx[i]
            const d2 = dx * dx + dy * dy
            if (d2 > r2) continue
            const z = cz + Math.sqrt(r2 - d2)
            if (z > zb[row + x]) {
              zb[row + x] = z
              idb[row + x] = i
            }
          }
        }
      })

      // surface: smooth the depth so the spheres melt into one skin
      let zs = zb
      if (mode === "surface") {
        let zmin = Infinity
        for (let i = 0; i < zb.length; i++) if (zb[i] > -Infinity && zb[i] < zmin) zmin = zb[i]
        const floor = zmin - 3 * k
        const a = R.tmp
        const b = R.tmp2
        for (let i = 0; i < zb.length; i++) a[i] = zb[i] > -Infinity ? zb[i] : floor
        const rad = Math.max(1, Math.min(8, Math.round(0.75 * k)))
        const box = (from: Float32Array, to: Float32Array, horizontal: boolean) => {
          const len = horizontal ? RW : RH
          const lines = horizontal ? RH : RW
          const step = horizontal ? 1 : RW
          for (let l = 0; l < lines; l++) {
            const o0 = horizontal ? l * RW : l
            let acc = 0
            for (let j = -rad; j <= rad; j++) acc += from[o0 + Math.min(len - 1, Math.max(0, j)) * step]
            for (let j = 0; j < len; j++) {
              to[o0 + j * step] = acc / (rad * 2 + 1)
              acc += from[o0 + Math.min(len - 1, j + rad + 1) * step] - from[o0 + Math.max(0, j - rad) * step]
            }
          }
        }
        box(a, b, true)
        box(b, a, false)
        box(a, b, true)
        box(b, a, false)
        zs = a
      }

      const img = R.img!
      const data = img.data
      const thr = (mode === "surface" ? 2.2 : 0.9) * k
      const o = Math.max(1, Math.round(ow * rs * 0.75))
      let zmax = -Infinity
      let zlo = Infinity
      for (let i = 0; i < zb.length; i++)
        if (zb[i] > -Infinity) {
          if (zb[i] > zmax) zmax = zb[i]
          if (zb[i] < zlo) zlo = zb[i]
        }
      const zr = Math.max(1, zmax - zlo)
      const sphereColors = sph.map((s) => {
        let c = mode === "spacefill" && ELEMENT_HEX[s.el] ? toRgb(ELEMENT_HEX[s.el]) : colors[s.res]
        if (markSet.has(s.res)) c = mix(fg, bg, 0.15)
        if (s.res === hov) c = mix(c, fg, 0.45)
        return c
      })
      for (let y = 0; y < RH; y++) {
        for (let x = 0; x < RW; x++) {
          const p = y * RW + x
          const id = idb[p]
          const di = p * 4
          if (id < 0) {
            data[di + 3] = 0
            continue
          }
          const z = zb[p]
          let edge = false
          if (oc) {
            if (x - o < 0 || x + o >= RW || y - o < 0 || y + o >= RH) edge = true
            else
              for (const q of [p - o, p + o, p - o * RW, p + o * RW])
                if (idb[q] < 0 || z - zb[q] > thr) {
                  edge = true
                  break
                }
          }
          let c: RGB
          if (edge) c = oc!
          else {
            let nx: number, ny: number, nz: number
            if (mode === "surface") {
              const gx = (zs[x + 1 < RW ? p + 1 : p] - zs[x > 0 ? p - 1 : p]) / 2
              const gy = (zs[y + 1 < RH ? p + RW : p] - zs[y > 0 ? p - RW : p]) / 2
              const l = Math.hypot(gx, gy, 1)
              nx = -gx / l
              ny = gy / l
              nz = 1 / l
            } else {
              const r = sr[id]
              nx = (x + 0.5 - sx[id]) / r
              ny = -(y + 0.5 - sy[id]) / r
              nz = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny))
            }
            const diff = Math.max(0, nx * LIGHT[0] + ny * LIGHT[1] + nz * LIGHT[2])
            const spec = Math.pow(Math.max(0, nx * HALF[0] + ny * HALF[1] + nz * HALF[2]), 28) * 0.22
            c = isFlat
              ? mix(sphereColors[id], bg, ((zmax - z) / zr) * 0.25)
              : mix(mix(shade(sphereColors[id], 0.52 + 0.6 * diff), white, spec), bg, ((zmax - z) / zr) * 0.38)
          }
          data[di] = c[0]
          data[di + 1] = c[1]
          data[di + 2] = c[2]
          data[di + 3] = 255
        }
      }
      const off = R.off!
      off.getContext("2d")!.putImageData(img, 0, 0)
      ctx.imageSmoothingEnabled = true
      ctx.drawImage(off, 0, 0, w, h)
      hits.current.ids = idb
      hits.current.rw = RW
      hits.current.rs = rs
      hits.current.atomRes = sph.map((s) => s.res)
    }

    /* ---------- build and draw ---------- */
    if (representation === "cartoon" || representation === "tube") ribbon(representation)
    else if (representation === "trace") trace()
    else if (representation === "ball-and-stick") ballAndStick()

    const vector = representation === "cartoon" || representation === "tube" || representation === "trace"
    if (vector && marks.length) {
      // highlighted residues: side chains as ball-and-stick when atoms are known, otherwise a sphere on the C-alpha
      if (hasAtoms) ballAndStick(new Set(marks.flatMap((m) => sideChain[m.residue - firstResidue])))
      else
        for (const m of marks) {
          const p = caProj[m.residue - firstResidue]
          const r = Math.max(4, 1.2 * scale) * p.s
          prims.push({
            z: p.z + 0.01,
            draw: () => {
              let fill: string | CanvasGradient = css(fg)
              if (!isFlat) {
                const g = ctx.createRadialGradient(p.x - r * 0.35, p.y - r * 0.35, r * 0.1, p.x, p.y, r)
                g.addColorStop(0, css(mix(fg, white, 0.5)))
                g.addColorStop(1, css(fg))
                fill = g
              }
              ctx.beginPath()
              ctx.arc(p.x, p.y, r, 0, Math.PI * 2)
              ctx.fillStyle = fill
              ctx.fill()
              if (oc) {
                ctx.strokeStyle = css(oc)
                ctx.lineWidth = ow
                ctx.stroke()
              }
            },
          })
        }
    }
    prims.sort((a, b) => a.z - b.z).forEach((p) => p.draw())
    if (representation === "spacefill" || representation === "surface") rasterize(representation)

    // labels on top
    const family = cs.fontFamily
    const pill = (text: string, x: number, y: number, subText?: string) => {
      ctx.font = `600 12px ${family}`
      const tw = ctx.measureText(text).width
      ctx.font = `400 11px ${family}`
      const sw = subText ? ctx.measureText(subText).width : 0
      const pw = Math.max(tw, sw) + 16
      const ph = subText ? 36 : 22
      let px = x + 12
      let py = y - ph - 8
      if (px + pw > w - 4) px = x - pw - 12
      if (py < 4) py = y + 12
      ctx.fillStyle = css(fg)
      ctx.beginPath()
      ctx.roundRect(px, py, pw, ph, 6)
      ctx.fill()
      ctx.fillStyle = css(bg)
      ctx.textBaseline = "middle"
      ctx.font = `600 12px ${family}`
      ctx.fillText(text, px + 8, py + (subText ? 12 : ph / 2))
      if (subText) {
        ctx.font = `400 11px ${family}`
        ctx.fillStyle = css(mix(bg, fg, 0.3))
        ctx.fillText(subText, px + 8, py + 26)
      }
    }
    for (const m of marks) {
      if (!m.label || m.residue - firstResidue === hov) continue
      const p = caProj[m.residue - firstResidue]
      pill(m.label, p.x, p.y)
    }
    if (hov !== null) {
      const p = caProj[hov]
      const d = describe(residues[hov], hov + firstResidue)
      if (vector || representation === "ball-and-stick") {
        ctx.strokeStyle = css(fg)
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(p.x, p.y, Math.max(6, 1.4 * scale * p.s), 0, Math.PI * 2)
        ctx.stroke()
      }
      pill(d.title, p.x, p.y, d.meta)
    }

    if (more) request()
  }

  React.useEffect(() => {
    request()
  }, [request, representation, colorBy, outline, shading, highlight, hovered, firstResidue, spinning, model])

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
    const H = hits.current
    if (H.ids) {
      const id = H.ids[Math.floor(y * H.rs) * H.rw + Math.floor(x * H.rs)]
      return id !== undefined && id >= 0 ? H.atomRes[id] + firstResidue : null
    }
    let best: number | null = null
    let bestScore = Infinity
    H.ca.forEach((p, i) => {
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
    view.current.dragging = false
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

  const legendItems = legendFor(colorBy, representation, model.hasAtoms)

  return (
    <div data-slot="protein-structure" data-representation={representation} className={cn("flex min-w-0 flex-col gap-3", className)} {...props}>
      <div ref={frameRef} className="relative min-w-0 overflow-hidden rounded-3xl bg-surface-container-low text-foreground dark:bg-surface-container">
        <canvas
          ref={canvasRef}
          role="application"
          aria-roledescription="3D structure viewer"
          aria-label={`${label}, ${representation} view. ${residues.length} residues. Drag or use the arrow keys to turn, plus and minus to zoom, 0 to reset.`}
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
        {controls && <ViewerControls spinning={spinning} onSpin={() => setSpinning((s) => !s)} onZoom={zoomBy} onReset={reset} />}
      </div>
      {legend && <Legend items={legendItems} />}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Shared pieces                                                       */
/* ------------------------------------------------------------------ */

type LegendItem = { label: string; style: React.CSSProperties }

function legendFor(colorBy: ProteinColorBy, representation: ProteinRepresentation, hasAtoms: boolean): LegendItem[] {
  const atomView = representation === "ball-and-stick" || representation === "spacefill"
  return [
    ...(atomView && hasAtoms
      ? []
      : colorBy === "plddt"
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
            : []),
    ...(atomView && hasAtoms
      ? [
          { label: "Carbon", style: { background: "color-mix(in oklch, var(--foreground) 55%, transparent)" } },
          { label: "Nitrogen", style: { background: ELEMENT_HEX.N } },
          { label: "Oxygen", style: { background: ELEMENT_HEX.O } },
          { label: "Sulfur", style: { background: ELEMENT_HEX.S } },
        ]
      : []),
  ]
}

function Legend({ items }: { items: LegendItem[] }) {
  if (!items.length) return null
  return (
    <ul aria-label="Color key" className="flex flex-wrap gap-x-4 gap-y-1.5 px-1 type-label-md text-muted-foreground">
      {items.map((it) => (
        <li key={it.label} className="flex items-center gap-1.5">
          <span aria-hidden className="size-2.5 rounded-full" style={it.style} />
          {it.label}
        </li>
      ))}
    </ul>
  )
}

function ViewerControls({ spinning, onSpin, onZoom, onReset }: { spinning: boolean; onSpin: () => void; onZoom: (f: number) => void; onReset: () => void }) {
  return (
    <div className="absolute right-3 bottom-3 flex items-center gap-1 rounded-full bg-card p-1 shadow-e2 dark:bg-surface-container-highest">
      <Button size="icon-sm" variant="ghost" aria-label={spinning ? "Stop turning" : "Turn slowly"} aria-pressed={spinning} onClick={onSpin}>
        <Icon name={spinning ? "pause" : "3d_rotation"} />
      </Button>
      <Button size="icon-sm" variant="ghost" aria-label="Zoom out" onClick={() => onZoom(1 / 1.2)}>
        <Icon name="remove" />
      </Button>
      <Button size="icon-sm" variant="ghost" aria-label="Zoom in" onClick={() => onZoom(1.2)}>
        <Icon name="add" />
      </Button>
      <Button size="icon-sm" variant="ghost" aria-label="Reset view" onClick={onReset}>
        <Icon name="center_focus_strong" />
      </Button>
    </div>
  )
}

const ONE_TO_THREE: Record<string, string> = Object.fromEntries(Object.entries(THREE_TO_ONE).map(([k, v]) => [v, k]))

/** Writes residues as a PDB file (chain A, numbered from `first`), with HELIX/SHEET records and pLDDT as B-factors. */
function toPdb(residues: ProteinResidue[], first = 1): string {
  const out: string[] = []
  const f = (v: number, w: number, d: number) => v.toFixed(d).padStart(w)
  const runs = (ss: "H" | "E") => {
    const r: [number, number][] = []
    residues.forEach((x, i) => {
      if (x.ss !== ss) return
      const last = r[r.length - 1]
      if (last && last[1] === i - 1) last[1] = i
      else r.push([i, i])
    })
    return r
  }
  const res = (i: number) => ONE_TO_THREE[residues[i].aa ?? ""] ?? "UNK"
  runs("H").forEach(([a, b], k) =>
    out.push(`HELIX  ${String(k + 1).padStart(3)} ${String(k + 1).padStart(3)} ${res(a)} A ${String(a + first).padStart(4)}  ${res(b)} A ${String(b + first).padStart(4)}  1${"".padEnd(30)}${String(b - a + 1).padStart(5)}`)
  )
  runs("E").forEach(([a, b], k) =>
    out.push(`SHEET  ${String(k + 1).padStart(3)} ${String.fromCharCode(65 + (k % 26)).padStart(3)} 1 ${res(a)} A${String(a + first).padStart(4)}  ${res(b)} A${String(b + first).padStart(4)}  0`)
  )
  let serial = 1
  residues.forEach((r, i) => {
    const atoms: ProteinAtom[] = r.atoms?.length ? r.atoms : [{ name: "CA", element: "C", x: r.x, y: r.y, z: r.z }]
    for (const a of atoms) {
      const name = a.name.length < 4 ? ` ${a.name}`.padEnd(4) : a.name.slice(0, 4)
      out.push(
        `ATOM  ${String(serial++).padStart(5)} ${name} ${res(i)} A${String(i + first).padStart(4)}    ${f(a.x, 8, 3)}${f(a.y, 8, 3)}${f(a.z, 8, 3)}${f(1, 6, 2)}${f(r.plddt ?? 0, 6, 2)}          ${a.element.padStart(2)}`
      )
    }
  })
  out.push("END")
  return out.join("\n")
}

/* ------------------------------------------------------------------ */
/* Mol* view                                                           */
/* ------------------------------------------------------------------ */

type MolstarEngine = import("./protein-structure-molstar").MolstarEngine

type MolstarViewProps = Omit<CanvasStructureProps, "residues"> & {
  residues?: ProteinResidue[]
  url?: string
  format?: "pdb" | "mmcif" | "bcif"
  onEngineState: (state: "ready" | "failed") => void
}

function MolstarStructure({
  residues,
  url,
  format = "pdb",
  representation = "cartoon",
  colorBy = "structure",
  outline = "black",
  shading = "flat",
  highlight = [],
  firstResidue = 1,
  hovered: hoveredProp,
  onHoveredChange,
  spin = false,
  controls = true,
  legend = true,
  label = "Protein structure",
  onEngineState,
  className,
  ...props
}: MolstarViewProps) {
  const frameRef = React.useRef<HTMLDivElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const engineRef = React.useRef<MolstarEngine | null>(null)
  const [ready, setReady] = React.useState(false)
  const [loadError, setLoadError] = React.useState(false)
  const [innerHover, setInnerHover] = React.useState<{ residue: number; name?: string } | null>(null)
  const hovered = hoveredProp !== undefined ? hoveredProp : (innerHover?.residue ?? null)
  const [spinning, setSpinning] = React.useState(spin)
  const reduced = React.useRef(false)
  const labelRefs = React.useRef(new Map<number, HTMLSpanElement>())
  const tipRef = React.useRef<HTMLSpanElement>(null)
  const centers = React.useRef(new Map<number, [number, number, number]>())
  const hasAtoms = !!residues?.some((r) => r.atoms?.length) || !!url

  React.useEffect(() => {
    reduced.current = matchMedia("(prefers-reduced-motion: reduce)").matches
    setSpinning(spin && !reduced.current)
  }, [spin])

  const hoverCb = React.useRef<(r: { residue: number; name?: string } | null) => void>(() => {})
  hoverCb.current = (r) => {
    if (hoveredProp === undefined) setInnerHover(r)
    if ((r?.residue ?? null) !== hovered) onHoveredChange?.(r?.residue ?? null)
  }

  // start Mol* once
  React.useEffect(() => {
    let disposed = false
    let unsub: (() => void)[] = []
    const canvas = canvasRef.current
    const frame = frameRef.current
    if (!canvas || !frame) return
    import("./protein-structure-molstar")
      .then((m) => m.createMolstarEngine(canvas, frame))
      .then((engine) => {
        if (disposed) return engine?.dispose()
        if (!engine) return onEngineState("failed")
        engineRef.current = engine
        unsub = [
          engine.onHover((info) => hoverCb.current(info)),
          engine.onDraw(() => placeOverlays()),
        ]
        setReady(true)
      })
      .catch(() => !disposed && onEngineState("failed"))
    return () => {
      disposed = true
      unsub.forEach((u) => u())
      engineRef.current?.dispose()
      engineRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // overlays follow the camera
  const placeOverlays = () => {
    const engine = engineRef.current
    if (!engine) return
    const place = (el: HTMLElement | null | undefined, residue: number | null | undefined) => {
      if (!el) return
      const c = residue != null ? centers.current.get(residue) : undefined
      if (!c) {
        el.style.visibility = "hidden"
        return
      }
      const p = engine.project(...c)
      el.style.visibility = "visible"
      el.style.transform = `translate(${Math.round(p.x + 12)}px, ${Math.round(p.y - 12)}px) translateY(-100%)`
    }
    labelRefs.current.forEach((el, residue) => place(el, residue))
    place(tipRef.current, live.current.hovered)
  }
  const live = React.useRef({ hovered })
  live.current = { hovered }

  // load the structure
  const pdb = React.useMemo(() => (residues?.length ? toPdb(residues, firstResidue) : null), [residues, firstResidue])
  React.useEffect(() => {
    const engine = engineRef.current
    if (!engine || !ready) return
    const source = pdb ? { pdb } : url ? { url, format } : null
    if (!source) return
    let cancelled = false
    setLoadError(false)
    engine
      .load(source, label)
      .then(() => {
        if (cancelled) return
        onEngineState("ready")
        engine.plugin.canvas3d?.requestDraw()
      })
      .catch(() => {
        // the viewer works but the file didn't load: say so, rather than falling back to an empty canvas
        if (cancelled) return
        setLoadError(true)
        onEngineState("ready")
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, pdb, url, format])

  // residue centers for labels and the tooltip
  React.useEffect(() => {
    centers.current = new Map()
    if (residues) residues.forEach((r, i) => centers.current.set(i + firstResidue, [r.x, r.y, r.z]))
  }, [residues, firstResidue])

  // style: colors come from the design tokens, so read them from the page
  const [themeTick, setThemeTick] = React.useState(0)
  React.useEffect(() => {
    const mo = new MutationObserver(() => setThemeTick((t) => t + 1))
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "style", "data-theme"] })
    const mq = matchMedia("(prefers-color-scheme: dark)")
    const on = () => setThemeTick((t) => t + 1)
    mq.addEventListener("change", on)
    return () => {
      mo.disconnect()
      mq.removeEventListener("change", on)
    }
  }, [])
  const sideChains = React.useMemo(() => highlight.map((m) => m.residue), [highlight])
  React.useEffect(() => {
    const engine = engineRef.current
    const el = frameRef.current
    if (!engine || !ready || !el) return
    const cs = getComputedStyle(el)
    const bg = toRgb(cs.backgroundColor)
    const fg = toRgb(cs.color)
    const v = (n: string, fb: string) => toRgb(cs.getPropertyValue(n).trim() || fb)
    void engine.setStyle({
      representation,
      colorBy,
      outline: outline === "none" ? null : outline === "background" ? bg : toRgb(outline === "black" ? "#000" : outline),
      background: bg,
      helix: v("--brand", "#3355cc"),
      strand: v("--amber", "#d08a00"),
      coil: mix(fg, bg, 0.45),
      plain: mix(fg, bg, 0.3),
      highlightColor: mix(fg, bg, 0.1),
      sideChains: hasAtoms ? sideChains : [],
      spin: spinning,
      shading,
    })
  }, [ready, representation, colorBy, outline, shading, sideChains, spinning, themeTick, hasAtoms])

  // hovered from outside (a sequence view) lights the residue in 3D
  React.useEffect(() => {
    if (hoveredProp === undefined) return
    engineRef.current?.highlight(hoveredProp)
    placeOverlays()
  }, [hoveredProp, ready])

  React.useEffect(() => {
    const el = frameRef.current
    if (!el) return
    const ro = new ResizeObserver(() => engineRef.current?.resize())
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const onKeyDown = (e: React.KeyboardEvent) => {
    const engine = engineRef.current
    if (!engine) return
    const step = 0.17
    const map: Record<string, () => void> = {
      ArrowLeft: () => engine.turn(-step, 0),
      ArrowRight: () => engine.turn(step, 0),
      ArrowUp: () => engine.turn(0, -step),
      ArrowDown: () => engine.turn(0, step),
      "+": () => engine.zoom(1.15),
      "=": () => engine.zoom(1.15),
      "-": () => engine.zoom(1 / 1.15),
      "0": () => engine.reset(),
    }
    const f = map[e.key]
    if (f) {
      e.preventDefault()
      setSpinning(false)
      f()
    }
  }

  const hovRes = hovered != null ? residues?.[hovered - firstResidue] : undefined
  const tip =
    hovered != null
      ? hovRes
        ? describe(hovRes, hovered)
        : { title: `${innerHover?.name ? (ONE_TO_NAME[THREE_TO_ONE[innerHover.name] ?? ""] ?? innerHover.name) : "Residue"} ${hovered}`, meta: "" }
      : null
  const pill = "pointer-events-none absolute top-0 left-0 rounded-md bg-foreground px-2 py-1 text-background will-change-transform"

  return (
    <div data-slot="protein-structure" data-engine="molstar" data-representation={representation} className={cn("flex min-w-0 flex-col gap-3", className)} {...props}>
      <div ref={frameRef} className="relative min-w-0 overflow-hidden rounded-3xl bg-surface-container-low text-foreground dark:bg-surface-container">
        <canvas
          ref={canvasRef}
          role="application"
          aria-roledescription="3D structure viewer"
          aria-label={`${label}, ${representation} view${residues ? `. ${residues.length} residues` : ""}. Drag or use the arrow keys to turn, plus and minus to zoom, 0 to reset.`}
          tabIndex={0}
          onKeyDown={onKeyDown}
          onPointerDown={() => setSpinning(false)}
          onPointerLeave={() => hoveredProp === undefined && setInnerHover(null)}
          className="block aspect-[4/3] w-full cursor-grab touch-none rounded-3xl outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring active:cursor-grabbing"
        />
        {highlight
          .filter((m) => m.label && m.residue !== hovered)
          .map((m) => (
            <span
              key={m.residue}
              aria-hidden
              ref={(el) => {
                if (el) labelRefs.current.set(m.residue, el)
                else labelRefs.current.delete(m.residue)
              }}
              className={cn(pill, "invisible type-label-md font-semibold")}
            >
              {m.label}
            </span>
          ))}
        {tip && (
          <span ref={tipRef} aria-hidden className={cn(pill, "invisible flex flex-col")}>
            <span className="type-label-md font-semibold">{tip.title}</span>
            {tip.meta && <span className="type-label-sm opacity-70">{tip.meta}</span>}
          </span>
        )}
        <span role="status" className="sr-only">
          {tip ? [tip.title, tip.meta].filter(Boolean).join(", ") : ""}
        </span>
        {loadError && (
          <p className="absolute inset-0 grid place-items-center px-6 text-center type-body-md text-muted-foreground">
            Couldn&apos;t load {url ? "this structure file" : "the structure"}.
          </p>
        )}
        {controls && (
          <ViewerControls
            spinning={spinning}
            onSpin={() => setSpinning((s) => !s)}
            onZoom={(f) => engineRef.current?.zoom(f)}
            onReset={() => engineRef.current?.reset()}
          />
        )}
      </div>
      {legend && <Legend items={legendFor(colorBy, representation, hasAtoms)} />}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* ProteinStructure                                                    */
/* ------------------------------------------------------------------ */

type ProteinStructureProps = Omit<CanvasStructureProps, "residues"> & {
  /** Residues with C-alpha positions and, optionally, atoms. Use this or `url`. */
  residues?: ProteinResidue[]
  /** A structure file to load instead of `residues` (Mol* reads PDB, mmCIF and BinaryCIF). */
  url?: string
  format?: "pdb" | "mmcif" | "bcif"
  /** "molstar" (default): GPU rendering with Mol*. "canvas": the built-in renderer, with no WebGL or dependencies. */
  engine?: "molstar" | "canvas"
}

function ProteinStructure({ engine = "molstar", url, format = "pdb", residues, className, ...props }: ProteinStructureProps) {
  const [state, setState] = React.useState<"loading" | "ready" | "failed">("loading")
  const [fetched, setFetched] = React.useState<ProteinResidue[] | null>(null)
  const useCanvas = engine === "canvas" || state === "failed"

  // the canvas renderer reads PDB files itself
  React.useEffect(() => {
    if (!useCanvas || residues || !url || format !== "pdb") return
    let alive = true
    fetch(url)
      .then((r) => r.text())
      .then((t) => alive && setFetched(parsePdb(t, { plddt: props.colorBy === "plddt" })))
      .catch(() => {})
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useCanvas, residues, url, format])

  const data = residues ?? fetched ?? []
  if (useCanvas) return <CanvasStructure residues={data} className={className} {...props} />

  return (
    <div className={cn("relative min-w-0", className)}>
      <MolstarStructure
        residues={residues}
        url={url}
        format={format}
        onEngineState={(s) => setState(s)}
        className={cn(state !== "ready" && "invisible")}
        {...props}
      />
      {state === "loading" && data.length > 0 && (
        // while Mol* loads, the canvas renderer stands in, at the same size
        <div className="absolute inset-0">
          <CanvasStructure residues={data} {...props} />
        </div>
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
  CanvasStructure,
  parsePdb,
  toPdb,
  PLDDT_BANDS,
  type ProteinStructureProps,
  type CanvasStructureProps,
  type ProteinResidue,
  type ProteinAtom,
  type ProteinColorBy,
  type ProteinRepresentation,
  type ProteinHighlight,
}
