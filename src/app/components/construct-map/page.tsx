"use client"

import * as React from "react"
import { ConstructMap, sliceConstruct, type ConstructFocus, type ConstructRange } from "@/registry/nelumbo/ui/construct-map"
import { PlasmidMap, parseGenBank, uniqueSites } from "@/registry/nelumbo/ui/plasmid-map"
import { ToggleGroup, ToggleGroupItem } from "@/registry/nelumbo/ui/toggle-group"
import { Textarea } from "@/registry/nelumbo/ui/textarea"
import { Button } from "@/registry/nelumbo/ui/button"
import { ChartReadout } from "@/registry/nelumbo/ui/chart"
import { Code, PageHeader, Preview, PropsTable, Section } from "@/components/docs/primitives"
import { ENZYMES, PGL3_GENBANK } from "./data"

const PGL3 = parseGenBank(PGL3_GENBANK)
const SITES = uniqueSites(PGL3.sequence, ENZYMES)
const PGL3_NAME = "pGL3-Basic"

// The amplicon of RV primer3 (forward, 4,760) and GL primer2 (reverse, ends at 111): it crosses the origin.
const primer = (name: string) => PGL3.features.find((f) => f.name === name)!
const AMPLICON = sliceConstruct(PGL3, primer("RV primer3").start, primer("GL primer2").end)

export default function ConstructMapPage() {
  return (
    <>
      <PageHeader eyebrow="Component 76" title="Construct Map">
        The plasmid map unrolled into a line, for inserts, guides and PCR products. It takes the same features as Plasmid
        Map, so a parsed GenBank file renders either way, and zooms down to both strands of the sequence.
      </PageHeader>

      <Section title="Install">
        <Code>{`npx shadcn@latest add @nelumbo/construct-map`}</Code>
      </Section>

      <Section
        title="A construct"
        description="pGL3-Basic, straight from its GenBank record (U47295) through parseGenBank, with its single cutters found by uniqueSites. Forward features ride above the backbone and reverse ones below; a name goes inside its bar, beside it, or up in a label row. Drag across the map to select a stretch: the bar above reads out its length and GC."
      >
        <Preview className="block">
          <ConstructMap name={PGL3_NAME} length={PGL3.length} features={PGL3.features} sites={SITES} sequence={PGL3.sequence} circular />
        </Preview>
      </Section>

      <Section
        title="Zoom"
        description="Double-click a feature, use the buttons, or hold Ctrl or ⌘ and scroll. Zoomed in far enough, the backbone becomes both strands, colored as Nucleotide colors them, and coding features show their amino acids under each codon. The overview below drags the window. This one opens on the start of luc+."
      >
        <Preview className="block">
          <ConstructMap
            name={PGL3_NAME}
            length={PGL3.length}
            features={PGL3.features}
            sites={SITES}
            sequence={PGL3.sequence}
            circular
            defaultView={{ start: 64, end: 136 }}
          />
        </Preview>
      </Section>

      <Section
        title="Circle or line"
        description="One record, two views: the features, sites and selection carry over."
      >
        <Preview className="block">
          <BothDemo />
        </Preview>
      </Section>

      <Section
        title="A PCR product"
        description="sliceConstruct cuts a stretch out as its own construct, features clipped and renumbered. RV primer3 and GL primer2 amplify 170 bp across pGL3's origin: the primers at each end, the poly(A) signal and the start of luc+ between them."
      >
        <Preview className="block">
          <ConstructMap name="RV primer3 to GL primer2" length={AMPLICON.length} features={AMPLICON.features} sites={AMPLICON.sites} sequence={AMPLICON.sequence} />
        </Preview>
      </Section>

      <Section
        title="From a GenBank file"
        description="Paste a record or open a .gb file. Circular records open as a plasmid, linear ones as a line."
      >
        <Preview className="block">
          <GenBankDemo />
        </Preview>
      </Section>

      <Section
        title="Selection"
        description="selectable adds a keyboard stop, like a chart: arrows go feature to feature, Enter zooms to it, + and − zoom, 0 shows everything, Escape clears."
      >
        <Preview className="block">
          <SelectionDemo />
        </Preview>
      </Section>

      <Section title="Props">
        <PropsTable
          rows={[
            ["name, length", "string, number", "", "Shown above the map."],
            ["features", "PlasmidFeature[]", "", "start, end, name, strand, kind, color, description, segments, codonStart: the same as Plasmid Map."],
            ["sites", "PlasmidSite[]", "", "position, name: ticks across the backbone, names along the top."],
            ["sequence", "string", "", "For both strands and amino acids when zoomed in, and the selection's GC."],
            ["circular", "boolean", "false", "Features may cross the origin; they show at both ends."],
            ["scheme", "NucleotideScheme", '"nelumbo"', "The bases' colors at full zoom."],
            ["ruler / zoomable", "boolean", "true", "Base numbers; zoom controls, wheel zoom and the overview."],
            ["view / onViewChange", "{ start, end }", "everything", "The visible stretch. Controlled or not (defaultView)."],
            ["selection / onSelectionChange", "{ start, end } | null", "", "A selected stretch, by drag or by clicking a feature. Controlled or not (defaultSelection)."],
            ["selectable", "boolean", "false", "A keyboard stop: arrows, Enter, + and −, 0, Escape."],
            ["onActiveChange", "({ feature, length } | null) => void", "", "The feature under the pointer or cursor."],
            ["parseGenBank", "(text) => GenBankRecord", "", "name, length, topology, molecule, definition, accession, features, sequence. From Plasmid Map."],
            ["sliceConstruct", "(construct, start, end) => construct", "", "A stretch as its own construct; may cross the origin."],
          ]}
        />
      </Section>
    </>
  )
}

function BothDemo() {
  const [shape, setShape] = React.useState("line")
  return (
    <div className="grid gap-6">
      <ToggleGroup type="single" value={shape} onValueChange={(v) => v && setShape(v)} aria-label="View" className="w-fit">
        <ToggleGroupItem value="circle">Circle</ToggleGroupItem>
        <ToggleGroupItem value="line">Line</ToggleGroupItem>
      </ToggleGroup>
      {shape === "circle" ? (
        <PlasmidMap name={PGL3_NAME} length={PGL3.length} features={PGL3.features} sites={SITES} selectable />
      ) : (
        <ConstructMap name={PGL3_NAME} length={PGL3.length} features={PGL3.features} sites={SITES} sequence={PGL3.sequence} circular />
      )}
    </div>
  )
}

function GenBankDemo() {
  const [text, setText] = React.useState(PGL3_GENBANK)
  const file = React.useRef<HTMLInputElement>(null)
  const record = React.useMemo(() => {
    try {
      const r = parseGenBank(text)
      return r.length > 0 ? r : null
    } catch {
      return null
    }
  }, [text])
  const sites = React.useMemo(() => (record?.sequence ? uniqueSites(record.sequence, ENZYMES) : []), [record])
  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-6">
      <div className="grid grid-cols-[minmax(0,1fr)] gap-3">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          aria-label="GenBank record"
          spellCheck={false}
          className="h-40 font-mono text-[0.75rem] leading-snug"
        />
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => file.current?.click()}>
            Open a .gb file
          </Button>
          <input
            ref={file}
            type="file"
            accept=".gb,.gbk,.genbank,.ape,.txt"
            className="hidden"
            aria-label="GenBank file"
            onChange={async (e) => {
              const f = e.target.files?.[0]
              if (f) setText(await f.text())
              e.target.value = ""
            }}
          />
          <span className="type-body-sm text-muted-foreground">
            {record
              ? `${record.definition || record.name}: ${record.length.toLocaleString("en-US")} bp, ${record.topology}, ${record.features.length} features`
              : "No LOCUS line found yet"}
          </span>
        </div>
      </div>
      {record &&
        (record.topology === "circular" ? (
          <PlasmidMap name={record.name} length={record.length} features={record.features} sites={sites} />
        ) : (
          <ConstructMap name={record.name} length={record.length} features={record.features} sites={sites} sequence={record.sequence} />
        ))}
    </div>
  )
}

function SelectionDemo() {
  const [focus, setFocus] = React.useState<ConstructFocus>(null)
  const [selection, setSelection] = React.useState<ConstructRange | null>(null)
  return (
    <div className="grid gap-6">
      <div className="min-h-[4.5rem]">
        {focus ? (
          <ChartReadout
            value={focus.feature.name}
            label={`${focus.feature.start.toLocaleString("en-US")} to ${focus.feature.end.toLocaleString("en-US")}`}
            detail={
              <span className="type-body-sm text-muted-foreground">
                {focus.length.toLocaleString("en-US")} bp{focus.feature.strand === 1 ? ", forward" : focus.feature.strand === -1 ? ", reverse" : ""}
                {focus.feature.description ? `. ${focus.feature.description}` : ""}
              </span>
            }
          />
        ) : selection ? (
          <ChartReadout value={(selection.end - selection.start + 1).toLocaleString("en-US")} unit="bp" label={`${selection.start.toLocaleString("en-US")} to ${selection.end.toLocaleString("en-US")}`} />
        ) : (
          <ChartReadout value={PGL3.features.length} unit="features" label={PGL3_NAME} />
        )}
      </div>
      <ConstructMap
        name={PGL3_NAME}
        length={PGL3.length}
        features={PGL3.features}
        sites={SITES}
        sequence={PGL3.sequence}
        circular
        selectable
        selection={selection}
        onSelectionChange={setSelection}
        onActiveChange={setFocus}
        aria-label="pGL3-Basic, features in order"
      />
    </div>
  )
}
