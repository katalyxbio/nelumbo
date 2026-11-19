"use client"

import * as React from "react"
import { ProteinStructure, type ProteinColorBy, type ProteinRepresentation } from "@/registry/nelumbo/ui/protein-structure"
import { FilterChip } from "@/registry/nelumbo/ui/chip"
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

const REPRESENTATIONS: { value: ProteinRepresentation; label: string }[] = [
  { value: "cartoon", label: "Cartoon" },
  { value: "tube", label: "Tube" },
  { value: "trace", label: "Trace" },
  { value: "ball-and-stick", label: "Ball and stick" },
  { value: "spacefill", label: "Spacefill" },
  { value: "surface", label: "Surface" },
]

function Explorer() {
  const [rep, setRep] = React.useState<ProteinRepresentation>("cartoon")
  const [mode, setMode] = React.useState<ProteinColorBy>("structure")
  const [outline, setOutline] = React.useState("black")
  return (
    <div className="flex min-w-0 flex-col gap-4">
      <div role="group" aria-label="Representation" className="flex flex-wrap gap-2">
        {REPRESENTATIONS.map((r) => (
          <FilterChip key={r.value} selected={rep === r.value} onSelectedChange={() => setRep(r.value)}>
            {r.label}
          </FilterChip>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <SegmentedButton type="single" size="sm" value={mode} onValueChange={(v) => v && setMode(v as ProteinColorBy)} aria-label="Color by">
          <SegmentedButtonItem value="structure">Structure</SegmentedButtonItem>
          <SegmentedButtonItem value="rainbow">N to C</SegmentedButtonItem>
          <SegmentedButtonItem value="plain">Plain</SegmentedButtonItem>
        </SegmentedButton>
        <SegmentedButton type="single" size="sm" value={outline} onValueChange={(v) => v && setOutline(v)} aria-label="Outline">
          <SegmentedButtonItem value="black">Black outline</SegmentedButtonItem>
          <SegmentedButtonItem value="background">Gap</SegmentedButtonItem>
          <SegmentedButtonItem value="none">None</SegmentedButtonItem>
        </SegmentedButton>
      </div>
      <ProteinStructure
        residues={UBIQUITIN}
        representation={rep}
        colorBy={mode}
        outline={outline}
        label="Ubiquitin, PDB 1UBQ"
        highlight={[
          { residue: 48, label: "K48" },
          { residue: 63, label: "K63" },
        ]}
      />
    </div>
  )
}

export default function ProteinStructurePage() {
  return (
    <>
      <PageHeader eyebrow="Component 86" title="Protein Structure">
        A 3D protein viewer you can turn, zoom and point at: cartoon, tube, trace, ball and stick, spacefill or a
        molecular surface. It renders on the GPU with Mol*, loaded only when a structure is on screen, and falls back
        to a built-in canvas renderer while Mol* loads or where WebGL isn&apos;t available.
      </PageHeader>

      <Section title="Install">
        <Code>{`npx shadcn@latest add @nelumbo/protein-structure`}</Code>
      </Section>

      <Section
        title="Ubiquitin"
        description="The cartoon view: helices as ribbons, strands as arrows, loops as tubes, with a black outline. K48 and K63, the lysines that chain ubiquitins together for degradation and for signalling, show their side chains. Drag to turn it."
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

      <Section
        title="Representations and outline"
        description="Cartoon, tube and trace follow the backbone. Ball and stick, spacefill and surface draw every atom when the data has them, with nitrogen, oxygen and sulfur in their usual colors. The outline is black by default; a gap in the background color, none, or any CSS color also work."
      >
        <Preview className="block">
          <Explorer />
        </Preview>
      </Section>

      <Section title="Linked to the sequence" description="hovered and onHoveredChange let a sequence view and the structure follow each other.">
        <Preview className="block">
          <Linked />
        </Preview>
      </Section>


      <Section
        title="Large structures from a file"
        description="Pass url and format to load a PDB, mmCIF or BinaryCIF file straight into Mol*: every chain, thousands of atoms, still smooth to turn. This is human hemoglobin, PDB 4HHB, four chains around their heme groups."
      >
        <Preview className="block">
          <ProteinStructure url="https://files.rcsb.org/download/4HHB.cif" format="mmcif" representation="cartoon" colorBy="rainbow" label="Hemoglobin, PDB 4HHB" />
        </Preview>
        <Code>{`<ProteinStructure url="https://files.rcsb.org/download/4HHB.cif" format="mmcif" />`}</Code>
      </Section>

      <Section
        title="Engines"
        description='engine "molstar" (the default) draws with WebGL and handles big structures, true molecular surfaces and every chain. engine "canvas" is the built-in renderer: no WebGL and no extra download, for small proteins, thumbnails and places where the GPU is busy. Both take the same props.'
      >
        <div className="grid min-w-0 gap-4 lg:grid-cols-2">
          <Preview label="molstar" className="block">
            <ProteinStructure residues={UBIQUITIN} representation="surface" label="Ubiquitin surface, Mol*" legend={false} />
          </Preview>
          <Preview label="canvas" className="block">
            <ProteinStructure residues={UBIQUITIN} representation="surface" engine="canvas" label="Ubiquitin surface, canvas" legend={false} />
          </Preview>
        </div>
      </Section>

      <Section title="From a PDB file" description="parsePdb reads the first chain's heavy atoms, HELIX and SHEET records and, for AlphaFold models, the pLDDT stored in the B-factor column.">
        <Code>{`import { ProteinStructure, parsePdb } from "@/components/ui/protein-structure"

const text = await fetch("https://files.rcsb.org/download/1UBQ.pdb").then((r) => r.text())
<ProteinStructure residues={parsePdb(text)} highlight={[{ residue: 48, label: "K48" }]} />

// AlphaFold models keep pLDDT in the B-factor column
<ProteinStructure residues={parsePdb(afText, { plddt: true })} colorBy="plddt" />`}</Code>
      </Section>

      <Section title="Props">
        <PropsTable
          rows={[
            ["residues", "ProteinResidue[]", "—", "C-alpha { x, y, z } in Å, with optional aa, ss (H, E, C), plddt and atoms."],
            ["url", "string", "—", "A structure file to load instead of residues."],
            ["format", '"pdb" | "mmcif" | "bcif"', '"pdb"', "The file format at url."],
            ["engine", '"molstar" | "canvas"', '"molstar"', "GPU rendering with Mol*, or the built-in canvas renderer."],
            ["representation", '"cartoon" | "tube" | "trace" | "ball-and-stick" | "spacefill" | "surface"', '"cartoon"', "How the protein is drawn."],
            ["outline", '"black" | "background" | "none" | string', '"black"', "Outline color; background draws a gap."],
            ["colorBy", '"structure" | "plddt" | "rainbow" | "plain"', '"structure"', "What the color shows."],
            ["highlight", "{ residue, label? }[]", "[]", "Residues marked with a label; with atoms, their side chains show as ball and stick."],
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
