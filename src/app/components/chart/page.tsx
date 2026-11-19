"use client"

import { Code, PageHeader, Preview, PropsTable, Section } from "@/components/docs/primitives"
import { chartColorNames } from "@/registry/nelumbo/ui/chart"

import { ChartNav } from "./chart-nav"
import { CellCycleDemo, ControlCtDemo, OxygenDemo, RingsDemo, SamplesDemo } from "./lab-demos"

export default function ChartPage() {
  return (
    <>
      <PageHeader eyebrow="Component 51" title="Chart">
        Recharts charts in Material 3 Expressive: a big readout that follows the point in
        focus, pill bars with a scalloped badge on goal days, dotted zone lines, stage lanes and progress rings. Dotted
        grid, quiet axes, an inverse tooltip and series colors from the accent roles. API-compatible with shadcn&apos;s Chart.
      </PageHeader>
      <ChartNav />

      <Section title="Install">
        <Code>{`npx shadcn@latest add @nelumbo/chart`}</Code>
      </Section>

      <Section
        title="Goals and ranges"
        description="One point is always in focus. Hover to preview, click or tap to select, or tab to the chart and use the arrow keys (Home, End, Page Up and Down; Escape goes back). The readout above the chart follows it, a line and a ring mark it, and the close button returns to today. Days that reach the goal, a full 96-well plate, take the full color and a check badge, and the goal is called out on the axis. A control charted against its accepted range marks the run that fell outside it."
      >
        <Preview className="grid items-start gap-4 lg:grid-cols-2">
          <SamplesDemo />
          <ControlCtDemo />
        </Preview>
      </Section>

      <Section
        title="Zones and stages"
        description="Zone boundaries are dotted lines in the zone's color, and the line changes color as it crosses them (ChartZoneGradient); the legend counts dots for intensity so it reads without color. ChartStages draws one lane per stage with hand-over connectors, ticks for moments, and the totals in the lane labels: here dissolved oxygen through a fermentation, and one cell's way through the cell cycle."
      >
        <Preview className="grid items-start gap-4 lg:grid-cols-2">
          <OxygenDemo />
          <CellCycleDemo />
        </Preview>
      </Section>

      <Section title="Rings" description="Progress toward daily goals on tonal tracks with round caps. Past the goal the ring keeps going: the second lap is drawn darker over the first.">
        <Preview className="block max-w-xl">
          <RingsDemo />
        </Preview>
      </Section>

      <Section
        title="Colors"
        description={`Series without a color in the config take chartColors in order: ${chartColorNames.join(", ")}. These are Nelumbo's accent roles, checked at 3:1 against the card in light and dark. Keep to five series or fewer, and use the legend and tooltip as the second channel for identity. Override with color or theme: { light, dark }.`}
      >
        <Preview>
          {chartColorNames.map((n) => (
            <span key={n} className="inline-flex h-7 items-center gap-1.5 rounded-full bg-secondary px-2.5 type-label-md text-secondary-foreground">
              <span aria-hidden className="size-2.5 rounded-[3px]" style={{ background: `var(--${n})` }} />
              {n}
            </span>
          ))}
        </Preview>
      </Section>

      <Section title="Props">
        <PropsTable
          rows={[
            ["config", "ChartConfig", "", "Per series: label, icon, and color or theme { light, dark }. Becomes --color-<key> on the chart"],
            ["aria-label", "string", "", "Names the plot (role=img). State what the chart shows, with the headline numbers"],
            ["initialDimension", "{ width, height }", "480 x 270", "Size for the server render and before the first measure, so Recharts never sees 0"],
            ["ChartTooltipContent indicator", '"dot" | "line" | "dashed"', '"dot"', "Marker beside each value"],
            ["hideLabel / hideIndicator", "boolean", "false", "Drop the heading or the markers"],
            ["labelFormatter / formatter", "function", "", "Same as shadcn"],
            ["nameKey / labelKey", "string", "", "Which payload field names the item or the heading (pie and radial use nameKey)"],
            ["ChartLegendContent hiddenKeys, onToggle", "string[], (key) => void", "", "Nelumbo: makes chips toggle buttons (aria-pressed). Pair with hide on each series"],
            ["useSeriesVisibility()", "{ hiddenKeys, toggle, isHidden }", "", "State helper for the interactive legend"],
            ["useChartAnimation()", "props", "", "Spread on Bar, Area, Line, Pie, RadialBar: spring-like ease, off with reduced motion"],
            ["ChartContainer focus", "ChartFocus", "", "From useChartFocus: the chart becomes one keyboard stop, a slider over its points, named by aria-label"],
            ["useChartFocus({ count, defaultIndex, describe })", "ChartFocus", "", "One point in focus: chartProps for the chart, index, isDefault, reset(), fill(key, i). defaultIndex -1 starts on the summary"],
            ["ChartReadout", "label, value, unit, detail, onClear", "", "The big headline above a chart, announced politely. onClear adds the close button"],
            ["chartPillBar(key, { goal, badge })", "Bar shape", "", "Pill bars; goal days in full color with a scalloped check badge, the rest a tint"],
            ["chartFocusLine, chartFocusDot", "props", "", "Spread on ReferenceLine x and ReferenceDot to mark the point in focus"],
            ["chartGoalLine(key), chartZoneLine(key)", "props", "", "Spread on ReferenceLine y: a solid goal line, a dotted zone boundary"],
            ["chartTicks({ highlight, format })", "tick", "", "Value axis ticks; highlighted values (the goal) take a color"],
            ["ChartZoneGradient", "id, range, zones", "", "A hard-stop gradient so a line changes color by zone"],
            ["ChartStages", "config, data, levels, events", "", "Stage lanes (cell cycle phases). Items without end in an events lane draw as ticks"],
            ["ChartRings", "rings, size, thickness", "", "Concentric progress rings; past the goal a darker second lap"],
            ["config swatch", '"dot" | "band" | "line" | number', '"dot"', "Legend marker; a number draws that many dots. ChartLegendContent keys lists config keys"],
            ["chartBarRadius, chartSegment, chartLine(key), chartDot(key), chartActiveDot(key), ChartGradient", "", "", "Helpers for the Nelumbo marks"],
            ["chartColors", "string[]", "", "var(--blue), var(--orange), var(--green), ... in series order"],
          ]}
        />
      </Section>
    </>
  )
}
