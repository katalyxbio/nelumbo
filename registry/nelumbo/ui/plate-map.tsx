"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { RESIDUE_HUES } from "@/registry/nelumbo/ui/residue"

/**
 * Nelumbo Plate Map
 *
 * A microplate, 6 to 1536 wells, laid out as the plate is: lettered rows,
 * numbered columns, round wells up to 96 and square ones beyond. Wells take a
 * group's color (a layout: blanks, standards, samples) or a value on a scale
 * (a plate reader's output), and a selection is one connected shape.
 *
 *   <PlateMap format={96} groups={[{ id: "std", name: "Standard", color: "blue" }]}
 *     wells={[{ well: "A1", group: "std" }, ...]} selectable />
 *
 * It is an ARIA grid: one tab stop, arrows move, Shift and the arrows (or a
 * drag) select a rectangle, Space toggles a well, Ctrl+A selects them all,
 * Escape clears. A row or column header selects the whole line.
 */

export type PlateFormat = 6 | 12 | 24 | 48 | 96 | 384 | 1536
export type PlateColor = keyof typeof RESIDUE_HUES | "neutral"

export type PlateGroup = { id: string; name: string; color?: PlateColor; description?: string }

export type PlateWell = {
  /** "A1", "H12", "AF48". */
  well: string
  group?: string
  value?: number
  /** Shown inside the well with `labels`. */
  label?: string
  description?: string
}

export type PlateFocus = PlateWell & { row: number; column: number; groupInfo?: PlateGroup }

const FORMATS: Record<PlateFormat, [rows: number, cols: number]> = {
  6: [2, 3],
  12: [3, 4],
  24: [4, 6],
  48: [6, 8],
  96: [8, 12],
  384: [16, 24],
  1536: [32, 48],
}

/** Rows and columns of a plate format. */
export function plateSize(format: PlateFormat) {
  const [rows, cols] = FORMATS[format]
  return { rows, cols }
}

/** Row 0 → "A", row 26 → "AA". */
export function rowName(row: number) {
  return row < 26 ? String.fromCharCode(65 + row) : String.fromCharCode(64 + Math.floor(row / 26)) + String.fromCharCode(65 + (row % 26))
}

/** 0-based row and column → "B3". */
export function wellName(row: number, col: number) {
  return `${rowName(row)}${col + 1}`
}

/** "B3" → { row: 1, col: 2 }, 0-based. */
export function parseWell(name: string) {
  const m = /^([A-Z]{1,2})0*(\d+)$/i.exec(name.trim())
  if (!m) return null
  const letters = m[1].toUpperCase()
  const row = letters.length === 1 ? letters.charCodeAt(0) - 65 : (letters.charCodeAt(0) - 64) * 26 + letters.charCodeAt(1) - 65
  return { row, col: Number(m[2]) - 1 }
}

/** "A1:B3" → ["A1", "A2", "A3", "B1", "B2", "B3"], row by row. */
export function wellRange(range: string) {
  const [a, b = a] = range.split(":").map(parseWell)
  if (!a || !b) return []
  const out: string[] = []
  for (let r = Math.min(a.row, b.row); r <= Math.max(a.row, b.row); r++)
    for (let c = Math.min(a.col, b.col); c <= Math.max(a.col, b.col); c++) out.push(wellName(r, c))
  return out
}

const ORDER: PlateColor[] = ["blue", "amber", "green", "purple", "pink", "cyan", "orange", "red"]
const hueOf = (c: PlateColor) => (c === "neutral" ? 0 : RESIDUE_HUES[c])

// a group's well: one tone for every hue (as the residue tiles), its ink kept AA
const GROUP_WELL =
  "bg-[oklch(0.8_calc(0.13*var(--k))_var(--h))] text-[oklch(0.25_calc(0.06*var(--k))_var(--h))]" +
  " dark:bg-[oklch(0.62_calc(0.12*var(--k))_var(--h))] dark:text-[oklch(0.15_calc(0.04*var(--k))_var(--h))]"
// a value's well: deeper with --t (0 to 1). Light mode darkens, dark mode brightens, each
// within the range where one ink keeps AA on every step, so labels never flip color.
const VALUE_WELL =
  "bg-[oklch(calc(0.97-var(--t)*0.34)_calc(0.012+var(--t)*0.145)_var(--h))] text-[oklch(0.18_0.03_var(--h))]" +
  " dark:bg-[oklch(calc(0.24+var(--t)*0.29)_calc(0.02+var(--t)*0.13)_var(--h))] dark:text-[oklch(0.97_0.01_var(--h))]"

type Cell = { row: number; col: number }

type PlateMapProps = Omit<React.ComponentProps<"div">, "children"> & {
  format?: PlateFormat
  wells?: PlateWell[]
  groups?: PlateGroup[]
  /** "groups" colors by group, "values" by value. Default: values when wells carry values and no groups are given. */
  colorBy?: "groups" | "values"
  /** "sequential" (default): one hue, light to deep. "diverging": blue below `midpoint`, red above. */
  scale?: "sequential" | "diverging"
  /** The value range the scale spans. Default the wells' own. */
  domain?: [number, number]
  midpoint?: number
  /** The hue of a sequential scale. Default "blue". */
  scaleColor?: PlateColor
  /** How a value is written. */
  formatValue?: (v: number) => string
  /** A unit after values, in the readout and legend. */
  unit?: string
  /** Each well's label (or value) inside it, where wells are large enough. */
  labels?: boolean
  /** A legend of groups, or the scale, underneath. Default true. */
  legend?: boolean
  selectable?: boolean
  /** Selected well names. */
  selection?: string[]
  defaultSelection?: string[]
  onSelectionChange?: (wells: string[]) => void
  /** The well under the pointer or the keyboard cursor. */
  onActiveChange?: (focus: PlateFocus | null) => void
}

/** A microplate with wells colored by group or value, and rectangle selection. */
function PlateMap({
  format = 96,
  wells = [],
  groups = [],
  colorBy,
  scale = "sequential",
  domain,
  midpoint = 0,
  scaleColor = "blue",
  formatValue = (v) => (Math.abs(v) >= 100 ? v.toFixed(0) : Math.abs(v) >= 10 ? v.toFixed(1) : v.toFixed(2)),
  unit,
  labels = false,
  legend = true,
  selectable = false,
  selection: selectionProp,
  defaultSelection = [],
  onSelectionChange,
  onActiveChange,
  className,
  "aria-label": ariaLabel,
  ...props
}: PlateMapProps) {
  const { rows, cols } = plateSize(format)
  const square = format > 96
  const byName = React.useMemo(() => {
    const m = new Map<string, PlateWell>()
    for (const w of wells) {
      const p = parseWell(w.well)
      if (p) m.set(wellName(p.row, p.col), w)
    }
    return m
  }, [wells])
  const groupColors = React.useMemo(
    () => new Map(groups.map((g, i) => [g.id, g.color ?? ORDER[i % ORDER.length]])),
    [groups]
  )
  const mode = colorBy ?? (groups.length === 0 && wells.some((w) => w.value != null) ? "values" : "groups")
  const values = wells.map((w) => w.value).filter((v): v is number => v != null)
  const [lo, hi] = domain ?? [Math.min(...values, 0), Math.max(...values, 1)]

  const tone = (v: number) => {
    if (scale === "diverging") {
      const span = Math.max(Math.abs(hi - midpoint), Math.abs(midpoint - lo)) || 1
      const t = Math.max(-1, Math.min(1, (v - midpoint) / span))
      return { t: Math.abs(t), h: t < 0 ? RESIDUE_HUES.blue : RESIDUE_HUES.red }
    }
    return { t: Math.max(0, Math.min(1, (v - lo) / (hi - lo || 1))), h: hueOf(scaleColor) }
  }

  // selection
  const [own, setOwn] = React.useState<string[]>(defaultSelection)
  const selection = selectionProp ?? own
  const selected = React.useMemo(() => new Set(selection), [selection])
  const setSelection = (next: string[]) => {
    if (selectionProp === undefined) setOwn(next)
    onSelectionChange?.(next)
  }
  const rect = (a: Cell, b: Cell) => wellRange(`${wellName(a.row, a.col)}:${wellName(b.row, b.col)}`)

  const [cursor, setCursor] = React.useState<Cell>({ row: 0, col: 0 })
  const anchor = React.useRef<Cell>({ row: 0, col: 0 })
  const base = React.useRef<string[]>([])
  const dragging = React.useRef(false)
  const [hover, setHover] = React.useState<Cell | null>(null)
  const [focused, setFocused] = React.useState(false)
  const gridRef = React.useRef<HTMLDivElement>(null)
  const active = hover ?? (focused ? cursor : null)

  const focusOf = React.useCallback(
    (c: Cell | null): PlateFocus | null => {
      if (!c) return null
      const name = wellName(c.row, c.col)
      const w = byName.get(name)
      return { well: name, ...w, row: c.row, column: c.col, groupInfo: groups.find((g) => g.id === w?.group) }
    },
    [byName, groups]
  )
  const onActive = React.useRef(onActiveChange)
  onActive.current = onActiveChange
  const activeKey = active ? wellName(active.row, active.col) : ""
  React.useEffect(() => onActive.current?.(focusOf(active)), [activeKey]) // eslint-disable-line react-hooks/exhaustive-deps

  const focusCell = (c: Cell) => {
    setCursor(c)
    gridRef.current?.querySelector<HTMLElement>(`[data-well="${wellName(c.row, c.col)}"]`)?.focus()
  }

  const describe = (name: string) => {
    const w = byName.get(name)
    const g = groups.find((x) => x.id === w?.group)
    const parts = [name, g?.name, w?.label, w?.value != null ? `${formatValue(w.value)}${unit ? ` ${unit}` : ""}` : undefined]
    return parts.filter(Boolean).join(", ") + (w ? "" : ", empty")
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    const { row, col } = cursor
    const ctrl = e.ctrlKey || e.metaKey
    let to: Cell | null = null
    if (e.key === "ArrowRight") to = { row, col: col + 1 }
    else if (e.key === "ArrowLeft") to = { row, col: col - 1 }
    else if (e.key === "ArrowDown") to = { row: row + 1, col }
    else if (e.key === "ArrowUp") to = { row: row - 1, col }
    else if (e.key === "Home") to = ctrl ? { row: 0, col: 0 } : { row, col: 0 }
    else if (e.key === "End") to = ctrl ? { row: rows - 1, col: cols - 1 } : { row, col: cols - 1 }
    else if (e.key === "PageDown") to = { row: rows - 1, col }
    else if (e.key === "PageUp") to = { row: 0, col }
    else if (selectable && (e.key === " " || e.key === "Enter")) {
      const name = wellName(row, col)
      anchor.current = cursor
      setSelection(selected.has(name) ? selection.filter((s) => s !== name) : [...selection, name])
    } else if (selectable && ctrl && e.key.toLowerCase() === "a") setSelection(wellRange(`A1:${wellName(rows - 1, cols - 1)}`))
    else if (selectable && e.key === "Escape" && selection.length) setSelection([])
    else return
    e.preventDefault()
    if (!to) return
    setHover(null)
    const c = { row: Math.max(0, Math.min(rows - 1, to.row)), col: Math.max(0, Math.min(cols - 1, to.col)) }
    focusCell(c)
    if (selectable && e.shiftKey) setSelection(rect(anchor.current, c))
    else anchor.current = c
  }

  const cellFrom = (e: React.PointerEvent): Cell | null => {
    const el = document.elementFromPoint(e.clientX, e.clientY)?.closest<HTMLElement>("[data-well]")
    if (!el || !gridRef.current?.contains(el)) return null
    return { row: Number(el.dataset.row), col: Number(el.dataset.col) }
  }

  const onPointerDown = (e: React.PointerEvent) => {
    const c = cellFrom(e)
    if (!c) return
    setCursor(c)
    if (!selectable) return
    const name = wellName(c.row, c.col)
    if (e.shiftKey) setSelection(rect(anchor.current, c))
    else if (e.ctrlKey || e.metaKey) {
      anchor.current = c
      setSelection(selected.has(name) ? selection.filter((s) => s !== name) : [...selection, name])
    } else {
      anchor.current = c
      base.current = []
      dragging.current = true
      if (e.pointerType === "mouse") (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId)
      setSelection([name])
    }
  }

  const lineSelect = (names: string[], add: boolean) => {
    const all = names.every((n) => selected.has(n))
    if (add) setSelection(all ? selection.filter((s) => !names.includes(s)) : [...new Set([...selection, ...names])])
    else setSelection(all && selection.length === names.length ? [] : names)
  }

  const label = ariaLabel ?? `${format}-well plate`
  const isSel = (r: number, c: number) => r >= 0 && c >= 0 && r < rows && c < cols && selected.has(wellName(r, c))
  const R = square ? "6px" : "40%"

  const header = "flex select-none items-center justify-center type-label-sm text-muted-foreground tabular-nums"
  const headerButton = selectable ? "cursor-pointer rounded-full hover:text-foreground" : ""

  return (
    <div data-slot="plate-map" className={cn("@container grid w-full gap-4", className)} {...props}>
      <div
        ref={gridRef}
        role="grid"
        aria-label={label}
        aria-multiselectable={selectable || undefined}
        aria-readonly={!selectable || undefined}
        aria-rowcount={rows + 1}
        aria-colcount={cols + 1}
        className={cn("grid w-full touch-none select-none", selectable && "cursor-pointer")}
        style={{
          gridTemplateColumns: `${rows > 26 ? "1.75rem" : "1.25rem"} repeat(${cols}, minmax(0, 1fr))`,
          maxWidth: `calc(${rows > 26 ? "1.75rem" : "1.25rem"} + ${cols} * ${format <= 24 ? 5 : format <= 96 ? 3.5 : format === 384 ? 1.9 : 1.2}rem)`,
        }}
        onKeyDown={onKeyDown}
        onFocus={() => setFocused(true)}
        onBlur={(e) => !e.currentTarget.contains(e.relatedTarget as Node) && setFocused(false)}
        onPointerDown={onPointerDown}
        onPointerMove={(e) => {
          const c = cellFrom(e)
          setHover(c)
          if (dragging.current && c && selectable) setSelection(rect(anchor.current, c))
        }}
        onPointerUp={() => (dragging.current = false)}
        onPointerLeave={() => setHover(null)}
        onLostPointerCapture={() => (dragging.current = false)}
      >
        <div role="row" aria-rowindex={1} className="col-span-full grid grid-cols-subgrid pb-1">
          <div role="columnheader" aria-colindex={1} className={header}>
            <span className="sr-only">Row</span>
            {selectable && (
              <button
                type="button"
                tabIndex={-1}
                aria-label="Select all wells"
                className="size-3 rounded-[3px] bg-outline-variant hover:bg-muted-foreground"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={() => lineSelect(wellRange(`A1:${wellName(rows - 1, cols - 1)}`), false)}
              />
            )}
          </div>
          {Array.from({ length: cols }, (_, c) => (
            <div
              key={c}
              role="columnheader"
              aria-colindex={c + 2}
              className={cn(header, cols > 12 && c % 2 === 1 && "@max-[640px]:invisible", cols > 24 && c % 4 !== 0 && "invisible")}
            >
              {selectable ? (
                <button
                  type="button"
                  tabIndex={-1}
                  aria-label={`Column ${c + 1}`}
                  className={headerButton}
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => lineSelect(wellRange(`A${c + 1}:${wellName(rows - 1, c)}`), e.ctrlKey || e.metaKey || e.shiftKey)}
                >
                  {c + 1}
                </button>
              ) : (
                c + 1
              )}
            </div>
          ))}
        </div>
        {Array.from({ length: rows }, (_, r) => (
          <div key={r} role="row" aria-rowindex={r + 2} className="col-span-full grid grid-cols-subgrid">
            <div role="rowheader" aria-colindex={1} className={cn(header, "justify-start", rows > 16 && r % 2 === 1 && "@max-[640px]:invisible")}>
              {selectable ? (
                <button
                  type="button"
                  tabIndex={-1}
                  aria-label={`Row ${rowName(r)}`}
                  className={headerButton}
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => lineSelect(wellRange(`${rowName(r)}1:${wellName(r, cols - 1)}`), e.ctrlKey || e.metaKey || e.shiftKey)}
                >
                  {rowName(r)}
                </button>
              ) : (
                rowName(r)
              )}
            </div>
            {Array.from({ length: cols }, (_, c) => {
              const name = wellName(r, c)
              const w = byName.get(name)
              const sel = isSel(r, c)
              const isCursor = cursor.row === r && cursor.col === c
              const isActive = !!active && active.row === r && active.col === c
              const g = w?.group != null ? groupColors.get(w.group) : undefined
              const v = mode === "values" && w?.value != null ? tone(w.value) : null
              const filled = mode === "groups" ? g != null : v != null
              // the selection is one shape: a corner rounds where neither side continues it
              const up = isSel(r - 1, c)
              const down = isSel(r + 1, c)
              const left = isSel(r, c - 1)
              const right = isSel(r, c + 1)
              const corner = (a: boolean, b: boolean) => (a || b ? "0" : R)
              const text = labels && format <= 96 ? (w?.label ?? (w?.value != null ? formatValue(w.value) : "")) : ""
              return (
                <div
                  key={c}
                  role="gridcell"
                  aria-colindex={c + 2}
                  aria-selected={selectable ? sel : undefined}
                  aria-label={describe(name)}
                  tabIndex={isCursor ? 0 : -1}
                  data-well={name}
                  data-row={r}
                  data-col={c}
                  className="group/well @container relative aspect-square outline-none"
                  onFocus={() => setCursor({ row: r, col: c })}
                >
                  {sel && (
                    <span
                      aria-hidden
                      className="absolute bg-surface-container-highest"
                      style={{
                        // joined sides overlap a hair, so fractional column widths leave no seam
                        top: up ? -1 : 0,
                        bottom: down ? -1 : 0,
                        left: left ? -1 : 0,
                        right: right ? -1 : 0,
                        borderTopLeftRadius: corner(up, left),
                        borderTopRightRadius: corner(up, right),
                        borderBottomLeftRadius: corner(down, left),
                        borderBottomRightRadius: corner(down, right),
                      }}
                    />
                  )}
                  <span
                    aria-hidden
                    title={describe(name)}
                    className={cn(
                      "absolute flex items-center justify-center overflow-hidden font-mono font-semibold leading-none tabular-nums",
                      square ? "inset-[10%] rounded-[22%]" : "inset-[12%] rounded-full",
                      "outline-2 outline-offset-1 outline-transparent transition-[outline-color,scale] duration-200",
                      "group-focus-visible/well:outline-ring",
                      isActive && "outline-foreground/70",
                      !filled && "shadow-[inset_0_0_0_1px_var(--outline-variant)]",
                      filled && (mode === "groups" ? GROUP_WELL : VALUE_WELL),
                      sel && "scale-[0.88]"
                    )}
                    style={
                      {
                        "--h": g != null ? hueOf(g) : (v?.h ?? 0),
                        "--k": g === "neutral" ? 0 : 1,
                        "--t": v?.t ?? 0,
                        fontSize: "clamp(0px, 26cqi, 0.75rem)",
                      } as React.CSSProperties
                    }
                  >
                    {text}
                  </span>
                </div>
              )
            })}
          </div>
        ))}
      </div>
      {legend && mode === "groups" && groups.length > 0 && (
        <ul className="flex flex-wrap gap-x-5 gap-y-2">
          {groups.map((g) => {
            const color = groupColors.get(g.id)!
            const n = wells.filter((w) => w.group === g.id).length
            return (
              <li key={g.id} className="flex items-center gap-2 type-label-md">
                <span
                  aria-hidden
                  className={cn("size-3 shrink-0", square ? "rounded-[3px]" : "rounded-full", GROUP_WELL)}
                  style={{ "--h": hueOf(color), "--k": color === "neutral" ? 0 : 1 } as React.CSSProperties}
                />
                <span className="text-foreground">{g.name}</span>
                <span className="text-muted-foreground tabular-nums">{n}</span>
              </li>
            )
          })}
        </ul>
      )}
      {legend && mode === "values" && values.length > 0 && (
        <div className="grid w-full max-w-xs gap-1.5">
          <div
            aria-hidden
            className="flex h-2.5 overflow-hidden rounded-full"
          >
            {Array.from({ length: 24 }, (_, i) => {
              const v = lo + ((hi - lo) * (i + 0.5)) / 24
              const s = tone(v)
              return <span key={i} className={cn("h-full flex-1", VALUE_WELL)} style={{ "--t": s.t, "--h": s.h } as React.CSSProperties} />
            })}
          </div>
          <div className="relative flex justify-between type-label-sm text-muted-foreground tabular-nums">
            <span>{formatValue(lo)}</span>
            {scale === "diverging" && midpoint > lo && midpoint < hi && (
              <span className="absolute -translate-x-1/2" style={{ left: `${((midpoint - lo) / (hi - lo)) * 100}%` }}>
                {formatValue(midpoint)}
              </span>
            )}
            <span>
              {formatValue(hi)}
              {unit ? ` ${unit}` : ""}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export { PlateMap, type PlateMapProps }
