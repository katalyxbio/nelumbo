"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { aminoAcidTone, type AminoAcidScheme } from "@/registry/nelumbo/ui/amino-acid"
import { nucleotideTone, type NucleotideScheme } from "@/registry/nelumbo/ui/nucleotide"
import { Icon } from "@/registry/nelumbo/ui/icon"
import { Residue, type ResidueRange } from "@/registry/nelumbo/ui/residue"

/**
 * Nelumbo Sequence Alignment
 *
 * Aligned sequences as rows of residue tiles. Each ungapped stretch is one
 * connected shape, gaps are a thin line between them, and the columns line up
 * under a ruler, a feature track, an identity bar and a consensus row.
 *
 *   <SequenceAlignment
 *     sequences={[{ name: "Human", sequence: "MEEPQSDPSV..." }, { name: "Mouse", sequence: "MEESQSDISL...", start: 4 }]}
 *     colorBy="conservation" consensus conservation selectable />
 *
 * The rows wrap into blocks that fit the width, ten columns at a time, and
 * every row ends with the position of its last residue, as Clustal prints it.
 * With wrap={false} it is one row that scrolls under an overview strip.
 *
 * Color:
 * - "residue" (default): every residue in its scheme's color.
 * - "conservation": only residues that agree with the column's consensus, in
 *   columns at least `threshold` identical. The rest fade.
 * - "difference": only residues that differ from the reference row. With
 *   `dots`, identical ones are a dot, so substitutions stand out.
 * Whatever the mode, a selection shows its residues in full, solid color.
 *
 * Selection (with `selectable`) is a block of columns across sequences: drag
 * over residues, drag along the ruler or identity bars for whole columns, or
 * over the names for whole sequences. Shift and the arrows extend it, Ctrl+A
 * takes everything, Escape clears, and copying gives the block as aligned FASTA.
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

export type AlignmentColor = "blue" | "cyan" | "green" | "amber" | "orange" | "red" | "pink" | "purple" | "brand" | "neutral"

/** A feature over a stretch of columns, or a marker on one. In column numbers. */
export type AlignmentAnnotation = {
  start: number
  end: number
  label?: string
  /** Default: the next in the palette order. */
  color?: AlignmentColor
  description?: string
}

/** A block: columns (in column numbers, inclusive) across the sequences with these ids. */
export type AlignmentSelection = { start: number; end: number; sequences: string[] }

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
const idOf = (s: AlignedSequence) => s.id ?? s.name

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

/** The selected block as its own alignment, each row's start moved to its first residue there. */
export function alignmentSlice(sequences: AlignedSequence[], selection: AlignmentSelection, columnStart = 1): AlignedSequence[] {
  const a = selection.start - columnStart
  const b = selection.end - columnStart
  return sequences
    .filter((s) => selection.sequences.includes(idOf(s)))
    .map((s) => ({
      ...s,
      start: (s.start ?? 1) + s.sequence.slice(0, a).replace(/[-.]/g, "").length,
      sequence: s.sequence.slice(a, b + 1),
    }))
}

/** Aligned FASTA, each header as id/first-last (Jalview's form), lines of `width`. */
export function toFasta(sequences: AlignedSequence[], width = 60) {
  return sequences
    .map((s) => {
      const first = s.start ?? 1
      const n = s.sequence.replace(/[-.]/g, "").length
      const lines = s.sequence.match(new RegExp(`.{1,${width}}`, "g")) ?? [""]
      return [`>${idOf(s)}/${first}-${first + Math.max(n, 1) - 1}`, ...lines].join("\n")
    })
    .join("\n")
    .concat("\n")
}

const isNucleotide = (rows: string[]) => rows.every((s) => /^[ACGTUN\-.]*$/i.test(s))

const ORDER: AlignmentColor[] = ["blue", "amber", "green", "purple", "pink", "cyan", "orange", "red"]
const fill = (c: AlignmentColor) => (c === "neutral" ? "var(--muted-foreground)" : `var(--${c})`)
const ink = (c: AlignmentColor) => (c === "neutral" ? "var(--background)" : `var(--${c}-foreground)`)

/** Overlapping annotations on separate lanes, first come first placed. */
function lanesOf(items: AlignmentAnnotation[]) {
  const ends: number[] = []
  return items.map((a) => {
    let lane = ends.findIndex((e) => a.start > e)
    if (lane < 0) lane = ends.length
    ends[lane] = a.end
    return lane
  })
}

const SIZES = {
  sm: { cell: 16, size: "sm" as const, row: "h-5", bar: 14 },
  default: { cell: 24, size: "default" as const, row: "h-7", bar: 18 },
}
const STEP_GAP = 2

type Kind = "residue" | "subtle" | "dot" | "gap" | "end"
type Cell = { row: number; col: number }
type Block = { r0: number; r1: number; c0: number; c1: number }

type SequenceAlignmentProps = Omit<React.ComponentProps<"div">, "children"> & {
  sequences: AlignedSequence[]
  /** Default: "dna" when every row is A, C, G, T, U, N and gaps. */
  type?: "dna" | "protein"
  /** A Nucleotide or AminoAcid scheme. Default "nelumbo". */
  scheme?: NucleotideScheme | AminoAcidScheme
  colorBy?: "residue" | "conservation" | "difference"
  /** How identical a column must be to count as conserved. Default 0.7. */
  threshold?: number
  /** The row differences and identities are measured against: its id or index. Default the first. */
  reference?: string | number
  /** In "difference", identical residues as a dot. */
  dots?: boolean
  /** A consensus row underneath. */
  consensus?: boolean
  /** A bar over each column, as tall as the column is identical. */
  conservation?: boolean
  /** Each sequence's identity to the reference, beside its name. */
  identity?: boolean
  /** "identity": the reference first, then the closest. Default "input". */
  sort?: "input" | "identity"
  /** Features and markers in a track over the columns. */
  annotations?: AlignmentAnnotation[]
  /** Column numbers along the top. Default true. */
  ruler?: boolean
  /** The number of the first column, when showing a window of a longer alignment. Default 1. */
  columnStart?: number
  /** "auto" (default): blocks of ten columns that fit the width. A number: that many per block. false: one row that scrolls. */
  wrap?: "auto" | number | false
  /** With wrap={false}: the whole alignment's identity as a strip, with the visible window on it. Default true. */
  overview?: boolean
  /** Columns to bring forward (in column numbers): the rest fade. */
  highlight?: ResidueRange[]
  size?: keyof typeof SIZES
  /** Keyboard and pointer focus, and block selection. */
  selectable?: boolean
  selection?: AlignmentSelection | null
  defaultSelection?: AlignmentSelection | null
  onSelectionChange?: (selection: AlignmentSelection | null) => void
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
  identity = false,
  sort = "input",
  annotations,
  ruler = true,
  columnStart = 1,
  wrap = "auto",
  overview = true,
  highlight,
  size = "default",
  selectable = false,
  selection: selectionProp,
  defaultSelection = null,
  onSelectionChange,
  defaultActive = null,
  onActiveChange,
  className,
  "aria-label": ariaLabel,
  ...props
}: SequenceAlignmentProps) {
  const S = SIZES[size]
  const refIndex = typeof reference === "number" ? reference : Math.max(0, sequences.findIndex((s) => idOf(s) === reference))
  const identities = React.useMemo(
    () => sequences.map((s) => percentIdentity(s.sequence, sequences[refIndex]?.sequence ?? "")),
    [sequences, refIndex]
  )

  // the rows as shown
  const shown = React.useMemo(() => {
    const idx = sequences.map((_, i) => i)
    if (sort === "identity") idx.sort((a, b) => (a === refIndex ? -1 : b === refIndex ? 1 : identities[b] - identities[a]))
    return idx.map((i) => sequences[i])
  }, [sequences, sort, refIndex, identities])
  const shownIdentity = shown.map((s) => identities[sequences.indexOf(s)])
  const ref = shown.indexOf(sequences[refIndex])
  const rows = React.useMemo(() => shown.map((s) => s.sequence), [shown])
  const length = Math.max(0, ...rows.map((s) => s.length))
  const dna = type ? type === "dna" : isNucleotide(rows)
  const stats = React.useMemo(() => alignmentConsensus(rows), [rows])

  const resolve = React.useCallback(
    (l: string) => (dna ? nucleotideTone(l, scheme as NucleotideScheme) : aminoAcidTone(l, scheme as AminoAcidScheme)),
    [dna, scheme]
  )

  // each residue's own position, and the first and last residue of each row
  const positions = React.useMemo(
    () =>
      shown.map((s) => {
        let p = (s.start ?? 1) - 1
        return [...s.sequence].map((l) => (GAP.test(l) ? null : ++p))
      }),
    [shown]
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
  const scroller = React.useRef<HTMLDivElement>(null)
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
  }, [width, sequences, size, identity])
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

  // selection, kept as a block of shown rows and 0-based columns
  const toBlock = React.useCallback(
    (s: AlignmentSelection | null | undefined): Block | null => {
      if (!s) return null
      const rs = shown.map((x, i) => (s.sequences.includes(idOf(x)) ? i : -1)).filter((i) => i >= 0)
      if (!rs.length) return null
      return { r0: Math.min(...rs), r1: Math.max(...rs), c0: s.start - columnStart, c1: s.end - columnStart }
    },
    [shown, columnStart]
  )
  const fromBlock = (b: Block | null): AlignmentSelection | null =>
    b && { start: b.c0 + columnStart, end: b.c1 + columnStart, sequences: shown.slice(b.r0, b.r1 + 1).map(idOf) }
  const [own, setOwn] = React.useState<Block | null>(() => toBlock(defaultSelection))
  const sel = selectionProp !== undefined ? toBlock(selectionProp) : own
  const setSel = (b: Block | null) => {
    if (selectionProp === undefined) setOwn(b)
    onSelectionChange?.(fromBlock(b))
  }
  const inSel = (r: number, c: number) => !!sel && r >= sel.r0 && r <= sel.r1 && c >= sel.c0 && c <= sel.c1
  const span = (a: Cell, b: Cell): Block => ({
    r0: Math.min(a.row, b.row),
    r1: Math.max(a.row, b.row),
    c0: Math.min(a.col, b.col),
    c1: Math.max(a.col, b.col),
  })

  // focus
  const [cursorOwn, setCursorOwn] = React.useState<Cell | null>(
    defaultActive ? { row: defaultActive.row, col: defaultActive.column - columnStart } : null
  )
  const [hover, setHover] = React.useState<Cell | null>(null)
  const [focused, setFocused] = React.useState(false)
  const cursor = cursorOwn ?? { row: 0, col: 0 }
  const active = hover ?? (selectable && (focused || cursorOwn) ? cursor : null)
  const anchor = React.useRef<Cell>(cursor)
  const dragging = React.useRef<null | "cells" | "rows" | "cols">(null)

  const focusOf = React.useCallback(
    (a: Cell | null): AlignmentFocus | null => {
      if (!a || !shown[a.row]) return null
      const letter = (rows[a.row][a.col] ?? "-").toUpperCase()
      return {
        column: a.col + columnStart,
        sequence: shown[a.row],
        letter: GAP.test(letter) ? "-" : letter,
        position: positions[a.row][a.col] ?? null,
        consensus: stats[a.col]?.consensus ?? "-",
        identity: stats[a.col]?.identity ?? 0,
      }
    },
    [shown, rows, positions, stats, columnStart]
  )
  const onActive = React.useRef(onActiveChange)
  onActive.current = onActiveChange
  const activeKey = active ? `${active.row}:${active.col}` : ""
  React.useEffect(() => onActive.current?.(focusOf(active)), [activeKey]) // eslint-disable-line react-hooks/exhaustive-deps

  // keep the keyboard cursor in view when the alignment scrolls
  React.useEffect(() => {
    if (!focused || !cursorOwn) return
    root.current
      ?.querySelector(`[data-row="${cursorOwn.row}"][data-col="${cursorOwn.col}"]`)
      ?.scrollIntoView({ block: "nearest", inline: "nearest" })
  }, [cursorOwn, focused])

  const describe = () => {
    const f = focusOf(cursor)
    if (!f) return ""
    const what = f.letter === "-" ? "gap" : `${resolve(f.letter).label} ${f.position}`
    const block = sel
      ? `Selected columns ${sel.c0 + columnStart} to ${sel.c1 + columnStart} in ${sel.r1 - sel.r0 + 1} ${sel.r1 > sel.r0 ? "sequences" : "sequence"}. `
      : ""
    return `${block}Column ${f.column}, ${f.sequence.name}, ${what}. Consensus ${f.consensus}, ${Math.round(f.identity * 100)}% identical`
  }

  const clamp = (c: Cell): Cell => ({
    row: Math.max(0, Math.min(shown.length - 1, c.row)),
    col: Math.max(0, Math.min(length - 1, c.col)),
  })
  const onKeyDown = (e: React.KeyboardEvent) => {
    const { row, col } = cursor
    const ctrl = e.ctrlKey || e.metaKey
    let to: Cell | null = null
    if (e.key === "ArrowRight") to = { row, col: ctrl ? length - 1 : col + 1 }
    else if (e.key === "ArrowLeft") to = { row, col: ctrl ? 0 : col - 1 }
    else if (e.key === "ArrowDown") to = { row: ctrl ? shown.length - 1 : row + 1, col }
    else if (e.key === "ArrowUp") to = { row: ctrl ? 0 : row - 1, col }
    else if (e.key === "PageDown") to = { row, col: col + perBlock }
    else if (e.key === "PageUp") to = { row, col: col - perBlock }
    else if (e.key === "Home") to = { row, col: 0 }
    else if (e.key === "End") to = { row, col: length - 1 }
    else if (ctrl && e.key.toLowerCase() === "a") setSel({ r0: 0, r1: shown.length - 1, c0: 0, c1: length - 1 })
    else if (e.key === "Escape" && sel) setSel(null)
    else if (e.key === "Escape" && cursorOwn) setCursorOwn(null)
    else return
    e.preventDefault()
    if (!to) return
    const c = clamp(to)
    setHover(null)
    setCursorOwn(c)
    if (e.shiftKey) setSel(span(anchor.current, c))
    else {
      anchor.current = c
      if (sel) setSel(null)
    }
  }

  const target = (x: number, y: number) => {
    const el = document.elementFromPoint(x, y)?.closest<HTMLElement>("[data-col],[data-name-row]")
    if (!el || !root.current?.contains(el)) return null
    if (el.dataset.nameRow != null) return { kind: "rows" as const, row: Number(el.dataset.nameRow), col: null }
    const col = Number(el.dataset.col)
    if (el.dataset.row != null) return { kind: "cells" as const, row: Number(el.dataset.row), col }
    return { kind: "cols" as const, row: null, col }
  }

  const extend = (t: NonNullable<ReturnType<typeof target>>, mode: "cells" | "rows" | "cols") => {
    const a = anchor.current
    if (mode === "rows" && t.row != null) setSel({ r0: Math.min(a.row, t.row), r1: Math.max(a.row, t.row), c0: 0, c1: length - 1 })
    else if (mode === "cols" && t.col != null) setSel({ r0: 0, r1: shown.length - 1, c0: Math.min(a.col, t.col), c1: Math.max(a.col, t.col) })
    else if (mode === "cells" && t.row != null && t.col != null) setSel(span(a, { row: t.row, col: t.col }))
  }

  const onPointerDown = (e: React.PointerEvent) => {
    const t = target(e.clientX, e.clientY)
    if (!t) return
    const at = { row: t.row ?? cursor.row, col: t.col ?? cursor.col }
    setCursorOwn(at)
    if (!e.shiftKey) anchor.current = at
    dragging.current = t.kind
    if (e.pointerType === "mouse") root.current?.setPointerCapture(e.pointerId)
    extend(t, t.kind)
  }

  // the overview strip: the visible window of a scrolling alignment
  const [view, setView] = React.useState({ left: 0, frac: 1 })
  const measureView = React.useCallback(() => {
    const el = scroller.current
    if (!el || !el.scrollWidth) return
    // the columns start after the name column; map the scroll onto them
    const lead = nameW
    const cols = el.scrollWidth - lead - numW
    setView({
      left: Math.max(0, Math.min(1, el.scrollLeft / Math.max(cols, 1))),
      frac: Math.max(0.02, Math.min(1, (el.clientWidth - lead) / Math.max(cols, 1))),
    })
  }, [nameW, numW])
  React.useLayoutEffect(() => {
    if (wrap === false) measureView()
  }, [wrap, width, measureView, length])
  const showOverview = wrap === false && overview && view.frac < 1
  const [panning, setPanning] = React.useState(false)
  const [ovW, setOvW] = React.useState(0)
  const ovRef = React.useRef<HTMLDivElement>(null)
  const colW = ovW / Math.max(length, 1)
  const barW = Math.max(1, Math.round(colW * 0.7))
  React.useLayoutEffect(() => {
    const el = ovRef.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setOvW(e.contentRect.width))
    ro.observe(el)
    setOvW(el.getBoundingClientRect().width)
    return () => ro.disconnect()
  }, [showOverview])
  const panTo = (e: React.PointerEvent<HTMLDivElement>, glide = false) => {
    const el = scroller.current
    if (!el) return
    const box = e.currentTarget.getBoundingClientRect()
    const f = (e.clientX - box.left) / box.width
    const cols = el.scrollWidth - nameW - numW
    const left = f * cols - (el.clientWidth - nameW) / 2
    // a tap glides there; a drag follows the pointer exactly
    if (glide) el.scrollTo({ left, behavior: "smooth" })
    else el.scrollLeft = left
  }

  const label =
    ariaLabel ?? `Alignment of ${shown.length} sequences, ${length} columns: ${shown.map((s) => s.name).join(", ")}`
  const interactive = selectable
    ? {
        role: "slider",
        tabIndex: 0,
        "aria-label": label,
        "aria-valuemin": columnStart,
        "aria-valuemax": columnStart + length - 1,
        "aria-valuenow": cursor.col + columnStart,
        "aria-valuetext": describe(),
        onKeyDown,
        onFocus: () => setFocused(true),
        onBlur: () => setFocused(false),
        onPointerDown,
        onPointerUp: () => (dragging.current = null),
        onLostPointerCapture: () => (dragging.current = null),
        onCopy: (e: React.ClipboardEvent) => {
          const s = fromBlock(sel)
          if (!s) return
          e.clipboardData.setData("text/plain", toFasta(alignmentSlice(shown, s, columnStart)))
          e.preventDefault()
        },
      }
    : { role: "group", "aria-label": label }

  // grid rows
  const anns = annotations ?? []
  const annLanes = lanesOf(anns)
  const laneCount = anns.length ? Math.max(...annLanes) + 1 : 0
  const rulerRow = 1
  const annRow = ruler ? 2 : 1
  const barRow = annRow + laneCount
  const firstSeq = barRow + (conservation ? 1 : 0)
  const consensusRow = firstSeq + shown.length
  const lastRow = consensus ? consensusRow : consensusRow - 1
  const sticky = wrap === false && "sticky left-0 z-20 bg-[var(--alignment-bg,var(--background))]"

  const tile = (r: number, c: number, b: ResidueRange) => {
    const k = kind(r, c)
    const l = rows[r][c] ?? "-"
    const on = inSel(r, c)
    const style = { gridRow: firstSeq + r, gridColumn: c - b.start + 2 }
    if (k === "end") return <span key={`${r}:${c}`} data-row={r} data-col={c} className={S.row} style={style} />
    if (k === "gap") {
      const nextGap = c < b.end && kind(r, c + 1) === "gap"
      return (
        <span key={`${r}:${c}`} data-row={r} data-col={c} title={`${shown[r].name}, gap`} className={cn("flex items-center", S.row)} style={style}>
          <span
            className={cn("h-0.5 rounded-full", on ? "bg-foreground" : "bg-outline")}
            style={{ width: nextGap && (on === inSel(r, c + 1)) ? `calc(100% + ${STEP_GAP}px)` : "100%" }}
          />
        </span>
      )
    }
    // a selection shows its residues in full, whatever the mode
    const state = (q: number) => {
      const kq = kind(r, q)
      if (kq === "gap" || kq === "end") return null
      return inSel(r, q) ? "selected" : kq === "dot" ? null : kq
    }
    const same = (q: number) => q >= b.start && q <= b.end && state(q) != null && state(q) === state(c)
    const dot = k === "dot" && !on
    const { tone, label: name } = resolve(l)
    return (
      <Residue
        key={`${r}:${c}`}
        data-row={r}
        data-col={c}
        style={style}
        tone={dot ? null : tone}
        size={S.size}
        variant={dot ? "text" : k === "subtle" ? "subtle" : "tonal"}
        selected={on}
        active={!!active && active.row === r && active.col === c}
        join={{ start: same(c - 1), end: same(c + 1) }}
        label={`${shown[r].name}, ${name} ${positions[r][c]}`}
        className={cn("w-full min-w-0 px-0", dot && "text-muted-foreground")}
      >
        {dot ? <Icon name="fiber_manual_record" fill size={S.size === "sm" ? 10 : 12} /> : l.toUpperCase()}
      </Residue>
    )
  }

  const blockEls = blocks.map((b, bi) => {
    const n = b.end - b.start + 1
    const cols = Array.from({ length: n }, (_, k) => b.start + k)
    const selHere = sel && sel.c1 >= b.start && sel.c0 <= b.end
    return (
      <div
        key={b.start}
        className="grid w-max items-center gap-y-1"
        style={{ gridTemplateColumns: `max-content repeat(${n}, ${S.cell}px) ${numW}px`, columnGap: STEP_GAP }}
      >
        {/* the selected block, one soft shape behind its rows; tight where it runs on into the next block */}
        {selHere && (
          <span
            aria-hidden
            className="-mx-1 -my-1 self-stretch bg-foreground/[0.06] ring-1 ring-foreground/15 dark:bg-foreground/[0.09]"
            style={{
              gridColumn: `${Math.max(sel.c0, b.start) - b.start + 2} / ${Math.min(sel.c1, b.end) - b.start + 3}`,
              gridRow: `${firstSeq + sel.r0} / ${firstSeq + sel.r1 + 1}`,
              borderRadius: `${sel.c0 < b.start ? 4 : 16}px ${sel.c1 > b.end ? 4 : 16}px ${sel.c1 > b.end ? 4 : 16}px ${sel.c0 < b.start ? 4 : 16}px`,
            }}
          />
        )}
        {/* the column in focus, behind its residues */}
        {active && active.col >= b.start && active.col <= b.end && (
          <span
            aria-hidden
            className="-mx-0.5 -my-1 self-stretch rounded-md bg-foreground/[0.06] dark:bg-foreground/[0.08]"
            style={{ gridColumn: active.col - b.start + 2, gridRow: `${ruler ? rulerRow : annRow} / ${lastRow + 1}` }}
          />
        )}
        {ruler &&
          cols
            .filter((c) => c === b.start || (c + columnStart) % 10 === 0)
            .filter((c) => c === b.start || c - b.start >= 3)
            .map((c) => (
              <span
                key={`r${c}`}
                aria-hidden
                data-col={c}
                className={cn(
                  "select-none whitespace-nowrap type-label-sm tabular-nums",
                  c === b.start ? "justify-self-start" : "justify-self-center",
                  sel && c >= sel.c0 && c <= sel.c1 ? "text-foreground" : "text-muted-foreground"
                )}
                style={{ gridRow: rulerRow, gridColumn: c - b.start + 2 }}
              >
                {c + columnStart}
              </span>
            ))}
        {/* selection ends on the ruler */}
        {ruler &&
          sel &&
          [sel.c0, sel.c1]
            .filter((c, i, a) => c >= b.start && c <= b.end && a.indexOf(c) === i)
            .map((c) => (
              <span
                key={`s${c}`}
                aria-hidden
                className="z-10 min-w-9 justify-self-center rounded-full bg-foreground px-1.5 text-center type-label-sm text-background tabular-nums"
                style={{ gridRow: rulerRow, gridColumn: c - b.start + 2 }}
              >
                {c + columnStart}
              </span>
            ))}
        {laneCount > 0 && (
          <span aria-hidden className={cn("select-none pr-3 type-label-sm text-muted-foreground", sticky)} style={{ gridRow: `${annRow} / span ${laneCount}`, gridColumn: 1 }}>
            Features
          </span>
        )}
        {anns.map((a, i) => {
          const s = a.start - columnStart
          const e = a.end - columnStart
          if (e < b.start || s > b.end) return null
          const cs = Math.max(s, b.start)
          const ce = Math.min(e, b.end)
          const color = a.color ?? ORDER[i % ORDER.length]
          const point = s === e
          const w = (ce - cs + 1) * (S.cell + STEP_GAP) - STEP_GAP
          const fits = !!a.label && (point || a.label.length * 6.6 + 12 < w)
          const l = s < b.start ? 3 : 10
          const rr = e > b.end ? 3 : 10
          return (
            <span
              key={`a${i}`}
              data-col={cs}
              title={a.description ?? (a.label ? `${a.label}, columns ${a.start} to ${a.end}` : undefined)}
              className={cn(
                "flex h-5 items-center justify-center overflow-hidden whitespace-nowrap px-1.5 type-label-sm font-semibold",
                point && "min-w-[max(2.5rem,max-content)] justify-self-center rounded-full"
              )}
              style={{
                gridRow: annRow + annLanes[i],
                gridColumn: `${cs - b.start + 2} / ${ce - b.start + 3}`,
                background: fill(color),
                color: ink(color),
                borderRadius: point ? undefined : `${l}px ${rr}px ${rr}px ${l}px`,
              }}
            >
              {fits ? a.label : ""}
            </span>
          )
        })}
        {conservation && (
          <>
            <span aria-hidden className={cn("select-none pr-3 type-label-sm text-muted-foreground", sticky)} style={{ gridRow: barRow, gridColumn: 1 }}>
              Identity
            </span>
            {cols.map((c) => {
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
                    className={cn("w-1.5 rounded-full", id >= 1 ? "bg-foreground" : id >= threshold ? "bg-muted-foreground" : "bg-outline-variant")}
                    style={{ height: Math.max(3, id * S.bar) }}
                  />
                </span>
              )
            })}
          </>
        )}
        {shown.map((s, r) => {
          const last = positions[r].slice(0, b.end + 1).reduce<number | null>((m, p) => (p != null ? p : m), null)
          const rowOn = !!sel && r >= sel.r0 && r <= sel.r1
          return (
            <React.Fragment key={idOf(s)}>
              <div
                ref={bi === 0 && r === 0 ? nameCell : undefined}
                data-name-row={r}
                title={s.description ?? s.name}
                className={cn(
                  "flex max-w-[18ch] select-none items-center gap-2 self-stretch pr-3 type-label-md",
                  selectable && "cursor-pointer",
                  sticky
                )}
                style={{ gridRow: firstSeq + r, gridColumn: 1 }}
              >
                <span
                  className={cn(
                    "truncate text-foreground",
                    (rowOn || (r === ref && (colorBy === "difference" || identity))) && "font-semibold",
                    active?.row === r && "underline decoration-2 underline-offset-4"
                  )}
                >
                  {s.name}
                </span>
                {identity && (
                  <span className="ml-auto shrink-0 type-label-sm text-muted-foreground tabular-nums">
                    {r === ref ? "ref" : `${Math.round(shownIdentity[r] * 100)}%`}
                  </span>
                )}
              </div>
              {cols.map((c) => tile(r, c, b))}
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
            <span className={cn("select-none pr-3 type-label-md text-muted-foreground", sticky)} style={{ gridRow: consensusRow, gridColumn: 1 }}>
              Consensus
            </span>
            {cols.map((c) => {
              const { consensus: l, identity: id } = stats[c]
              const style = { gridRow: consensusRow, gridColumn: c - b.start + 2 }
              if (l === "-") return <span key={`c${c}`} data-col={c} className={S.row} style={style} />
              const strong = id >= threshold
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
                  label={`Consensus ${resolve(l).label}, ${Math.round(id * 100)}% identical`}
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
  })

  return (
    <div
      ref={root}
      data-slot="sequence-alignment"
      className={cn(
        "grid w-full min-w-0 gap-4 outline-none",
        selectable && "cursor-cell select-none rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring",
        className
      )}
      onPointerMove={(e) => {
        const t = target(e.clientX, e.clientY)
        setHover(t && t.kind === "cells" ? { row: t.row, col: t.col } : null)
        if (dragging.current && t) extend(t, dragging.current)
      }}
      onPointerLeave={() => setHover(null)}
      {...interactive}
      {...props}
    >
      {showOverview && (
        <div
          ref={ovRef}
          aria-hidden
          className="relative h-7 cursor-grab touch-none select-none active:cursor-grabbing"
          style={{ marginLeft: nameW, marginRight: numW }}
          onPointerDown={(e) => {
            e.stopPropagation()
            e.currentTarget.setPointerCapture(e.pointerId)
            setPanning(true)
            panTo(e, true)
          }}
          onPointerMove={(e) => {
            e.stopPropagation()
            if (e.buttons) panTo(e)
          }}
          onPointerUp={() => setPanning(false)}
          onPointerCancel={() => setPanning(false)}
        >
          {sel && (
            <span
              className="absolute inset-y-0 rounded-sm bg-foreground/15"
              style={{ left: `${(sel.c0 / length) * 100}%`, width: `${((sel.c1 - sel.c0 + 1) / length) * 100}%` }}
            />
          )}
          {stats.map((s, c) => (
            <span
              key={c}
              className={cn(
                "absolute bottom-0 rounded-full",
                s.identity >= 1 ? "bg-foreground" : s.identity >= threshold ? "bg-muted-foreground" : "bg-outline-variant"
              )}
              style={{
                // whole pixels, so every bar is exactly as thick as the next
                left: ovW ? Math.round(c * colW + (colW - barW) / 2) : `${((c + 0.15) / length) * 100}%`,
                width: ovW ? barW : `${(0.7 / length) * 100}%`,
                height: `${Math.max(1.5, s.identity * 18) * 5}%`,
              }}
            />
          ))}
          <span
            className={cn(
              "absolute -inset-y-1 rounded-md ring-2 ring-foreground/70",
              !panning && "transition-[left,width] duration-200 ease-(--ease-standard) motion-reduce:transition-none"
            )}
            style={{ left: `${view.left * 100}%`, width: `${view.frac * 100}%` }}
          />
        </div>
      )}
      <div
        ref={scroller}
        className={cn("grid min-w-0 gap-6", wrap === false && "overflow-x-auto pb-2 focus-visible:outline-2 focus-visible:outline-ring")}
        tabIndex={wrap === false ? 0 : undefined}
        role={wrap === false ? "region" : undefined}
        aria-label={wrap === false ? `${label}, scrolls sideways` : undefined}
        onScroll={wrap === false ? measureView : undefined}
      >
        {blockEls}
      </div>
    </div>
  )
}

export { SequenceAlignment, type SequenceAlignmentProps }
