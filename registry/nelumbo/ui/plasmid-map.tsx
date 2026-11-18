"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Nelumbo Plasmid Map
 *
 * A circular plasmid: the backbone as a thin ring, features as rounded arcs,
 * restriction sites as ticks, and the name and size in the middle.
 *
 * - Directional features (coding sequences, promoters) end in a soft arrow
 *   tip on the side they read toward, and a round cap on the other.
 *   Overlapping features take lanes outward from the backbone.
 * - A feature's name runs along its arc where it fits; otherwise it sits
 *   outside with a leader line, and the outside labels on each side are
 *   spread so none overlap. Narrow maps trade outside labels for a legend.
 * - The center is a readout: the plasmid's name and size, or the feature
 *   under the pointer or keyboard cursor, with its range and length.
 * - `selectable` makes the map one keyboard stop, like a chart: arrows move
 *   from feature to feature around the circle, Escape clears.
 *
 *   <PlasmidMap name="pGL3-Basic" length={4818} features={[...]} sites={[{ position: 53, name: "HindIII" }]} />
 *
 * Positions are 1-based and inclusive; a feature may cross the origin
 * (start > end).
 */

export type PlasmidColor = "blue" | "cyan" | "green" | "amber" | "orange" | "red" | "pink" | "purple" | "brand" | "neutral"

export type PlasmidFeatureKind = "cds" | "promoter" | "origin" | "terminator" | "primer" | "marker" | "misc"

export type PlasmidFeature = {
  start: number
  end: number
  name: string
  /** 1 reads clockwise, -1 counterclockwise, 0 or none has no direction. */
  strand?: 1 | -1 | 0
  kind?: PlasmidFeatureKind
  /** Default by kind: CDS blue, promoter green, origin amber, terminator pink, primer cyan, marker purple. */
  color?: PlasmidColor
  description?: string
  /** The pieces of a joined feature (a spliced CDS), in order. The feature spans them all. */
  segments?: { start: number; end: number }[]
  /** For a CDS: which base of the first codon the feature starts on, 1 to 3. */
  codonStart?: 1 | 2 | 3
}

export type PlasmidSite = {
  /** The first base of the recognition site. */
  position: number
  name: string
}

export type PlasmidFocus = { feature: PlasmidFeature; length: number }

const KIND_COLOR: Record<PlasmidFeatureKind, PlasmidColor> = {
  cds: "blue",
  promoter: "green",
  origin: "amber",
  terminator: "pink",
  primer: "cyan",
  marker: "purple",
  misc: "neutral",
}

const fillOf = (c: PlasmidColor) => (c === "neutral" ? "var(--muted-foreground)" : `var(--${c})`)
const inkOf = (c: PlasmidColor) => (c === "neutral" ? "var(--background)" : `var(--${c}-foreground)`)
export const featureColor = (f: PlasmidFeature) => f.color ?? KIND_COLOR[f.kind ?? "misc"]

/** A feature's length in bp, across the origin if it wraps. */
export function featureLength(f: { start: number; end: number }, length: number) {
  return f.end >= f.start ? f.end - f.start + 1 : length - f.start + 1 + f.end
}

const TAU = Math.PI * 2

/** The sites that occur once in a circular sequence, for the enzymes given ({ EcoRI: "GAATTC" }). */
export function uniqueSites(sequence: string, enzymes: Record<string, string>): PlasmidSite[] {
  const s = sequence.toUpperCase().replace(/[^ACGT]/g, "")
  const out: PlasmidSite[] = []
  for (const [name, site] of Object.entries(enzymes)) {
    const circ = s + s.slice(0, site.length - 1)
    const hits: number[] = []
    for (let i = circ.indexOf(site); i >= 0 && i < s.length; i = circ.indexOf(site, i + 1)) hits.push(i + 1)
    if (hits.length === 1) out.push({ position: hits[0], name })
  }
  return out.sort((a, b) => a.position - b.position)
}

export type GenBankRecord = {
  /** The LOCUS name. */
  name: string
  length: number
  topology: "circular" | "linear"
  /** "DNA", "mRNA", ... */
  molecule: string
  definition: string
  accession: string
  features: PlasmidFeature[]
  /** Upper case, no spaces or numbers. Empty when the record has no ORIGIN. */
  sequence: string
}

const KEY_KIND: Record<string, PlasmidFeatureKind> = {
  CDS: "cds",
  promoter: "promoter",
  rep_origin: "origin",
  oriT: "origin",
  terminator: "terminator",
  polyA_signal: "terminator",
  primer_bind: "primer",
  primer: "primer",
}

const MARKER = /resistan|lactamase|phosphotransferase|acetyltransferase|\b(amp|kan|neo|cm|tet|hyg|bla|zeo|puro|bsd)r?\b/i

/** A feature's name from its qualifiers: label, gene, product, then a trimmed note. */
function featureName(q: Record<string, string>, key: string) {
  if (q.label) return q.label
  if (key === "exon" && q.number) return `Exon ${q.number}`
  if (key === "gene" || key === "CDS" || key === "mRNA") {
    const n = q.gene ?? q.product ?? q.locus_tag
    if (n) return n
  }
  const direct = q.standard_name ?? q.allele ?? (key === "misc_feature" ? undefined : q.product)
  if (direct) return direct
  const region = q.note?.match(/Region:\s*(.+?)(?:\.(?:\s|$)|;|$)/)?.[1]
  if (region) return region
  if (q.note) {
    const n = q.note.split(/[;,]/)[0].replace(/\s+(sequencing\s+)?(primer\s+)?binding site$/i, "").trim()
    return n.split(/\s+/).length > 4 ? n.split(/\s+/).slice(0, 4).join(" ") : n
  }
  return q.product ?? q.regulatory_class?.replace(/_/g, " ") ?? q.gene ?? key.replace(/_/g, " ")
}

/** A GenBank location: complement(), join(), order(), <, >, a^b, single bases. Remote parts are skipped. */
export function parseLocation(loc: string, length = Infinity) {
  const strand: 1 | -1 = /^complement\(/.test(loc.trim()) || /^(join|order)\(complement\(/.test(loc.trim()) ? -1 : 1
  const segments: { start: number; end: number }[] = []
  for (const part of loc.replace(/\s/g, "").split(/[,()]/)) {
    if (!part || /:/.test(part) || /^(complement|join|order)$/.test(part)) continue
    const m = part.match(/^[<>]?(\d+)(?:(?:\.\.|\^)[<>]?(\d+))?$/)
    if (!m) continue
    const a = Number(m[1])
    const b = m[2] ? Number(m[2]) : a
    segments.push({ start: Math.min(a, b, length), end: Math.min(Math.max(a, b), length) })
  }
  if (strand === -1 && /^complement\((join|order)\(/.test(loc.trim())) segments.sort((p, q) => p.start - q.start)
  return { strand, segments }
}

/**
 * The first record of a GenBank file, its features as PlasmidFeatures, ready
 * for PlasmidMap or ConstructMap. Kinds come from the feature keys (CDS,
 * promoter, rep_origin, terminator, polyA_signal, primer_bind; resistance genes
 * become markers); `source`, and a `gene` that only repeats its CDS, are left
 * out. Names come from /label, /gene, /product, then /note.
 */
export function parseGenBank(
  text: string,
  { skip = ["source"], keepGenes = false }: { skip?: string[]; keepGenes?: boolean } = {}
): GenBankRecord {
  const lines = text.replace(/\r/g, "").split("\n")
  const locus = lines.find((l) => l.startsWith("LOCUS")) ?? ""
  const lt = locus.split(/\s+/)
  const lengthAt = lt.findIndex((t) => /^(bp|aa)$/.test(t))
  let length = lengthAt > 0 ? Number(lt[lengthAt - 1]) : 0
  const topology = /\bcircular\b/i.test(locus) ? "circular" : "linear"
  const molecule = lt.find((t) => /^(ss-|ds-|ms-)?(DNA|RNA|mRNA|rRNA|tRNA|cRNA)$/i.test(t)) ?? "DNA"

  const field = (key: string) => {
    const i = lines.findIndex((l) => l.startsWith(key))
    if (i < 0) return ""
    const out = [lines[i].slice(12)]
    for (let j = i + 1; j < lines.length && lines[j].startsWith(" ".repeat(12)); j++) out.push(lines[j].trim())
    return out.join(" ").trim()
  }

  const o = lines.findIndex((l) => l.startsWith("ORIGIN"))
  const sequence =
    o < 0
      ? ""
      : lines
          .slice(o + 1)
          .filter((l) => !l.startsWith("//"))
          .join("")
          .replace(/[^A-Za-z]/g, "")
          .toUpperCase()
  if (!length) length = sequence.length

  // features: a key at column 5, qualifiers at column 21
  const f0 = lines.findIndex((l) => l.startsWith("FEATURES"))
  const raw: { key: string; loc: string; q: Record<string, string> }[] = []
  if (f0 >= 0) {
    let cur: (typeof raw)[number] | null = null
    let qKey: string | null = null
    let open = false
    // an odd run of quotes at the end closes the value ("" is an escaped quote)
    const closes = (t: string) => (t.match(/"+$/)?.[0].length ?? 0) % 2 === 1
    for (let j = f0 + 1; j < lines.length; j++) {
      const l = lines[j]
      if (/^\S/.test(l)) break
      const key = l.slice(5, 21).trim()
      const rest = l.slice(21).trimEnd()
      if (key && !open) {
        cur = { key, loc: rest.trim(), q: {} }
        raw.push(cur)
        qKey = null
      } else if (cur) {
        // a quoted value runs on until its closing quote, even over lines that start with "/"
        const qm: RegExpMatchArray | null = open ? null : rest.match(/^\/(\w+)(?:=(.*))?$/)
        if (qm) {
          const k: string = qm[1]
          const v: string = qm[2] ?? ""
          qKey = k
          cur.q[k] = v.replace(/^"/, "")
          open = v.startsWith('"') && !closes(v.slice(1))
        } else if (qKey) {
          cur.q[qKey] += (qKey === "translation" ? "" : " ") + rest.trim()
          if (open && closes(rest.trim())) open = false
        } else cur.loc += rest.trim()
      }
    }
    for (const f of raw) for (const k in f.q) f.q[k] = f.q[k].replace(/"$/, "").replace(/""/g, '"')
  }

  const features: PlasmidFeature[] = []
  let exon = 0
  for (const f of raw) {
    if (f.key === "exon") exon++
    if (f.key === "exon" && !f.q.number) f.q.number = String(exon)
    if (skip.includes(f.key)) continue
    if (f.key === "gene" && !keepGenes && raw.some((g) => g !== f && g.key === "CDS" && g.loc === f.loc)) continue
    const { strand, segments } = parseLocation(f.loc, length || Infinity)
    if (!segments.length) continue
    const first = segments[0]
    const lastSeg = segments[segments.length - 1]
    // a join that runs back past the origin wraps
    const wraps = topology === "circular" && segments.length > 1 && lastSeg.end < first.start
    const start = wraps ? first.start : Math.min(...segments.map((s) => s.start))
    const end = wraps ? lastSeg.end : Math.max(...segments.map((s) => s.end))
    const text = `${f.q.note ?? ""} ${f.q.product ?? ""} ${f.q.gene ?? ""} ${f.q.label ?? ""}`
    let kind: PlasmidFeatureKind = KEY_KIND[f.key] ?? "misc"
    if (f.key === "regulatory") kind = /polyA|terminator/i.test(f.q.regulatory_class ?? "") ? "terminator" : /promoter/i.test(f.q.regulatory_class ?? "") ? "promoter" : "misc"
    if ((kind === "cds" || f.key === "gene") && MARKER.test(text)) kind = "marker"
    const directional = kind === "cds" || kind === "marker" || kind === "promoter" || kind === "primer" || f.key === "gene"
    const desc = [f.q.product, f.q.note].filter(Boolean).join(", ")
    features.push({
      start,
      end,
      name: featureName(f.q, f.key),
      kind,
      strand: directional || /complement/.test(f.loc) ? strand : 0,
      ...(desc ? { description: desc[0].toUpperCase() + desc.slice(1) } : {}),
      ...(segments.length > 1 ? { segments } : {}),
      ...(f.q.codon_start ? { codonStart: Number(f.q.codon_start) as 1 | 2 | 3 } : {}),
    })
  }

  return {
    name: lt[1] ?? "",
    length,
    topology,
    molecule,
    definition: field("DEFINITION").replace(/\.$/, ""),
    accession: field("ACCESSION").split(/\s+/)[0] ?? "",
    features,
    sequence,
  }
}

type PlasmidMapProps = Omit<React.ComponentProps<"div">, "children"> & {
  name: string
  length: number
  features: PlasmidFeature[]
  sites?: PlasmidSite[]
  /** Base numbers inside the ring. Default true. */
  ruler?: boolean
  /** "auto" (default): outside labels where there is room, a legend on narrow maps. */
  labels?: "auto" | "outside" | "legend"
  selectable?: boolean
  onActiveChange?: (focus: PlasmidFocus | null) => void
}

function PlasmidMap({
  name,
  length,
  features,
  sites = [],
  ruler = true,
  labels = "auto",
  selectable = false,
  onActiveChange,
  className,
  "aria-label": ariaLabel,
  ...props
}: PlasmidMapProps) {
  const wrap = React.useRef<HTMLDivElement>(null)
  const [width, setWidth] = React.useState(0)
  React.useLayoutEffect(() => {
    const el = wrap.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setWidth(Math.round(e.contentRect.width)))
    ro.observe(el)
    setWidth(Math.round(el.getBoundingClientRect().width))
    return () => ro.disconnect()
  }, [])

  const outside = labels === "outside" || (labels === "auto" && width >= 520)
  const W = Math.min(width, outside ? 760 : 420)
  const BAND = 16
  const LANE = BAND + 5

  // lanes: features that overlap move outward
  const order = React.useMemo(() => features.map((f, i) => ({ f, i })).sort((a, b) => a.f.start - b.f.start), [features])
  const lanes = React.useMemo(() => {
    const out = new Array<number>(features.length).fill(0)
    const ends: number[] = []
    for (const { f, i } of order) {
      const s = f.start
      const e = f.start + featureLength(f, length) - 1
      let lane = ends.findIndex((end) => s > end + length * 0.004)
      if (lane < 0) lane = ends.length
      ends[lane] = e
      out[i] = lane
    }
    // a feature crossing the origin also blocks lane 0 at the start
    return out
  }, [order, features, length])
  const laneCount = Math.max(1, ...lanes.map((l) => l + 1))

  const cx = W / 2
  const R = Math.max(70, (outside ? Math.min(W / 2 - 175, 225) : W / 2 - 12) - (laneCount - 1) * LANE)
  const outerR = R + BAND / 2 + (laneCount - 1) * LANE
  const H = outside ? Math.max(W * 0.8, outerR * 2 + 150) : W
  const cy = H / 2

  const ang = React.useCallback((pos: number) => ((pos - 1) / length) * TAU - Math.PI / 2, [length])
  const pt = (r: number, a: number) => [cx + r * Math.cos(a), cy + r * Math.sin(a)] as const
  const P = (r: number, a: number) => pt(r, a).map((v) => v.toFixed(2)).join(",")

  // ---- focus
  const [hover, setHover] = React.useState<number | null>(null)
  const [selected, setSelected] = React.useState<number | null>(null)
  const [cursor, setCursor] = React.useState(order[0]?.i ?? 0)
  const [focused, setFocused] = React.useState(false)
  const active = hover ?? (focused && selectable ? cursor : selected)
  const cb = React.useRef(onActiveChange)
  cb.current = onActiveChange
  React.useEffect(() => {
    cb.current?.(active == null ? null : { feature: features[active], length: featureLength(features[active], length) })
  }, [active, features, length])

  const describe = (i: number | null) => {
    if (i == null) return `${name}, ${length.toLocaleString("en-US")} bp`
    const f = features[i]
    const dir = f.strand === 1 ? ", forward" : f.strand === -1 ? ", reverse" : ""
    return `${f.name}, ${f.start.toLocaleString("en-US")} to ${f.end.toLocaleString("en-US")}, ${featureLength(f, length).toLocaleString("en-US")} bp${dir}`
  }

  const onKeyDown = (ev: React.KeyboardEvent) => {
    const k = order.findIndex((o) => o.i === cursor)
    let next = cursor
    if (ev.key === "ArrowRight" || ev.key === "ArrowDown") next = order[(k + 1) % order.length].i
    else if (ev.key === "ArrowLeft" || ev.key === "ArrowUp") next = order[(k - 1 + order.length) % order.length].i
    else if (ev.key === "Home") next = order[0].i
    else if (ev.key === "End") next = order[order.length - 1].i
    else if (ev.key === "Escape") {
      setSelected(null)
      ev.preventDefault()
      return
    } else return
    ev.preventDefault()
    setCursor(next)
    setSelected(next)
  }

  const hit = (ev: React.PointerEvent) => {
    const r = wrap.current!.getBoundingClientRect()
    const x = ev.clientX - r.left - (r.width - W) / 2 - cx
    const y = ev.clientY - r.top - cy
    const d = Math.hypot(x, y)
    let a = Math.atan2(y, x) + Math.PI / 2
    if (a < 0) a += TAU
    const pos = (a / TAU) * length + 1
    let best: number | null = null
    let bestLen = Infinity
    features.forEach((f, i) => {
      const rm = R + lanes[i] * LANE
      if (Math.abs(d - rm) > BAND / 2 + 4) return
      const len = featureLength(f, length)
      const off = (pos - f.start + length) % length
      const slack = Math.max(length * 0.004, 1)
      if ((off <= len - 1 + slack || off >= length - slack) && len < bestLen) {
        best = i
        bestLen = len
      }
    })
    return best
  }

  // ---- shapes
  const arc = (f: PlasmidFeature, i: number) => {
    const rm = R + lanes[i] * LANE
    const thin = f.kind === "primer"
    const h = thin ? 7 : BAND
    const rO = rm + h / 2
    const rI = rm - h / 2
    const len = featureLength(f, length)
    const a0 = ang(f.start)
    const a1 = ang(f.start + len)
    const span = a1 - a0
    if (span * rm < h) {
      // too short for an arc: a dot
      const [x, y] = pt(rm, (a0 + a1) / 2)
      return { d: `M${x - h / 2},${y}a${h / 2},${h / 2} 0 1 0 ${h},0a${h / 2},${h / 2} 0 1 0 ${-h},0Z`, rm, a0, a1, h }
    }
    const tip = f.strand && !thin ? Math.min(10 / rm, span * 0.45) : 0
    const large = (s: number) => (s > Math.PI ? 1 : 0)
    const cap = h / 2
    let d: string
    if (f.strand === 1 && tip) {
      const b = a1 - tip
      d = `M${P(rO, a0)}A${rO},${rO} 0 ${large(b - a0)} 1 ${P(rO, b)}L${P(rm, a1)}L${P(rI, b)}A${rI},${rI} 0 ${large(b - a0)} 0 ${P(rI, a0)}A${cap},${cap} 0 0 1 ${P(rO, a0)}Z`
    } else if (f.strand === -1 && tip) {
      const b = a0 + tip
      d = `M${P(rm, a0)}L${P(rO, b)}A${rO},${rO} 0 ${large(a1 - b)} 1 ${P(rO, a1)}A${cap},${cap} 0 0 1 ${P(rI, a1)}A${rI},${rI} 0 ${large(a1 - b)} 0 ${P(rI, b)}Z`
    } else {
      d = `M${P(rO, a0)}A${rO},${rO} 0 ${large(span)} 1 ${P(rO, a1)}A${cap},${cap} 0 0 1 ${P(rI, a1)}A${rI},${rI} 0 ${large(span)} 0 ${P(rI, a0)}A${cap},${cap} 0 0 1 ${P(rO, a0)}Z`
    }
    return { d, rm, a0, a1, h }
  }

  const shapes = features.map(arc)
  const fits = features.map((f, i) => {
    const s = shapes[i]
    return f.kind !== "primer" && (s.a1 - s.a0) * s.rm > f.name.length * 6.6 + 30
  })

  // ---- outside labels: features that do not fit on their arc, and sites; spread per side
  const labelR = outerR + 38
  type L = { key: string; a: number; text: string; muted: boolean; r0: number; y: number; side: 1 | -1; i?: number }
  const outsideLabels: L[] = React.useMemo(() => {
    if (!outside || !width) return []
    const items: L[] = []
    features.forEach((f, i) => {
      if (fits[i]) return
      const s = shapes[i]
      const a = (s.a0 + s.a1) / 2
      items.push({ key: `f${i}`, a, text: f.name, muted: false, r0: s.rm + s.h / 2 + 2, y: 0, side: Math.cos(a) >= 0 ? 1 : -1, i })
    })
    sites.forEach((s, k) => {
      const a = ang(s.position)
      items.push({ key: `s${k}`, a, text: `${s.name} ${s.position.toLocaleString("en-US")}`, muted: true, r0: R + 7, y: 0, side: Math.cos(a) >= 0 ? 1 : -1 })
    })
    const GAP = 15
    for (const side of [1, -1] as const) {
      const group = items.filter((l) => l.side === side).sort((p, q) => Math.sin(p.a) - Math.sin(q.a))
      group.forEach((l) => (l.y = cy + labelR * Math.sin(l.a)))
      for (let k = 1; k < group.length; k++) if (group[k].y < group[k - 1].y + GAP) group[k].y = group[k - 1].y + GAP
      const over = group.length ? group[group.length - 1].y - (H - 8) : 0
      if (over > 0) group.forEach((l) => (l.y -= over))
      for (let k = group.length - 2; k >= 0; k--) if (group[k].y > group[k + 1].y - GAP) group[k].y = group[k + 1].y - GAP
    }
    return items
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [outside, width, features, sites, R, labelR, H, cy, length])

  // ---- ruler
  const ticks = React.useMemo(() => {
    if (!ruler) return []
    const raw = length / 8
    const p = 10 ** Math.floor(Math.log10(raw))
    const step = [1, 2, 5, 10].map((m) => m * p).find((s) => s >= raw) ?? p * 10
    const out: number[] = []
    for (let t = step; t < length - step * 0.3; t += step) out.push(t)
    return out
  }, [ruler, length])

  const label = ariaLabel ?? `Plasmid map of ${name}, ${length.toLocaleString("en-US")} bp, ${features.length} features${sites.length ? `, ${sites.length} unique sites` : ""}`
  const focusText = describe(active)
  const af = active == null ? null : features[active]

  return (
    <div data-slot="plasmid-map" className={cn("grid w-full justify-items-center gap-4", className)} {...props}>
      <div
        ref={wrap}
        className={cn(
          "relative w-full select-none outline-none",
          selectable && "cursor-pointer rounded-3xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
        )}
        style={{ height: width ? H : 320 }}
        {...(selectable
          ? {
              role: "slider",
              tabIndex: 0,
              "aria-label": label,
              "aria-valuemin": 1,
              "aria-valuemax": features.length,
              "aria-valuenow": order.findIndex((o) => o.i === cursor) + 1,
              "aria-valuetext": focusText,
              onKeyDown,
              onFocus: () => setFocused(true),
              onBlur: () => setFocused(false),
              onPointerMove: (ev: React.PointerEvent) => setHover(hit(ev)),
              onPointerLeave: () => setHover(null),
              onPointerDown: (ev: React.PointerEvent) => {
                const h = hit(ev)
                setSelected(h)
                if (h != null) setCursor(h)
              },
            }
          : { role: "img", "aria-label": label })}
      >
        {width > 0 && (
          <svg width={W} height={H} aria-hidden className="mx-auto block overflow-visible">
            <defs>
              {features.map((f, i) => {
                if (!fits[i]) return null
                const s = shapes[i]
                const mid = (s.a0 + s.a1) / 2
                const bottom = Math.sin(mid) > 0.15
                const r = s.rm + (bottom ? 4 : -4) * 0
                const [a, b] = bottom ? [s.a1, s.a0] : [s.a0, s.a1]
                return (
                  <path
                    key={i}
                    id={`pm-${name}-${i}`.replace(/[^\w-]/g, "")}
                    d={`M${P(r, a)}A${r},${r} 0 ${Math.abs(b - a) > Math.PI ? 1 : 0} ${bottom ? 0 : 1} ${P(r, b)}`}
                  />
                )
              })}
            </defs>

            {/* backbone */}
            <circle cx={cx} cy={cy} r={R} fill="none" stroke="var(--outline-variant)" strokeWidth={2} />

            {/* ruler: dots and numbers inside the ring */}
            {ticks.map((t) => {
              const a = ang(t)
              const [x, y] = pt(R - 26, a)
              return (
                <g key={t}>
                  <line x1={pt(R - 6, a)[0]} y1={pt(R - 6, a)[1]} x2={pt(R - 11, a)[0]} y2={pt(R - 11, a)[1]} stroke="var(--outline-variant)" strokeWidth={1.5} strokeLinecap="round" />
                  <text x={x} y={y + 4} textAnchor="middle" className="fill-muted-foreground text-[0.625rem] tabular-nums">
                    {t.toLocaleString("en-US")}
                  </text>
                </g>
              )
            })}

            {/* sites: ticks across the backbone */}
            {sites.map((s) => {
              const a = ang(s.position)
              return (
                <line
                  key={`${s.name}${s.position}`}
                  x1={pt(R - 5, a)[0]}
                  y1={pt(R - 5, a)[1]}
                  x2={pt(R + 5, a)[0]}
                  y2={pt(R + 5, a)[1]}
                  stroke="var(--foreground)"
                  strokeOpacity={0.6}
                  strokeWidth={1.5}
                  strokeLinecap="round"
                />
              )
            })}

            {/* features */}
            {features.map((f, i) => {
              const c = featureColor(f)
              const dim = active != null && active !== i
              return (
                <g key={`${f.name}-${f.start}`} style={{ opacity: dim ? 0.35 : 1, transition: "opacity 200ms" }}>
                  <title>{f.description ?? describe(i)}</title>
                  <path d={shapes[i].d} fill={fillOf(c)} stroke={fillOf(c)} strokeWidth={1.5} strokeLinejoin="round" />
                  {fits[i] && (
                    <text dy={4} className="text-[0.6875rem] font-semibold" fill={inkOf(c)}>
                      <textPath href={`#${`pm-${name}-${i}`.replace(/[^\w-]/g, "")}`} startOffset="50%" textAnchor="middle">
                        {f.name}
                      </textPath>
                    </text>
                  )}
                </g>
              )
            })}

            {/* outside labels with leaders */}
            {outsideLabels.map((l) => {
              const [x0, y0] = pt(l.r0, l.a)
              // the label rides a circle around the map, so a stack fans out instead of piling in a column
              const dy = Math.min(Math.abs(l.y - cy), labelR - 1)
              const xe = cx + l.side * (Math.sqrt(labelR * labelR - dy * dy) + 12)
              const xEdge = l.side === 1 ? Math.max(xe, x0 + 10) : Math.min(xe, x0 - 10)
              const dim = active != null && l.i !== active
              return (
                <g key={l.key} style={{ opacity: dim && !l.muted ? 0.4 : 1 }}>
                  <path
                    // straight out past the outermost arcs first, so no leader crosses a feature
                    d={`M${x0},${y0}L${pt(outerR + 12, l.a).join(",")}L${xEdge - l.side * 6},${l.y}L${xEdge},${l.y}`}
                    fill="none"
                    stroke="var(--outline-variant)"
                    strokeWidth={1.25}
                    strokeLinejoin="round"
                  />
                  <text
                    x={xEdge + l.side * 4}
                    y={l.y + 4}
                    textAnchor={l.side === 1 ? "start" : "end"}
                    className={cn("text-[0.6875rem]", l.muted ? "fill-muted-foreground tabular-nums" : "fill-foreground font-medium")}
                  >
                    {l.text}
                  </text>
                </g>
              )
            })}

            {/* center readout */}
            <g aria-hidden>
              {af ? (
                <>
                  <text x={cx} y={cy - 6} textAnchor="middle" className="fill-foreground text-[1.125rem] font-semibold">
                    {af.name}
                  </text>
                  <text x={cx} y={cy + 14} textAnchor="middle" className="fill-muted-foreground text-[0.75rem] tabular-nums">
                    {af.start.toLocaleString("en-US")}
                    {af.end !== af.start && `–${af.end.toLocaleString("en-US")}`}
                    {af.strand === 1 ? " →" : af.strand === -1 ? " ←" : ""}
                  </text>
                  <text x={cx} y={cy + 30} textAnchor="middle" className="fill-muted-foreground text-[0.75rem] tabular-nums">
                    {featureLength(af, length).toLocaleString("en-US")} bp
                  </text>
                </>
              ) : (
                <>
                  <text x={cx} y={cy - 2} textAnchor="middle" className="fill-foreground text-[1.25rem] font-semibold">
                    {name}
                  </text>
                  <text x={cx} y={cy + 18} textAnchor="middle" className="fill-muted-foreground text-[0.8125rem] tabular-nums">
                    {length.toLocaleString("en-US")} bp
                  </text>
                </>
              )}
            </g>
          </svg>
        )}
      </div>

      {!outside && width > 0 && (
        <ul data-slot="plasmid-legend" className="flex w-full flex-wrap gap-x-5 gap-y-2">
          {features.map((f, i) => (
            <li key={`${f.name}-${f.start}`} className="flex items-center gap-2 type-label-md">
              <span aria-hidden className="h-2.5 w-4 shrink-0 rounded-full" style={{ background: fillOf(featureColor(f)) }} />
              <span className="text-foreground">{f.name}</span>
              <span className="text-muted-foreground tabular-nums">
                {f.start.toLocaleString("en-US")}
                {f.end !== f.start && `–${f.end.toLocaleString("en-US")}`}
              </span>
              <span className="sr-only">{describe(i)}</span>
            </li>
          ))}
          {sites.length > 0 && (
            <li className="flex basis-full flex-wrap gap-x-3 gap-y-1 type-label-md text-muted-foreground">
              {sites.map((s) => (
                <span key={`${s.name}${s.position}`} className="tabular-nums">
                  {s.name} {s.position.toLocaleString("en-US")}
                </span>
              ))}
            </li>
          )}
        </ul>
      )}
    </div>
  )
}

export { PlasmidMap, type PlasmidMapProps }
