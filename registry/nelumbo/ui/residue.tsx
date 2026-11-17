"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Nelumbo Residue
 *
 * The shared core of the biology components (Nucleotide, AminoAcid and their
 * sequences): a letter on a small rounded tile, colored by what it is.
 *
 * Color is one tone system, not a list of hex codes. A scheme only says which
 * hue a letter takes (and, rarely, how strong or how light). The lightness and
 * chroma come from the variant and the theme, the same steps for every hue, so
 * every scheme reads as one even family next to Nelumbo's accent palette, and
 * the letter keeps AA contrast on its tile in light and dark.
 *
 *   <Residue tone={{ hue: 149 }} label="Adenine">A</Residue>
 *   <ResidueSequence letters={[..."GATTACA"]} resolve={...} groupSize={10} ruler />
 *
 * Variants:
 * - "tonal" (default): a clear pastel tile with a deep ink in the same hue.
 * - "solid": the full-strength tile. Used for selection.
 * - "subtle": a faint tile, for context around a highlight.
 * - "text": no tile, colored letters, for long runs of sequence.
 */

/** Where a letter sits on the color wheel. */
export type ResidueTone = {
  /** OKLCH hue, 0 to 360. */
  hue: number
  /** 0 is gray, 1 is the standard strength. Default 1. */
  chroma?: number
  /** -1 (darker) to 1 (lighter): keeps lightness-coded schemes (Okabe and Ito) apart. Default 0. */
  shade?: number
}

/** Nelumbo's accent hues, for building schemes that sit with the palette. */
export const RESIDUE_HUES = {
  red: 27,
  orange: 42,
  amber: 58,
  green: 149,
  cyan: 222,
  blue: 264,
  purple: 295,
  pink: 1,
} as const

const VARIANTS = {
  // --rbl/--rbc: tile lightness/chroma, --ril/--ric: ink, --rsd: how far `shade` moves the tile
  tonal:
    "[--rbl:0.885] [--rbc:0.085] [--ril:0.36] [--ric:0.11] [--rsd:0.06] dark:[--rbl:0.42] dark:[--rbc:0.09] dark:[--ril:0.96] dark:[--ric:0.05] dark:[--rsd:0.06]",
  solid:
    "[--rbl:0.7] [--rbc:0.16] [--ril:0.2] [--ric:0.05] [--rsd:0.04] dark:[--rbl:0.82] dark:[--rbc:0.13] dark:[--ril:0.22] dark:[--ric:0.05] dark:[--rsd:0.05]",
  subtle:
    "[--rbl:0.955] [--rbc:0.025] [--ril:0.48] [--ric:0.09] [--rsd:0.015] dark:[--rbl:0.27] dark:[--rbc:0.035] dark:[--ril:0.8] dark:[--ric:0.07] dark:[--rsd:0.02]",
  text: "[--ril:0.48] [--ric:0.15] dark:[--ril:0.82] dark:[--ric:0.13] [--rsd:0]",
}

// --ro: an outer corner, --ri: a corner joined to its neighbor, --rf: fully round (selected ends)
const SIZES = {
  sm: "h-5 min-w-4 px-0.5 text-[0.6875rem] [--ro:6px] [--ri:2px] [--rf:10px]",
  default: "h-7 min-w-6 px-1 text-[0.8125rem] [--ro:9px] [--ri:3px] [--rf:14px]",
  lg: "h-12 min-w-10 px-1.5 text-[1.25rem] [--ro:14px] [--ri:4px] [--rf:24px]",
}

export type ResidueVariant = keyof typeof VARIANTS
export type ResidueSize = keyof typeof SIZES

const tile =
  "relative inline-flex shrink-0 select-text items-center justify-center font-mono font-semibold leading-none tabular-nums" +
  " bg-[color:oklch(calc(var(--rbl)+var(--rs,0)*var(--rsd))_calc(var(--rbc)*var(--rk,1))_var(--rh,0))]" +
  " text-[color:oklch(var(--ril)_calc(var(--ric)*var(--rk,1))_var(--rh,0))]" +
  " rounded-l-[var(--rl)] rounded-r-[var(--rr)]" +
  " transition-[border-radius,background-color,color,outline-color] duration-500 ease-spring motion-reduce:transition-none" +
  " outline-2 outline-offset-1 outline-transparent data-[active=true]:outline-foreground/70"

type ResidueProps = Omit<React.ComponentProps<"span">, "children"> & {
  children: React.ReactNode
  /** The letter's hue. `null` is a neutral gray tile. */
  tone?: ResidueTone | null
  variant?: ResidueVariant
  size?: ResidueSize
  /** Selected tiles turn solid and round off, on a spring. */
  selected?: boolean
  /** Outlined: the residue under the pointer or the keyboard cursor. */
  active?: boolean
  /** The full name, shown on hover ("Adenine"). */
  label?: string
  /**
   * Which sides touch a neighbor, as in a connected button group: joined
   * corners tighten, the run's outer ends stay round. Sequences set this.
   */
  join?: { start?: boolean; end?: boolean }
}

function Residue({
  tone,
  variant = "tonal",
  size = "default",
  selected = false,
  active = false,
  label,
  join,
  className,
  style,
  children,
  ...props
}: ResidueProps) {
  const v = selected ? "solid" : variant
  const edge = selected ? "var(--rf)" : "var(--ro)"
  return (
    <span
      data-slot="residue"
      data-variant={v}
      data-selected={selected}
      data-active={active}
      title={label}
      className={cn(tile, VARIANTS[v], SIZES[size], v === "text" && "bg-transparent", className)}
      style={
        {
          "--rh": tone?.hue ?? 0,
          "--rk": tone ? (tone.chroma ?? 1) : 0,
          "--rs": tone?.shade ?? 0,
          "--rl": join?.start ? "var(--ri)" : edge,
          "--rr": join?.end ? "var(--ri)" : edge,
          ...style,
        } as React.CSSProperties
      }
      {...props}
    >
      {children}
    </span>
  )
}

/** A selected stretch of a sequence, in 1-based positions, inclusive. */
export type ResidueRange = { start: number; end: number }

const ordered = (a: number, b: number): ResidueRange => ({ start: Math.min(a, b), end: Math.max(a, b) })
const within = (p: number, r?: ResidueRange | null) => !!r && p >= r.start && p <= r.end

type ResidueSequenceProps = Omit<React.ComponentProps<"div">, "children" | "onSelect"> & {
  /** One entry per residue, as shown: "A", "Ala", "-". */
  letters: string[]
  /** The tone and full name of a letter. */
  resolve: (letter: string) => { tone: ResidueTone | null; label: string }
  variant?: ResidueVariant
  size?: ResidueSize
  /** Residues per block. Blocks wrap as a whole. Default 10; 0 for one block. */
  groupSize?: number
  /** Numbers each block with the position of its first residue. */
  ruler?: boolean
  /** The position of the first residue. Default 1. */
  start?: number
  /** Stretches to bring forward: everything else fades to the subtle variant. */
  highlight?: ResidueRange[]
  /**
   * "connected" (default): each block is one shape, tight corners between
   * residues and round ends, and a selection becomes its own capsule.
   * "separate": every tile keeps all four corners round.
   */
  shape?: "connected" | "separate"
  /** Something under each residue (the complementary base, say). `join` matches the tile's. */
  below?: (letter: string, position: number, join: { start: boolean; end: boolean }) => React.ReactNode
  /** Something under each block (the amino acid a codon makes, say). */
  footer?: (block: ResidueRange) => React.ReactNode
  /** Turns on pointer and keyboard selection. */
  selectable?: boolean
  selection?: ResidueRange | null
  defaultSelection?: ResidueRange | null
  onSelectionChange?: (selection: ResidueRange | null) => void
  /** The residue under the pointer, or the keyboard cursor while focused. */
  onActiveChange?: (position: number | null) => void
  /** "base" or "residue": how a position is spoken. */
  unit?: string
}

/**
 * A sequence as rows of tiles, in blocks that wrap together, with an optional
 * ruler. Copying the text gives the plain letters (the ruler and anything
 * `below` are not selectable).
 *
 * With `selectable`, the sequence is one keyboard stop, like a chart: arrows
 * move the cursor, Shift extends the selection, PageUp and PageDown jump a
 * block, Home and End go to the ends, Escape clears. Drag or Shift-click with
 * the pointer.
 */
function ResidueSequence({
  letters,
  resolve,
  variant = "tonal",
  size = "default",
  groupSize = 10,
  ruler = false,
  start = 1,
  highlight,
  shape = "connected",
  below,
  footer,
  selectable = false,
  selection: selectionProp,
  defaultSelection = null,
  onSelectionChange,
  onActiveChange,
  unit = "residue",
  className,
  ...props
}: ResidueSequenceProps) {
  const [own, setOwn] = React.useState<ResidueRange | null>(defaultSelection)
  const selection = selectionProp !== undefined ? selectionProp : own
  const setSelection = React.useCallback(
    (r: ResidueRange | null) => {
      if (selectionProp === undefined) setOwn(r)
      onSelectionChange?.(r)
    },
    [selectionProp, onSelectionChange]
  )
  const [cursor, setCursor] = React.useState<number>(selection?.end ?? start)
  const [anchor, setAnchor] = React.useState<number>(selection?.start ?? start)
  const [hover, setHover] = React.useState<number | null>(null)
  const [focused, setFocused] = React.useState(false)
  const dragging = React.useRef(false)

  const last = start + letters.length - 1
  const active = hover ?? (focused && selectable ? cursor : null)
  const onActive = React.useRef(onActiveChange)
  onActive.current = onActiveChange
  React.useEffect(() => onActive.current?.(active), [active])

  const size_ = groupSize > 0 ? groupSize : letters.length || 1
  const blocks: ResidueRange[] = []
  for (let i = 0; i < letters.length; i += size_) blocks.push({ start: start + i, end: Math.min(start + i + size_ - 1, last) })

  const posAt = (x: number, y: number) => {
    const el = document.elementFromPoint(x, y)?.closest<HTMLElement>("[data-pos]")
    return el ? Number(el.dataset.pos) : null
  }

  const describe = () => {
    if (selection && selection.end > selection.start) {
      const n = selection.end - selection.start + 1
      return `${selection.start} to ${selection.end}, ${n} ${unit}s selected`
    }
    const p = selection?.start ?? cursor
    const letter = letters[p - start]
    return letter ? `${unit[0].toUpperCase()}${unit.slice(1)} ${p}, ${resolve(letter).label}` : ""
  }

  const move = (to: number, extend: boolean) => {
    const p = Math.max(start, Math.min(last, to))
    setCursor(p)
    if (extend) setSelection(ordered(anchor, p))
    else {
      setAnchor(p)
      setSelection({ start: p, end: p })
    }
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    const steps: Record<string, number> = {
      ArrowRight: 1,
      ArrowLeft: -1,
      ArrowDown: size_,
      ArrowUp: -size_,
      PageDown: size_,
      PageUp: -size_,
    }
    if (e.key in steps) move(cursor + steps[e.key], e.shiftKey)
    else if (e.key === "Home") move(start, e.shiftKey)
    else if (e.key === "End") move(last, e.shiftKey)
    else if (e.key === "Escape" && selection) setSelection(null)
    else return
    e.preventDefault()
  }

  const interactive = selectable
    ? {
        role: "slider",
        tabIndex: 0,
        "aria-valuemin": start,
        "aria-valuemax": last,
        "aria-valuenow": cursor,
        "aria-valuetext": describe(),
        onKeyDown,
        onFocus: () => setFocused(true),
        onBlur: () => setFocused(false),
        onPointerDown: (e: React.PointerEvent) => {
          const p = posAt(e.clientX, e.clientY)
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
    : {}

  return (
    <div
      data-slot="residue-sequence"
      className={cn(
        "flex flex-wrap items-start gap-y-3 outline-none",
        size === "sm" ? "gap-x-2" : size === "lg" ? "gap-x-4" : "gap-x-3",
        selectable && "cursor-pointer select-none touch-pan-y rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring",
        className
      )}
      onPointerMove={(e) => {
        const p = posAt(e.clientX, e.clientY)
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
      {...props}
    >
      {blocks.map((b) => (
        <div key={b.start} className="flex flex-col gap-1">
          {ruler && (
            <span aria-hidden className="select-none px-0.5 type-label-sm text-muted-foreground tabular-nums">
              {b.start}
            </span>
          )}
          <div className={cn("flex", size === "sm" && shape === "separate" ? "gap-px" : "gap-0.5")}>
            {Array.from({ length: b.end - b.start + 1 }, (_, k) => {
              const p = b.start + k
              const letter = letters[p - start]
              const { tone, label } = resolve(letter)
              const faded = !!highlight?.length && !highlight.some((r) => within(p, r))
              // a neighbor joins when it is in the block and in the same state (selected, faded)
              const state = (q: number) => `${within(q, selection)}${!!highlight?.length && !highlight.some((r) => within(q, r))}`
              const join =
                shape === "connected"
                  ? { start: p > b.start && state(p - 1) === state(p), end: p < b.end && state(p + 1) === state(p) }
                  : { start: false, end: false }
              const tileEl = (
                <Residue
                  key={p}
                  data-pos={p}
                  tone={tone}
                  label={`${label}, ${p}`}
                  size={size}
                  variant={faded ? "subtle" : variant}
                  selected={within(p, selection)}
                  active={active === p}
                  join={join}
                >
                  {letter}
                </Residue>
              )
              if (!below) return tileEl
              return (
                <span key={p} className="flex flex-col items-center gap-0.5">
                  {tileEl}
                  <span aria-hidden className="select-none">
                    {below(letter, p, join)}
                  </span>
                </span>
              )
            })}
          </div>
          {footer && <div className="select-none">{footer(b)}</div>}
        </div>
      ))}
    </div>
  )
}

export { Residue, ResidueSequence, type ResidueProps, type ResidueSequenceProps }
