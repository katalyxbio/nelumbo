"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { Icon } from "@/registry/nelumbo/ui/icon"

import {
  RESIDUE_HUES as H,
  type ResidueRange,
  type ResidueSize,
  Residue,
  ResidueSequence,
  type ResidueProps,
  type ResidueSequenceProps,
  type ResidueTone,
} from "@/registry/nelumbo/ui/residue"

/**
 * Nelumbo Nucleotide
 *
 * A DNA or RNA base as a colored tile, and a whole strand as blocks of tiles.
 *
 *   <Nucleotide base="A" />
 *   <NucleotideSequence sequence="ATGGCC..." ruler complement selectable />
 *   <NucleotideChange from="GACGTC" to="GAAGTC" />     // the changed base as a capsule in both
 *   <NucleotideChange from="GACGTC" to="GAAGTC" compact position={3} />  // [3|C] → [A]
 *
 * Schemes (all drawn in Nelumbo's tone system, so they share one lightness):
 * - "nelumbo" (default): A green, C blue, G amber, T and U red, on the palette's own hues.
 * - "pairs": each Watson-Crick pair shares a hue, the purine deeper and the
 *   pyrimidine lighter: A and T in green, G and C in blue. Complements match by eye.
 * - "chemistry": purines warm (A amber, G orange), pyrimidines cool (C cyan, T purple):
 *   transitions stay within a temperature.
 * - "igv", "jalview", "trace": the hues of those tools' base colors.
 * - "okabe-ito": Okabe and Ito's color-blind-safe set, kept apart by lightness too.
 * - "none": neutral tiles.
 *
 * Ambiguity codes (N, R, Y, S, W, K, M, B, D, H, V) are neutral; gaps ("-") have no tile.
 */

export type NucleotideScheme = "nelumbo" | "pairs" | "chemistry" | "igv" | "jalview" | "trace" | "okabe-ito" | "none"

type Bases = Record<"A" | "C" | "G" | "T", ResidueTone>

const SCHEMES: Record<Exclude<NucleotideScheme, "none">, Bases> = {
  nelumbo: { A: { hue: H.green }, C: { hue: H.blue }, G: { hue: H.amber }, T: { hue: H.red } },
  pairs: {
    A: { hue: H.green, shade: -0.6 },
    T: { hue: H.green, chroma: 0.75, shade: 0.7 },
    G: { hue: H.blue, shade: -0.6 },
    C: { hue: H.blue, chroma: 0.75, shade: 0.7 },
  },
  chemistry: { A: { hue: H.amber }, G: { hue: H.orange }, C: { hue: H.cyan }, T: { hue: H.purple } },
  igv: { A: { hue: 142 }, C: { hue: 262 }, G: { hue: 55 }, T: { hue: 27 } },
  jalview: { A: { hue: 140 }, C: { hue: 68 }, G: { hue: 27 }, T: { hue: 255 } },
  trace: { A: { hue: 145 }, C: { hue: 258 }, G: { hue: 0, chroma: 0, shade: -1 }, T: { hue: 27 } },
  "okabe-ito": {
    A: { hue: 168, shade: -0.4 },
    C: { hue: 232, shade: 0.6 },
    G: { hue: 75, shade: 0.3 },
    T: { hue: 350, shade: -0.5 },
  },
}

export const NUCLEOTIDE_SCHEMES: { id: NucleotideScheme; name: string; about: string }[] = [
  { id: "nelumbo", name: "Nelumbo", about: "A green, C blue, G amber, T red, on the palette's hues" },
  { id: "pairs", name: "Base pairs", about: "A and T share green, G and C share blue: complements match by eye" },
  { id: "chemistry", name: "Purines and pyrimidines", about: "Warm purines, cool pyrimidines" },
  { id: "igv", name: "IGV", about: "The Integrative Genomics Viewer's hues" },
  { id: "jalview", name: "Jalview", about: "Jalview's nucleotide hues" },
  { id: "trace", name: "Sanger trace", about: "Chromatogram colors, G in gray" },
  { id: "okabe-ito", name: "Color-blind safe", about: "Okabe and Ito's set, apart in lightness as well as hue" },
  { id: "none", name: "None", about: "Neutral tiles" },
]

export const NUCLEOTIDE_NAMES: Record<string, string> = {
  A: "Adenine",
  C: "Cytosine",
  G: "Guanine",
  T: "Thymine",
  U: "Uracil",
  N: "Any base",
  R: "Purine (A or G)",
  Y: "Pyrimidine (C or T)",
  S: "Strong (G or C)",
  W: "Weak (A or T)",
  K: "Keto (G or T)",
  M: "Amino (A or C)",
  B: "Not A",
  D: "Not C",
  H: "Not G",
  V: "Not T",
  "-": "Gap",
}

/** The tone and full name of a base in a scheme. */
export function nucleotideTone(base: string, scheme: NucleotideScheme = "nelumbo") {
  const b = base.toUpperCase()
  const key = (b === "U" ? "T" : b) as keyof Bases
  const tone = scheme === "none" ? null : (SCHEMES[scheme][key] ?? null)
  return { tone, label: NUCLEOTIDE_NAMES[b] ?? "Unknown" }
}

const PAIR: Record<string, string> = {
  A: "T", T: "A", U: "A", G: "C", C: "G", R: "Y", Y: "R", S: "S", W: "W",
  K: "M", M: "K", B: "V", V: "B", D: "H", H: "D", N: "N", "-": "-",
}

/** The base a base pairs with. `rna` pairs A with U. */
export function complement(base: string, rna = false) {
  const b = base.toUpperCase()
  const c = PAIR[b] ?? "N"
  return rna && c === "T" ? "U" : c
}

/** The other strand, read 5' to 3'. */
export function reverseComplement(sequence: string, rna = /U/i.test(sequence)) {
  return [...cleanSequence(sequence)].reverse().map((b) => complement(b, rna)).join("")
}

/** The share of G and C among the A, C, G, T and U bases, 0 to 1. */
export function gcContent(sequence: string) {
  const s = cleanSequence(sequence)
  const known = s.replace(/[^ACGTU]/g, "")
  return known.length ? known.replace(/[ATU]/g, "").length / known.length : 0
}

const CODE = "FFLLSSSSYY**CC*WLLLLPPPPHHQQRRRRIIIMTTTTNNKKSSRRVVVVAAAADDEEGGGG"
const ORDER = "TCAG"

/** The amino acid a codon makes in the standard genetic code: one letter, "*" for stop, "X" if unknown. */
export function translateCodon(codon: string) {
  const c = codon.toUpperCase().replace(/U/g, "T")
  if (c.length !== 3) return "X"
  const [a, b, d] = [...c].map((x) => ORDER.indexOf(x))
  return a < 0 || b < 0 || d < 0 ? "X" : CODE[a * 16 + b * 4 + d]
}

/** A coding sequence's protein, from its first base, codon by codon. */
export function translate(sequence: string) {
  const s = cleanSequence(sequence)
  let out = ""
  for (let i = 0; i + 3 <= s.length; i += 3) out += translateCodon(s.slice(i, i + 3))
  return out
}

/** Upper case, whitespace and digits removed (FASTA and GenBank paste cleanly). */
export function cleanSequence(sequence: string) {
  return sequence.toUpperCase().replace(/[\s\d]/g, "")
}

type NucleotideProps = Omit<ResidueProps, "children" | "tone"> & {
  base: string
  scheme?: NucleotideScheme
}

/** One base as a tile, named on hover. */
function Nucleotide({ base, scheme = "nelumbo", label, ...props }: NucleotideProps) {
  const { tone, label: name } = nucleotideTone(base, scheme)
  if (base === "-")
    return (
      <Residue data-slot="nucleotide" tone={null} variant="text" label="Gap" {...props} className={props.className}>
        -
      </Residue>
    )
  return (
    <Residue data-slot="nucleotide" tone={tone} label={label ?? name} {...props}>
      {base.toUpperCase()}
    </Residue>
  )
}

type NucleotideSequenceProps = Omit<ResidueSequenceProps, "letters" | "resolve" | "below" | "unit"> & {
  sequence: string
  scheme?: NucleotideScheme
  /** Shows the complementary strand under each base, faded. */
  complement?: boolean
}

/** A strand of DNA or RNA as blocks of tiles. */
function NucleotideSequence({
  sequence,
  scheme = "nelumbo",
  complement: showComplement = false,
  size = "default",
  "aria-label": ariaLabel,
  ...props
}: NucleotideSequenceProps) {
  const letters = React.useMemo(() => [...cleanSequence(sequence)], [sequence])
  const rna = letters.includes("U")
  const resolve = React.useCallback((b: string) => nucleotideTone(b, scheme), [scheme])
  return (
    <ResidueSequence
      data-slot="nucleotide-sequence"
      aria-label={ariaLabel ?? `${rna ? "RNA" : "DNA"} sequence, ${letters.length} bases`}
      letters={letters}
      resolve={resolve}
      size={size}
      unit="base"
      below={
        showComplement
          ? (b, _p, join) => (
              <Nucleotide base={complement(b, rna)} scheme={scheme} size={size} variant="subtle" join={join} aria-hidden title={undefined} />
            )
          : undefined
      }
      {...props}
    />
  )
}

/**
 * Lines up a change: the shared start and end stay, the stretch between is
 * what changed, padded with gaps ("-") on the shorter side, so a deletion or
 * an insertion reads base for base. `changed` is that stretch, 1-based.
 */
export function alignChange(from: string, to: string) {
  const a = cleanSequence(from)
  const b = cleanSequence(to)
  let p = 0
  while (p < a.length && p < b.length && a[p] === b[p]) p++
  let q = 0
  while (q < a.length - p && q < b.length - p && a[a.length - 1 - q] === b[b.length - 1 - q]) q++
  const am = a.slice(p, a.length - q)
  const bm = b.slice(p, b.length - q)
  const n = Math.max(am.length, bm.length)
  const changed: ResidueRange | null = n ? { start: p + 1, end: p + n } : null
  return {
    from: a.slice(0, p) + am.padEnd(n, "-") + a.slice(a.length - q),
    to: b.slice(0, p) + bm.padEnd(n, "-") + b.slice(b.length - q),
    changed,
    kind: !n ? "none" : !am.length ? "insertion" : !bm.length ? "deletion" : am.length === 1 && bm.length === 1 ? "substitution" : "delins",
  } as const
}

type NucleotideChangeProps = Omit<React.ComponentProps<"div">, "children"> & {
  /** The reference sequence, with some context around the change (or only the changed bases). */
  from: string
  /** The same stretch, changed. */
  to: string
  scheme?: NucleotideScheme
  size?: ResidueSize
  /**
   * Only the bases that changed, A → T or CTT → -, as small connected tonal
   * tiles without the context (matching AminoAcidChange): for tables, lists
   * and inline text.
   */
  compact?: boolean
  /** Compact only: the position, as a neutral segment joined to the original bases (20 A → T). */
  position?: number | string
}

/**
 * A DNA or RNA change: the reference, an arrow, the changed sequence. The
 * bases that differ are found and drawn as a solid capsule in both; a
 * deletion or an insertion is padded with gaps so the two line up.
 * `compact` keeps only the changed bases.
 */
function NucleotideChange({
  from,
  to,
  scheme = "nelumbo",
  size = "default",
  compact = false,
  position,
  className,
  ...props
}: NucleotideChangeProps) {
  const c = React.useMemo(() => alignChange(from, to), [from, to])
  const gap = size === "lg" ? "gap-3" : size === "sm" ? "gap-1.5" : "gap-2"
  const arrow = <Icon name="arrow_forward" aria-hidden size={size === "lg" ? 24 : size === "sm" ? 14 : 18} className="text-muted-foreground" />
  const kind = c.kind === "delins" ? "Change" : c.kind[0].toUpperCase() + c.kind.slice(1)

  if (compact && c.changed) {
    const was = c.from.slice(c.changed.start - 1, c.changed.end).replace(/-/g, "")
    const now = c.to.slice(c.changed.start - 1, c.changed.end).replace(/-/g, "")
    const said = `${kind}${position != null ? ` at ${position}` : ""}: ${was || "nothing"} to ${now || "nothing"}`
    // one connected run of tonal tiles, as AminoAcidChange draws; an empty side is a single gap tile
    const run = (bases: string, lead?: React.ReactNode) => {
      const items = bases ? [...bases] : ["-"]
      return (
        <span className="inline-flex gap-0.5">
          {lead}
          {items.map((b, k) => {
            const join = { start: k > 0 || !!lead, end: k < items.length - 1 }
            return b === "-" ? (
              <Residue key={k} tone={null} size={size} join={join} label="Gap">
                -
              </Residue>
            ) : (
              <Nucleotide key={k} base={b} scheme={scheme} size={size} join={join} title={undefined} />
            )
          })}
        </span>
      )
    }
    return (
      <span
        data-slot="nucleotide-change"
        data-compact
        role="img"
        aria-label={said}
        className={cn("inline-flex items-center align-middle", size === "lg" ? "gap-2" : size === "sm" ? "gap-1" : "gap-1.5", className)}
        {...(props as React.ComponentProps<"span">)}
      >
        {run(
          was,
          position != null && (
            <Residue
              tone={null}
              size={size}
              join={{ end: true }}
              className={cn(
                "bg-surface-container-highest font-medium text-foreground dark:bg-surface-container-highest",
                size === "sm" ? "px-1.5" : size === "lg" ? "px-3.5" : "px-2.5"
              )}
            >
              {position}
            </Residue>
          )
        )}
        {arrow}
        {run(now)}
      </span>
    )
  }

  const said = c.kind === "none" ? `${cleanSequence(from)}, unchanged` : `${kind}: ${cleanSequence(from)} to ${cleanSequence(to)}`
  const seq = (s: string) => (
    <NucleotideSequence sequence={s} scheme={scheme} size={size} groupSize={0} selection={c.changed} aria-hidden aria-label={undefined} />
  )
  return (
    <div
      data-slot="nucleotide-change"
      role="img"
      aria-label={said}
      className={cn("inline-flex flex-wrap items-center", gap, className)}
      {...props}
    >
      {seq(c.from)}
      {/* the arrow travels with the changed sequence when the two wrap */}
      <span className={cn("inline-flex items-center", gap)}>
        {arrow}
        {seq(c.to)}
      </span>
    </div>
  )
}

export { NucleotideChange, type NucleotideChangeProps }
export { Nucleotide, NucleotideSequence, type NucleotideProps, type NucleotideSequenceProps }
