"use client"

import { Code, PageHeader, Preview, PropsTable, Section } from "@/components/docs/primitives"

import { ChartNav } from "../chart-nav"
import {
  LineCustomDots,
  LineCustomLabel,
  LineDefault,
  LineDots,
  LineDotsColors,
  LineInteractive,
  LineLabel,
  LineLinear,
  LineMultiple,
  LineStep,
} from "./demos"

const grid = "grid items-start gap-4 lg:grid-cols-2"
const grid3 = "grid items-start gap-4 md:grid-cols-2 xl:grid-cols-3"

export default function LineChartsPage() {
  return (
    <>
      <PageHeader eyebrow="Component 51" title="Line charts">
        Every line chart from shadcn&apos;s gallery in Material 3 Expressive: 3px round lines, a big readout that follows the
        point in focus, a ring and a line to mark it, and the value axis on the right with a reference value called out. The
        demos follow an E. coli culture. Hover to preview, click or tap to select, or tab to a chart and use the arrow keys.
      </PageHeader>
      <ChartNav />

      <Section
        title="Default, Linear and Step"
        description="The three curve types. Default is monotone: smooth, and never overshoots a point. Linear joins the points with straight segments, Step holds each value until the next. The readout gives the fold change since the previous reading."
      >
        <Preview className={grid3}>
          <LineDefault />
          <LineLinear />
          <LineStep />
        </Preview>
      </Section>

      <Section
        title="Multiple"
        description="With two series a readout cannot say everything, so the inverse tooltip stays. It replaces the gray cursor with the focus line and a ring on each series."
      >
        <Preview className="block max-w-3xl">
          <LineMultiple />
        </Preview>
      </Section>

      <Section
        title="Dots, Custom Dots and Dots Colors"
        description="Dots are ringed in the card surface. Custom dots can be any shape: here the induction point is a scalloped cookie with a bolt. Dots Colors takes each dot's color from a band in the config, here the growth phase, and the legend names the bands."
      >
        <Preview className={grid3}>
          <LineDots />
          <LineCustomDots />
          <LineDotsColors />
        </Preview>
      </Section>

      <Section
        title="Label and Custom Label"
        description="Value labels are small pills above their points, inverse for values and tonal for names, never bare floating numbers."
      >
        <Preview className={grid}>
          <LineLabel />
          <LineCustomLabel />
        </Preview>
      </Section>

      <Section
        title="Interactive"
        description="The series switcher shows each series' total for the period; the connected toggle changes the period. The readout, the dotted average and the focus all follow the choice."
      >
        <Preview className="block max-w-3xl">
          <LineInteractive />
        </Preview>
      </Section>

      <Section title="Usage">
        <Code>{`const focus = useChartFocus({ count: data.length, describe: (i) => \`\${data[i].hour}: OD600 \${data[i].od}\` })

<ChartContainer config={config} focus={focus} aria-label="E. coli growth curve, OD600 every two hours">
  <LineChart data={data} {...focus.chartProps}>
    <XAxis dataKey="hour" tickLine={false} axisLine={false} />
    <YAxis orientation="right" tickLine={false} axisLine={false} tick={chartTicks()} />
    <ChartTooltip cursor={false} content={() => null} />
    <Line {...chartLine("od")} dot={chartCookieDot("od", { when: (d) => d.induced })} />
    <ReferenceLine x={data[focus.index].hour} {...chartFocusLine} />
  </LineChart>
</ChartContainer>`}</Code>
      </Section>

      <Section title="Line helpers">
        <PropsTable
          rows={[
            ["chartLine(key)", "props", "", "3px round line, monotone, no resting dots. Override type for linear or step"],
            ["chartColorDot(colorOf, { r })", "Line dot", "", "A dot whose color comes from the data point, ringed in the surface"],
            ["chartCookieDot(key, { when, glyph, r })", "Line dot", "", "Points where when is true become a scalloped cookie with an optional SVG path glyph; the rest a small dot"],
            ["chartPillLabel(key, { text, tone, offset })", "LabelList content", "", "A value or name as a pill above its point: inverse or tonal"],
            ["chartCookiePath(cx, cy, r)", "string", "", "The scalloped cookie outline as an SVG path"],
          ]}
        />
      </Section>
    </>
  )
}
