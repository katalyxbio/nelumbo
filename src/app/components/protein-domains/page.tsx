"use client"

import * as React from "react"
import { ProteinDomains, plddtBand } from "@/registry/nelumbo/ui/protein-domains"
import { ChartReadout } from "@/registry/nelumbo/ui/chart"
import { P53_PLDDT, P53_SEQUENCE, P53_STRUCTURE } from "./data"
import { AminoAcidChange } from "@/registry/nelumbo/ui/amino-acid"
import { Code, PageHeader, Preview, PropsTable, Section } from "@/components/docs/primitives"
import { P53_DOMAINS, P53_HOTSPOTS, P53_LENGTH } from "../gene-model/data"

export default function ProteinDomainsPage() {
  return (
    <>
      <PageHeader eyebrow="Component 71" title="Protein Domains">
        A protein along its length: a thin backbone, its domains as tall rounded blocks named inside where they fit,
        a ruler in residues, and variants as lollipops with pill labels. The same domains can sit under a Gene Model,
        mapped onto the exons that encode them.
      </PageHeader>

      <Section title="Install">
        <Code>{`npx shadcn@latest add @nelumbo/protein-domains`}</Code>
      </Section>

      <Section title="Domains" description="p53, 393 residues, with its domains as UniProt annotates them (P04637).">
        <Preview className="block">
          <ProteinDomains length={P53_LENGTH} domains={P53_DOMAINS} />
        </Preview>
      </Section>

      <Section
        title="Variants"
        description="variants stand on the protein as lollipops, stacked when their labels would collide. Most p53 hotspots sit in the DNA-binding domain."
      >
        <Preview className="block">
          <ProteinDomains length={P53_LENGTH} domains={P53_DOMAINS} variants={P53_HOTSPOTS} />
        </Preview>
      </Section>

      <Section
        title="Structure and confidence"
        description="Tracks under the domains, on the same scale: secondary structure (helices as coils, strands as arrows, turns as short bars, coil as the line) and a per-residue confidence such as AlphaFold's pLDDT, its bars colored by AlphaFold's four bands. Hover anywhere for the residue through every track. p53's structure is UniProt's; the confidence here is simulated to match its AlphaFold model's band shares."
      >
        <Preview className="block">
          <ProteinDomains length={P53_LENGTH} domains={P53_DOMAINS} structure={P53_STRUCTURE} confidence={P53_PLDDT} sequence={P53_SEQUENCE} />
        </Preview>
      </Section>

      <Section
        title="Reading a residue"
        description="selectable makes the tracks one keyboard stop: arrows move a residue, Shift moves ten, Home and End jump. Disorder shows at a glance: the transactivation region and the C-terminus fall to very low confidence, the DNA-binding domain stays very high."
      >
        <Preview className="block">
          <ResidueDemo />
        </Preview>
      </Section>

      <Section
        title="With mutations"
        description="Pair the track with AminoAcidChange for a variant list that reads the same way."
      >
        <Preview className="grid gap-6">
          <ProteinDomains length={P53_LENGTH} domains={P53_DOMAINS} variants={P53_HOTSPOTS.slice(0, 3)} labels="inside" />
          <div className="flex flex-wrap gap-3">
            {P53_HOTSPOTS.slice(0, 3).map((v) => (
              <AminoAcidChange key={v.position} from={v.label![0]} position={v.position} to={v.label!.slice(-1)} />
            ))}
          </div>
        </Preview>
      </Section>

      <Section title="Labels and sizes" description='labels chooses names inside the blocks, a legend, both or none. The small size suits lists and tables.'>
        <Preview className="grid gap-8">
          <ProteinDomains length={P53_LENGTH} domains={P53_DOMAINS} labels="legend" size="sm" />
          <ProteinDomains length={P53_LENGTH} domains={P53_DOMAINS} labels="none" ruler={false} size="sm" aria-label="p53 domains, compact" />
        </Preview>
      </Section>

      <Section title="Props">
        <PropsTable
          rows={[
            ["length", "number", "", "Residues in the protein."],
            ["domains", "ProteinDomain[]", "", "start, end, name, color, description. Overlapping domains take separate lanes."],
            ["variants", "ProteinVariant[]", "", "position, label, color, description: lollipops with pill labels."],
            ["labels", '"inside" | "legend" | "both" | "none"', '"both"', "Names inside the blocks where they fit, and a legend underneath."],
            ["ruler", "boolean", "true", "Residue numbers along the bottom."],
            ["size", '"sm" | "default"', '"default"', "14 or 22 px domains."],
            ["structure", "StructureElement[]", "", "start, end, type (helix, strand, turn). structureFromDssp reads a DSSP string."],
            ["confidence", "number[]", "", "One score a residue, 0 to 100 (pLDDT): bars in AlphaFold's bands."],
            ["confidenceLabel", "string", '"AlphaFold confidence (pLDDT)"', "The confidence track's name."],
            ["sequence", "string", "", "The residues, named in the hover card and readout."],
            ["selectable / onActiveChange", "boolean, (residue | null) => void", "false", "A keyboard stop over the residues; the residue in focus."],
            ["Parts", "DomainLegend, Lollipop, domainColors, domainLanes, stackLabels, PLDDT_BANDS, plddtBand", "", "Shared with GeneModel; AlphaFold's bands."],
          ]}
        />
      </Section>
    </>
  )
}

function ResidueDemo() {
  const [aa, setAa] = React.useState<number | null>(null)
  const domain = aa ? P53_DOMAINS.filter((d) => aa >= d.start && aa <= d.end).map((d) => d.name).join(", ") : ""
  const ss = aa ? (P53_STRUCTURE.find((e) => aa >= e.start && aa <= e.end)?.type ?? "coil") : ""
  return (
    <div className="grid gap-6">
      <div className="min-h-[4.5rem]">
        {aa ? (
          <ChartReadout
            value={`${P53_SEQUENCE[aa - 1]}${aa}`}
            label={domain || "Between domains"}
            detail={
              <span className="type-body-sm text-muted-foreground tabular-nums">
                {ss[0].toUpperCase() + ss.slice(1)}, pLDDT {Math.round(P53_PLDDT[aa - 1])} ({plddtBand(P53_PLDDT[aa - 1]).name.toLowerCase()})
              </span>
            }
          />
        ) : (
          <ChartReadout value={P53_LENGTH} unit="residues" label="p53" />
        )}
      </div>
      <ProteinDomains
        length={P53_LENGTH}
        domains={P53_DOMAINS}
        structure={P53_STRUCTURE}
        confidence={P53_PLDDT}
        sequence={P53_SEQUENCE}
        selectable
        onActiveChange={setAa}
        labels="inside"
        aria-label="p53 by residue"
      />
    </div>
  )
}
