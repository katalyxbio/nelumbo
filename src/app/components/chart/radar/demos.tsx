"use client"

import * as React from "react"
import { Customized, PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart } from "recharts"

import { Badge } from "@/registry/nelumbo/ui/badge"
import { Card, CardContent } from "@/registry/nelumbo/ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartReadout,
  ChartTooltip,
  ChartTooltipContent,
  RadarFocus,
  RadarRings,
  radarAxisTick,
  radarGrid,
  radarRadiusTick,
  radarShape,
  useChartAnimation,
  useChartFocus,
  useSeriesVisibility,
  type ChartConfig,
} from "@/registry/nelumbo/ui/chart"
import { Icon } from "@/registry/nelumbo/ui/icon"

/* data (shadcn's: visitors by month, deterministic) ----------------- */

const months = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 273, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
]
const N = months.length
const DOMAIN: [number, number] = [0, 320]
const fmt = (n: number) => n.toLocaleString("en-US")

const single = { desktop: { label: "Desktop", color: "var(--blue)" } } satisfies ChartConfig
const double = {
  desktop: { label: "Desktop", color: "var(--blue)" },
  mobile: { label: "Mobile", color: "var(--orange)" },
} satisfies ChartConfig

const DesktopIcon = () => <Icon name="desktop_windows" style={{ ["--icon-size" as string]: "0.875rem" }} />
const MobileIcon = () => <Icon name="smartphone" style={{ ["--icon-size" as string]: "0.875rem" }} />
const iconConfig = {
  desktop: { label: "Desktop", color: "var(--blue)", icon: DesktopIcon },
  mobile: { label: "Mobile", color: "var(--orange)", icon: MobileIcon },
} satisfies ChartConfig

/* the card every variant sits in ------------------------------------ */

function RadarCard({
  title,
  description,
  trend = "up",
  children,
}: {
  title: string
  description: string
  trend?: "up" | "down"
  children: React.ReactNode
}) {
  return (
    <Card className="[--card:var(--surface-container-low)]">
      <CardContent className="grid gap-4 pt-6">
        <div className="grid gap-1">
          <h3 className="type-title-md">{title}</h3>
          <p className="type-body-md text-muted-foreground">{description}</p>
        </div>
        {children}
        <div className="flex flex-wrap items-center gap-2 type-body-md text-muted-foreground">
          <Badge variant={trend === "up" ? "success" : "destructive"} icon={trend === "up" ? "trending_up" : "trending_down"}>
            {trend === "up" ? "+5.2%" : "-2.1%"}
          </Badge>
          <span>this month, January to June 2026</span>
        </div>
      </CardContent>
    </Card>
  )
}

const chartClass = "mx-auto aspect-square max-h-[340px]"
const margin = { top: 22, right: 38, bottom: 22, left: 38 }
const chartClassLegend = "mx-auto aspect-[10/11] max-h-[360px]"
const polarLegend = { outerRadius: "74%", margin: { ...margin, bottom: 60 } } as const
const polar = { outerRadius: "74%", margin } as const
const hidden = { domain: DOMAIN, tick: false, axisLine: false, tickLine: false } as const
const tooltip = <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />

/* Default: the focused axis gets a spoke, a ring and a readout ------- */

export function RadarDefault() {
  const motion = useChartAnimation()
  const total = months.reduce((s, m) => s + m.desktop, 0)
  const focus = useChartFocus({
    count: N,
    defaultIndex: -1,
    describe: (i) => (i < 0 ? `Six months, ${fmt(total)} visitors` : `${months[i].month}: ${fmt(months[i].desktop)} visitors`),
  })
  const m = focus.index >= 0 ? months[focus.index] : null
  return (
    <Card className="[--card:var(--surface-container-low)]">
      <CardContent className="grid gap-4 pt-6">
        <ChartReadout
          value={m ? fmt(m.desktop) : fmt(total)}
          unit="visitors"
          label={m ? m.month : "January to June 2026"}
          detail={m ? `${((m.desktop / total) * 100).toFixed(1)}% of the six month total` : "Hover an axis, or tab here and use the arrow keys."}
          onClear={focus.isDefault ? undefined : focus.reset}
        />
        <ChartContainer config={single} focus={focus} aria-label="Radar chart: desktop visitors for each month from January to June" className={chartClass}>
          <RadarChart data={months} {...polar} {...focus.chartProps}>
            <PolarGrid {...radarGrid} />
            <PolarAngleAxis dataKey="month" tick={radarAxisTick({ focus: focus.index })} />
            <PolarRadiusAxis {...hidden} />
            <ChartTooltip cursor={false} content={() => null} />
            <Radar {...radarShape("desktop", { dots: false })} {...motion} />
            <Customized component={<RadarFocus count={N} index={focus.index} domain={DOMAIN} values={m ? { desktop: m.desktop } : {}} />} />
          </RadarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

/* Dots, Lines Only -------------------------------------------------- */

export function RadarDots() {
  const motion = useChartAnimation()
  return (
    <RadarCard title="Radar chart, Dots" description="Showing total visitors for the last 6 months">
      <ChartContainer config={single} aria-label="Radar chart with dots: desktop visitors for each month" className={chartClass}>
        <RadarChart data={months} {...polar}>
          <PolarGrid {...radarGrid} />
          <PolarAngleAxis dataKey="month" tick={radarAxisTick()} />
          <PolarRadiusAxis {...hidden} />
          {tooltip}
          <Radar {...radarShape("desktop")} {...motion} />
        </RadarChart>
      </ChartContainer>
    </RadarCard>
  )
}

export function RadarLinesOnly() {
  const motion = useChartAnimation()
  return (
    <RadarCard title="Radar chart, Lines Only" description="Desktop and mobile visitors, outlines without fill" trend="down">
      <ChartContainer config={double} aria-label="Radar chart with outlines only: desktop and mobile visitors for each month" className={chartClassLegend}>
        <RadarChart data={months} {...polarLegend}>
          <PolarGrid {...radarGrid} />
          <PolarAngleAxis dataKey="month" tick={radarAxisTick()} />
          <PolarRadiusAxis {...hidden} />
          {tooltip}
          <Radar {...radarShape("desktop", { fill: 0, dots: false })} {...motion} />
          <Radar {...radarShape("mobile", { fill: 0, dots: false })} {...motion} />
          <ChartLegend verticalAlign="bottom" wrapperStyle={{ bottom: 0 }} content={<ChartLegendContent />} />
        </RadarChart>
      </ChartContainer>
    </RadarCard>
  )
}

/* Custom Label: the value under the axis name ----------------------- */

export function RadarCustomLabel() {
  const motion = useChartAnimation()
  return (
    <RadarCard title="Radar chart, Custom Label" description="Each axis shows its value under the month">
      <ChartContainer config={single} aria-label="Radar chart with value labels: desktop visitors for each month" className={chartClass}>
        <RadarChart data={months} outerRadius="66%" margin={{ top: 30, right: 44, bottom: 34, left: 44 }}>
          <PolarGrid {...radarGrid} />
          <PolarAngleAxis dataKey="month" tick={radarAxisTick({ values: months.map((m) => m.desktop) })} />
          <PolarRadiusAxis {...hidden} />
          <Radar {...radarShape("desktop")} {...motion} />
        </RadarChart>
      </ChartContainer>
    </RadarCard>
  )
}

/* Grids ------------------------------------------------------------- */

type GridKind = "custom" | "none" | "circle" | "circle-no-lines" | "circle-filled" | "filled"

const gridMeta: Record<GridKind, { title: string; description: string }> = {
  custom: { title: "Radar chart, Grid Custom", description: "Three dotted rings in the series color, no spokes" },
  none: { title: "Radar chart, Grid None", description: "No grid, the polygon and its dots carry the chart" },
  circle: { title: "Radar chart, Grid Circle", description: "Round dotted rings with spokes" },
  "circle-no-lines": { title: "Radar chart, Grid Circle No Lines", description: "Round dotted rings, spokes removed" },
  "circle-filled": { title: "Radar chart, Grid Circle Filled", description: "Alternating tonal rings behind the polygon" },
  filled: { title: "Radar chart, Grid Filled", description: "One tonal body with dotted rings and spokes on top" },
}

export function RadarGridDemo({ kind }: { kind: GridKind }) {
  const motion = useChartAnimation()
  const color = "var(--color-desktop)"
  const meta = gridMeta[kind]
  let grid: React.ReactNode = null
  if (kind === "custom") grid = <Customized component={<RadarRings count={N} rings={3} spokes={false} color={color} />} />
  if (kind === "circle") grid = <PolarGrid {...radarGrid} gridType="circle" />
  if (kind === "circle-no-lines") grid = <PolarGrid {...radarGrid} gridType="circle" radialLines={false} />
  if (kind === "circle-filled") grid = <Customized component={<RadarRings count={N} shape="circle" rings={4} fill="tonal" spokes={false} color={color} />} />
  if (kind === "filled") grid = <Customized component={<RadarRings count={N} rings={4} fill="flat" color={color} />} />
  return (
    <RadarCard title={meta.title} description={meta.description}>
      <ChartContainer config={single} aria-label={`Radar chart, ${meta.title.replace("Radar chart, ", "").toLowerCase()}: desktop visitors for each month`} className={chartClass}>
        <RadarChart data={months} {...polar}>
          {grid}
          <PolarAngleAxis dataKey="month" tick={radarAxisTick()} />
          <PolarRadiusAxis {...hidden} />
          {tooltip}
          <Radar {...radarShape("desktop")} {...motion} />
        </RadarChart>
      </ChartContainer>
    </RadarCard>
  )
}

/* Multiple, Legend, Icons ------------------------------------------- */

export function RadarMultiple() {
  const motion = useChartAnimation()
  return (
    <RadarCard title="Radar chart, Multiple" description="Desktop and mobile visitors, overlapping tonal polygons">
      <ChartContainer config={double} aria-label="Radar chart: desktop and mobile visitors for each month" className={chartClass}>
        <RadarChart data={months} {...polar}>
          <PolarGrid {...radarGrid} />
          <PolarAngleAxis dataKey="month" tick={radarAxisTick()} />
          <PolarRadiusAxis {...hidden} />
          {tooltip}
          <Radar {...radarShape("desktop", { fill: 0.2 })} {...motion} />
          <Radar {...radarShape("mobile", { fill: 0.2 })} {...motion} />
        </RadarChart>
      </ChartContainer>
    </RadarCard>
  )
}

export function RadarLegend() {
  const motion = useChartAnimation()
  const vis = useSeriesVisibility()
  return (
    <RadarCard title="Radar chart, Legend" description="Tap a chip in the legend to show or hide a series" trend="down">
      <ChartContainer config={double} aria-label="Radar chart with legend: desktop and mobile visitors for each month" className={chartClassLegend}>
        <RadarChart data={months} {...polarLegend}>
          <PolarGrid {...radarGrid} />
          <PolarAngleAxis dataKey="month" tick={radarAxisTick()} />
          <PolarRadiusAxis {...hidden} />
          {tooltip}
          <Radar {...radarShape("desktop", { fill: 0.2 })} hide={vis.isHidden("desktop")} {...motion} />
          <Radar {...radarShape("mobile", { fill: 0.2 })} hide={vis.isHidden("mobile")} {...motion} />
          <ChartLegend verticalAlign="bottom" wrapperStyle={{ bottom: 0 }} content={<ChartLegendContent hiddenKeys={vis.hiddenKeys} onToggle={vis.toggle} />} />
        </RadarChart>
      </ChartContainer>
    </RadarCard>
  )
}

export function RadarIcons() {
  const motion = useChartAnimation()
  return (
    <RadarCard title="Radar chart, Icons" description="Material Symbols stand in for the series in the legend">
      <ChartContainer config={iconConfig} aria-label="Radar chart with icons: desktop and mobile visitors for each month" className={chartClassLegend}>
        <RadarChart data={months} {...polarLegend}>
          <PolarGrid {...radarGrid} />
          <PolarAngleAxis dataKey="month" tick={radarAxisTick()} />
          <PolarRadiusAxis {...hidden} />
          {tooltip}
          <Radar {...radarShape("desktop", { fill: 0.2 })} {...motion} />
          <Radar {...radarShape("mobile", { fill: 0.2 })} {...motion} />
          <ChartLegend verticalAlign="bottom" wrapperStyle={{ bottom: 0 }} content={<ChartLegendContent />} />
        </RadarChart>
      </ChartContainer>
    </RadarCard>
  )
}

/* Radius Axis: ring values along the top spoke ---------------------- */

export function RadarRadiusAxis() {
  const motion = useChartAnimation()
  return (
    <RadarCard title="Radar chart, Radius Axis" description="The radius axis is labelled along the January spoke">
      <ChartContainer config={double} aria-label="Radar chart with a radius axis: desktop and mobile visitors for each month, rings at 100, 200 and 300" className={chartClass}>
        <RadarChart data={months} {...polar}>
          <PolarGrid {...radarGrid} />
          <PolarAngleAxis dataKey="month" tick={radarAxisTick()} />
          <PolarRadiusAxis angle={90} domain={DOMAIN} ticks={[100, 200, 300] as never} axisLine={false} tickLine={false} tick={radarRadiusTick({ highlight: 300, color: "var(--color-desktop)" })} />
          {tooltip}
          <Radar {...radarShape("desktop", { fill: 0.2 })} {...motion} />
          <Radar {...radarShape("mobile", { fill: 0.2 })} {...motion} />
        </RadarChart>
      </ChartContainer>
    </RadarCard>
  )
}
