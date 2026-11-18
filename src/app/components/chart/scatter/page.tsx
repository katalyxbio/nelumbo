"use client"

import { Code, PageHeader, Preview, PropsTable, Section } from "@/components/docs/primitives"

import { ChartNav } from "../chart-nav"
import { ScatterBubbleDemo, ScatterFitDemo, ScatterGroupsDemo, ScatterLogDemo, ScatterVolcanoDemo } from "./demos"

const grid = "grid items-start gap-4 lg:grid-cols-2"

export default function ScatterChartsPage() {
  return (
    <>
      <PageHeader eyebrow="Component 51" title="Scatter charts">
        Points ringed in the card&apos;s surface, so dense clouds stay readable, on Recharts&apos; ScatterChart. Fits carry their
        confidence band, the points that matter wear the same inverse pills as the rest of the charts, and one point at a time
        can be in focus with the readout above following it.
      </PageHeader>
      <ChartNav />

      <Section title="Install">
        <Code>{`npx shadcn@latest add @nelumbo/chart`}</Code>
      </Section>

      <Section
        title="Log axes and groups"
        description='scale="log" on both axes for quantities spanning orders of magnitude. Point at a gene, click to keep it, or tab to the chart and use the arrow keys; the readout starts on the correlation. Groups are separate Scatter series with a legend that toggles them.'
      >
        <Preview className={grid}>
          <ScatterLogDemo />
          <ScatterGroupsDemo />
        </Preview>
      </Section>

      <Section
        title="Fit and band"
        description="chartLinearFit does least squares with a 95% confidence band for the line; draw the band as a range Area and the fit as a Line under the points. Here three samples are read off a standard curve; pick one to see its concentration."
      >
        <Preview className="block max-w-2xl">
          <ScatterFitDemo />
        </Preview>
      </Section>

      <Section
        title="Volcano and bubble"
        description="The volcano colors only what passes both thresholds, red up and blue down, and names the strongest hits; the arrow keys walk the significant genes from the most significant. The bubble chart is an enrichment dot plot: ZAxis sets the dot area, and the tone of one hue carries the q-value."
      >
        <Preview className={grid}>
          <ScatterVolcanoDemo />
          <ScatterBubbleDemo />
        </Preview>
      </Section>

      <Section title="Helpers">
        <PropsTable
          rows={[
            ["chartPoint(key, { r, fill, bubble, opacity })", "Scatter shape", "", "A dot ringed in the surface. fill picks a color per point; bubble takes the radius from the ZAxis area"],
            ["chartLinearFit(points)", "ChartFit", "", "slope, intercept, r2, n, predict(x), band(x) for the 95% confidence band, rows(from, to, steps) for a Line and a range Area"],
            ["ChartPointLabel", "{ x, y, text, side, tone }", "", "An inverse pill beside a point, in plot coordinates (from a Customized component's axis scales)"],
            ["useChartFocus().preview(i)", "(index | null) => void", "", "Preview a point on hover: Scatter's onMouseEnter and onMouseLeave, since scatter hover isn't tied to the tooltip index"],
          ]}
        />
      </Section>
    </>
  )
}
