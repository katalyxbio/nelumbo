"use client"

import * as React from "react"
import { SequenceAlignment, percentIdentity, type AlignmentFocus } from "@/registry/nelumbo/ui/sequence-alignment"
import { ChartReadout } from "@/registry/nelumbo/ui/chart"
import { ToggleGroup, ToggleGroupItem } from "@/registry/nelumbo/ui/toggle-group"
import { Code, PageHeader, Preview, PropsTable, Section } from "@/components/docs/primitives"
import { P53_DBD, P53_DBD_COLUMN, P53_L3, P53_L3_COLUMN, P53_N, P53_N_COLUMN, TP53_CDS } from "./data"

export default function SequenceAlignmentPage() {
  return (
    <>
      <PageHeader eyebrow="Component 73" title="Sequence Alignment">
        Aligned sequences as rows of residue tiles. Every ungapped stretch is one connected shape and gaps are a thin
        line, with a ruler, an identity bar, a consensus row, and color by residue, conservation or difference.
      </PageHeader>

      <Section title="Install">
        <Code>{`npx shadcn@latest add @nelumbo/sequence-alignment`}</Code>
      </Section>

      <Section
        title="An alignment"
        description="p53's L2 and L3 loops in six species. The rows wrap into blocks of ten columns that fit the width, and each row ends with the position of its last residue."
      >
        <Preview className="block">
          <SequenceAlignment sequences={P53_L3} columnStart={P53_L3_COLUMN} />
        </Preview>
      </Section>

      <Section
        title="Conservation"
        description='colorBy="conservation" keeps color only where a residue agrees with a column at least 70% identical. The identity bar and the consensus row read the same columns; the loops that touch DNA stay solid down to fish.'
      >
        <Preview className="block">
          <SequenceAlignment sequences={P53_L3} columnStart={P53_L3_COLUMN} colorBy="conservation" conservation consensus />
        </Preview>
      </Section>

      <Section
        title="Differences"
        description='colorBy="difference" compares every row with a reference, the first by default. With dots, identical residues become a dot and only the substitutions keep a tile.'
      >
        <Preview className="block">
          <DifferenceDemo />
        </Preview>
      </Section>

      <Section
        title="Gaps"
        description="Inside a sequence a gap is a thin line that splits the row into separate shapes. Before the first residue and after the last, it is left empty. Here, the transactivation domain, which has changed far more."
      >
        <Preview className="block">
          <SequenceAlignment sequences={P53_N} columnStart={P53_N_COLUMN} colorBy="conservation" conservation />
        </Preview>
      </Section>

      <Section
        title="DNA"
        description="Rows of A, C, G and T are read as nucleotides and take a Nucleotide scheme. TP53 codons 242 to 252, where synonymous changes in the third position stand out."
      >
        <Preview className="block">
          <SequenceAlignment sequences={TP53_CDS} wrap={false} colorBy="difference" dots aria-label="TP53 codons 242 to 252 in four species" />
        </Preview>
      </Section>

      <Section
        title="Selection"
        description="selectable makes the alignment one keyboard stop: Left and Right move along the columns, Up and Down between sequences, PageUp and PageDown a block, Escape clears. The column in focus is shaded across every row."
      >
        <Preview className="block">
          <SelectionDemo />
        </Preview>
      </Section>

      <Section title="Sizes and windows" description='size="sm" fits more columns; highlight brings forward a stretch of columns and fades the rest.'>
        <Preview className="block">
          <SequenceAlignment
            sequences={P53_L3}
            columnStart={P53_L3_COLUMN}
            size="sm"
            highlight={[{ start: 255, end: 260 }]}
            aria-label="p53 loop L3, columns 255 to 260 highlighted"
          />
        </Preview>
      </Section>

      <Section title="Props">
        <PropsTable
          rows={[
            ["sequences", "AlignedSequence[]", "", "name, sequence (with - for gaps), start, id, description."],
            ["type", '"dna" | "protein"', "detected", "DNA when every row is A, C, G, T, U, N and gaps."],
            ["scheme", "Nucleotide or AminoAcid scheme", '"nelumbo"', "The tile colors."],
            ["colorBy", '"residue" | "conservation" | "difference"', '"residue"', "Which residues keep their color."],
            ["threshold", "number", "0.7", "How identical a column must be to count as conserved."],
            ["reference / dots", "string | number, boolean", "0, false", "The row differences are against; identical residues as a dot."],
            ["consensus / conservation", "boolean", "false", "A consensus row; an identity bar over each column."],
            ["ruler", "boolean", "true", "Column numbers, at each block's start and every ten."],
            ["columnStart", "number", "1", "The number of the first column, for a window of a longer alignment."],
            ["wrap", '"auto" | number | false', '"auto"', "Blocks of ten that fit the width, a fixed count, or one row that scrolls."],
            ["highlight", "{ start, end }[]", "", "Columns to bring forward."],
            ["size", '"sm" | "default"', '"default"', "16 or 24 px columns."],
            ["selectable / onActiveChange", "boolean, (focus | null) => void", "", "Focus has column, sequence, letter, position, consensus, identity."],
            ["Helpers", "alignmentConsensus, percentIdentity", "", "Each column's consensus and identity; identity of two rows."],
          ]}
        />
      </Section>
    </>
  )
}

function DifferenceDemo() {
  const [ref, setRef] = React.useState("P53_HUMAN")
  const base = P53_L3.find((s) => s.id === ref)!
  return (
    <div className="grid gap-6">
      <ToggleGroup type="single" value={ref} onValueChange={(v) => v && setRef(v)} aria-label="Reference" className="w-fit flex-wrap">
        {P53_L3.filter((s) => ["P53_HUMAN", "P53_CHICK", "P53_DANRE"].includes(s.id!)).map((s) => (
          <ToggleGroupItem key={s.id} value={s.id!}>
            {s.name}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <SequenceAlignment
        sequences={P53_L3.map((s) => ({
          ...s,
          description: `${s.description}, ${Math.round(percentIdentity(s.sequence, base.sequence) * 100)}% identical to ${base.name}`,
        }))}
        columnStart={P53_L3_COLUMN}
        colorBy="difference"
        reference={ref}
        dots
      />
    </div>
  )
}

function SelectionDemo() {
  const [focus, setFocus] = React.useState<AlignmentFocus | null>(null)
  return (
    <div className="grid gap-6">
      {focus ? (
        <ChartReadout
          value={focus.letter === "-" ? "Gap" : `${focus.letter}${focus.position}`}
          label={`${focus.sequence.name}, column ${focus.column}`}
          detail={
            <span className="type-body-sm text-muted-foreground">
              Consensus {focus.consensus}, {Math.round(focus.identity * 100)}% identical
            </span>
          }
        />
      ) : (
        <ChartReadout value={P53_DBD.length} unit="sequences" label="p53 DNA-binding domain" />
      )}
      <SequenceAlignment
        sequences={P53_DBD}
        columnStart={P53_DBD_COLUMN}
        colorBy="conservation"
        consensus
        selectable
        onActiveChange={setFocus}
        aria-label="p53 DNA-binding domain in six species"
      />
    </div>
  )
}
