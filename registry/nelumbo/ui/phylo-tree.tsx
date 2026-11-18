"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Nelumbo Phylo Tree
 *
 * A phylogenetic tree from Newick: rectangular or circular, with branch
 * lengths (a phylogram) or without (a cladogram), support values, shaded
 * clades and clades folded into triangles. Branches meet their parents in
 * rounded elbows; pointing at a node lights the path down to every leaf
 * below it.
 *
 *   <PhyloTree tree="((Human:6.4,Chimpanzee:6.4):2.2,Gorilla:8.6);" scale="time" unit="Mya" />
 *   <PhyloTree tree={newick} layout="circular" clades={[{ taxa: ["Mouse", "Rat"], label: "Rodents", color: "amber" }]} />
 *   <PhyloTree tree={reroot(neighborJoining(names, distances(seqs)), "Outgroup")} support="values" />
 *
 * - Newick underscores read as spaces, quoted labels keep theirs, comments
 *   ([&&NHX…]) are skipped, and numeric internal labels are support.
 * - `collapsible` folds and unfolds a clade on click or Enter; clades with
 *   `collapsed` start folded.
 * - With `selectable`, arrows walk the tree: up and down through the nodes,
 *   left to the parent, right to the first child.
 * - parseNewick, toNewick, ladderize, reroot, distances and neighborJoining
 *   are exported for building trees from your own data.
 */

export type PhyloNode = {
  name?: string
  /** Branch length to the parent. */
  length?: number
  /** Bootstrap or posterior support for the branch above this node. */
  support?: number
  children?: PhyloNode[]
}

type Color = "blue" | "cyan" | "green" | "amber" | "orange" | "red" | "pink" | "purple" | "brand"

export type PhyloClade = {
  /** Leaves in the clade: it is their most recent common ancestor. */
  taxa: string[]
  label: string
  color?: Color
  /** Start folded into a triangle. */
  collapsed?: boolean
}

export type PhyloFocus = {
  node: PhyloNode
  /** Leaves below it, by name. */
  taxa: string[]
  /** Distance from the root. */
  depth: number
  /** Distance back from the deepest tip: the node's age in a dated tree. */
  age: number
  clade?: string
} | null

// ---------------------------------------------------------------- Newick

/** Newick text to a tree. Throws on unbalanced parentheses. */
export function parseNewick(text: string): PhyloNode {
  const s = text.trim()
  let i = 0
  const skip = () => {
    while (i < s.length) {
      if (/\s/.test(s[i])) i++
      else if (s[i] === "[") {
        const j = s.indexOf("]", i)
        i = j < 0 ? s.length : j + 1
      } else break
    }
  }
  const label = () => {
    skip()
    let out = ""
    if (s[i] === "'") {
      i++
      while (i < s.length) {
        if (s[i] === "'") {
          if (s[i + 1] === "'") {
            out += "'"
            i += 2
            continue
          }
          i++
          break
        }
        out += s[i++]
      }
      return out
    }
    while (i < s.length && !"(),:;[".includes(s[i])) out += s[i++]
    return out.trim().replace(/_/g, " ")
  }
  const node = (): PhyloNode => {
    skip()
    const n: PhyloNode = {}
    if (s[i] === "(") {
      i++
      n.children = [node()]
      skip()
      while (s[i] === ",") {
        i++
        n.children.push(node())
        skip()
      }
      if (s[i] !== ")") throw new Error(`Newick: expected ")" at ${i}`)
      i++
    }
    const l = label()
    if (l) {
      if (n.children && /^\d*\.?\d+$/.test(l)) n.support = Number(l)
      else n.name = l
    }
    skip()
    if (s[i] === ":") {
      i++
      skip()
      const m = /^[-+]?\d*\.?\d+(?:[eE][-+]?\d+)?/.exec(s.slice(i))
      if (m) {
        n.length = Number(m[0])
        i += m[0].length
      }
    }
    return n
  }
  const root = node()
  skip()
  if (i < s.length && s[i] !== ";") throw new Error(`Newick: unexpected "${s[i]}" at ${i}`)
  return root
}

const quote = (name: string) => (/[\s(),:;'[\]]/.test(name) ? (/^[^'(),:;[\]]+$/.test(name) ? name.replace(/ /g, "_") : `'${name.replace(/'/g, "''")}'`) : name)

/** A tree back to Newick. */
export function toNewick(tree: PhyloNode): string {
  const go = (n: PhyloNode): string =>
    `${n.children?.length ? `(${n.children.map(go).join(",")})` : ""}${n.children?.length && n.support != null ? n.support : ""}${n.name ? quote(n.name) : ""}${n.length != null ? `:${+n.length.toPrecision(6)}` : ""}`
  return `${go(tree)};`
}

const leafCount = (n: PhyloNode): number => (n.children?.length ? n.children.reduce((s, c) => s + leafCount(c), 0) : 1)

/** Children ordered by size, smaller clades first, so the tree steps down like a ladder. */
export function ladderize(tree: PhyloNode, largeFirst = false): PhyloNode {
  if (!tree.children?.length) return tree
  const kids = tree.children.map((c) => ladderize(c, largeFirst)).map((c) => [c, leafCount(c)] as const)
  kids.sort((a, b) => (largeFirst ? b[1] - a[1] : a[1] - b[1]))
  return { ...tree, children: kids.map((k) => k[0]) }
}

/** Every leaf name, top to bottom. */
export function leafNames(tree: PhyloNode): string[] {
  return tree.children?.length ? tree.children.flatMap(leafNames) : [tree.name ?? ""]
}

/**
 * The tree rooted on the branch above an outgroup: one leaf, or the most
 * recent common ancestor of several. The branch is split in half. Support
 * stays with its branch and names with their nodes.
 */
export function reroot(tree: PhyloNode, outgroup: string | string[]): PhyloNode {
  const want = new Set(Array.isArray(outgroup) ? outgroup : [outgroup])
  type Edge = { to: number; length: number; support?: number }
  const nodes: PhyloNode[] = []
  const parent: number[] = []
  const adj: Edge[][] = []
  const below: number[][] = []
  const walk = (n: PhyloNode, p: number): number => {
    const id = nodes.length
    nodes.push(n)
    parent.push(p)
    adj.push([])
    if (p >= 0) {
      const e = { length: n.length ?? 0, support: n.support }
      adj[id].push({ to: p, ...e })
      adj[p].push({ to: id, ...e })
    }
    below.push([])
    below[id] = n.children?.length ? n.children.flatMap((c) => below[walk(c, id)]) : want.has(n.name ?? "") ? [id] : []
    return id
  }
  walk(tree, -1)
  const total = below[0].length
  if (!total) return tree
  // the smallest node holding every outgroup leaf
  // the deepest node holding every outgroup leaf: descendants come after their ancestors
  let t = 0
  for (let id = 0; id < nodes.length; id++) if (below[id].length === total) t = id
  const p = parent[t]
  if (p < 0) return tree
  const edge = adj[t].find((e) => e.to === p)!
  const orient = (u: number, from: number, length: number, support?: number): PhyloNode => {
    const kids = adj[u].filter((e) => e.to !== from).map((e) => orient(e.to, u, e.length, e.support))
    const n = nodes[u]
    if (!kids.length) return { ...(n.name ? { name: n.name } : {}), length }
    if (kids.length === 1) return { ...kids[0], length: (kids[0].length ?? 0) + length }
    return { ...(n.name ? { name: n.name } : {}), ...(support != null ? { support } : {}), length, children: kids }
  }
  return { children: [orient(t, p, edge.length / 2, edge.support), orient(p, t, edge.length / 2, edge.support)] }
}

/**
 * Pairwise distances between aligned sequences: the share of compared sites
 * that differ, gaps skipped. "jc69" corrects nucleotides for multiple hits
 * (Jukes–Cantor); "p" leaves them raw.
 */
export function distances(sequences: string[], model: "jc69" | "p" = "jc69"): number[][] {
  const seqs = sequences.map((s) => s.toUpperCase())
  return seqs.map((a, i) =>
    seqs.map((b, j) => {
      if (i === j) return 0
      let diff = 0
      let n = 0
      for (let k = 0; k < Math.min(a.length, b.length); k++) {
        if (a[k] === "-" || b[k] === "-" || a[k] === "." || b[k] === ".") continue
        n++
        if (a[k] !== b[k]) diff++
      }
      const p = n ? diff / n : 0
      return model === "p" ? p : p >= 0.75 ? 10 : -0.75 * Math.log(1 - (4 / 3) * p)
    }),
  )
}

/** Saitou and Nei's neighbor joining. Unrooted: the last three meet at the root; reroot on an outgroup. */
export function neighborJoining(names: string[], dist: number[][]): PhyloNode {
  let nodes: PhyloNode[] = names.map((name) => ({ name }))
  let D = dist.map((r) => r.slice())
  if (nodes.length < 2) return nodes[0] ?? {}
  while (nodes.length > 3) {
    const n = nodes.length
    const r = D.map((row) => row.reduce((s, v) => s + v, 0))
    let bi = 0
    let bj = 1
    let best = Infinity
    for (let i = 0; i < n; i++)
      for (let j = i + 1; j < n; j++) {
        const q = (n - 2) * D[i][j] - r[i] - r[j]
        if (q < best) [best, bi, bj] = [q, i, j]
      }
    const li = D[bi][bj] / 2 + (r[bi] - r[bj]) / (2 * (n - 2))
    const u: PhyloNode = { children: [{ ...nodes[bi], length: Math.max(0, li) }, { ...nodes[bj], length: Math.max(0, D[bi][bj] - li) }] }
    const du = nodes.map((_, k) => (D[bi][k] + D[bj][k] - D[bi][bj]) / 2)
    const keep = nodes.map((_, k) => k).filter((k) => k !== bi && k !== bj)
    D = [...keep.map((a) => [...keep.map((b) => D[a][b]), du[a]]), [...keep.map((b) => du[b]), 0]]
    nodes = [...keep.map((k) => nodes[k]), u]
  }
  if (nodes.length === 2) return { children: [nodes[0], { ...nodes[1], length: D[0][1] }] }
  const [a, b, c] = [D[0][1], D[0][2], D[1][2]]
  const len = [(a + b - c) / 2, (a + c - b) / 2, (b + c - a) / 2]
  return { children: nodes.map((x, k) => ({ ...x, length: Math.max(0, len[k]) })) }
}

// ---------------------------------------------------------------- layout

type Laid = {
  id: number
  node: PhyloNode
  parent: number
  kids: number[]
  /** Summed branch length from the root. */
  depth: number
  /** Summed branch length from the root, whatever is drawn. */
  dist: number
  /** Edges to the deepest leaf below. */
  height: number
  leaves: string[]
  /** Deepest leaf below, by branch length. */
  reach: number
  /** Row, for leaves and folded clades; the middle of the children otherwise. */
  pos: number
  /** Shown as a leaf: a real leaf, or folded. */
  tip: boolean
  visible: boolean
}

function lay(tree: PhyloNode, folded: Set<number>, lengths: boolean) {
  const out: Laid[] = []
  const walk = (n: PhyloNode, parent: number, depth: number, dist: number): number => {
    const id = out.length
    const d = parent < 0 ? 0 : depth + (lengths ? Math.max(0, n.length ?? 0) : 1)
    const t = parent < 0 ? 0 : dist + Math.max(0, n.length ?? 0)
    const item: Laid = { id, node: n, parent, kids: [], depth: d, dist: t, height: 0, leaves: [], reach: d, pos: 0, tip: false, visible: true }
    out.push(item)
    item.kids = (n.children ?? []).map((c) => walk(c, id, d, t))
    item.leaves = item.kids.length ? item.kids.flatMap((k) => out[k].leaves) : [n.name ?? ""]
    item.height = item.kids.length ? Math.max(...item.kids.map((k) => out[k].height)) + 1 : 0
    item.reach = item.kids.length ? Math.max(...item.kids.map((k) => out[k].reach)) : d
    return id
  }
  walk(tree, -1, 0, 0)
  let row = 0
  const place = (id: number, hidden: boolean) => {
    const it = out[id]
    it.visible = !hidden
    it.tip = !it.kids.length || folded.has(id)
    if (hidden) {
      it.kids.forEach((k) => place(k, true))
      return
    }
    if (it.tip) {
      it.pos = row++
      it.kids.forEach((k) => place(k, true))
      return
    }
    it.kids.forEach((k) => place(k, false))
    it.pos = (out[it.kids[0]].pos + out[it.kids[it.kids.length - 1]].pos) / 2
  }
  place(0, false)
  return { nodes: out, rows: row }
}

function mrca(nodes: Laid[], taxa: string[]) {
  const want = new Set(taxa)
  let best = -1
  for (const n of nodes) if (taxa.length && taxa.every((t) => n.leaves.includes(t)) && (best < 0 || n.leaves.length <= nodes[best].leaves.length)) best = n.id
  return best >= 0 && nodes[best].leaves.some((l) => want.has(l)) ? best : -1
}

const round = (v: number) => +v.toPrecision(10)
const fmt = (v: number) => (v === 0 ? "0" : Math.abs(v) >= 100 ? v.toFixed(0) : +v.toPrecision(3) + "")

function nice(raw: number) {
  const p = 10 ** Math.floor(Math.log10(raw))
  return [1, 2, 5, 10].map((m) => m * p).find((s) => s >= raw) ?? p * 10
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

const CHAR = 6.6
const tint = (c: Color = "brand", pct = 14) => `color-mix(in oklch, var(--${c}) ${pct}%, transparent)`

// ---------------------------------------------------------------- component

type PhyloTreeProps = Omit<React.ComponentProps<"div">, "children"> & {
  /** Newick, or a parsed tree. */
  tree: string | PhyloNode
  layout?: "rectangular" | "circular"
  /** Draw branch lengths (a phylogram). Without them, or false, leaves line up (a cladogram). Default true. */
  branchLengths?: boolean
  /** Leaves in one column, with dotted leaders. */
  alignLabels?: boolean
  /** Children ordered by size. Default true. */
  ladderize?: boolean
  /** Support at internal nodes: printed values, or dots (circular always uses dots). Default "values". */
  support?: "values" | "dots" | false
  /** Show support at or above this. Default 70. */
  supportThreshold?: number
  /** "bar": a scale bar. "time": an axis counting back from the tips, for dated trees. Default "bar". */
  scale?: "bar" | "time" | false
  /** Branch-length unit, for the scale: "Mya", "substitutions/site". */
  unit?: string
  clades?: PhyloClade[]
  /** Leaves to set in bold. */
  highlight?: string[]
  /** Species names in italics. */
  italic?: boolean
  /** Fold and unfold clades on click or Enter. */
  collapsible?: boolean
  /** Row height, px. Default 24. */
  rowHeight?: number
  /** Circular: the diameter cap, px. Default 560. */
  size?: number
  selectable?: boolean
  onActiveChange?: (focus: PhyloFocus) => void
}

function PhyloTree({
  tree: given,
  layout = "rectangular",
  branchLengths = true,
  alignLabels = false,
  ladderize: ladder = true,
  support = "values",
  supportThreshold = 70,
  scale = "bar",
  unit,
  clades = [],
  highlight = [],
  italic = false,
  collapsible = false,
  rowHeight = 24,
  size: maxSize = 560,
  selectable = false,
  onActiveChange,
  className,
  "aria-label": ariaLabel,
  ...props
}: PhyloTreeProps) {
  const parsed = React.useMemo(() => {
    const t = typeof given === "string" ? parseNewick(given) : given
    return ladder ? ladderize(t) : t
  }, [given, ladder])
  const hasLengths = React.useMemo(() => {
    const any = (n: PhyloNode): boolean => (n.length ?? 0) > 0 || !!n.children?.some(any)
    return any(parsed)
  }, [parsed])
  const lengths = branchLengths && hasLengths

  // which clades are folded: by node id, reset when the tree changes
  const base = React.useMemo(() => lay(parsed, new Set(), lengths).nodes, [parsed, lengths])
  const cladeAt = React.useMemo(() => {
    const m = new Map<number, PhyloClade>()
    for (const c of clades) {
      const id = mrca(base, c.taxa)
      if (id >= 0) m.set(id, c)
    }
    return m
  }, [base, clades])
  const initial = [...cladeAt].filter(([, c]) => c.collapsed).map(([id]) => id)
  // a new tree or new clades start over from their own folds
  const key = `${base.length}:${base[0].leaves.join(",")}:${initial.join(",")}`
  const [folded, setFolded] = React.useState(() => new Set(initial))
  const [seen, setSeen] = React.useState(key)
  if (seen !== key) {
    setSeen(key)
    setFolded(new Set(initial))
  }
  const toggle = (id: number) => {
    if (!collapsible || !base[id]?.kids.length || id === 0) return
    setFolded((f) => {
      const n = new Set(f)
      if (n.has(id)) n.delete(id)
      else n.add(id)
      return n
    })
  }

  const { nodes, rows } = React.useMemo(() => lay(parsed, folded, lengths), [parsed, folded, lengths])
  const visible = React.useMemo(() => nodes.filter((n) => n.visible), [nodes])
  const maxDepth = Math.max(...visible.map((n) => (n.tip ? n.reach : n.depth)), 1e-9)
  const x0 = (n: Laid) => (lengths ? n.depth : maxLevel - n.height)
  const maxLevel = nodes[0].height
  const xMax = lengths ? maxDepth : maxLevel
  const xOf = x0
  const reachOf = (n: Laid) => (lengths ? n.reach : maxLevel)

  const tipText = (n: Laid) => {
    if (!n.kids.length) return n.node.name ?? ""
    const c = cladeAt.get(n.id)
    return `${c?.label ?? n.node.name ?? "Clade"} (${n.leaves.length})`
  }
  const tips = visible.filter((n) => n.tip)
  const labelW = Math.max(0, ...tips.map((n) => tipText(n).length * CHAR)) + 8
  const cladeList = [...cladeAt].filter(([id]) => nodes[id].visible && !nodes[id].tip)

  const [ref, width] = useWidth()
  const circular = layout === "circular"

  // ---- rectangular geometry
  const pad = 4
  const top = 10
  const showScale = scale && lengths
  const cladeW = !circular && cladeList.length ? Math.max(...cladeList.map(([, c]) => c.label.length * CHAR)) + 16 : 0
  const rectH = top + rows * rowHeight + (showScale ? (scale === "time" ? 34 : 30) : 8)
  // scale so the longest label still fits after its leaf
  const k = React.useMemo(() => {
    const room = width - pad * 2 - cladeW
    if (alignLabels) return Math.max(1, room - labelW) / xMax
    let best = Infinity
    for (const n of tips) {
      const x = lengths ? reachOf(n) : maxLevel
      if (x > 0) best = Math.min(best, (room - tipText(n).length * CHAR - 8) / x)
    }
    return Math.max(0.0001, best === Infinity ? room : best)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, cladeW, alignLabels, labelW, xMax, nodes, lengths])
  const X = (v: number) => pad + v * k
  const Y = (pos: number) => top + pos * rowHeight + rowHeight / 2

  // ---- circular geometry
  const diameter = Math.min(width, maxSize)
  const cH = diameter
  const ring = cladeList.length ? 10 : 0
  const R = Math.max(20, diameter / 2 - labelW - ring - 6)
  const cx = width / 2
  const cy = cH / 2
  // one empty row's worth of opening at the top, so the first and last leaves don't meet
  const step = (2 * Math.PI) / (Math.max(rows, 1) + 1)
  const A = (pos: number) => (pos + 1) * step - Math.PI / 2
  // radii to scale, but every branch at least MIN_STEP long, so nested arcs near the rim
  // keep apart; the whole tree shrinks to fit if that pushes it past R
  const radii = React.useMemo(() => {
    const node = new Map<number, number>()
    const end = new Map<number, number>()
    if (!circular) return { node, end, f: 1 }
    const MIN_STEP = 12
    const raw = (v: number) => (v / xMax) * R
    let max = 0
    for (const n of visible) {
      const r = n.parent < 0 ? 0 : Math.max(raw(x0(n)), node.get(n.parent)! + MIN_STEP)
      node.set(n.id, r)
      if (n.tip) {
        const e = n.kids.length ? Math.max(raw(reachOf(n)), r + 14) : r
        end.set(n.id, e)
        max = Math.max(max, e)
      }
    }
    const f = max > R ? R / max : 1
    if (f < 1) {
      for (const [id, r] of node) node.set(id, r * f)
      for (const [id, r] of end) end.set(id, r * f)
    }
    return { node, end, f }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [circular, visible, xMax, R, lengths])
  const rOf = (n: Laid) => radii.node.get(n.id) ?? 0
  const rEnd = (n: Laid) => radii.end.get(n.id) ?? rOf(n)
  const P = (r: number, a: number) => [cx + r * Math.cos(a), cy + r * Math.sin(a)] as const

  // ---- focus
  const [hover, setHover] = React.useState<number | null>(null)
  const [cursor, setCursor] = React.useState(0)
  const [focused, setFocused] = React.useState(false)
  const active = hover ?? (focused && selectable ? cursor : null)
  const farthest = Math.max(...nodes.map((n) => n.dist))
  const activeNode = active != null && nodes[active]?.visible ? nodes[active] : null
  const inside = React.useMemo(() => {
    const s = new Set<number>()
    if (!activeNode) return s
    const go = (id: number) => {
      s.add(id)
      nodes[id].kids.forEach(go)
    }
    go(activeNode.id)
    return s
  }, [activeNode, nodes])
  const cb = React.useRef(onActiveChange)
  cb.current = onActiveChange
  React.useEffect(
    () => cb.current?.(activeNode ? { node: activeNode.node, taxa: activeNode.leaves, depth: round(activeNode.dist), age: round(farthest - activeNode.dist), clade: cladeAt.get(activeNode.id)?.label } : null),
    [activeNode, cladeAt, farthest],
  )

  const dated = scale === "time" && lengths
  const describe = (n: Laid | null) => {
    if (!n) return ""
    const parts: string[] = []
    if (!n.kids.length) parts.push(n.node.name ?? "Leaf")
    else parts.push(`${cladeAt.get(n.id)?.label ?? n.node.name ?? (n.id === 0 ? "Root" : "Clade")}, ${n.leaves.length} taxa${folded.has(n.id) ? ", folded" : ""}`)
    if (n.node.support != null && n.kids.length) parts.push(`support ${fmt(n.node.support)}`)
    if (dated && n.kids.length) parts.push(`${fmt(farthest - n.dist)}${unit ? ` ${unit}` : ""}`)
    else if (n.id && n.node.length != null) parts.push(`branch ${fmt(n.node.length)}${unit && !dated ? ` ${unit}` : ""}`)
    return parts.join(", ")
  }

  // keyboard order: the visible nodes, top to bottom
  const order = React.useMemo(() => visible.map((n) => n.id), [visible])
  const onKeyDown = (e: React.KeyboardEvent) => {
    const cur = nodes[cursor]?.visible ? cursor : 0
    const at = order.indexOf(cur)
    let next = cur
    if (e.key === "ArrowDown") next = order[Math.min(order.length - 1, at + 1)]
    else if (e.key === "ArrowUp") next = order[Math.max(0, at - 1)]
    else if (e.key === "ArrowLeft") next = nodes[cur].parent >= 0 ? nodes[cur].parent : cur
    else if (e.key === "ArrowRight") next = !nodes[cur].tip ? nodes[cur].kids[0] : cur
    else if (e.key === "Home") next = order[0]
    else if (e.key === "End") next = order[order.length - 1]
    else if ((e.key === "Enter" || e.key === " ") && collapsible) {
      e.preventDefault()
      toggle(cur)
      return
    } else return
    e.preventDefault()
    setCursor(next)
  }

  const label =
    ariaLabel ??
    `Phylogenetic tree, ${nodes[0].leaves.length} taxa${cladeList.length ? `. Clades: ${cladeList.map(([id, c]) => `${c.label} (${nodes[id].leaves.join(", ")})`).join("; ")}` : ""}`

  const dim = (id: number) => (activeNode && !inside.has(id) ? 0.28 : 1)
  const supportShown = (n: Laid) => support && n.kids.length && !n.tip && n.id !== 0 && n.node.support != null && n.node.support >= supportThreshold

  const H = circular ? cH : rectH

  // ---- the scale
  const bar = React.useMemo(() => {
    if (!showScale) return null
    const v = nice(xMax / 5)
    return { v, px: v * (circular ? (R / xMax) * radii.f : k) }
  }, [showScale, circular, R, xMax, k, radii.f])
  const ticks = React.useMemo(() => {
    if (scale !== "time" || !lengths || circular) return []
    const s = nice(maxDepth / Math.max(2, Math.floor((maxDepth * k) / 70)))
    const out: number[] = []
    for (let t = 0; t <= maxDepth + 1e-9; t += s) out.push(t)
    return out
  }, [scale, lengths, circular, maxDepth, k])

  // ---- drawing
  const branch = (n: Laid) => {
    const p = nodes[n.parent]
    if (!p) return null
    if (circular) {
      const rp = rOf(p)
      const ap = A(p.pos)
      const an = A(n.pos)
      const rn = rOf(n)
      const [ax, ay] = P(rp, ap)
      const [bx, by] = P(rp, an)
      const [ex, ey] = P(rn, an)
      const arc = Math.abs(an - ap) > 1e-6 ? `A${rp},${rp} 0 ${Math.abs(an - ap) > Math.PI ? 1 : 0} ${an > ap ? 1 : 0} ${bx},${by}` : ""
      return `M${ax},${ay}${arc}L${ex},${ey}`
    }
    const px = X(x0(p))
    const py = Y(p.pos)
    const nx = X(xOf(n))
    const ny = Y(n.pos)
    const dy = ny - py
    const r = Math.min(5, Math.abs(dy), Math.max(0, nx - px))
    if (r < 0.5) return `M${px},${py}V${ny}H${nx}`
    const s = Math.sign(dy)
    return `M${px},${py}V${ny - s * r}Q${px},${ny} ${px + r},${ny}H${nx}`
  }

  const fold = (n: Laid) => {
    const h = rowHeight * 0.36
    if (circular) {
      const r0 = rOf(n)
      const r1 = rEnd(n)
      const a = A(n.pos)
      const da = Math.min(step * 0.36, 0.3)
      const [ax, ay] = P(r0, a)
      const [bx, by] = P(r1, a - da)
      const [ex, ey] = P(r1, a + da)
      return `M${ax},${ay}L${bx},${by}A${r1},${r1} 0 0 1 ${ex},${ey}Z`
    }
    const x = X(xOf(n))
    const y = Y(n.pos)
    const x1 = Math.max(X(reachOf(n)), x + 14)
    return `M${x},${y}L${x1},${y - h}L${x1},${y + h}Z`
  }

  const labelPos = (n: Laid) => {
    const end = n.tip && n.kids.length ? Math.max(X(reachOf(n)), X(xOf(n)) + 14) : X(xOf(n))
    return alignLabels ? X(xMax) + 6 : end + 6
  }

  return (
    <div data-slot="phylo-tree" className={cn("grid w-full min-w-0 gap-3", className)} {...props}>
      <div
        ref={ref}
        className={cn("relative w-full select-none outline-none", selectable && "rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring")}
        style={{ height: width ? H : rectH }}
        onPointerLeave={() => setHover(null)}
        {...(selectable
          ? {
              role: "group",
              "aria-roledescription": "phylogenetic tree",
              tabIndex: 0,
              "aria-label": `${label}. Arrow keys move between nodes${collapsible ? ", Enter folds a clade" : ""}.`,
              onKeyDown,
              onFocus: () => setFocused(true),
              onBlur: () => setFocused(false),
            }
          : { role: "img", "aria-label": label })}
      >
        {width > 0 && (
          <svg width={width} height={H} aria-hidden className="block overflow-visible">
            {/* clades */}
            {cladeList.map(([id, c]) => {
              const n = nodes[id]
              const under = tips.filter((v) => inside0(nodes, id, v.id))
              const first = Math.min(...under.map((v) => v.pos))
              const last = Math.max(...under.map((v) => v.pos))
              if (circular) {
                const a0 = A(first) - step / 2
                const a1 = A(last) + step / 2
                const r0 = Math.max(0, rOf(n) - 6)
                const r1 = R + labelW + 2
                const r2 = r1 + 6
                const large = a1 - a0 > Math.PI ? 1 : 0
                const [p0x, p0y] = P(r0, a0)
                const [p1x, p1y] = P(r1, a0)
                const [p2x, p2y] = P(r1, a1)
                const [p3x, p3y] = P(r0, a1)
                const [q0x, q0y] = P(r2, a0 + 0.01)
                const [q1x, q1y] = P(r2, a1 - 0.01)
                return (
                  <g key={`c${id}`}>
                    <path d={`M${p0x},${p0y}L${p1x},${p1y}A${r1},${r1} 0 ${large} 1 ${p2x},${p2y}L${p3x},${p3y}A${r0},${r0} 0 ${large} 0 ${p0x},${p0y}Z`} fill={tint(c.color)} />
                    <path d={`M${q0x},${q0y}A${r2},${r2} 0 ${large} 1 ${q1x},${q1y}`} fill="none" stroke={`var(--${c.color ?? "brand"})`} strokeWidth={4} strokeLinecap="round" />
                  </g>
                )
              }
              const ends = under.map((v) => labelPos(v) + tipText(v).length * CHAR)
              const bx = Math.max(...ends) + 6
              const x = X(x0(n)) - 6
              const y0 = Y(first) - rowHeight / 2 + 2
              const y1 = Y(last) + rowHeight / 2 - 2
              return (
                <g key={`c${id}`}>
                  <rect x={x} y={y0} width={bx - x} height={y1 - y0} rx={8} fill={tint(c.color)} />
                  <rect x={bx + 4} y={y0} width={4} height={y1 - y0} rx={2} fill={`var(--${c.color ?? "brand"})`} />
                  <text x={bx + 14} y={(y0 + y1) / 2 + 4} className="fill-foreground text-[0.75rem] font-medium">
                    {c.label}
                  </text>
                </g>
              )
            })}

            {/* leaders to aligned labels */}
            {alignLabels &&
              tips.map((n) => {
                const from = n.kids.length ? Math.max(X(reachOf(n)), X(xOf(n)) + 14) : X(xOf(n))
                if (circular) {
                  const [ax, ay] = P(rEnd(n), A(n.pos))
                  const [bx, by] = P(R + 2, A(n.pos))
                  return <line key={`d${n.id}`} x1={ax} y1={ay} x2={bx} y2={by} className="stroke-outline-variant" strokeDasharray="1 3" strokeLinecap="round" opacity={dim(n.id)} />
                }
                return from < X(xMax) ? (
                  <line key={`d${n.id}`} x1={from + 3} x2={X(xMax) + 2} y1={Y(n.pos)} y2={Y(n.pos)} className="stroke-outline-variant" strokeDasharray="1 3" strokeLinecap="round" opacity={dim(n.id)} />
                ) : null
              })}

            {/* branches */}
            {visible.map((n) => {
              const d = branch(n)
              return d ? (
                <path
                  key={`b${n.id}`}
                  d={d}
                  fill="none"
                  className="stroke-foreground"
                  strokeWidth={activeNode && inside.has(n.id) && n.id !== activeNode.id ? 2 : 1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={dim(n.id) === 1 || n.id === activeNode?.id ? 1 : 0.28}
                />
              ) : null
            })}

            {/* folded clades */}
            {tips
              .filter((n) => n.kids.length)
              .map((n) => (
                <path key={`f${n.id}`} d={fold(n)} className="fill-surface-container-highest stroke-foreground" strokeWidth={1.5} strokeLinejoin="round" opacity={dim(n.id)} />
              ))}

            {/* support */}
            {support &&
              visible.filter(supportShown).map((n) => {
                if (circular || support === "dots") {
                  const [x, y] = circular ? P(rOf(n), A(n.pos)) : [X(x0(n)), Y(n.pos)]
                  return <circle key={`s${n.id}`} cx={x} cy={y} r={3} className="fill-foreground" opacity={dim(n.id)} />
                }
                return (
                  <text key={`s${n.id}`} x={X(x0(n)) - 4} y={Y(n.pos) - 5} textAnchor="end" className="fill-muted-foreground text-[0.625rem] tabular-nums" opacity={dim(n.id)}>
                    {fmt(n.node.support!)}
                  </text>
                )
              })}

            {/* labels */}
            {tips.map((n) => {
              const strong = highlight.includes(n.node.name ?? "")
              const folded = n.kids.length > 0
              const cls = cn("text-[0.75rem]", italic && !folded && "italic", strong || folded ? "fill-foreground font-semibold" : "fill-foreground", activeNode?.id === n.id && "font-semibold")
              if (circular) {
                const a = A(n.pos)
                const r = alignLabels ? R + 6 : rEnd(n) + 6
                const [x, y] = P(r, a)
                const flip = Math.cos(a) < -1e-6
                const deg = (a * 180) / Math.PI + (flip ? 180 : 0)
                return (
                  <text key={`l${n.id}`} x={x} y={y} dy="0.32em" transform={`rotate(${deg} ${x} ${y})`} textAnchor={flip ? "end" : "start"} className={cls} opacity={dim(n.id)}>
                    {tipText(n)}
                  </text>
                )
              }
              return (
                <text key={`l${n.id}`} x={labelPos(n)} y={Y(n.pos) + 4} className={cls} opacity={dim(n.id)}>
                  {tipText(n)}
                </text>
              )
            })}

            {/* the active node */}
            {activeNode &&
              (() => {
                const [x, y] = circular ? P(rOf(activeNode), A(activeNode.pos)) : [X(xOf(activeNode)), Y(activeNode.pos)]
                return <circle cx={x} cy={y} r={4.5} className="fill-foreground stroke-background" strokeWidth={2} />
              })()}

            {/* scale */}
            {bar && scale === "bar" && (
              <g transform={circular ? `translate(${Math.max(pad, cx - diameter / 2)},${H - 6})` : `translate(${pad},${H - 10})`}>
                <path d={`M0,-4V0H${bar.px}V-4`} fill="none" className="stroke-foreground" strokeWidth={1.25} />
                <text x={bar.px + 6} y={3} className="fill-muted-foreground text-[0.6875rem] tabular-nums">
                  {fmt(bar.v)}
                  {unit ? ` ${unit}` : ""}
                </text>
              </g>
            )}
            {ticks.length > 0 && (
              <g>
                <line x1={X(0)} x2={X(maxDepth)} y1={H - 26} y2={H - 26} className="stroke-outline" />
                {ticks.map((t) => (
                  <g key={t}>
                    <line x1={X(maxDepth - t)} x2={X(maxDepth - t)} y1={H - 26} y2={H - 22} className="stroke-outline" />
                    <text x={X(maxDepth - t)} y={H - 10} textAnchor={t === 0 && X(maxDepth) > width - 30 ? "end" : "middle"} className="fill-muted-foreground text-[0.6875rem] tabular-nums">
                      {fmt(t)}
                    </text>
                  </g>
                ))}
                {unit && (
                  <text x={X(maxDepth) + 12} y={H - 10} className="fill-muted-foreground text-[0.6875rem]">
                    {unit}
                  </text>
                )}
              </g>
            )}

            {/* hit targets */}
            {visible.map((n) => {
              const enter = () => setHover(n.id)
              const click = () => {
                setCursor(n.id)
                toggle(n.id)
              }
              const cls = cn(collapsible && n.kids.length && n.id !== 0 && "cursor-pointer")
              if (n.tip) {
                if (circular) {
                  const [x, y] = P(rOf(n), A(n.pos))
                  return <circle key={`h${n.id}`} cx={x} cy={y} r={10} fill="transparent" onPointerEnter={enter} onClick={click} className={cls} />
                }
                const x = X(xOf(n))
                return <rect key={`h${n.id}`} x={x} y={Y(n.pos) - rowHeight / 2} width={labelPos(n) + tipText(n).length * CHAR - x} height={rowHeight} fill="transparent" onPointerEnter={enter} onClick={click} className={cls} />
              }
              const [x, y] = circular ? P(rOf(n), A(n.pos)) : [X(x0(n)), Y(n.pos)]
              return <circle key={`h${n.id}`} cx={x} cy={y} r={10} fill="transparent" onPointerEnter={enter} onClick={click} className={cls} />
            })}
          </svg>
        )}

        {activeNode && hover != null && (
          <div
            aria-hidden
            className="pointer-events-none absolute z-10 grid -translate-x-1/2 -translate-y-full gap-0.5 whitespace-nowrap rounded-xl bg-inverse-surface px-3 py-2 text-inverse-foreground shadow-e2"
            style={(() => {
              const [x, y] = circular ? P(rOf(activeNode), A(activeNode.pos)) : [X(xOf(activeNode)), Y(activeNode.pos)]
              return { left: Math.max(80, Math.min(width - 80, x)), top: y - 10 }
            })()}
          >
            <span className={cn("type-label-lg font-semibold", italic && !activeNode.kids.length && "italic")}>
              {activeNode.kids.length ? (cladeAt.get(activeNode.id)?.label ?? activeNode.node.name ?? (activeNode.id === 0 ? "Root" : "Clade")) : activeNode.node.name}
            </span>
            {activeNode.kids.length > 0 && <span className="type-label-sm opacity-80">{activeNode.leaves.length} taxa</span>}
            {activeNode.node.support != null && activeNode.kids.length > 0 && <span className="type-label-sm tabular-nums opacity-80">Support {fmt(activeNode.node.support)}</span>}
            {dated && activeNode.kids.length > 0 ? (
              <span className="type-label-sm tabular-nums opacity-80">
                {fmt(farthest - activeNode.dist)}
                {unit ? ` ${unit}` : ""}
              </span>
            ) : (
              activeNode.id !== 0 &&
              activeNode.node.length != null && (
                <span className="type-label-sm tabular-nums opacity-80">
                  Branch {fmt(activeNode.node.length)}
                  {unit && !dated ? ` ${unit}` : ""}
                </span>
              )
            )}
            {collapsible && activeNode.kids.length > 0 && activeNode.id !== 0 && <span className="type-label-sm opacity-80">{folded.has(activeNode.id) ? "Click to unfold" : "Click to fold"}</span>}
          </div>
        )}
      </div>

      {selectable && (
        <span className="sr-only" aria-live="polite">
          {focused ? describe(nodes[cursor]?.visible ? nodes[cursor] : nodes[0]) : ""}
        </span>
      )}

      {circular && cladeList.length > 0 && (
        <ul className="flex flex-wrap justify-center gap-x-5 gap-y-2" aria-hidden>
          {cladeList.map(([id, c]) => (
            <li key={id} className="flex items-center gap-2 type-label-md">
              <span className="size-3 rounded-[4px]" style={{ background: `var(--${c.color ?? "brand"})` }} />
              {c.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function inside0(nodes: Laid[], root: number, id: number) {
  for (let n = id; n >= 0; n = nodes[n].parent) if (n === root) return true
  return false
}

export { PhyloTree, type PhyloTreeProps }
