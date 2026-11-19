"use client"

import * as React from "react"
import { ProteinStructure, type ProteinColorBy, type ProteinRepresentation } from "@/registry/nelumbo/ui/protein-structure"
import { FilterChip, InputChip } from "@/registry/nelumbo/ui/chip"
import { Button } from "@/registry/nelumbo/ui/button"
import { SegmentedButton, SegmentedButtonItem } from "@/registry/nelumbo/ui/segmented-button"
import { cn } from "@/lib/utils"
import { Code, PageHeader, Preview, PropsTable, Section } from "@/components/docs/primitives"
import { SUMO1, UBIQUITIN } from "./data"

const SS_TINT = { H: "bg-brand-container text-brand-container-foreground", E: "bg-warning-container text-warning-container-foreground", C: "" }

const THREE: Record<string, string> = {
  A: "Ala", R: "Arg", N: "Asn", D: "Asp", C: "Cys", Q: "Gln", E: "Glu", G: "Gly", H: "His", I: "Ile",
  L: "Leu", K: "Lys", M: "Met", F: "Phe", P: "Pro", S: "Ser", T: "Thr", W: "Trp", Y: "Tyr", V: "Val",
}

function Linked() {
  const [hovered, setHovered] = React.useState<number | null>(null)
  const [selected, setSelected] = React.useState<number[]>([48, 63])
  const anchor = React.useRef<number | null>(null)

  // click toggles one residue; shift-click selects the run from the last one clicked
  const pick = (n: number, range: boolean) => {
    if (range && anchor.current != null) {
      const [a, b] = [Math.min(anchor.current, n), Math.max(anchor.current, n)]
      const run = Array.from({ length: b - a + 1 }, (_, k) => a + k)
      setSelected((s) => [...new Set([...s, ...run])].sort((x, y) => x - y))
    } else {
      setSelected((s) => (s.includes(n) ? s.filter((x) => x !== n) : [...s, n].sort((x, y) => x - y)))
    }
    anchor.current = n
  }

  return (
    <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <ProteinStructure
        residues={UBIQUITIN}
        label="Ubiquitin, PDB 1UBQ"
        hovered={hovered}
        onHoveredChange={setHovered}
        selected={selected}
        onSelectedChange={setSelected}
        legend={false}
      />
      <div className="flex min-w-0 flex-col gap-3">
        <p className="type-label-md text-muted-foreground">Ubiquitin sequence, 76 residues</p>
        <div
          role="group"
          aria-label="Ubiquitin sequence. Press a residue to select it; shift selects a run."
          className="grid grid-cols-[repeat(10,minmax(0,1fr))] gap-0.5 font-mono type-body-md"
          onPointerLeave={() => setHovered(null)}
        >
          {UBIQUITIN.map((r, i) => {
            const n = i + 1
            const on = selected.includes(n)
            return (
              <button
                key={i}
                type="button"
                aria-label={`${THREE[r.aa ?? ""] ?? r.aa} ${n}, ${r.aa}${n}`}
                aria-pressed={on}
                onPointerEnter={() => setHovered(n)}
                onFocus={() => setHovered(n)}
                onBlur={() => setHovered(null)}
                onClick={(e) => pick(n, e.shiftKey)}
                className={cn(
                  "relative grid h-8 place-items-center rounded-md outline-none transition-colors focus-visible:outline-2 focus-visible:outline-ring",
                  SS_TINT[r.ss ?? "C"],
                  hovered === n && !on && "bg-surface-container-highest text-foreground",
                  on && "bg-inverse-surface font-semibold text-inverse-foreground"
                )}
              >
                {r.aa}
                {n % 10 === 0 && (
                  <span aria-hidden className={cn("absolute -top-0.5 right-0.5 text-[0.5625rem] leading-none", on ? "text-inverse-foreground/70" : "text-muted-foreground")}>
                    {n}
                  </span>
                )}
              </button>
            )
          })}
        </div>
        <div className="flex min-h-9 flex-wrap items-center gap-2" aria-live="polite">
          {selected.length === 0 ? (
            <span className="type-body-sm text-muted-foreground">No residues selected.</span>
          ) : (
            <>
              {selected.map((n) => (
                <InputChip key={n} onRemove={() => setSelected((s) => s.filter((x) => x !== n))} removeLabel={`Deselect ${THREE[UBIQUITIN[n - 1].aa ?? ""]} ${n}`}>
                  {`${UBIQUITIN[n - 1].aa}${n}`}
                </InputChip>
              ))}
              <Button size="sm" variant="ghost" onClick={() => setSelected([])}>
                Clear
              </Button>
            </>
          )}
        </div>
        <p className="type-body-sm text-muted-foreground">
          Press letters to select residues, or shift-press to select a run; click residues in the structure to add or
          remove them there. Selected residues show their side chains. Hovering either side lights up the other.
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
  const [shading, setShading] = React.useState<"flat" | "lit">("flat")
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
        <SegmentedButton type="single" size="sm" value={shading} onValueChange={(v) => v && setShading(v as "flat" | "lit")} aria-label="Shading">
          <SegmentedButtonItem value="flat">Flat</SegmentedButtonItem>
          <SegmentedButtonItem value="lit">Lit</SegmentedButtonItem>
        </SegmentedButton>
      </div>
      <ProteinStructure
        residues={UBIQUITIN}
        representation={rep}
        colorBy={mode}
        outline={outline}
        shading={shading}
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
        molecular surface. It renders on the GPU with Mol*, loaded only when a structure is on screen, so pages without
        one stay light.
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
        description="Cartoon, tube and trace follow the backbone. Ball and stick, spacefill and surface draw every atom when the data has them, with nitrogen, oxygen and sulfur in their usual colors. Shading is flat by default, plain colors with a bolder black outline and no shadows; lit adds lighting and ambient occlusion. The outline can also be a gap in the background color, none, or any CSS color."
      >
        <Preview className="block">
          <Explorer />
        </Preview>
      </Section>

      <Section
        title="Linked to the sequence"
        description="hovered and selected pair a sequence view with the structure. Select residues in either place; the other follows."
      >
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
            ["representation", '"cartoon" | "tube" | "trace" | "ball-and-stick" | "spacefill" | "surface"', '"cartoon"', "How the protein is drawn."],
            ["outline", '"black" | "background" | "none" | string', '"black"', "Outline color; background draws a gap."],
            ["shading", '"flat" | "lit"', '"flat"', "Flat colors with a bolder outline, or lighting and shadows."],
            ["colorBy", '"structure" | "plddt" | "rainbow" | "plain"', '"structure"', "What the color shows."],
            ["highlight", "{ residue, label? }[]", "[]", "Residues marked with a label; with atoms, their side chains show as ball and stick."],
            ["hovered", "number | null", "—", "The residue under the pointer, when controlled."],
            ["onHoveredChange", "(residue) => void", "—", "Called as the pointer moves over residues."],
            ["selected", "number[]", "—", "Selected residues, when controlled. Outlined, with side chains shown."],
            ["defaultSelected", "number[]", "[]", "Selected residues to start with, when uncontrolled."],
            ["onSelectedChange", "(residues) => void", "—", "Called when a click in 3D adds or removes a residue."],
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
