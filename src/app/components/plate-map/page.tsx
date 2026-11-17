"use client"

import * as React from "react"
import { PlateMap, wellName, wellRange, type PlateCorner, type PlateFocus, type PlateGroup, type PlateWell } from "@/registry/nelumbo/ui/plate-map"
import { ToggleGroup, ToggleGroupItem } from "@/registry/nelumbo/ui/toggle-group"
import { ChartReadout } from "@/registry/nelumbo/ui/chart"
import { Button } from "@/registry/nelumbo/ui/button"
import { Code, PageHeader, Preview, PropsTable, Section } from "@/components/docs/primitives"

// A small seeded generator, so the simulated readings are the same on every render.
function random(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296
    return seed / 4294967296
  }
}

// An ELISA layout: a two-fold standard curve in duplicate, 32 samples in duplicate, controls and blanks.
const ELISA_GROUPS: PlateGroup[] = [
  { id: "std", name: "Standard", color: "blue" },
  { id: "sample", name: "Sample", color: "neutral" },
  { id: "pos", name: "Positive control", color: "green" },
  { id: "neg", name: "Negative control", color: "red" },
  { id: "blank", name: "Blank", color: "amber" },
]

const ELISA: PlateWell[] = (() => {
  const rnd = random(7)
  const out: PlateWell[] = []
  // a four-parameter logistic curve, OD 450 nm against concentration
  const od = (conc: number) => 0.06 + (2.9 - 0.06) / (1 + (120 / Math.max(conc, 0.01)) ** 1.15)
  const noise = (v: number) => Math.max(0.03, v * (1 + (rnd() - 0.5) * 0.08))
  for (let r = 0; r < 8; r++) {
    const conc = 1000 / 2 ** r
    for (const c of [0, 1])
      out.push({ well: wellName(r, c), group: "std", label: `S${r + 1}`, value: noise(od(conc)), description: `Standard ${r + 1}, ${conc.toFixed(1)} pg/mL` })
  }
  for (let c = 2; c < 10; c += 2)
    for (let r = 0; r < 8; r++) {
      const n = (c - 2) * 4 + r + 1
      const v = od(5 + rnd() * 400)
      for (const k of [0, 1]) out.push({ well: wellName(r, c + k), group: "sample", label: `${n}`, value: noise(v), description: `Sample ${n}` })
    }
  for (let r = 0; r < 8; r++) {
    out.push(r < 4 ? { well: wellName(r, 10), group: "pos", label: "P", value: noise(2.1) } : { well: wellName(r, 10), group: "neg", label: "N", value: noise(0.09) })
    out.push({ well: wellName(r, 11), group: "blank", label: "B", value: noise(0.05) })
  }
  // two wells flagged after the read: a bubble, and a scratch on the bottom
  for (const w of out) if (w.well === "D6" || w.well === "G9") Object.assign(w, { excluded: true, description: `${w.description}, excluded: ${w.well === "D6" ? "bubble" : "scratch"}` })
  return out
})()

// A 384-well screen: controls in the outer columns, a dose series down the plate, a little edge effect.
const SCREEN: PlateWell[] = (() => {
  const rnd = random(42)
  const out: PlateWell[] = []
  for (let r = 0; r < 16; r++)
    for (let c = 0; c < 24; c++) {
      const edge = r === 0 || r === 15 || c === 0 || c === 23 ? -8 : 0
      let v: number
      if (c < 2) v = 100 + (rnd() - 0.5) * 8
      else if (c > 21) v = (rnd() - 0.5) * 8
      else v = 100 - 100 / (1 + 2 ** (6 - ((c - 2) % 10) * 1.2 + (r % 4) * 0.6)) + (rnd() - 0.5) * 10 + edge
      out.push({ well: wellName(r, c), value: Math.max(0, Math.min(110, v)) })
    }
  return out
})()

const SCREEN_GROUPS: PlateGroup[] = [
  { id: "max", name: "Uninhibited", color: "green" },
  { id: "cpd", name: "Compound", color: "purple" },
  { id: "min", name: "Inhibited", color: "red" },
]
const SCREEN_LAYOUT: PlateWell[] = SCREEN.map((w) => {
  const col = Number(w.well.replace(/^[A-Z]+/, ""))
  return { well: w.well, group: col <= 2 ? "max" : col >= 23 ? "min" : "cpd" }
})

const CULTURE: PlateWell[] = [
  ...wellRange("A1:A3").map((well) => ({ well, group: "wt", label: "WT" })),
  ...wellRange("B1:B3").map((well) => ({ well, group: "ko", label: "KO" })),
  ...wellRange("C1:C3").map((well) => ({ well, group: "rescue", label: "R" })),
  ...wellRange("D1:D3").map((well) => ({ well, group: "mock", label: "M" })),
]

export default function PlateMapPage() {
  return (
    <>
      <PageHeader eyebrow="Component 74" title="Plate Map">
        A microplate from 6 to 1536 wells, laid out as it is on the bench: wells colored by group or by value, rectangle
        selection that becomes one connected shape, and keyboard navigation well by well.
      </PageHeader>

      <Section title="Install">
        <Code>{`npx shadcn@latest add @nelumbo/plate-map`}</Code>
      </Section>

      <Section
        title="A layout"
        description="Groups color the wells and fill the legend, with counts. An ELISA plate: a standard curve in duplicate, samples in duplicate, controls and blanks. Wells marked excluded are struck through and counted apart. Hover a well for its card; its row and column light up."
      >
        <Preview className="block">
          <PlateMap format={96} wells={ELISA} groups={ELISA_GROUPS} labels aria-label="ELISA plate layout" />
        </Preview>
      </Section>

      <Section
        title="Values"
        description='Without groups (or with colorBy="values"), wells take their value on a scale, light to deep, and the legend becomes the scale. The same plate read at 450 nm (simulated).'
      >
        <Preview className="block">
          <PlateMap format={96} wells={ELISA} colorBy="values" unit="OD" labels aria-label="ELISA plate, absorbance at 450 nm" />
        </Preview>
      </Section>

      <Section
        title="Selection"
        description="selectable turns on selection. Drag, or Shift and the arrows, for a rectangle; Ctrl or Cmd adds wells; Space toggles the well in focus; a row or column header takes the whole line. However the wells are picked, the selection is traced as one outline: round at its outer corners, filleted where it turns inward, and separate where wells only touch at a corner."
      >
        <Preview className="block">
          <SelectionDemo />
        </Preview>
      </Section>

      <Section
        title="Plate"
        description='variant="plate" draws the plate itself at the standard footprint, 127.76 by 85.48 mm: the frame and its flange, the raised deck, wells at their true pitch and offset, labels molded on the frame. notch puts the chamfered corner where your plates have it.'
      >
        <Preview className="block">
          <PlateDemo />
        </Preview>
      </Section>

      <Section
        title="384 wells"
        description="Beyond 96 the wells turn square, as on the plate. A diverging scale centers on a midpoint: here, percent activity in a simulated dose-response screen, with uninhibited and inhibited controls in the outer columns. On narrow screens every other header hides."
      >
        <Preview className="grid gap-10">
          <PlateMap format={384} wells={SCREEN_LAYOUT} groups={SCREEN_GROUPS} aria-label="384-well screen layout" />
          <PlateMap
            format={384}
            variant="plate"
            notch="bottom-left"
            wells={SCREEN}
            scale="diverging"
            midpoint={50}
            domain={[0, 100]}
            unit="%"
            aria-label="384-well screen, percent activity"
          />
        </Preview>
      </Section>

      <Section title="Small formats" description="6 to 48 wells for culture plates: the wells grow, so labels fit comfortably.">
        <Preview className="block">
          <PlateMap
            format={12}
            wells={CULTURE}
            groups={[
              { id: "wt", name: "Wild type", color: "blue" },
              { id: "ko", name: "Knockout", color: "red" },
              { id: "rescue", name: "Rescue", color: "green" },
              { id: "mock", name: "Mock", color: "neutral" },
            ]}
            labels
            aria-label="12-well culture plate"
          />
        </Preview>
      </Section>

      <Section title="Props">
        <PropsTable
          rows={[
            ["format", "6 | 12 | 24 | 48 | 96 | 384 | 1536", "96", "The plate. Round wells up to 96, square beyond."],
            ["variant", '"grid" | "plate"', '"grid"', "The wells alone, or the whole plate to scale with its frame."],
            ["notch", '"top-left" | "top-right" | "bottom-left" | "bottom-right"', '"top-left"', "The chamfered corner of the plate variant."],
            ["wells", "PlateWell[]", "", "well (\"B3\"), group, value, label, description, excluded."],
            ["groups", "PlateGroup[]", "", "id, name, color, description. Colors follow the palette order when left out."],
            ["colorBy", '"groups" | "values"', "groups if given", "What colors the wells."],
            ["scale / domain / midpoint", '"sequential" | "diverging", [min, max], number', '"sequential", the values, 0', "The value scale."],
            ["scaleColor", "accent role", '"blue"', "The hue of a sequential scale."],
            ["formatValue / unit", "(v) => string, string", "", "How values are written, in wells, the readout and the legend."],
            ["labels", "boolean", "false", "Labels or values inside the wells, up to 96."],
            ["legend", "boolean", "true", "Groups with counts, or the scale, and excluded wells."],
            ["tooltip", "boolean", "true", "A card over the well under the pointer or the keyboard cursor."],
            ["selectable", "boolean", "false", "Rectangle, additive and line selection."],
            ["selection / onSelectionChange", "string[], (wells) => void", "", "Selected well names, controlled or not (defaultSelection)."],
            ["onActiveChange", "(focus | null) => void", "", "The well under the pointer or the keyboard cursor."],
            ["Helpers", "plateSize, wellName, parseWell, wellRange, rowName, cellsOutline", "", '"A1:B3" to wells, "B3" to row and column and back; the traced outline of any set of cells as an SVG path.'],
          ]}
        />
      </Section>
    </>
  )
}

function SelectionDemo() {
  const [selection, setSelection] = React.useState<string[]>([...wellRange("B3:E6"), ...wellRange("F3:G4"), ...wellRange("B8:B9"), "C10"])
  const [focus, setFocus] = React.useState<PlateFocus | null>(null)
  const picked = ELISA.filter((w) => selection.includes(w.well) && w.value != null)
  const mean = picked.length ? picked.reduce((s, w) => s + w.value!, 0) / picked.length : 0
  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        {focus ? (
          <ChartReadout
            value={focus.value != null ? focus.value.toFixed(3) : "Empty"}
            unit={focus.value != null ? "OD" : undefined}
            label={`${focus.well}${focus.groupInfo ? `, ${focus.groupInfo.name}` : ""}`}
            detail={focus.description ? <span className="type-body-sm text-muted-foreground">{focus.description}</span> : undefined}
          />
        ) : (
          <ChartReadout
            value={selection.length ? mean.toFixed(3) : "None"}
            unit={selection.length ? "mean OD" : undefined}
            label={`${selection.length} ${selection.length === 1 ? "well" : "wells"} selected`}
          />
        )}
        <Button variant="outline" size="sm" onClick={() => setSelection([])} disabled={!selection.length}>
          Clear
        </Button>
      </div>
      <PlateMap
        format={96}
        wells={ELISA}
        groups={ELISA_GROUPS}
        selectable
        selection={selection}
        onSelectionChange={setSelection}
        onActiveChange={setFocus}
        aria-label="ELISA plate, selectable"
      />
    </div>
  )
}

const CORNERS: { value: PlateCorner; label: string }[] = [
  { value: "top-left", label: "Top left" },
  { value: "top-right", label: "Top right" },
  { value: "bottom-left", label: "Bottom left" },
  { value: "bottom-right", label: "Bottom right" },
]

function PlateDemo() {
  const [notch, setNotch] = React.useState<PlateCorner>("top-left")
  return (
    <div className="grid gap-6">
      <ToggleGroup type="single" value={notch} onValueChange={(v) => v && setNotch(v as PlateCorner)} aria-label="Notch" className="w-fit flex-wrap">
        {CORNERS.map((c) => (
          <ToggleGroupItem key={c.value} value={c.value}>
            {c.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <PlateMap
        format={96}
        variant="plate"
        notch={notch}
        wells={ELISA}
        groups={ELISA_GROUPS}
        selectable
        defaultSelection={wellRange("A3:H4")}
        aria-label={`ELISA plate, notch ${notch.replace("-", " ")}`}
      />
    </div>
  )
}
