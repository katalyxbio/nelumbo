"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Nelumbo ChemicalStructure
 *
 * A molecule's skeletal formula, drawn from a SMILES string as crisp SVG.
 * Built on smiles-drawer, which lays the molecule out in the browser; there
 * are no images to host and no server to call.
 *
 *   <ChemicalStructure smiles="CN1C=NC2=C1C(=O)N(C(=O)N2C)C" name="Caffeine" />
 *   <ChemicalStructure smiles={aspirin} color="mono" showFormula />
 *   <ChemicalStructure smiles="C[C@H](N)C(=O)O" />            // stereo wedges
 *   <ChemicalStructure smiles="CC(=O)[NH:1]c1ccc(O)cc1" highlight={[1]} />
 *
 * - The drawing follows the theme: bonds and carbon in the text color, the
 *   background shows through, and it redraws for dark mode.
 * - `color`: "element" (default) colors heteroatom labels the conventional way
 *   (nitrogen blue, oxygen red, sulfur amber, halogens green); "mono" keeps
 *   everything in the text color.
 * - `highlight`: atom-map numbers from the SMILES (the `:1` in `[NH:1]`),
 *   drawn with a soft halo, for reacting centres or a pharmacophore.
 * - `showFormula`: the molecular formula under the drawing; `name` titles it.
 * - `explicitHydrogens`, `terminalCarbons`: drawing options.
 * - It is an image to assistive technology, named after `name` (or `label`).
 *   An invalid SMILES shows a short message instead of throwing.
 */

/** Placeholder colors smiles-drawer writes into the SVG; we swap them for design tokens afterwards. */
const SLOTS = {
  FOREGROUND: ["#010101", "var(--chem-ink)"],
  BACKGROUND: ["#010102", "var(--chem-paper)"],
  C: ["#010103", "var(--chem-ink)"],
  H: ["#010104", "var(--chem-ink)"],
  O: ["#010105", "var(--chem-o)"],
  N: ["#010106", "var(--chem-n)"],
  S: ["#010107", "var(--chem-s)"],
  P: ["#010108", "var(--chem-p)"],
  F: ["#010109", "var(--chem-halogen)"],
  CL: ["#01010a", "var(--chem-halogen)"],
  BR: ["#01010b", "var(--chem-br)"],
  I: ["#01010c", "var(--chem-i)"],
  B: ["#01010d", "var(--chem-other)"],
  SI: ["#01010e", "var(--chem-other)"],
} as const
const SWAP = new Map<string, string>(Object.values(SLOTS).map(([from, to]) => [from, to]))
const THEME = Object.fromEntries(Object.entries(SLOTS).map(([k, [hex]]) => [k, hex]))

type ChemicalStructureProps = Omit<React.ComponentProps<"figure">, "children"> & {
  smiles: string
  /** Shown as a caption and used as the accessible name. */
  name?: string
  /** Accessible name when there is no `name`. */
  label?: string
  color?: "element" | "mono"
  /** Atom-map numbers to highlight, e.g. [1] for `[NH:1]`. */
  highlight?: number[]
  showFormula?: boolean
  explicitHydrogens?: boolean
  terminalCarbons?: boolean
  /** Bond length in px at 1×; the drawing scales to fit its box either way. */
  bondLength?: number
}

type SmilesDrawerModule = typeof import("smiles-drawer").default

/* ------------------------------------------------------------------ */
/* Molecular formula                                                   */
/* ------------------------------------------------------------------ */

type DrawAtom = { element: string; bracket: { hcount?: number } | null; isPartOfAromaticRing: boolean }
type DrawGraph = {
  vertices: { id: number; value: DrawAtom; edges: number[] }[]
  edges: { sourceId: number; targetId: number; weight: number }[]
}

/** Normal valences, smallest first: an atom takes the smallest one its bonds fit. */
const VALENCE: Record<string, number[]> = { C: [4], N: [3, 5], O: [2], S: [2, 4, 6], P: [3, 5], B: [3], F: [1], Cl: [1], Br: [1], I: [1], Si: [4] }

/**
 * Hill-order formula (C, H, then alphabetical) with implicit hydrogens from normal valences.
 * smiles-drawer's own formula skips some bond orders, so we count from its graph ourselves.
 */
function formulaOf(graph: DrawGraph): string {
  const counts = new Map<string, number>()
  const add = (el: string, n: number) => n && counts.set(el, (counts.get(el) ?? 0) + n)
  // bond orders and hydrogen neighbours per atom, from the edge list (an atom's own edge list can repeat ring closures)
  const order = new Map<number, number>()
  const hNeighbours = new Map<number, number>()
  const seen = new Set<string>()
  for (const e of graph.edges) {
    if (!e) continue
    const key = e.sourceId < e.targetId ? `${e.sourceId}-${e.targetId}` : `${e.targetId}-${e.sourceId}`
    if (seen.has(key)) continue
    seen.add(key)
    for (const [a, b] of [
      [e.sourceId, e.targetId],
      [e.targetId, e.sourceId],
    ]) {
      order.set(a, (order.get(a) ?? 0) + (e.weight || 1))
      if (graph.vertices[b]?.value.element === "H") hNeighbours.set(a, (hNeighbours.get(a) ?? 0) + 1)
    }
  }
  for (const v of graph.vertices) {
    const atom = v.value
    const el = atom.element.length > 1 ? atom.element[0] + atom.element.slice(1).toLowerCase() : atom.element
    add(el, 1)
    if (el === "H") continue
    if (atom.bracket) {
      // hydrogens drawn as their own atoms (stereo H) are already counted
      add("H", Math.max(0, (atom.bracket.hcount ?? 0) - (hNeighbours.get(v.id) ?? 0)))
      continue
    }
    let bonds = order.get(v.id) ?? 0
    // a lowercase aromatic atom carries one more bond than its single bonds show, unless it is already full
    // (a substituted ring nitrogen, or a ring carbon with a C=O)
    if (atom.isPartOfAromaticRing && (el === "C" || el === "N") && bonds < (VALENCE[el]?.[0] ?? 4)) bonds += 1
    const target = (VALENCE[el] ?? [bonds]).find((val) => val >= bonds) ?? bonds
    add("H", Math.max(0, target - bonds))
  }
  const hill = ["C", "H", ...[...counts.keys()].filter((k) => k !== "C" && k !== "H").sort()]
  return hill
    .filter((el) => counts.get(el))
    .map((el) => el + (counts.get(el)! > 1 ? counts.get(el) : ""))
    .join("")
}

let loader: Promise<SmilesDrawerModule> | null = null
const loadDrawer = () => (loader ??= import("smiles-drawer").then((m) => m.default))

/** Subscript digits for a formula like C8H10N4O2. */
function Formula({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\d+)/).map((part, i) =>
        /^\d+$/.test(part) ? (
          <sub key={i} className="text-[0.75em] leading-none">
            {part}
          </sub>
        ) : (
          part
        )
      )}
    </>
  )
}

function ChemicalStructure({
  smiles,
  name,
  label,
  color = "element",
  highlight = [],
  showFormula = false,
  explicitHydrogens = false,
  terminalCarbons = false,
  bondLength = 30,
  className,
  ...props
}: ChemicalStructureProps) {
  const svgRef = React.useRef<SVGSVGElement>(null)
  const [error, setError] = React.useState(false)
  const [formula, setFormula] = React.useState<string | null>(null)
  const highlightKey = highlight.join(",")

  React.useEffect(() => {
    let cancelled = false
    const svg = svgRef.current
    if (!svg) return
    loadDrawer()
      .then((SD) => {
        if (cancelled) return
        SD.parse(
          smiles,
          (tree) => {
            if (cancelled || !svgRef.current) return
            while (svg.firstChild) svg.removeChild(svg.firstChild)
            const drawer = new SD.SvgDrawer({
              bondThickness: 1.15,
              bondLength,
              shortBondLength: 0.82,
              bondSpacing: bondLength * 0.19,
              fontFamily: getComputedStyle(svg).fontFamily || "sans-serif",
              fontSizeLarge: bondLength * 0.36,
              fontSizeSmall: bondLength * 0.25,
              padding: bondLength * 0.6,
              explicitHydrogens,
              terminalCarbons,
              compactDrawing: false,
              themes: { nelumbo: THEME },
            })
            try {
              drawer.draw(
                tree,
                svg,
                "nelumbo",
                null,
                false,
                highlight.map((n) => [n, "#0101ff"])
              )
            } catch {
              setError(true)
              setFormula(null)
              return
            }
            // swap the placeholder colors for design tokens, so the drawing follows the theme
            svg.querySelectorAll<SVGElement>("*").forEach((el) => {
              for (const attr of ["stroke", "fill", "stop-color"]) {
                const v = el.getAttribute(attr)?.toLowerCase()
                if (!v) continue
                if (v === "#0101ff") el.style.setProperty(attr, "var(--chem-highlight)")
                else {
                  const to = SWAP.get(v)
                  if (to) el.style.setProperty(attr, to)
                }
              }
            })
            // the drawing scales to its box rather than using fixed pixel sizes
            svg.removeAttribute("width")
            svg.removeAttribute("height")
            svg.style.removeProperty("width")
            svg.style.removeProperty("height")
            try {
              setFormula(formulaOf((drawer as unknown as { preprocessor: { graph: DrawGraph } }).preprocessor.graph))
            } catch {
              setFormula(null)
            }
            setError(false)
          },
          () => {
            if (cancelled) return
            setError(true)
            setFormula(null)
          }
        )
      })
      .catch(() => !cancelled && setError(true))
    return () => {
      cancelled = true
    }
    // highlightKey stands in for the highlight array
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [smiles, explicitHydrogens, terminalCarbons, bondLength, highlightKey])

  const accessibleName = name ?? label ?? "Chemical structure"

  return (
    <figure
      data-slot="chemical-structure"
      data-color={color}
      className={cn(
        "flex min-w-0 flex-col items-center gap-2 text-foreground",
        // tokens the drawing reads
        "[--chem-ink:var(--foreground)] [--chem-paper:transparent]",
        "[--chem-highlight:color-mix(in_oklch,var(--brand)_28%,transparent)]",
        color === "element"
          ? "[--chem-o:var(--red)] [--chem-n:var(--blue)] [--chem-s:var(--amber)] [--chem-p:var(--orange)] [--chem-halogen:var(--green)] [--chem-br:var(--red)] [--chem-i:var(--purple)] [--chem-other:var(--pink)]"
          : "[--chem-o:var(--foreground)] [--chem-n:var(--foreground)] [--chem-s:var(--foreground)] [--chem-p:var(--foreground)] [--chem-halogen:var(--foreground)] [--chem-br:var(--foreground)] [--chem-i:var(--foreground)] [--chem-other:var(--foreground)]",
        className
      )}
      {...props}
    >
      <svg
        ref={svgRef}
        role="img"
        aria-label={error ? `${accessibleName}: the structure could not be drawn` : accessibleName}
        className={cn("block aspect-[4/3] w-full max-w-full font-sans", error && "hidden")}
      />
      {error && (
        <div className="grid aspect-[4/3] w-full place-items-center rounded-2xl bg-surface-container px-4 text-center type-body-sm text-muted-foreground">
          Couldn&apos;t read this SMILES.
        </div>
      )}
      {(name || (showFormula && formula)) && (
        <figcaption className="flex flex-col items-center gap-0.5 text-center">
          {name && <span className="type-title-sm">{name}</span>}
          {showFormula && formula && (
            <span className="type-body-sm text-muted-foreground tabular-nums">
              <Formula text={formula} />
            </span>
          )}
        </figcaption>
      )}
    </figure>
  )
}

export { ChemicalStructure, type ChemicalStructureProps }
