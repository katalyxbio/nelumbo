"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { nucleotideTone, type NucleotideScheme } from "@/registry/nelumbo/ui/nucleotide"

/**
 * Nelumbo Sanger Trace
 *
 * A chromatogram: the four dye channels as curves, the base calls over their
 * peaks, and the call quality as bars, with poor stretches shaded. Reads an
 * ABI file (.ab1) as it comes off the sequencer.
 *
 *   const read = parseAbif(await file.arrayBuffer())
 *   <SangerTrace {...read} />
 *   <SangerTrace {...read} reference={expected} mixed={0.3} trim />
 *
 * - The curves take Nucleotide's "trace" hues (A green, C blue, G dark, T red),
 *   drawn in the tone system so they hold in light and dark.
 * - `trim` shades the ends a Mott trim would cut (the same rule as most base
 *   callers), and the quality bars mark the Q20 and Q30 lines.
 * - `reference` lines the calls up against the bases you expected, and marks
 *   every difference; `mixed` marks bases where a second dye's peak reaches a
 *   share of the first, as a heterozygous site does.
 * - The trace scrolls sideways. `selectable` makes it one keyboard stop: arrows
 *   move a base, Home and End jump, the readout names the call, its quality
 *   and the four peak heights.
 */

export type SangerChannels = { A: number[]; C: number[]; G: number[]; T: number[] }

export type SangerRead = {
  /** The four dye channels, one value a scan. */
  traces: SangerChannels
  /** The base calls. */
  bases: string
  /** For each call, the scan its peak is at. */
  peaks: number[]
  /** Phred quality for each call. */
  quality?: number[]
  /** The sample name in the file. */
  name?: string
}

export type SangerBase = {
  /** As shown: start-based. */
  position: number
  base: string
  quality?: number
  /** The four channels at the peak. */
  heights: Record<"A" | "C" | "G" | "T", number>
  /** The second-highest channel, when `mixed` flags it. */
  secondary?: string
  /** The expected base, when it differs. */
  expected?: string
}

// ---- ABIF

/**
 * An ABI sequencer file (.ab1, ABIF format) as a read: the analyzed traces
 * (DATA 9 to 12, in the order FWO_ gives), the calls (PBAS 2), their peaks
 * (PLOC 2) and qualities (PCON 2), and the sample name.
 */
export function parseAbif(buffer: ArrayBuffer): SangerRead {
  const v = new DataView(buffer)
  const tag = (o: number) => String.fromCharCode(v.getUint8(o), v.getUint8(o + 1), v.getUint8(o + 2), v.getUint8(o + 3))
  if (tag(0) !== "ABIF") throw new Error("Not an ABIF (.ab1) file")
  const dirCount = v.getInt32(18)
  const dirOffset = v.getInt32(26)
  const entries = new Map<string, { type: number; count: number; size: number; offset: number }>()
  for (let i = 0; i < dirCount; i++) {
    const o = dirOffset + i * 28
    const size = v.getInt32(o + 16)
    // four bytes or fewer live in the offset field itself
    entries.set(`${tag(o)}${v.getInt32(o + 4)}`, { type: v.getInt16(o + 8), count: v.getInt32(o + 12), size, offset: size <= 4 ? o + 20 : v.getInt32(o + 20) })
  }
  const get = (key: string) => entries.get(key)
  const shorts = (key: string) => {
    const e = get(key)
    return e ? Array.from({ length: e.count }, (_, i) => v.getInt16(e.offset + i * 2)) : []
  }
  const bytes = (key: string) => {
    const e = get(key)
    return e ? Array.from({ length: e.count }, (_, i) => v.getUint8(e.offset + i)) : []
  }
  const chars = (key: string) => String.fromCharCode(...bytes(key))
  const pstring = (key: string) => {
    const e = get(key)
    if (!e) return ""
    const n = v.getUint8(e.offset)
    return String.fromCharCode(...Array.from({ length: n }, (_, i) => v.getUint8(e.offset + 1 + i)))
  }
  const order = (chars("FWO_1") || "GATC").toUpperCase()
  const traces = { A: [], C: [], G: [], T: [] } as SangerChannels
  ;[...order].forEach((b, i) => {
    if (b in traces) traces[b as keyof SangerChannels] = shorts(`DATA${9 + i}`)
  })
  const bases = chars("PBAS2") || chars("PBAS1")
  const peaks = shorts("PLOC2").length ? shorts("PLOC2") : shorts("PLOC1")
  const quality = bytes("PCON2").length ? bytes("PCON2") : bytes("PCON1")
  return { traces, bases, peaks, quality: quality.length ? quality : undefined, name: pstring("SMPL1") || undefined }
}

/**
 * Where a Mott trim keeps a read: the stretch with the highest sum of
 * (cutoff - error probability) per base. 1-based, inclusive.
 */
export function qualityTrim(quality: number[], cutoff = 0.05) {
  let best = 0
  let sum = 0
  let s = 0
  let range = { start: 1, end: 0 }
  quality.forEach((q, i) => {
    sum += cutoff - 10 ** (-q / 10)
    if (sum < 0) {
      sum = 0
      s = i + 1
    } else if (sum > best) {
      best = sum
      range = { start: s + 1, end: i + 1 }
    }
  })
  return range
}

// ---- layout helpers

const CHANNELS = ["A", "C", "G", "T"] as const

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

// the curves and letters: the tone system at a line's strength
const INK =
  "[--tl:0.56] [--tc:0.17] [--ts:0.12] dark:[--tl:0.78] dark:[--tc:0.15] dark:[--ts:0.1]" +
  " [&_[data-ch]]:stroke-[oklch(calc(var(--tl)+var(--rs,0)*var(--ts))_calc(var(--tc)*var(--rk,1))_var(--rh,0))]" +
  " [&_[data-fill]]:fill-[oklch(calc(var(--tl)+var(--rs,0)*var(--ts))_calc(var(--tc)*var(--rk,1))_var(--rh,0)/0.07)]" +
  " [&_[data-call]]:fill-[oklch(calc(var(--tl)+var(--rs,0)*var(--ts)-0.06)_calc(var(--tc)*var(--rk,1))_var(--rh,0))]"

const toneVars = (b: string, scheme: NucleotideScheme) => {
  const t = nucleotideTone(b, scheme).tone
  return { "--rh": t?.hue ?? 0, "--rk": t ? (t.chroma ?? 1) : 0, "--rs": t?.shade ?? 0 } as React.CSSProperties
}

type SangerTraceProps = Omit<React.ComponentProps<"div">, "children"> &
  SangerRead & {
    /** The number of the first call. Default 1. */
    start?: number
    /** Calls to show, 1-based and inclusive: a window of a long read. Default all. */
    range?: { start: number; end: number }
    /** Default "trace": A green, C blue, G dark, T red. */
    scheme?: NucleotideScheme
    /** Curve height in px. Default 120. */
    height?: number
    /** Px a base. Default 14. */
    baseWidth?: number
    /** Quality bars over the calls. Default true when there is quality. */
    qualityBars?: boolean
    /** Shade the ends a Mott trim cuts: true for 0.05, or the error cutoff. */
    trim?: boolean | number
    /** The bases you expected, aligned to the calls (- for none): differences are marked. */
    reference?: string
    /** Flag a call when its second-highest channel reaches this share of the first (0.3 is common). */
    mixed?: number
    /** Fill under the curves. Default true. */
    fill?: boolean
    selectable?: boolean
    onActiveChange?: (base: SangerBase | null) => void
  }

function SangerTrace({
  traces,
  bases,
  peaks,
  quality,
  name,
  start = 1,
  range,
  scheme = "trace",
  height = 120,
  baseWidth = 14,
  qualityBars,
  trim = false,
  reference,
  mixed,
  fill = true,
  selectable = false,
  onActiveChange,
  className,
  "aria-label": ariaLabel,
  ...props
}: SangerTraceProps) {
  const n = Math.min(bases.length, peaks.length)
  const r0 = Math.max(1, range?.start ?? 1)
  const r1 = Math.min(n, range?.end ?? n)
  const showQ = (qualityBars ?? !!quality) && !!quality
  const trimmed = React.useMemo(() => (trim && quality ? qualityTrim(quality, typeof trim === "number" ? trim : 0.05) : null), [trim, quality])

  // scans covered: half a base's spacing either side of the first and last peaks
  const s0 = Math.max(0, Math.round(peaks[r0 - 1] - ((peaks[r0] ?? peaks[r0 - 1] + 10) - peaks[r0 - 1]) / 2))
  const s1 = Math.round(peaks[r1 - 1] + (peaks[r1 - 1] - (peaks[r1 - 2] ?? peaks[r1 - 1] - 10)) / 2)
  const shown = r1 - r0 + 1
  // a base's width of room either side, so the end calls and numbers are not cut
  const edge = baseWidth
  const W = shown * baseWidth + edge * 2
  // Calls sit exactly one base width apart, whatever the real spacing of the peaks, and the
  // curves are stretched between them, so every peak stays under its call.
  const px = (scan: number) => {
    const a = r0 - 1
    const z = r1 - 1
    const cx = (i: number) => edge + (i - a + 0.5) * baseWidth
    if (z <= a) return edge + ((scan - s0) / Math.max(1, s1 - s0)) * (W - edge * 2)
    if (scan <= peaks[a]) return cx(a) + ((scan - peaks[a]) * baseWidth) / Math.max(1, peaks[a + 1] - peaks[a])
    if (scan >= peaks[z]) return cx(z) + ((scan - peaks[z]) * baseWidth) / Math.max(1, peaks[z] - peaks[z - 1])
    let lo = a
    let hi = z
    while (hi - lo > 1) {
      const m = (lo + hi) >> 1
      if (peaks[m] <= scan) lo = m
      else hi = m
    }
    return cx(lo) + ((scan - peaks[lo]) / Math.max(1, peaks[lo + 1] - peaks[lo])) * baseWidth
  }

  const yMax = React.useMemo(() => {
    let m = 1
    for (const c of CHANNELS) for (let i = s0; i <= s1 && i < traces[c].length; i++) m = Math.max(m, traces[c][i])
    return m
  }, [traces, s0, s1])

  const heightsAt = React.useCallback(
    (i: number) => Object.fromEntries(CHANNELS.map((c) => [c, traces[c][peaks[i]] ?? 0])) as SangerBase["heights"],
    [traces, peaks]
  )
  const info = React.useCallback(
    (i: number): SangerBase => {
      const heights = heightsAt(i)
      const sorted = [...CHANNELS].sort((a, b) => heights[b] - heights[a])
      const secondary = mixed != null && heights[sorted[1]] >= mixed * heights[sorted[0]] && heights[sorted[0]] > 0 ? sorted[1] : undefined
      const exp = reference?.[i]?.toUpperCase()
      return {
        position: start + i,
        base: bases[i],
        quality: quality?.[i],
        heights,
        secondary,
        expected: exp && exp !== "-" && exp !== bases[i].toUpperCase() ? exp : undefined,
      }
    },
    [heightsAt, mixed, reference, start, bases, quality]
  )

  // ---- geometry
  const Q = showQ ? 26 : 0
  const RULER = 16
  const CALLS = 18
  const REF = reference ? 18 : 0
  const top = RULER + Q + CALLS + REF + 4
  const H = top + height + 4
  const y = (v: number) => top + height - (v / yMax) * height * 0.94

  const paths = React.useMemo(() => {
    const out: Record<string, string> = {}
    for (const c of CHANNELS) {
      const t = traces[c]
      let d = ""
      for (let i = s0; i <= s1 && i < t.length; i++) d += `${i === s0 ? "M" : "L"}${px(i).toFixed(1)},${y(t[i]).toFixed(1)}`
      out[c] = d
    }
    return out
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [traces, s0, s1, W, height, yMax, top])

  // ---- focus
  const [ref, width] = useWidth()
  const scroller = React.useRef<HTMLDivElement>(null)
  const [hover, setHover] = React.useState<number | null>(null)
  const [cursor, setCursor] = React.useState(r0 - 1)
  const [focused, setFocused] = React.useState(false)
  const active = hover ?? (focused && selectable ? cursor : null)
  const activeInfo = active == null ? null : info(active)
  const cb = React.useRef(onActiveChange)
  cb.current = onActiveChange
  const key = activeInfo ? `${activeInfo.position}` : ""
  React.useEffect(() => cb.current?.(activeInfo), [key]) // eslint-disable-line react-hooks/exhaustive-deps

  const callX = (i: number) => px(peaks[i])
  const at = (clientX: number) => {
    const svg = scroller.current?.querySelector("svg")
    if (!svg) return null
    const x = clientX - svg.getBoundingClientRect().left
    let best: number | null = null
    let d = Infinity
    for (let i = r0 - 1; i < r1; i++) {
      const dd = Math.abs(callX(i) - x)
      if (dd < d) {
        d = dd
        best = i
      }
    }
    return d <= baseWidth ? best : null
  }

  React.useEffect(() => {
    const el = scroller.current
    if (!el || !focused) return
    const x = callX(cursor)
    if (x < el.scrollLeft + 24) el.scrollLeft = x - 48
    else if (x > el.scrollLeft + el.clientWidth - 24) el.scrollLeft = x - el.clientWidth + 48
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cursor, focused])

  const onKeyDown = (e: React.KeyboardEvent) => {
    const page = Math.max(1, Math.floor((scroller.current?.clientWidth ?? 300) / baseWidth) - 2)
    let to = cursor
    if (e.key === "ArrowRight") to += e.shiftKey ? 10 : 1
    else if (e.key === "ArrowLeft") to -= e.shiftKey ? 10 : 1
    else if (e.key === "PageDown") to += page
    else if (e.key === "PageUp") to -= page
    else if (e.key === "Home") to = r0 - 1
    else if (e.key === "End") to = r1 - 1
    else return
    e.preventDefault()
    setCursor(Math.max(r0 - 1, Math.min(r1 - 1, to)))
  }

  const describe = (b: SangerBase) =>
    `Base ${b.position}, ${b.base}${b.quality != null ? `, quality ${b.quality}` : ""}${b.secondary ? `, mixed with ${b.secondary}` : ""}${
      b.expected ? `, expected ${b.expected}` : ""
    }. Peaks ${CHANNELS.map((c) => `${c} ${b.heights[c]}`).join(", ")}`

  const mean = quality ? Math.round(quality.slice(r0 - 1, r1).reduce((a, b) => a + b, 0) / Math.max(1, shown)) : null
  const diffs = reference ? Array.from({ length: shown }, (_, k) => info(r0 - 1 + k)).filter((b) => b.expected).length : 0
  const label =
    ariaLabel ??
    `Sanger trace${name ? ` of ${name}` : ""}, bases ${start + r0 - 1} to ${start + r1 - 1}${mean != null ? `, mean quality ${mean}` : ""}${
      reference ? `, ${diffs} ${diffs === 1 ? "difference" : "differences"} from the reference` : ""
    }`

  const ticks: number[] = []
  for (let i = r0 - 1; i < r1; i++) if ((start + i) % 10 === 0) ticks.push(i)

  return (
    <div data-slot="sanger-trace" className={cn("grid w-full min-w-0 grid-cols-[minmax(0,1fr)] gap-2 [contain:inline-size]", className)} {...props}>
      <div ref={ref} className="relative w-full">
        <div
          ref={scroller}
          className={cn(
            "w-full overflow-x-auto overscroll-x-contain pb-1 outline-none",
            "rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
            selectable && "cursor-pointer"
          )}
          onPointerMove={(e) => setHover(at(e.clientX))}
          onPointerLeave={() => setHover(null)}
          onPointerDown={(e) => {
            const i = at(e.clientX)
            if (i != null) setCursor(i)
          }}
          {...(selectable
            ? {
                role: "slider",
                tabIndex: 0,
                "aria-label": label,
                "aria-valuemin": start + r0 - 1,
                "aria-valuemax": start + r1 - 1,
                "aria-valuenow": start + cursor,
                "aria-valuetext": describe(info(cursor)),
                onKeyDown,
                onFocus: () => setFocused(true),
                onBlur: () => setFocused(false),
              }
            : { role: "region", tabIndex: 0, "aria-label": label })}
        >
          <svg width={W} height={H} aria-hidden className={cn("block select-none", INK)}>
            {/* trimmed ends */}
            {trimmed &&
              [
                [r0 - 1, Math.min(r1, trimmed.start - 1)],
                [Math.max(r0 - 1, trimmed.end), r1],
              ].map(([a, b], k) =>
                b > a ? (
                  <rect
                    key={k}
                    x={a === r0 - 1 ? 0 : (callX(a - 1) + callX(a)) / 2}
                    y={RULER}
                    width={(b === r1 ? W : (callX(b - 1) + callX(b)) / 2) - (a === r0 - 1 ? 0 : (callX(a - 1) + callX(a)) / 2)}
                    height={H - RULER}
                    rx={12}
                    className="fill-surface-container-high"
                  />
                ) : null
              )}

            {/* the base in focus */}
            {active != null && <rect x={callX(active) - baseWidth / 2} y={RULER - 2} width={baseWidth} height={H - RULER + 2} rx={baseWidth / 2} className="fill-foreground/[0.08]" />}

            {/* ruler */}
            {ticks.map((i) => (
              <text key={i} x={callX(i)} y={11} textAnchor="middle" className="fill-muted-foreground text-[0.625rem] tabular-nums">
                {start + i}
              </text>
            ))}

            {/* quality */}
            {showQ && (
              <g>
                {[20, 30].map((t) => (
                  <line key={t} x1={0} x2={W} y1={RULER + Q - 2 - (t / 60) * (Q - 4)} y2={RULER + Q - 2 - (t / 60) * (Q - 4)} className="stroke-outline-variant" strokeWidth={1} strokeDasharray="2 3" />
                ))}
                {Array.from({ length: shown }, (_, k) => {
                  const i = r0 - 1 + k
                  const q = Math.min(60, quality![i] ?? 0)
                  const h = Math.max(1.5, (q / 60) * (Q - 4))
                  return (
                    <rect
                      key={i}
                      x={callX(i) - baseWidth * 0.3}
                      y={RULER + Q - 2 - h}
                      width={baseWidth * 0.6}
                      height={h}
                      rx={Math.min(2, baseWidth * 0.15)}
                      className={q < 20 ? "fill-foreground/25" : "fill-foreground/55"}
                    />
                  )
                })}
              </g>
            )}

            {/* calls, and the reference under them */}
            {Array.from({ length: shown }, (_, k) => {
              const i = r0 - 1 + k
              const b = info(i)
              const cx = callX(i)
              const yC = RULER + Q + 13
              const off = b.expected || b.secondary
              return (
                <g key={i}>
                  {off && <rect x={cx - 7} y={yC - 11} width={14} height={15} rx={7} className={b.expected ? "fill-red/20 dark:fill-red/30" : "fill-amber/25 dark:fill-amber/30"} />}
                  <text data-call x={cx} y={yC} textAnchor="middle" style={toneVars(b.base, scheme)} className={cn("font-mono text-[0.75rem] font-bold", (b.quality ?? 40) < 20 && "opacity-50")}>
                    {b.base}
                  </text>
                  {reference && (
                    <text x={cx} y={yC + 17} textAnchor="middle" className={cn("font-mono text-[0.6875rem]", b.expected ? "fill-red font-bold" : "fill-muted-foreground")}>
                      {b.expected ?? (reference[i] && reference[i] !== "-" ? reference[i].toUpperCase() : "")}
                    </text>
                  )}
                </g>
              )
            })}

            {/* curves */}
            <rect x={edge / 2} y={top + height} width={W - edge} height={3} rx={1.5} className="fill-surface-container-highest" />
            {CHANNELS.map((c) => (
              <g key={c} style={toneVars(c, scheme)}>
                {fill && <path data-fill d={`${paths[c]}L${px(Math.min(s1, traces[c].length - 1))},${top + height}L${px(s0)},${top + height}Z`} />}
                <path data-ch d={paths[c]} fill="none" strokeWidth={1.4} strokeLinejoin="round" />
              </g>
            ))}
          </svg>
        </div>

        {activeInfo && hover != null && (
          <div
            aria-hidden
            className="pointer-events-none absolute z-10 grid min-w-36 -translate-x-1/2 -translate-y-full gap-1 rounded-md bg-inverse-surface px-3 py-2 text-inverse-foreground shadow-e2"
            style={{
              left: Math.max(76, Math.min(width - 76, callX(hover) - (scroller.current?.scrollLeft ?? 0))),
              top: RULER - 4,
            }}
          >
            <div className="flex items-baseline justify-between gap-4 type-label-md">
              <span className="font-semibold tabular-nums">
                {activeInfo.base}
                {activeInfo.position}
              </span>
              {activeInfo.quality != null && <span className="tabular-nums opacity-80">Q{activeInfo.quality}</span>}
            </div>
            {CHANNELS.map((c) => {
              const max = Math.max(1, ...CHANNELS.map((k) => activeInfo.heights[k]))
              return (
                <div key={c} className="grid grid-cols-[0.75rem_1fr_2.5rem] items-center gap-2 type-label-sm">
                  <span className="font-mono font-bold">{c}</span>
                  <span className="h-1.5 overflow-hidden rounded-full bg-inverse-foreground/20">
                    <span className="block h-full rounded-full bg-inverse-foreground" style={{ width: `${(activeInfo.heights[c] / max) * 100}%` }} />
                  </span>
                  <span className="text-right tabular-nums">{activeInfo.heights[c]}</span>
                </div>
              )
            })}
            {(activeInfo.expected || activeInfo.secondary) && (
              <div className="type-label-sm opacity-80">
                {activeInfo.expected ? `Expected ${activeInfo.expected}` : `Mixed with ${activeInfo.secondary}`}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export { SangerTrace, type SangerTraceProps }
