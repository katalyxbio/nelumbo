"use client"

import * as React from "react"
import { Gel, ENZYMES, digest, type GelFocus, type GelLane } from "@/registry/nelumbo/ui/gel"
import { parseGenBank } from "@/registry/nelumbo/ui/plasmid-map"
import { ChartReadout } from "@/registry/nelumbo/ui/chart"
import { SegmentedButton, SegmentedButtonItem } from "@/registry/nelumbo/ui/segmented-button"
import { ChipGroup, FilterChip } from "@/registry/nelumbo/ui/chip"
import { Code, PageHeader, Preview, PropsTable, Section } from "@/components/docs/primitives"
import { PGL3_GENBANK } from "../construct-map/data"

const PGL3 = parseGenBank(PGL3_GENBANK)
const cut = (...names: string[]) => digest(PGL3.sequence, Object.fromEntries(names.map((n) => [n, ENZYMES[n]])), { circular: true })

const DIGESTS: GelLane[] = [
  { label: "Ladder", ladder: "1kb" },
  { label: "HindIII", bands: cut("HindIII") },
  { label: "HindIII + XbaI", bands: cut("HindIII", "XbaI") },
  { label: "NcoI + BamHI", bands: cut("NcoI", "BamHI") },
  { label: "XbaI + NotI", bands: cut("XbaI", "NotI") },
  { label: "DraI", bands: cut("DraI") },
  { label: "Uncut", bands: cut() },
]

const PICKABLE = ["HindIII", "XbaI", "BamHI", "NcoI", "NotI", "SalI", "KpnI", "ScaI", "SspI", "DraI"]

export default function GelPage() {
  return (
    <>
      <PageHeader eyebrow="Component 80" title="Gel">
        An agarose gel: wells along the top, a ladder, and lanes of bands placed the way DNA runs, by the log of its
        length, each as bright as the DNA in it. Lanes can come straight from a restriction digest of a sequence.
      </PageHeader>

      <Section title="Install">
        <Code>{`npx shadcn@latest add @nelumbo/gel`}</Code>
      </Section>

      <Section
        title="A digest"
        description="pGL3-Basic (4,818 bp) cut with single and double digests, the fragments computed from its sequence by digest. One cut linearizes it; two give two bands that add up to the whole; DraI cuts four times, its 19 bp piece run off the end. Uncut, it runs as plasmid does: a supercoiled band ahead of its size and a fainter nicked one behind. The fragments of a digest are equimolar, so shorter ones are fainter. Hover a band for where it came from."
      >
        <Preview className="block">
          <Gel lanes={DIGESTS} />
        </Preview>
      </Section>

      <Section
        title="Plan a digest"
        description="Pick enzymes and the agarose: the lane updates as the fragments would run. Higher percentages pull small fragments apart and crowd large ones near the wells."
      >
        <Preview className="block">
          <PlanDemo />
        </Preview>
      </Section>

      <Section
        title="Appearance"
        description='"auto" follows the theme: dark bands on a light gel, as a scan prints it, and a UV-lit gel in dark mode. Set "uv" or "scan" to keep one.'
      >
        <Preview className="grid gap-8 sm:grid-cols-2">
          <Gel lanes={DIGESTS.slice(0, 4)} appearance="uv" height={240} aria-label="UV gel" />
          <Gel lanes={DIGESTS.slice(0, 4)} appearance="scan" height={240} aria-label="Scanned gel" />
        </Preview>
      </Section>

      <Section title="Props">
        <PropsTable
          rows={[
            ["lanes", "GelLane[]", "", "label, and bands (size, mass, label, description) or a ladder preset."],
            ["percent", "number", "1", "Agarose percentage, 0.5 to 3: the size range the gel resolves."],
            ["height", "number", "320", "The slab's height in px."],
            ["appearance", '"auto" | "uv" | "scan"', '"auto"', "Glowing bands on dark, or dark bands on light."],
            ["sizes", "boolean", "true", "The ladder's sizes down the left."],
            ["selectable / onActiveChange", "boolean, (focus | null) => void", "false", "A keyboard stop: up and down a lane, left and right across lanes."],
            ["Helpers", "digest, migration, ENZYMES, LADDERS", "", "Fragments of a digest, linear or circular; where a size runs; common enzymes and ladders."],
          ]}
        />
      </Section>
    </>
  )
}

function PlanDemo() {
  const [picked, setPicked] = React.useState<string[]>(["HindIII", "XbaI"])
  const [percent, setPercent] = React.useState("1")
  const [focus, setFocus] = React.useState<GelFocus>(null)
  const bands = picked.length ? cut(...picked) : []
  const lanes: GelLane[] = [
    { label: "1 kb", ladder: "1kb" },
    { label: picked.join(" + ") || "Uncut", bands },
    { label: "100 bp", ladder: "100bp" },
  ]
  return (
    <div className="grid gap-6">
      <div className="grid gap-3">
        <ChipGroup aria-label="Enzymes">
          {PICKABLE.map((e) => (
            <FilterChip key={e} selected={picked.includes(e)} onSelectedChange={(on) => setPicked(on ? [...picked, e] : picked.filter((p) => p !== e))}>
              {e}
            </FilterChip>
          ))}
        </ChipGroup>
        <SegmentedButton type="single" size="sm" value={percent} onValueChange={(v) => v && setPercent(v)} aria-label="Agarose">
          {["0.7", "1", "1.5", "2"].map((p) => (
            <SegmentedButtonItem key={p} value={p}>
              {`${p}%`}
            </SegmentedButtonItem>
          ))}
        </SegmentedButton>
      </div>
      <div className="grid items-start gap-6 sm:grid-cols-[minmax(0,16rem)_1fr]">
        <Gel lanes={lanes} percent={Number(percent)} selectable onActiveChange={setFocus} height={300} aria-label="Planned digest" />
        <div className="min-h-[4.5rem]">
          {focus ? (
            <ChartReadout value={focus.data.size.toLocaleString("en-US")} unit="bp" label={lanes[focus.lane].label} detail={focus.data.description && <span className="type-body-sm text-muted-foreground">{focus.data.description}</span>} />
          ) : (
            <ChartReadout
              value={bands.length || (picked.length ? "None" : "–")}
              unit={bands.length ? (bands.length === 1 ? "fragment" : "fragments") : undefined}
              label={picked.length ? `pGL3-Basic with ${picked.join(" and ")}` : "Pick an enzyme"}
              detail={<span className="type-body-sm text-muted-foreground tabular-nums">{bands.map((b) => b.size.toLocaleString("en-US")).join(", ")}</span>}
            />
          )}
        </div>
      </div>
    </div>
  )
}
