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

/* data: PBMCs by cell type ----------------------------------------- */

// Live single cells from a flow panel on peripheral blood mononuclear cells,
// gated by lineage. Illustrative shares for a healthy adult donor.
const cellConfig = {
  cells: { label: "Cells" },
  t: { label: "T cells", color: "var(--blue)" },
  mono: { label: "Monocytes", color: "var(--orange)" },
  nk: { label: "NK cells", color: "var(--green)" },
  b: { label: "B cells", color: "var(--purple)" },
  other: { label: "Other", color: "var(--pink)" },
} satisfies ChartConfig
type CellKey = Exclude<keyof typeof cellConfig, "cells">

const cellData = [
  { type: "t", cells: 27400, fill: "var(--color-t)" },
  { type: "mono", cells: 9150, fill: "var(--color-mono)" },
  { type: "nk", cells: 5600, fill: "var(--color-nk)" },
  { type: "b", cells: 5450, fill: "var(--color-b)" },
  { type: "other", cells: 2400, fill: "var(--color-other)" },
]
const cellTotal = cellData.reduce((a, d) => a + d.cells, 0)
const fmt = (n: number) => n.toLocaleString("en-US")
const pct = (v: number, total: number) => `${Math.round((v / total) * 100)}%`
const nameOf = (k: string) => cellConfig[k as CellKey].label
const cellSummary = cellData.map((d) => `${nameOf(d.type)} ${pct(d.cells, cellTotal)}`).join(", ")
const share = (v: unknown) => pct(Number(v), cellTotal)

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
    <Badge variant="secondary" icon="labs">
      {fmt(cellTotal)} cells
    </Badge>
    <span className="type-body-sm text-muted-foreground">live single cells, one donor</span>
  </>
)

/* the slice style: even gaps and rounded ends ---------------------- */

// The gaps are a stroke in the card's color, so they keep one width from rim to center
// (paddingAngle gaps are wedges that narrow to a point), and a small hole keeps the
// slices from meeting in one point.
const slices = { innerRadius: "14%", paddingAngle: 0, cornerRadius: 10, stroke: "var(--card)", strokeWidth: 4 } as const
const tip = <ChartTooltipContent hideLabel nameKey="type" />

/* Simple ----------------------------------------------------------- */

export function PieSimpleDemo() {
  const motion = useChartAnimation()
  return (
    <PieCard title="Pie Chart" description="PBMCs by cell type, from a flow panel" footer={trend}>
      <ChartContainer config={cellConfig} aria-label={`PBMCs by cell type: ${cellSummary}`} className={plot}>
        <PieChart>
          <ChartTooltip cursor={false} content={tip} />
          <Pie data={cellData} dataKey="cells" nameKey="type" outerRadius="86%" {...slices} {...motion} />
        </PieChart>
      </ChartContainer>
    </PieCard>
  )
}

/* Separator None: one continuous disc ------------------------------ */

export function PieSeparatorNoneDemo() {
  const motion = useChartAnimation()
  return (
    <PieCard title="Pie Chart - Separator None" description="No gaps: one continuous disc">
      <ChartContainer config={cellConfig} aria-label={`PBMCs by cell type, without separators: ${cellSummary}`} className={plot}>
        <PieChart>
          <ChartTooltip cursor={false} content={tip} />
          <Pie data={cellData} dataKey="cells" nameKey="type" outerRadius="86%" stroke="none" paddingAngle={0} cornerRadius={0} {...motion} />
        </PieChart>
      </ChartContainer>
    </PieCard>
  )
}

/* Label: value chips on leader lines ------------------------------- */

export function PieLabelDemo() {
  const motion = useChartAnimation()
  return (
    <PieCard title="Pie Chart - Label" description="Each cell type’s share, on a chip">
      <ChartContainer config={cellConfig} aria-label={`PBMCs by cell type with shares: ${cellSummary}`} className={plot}>
        <PieChart>
          <ChartTooltip cursor={false} content={tip} />
          <Pie
            data={cellData}
            dataKey="cells"
            nameKey="type"
            outerRadius="62%"
            label={piePillLabel({ config: cellConfig, text: share })}
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
      <ChartContainer config={cellConfig} aria-label={`PBMCs by cell type with names and shares: ${cellSummary}`} className={plot}>
        <PieChart>
          <ChartTooltip cursor={false} content={tip} />
          <Pie
            data={cellData}
            dataKey="cells"
            nameKey="type"
            outerRadius="56%"
            label={piePillLabel({ config: cellConfig, dot: true, offset: 16, text: (v, name) => `${name} ${share(v)}` })}
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
      <ChartContainer config={cellConfig} aria-label={`PBMCs by cell type, named on the slices: ${cellSummary}`} className={plot}>
        <PieChart>
          <ChartTooltip cursor={false} content={tip} />
          <Pie
            data={cellData}
            dataKey="cells"
            nameKey="type"
            outerRadius="92%"
            label={piePillLabel({ config: cellConfig, position: "inside", text: (_, name) => name })}
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
      <ChartContainer config={cellConfig} aria-label={`PBMCs by cell type with a legend: ${cellSummary}`} className="mx-auto aspect-[4/5] w-full max-w-80">
        <PieChart>
          <ChartTooltip cursor={false} content={tip} />
          <Pie data={cellData} dataKey="cells" nameKey="type" outerRadius="80%" {...slices} {...motion} />
          <ChartLegend content={<ChartLegendContent nameKey="type" />} />
        </PieChart>
      </ChartContainer>
    </PieCard>
  )
}

/* Donut ------------------------------------------------------------ */

const donut = { ...slices, innerRadius: "56%", outerRadius: "84%" } as const

export function PieDonutDemo() {
  const motion = useChartAnimation()
  return (
    <PieCard title="Pie Chart - Donut" description="PBMCs by cell type, from a flow panel" footer={trend}>
      <ChartContainer config={cellConfig} aria-label={`PBMCs by cell type: ${cellSummary}`} className={plot}>
        <PieChart>
          <ChartTooltip cursor={false} content={tip} />
          <Pie data={cellData} dataKey="cells" nameKey="type" {...donut} {...motion} />
        </PieChart>
      </ChartContainer>
    </PieCard>
  )
}

/* Donut Active: the slice in focus grows ---------------------------- */

const describeCell = (i: number) => {
  const d = cellData[i]
  return d ? `${nameOf(d.type)}: ${fmt(d.cells)} cells, ${pct(d.cells, cellTotal)} of live cells` : ""
}

export function PieDonutActiveDemo() {
  const motion = useChartAnimation()
  const focus = useChartFocus({ count: cellData.length, defaultIndex: 0, describe: describeCell })
  return (
    <PieCard
      title="Pie Chart - Donut Active"
      description="Hover or tap a slice, or tab to the chart and use the arrow keys"
    >
      <ChartContainer config={cellConfig} focus={focus} aria-label="PBMCs by cell type, one slice in focus" className={plot}>
        <PieChart>
          <ChartTooltip cursor={false} content={tip} />
          <Pie
            data={cellData}
            dataKey="cells"
            nameKey="type"
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
    <PieCard title="Pie Chart - Donut with Text" description="Live single cells after gating" footer={trend}>
      <div className="relative mx-auto w-full max-w-80">
        <ChartContainer config={cellConfig} aria-label={`${fmt(cellTotal)} live cells by type: ${cellSummary}`} className={plot}>
          <PieChart>
            <ChartTooltip cursor={false} content={tip} />
            <Pie data={cellData} dataKey="cells" nameKey="type" {...donut} {...motion} />
          </PieChart>
        </ChartContainer>
        <PieCenter value={fmt(cellTotal)} label="Live cells" />
      </div>
    </PieCard>
  )
}

/* Stacked: two donors, A inside and B outside ---------------------- */

const donorA = cellData.map((d) => ({ ...d, donor: "Donor A" }))
const donorB = [
  { type: "t", cells: 30100, donor: "Donor B", fill: "var(--color-t)" },
  { type: "mono", cells: 6900, donor: "Donor B", fill: "var(--color-mono)" },
  { type: "nk", cells: 7200, donor: "Donor B", fill: "var(--color-nk)" },
  { type: "b", cells: 4300, donor: "Donor B", fill: "var(--color-b)" },
  { type: "other", cells: 1500, donor: "Donor B", fill: "var(--color-other)" },
]
const sum = (rows: { cells: number }[]) => rows.reduce((a, r) => a + r.cells, 0)
const shares = (rows: { type: string; cells: number }[]) => rows.map((d) => `${nameOf(d.type)} ${pct(d.cells, sum(rows))}`).join(", ")

export function PieStackedDemo() {
  const motion = useChartAnimation()
  const ring = { dataKey: "cells", nameKey: "type", paddingAngle: 0, cornerRadius: 9, stroke: "var(--card)", strokeWidth: 4 } as const
  return (
    <PieCard title="Pie Chart - Stacked" description="Donor A on the inside, donor B on the outside">
      <ChartContainer
        config={cellConfig}
        aria-label={`PBMCs by cell type for two donors. Donor A: ${shares(donorA)}. Donor B: ${shares(donorB)}`}
        className="mx-auto aspect-[4/5] w-full max-w-80 [&_.recharts-surface]:overflow-visible"
      >
        <PieChart>
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent nameKey="type" labelFormatter={(_, p) => p?.[0]?.payload?.donor} />}
          />
          <Pie data={donorA} innerRadius="30%" outerRadius="58%" {...ring} {...motion} />
          <Pie data={donorB} innerRadius="63%" outerRadius="88%" {...ring} {...motion} />
          <ChartLegend content={<ChartLegendContent keys={["t", "mono", "nk", "b", "other"]} />} />
        </PieChart>
      </ChartContainer>
    </PieCard>
  )
}

/* Interactive: pick a library ---------------------------------------- */

// Reads per library in one pooled ChIP-seq run (illustrative): two replicates
// each of wild type and knockout, and the input control.
const libraryConfig = {
  reads: { label: "Reads" },
  wt1: { label: "WT rep 1", color: "var(--blue)" },
  wt2: { label: "WT rep 2", color: "var(--orange)" },
  ko1: { label: "KO rep 1", color: "var(--green)" },
  ko2: { label: "KO rep 2", color: "var(--purple)" },
  input: { label: "Input", color: "var(--pink)" },
} satisfies ChartConfig

const libraryData = [
  { library: "wt1", short: "WT1", reads: 5_420_000, fill: "var(--color-wt1)" },
  { library: "wt2", short: "WT2", reads: 6_180_000, fill: "var(--color-wt2)" },
  { library: "ko1", short: "KO1", reads: 4_870_000, fill: "var(--color-ko1)" },
  { library: "ko2", short: "KO2", reads: 3_960_000, fill: "var(--color-ko2)" },
  { library: "input", short: "Input", reads: 4_570_000, fill: "var(--color-input)" },
]
const readsTotal = libraryData.reduce((a, d) => a + d.reads, 0)
const millions = (n: number) => `${(n / 1e6).toFixed(1)}M`
const libraryName = (k: string) => libraryConfig[k as Exclude<keyof typeof libraryConfig, "reads">].label

export function PieInteractiveDemo() {
  const motion = useChartAnimation()
  const focus = useChartFocus({
    count: libraryData.length,
    defaultIndex: 1,
    describe: (i) => {
      const d = libraryData[i]
      return d ? `${libraryName(d.library)}: ${millions(d.reads)} reads, ${pct(d.reads, readsTotal)} of the run` : ""
    },
  })
  // hovering previews a slice; the selector and the center follow the one picked
  const active = libraryData[focus.selected]
  return (
    <PieCard title="Pie Chart - Interactive" description="Pick a library; its slice grows and the center shows its reads">
      <ToggleGroup
        type="single"
        value={active.library}
        onValueChange={(v) => {
          const i = libraryData.findIndex((d) => d.library === v)
          if (i >= 0) focus.select(i)
        }}
        aria-label="Library"
        className="w-full *:flex-1"
      >
        {libraryData.map((d) => (
          <ToggleGroupItem key={d.library} value={d.library} aria-label={libraryName(d.library)}>
            {d.short}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <div className="relative mx-auto w-full max-w-80">
        <ChartContainer config={libraryConfig} focus={focus} aria-label={`Reads per library in a pooled run, ${millions(readsTotal)} in total`} className={plot}>
          <PieChart>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel nameKey="library" />} />
            <Pie
              data={libraryData}
              dataKey="reads"
              nameKey="library"
              activeIndex={focus.selected}
              rootTabIndex={-1}
              activeShape={PieActiveSector}
              onClick={(_: unknown, i: number) => focus.select(i)}
              {...donut}
              {...motion}
            />
          </PieChart>
        </ChartContainer>
        <PieCenter value={millions(active.reads)} label={`${libraryName(active.library)} reads`} />
      </div>
    </PieCard>
  )
}
