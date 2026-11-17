"use client"

import * as React from "react"
import {
  AMINO_ACIDS,
  AMINO_ACID_KINDS,
  AMINO_ACID_SCHEMES,
  AminoAcid,
  AminoAcidChange,
  HYDROPATHY,
  ProteinSequence,
} from "@/registry/nelumbo/ui/amino-acid"
import { Residue, type ResidueRange } from "@/registry/nelumbo/ui/residue"
import { ChartReadout } from "@/registry/nelumbo/ui/chart"
import { ToggleGroup, ToggleGroupItem } from "@/registry/nelumbo/ui/toggle-group"
import { Code, PageHeader, Preview, PropsTable, Section } from "@/components/docs/primitives"

// Human p53, residues 1 to 120.
const P53 =
  "MEEPQSDPSVEPPLSQETFSDLWKLLPENNVLSPLPSQAMDDLMLSPDDIEQWFTEDPGPDEAPRMPEAAPPVAPAPAAPTPAAPAPAPSWPLSSSVPSQKTYQGSYGFRLGFLHSGTAK"

export default function AminoAcidPage() {
  return (
    <>
      <PageHeader eyebrow="Component 69" title="Amino Acid">
        Protein residues as colored tiles, a protein as blocks of them, and substitutions such as R175H. The
        default scheme groups residues by side chain on Nelumbo&apos;s palette hues; Clustal X, Zappo, Taylor and
        the others are redrawn at the same even lightness.
      </PageHeader>

      <Section title="Install">
        <Code>{`npx shadcn@latest add @nelumbo/amino-acid`}</Code>
      </Section>

      <Section title="The twenty" description="Grouped by side chain, the way the default scheme colors them. Each tile is named on hover.">
        <Preview className="grid gap-4 sm:grid-cols-[minmax(9rem,auto)_1fr] sm:items-center">
          {AMINO_ACID_KINDS.map((k) => (
            <React.Fragment key={k.kind}>
              <span className="type-label-lg text-muted-foreground">{k.name}</span>
              <div className="flex flex-wrap gap-1.5">
                {[...k.members].map((a) => (
                  <AminoAcid key={a} residue={a} size="lg" />
                ))}
              </div>
            </React.Fragment>
          ))}
          <span className="type-label-lg text-muted-foreground">Stop, unknown, gap</span>
          <div className="flex flex-wrap gap-1.5">
            {"*X-".split("").map((a) => (
              <AminoAcid key={a} residue={a} size="lg" />
            ))}
          </div>
        </Preview>
      </Section>

      <Section title="Notation" description='notation="three" shows Trp instead of W. The tile widens; the colors stay.'>
        <Preview className="flex-col items-start gap-4">
          <ProteinSequence sequence="MEEPQSDPSV" groupSize={5} aria-label="One-letter notation" />
          <ProteinSequence sequence="MEEPQSDPSV" groupSize={5} notation="three" aria-label="Three-letter notation" />
        </Preview>
      </Section>

      <Section
        title="Color schemes"
        description="Charge is Nelumbo's own, for reading surfaces: only what carries a charge is colored. Hydrophobicity's strength follows the value. The rest take their schemes' hues at Nelumbo's lightness."
      >
        <Preview className="grid gap-4 sm:grid-cols-[minmax(10rem,auto)_1fr] sm:items-center">
          {AMINO_ACID_SCHEMES.map((s) => (
            <React.Fragment key={s.id}>
              <div>
                <p className="type-title-sm">{s.name}</p>
                <p className="type-body-sm text-muted-foreground">{s.about}</p>
              </div>
              <ProteinSequence sequence="ACDEFGHIKLMNPQRSTVWY" scheme={s.id} groupSize={10} size="sm" aria-label={`${s.name} scheme example`} />
            </React.Fragment>
          ))}
        </Preview>
      </Section>

      <Section
        title="Spacers and positions"
        description='groupSize puts a spacer every n residues, and blocks wrap as a whole. ruler numbers them: "top" puts the first position above each block, "inline" puts the last position in the spacer, as sequence listings print it.'
      >
        <Preview className="block">
          <SpacersDemo />
        </Preview>
      </Section>

      <Section
        title="Highlight"
        description="Residues 18 to 26 of p53, the stretch that binds MDM2, brought forward from the transactivation domain."
      >
        <Preview>
          <ProteinSequence sequence={P53.slice(0, 60)} ruler highlight={[{ start: 18, end: 26 }]} />
        </Preview>
      </Section>

      <Section
        title="Selection"
        description="One keyboard stop, like a chart: drag or Shift-click, arrows and Shift, Escape to clear. The readout names the residue under the pointer or sums up the selection."
      >
        <Preview className="block">
          <SelectionDemo />
        </Preview>
      </Section>

      <Section
        title="Mutations"
        description="AminoAcidChange is one connected shape: the residue it was, a wider neutral segment with the position, and the residue it became. It is announced as one phrase (Arginine 175 to Histidine) and titled in HGVS (p.Arg175His)."
      >
        <Preview className="grid gap-6 sm:grid-cols-[minmax(9rem,auto)_1fr] sm:items-center">
          <span className="type-label-lg text-muted-foreground">Missense</span>
          <div className="flex flex-wrap items-center gap-3">
            <AminoAcidChange from="R" position={175} to="H" />
            <AminoAcidChange from="R" position={248} to="Q" />
            <AminoAcidChange from="R" position={273} to="H" />
            <AminoAcidChange from="Y" position={220} to="C" />
            <AminoAcidChange from="G" position={245} to="S" />
          </div>
          <span className="type-label-lg text-muted-foreground">Nonsense, synonymous</span>
          <div className="flex flex-wrap items-center gap-3">
            <AminoAcidChange from="R" position={213} to="*" />
            <AminoAcidChange from="P" position={72} to="=" />
          </div>
          <span className="type-label-lg text-muted-foreground">Three letters</span>
          <div className="flex flex-wrap items-center gap-3">
            <AminoAcidChange from="R" position={175} to="H" notation="three" />
            <AminoAcidChange from="Y" position={220} to="C" notation="three" />
          </div>
          <span className="type-label-lg text-muted-foreground">Sizes</span>
          <div className="flex flex-wrap items-center gap-4">
            <AminoAcidChange from="R" position={175} to="H" size="sm" />
            <AminoAcidChange from="R" position={175} to="H" />
            <AminoAcidChange from="R" position={175} to="H" size="lg" />
          </div>
        </Preview>
      </Section>

      <Section title="Building blocks" description="Residue is the tile both components are made of: give it any hue for your own scheme.">
        <Preview className="gap-1">
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((hue, i) => (
            <Residue key={hue} tone={{ hue }} label={`Hue ${hue}`}>
              {"NELUMBOLOTUS"[i]}
            </Residue>
          ))}
        </Preview>
      </Section>

      <Section title="Props">
        <PropsTable
          rows={[
            ["AminoAcid residue", "string", "", 'One letter ("W") or three ("Trp"). * is a stop, X unknown, - a gap.'],
            ["scheme", "AminoAcidScheme", '"nelumbo"', "nelumbo, charge, hydrophobicity, clustal, zappo, taylor, okabe-ito, none."],
            ["notation", '"one" | "three"', '"one"', ""],
            ["variant / size", "as Nucleotide", '"tonal" / "default"', ""],
            ["ProteinSequence sequence", "string", "", "Plus every NucleotideSequence prop except complement."],
            ["groupSize", "number", "10", "A spacer every n residues. 0 for none."],
            ["ruler", 'boolean | "top" | "inline"', "false", "true or top: first position above each block. inline: last position in the spacer."],
            ["AminoAcidChange from, to, position", "string, string, number", "", 'to may be "*" (stop) or "=" (synonymous). Announced as one phrase, titled in HGVS.'],
            ["AminoAcidChange notation / size", '"one" | "three", ResidueSize', '"one", "default"', ""],
            ["Residue tone", "{ hue, chroma?, shade? } | null", "", "OKLCH hue; chroma 0 to 1; shade -1 to 1. null is neutral."],
            ["Data", "AMINO_ACIDS, AMINO_ACID_KINDS, HYDROPATHY, fromThree, aminoAcidTone", "", "Names, three-letter codes, kinds and Kyte-Doolittle values."],
          ]}
        />
      </Section>
    </>
  )
}

function SelectionDemo() {
  const [selection, setSelection] = React.useState<ResidueRange | null>({ start: 18, end: 26 })
  const [active, setActive] = React.useState<number | null>(null)
  const pick = selection ? P53.slice(selection.start - 1, selection.end) : ""
  const mean = pick ? [...pick].reduce((s, a) => s + (HYDROPATHY[a] ?? 0), 0) / pick.length : 0
  const charge = [...pick].reduce((s, a) => s + ("KR".includes(a) ? 1 : "DE".includes(a) ? -1 : 0), 0)
  return (
    <div className="grid gap-6">
      {active != null ? (
        <ChartReadout value={AMINO_ACIDS[P53[active - 1]].three} unit={AMINO_ACIDS[P53[active - 1]].name} label={`Residue ${active}`} />
      ) : selection ? (
        <ChartReadout
          value={pick.length}
          unit={pick.length === 1 ? "residue" : "residues"}
          label={`Residues ${selection.start} to ${selection.end}`}
          detail={
            <span className="type-body-sm text-muted-foreground">
              Net charge {charge > 0 ? `+${charge}` : charge}, mean hydropathy {mean.toFixed(1)}
            </span>
          }
          onClear={() => setSelection(null)}
          clearLabel="Clear selection"
        />
      ) : (
        <ChartReadout value={P53.length} unit="residues" label="p53, residues 1 to 120" />
      )}
      <ProteinSequence
        sequence={P53}
        ruler
        selectable
        selection={selection}
        onSelectionChange={setSelection}
        onActiveChange={setActive}
        aria-label="p53, residues 1 to 120"
      />
    </div>
  )
}

const SPACINGS = [
  { value: "5", label: "Every 5" },
  { value: "10", label: "Every 10" },
  { value: "20", label: "Every 20" },
  { value: "0", label: "No spacers" },
]
const RULERS = [
  { value: "inline", label: "Inline" },
  { value: "top", label: "Top" },
  { value: "off", label: "Off" },
]

function SpacersDemo() {
  const [spacing, setSpacing] = React.useState("10")
  const [ruler, setRuler] = React.useState("inline")
  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap gap-x-8 gap-y-4">
        <div className="grid gap-2">
          <span id="spacing-label" className="type-label-md text-muted-foreground">
            Spacer
          </span>
          <ToggleGroup type="single" value={spacing} onValueChange={(v) => v && setSpacing(v)} aria-labelledby="spacing-label">
            {SPACINGS.map((o) => (
              <ToggleGroupItem key={o.value} value={o.value} aria-label={o.label}>
                {o.value === "0" ? "None" : o.value}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
        <div className="grid gap-2">
          <span id="ruler-label" className="type-label-md text-muted-foreground">
            Positions
          </span>
          <ToggleGroup type="single" value={ruler} onValueChange={(v) => v && setRuler(v)} aria-labelledby="ruler-label">
            {RULERS.map((o) => (
              <ToggleGroupItem key={o.value} value={o.value}>
                {o.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      </div>
      <ProteinSequence
        sequence={P53.slice(0, 80)}
        groupSize={Number(spacing)}
        ruler={ruler === "off" ? false : (ruler as "top" | "inline")}
        aria-label="p53, residues 1 to 80"
      />
    </div>
  )
}
