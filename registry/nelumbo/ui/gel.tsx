"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Nelumbo Gel
 *
 * An agarose gel: wells along the top, a ladder, and lanes of bands placed by
 * size the way DNA runs (by the log of its length, compressed at either end),
 * each as bright as the DNA in it. Grayscale like the real thing: glowing bands
 * on a dark gel under UV, or dark bands on a light one, as a scan prints it.
 *
 *   const lanes = [
 *     { label: "Ladder", ladder: "1kb" },
 *     { label: "HindIII", bands: digest(seq, { HindIII: "A^AGCTT" }, { circular: true }) },
 *   ]
 *   <Gel lanes={lanes} percent={1} />
 *
 * - `digest` cuts a sequence with enzymes ("G^AATTC", the caret at the cut)
 *   and returns its fragments, linear or circular. Fragments of one digest
 *   are equimolar, so a band's brightness follows its length.
 * - `percent` sets the agarose: higher resolves smaller fragments.
 * - Hover a band, or with `selectable` move through them with the arrow
 *   keys (left and right between lanes), for its size and where it came from.
 */

export type GelBand = {
  /** Length in bp. */
  size: number
  /** Relative amount of DNA (ng, or any unit). Default: the size, as for equimolar fragments. */
  mass?: number
  label?: string
  /** Where it came from: "HindIII 53 to XbaI 1,742". */
  description?: string
  /**
   * Where it runs, if not at its size: uncut plasmid DNA runs as a fast
   * supercoiled band and a slow nicked one. In bp of linear DNA.
   */
  apparent?: number
}

export type GelLane = {
  label: string
  bands?: GelBand[]
  /** A ladder preset, or your own bands. */
  ladder?: keyof typeof LADDERS
}

export type GelFocus = { lane: number; band: number; data: GelBand } | null

/** Two common ladders: sizes in bp, and the one band made brighter as a landmark. */
export const LADDERS = {
  "1kb": { name: "1 kb ladder", sizes: [10000, 8000, 6000, 5000, 4000, 3000, 2000, 1500, 1000, 500], bright: 3000 },
  "100bp": { name: "100 bp ladder", sizes: [1500, 1200, 1000, 900, 800, 700, 600, 500, 400, 300, 200, 100], bright: 500 },
} as const

/** Restriction enzymes, the caret at the top-strand cut. */
export const ENZYMES: Record<string, string> = {
  BamHI: "G^GATCC",
  BglII: "A^GATCT",
  DraI: "TTT^AAA",
  EcoRI: "G^AATTC",
  EcoRV: "GAT^ATC",
  HindIII: "A^AGCTT",
  KpnI: "GGTAC^C",
  MluI: "A^CGCGT",
  NcoI: "C^CATGG",
  NdeI: "CA^TATG",
  NheI: "G^CTAGC",
  NotI: "GC^GGCCGC",
  PstI: "CTGCA^G",
  SacI: "GAGCT^C",
  SalI: "G^TCGAC",
  ScaI: "AGT^ACT",
  SmaI: "CCC^GGG",
  SspI: "AAT^ATT",
  XbaI: "T^CTAGA",
  XhoI: "C^TCGAG",
}

export type Fragment = GelBand & { start: number; end: number; left?: string; right?: string }

/**
 * The fragments a digest leaves: cuts on the top strand at the caret of each
 * site ("G^AATTC"; no caret cuts before the site). A circular sequence with
 * one cut gives one linear fragment of its full length; with none, it runs as
 * uncut plasmid does, a supercoiled band ahead of its size and a nicked one behind.
 */
export function digest(sequence: string, enzymes: Record<string, string>, { circular = false } = {}): Fragment[] {
  const s = sequence.toUpperCase().replace(/[^A-Z]/g, "")
  const L = s.length
  const cuts: { at: number; name: string }[] = []
  for (const [name, pattern] of Object.entries(enzymes)) {
    const caret = pattern.indexOf("^")
    const site = pattern.replace("^", "").toUpperCase()
    const off = caret < 0 ? 0 : caret
    const hay = circular ? s + s.slice(0, site.length - 1) : s
    for (let i = hay.indexOf(site); i >= 0 && i < L; i = hay.indexOf(site, i + 1)) cuts.push({ at: (i + off) % L, name })
  }
  cuts.sort((a, b) => a.at - b.at)
  const fmt = (n: number) => n.toLocaleString("en-US")
  if (!cuts.length)
    return circular
      ? [
          // uncut plasmid: mostly supercoiled, running ahead of its size; some nicked, running behind
          { size: L, start: 1, end: L, apparent: Math.round(L * 0.62), mass: L, description: "Uncut, supercoiled" },
          { size: L, start: 1, end: L, apparent: Math.round(L * 1.7), mass: L * 0.3, description: "Uncut, nicked" },
        ]
      : [{ size: L, start: 1, end: L, description: "Uncut" }]
  const out: Fragment[] = []
  if (circular) {
    cuts.forEach((c, i) => {
      const next = cuts[(i + 1) % cuts.length]
      const size = cuts.length === 1 ? L : (next.at - c.at + L) % L || L
      out.push({ size, start: c.at + 1, end: ((next.at - 1 + L) % L) + 1, left: c.name, right: next.name, description: `${c.name} ${fmt(c.at + 1)} to ${next.name} ${fmt(next.at)}` })
    })
  } else {
    let prev = 0
    let prevName: string | undefined
    for (const c of cuts) {
      if (c.at > prev) out.push({ size: c.at - prev, start: prev + 1, end: c.at, left: prevName, right: c.name, description: `${prevName ? `${prevName} ${fmt(prev + 1)}` : "Start"} to ${c.name} ${fmt(c.at)}` })
      prev = c.at
      prevName = c.name
    }
    if (L > prev) out.push({ size: L - prev, start: prev + 1, end: L, left: prevName, description: `${prevName} ${fmt(prev + 1)} to the end` })
  }
  return out.sort((a, b) => b.size - a.size)
}

// the range each agarose percentage resolves well, bp
const RANGES: [number, number, number][] = [
  [0.5, 1000, 30000],
  [0.7, 800, 12000],
  [1, 500, 10000],
  [1.2, 400, 7000],
  [1.5, 200, 4000],
  [2, 100, 2500],
  [3, 40, 1000],
]

/** How far down a band runs, 0 (the well) to 1 (the end), by the log of its size; over 1 when it has run off. */
export function migration(size: number, percent = 1) {
  const r = RANGES.reduce((a, b) => (Math.abs(b[0] - percent) < Math.abs(a[0] - percent) ? b : a))
  const t = (Math.log10(r[2]) - Math.log10(Math.max(1, size))) / (Math.log10(r[2]) - Math.log10(r[1]))
  // inside the range: linear in log size; outside, crowding toward the well or the end
  if (t < 0) return 0.08 * Math.exp(t * 3)
  // far below the range, it has run off the end: past 1
  if (t > 1.8) return 1.1
  if (t > 1) return 0.9 + 0.08 * (1 - Math.exp(-(t - 1) * 3))
  return 0.08 + t * 0.82
}

const fmt = (n: number) => n.toLocaleString("en-US")
const fmtSize = (n: number) => (n >= 1000 ? `${(n / 1000).toLocaleString("en-US", { maximumFractionDigits: 1 })} kb` : `${n} bp`)

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

type GelProps = Omit<React.ComponentProps<"div">, "children"> & {
  lanes: GelLane[]
  /** Agarose, percent. Default 1. */
  percent?: number
  /** Gel height in px. Default 320. */
  height?: number
  /** "auto" (default): a UV-lit gel in dark mode, a printed scan in light. */
  appearance?: "auto" | "uv" | "scan"
  /** Ladder sizes along the left. Default true. */
  sizes?: boolean
  selectable?: boolean
  onActiveChange?: (focus: GelFocus) => void
}

function Gel({
  lanes,
  percent = 1,
  height = 320,
  appearance = "auto",
  sizes = true,
  selectable = false,
  onActiveChange,
  className,
  "aria-label": ariaLabel,
  ...props
}: GelProps) {
  const [ref, width] = useWidth()
  const rows = React.useMemo(
    () =>
      lanes.map((l) => {
        if (l.ladder) {
          const L = LADDERS[l.ladder]
          return L.sizes.map((s): GelBand => ({ size: s, mass: s === L.bright ? 2.4 : 1, label: fmtSize(s), description: `${L.name}, ${fmtSize(s)}` }))
        }
        return [...(l.bands ?? [])].sort((a, b) => (b.apparent ?? b.size) - (a.apparent ?? a.size))
      }),
    [lanes]
  )
  // brightness: mass against the lane's own range, on a log scale so faint bands still show
  const masses = rows.map((r, i) => r.map((b) => (lanes[i].ladder ? (b.mass ?? 1) : (b.mass ?? b.size))))
  const ladderLane = lanes.findIndex((l) => l.ladder)
  const gutter = sizes && ladderLane >= 0 ? 48 : 8
  const top = 32
  const W = Math.max(width, 1)
  const laneW = Math.min(64, (W - gutter - 12) / Math.max(1, lanes.length))
  const slabW = laneW * lanes.length + 12
  const slabX = gutter + Math.max(0, (W - gutter - slabW) / 2) * 0
  const laneX = (i: number) => slabX + 6 + i * laneW + laneW / 2
  const y = (size: number) => top + 14 + migration(size, percent) * (height - 22)
  const yb = (b: GelBand) => y(b.apparent ?? b.size)
  const H = top + height + 6

  // ---- focus
  const flat = React.useMemo(() => rows.flatMap((r, lane) => r.map((_, band) => ({ lane, band }))), [rows])
  const [hover, setHover] = React.useState<{ lane: number; band: number } | null>(null)
  const [cursor, setCursor] = React.useState(0)
  const [focused, setFocused] = React.useState(false)
  const active = hover ?? (focused && selectable ? (flat[cursor] ?? null) : null)
  const activeBand = active ? rows[active.lane]?.[active.band] : null
  const cb = React.useRef(onActiveChange)
  cb.current = onActiveChange
  const k = active ? `${active.lane}-${active.band}` : ""
  React.useEffect(() => cb.current?.(active && activeBand ? { ...active, data: activeBand } : null), [k]) // eslint-disable-line react-hooks/exhaustive-deps

  const describe = (a: { lane: number; band: number } | null) => {
    if (!a) return ""
    const b = rows[a.lane][a.band]
    return `${lanes[a.lane].label}, ${b.apparent ? `uncut ${fmtSize(b.size)}` : fmtSize(b.size)}${b.description && !lanes[a.lane].ladder ? `, ${b.description}` : ""}`
  }
  const onKeyDown = (e: React.KeyboardEvent) => {
    const cur = flat[cursor]
    if (!cur) return
    let next = cursor
    if (e.key === "ArrowDown") next = Math.min(flat.length - 1, cursor + 1)
    else if (e.key === "ArrowUp") next = Math.max(0, cursor - 1)
    else if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      const d = e.key === "ArrowRight" ? 1 : -1
      let lane = cur.lane + d
      while (lane >= 0 && lane < lanes.length && !rows[lane].length) lane += d
      if (lane < 0 || lane >= lanes.length) return e.preventDefault()
      // the band nearest in height on the next lane
      const yy = yb(rows[cur.lane][cur.band])
      const best = rows[lane].reduce((a, b, i) => (Math.abs(yb(b) - yy) < Math.abs(yb(rows[lane][a]) - yy) ? i : a), 0)
      next = flat.findIndex((f) => f.lane === lane && f.band === best)
    } else if (e.key === "Home") next = 0
    else if (e.key === "End") next = flat.length - 1
    else return
    e.preventDefault()
    setCursor(next)
  }

  const label =
    ariaLabel ??
    `Agarose gel, ${percent}%: ${lanes.map((l, i) => `${l.label}: ${l.ladder ? LADDERS[l.ladder].name : rows[i].map((b) => fmtSize(b.size)).join(", ") || "no bands"}`).join("; ")}`

  const uv = appearance === "uv"
  const scan = appearance === "scan"
  // the gel and its bands: neutral, by appearance and theme
  const slabCls = uv ? "fill-[oklch(0.2_0_0)]" : scan ? "fill-[oklch(0.95_0.004_90)]" : "fill-[oklch(0.95_0.004_90)] dark:fill-[oklch(0.19_0_0)]"
  const bandCls = uv ? "fill-[oklch(0.97_0.02_100)]" : scan ? "fill-[oklch(0.2_0_0)]" : "fill-[oklch(0.2_0_0)] dark:fill-[oklch(0.97_0.02_100)]"
  const wellCls = uv ? "fill-[oklch(0.3_0_0)]" : scan ? "fill-[oklch(0.86_0_0)]" : "fill-[oklch(0.86_0_0)] dark:fill-[oklch(0.3_0_0)]"
  const filterId = React.useId().replace(/:/g, "")

  return (
    <div data-slot="gel" className={cn("grid w-full min-w-0 gap-3", className)} {...props}>
      <div
        ref={ref}
        className={cn("relative w-full select-none outline-none", selectable && "rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring")}
        style={{ height: H }}
        onPointerMove={(e) => {
          const r = ref.current!.getBoundingClientRect()
          const px = e.clientX - r.left
          const py = e.clientY - r.top
          const lane = Math.floor((px - slabX - 6) / laneW)
          if (lane < 0 || lane >= lanes.length) return setHover(null)
          let best: number | null = null
          let d = 9
          rows[lane].forEach((b, i) => {
            const dd = Math.abs(yb(b) - py)
            if (dd < d) {
              d = dd
              best = i
            }
          })
          setHover(best == null ? null : { lane, band: best })
        }}
        onPointerLeave={() => setHover(null)}
        {...(selectable
          ? {
              role: "slider",
              tabIndex: 0,
              "aria-label": label,
              "aria-valuemin": 1,
              "aria-valuemax": flat.length,
              "aria-valuenow": cursor + 1,
              "aria-valuetext": describe(flat[cursor] ?? null),
              onKeyDown,
              onFocus: () => setFocused(true),
              onBlur: () => setFocused(false),
            }
          : { role: "img", "aria-label": label })}
      >
        {width > 0 && (
          <svg width={W} height={H} aria-hidden className="block overflow-visible">
            <defs>
              <filter id={filterId} x="-10%" y="-200%" width="120%" height="500%">
                <feGaussianBlur stdDeviation="0.9 0.7" />
              </filter>
            </defs>
            {/* lane labels */}
            {lanes.map((l, i) => {
              // long labels break at " + " onto two lines, then shorten
              const fit = (t: string) => (t.length * 6 > laneW + 6 ? `${t.slice(0, Math.max(3, Math.floor(laneW / 6.2)))}…` : t)
              const parts = l.label.length * 6 > laneW + 6 && l.label.includes(" + ") ? [l.label.slice(0, l.label.indexOf(" + ")), l.label.slice(l.label.indexOf(" + ") + 1)] : [l.label]
              const lit = active?.lane === i
              const w = Math.min(laneW - 4, Math.max(...parts.map((p) => fit(p).length)) * 6.2 + 14)
              const h = parts.length > 1 ? 28 : 18
              return (
                <g key={i}>
                  {/* the lane in focus lights its label as a pill, as table headers do */}
                  <rect
                    x={laneX(i) - w / 2}
                    y={(parts.length > 1 ? 13 : 13) - h / 2 + (parts.length > 1 ? 1 : 0)}
                    width={w}
                    height={h}
                    rx={h > 20 ? 10 : h / 2}
                    className={cn("transition-opacity duration-200", lit ? "fill-foreground opacity-100" : "fill-foreground opacity-0")}
                  />
                  <text x={laneX(i)} y={parts.length > 1 ? 10 : 17} textAnchor="middle" className={cn("text-[0.6875rem] transition-colors duration-200", lit ? "fill-background font-semibold" : "fill-muted-foreground")}>
                    <title>{l.label}</title>
                    {parts.map((p, k) => (
                      <tspan key={k} x={laneX(i)} dy={k ? 12 : 0}>
                        {fit(p)}
                      </tspan>
                    ))}
                  </text>
                </g>
              )
            })}
            {/* slab and wells */}
            <rect x={slabX} y={top} width={slabW} height={height} rx={14} className={slabCls} />
            {lanes.map((_, i) => (
              <rect key={i} x={laneX(i) - laneW * 0.36} y={top + 8} width={laneW * 0.72} height={4} rx={2} className={wellCls} />
            ))}
            {/* ladder sizes */}
            {sizes &&
              ladderLane >= 0 &&
              rows[ladderLane].map((b) => (
                <text key={b.size} x={gutter - 8} y={y(b.size) + 3.5} textAnchor="end" className="fill-muted-foreground text-[0.625rem] tabular-nums">
                  {b.label ?? fmtSize(b.size)}
                </text>
              ))}
            {/* bands */}
            {rows.map((r, lane) => {
              const ms = masses[lane]
              const max = Math.max(...ms, 1)
              return r.map((b, i) => {
                if (migration(b.apparent ?? b.size, percent) > 1) return null
                const rel = ms[i] / max
                const opacity = 0.35 + 0.65 * Math.sqrt(rel)
                const h = 3 + 3 * Math.sqrt(rel)
                const isActive = active?.lane === lane && active.band === i
                return (
                  <g key={`${lane}-${i}`}>
                    <rect
                      x={laneX(lane) - laneW * 0.34}
                      y={yb(b) - h / 2}
                      width={laneW * 0.68}
                      height={h}
                      rx={h / 2}
                      className={bandCls}
                      opacity={opacity}
                      filter={`url(#${filterId})`}
                    />
                    {isActive && (
                      <rect
                        x={laneX(lane) - laneW * 0.42}
                        y={yb(b) - h / 2 - 4}
                        width={laneW * 0.84}
                        height={h + 8}
                        rx={(h + 8) / 2}
                        fill="none"
                        className="stroke-ring"
                        strokeWidth={1.5}
                      />
                    )}
                  </g>
                )
              })
            })}
          </svg>
        )}

        {active && activeBand && hover && (
          <div
            aria-hidden
            className="pointer-events-none absolute z-10 grid max-w-56 -translate-y-1/2 gap-0.5 rounded-xl bg-inverse-surface px-3 py-2 text-inverse-foreground shadow-e2"
            style={{
              left: laneX(active.lane) + laneW * 0.5 + 8 + 200 > W ? undefined : laneX(active.lane) + laneW * 0.5 + 8,
              right: laneX(active.lane) + laneW * 0.5 + 8 + 200 > W ? W - laneX(active.lane) + laneW * 0.5 + 8 : undefined,
              top: yb(activeBand),
            }}
          >
            <span className="type-label-lg font-semibold tabular-nums">{activeBand.size >= 1000 ? `${fmt(activeBand.size)} bp` : `${activeBand.size} bp`}</span>
            <span className="type-label-sm opacity-80">{lanes[active.lane].label}</span>
            {activeBand.description && !lanes[active.lane].ladder && <span className="type-label-sm tabular-nums opacity-80">{activeBand.description}</span>}
          </div>
        )}
      </div>
    </div>
  )
}

export { Gel, type GelProps }
