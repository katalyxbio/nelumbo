"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { aminoAcidTone, type AminoAcidScheme } from "@/registry/nelumbo/ui/amino-acid"
import { complement, nucleotideTone, type NucleotideScheme } from "@/registry/nelumbo/ui/nucleotide"
import { Residue, type ResidueTone } from "@/registry/nelumbo/ui/residue"

/**
 * Nelumbo Sequence Logo
 *
 * A motif as stacks of letters, one stack per position. A stack is as tall as
 * the position's information content in bits, and each letter takes its share
 * of that height, the most common on top. Letters take the same hues as
 * Nucleotide and AminoAcid, so a logo reads with the sequences around it.
 *
 *   <SequenceLogo sequences={["TGACTCA", "TGAGTCA", ...]} />
 *   <SequenceLogo matrix={[{ A: 3, C: 0, G: 12, T: 1 }, ...]} consensus />
 *   <SequenceLogo sequences={pfamSeed} type="protein" mode="probability" selectable />
 *
 * - From aligned sequences or a position matrix (counts or frequencies).
 * - "bits" (default) or "probability" (every stack full height).
 * - Small-sample correction, so a handful of sites does not look certain.
 * - A background composition, for genomes far from 25% of each base.
 * - A consensus row of residue tiles (IUPAC codes for DNA), a ruler, a bits axis.
 * - Hover or `selectable` reads out a position: its bits and every letter's share.
 */

export type LogoType = "dna" | "rna" | "protein"
export type LogoMode = "bits" | "probability"

export type LogoLetter = {
  letter: string
  /** Share of the non-gap letters at this position, 0 to 1. */
  p: number
  /** Height in bits (or probability). */
  height: number
}

export type LogoColumn = {
  /** As displayed: columnStart-based. */
  position: number
  /** Information content in bits, after the gap weighting. */
  bits: number
  /** Share of sequences with a gap here. */
  gaps: number
  /** Sorted by height, smallest first: the order they stack from the baseline. */
  letters: LogoLetter[]
}

export type LogoRange = { start: number; end: number }

const DNA = "ACGT"
const RNA = "ACGU"
const PROTEIN = "ACDEFGHIKLMNPQRSTVWY"

const alphabetOf = (type: LogoType) => (type === "protein" ? PROTEIN : type === "rna" ? RNA : DNA)

/** "dna" when everything is a base, "rna" with U and no T, otherwise "protein". */
export function detectLogoType(letters: string): LogoType {
  const s = letters.toUpperCase().replace(/[-.\sN]/g, "")
  if (/^[ACGT]*$/.test(s)) return "dna"
  if (/^[ACGU]*$/.test(s)) return "rna"
  return "protein"
}

type Counts = Record<string, number>

/** Per-position letter counts from aligned sequences of one length. */
export function logoCounts(sequences: string[]): Counts[] {
  const L = Math.max(0, ...sequences.map((s) => s.length))
  const out: Counts[] = Array.from({ length: L }, () => ({}))
  for (const s of sequences) {
    const u = s.toUpperCase()
    for (let i = 0; i < L; i++) {
      const c = u[i] ?? "-"
      const k = c === "." ? "-" : c
      out[i][k] = (out[i][k] ?? 0) + 1
    }
  }
  return out
}

/**
 * The stacks of a logo. Information content is Schneider's: log2 of the
 * alphabet size less the entropy, less a small-sample correction
 * ((s - 1) / (2 ln 2 n)); with a `background` it is the relative entropy
 * against it. Gapped positions shrink by their share of gaps.
 */
export function logoColumns(
  matrix: Counts[],
  {
    type = "dna",
    mode = "bits",
    correction = true,
    background,
    columnStart = 1,
  }: { type?: LogoType; mode?: LogoMode; correction?: boolean; background?: Counts; columnStart?: number } = {}
): LogoColumn[] {
  const alpha = [...alphabetOf(type)]
  const s = alpha.length
  const bg = background
    ? (() => {
        const t = alpha.reduce((a, l) => a + (background[l] ?? 0), 0) || 1
        return Object.fromEntries(alpha.map((l) => [l, (background[l] ?? 0) / t || 1 / s]))
      })()
    : null
  return matrix.map((raw, i) => {
    const c: Counts = {}
    for (const [k, v] of Object.entries(raw)) {
      const key = k.toUpperCase() === "U" && type !== "rna" ? "T" : k.toUpperCase() === "T" && type === "rna" ? "U" : k.toUpperCase()
      c[key] = (c[key] ?? 0) + v
    }
    const n = alpha.reduce((a, l) => a + (c[l] ?? 0), 0)
    const total = n + (c["-"] ?? 0) + Object.entries(c).reduce((a, [k, v]) => (k === "-" || alpha.includes(k) ? a : a + v), 0)
    const gaps = total ? 1 - n / total : 1
    const ps = alpha.map((l) => ({ letter: l, p: n ? (c[l] ?? 0) / n : 0 }))
    let bits = 0
    if (n) {
      if (bg) bits = ps.reduce((a, { letter, p }) => (p ? a + p * Math.log2(p / bg[letter]) : a), 0)
      else {
        const H = -ps.reduce((a, { p }) => (p ? a + p * Math.log2(p) : a), 0)
        // the correction only makes sense for counts; frequencies (n of 1 or less) skip it
        const e = correction && n > 1.5 ? (s - 1) / (2 * Math.LN2 * n) : 0
        bits = Math.max(0, Math.log2(s) - H - e)
      }
    }
    bits *= 1 - gaps
    const scale = mode === "probability" ? 1 - gaps : bits
    const letters = ps
      .filter((x) => x.p > 0)
      .map((x) => ({ ...x, height: x.p * scale }))
      .sort((a, b) => a.height - b.height || b.letter.localeCompare(a.letter))
    return { position: columnStart + i, bits, gaps, letters }
  })
}

const IUPAC: Record<string, string> = {
  AG: "R", CT: "Y", CG: "S", AT: "W", GT: "K", AC: "M",
}

/**
 * The consensus letter of a column. For DNA, Cavener's rules: one base when it
 * is over half and twice the next, a two-base IUPAC code when two make three
 * quarters, otherwise N. For protein, the most common residue when it is over
 * half, otherwise X.
 */
export function logoConsensus(column: LogoColumn, type: LogoType = "dna") {
  const top = [...column.letters].sort((a, b) => b.p - a.p)
  if (!top.length) return "-"
  if (type === "protein") return top[0].p > 0.5 ? top[0].letter : "X"
  const [a, b] = top
  if (a.p > 0.5 && (!b || a.p > 2 * b.p)) return a.letter
  if (b && a.p + b.p > 0.75) return IUPAC[[a.letter, b.letter].map((l) => (l === "U" ? "T" : l)).sort().join("")] ?? "N"
  return "N"
}

/** The other strand's matrix, read 5' to 3'. */
export function reverseComplementMatrix(matrix: Counts[], rna = false): Counts[] {
  return [...matrix].reverse().map((c) => Object.fromEntries(Object.entries(c).map(([k, v]) => [k === "-" ? "-" : complement(k, rna), v])))
}

// ---- glyph metrics: each letter's ink box, so a glyph can be stretched to fill its slot exactly

type Ink = { left: number; right: number; ascent: number; descent: number }
const FALLBACK: Ink = { left: 0, right: 60, ascent: 72, descent: 0 }

function useInk(ref: React.RefObject<SVGSVGElement | null>, letters: string) {
  const [ink, setInk] = React.useState<Record<string, Ink>>({})
  React.useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    let gone = false
    const measure = () => {
      if (gone) return
      const ctx = document.createElement("canvas").getContext("2d")
      if (!ctx) return
      const cs = getComputedStyle(el)
      ctx.font = `${cs.fontWeight} 100px ${cs.fontFamily}`
      const out: Record<string, Ink> = {}
      for (const l of new Set(letters)) {
        const m = ctx.measureText(l)
        out[l] = {
          left: m.actualBoundingBoxLeft,
          right: m.actualBoundingBoxRight,
          ascent: m.actualBoundingBoxAscent,
          descent: m.actualBoundingBoxDescent,
        }
      }
      setInk(out)
    }
    measure()
    document.fonts?.ready.then(measure)
    return () => {
      gone = true
    }
  }, [ref, letters])
  return ink
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

const pct = (p: number) => (p >= 0.995 ? "100%" : p < 0.005 ? "<1%" : `${Math.round(p * 100)}%`)
const ordered = (a: number, b: number): LogoRange => ({ start: Math.min(a, b), end: Math.max(a, b) })
const within = (p: number, r?: LogoRange | null) => !!r && p >= r.start && p <= r.end

// glyph ink: the residue tone system's "text" step, a touch stronger for large letters
const GLYPH =
  "[--gl:0.53] [--gc:0.17] [--gs:0.07] dark:[--gl:0.8] dark:[--gc:0.14] dark:[--gs:0.06]" +
  " [&_[data-glyph]]:fill-[oklch(calc(var(--gl)+var(--rs,0)*var(--gs))_calc(var(--gc)*var(--rk,1))_var(--rh,0))]"

type SequenceLogoProps = Omit<React.ComponentProps<"div">, "children"> & {
  /** Aligned sequences, all one length. Gaps are "-" or ".". */
  sequences?: string[]
  /** Or a position matrix: counts or frequencies per position ({ A: 12, C: 0, G: 3, T: 1 }). */
  matrix?: Record<string, number>[]
  /** Detected from the letters when not given. */
  type?: LogoType
  /** Nucleotide or AminoAcid scheme, by type. Default "nelumbo". */
  scheme?: NucleotideScheme | AminoAcidScheme
  /** "bits" (default): stacks as tall as their information. "probability": every stack full. */
  mode?: LogoMode
  /** Small-sample correction. Default true. */
  correction?: boolean
  /** Background letter composition, for relative entropy (a GC-rich genome, say). */
  background?: Record<string, number>
  /** Show the other strand (DNA and RNA). */
  reverseComplement?: boolean
  /** The number of the first position. Default 1. */
  columnStart?: number
  /** Plot height in px, without the axes. Default 160. */
  height?: number
  /** Widest a stack gets, px. Default 40. */
  maxColumnWidth?: number
  /** The bits axis on the left. Default true. */
  yAxis?: boolean
  /** Position numbers under the stacks: true for every one that fits, or every n. Default true. */
  ruler?: boolean | number
  /** A row of consensus tiles under the stacks. */
  consensus?: boolean
  /** Stretches to mark behind the stacks: a core motif, a binding site. */
  highlight?: (LogoRange & { label?: string })[]
  /** The hover card with every letter's share. Default true. */
  tooltip?: boolean
  /** One keyboard stop: arrows move, Shift extends, Escape clears. */
  selectable?: boolean
  selection?: LogoRange | null
  defaultSelection?: LogoRange | null
  onSelectionChange?: (selection: LogoRange | null) => void
  onActiveChange?: (column: LogoColumn | null) => void
}

function SequenceLogo({
  sequences,
  matrix: matrixProp,
  type: typeProp,
  scheme = "nelumbo",
  mode = "bits",
  correction = true,
  background,
  reverseComplement = false,
  columnStart = 1,
  height = 160,
  maxColumnWidth = 40,
  yAxis = true,
  ruler = true,
  consensus = false,
  highlight,
  tooltip = true,
  selectable = false,
  selection: selectionProp,
  defaultSelection = null,
  onSelectionChange,
  onActiveChange,
  className,
  "aria-label": ariaLabel,
  ...props
}: SequenceLogoProps) {
  const type = React.useMemo<LogoType>(() => {
    if (typeProp) return typeProp
    if (sequences) return detectLogoType(sequences.join(""))
    return detectLogoType((matrixProp ?? []).flatMap((c) => Object.keys(c)).join(""))
  }, [typeProp, sequences, matrixProp])

  const columns = React.useMemo(() => {
    let m = matrixProp ?? logoCounts(sequences ?? [])
    if (reverseComplement && type !== "protein") m = reverseComplementMatrix(m, type === "rna")
    return logoColumns(m, { type, mode, correction, background, columnStart })
  }, [matrixProp, sequences, reverseComplement, type, mode, correction, background, columnStart])

  const toneOf = React.useCallback(
    (l: string): { tone: ResidueTone | null; label: string } =>
      type === "protein" ? aminoAcidTone(l, scheme as AminoAcidScheme) : nucleotideTone(l, scheme as NucleotideScheme),
    [type, scheme]
  )

  const maxBits = Math.log2(alphabetOf(type).length)
  const top = mode === "probability" ? 1 : maxBits

  // ---- layout
  const [ref, width] = useWidth()
  const svgRef = React.useRef<SVGSVGElement>(null)
  const ink = useInk(svgRef, alphabetOf(type) + "X")
  const n = columns.length
  const axisW = yAxis ? 38 : 0
  const room = Math.max(width - axisW - 4, 1)
  const colW = Math.max(12, Math.min(maxColumnWidth, room / Math.max(n, 1)))
  const plotW = colW * n
  const svgW = axisW + plotW + 4
  const padTop = highlight?.some((h) => h.label) ? 28 : 8
  const rulerH = ruler ? 18 : 0
  const svgH = padTop + height + 4 + rulerH
  const y = (v: number) => padTop + height - (v / top) * height
  const scrolls = width > 0 && svgW > width + 1

  const step = React.useMemo(() => {
    if (typeof ruler === "number") return ruler
    const need = String(columnStart + n).length * 7 + 6
    return [1, 2, 5, 10, 20, 50, 100].find((s) => s * colW >= need) ?? 100
  }, [ruler, columnStart, n, colW])

  // ---- focus and selection
  const first = columnStart
  const last = columnStart + n - 1
  const [own, setOwn] = React.useState<LogoRange | null>(defaultSelection)
  const selection = selectionProp !== undefined ? selectionProp : own
  const setSelection = (r: LogoRange | null) => {
    if (selectionProp === undefined) setOwn(r)
    onSelectionChange?.(r)
  }
  const [cursor, setCursor] = React.useState(selection?.end ?? first)
  const [anchor, setAnchor] = React.useState(selection?.start ?? first)
  const [hover, setHover] = React.useState<number | null>(null)
  const [focused, setFocused] = React.useState(false)
  const dragging = React.useRef(false)
  const active = hover ?? (focused && selectable ? cursor : null)
  const activeCol = active == null ? null : (columns[active - first] ?? null)
  const cb = React.useRef(onActiveChange)
  cb.current = onActiveChange
  React.useEffect(() => cb.current?.(activeCol), [activeCol])

  const scroller = React.useRef<HTMLDivElement>(null)
  React.useEffect(() => {
    // keep the keyboard cursor in view when the logo scrolls
    const el = scroller.current
    if (!el || !focused || !scrolls) return
    const x0 = axisW + (cursor - first) * colW
    if (x0 < el.scrollLeft + axisW) el.scrollLeft = x0 - axisW - colW
    else if (x0 + colW > el.scrollLeft + el.clientWidth) el.scrollLeft = x0 + colW * 2 - el.clientWidth
  }, [cursor, focused, scrolls, axisW, first, colW])

  const describeCol = (c: LogoColumn | null) => {
    if (!c) return ""
    const lets = [...c.letters]
      .sort((a, b) => b.p - a.p)
      .slice(0, 4)
      .map((l) => `${l.letter} ${pct(l.p)}`)
      .join(", ")
    return `Position ${c.position}, ${c.bits.toFixed(2)} bits${lets ? `: ${lets}` : ""}${c.gaps >= 0.005 ? `, ${pct(c.gaps)} gaps` : ""}`
  }
  const describe = () => {
    if (selection && selection.end > selection.start) {
      const cols = columns.slice(selection.start - first, selection.end - first + 1)
      const bits = cols.reduce((a, c) => a + c.bits, 0)
      return `Positions ${selection.start} to ${selection.end} selected, ${bits.toFixed(1)} bits, consensus ${cols.map((c) => logoConsensus(c, type)).join("")}`
    }
    return describeCol(columns[cursor - first] ?? null)
  }

  const move = (to: number, extend: boolean) => {
    const p = Math.max(first, Math.min(last, to))
    setCursor(p)
    if (extend) setSelection(ordered(anchor, p))
    else {
      setAnchor(p)
      setSelection({ start: p, end: p })
    }
  }
  const onKeyDown = (e: React.KeyboardEvent) => {
    const page = Math.max(1, Math.floor((scroller.current?.clientWidth ?? plotW) / colW) - 1)
    const steps: Record<string, number> = { ArrowRight: 1, ArrowLeft: -1, PageDown: page, PageUp: -page }
    if (e.key in steps) move(cursor + steps[e.key], e.shiftKey)
    else if (e.key === "Home") move(first, e.shiftKey)
    else if (e.key === "End") move(last, e.shiftKey)
    else if (e.key === "Escape" && selection) setSelection(null)
    else return
    e.preventDefault()
  }

  const posAt = (clientX: number) => {
    const svg = svgRef.current
    if (!svg) return null
    const x = clientX - svg.getBoundingClientRect().left - axisW
    const i = Math.floor(x / colW)
    return i >= 0 && i < n ? first + i : null
  }

  const label =
    ariaLabel ??
    `Sequence logo, ${n} positions, ${type === "protein" ? "protein" : type.toUpperCase()}. Consensus ${columns.map((c) => logoConsensus(c, type)).join("")}`

  const interactive = selectable
    ? {
        role: "slider",
        tabIndex: 0,
        "aria-label": label,
        "aria-valuemin": first,
        "aria-valuemax": last,
        "aria-valuenow": cursor,
        "aria-valuetext": describe(),
        onKeyDown,
        onFocus: () => setFocused(true),
        onBlur: () => setFocused(false),
        onPointerDown: (e: React.PointerEvent) => {
          const p = posAt(e.clientX)
          if (p == null) return
          dragging.current = true
          setCursor(p)
          if (e.shiftKey) setSelection(ordered(anchor, p))
          else {
            setAnchor(p)
            setSelection({ start: p, end: p })
          }
        },
        onPointerUp: () => (dragging.current = false),
      }
    : { role: "img", "aria-label": label }

  const yTicks = mode === "probability" ? [0, 0.5, 1] : Array.from({ length: Math.floor(maxBits) + 1 }, (_, i) => i)
  const xOf = (pos: number) => axisW + (pos - first) * colW
  const band = (r: LogoRange, inset = 1) => ({
    x: xOf(Math.max(r.start, first)) + inset,
    w: (Math.min(r.end, last) - Math.max(r.start, first) + 1) * colW - inset * 2,
  })
  const tip = tooltip && activeCol && activeCol.letters.length > 0

  return (
    <div data-slot="sequence-logo" className={cn("grid w-full min-w-0 grid-cols-[minmax(0,1fr)] gap-2", className)} {...props}>
      <div ref={ref} className="relative w-full">
        <div
          ref={scroller}
          className={cn("w-full", scrolls && "overflow-x-auto overscroll-x-contain pb-1")}
          {...(scrolls && !selectable ? { tabIndex: 0, role: "region", "aria-label": `${label}, scrolls sideways` } : {})}
        >
          <div
            className={cn(
              "relative select-none outline-none",
              selectable && "cursor-pointer touch-pan-y rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            )}
            style={{ width: width ? svgW : "100%" }}
            onPointerMove={(e) => {
              const p = posAt(e.clientX)
              setHover(p)
              if (dragging.current && p != null && selectable) {
                setCursor(p)
                setSelection(ordered(anchor, p))
              }
            }}
            onPointerLeave={() => {
              setHover(null)
              dragging.current = false
            }}
            {...interactive}
          >
            <svg ref={svgRef} width={width ? svgW : "100%"} height={svgH} aria-hidden className={cn("block font-mono font-bold", GLYPH)}>
              {/* marked stretches */}
              {highlight?.map((h) => {
                const b = band(h, 0)
                return (
                  <g key={`${h.start}-${h.end}`}>
                    <rect x={b.x} y={h.label ? padTop - 22 : padTop - 4} width={b.w} height={height + (h.label ? 26 : 8)} rx={12} className="fill-surface-container-high" />
                    {h.label && (
                      // the stretch's name as a tonal chip at its top
                      <g className="font-sans">
                        <rect x={b.x + 4} y={padTop - 18} width={h.label.length * 6.6 + 16} height={18} rx={9} className="fill-surface-container-highest" />
                        <text x={b.x + 12} y={padTop - 5.5} className="fill-foreground text-[0.6875rem] font-semibold">
                          {h.label}
                        </text>
                      </g>
                    )}
                  </g>
                )
              })}
              {/* selection, then the column in focus */}
              {selection && (
                <rect {...(({ x, w }) => ({ x, width: w }))(band(selection))} y={padTop - 4} height={height + 8} rx={Math.min(10, colW / 2)} className="fill-foreground/[0.09]" />
              )}
              {active != null && !within(active, selection) && (
                <rect x={xOf(active) + 1} y={padTop - 4} width={colW - 2} height={height + 8} rx={Math.min(10, colW / 2)} className="fill-foreground/[0.06]" />
              )}

              {/* bits axis */}
              {yAxis && (
                <g className="font-sans font-normal">
                  {yTicks.map((t) => (
                    <g key={t}>
                      {t > 0 && <line x1={axisW} x2={axisW + plotW} y1={y(t)} y2={y(t)} className="stroke-outline-variant" strokeWidth={1} strokeDasharray="2 4" />}
                      <text x={axisW - 8} y={y(t) + 3.5} textAnchor="end" className="fill-muted-foreground text-[0.625rem] tabular-nums">
                        {t}
                      </text>
                    </g>
                  ))}
                  <text
                    transform={`translate(8 ${padTop + height / 2}) rotate(-90)`}
                    textAnchor="middle"
                    className="fill-muted-foreground text-[0.625rem]"
                  >
                    {mode === "probability" ? "probability" : "bits"}
                  </text>
                </g>
              )}

              {/* stacks */}
              {columns.map((c, i) => {
                let base = 0
                const x0 = axisW + i * colW + Math.min(1.5, colW * 0.06)
                const w = colW - Math.min(3, colW * 0.12)
                return (
                  <g key={c.position}>
                    {c.letters.map((l) => {
                      const h = (l.height / top) * height
                      const yb = y(base)
                      base += l.height
                      if (h < 0.4) return null
                      const m = ink[l.letter] ?? FALLBACK
                      const gw = m.left + m.right || 60
                      const gh = m.ascent + m.descent || 72
                      const { tone } = toneOf(l.letter)
                      return (
                        <text
                          key={l.letter}
                          data-glyph
                          x={m.left}
                          y={m.ascent}
                          transform={`translate(${x0} ${yb - h}) scale(${w / gw} ${h / gh})`}
                          style={{ "--rh": tone?.hue ?? 0, "--rk": tone ? (tone.chroma ?? 1) : 0, "--rs": tone?.shade ?? 0 } as React.CSSProperties}
                          fontSize={100}
                        >
                          {l.letter}
                        </text>
                      )
                    })}
                  </g>
                )
              })}

              {/* baseline */}
              <rect x={axisW} y={y(0)} width={plotW} height={3} rx={1.5} className="fill-surface-container-highest" />

              {/* ruler */}
              {ruler &&
                columns.map((c, i) => {
                  const lit = c.position === active || (selection && (c.position === selection.start || c.position === selection.end))
                  const lead = i === 0 && step - (c.position % step) > step / 2
                  if (!lit && step > 1 && c.position % step !== 0 && !lead) return null
                  const cx = axisW + (i + 0.5) * colW
                  const txt = String(c.position)
                  const pw = txt.length * 6.4 + 10
                  return (
                    <g key={c.position} className="font-sans font-normal">
                      {lit && <rect x={cx - pw / 2} y={y(0) + 4} width={pw} height={15} rx={7.5} className="fill-foreground" />}
                      <text
                        x={cx}
                        y={y(0) + 15}
                        textAnchor="middle"
                        className={cn("text-[0.625rem] tabular-nums", lit ? "fill-background font-semibold" : "fill-muted-foreground")}
                      >
                        {txt}
                      </text>
                    </g>
                  )
                })}
            </svg>

            {consensus && width > 0 && (
              <div aria-hidden className="flex" style={{ paddingLeft: axisW, width: svgW }}>
                {columns.map((c, i) => {
                  const l = logoConsensus(c, type)
                  const { tone } = toneOf(l)
                  const same = (j: number) => j >= 0 && j < n && within(columns[j].position, selection) === within(c.position, selection)
                  return (
                    <span key={c.position} className="flex justify-center" style={{ width: colW }}>
                      <Residue
                        tone={l === "N" || l === "X" || l.length > 1 ? null : tone}
                        size={colW < 22 ? "sm" : "default"}
                        variant={l === "N" || l === "X" ? "subtle" : "tonal"}
                        selected={within(c.position, selection)}
                        active={active === c.position}
                        join={{ start: same(i - 1), end: same(i + 1) }}
                        className="w-full min-w-0 px-0"
                      >
                        {l}
                      </Residue>
                    </span>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {tip && activeCol && (
          <div
            aria-hidden
            className="pointer-events-none absolute z-10 grid min-w-36 -translate-y-full gap-1.5 rounded-xl bg-inverse-surface px-3 py-2.5 text-inverse-foreground shadow-e2"
            style={{
              left: Math.max(
                0,
                Math.min(xOf(activeCol.position) + colW / 2 - (scroller.current?.scrollLeft ?? 0) - 72, width - 152)
              ),
              top: padTop - 6,
            }}
          >
            <div className="flex items-baseline justify-between gap-4 type-label-md">
              <span className="font-semibold">{activeCol.position}</span>
              <span className="tabular-nums opacity-80">{activeCol.bits.toFixed(2)} bits</span>
            </div>
            {[...activeCol.letters]
              .sort((a, b) => b.p - a.p)
              .slice(0, 5)
              .map((l) => (
                <div key={l.letter} className="grid grid-cols-[1rem_1fr_2.5rem] items-center gap-2 type-label-sm">
                  <span className="font-mono font-bold">{l.letter}</span>
                  <span className="h-1.5 overflow-hidden rounded-full bg-inverse-foreground/20">
                    <span className="block h-full rounded-full bg-inverse-foreground" style={{ width: `${l.p * 100}%` }} />
                  </span>
                  <span className="text-right tabular-nums">{pct(l.p)}</span>
                </div>
              ))}
            {activeCol.gaps >= 0.005 && <div className="type-label-sm opacity-80">{pct(activeCol.gaps)} gaps</div>}
          </div>
        )}
      </div>
    </div>
  )
}

export { SequenceLogo, type SequenceLogoProps }
