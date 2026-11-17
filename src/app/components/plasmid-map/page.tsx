"use client"

import * as React from "react"
import { PlasmidMap, type PlasmidFeature, type PlasmidFocus, type PlasmidSite } from "@/registry/nelumbo/ui/plasmid-map"
import { Code, PageHeader, Preview, PropsTable, Section } from "@/components/docs/primitives"

// pGL3-Basic (GenBank U47295, 4,818 bp), as annotated there. The ColE1 origin is
// given as a single base, so it is drawn as a point.
const PGL3: PlasmidFeature[] = [
  { start: 1, end: 58, name: "MCS", kind: "misc", description: "Multiple cloning site, 1 to 58" },
  { start: 88, end: 1740, name: "luc+", kind: "cds", strand: 1, description: "Firefly luciferase, 88 to 1,740" },
  { start: 89, end: 111, name: "GLprimer2", kind: "primer", strand: -1 },
  { start: 1772, end: 1993, name: "SV40 poly(A)", kind: "terminator", description: "SV40 late poly(A) signal" },
  { start: 2061, end: 2080, name: "RVprimer4", kind: "primer", strand: -1 },
  { start: 2318, end: 2318, name: "ColE1 ori", kind: "origin", description: "ColE1-derived replication origin, at 2,318" },
  { start: 3080, end: 3940, name: "AmpR", kind: "marker", strand: -1, description: "β-lactamase, ampicillin resistance" },
  { start: 4072, end: 4527, name: "f1 ori", kind: "origin" },
  { start: 4658, end: 4811, name: "poly(A)", kind: "terminator", description: "Upstream poly(A) signal" },
  { start: 4760, end: 4779, name: "RVprimer3", kind: "primer", strand: 1 },
]

// Enzymes that cut pGL3-Basic once, found in its sequence (uniqueSites does this).
const SITES: PlasmidSite[] = [
  { position: 1, name: "KpnI" },
  { position: 7, name: "SacI" },
  { position: 15, name: "MluI" },
  { position: 21, name: "NheI" },
  { position: 26, name: "SmaI" },
  { position: 32, name: "XhoI" },
  { position: 36, name: "BglII" },
  { position: 53, name: "HindIII" },
  { position: 86, name: "NcoI" },
  { position: 1742, name: "XbaI" },
  { position: 2004, name: "BamHI" },
  { position: 2010, name: "SalI" },
  { position: 4650, name: "NotI" },
]

export default function PlasmidMapPage() {
  return (
    <>
      <PageHeader eyebrow="Component 72" title="Plasmid Map">
        A circular plasmid: the backbone as a thin ring, features as rounded arcs that point the way they read,
        restriction sites around the outside, and a center that reads out the plasmid or the feature in focus.
      </PageHeader>

      <Section title="Install">
        <Code>{`npx shadcn@latest add @nelumbo/plasmid-map`}</Code>
      </Section>

      <Section
        title="A plasmid"
        description="pGL3-Basic, a luciferase reporter. Names run along their arcs where they fit and sit outside with a leader where they do not; the unique cutters of its cloning site spread out so none overlap."
      >
        <Preview className="block">
          <PlasmidMap name="pGL3-Basic" length={4818} features={PGL3} sites={SITES} />
        </Preview>
      </Section>

      <Section
        title="Selection"
        description="selectable makes the map one keyboard stop, like a chart: arrows go from feature to feature around the circle, Escape clears. The center reads out the feature in focus and the rest fade."
      >
        <Preview className="block">
          <SelectionDemo />
        </Preview>
      </Section>

      <Section title="Narrow" description="Where there is no room for outside labels, the map keeps its arcs and moves the names to a legend.">
        <Preview className="block">
          <div className="mx-auto max-w-sm">
            <PlasmidMap name="pGL3-Basic" length={4818} features={PGL3} sites={SITES.slice(-4)} labels="legend" />
          </div>
        </Preview>
      </Section>

      <Section title="Props">
        <PropsTable
          rows={[
            ["name, length", "string, number", "", "Shown in the center."],
            ["features", "PlasmidFeature[]", "", "start, end, name, strand (1, -1, 0), kind, color, description. start > end crosses the origin."],
            ["kind", '"cds" | "promoter" | "origin" | "terminator" | "primer" | "marker" | "misc"', '"misc"', "Sets the default color; primers are thin."],
            ["sites", "PlasmidSite[]", "", "position and name: ticks on the backbone, labelled outside."],
            ["labels", '"auto" | "outside" | "legend"', '"auto"', "Auto uses outside labels from 520 px wide, a legend below that."],
            ["ruler", "boolean", "true", "Base numbers inside the ring."],
            ["selectable / onActiveChange", "boolean, (focus | null) => void", "", "Keyboard and pointer focus on features."],
            ["Helpers", "uniqueSites, featureLength, featureColor", "", "Enzymes that cut once in a circular sequence; lengths across the origin."],
          ]}
        />
      </Section>
    </>
  )
}

function SelectionDemo() {
  const [focus, setFocus] = React.useState<PlasmidFocus | null>(null)
  return (
    <div className="grid gap-4">
      <p className="type-body-md text-muted-foreground" aria-live="polite">
        {focus ? `${focus.feature.name}: ${focus.length.toLocaleString("en-US")} bp${focus.feature.description ? `, ${focus.feature.description}` : ""}` : "Point at a feature, or focus the map and use the arrow keys."}
      </p>
      <PlasmidMap name="pGL3-Basic" length={4818} features={PGL3} sites={SITES} selectable onActiveChange={setFocus} />
    </div>
  )
}
