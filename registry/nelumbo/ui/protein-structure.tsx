"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/registry/nelumbo/ui/button"
import { Icon } from "@/registry/nelumbo/ui/icon"
import { LoadingIndicator } from "@/registry/nelumbo/ui/loading-indicator"

/**
 * Nelumbo ProteinStructure
 *
 * A 3D protein viewer on Mol*, drawn on the GPU with WebGL. Mol* loads only
 * when a viewer is on the page; until then a loading indicator holds the
 * space. Drag to turn it, use the arrow keys, or let it spin.
 *
 *   <ProteinStructure residues={ubiquitin} highlight={[{ residue: 48, label: "K48" }]} />
 *   <ProteinStructure url="https://files.rcsb.org/download/4HHB.cif" format="mmcif" />
 *
 * - Data: `residues` (C-alpha positions with optional atoms, secondary
 *   structure and pLDDT) or a `url` to a PDB, mmCIF or BinaryCIF file.
 *   `parsePdb(text)` reads a PDB file into residues.
 * - `representation`: "cartoon" (default), "tube", "trace",
 *   "ball-and-stick", "spacefill" or "surface".
 * - `shading`: "flat" (default) draws plain colors with no shadows and a
 *   bolder outline; "lit" adds lighting and ambient occlusion.
 * - `outline`: "black" (default), "background", "none", or any CSS color.
 * - `colorBy`: "structure" (helix, strand, coil), "plddt" (AlphaFold's
 *   confidence bands, in their standard colors), "rainbow" (N to C terminus)
 *   or "plain". Atom views color nitrogen, oxygen and sulfur.
 * - `highlight`: residues marked with a label, side chains shown.
 * - `selected` / `onSelectedChange`: residues the user picked. Clicking a
 *   residue in 3D adds or removes it; selected residues are outlined and
 *   show their side chains. Pair it with a sequence view.
 * - `hovered` / `onHoveredChange`: the residue under the pointer.
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

/** AlphaFold's confidence bands and their standard colors. */
const PLDDT_BANDS = [
  { min: 90, label: "Very high", hex: "#0053d6" },
  { min: 70, label: "Confident", hex: "#65cbf3" },
  { min: 50, label: "Low", hex: "#ffdb13" },
  { min: 0, label: "Very low", hex: "#ff7d45" },
]
/** Conventional element colors for the atoms that aren't carbon. */
const ELEMENT_HEX: Record<string, string> = { N: "#3a62e8", O: "#e8382e", S: "#e8b62e", P: "#f08a1c" }

const SS_NAME = { H: "Helix", E: "Strand", C: "Coil" } as const

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
/* ProteinStructure                                                    */
/* ------------------------------------------------------------------ */

type MolstarEngine = import("./protein-structure-molstar").MolstarEngine

type ProteinStructureProps = Omit<React.ComponentProps<"div">, "children"> & {
  /** Residues with C-alpha positions and, optionally, atoms. Use this or `url`. */
  residues?: ProteinResidue[]
  /** A structure file to load instead of `residues`: PDB, mmCIF or BinaryCIF. */
  url?: string
  format?: "pdb" | "mmcif" | "bcif"
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
  /** Selected residues, when controlled. */
  selected?: number[]
  defaultSelected?: number[]
  /** Called when a click in 3D adds or removes a residue. */
  onSelectedChange?: (residues: number[]) => void
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
  selected: selectedProp,
  defaultSelected = [],
  onSelectedChange,
  spin = false,
  controls = true,
  legend = true,
  label = "Protein structure",
  className,
  ...props
}: ProteinStructureProps) {
  const frameRef = React.useRef<HTMLDivElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const engineRef = React.useRef<MolstarEngine | null>(null)
  const [status, setStatus] = React.useState<"loading" | "ready" | "no-webgl" | "load-error">("loading")
  const [ready, setReady] = React.useState(false)
  const [innerHover, setInnerHover] = React.useState<{ residue: number; name?: string } | null>(null)
  const hovered = hoveredProp !== undefined ? hoveredProp : (innerHover?.residue ?? null)
  const [innerSelected, setInnerSelected] = React.useState<number[]>(defaultSelected)
  const selected = selectedProp ?? innerSelected
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

  // engine callbacks read the latest props through refs
  const live = React.useRef({ hovered, selected, hoveredProp, selectedProp, onHoveredChange, onSelectedChange })
  live.current = { hovered, selected, hoveredProp, selectedProp, onHoveredChange, onSelectedChange }
  const onEngineHover = (r: { residue: number; name?: string } | null) => {
    const L = live.current
    if (L.hoveredProp === undefined) setInnerHover(r)
    if ((r?.residue ?? null) !== L.hovered) L.onHoveredChange?.(r?.residue ?? null)
  }
  const onEngineClick = (residue: number) => {
    const L = live.current
    const next = L.selected.includes(residue) ? L.selected.filter((n) => n !== residue) : [...L.selected, residue].sort((a, b) => a - b)
    if (L.selectedProp === undefined) setInnerSelected(next)
    L.onSelectedChange?.(next)
  }
  const handlers = React.useRef({ onEngineHover, onEngineClick })
  handlers.current = { onEngineHover, onEngineClick }

  // overlays follow the camera
  const placeOverlays = React.useCallback(() => {
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
  }, [])

  // start Mol* once, on the client
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
        if (!engine) return setStatus("no-webgl")
        engineRef.current = engine
        unsub = [
          engine.onHover((info) => handlers.current.onEngineHover(info)),
          engine.onClick((residue) => handlers.current.onEngineClick(residue)),
          engine.onDraw(placeOverlays),
        ]
        setReady(true)
      })
      .catch(() => !disposed && setStatus("no-webgl"))
    return () => {
      disposed = true
      unsub.forEach((u) => u())
      engineRef.current?.dispose()
      engineRef.current = null
    }
  }, [placeOverlays])

  // load the structure
  const pdb = React.useMemo(() => (residues?.length ? toPdb(residues, firstResidue) : null), [residues, firstResidue])
  React.useEffect(() => {
    const engine = engineRef.current
    if (!engine || !ready) return
    const source = pdb ? { pdb } : url ? { url, format } : null
    if (!source) return
    let cancelled = false
    setStatus("loading")
    engine
      .load(source, label)
      .then(() => !cancelled && setStatus("ready"))
      .catch(() => !cancelled && setStatus("load-error"))
    return () => {
      cancelled = true
    }
    // the label only names the data in Mol*; a new label alone shouldn't reload
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, pdb, url, format])

  // residue centers for labels and the tooltip
  React.useEffect(() => {
    centers.current = new Map()
    if (residues) residues.forEach((r, i) => centers.current.set(i + firstResidue, [r.x, r.y, r.z]))
  }, [residues, firstResidue])

  // colors come from the design tokens, so read them from the page, and again when the theme changes
  const [themeTick, setThemeTick] = React.useState(0)
  React.useEffect(() => {
    const on = () => setThemeTick((t) => t + 1)
    const mo = new MutationObserver(on)
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "style", "data-theme"] })
    const mq = matchMedia("(prefers-color-scheme: dark)")
    mq.addEventListener("change", on)
    return () => {
      mo.disconnect()
      mq.removeEventListener("change", on)
    }
  }, [])

  // side chains: highlighted and selected residues
  const sideChains = React.useMemo(
    () => [...new Set([...highlight.map((m) => m.residue), ...selected])].sort((a, b) => a - b),
    [highlight, selected]
  )
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
      // selection darkens toward the text color, which no structure color uses
      selectColor: fg,
      sideChains: hasAtoms ? sideChains : [],
      spin: spinning,
      shading,
    })
  }, [ready, status, representation, colorBy, outline, shading, sideChains, spinning, themeTick, hasAtoms])

  // selection and outside hover light residues in 3D
  React.useEffect(() => {
    if (status === "ready") engineRef.current?.select(selected)
  }, [selected, status])
  React.useEffect(() => {
    if (hoveredProp === undefined || status !== "ready") return
    engineRef.current?.highlight(hoveredProp)
    placeOverlays()
  }, [hoveredProp, status, placeOverlays])

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
  const message =
    status === "no-webgl"
      ? "This 3D view needs WebGL, which this browser has turned off."
      : status === "load-error"
        ? `Couldn't load ${url ? "this structure file" : "the structure"}.`
        : null

  return (
    <div data-slot="protein-structure" data-status={status} data-representation={representation} className={cn("flex min-w-0 flex-col gap-3", className)} {...props}>
      <div ref={frameRef} className="relative min-w-0 overflow-hidden rounded-3xl bg-surface-container-low text-foreground dark:bg-surface-container">
        <canvas
          ref={canvasRef}
          role="application"
          aria-roledescription="3D structure viewer"
          aria-label={`${label}, ${representation} view${residues ? `. ${residues.length} residues` : ""}. Drag or use the arrow keys to turn, plus and minus to zoom, 0 to reset. Click a residue to select it.`}
          tabIndex={0}
          onKeyDown={onKeyDown}
          onPointerDown={() => setSpinning(false)}
          onPointerLeave={() => hoveredProp === undefined && setInnerHover(null)}
          className={cn(
            "block aspect-[4/3] w-full cursor-grab touch-none rounded-3xl outline-none transition-opacity duration-300 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring active:cursor-grabbing",
            status !== "ready" && "opacity-0"
          )}
        />
        {status === "loading" && (
          <div className="absolute inset-0 grid place-items-center">
            <LoadingIndicator aria-label={`Loading ${label}`} />
          </div>
        )}
        {status === "ready" &&
          highlight
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
        {status === "ready" && tip && (
          <span ref={tipRef} aria-hidden className={cn(pill, "invisible flex flex-col")}>
            <span className="type-label-md font-semibold">{tip.title}</span>
            {tip.meta && <span className="type-label-sm opacity-70">{tip.meta}</span>}
          </span>
        )}
        <span role="status" className="sr-only">
          {tip ? [tip.title, tip.meta].filter(Boolean).join(", ") : ""}
        </span>
        {message && <p className="absolute inset-0 grid place-items-center px-6 text-center type-body-md text-muted-foreground">{message}</p>}
        {controls && status === "ready" && (
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

function describe(r: ProteinResidue, n: number) {
  const name = r.aa ? (ONE_TO_NAME[r.aa] ?? r.aa) : "Residue"
  const meta = [r.ss ? SS_NAME[r.ss] : null, r.plddt != null ? `pLDDT ${Math.round(r.plddt)}` : null].filter(Boolean).join(", ")
  return { title: `${name} ${n}`, meta: meta || "C-alpha" }
}

export {
  ProteinStructure,
  parsePdb,
  toPdb,
  PLDDT_BANDS,
  type ProteinStructureProps,
  type ProteinResidue,
  type ProteinAtom,
  type ProteinColorBy,
  type ProteinRepresentation,
  type ProteinHighlight,
}
