"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Nelumbo Protein Domains
 *
 * A protein as a thin backbone with its domains as tall rounded blocks, a
 * ruler in residues, and variants as lollipops with pill labels. The same
 * domains can be laid on a GeneModel, mapped through its coding sequence.
 *
 *   <ProteinDomains length={393} domains={[{ start: 102, end: 292, name: "DNA-binding" }]}
 *     variants={[{ position: 175, label: "R175H" }]} />
 *
 * Positions are residues, 1-based and inclusive, as UniProt gives them.
 */

export type DomainColor = "blue" | "cyan" | "green" | "amber" | "orange" | "red" | "pink" | "purple" | "brand" | "neutral"

export type ProteinDomain = {
  start: number
  end: number
  name: string
  /** Default: the next color in the palette order. */
  color?: DomainColor
  /** Read on hover. */
  description?: string
}

export type ProteinVariant = {
  /** Residue position. */
  position: number
  label?: string
  /** Default red. */
  color?: DomainColor
  description?: string
}

const ORDER: DomainColor[] = ["blue", "amber", "green", "purple", "pink", "cyan", "orange", "red"]

/** Each domain's color: its own, or the next in the palette order. */
export function domainColors(domains: ProteinDomain[]) {
  return domains.map((d, i) => d.color ?? ORDER[i % ORDER.length])
}

export const domainFill = (c: DomainColor) => (c === "neutral" ? "var(--muted-foreground)" : `var(--${c})`)
export const domainInk = (c: DomainColor) => (c === "neutral" ? "var(--background)" : `var(--${c}-foreground)`)

/** Overlapping domains on separate lanes, first come first placed. */
export function domainLanes(domains: ProteinDomain[]) {
  const ends: number[] = []
  return domains.map((d) => {
    let lane = ends.findIndex((e) => d.start > e)
    if (lane < 0) lane = ends.length
    ends[lane] = d.end
    return lane
  })
}

/** Lollipop labels on levels so none collide: px is the stem's x. */
export function stackLabels<T extends { px: number; label?: string }>(items: T[], charWidth = 6.4) {
  const levels: number[] = []
  return [...items]
    .sort((a, b) => a.px - b.px)
    .map((p) => {
      const w = p.label ? p.label.length * charWidth + 14 : 12
      let level = levels.findIndex((end) => p.px - w / 2 > end + 4)
      if (level < 0) level = levels.length
      levels[level] = p.px + w / 2
      return { ...p, w, level }
    })
}

/** A pill on a stem: drawn by both the gene model and the protein track. */
export function Lollipop({
  x,
  top,
  bottom,
  label,
  color = "red",
  title,
  w,
  stem = true,
  head = true,
}: {
  x: number
  /** The head's center. */
  top: number
  /** Where the stem lands. */
  bottom: number
  label?: string
  color?: DomainColor
  title?: string
  w?: number
  stem?: boolean
  head?: boolean
}) {
  const width = w ?? (label ? label.length * 6.4 + 14 : 12)
  return (
    <g>
      {title && <title>{title}</title>}
      {stem && <line x1={x} x2={x} y1={top} y2={bottom} stroke={domainFill(color)} strokeOpacity={0.55} strokeWidth={1.5} />}
      {head &&
        (label ? (
          <>
            <rect x={x - width / 2} y={top - 9} width={width} height={18} rx={9} fill={domainFill(color)} />
            <text x={x} y={top + 3.5} textAnchor="middle" fill={domainInk(color)} className="font-mono text-[0.6875rem] font-semibold">
              {label}
            </text>
          </>
        ) : (
          <circle cx={x} cy={top} r={5} fill={domainFill(color)} stroke="var(--background)" strokeWidth={2} />
        ))}
    </g>
  )
}

/** The domains as chips: swatch, name, residues. */
export function DomainLegend({ domains, className }: { domains: ProteinDomain[]; className?: string }) {
  const colors = domainColors(domains)
  return (
    <ul data-slot="domain-legend" className={cn("flex flex-wrap gap-x-5 gap-y-2", className)}>
      {domains.map((d, i) => (
        <li key={`${d.name}-${d.start}`} className="flex items-center gap-2 type-label-md">
          <span aria-hidden className="h-2.5 w-4 shrink-0 rounded-full" style={{ background: domainFill(colors[i]) }} />
          <span className="text-foreground">{d.name}</span>
          <span className="text-muted-foreground tabular-nums">
            {d.start}–{d.end}
          </span>
        </li>
      ))}
    </ul>
  )
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

const SIZES = {
  sm: { backbone: 6, domain: 14, lane: 18 },
  default: { backbone: 8, domain: 22, lane: 26 },
}

/** A stretch of secondary structure, in residues. */
export type StructureElement = { start: number; end: number; type: "helix" | "strand" | "turn" }

/**
 * Secondary structure from a DSSP string, one letter a residue: H, G and I
 * are helices, E and B strands, T and S turns, anything else coil.
 */
export function structureFromDssp(dssp: string, start = 1): StructureElement[] {
  const kind = (c: string) => ("HGI".includes(c) ? "helix" : "EB".includes(c) ? "strand" : "TS".includes(c) ? "turn" : null)
  const out: StructureElement[] = []
  for (let i = 0; i < dssp.length; i++) {
    const k = kind(dssp[i])
    const last = out[out.length - 1]
    if (!k) continue
    if (last && last.type === k && last.end === start + i - 1) last.end = start + i
    else out.push({ start: start + i, end: start + i, type: k })
  }
  return out
}

/** AlphaFold's confidence bands for pLDDT, highest first. */
export const PLDDT_BANDS = [
  { min: 90, name: "Very high", color: "blue" as DomainColor },
  { min: 70, name: "Confident", color: "cyan" as DomainColor },
  { min: 50, name: "Low", color: "amber" as DomainColor },
  { min: 0, name: "Very low", color: "orange" as DomainColor },
]

/** The band a pLDDT score falls in. */
export const plddtBand = (v: number) => PLDDT_BANDS.find((b) => v >= b.min) ?? PLDDT_BANDS[3]

// structure is told by shape, so it keeps to the neutral ink and leaves color to domains and confidence
const STRUCTURE_INK = "color-mix(in oklab, var(--foreground) 72%, transparent)"

type ProteinDomainsProps = Omit<React.ComponentProps<"div">, "children"> & {
  /** Residues in the protein. */
  length: number
  domains: ProteinDomain[]
  variants?: ProteinVariant[]
  /** Secondary structure: helices as coils, strands as arrows, the rest a thin line. */
  structure?: StructureElement[]
  /** Per-residue confidence, 0 to 100, as AlphaFold's pLDDT: bars colored by AlphaFold's bands. */
  confidence?: number[]
  /** The track's name. Default "AlphaFold confidence (pLDDT)". */
  confidenceLabel?: string
  /** The residues, for the hover card. */
  sequence?: string
  /** Residue numbers along the bottom. Default true. */
  ruler?: boolean
  /** Names inside the blocks where they fit, a legend underneath. Default "both". */
  labels?: "inside" | "legend" | "both" | "none"
  size?: keyof typeof SIZES
  /** A keyboard stop: arrows move a residue (Shift, ten), Home and End jump. */
  selectable?: boolean
  /** The residue under the pointer or the keyboard cursor. */
  onActiveChange?: (residue: number | null) => void
}

/** A protein's domains along its length, with variants as lollipops, and structure and confidence tracks beneath. */
function ProteinDomains({
  length,
  domains,
  variants,
  structure,
  confidence,
  confidenceLabel = "AlphaFold confidence (pLDDT)",
  sequence,
  ruler = true,
  labels = "both",
  size = "default",
  selectable = false,
  onActiveChange,
  className,
  "aria-label": ariaLabel,
  ...props
}: ProteinDomainsProps) {
  const S = SIZES[size]
  const [ref, width] = useWidth()
  const pad = 8
  const inner = Math.max(width - pad * 2, 1)
  const x = React.useCallback((aa: number) => pad + ((aa - 1) / Math.max(length, 1)) * inner, [inner, length])
  const colors = domainColors(domains)
  const lanes = domainLanes(domains)
  const laneCount = Math.max(1, ...lanes.map((l) => l + 1))
  const tracks = !!structure || !!confidence

  const placed = React.useMemo(
    () => (width ? stackLabels((variants ?? []).map((v) => ({ ...v, px: x(v.position + 0.5) }))) : []),
    [variants, width, x]
  )
  const levels = placed.length ? Math.max(...placed.map((p) => p.level)) + 1 : 0
  const markerH = levels ? 14 + levels * 24 : 0
  const trackH = laneCount * S.lane
  const CAP = 18 // a track's caption
  const ssTop = markerH + trackH + (structure ? 8 : 0)
  const ssH = structure ? CAP + 16 : 0
  const cfTop = ssTop + ssH + (confidence ? 8 : 0)
  const CF = size === "sm" ? 24 : 36
  const cfH = confidence ? CAP + CF : 0
  const rulerTop = cfTop + cfH
  const rulerH = ruler ? 22 : 0
  const height = rulerTop + rulerH + 2
  const top = markerH
  const mid = top + S.lane / 2

  const ticks = React.useMemo(() => {
    if (!ruler || !width) return []
    const raw = length / Math.max(2, Math.floor(inner / 70))
    const p = 10 ** Math.floor(Math.log10(raw))
    const step = [1, 2, 5, 10].map((m) => m * p).find((s) => s >= raw) ?? p * 10
    const out = [1]
    for (let t = step; t < length - step * 0.4; t += step) out.push(t)
    out.push(length)
    return out
  }, [ruler, width, length, inner])

  // ---- focus
  const [hover, setHover] = React.useState<number | null>(null)
  const [cursor, setCursor] = React.useState(1)
  const [focused, setFocused] = React.useState(false)
  const active = hover ?? (focused && selectable ? cursor : null)
  const cb = React.useRef(onActiveChange)
  cb.current = onActiveChange
  React.useEffect(() => cb.current?.(active), [active])
  const residueAt = (clientX: number) => {
    const r = ref.current?.getBoundingClientRect()
    if (!r) return null
    const aa = Math.floor(1 + ((clientX - r.left - pad) / inner) * length)
    return aa >= 1 && aa <= length ? aa : null
  }
  const about = (aa: number) => {
    const d = domains.filter((d) => aa >= d.start && aa <= d.end).map((d) => d.name)
    const ss = structure?.find((e) => aa >= e.start && aa <= e.end)?.type
    const c = confidence?.[aa - 1]
    return { letter: sequence?.[aa - 1], domains: d, ss, c }
  }
  const describe = (aa: number) => {
    const a = about(aa)
    return [
      `Residue ${aa}${a.letter ? ` ${a.letter}` : ""}`,
      a.domains.length ? a.domains.join(" and ") : null,
      structure ? (a.ss ?? "coil") : null,
      a.c != null ? `pLDDT ${Math.round(a.c)}, ${plddtBand(a.c).name.toLowerCase()}` : null,
    ]
      .filter(Boolean)
      .join(", ")
  }
  const onKeyDown = (e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 10 : 1
    let to = cursor
    if (e.key === "ArrowRight" || e.key === "ArrowUp") to += step
    else if (e.key === "ArrowLeft" || e.key === "ArrowDown") to -= step
    else if (e.key === "PageUp") to += 50
    else if (e.key === "PageDown") to -= 50
    else if (e.key === "Home") to = 1
    else if (e.key === "End") to = length
    else return
    e.preventDefault()
    setCursor(Math.max(1, Math.min(length, to)))
  }

  const label =
    ariaLabel ??
    `Protein, ${length} residues. Domains: ${domains.map((d) => `${d.name} ${d.start} to ${d.end}`).join(", ")}${
      variants?.length ? `. Variants: ${variants.map((v) => v.label ?? v.position).join(", ")}` : ""
    }${structure ? `. ${structure.filter((e) => e.type === "helix").length} helices, ${structure.filter((e) => e.type === "strand").length} strands` : ""}${
      confidence?.length ? `. Mean pLDDT ${Math.round(confidence.reduce((a, b) => a + b, 0) / confidence.length)}` : ""
    }`

  // helices as a coil: a sine along the stretch, about one turn per 3.6 residues but never tighter than 7 px
  const helix = (e: StructureElement, y: number) => {
    const x0 = x(e.start)
    const x1 = x(e.end + 1)
    const period = Math.max(7, (3.6 * inner) / length)
    const amp = 5
    let d = `M${x0.toFixed(1)},${y}`
    for (let px = x0 + 1; px <= x1; px += 1) d += `L${px.toFixed(1)},${(y - amp * Math.sin(((px - x0) / period) * Math.PI * 2)).toFixed(2)}`
    return d
  }
  const strand = (e: StructureElement, y: number) => {
    const x0 = x(e.start)
    const x1 = x(e.end + 1)
    const w = Math.max(x1 - x0, 3)
    const h = 10
    const tip = Math.min(6, w * 0.5)
    const r = Math.min(2, w / 4)
    return `M${x0 + r},${y - h / 2}H${x0 + w - tip}V${y - h / 2 - 2}L${x0 + w},${y}L${x0 + w - tip},${y + h / 2 + 2}V${y + h / 2}H${x0 + r}Q${x0},${y + h / 2} ${x0},${y + h / 2 - r}V${y - h / 2 + r}Q${x0},${y - h / 2} ${x0 + r},${y - h / 2}Z`
  }

  const legend = (labels === "legend" || labels === "both") && (domains.length > 0 || tracks)
  const card = active != null && hover != null && tracks ? about(active) : null

  return (
    <div data-slot="protein-domains" className={cn("grid w-full gap-3", className)} {...props}>
      <div
        ref={ref}
        className={cn(
          "relative w-full outline-none",
          selectable && "rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
        )}
        style={{ height }}
        onPointerMove={tracks || selectable ? (e) => setHover(residueAt(e.clientX)) : undefined}
        onPointerLeave={() => setHover(null)}
        {...(selectable
          ? {
              role: "slider",
              tabIndex: 0,
              "aria-label": label,
              "aria-valuemin": 1,
              "aria-valuemax": length,
              "aria-valuenow": cursor,
              "aria-valuetext": describe(cursor),
              onKeyDown,
              onFocus: () => setFocused(true),
              onBlur: () => setFocused(false),
            }
          : { role: "img", "aria-label": label })}
      >
        {width > 0 && (
          <svg width={width} height={height} aria-hidden className="block overflow-visible">
            {/* the residue in focus, through every track */}
            {active != null && tracks && (
              <rect
                x={x(active) - 0.5 + Math.min(0, (inner / length - 2) / 2)}
                y={top}
                width={Math.max(2, inner / length)}
                height={rulerTop - top}
                className="fill-foreground/25"
              />
            )}
            {/* backbone */}
            <rect x={pad} y={mid - S.backbone / 2} width={inner} height={S.backbone} rx={S.backbone / 2} fill="var(--outline-variant)" />
            {/* stems behind everything */}
            {placed.map((v) => (
              <Lollipop key={`s${v.position}${v.label}`} x={v.px} top={top - 14 - v.level * 24} bottom={mid} color={v.color} head={false} />
            ))}
            {domains.map((d, i) => {
              const x0 = x(d.start)
              const x1 = x(d.end + 1)
              const w = Math.max(x1 - x0, 3)
              const y = top + lanes[i] * S.lane + (S.lane - S.domain) / 2
              const fits = (labels === "inside" || labels === "both") && d.name.length * 6.6 + 14 < w
              return (
                <g key={`${d.name}-${d.start}`}>
                  <title>{d.description ?? `${d.name}, residues ${d.start} to ${d.end}`}</title>
                  <rect x={x0} y={y} width={w} height={S.domain} rx={Math.min(S.domain / 2, w / 2, 8)} fill={domainFill(colors[i])} />
                  {fits && size === "default" && (
                    <text x={x0 + w / 2} y={y + S.domain / 2 + 4} textAnchor="middle" fill={domainInk(colors[i])} className="text-[0.6875rem] font-semibold">
                      {d.name}
                    </text>
                  )}
                </g>
              )
            })}
            {placed.map((v) => (
              <Lollipop
                key={`h${v.position}${v.label}`}
                x={v.px}
                top={top - 14 - v.level * 24}
                bottom={mid}
                label={v.label}
                color={v.color}
                w={v.w}
                title={v.description ?? v.label ?? `Residue ${v.position}`}
                stem={false}
              />
            ))}

            {/* secondary structure */}
            {structure && (
              <g>
                <text x={pad} y={ssTop + 11} className="fill-muted-foreground text-[0.75rem] font-medium">
                  Secondary structure
                </text>
                <rect x={pad} y={ssTop + CAP + 8 - 1} width={inner} height={2} rx={1} fill="var(--outline-variant)" />
                {structure.map((e) =>
                  e.type === "helix" ? (
                    <path key={`${e.type}${e.start}`} d={helix(e, ssTop + CAP + 8)} fill="none" stroke={STRUCTURE_INK} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  ) : e.type === "strand" ? (
                    <path key={`${e.type}${e.start}`} d={strand(e, ssTop + CAP + 8)} fill={STRUCTURE_INK} />
                  ) : (
                    <rect key={`${e.type}${e.start}`} x={x(e.start)} y={ssTop + CAP + 8 - 2.5} width={Math.max(x(e.end + 1) - x(e.start), 2)} height={5} rx={2.5} fill={STRUCTURE_INK} opacity={0.45} />
                  )
                )}
              </g>
            )}

            {/* confidence */}
            {confidence && (
              <g>
                <text x={pad} y={cfTop + 11} className="fill-muted-foreground text-[0.75rem] font-medium">
                  {confidenceLabel}
                </text>
                {[50, 70, 90].map((t) => (
                  <line key={t} x1={pad} x2={pad + inner} y1={cfTop + CAP + CF * (1 - t / 100)} y2={cfTop + CAP + CF * (1 - t / 100)} stroke="var(--outline-variant)" strokeWidth={1} strokeDasharray="2 3" />
                ))}
                {PLDDT_BANDS.map((b) => {
                  // one path per band: a step outline of its residues' bars
                  let d = ""
                  confidence.forEach((v, i) => {
                    if (plddtBand(v) !== b) return
                    const x0 = x(i + 1)
                    const x1 = x(i + 2)
                    const y = cfTop + CAP + CF * (1 - Math.max(0, Math.min(100, v)) / 100)
                    d += `M${x0.toFixed(2)},${(cfTop + CAP + CF).toFixed(2)}V${y.toFixed(2)}H${(x1 + 0.15).toFixed(2)}V${(cfTop + CAP + CF).toFixed(2)}Z`
                  })
                  return d ? <path key={b.name} d={d} fill={domainFill(b.color)} /> : null
                })}
              </g>
            )}

            {ticks.map((t) => (
              <text
                key={t}
                x={x(t + 0.5)}
                y={rulerTop + 16}
                textAnchor={t === 1 ? "start" : t === length ? "end" : "middle"}
                className="fill-muted-foreground text-[0.6875rem] tabular-nums"
              >
                {t}
              </text>
            ))}
            {active != null && tracks && ruler && (
              <g>
                <rect x={Math.max(pad, Math.min(pad + inner - 36, x(active + 0.5) - 18))} y={rulerTop + 4} width={36} height={16} rx={8} className="fill-foreground" />
                <text x={Math.max(pad + 18, Math.min(pad + inner - 18, x(active + 0.5)))} y={rulerTop + 16} textAnchor="middle" className="fill-background text-[0.6875rem] font-semibold tabular-nums">
                  {active}
                </text>
              </g>
            )}
          </svg>
        )}

        {card && active != null && (
          <div
            aria-hidden
            className="pointer-events-none absolute z-10 grid min-w-40 -translate-x-1/2 -translate-y-full gap-0.5 rounded-md bg-inverse-surface px-3 py-2 text-inverse-foreground shadow-e2"
            style={{ left: Math.max(84, Math.min(width - 84, x(active + 0.5))), top: (structure ? ssTop : cfTop) - 2 }}
          >
            <span className="type-label-lg font-semibold tabular-nums">
              {card.letter ? `${card.letter}${active}` : `Residue ${active}`}
            </span>
            {card.domains.length > 0 && <span className="type-label-sm opacity-80">{card.domains.join(", ")}</span>}
            {structure && <span className="type-label-sm opacity-80">{card.ss ? card.ss[0].toUpperCase() + card.ss.slice(1) : "Coil"}</span>}
            {card.c != null && (
              <span className="type-label-sm tabular-nums opacity-80">
                pLDDT {Math.round(card.c)}, {plddtBand(card.c).name.toLowerCase()}
              </span>
            )}
          </div>
        )}
      </div>
      {legend && (
        <div className="grid gap-2">
          {domains.length > 0 && <DomainLegend domains={domains} />}
          {tracks && (
            <ul className="flex flex-wrap gap-x-5 gap-y-2 type-label-md">
              {structure && (
                <>
                  <li className="flex items-center gap-2">
                    <svg aria-hidden width={18} height={12} className="shrink-0">
                      <path d="M1,6 Q3.5,0 6,6 T11,6 T16,6" fill="none" stroke={STRUCTURE_INK} strokeWidth={2} strokeLinecap="round" />
                    </svg>
                    Helix
                  </li>
                  <li className="flex items-center gap-2">
                    <svg aria-hidden width={18} height={12} className="shrink-0">
                      <path d="M1,3H11V1L17,6L11,11V9H1Z" fill={STRUCTURE_INK} />
                    </svg>
                    Strand
                  </li>
                </>
              )}
              {confidence &&
                PLDDT_BANDS.map((b) => (
                  <li key={b.name} className="flex items-center gap-2">
                    <span aria-hidden className="h-2.5 w-4 shrink-0 rounded-full" style={{ background: domainFill(b.color) }} />
                    {b.name}
                    <span className="text-muted-foreground tabular-nums">{b.min === 90 ? "> 90" : b.min === 0 ? "< 50" : `${b.min}–${b.min === 70 ? 90 : 70}`}</span>
                  </li>
                ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

export { ProteinDomains, type ProteinDomainsProps }
