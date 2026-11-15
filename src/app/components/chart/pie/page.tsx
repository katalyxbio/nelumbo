"use client"

import { PageHeader, Preview, PropsTable, Section } from "@/components/docs/primitives"
import { ChartNav } from "../chart-nav"
import {
  PieCustomLabelDemo,
  PieDonutActiveDemo,
  PieDonutDemo,
  PieDonutTextDemo,
  PieInteractiveDemo,
  PieLabelDemo,
  PieLabelListDemo,
  PieLegendDemo,
  PieSeparatorNoneDemo,
  PieSimpleDemo,
  PieStackedDemo,
} from "./demos"

const grid = "grid items-start gap-4 lg:grid-cols-2"

export default function PieChartsPage() {
  return (
    <>
      <PageHeader eyebrow="Component 51" title="Pie charts">
        Every pie and donut from shadcn&apos;s gallery in Nelumbo&apos;s Material style: slices separated by gaps with pill ends, a slice that grows
        on a spring when it is in focus, labels on inverse chips and a big readout in the middle of a donut.
      </PageHeader>
      <ChartNav />

      <Section
        title="Simple and Separator None"
        description="The default pie has paddingAngle gaps and a large cornerRadius, so each slice is a rounded wedge. Set both to 0 (and stroke none) for one continuous disc."
      >
        <Preview className={grid}>
          <PieSimpleDemo />
          <PieSeparatorNoneDemo />
        </Preview>
      </Section>

      <Section
        title="Label, Custom Label and Label List"
        description="Labels are small inverse chips, never bare numbers. piePillLabel draws them outside on a round-capped leader line (the value, or a name and value with a slice-colored dot) or inside the slice."
      >
        <Preview className={grid}>
          <PieLabelDemo />
          <PieCustomLabelDemo />
          <PieLabelListDemo />
        </Preview>
      </Section>

      <Section title="Legend and Donut" description="The legend is the chip row used across Nelumbo charts. A donut keeps the same gaps and pill ends around a hollow center.">
        <Preview className={grid}>
          <PieLegendDemo />
          <PieDonutDemo />
        </Preview>
      </Section>

      <Section
        title="Donut Active and Donut with Text"
        description="The active slice grows outward on a spring (PieActiveSector). Hover or tap to pick one, or tab to the chart: it is a single slider stop, the arrow keys move between slices and the value is read out. The center of a donut holds a readout (PieCenter)."
      >
        <Preview className={grid}>
          <PieDonutActiveDemo />
          <PieDonutTextDemo />
        </Preview>
      </Section>

      <Section title="Stacked" description="Two Pie series with different radii make concentric rings. The tooltip names the month through labelFormatter.">
        <Preview className="block max-w-xl">
          <PieStackedDemo />
        </Preview>
      </Section>

      <Section
        title="Interactive"
        description="A connected switcher picks the month. The chart, the selector and the arrow keys share one useChartFocus selection, so the grown slice, the pressed month and the center value always agree."
      >
        <Preview className="block max-w-xl">
          <PieInteractiveDemo />
        </Preview>
      </Section>

      <Section title="Helpers">
        <PropsTable
          rows={[
            ["Pie paddingAngle, cornerRadius", "number", "4, 12", "Gaps and pill ends. Use 0 and 0 with stroke none for Separator None"],
            ["piePillLabel(options)", "label renderer", "", "Pie label as an inverse pill. position outside (leader line) or inside; text(value, name); dot; offset"],
            ["PieActiveSector", "activeShape", "", "The slice grown by grow px (default 12), settling on a spring. Use with a controlled activeIndex"],
            ["PieCenter value, label", "component", "", "Big readout centered over a donut; place it in a relative wrapper beside the ChartContainer"],
            ["ChartContainer focus", "ChartFocus", "", "From useChartFocus: the chart is one slider stop; arrow keys move the active slice"],
          ]}
        />
      </Section>
    </>
  )
}
