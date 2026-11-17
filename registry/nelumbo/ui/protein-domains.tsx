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

type ProteinDomainsProps = Omit<React.ComponentProps<"div">, "children"> & {
  /** Residues in the protein. */
  length: number
  domains: ProteinDomain[]
  variants?: ProteinVariant[]
  /** Residue numbers along the bottom. Default true. */
  ruler?: boolean
  /** Names inside the blocks where they fit, a legend underneath. Default "both". */
  labels?: "inside" | "legend" | "both" | "none"
  size?: keyof typeof SIZES
}

/** A protein's domains along its length, with variants as lollipops. */
function ProteinDomains({
  length,
  domains,
  variants,
  ruler = true,
  labels = "both",
  size = "default",
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

  const placed = React.useMemo(
    () => (width ? stackLabels((variants ?? []).map((v) => ({ ...v, px: x(v.position + 0.5) }))) : []),
    [variants, width, x]
  )
  const levels = placed.length ? Math.max(...placed.map((p) => p.level)) + 1 : 0
  const markerH = levels ? 14 + levels * 24 : 0
  const trackH = laneCount * S.lane
  const rulerH = ruler ? 22 : 0
  const height = markerH + trackH + rulerH + 2
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

  const label =
    ariaLabel ??
    `Protein, ${length} residues. Domains: ${domains.map((d) => `${d.name} ${d.start} to ${d.end}`).join(", ")}${
      variants?.length ? `. Variants: ${variants.map((v) => v.label ?? v.position).join(", ")}` : ""
    }`

  return (
    <div data-slot="protein-domains" className={cn("grid w-full gap-3", className)} {...props}>
      <div ref={ref} role="img" aria-label={label} className="relative w-full" style={{ height }}>
        {width > 0 && (
          <svg width={width} height={height} aria-hidden className="block overflow-visible">
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
            {ticks.map((t) => (
              <text
                key={t}
                x={x(t + 0.5)}
                y={top + trackH + 16}
                textAnchor={t === 1 ? "start" : t === length ? "end" : "middle"}
                className="fill-muted-foreground text-[0.6875rem] tabular-nums"
              >
                {t}
              </text>
            ))}
          </svg>
        )}
      </div>
      {(labels === "legend" || labels === "both") && <DomainLegend domains={domains} />}
    </div>
  )
}

export { ProteinDomains, type ProteinDomainsProps }
