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

      <Section title="Substitutions" description="AminoAcidChange draws a missense change, and is announced as one: Arginine 175 to Histidine.">
        <Preview className="flex-col items-start gap-5">
          <div className="flex flex-wrap items-center gap-6">
            <AminoAcidChange from="R" position={175} to="H" />
            <AminoAcidChange from="R" position={248} to="Q" />
            <AminoAcidChange from="R" position={273} to="H" />
            <AminoAcidChange from="Y" position={220} to="C" />
          </div>
          <AminoAcidChange from="G" position={245} to="S" size="lg" />
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
            ["AminoAcidChange from, to, position", "string, string, number", "", "Announced as one phrase."],
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
