"use client"

import * as React from "react"
import { ChromosomeIdeogram, Karyotype, parseCytobands, type IdeogramMarker } from "@/registry/nelumbo/ui/chromosome-ideogram"
import { GeneModel } from "@/registry/nelumbo/ui/gene-model"
import { Code, PageHeader, Preview, PropsTable, Section } from "@/components/docs/primitives"
import { TP53_201 } from "../gene-model/data"
import { GENES, HG38_CYTOBANDS } from "./data"

const BANDS = parseCytobands(HG38_CYTOBANDS)
const MARKERS: IdeogramMarker[] = GENES.map((g) => ({
  chrom: g.chrom,
  start: g.start,
  end: g.end,
  label: g.label,
  description: `${g.label}, ${g.band}`,
}))
const TP53 = GENES.find((g) => g.label === "TP53")!

export default function ChromosomeIdeogramPage() {
  return (
    <>
      <PageHeader eyebrow="Component 81" title="Chromosome Ideogram">
        A chromosome as its Giemsa bands: dark and light stripes along two arms, pinched at the centromere and rounded at
        the ends. Grayscale like the stain, so color stays free for what you mark on it.
      </PageHeader>

      <Section title="Install">
        <Code>{`npx shadcn@latest add @nelumbo/chromosome-ideogram`}</Code>
      </Section>

      <Section
        title="A chromosome"
        description="Chromosome 17 from UCSC's hg38 band table, read with parseCytobands, and three genes from NCBI Gene: TP53 on the short arm, ERBB2 and BRCA1 on the long one. Hover a band for its name and extent."
      >
        <Preview className="block">
          <ChromosomeIdeogram bands={BANDS} chromosome="chr17" markers={MARKERS} />
        </Preview>
      </Section>

      <Section
        title="Over a gene model"
        description="region frames a stretch and draws zoom lines to the corners, so whatever sits underneath reads as the close-up: here TP53, in 17p13.1, and its exons."
      >
        <Preview className="grid gap-0">
          <ChromosomeIdeogram bands={BANDS} chromosome="chr17" region={{ start: TP53.start, end: TP53.end }} size="sm" labels={false} ruler={false} />
          <GeneModel transcripts={[TP53_201]} exonNumbers ruler />
        </Preview>
      </Section>

      <Section
        title="Karyotype"
        description="The whole genome at one scale, each chromosome upright with its genes marked (named where the columns have room, and on hover). Pick one, with the pointer or the arrow keys, to see it close."
      >
        <Preview className="block">
          <KaryotypeDemo />
        </Preview>
      </Section>

      <Section
        title="Reading the bands"
        description="selectable makes the bands one keyboard stop: arrows move a band, Home and End go to the ends."
      >
        <Preview className="block">
          <ChromosomeIdeogram bands={BANDS} chromosome="chr13" markers={MARKERS} selectable aria-label="Chromosome 13, by band" />
        </Preview>
      </Section>

      <Section title="Props">
        <PropsTable
          rows={[
            ["bands", "Cytoband[]", "", "chrom, start, end, name, stain: UCSC's cytoBand.txt through parseCytobands."],
            ["chromosome", "string", "", "Which one: \"chr17\"."],
            ["markers", "IdeogramMarker[]", "", "start, end, label, color, description; chrom in a Karyotype. Pills on stems, stacked."],
            ["region / connector", "{ start, end }, boolean", "true", "A framed stretch, with zoom lines to the corners below."],
            ["labels / ruler", "boolean", "true", "Band names where they fit; megabase ticks."],
            ["size", '"sm" | "default"', '"default"', "14 or 22 px thick."],
            ["selectable / onActiveChange", "boolean, ({ band } | null) => void", "false", "A keyboard stop over the bands; the band in focus."],
            ["Karyotype", "bands, chromosomes, markers, height, chromosome, onChromosomeChange", "", "The genome side by side at one scale; a radio group when you can pick."],
            ["Helpers", "parseCytobands, bandAt", "", "A band table from text; the band a position falls in (\"17p13.1\")."],
          ]}
        />
      </Section>
    </>
  )
}

function KaryotypeDemo() {
  const [chrom, setChrom] = React.useState("chr13")
  return (
    <div className="grid gap-6">
      <Karyotype bands={BANDS} markers={MARKERS} chromosome={chrom} onChromosomeChange={setChrom} />
      <div className="grid gap-2">
        <span className="type-title-sm">Chromosome {chrom.replace("chr", "")}</span>
        <ChromosomeIdeogram bands={BANDS} chromosome={chrom} markers={MARKERS} size="sm" />
      </div>
    </div>
  )
}
