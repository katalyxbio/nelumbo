"use client"

import * as React from "react"
import { SequenceLogo, logoColumns, logoConsensus, logoCounts, type LogoColumn, type LogoRange } from "@/registry/nelumbo/ui/sequence-logo"
import { ChartReadout } from "@/registry/nelumbo/ui/chart"
import { SegmentedButton, SegmentedButtonItem } from "@/registry/nelumbo/ui/segmented-button"
import { Switch } from "@/registry/nelumbo/ui/switch"
import { Label } from "@/registry/nelumbo/ui/label"
import { Code, PageHeader, Preview, PropsTable, Section } from "@/components/docs/primitives"
import { CTCF_MOTIF, P53_MOTIF, ZF_C2H2 } from "./data"

export default function SequenceLogoPage() {
  return (
    <>
      <PageHeader eyebrow="Component 75" title="Sequence Logo">
        A motif as stacks of letters: each position as tall as the information it carries, each letter as tall as its
        share. The letters take the same hues as Nucleotide and Amino Acid, so a logo reads with the sequences around it.
      </PageHeader>

      <Section title="Install">
        <Code>{`npx shadcn@latest add @nelumbo/sequence-logo`}</Code>
      </Section>

      <Section
        title="A motif"
        description="Where p53 binds DNA, from 17,412 sites in JASPAR (MA0106.3): two half-sites, each with the CATG core at full height. A position matrix of counts goes straight in; hover a stack for every base's share."
      >
        <Preview className="block">
          <SequenceLogo matrix={P53_MOTIF} consensus highlight={[{ start: 4, end: 7, label: "CATG" }, { start: 13, end: 16, label: "CATG" }]} />
        </Preview>
      </Section>

      <Section
        title="Bits or probability"
        description='"bits" sizes each stack by its information, so the positions that matter stand out. "probability" fills every stack, for reading the mix at a loose position. A background composition turns bits into relative entropy, for genomes far from a quarter of each base.'
      >
        <Preview className="block">
          <ModeDemo />
        </Preview>
      </Section>

      <Section
        title="Protein"
        description="The C2H2 zinc finger, from Pfam's seed alignment of 151 sequences (PF00096). The two cysteines and two histidines that hold the zinc tower over the rest; the hydrophobic F and L that pack the core sit in between."
      >
        <Preview className="block">
          <SequenceLogo sequences={ZF_C2H2} consensus height={180} />
        </Preview>
      </Section>

      <Section
        title="Strands"
        description="CTCF's motif (JASPAR MA0139.1) on either strand: reverseComplement flips the matrix and swaps each base for its partner."
      >
        <Preview className="block">
          <StrandDemo />
        </Preview>
      </Section>

      <Section
        title="Small samples"
        description="With few sequences, chance alone makes a position look conserved. The small-sample correction takes that expected information off every stack. Eight zinc fingers, with and without it."
      >
        <Preview className="block">
          <SmallDemo />
        </Preview>
      </Section>

      <Section
        title="Selection"
        description="selectable makes the logo one keyboard stop, like a chart: arrows move a position, Shift extends, Home and End jump, Escape clears. Drag with the pointer. The selected stretch reads out its consensus and total bits."
      >
        <Preview className="block">
          <SelectionDemo />
        </Preview>
      </Section>

      <Section title="Props">
        <PropsTable
          rows={[
            ["sequences", "string[]", "", "Aligned sequences of one length; - or . for gaps."],
            ["matrix", "Record<string, number>[]", "", "Or a position matrix, counts or frequencies per position (JASPAR, MEME, TRANSFAC)."],
            ["type", '"dna" | "rna" | "protein"', "detected", "The alphabet: 2 bits a position for DNA, 4.32 for protein."],
            ["scheme", "Nucleotide or AminoAcid scheme", '"nelumbo"', "The letter hues."],
            ["mode", '"bits" | "probability"', '"bits"', "Stacks sized by information, or all full height."],
            ["correction", "boolean", "true", "Small-sample correction, (s − 1) / (2 ln 2 n). Skipped for frequencies."],
            ["background", "Record<string, number>", "", "Letter composition to measure against (relative entropy)."],
            ["reverseComplement", "boolean", "false", "The other strand, read 5′ to 3′."],
            ["columnStart", "number", "1", "The number of the first position."],
            ["height / maxColumnWidth", "number", "160, 40", "Plot height; the widest a stack gets. Below 12 px a stack, the logo scrolls."],
            ["yAxis / ruler", "boolean, boolean | number", "true, true", "The bits axis; position numbers, every one that fits or every n."],
            ["consensus", "boolean", "false", "A row of tiles under the stacks: IUPAC codes for DNA (Cavener's rules), X for a loose protein position."],
            ["highlight", "{ start, end, label? }[]", "", "Stretches marked behind the stacks."],
            ["tooltip", "boolean", "true", "The hover card with each letter's share."],
            ["selectable / selection", "boolean, { start, end } | null", "false", "Keyboard and pointer selection. Controlled or not (defaultSelection)."],
            ["onActiveChange", "(column | null) => void", "", "The position under the pointer or cursor: bits, gaps, letters."],
            ["Helpers", "logoCounts, logoColumns, logoConsensus, reverseComplementMatrix, detectLogoType", "", "Counts from sequences; stacks from counts; a column's consensus; the other strand."],
          ]}
        />
      </Section>
    </>
  )
}

function ModeDemo() {
  const [mode, setMode] = React.useState<"bits" | "probability" | "gc">("bits")
  return (
    <div className="grid gap-6">
      <SegmentedButton type="single" size="sm" value={mode} onValueChange={(v) => v && setMode(v as typeof mode)} aria-label="Scale" >
        <SegmentedButtonItem value="bits">Bits</SegmentedButtonItem>
        <SegmentedButtonItem value="probability">Probability</SegmentedButtonItem>
        <SegmentedButtonItem value="gc">Against 60% GC</SegmentedButtonItem>
      </SegmentedButton>
      <SequenceLogo
        matrix={P53_MOTIF}
        mode={mode === "probability" ? "probability" : "bits"}
        background={mode === "gc" ? { A: 0.2, C: 0.3, G: 0.3, T: 0.2 } : undefined}
        height={140}
      />
    </div>
  )
}

function StrandDemo() {
  const [strand, setStrand] = React.useState("forward")
  return (
    <div className="grid gap-6">
      <SegmentedButton type="single" size="sm" value={strand} onValueChange={(v) => v && setStrand(v)} aria-label="Strand" >
        <SegmentedButtonItem value="forward">Forward</SegmentedButtonItem>
        <SegmentedButtonItem value="reverse">Reverse complement</SegmentedButtonItem>
      </SegmentedButton>
      <SequenceLogo matrix={CTCF_MOTIF} reverseComplement={strand === "reverse"} consensus height={140} />
    </div>
  )
}

function SmallDemo() {
  const [correct, setCorrect] = React.useState(true)
  const few = ZF_C2H2.slice(0, 8)
  const bits = logoColumns(logoCounts(few), { type: "protein", correction: correct }).reduce((a, c) => a + c.bits, 0)
  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <div className="flex items-center gap-3">
          <Switch id="logo-correction" checked={correct} onCheckedChange={setCorrect} />
          <Label htmlFor="logo-correction">Small-sample correction</Label>
        </div>
        <span className="type-body-sm text-muted-foreground tabular-nums">{bits.toFixed(1)} bits in all</span>
      </div>
      <SequenceLogo sequences={few} type="protein" correction={correct} height={140} />
    </div>
  )
}

function SelectionDemo() {
  const [selection, setSelection] = React.useState<LogoRange | null>({ start: 3, end: 6 })
  const [focus, setFocus] = React.useState<LogoColumn | null>(null)
  const cols = React.useMemo(() => logoColumns(logoCounts(ZF_C2H2), { type: "protein" }), [])
  const picked = selection ? cols.slice(selection.start - 1, selection.end) : []
  return (
    <div className="grid gap-6">
      <div className="min-h-[4.5rem]">
        {focus ? (
          <ChartReadout
            value={focus.bits.toFixed(2)}
            unit="bits"
            label={`Position ${focus.position}`}
            detail={
              <span className="type-body-sm text-muted-foreground">
                {[...focus.letters]
                  .sort((a, b) => b.p - a.p)
                  .slice(0, 3)
                  .map((l) => `${l.letter} ${Math.round(l.p * 100)}%`)
                  .join(", ")}
              </span>
            }
          />
        ) : selection ? (
          <ChartReadout
            value={picked.map((c) => logoConsensus(c, "protein")).join("")}
            label={`Positions ${selection.start} to ${selection.end}`}
            detail={
              <span className="type-body-sm text-muted-foreground tabular-nums">
                {picked.reduce((a, c) => a + c.bits, 0).toFixed(1)} bits across {picked.length} positions
              </span>
            }
          />
        ) : (
          <ChartReadout value={ZF_C2H2.length} unit="sequences" label="C2H2 zinc finger" />
        )}
      </div>
      <SequenceLogo
        sequences={ZF_C2H2}
        selectable
        selection={selection}
        onSelectionChange={setSelection}
        onActiveChange={setFocus}
        consensus
        height={140}
        aria-label="C2H2 zinc finger logo"
      />
    </div>
  )
}
