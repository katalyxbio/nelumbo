"use client"

import * as React from "react"
import {
  SequenceAlignment,
  alignmentSlice,
  percentIdentity,
  toFasta,
  type AlignedSequence,
  type AlignmentAnnotation,
  type AlignmentFocus,
  type AlignmentSelection,
} from "@/registry/nelumbo/ui/sequence-alignment"
import { ChartReadout } from "@/registry/nelumbo/ui/chart"
import { Button } from "@/registry/nelumbo/ui/button"
import { ToggleGroup, ToggleGroupItem } from "@/registry/nelumbo/ui/toggle-group"
import { Code, PageHeader, Preview, PropsTable, Section } from "@/components/docs/primitives"
import { P53_DBD, P53_DBD_COLUMN, P53_L3, P53_L3_COLUMN, P53_N, P53_N_COLUMN, TP53_CDS } from "./data"

// The alignment column of a human residue, walking the human row (the first) of a window.
function column(rows: AlignedSequence[], columnStart: number, residue: number) {
  const human = rows[0]
  let p = (human.start ?? 1) - 1
  for (let i = 0; i < human.sequence.length; i++) if (human.sequence[i] !== "-" && ++p === residue) return columnStart + i
  return columnStart
}

// p53's DNA-binding loops and helix (human numbering), and its most common hotspots.
function p53Features(rows: AlignedSequence[], start: number): AlignmentAnnotation[] {
  const at = (r: number) => column(rows, start, r)
  const span = (a: number, b: number, label: string, color: AlignmentAnnotation["color"], description: string) => ({
    start: at(a),
    end: at(b),
    label,
    color,
    description,
  })
  const hot = (r: number, label: string) => ({ start: at(r), end: at(r), label, color: "red" as const, description: `${label}, a hotspot in cancer` })
  return [
    span(112, 124, "L1", "blue", "Loop L1, residues 112 to 124: contacts the major groove"),
    span(164, 194, "L2", "purple", "Loop L2, residues 164 to 194: binds zinc"),
    span(237, 250, "L3", "purple", "Loop L3, residues 237 to 250: contacts the minor groove"),
    span(278, 286, "H2", "green", "Helix H2, residues 278 to 286: in the major groove"),
    hot(175, "R175"),
    hot(245, "G245"),
    hot(248, "R248"),
    hot(273, "R273"),
    hot(282, "R282"),
  ].filter((a) => a.end >= start && a.start <= start + rows[0].sequence.length - 1 && !(a.start === start && a.end === start))
}

const L3_FEATURES = p53Features(P53_L3, P53_L3_COLUMN)
const DBD_FEATURES = p53Features(P53_DBD, P53_DBD_COLUMN)

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
        description="p53's L3 loop and H2 helix in six species. The rows wrap into blocks of ten columns that fit the width, each row ends with the position of its last residue, and identity puts each sequence's identity to the reference beside its name. annotations draws features as bars and single columns as markers: here, the cancer hotspots."
      >
        <Preview className="block">
          <SequenceAlignment sequences={P53_L3} columnStart={P53_L3_COLUMN} annotations={L3_FEATURES} identity />
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
          <SequenceAlignment
            sequences={TP53_CDS}
            wrap={false}
            colorBy="difference"
            dots
            className="[--alignment-bg:var(--surface-container-low)] dark:[--alignment-bg:var(--surface-container-lowest)]"
            aria-label="TP53 codons 242 to 252 in four species"
          />
        </Preview>
      </Section>

      <Section
        title="Selection"
        description="selectable turns on block selection. Drag over residues for a block, along the ruler or identity bars for whole columns, over the names for whole sequences; Shift and the arrows extend it, Ctrl+A takes everything, Escape clears. Selected residues turn solid in their own color whatever the mode, the ends show on the ruler, and copying gives the block as aligned FASTA."
      >
        <Preview className="block">
          <SelectionDemo />
        </Preview>
      </Section>

      <Section
        title="Scrolling"
        description="wrap={false} keeps one row that scrolls, with the names held on the left and an overview of the whole alignment's identity on top: the ring is the visible window, drag it to move. Here the DNA-binding domain, sorted by identity to human."
      >
        <Preview className="block">
          <SequenceAlignment
            sequences={P53_DBD}
            columnStart={P53_DBD_COLUMN}
            wrap={false}
            sort="identity"
            identity
            conservation
            colorBy="conservation"
            annotations={DBD_FEATURES}
            className="[--alignment-bg:var(--surface-container-low)] dark:[--alignment-bg:var(--surface-container-lowest)]"
            aria-label="p53 DNA-binding domain in six species"
          />
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
            ["identity / sort", 'boolean, "input" | "identity"', 'false, "input"', "Each sequence's identity to the reference beside its name; the closest first."],
            ["annotations", "AlignmentAnnotation[]", "", "start, end (column numbers), label, color, description: features, or markers where start is end."],
            ["ruler", "boolean", "true", "Column numbers, at each block's start and every ten."],
            ["columnStart", "number", "1", "The number of the first column, for a window of a longer alignment."],
            ["wrap", '"auto" | number | false', '"auto"', "Blocks of ten that fit the width, a fixed count, or one row that scrolls."],
            ["overview", "boolean", "true", "With wrap={false}: the identity of every column, with the visible window to drag."],
            ["highlight", "{ start, end }[]", "", "Columns to bring forward."],
            ["size", '"sm" | "default"', '"default"', "16 or 24 px columns."],
            ["selectable", "boolean", "false", "Keyboard focus and block selection; copying gives aligned FASTA."],
            ["selection / onSelectionChange", "{ start, end, sequences } | null", "", "Columns (in column numbers) across sequence ids. Controlled or not (defaultSelection)."],
            ["onActiveChange", "(focus | null) => void", "", "Focus has column, sequence, letter, position, consensus, identity."],
            ["Helpers", "alignmentConsensus, percentIdentity, alignmentSlice, toFasta", "", "Column consensus; identity of two rows; a block as its own alignment; aligned FASTA."],
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
  const [selection, setSelection] = React.useState<AlignmentSelection | null>({
    start: column(P53_DBD, P53_DBD_COLUMN, 237),
    end: column(P53_DBD, P53_DBD_COLUMN, 250),
    sequences: P53_DBD.map((s) => s.id!),
  })
  const [focus, setFocus] = React.useState<AlignmentFocus | null>(null)
  const [copied, setCopied] = React.useState(false)
  const block = selection ? alignmentSlice(P53_DBD, selection, P53_DBD_COLUMN) : []
  const fasta = block.length ? toFasta(block) : ""
  const mean = block.length > 1 ? block.slice(1).reduce((s, r) => s + percentIdentity(r.sequence, block[0].sequence), 0) / (block.length - 1) : 1
  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        {focus && !selection ? (
          <ChartReadout
            value={focus.letter === "-" ? "Gap" : `${focus.letter}${focus.position}`}
            label={`${focus.sequence.name}, column ${focus.column}`}
            detail={<span className="type-body-sm text-muted-foreground">Consensus {focus.consensus}, {Math.round(focus.identity * 100)}% identical</span>}
          />
        ) : selection ? (
          <ChartReadout
            value={selection.end - selection.start + 1}
            unit={`columns, ${block.length} ${block.length === 1 ? "sequence" : "sequences"}`}
            label={`Columns ${selection.start} to ${selection.end}`}
            detail={
              <span className="type-body-sm text-muted-foreground">
                {block.length > 1 ? `${Math.round(mean * 100)}% identical to ${block[0].name} on average` : block[0]?.name}
              </span>
            }
          />
        ) : (
          <ChartReadout value={P53_DBD.length} unit="sequences" label="p53 DNA-binding domain" />
        )}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!fasta}
            onClick={() => {
              navigator.clipboard?.writeText(fasta)
              setCopied(true)
              setTimeout(() => setCopied(false), 1500)
            }}
          >
            {copied ? "Copied" : "Copy FASTA"}
          </Button>
          <Button variant="outline" size="sm" disabled={!selection} onClick={() => setSelection(null)}>
            Clear
          </Button>
        </div>
      </div>
      <SequenceAlignment
        sequences={P53_DBD}
        columnStart={P53_DBD_COLUMN}
        colorBy="conservation"
        conservation
        consensus
        annotations={DBD_FEATURES}
        selectable
        selection={selection}
        onSelectionChange={setSelection}
        onActiveChange={setFocus}
        aria-label="p53 DNA-binding domain in six species"
      />
      {fasta && (
        <pre tabIndex={0} aria-label="The selection as aligned FASTA" className="overflow-x-auto rounded-xl bg-surface-container p-4 font-mono text-[0.75rem] leading-5 text-foreground">
          {fasta}
        </pre>
      )}
    </div>
  )
}
