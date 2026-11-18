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

/* data: two compounds scored on six assays, normalized 0 to 100 (illustrative) */

const profile = [
  { axis: "Potency", lead: 92, backup: 71 },
  { axis: "Selectivity", lead: 78, backup: 64 },
  { axis: "Solubility", lead: 41, backup: 82 },
  { axis: "Permeability", lead: 66, backup: 74 },
  { axis: "Stability", lead: 58, backup: 79 },
  { axis: "Safety", lead: 84, backup: 69 },
]
const N = profile.length
const DOMAIN: [number, number] = [0, 100]
// the bar a candidate must clear on every axis
const BAR = 50
const mean = (k: "lead" | "backup") => Math.round(profile.reduce((s, p) => s + p[k], 0) / N)
const cleared = (k: "lead" | "backup") => profile.filter((p) => p[k] >= BAR).length

const single = { lead: { label: "Lead", color: "var(--blue)" } } satisfies ChartConfig
const double = {
  lead: { label: "Lead", color: "var(--blue)" },
  backup: { label: "Backup", color: "var(--orange)" },
} satisfies ChartConfig

/* the card every variant sits in ------------------------------------ */

function RadarCard({
  title,
  description,
  series = "lead",
  control,
  children,
}: {
  title: string
  description: string
  /** Whose verdict the footer gives. */
  series?: "lead" | "backup" | "both"
  control?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <Card className="[--card:var(--surface-container-low)]">
      <CardContent className="grid gap-4 pt-6">
        <div className="grid gap-1">
          <h3 className="type-title-md">{title}</h3>
          <p className="type-body-md text-muted-foreground">{description}</p>
        </div>
        {control}
        {children}
        <div className="flex flex-wrap items-center gap-2 type-body-md text-muted-foreground">
          {series === "both" ? (
            <span>Scores 0 to 100, illustrative. A candidate needs {BAR} on every axis.</span>
          ) : (
            <>
              <Badge variant={cleared(series) === N ? "success" : "destructive"} icon={cleared(series) === N ? "check" : "close"}>
                {cleared(series)} of {N} above {BAR}
              </Badge>
              <span>{series === "lead" ? "Lead" : "Backup"} compound, illustrative scores</span>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

const chartClass = "mx-auto aspect-square max-h-[380px]"
const margin = { top: 22, right: 50, bottom: 22, left: 50 }
const chartClassLegend = "mx-auto aspect-[10/11] max-h-[410px]"
const polarLegend = { outerRadius: "80%", margin: { ...margin, bottom: 60 } } as const
const polar = { outerRadius: "80%", margin } as const
const hidden = { domain: DOMAIN, tick: false, axisLine: false, tickLine: false } as const
const tooltip = <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />

/* Default: the focused axis gets a spoke, a ring and a readout ------- */

export function RadarDefault() {
  const motion = useChartAnimation()
  const avg = mean("lead")
  const focus = useChartFocus({
    count: N,
    defaultIndex: -1,
    describe: (i) => (i < 0 ? `Lead compound, mean score ${avg} of 100` : `${profile[i].axis}: ${profile[i].lead} of 100`),
  })
  const p = focus.index >= 0 ? profile[focus.index] : null
  return (
    <Card className="[--card:var(--surface-container-low)]">
      <CardContent className="grid gap-4 pt-6">
        <ChartReadout
          value={p ? p.lead : avg}
          unit="of 100"
          label={p ? p.axis : "Lead compound, mean score"}
          detail={p ? (p.lead >= BAR ? `Clears the bar of ${BAR}` : `Below the bar of ${BAR}`) : "Hover an axis, or tab here and use the arrow keys."}
          onClear={focus.isDefault ? undefined : focus.reset}
        />
        <ChartContainer config={single} focus={focus} aria-label="Radar chart: the lead compound's scores, 0 to 100, on potency, selectivity, solubility, permeability, stability and safety" className={chartClass}>
          <RadarChart data={profile} {...polar} {...focus.chartProps}>
            <PolarGrid {...radarGrid} />
            <PolarAngleAxis dataKey="axis" tick={radarAxisTick({ focus: focus.index })} />
            <PolarRadiusAxis {...hidden} />
            <ChartTooltip cursor={false} content={() => null} />
            <Radar {...radarShape("lead", { dots: false })} {...motion} />
            <Customized component={<RadarFocus count={N} index={focus.index} domain={DOMAIN} values={p ? { lead: p.lead } : {}} />} />
          </RadarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

/* Lines Only -------------------------------------------------------- */

export function RadarLinesOnly() {
  const motion = useChartAnimation()
  return (
    <RadarCard title="Radar Chart - Lines Only" description="Lead and backup compounds, outlines without fill" series="both">
      <ChartContainer config={double} aria-label="Radar chart with outlines only: lead and backup compounds scored 0 to 100 on six assays" className={chartClassLegend}>
        <RadarChart data={profile} {...polarLegend}>
          <PolarGrid {...radarGrid} />
          <PolarAngleAxis dataKey="axis" tick={radarAxisTick()} />
          <PolarRadiusAxis {...hidden} />
          {tooltip}
          <Radar {...radarShape("lead", { fill: 0, dots: false })} {...motion} />
          <Radar {...radarShape("backup", { fill: 0, dots: false })} {...motion} />
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
    <RadarCard title="Radar Chart - Custom Label" description="Each axis shows the lead's score under the assay">
      <ChartContainer config={single} aria-label="Radar chart with value labels: the lead compound's score on each assay" className={chartClass}>
        <RadarChart data={profile} outerRadius="66%" margin={{ top: 30, right: 44, bottom: 34, left: 44 }}>
          <PolarGrid {...radarGrid} />
          <PolarAngleAxis dataKey="axis" tick={radarAxisTick({ values: profile.map((p) => p.lead) })} />
          <PolarRadiusAxis {...hidden} />
          <Radar {...radarShape("lead")} {...motion} />
        </RadarChart>
      </ChartContainer>
    </RadarCard>
  )
}

/* Grids ------------------------------------------------------------- */

export type GridKind = "polygon" | "custom" | "none" | "circle" | "circle-no-lines" | "circle-filled" | "filled"

export const gridMeta: Record<GridKind, { title: string; description: string; short: string }> = {
  polygon: { title: "Radar Chart - Grid", description: "Dotted polygon rings with spokes, the default", short: "Polygon" },
  custom: { title: "Radar Chart - Grid Custom", description: "Three dotted rings in the series color, no spokes", short: "Rings" },
  none: { title: "Radar Chart - Grid None", description: "No grid, the polygon and its dots carry the chart", short: "None" },
  circle: { title: "Radar Chart - Grid Circle", description: "Round dotted rings with spokes", short: "Circle" },
  "circle-no-lines": { title: "Radar Chart - Grid Circle No Lines", description: "Round dotted rings, spokes removed", short: "No spokes" },
  "circle-filled": { title: "Radar Chart - Grid Circle Filled", description: "Alternating tonal rings behind the polygon", short: "Tonal" },
  filled: { title: "Radar Chart - Grid Filled", description: "One tonal body with dotted rings and spokes on top", short: "Filled" },
}

export function RadarGridDemo({ kind, control }: { kind: GridKind; control?: React.ReactNode }) {
  const motion = useChartAnimation()
  const color = "var(--color-lead)"
  const meta = gridMeta[kind]
  let grid: React.ReactNode = null
  if (kind === "polygon") grid = <PolarGrid {...radarGrid} />
  if (kind === "custom") grid = <Customized component={<RadarRings count={N} rings={3} spokes={false} color={color} />} />
  if (kind === "circle") grid = <PolarGrid {...radarGrid} gridType="circle" />
  if (kind === "circle-no-lines") grid = <PolarGrid {...radarGrid} gridType="circle" radialLines={false} />
  if (kind === "circle-filled") grid = <Customized component={<RadarRings count={N} shape="circle" rings={4} fill="tonal" spokes={false} color={color} />} />
  if (kind === "filled") grid = <Customized component={<RadarRings count={N} rings={4} fill="flat" color={color} />} />
  return (
    <RadarCard title={meta.title} description={meta.description} control={control}>
      <ChartContainer config={single} aria-label={`Radar chart, ${meta.title.replace("Radar Chart - ", "").toLowerCase()}: the lead compound's score on each assay`} className={chartClass}>
        <RadarChart data={profile} {...polar}>
          {grid}
          <PolarAngleAxis dataKey="axis" tick={radarAxisTick()} />
          <PolarRadiusAxis {...hidden} />
          {tooltip}
          <Radar {...radarShape("lead")} {...motion} />
        </RadarChart>
      </ChartContainer>
    </RadarCard>
  )
}

/* Legend ------------------------------------------------------------ */

export function RadarLegend() {
  const motion = useChartAnimation()
  const vis = useSeriesVisibility()
  return (
    <RadarCard title="Radar Chart - Legend" description="Lead against backup: tap a chip to show or hide a compound" series="both">
      <ChartContainer config={double} aria-label="Radar chart with legend: lead and backup compounds scored 0 to 100 on six assays" className={chartClassLegend}>
        <RadarChart data={profile} {...polarLegend}>
          <PolarGrid {...radarGrid} />
          <PolarAngleAxis dataKey="axis" tick={radarAxisTick()} />
          <PolarRadiusAxis {...hidden} />
          {tooltip}
          <Radar {...radarShape("lead", { fill: 0.2 })} hide={vis.isHidden("lead")} {...motion} />
          <Radar {...radarShape("backup", { fill: 0.2 })} hide={vis.isHidden("backup")} {...motion} />
          <ChartLegend verticalAlign="bottom" wrapperStyle={{ bottom: 0 }} content={<ChartLegendContent hiddenKeys={vis.hiddenKeys} onToggle={vis.toggle} />} />
        </RadarChart>
      </ChartContainer>
    </RadarCard>
  )
}

/* Radius Axis: ring values along the top spoke ---------------------- */

export function RadarRadiusAxis() {
  const motion = useChartAnimation()
  return (
    <RadarCard title="Radar Chart - Radius Axis" description={`Rings at 25, 50 and 75 along the potency spoke, with the bar of ${BAR} called out`} series="both">
      <ChartContainer config={double} aria-label="Radar chart with a radius axis: lead and backup compounds scored 0 to 100 on six assays, rings at 25, 50 and 75" className={chartClass}>
        <RadarChart data={profile} {...polar}>
          <PolarGrid {...radarGrid} />
          <PolarAngleAxis dataKey="axis" tick={radarAxisTick()} />
          <PolarRadiusAxis angle={90} domain={DOMAIN} ticks={[25, 50, 75] as never} axisLine={false} tickLine={false} tick={radarRadiusTick({ highlight: BAR, color: "var(--color-lead)" })} />
          {tooltip}
          <Radar {...radarShape("lead", { fill: 0.2 })} {...motion} />
          <Radar {...radarShape("backup", { fill: 0.2 })} {...motion} />
        </RadarChart>
      </ChartContainer>
    </RadarCard>
  )
}
