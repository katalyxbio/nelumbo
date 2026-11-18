"use client"

import * as React from "react"
import { SangerTrace, parseAbif, qualityTrim, type SangerBase, type SangerRead } from "@/registry/nelumbo/ui/sanger-trace"
import { ChartReadout } from "@/registry/nelumbo/ui/chart"
import { Button } from "@/registry/nelumbo/ui/button"
import { Icon } from "@/registry/nelumbo/ui/icon"
import { SegmentedButton, SegmentedButtonItem } from "@/registry/nelumbo/ui/segmented-button"
import { Code, PageHeader, Preview, PropsTable, Section } from "@/components/docs/primitives"
import { MCHERRY_REFERENCE, READ } from "./data"

// The same reference with one base changed (C to T at 99), to show how a difference reads.
const EDITED = MCHERRY_REFERENCE.slice(0, 98) + "T" + MCHERRY_REFERENCE.slice(99)

export default function SangerTracePage() {
  return (
    <>
      <PageHeader eyebrow="Component 78" title="Sanger Trace">
        A chromatogram: the four dye channels as curves, the base calls over their peaks, and each call&apos;s quality
        as a bar, with the ends a trim would cut shaded. It reads .ab1 files as they come off the sequencer.
      </PageHeader>

      <Section title="Install">
        <Code>{`npx shadcn@latest add @nelumbo/sanger-trace`}</Code>
      </Section>

      <Section
        title="A read"
        description="A read from the pCAG promoter into mCherry (Biopython's ABIF test file, parsed by parseAbif). The first bases are noisy, as every read's are: their quality bars fall under the Q20 line and the trim shades them. The trace scrolls sideways; hover a peak for the four channels."
      >
        <Preview className="block">
          <SangerTrace {...READ} range={{ start: 1, end: 120 }} trim />
        </Preview>
      </Section>

      <Section
        title="Against a reference"
        description="reference lines the calls up against the bases you expected and marks every difference, with the expected base under the call. This read matches mCherry from its start codon (base 48) to the end of the window; the edited reference shows a one-base change."
      >
        <Preview className="block">
          <ReferenceDemo />
        </Preview>
      </Section>

      <Section
        title="Mixed bases"
        description="mixed flags a call when its second-highest channel reaches that share of the first, as at a heterozygous site. Here, in the read's noisy start, the base caller already wrote some as ambiguity codes (K, Y)."
      >
        <Preview className="block">
          <SangerTrace {...READ} range={{ start: 1, end: 40 }} mixed={0.35} baseWidth={18} aria-label="The first 40 calls, mixed bases flagged" />
        </Preview>
      </Section>

      <Section title="Open a file" description="Choose an .ab1 file to read it here; nothing leaves the page.">
        <Preview className="block">
          <FileDemo />
        </Preview>
      </Section>

      <Section
        title="Reading a base"
        description="selectable makes the trace one keyboard stop: arrows move a base (Shift, ten), Page Up and Page Down a screen, Home and End to the ends."
      >
        <Preview className="block">
          <SelectionDemo />
        </Preview>
      </Section>

      <Section title="Props">
        <PropsTable
          rows={[
            ["traces, bases, peaks", "SangerRead", "", "The four channels, the calls, and the scan of each call's peak: parseAbif gives all three."],
            ["quality", "number[]", "", "Phred quality a call: the bars, the Q20 and Q30 lines, and faded low calls."],
            ["start / range", "number, { start, end }", "1, all", "The first call's number; a window of the read."],
            ["scheme", "NucleotideScheme", '"trace"', "The channel and call colors."],
            ["height / baseWidth", "number", "120, 14", "Curve height; px a base."],
            ["qualityBars / fill", "boolean", "true", "The quality row; a faint fill under the curves."],
            ["trim", "boolean | number", "false", "Shade the ends a Mott trim cuts, at an error cutoff of 0.05 or the one given."],
            ["reference", "string", "", "Expected bases aligned to the calls (- for none): differences are marked."],
            ["mixed", "number", "", "Flag calls whose second channel reaches this share of the first."],
            ["selectable / onActiveChange", "boolean, (base | null) => void", "false", "A keyboard stop; the base in focus with its quality and peak heights."],
            ["Helpers", "parseAbif, qualityTrim", "", "An .ab1 file as a read; the stretch a Mott trim keeps."],
          ]}
        />
      </Section>
    </>
  )
}

function ReferenceDemo() {
  const [ref, setRef] = React.useState("edited")
  return (
    <div className="grid gap-6">
      <SegmentedButton type="single" size="sm" value={ref} onValueChange={(v) => v && setRef(v)} aria-label="Reference" >
        <SegmentedButtonItem value="mcherry">mCherry</SegmentedButtonItem>
        <SegmentedButtonItem value="edited">With one edit</SegmentedButtonItem>
      </SegmentedButton>
      <SangerTrace {...READ} range={{ start: 80, end: 140 }} reference={ref === "edited" ? EDITED : MCHERRY_REFERENCE} baseWidth={16} />
    </div>
  )
}

function FileDemo() {
  const input = React.useRef<HTMLInputElement>(null)
  const [read, setRead] = React.useState<SangerRead | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const kept = read?.quality ? qualityTrim(read.quality) : null
  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="secondary" size="sm" onClick={() => input.current?.click()}>
          <Icon name="upload_file" />
            Open an .ab1 file
        </Button>
        <input
          ref={input}
          type="file"
          accept=".ab1,.abi,.abif"
          className="hidden"
          aria-label="ABI file"
          onChange={async (e) => {
            const f = e.target.files?.[0]
            e.target.value = ""
            if (!f) return
            try {
              setRead(parseAbif(await f.arrayBuffer()))
              setError(null)
            } catch (err) {
              setError(err instanceof Error ? err.message : "Could not read that file")
            }
          }}
        />
        <span className="type-body-sm text-muted-foreground" aria-live="polite">
          {error ??
            (read
              ? `${read.name ?? "Read"}: ${read.bases.length} bases${kept ? `, ${kept.start} to ${kept.end} after trimming` : ""}`
              : "Showing the example read until you open one")}
        </span>
      </div>
      <SangerTrace {...(read ?? READ)} trim range={read ? undefined : { start: 1, end: 220 }} />
    </div>
  )
}

function SelectionDemo() {
  const [base, setBase] = React.useState<SangerBase | null>(null)
  return (
    <div className="grid gap-6">
      <div className="min-h-[4.5rem]">
        {base ? (
          <ChartReadout
            value={`${base.base}${base.position}`}
            unit={base.quality != null ? `Q${base.quality}` : undefined}
            label={base.quality != null ? (base.quality >= 30 ? "High quality" : base.quality >= 20 ? "Good" : "Low quality") : "No quality"}
            detail={<span className="type-body-sm text-muted-foreground tabular-nums">A {base.heights.A}, C {base.heights.C}, G {base.heights.G}, T {base.heights.T}</span>}
          />
        ) : (
          <ChartReadout value={READ.bases.length} unit="bases" label={READ.name} />
        )}
      </div>
      <SangerTrace {...READ} range={{ start: 40, end: 160 }} selectable onActiveChange={setBase} aria-label="mCherry read, by base" />
    </div>
  )
}
