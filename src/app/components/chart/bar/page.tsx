"use client"

import { PageHeader, Preview, Section } from "@/components/docs/primitives"
import { ChartNav } from "../chart-nav"
import {
  ActiveBarDemo,
  CustomLabelBarDemo,
  DefaultBarDemo,
  HorizontalBarDemo,
  InteractiveBarDemo,
  LabelBarDemo,
  MixedBarDemo,
  MultipleBarDemo,
  NegativeBarDemo,
  StackedBarDemo,
} from "./demos"

const grid = "grid items-start gap-4 lg:grid-cols-2"

export default function BarChartsPage() {
  return (
    <>
      <PageHeader eyebrow="Component 51" title="Bar charts">
        Every bar chart from shadcn&apos;s gallery in Material 3 Expressive: full pill bars, a value axis on the right, a target
        line with a badge on the bars that reach it, one point in focus with a big readout, and value labels as small pills. The data is lab work: libraries through a sequencing core, variants in an exome, blood cell types and a gene expression response.
      </PageHeader>
      <ChartNav />

      <Section
        title="Default and horizontal"
        description="The default bar chart is a column of pills with a target line; weeks that reach the target take the full color and a check badge. The horizontal variant lays the same data in rows, with the value in a pill after each bar. Week 4 is low: the DNA line was down for maintenance."
      >
        <Preview className={grid}>
          <DefaultBarDemo />
          <HorizontalBarDemo />
        </Preview>
      </Section>

      <Section
        title="Multiple and stacked"
        description="Grouped bars sit side by side as separate pills, in two hues for two kinds of library. Stacked segments split one total, so they take two tones of one color; each rounds and they are parted by a 3px surface gap. Both keep the inverse tooltip, with a focus line in place of the gray band, and chip legends."
      >
        <Preview className={grid}>
          <MultipleBarDemo />
          <StackedBarDemo />
        </Preview>
      </Section>

      <Section
        title="Label and custom label"
        description="Values are small inverse pills, above a column or after a row. A custom label can live inside the bar, in that bar's on-color."
      >
        <Preview className={grid}>
          <LabelBarDemo />
          <CustomLabelBarDemo />
        </Preview>
      </Section>

      <Section
        title="Mixed and active"
        description="Mixed gives every row its own color from the chart config. Active keeps one bar at full color and pushes the others back; hover, tap or use the arrow keys to move it."
      >
        <Preview className={grid}>
          <MixedBarDemo />
          <ActiveBarDemo />
        </Preview>
      </Section>

      <Section
        title="Negative"
        description="Up and down on either side of a zero line, each in its own color, with the value pill on the outer end of the bar: p53 targets rise after DNA damage and proliferation genes fall (fold changes illustrative)."
      >
        <Preview className="block max-w-2xl">
          <NegativeBarDemo />
        </Preview>
      </Section>

      <Section
        title="Interactive"
        description="A series switcher that shows each series' total for the period, a period switcher, and a readout that follows the point in focus."
      >
        <Preview className="block">
          <InteractiveBarDemo />
        </Preview>
      </Section>
    </>
  )
}
