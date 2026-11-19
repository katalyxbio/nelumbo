"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { AMINO_ACIDS, aminoAcidTone, type AminoAcidScheme } from "@/registry/nelumbo/ui/amino-acid"
import { cleanSequence, complement, nucleotideTone, translateCodon, type NucleotideScheme } from "@/registry/nelumbo/ui/nucleotide"
import { Icon } from "@/registry/nelumbo/ui/icon"
import { Residue } from "@/registry/nelumbo/ui/residue"

/**
 * Nelumbo Translation
 *
 * DNA with its protein underneath: each amino acid a tile as wide as its
 * codon, so you can read a base, its codon and the residue it makes at once.
 *
 *   <Translation sequence="ATGGAGGAGCCGCAGTCAGATCC..." />                  // the first frame
 *   <Translation sequence={cds} frames={6} orfs={{ minLength: 50 }} />      // all six, open frames lit
 *
 * - `frames`: 1 (the coding frame, from `codonStart`), 3 (the forward frames)
 *   or 6 (forward under the top strand, reverse under the bottom strand, read
 *   right to left as the ribosome would).
 * - `orfs` fades every residue outside an open reading frame (ATG to stop).
 * - Lines wrap to the width in whole codons; a codon that runs past the end
 *   of a line splits, its letter on the part that holds most of it.
 * - `selectable` makes the bases one keyboard stop, like a sequence: arrows
 *   move a base (up and down a line), Shift extends, Escape clears. Drag with
 *   the pointer, or click a residue to select its codon. Copying gives the bases.
 */

export type TranslationFrame = 1 | 2 | 3 | -1 | -2 | -3
export type TranslationRange = { start: number; end: number }

/** A codon in a frame, in top-strand positions. */
export type Codon = {
  frame: TranslationFrame
  /** The lowest top-strand position of the codon, 1-based. */
  start: number
  /** One letter, "*" for stop. */
  aa: string
  /** The codon as read, 5' to 3' on its own strand. */
  codon: string
  /** The residue's number in the frame, from 1. */
  index: number
}

export type OpenReadingFrame = {
  frame: TranslationFrame
  /** Top-strand positions, the start codon to the stop (inclusive). */
  start: number
  end: number
  /** In codons, the stop included. */
  length: number
  /** No stop before the end of the sequence. */
  open?: boolean
}

/** Every whole codon in a frame. Reverse frames count from the 3' end, as the reverse complement reads. */
export function frameCodons(sequence: string, frame: TranslationFrame): Codon[] {
  const s = cleanSequence(sequence)
  const L = s.length
  const out: Codon[] = []
  const off = Math.abs(frame) - 1
  for (let k = 0; ; k++) {
    if (frame > 0) {
      const a = off + k * 3
      if (a + 3 > L) break
      const codon = s.slice(a, a + 3)
      out.push({ frame, start: a + 1, aa: translateCodon(codon), codon, index: k + 1 })
    } else {
      const hi = L - off - k * 3 // the codon's last top-strand position
      if (hi - 3 < 0) break
      const codon = [...s.slice(hi - 3, hi)].reverse().map((b) => complement(b)).join("")
      out.push({ frame, start: hi - 2, aa: translateCodon(codon), codon, index: k + 1 })
    }
  }
  return out
}

/** Open reading frames, ATG to the stop that ends them (inclusive), at least `minLength` codons. */
export function findOrfs(sequence: string, { frames = [1, 2, 3, -1, -2, -3] as TranslationFrame[], minLength = 30 } = {}) {
  const out: OpenReadingFrame[] = []
  for (const frame of frames) {
    const cs = frameCodons(sequence, frame)
    let open: number | null = null
    cs.forEach((c, i) => {
      if (open == null && c.aa === "M") open = i
      else if (open != null && c.aa === "*") {
        const n = i - open + 1
        if (n >= minLength) {
          const ps = [cs[open].start, c.start]
          out.push({ frame, start: Math.min(...ps), end: Math.max(...ps) + 2, length: n })
        }
        open = null
      }
    })
    // a frame still open at the end runs off the sequence: kept, marked open
    if (open != null && cs.length - open >= minLength) {
      const ps = [cs[open].start, cs[cs.length - 1].start]
      out.push({ frame, start: Math.min(...ps), end: Math.max(...ps) + 2, length: cs.length - open, open: true })
    }
  }
  return out.sort((a, b) => b.length - a.length)
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
  sm: { cell: 13, base: "text-[0.6875rem] h-4", tile: "sm" as const, row: "h-5" },
  default: { cell: 17, base: "text-[0.8125rem] h-5", tile: "default" as const, row: "h-7" },
}

const ordered = (a: number, b: number): TranslationRange => ({ start: Math.min(a, b), end: Math.max(a, b) })
const within = (p: number, r?: TranslationRange | null) => !!r && p >= r.start && p <= r.end

type TranslationProps = Omit<React.ComponentProps<"div">, "children"> & {
  sequence: string
  /** 1: the coding frame. 3: the forward frames. 6: all six. Default 1. */
  frames?: 1 | 3 | 6
  /** With frames={1}: which base the first codon starts on. Default 1. */
  codonStart?: 1 | 2 | 3
  /** The bottom strand, 3' to 5' under the top. On with six frames. */
  complement?: boolean
  /** The number of the first base. Default 1. */
  start?: number
  scheme?: NucleotideScheme
  aminoScheme?: AminoAcidScheme
  /** "one" (default) or "three"-letter residues. */
  notation?: "one" | "three"
  /** Fade residues outside open reading frames of at least minLength codons (default 30). */
  orfs?: boolean | { minLength?: number }
  /** Bases a line: "auto" (default) fits the width in whole codons. */
  lineLength?: "auto" | number
  size?: keyof typeof SIZES
  selectable?: boolean
  selection?: TranslationRange | null
  defaultSelection?: TranslationRange | null
  onSelectionChange?: (selection: TranslationRange | null) => void
  /** The base under the pointer or cursor, or the codon under the pointer. */
  onActiveChange?: (focus: { position: number; codon?: Codon } | null) => void
}

function Translation({
  sequence,
  frames = 1,
  codonStart = 1,
  complement: showComplement,
  start = 1,
  scheme = "nelumbo",
  aminoScheme = "nelumbo",
  notation = "one",
  orfs = false,
  lineLength = "auto",
  size = "default",
  selectable = false,
  selection: selectionProp,
  defaultSelection = null,
  onSelectionChange,
  onActiveChange,
  className,
  "aria-label": ariaLabel,
  ...props
}: TranslationProps) {
  const S = SIZES[size]
  const seq = React.useMemo(() => cleanSequence(sequence).replace(/[^A-Z]/g, ""), [sequence])
  const L = seq.length
  const last = start + L - 1
  const bottom = showComplement ?? frames === 6

  const frameList: TranslationFrame[] = frames === 6 ? [1, 2, 3, -1, -2, -3] : frames === 3 ? [1, 2, 3] : [codonStart]
  const codons = React.useMemo(() => {
    const m = new Map<TranslationFrame, Codon[]>()
    for (const f of frameList) m.set(f, frameCodons(seq, f))
    return m
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seq, frames, codonStart])
  const orfList = React.useMemo(
    () => (orfs ? findOrfs(seq, { frames: frameList, minLength: typeof orfs === "object" ? (orfs.minLength ?? 30) : 30 }) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [seq, orfs, frames, codonStart]
  )
  const inOrf = (c: Codon) => orfList.some((o) => o.frame === c.frame && c.start >= o.start && c.start + 2 <= o.end)

  // ---- lines
  const [ref, width] = useWidth()
  const gutter = String(last).length * 8 + 14
  const perLine = React.useMemo(() => {
    if (typeof lineLength === "number") return Math.max(3, lineLength)
    if (!width) return 60
    const fit = Math.floor((width - gutter) / S.cell)
    // whole codons, and in fives of them where there is room, so lines start on round numbers
    return fit >= 15 ? Math.floor(fit / 15) * 15 : Math.max(9, Math.floor(fit / 3) * 3)
  }, [lineLength, width, gutter, S.cell])
  const lines: TranslationRange[] = []
  for (let i = 0; i < L; i += perLine) lines.push({ start: i + 1, end: Math.min(i + perLine, L) })

  // ---- focus and selection (in sequence positions, 1..L; shown offset by start - 1)
  const [own, setOwn] = React.useState<TranslationRange | null>(defaultSelection)
  const selection = selectionProp !== undefined ? selectionProp : own
  const setSelection = (r: TranslationRange | null) => {
    if (selectionProp === undefined) setOwn(r)
    onSelectionChange?.(r)
  }
  const sel = selection ? { start: selection.start - start + 1, end: selection.end - start + 1 } : null
  const [cursor, setCursor] = React.useState(sel?.end ?? 1)
  const [anchor, setAnchor] = React.useState(sel?.start ?? 1)
  const [hoverBase, setHoverBase] = React.useState<number | null>(null)
  const [hoverCodon, setHoverCodon] = React.useState<Codon | null>(null)
  const [focused, setFocused] = React.useState(false)
  const dragging = React.useRef(false)
  const activeBase = hoverBase ?? (focused && selectable ? cursor : null)
  const cb = React.useRef(onActiveChange)
  cb.current = onActiveChange
  React.useEffect(() => {
    cb.current?.(hoverCodon ? { position: hoverCodon.start + start - 1, codon: hoverCodon } : activeBase != null ? { position: activeBase + start - 1 } : null)
  }, [hoverCodon, activeBase, start])

  const setSel = (r: TranslationRange | null) => setSelection(r ? { start: r.start + start - 1, end: r.end + start - 1 } : null)
  const move = (to: number, extend: boolean) => {
    const p = Math.max(1, Math.min(L, to))
    setCursor(p)
    if (extend) setSel(ordered(anchor, p))
    else {
      setAnchor(p)
      setSel({ start: p, end: p })
    }
  }
  const onKeyDown = (e: React.KeyboardEvent) => {
    const steps: Record<string, number> = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: perLine, ArrowUp: -perLine, PageDown: perLine * 4, PageUp: -perLine * 4 }
    if (e.key in steps) move(cursor + steps[e.key], e.shiftKey)
    else if (e.key === "Home") move(1, e.shiftKey)
    else if (e.key === "End") move(L, e.shiftKey)
    else if (e.key === "Escape" && selection) setSelection(null)
    else return
    e.preventDefault()
  }
  const posAt = (x: number, y: number) => {
    const el = document.elementFromPoint(x, y)?.closest<HTMLElement>("[data-base]")
    return el ? Number(el.dataset.base) : null
  }

  const describe = () => {
    if (sel && sel.end > sel.start) {
      const n = sel.end - sel.start + 1
      return `Bases ${selection!.start} to ${selection!.end}, ${n} selected`
    }
    const p = sel?.start ?? cursor
    const c = codons.get(frameList[0])?.find((c) => p >= c.start && p <= c.start + 2)
    const name = c ? `, codon ${c.codon}, ${AMINO_ACIDS[c.aa]?.name ?? "unknown"} ${c.index}` : ""
    return `Base ${p + start - 1}, ${nucleotideTone(seq[p - 1] ?? "N").label}${name}`
  }

  const label =
    ariaLabel ??
    `Translation of ${L} bases in ${frames === 1 ? "one frame" : `${frames} frames`}: ${(codons.get(frameList[0]) ?? [])
      .map((c) => c.aa)
      .join("")
      .slice(0, 80)}`

  const tile = (c: Codon, lineStart: number, lineEnd: number) => {
    const a = Math.max(c.start, lineStart)
    const b = Math.min(c.start + 2, lineEnd)
    if (a > b) return null
    const here = b - a + 1
    const split = here < 3
    // the letter goes on the part with most of the codon
    const letterHere = here >= 2
    const { tone, label: name, info } = aminoAcidTone(c.aa, aminoScheme)
    const stop = c.aa === "*"
    const faded = orfList.length > 0 && !inOrf(c)
    const selected = !!sel && c.start >= sel.start && c.start + 2 <= sel.end
    const isActive = hoverCodon === c
    // neighbors in the frame join, as residues in a sequence do, while they share a state; stops stand alone
    const state = (d: Codon) => `${d.aa === "*"}${orfList.length > 0 && !inOrf(d)}${!!sel && d.start >= sel.start && d.start + 2 <= sel.end}`
    const at = (q: number) => (codons.get(c.frame) ?? [])[q]
    const i = c.frame > 0 ? c.index - 1 : c.index - 1
    const leftN = c.frame > 0 ? at(i - 1) : at(i + 1)
    const rightN = c.frame > 0 ? at(i + 1) : at(i - 1)
    const joinStart = c.start < lineStart || (!!leftN && leftN.start >= lineStart && !stop && state(leftN) === state(c))
    const joinEnd = c.start + 2 > lineEnd || (!!rightN && rightN.start + 2 <= lineEnd && !stop && state(rightN) === state(c))
    const text = notation === "three" && info && !split ? info.three : c.aa
    return (
      <Residue
        key={`${c.frame}-${c.start}`}
        tone={tone}
        size={S.tile}
        variant={stop ? "solid" : faded ? "subtle" : "tonal"}
        selected={selected && !stop}
        active={isActive}
        label={`${name} ${c.index}, ${c.codon}, frame ${c.frame > 0 ? "+" : ""}${c.frame}`}
        join={{ start: joinStart, end: joinEnd }}
        data-codon=""
        onPointerEnter={() => setHoverCodon(c)}
        onPointerLeave={() => setHoverCodon((h) => (h === c ? null : h))}
        onClick={
          selectable
            ? () => {
                setAnchor(c.start)
                setCursor(c.start + 2)
                setSel({ start: c.start, end: c.start + 2 })
              }
            : undefined
        }
        className={cn("mx-px min-w-0 px-0", selectable && "cursor-pointer", stop && "bg-foreground/80 text-background dark:bg-foreground/85")}
        style={{ gridColumn: `${a - lineStart + 2} / span ${here}` }}
      >
        {letterHere ? stop ? <Icon name="asterisk" size={S.tile === "sm" ? 12 : 14} weight={600} /> : text : ""}
      </Residue>
    )
  }

  const baseCls = cn("flex items-center justify-center font-mono font-semibold leading-none", S.base)
  const tint = (b: string) => {
    const t = nucleotideTone(b, scheme).tone
    return { "--rh": t?.hue ?? 0, "--rk": t ? (t.chroma ?? 1) : 0, "--rs": t?.shade ?? 0 } as React.CSSProperties
  }
  const ink =
    "text-[color:oklch(calc(var(--bl)+var(--rs,0)*0.06)_calc(var(--bc)*var(--rk,1))_var(--rh,0))] [--bl:0.48] [--bc:0.15] dark:[--bl:0.82] dark:[--bc:0.13]"

  const frameName = (f: TranslationFrame) => `${f > 0 ? "+" : "−"}${Math.abs(f)}`

  return (
    <div data-slot="translation" className={cn("w-full min-w-0 [contain:inline-size]", className)} {...props}>
      <div
        ref={ref}
        className={cn(
          "grid gap-4 outline-none",
          selectable && "cursor-text touch-pan-y select-none rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
        )}
        onPointerMove={(e) => {
          const p = posAt(e.clientX, e.clientY)
          setHoverBase(p)
          if (dragging.current && p != null && selectable) {
            setCursor(p)
            setSel(ordered(anchor, p))
          }
        }}
        onPointerLeave={() => {
          setHoverBase(null)
          dragging.current = false
        }}
        onPointerUp={() => (dragging.current = false)}
        onCopy={(e) => {
          if (!sel) return
          e.preventDefault()
          e.clipboardData.setData("text/plain", seq.slice(sel.start - 1, sel.end))
        }}
        {...(selectable
          ? {
              role: "slider",
              tabIndex: 0,
              "aria-label": label,
              "aria-valuemin": start,
              "aria-valuemax": last,
              "aria-valuenow": cursor + start - 1,
              "aria-valuetext": describe(),
              onKeyDown,
              onFocus: () => setFocused(true),
              onBlur: () => setFocused(false),
              onPointerDown: (e: React.PointerEvent) => {
                if ((e.target as Element).closest("[data-codon]")) return
                const p = posAt(e.clientX, e.clientY)
                if (p == null) return
                dragging.current = true
                setCursor(p)
                if (e.shiftKey) setSel(ordered(anchor, p))
                else {
                  setAnchor(p)
                  setSel({ start: p, end: p })
                }
              },
            }
          : { role: "group", "aria-label": label })}
      >
        {lines.map((line) => {
          const cols = `${gutter}px repeat(${line.end - line.start + 1}, ${S.cell}px)`
          const fwd = frameList.filter((f) => f > 0)
          const rev = frameList.filter((f) => f < 0)
          const row = (f: TranslationFrame) => (
            <div key={f} className="grid items-center gap-y-0.5" style={{ gridTemplateColumns: cols }} aria-hidden>
              <span
                className={cn(
                  "mr-2 select-none justify-self-end rounded-full bg-surface-container-high px-1.5 py-0.5 type-label-sm tabular-nums text-muted-foreground",
                  frames === 1 && "invisible"
                )}
              >
                {frameName(f)}
              </span>
              {(codons.get(f) ?? [])
                .filter((c) => c.start + 2 >= line.start && c.start <= line.end)
                // left to right, whichever way the frame reads, so the grid places them in one row
                .sort((a, b) => a.start - b.start)
                .map((c) => tile(c, line.start, line.end))}
            </div>
          )
          const strand = (bottomStrand: boolean) => (
            <div className="grid items-center" style={{ gridTemplateColumns: cols }}>
              <span aria-hidden className={cn("select-none pr-2 text-right type-label-sm tabular-nums text-muted-foreground", bottomStrand && "invisible")}>
                {line.start + start - 1}
              </span>
              {Array.from({ length: line.end - line.start + 1 }, (_, k) => {
                const p = line.start + k
                const b = bottomStrand ? complement(seq[p - 1]) : seq[p - 1]
                const isSel = within(p, sel)
                const inCodon = (q: number) => !!hoverCodon && q >= hoverCodon.start && q <= hoverCodon.start + 2
                // a hovered residue lights its three bases as one pill; a hovered base is a pill of its own
                const isAct = activeBase === p || inCodon(p)
                const codonLeft = inCodon(p) && (!inCodon(p - 1) || p === line.start)
                const codonRight = inCodon(p) && (!inCodon(p + 1) || p === line.end)
                const left = isSel && !within(p - 1, sel)
                const right = isSel && !within(p + 1, sel)
                return (
                  <span
                    key={p}
                    {...(bottomStrand ? { "aria-hidden": true } : { "data-base": p })}
                    style={tint(b)}
                    className={cn(
                      baseCls,
                      ink,
                      bottomStrand && "opacity-70",
                      isSel && !bottomStrand && "bg-foreground/[0.09]",
                      left && "rounded-l-md",
                      right && "rounded-r-md",
                      isAct && !bottomStrand && "bg-foreground/[0.14]",
                      isAct && !bottomStrand && (inCodon(p) ? cn(codonLeft && "rounded-l-md", codonRight && "rounded-r-md") : "rounded-md")
                    )}
                  >
                    {b}
                  </span>
                )
              })}
            </div>
          )
          return (
            <div key={line.start} className="grid gap-1">
              {strand(false)}
              {fwd.map(row)}
              {bottom && <div className="mt-1">{strand(true)}</div>}
              {rev.map(row)}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export { Translation, type TranslationProps }
