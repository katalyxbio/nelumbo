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
 * (a plate reader's output). A selection is traced as one outline, round at its
 * outer corners and filleted at its inner ones.
 *
 *   <PlateMap format={96} groups={[{ id: "std", name: "Standard", color: "blue" }]}
 *     wells={[{ well: "A1", group: "std" }, ...]} selectable />
 *   <PlateMap variant="plate" notch="bottom-left" ... />   // the plate itself, to scale
 *   <PlateMap variant="plate" frame="outline" ... />       // drawn as a line, no fill
 *   <PlateMap variant="plate" barcode="PLT-000123" ... />  // its front wall showing, with a scannable label
 *
 * Variants:
 * - "grid" (default): the wells and their headers, filling the width.
 * - "plate": the whole plate at the standard footprint (127.76 by 85.48 mm),
 *   wells at their true pitch and offset, the labels on the frame as they are
 *   molded, and the chamfered corner where `notch` puts it. `frame` draws it as
 *   one flat fill ("solid") or one line ("outline").
 *
 * It is an ARIA grid: one tab stop, arrows move, Shift and the arrows (or a
 * drag) select a rectangle, Ctrl or Cmd adds, Space toggles a well, Ctrl+A
 * selects them all, Escape clears. A row or column header selects the line.
 */

export type PlateFormat = 6 | 12 | 24 | 48 | 96 | 384 | 1536
export type PlateColor = keyof typeof RESIDUE_HUES | "neutral"
export type PlateCorner = "top-left" | "top-right" | "bottom-left" | "bottom-right"

export type PlateGroup = { id: string; name: string; color?: PlateColor; description?: string }

export type PlateWell = {
  /** "A1", "H12", "AF48". */
  well: string
  group?: string
  value?: number
  /** Shown inside the well with `labels`. */
  label?: string
  description?: string
  /** Left out of the analysis (a bubble, a failed read): struck through and faded. */
  excluded?: boolean
}

export type PlateFocus = PlateWell & { row: number; column: number; groupInfo?: PlateGroup }

// rows, columns, pitch and the center of A1 in mm, from the SBS/ANSI footprint;
// the formats without a fixed offset are centered
const W = 127.76
const H = 85.48
const GEOMETRY: Record<PlateFormat, { rows: number; cols: number; pitch: number; a1?: [number, number]; well: number }> = {
  6: { rows: 2, cols: 3, pitch: 39.12, well: 0.88 },
  12: { rows: 3, cols: 4, pitch: 26.01, well: 0.85 },
  24: { rows: 4, cols: 6, pitch: 19.3, well: 0.82 },
  48: { rows: 6, cols: 8, pitch: 13.08, well: 0.84 },
  96: { rows: 8, cols: 12, pitch: 9, a1: [14.38, 11.24], well: 0.74 },
  384: { rows: 16, cols: 24, pitch: 4.5, a1: [12.13, 8.99], well: 0.8 },
  1536: { rows: 32, cols: 48, pitch: 2.25, a1: [11.005, 7.865], well: 0.78 },
}

/** Rows and columns of a plate format. */
export function plateSize(format: PlateFormat) {
  const { rows, cols } = GEOMETRY[format]
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

/**
 * The outline of a set of cells as one SVG path: traced clockwise along the
 * cells' outer edges, outer corners rounded by `outer`, inner corners
 * filleted by `inner`. Cells touching only at a corner stay apart.
 */
export function cellsOutline(
  has: (row: number, col: number) => boolean,
  rows: number,
  cols: number,
  box: { x: number; y: number; w: number; h: number },
  outer: number,
  inner: number
) {
  type P = [number, number]
  const key = (p: P) => `${p[0]},${p[1]}`
  const out = new Map<string, P[]>()
  const add = (a: P, b: P) => {
    const k = key(a)
    out.set(k, [...(out.get(k) ?? []), b])
  }
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      if (!has(r, c)) continue
      if (!has(r - 1, c)) add([c, r], [c + 1, r])
      if (!has(r, c + 1)) add([c + 1, r], [c + 1, r + 1])
      if (!has(r + 1, c)) add([c + 1, r + 1], [c, r + 1])
      if (!has(r, c - 1)) add([c, r + 1], [c, r])
    }
  const used = new Set<string>()
  const ek = (a: P, b: P) => `${key(a)}>${key(b)}`
  const px = (p: P): P => [box.x + p[0] * box.w, box.y + p[1] * box.h]
  const f = (n: number) => Math.round(n * 100) / 100
  let d = ""
  for (const [k, targets] of out)
    for (const first of targets) {
      const start = k.split(",").map(Number) as P
      if (used.has(ek(start, first))) continue
      // walk the loop, turning right at a vertex with two ways on
      const pts: P[] = [start]
      let a = start
      let b = first
      while (!used.has(ek(a, b))) {
        used.add(ek(a, b))
        const dir: P = [b[0] - a[0], b[1] - a[1]]
        const next = (out.get(key(b)) ?? []).filter((n) => !used.has(ek(b, n)))
        if (!next.length) break
        const right: P = [-dir[1], dir[0]]
        const pick = next.find((n) => n[0] - b[0] === right[0] && n[1] - b[1] === right[1]) ?? next.find((n) => n[0] - b[0] === dir[0] && n[1] - b[1] === dir[1]) ?? next[0]
        pts.push(b)
        a = b
        b = pick
      }
      // keep only the corners
      const corners = pts.filter((p, i) => {
        const prev = pts[(i - 1 + pts.length) % pts.length]
        const nxt = pts[(i + 1) % pts.length]
        return (p[0] - prev[0]) * (nxt[1] - p[1]) - (p[1] - prev[1]) * (nxt[0] - p[0]) !== 0
      })
      const n = corners.length
      if (n < 3) continue
      const seg = corners.map((p, i) => {
        const prev = corners[(i - 1 + n) % n]
        const nxt = corners[(i + 1) % n]
        const din: P = [Math.sign(p[0] - prev[0]), Math.sign(p[1] - prev[1])]
        const dout: P = [Math.sign(nxt[0] - p[0]), Math.sign(nxt[1] - p[1])]
        const convex = din[0] * dout[1] - din[1] * dout[0] > 0
        const rad = convex ? outer : inner
        const v = px(p)
        return {
          a: [v[0] - din[0] * rad, v[1] - din[1] * rad] as P,
          b: [v[0] + dout[0] * rad, v[1] + dout[1] * rad] as P,
          rad,
          sweep: convex ? 1 : 0,
        }
      })
      d += `M${f(seg[n - 1].b[0])} ${f(seg[n - 1].b[1])}`
      for (const s of seg) d += `L${f(s.a[0])} ${f(s.a[1])}A${f(s.rad)} ${f(s.rad)} 0 0 ${s.sweep} ${f(s.b[0])} ${f(s.b[1])}`
      d += "Z"
    }
  return d
}

/** The plate's outline in mm: rounded corners, one chamfered. */
function plateBody(notch: PlateCorner) {
  const r = 3
  const c = 6
  const [x0, y0, x1, y1] = [0, 0, W, H]
  const tl = notch === "top-left"
  const tr = notch === "top-right"
  const br = notch === "bottom-right"
  const bl = notch === "bottom-left"
  return [
    `M${x0 + (tl ? c : r)} ${y0}`,
    `L${x1 - (tr ? c : r)} ${y0}`,
    tr ? `L${x1} ${y0 + c}` : `Q${x1} ${y0} ${x1} ${y0 + r}`,
    `L${x1} ${y1 - (br ? c : r)}`,
    br ? `L${x1 - c} ${y1}` : `Q${x1} ${y1} ${x1 - r} ${y1}`,
    `L${x0 + (bl ? c : r)} ${y1}`,
    bl ? `L${x0} ${y1 - c}` : `Q${x0} ${y1} ${x0} ${y1 - r}`,
    `L${x0} ${y0 + (tl ? c : r)}`,
    tl ? "Z" : `Q${x0} ${y0} ${x0 + r} ${y0}Z`,
  ].join("")
}

// Code 128 symbols as bar and space widths in modules (0 to 102, then Start A, B and C)
const CODE128 = "212222 222122 222221 121223 121322 131222 122213 122312 132212 221213 221312 231212 112232 122132 122231 113222 123122 123221 223211 221132 221231 213212 223112 312131 311222 321122 321221 312212 322112 322211 212123 212321 232121 111323 131123 131321 112313 132113 132311 211313 231113 231311 112133 112331 132131 113123 113321 133121 313121 211331 231131 213113 213311 213131 311123 311321 331121 312113 312311 332111 314111 221411 431111 111224 111422 121124 121421 141122 141221 112214 112412 122114 122411 142112 142211 241211 221114 413111 241112 134111 111242 121142 121241 114212 124112 124211 411212 421112 421211 212141 214121 412121 111143 111341 131141 114113 114311 411113 411311 113141 114131 311141 411131 211412 211214 211232".split(" ")

/**
 * Code 128 (set B) for printable ASCII: the bar and space widths in modules,
 * starting with a bar, with its check symbol and stop. Scannable as drawn.
 */
export function code128(value: string) {
  const codes = [
    104,
    ...[...value].map((ch) => {
      const c = ch.charCodeAt(0) - 32
      return c >= 0 && c < 95 ? c : 31 // "?" for what set B cannot carry
    }),
  ]
  codes.push(codes.slice(1).reduce((sum, c, i) => sum + c * (i + 1), 104) % 103)
  return [...codes.flatMap((c) => [...CODE128[c]].map(Number)), 2, 3, 3, 1, 1, 1, 2]
}

// how much of the front wall shows below the top, in mm: the plate seen from a little in front
const DEPTH = 9

/** A barcode label on the front wall, which runs from y = top to top + DEPTH. */
function WallLabel({ value, position, top }: { value: string; position: "start" | "center" | "end"; top: number }) {
  const widths = code128(value)
  const modules = widths.reduce((a, b) => a + b, 0)
  const quiet = 10
  const mw = Math.min(0.33, (W * 0.55) / (modules + quiet * 2))
  const lw = (modules + quiet * 2) * mw
  const lx = position === "start" ? 9 : position === "end" ? W - 9 - lw : (W - lw) / 2
  const ly = top + 1.1
  const lh = DEPTH - 2.2
  let bars = ""
  let x = lx + quiet * mw
  widths.forEach((w, i) => {
    if (i % 2 === 0) bars += `M${x.toFixed(3)} ${(ly + 0.7).toFixed(2)}h${(w * mw).toFixed(3)}v${(lh - 3).toFixed(2)}h${(-w * mw).toFixed(3)}z`
    x += w * mw
  })
  return (
    <g>
      {/* a printed label is white in either theme, as it is on the bench */}
      <rect x={lx} y={ly} width={lw} height={lh} rx={0.4} fill="#fff" stroke="rgb(0 0 0 / 0.18)" strokeWidth={1} vectorEffect="non-scaling-stroke" />
      <path d={bars} fill="#111" />
      <text x={lx + lw / 2} y={ly + lh - 0.6} textAnchor="middle" fill="#111" fontSize={1.7} className="font-mono">
        {value}
      </text>
    </g>
  )
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
  /** "grid" (default) or "plate": the whole plate, to scale, with its chamfered corner. */
  variant?: "grid" | "plate"
  /** With variant="plate": the chamfered corner. Default "top-left". */
  notch?: PlateCorner
  /** With variant="plate": a flat "solid" plate (default), or an "outline" with no fill. */
  frame?: "solid" | "outline"
  /** With variant="plate": a Code 128 barcode on a label on the plate's front wall. */
  barcode?: string
  /** Where the label sits along the wall. Default "center". */
  barcodePosition?: "start" | "center" | "end"
  /** With variant="plate": the front wall below the top, as if the plate were seen from a little in front. Default: shown with a barcode. */
  side?: boolean
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
  /** A unit after values, in the tooltip, readout and legend. */
  unit?: string
  /** Each well's label (or value) inside it, where wells are large enough. */
  labels?: boolean
  /** A legend of groups, or the scale, underneath. Default true. */
  legend?: boolean
  /** A card over the well under the pointer or the keyboard cursor. Default true. */
  tooltip?: boolean
  selectable?: boolean
  /** Selected well names. */
  selection?: string[]
  defaultSelection?: string[]
  onSelectionChange?: (wells: string[]) => void
  /** The well under the pointer or the keyboard cursor. */
  onActiveChange?: (focus: PlateFocus | null) => void
}

/** A microplate with wells colored by group or value, and selection traced as one shape. */
function PlateMap({
  format = 96,
  variant = "grid",
  notch = "top-left",
  frame = "solid",
  barcode,
  barcodePosition = "center",
  side,
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
  tooltip = true,
  selectable = false,
  selection: selectionProp,
  defaultSelection = [],
  onSelectionChange,
  onActiveChange,
  className,
  "aria-label": ariaLabel,
  ...props
}: PlateMapProps) {
  const G = GEOMETRY[format]
  const { rows, cols } = G
  const square = format > 96
  const plate = variant === "plate"

  const byName = React.useMemo(() => {
    const m = new Map<string, PlateWell>()
    for (const w of wells) {
      const p = parseWell(w.well)
      if (p) m.set(wellName(p.row, p.col), w)
    }
    return m
  }, [wells])
  const groupColors = React.useMemo(() => new Map(groups.map((g, i) => [g.id, g.color ?? ORDER[i % ORDER.length]])), [groups])
  const mode = colorBy ?? (groups.length === 0 && wells.some((w) => w.value != null) ? "values" : "groups")
  const values = wells.filter((w) => !w.excluded).map((w) => w.value).filter((v): v is number => v != null)
  const [lo, hi] = domain ?? [Math.min(...values, 0), Math.max(...values, 1)]
  const excludedCount = wells.filter((w) => w.excluded).length

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
  const isSel = (r: number, c: number) => r >= 0 && c >= 0 && r < rows && c < cols && selected.has(wellName(r, c))

  const [cursor, setCursor] = React.useState<Cell>({ row: 0, col: 0 })
  const anchor = React.useRef<Cell>({ row: 0, col: 0 })
  const dragging = React.useRef(false)
  const [hover, setHover] = React.useState<Cell | null>(null)
  const [focused, setFocused] = React.useState(false)
  const gridRef = React.useRef<HTMLDivElement>(null)
  const frameRef = React.useRef<HTMLDivElement>(null)
  const active = hover ?? (focused ? cursor : null)

  // where the wells sit inside the frame, in px, for the selection outline and the tooltip
  const [box, setBox] = React.useState<{ x: number; y: number; w: number; h: number; width: number } | null>(null)
  React.useLayoutEffect(() => {
    const frame = frameRef.current
    const grid = gridRef.current
    if (!frame || !grid) return
    const measure = () => {
      const f = frame.getBoundingClientRect()
      const a = grid.querySelector("[data-well]")?.getBoundingClientRect()
      const z = grid.querySelector(`[data-well="${wellName(rows - 1, cols - 1)}"]`)?.getBoundingClientRect()
      if (!a || !z) return
      setBox({ x: a.left - f.left, y: a.top - f.top, w: (z.right - a.left) / cols, h: (z.bottom - a.top) / rows, width: f.width })
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(frame)
    return () => ro.disconnect()
  }, [rows, cols, variant, format])

  const outline = React.useMemo(() => {
    if (!box || !selected.size) return ""
    const cell = Math.min(box.w, box.h)
    return cellsOutline(isSel, rows, cols, box, cell * (square ? 0.3 : 0.5), cell * 0.22)
  }, [box, selected, rows, cols, square]) // eslint-disable-line react-hooks/exhaustive-deps

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

  const valueText = (v: number) => `${formatValue(v)}${unit ? ` ${unit}` : ""}`
  const describe = (name: string) => {
    const w = byName.get(name)
    const g = groups.find((x) => x.id === w?.group)
    const parts = [name, g?.name, w?.label, w?.value != null ? valueText(w.value) : undefined, w?.excluded ? "excluded" : undefined]
    return parts.filter(Boolean).join(", ") + (w ? "" : ", empty")
  }

  const toggle = (name: string) => setSelection(selected.has(name) ? selection.filter((s) => s !== name) : [...selection, name])

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
      anchor.current = cursor
      toggle(wellName(row, col))
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
      toggle(name)
    } else {
      anchor.current = c
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
  const colFull = (c: number) => Array.from({ length: rows }, (_, r) => r).every((r) => isSel(r, c))
  const rowFull = (r: number) => Array.from({ length: cols }, (_, c) => c).every((c) => isSel(r, c))

  // layout
  const depth = plate && (side ?? !!barcode) ? DEPTH : 0
  const PH = H + depth
  const maskId = React.useId().replace(/:/g, "")
  const hw = plate ? Math.min((G.a1?.[0] ?? (W - (cols - 1) * G.pitch) / 2) - G.pitch / 2 - 2.5, 7) : 0
  const hh = plate ? Math.min((G.a1?.[1] ?? (H - (rows - 1) * G.pitch) / 2) - G.pitch / 2 - 2, 6) : 0
  const ax = G.a1?.[0] ?? (W - (cols - 1) * G.pitch) / 2
  const ay = G.a1?.[1] ?? (H - (rows - 1) * G.pitch) / 2
  const headerCol = rows > 26 ? "1.75rem" : "1.25rem"
  const label = ariaLabel ?? `${format}-well plate`
  const headerFont = plate ? `clamp(6px, ${format >= 384 ? 1.05 : 1.45}cqw, 0.75rem)` : undefined
  const sparse = (i: number, n: number) => (n > 24 ? i % 4 !== 0 && "invisible" : n > 12 ? i % 2 === 1 && "@max-[640px]:invisible" : false)

  const header = "flex select-none items-center justify-center type-label-sm tabular-nums transition-colors"
  const headerButton = selectable ? "cursor-pointer rounded-full hover:text-foreground" : ""
  const lit = "rounded-full bg-foreground text-background"

  const grid = (
    <div
      ref={gridRef}
      role="grid"
      aria-label={label}
      aria-multiselectable={selectable || undefined}
      aria-readonly={!selectable || undefined}
      aria-rowcount={rows + 1}
      aria-colcount={cols + 1}
      className={cn("relative z-10 grid touch-none select-none", selectable && "cursor-pointer", plate ? "absolute" : "w-full")}
      style={
        plate
          ? {
              left: `${((ax - G.pitch / 2 - hw) / W) * 100}%`,
              top: `${((ay - G.pitch / 2 - hh) / PH) * 100}%`,
              width: `${((hw + cols * G.pitch) / W) * 100}%`,
              height: `${((hh + rows * G.pitch) / PH) * 100}%`,
              gridTemplateColumns: `minmax(0, ${hw}fr) repeat(${cols}, minmax(0, ${G.pitch}fr))`,
              gridTemplateRows: `minmax(0, ${hh}fr) repeat(${rows}, minmax(0, ${G.pitch}fr))`,
            }
          : {
              gridTemplateColumns: `${headerCol} repeat(${cols}, minmax(0, 1fr))`,
              maxWidth: `calc(${headerCol} + ${cols} * ${format <= 24 ? 5 : format <= 96 ? 3.5 : format === 384 ? 1.9 : 1.2}rem)`,
            }
      }
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
      <div role="row" aria-rowindex={1} className={cn("col-span-full grid grid-cols-subgrid", !plate && "pb-1")}>
        <div role="columnheader" aria-colindex={1} className={header}>
          <span className="sr-only">Row</span>
          {selectable && !plate && (
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
        {Array.from({ length: cols }, (_, c) => {
          const on = active?.col === c
          return (
            <div
              key={c}
              role="columnheader"
              aria-colindex={c + 2}
              className={cn(header, plate ? "items-end pb-[0.4cqw]" : "", !on && sparse(c, cols))}
              style={{ fontSize: headerFont }}
            >
              <button
                type="button"
                tabIndex={-1}
                disabled={!selectable}
                aria-label={`Column ${c + 1}`}
                className={cn(
                  "px-[0.4em] leading-[1.6]",
                  headerButton,
                  on ? lit : colFull(c) ? "font-semibold text-foreground" : "text-muted-foreground"
                )}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => lineSelect(wellRange(`A${c + 1}:${wellName(rows - 1, c)}`), e.ctrlKey || e.metaKey || e.shiftKey)}
              >
                {c + 1}
              </button>
            </div>
          )
        })}
      </div>
      {Array.from({ length: rows }, (_, r) => (
        <div key={r} role="row" aria-rowindex={r + 2} className="col-span-full grid grid-cols-subgrid">
          <div
            role="rowheader"
            aria-colindex={1}
            className={cn(header, plate ? "justify-end pr-[0.5cqw]" : "justify-start", active?.row !== r && rows > 16 && r % 2 === 1 && "@max-[640px]:invisible")}
            style={{ fontSize: headerFont }}
          >
            <button
              type="button"
              tabIndex={-1}
              disabled={!selectable}
              aria-label={`Row ${rowName(r)}`}
              className={cn(
                "px-[0.4em] leading-[1.6]",
                headerButton,
                active?.row === r ? lit : rowFull(r) ? "font-semibold text-foreground" : "text-muted-foreground"
              )}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => lineSelect(wellRange(`${rowName(r)}1:${wellName(r, cols - 1)}`), e.ctrlKey || e.metaKey || e.shiftKey)}
            >
              {rowName(r)}
            </button>
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
            const text = labels && format <= 96 ? (w?.label ?? (w?.value != null ? formatValue(w.value) : "")) : ""
            const inset = `${((1 - G.well) / 2) * 100}%`
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
                className={cn("group/well @container relative outline-none", !plate && "aspect-square")}
                onFocus={() => setCursor({ row: r, col: c })}
              >
                <span
                  aria-hidden
                  className={cn(
                    "absolute flex items-center justify-center overflow-hidden font-mono font-semibold leading-none tabular-nums",
                    square ? "rounded-[22%]" : "rounded-full",
                    "outline-2 outline-offset-2 outline-transparent transition-[outline-color,scale,opacity] duration-200 ease-out",
                    "group-focus-visible/well:outline-ring",
                    isActive && "scale-110 outline-foreground/70",
                    !filled &&
                      (plate && frame === "solid"
                        ? "bg-[var(--plate-well)] shadow-[inset_0_1px_2px_rgb(0_0_0/0.12)]"
                        : "shadow-[inset_0_0_0_1px_var(--outline-variant)]"),
                    filled && (mode === "groups" ? GROUP_WELL : VALUE_WELL),
                    w?.excluded && "opacity-45"
                  )}
                  style={
                    {
                      inset,
                      "--h": g != null ? hueOf(g) : (v?.h ?? 0),
                      "--k": g === "neutral" ? 0 : 1,
                      "--t": v?.t ?? 0,
                      fontSize: "clamp(0px, 26cqi, 0.75rem)",
                    } as React.CSSProperties
                  }
                >
                  {text}
                  {w?.excluded && <span className="absolute h-[1.5px] w-[130%] rotate-45 bg-foreground" />}
                </span>
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )

  const act = active ? focusOf(active) : null
  const tip =
    tooltip && act && box ? (
      <div
        aria-hidden
        className="pointer-events-none absolute z-30 w-max max-w-56 -translate-x-1/2 -translate-y-full rounded-xl bg-inverse-surface px-3 py-2 text-inverse-foreground shadow-lg"
        style={{
          left: Math.max(80, Math.min(box.width - 80, box.x + (act.column + 0.5) * box.w)),
          top: box.y + act.row * box.h - 6,
        }}
      >
        <div className="flex items-center gap-2 type-label-md">
          <span className="font-semibold tabular-nums">{act.well}</span>
          {act.groupInfo && (
            <>
              <span
                className={cn("size-2.5 shrink-0", square ? "rounded-[3px]" : "rounded-full", GROUP_WELL)}
                style={{ "--h": hueOf(groupColors.get(act.groupInfo.id)!), "--k": groupColors.get(act.groupInfo.id) === "neutral" ? 0 : 1 } as React.CSSProperties}
              />
              <span>{act.groupInfo.name}</span>
            </>
          )}
          {!act.groupInfo && act.value == null && <span className="opacity-70">Empty</span>}
        </div>
        {(act.value != null || act.description || act.excluded) && (
          <div className="mt-0.5 type-body-sm tabular-nums opacity-80">
            {[act.value != null ? valueText(act.value) : null, act.description, act.excluded ? "Excluded" : null].filter(Boolean).join(", ")}
          </div>
        )}
      </div>
    ) : null

  const selectionShape = outline ? (
    <svg aria-hidden className="pointer-events-none absolute inset-0 z-0 size-full overflow-visible">
      <path d={outline} className="fill-foreground/[0.07] dark:fill-foreground/[0.1]" />
      <path d={outline} fill="none" className="stroke-foreground/60" strokeWidth={1.5} strokeLinejoin="round" />
    </svg>
  ) : null

  return (
    <div data-slot="plate-map" className={cn("@container grid w-full gap-4", className)} {...props}>
      {plate ? (
        <div
          ref={frameRef}
          className="@container relative w-full max-w-3xl [--plate-well:var(--surface-container-lowest)] dark:[--plate-well:var(--surface-container-highest)]"
          style={{ aspectRatio: `${W} / ${PH}` }}
        >
          {/*
            The plate in one piece: a flat fill, or a single 1px line kept whole at every corner.
            With a side, the same outline is drawn again lower down and the top laid over it,
            so the front wall shows below the top as if the plate were seen from a little in front.
          */}
          <svg aria-hidden viewBox={`0 0 ${W} ${PH}`} className="absolute inset-0 size-full overflow-visible">
            {depth > 0 && frame === "outline" && (
              <mask id={maskId} maskUnits="userSpaceOnUse" x={-2} y={-2} width={W + 4} height={PH + 4}>
                <rect x={-2} y={-2} width={W + 4} height={PH + 4} fill="#fff" />
                <path d={plateBody(notch)} fill="#000" />
              </mask>
            )}
            {depth > 0 && (
              // the mask sits on the group, in the top's own coordinates; only the path moves down
              <g mask={frame === "outline" ? `url(#${maskId})` : undefined}>
                <path
                  d={plateBody(notch)}
                  transform={`translate(0 ${depth})`}
                  vectorEffect="non-scaling-stroke"
                  strokeWidth={frame === "outline" ? 1 : 0}
                  className={frame === "outline" ? "fill-none stroke-outline" : "fill-surface-container-highest dark:fill-surface-container-low"}
                />
              </g>
            )}
            {depth > 0 && frame === "outline" && (
              // the wall's vertical edges, where the top's corners drop to the bottom's
              <path
                d={`M0 ${H - (notch === "bottom-left" ? 6 : 3)}V${PH - (notch === "bottom-left" ? 6 : 3)}M${W} ${H - (notch === "bottom-right" ? 6 : 3)}V${PH - (notch === "bottom-right" ? 6 : 3)}`}
                vectorEffect="non-scaling-stroke"
                strokeWidth={1}
                className="stroke-outline"
              />
            )}
            <path
              d={plateBody(notch)}
              vectorEffect="non-scaling-stroke"
              strokeWidth={frame === "outline" ? 1 : 0}
              className={frame === "outline" ? "fill-none stroke-outline" : "fill-surface-container-high"}
            />
            {depth > 0 && barcode && <WallLabel value={barcode} position={barcodePosition} top={H} />}
          </svg>
          {depth > 0 && barcode && (
            <span role="img" aria-label={`Barcode ${barcode}`} className="absolute inset-x-0 bottom-0" style={{ height: `${(depth / PH) * 100}%` }} />
          )}
          {selectionShape}
          {grid}
          {tip}
        </div>
      ) : (
        <div ref={frameRef} className="relative w-full">
          {selectionShape}
          {grid}
          {tip}
        </div>
      )}
      {legend && (
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          {mode === "groups" && groups.length > 0 && (
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
          {mode === "values" && values.length > 0 && (
            <div className="grid w-full max-w-xs gap-1.5">
              <div aria-hidden className="flex h-2.5 overflow-hidden rounded-full">
                {Array.from({ length: 24 }, (_, i) => {
                  const s = tone(lo + ((hi - lo) * (i + 0.5)) / 24)
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
          {excludedCount > 0 && (
            <span className="flex items-center gap-2 type-label-md">
              <span aria-hidden className="relative flex size-3 items-center justify-center overflow-hidden rounded-full shadow-[inset_0_0_0_1px_var(--outline)]">
                <span className="h-[1.5px] w-[130%] rotate-45 bg-foreground" />
              </span>
              <span className="text-foreground">Excluded</span>
              <span className="text-muted-foreground tabular-nums">{excludedCount}</span>
            </span>
          )}
          {selectable && selection.length > 0 && (
            <span className="ml-auto type-label-md text-muted-foreground tabular-nums">
              {selection.length} {selection.length === 1 ? "well" : "wells"} selected
            </span>
          )}
        </div>
      )}
    </div>
  )
}

export { PlateMap, type PlateMapProps }
