"use client"

import { ProteinDomains } from "@/registry/nelumbo/ui/protein-domains"
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
            ["Parts", "DomainLegend, Lollipop, domainColors, domainLanes, stackLabels", "", "Shared with GeneModel."],
          ]}
        />
      </Section>
    </>
  )
}
