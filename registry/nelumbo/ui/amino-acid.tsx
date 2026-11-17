"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { Icon } from "@/registry/nelumbo/ui/icon"
import {
  RESIDUE_HUES as H,
  Residue,
  ResidueSequence,
  type ResidueProps,
  type ResidueSequenceProps,
  type ResidueSize,
  type ResidueTone,
} from "@/registry/nelumbo/ui/residue"

/**
 * Nelumbo Amino Acid
 *
 * A protein residue as a colored tile, and a protein as blocks of tiles.
 *
 *   <AminoAcid residue="W" />
 *   <AminoAcid residue="W" notation="three" />          // Trp
 *   <ProteinSequence sequence="MEEPQSDPSV..." ruler selectable />
 *   <AminoAcidChange from="R" position={175} to="H" />  // p.Arg175His
 *
 * Schemes (all in Nelumbo's tone system, one lightness for every hue):
 * - "nelumbo" (default): by side chain, on the palette's hues. Aliphatic amber,
 *   aromatic orange, positive blue, negative red, polar green, glycine and
 *   proline purple, cysteine cyan. Stops are a solid neutral tile.
 * - "charge": only what carries a charge at pH 7 is colored (positive blue,
 *   negative red, histidine half-strength): for reading surfaces and interfaces.
 * - "hydrophobicity": Kyte and Doolittle's scale, blue (water-loving) through
 *   gray to amber (oily), its strength following the value.
 * - "clustal", "zappo", "taylor": those schemes' hues.
 * - "okabe-ito": by kind in Okabe and Ito's color-blind-safe set, apart in lightness too.
 * - "none": neutral tiles.
 */

export type AminoAcidScheme = "nelumbo" | "charge" | "hydrophobicity" | "clustal" | "zappo" | "taylor" | "okabe-ito" | "none"

type AminoAcidInfo = { three: string; name: string; kind: string }

export const AMINO_ACIDS: Record<string, AminoAcidInfo> = {
  A: { three: "Ala", name: "Alanine", kind: "aliphatic" },
  R: { three: "Arg", name: "Arginine", kind: "positive" },
  N: { three: "Asn", name: "Asparagine", kind: "polar" },
  D: { three: "Asp", name: "Aspartate", kind: "negative" },
  C: { three: "Cys", name: "Cysteine", kind: "sulfur" },
  Q: { three: "Gln", name: "Glutamine", kind: "polar" },
  E: { three: "Glu", name: "Glutamate", kind: "negative" },
  G: { three: "Gly", name: "Glycine", kind: "special" },
  H: { three: "His", name: "Histidine", kind: "positive" },
  I: { three: "Ile", name: "Isoleucine", kind: "aliphatic" },
  L: { three: "Leu", name: "Leucine", kind: "aliphatic" },
  K: { three: "Lys", name: "Lysine", kind: "positive" },
  M: { three: "Met", name: "Methionine", kind: "aliphatic" },
  F: { three: "Phe", name: "Phenylalanine", kind: "aromatic" },
  P: { three: "Pro", name: "Proline", kind: "special" },
  S: { three: "Ser", name: "Serine", kind: "polar" },
  T: { three: "Thr", name: "Threonine", kind: "polar" },
  W: { three: "Trp", name: "Tryptophan", kind: "aromatic" },
  Y: { three: "Tyr", name: "Tyrosine", kind: "aromatic" },
  V: { three: "Val", name: "Valine", kind: "aliphatic" },
  U: { three: "Sec", name: "Selenocysteine", kind: "sulfur" },
  O: { three: "Pyl", name: "Pyrrolysine", kind: "positive" },
  B: { three: "Asx", name: "Asparagine or aspartate", kind: "ambiguous" },
  Z: { three: "Glx", name: "Glutamine or glutamate", kind: "ambiguous" },
  J: { three: "Xle", name: "Leucine or isoleucine", kind: "ambiguous" },
  X: { three: "Xaa", name: "Any amino acid", kind: "ambiguous" },
  "*": { three: "Ter", name: "Stop", kind: "stop" },
  "-": { three: "-", name: "Gap", kind: "gap" },
}

/** The side-chain kinds of the default scheme, for legends. */
export const AMINO_ACID_KINDS: { kind: string; name: string; tone: ResidueTone; members: string }[] = [
  { kind: "aliphatic", name: "Aliphatic", tone: { hue: 72, shade: 0.7 }, members: "AVLIM" },
  { kind: "aromatic", name: "Aromatic", tone: { hue: H.orange, shade: -0.4 }, members: "FWY" },
  { kind: "positive", name: "Positive", tone: { hue: H.blue }, members: "KRH" },
  { kind: "negative", name: "Negative", tone: { hue: H.red }, members: "DE" },
  { kind: "polar", name: "Polar", tone: { hue: H.green }, members: "STNQ" },
  { kind: "special", name: "Glycine and proline", tone: { hue: H.purple }, members: "GP" },
  { kind: "sulfur", name: "Cysteine", tone: { hue: H.cyan }, members: "C" },
]

export const AMINO_ACID_SCHEMES: { id: AminoAcidScheme; name: string; about: string }[] = [
  { id: "nelumbo", name: "Nelumbo", about: "By side chain, on the palette's hues" },
  { id: "charge", name: "Charge", about: "Only charged residues colored: positive blue, negative red" },
  { id: "hydrophobicity", name: "Hydrophobicity", about: "Kyte and Doolittle: blue water-loving, amber oily" },
  { id: "clustal", name: "Clustal X", about: "Clustal X's groups and hues" },
  { id: "zappo", name: "Zappo", about: "Seven physicochemical groups" },
  { id: "taylor", name: "Taylor", about: "A hue for each, kin residues in kin hues" },
  { id: "okabe-ito", name: "Color-blind safe", about: "By kind, in Okabe and Ito's set" },
  { id: "none", name: "None", about: "Neutral tiles" },
]

const byGroup = (groups: [string, ResidueTone][]) =>
  Object.fromEntries(groups.flatMap(([aa, t]) => [...aa].map((a) => [a, t]))) as Record<string, ResidueTone>

/** Kyte and Doolittle's hydropathy, -4.5 (arginine) to 4.5 (isoleucine). */
export const HYDROPATHY: Record<string, number> = {
  I: 4.5, V: 4.2, L: 3.8, F: 2.8, C: 2.5, M: 1.9, A: 1.8, G: -0.4, T: -0.7, S: -0.8, W: -0.9,
  Y: -1.3, P: -1.6, H: -3.2, E: -3.5, Q: -3.5, D: -3.5, N: -3.5, K: -3.9, R: -4.5, U: 2.5, O: -3.9,
}

const TAYLOR: Record<string, number> = {
  A: 123, R: 264, N: 316, D: 29, C: 110, Q: 340, E: 11, G: 65, H: 261, I: 138,
  L: 142, K: 285, M: 142, F: 148, P: 90, S: 33, T: 43, W: 224, Y: 171, V: 133, U: 110, O: 285,
}

const SCHEMES: Record<Exclude<AminoAcidScheme, "none">, Record<string, ResidueTone>> = {
  nelumbo: byGroup(AMINO_ACID_KINDS.map((k) => [k.members + (k.kind === "positive" ? "O" : k.kind === "sulfur" ? "U" : ""), k.tone])),
  charge: byGroup([
    ["KRO", { hue: H.blue }],
    ["H", { hue: H.blue, chroma: 0.5, shade: 0.4 }],
    ["DE", { hue: H.red }],
  ]),
  hydrophobicity: Object.fromEntries(
    Object.entries(HYDROPATHY).map(([a, h]) => [
      a,
      h >= 0 ? { hue: H.amber, chroma: Math.min(1, h / 4.5 + 0.1) } : { hue: H.blue, chroma: Math.min(1, -h / 4.5 + 0.1) },
    ])
  ),
  clustal: byGroup([
    ["AILMFWV", { hue: 267, chroma: 0.8 }],
    ["KRO", { hue: 30 }],
    ["DE", { hue: 328 }],
    ["NQST", { hue: 143 }],
    ["CU", { hue: 21, chroma: 0.7, shade: 0.4 }],
    ["G", { hue: 55 }],
    ["P", { hue: 105 }],
    ["HY", { hue: 195 }],
  ]),
  zappo: byGroup([
    ["ILVAM", { hue: 19, chroma: 0.6, shade: 0.5 }],
    ["FWY", { hue: 88 }],
    ["KRHO", { hue: 277 }],
    ["DE", { hue: 29 }],
    ["STNQ", { hue: 142 }],
    ["PG", { hue: 328 }],
    ["CU", { hue: 108, shade: 0.5 }],
  ]),
  taylor: Object.fromEntries(Object.entries(TAYLOR).map(([a, hue]) => [a, { hue }])),
  "okabe-ito": byGroup([
    ["AILMV", { hue: 236, shade: 0.6 }],
    ["FWY", { hue: 346 }],
    ["KRHO", { hue: 244, shade: -0.8 }],
    ["DE", { hue: 48, shade: -0.3 }],
    ["STNQ", { hue: 165, shade: -0.2 }],
    ["GP", { hue: 77, shade: 0.3 }],
    ["CU", { hue: 105, shade: 0.8 }],
  ]),
}

/** The tone and full name of a residue in a scheme. */
export function aminoAcidTone(residue: string, scheme: AminoAcidScheme = "nelumbo") {
  const r = residue.length === 3 ? fromThree(residue) : residue.toUpperCase()
  const info = AMINO_ACIDS[r]
  const tone = scheme === "none" ? null : (SCHEMES[scheme][r] ?? null)
  return { tone, label: info?.name ?? "Unknown", info, letter: r }
}

const THREE = Object.fromEntries(Object.entries(AMINO_ACIDS).map(([one, i]) => [i.three.toUpperCase(), one]))

/** "Trp" → "W". */
export function fromThree(three: string) {
  return THREE[three.toUpperCase()] ?? "X"
}

type AminoAcidProps = Omit<ResidueProps, "children" | "tone"> & {
  /** One letter ("W") or three ("Trp"). */
  residue: string
  scheme?: AminoAcidScheme
  /** Shows "W" or "Trp". */
  notation?: "one" | "three"
}

/** One residue as a tile, named on hover. Stops are a solid neutral tile. */
function AminoAcid({ residue, scheme = "nelumbo", notation = "one", label, variant, ...props }: AminoAcidProps) {
  const { tone, label: name, info, letter } = aminoAcidTone(residue, scheme)
  const gap = letter === "-"
  return (
    <Residue
      data-slot="amino-acid"
      tone={tone}
      label={label ?? name}
      variant={gap ? "text" : letter === "*" ? "solid" : variant}
      {...props}
    >
      {notation === "three" && info && !gap ? info.three : letter}
    </Residue>
  )
}

type ProteinSequenceProps = Omit<ResidueSequenceProps, "letters" | "resolve" | "unit"> & {
  sequence: string
  scheme?: AminoAcidScheme
  notation?: "one" | "three"
}

/** A protein as blocks of residue tiles. */
function ProteinSequence({ sequence, scheme = "nelumbo", notation = "one", "aria-label": ariaLabel, ...props }: ProteinSequenceProps) {
  const letters = React.useMemo(() => [...sequence.toUpperCase().replace(/[\s\d]/g, "")], [sequence])
  const shown = React.useMemo(
    () => (notation === "three" ? letters.map((l) => AMINO_ACIDS[l]?.three ?? l) : letters),
    [letters, notation]
  )
  const resolve = React.useCallback((l: string) => aminoAcidTone(l, scheme), [scheme])
  return (
    <ResidueSequence
      data-slot="protein-sequence"
      aria-label={ariaLabel ?? `Protein sequence, ${letters.length} residues`}
      letters={shown}
      resolve={resolve}
      unit="residue"
      {...props}
    />
  )
}

type AminoAcidChangeProps = Omit<React.ComponentProps<"span">, "children"> & {
  from: string
  to: string
  position?: number
  scheme?: AminoAcidScheme
  size?: ResidueSize
}

/** A substitution, "R175H": the residue it was, where, and what it became. */
function AminoAcidChange({ from, to, position, scheme, size = "default", className, ...props }: AminoAcidChangeProps) {
  const a = aminoAcidTone(from)
  const b = aminoAcidTone(to)
  const said = `${a.label}${position != null ? ` ${position}` : ""} to ${b.label}`
  return (
    <span
      data-slot="amino-acid-change"
      role="img"
      aria-label={said}
      className={cn("inline-flex items-center", size === "lg" ? "gap-2" : "gap-1", className)}
      {...props}
    >
      <AminoAcid residue={from} scheme={scheme} size={size} aria-hidden />
      {position != null && (
        <span aria-hidden className={cn("font-mono text-muted-foreground tabular-nums", size === "lg" ? "type-title-md" : "type-label-md")}>
          {position}
        </span>
      )}
      <Icon name="arrow_forward" aria-hidden size={size === "lg" ? 20 : size === "sm" ? 12 : 16} className="text-muted-foreground" />
      <AminoAcid residue={to} scheme={scheme} size={size} aria-hidden />
    </span>
  )
}

export { AminoAcid, ProteinSequence, AminoAcidChange, type AminoAcidProps, type ProteinSequenceProps, type AminoAcidChangeProps }
