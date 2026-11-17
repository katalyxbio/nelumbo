"use client"

import * as React from "react"
import {
  NUCLEOTIDE_SCHEMES,
  Nucleotide,
  NucleotideChange,
  NucleotideSequence,
  cleanSequence,
  gcContent,
  reverseComplement,
  translateCodon,
} from "@/registry/nelumbo/ui/nucleotide"
import { AminoAcid, AminoAcidChange } from "@/registry/nelumbo/ui/amino-acid"
import type { ResidueRange } from "@/registry/nelumbo/ui/residue"
import { ChartReadout } from "@/registry/nelumbo/ui/chart"
import { Code, PageHeader, Preview, PropsTable, Section } from "@/components/docs/primitives"

// The start of the human TP53 coding sequence (p53: MEEPQSDPSVEPPLSQETFSDLWKLLPEN...).
const TP53 = "ATGGAGGAGCCGCAGTCAGATCCTAGCGTCGAGCCCCCTCTGAGTCAGGAAACATTTTCAGACCTATGGAAACTACTTCCTGAAAACAACGTTCTGTCCCCCTTGCCGTCCCAAGCAATGGATGATTTGATGCTGTCCCCGGACGATATTGAACAATGGTTCACTGAAGACCCAGGTCCAGATGAAGCTCCC"

export default function NucleotidePage() {
  return (
    <>
      <PageHeader eyebrow="Component 68" title="Nucleotide">
        DNA and RNA bases as colored tiles, and whole strands as blocks of them: a numbered ruler, the
        complementary strand, codons with what they make, highlights and selection. Every color scheme is drawn
        in one tone system, so the classic schemes sit next to Nelumbo&apos;s palette at one even lightness.
      </PageHeader>

      <Section title="Install">
        <Code>{`npx shadcn@latest add @nelumbo/nucleotide`}</Code>
      </Section>

      <Section title="Bases" description="A tile per base, named on hover. Ambiguity codes are neutral, a gap has no tile.">
        <Preview className="flex-col items-start gap-6">
          <div className="flex items-end gap-3">
            {"ACGTU".split("").map((b) => (
              <Nucleotide key={b} base={b} size="lg" />
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {"NRYSWKMBDHV-".split("").map((b) => (
              <Nucleotide key={b} base={b} />
            ))}
          </div>
        </Preview>
      </Section>

      <Section
        title="Variants and sizes"
        description="Tonal is the default. Solid is the full-strength tile that selection uses, subtle fades context, text drops the tile for long runs."
      >
        <Preview className="grid gap-5 sm:grid-cols-[auto_1fr] sm:items-center">
          {(["tonal", "solid", "subtle", "text"] as const).map((v) => (
            <React.Fragment key={v}>
              <span className="type-label-md text-muted-foreground">{v}</span>
              <div className="flex flex-wrap items-center gap-6">
                {(["sm", "default", "lg"] as const).map((s) => (
                  <NucleotideSequence key={s} sequence="GATC" groupSize={0} variant={v} size={s} aria-label={`${v}, ${s}`} />
                ))}
              </div>
            </React.Fragment>
          ))}
        </Preview>
      </Section>

      <Section
        title="Shape"
        description="Sequences are connected by default, like a connected button group: corners tighten where bases meet and stay round at the ends of each block, and a selection becomes its own capsule. separate keeps every corner round."
      >
        <Preview className="grid gap-5 sm:grid-cols-[auto_1fr] sm:items-center">
          <span className="type-label-md text-muted-foreground">connected</span>
          <NucleotideSequence sequence={TP53.slice(0, 30)} defaultSelection={{ start: 14, end: 18 }} selectable aria-label="Connected shape" />
          <span className="type-label-md text-muted-foreground">separate</span>
          <NucleotideSequence sequence={TP53.slice(0, 30)} defaultSelection={{ start: 14, end: 18 }} selectable shape="separate" aria-label="Separate shape" />
        </Preview>
      </Section>

      <Section
        title="Color schemes"
        description="Base pairs and purines and pyrimidines are Nelumbo's own. The others take their tools' hues, drawn at Nelumbo's lightness; the color-blind-safe set keeps its lightness steps."
      >
        <Preview className="grid gap-4 sm:grid-cols-[minmax(10rem,auto)_1fr] sm:items-center">
          {NUCLEOTIDE_SCHEMES.map((s) => (
            <React.Fragment key={s.id}>
              <div>
                <p className="type-title-sm">{s.name}</p>
                <p className="type-body-sm text-muted-foreground">{s.about}</p>
              </div>
              <NucleotideSequence sequence="ACGTTGCAGATTACAGCT" scheme={s.id} groupSize={0} size="sm" aria-label={`${s.name} scheme example`} />
            </React.Fragment>
          ))}
        </Preview>
      </Section>

      <Section
        title="Double strand"
        description="complement draws the paired base under each one, faded. With the base pairs scheme, every pair shares a hue."
      >
        <Preview className="flex-col items-start gap-8">
          <NucleotideSequence sequence={TP53.slice(0, 40)} ruler complement />
          <NucleotideSequence sequence={TP53.slice(0, 40)} ruler complement scheme="pairs" />
        </Preview>
      </Section>

      <Section title="Codons" description="A block of three with a footer: each codon over the amino acid it makes.">
        <Preview>
          <NucleotideSequence
            sequence={TP53.slice(0, 45)}
            groupSize={3}
            size="sm"
            className="gap-x-1.5"
            footer={(b) => (
              <div className="flex justify-center pt-0.5">
                <AminoAcid residue={translateCodon(cleanSequence(TP53).slice(b.start - 1, b.end))} size="sm" />
              </div>
            )}
          />
        </Preview>
      </Section>

      <Section
        title="Mutations"
        description="NucleotideChange shows the reference, an arrow and the changed sequence. The bases that differ are found and drawn as a solid capsule in both; deletions and insertions are padded with gaps so the two line up."
      >
        <Preview className="grid gap-6 sm:grid-cols-[minmax(11rem,auto)_1fr] sm:items-center">
          <div>
            <p className="type-title-sm">Substitution</p>
            <p className="type-body-sm text-muted-foreground">HBB c.20A&gt;T, sickle cell</p>
          </div>
          <NucleotideChange from="CCTGAGGAG" to="CCTGTGGAG" />
          <div>
            <p className="type-title-sm">Deletion</p>
            <p className="type-body-sm text-muted-foreground">CFTR c.1521_1523del, F508del</p>
          </div>
          <NucleotideChange from="CATCTTTGGT" to="CATTGGT" />
          <div>
            <p className="type-title-sm">Insertion</p>
            <p className="type-body-sm text-muted-foreground">One base, a frameshift</p>
          </div>
          <NucleotideChange from="GGCACGTTAC" to="GGCACGTTTAC" />
          <div>
            <p className="type-title-sm">Sizes</p>
            <p className="type-body-sm text-muted-foreground">sm and lg</p>
          </div>
          <div className="grid gap-4">
            <NucleotideChange from="CCTGAGGAG" to="CCTGTGGAG" size="sm" />
            <NucleotideChange from="TGAGG" to="TGTGG" size="lg" />
          </div>
        </Preview>
      </Section>

      <Section
        title="Compact mutations"
        description="compact keeps only the bases that changed, as small connected tiles like AminoAcidChange: A to T, CTT to a gap. position joins a neutral segment in front, so it reads like c.20A>T. Pass the full context or just the bases; the change is found the same way."
      >
        <Preview className="grid gap-6 sm:grid-cols-[minmax(11rem,auto)_1fr] sm:items-center">
          <span className="type-label-lg text-muted-foreground">Substitution, deletion, insertion</span>
          <div className="flex flex-wrap items-center gap-5">
            <NucleotideChange from="CCTGAGGAG" to="CCTGTGGAG" compact />
            <NucleotideChange from="CATCTTTGGT" to="CATTGGT" compact />
            <NucleotideChange from="GGCACGTTAC" to="GGCACGTTTAC" compact />
            <NucleotideChange from="AG" to="T" compact />
          </div>
          <span className="type-label-lg text-muted-foreground">With position</span>
          <div className="flex flex-wrap items-center gap-5">
            <NucleotideChange from="A" to="T" compact position={20} />
            <NucleotideChange from="CTT" to="" compact position="1521_1523" />
          </div>
          <span className="type-label-lg text-muted-foreground">Sizes</span>
          <div className="flex flex-wrap items-center gap-5">
            <NucleotideChange from="G" to="A" compact position={524} size="sm" />
            <NucleotideChange from="G" to="A" compact position={524} />
            <NucleotideChange from="G" to="A" compact position={524} size="lg" />
          </div>
          <span className="type-label-lg text-muted-foreground">In text</span>
          <p className="type-body-md">
            The sickle cell allele, <NucleotideChange from="A" to="T" compact size="sm" position={20} />, swaps one base in
            the sixth codon of HBB.
          </p>
        </Preview>
        <Preview className="block">
          <VariantsDemo />
        </Preview>
      </Section>

      <Section
        title="Highlight"
        description="highlight brings stretches forward and fades the rest. Here, the EcoRI and BamHI sites in a cloning site."
      >
        <Preview>
          <NucleotideSequence
            sequence="TTCGAGCTCGGTACCGAATTCGAGCTCGGATCCACTAGTAACGGCCG"
            ruler
            highlight={[
              { start: 16, end: 21 },
              { start: 28, end: 33 },
            ]}
          />
        </Preview>
      </Section>

      <Section
        title="Selection"
        description="selectable makes the strand one keyboard stop, like a chart. Drag or Shift-click to select; arrows move, Shift extends, Escape clears. The readout follows the pointer."
      >
        <Preview className="block">
          <SelectionDemo />
        </Preview>
      </Section>

      <Section title="Props">
        <PropsTable
          rows={[
            ["Nucleotide base", "string", "", "A, C, G, T, U, an IUPAC ambiguity code, or - for a gap."],
            ["scheme", "NucleotideScheme", '"nelumbo"', "nelumbo, pairs, chemistry, igv, jalview, trace, okabe-ito, none."],
            ["variant", '"tonal" | "solid" | "subtle" | "text"', '"tonal"', "Selected tiles are always solid."],
            ["size", '"sm" | "default" | "lg"', '"default"', "20, 28 or 48 px tall."],
            ["NucleotideSequence sequence", "string", "", "Whitespace and digits are ignored, so FASTA and GenBank paste as is."],
            ["groupSize", "number", "10", "A spacer every n bases. 0 for none."],
            ["ruler", 'boolean | "top" | "inline"', "false", "true or top: first position above each block. inline: last position in the spacer."],
            ["start", "number", "1", "Position of the first base."],
            ["shape", '"connected" | "separate"', '"connected"', "Connected joins each block into one shape; a selection becomes its own capsule."],
            ["complement", "boolean", "false", "Shows the paired strand under each base."],
            ["highlight", "{ start, end }[]", "", "Stretches to bring forward. 1-based, inclusive."],
            ["footer", "(block) => ReactNode", "", "Drawn under each block: codon translations, annotations."],
            ["selectable", "boolean", "false", "Pointer and keyboard selection."],
            ["selection / onSelectionChange", "{ start, end } | null", "", "Controlled selection. defaultSelection for uncontrolled."],
            ["onActiveChange", "(position | null) => void", "", "The base under the pointer, or the keyboard cursor."],
            ["NucleotideChange from, to", "string, string", "", "Reference and changed sequence, with context. scheme and size as above."],
            ["NucleotideChange compact", "boolean", "false", "Only the changed bases, as small connected tiles."],
            ["NucleotideChange position", "number | string", "", "Compact only: a neutral segment joined in front of the original bases."],
            ["Helpers", "alignChange, complement, reverseComplement, gcContent, translate, translateCodon, cleanSequence", "", "Standard genetic code; RNA pairs A with U."],
          ]}
        />
      </Section>
    </>
  )
}

function SelectionDemo() {
  const seq = cleanSequence(TP53)
  const [selection, setSelection] = React.useState<ResidueRange | null>({ start: 55, end: 75 })
  const [active, setActive] = React.useState<number | null>(null)
  const pick = selection ? seq.slice(selection.start - 1, selection.end) : ""
  const names: Record<string, string> = { A: "Adenine", C: "Cytosine", G: "Guanine", T: "Thymine" }
  return (
    <div className="grid gap-6">
      {active != null ? (
        <ChartReadout value={seq[active - 1]} unit={names[seq[active - 1]]} label={`Position ${active}`} />
      ) : selection ? (
        <ChartReadout
          value={pick.length}
          unit={pick.length === 1 ? "base" : "bases"}
          label={`Positions ${selection.start} to ${selection.end}`}
          detail={
            <span className="type-body-sm text-muted-foreground">
              GC {Math.round(gcContent(pick) * 100)}%, reverse complement{" "}
              <span className="font-mono text-foreground">{reverseComplement(pick).slice(0, 24)}{pick.length > 24 ? "…" : ""}</span>
            </span>
          }
          onClear={() => setSelection(null)}
          clearLabel="Clear selection"
        />
      ) : (
        <ChartReadout value={seq.length} unit="bases" label="TP53, coding sequence start" detail={<span className="type-body-sm text-muted-foreground">GC {Math.round(gcContent(seq) * 100)}%</span>} />
      )}
      <NucleotideSequence
        sequence={seq}
        ruler
        selectable
        selection={selection}
        onSelectionChange={setSelection}
        onActiveChange={setActive}
        aria-label="TP53 coding sequence"
      />
    </div>
  )
}

// Known variants: the coding change and what it does to the protein.
const VARIANTS = [
  { gene: "TP53", c: 524, from: "G", to: "A", p: { from: "R", at: 175, to: "H" } },
  { gene: "TP53", c: 743, from: "G", to: "A", p: { from: "R", at: 248, to: "Q" } },
  { gene: "TP53", c: 818, from: "G", to: "A", p: { from: "R", at: 273, to: "H" } },
  { gene: "BRAF", c: 1799, from: "T", to: "A", p: { from: "V", at: 600, to: "E" } },
  { gene: "HBB", c: 20, from: "A", to: "T", p: { from: "E", at: 7, to: "V" } },
]

function VariantsDemo() {
  return (
    <div className="grid grid-cols-[auto_auto_1fr] items-center gap-x-8 gap-y-3">
      <span className="type-label-md text-muted-foreground">Gene</span>
      <span className="type-label-md text-muted-foreground">DNA</span>
      <span className="type-label-md text-muted-foreground">Protein</span>
      {VARIANTS.map((v) => (
        <React.Fragment key={v.gene + v.c}>
          <span className="type-title-sm">{v.gene}</span>
          <NucleotideChange from={v.from} to={v.to} compact position={v.c} size="sm" />
          <AminoAcidChange from={v.p.from} position={v.p.at} to={v.p.to} size="sm" />
        </React.Fragment>
      ))}
    </div>
  )
}
