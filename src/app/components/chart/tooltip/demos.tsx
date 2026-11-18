"use client"

import * as React from "react"
import { Bar, BarChart, ReferenceLine, XAxis, YAxis } from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/registry/nelumbo/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  chartFocusLine,
  chartSegment,
  chartTicks,
  chartTooltipFormatter,
  useChartAnimation,
  useChartFocus,
  type ChartConfig,
} from "@/registry/nelumbo/ui/chart"
import { Icon } from "@/registry/nelumbo/ui/icon"

/* A week of nucleic acid extractions: samples through each kit per day (illustrative) */

const week = [
  { day: "Mon", date: "Monday, Nov 9", dna: 42, rna: 18 },
  { day: "Tue", date: "Tuesday, Nov 10", dna: 28, rna: 24 },
  { day: "Wed", date: "Wednesday, Nov 11", dna: 0, rna: 36 },
  { day: "Thu", date: "Thursday, Nov 12", dna: 51, rna: 12 },
  { day: "Fri", date: "Friday, Nov 13", dna: 34, rna: 30 },
  { day: "Sat", date: "Saturday, Nov 14", dna: 16, rna: 8 },
  { day: "Sun", date: "Sunday, Nov 15", dna: 0, rna: 6 },
]
type Day = (typeof week)[number]

const config = {
  dna: { label: "DNA", color: "var(--blue)" },
  rna: { label: "RNA", color: "var(--cyan)" },
} satisfies ChartConfig

const iconConfig = config

const icons = {
  dna: <Icon name="genetics" fill />,
  rna: <Icon name="labs" fill />,
}

/** One card: a stacked pill chart with its tooltip held open on the point in focus. */
function TooltipCard({
  title,
  description,
  chartConfig = config,
  tooltip,
}: {
  title: string
  description: string
  chartConfig?: ChartConfig
  /** The ChartTooltipContent element. */
  tooltip: React.ReactElement
}) {
  const motion = useChartAnimation()
  const focus = useChartFocus({
    count: week.length,
    defaultIndex: 4,
    describe: (i) => `${week[i].date}: ${week[i].dna} DNA and ${week[i].rna} RNA extractions`,
  })
  const point: Day = week[Math.max(0, focus.index)]
  // Recharts only places a default tooltip once the plot has laid out: remount it after the first paint
  const [laidOut, setLaidOut] = React.useState(false)
  React.useEffect(() => {
    const t = setTimeout(() => setLaidOut(true), 120)
    return () => clearTimeout(t)
  }, [])

  return (
    <Card className="[--card:var(--surface-container-low)]">
      <CardHeader>
        <CardTitle className="type-title-md">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          focus={focus}
          aria-label={`${title}: DNA and RNA extractions each day, Nov 9 to 15. Arrow keys move the tooltip.`}
          className="aspect-auto h-64"
        >
          <BarChart key={String(laidOut)} data={week} margin={{ top: 8, right: 0, left: 0, bottom: 0 }} barCategoryGap="14%" {...focus.chartProps}>
            <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={10} />
            <YAxis orientation="right" tickLine={false} axisLine={false} width={34} domain={[0, 100]} ticks={[0, 50, 100]} tick={chartTicks()} />
            <ChartTooltip cursor={false} active defaultIndex={focus.index} content={tooltip} wrapperStyle={{ outline: "none" }} />
            <Bar dataKey="dna" stackId="a" fill="var(--color-dna)" {...chartSegment} {...motion} />
            <Bar dataKey="rna" stackId="a" fill="var(--color-rna)" {...chartSegment} {...motion} />
            <ReferenceLine x={point.day} {...chartFocusLine} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export function DefaultTooltipDemo() {
  return <TooltipCard title="Tooltip - Default" description="Dot indicators, the day as the heading." tooltip={<ChartTooltipContent />} />
}

export function LineIndicatorDemo() {
  return <TooltipCard title="Tooltip - Line Indicator" description="A tall bar marks each series." tooltip={<ChartTooltipContent indicator="line" />} />
}

export function NoIndicatorDemo() {
  return <TooltipCard title="Tooltip - No Indicator" description="Names and values only." tooltip={<ChartTooltipContent hideIndicator />} />
}

const customConfig = {
  ...config,
  extractions: { label: "Extractions" },
} satisfies ChartConfig

export function CustomLabelDemo() {
  return (
    <TooltipCard
      title="Tooltip - Custom Label"
      description="The heading comes from a config entry through labelKey."
      chartConfig={customConfig}
      tooltip={<ChartTooltipContent labelKey="extractions" indicator="line" />}
    />
  )
}

export function LabelFormatterDemo() {
  return (
    <TooltipCard
      title="Tooltip - Label Formatter"
      description="labelFormatter spells out the full date."
      tooltip={<ChartTooltipContent labelFormatter={(_, payload) => (payload?.[0]?.payload as Day | undefined)?.date} />}
    />
  )
}

export function NoLabelDemo() {
  return <TooltipCard title="Tooltip - No Label" description="hideLabel drops the heading." tooltip={<ChartTooltipContent hideLabel />} />
}

export function FormatterDemo() {
  return (
    <TooltipCard
      title="Tooltip - Formatter"
      description="Each value carries its unit."
      tooltip={<ChartTooltipContent formatter={chartTooltipFormatter(config, { unit: "samples" })} />}
    />
  )
}

export function IconsDemo() {
  return (
    <TooltipCard
      title="Tooltip - Icons"
      description="A Material Symbol in a tonal chip for each series."
      chartConfig={iconConfig}
      tooltip={<ChartTooltipContent formatter={chartTooltipFormatter(iconConfig, { unit: "samples", icons })} />}
    />
  )
}

export function AdvancedDemo() {
  return (
    <TooltipCard
      title="Tooltip - Advanced"
      description="A per-row formatter with a total underneath."
      tooltip={
        <ChartTooltipContent
          labelFormatter={(_, payload) => (payload?.[0]?.payload as Day | undefined)?.date}
          formatter={chartTooltipFormatter(config, { unit: "samples", total: true, totalLabel: "Extractions" })}
        />
      }
    />
  )
}
