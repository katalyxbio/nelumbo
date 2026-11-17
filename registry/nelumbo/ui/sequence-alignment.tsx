"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { aminoAcidTone, type AminoAcidScheme } from "@/registry/nelumbo/ui/amino-acid"
import { nucleotideTone, type NucleotideScheme } from "@/registry/nelumbo/ui/nucleotide"
import { Residue, type ResidueRange } from "@/registry/nelumbo/ui/residue"

/**
 * Nelumbo Sequence Alignment
 *
 * Aligned sequences as rows of residue tiles. Each ungapped stretch is one
 * connected shape, gaps are a thin line between them, and the columns line up
 * under a ruler, an identity bar and a consensus row.
 *
 *   <SequenceAlignment
 *     sequences={[{ name: "Human", sequence: "MEEPQSDPSV..." }, { name: "Mouse", sequence: "MEESQSDISL...", start: 4 }]}
 *     colorBy="conservation" consensus conservation />
 *
 * The rows wrap into blocks that fit the width, ten columns at a time, and
 * every row ends with the position of its last residue, as Clustal prints it.
 *
 * Color:
 * - "residue" (default): every residue in its scheme's color.
 * - "conservation": only residues that agree with the column's consensus, in
 *   columns at least `threshold` identical. The rest fade.
 * - "difference": only residues that differ from the reference row. With
 *   `dots`, identical ones are a dot, so substitutions stand out.
 */

export type AlignedSequence = {
  /** Default: the name. */
  id?: string
  name: string
  /** Aligned, with "-" for gaps. Every row the same length. */
  sequence: string
  /** The position of its first residue. Default 1. */
  start?: number
  description?: string
}

export type AlignmentFocus = {
  /** 1-based, counted from `columnStart`. */
  column: number
  sequence: AlignedSequence
  /** "-" in a gap. */
  letter: string
  /** The residue's own position in its sequence; null in a gap. */
  position: number | null
  consensus: string
  /** The share of rows that carry the consensus residue, 0 to 1. */
  identity: number
}

type ColumnStat = { consensus: string; identity: number }

const GAP = /[-.]/

/** Each column's most common residue and the share of rows that carry it (gaps count against). */
export function alignmentConsensus(sequences: string[]): ColumnStat[] {
  const n = Math.max(0, ...sequences.map((s) => s.length))
  const out: ColumnStat[] = []
  for (let c = 0; c < n; c++) {
    const counts = new Map<string, number>()
    for (const s of sequences) {
      const l = (s[c] ?? "-").toUpperCase()
      if (!GAP.test(l)) counts.set(l, (counts.get(l) ?? 0) + 1)
    }
    let best = "-"
    let top = 0
    for (const [l, k] of counts) if (k > top) [best, top] = [l, k]
    out.push({ consensus: best, identity: sequences.length ? top / sequences.length : 0 })
  }
  return out
}

/** Pairwise identity of two aligned rows: identical residues over columns where either has one. */
export function percentIdentity(a: string, b: string) {
  let same = 0
  let cols = 0
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const x = (a[i] ?? "-").toUpperCase()
    const y = (b[i] ?? "-").toUpperCase()
    if (GAP.test(x) && GAP.test(y)) continue
    cols++
    if (x === y) same++
  }
  return cols ? same / cols : 0
}

const isNucleotide = (rows: string[]) => rows.every((s) => /^[ACGTUN\-.]*$/i.test(s))

const SIZES = {
  sm: { cell: 16, size: "sm" as const, row: "h-5", bar: 14 },
  default: { cell: 24, size: "default" as const, row: "h-7", bar: 18 },
}
const STEP_GAP = 2

type Kind = "residue" | "subtle" | "dot" | "gap" | "end"

type SequenceAlignmentProps = Omit<React.ComponentProps<"div">, "children"> & {
  sequences: AlignedSequence[]
  /** Default: "dna" when every row is A, C, G, T, U, N and gaps. */
  type?: "dna" | "protein"
  /** A Nucleotide or AminoAcid scheme. Default "nelumbo". */
  scheme?: NucleotideScheme | AminoAcidScheme
  colorBy?: "residue" | "conservation" | "difference"
  /** How identical a column must be to count as conserved. Default 0.7. */
  threshold?: number
  /** The row differences are measured against: its id or index. Default the first. */
  reference?: string | number
  /** In "difference", identical residues as a dot. */
  dots?: boolean
  /** A consensus row underneath. */
  consensus?: boolean
  /** A bar over each column, as tall as the column is identical. */
  conservation?: boolean
  /** Column numbers along the top. Default true. */
  ruler?: boolean
  /** The number of the first column, when showing a window of a longer alignment. Default 1. */
  columnStart?: number
  /** "auto" (default): blocks of ten columns that fit the width. A number: that many per block. false: one row that scrolls. */
  wrap?: "auto" | number | false
  /** Columns to bring forward (in column numbers): the rest fade. */
  highlight?: ResidueRange[]
  size?: keyof typeof SIZES
  /** Keyboard and pointer focus on a residue, with its column. */
  selectable?: boolean
  defaultActive?: { row: number; column: number } | null
  onActiveChange?: (focus: AlignmentFocus | null) => void
}

/** Aligned sequences as rows of connected residue tiles, wrapped into blocks. */
function SequenceAlignment({
  sequences,
  type,
  scheme = "nelumbo",
  colorBy = "residue",
  threshold = 0.7,
  reference = 0,
  dots = false,
  consensus = false,
  conservation = false,
  ruler = true,
  columnStart = 1,
  wrap = "auto",
  highlight,
  size = "default",
  selectable = false,
  defaultActive = null,
  onActiveChange,
  className,
  "aria-label": ariaLabel,
  ...props
}: SequenceAlignmentProps) {
  const S = SIZES[size]
  const rows = React.useMemo(() => sequences.map((s) => s.sequence), [sequences])
  const length = Math.max(0, ...rows.map((s) => s.length))
  const dna = type ? type === "dna" : isNucleotide(rows)
  const stats = React.useMemo(() => alignmentConsensus(rows), [rows])
  const ref = typeof reference === "number" ? reference : Math.max(0, sequences.findIndex((s) => (s.id ?? s.name) === reference))

  const resolve = React.useCallback(
    (l: string) => (dna ? nucleotideTone(l, scheme as NucleotideScheme) : aminoAcidTone(l, scheme as AminoAcidScheme)),
    [dna, scheme]
  )

  // each residue's own position, and the first and last residue of each row
  const positions = React.useMemo(
    () =>
      sequences.map((s) => {
        let p = (s.start ?? 1) - 1
        return [...s.sequence].map((l) => (GAP.test(l) ? null : ++p))
      }),
    [sequences]
  )
  const ends = React.useMemo(
    () =>
      positions.map((ps) => ({
        first: ps.findIndex((p) => p != null),
        last: ps.length - 1 - [...ps].reverse().findIndex((p) => p != null),
      })),
    [positions]
  )

  // how many columns fit
  const root = React.useRef<HTMLDivElement>(null)
  const nameCell = React.useRef<HTMLDivElement>(null)
  const [width, setWidth] = React.useState(0)
  const [nameW, setNameW] = React.useState(0)
  React.useLayoutEffect(() => {
    const el = root.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setWidth(Math.round(e.contentRect.width)))
    ro.observe(el)
    setWidth(Math.round(el.getBoundingClientRect().width))
    return () => ro.disconnect()
  }, [])
  React.useLayoutEffect(() => {
    if (nameCell.current) setNameW(nameCell.current.offsetWidth)
  }, [width, sequences, size])
  const lastNumber = Math.max(1, ...positions.map((ps) => ps.reduce<number>((m, p) => (p != null && p > m ? p : m), 0)))
  const numW = String(lastNumber).length * 8 + 4
  const perBlock = React.useMemo(() => {
    if (wrap === false) return Math.max(length, 1)
    if (typeof wrap === "number") return Math.max(1, wrap)
    if (!width || !nameW) return 10
    // name, n columns and the end number, a STEP_GAP between each
    const fit = Math.floor((width - nameW - numW - STEP_GAP) / (S.cell + STEP_GAP))
    // tens where they fit, so the ruler reads cleanly; every column that fits on narrow screens
    return fit >= 10 ? Math.floor(fit / 10) * 10 : Math.max(1, fit)
  }, [wrap, length, width, nameW, numW, S.cell])

  const blocks: ResidueRange[] = []
  for (let c = 0; c < length; c += perBlock) blocks.push({ start: c, end: Math.min(c + perBlock, length) - 1 })

  const faded = (c: number) => !!highlight?.length && !highlight.some((r) => c + columnStart >= r.start && c + columnStart <= r.end)

  const kind = (r: number, c: number): Kind => {
    const l = (rows[r][c] ?? "-").toUpperCase()
    if (GAP.test(l)) return c < ends[r].first || c > ends[r].last ? "end" : "gap"
    if (faded(c)) return "subtle"
    if (colorBy === "conservation") return stats[c].identity >= threshold && l === stats[c].consensus ? "residue" : "subtle"
    if (colorBy === "difference" && r !== ref) {
      if (l === (rows[ref][c] ?? "").toUpperCase()) return dots ? "dot" : "subtle"
    }
    return "residue"
  }

  // focus
  const [own, setOwn] = React.useState(defaultActive ? { row: defaultActive.row, col: defaultActive.column - columnStart } : null)
  const [hover, setHover] = React.useState<{ row: number; col: number } | null>(null)
  const [focused, setFocused] = React.useState(false)
  const cursor = own ?? { row: 0, col: 0 }
  const active = hover ?? (selectable && (focused || own) ? cursor : null)

  const focusOf = React.useCallback(
    (a: { row: number; col: number } | null): AlignmentFocus | null => {
      if (!a || !sequences[a.row]) return null
      const letter = (rows[a.row][a.col] ?? "-").toUpperCase()
      return {
        column: a.col + columnStart,
        sequence: sequences[a.row],
        letter: GAP.test(letter) ? "-" : letter,
        position: positions[a.row][a.col] ?? null,
        consensus: stats[a.col]?.consensus ?? "-",
        identity: stats[a.col]?.identity ?? 0,
      }
    },
    [sequences, rows, positions, stats, columnStart]
  )
  const onActive = React.useRef(onActiveChange)
  onActive.current = onActiveChange
  const activeKey = active ? `${active.row}:${active.col}` : ""
  React.useEffect(() => onActive.current?.(focusOf(active)), [activeKey]) // eslint-disable-line react-hooks/exhaustive-deps

  const describe = (a: { row: number; col: number }) => {
    const f = focusOf(a)
    if (!f) return ""
    const what = f.letter === "-" ? "gap" : `${resolve(f.letter).label} ${f.position}`
    return `Column ${f.column}, ${f.sequence.name}, ${what}. Consensus ${f.consensus}, ${Math.round(f.identity * 100)}% identical`
  }

  const move = (row: number, col: number) => {
    setHover(null)
    setOwn({ row: Math.max(0, Math.min(sequences.length - 1, row)), col: Math.max(0, Math.min(length - 1, col)) })
  }
  const onKeyDown = (e: React.KeyboardEvent) => {
    const { row, col } = cursor
    if (e.key === "ArrowRight") move(row, col + 1)
    else if (e.key === "ArrowLeft") move(row, col - 1)
    else if (e.key === "ArrowDown") move(row + 1, col)
    else if (e.key === "ArrowUp") move(row - 1, col)
    else if (e.key === "PageDown") move(row, col + perBlock)
    else if (e.key === "PageUp") move(row, col - perBlock)
    else if (e.key === "Home") move(row, 0)
    else if (e.key === "End") move(row, length - 1)
    else if (e.key === "Escape" && own) setOwn(null)
    else return
    e.preventDefault()
  }

  const cellAt = (x: number, y: number) => {
    const el = document.elementFromPoint(x, y)?.closest<HTMLElement>("[data-col]")
    if (!el || !root.current?.contains(el)) return null
    const col = Number(el.dataset.col)
    const row = el.dataset.row != null ? Number(el.dataset.row) : (hover?.row ?? cursor.row)
    return { row, col }
  }

  const label = ariaLabel ?? `Alignment of ${sequences.length} sequences, ${length} columns: ${sequences.map((s) => s.name).join(", ")}`
  const interactive = selectable
    ? {
        role: "slider",
        tabIndex: 0,
        "aria-label": label,
        "aria-valuemin": columnStart,
        "aria-valuemax": columnStart + length - 1,
        "aria-valuenow": cursor.col + columnStart,
        "aria-valuetext": describe(cursor),
        onKeyDown,
        onFocus: () => setFocused(true),
        onBlur: () => setFocused(false),
        onPointerDown: (e: React.PointerEvent) => {
          const a = cellAt(e.clientX, e.clientY)
          if (a) setOwn(a)
        },
      }
    : { role: "group", "aria-label": label, tabIndex: wrap === false ? 0 : undefined }

  // grid rows
  const rulerRow = 1
  const barRow = ruler ? 2 : 1
  const firstSeq = barRow + (conservation ? 1 : 0)
  const consensusRow = firstSeq + sequences.length

  const tile = (r: number, c: number, b: ResidueRange) => {
    const k = kind(r, c)
    const l = rows[r][c] ?? "-"
    const style = { gridRow: firstSeq + r, gridColumn: c - b.start + 2 }
    if (k === "end") return <span key={`${r}:${c}`} data-row={r} data-col={c} className={S.row} style={style} />
    if (k === "gap") {
      const nextGap = c < b.end && kind(r, c + 1) === "gap"
      return (
        <span key={`${r}:${c}`} data-row={r} data-col={c} title={`${sequences[r].name}, gap`} className={cn("flex items-center", S.row)} style={style}>
          <span className="h-0.5 rounded-full bg-outline" style={{ width: nextGap ? `calc(100% + ${STEP_GAP}px)` : "100%" }} />
        </span>
      )
    }
    const same = (q: number) => q >= b.start && q <= b.end && kind(r, q) === k && k !== "dot"
    const { tone, label: name } = resolve(l)
    return (
      <Residue
        key={`${r}:${c}`}
        data-row={r}
        data-col={c}
        style={style}
        tone={k === "dot" ? null : tone}
        size={S.size}
        variant={k === "dot" ? "text" : k === "subtle" ? "subtle" : "tonal"}
        active={!!active && active.row === r && active.col === c}
        join={{ start: same(c - 1), end: same(c + 1) }}
        label={`${sequences[r].name}, ${name} ${positions[r][c]}`}
        className={cn("w-full min-w-0 px-0", k === "dot" && "text-muted-foreground")}
      >
        {k === "dot" ? "." : l.toUpperCase()}
      </Residue>
    )
  }

  return (
    <div
      ref={root}
      data-slot="sequence-alignment"
      className={cn(
        "grid w-full min-w-0 gap-6 outline-none",
        selectable && "cursor-pointer select-none rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring",
        wrap === false && "overflow-x-auto pb-2 focus-visible:outline-2 focus-visible:outline-ring",
        className
      )}
      onPointerMove={(e) => setHover(cellAt(e.clientX, e.clientY))}
      onPointerLeave={() => setHover(null)}
      {...interactive}
      {...props}
    >
      {blocks.map((b, bi) => {
        const n = b.end - b.start + 1
        return (
          <div
            key={b.start}
            className="grid w-max items-center gap-y-1"
            style={{
              gridTemplateColumns: `max-content repeat(${n}, ${S.cell}px) ${numW}px`,
              columnGap: STEP_GAP,
            }}
          >
            {/* the column in focus, behind its residues */}
            {active && active.col >= b.start && active.col <= b.end && (
              <span
                aria-hidden
                className="-mx-0.5 -my-1 self-stretch rounded-md bg-foreground/[0.07] dark:bg-foreground/10"
                style={{ gridColumn: active.col - b.start + 2, gridRow: `${ruler ? rulerRow : firstSeq} / ${(consensus ? consensusRow : consensusRow - 1) + 1}` }}
              />
            )}
            {ruler &&
              Array.from({ length: n }, (_, k) => b.start + k)
                .filter((c) => c === b.start || (c + columnStart) % 10 === 0)
                .filter((c) => c === b.start || c - b.start >= 3)
                .map((c) => (
                  <span
                    key={`r${c}`}
                    aria-hidden
                    data-col={c}
                    className={cn(
                      "select-none whitespace-nowrap type-label-sm text-muted-foreground tabular-nums",
                      c === b.start ? "justify-self-start" : "justify-self-center"
                    )}
                    style={{ gridRow: rulerRow, gridColumn: c - b.start + 2 }}
                  >
                    {c + columnStart}
                  </span>
                ))}
            {conservation && (
              <>
                <span aria-hidden className="select-none pr-3 type-label-sm text-muted-foreground" style={{ gridRow: barRow, gridColumn: 1 }}>
                  Identity
                </span>
                {Array.from({ length: n }, (_, k) => b.start + k).map((c) => {
                  const id = stats[c].identity
                  return (
                    <span
                      key={`b${c}`}
                      data-col={c}
                      title={`Column ${c + columnStart}, ${Math.round(id * 100)}% identical`}
                      className="flex items-end justify-center self-stretch"
                      style={{ gridRow: barRow, gridColumn: c - b.start + 2, height: S.bar }}
                    >
                      <span
                        className={cn(
                          "w-1.5 rounded-full",
                          id >= 1 ? "bg-foreground" : id >= threshold ? "bg-muted-foreground" : "bg-outline-variant"
                        )}
                        style={{ height: Math.max(3, id * S.bar) }}
                      />
                    </span>
                  )
                })}
              </>
            )}
            {sequences.map((s, r) => {
              const last = positions[r].slice(0, b.end + 1).reduce<number | null>((m, p) => (p != null ? p : m), null)
              return (
                <React.Fragment key={s.id ?? s.name}>
                  <div
                    ref={bi === 0 && r === 0 ? nameCell : undefined}
                    title={s.description ?? s.name}
                    className={cn(
                      "max-w-[14ch] select-none truncate pr-3 type-label-md",
                      colorBy === "difference" && r === ref ? "font-semibold text-foreground" : "text-foreground"
                    )}
                    style={{ gridRow: firstSeq + r, gridColumn: 1 }}
                  >
                    {s.name}
                  </div>
                  {Array.from({ length: n }, (_, k) => tile(r, b.start + k, b))}
                  <span
                    aria-hidden
                    className="select-none justify-self-end type-label-sm text-muted-foreground tabular-nums"
                    style={{ gridRow: firstSeq + r, gridColumn: n + 2 }}
                  >
                    {last ?? ""}
                  </span>
                </React.Fragment>
              )
            })}
            {consensus && (
              <>
                <span className="select-none pr-3 type-label-md text-muted-foreground" style={{ gridRow: consensusRow, gridColumn: 1 }}>
                  Consensus
                </span>
                {Array.from({ length: n }, (_, k) => b.start + k).map((c) => {
                  const { consensus: l, identity } = stats[c]
                  const style = { gridRow: consensusRow, gridColumn: c - b.start + 2 }
                  if (l === "-") return <span key={`c${c}`} data-col={c} className={S.row} style={style} />
                  const strong = identity >= threshold
                  const near = (q: number) => q >= b.start && q <= b.end && stats[q].consensus !== "-" && stats[q].identity >= threshold === strong
                  return (
                    <Residue
                      key={`c${c}`}
                      data-col={c}
                      style={style}
                      tone={resolve(l).tone}
                      size={S.size}
                      variant={strong ? "tonal" : "subtle"}
                      join={{ start: near(c - 1), end: near(c + 1) }}
                      label={`Consensus ${resolve(l).label}, ${Math.round(identity * 100)}% identical`}
                      className="w-full min-w-0 px-0"
                    >
                      {l}
                    </Residue>
                  )
                })}
              </>
            )}
          </div>
        )
      })}
    </div>
  )
}

export { SequenceAlignment, type SequenceAlignmentProps }
