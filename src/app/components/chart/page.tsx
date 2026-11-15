"use client"

import * as React from "react"
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Label, Line, LineChart, Pie, PieChart, PolarAngleAxis, RadialBar, RadialBarChart, XAxis, YAxis } from "recharts"

import { Badge } from "@/registry/nelumbo/ui/badge"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/registry/nelumbo/ui/card"
import {
  ChartContainer,
  ChartGradient,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  chartActiveDot,
  chartBarRadius,
  chartColorNames,
  chartDot,
  useChartAnimation,
  useSeriesVisibility,
  type ChartConfig,
} from "@/registry/nelumbo/ui/chart"
import { Code, PageHeader, Preview, PropsTable, Section } from "@/components/docs/primitives"

const compact = (v: number) => (v >= 1000 ? `${v / 1000}k` : String(v))

// 1. Area, stacked: monthly active users by platform (thousands)
const usersData = [
  { month: "Jan", web: 18.2, ios: 11.4, android: 9.1 },
  { month: "Feb", web: 19.0, ios: 12.1, android: 9.8 },
  { month: "Mar", web: 20.4, ios: 13.6, android: 10.9 },
  { month: "Apr", web: 20.1, ios: 14.8, android: 12.2 },
  { month: "May", web: 21.7, ios: 16.2, android: 13.1 },
  { month: "Jun", web: 22.3, ios: 17.9, android: 14.6 },
  { month: "Jul", web: 21.9, ios: 19.1, android: 15.8 },
  { month: "Aug", web: 22.8, ios: 20.4, android: 16.4 },
  { month: "Sep", web: 24.6, ios: 22.0, android: 17.9 },
  { month: "Oct", web: 25.9, ios: 23.7, android: 19.2 },
  { month: "Nov", web: 27.1, ios: 25.2, android: 20.8 },
]
const usersConfig = {
  web: { label: "Web" },
  ios: { label: "iOS" },
  android: { label: "Android" },
} satisfies ChartConfig

// 2. Bar, grouped: orders by channel per month
const ordersData = [
  { month: "Jun", online: 1840, store: 1210 },
  { month: "Jul", online: 2010, store: 1150 },
  { month: "Aug", online: 2230, store: 1290 },
  { month: "Sep", online: 2460, store: 1380 },
  { month: "Oct", online: 2790, store: 1340 },
  { month: "Nov", online: 3320, store: 1520 },
]
const ordersConfig = { online: { label: "Online" }, store: { label: "In store" } } satisfies ChartConfig

// 3. Bar, stacked: support tickets by channel
const ticketData = [
  { day: "Mon", email: 64, chat: 92, phone: 31 },
  { day: "Tue", email: 71, chat: 88, phone: 28 },
  { day: "Wed", email: 58, chat: 101, phone: 35 },
  { day: "Thu", email: 66, chat: 97, phone: 24 },
  { day: "Fri", email: 49, chat: 84, phone: 22 },
  { day: "Sat", email: 21, chat: 43, phone: 9 },
  { day: "Sun", email: 17, chat: 38, phone: 7 },
]
const ticketConfig = { email: { label: "Email" }, chat: { label: "Chat" }, phone: { label: "Phone" } } satisfies ChartConfig

// 4. Line: API latency (ms)
const latencyData = [
  { day: "Mon", p50: 112, p95: 284 },
  { day: "Tue", p50: 108, p95: 301 },
  { day: "Wed", p50: 121, p95: 342 },
  { day: "Thu", p50: 104, p95: 268 },
  { day: "Fri", p50: 99, p95: 251 },
  { day: "Sat", p50: 94, p95: 233 },
  { day: "Sun", p50: 91, p95: 226 },
]
const latencyConfig = { p50: { label: "Median" }, p95: { label: "95th percentile" } } satisfies ChartConfig

// 5. Donut: traffic sources
const trafficData = [
  { source: "search", visits: 7420, fill: "var(--color-search)" },
  { source: "direct", visits: 5180, fill: "var(--color-direct)" },
  { source: "social", visits: 3260, fill: "var(--color-social)" },
  { source: "referral", visits: 1830, fill: "var(--color-referral)" },
  { source: "email", visits: 960, fill: "var(--color-email)" },
]
const trafficConfig = {
  visits: { label: "Visits" },
  search: { label: "Search" },
  direct: { label: "Direct" },
  social: { label: "Social" },
  referral: { label: "Referral" },
  email: { label: "Email" },
} satisfies ChartConfig
const trafficTotal = trafficData.reduce((s, d) => s + d.visits, 0)

// 6. Radial: quarterly goals
const goalData = [
  { goal: "revenue", pct: 86, fill: "var(--color-revenue)" },
  { goal: "signups", pct: 71, fill: "var(--color-signups)" },
  { goal: "retention", pct: 64, fill: "var(--color-retention)" },
  { goal: "nps", pct: 48, fill: "var(--color-nps)" },
]
const goalConfig = {
  pct: { label: "Of target" },
  revenue: { label: "Revenue" },
  signups: { label: "Sign-ups" },
  retention: { label: "Retention" },
  nps: { label: "NPS" },
} satisfies ChartConfig

function Trend({ up, children }: { up: boolean; children: React.ReactNode }) {
  return (
    <Badge variant={up ? "success" : "destructive"} icon={up ? "trending_up" : "trending_down"}>
      {children}
    </Badge>
  )
}

function AreaDemo() {
  const motion = useChartAnimation()
  const { hiddenKeys, toggle, isHidden } = useSeriesVisibility()
  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly active users</CardTitle>
        <CardDescription>Stacked by platform, in thousands</CardDescription>
        <CardAction>
          <Trend up>+14.8%</Trend>
        </CardAction>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={usersConfig}
          aria-label="Stacked area chart of monthly active users in thousands, January to November. Total grew from 38.7 to 73.1 thousand, led by iOS and Android."
          className="aspect-auto h-72"
        >
          <AreaChart data={usersData} margin={{ left: -8, right: 8, top: 8 }}>
            <defs>
              {Object.keys(usersConfig).map((k) => (
                <ChartGradient key={k} id={`fill-${k}`} k={k} />
              ))}
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={10} interval="preserveStartEnd" minTickGap={16} />
            <YAxis tickLine={false} axisLine={false} width={40} tickFormatter={(v) => `${v}k`} />
            <ChartTooltip content={<ChartTooltipContent indicator="dot" labelFormatter={(v) => `${v} 2026`} formatter={undefined} />} />
            {(["android", "ios", "web"] as const).map((k) => (
              <Area
                key={k}
                dataKey={k}
                type="monotone"
                stackId="users"
                hide={isHidden(k)}
                stroke={`var(--color-${k})`}
                strokeWidth={2}
                fill={`url(#fill-${k})`}
                activeDot={chartActiveDot(k)}
                {...motion}
              />
            ))}
            <ChartLegend content={<ChartLegendContent hiddenKeys={hiddenKeys} onToggle={toggle} />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

function GroupedBarDemo() {
  const motion = useChartAnimation()
  return (
    <Card>
      <CardHeader>
        <CardTitle>Orders by channel</CardTitle>
        <CardDescription>Last six months</CardDescription>
        <CardAction>
          <Trend up>+22.6%</Trend>
        </CardAction>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={ordersConfig}
          aria-label="Grouped bar chart of orders per month, June to November. Online orders rose from 1,840 to 3,320 while in-store orders stayed between 1,150 and 1,520."
          className="aspect-auto h-64"
        >
          <BarChart data={ordersData} margin={{ left: -8, right: 4, top: 8 }} barGap={3} barCategoryGap="22%">
            <CartesianGrid vertical={false} />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={10} />
            <YAxis tickLine={false} axisLine={false} width={40} tickFormatter={compact} domain={[0, 4000]} ticks={[0, 1000, 2000, 3000, 4000]} />
            <ChartTooltip cursor content={<ChartTooltipContent indicator="dot" />} />
            <Bar dataKey="online" fill="var(--color-online)" radius={chartBarRadius} maxBarSize={22} {...motion} />
            <Bar dataKey="store" fill="var(--color-store)" radius={chartBarRadius} maxBarSize={22} {...motion} />
            <ChartLegend content={<ChartLegendContent />} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

function StackedBarDemo() {
  const motion = useChartAnimation()
  const { hiddenKeys, toggle, isHidden } = useSeriesVisibility()
  const keys = ["email", "chat", "phone"] as const
  const visible = keys.filter((k) => !isHidden(k))
  return (
    <Card>
      <CardHeader>
        <CardTitle>Support tickets</CardTitle>
        <CardDescription>This week, by channel. Click a chip to hide it</CardDescription>
        <CardAction>
          <Trend up={false}>-6.1%</Trend>
        </CardAction>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={ticketConfig}
          aria-label="Stacked bar chart of support tickets per weekday by channel. Chat is the busiest channel, peaking at 101 on Wednesday; weekends are quiet."
          className="aspect-auto h-64"
        >
          <BarChart data={ticketData} margin={{ left: -8, right: 4, top: 8 }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={10} />
            <YAxis tickLine={false} axisLine={false} width={40} />
            <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
            {keys.map((k) => (
              <Bar
                key={k}
                dataKey={k}
                stackId="t"
                hide={isHidden(k)}
                fill={`var(--color-${k})`}
                stroke="var(--chart-surface)"
                strokeWidth={2}
                maxBarSize={28}
                radius={k === visible[visible.length - 1] ? chartBarRadius : 0}
                {...motion}
              />
            ))}
            <ChartLegend content={<ChartLegendContent hiddenKeys={hiddenKeys} onToggle={toggle} />} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

function LineDemo() {
  const motion = useChartAnimation()
  return (
    <Card>
      <CardHeader>
        <CardTitle>API latency</CardTitle>
        <CardDescription>Milliseconds per request, this week</CardDescription>
        <CardAction>
          <Trend up>-20.4%</Trend>
        </CardAction>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={latencyConfig}
          aria-label="Line chart of API latency in milliseconds across the week. Median fell from 112 to 91, the 95th percentile from 284 to 226, with a spike to 342 on Wednesday."
          className="aspect-auto h-64"
        >
          <LineChart data={latencyData} margin={{ left: -8, right: 12, top: 8 }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={10} />
            <YAxis tickLine={false} axisLine={false} width={40} domain={[0, 400]} ticks={[0, 100, 200, 300, 400]} />
            <ChartTooltip content={<ChartTooltipContent indicator="line" labelFormatter={(v) => `${v}`} />} />
            <Line dataKey="p95" type="monotone" stroke="var(--color-p95)" strokeWidth={2} dot={chartDot("p95")} activeDot={chartActiveDot("p95")} {...motion} />
            <Line dataKey="p50" type="monotone" stroke="var(--color-p50)" strokeWidth={2} dot={chartDot("p50")} activeDot={chartActiveDot("p50")} {...motion} />
            <ChartLegend content={<ChartLegendContent />} />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

function DonutDemo() {
  const motion = useChartAnimation()
  return (
    <Card>
      <CardHeader>
        <CardTitle>Traffic sources</CardTitle>
        <CardDescription>Visits this month</CardDescription>
        <CardAction>
          <Trend up>+9.3%</Trend>
        </CardAction>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={trafficConfig}
          aria-label="Donut chart of 18,650 visits by source: search 40%, direct 28%, social 17%, referral 10%, email 5%."
          className="aspect-auto h-72"
        >
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent hideLabel nameKey="source" />} />
            <Pie data={trafficData} dataKey="visits" nameKey="source" innerRadius="62%" outerRadius="92%" paddingAngle={2} cornerRadius={6} stroke="none" {...motion}>
              <Label
                content={({ viewBox }) =>
                  viewBox && "cx" in viewBox ? (
                    <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                      <tspan x={viewBox.cx} y={(viewBox.cy ?? 0) - 6} className="fill-foreground type-headline-md font-semibold tabular-nums">
                        {trafficTotal.toLocaleString()}
                      </tspan>
                      <tspan x={viewBox.cx} y={(viewBox.cy ?? 0) + 18} className="fill-muted-foreground type-label-md">
                        visits
                      </tspan>
                    </text>
                  ) : null
                }
              />
            </Pie>
            <ChartLegend content={<ChartLegendContent nameKey="source" />} />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

function RadialDemo() {
  const motion = useChartAnimation()
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quarterly goals</CardTitle>
        <CardDescription>Progress toward each target</CardDescription>
        <CardAction>
          <Trend up>On track</Trend>
        </CardAction>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={goalConfig}
          aria-label="Radial chart of progress toward quarterly targets: revenue 86%, sign-ups 71%, retention 64%, NPS 48%."
          className="aspect-auto h-72"
        >
          <RadialBarChart data={goalData} innerRadius="28%" outerRadius="100%" barSize={14} startAngle={90} endAngle={-270}>
            <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
            <ChartTooltip content={<ChartTooltipContent hideLabel nameKey="goal" formatter={undefined} />} />
            <RadialBar dataKey="pct" background cornerRadius={8} {...motion} />
            <ChartLegend content={<ChartLegendContent nameKey="goal" />} />
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

function IndicatorDemo({ indicator }: { indicator: "dot" | "line" | "dashed" }) {
  const motion = useChartAnimation()
  return (
    <ChartContainer config={latencyConfig} aria-label={`Bar chart of median latency by day, tooltip with a ${indicator} indicator`} className="aspect-auto h-40">
      <BarChart data={latencyData} margin={{ left: -24, right: 4, top: 4 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={8} />
        <ChartTooltip content={<ChartTooltipContent indicator={indicator} hideLabel={indicator === "dashed"} />} />
        <Bar dataKey="p50" fill="var(--color-p50)" radius={chartBarRadius} maxBarSize={18} {...motion} />
      </BarChart>
    </ChartContainer>
  )
}

export default function ChartPage() {
  return (
    <>
      <PageHeader eyebrow="Component 51" title="Chart">
        Recharts charts that wear Nelumbo: faint horizontal grid, quiet label-sm axes, rounded bars, a raised popover
        tooltip and series colors from the accent roles. API-compatible with shadcn&apos;s Chart.
      </PageHeader>

      <Section title="Install">
        <Code>{`npx shadcn@latest add @nelumbo/chart`}</Code>
      </Section>

      <Section
        title="Area"
        description="Stacked areas with a gradient fill and a 2px line. The legend chips are an interactive Nelumbo addition: click one to hide a series (pass hiddenKeys and onToggle to ChartLegendContent). The hovered dot gets a ring in the card surface."
      >
        <Preview className="block">
          <AreaDemo />
        </Preview>
      </Section>

      <Section
        title="Bar"
        description="Bars cap at a slim width and round only at the free end. Grouped bars sit side by side; stacked segments are separated by a 2px gap in the surface color, and only the top segment rounds."
      >
        <Preview className="grid items-stretch gap-4 lg:grid-cols-2">
          <GroupedBarDemo />
          <StackedBarDemo />
        </Preview>
      </Section>

      <Section title="Line" description="Lines with surface-ringed dots. The tooltip glides between points on a spring and the cursor is a dotted hairline.">
        <Preview className="block">
          <LineDemo />
        </Preview>
      </Section>

      <Section
        title="Pie, donut and radial"
        description="Slices are separated by a gap and rounded corners. Put a total in the middle of a donut with Recharts' Label. Radial bars sit on a muted track."
      >
        <Preview className="grid items-stretch gap-4 lg:grid-cols-2">
          <DonutDemo />
          <RadialDemo />
        </Preview>
      </Section>

      <Section title="Tooltip indicators" description='indicator="dot" (default), "line" or "dashed". hideLabel drops the heading, hideIndicator the marker.'>
        <Preview className="grid gap-4 md:grid-cols-3">
          {(["dot", "line", "dashed"] as const).map((i) => (
            <Card key={i} size="sm">
              <CardHeader>
                <CardTitle>{i}</CardTitle>
              </CardHeader>
              <CardContent>
                <IndicatorDemo indicator={i} />
              </CardContent>
            </Card>
          ))}
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
            ["chartBarRadius, chartDot(key), chartActiveDot(key), ChartGradient", "", "", "Helpers for the Nelumbo marks"],
            ["chartColors", "string[]", "", "var(--blue), var(--orange), var(--green), ... in series order"],
          ]}
        />
      </Section>
    </>
  )
}
