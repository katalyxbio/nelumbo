"use client"

import * as React from "react"
import { GeneModel, type GeneModelFocus, type GeneModelMarker } from "@/registry/nelumbo/ui/gene-model"
import { ChartReadout } from "@/registry/nelumbo/ui/chart"
import { ToggleGroup, ToggleGroupItem } from "@/registry/nelumbo/ui/toggle-group"
import { Code, PageHeader, Preview, PropsTable, Section } from "@/components/docs/primitives"
import { HBB_201, P53_DOMAINS, TP53_201, TP53_202, TP53_204, TP53_209 } from "./data"

// TP53 hotspots, placed by their GRCh38 positions (checked against the canonical CDS).
const HOTSPOTS: GeneModelMarker[] = [
  { position: 7675088, label: "R175H", description: "c.524G>A, p.Arg175His" },
  { position: 7674894, label: "R213*", color: "purple", description: "c.637C>T, p.Arg213Ter, nonsense" },
  { position: 7674872, label: "Y220C", description: "c.659A>G, p.Tyr220Cys" },
  { position: 7674230, label: "G245S", description: "c.733G>A, p.Gly245Ser" },
  { position: 7674220, label: "R248Q", description: "c.743G>A, p.Arg248Gln" },
  { position: 7673802, label: "R273H", description: "c.818G>A, p.Arg273His" },
  { position: 7673776, label: "R282W", description: "c.844C>T, p.Arg282Trp" },
]

const ISOFORMS = [TP53_201, TP53_204, TP53_209, TP53_202]

export default function GeneModelPage() {
  return (
    <>
      <PageHeader eyebrow="Component 70" title="Gene Model">
        A gene&apos;s transcripts as exons and introns: coding blocks and thinner UTRs joined like a connected
        button group, dotted introns with strand chevrons, exon numbers, compressed introns, isoform stacks, variant
        lollipops and keyboard focus on exons.
      </PageHeader>

      <Section title="Install">
        <Code>{`npx shadcn@latest add @nelumbo/gene-model`}</Code>
      </Section>

      <Section
        title="A gene"
        description="HBB, β-globin: three exons on the minus strand. Coding sequence is the tall block, the UTRs the thinner tonal ends; chevrons point the way it is read."
      >
        <Preview className="block">
          <GeneModel transcripts={[HBB_201]} exonNumbers ruler />
        </Preview>
      </Section>

      <Section
        title="Compressed introns"
        description='TP53 spans 19 kb but its exons only 2.5 kb. introns="compressed" shrinks every intron to a short stretch so the exons get the room. The ruler only shows at true scale.'
      >
        <Preview className="grid gap-8">
          <GeneModel transcripts={[TP53_201]} exonNumbers ruler />
          <GeneModel transcripts={[TP53_201]} exonNumbers introns="compressed" />
        </Preview>
      </Section>

      <Section
        title="Isoforms"
        description="Several transcripts share one scale. The canonical one takes the color, the others stay neutral, so the differences read at a glance: exon 9β in p53β, Δ133p53 starting in intron 4."
      >
        <Preview className="block">
          <GeneModel transcripts={ISOFORMS} exonNumbers introns="compressed" />
        </Preview>
      </Section>

      <Section
        title="Orientation"
        description={`Genome browsers draw minus-strand genes right to left. orientation="transcript" turns them so 5' is on the left and exon 1 comes first.`}
      >
        <Preview className="block">
          <OrientationDemo />
        </Preview>
      </Section>

      <Section
        title="Variants"
        description="markers stand on a transcript as lollipops with pill labels, stacked when they would collide. Here, TP53 hotspots in the DNA-binding domain."
      >
        <Preview className="block">
          <GeneModel transcripts={[TP53_201]} exonNumbers introns="compressed" markers={HOTSPOTS} />
        </Preview>
      </Section>

      <Section
        title="Protein domains"
        description="domains takes residue ranges, as UniProt gives them, and maps them through the coding sequence onto the exons that encode them. A domain split by an intron keeps tight corners at the cut and round ones at its true ends, with a dotted line across the gap. Here, p53's domains on TP53."
      >
        <Preview className="grid gap-8">
          <GeneModel transcripts={[TP53_201]} exonNumbers introns="compressed" domains={P53_DOMAINS} markers={HOTSPOTS} />
          <GeneModel transcripts={ISOFORMS} introns="compressed" domains={P53_DOMAINS} domainLegend={false} aria-label="TP53 isoforms with p53 domains" />
        </Preview>
      </Section>

      <Section
        title="Selection"
        description="selectable makes the model one keyboard stop, like a chart: Left and Right move between exons, Up and Down between transcripts, Escape clears. The readout follows the pointer."
      >
        <Preview className="block">
          <SelectionDemo />
        </Preview>
      </Section>

      <Section title="Colors and sizes" description="Any accent role colors the coding blocks; the small size suits lists and tables.">
        <Preview className="grid gap-6">
          <GeneModel transcripts={[HBB_201]} color="green" exonNumbers />
          <GeneModel transcripts={[TP53_201]} color="purple" introns="compressed" size="sm" />
          <GeneModel transcripts={[HBB_201]} color="orange" size="sm" />
        </Preview>
      </Section>

      <Section title="Props">
        <PropsTable
          rows={[
            ["transcripts", "GeneModelTranscript[]", "", "id, name, description, strand, exons, cds, canonical. 1-based, inclusive."],
            ["introns", '"scaled" | "compressed"', '"scaled"', "Compressed shrinks introns so exons get the room."],
            ["orientation", '"genome" | "transcript"', '"genome"', "Transcript turns minus-strand genes so 5' is on the left."],
            ["exonNumbers", "boolean", "false", "In transcription order: inside the coding block where it fits, under it otherwise."],
            ["ruler", "boolean", "false", "Genomic coordinates along the top. Scaled introns only."],
            ["markers", "GeneModelMarker[]", "", "position, label, color, description: lollipops with pill labels."],
            ["markersOn", "string", "first transcript", "The transcript id the markers stand on."],
            ["color", "accent role", '"blue"', "The coding blocks of the canonical (or only) transcript."],
            ["size", '"sm" | "default"', '"default"', "14 or 20 px coding blocks."],
            ["region", "{ start, end }", "the transcripts' span", "The stretch shown."],
            ["selectable / onActiveChange", "boolean, (focus | null) => void", "", "Keyboard and pointer focus on exons; focus has transcript, exon and count."],
            ["domains", "ProteinDomain[]", "", "Residue ranges (start, end, name, color), mapped through the coding sequence."],
            ["domainsOn / domainLegend", "string, boolean", "canonical, true", "The transcript whose protein the domains are on; the legend under the model."],
            ["Helpers", "numberExons, domainSegments, formatGenomic", "", "Exons in transcription order; a domain's genomic stretches; coordinates as 7,675,088."],
          ]}
        />
      </Section>
    </>
  )
}

function OrientationDemo() {
  const [o, setO] = React.useState<"genome" | "transcript">("transcript")
  return (
    <div className="grid gap-6">
      <ToggleGroup type="single" value={o} onValueChange={(v) => v && setO(v as typeof o)} aria-label="Orientation" className="w-fit">
        <ToggleGroupItem value="genome">Genome</ToggleGroupItem>
        <ToggleGroupItem value="transcript">Transcript</ToggleGroupItem>
      </ToggleGroup>
      <GeneModel transcripts={[TP53_201]} exonNumbers introns="compressed" orientation={o} />
    </div>
  )
}

function SelectionDemo() {
  const [focus, setFocus] = React.useState<GeneModelFocus | null>(null)
  const kind = (f: GeneModelFocus) =>
    f.exon.kind === "coding" ? "Coding" : f.exon.kind === "utr" ? "Untranslated" : "Partly coding"
  return (
    <div className="grid gap-6">
      {focus ? (
        <ChartReadout
          value={focus.exon.number}
          unit={`of ${focus.of}`}
          label={`${focus.transcript.name}, exon ${focus.exon.number}`}
          detail={
            <span className="type-body-sm text-muted-foreground">
              {kind(focus)}, {focus.exon.length.toLocaleString("en-US")} bp, chr17:{focus.exon.start.toLocaleString("en-US")}
              {focus.domains.length ? `, ${focus.domains.map((d) => d.name).join(" and ")}` : ""}
            </span>
          }
        />
      ) : (
        <ChartReadout value={ISOFORMS.length} unit="transcripts" label="TP53" />
      )}
      <GeneModel
        transcripts={ISOFORMS}
        exonNumbers
        domains={P53_DOMAINS}
        domainLegend={false}
        introns="compressed"
        orientation="transcript"
        selectable
        defaultSelected={{ transcript: TP53_201.id, exon: 5 }}
        onActiveChange={setFocus}
        aria-label="TP53 isoforms"
      />
    </div>
  )
}
