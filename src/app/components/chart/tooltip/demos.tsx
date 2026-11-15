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

/* A week of workouts: minutes running and swimming (deterministic) ---- */

const week = [
  { day: "Mon", date: "Monday, Nov 9", running: 42, swimming: 18 },
  { day: "Tue", date: "Tuesday, Nov 10", running: 28, swimming: 24 },
  { day: "Wed", date: "Wednesday, Nov 11", running: 0, swimming: 36 },
  { day: "Thu", date: "Thursday, Nov 12", running: 51, swimming: 12 },
  { day: "Fri", date: "Friday, Nov 13", running: 34, swimming: 30 },
  { day: "Sat", date: "Saturday, Nov 14", running: 64, swimming: 22 },
  { day: "Sun", date: "Sunday, Nov 15", running: 38, swimming: 40 },
]
type Day = (typeof week)[number]

const config = {
  running: { label: "Running", color: "var(--blue)" },
  swimming: { label: "Swimming", color: "var(--cyan)" },
} satisfies ChartConfig

const iconConfig = {
  running: { label: "Running", color: "var(--blue)" },
  swimming: { label: "Swimming", color: "var(--cyan)" },
} satisfies ChartConfig

const icons = {
  running: <Icon name="directions_run" fill />,
  swimming: <Icon name="pool" fill />,
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
    describe: (i) => `${week[i].date}: ${week[i].running} minutes running, ${week[i].swimming} minutes swimming`,
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
          aria-label={`${title}: minutes running and swimming each day, Nov 9 to 15. Arrow keys move the tooltip.`}
          className="aspect-auto h-64"
        >
          <BarChart key={String(laidOut)} data={week} margin={{ top: 8, right: 0, left: 0, bottom: 0 }} barCategoryGap="14%" {...focus.chartProps}>
            <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={10} />
            <YAxis orientation="right" tickLine={false} axisLine={false} width={34} domain={[0, 100]} ticks={[0, 50, 100]} tick={chartTicks()} />
            <ChartTooltip cursor={false} active defaultIndex={focus.index} content={tooltip} wrapperStyle={{ outline: "none" }} />
            <Bar dataKey="running" stackId="a" fill="var(--color-running)" {...chartSegment} {...motion} />
            <Bar dataKey="swimming" stackId="a" fill="var(--color-swimming)" {...chartSegment} {...motion} />
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
  activities: { label: "Activities" },
} satisfies ChartConfig

export function CustomLabelDemo() {
  return (
    <TooltipCard
      title="Tooltip - Custom Label"
      description="The heading comes from a config entry through labelKey."
      chartConfig={customConfig}
      tooltip={<ChartTooltipContent labelKey="activities" indicator="line" />}
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
      tooltip={<ChartTooltipContent formatter={chartTooltipFormatter(config, { unit: "min" })} />}
    />
  )
}

export function IconsDemo() {
  return (
    <TooltipCard
      title="Tooltip - Icons"
      description="A Material Symbol in a tonal chip for each series."
      chartConfig={iconConfig}
      tooltip={<ChartTooltipContent formatter={chartTooltipFormatter(iconConfig, { unit: "min", icons })} />}
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
          formatter={chartTooltipFormatter(config, { unit: "min", total: true, totalLabel: "Active time" })}
        />
      }
    />
  )
}
