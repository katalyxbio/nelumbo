"use client"

import * as React from "react"
import { VariantBadge, VariantEvidence, VARIANT_CLASSES, classifyVariant, type VariantClassification } from "@/registry/nelumbo/ui/variant-badge"
import { AminoAcidChange } from "@/registry/nelumbo/ui/amino-acid"
import { ToggleGroup, ToggleGroupItem } from "@/registry/nelumbo/ui/toggle-group"
import { Button } from "@/registry/nelumbo/ui/button"
import { Code, PageHeader, Preview, PropsTable, Section } from "@/components/docs/primitives"

const TIERS: VariantClassification[] = ["pathogenic", "likely-pathogenic", "uncertain", "likely-benign", "benign"]

const CRITERIA = {
  pathogenic: ["PVS1", "PS1", "PS2", "PS3", "PS4", "PM1", "PM2", "PM2_Supporting", "PM3", "PM4", "PM5", "PM6", "PP1", "PP2", "PP3", "PP4", "PP5"],
  benign: ["BA1", "BS1", "BS2", "BS3", "BS4", "BP1", "BP2", "BP3", "BP4", "BP5", "BP6", "BP7"],
}

// Well-known TP53 variants and how ClinVar classifies them: the three DNA-contact hotspots, and P72R, a common polymorphism.
const P53_VARIANTS = [
  { from: "R", position: 175, to: "H", hgvs: "c.524G>A", classification: "pathogenic" },
  { from: "R", position: 248, to: "Q", hgvs: "c.743G>A", classification: "pathogenic" },
  { from: "R", position: 273, to: "H", hgvs: "c.818G>A", classification: "pathogenic" },
  { from: "P", position: 72, to: "R", hgvs: "c.215C>G", classification: "benign" },
] as const

export default function VariantBadgePage() {
  return (
    <>
      <PageHeader eyebrow="Component 79" title="Variant Badge">
        A variant&apos;s clinical classification on the ACMG/AMP five-tier scale. Color carries the meaning, red toward
        pathogenic and green toward benign, and five pips show where on the scale it sits, so the tier reads without
        color too.
      </PageHeader>

      <Section title="Install">
        <Code>{`npx shadcn@latest add @nelumbo/variant-badge`}</Code>
      </Section>

      <Section
        title="Five tiers"
        description="Pathogenic and benign at full strength, the likely tiers lighter, uncertain significance neutral. ClinVar's conflicting and not provided sit off the scale."
      >
        <Preview className="grid gap-4">
          <div className="flex flex-wrap gap-3">
            {TIERS.map((t) => (
              <VariantBadge key={t} classification={t} />
            ))}
          </div>
          <div className="flex flex-wrap gap-3">
            <VariantBadge classification="conflicting" />
            <VariantBadge classification="not-provided" />
          </div>
        </Preview>
      </Section>

      <Section
        title="Styles and sizes"
        description='Tonal (default), outline for dense tables, solid for the one call that matters most. notation="short" gives P, LP, VUS, LB and B.'
      >
        <Preview className="grid gap-5">
          {(["tonal", "outline", "solid"] as const).map((v) => (
            <div key={v} className="flex flex-wrap items-center gap-3">
              {TIERS.map((t) => (
                <VariantBadge key={t} classification={t} variant={v} notation="short" />
              ))}
            </div>
          ))}
          <div className="flex flex-wrap items-center gap-3">
            <VariantBadge classification="pathogenic" size="sm" />
            <VariantBadge classification="pathogenic" />
            <VariantBadge classification="pathogenic" size="lg" />
            <VariantBadge classification="benign" scale={false} />
          </div>
        </Preview>
      </Section>

      <Section title="Review status" description="review adds ClinVar's stars: how well reviewed the classification is, from no criteria to a practice guideline.">
        <Preview className="grid gap-3">
          {([0, 1, 2, 3, 4] as const).map((r) => (
            <div key={r} className="flex flex-wrap items-center gap-3">
              <VariantBadge classification={TIERS[r]} review={r} />
              <span className="type-body-sm text-muted-foreground">
                {["No assertion criteria", "Criteria provided, single submitter", "Multiple submitters, no conflicts", "Reviewed by expert panel", "Practice guideline"][r]}
              </span>
            </div>
          ))}
        </Preview>
      </Section>

      <Section
        title="From the evidence"
        description="classifyVariant combines ACMG/AMP criteria by the 2015 rules, ClinGen's strength suffixes included (PM2_Supporting). VariantEvidence shows the criteria as chips: red argue pathogenic, green benign, and the bars give each one's strength. Pick some."
      >
        <Preview className="block">
          <EvidenceDemo />
        </Preview>
      </Section>

      <Section title="In a table" description="TP53 variants as ClinVar classifies them, paired with Amino Acid Change.">
        <Preview className="block">
          <ul className="grid gap-3">
            {P53_VARIANTS.map((v) => (
              <li key={v.position} className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <AminoAcidChange from={v.from} position={v.position} to={v.to} size="sm" />
                <span className="w-20 font-mono type-label-md text-muted-foreground">{v.hgvs}</span>
                <VariantBadge classification={v.classification} size="sm" />
              </li>
            ))}
          </ul>
        </Preview>
      </Section>

      <Section title="Props">
        <PropsTable
          rows={[
            ["classification", "VariantClassification | string", "", "pathogenic, likely-pathogenic, uncertain, likely-benign, benign, conflicting, not-provided; or text such as \"VUS\" or \"Likely benign\"."],
            ["notation", '"full" | "short"', '"full"', "Pathogenic or P."],
            ["variant", '"tonal" | "outline" | "solid"', '"tonal"', "Fill strength."],
            ["size", '"sm" | "default" | "lg"', '"default"', "20, 24 or 32 px tall."],
            ["scale", "boolean", "true", "Five pips for the tier."],
            ["review", "0 to 4", "", "ClinVar review stars."],
            ["VariantEvidence", "{ criteria: string[], size }", "", "ACMG criteria as chips, by direction and strength."],
            ["Helpers", "classifyVariant, parseCriterion, toClassification, VARIANT_CLASSES", "", "The 2015 combining rules; a criterion's direction and strength; text to a classification; names and tiers."],
          ]}
        />
      </Section>
    </>
  )
}

const PRESETS: { name: string; criteria: string[] }[] = [
  { name: "Null variant, absent from controls", criteria: ["PVS1", "PM2_Supporting", "PP3"] },
  { name: "Hotspot missense", criteria: ["PS3", "PM1", "PM2", "PP3"] },
  { name: "Common in the population", criteria: ["BA1"] },
  { name: "Mixed evidence", criteria: ["PM2", "PP3", "BS3", "BP4"] },
]

function EvidenceDemo() {
  const [picked, setPicked] = React.useState<string[]>(PRESETS[0].criteria)
  const c = classifyVariant(picked)
  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <Button key={p.name} variant="outline" size="sm" onClick={() => setPicked(p.criteria)}>
            {p.name}
          </Button>
        ))}
      </div>
      {(["pathogenic", "benign"] as const).map((dir) => (
        <ToggleGroup
          key={dir}
          type="multiple"
          size="sm"
          value={picked.filter((p) => CRITERIA[dir].includes(p))}
          onValueChange={(v) => setPicked([...picked.filter((p) => !CRITERIA[dir].includes(p)), ...v])}
          aria-label={dir === "pathogenic" ? "Pathogenic criteria" : "Benign criteria"}
          className="flex-wrap justify-start"
        >
          {CRITERIA[dir].map((k) => (
            <ToggleGroupItem key={k} value={k} className="font-mono">
              {k.replace("_", " ")}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      ))}
      <div className="grid gap-3 rounded-2xl bg-surface-container px-4 py-4">
        <div className="flex flex-wrap items-center gap-3">
          <VariantBadge classification={c} size="lg" />
          <span className="type-body-sm text-muted-foreground" aria-live="polite">
            {VARIANT_CLASSES[c].about}
          </span>
        </div>
        {picked.length ? <VariantEvidence criteria={picked} /> : <span className="type-body-sm text-muted-foreground">No criteria picked</span>}
      </div>
    </div>
  )
}
