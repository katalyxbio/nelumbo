"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Nelumbo Chromosome Ideogram
 *
 * A chromosome as its Giemsa bands: dark and light stripes along two arms
 * pinched at the centromere, rounded at the telomeres. Grayscale like the
 * stain, so color stays free for what you mark on it.
 *
 *   const bands = parseCytobands(cytoBandTxt)                 // UCSC's cytoBand.txt
 *   <ChromosomeIdeogram bands={bands} chromosome="chr17" markers={[{ start: 7668421, label: "TP53" }]} />
 *   <ChromosomeIdeogram bands={bands} chromosome="chr17" region={{ start: 7661779, end: 7687538 }} />   // zoom lines down to a GeneModel
 *   <Karyotype bands={bands} markers={genes} onChromosomeChange={setChrom} />
 *
 * - `region` frames a stretch and draws zoom lines from it to the bottom
 *   corners, so a GeneModel or Construct Map underneath reads as a close-up.
 * - Band names sit under the bands that have room; the hover card and the
 *   keyboard (with `selectable`) name every band and its extent.
 * - Karyotype lays the whole genome out side by side at one scale, with
 *   markers on each chromosome; pick one to see it close.
 */

export type Cytoband = {
  chrom: string
  start: number
  end: number
  /** "p13.1" */
  name: string
  /** gneg, gpos25, gpos50, gpos75, gpos100, acen, gvar, stalk */
  stain: string
}

export type IdeogramMarker = {
  /** Karyotype only: which chromosome. */
  chrom?: string
  start: number
  end?: number
  label?: string
  /** A palette color. Default red. */
  color?: "blue" | "cyan" | "green" | "amber" | "orange" | "red" | "pink" | "purple" | "brand"
  description?: string
}

export type IdeogramFocus = { band: Cytoband } | null

/** UCSC's cytoBand.txt (tab-separated: chrom, start, end, name, stain) as bands. Starts stay 0-based, as in the file. */
export function parseCytobands(text: string): Cytoband[] {
  return text
    .trim()
    .split(/\r?\n/)
    .map((l) => l.split("\t"))
    .filter((c) => c.length >= 5 && !c[0].startsWith("#"))
    .map(([chrom, start, end, name, stain]) => ({ chrom, start: Number(start), end: Number(end), name, stain }))
}

/** "chr17" and 7668421 → "17p13.1". */
export function bandAt(bands: Cytoband[], chrom: string, position: number) {
  const b = bands.find((b) => b.chrom === chrom && position > b.start && position <= b.end)
  return b ? `${chrom.replace(/^chr/, "")}${b.name}` : null
}

const STAIN: Record<string, { cls: string; name: string }> = {
  gneg: { cls: "fill-foreground/[0.04]", name: "Light band" },
  gpos25: { cls: "fill-foreground/[0.24]", name: "Lightly stained" },
  gpos33: { cls: "fill-foreground/[0.3]", name: "Lightly stained" },
  gpos50: { cls: "fill-foreground/[0.44]", name: "Stained" },
  gpos66: { cls: "fill-foreground/[0.56]", name: "Stained" },
  gpos75: { cls: "fill-foreground/[0.64]", name: "Darkly stained" },
  gpos100: { cls: "fill-foreground/[0.84]", name: "Darkest" },
  acen: { cls: "fill-foreground/[0.36]", name: "Centromere" },
  gvar: { cls: "fill-foreground/[0.3]", name: "Variable heterochromatin" },
  stalk: { cls: "fill-foreground/[0.2]", name: "Stalk" },
}
const stainOf = (s: string) => STAIN[s] ?? STAIN.gneg

const fillOf = (c: IdeogramMarker["color"] = "red") => `var(--${c})`
const mb = (bp: number) => {
  const v = bp / 1e6
  return `${v >= 10 ? v.toFixed(1).replace(/\.0$/, "") : v.toFixed(2).replace(/0$/, "").replace(/\.0$/, "")} Mb`
}

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

/**
 * The chromosome's shape, along one axis from a to b (px), across from c0 to
 * c1: the arms as capsules, the centromere as a pinch, stalks narrow.
 * Returns the pieces to clip bands to, and the centromere's two triangles.
 */
function shapeOf(bands: Cytoband[], at: (bp: number) => number, thick: number) {
  const arms: { a: number; b: number; narrow?: boolean }[] = []
  const acen = bands.filter((b) => b.stain === "acen")
  let run: { a: number; b: number } | null = null
  for (const b of bands) {
    if (b.stain === "acen") {
      if (run) arms.push(run)
      run = null
      continue
    }
    if (b.stain === "stalk") {
      if (run) arms.push(run)
      run = null
      arms.push({ a: at(b.start), b: at(b.end), narrow: true })
      continue
    }
    if (run) run.b = at(b.end)
    else run = { a: at(b.start), b: at(b.end) }
  }
  if (run) arms.push(run)
  const cen = acen.length ? { a: at(acen[0].start), m: at(acen[0].end), b: at(acen[acen.length - 1].end) } : null
  return { arms, cen, thick }
}

type ChromosomeIdeogramProps = Omit<React.ComponentProps<"div">, "children"> & {
  /** Every band, or just this chromosome's. */
  bands: Cytoband[]
  /** "chr17". */
  chromosome: string
  markers?: IdeogramMarker[]
  /** A stretch to frame, with zoom lines to the bottom corners. */
  region?: { start: number; end: number }
  /** Zoom lines from the region. Default true. */
  connector?: boolean
  /** Band names under the bands with room. Default true. */
  labels?: boolean
  /** Megabase ticks. Default true. */
  ruler?: boolean
  size?: "sm" | "default"
  selectable?: boolean
  onActiveChange?: (focus: IdeogramFocus) => void
}

function ChromosomeIdeogram({
  bands: allBands,
  chromosome,
  markers = [],
  region,
  connector = true,
  labels = true,
  ruler = true,
  size = "default",
  selectable = false,
  onActiveChange,
  className,
  "aria-label": ariaLabel,
  ...props
}: ChromosomeIdeogramProps) {
  const bands = React.useMemo(() => allBands.filter((b) => b.chrom === chromosome).sort((a, b) => a.start - b.start), [allBands, chromosome])
  const length = bands.length ? bands[bands.length - 1].end : 1
  const [ref, width] = useWidth()
  const pad = 10
  const inner = Math.max(width - pad * 2, 1)
  const x = React.useCallback((bp: number) => pad + (bp / length) * inner, [inner, length])
  const T = size === "sm" ? 14 : 22

  // markers on levels, so labels do not collide
  const placed = React.useMemo(() => {
    const levels: number[] = []
    return markers
      .filter((m) => !m.chrom || m.chrom === chromosome)
      .map((m) => ({ ...m, px: x(((m.start + (m.end ?? m.start)) / 2) | 0) }))
      .sort((a, b) => a.px - b.px)
      .map((m) => {
        const w = m.label ? m.label.length * 6.6 + 14 : 10
        let level = levels.findIndex((e) => m.px - w / 2 > e + 4)
        if (level < 0) level = levels.length
        levels[level] = m.px + w / 2
        return { ...m, w, level }
      })
  }, [markers, chromosome, x])
  const levels = placed.length ? Math.max(...placed.map((p) => p.level)) + 1 : 0
  const markTop = levels ? 6 + levels * 22 + 6 : 4
  const top = markTop
  const mid = top + T / 2
  const labelY = top + T + 14
  const rulerY = labels ? labelY + 16 : top + T + 14
  const zoomH = region && connector ? 26 : 0
  const H = (ruler ? rulerY + 6 : labels ? labelY + 6 : top + T + 6) + zoomH

  const shape = React.useMemo(() => shapeOf(bands, x, T), [bands, x, T])
  const clipId = React.useId().replace(/:/g, "")
  const hatchId = `${clipId}h`

  // ---- focus
  const [hover, setHover] = React.useState<number | null>(null)
  const [cursor, setCursor] = React.useState(0)
  const [focused, setFocused] = React.useState(false)
  const active = hover ?? (focused && selectable ? cursor : null)
  const cb = React.useRef(onActiveChange)
  cb.current = onActiveChange
  React.useEffect(() => cb.current?.(active != null && bands[active] ? { band: bands[active] } : null), [active, bands])
  const chr = chromosome.replace(/^chr/, "")
  const describe = (i: number) => {
    const b = bands[i]
    return b ? `${chr}${b.name}, ${mb(b.start)} to ${mb(b.end)}, ${stainOf(b.stain).name.toLowerCase()}` : ""
  }
  const onKeyDown = (e: React.KeyboardEvent) => {
    let n = cursor
    if (e.key === "ArrowRight" || e.key === "ArrowDown") n++
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") n--
    else if (e.key === "Home") n = 0
    else if (e.key === "End") n = bands.length - 1
    else return
    e.preventDefault()
    setCursor(Math.max(0, Math.min(bands.length - 1, n)))
  }

  const ticks = React.useMemo(() => {
    if (!ruler || !width) return []
    const raw = length / Math.max(2, Math.floor(inner / 80))
    const p = 10 ** Math.floor(Math.log10(raw))
    const step = [1, 2, 5, 10].map((m) => m * p).find((s) => s >= raw) ?? p * 10
    const out: number[] = []
    for (let t = 0; t <= length; t += step) out.push(t)
    return out
  }, [ruler, width, length, inner])

  const label =
    ariaLabel ??
    `Chromosome ${chr} ideogram, ${mb(length)}, ${bands.length} bands${placed.length ? `. Marked: ${placed.map((m) => `${m.label ?? ""} at ${bandAt(bands, chromosome, m.start) ?? mb(m.start)}`).join(", ")}` : ""}${
      region ? `. Region ${mb(region.start)} to ${mb(region.end)}` : ""
    }`

  const rx0 = region ? x(region.start) : 0
  const rx1 = region ? Math.max(x(region.end), rx0 + 4) : 0
  const rxa = region ? (rx0 + rx1) / 2 - Math.max(2, (rx1 - rx0) / 2) : 0
  const rxb = region ? (rx0 + rx1) / 2 + Math.max(2, (rx1 - rx0) / 2) : 0

  return (
    <div data-slot="chromosome-ideogram" className={cn("grid w-full min-w-0 gap-2", className)} {...props}>
      <div
        ref={ref}
        className={cn("relative w-full select-none outline-none", selectable && "rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring")}
        style={{ height: H }}
        onPointerMove={(e) => {
          const r = ref.current!.getBoundingClientRect()
          const bp = ((e.clientX - r.left - pad) / inner) * length
          const yy = e.clientY - r.top
          const i = bands.findIndex((b) => bp >= b.start && bp < b.end)
          setHover(i >= 0 && yy >= top - 6 && yy <= top + T + 22 ? i : null)
        }}
        onPointerLeave={() => setHover(null)}
        {...(selectable
          ? {
              role: "slider",
              tabIndex: 0,
              "aria-label": label,
              "aria-valuemin": 1,
              "aria-valuemax": bands.length,
              "aria-valuenow": cursor + 1,
              "aria-valuetext": describe(cursor),
              onKeyDown,
              onFocus: () => setFocused(true),
              onBlur: () => setFocused(false),
            }
          : { role: "img", "aria-label": label })}
      >
        {width > 0 && (
          <svg width={width} height={H} aria-hidden className="block overflow-visible">
            <defs>
              <clipPath id={clipId}>
                {shape.arms.map((a, i) => {
                  const t = a.narrow ? T * 0.4 : T
                  return <rect key={i} x={a.a} y={mid - t / 2} width={Math.max(a.b - a.a, 1)} height={t} rx={a.narrow ? 1 : Math.min(T / 2, (a.b - a.a) / 2)} />
                })}
                {shape.cen && <path d={`M${shape.cen.a},${top}L${shape.cen.m},${mid - T * 0.18}L${shape.cen.b},${top}V${top + T}L${shape.cen.m},${mid + T * 0.18}L${shape.cen.a},${top + T}Z`} />}
              </clipPath>
              <pattern id={hatchId} width={4} height={4} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <rect width={4} height={4} className="fill-foreground/[0.08]" />
                <rect width={1.6} height={4} className="fill-foreground/[0.4]" />
              </pattern>
            </defs>

            {/* bands */}
            <g clipPath={`url(#${clipId})`}>
              {bands.map((b, i) => (
                <rect
                  key={b.name + b.start}
                  x={x(b.start)}
                  y={top - 1}
                  width={Math.max(x(b.end) - x(b.start), 0.5)}
                  height={T + 2}
                  className={cn(b.stain !== "gvar" && stainOf(b.stain).cls)}
                  fill={b.stain === "gvar" ? `url(#${hatchId})` : undefined}
                  opacity={active != null && active !== i ? 0.75 : 1}
                />
              ))}
              {active != null && bands[active] && (
                <rect x={x(bands[active].start)} y={top - 1} width={Math.max(x(bands[active].end) - x(bands[active].start), 1)} height={T + 2} className="fill-foreground/25" />
              )}
            </g>
            {/* outline */}
            {shape.arms.map((a, i) => {
              const t = a.narrow ? T * 0.4 : T
              return <rect key={i} x={a.a + 0.5} y={mid - t / 2 + 0.5} width={Math.max(a.b - a.a - 1, 0.5)} height={t - 1} rx={a.narrow ? 1 : Math.min(T / 2, (a.b - a.a) / 2) - 0.5} fill="none" className="stroke-outline" strokeWidth={1} />
            })}

            {/* band names where they fit */}
            {labels &&
              bands.map((b) => {
                const w = x(b.end) - x(b.start)
                const t = `${b.name}`
                if (w < t.length * 5.6 + 4 || b.stain === "acen") return null
                return (
                  <text key={`l${b.name}${b.start}`} x={(x(b.start) + x(b.end)) / 2} y={labelY} textAnchor="middle" className="fill-muted-foreground text-[0.625rem]">
                    {t}
                  </text>
                )
              })}

            {/* ruler */}
            {ruler &&
              ticks.map((t) => (
                <text key={t} x={x(t)} y={rulerY} textAnchor={t === 0 ? "start" : x(t) > pad + inner - 20 ? "end" : "middle"} className="fill-muted-foreground text-[0.625rem] tabular-nums">
                  {t === 0 ? "0" : mb(t)}
                </text>
              ))}

            {/* region and zoom lines */}
            {region && (
              <g>
                <rect x={rxa - 2} y={top - 4} width={rxb - rxa + 4} height={T + 8} rx={4} fill="none" className="stroke-foreground" strokeWidth={1.5} />
                {connector && (
                  <path d={`M${rxa - 2},${top + T + 4}L${pad},${H - 1}M${rxb + 2},${top + T + 4}L${pad + inner},${H - 1}`} className="stroke-outline-variant" strokeWidth={1} fill="none" />
                )}
              </g>
            )}

            {/* markers */}
            {placed.map((m, i) => {
              const yHead = 6 + (levels - 1 - m.level) * 22 + 9
              return (
                <g key={`${m.label}${i}`}>
                  <title>{m.description ?? `${m.label ?? "Marker"}, ${bandAt(bands, chromosome, m.start) ?? ""} ${mb(m.start)}`}</title>
                  <line x1={m.px} x2={m.px} y1={yHead + 9} y2={top - 1} stroke={fillOf(m.color)} strokeOpacity={0.6} strokeWidth={1.5} />
                  {m.label ? (
                    <>
                      <rect x={m.px - m.w / 2} y={yHead - 9} width={m.w} height={18} rx={9} fill={fillOf(m.color)} />
                      <text x={m.px} y={yHead + 3.5} textAnchor="middle" fill={`var(--${m.color ?? "red"}-foreground)`} className="text-[0.6875rem] font-semibold">
                        {m.label}
                      </text>
                    </>
                  ) : (
                    <circle cx={m.px} cy={yHead} r={4} fill={fillOf(m.color)} />
                  )}
                </g>
              )
            })}
          </svg>
        )}

        {active != null && hover != null && bands[active] && (
          <div
            aria-hidden
            className="pointer-events-none absolute z-10 grid -translate-x-1/2 -translate-y-full gap-0.5 whitespace-nowrap rounded-md bg-inverse-surface px-3 py-2 text-inverse-foreground shadow-e2"
            style={{ left: Math.max(70, Math.min(width - 70, (x(bands[active].start) + x(bands[active].end)) / 2)), top: top - 6 }}
          >
            <span className="type-label-lg font-semibold">
              {chr}
              {bands[active].name}
            </span>
            <span className="type-label-sm tabular-nums opacity-80">
              {mb(bands[active].start)} to {mb(bands[active].end)}
            </span>
            <span className="type-label-sm opacity-80">{stainOf(bands[active].stain).name}</span>
          </div>
        )}
      </div>
    </div>
  )
}

// ---- karyotype

const ORDER = [...Array.from({ length: 22 }, (_, i) => `chr${i + 1}`), "chrX", "chrY"]

type KaryotypeProps = Omit<React.ComponentProps<"div">, "children"> & {
  bands: Cytoband[]
  /** Which to show, in order. Default chr1 to chr22, X and Y. */
  chromosomes?: string[]
  /** Each with its chrom. */
  markers?: IdeogramMarker[]
  /** Height of the longest chromosome, px. Default 240. */
  height?: number
  /** The chosen chromosome: arrows move between them. */
  chromosome?: string
  onChromosomeChange?: (chrom: string) => void
}

/** The genome at one scale: every chromosome upright, side by side, with markers. */
function Karyotype({
  bands,
  chromosomes = ORDER,
  markers = [],
  height = 240,
  chromosome,
  onChromosomeChange,
  className,
  "aria-label": ariaLabel,
  ...props
}: KaryotypeProps) {
  const [ref, width] = useWidth()
  const list = chromosomes.filter((c) => bands.some((b) => b.chrom === c))
  const byChrom = React.useMemo(() => {
    const m = new Map<string, Cytoband[]>()
    for (const c of list) m.set(c, bands.filter((b) => b.chrom === c).sort((a, b) => a.start - b.start))
    return m
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bands, list.join()])
  const longest = Math.max(...list.map((c) => byChrom.get(c)!.at(-1)!.end))
  const col = width / Math.max(1, list.length)
  const T = Math.min(14, Math.max(5, col * 0.36))
  const top = 6
  const H = top + height + 24
  const y = (bp: number) => top + (bp / longest) * height
  const clipBase = React.useId().replace(/:/g, "")
  const groups = React.useRef<(SVGGElement | null)[]>([])

  const pick = (c: string) => onChromosomeChange?.(c)
  const onKeyDown = (e: React.KeyboardEvent, i: number) => {
    let n = i
    if (e.key === "ArrowRight" || e.key === "ArrowDown") n = Math.min(list.length - 1, i + 1)
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") n = Math.max(0, i - 1)
    else if (e.key === "Home") n = 0
    else if (e.key === "End") n = list.length - 1
    else return
    e.preventDefault()
    pick(list[n])
    groups.current[n]?.focus()
  }

  return (
    <div data-slot="karyotype" className={cn("w-full min-w-0", className)} {...props}>
      <div ref={ref} className="w-full" style={{ height: H }}>
        {width > 0 && (
          <svg
            width={width}
            height={H}
            className="block overflow-visible"
            role={onChromosomeChange ? "radiogroup" : "img"}
            aria-label={ariaLabel ?? `Karyotype, ${list.length} chromosomes${markers.length ? `, ${markers.length} markers` : ""}`}
          >
            {list.map((c, i) => {
              const bs = byChrom.get(c)!
              const cx = col * i + col / 2
              const shape = shapeOf(bs, y, T)
              const id = `${clipBase}${i}`
              const chosen = chromosome === c
              const ms = markers.filter((m) => m.chrom === c)
              const name = c.replace(/^chr/, "")
              return (
                <g
                  key={c}
                  ref={(el) => {
                    groups.current[i] = el
                  }}
                  {...(onChromosomeChange
                    ? {
                        role: "radio",
                        "aria-checked": chosen,
                        "aria-label": `Chromosome ${name}${ms.length ? `, ${ms.map((m) => m.label).join(", ")}` : ""}`,
                        tabIndex: chosen || (!chromosome && i === 0) ? 0 : -1,
                        onClick: () => pick(c),
                        onKeyDown: (e: React.KeyboardEvent) => onKeyDown(e, i),
                      }
                    : {})}
                  className={cn(onChromosomeChange && "cursor-pointer outline-none [&:focus-visible>rect:first-child]:stroke-ring [&:focus-visible>rect:first-child]:stroke-2")}
                >
                  <rect x={cx - col / 2 + 1} y={0} width={col - 2} height={H} rx={10} className={cn(chosen ? "fill-surface-container-highest" : "fill-transparent", "stroke-transparent")} />
                  <defs>
                    <clipPath id={id}>
                      {shape.arms.map((a, k) => {
                        const t = a.narrow ? T * 0.4 : T
                        return <rect key={k} x={cx - t / 2} y={a.a} width={t} height={Math.max(a.b - a.a, 1)} rx={a.narrow ? 1 : Math.min(T / 2, (a.b - a.a) / 2)} />
                      })}
                      {shape.cen && (
                        <path d={`M${cx - T / 2},${shape.cen.a}L${cx - T * 0.18},${shape.cen.m}L${cx - T / 2},${shape.cen.b}H${cx + T / 2}L${cx + T * 0.18},${shape.cen.m}L${cx + T / 2},${shape.cen.a}Z`} />
                      )}
                    </clipPath>
                  </defs>
                  <g clipPath={`url(#${id})`} aria-hidden>
                    {bs.map((b) => (
                      <rect key={b.name + b.start} x={cx - T / 2 - 1} y={y(b.start)} width={T + 2} height={Math.max(y(b.end) - y(b.start), 0.4)} className={stainOf(b.stain).cls} />
                    ))}
                  </g>
                  {shape.arms.map((a, k) => {
                    const t = a.narrow ? T * 0.4 : T
                    return <rect key={k} aria-hidden x={cx - t / 2 + 0.5} y={a.a + 0.5} width={t - 1} height={Math.max(a.b - a.a - 1, 0.5)} rx={a.narrow ? 1 : Math.min(T / 2, (a.b - a.a) / 2) - 0.5} fill="none" className={chosen ? "stroke-foreground" : "stroke-outline"} strokeWidth={1} />
                  })}
                  {ms.map((m, k) => {
                    const my = y((m.start + (m.end ?? m.start)) / 2)
                    return (
                      <g key={k} aria-hidden>
                        <title>{m.description ?? `${m.label ?? "Marker"}, ${bandAt(bs, c, m.start) ?? ""}`}</title>
                        <path d={`M${cx + T / 2 + 1},${my}l5,-4v8z`} fill={fillOf(m.color)} />
                        {m.label && col >= 72 && (
                          <text x={cx + T / 2 + 8} y={my + 3.5} fill={fillOf(m.color)} className="text-[0.5625rem] font-semibold">
                            {m.label}
                          </text>
                        )}
                      </g>
                    )
                  })}
                  <text aria-hidden x={cx} y={H - 6} textAnchor="middle" className={cn("tabular-nums", col < 22 ? "text-[0.5625rem]" : "text-[0.6875rem]", chosen ? "fill-foreground font-semibold" : "fill-muted-foreground")}>
                    {name}
                  </text>
                </g>
              )
            })}
          </svg>
        )}
      </div>
    </div>
  )
}

export { ChromosomeIdeogram, Karyotype, type ChromosomeIdeogramProps, type KaryotypeProps }
