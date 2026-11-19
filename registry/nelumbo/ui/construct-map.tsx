"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { ButtonGroup } from "@/registry/nelumbo/ui/button-group"
import { IconButton } from "@/registry/nelumbo/ui/icon-button"
import { complement, nucleotideTone, reverseComplement, translate, type NucleotideScheme } from "@/registry/nelumbo/ui/nucleotide"
import { featureColor, featureLength, type PlasmidFeature, type PlasmidSite } from "@/registry/nelumbo/ui/plasmid-map"

/**
 * Nelumbo Construct Map
 *
 * The plasmid map unrolled into a line: for inserts, guides, PCR products and
 * any construct read end to end. Takes the same features and sites as
 * PlasmidMap, so one parsed GenBank record (parseGenBank) renders either way.
 *
 * - Forward features ride above the backbone, reverse ones below, each a
 *   rounded bar with a soft arrow tip on the end it reads toward. Overlaps
 *   take lanes outward; joined features (a spliced CDS) are blocks on a thin line.
 * - A name sits inside its bar where it fits, beside it where the lane is free,
 *   or in a label row with a short leader.
 * - Zoom with the buttons, Ctrl or ⌘ and the wheel, or by double-clicking a
 *   feature. Zoomed in far enough, the backbone becomes both strands of the
 *   sequence and coding features show their amino acids under each codon.
 *   An overview of the whole construct shows the window, and drags it.
 * - Drag across the map to select a stretch of bases; click a feature to
 *   select it. `selectable` adds a keyboard stop: arrows go feature to
 *   feature, Enter zooms to it, + and − zoom, 0 fits, Escape clears.
 *
 *   <ConstructMap name="pGL3-Basic" length={4818} features={features} sites={sites} sequence={seq} />
 *
 * Positions are 1-based and inclusive. With `circular`, a feature may cross
 * the origin (start > end); it is drawn at both ends of the line.
 */

export type ConstructRange = { start: number; end: number }
export type ConstructFocus = { feature: PlasmidFeature; length: number } | null

const fillOf = (c: string) => (c === "neutral" ? "var(--muted-foreground)" : `var(--${c})`)
const inkOf = (c: string) => (c === "neutral" ? "var(--background)" : `var(--${c}-foreground)`)
const fmt = (n: number) => Math.round(n).toLocaleString("en-US")

function useWidth() {
  const ref = React.useRef<HTMLDivElement>(null)
  const [width, setWidth] = React.useState(0)
  React.useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setWidth(Math.round(e.contentRect.width)))
    ro.observe(el)
    setWidth(Math.round(el.getBoundingClientRect().width))
    return () => ro.disconnect()
  }, [])
  return [ref, width] as const
}

/** The linear pieces of a feature: its segments, and two pieces for one that crosses the origin. */
function piecesOf(f: PlasmidFeature, length: number): ConstructRange[] {
  const segs = f.segments?.length ? f.segments : [{ start: f.start, end: f.end }]
  return segs.flatMap((s) => (s.end >= s.start ? [s] : [{ start: s.start, end: length }, { start: 1, end: s.end }]))
}

/** Lanes outward from the backbone; a feature takes the first lane none of its pieces overlap. */
function laneOf(features: PlasmidFeature[], length: number, gap: number) {
  const taken: ConstructRange[][] = []
  const out = new Map<PlasmidFeature, number>()
  const order = [...features].sort((a, b) => a.start - b.start || featureLength(b, length) - featureLength(a, length))
  for (const f of order) {
    const ps = piecesOf(f, length)
    const span = ps.map((p) => ({ start: p.start, end: p.end }))
    let lane = taken.findIndex((lane) => !lane.some((t) => span.some((p) => p.start <= t.end + gap && p.end >= t.start - gap)))
    if (lane < 0) lane = taken.push([]) - 1
    taken[lane].push(...span)
    out.set(f, lane)
  }
  return out
}

/**
 * A stretch of a construct as its own: a PCR product, an insert. Features are
 * clipped to it and renumbered from 1; on a circular construct the stretch may
 * cross the origin (start > end).
 */
export function sliceConstruct(
  { length, features, sites = [], sequence = "" }: { length: number; features: PlasmidFeature[]; sites?: PlasmidSite[]; sequence?: string },
  start: number,
  end: number
) {
  const len = end >= start ? end - start + 1 : length - start + 1 + end
  // a base's place in the slice, or null outside it
  const at = (p: number) => {
    const o = (p - start + length) % length
    return o < len ? o + 1 : null
  }
  const out: PlasmidFeature[] = []
  for (const f of features) {
    const kept = piecesOf(f, length).flatMap((p) => {
      const parts: ConstructRange[] = []
      let run: ConstructRange | null = null
      for (let b = p.start; b <= p.end; b++) {
        const q = at(b)
        if (q != null && run && q === run.end + 1) run.end = q
        else if (q != null) {
          if (run) parts.push(run)
          run = { start: q, end: q }
        }
      }
      if (run) parts.push(run)
      return parts
    })
    if (!kept.length) continue
    kept.sort((a, b) => a.start - b.start)
    const whole = featureLength(f, length) === kept.reduce((a, k) => a + k.end - k.start + 1, 0)
    const g: PlasmidFeature = { ...f, start: kept[0].start, end: kept[kept.length - 1].end }
    if (kept.length > 1) g.segments = kept
    else delete g.segments
    if (!whole) g.description = `${f.description ?? f.name}, partly in this stretch`
    out.push(g)
  }
  const seq = sequence ? (end >= start ? sequence.slice(start - 1, end) : sequence.slice(start - 1) + sequence.slice(0, end)) : ""
  return {
    length: len,
    features: out,
    sites: sites.flatMap((s) => (at(s.position) != null ? [{ ...s, position: at(s.position)! }] : [])),
    sequence: seq,
  }
}

function niceStep(raw: number) {
  const p = 10 ** Math.floor(Math.log10(Math.max(raw, 1)))
  return [1, 2, 5, 10].map((m) => m * p).find((s) => s >= raw) ?? p * 10
}

// sequence letters: Nucleotide's tone system, "text" step
const GLYPH =
  "[--gl:0.5] [--gc:0.15] [--gs:0.06] dark:[--gl:0.82] dark:[--gc:0.13] dark:[--gs:0.05]" +
  " [&_[data-base]]:fill-[oklch(calc(var(--gl)+var(--rs,0)*var(--gs))_calc(var(--gc)*var(--rk,1))_var(--rh,0))]"

const BAND = 16
const LANE = 22
const LABEL_ROW = 16

type ConstructMapProps = Omit<React.ComponentProps<"div">, "children" | "onSelect"> & {
  name?: string
  length: number
  features: PlasmidFeature[]
  sites?: PlasmidSite[]
  /** The bases, for the sequence and amino acids when zoomed in, and the selection's GC. */
  sequence?: string
  /** The ends join (a plasmid shown unrolled): features may cross the origin. Default false. */
  circular?: boolean
  /** Nucleotide scheme for the bases at full zoom. Default "nelumbo". */
  scheme?: NucleotideScheme
  /** Base numbers along the bottom. Default true. */
  ruler?: boolean
  /** "auto" (default): names beside or above their features where there is room, a legend on narrow maps. */
  labels?: "auto" | "outside" | "legend"
  /** Zoom controls and wheel zoom. Default true. */
  zoomable?: boolean
  /** The visible stretch. Controlled or not (defaultView); the whole construct when not given. */
  view?: ConstructRange
  defaultView?: ConstructRange
  onViewChange?: (view: ConstructRange) => void
  /** A selected stretch of bases. Controlled or not (defaultSelection). */
  selection?: ConstructRange | null
  defaultSelection?: ConstructRange | null
  onSelectionChange?: (selection: ConstructRange | null) => void
  /** A keyboard stop: arrows from feature to feature. */
  selectable?: boolean
  onActiveChange?: (focus: ConstructFocus) => void
}

function ConstructMap({
  name,
  length,
  features,
  sites = [],
  sequence,
  circular = false,
  scheme = "nelumbo",
  ruler = true,
  labels = "auto",
  zoomable = true,
  view: viewProp,
  defaultView,
  onViewChange,
  selection: selectionProp,
  defaultSelection = null,
  onSelectionChange,
  selectable = false,
  onActiveChange,
  className,
  "aria-label": ariaLabel,
  ...props
}: ConstructMapProps) {
  const [ref, width] = useWidth()
  const seq = React.useMemo(() => (sequence ?? "").toUpperCase().replace(/[^A-Z]/g, ""), [sequence])
  const pad = 14
  const inner = Math.max(width - pad * 2, 1)

  // ---- view: [start, end) in continuous base coordinates, base p spanning [p, p + 1)
  const full = React.useMemo(() => ({ start: 1, end: length + 1 }), [length])
  const [ownView, setOwnView] = React.useState<ConstructRange>(defaultView ? { start: defaultView.start, end: defaultView.end + 1 } : full)
  const view = viewProp ? { start: viewProp.start, end: viewProp.end + 1 } : ownView
  const minSpan = Math.min(length, Math.max(12, inner / 16))
  const clampView = React.useCallback(
    (v: ConstructRange) => {
      let span = Math.max(minSpan, Math.min(length, v.end - v.start))
      span = Math.min(span, length)
      const start = Math.max(1, Math.min(length + 1 - span, v.start))
      return { start, end: start + span }
    },
    [length, minSpan]
  )
  const setView = React.useCallback(
    (v: ConstructRange) => {
      const c = clampView(v)
      if (!viewProp) setOwnView(c)
      onViewChange?.({ start: Math.round(c.start), end: Math.round(c.end) - 1 })
    },
    [clampView, viewProp, onViewChange]
  )
  const span = view.end - view.start
  const ppb = inner / span // pixels per base
  const x = React.useCallback((p: number) => pad + (p - view.start) * ppb, [view.start, ppb])
  const zoomed = span < length - 0.5
  const showBases = !!seq && ppb >= 7
  const showAmino = !!seq && ppb >= 2.6

  const zoomAt = (factor: number, at = view.start + span / 2) => {
    const s = Math.max(minSpan, Math.min(length, span * factor))
    const t = (at - view.start) / span
    setView({ start: at - t * s, end: at - t * s + s })
  }
  const zoomTo = (r: ConstructRange) => {
    const len = r.end - r.start + 1
    const m = Math.max(len * 0.15, 6)
    setView({ start: r.start - m, end: r.end + 1 + m })
  }

  // ---- layout
  const fwd = features.filter((f) => f.strand !== -1)
  const rev = features.filter((f) => f.strand === -1)
  const gapBp = Math.max(1, length * 0.002)
  const lanes = React.useMemo(() => {
    const a = laneOf(fwd, length, gapBp)
    const b = laneOf(rev, length, gapBp)
    return new Map([...a, ...b])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [features, length])
  const fwdLanes = Math.max(0, ...fwd.map((f) => lanes.get(f)! + 1))
  const revLanes = Math.max(0, ...rev.map((f) => lanes.get(f)! + 1))

  // where a piece is drawn: at least a dot's width, centered on the bases
  const drawn = (f: PlasmidFeature, p: ConstructRange) => {
    const h = f.kind === "primer" ? 8 : BAND
    const x0 = x(p.start)
    const x1 = x(p.end + 1)
    if (x1 - x0 >= h) return { x0, x1 }
    const c = (x0 + x1) / 2
    return { x0: c - h / 2, x1: c + h / 2 }
  }

  const legend = labels === "legend" || (labels === "auto" && width > 0 && width < 560)

  // names: inside where they fit, else beside in the lane, else in the label row with a leader
  type Placed = { f: PlasmidFeature; where: "inside" | "beside" | "row"; lx: number; anchor: "start" | "middle" | "end"; level: number; bx: number }
  const placed = React.useMemo(() => {
    const out = new Map<PlasmidFeature, Placed>()
    if (!width) return out
    const visible = (f: PlasmidFeature) =>
      piecesOf(f, length)
        .map((p) => drawn(f, p))
        .map((p) => ({ x0: Math.max(pad, p.x0), x1: Math.min(pad + inner, p.x1) }))
        .filter((p) => p.x1 > p.x0 + 0.5)
    for (const group of [fwd, rev]) {
      // what each lane has, in px, so a name beside its bar does not run into the next
      const occ = new Map<number, [number, number][]>()
      const add = (lane: number, a: number, b: number) => occ.set(lane, [...(occ.get(lane) ?? []), [a, b]])
      const free = (lane: number, a: number, b: number) => a >= pad - 2 && b <= pad + inner + 2 && !(occ.get(lane) ?? []).some(([p, q]) => a < q + 4 && b > p - 4)
      const vis = group.map((f) => ({ f, ps: visible(f) })).filter((v) => v.ps.length)
      vis.forEach(({ f, ps }) => ps.forEach((p) => add(lanes.get(f)!, p.x0, p.x1)))
      const rowItems: { f: PlasmidFeature; px: number; w: number }[] = []
      for (const { f, ps } of vis) {
        const big = ps.reduce((a, b) => (b.x1 - b.x0 > a.x1 - a.x0 ? b : a))
        const w = f.name.length * 6.3 + 8
        const lane = lanes.get(f)!
        if (f.kind !== "primer" && big.x1 - big.x0 >= w + 14) {
          out.set(f, { f, where: "inside", lx: (big.x0 + big.x1) / 2, anchor: "middle", level: 0, bx: (big.x0 + big.x1) / 2 })
        } else if (legend) {
          continue
        } else if (free(lane, big.x1 + 4, big.x1 + 4 + w)) {
          add(lane, big.x1 + 4, big.x1 + 4 + w)
          out.set(f, { f, where: "beside", lx: big.x1 + 5, anchor: "start", level: 0, bx: big.x1 })
        } else if (free(lane, big.x0 - 4 - w, big.x0 - 4)) {
          add(lane, big.x0 - 4 - w, big.x0 - 4)
          out.set(f, { f, where: "beside", lx: big.x0 - 5, anchor: "end", level: 0, bx: big.x0 })
        } else rowItems.push({ f, px: (big.x0 + big.x1) / 2, w })
      }
      // the label row: levels, so none collide
      const levels: number[] = []
      for (const it of rowItems.sort((a, b) => a.px - b.px)) {
        let px = Math.max(pad + it.w / 2, Math.min(pad + inner - it.w / 2, it.px))
        let level = levels.findIndex((end) => px - it.w / 2 > end + 6)
        if (level < 0) level = levels.length
        if (level > 2) {
          level = 2
          px = Math.max(px, levels[2] + it.w / 2 + 6)
        }
        levels[level] = px + it.w / 2
        out.set(it.f, { f: it.f, where: "row", lx: px, anchor: "middle", level, bx: it.px })
      }
    }
    return out
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, features, lanes, view.start, view.end, length, legend])
  const rowLevels = (group: PlasmidFeature[]) =>
    Math.max(0, ...group.map((f) => placed.get(f)).filter((p) => p?.where === "row").map((p) => p!.level + 1))
  const fwdRows = rowLevels(fwd)
  const revRows = rowLevels(rev)

  // sites: names on up to two rows, pushed apart sideways, leaders fanning down to the cut
  const siteMarks = React.useMemo(() => {
    const ends = [-Infinity, -Infinity]
    const marks = sites
      .filter((s) => s.position >= view.start - 1 && s.position <= view.end)
      .sort((a, b) => a.position - b.position)
      .map((s) => {
        const px = x(s.position)
        const w = s.name.length * 6 + 8
        const at = (lv: number) => Math.max(px, ends[lv] + 4 + w / 2)
        const level = at(0) - px <= at(1) - px + 0.5 ? 0 : 1
        const lx = at(level)
        ends[level] = lx + w / 2
        return { ...s, px, lx, w, level, text: s.name }
      })
    // what runs past the right edge comes back, row by row
    for (const lv of [0, 1]) {
      let limit = pad + inner + 6
      for (const m of [...marks].reverse()) {
        if (m.level !== lv) continue
        if (m.lx + m.w / 2 > limit) m.lx = limit - m.w / 2
        limit = m.lx - m.w / 2 - 4
      }
    }
    return marks
  }, [sites, view.start, view.end, x, pad, inner])
  const siteLevels = Math.max(0, ...siteMarks.map((s) => s.level + 1))
  const fanned = siteMarks.some((s) => Math.abs(s.lx - s.px) > 1)

  const top = 4
  const sitesH = siteLevels ? siteLevels * 14 + (fanned ? 14 : 6) : 0
  const fwdRowY = top + sitesH
  const fwdTop = fwdRowY + fwdRows * LABEL_ROW + (fwdRows ? 4 : 0)
  const backboneY = fwdTop + fwdLanes * LANE + (showBases ? 20 : 12)
  const laneY = (f: PlasmidFeature) => {
    const lane = lanes.get(f)!
    return f.strand === -1 ? backboneY + (showBases ? 20 : 12) + lane * LANE + LANE / 2 : backboneY - (showBases ? 20 : 12) - lane * LANE - LANE / 2
  }
  const revBottom = backboneY + (showBases ? 20 : 12) + revLanes * LANE
  const revRowY = revBottom + 4
  const rulerY = revRowY + revRows * LABEL_ROW + 4
  const height = rulerY + (ruler ? 22 : 4)

  // ---- focus, selection
  const [own, setOwn] = React.useState<ConstructRange | null>(defaultSelection)
  const selection = selectionProp !== undefined ? selectionProp : own
  const setSelection = (r: ConstructRange | null) => {
    if (selectionProp === undefined) setOwn(r)
    onSelectionChange?.(r)
  }
  const order = React.useMemo(() => [...features].sort((a, b) => a.start - b.start), [features])
  const [hover, setHover] = React.useState<PlasmidFeature | null>(null)
  const [picked, setPicked] = React.useState<PlasmidFeature | null>(null)
  const [cursor, setCursor] = React.useState(0)
  const [focused, setFocused] = React.useState(false)
  const [tipAt, setTipAt] = React.useState<{ x: number; y: number } | null>(null)
  const active = hover ?? (focused && selectable ? (order[cursor] ?? null) : picked)
  const cb = React.useRef(onActiveChange)
  cb.current = onActiveChange
  React.useEffect(() => cb.current?.(active ? { feature: active, length: featureLength(active, length) } : null), [active, length])

  const describe = (f: PlasmidFeature | null) => {
    if (!f) return `${name ?? "Construct"}, ${fmt(length)} bp`
    const dir = f.strand === 1 ? ", forward" : f.strand === -1 ? ", reverse" : ""
    return `${f.name}, ${fmt(f.start)} to ${fmt(f.end)}, ${fmt(featureLength(f, length))} bp${dir}`
  }

  // ---- pointer
  const svgRef = React.useRef<SVGSVGElement>(null)
  const drag = React.useRef<{ from: number; moved: boolean } | null>(null)
  const baseAt = (clientX: number) => {
    const r = svgRef.current!.getBoundingClientRect()
    const p = Math.floor(view.start + (clientX - r.left - pad) / ppb)
    return Math.max(1, Math.min(length, p))
  }
  // by point, not event target: the svg captures the pointer while a drag runs
  const featureAt = (e: { clientX: number; clientY: number }) => {
    const el = document.elementFromPoint(e.clientX, e.clientY)?.closest("[data-feature]")
    return el && svgRef.current?.contains(el) ? features[Number(el.getAttribute("data-feature"))] : null
  }

  // wheel: Ctrl or ⌘ zooms about the pointer; sideways scroll pans when zoomed
  const wheelRef = React.useRef<(e: WheelEvent) => void>(() => {})
  wheelRef.current = (e: WheelEvent) => {
    if (!zoomable || !svgRef.current) return
    const r = svgRef.current.getBoundingClientRect()
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault()
      const at = view.start + (e.clientX - r.left - pad) / ppb
      zoomAt(Math.exp(e.deltaY * 0.004), at)
    } else if (zoomed && Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
      e.preventDefault()
      setView({ start: view.start + e.deltaX / ppb, end: view.end + e.deltaX / ppb })
    }
  }
  React.useEffect(() => {
    const el = svgRef.current
    if (!el) return
    const h = (e: WheelEvent) => wheelRef.current(e)
    el.addEventListener("wheel", h, { passive: false })
    return () => el.removeEventListener("wheel", h)
  }, [width])

  const onKeyDown = (e: React.KeyboardEvent) => {
    const n = order.length
    if (e.key === "ArrowRight" || e.key === "ArrowDown") setCursor((c) => (c + 1) % n)
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") setCursor((c) => (c - 1 + n) % n)
    else if (e.key === "Home") setCursor(0)
    else if (e.key === "End") setCursor(n - 1)
    else if (e.key === "Enter" && order[cursor]) {
      const f = order[cursor]
      setPicked(f)
      zoomTo(f.end >= f.start ? f : { start: f.start, end: length })
    } else if (zoomable && (e.key === "+" || e.key === "=")) zoomAt(0.5)
    else if (zoomable && (e.key === "-" || e.key === "_")) zoomAt(2)
    else if (zoomable && e.key === "0") setView(full)
    else if (e.key === "Escape") {
      setPicked(null)
      setSelection(null)
    } else return
    e.preventDefault()
  }

  // keep the keyboard's feature in view
  React.useEffect(() => {
    if (!focused || !selectable) return
    const f = order[cursor]
    if (!f) return
    if (f.start < view.start || f.start > view.end - 1) setView({ start: f.start - span * 0.2, end: f.start + span * 0.8 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cursor, focused])

  // ---- shapes
  const bar = (f: PlasmidFeature, p: ConstructRange, isLast: boolean, isFirst: boolean, y: number) => {
    const thin = f.kind === "primer"
    const h = thin ? 8 : BAND
    const { x0, x1 } = drawn(f, p)
    const w = x1 - x0
    const y0 = y - h / 2
    const r = Math.min(h / 2, w / 2)
    const tipFwd = f.strand === 1 && isLast
    const tipRev = f.strand === -1 && isFirst
    const tip = (tipFwd || tipRev) && w > 4 ? Math.min(thin ? 8 : 13, w * 0.5) : 0
    if (!tip) return `M${x0 + r},${y0}H${x0 + w - r}A${r},${r} 0 0 1 ${x0 + w - r},${y0 + h}H${x0 + r}A${r},${r} 0 0 1 ${x0 + r},${y0}Z`
    // A straight-sided point with its very end softened: it sharpens the arrow without a hard spike.
    const d = 1.6
    const len = Math.hypot(tip, h / 2)
    const ux = (tip / len) * d
    const uy = (h / 2 / len) * d
    if (tipFwd) {
      const xt = x0 + w - tip
      const xe = x0 + w
      return `M${x0 + r},${y0}H${xt}L${xe - ux},${y - uy}Q${xe},${y} ${xe - ux},${y + uy}L${xt},${y0 + h}H${x0 + r}A${r},${r} 0 0 1 ${x0 + r},${y0}Z`
    }
    const xt = x0 + tip
    return `M${xt},${y0}H${x0 + w - r}A${r},${r} 0 0 1 ${x0 + w - r},${y0 + h}H${xt}L${x0 + ux},${y + uy}Q${x0},${y} ${x0 + ux},${y - uy}Z`
  }

  // amino acids under each codon, for contiguous coding features
  const amino = (f: PlasmidFeature) => {
    if (!showAmino || (f.kind !== "cds" && f.kind !== "marker") || !f.strand || f.segments?.length || f.end < f.start) return null
    const off = (f.codonStart ?? 1) - 1
    const nt = seq.slice(f.start - 1, f.end)
    const prot = f.strand === 1 ? translate(nt.slice(off)) : translate(reverseComplement(nt).slice(off))
    const out: { aa: string; c: number }[] = []
    for (let i = 0; i < prot.length; i++) {
      // the codon's first base, along the top strand
      const c = f.strand === 1 ? f.start + off + i * 3 : f.end - off - i * 3 - 2
      if (c + 3 < view.start || c > view.end) continue
      out.push({ aa: prot[i], c: c + 1.5 })
    }
    return out
  }

  const label = ariaLabel ?? `Construct map${name ? ` of ${name}` : ""}, ${fmt(length)} bp, ${features.length} features${sites.length ? `, ${sites.length} sites` : ""}`
  const ticks = React.useMemo(() => {
    if (!ruler || !width) return []
    const step = niceStep(span / Math.max(2, Math.floor(inner / 90)))
    const out: number[] = []
    for (let t = Math.ceil(view.start / step) * step; t <= view.end - 1; t += step) if (t >= 1) out.push(t)
    if (!zoomed) {
      if (!out.includes(1) && (out[0] ?? Infinity) * ppb > 40) out.unshift(1)
      if (out[out.length - 1] !== length && (length - (out[out.length - 1] ?? 0)) * ppb > 46) out.push(length)
    }
    return out
  }, [ruler, width, span, inner, view.start, view.end, zoomed, length, ppb])

  const selGC = React.useMemo(() => {
    if (!selection || !seq) return null
    const s = seq.slice(selection.start - 1, selection.end)
    return s.length ? (s.replace(/[^GC]/g, "").length / s.length) * 100 : null
  }, [selection, seq])

  const clipId = React.useId().replace(/:/g, "")

  return (
    <div data-slot="construct-map" className={cn("grid w-full gap-3", className)} {...props}>
      {zoomable && (
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 tabular-nums" aria-live="polite">
            {selection ? (
              <>
                <span className="type-title-sm text-foreground">{fmt(selection.end - selection.start + 1)} bp</span>
                <span className="type-body-sm text-muted-foreground">
                  {fmt(selection.start)}–{fmt(selection.end)}
                  {selGC != null && `, ${selGC.toFixed(0)}% GC`}
                </span>
              </>
            ) : (
              <>
                {name && <span className="type-title-sm text-foreground">{name}</span>}
                <span className="type-body-sm text-muted-foreground">
                  {zoomed ? `${fmt(view.start)}–${fmt(view.end - 1)} of ${fmt(length)} bp` : `${fmt(length)} bp${circular ? ", circular" : ""}`}
                </span>
              </>
            )}
          </div>
          <ButtonGroup variant="connected" aria-label="Zoom">
            <IconButton variant="secondary" size="sm" width="wide" icon="zoom_out" label="Zoom out" disabled={!zoomed} onClick={() => zoomAt(2)} />
            <IconButton variant="secondary" size="sm" width="wide" icon="zoom_in" label="Zoom in" disabled={span <= minSpan + 0.5} onClick={() => zoomAt(0.5)} />
            <IconButton variant="secondary" size="sm" width="wide" icon="fit_width" label="Show the whole construct" disabled={!zoomed} onClick={() => setView(full)} />
          </ButtonGroup>
        </div>
      )}

      <div ref={ref} className="relative w-full">
        <div
          className={cn(
            "relative select-none outline-none",
            selectable && "rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
          )}
          style={{ height: width ? height : 160 }}
          {...(selectable
            ? {
                role: "slider",
                tabIndex: 0,
                "aria-label": label,
                "aria-valuemin": 1,
                "aria-valuemax": order.length,
                "aria-valuenow": cursor + 1,
                "aria-valuetext": describe(order[cursor] ?? null),
                onKeyDown,
                onFocus: () => setFocused(true),
                onBlur: () => setFocused(false),
              }
            : { role: "img", "aria-label": label })}
        >
          {width > 0 && (
            <svg
              ref={svgRef}
              width={width}
              height={height}
              aria-hidden
              className={cn("block touch-pan-y", GLYPH, drag.current ? "cursor-col-resize" : "cursor-crosshair")}
              onPointerDown={(e) => {
                if (e.button !== 0) return
                ;(e.currentTarget as Element).setPointerCapture?.(e.pointerId)
                drag.current = { from: baseAt(e.clientX), moved: false }
              }}
              onPointerMove={(e) => {
                const f = featureAt(e)
                setHover(drag.current?.moved ? null : f)
                const r = ref.current!.getBoundingClientRect()
                setTipAt(f ? { x: e.clientX - r.left, y: laneY(f) - (f.kind === "primer" ? 4 : BAND / 2) } : null)
                const d = drag.current
                if (d) {
                  const p = baseAt(e.clientX)
                  if (p !== d.from || d.moved) {
                    d.moved = true
                    setSelection({ start: Math.min(d.from, p), end: Math.max(d.from, p) })
                  }
                }
              }}
              onPointerUp={(e) => {
                const d = drag.current
                drag.current = null
                if (d && !d.moved) {
                  const f = featureAt(e)
                  setPicked(f)
                  if (f) {
                    setCursor(order.indexOf(f))
                    setSelection(f.end >= f.start ? { start: f.start, end: f.end } : null)
                  } else setSelection(null)
                }
              }}
              onPointerLeave={() => {
                setHover(null)
                setTipAt(null)
              }}
              onDoubleClick={(e) => {
                const f = featureAt(e)
                if (f && zoomable) zoomTo(f.end >= f.start ? f : { start: f.start, end: length })
              }}
            >
              <defs>
                <clipPath id={clipId}>
                  <rect x={pad - 1} y={0} width={inner + 2} height={height} />
                </clipPath>
              </defs>

              <g clipPath={`url(#${clipId})`}>
                {/* selection band */}
                {selection && (
                  <rect
                    x={x(selection.start)}
                    y={fwdTop - 6}
                    width={Math.max(2, x(selection.end + 1) - x(selection.start))}
                    height={revBottom - fwdTop + 12}
                    rx={6}
                    className="fill-foreground/[0.07]"
                  />
                )}

                {/* sites: a faint line down to the backbone, behind the features */}
                {siteMarks.map((s) => (
                  <path
                    key={`l${s.name}${s.position}`}
                    d={`M${s.lx},${top + s.level * 14 + 7}V${top + siteLevels * 14 + 1}L${s.px},${top + sitesH - 2}V${backboneY + 5}`}
                    fill="none"
                    className="stroke-outline-variant"
                    strokeWidth={1}
                    strokeLinejoin="round"
                  />
                ))}

                {/* backbone, or both strands when zoomed in */}
                {showBases ? (
                  <g className="font-mono text-[0.6875rem] font-semibold">
                    {Array.from({ length: Math.ceil(span) + 1 }, (_, k) => {
                      const p = Math.floor(view.start) + k
                      if (p < 1 || p > length) return null
                      const b = seq[p - 1] ?? "N"
                      const c = complement(b)
                      const cx = x(p + 0.5)
                      const t1 = nucleotideTone(b, scheme).tone
                      const t2 = nucleotideTone(c, scheme).tone
                      const v = (t: typeof t1) => ({ "--rh": t?.hue ?? 0, "--rk": t ? (t.chroma ?? 1) : 0, "--rs": t?.shade ?? 0 }) as React.CSSProperties
                      return (
                        <g key={p}>
                          <text data-base x={cx} y={backboneY - 4} textAnchor="middle" style={v(t1)}>
                            {b}
                          </text>
                          <text data-base x={cx} y={backboneY + 12} textAnchor="middle" style={v(t2)} opacity={0.75}>
                            {c}
                          </text>
                        </g>
                      )
                    })}
                  </g>
                ) : (
                  <rect x={x(1)} y={backboneY - 3} width={x(length + 1) - x(1)} height={6} rx={3} className="fill-surface-container-highest" />
                )}

                {/* site ticks across the backbone */}
                {!showBases &&
                  siteMarks.map((s) => (
                    <line key={`t${s.name}${s.position}`} x1={s.px} x2={s.px} y1={backboneY - 6} y2={backboneY + 6} className="stroke-foreground/70" strokeWidth={2} strokeLinecap="round" />
                  ))}

                {/* features */}
                {features.map((f, i) => {
                  const y = laneY(f)
                  const c = featureColor(f)
                  const ps = piecesOf(f, length)
                  const dim = active != null && active !== f
                  const aa = amino(f)
                  return (
                    <g key={`${f.name}-${f.start}-${i}`} data-feature={i} className="cursor-pointer" style={{ opacity: dim ? 0.35 : 1, transition: "opacity 200ms" }}>
                      {f.segments && f.segments.length > 1 && (
                        <line x1={x(ps[0].start)} x2={x(ps[ps.length - 1].end + 1)} y1={y} y2={y} stroke={fillOf(c)} strokeWidth={1.5} />
                      )}
                      {ps.map((p, k) => (
                        <path
                          key={k}
                          d={bar(
                            f,
                            p,
                            // the reading end: the last piece forward, the first piece reverse (a wrapped feature's pieces are in origin order)
                            f.end < f.start ? p.start === 1 : k === ps.length - 1,
                            f.end < f.start ? p.end === length : k === 0,
                            y
                          )}
                          fill={fillOf(c)}
                        />
                      ))}
                      {aa?.map((a) => (
                        <text key={a.c} x={x(a.c)} y={y + 3.5} textAnchor="middle" fill={inkOf(c)} className="font-mono text-[0.625rem] font-semibold">
                          {a.aa}
                        </text>
                      ))}
                      {/* a wider invisible target for thin features */}
                      {ps.map((p, k) => (
                        <rect key={`h${k}`} x={x(p.start) - 2} y={y - 10} width={Math.max(x(p.end + 1) - x(p.start), 0) + 4} height={20} fill="transparent" />
                      ))}
                    </g>
                  )
                })}

                {/* names */}
                {features.map((f, i) => {
                  const pl = placed.get(f)
                  if (!pl) return null
                  const y = laneY(f)
                  const c = featureColor(f)
                  const dim = active != null && active !== f
                  const inside = pl.where === "inside" && !amino(f)
                  if (pl.where === "inside" && !inside) return null
                  const rowY = f.strand === -1 ? revRowY + pl.level * LABEL_ROW + 11 : fwdRowY + (fwdRows - 1 - pl.level) * LABEL_ROW + 11
                  return (
                    <g key={`n${i}`} data-feature={i} className="cursor-pointer" style={{ opacity: dim ? 0.4 : 1, transition: "opacity 200ms" }}>
                      {pl.where === "row" && (
                        <path
                          d={
                            f.strand === -1
                              ? `M${pl.bx},${y + (f.kind === "primer" ? 4 : BAND / 2) + 1}V${rowY - 12}H${pl.lx}V${rowY - 10}`
                              : `M${pl.bx},${y - (f.kind === "primer" ? 4 : BAND / 2) - 1}V${rowY + 5}H${pl.lx}V${rowY + 3}`
                          }
                          fill="none"
                          className="stroke-outline-variant"
                          strokeWidth={1}
                          strokeLinejoin="round"
                        />
                      )}
                      <text
                        x={pl.lx}
                        y={pl.where === "row" ? rowY : y + 4}
                        textAnchor={pl.anchor}
                        fill={inside ? inkOf(c) : undefined}
                        className={cn("text-[0.6875rem]", inside ? "font-semibold" : "fill-foreground font-medium")}
                      >
                        {f.name}
                      </text>
                    </g>
                  )
                })}
              </g>

              {/* site names */}
              {siteMarks.map((s) => (
                <text
                  key={`s${s.name}${s.position}`}
                  x={s.lx}
                  y={top + s.level * 14 + 4}
                  textAnchor="middle"
                  className="fill-muted-foreground text-[0.625rem]"
                >
                  <title>{`${s.name}, cuts at ${fmt(s.position)}`}</title>
                  {s.text}
                </text>
              ))}

              {/* ruler */}
              {ticks.map((t) => (
                <g key={t}>
                  <line x1={x(t + 0.5)} x2={x(t + 0.5)} y1={rulerY} y2={rulerY + 4} className="stroke-outline-variant" strokeWidth={1} />
                  <text x={x(t + 0.5)} y={rulerY + 15} textAnchor={t === 1 && !zoomed ? "start" : t === length && !zoomed ? "end" : "middle"} className="fill-muted-foreground text-[0.6875rem] tabular-nums">
                    {fmt(t)}
                  </text>
                </g>
              ))}
              {selection &&
                [selection.start, selection.end].map((p, k) => {
                  if (p < view.start || p > view.end - 1 || (k === 1 && selection.end === selection.start)) return null
                  const t = fmt(p)
                  const w = t.length * 6.4 + 12
                  const cx = Math.max(pad + w / 2, Math.min(pad + inner - w / 2, x(p + 0.5)))
                  return (
                    <g key={k}>
                      <rect x={cx - w / 2} y={rulerY + 3} width={w} height={16} rx={8} className="fill-foreground" />
                      <text x={cx} y={rulerY + 15} textAnchor="middle" className="fill-background text-[0.6875rem] font-semibold tabular-nums">
                        {t}
                      </text>
                    </g>
                  )
                })}
            </svg>
          )}
        </div>

        {active && hover && tipAt && (
          <div
            aria-hidden
            className="pointer-events-none absolute z-10 grid max-w-64 -translate-x-1/2 -translate-y-full gap-0.5 rounded-md bg-inverse-surface px-3 py-2 text-inverse-foreground shadow-e2"
            style={{ left: Math.max(90, Math.min(width - 90, tipAt.x)), top: tipAt.y - 8 }}
          >
            <span className="type-label-lg font-semibold">{active.name}</span>
            <span className="type-label-sm tabular-nums opacity-80">
              {fmt(active.start)}–{fmt(active.end)}, {fmt(featureLength(active, length))} bp{active.strand === 1 ? ", forward" : active.strand === -1 ? ", reverse" : ""}
            </span>
            {active.description && active.description !== active.name && <span className="type-label-sm opacity-80">{active.description}</span>}
          </div>
        )}
      </div>

      {legend && (
        <ul data-slot="construct-legend" className="flex w-full flex-wrap gap-x-5 gap-y-2">
          {features.map((f, i) => (
            <li key={`${f.name}-${f.start}-${i}`} className="flex items-center gap-2 type-label-md">
              <span aria-hidden className="h-2.5 w-4 shrink-0 rounded-full" style={{ background: fillOf(featureColor(f)) }} />
              <span className="text-foreground">{f.name}</span>
              <span className="text-muted-foreground tabular-nums">
                {fmt(f.start)}
                {f.end !== f.start && `–${fmt(f.end)}`}
              </span>
            </li>
          ))}
        </ul>
      )}

      {zoomable && zoomed && width > 0 && (
        <Overview length={length} features={features} view={view} onPan={(start) => setView({ start, end: start + span })} pad={pad} inner={inner} />
      )}
    </div>
  )
}

/** The whole construct, small, with the visible window to drag. */
function Overview({
  length,
  features,
  view,
  onPan,
  pad,
  inner,
}: {
  length: number
  features: PlasmidFeature[]
  view: ConstructRange
  onPan: (start: number) => void
  pad: number
  inner: number
}) {
  const ox = (p: number) => pad + ((p - 1) / length) * inner
  const grab = React.useRef<number | null>(null)
  const span = view.end - view.start
  const toBase = (e: React.PointerEvent) => {
    const r = (e.currentTarget as Element).getBoundingClientRect()
    return 1 + ((e.clientX - r.left - pad) / inner) * length
  }
  const onKey = (e: React.KeyboardEvent) => {
    const step = e.shiftKey ? span : span / 4
    if (e.key === "ArrowRight") onPan(view.start + step)
    else if (e.key === "ArrowLeft") onPan(view.start - step)
    else if (e.key === "Home") onPan(1)
    else if (e.key === "End") onPan(length)
    else return
    e.preventDefault()
  }
  return (
    <div
      role="slider"
      tabIndex={0}
      aria-label="Visible stretch"
      aria-valuemin={1}
      aria-valuemax={length}
      aria-valuenow={Math.round(view.start)}
      aria-valuetext={`${fmt(view.start)} to ${fmt(view.end - 1)} of ${fmt(length)} bp`}
      onKeyDown={onKey}
      className="relative h-7 cursor-grab touch-none rounded-[0.5625rem] outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:cursor-grabbing"
      onPointerDown={(e) => {
        ;(e.currentTarget as Element).setPointerCapture(e.pointerId)
        const b = toBase(e)
        if (b >= view.start && b <= view.end) grab.current = b - view.start
        else {
          grab.current = span / 2
          onPan(b - span / 2)
        }
      }}
      onPointerMove={(e) => grab.current != null && onPan(toBase(e) - grab.current)}
      onPointerUp={() => (grab.current = null)}
    >
      <svg width="100%" height={28} aria-hidden className="block overflow-visible">
        {/* a slider's track: the whole construct, its features, and the window as a pill with a handle at each end */}
        <rect x={pad} y={4} width={inner} height={20} rx={6} className="fill-surface-container-high" />
        {features.map((f, i) =>
          piecesOf(f, length).map((p, k) => (
            <rect key={`${i}-${k}`} x={ox(p.start)} y={f.strand === -1 ? 15 : 9} width={Math.max(2, ox(p.end + 1) - ox(p.start))} height={4} rx={2} fill={fillOf(featureColor(f))} />
          ))
        )}
        {(() => {
          const x0 = ox(view.start)
          const w = Math.max(14, ox(view.end) - x0)
          return (
            <g>
              <rect x={x0} y={1} width={w} height={26} rx={9} className="fill-foreground/[0.1]" />
              {w >= 24 ? (
                <>
                  <rect x={x0 + 3} y={5} width={4} height={18} rx={2} className="fill-foreground" />
                  <rect x={x0 + w - 7} y={5} width={4} height={18} rx={2} className="fill-foreground" />
                </>
              ) : (
                // a narrow window keeps one handle in its middle
                <rect x={x0 + w / 2 - 2} y={5} width={4} height={18} rx={2} className="fill-foreground" />
              )}
            </g>
          )
        })()}
      </svg>
    </div>
  )
}

export { ConstructMap, type ConstructMapProps }
