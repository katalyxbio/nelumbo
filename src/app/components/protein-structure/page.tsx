"use client"

import * as React from "react"
import { ProteinStructure, type ProteinColorBy } from "@/registry/nelumbo/ui/protein-structure"
import { SegmentedButton, SegmentedButtonItem } from "@/registry/nelumbo/ui/segmented-button"
import { cn } from "@/lib/utils"
import { Code, PageHeader, Preview, PropsTable, Section } from "@/components/docs/primitives"
import { SUMO1, UBIQUITIN } from "./data"

const SS_TINT = { H: "bg-brand-container text-brand-container-foreground", E: "bg-warning-container text-warning-container-foreground", C: "" }

function Linked() {
  const [hovered, setHovered] = React.useState<number | null>(null)
  return (
    <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <ProteinStructure
        residues={UBIQUITIN}
        label="Ubiquitin, PDB 1UBQ"
        hovered={hovered}
        onHoveredChange={setHovered}
        legend={false}
        controls={false}
      />
      <div className="flex min-w-0 flex-col gap-3">
        <p className="type-label-md text-muted-foreground">Ubiquitin sequence, 76 residues</p>
        <div
          role="group"
          aria-label="Ubiquitin sequence"
          className="grid grid-cols-[repeat(10,minmax(0,1fr))] gap-0.5 font-mono type-body-md"
          onPointerLeave={() => setHovered(null)}
        >
          {UBIQUITIN.map((r, i) => (
            <button
              key={i}
              type="button"
              aria-label={`${r.aa}${i + 1}`}
              onPointerEnter={() => setHovered(i + 1)}
              onFocus={() => setHovered(i + 1)}
              onBlur={() => setHovered(null)}
              className={cn(
                "relative grid h-8 place-items-center rounded-md outline-none transition-colors focus-visible:outline-2 focus-visible:outline-ring",
                SS_TINT[r.ss ?? "C"],
                hovered === i + 1 && "bg-inverse-surface text-inverse-foreground"
              )}
            >
              {r.aa}
              {(i + 1) % 10 === 0 && (
                <span aria-hidden className="absolute -top-0.5 right-0.5 text-[0.5625rem] leading-none text-muted-foreground">
                  {i + 1}
                </span>
              )}
            </button>
          ))}
        </div>
        <p className="type-body-sm text-muted-foreground">
          Hover or tab through the sequence and the residue lights up in the structure; hover the structure and the
          letter lights up here. Tinted letters are helix and strand.
        </p>
      </div>
    </div>
  )
}

function ColorModes() {
  const [mode, setMode] = React.useState<ProteinColorBy>("structure")
  return (
    <div className="flex min-w-0 flex-col gap-4">
      <SegmentedButton type="single" size="sm" value={mode} onValueChange={(v) => v && setMode(v as ProteinColorBy)} aria-label="Color by">
        <SegmentedButtonItem value="structure">Structure</SegmentedButtonItem>
        <SegmentedButtonItem value="rainbow">N to C</SegmentedButtonItem>
        <SegmentedButtonItem value="plain">Plain</SegmentedButtonItem>
      </SegmentedButton>
      <ProteinStructure residues={UBIQUITIN} colorBy={mode} label="Ubiquitin, PDB 1UBQ" className="max-w-xl" />
    </div>
  )
}

export default function ProteinStructurePage() {
  return (
    <>
      <PageHeader eyebrow="Component 86" title="Protein Structure">
        A 3D view of a protein backbone: a shaded tube through the C-alpha atoms that you can turn, zoom and point at.
        It reads a PDB file or plain coordinates and needs no 3D library, so it loads as fast as a chart.
      </PageHeader>

      <Section title="Install">
        <Code>{`npx shadcn@latest add @nelumbo/protein-structure`}</Code>
      </Section>

      <Section
        title="Ubiquitin"
        description="Colored by secondary structure, with the tube thicker through helices and strands. K48 and K63, the lysines that chain ubiquitins together for degradation and for signalling, are marked. Drag to turn it."
      >
        <Preview className="block">
          <ProteinStructure
            residues={UBIQUITIN}
            label="Ubiquitin, PDB 1UBQ"
            spin
            highlight={[
              { residue: 48, label: "K48" },
              { residue: 63, label: "K63" },
            ]}
          />
        </Preview>
      </Section>

      <Section
        title="AlphaFold confidence"
        description="colorBy plddt uses AlphaFold's four confidence bands in their standard colors, so the view matches the AlphaFold database. SUMO1's ubiquitin-like core is confident; its first twenty residues and the C-terminal tail are not, and that is where the model is least reliable."
      >
        <Preview className="block">
          <ProteinStructure residues={SUMO1} colorBy="plddt" label="SUMO1, AlphaFold model AF-P63165-F1" />
        </Preview>
      </Section>

      <Section title="Linked to the sequence" description="hovered and onHoveredChange let a sequence view and the structure follow each other.">
        <Preview className="block">
          <Linked />
        </Preview>
      </Section>

      <Section title="Color modes" description="Structure for folds, N to C for following the chain, plain when another layer carries the color.">
        <Preview className="block">
          <ColorModes />
        </Preview>
      </Section>

      <Section title="From a PDB file" description="parsePdb reads the first chain's C-alpha atoms, HELIX and SHEET records and, for AlphaFold models, the pLDDT stored in the B-factor column.">
        <Code>{`import { ProteinStructure, parsePdb } from "@/components/ui/protein-structure"

const text = await fetch("https://files.rcsb.org/download/1UBQ.pdb").then((r) => r.text())
<ProteinStructure residues={parsePdb(text)} highlight={[{ residue: 48, label: "K48" }]} />

// AlphaFold models keep pLDDT in the B-factor column
<ProteinStructure residues={parsePdb(afText, { plddt: true })} colorBy="plddt" />`}</Code>
      </Section>

      <Section title="Props">
        <PropsTable
          rows={[
            ["residues", "ProteinResidue[]", "—", "{ x, y, z } in Å, with optional aa, ss (H, E, C) and plddt."],
            ["colorBy", '"structure" | "plddt" | "rainbow" | "plain"', '"structure"', "What the color shows."],
            ["highlight", "{ residue, label? }[]", "[]", "Residues marked with a sphere and a label."],
            ["hovered", "number | null", "—", "The residue under the pointer, when controlled."],
            ["onHoveredChange", "(residue) => void", "—", "Called as the pointer moves over residues."],
            ["firstResidue", "number", "1", "Number of the first residue, for labels."],
            ["spin", "boolean", "false", "Turns slowly until someone drags it. Off with reduced motion."],
            ["controls", "boolean", "true", "Turn, zoom and reset buttons."],
            ["legend", "boolean", "true", "What the colors mean."],
            ["label", "string", '"Protein structure"', "Accessible name."],
          ]}
        />
      </Section>
    </>
  )
}
