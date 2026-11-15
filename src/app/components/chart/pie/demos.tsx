"use client"

import * as React from "react"
import { Pie, PieChart } from "recharts"

import { Badge } from "@/registry/nelumbo/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/registry/nelumbo/ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  PieActiveSector,
  PieCenter,
  piePillLabel,
  useChartAnimation,
  useChartFocus,
  type ChartConfig,
} from "@/registry/nelumbo/ui/chart"
import { ToggleGroup, ToggleGroupItem } from "@/registry/nelumbo/ui/toggle-group"

/* data (deterministic, same as shadcn's gallery) ------------------- */

const browserConfig = {
  visitors: { label: "Visitors" },
  chrome: { label: "Chrome", color: "var(--blue)" },
  safari: { label: "Safari", color: "var(--orange)" },
  firefox: { label: "Firefox", color: "var(--green)" },
  edge: { label: "Edge", color: "var(--purple)" },
  other: { label: "Other", color: "var(--pink)" },
} satisfies ChartConfig

const browserData = [
  { browser: "chrome", visitors: 275, fill: "var(--color-chrome)" },
  { browser: "safari", visitors: 200, fill: "var(--color-safari)" },
  { browser: "firefox", visitors: 187, fill: "var(--color-firefox)" },
  { browser: "edge", visitors: 173, fill: "var(--color-edge)" },
  { browser: "other", visitors: 90, fill: "var(--color-other)" },
]
const browserTotal = browserData.reduce((a, d) => a + d.visitors, 0)
const fmt = (n: number) => n.toLocaleString("en-US")
const browserSummary = browserData.map((d) => `${browserConfig[d.browser as keyof typeof browserConfig].label} ${d.visitors}`).join(", ")
const pct = (v: number, total: number) => `${Math.round((v / total) * 100)}%`

/* shared frame ----------------------------------------------------- */

const plot = "mx-auto aspect-square w-full max-w-80 [&_.recharts-surface]:overflow-visible"

function PieCard({
  title,
  description,
  footer,
  children,
}: {
  title: string
  description: string
  footer?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <Card className="[--card:var(--surface-container-low)]">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 pt-2">{children}</CardContent>
      {footer && <CardFooter className="flex-wrap">{footer}</CardFooter>}
    </Card>
  )
}

const trend = (
  <>
    <Badge variant="success" icon="trending_up">
      5.2%
    </Badge>
    <span className="type-body-sm text-muted-foreground">more than last month</span>
  </>
)

/* the slice style: gaps and pill ends ------------------------------ */

const slices = { paddingAngle: 4, cornerRadius: 12, stroke: "none" } as const
const tip = <ChartTooltipContent hideLabel nameKey="browser" />

/* Simple ----------------------------------------------------------- */

export function PieSimpleDemo() {
  const motion = useChartAnimation()
  return (
    <PieCard title="Pie Chart" description="Visitors by browser, last 30 days" footer={trend}>
      <ChartContainer config={browserConfig} aria-label={`Visitors by browser: ${browserSummary}`} className={plot}>
        <PieChart>
          <ChartTooltip cursor={false} content={tip} />
          <Pie data={browserData} dataKey="visitors" nameKey="browser" outerRadius="86%" {...slices} {...motion} />
        </PieChart>
      </ChartContainer>
    </PieCard>
  )
}

/* Separator None: one continuous disc ------------------------------ */

export function PieSeparatorNoneDemo() {
  const motion = useChartAnimation()
  return (
    <PieCard title="Pie Chart - Separator None" description="No gaps: one continuous pie">
      <ChartContainer config={browserConfig} aria-label={`Visitors by browser, without separators: ${browserSummary}`} className={plot}>
        <PieChart>
          <ChartTooltip cursor={false} content={tip} />
          <Pie data={browserData} dataKey="visitors" nameKey="browser" outerRadius="86%" stroke="none" paddingAngle={0} cornerRadius={0} {...motion} />
        </PieChart>
      </ChartContainer>
    </PieCard>
  )
}

/* Label: value chips on leader lines ------------------------------- */

export function PieLabelDemo() {
  const motion = useChartAnimation()
  return (
    <PieCard title="Pie Chart - Label" description="The value of each slice, on a chip">
      <ChartContainer config={browserConfig} aria-label={`Visitors by browser with values: ${browserSummary}`} className={plot}>
        <PieChart>
          <ChartTooltip cursor={false} content={tip} />
          <Pie
            data={browserData}
            dataKey="visitors"
            nameKey="browser"
            outerRadius="62%"
            label={piePillLabel({ config: browserConfig })}
            labelLine={false}
            {...slices}
            {...motion}
          />
        </PieChart>
      </ChartContainer>
    </PieCard>
  )
}

/* Custom Label: name and value, with the slice color ---------------- */

export function PieCustomLabelDemo() {
  const motion = useChartAnimation()
  return (
    <PieCard title="Pie Chart - Custom Label" description="Name and value in a chip outside the pie">
      <ChartContainer config={browserConfig} aria-label={`Visitors by browser with names and values: ${browserSummary}`} className={plot}>
        <PieChart>
          <ChartTooltip cursor={false} content={tip} />
          <Pie
            data={browserData}
            dataKey="visitors"
            nameKey="browser"
            outerRadius="56%"
            label={piePillLabel({ config: browserConfig, dot: true, offset: 16, text: (v, name) => `${name} ${v}` })}
            labelLine={false}
            {...slices}
            {...motion}
          />
        </PieChart>
      </ChartContainer>
    </PieCard>
  )
}

/* Label List: names inside the slices ------------------------------ */

export function PieLabelListDemo() {
  const motion = useChartAnimation()
  return (
    <PieCard title="Pie Chart - Label List" description="Each slice carries its own name">
      <ChartContainer config={browserConfig} aria-label={`Visitors by browser with names on the slices: ${browserSummary}`} className={plot}>
        <PieChart>
          <ChartTooltip cursor={false} content={tip} />
          <Pie
            data={browserData}
            dataKey="visitors"
            nameKey="browser"
            outerRadius="92%"
            label={piePillLabel({ config: browserConfig, position: "inside", text: (_, name) => name })}
            labelLine={false}
            {...slices}
            {...motion}
          />
        </PieChart>
      </ChartContainer>
    </PieCard>
  )
}

/* Legend ----------------------------------------------------------- */

export function PieLegendDemo() {
  const motion = useChartAnimation()
  return (
    <PieCard title="Pie Chart - Legend" description="Chips name the slices">
      <ChartContainer config={browserConfig} aria-label={`Visitors by browser with a legend: ${browserSummary}`} className="mx-auto aspect-[4/5] w-full max-w-80">
        <PieChart>
          <ChartTooltip cursor={false} content={tip} />
          <Pie data={browserData} dataKey="visitors" nameKey="browser" outerRadius="80%" {...slices} {...motion} />
          <ChartLegend content={<ChartLegendContent nameKey="browser" />} />
        </PieChart>
      </ChartContainer>
    </PieCard>
  )
}

/* Donut ------------------------------------------------------------ */

const donut = { innerRadius: "56%", outerRadius: "84%", ...slices } as const

export function PieDonutDemo() {
  const motion = useChartAnimation()
  return (
    <PieCard title="Pie Chart - Donut" description="Visitors by browser, last 30 days" footer={trend}>
      <ChartContainer config={browserConfig} aria-label={`Visitors by browser: ${browserSummary}`} className={plot}>
        <PieChart>
          <ChartTooltip cursor={false} content={tip} />
          <Pie data={browserData} dataKey="visitors" nameKey="browser" {...donut} {...motion} />
        </PieChart>
      </ChartContainer>
    </PieCard>
  )
}

/* Donut Active: the slice in focus grows ---------------------------- */

const describeBrowser = (i: number) => {
  const d = browserData[i]
  return d ? `${browserConfig[d.browser as keyof typeof browserConfig].label}: ${fmt(d.visitors)} visitors, ${pct(d.visitors, browserTotal)} of the total` : ""
}

export function PieDonutActiveDemo() {
  const motion = useChartAnimation()
  const focus = useChartFocus({ count: browserData.length, defaultIndex: 0, describe: describeBrowser })
  return (
    <PieCard
      title="Pie Chart - Donut Active"
      description="Hover or tap a slice, or tab to the chart and use the arrow keys"
    >
      <ChartContainer config={browserConfig} focus={focus} aria-label="Visitors by browser, one slice in focus" className={plot}>
        <PieChart>
          <ChartTooltip cursor={false} content={tip} />
          <Pie
            data={browserData}
            dataKey="visitors"
            nameKey="browser"
            activeIndex={focus.index}
            rootTabIndex={-1}
            activeShape={PieActiveSector}
            onMouseEnter={(_: unknown, i: number) => focus.select(i)}
            onClick={(_: unknown, i: number) => focus.select(i)}
            {...donut}
            {...motion}
          />
        </PieChart>
      </ChartContainer>
    </PieCard>
  )
}

/* Donut with Text: the total in the middle -------------------------- */

export function PieDonutTextDemo() {
  const motion = useChartAnimation()
  return (
    <PieCard title="Pie Chart - Donut with Text" description="Total visitors, last 30 days" footer={trend}>
      <div className="relative mx-auto w-full max-w-80">
        <ChartContainer config={browserConfig} aria-label={`${fmt(browserTotal)} visitors by browser: ${browserSummary}`} className={plot}>
          <PieChart>
            <ChartTooltip cursor={false} content={tip} />
            <Pie data={browserData} dataKey="visitors" nameKey="browser" {...donut} {...motion} />
          </PieChart>
        </ChartContainer>
        <PieCenter value={fmt(browserTotal)} label="Visitors" />
      </div>
    </PieCard>
  )
}

/* Stacked: two rings, October inside and November outside ----------- */

const octData = [
  { browser: "chrome", visitors: 240, month: "October", fill: "var(--color-chrome)" },
  { browser: "safari", visitors: 190, month: "October", fill: "var(--color-safari)" },
  { browser: "firefox", visitors: 150, month: "October", fill: "var(--color-firefox)" },
  { browser: "edge", visitors: 160, month: "October", fill: "var(--color-edge)" },
  { browser: "other", visitors: 70, month: "October", fill: "var(--color-other)" },
]
const novData = browserData.map((d) => ({ ...d, month: "November" }))
const sum = (rows: { visitors: number }[]) => rows.reduce((a, r) => a + r.visitors, 0)

export function PieStackedDemo() {
  const motion = useChartAnimation()
  const ring = { dataKey: "visitors", nameKey: "browser", paddingAngle: 4, cornerRadius: 9, stroke: "none" } as const
  return (
    <PieCard title="Pie Chart - Stacked" description="October on the inside, November on the outside">
      <ChartContainer
        config={browserConfig}
        aria-label={`Visitors by browser in two rings. October, ${fmt(sum(octData))} in total: ${octData.map((d) => d.visitors).join(", ")}. November, ${fmt(sum(novData))}: ${novData.map((d) => d.visitors).join(", ")}`}
        className="mx-auto aspect-[4/5] w-full max-w-80 [&_.recharts-surface]:overflow-visible"
      >
        <PieChart>
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent nameKey="browser" labelFormatter={(_, p) => p?.[0]?.payload?.month} />}
          />
          <Pie data={octData} innerRadius="30%" outerRadius="58%" {...ring} {...motion} />
          <Pie data={novData} innerRadius="63%" outerRadius="88%" {...ring} {...motion} />
          <ChartLegend content={<ChartLegendContent keys={["chrome", "safari", "firefox", "edge", "other"]} />} />
        </PieChart>
      </ChartContainer>
    </PieCard>
  )
}

/* Interactive: pick a month ----------------------------------------- */

const monthConfig = {
  visitors: { label: "Visitors" },
  january: { label: "January", color: "var(--blue)" },
  february: { label: "February", color: "var(--orange)" },
  march: { label: "March", color: "var(--green)" },
  april: { label: "April", color: "var(--purple)" },
  may: { label: "May", color: "var(--pink)" },
} satisfies ChartConfig

const monthData = [
  { month: "january", short: "Jan", visitors: 186, fill: "var(--color-january)" },
  { month: "february", short: "Feb", visitors: 305, fill: "var(--color-february)" },
  { month: "march", short: "Mar", visitors: 237, fill: "var(--color-march)" },
  { month: "april", short: "Apr", visitors: 173, fill: "var(--color-april)" },
  { month: "may", short: "May", visitors: 209, fill: "var(--color-may)" },
]
const monthTotal = sum(monthData)

export function PieInteractiveDemo() {
  const motion = useChartAnimation()
  const focus = useChartFocus({
    count: monthData.length,
    defaultIndex: 1,
    describe: (i) => {
      const d = monthData[i]
      return d ? `${monthConfig[d.month as keyof typeof monthConfig].label}: ${fmt(d.visitors)} visitors, ${pct(d.visitors, monthTotal)} of the total` : ""
    },
  })
  // hovering previews a slice; the selector and the center follow the one picked
  const active = monthData[focus.selected]
  return (
    <PieCard title="Pie Chart - Interactive" description="Pick a month; its slice grows and the center shows its visitors">
      <ToggleGroup
        type="single"
        value={active.month}
        onValueChange={(v) => {
          const i = monthData.findIndex((d) => d.month === v)
          if (i >= 0) focus.select(i)
        }}
        aria-label="Month"
        className="w-full *:flex-1"
      >
        {monthData.map((d) => (
          <ToggleGroupItem key={d.month} value={d.month} aria-label={monthConfig[d.month as keyof typeof monthConfig].label}>
            {d.short}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <div className="relative mx-auto w-full max-w-80">
        <ChartContainer config={monthConfig} focus={focus} aria-label="Desktop visitors by month, January to May" className={plot}>
          <PieChart>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel nameKey="month" />} />
            <Pie
              data={monthData}
              dataKey="visitors"
              nameKey="month"
              activeIndex={focus.selected}
              rootTabIndex={-1}
              activeShape={PieActiveSector}
              onClick={(_: unknown, i: number) => focus.select(i)}
              {...donut}
              {...motion}
            />
          </PieChart>
        </ChartContainer>
        <PieCenter value={fmt(active.visitors)} label={monthConfig[active.month as keyof typeof monthConfig].label} />
      </div>
    </PieCard>
  )
}
