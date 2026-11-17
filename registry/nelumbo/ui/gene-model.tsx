"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Nelumbo Gene Model
 *
 * A gene's transcripts as exons and introns, the way genome browsers draw
 * them, in Nelumbo's language:
 *
 * - Coding sequence is a tall solid block, UTRs a thinner tonal one. Where a
 *   UTR meets the coding part inside an exon, the two connect like a
 *   connected button group: a 2px gap, tight inner corners, round outer ends.
 * - Introns are a dotted round line (the charts' zone line) with chevrons
 *   pointing the way the gene is read.
 * - Exons are numbered in transcription order: inside the block where the
 *   number fits, under it where it does not.
 * - `introns="compressed"` shrinks every intron to a short stretch so the
 *   exons get the room; the true scale keeps a ruler in genomic coordinates.
 * - Variants are lollipops above a transcript, with pill labels.
 * - `selectable` makes the model one keyboard stop, like a chart: Left and
 *   Right move between exons, Up and Down between transcripts.
 *
 *   <GeneModel transcripts={[tp53]} exonNumbers markers={[{ position: 7675088, label: "R175H" }]} />
 *
 * Coordinates are 1-based and inclusive, as Ensembl and GENCODE give them.
 */

export type GeneModelColor = "blue" | "cyan" | "green" | "amber" | "orange" | "red" | "pink" | "purple" | "brand"

export type GeneModelTranscript = {
  id: string
  /** Shown above the track: "TP53-201". */
  name?: string
  /** A line after the name: "p53α, canonical". */
  description?: string
  strand: "+" | "-"
  exons: { start: number; end: number }[]
  /** The coding stretch, from the first base of the start codon to the last of the stop. None for non-coding. */
  cds?: { start: number; end: number }
  /** Drawn in color when several transcripts are shown; the rest are neutral. */
  canonical?: boolean
}

export type GeneModelMarker = {
  /** Genomic position, 1-based. */
  position: number
  /** A short pill above the head: "R175H". */
  label?: string
  /** The head's color. Default red. */
  color?: GeneModelColor | "neutral"
  /** Read on hover and by screen readers. */
  description?: string
}

/** An exon as the model numbers it. */
export type GeneModelExon = {
  start: number
  end: number
  /** 1-based, in transcription order. */
  number: number
  length: number
  kind: "coding" | "utr" | "partial"
}

export type GeneModelFocus = { transcript: GeneModelTranscript; exon: GeneModelExon; of: number }

/** A transcript's exons in transcription order, numbered, with how much of each codes. */
export function numberExons(t: GeneModelTranscript): GeneModelExon[] {
  const sorted = [...t.exons].sort((a, b) => (t.strand === "-" ? b.start - a.start : a.start - b.start))
  return sorted.map((e, i) => {
    const length = e.end - e.start + 1
    let kind: GeneModelExon["kind"] = "utr"
    if (t.cds) {
      const lo = Math.max(e.start, t.cds.start)
      const hi = Math.min(e.end, t.cds.end)
      if (hi >= lo) kind = hi - lo + 1 === length ? "coding" : "partial"
    }
    return { start: e.start, end: e.end, number: i + 1, length, kind }
  })
}

/** A coordinate as genome browsers print it: "7,670,000"; whole megabases as "8 Mb" when the step is that coarse. */
export function formatGenomic(bp: number, step = 1) {
  if (step >= 1e6) return `${bp / 1e6} Mb`
  return bp.toLocaleString("en-US")
}

const COLOR_VAR = (c: GeneModelColor | "neutral") => (c === "neutral" ? "var(--muted-foreground)" : `var(--${c})`)
const ON_VAR = (c: GeneModelColor | "neutral") => (c === "neutral" ? "var(--background)" : `var(--${c}-foreground)`)

/** A rectangle with its own radius at each corner: [top-left, top-right, bottom-right, bottom-left]. */
function roundedRect(x: number, y: number, w: number, h: number, [tl, tr, br, bl]: number[]) {
  const c = (r: number) => Math.max(0, Math.min(r, w / 2, h / 2))
  const [a, b, d, e] = [c(tl), c(tr), c(br), c(bl)]
  return (
    `M${x + a},${y}H${x + w - b}A${b},${b} 0 0 1 ${x + w},${y + b}V${y + h - d}A${d},${d} 0 0 1 ${x + w - d},${y + h}` +
    `H${x + e}A${e},${e} 0 0 1 ${x},${y + h - e}V${y + a}A${a},${a} 0 0 1 ${x + a},${y}Z`
  )
}

const SIZES = {
  sm: { cds: 14, utr: 8, ro: 5, label: 16, gap: 10 },
  default: { cds: 20, utr: 10, ro: 7, label: 20, gap: 14 },
}

type GeneModelProps = Omit<React.ComponentProps<"div">, "children"> & {
  transcripts: GeneModelTranscript[]
  /** The stretch shown. Default: the transcripts' span. */
  region?: { start: number; end: number }
  /** "scaled" (default) keeps genomic distances; "compressed" shrinks introns so exons get the room. */
  introns?: "scaled" | "compressed"
  /** "genome" (default) as a genome browser shows it; "transcript" turns minus-strand genes so 5' is on the left. */
  orientation?: "genome" | "transcript"
  color?: GeneModelColor
  size?: keyof typeof SIZES
  exonNumbers?: boolean
  /** Genomic coordinates along the top. Only with scaled introns. */
  ruler?: boolean
  markers?: GeneModelMarker[]
  /** The transcript the markers stand on. Default: the first. */
  markersOn?: string
  /** Pointer and keyboard focus on exons. */
  selectable?: boolean
  /** The exon under the pointer, the keyboard cursor, or the one clicked. */
  onActiveChange?: (focus: GeneModelFocus | null) => void
  defaultSelected?: { transcript: string; exon: number }
}

function GeneModel({
  transcripts,
  region,
  introns = "scaled",
  orientation = "genome",
  color = "blue",
  size = "default",
  exonNumbers = false,
  ruler = false,
  markers,
  markersOn,
  selectable = false,
  onActiveChange,
  defaultSelected,
  className,
  "aria-label": ariaLabel,
  ...props
}: GeneModelProps) {
  const S = SIZES[size]
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

  const numbered = React.useMemo(() => transcripts.map(numberExons), [transcripts])
  const lo = region?.start ?? Math.min(...transcripts.flatMap((t) => t.exons.map((e) => e.start)))
  const hi = region?.end ?? Math.max(...transcripts.flatMap((t) => t.exons.map((e) => e.end)))
  const flip = orientation === "transcript" && transcripts[0]?.strand === "-"
  const multi = transcripts.length > 1
  const colorOf = (t: GeneModelTranscript): GeneModelColor | "neutral" => (!multi || t.canonical ? color : "neutral")

  // ---- horizontal scale: piecewise, so compressed introns shrink and exons keep their length
  const scale = React.useMemo(() => {
    const merged: [number, number][] = []
    for (const [s, e] of transcripts.flatMap((t) => t.exons.map((x) => [x.start, x.end] as [number, number])).sort((a, b) => a[0] - b[0])) {
      const last = merged[merged.length - 1]
      if (last && s <= last[1] + 1) last[1] = Math.max(last[1], e)
      else merged.push([s, e])
    }
    const exonic = merged.reduce((n, [s, e]) => n + e - s + 1, 0)
    const cap = Math.max(exonic * 0.035, 1)
    // breakpoints [bp, display length so far]
    const pts: [number, number][] = [[lo, 0]]
    let at = lo
    let d = 0
    const add = (to: number, isIntron: boolean) => {
      if (to <= at) return
      const len = to - at
      d += introns === "compressed" && isIntron ? Math.min(len, cap) : len
      pts.push([to, d])
      at = to
    }
    for (const [s, e] of merged) {
      add(Math.max(lo, Math.min(hi + 1, s)), true)
      add(Math.max(lo, Math.min(hi + 1, e + 1)), false)
    }
    add(hi + 1, true)
    return { pts, total: d || 1 }
  }, [transcripts, introns, lo, hi])

  const pad = 8
  const inner = Math.max(width - pad * 2, 1)
  const x = React.useCallback(
    (bp: number) => {
      const { pts, total } = scale
      let i = 1
      while (i < pts.length - 1 && pts[i][0] < bp) i++
      const [b0, d0] = pts[i - 1]
      const [b1, d1] = pts[i]
      const dv = b1 === b0 ? d0 : d0 + ((bp - b0) / (b1 - b0)) * (d1 - d0)
      const px = (Math.max(0, Math.min(total, dv)) / total) * inner
      return pad + (flip ? inner - px : px)
    },
    [scale, inner, flip]
  )
  const span = (s: number, e: number) => {
    const a = x(s)
    const b = x(e + 1)
    return [Math.min(a, b), Math.max(a, b)] as const
  }

  // ---- markers: greedy levels so labels do not collide
  const markerRow = transcripts.findIndex((t) => t.id === markersOn)
  const markerAt = markerRow < 0 ? 0 : markerRow
  const placed = React.useMemo(() => {
    if (!markers?.length || !width) return []
    const levels: number[] = []
    return [...markers]
      .map((m) => ({ m, px: x(m.position), w: m.label ? m.label.length * 6.4 + 14 : 12 }))
      .sort((a, b) => a.px - b.px)
      .map((p) => {
        let level = levels.findIndex((end) => p.px - p.w / 2 > end + 4)
        if (level < 0) level = levels.length
        levels[level] = p.px + p.w / 2
        return { ...p, level }
      })
  }, [markers, width, x])
  const markerLevels = placed.length ? Math.max(...placed.map((p) => p.level)) + 1 : 0

  // ---- vertical layout
  const rulerH = ruler && introns === "scaled" ? 26 : 0
  const markerH = markerLevels ? 14 + markerLevels * 24 : 0
  const numbersBelow = exonNumbers ? 14 : 0
  const rowH = S.label + S.cds + numbersBelow + S.gap
  // each row: its name, the markers if they stand on it, then the track
  const rowTop = (r: number) => rulerH + r * rowH + (r > markerAt ? markerH : 0)
  const trackTop = (r: number) => rowTop(r) + S.label + (r === markerAt ? markerH : 0)
  const rowEnd = (r: number) => trackTop(r) + S.cds + numbersBelow + S.gap
  const height = rulerH + markerH + transcripts.length * rowH - S.gap + 4

  // ---- focus
  const [hover, setHover] = React.useState<{ t: number; e: number } | null>(null)
  const initial = React.useMemo(() => {
    if (!defaultSelected) return null
    const t = transcripts.findIndex((x) => x.id === defaultSelected.transcript)
    return t < 0 ? null : { t, e: defaultSelected.exon - 1 }
  }, [defaultSelected, transcripts])
  const [selected, setSelected] = React.useState<{ t: number; e: number } | null>(initial)
  const [cursor, setCursor] = React.useState<{ t: number; e: number }>(initial ?? { t: 0, e: 0 })
  const [focused, setFocused] = React.useState(false)
  const active = hover ?? (focused && selectable ? cursor : selected)
  const focusOf = (a: { t: number; e: number } | null): GeneModelFocus | null =>
    a && numbered[a.t]?.[a.e] ? { transcript: transcripts[a.t], exon: numbered[a.t][a.e], of: numbered[a.t].length } : null
  const cb = React.useRef(onActiveChange)
  cb.current = onActiveChange
  const activeKey = active ? `${active.t}:${active.e}` : ""
  React.useEffect(() => {
    cb.current?.(focusOf(active))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeKey])

  const say = (a: { t: number; e: number } | null) => {
    const f = focusOf(a)
    if (!f) return ""
    const kind = f.exon.kind === "coding" ? "coding" : f.exon.kind === "utr" ? "untranslated" : "partly coding"
    return `${f.transcript.name ?? f.transcript.id}, exon ${f.exon.number} of ${f.of}, ${kind}, ${f.exon.length.toLocaleString("en-US")} bp`
  }

  // exons left to right on screen, for arrow keys
  const leftToRight = (t: number) => numbered[t].map((e, i) => ({ i, px: x(e.start) })).sort((a, b) => a.px - b.px).map((v) => v.i)
  const onKeyDown = (ev: React.KeyboardEvent) => {
    const order = leftToRight(cursor.t)
    const k = order.indexOf(cursor.e)
    let next = cursor
    if (ev.key === "ArrowRight") next = { t: cursor.t, e: order[Math.min(order.length - 1, k + 1)] }
    else if (ev.key === "ArrowLeft") next = { t: cursor.t, e: order[Math.max(0, k - 1)] }
    else if (ev.key === "Home") next = { t: cursor.t, e: order[0] }
    else if (ev.key === "End") next = { t: cursor.t, e: order[order.length - 1] }
    else if (ev.key === "ArrowDown" || ev.key === "ArrowUp") {
      const t = Math.max(0, Math.min(transcripts.length - 1, cursor.t + (ev.key === "ArrowDown" ? 1 : -1)))
      // the exon nearest the same place on screen
      const here = x(numbered[cursor.t][cursor.e].start)
      const e = numbered[t].reduce((best, ex, i) => (Math.abs(x(ex.start) - here) < Math.abs(x(numbered[t][best].start) - here) ? i : best), 0)
      next = { t, e }
    } else if (ev.key === "Escape") {
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
    const px = ev.clientX - r.left
    const py = ev.clientY - r.top
    const t = transcripts.findIndex((_, i) => py >= rowTop(i) && py < rowEnd(i))
    if (t < 0) return null
    let best = -1
    let dist = 12
    numbered[t].forEach((e, i) => {
      const [a, b] = span(e.start, e.end)
      const d = px < a ? a - px : px > b ? px - b : 0
      if (d < dist) {
        dist = d
        best = i
      }
    })
    return best < 0 ? null : { t, e: best }
  }

  // ---- ruler ticks
  const ticks = React.useMemo(() => {
    if (!rulerH || !width) return []
    const range = hi - lo
    const raw = range / Math.max(2, Math.floor(inner / 110))
    const p = 10 ** Math.floor(Math.log10(raw))
    const step = [1, 2, 5, 10].map((m) => m * p).find((s) => s >= raw) ?? p * 10
    const out: { bp: number; step: number }[] = []
    for (let b = Math.ceil(lo / step) * step; b <= hi; b += step) out.push({ bp: b, step })
    return out
  }, [rulerH, width, lo, hi, inner])

  const label =
    ariaLabel ??
    `Gene model, ${transcripts.length} transcript${transcripts.length > 1 ? "s" : ""}: ${transcripts
      .map((t) => `${t.name ?? t.id}, ${t.exons.length} exons`)
      .join("; ")}`

  return (
    <div
      ref={wrap}
      data-slot="gene-model"
      className={cn(
        "relative w-full select-none outline-none",
        selectable && "cursor-pointer rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring",
        className
      )}
      style={{ height }}
      {...(selectable
        ? {
            role: "slider",
            tabIndex: 0,
            "aria-label": label,
            "aria-valuemin": 1,
            "aria-valuemax": numbered[cursor.t]?.length ?? 1,
            "aria-valuenow": (numbered[cursor.t]?.[cursor.e]?.number ?? 1) as number,
            "aria-valuetext": say(selected ?? cursor) || label,
            onKeyDown,
            onFocus: () => setFocused(true),
            onBlur: () => setFocused(false),
            onPointerMove: (ev: React.PointerEvent) => setHover(hit(ev)),
            onPointerLeave: () => setHover(null),
            onPointerDown: (ev: React.PointerEvent) => {
              const h = hit(ev)
              if (h) {
                setSelected(h)
                setCursor(h)
              }
            },
          }
        : { role: "img", "aria-label": label })}
      {...props}
    >
      {width > 0 && (
        <svg width={width} height={height} aria-hidden className="block overflow-visible">
          {/* ruler */}
          {ticks.map(({ bp, step }) => (
            <g key={bp}>
              <text x={x(bp)} y={11} textAnchor="middle" className="fill-muted-foreground text-[0.6875rem] tabular-nums">
                {formatGenomic(bp, step)}
              </text>
              <line
                x1={x(bp)}
                x2={x(bp)}
                y1={18}
                y2={height}
                stroke="var(--outline-variant)"
                strokeWidth={1.5}
                strokeDasharray="0 5"
                strokeLinecap="round"
              />
            </g>
          ))}

          {transcripts.map((t, ti) => {
            const top = rowTop(ti)
            const cy = trackTop(ti) + S.cds / 2
            const c = colorOf(t)
            const fill = COLOR_VAR(c)
            const tonal = `color-mix(in oklab, ${fill} 34%, var(--background))`
            const exons = numbered[ti]
            const byPos = [...exons].sort((a, b) => a.start - b.start)
            const dir = (t.strand === "+") !== flip ? 1 : -1
            return (
              <g key={t.id}>
                <text x={pad} y={top + S.label - 7} className="fill-foreground text-[0.75rem] font-medium">
                  {t.name ?? t.id}
                  {t.description && (
                    <tspan className="fill-muted-foreground font-normal" dx={8}>
                      {t.description}
                    </tspan>
                  )}
                </text>

                {/* introns: dotted, with chevrons the way the gene is read */}
                {byPos.slice(1).map((e, i) => {
                  const [, a] = span(byPos[i].start, byPos[i].end)
                  const [b] = span(e.start, e.end)
                  const [x0, x1] = [Math.min(a, b), Math.max(a, b)]
                  if (x1 - x0 < 4) return null
                  const n = Math.floor((x1 - x0) / 44)
                  return (
                    <g key={e.start}>
                      <line
                        x1={x0 + 3}
                        x2={x1 - 3}
                        y1={cy}
                        y2={cy}
                        stroke="var(--muted-foreground)"
                        strokeOpacity={0.6}
                        strokeWidth={2}
                        strokeDasharray="0 5"
                        strokeLinecap="round"
                      />
                      {Array.from({ length: n }, (_, k) => {
                        const cx = x0 + ((k + 1) * (x1 - x0)) / (n + 1)
                        return (
                          <path
                            key={k}
                            d={`M${cx - 2 * dir},${cy - 4}L${cx + 2 * dir},${cy}L${cx - 2 * dir},${cy + 4}`}
                            fill="none"
                            stroke="var(--muted-foreground)"
                            strokeWidth={1.75}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        )
                      })}
                    </g>
                  )
                })}

                {/* exons: UTR and coding parts, connected */}
                {exons.map((e, ei) => {
                  const parts: { s: number; e: number; coding: boolean }[] = []
                  const cs = t.cds ? Math.max(e.start, t.cds.start) : 0
                  const ce = t.cds ? Math.min(e.end, t.cds.end) : -1
                  if (ce >= cs) {
                    if (cs > e.start) parts.push({ s: e.start, e: cs - 1, coding: false })
                    parts.push({ s: cs, e: ce, coding: true })
                    if (ce < e.end) parts.push({ s: ce + 1, e: e.end, coding: false })
                  } else parts.push({ s: e.start, e: e.end, coding: false })
                  const px = parts.map((p) => ({ ...p, px: span(p.s, p.e) })).sort((a, b) => a.px[0] - b.px[0])
                  const [ex0, ex1] = span(e.start, e.end)
                  const isActive = active?.t === ti && active?.e === ei
                  const isSel = selected?.t === ti && selected?.e === ei
                  const codingPart = px.find((p) => p.coding)
                  const inside = exonNumbers && codingPart && codingPart.px[1] - codingPart.px[0] >= String(e.number).length * 6.5 + 10
                  return (
                    <g key={e.start}>
                      {px.map((p, k) => {
                        const h = p.coding ? S.cds : S.utr
                        const join = 2
                        const gapL = k > 0 ? 1 : 0
                        const gapR = k < px.length - 1 ? 1 : 0
                        const x0 = p.px[0] + gapL
                        const w = Math.max(1.5, p.px[1] - p.px[0] - gapL - gapR)
                        const r = p.coding ? S.ro : Math.min(S.ro, h / 2)
                        const left = k > 0 ? join : r
                        const right = k < px.length - 1 ? join : r
                        return (
                          <path
                            key={k}
                            d={roundedRect(x0, cy - h / 2, w, h, [left, right, right, left])}
                            fill={p.coding ? fill : tonal}
                          />
                        )
                      })}
                      {(isActive || isSel) && (
                        <rect
                          x={ex0 - 3.5}
                          y={cy - S.cds / 2 - 3.5}
                          width={Math.max(ex1 - ex0, 2) + 7}
                          height={S.cds + 7}
                          rx={S.ro + 3}
                          fill="none"
                          stroke="var(--foreground)"
                          strokeOpacity={isSel ? 0.9 : 0.45}
                          strokeWidth={2}
                        />
                      )}
                      {exonNumbers && inside && codingPart && (
                        <text
                          x={(codingPart.px[0] + codingPart.px[1]) / 2}
                          y={cy + 3.5}
                          textAnchor="middle"
                          fill={ON_VAR(c)}
                          className="text-[0.625rem] font-semibold tabular-nums"
                        >
                          {e.number}
                        </text>
                      )}
                      {exonNumbers && !inside && (
                        <text
                          x={(ex0 + ex1) / 2}
                          y={cy + S.cds / 2 + 12}
                          textAnchor="middle"
                          className="fill-muted-foreground text-[0.625rem] tabular-nums"
                        >
                          {e.number}
                        </text>
                      )}
                    </g>
                  )
                })}

                {/* markers stand on this transcript: stems first, so no stem crosses a pill */}
                {ti === markerAt &&
                  placed.map(({ m, px: mx, level }) => (
                    <line
                      key={`stem-${m.position}-${m.label}`}
                      x1={mx}
                      x2={mx}
                      y1={trackTop(ti) - 14 - level * 24}
                      y2={cy - S.cds / 2 - 1}
                      stroke={COLOR_VAR(m.color ?? "red")}
                      strokeOpacity={0.55}
                      strokeWidth={1.5}
                    />
                  ))}
                {ti === markerAt &&
                  placed.map(({ m, px: mx, level }) => {
                    const mc = m.color ?? "red"
                    const headY = trackTop(ti) - 14 - level * 24
                    return (
                      <g key={`${m.position}-${m.label}`}>
                        <title>{m.description ?? m.label ?? `Position ${m.position.toLocaleString("en-US")}`}</title>
                        {m.label ? (
                          <g>
                            <rect
                              x={mx - (m.label.length * 6.4 + 14) / 2}
                              y={headY - 9}
                              width={m.label.length * 6.4 + 14}
                              height={18}
                              rx={9}
                              fill={COLOR_VAR(mc)}
                            />
                            <text
                              x={mx}
                              y={headY + 3.5}
                              textAnchor="middle"
                              fill={ON_VAR(mc)}
                              className="font-mono text-[0.6875rem] font-semibold"
                            >
                              {m.label}
                            </text>
                          </g>
                        ) : (
                          <circle cx={mx} cy={headY} r={5} fill={COLOR_VAR(mc)} stroke="var(--background)" strokeWidth={2} />
                        )}
                      </g>
                    )
                  })}
              </g>
            )
          })}
        </svg>
      )}
    </div>
  )
}

export { GeneModel, type GeneModelProps }
