"use client"

import * as React from "react"
import { ChemicalStructure } from "@/registry/nelumbo/ui/chemical-structure"
import { SegmentedButton, SegmentedButtonItem } from "@/registry/nelumbo/ui/segmented-button"
import { Input } from "@/registry/nelumbo/ui/input"
import { Code, PageHeader, Preview, PropsTable, Section } from "@/components/docs/primitives"

const LIBRARY: { name: string; smiles: string; note: string }[] = [
  { name: "Caffeine", smiles: "CN1C=NC2=C1C(=O)N(C(=O)N2C)C", note: "Adenosine receptor antagonist" },
  { name: "Aspirin", smiles: "CC(=O)OC1=CC=CC=C1C(=O)O", note: "Acetylates COX-1 and COX-2" },
  { name: "Dopamine", smiles: "C1=CC(=C(C=C1CCN)O)O", note: "Catecholamine neurotransmitter" },
  { name: "Serotonin", smiles: "C1=CC2=C(C=C1O)C(=CN2)CCN", note: "5-HT, an indoleamine" },
  { name: "β-D-Glucose", smiles: "OC[C@H]1O[C@@H](O)[C@H](O)[C@@H](O)[C@@H]1O", note: "Pyranose ring, all equatorial" },
  {
    name: "Penicillin G",
    smiles: "CC1([C@@H](N2[C@H](S1)[C@@H](C2=O)NC(=O)CC3=CC=CC=C3)C(=O)O)C",
    note: "β-lactam fused to a thiazolidine",
  },
  {
    name: "ATP",
    smiles: "Nc1ncnc2c1ncn2[C@@H]1O[C@H](COP(=O)(O)OP(=O)(O)OP(=O)(O)O)[C@@H](O)[C@H]1O",
    note: "Adenosine triphosphate",
  },
  {
    name: "Imatinib",
    smiles: "CC1=C(C=C(C=C1)NC(=O)C2=CC=C(C=C2)CN3CCN(CC3)C)NC4=NC=CC(=N4)C5=CN=CC=C5",
    note: "BCR-ABL kinase inhibitor",
  },
]

function Playground() {
  const [smiles, setSmiles] = React.useState("CC(C)CC1=CC=C(C=C1)[C@@H](C)C(=O)O")
  const [color, setColor] = React.useState<"element" | "mono">("element")
  return (
    <div className="grid min-w-0 gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-center">
      <div className="flex min-w-0 flex-col gap-4">
        <Input label="SMILES" value={smiles} onChange={(e) => setSmiles(e.target.value)} className="font-mono" spellCheck={false} />
        <SegmentedButton type="single" size="sm" value={color} onValueChange={(v) => v && setColor(v as "element" | "mono")} aria-label="Atom colors">
          <SegmentedButtonItem value="element">Element</SegmentedButtonItem>
          <SegmentedButtonItem value="mono">Mono</SegmentedButtonItem>
        </SegmentedButton>
        <p className="type-body-sm text-muted-foreground">
          Try your own SMILES. This one is (S)-ibuprofen, the active enantiomer; its stereocenter is drawn as a wedge.
        </p>
      </div>
      <ChemicalStructure smiles={smiles} color={color} showFormula label="Your molecule" />
    </div>
  )
}

export default function ChemicalStructurePage() {
  return (
    <>
      <PageHeader eyebrow="Component 87" title="Chemical Structure">
        A molecule&apos;s skeletal formula, drawn from a SMILES string as crisp SVG. It follows the theme, scales to its
        box, and colors heteroatoms the conventional way, or not at all.
      </PageHeader>

      <Section title="Install">
        <Code>{`npx shadcn@latest add @nelumbo/chemical-structure`}</Code>
      </Section>

      <Section title="Usage">
        <Code>{`import { ChemicalStructure } from "@/components/ui/chemical-structure"

<ChemicalStructure smiles="CN1C=NC2=C1C(=O)N(C(=O)N2C)C" name="Caffeine" showFormula />`}</Code>
      </Section>

      <Section title="Basic" description="Give it a SMILES string; name adds a caption and names the image for screen readers, and showFormula adds the molecular formula.">
        <Preview className="justify-center">
          <ChemicalStructure smiles={LIBRARY[0].smiles} name="Caffeine" showFormula className="w-full max-w-sm" />
        </Preview>
      </Section>

      <Section title="A small library" description="Neurotransmitters, sugars, antibiotics, energy carriers and a kinase inhibitor. Drawings lay themselves out; rings, charges and stereo come from the SMILES.">
        <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {LIBRARY.map((m) => (
            <div key={m.name} className="flex min-w-0 flex-col gap-2 rounded-3xl bg-surface-container-low p-4 dark:bg-surface-container-lowest">
              <ChemicalStructure smiles={m.smiles} name={m.name} showFormula />
              <p className="text-center type-body-sm text-muted-foreground">{m.note}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="Element or mono"
        description='color "element" colors heteroatom labels the conventional way: nitrogen blue, oxygen red, sulfur amber. "mono" keeps the whole drawing in the text color, for print or when color means something else on the page.'
      >
        <Preview className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <ChemicalStructure smiles={LIBRARY[5].smiles} name="element" />
          <ChemicalStructure smiles={LIBRARY[5].smiles} name="mono" color="mono" />
        </Preview>
      </Section>

      <Section
        title="Highlighted atoms"
        description="highlight takes atom-map numbers from the SMILES, the :1 in [NH:1], and draws a soft halo behind those atoms. Here, the amide nitrogen and carbonyl carbon of paracetamol, the bond that amidases cleave."
      >
        <Preview className="justify-center">
          <ChemicalStructure smiles="C[C:2](=O)[NH:1]C1=CC=C(O)C=C1" highlight={[1, 2]} name="Paracetamol" showFormula className="w-full max-w-sm" />
        </Preview>
        <Code>{`<ChemicalStructure smiles="C[C:2](=O)[NH:1]C1=CC=C(O)C=C1" highlight={[1, 2]} />`}</Code>
      </Section>

      <Section title="Try it" description="The drawing updates as you type, and an invalid SMILES shows a short message instead of breaking the page.">
        <Preview className="block">
          <Playground />
        </Preview>
      </Section>

      <Section title="Props">
        <PropsTable
          rows={[
            ["smiles", "string", "—", "The molecule, as SMILES."],
            ["name", "string", "—", "Caption, and the accessible name."],
            ["label", "string", '"Chemical structure"', "Accessible name when there is no name."],
            ["color", '"element" | "mono"', '"element"', "Conventional heteroatom colors, or all text color."],
            ["highlight", "number[]", "[]", "Atom-map numbers to draw a halo behind."],
            ["showFormula", "boolean", "false", "Shows the molecular formula."],
            ["explicitHydrogens", "boolean", "false", "Draws every hydrogen."],
            ["terminalCarbons", "boolean", "false", "Labels terminal carbons (CH3) instead of leaving bare line ends."],
            ["bondLength", "number", "30", "Bond length in px at 1×; the drawing still scales to its box."],
          ]}
        />
      </Section>
    </>
  )
}
