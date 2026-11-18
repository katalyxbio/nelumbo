"use client"

import * as React from "react"
import { Translation, findOrfs, type TranslationRange } from "@/registry/nelumbo/ui/translation"
import { translate } from "@/registry/nelumbo/ui/nucleotide"
import { ChartReadout } from "@/registry/nelumbo/ui/chart"
import { SegmentedButton, SegmentedButtonItem } from "@/registry/nelumbo/ui/segmented-button"
import { Code, PageHeader, Preview, PropsTable, Section } from "@/components/docs/primitives"
import { TP53_CDS_HEAD, TP53_MRNA, TP53_START } from "./data"

export default function TranslationPage() {
  return (
    <>
      <PageHeader eyebrow="Component 77" title="Translation">
        DNA with its protein underneath: each amino acid a tile as wide as its codon, so a base, its codon and the
        residue it makes read together. One frame, three, or all six.
      </PageHeader>

      <Section title="Install">
        <Code>{`npx shadcn@latest add @nelumbo/translation`}</Code>
      </Section>

      <Section
        title="A coding sequence"
        description="The first 90 bases of TP53's coding sequence and the 30 residues they make: MEEPQSDPSV, as p53 begins. Lines wrap in whole codons; residues in a frame join into one shape, as a sequence's tiles do."
      >
        <Preview className="block">
          <Translation sequence={TP53_CDS_HEAD} />
        </Preview>
      </Section>

      <Section
        title="Six frames"
        description="frames={6} reads both strands: the forward frames under the top strand, the reverse frames under the bottom strand, right to left. orfs fades everything outside an open reading frame, so the real one stands out: TP53 starts at the ATG of base 143, in frame +1 here. Stops are solid."
      >
        <Preview className="block">
          <FramesDemo />
        </Preview>
      </Section>

      <Section
        title="Notation and size"
        description='notation="three" spells residues out where a codon has room; the small size suits panels and tables.'
      >
        <Preview className="grid gap-8">
          <Translation sequence={TP53_CDS_HEAD.slice(0, 45)} notation="three" />
          <Translation sequence={TP53_CDS_HEAD} size="sm" aria-label="TP53 coding start, small" />
        </Preview>
      </Section>

      <Section
        title="Selection"
        description="selectable makes the bases one keyboard stop: arrows move a base, up and down a line, Shift extends, Escape clears. Drag across bases, or click a residue to take its codon. Copying gives the bases."
      >
        <Preview className="block">
          <SelectionDemo />
        </Preview>
      </Section>

      <Section title="Props">
        <PropsTable
          rows={[
            ["sequence", "string", "", "DNA or RNA; spaces and numbers are ignored."],
            ["frames", "1 | 3 | 6", "1", "The coding frame, the three forward frames, or all six."],
            ["codonStart", "1 | 2 | 3", "1", "With one frame: which base the first codon starts on."],
            ["complement", "boolean", "frames is 6", "The bottom strand under the top."],
            ["start", "number", "1", "The number of the first base."],
            ["scheme / aminoScheme", "NucleotideScheme, AminoAcidScheme", '"nelumbo"', "Base and residue colors."],
            ["notation", '"one" | "three"', '"one"', "Residues as W or Trp."],
            ["orfs", "boolean | { minLength }", "false", "Fade residues outside open reading frames of at least minLength codons (30)."],
            ["lineLength", '"auto" | number', '"auto"', "Bases a line; auto fits the width in fives of codons."],
            ["size", '"sm" | "default"', '"default"', "13 or 17 px a base."],
            ["selectable / selection", "boolean, { start, end } | null", "false", "Base selection by keyboard, drag or codon. Controlled or not (defaultSelection)."],
            ["onActiveChange", "({ position, codon? } | null) => void", "", "The base, or the codon, in focus."],
            ["Helpers", "frameCodons, findOrfs", "", "Every codon of a frame; open reading frames, longest first."],
          ]}
        />
      </Section>
    </>
  )
}

function FramesDemo() {
  const [frames, setFrames] = React.useState<"1" | "3" | "6">("6")
  const best = findOrfs(TP53_MRNA, { minLength: 30 })[0]
  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <SegmentedButton type="single" size="sm" value={frames} onValueChange={(v) => v && setFrames(v as typeof frames)} aria-label="Frames" >
          <SegmentedButtonItem value="1">One</SegmentedButtonItem>
          <SegmentedButtonItem value="3">Three</SegmentedButtonItem>
          <SegmentedButtonItem value="6">Six</SegmentedButtonItem>
        </SegmentedButton>
        {best && (
          <span className="type-body-sm text-muted-foreground tabular-nums">
            Longest open frame: +{best.frame}, from {best.start + TP53_START - 1}, {best.length} codons{best.open ? " and still open" : ""}
          </span>
        )}
      </div>
      <Translation
        sequence={TP53_MRNA.slice(0, 120)}
        start={TP53_START}
        frames={Number(frames) as 1 | 3 | 6}
        orfs={{ minLength: 20 }}
        aria-label="TP53 mRNA from base 101"
      />
    </div>
  )
}

function SelectionDemo() {
  const [selection, setSelection] = React.useState<TranslationRange | null>({ start: 31, end: 45 })
  const bases = selection ? TP53_CDS_HEAD.slice(selection.start - 1, selection.end) : ""
  const gc = bases ? Math.round((bases.replace(/[^GC]/g, "").length / bases.length) * 100) : 0
  const first = selection ? Math.ceil((selection.start - 1) / 3) : 0
  const protein = selection ? translate(TP53_CDS_HEAD.slice(first * 3, Math.floor(selection.end / 3) * 3)) : ""
  return (
    <div className="grid gap-6">
      <div className="min-h-[4.5rem]">
        {selection ? (
          <ChartReadout
            value={protein || "–"}
            label={`Bases ${selection.start} to ${selection.end}, ${selection.end - selection.start + 1} bp`}
            detail={<span className="type-body-sm text-muted-foreground tabular-nums">{gc}% GC{protein ? `, residues ${first + 1} to ${first + protein.length}` : ""}</span>}
          />
        ) : (
          <ChartReadout value={TP53_CDS_HEAD.length} unit="bases" label="TP53 coding start" />
        )}
      </div>
      <Translation sequence={TP53_CDS_HEAD} selectable selection={selection} onSelectionChange={setSelection} aria-label="TP53 coding start, selectable" />
    </div>
  )
}
