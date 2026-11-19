"use client"

import * as React from "react"
import { Bar, BarChart, Cell, LabelList, ReferenceDot, ReferenceLine, XAxis, YAxis } from "recharts"

import { Badge } from "@/registry/nelumbo/ui/badge"
import { Card, CardContent } from "@/registry/nelumbo/ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartReadout,
  ChartTooltip,
  ChartTooltipContent,
  chartBarLabel,
  chartBarLabelNeeds,
  chartBarRadius,
  chartFocusDot,
  chartFocusLine,
  chartGoalLine,
  chartPillBar,
  chartSegment,
  chartTicks,
  chartTrack,
  useChartAnimation,
  useChartFocus,
  type ChartConfig,
} from "@/registry/nelumbo/ui/chart"
import { ToggleGroup, ToggleGroupItem } from "@/registry/nelumbo/ui/toggle-group"
import { cn } from "@/lib/utils"

const CARD = "[--card:var(--surface-container-low)]"
const fmtNum = (n: number) => Math.round(n).toLocaleString("en-US")

function CardHead({ title, description }: { title: string; description: string }) {
  return (
    <div className="grid gap-1">
      <h3 className="type-title-lg">{title}</h3>
      <p className="type-body-md text-muted-foreground">{description}</p>
    </div>
  )
}

// Sequencing libraries a core facility prepared each week (illustrative). Week 4 the
// DNA line was down for maintenance and RNA work filled the gap.
const weekly = [
  { week: "Week 1", dna: 186, rna: 80 },
  { week: "Week 2", dna: 305, rna: 200 },
  { week: "Week 3", dna: 237, rna: 120 },
  { week: "Week 4", dna: 73, rna: 190 },
  { week: "Week 5", dna: 209, rna: 130 },
  { week: "Week 6", dna: 214, rna: 140 },
].map((d, i) => ({ ...d, tick: `W${i + 1}` }))

const libraryConfig = {
  dna: { label: "DNA", color: "var(--blue)" },
  rna: { label: "RNA", color: "var(--orange)" },
} satisfies ChartConfig

// A stack is one quantity in parts, so its segments are tones of one color rather than two hues;
// the legend and tooltip name them.
const stackConfig = {
  dna: { label: "DNA", color: "var(--blue)" },
  rna: { label: "RNA", color: "color-mix(in oklab, var(--blue) 55%, var(--card))" },
} satisfies ChartConfig

const weekTick = (i: number) => weekly[i]?.tick ?? ""

/* Default: pill bars, a target line, badges on weeks that reach it --- */

export function DefaultBarDemo() {
  const motion = useChartAnimation()
  const goal = 200
  const focus = useChartFocus({
    count: weekly.length,
    describe: (i) => `${weekly[i].week}: ${weekly[i].dna} DNA libraries${weekly[i].dna >= goal ? ", target reached" : ""}`,
  })
  const point = weekly[Math.max(0, focus.index)]
  const prev = weekly[Math.max(0, focus.index) - 1]
  const delta = prev ? Math.round(((point.dna - prev.dna) / prev.dna) * 100) : undefined
  return (
    <Card className={CARD}>
      <CardContent className="grid gap-6 pt-6">
        <CardHead title="Bar Chart" description="DNA libraries prepared per week, against a target of 200" />
        <ChartReadout
          value={fmtNum(point.dna)}
          unit="libraries"
          label={point.week}
          detail={
            delta === undefined ? undefined : (
              <Badge variant={delta >= 0 ? "success" : "destructive"} icon={delta >= 0 ? "trending_up" : "trending_down"}>
                {delta >= 0 ? "+" : ""}
                {delta}% on {prev.week}
              </Badge>
            )
          }
          onClear={focus.isDefault ? undefined : focus.reset}
        />
        <ChartContainer config={libraryConfig} focus={focus} aria-label="DNA libraries prepared per week, weeks 1 to 6, against a target of 200" className="aspect-auto h-60">
          <BarChart data={weekly} margin={{ top: 12, right: 0, left: 0, bottom: 0 }} barCategoryGap="16%" {...focus.chartProps}>
            <XAxis dataKey="week" tickLine={false} axisLine={false} tickMargin={10} interval={0} tickFormatter={(_, i) => weekTick(i)} />
            <YAxis orientation="right" tickLine={false} axisLine={false} width={44} domain={[0, 350]} ticks={[0, 100, goal, 350]} tick={chartTicks({ highlight: { [goal]: "var(--color-dna)" } })} />
            <ChartTooltip cursor={false} content={() => null} />
            <ReferenceLine y={goal} {...chartGoalLine("dna")} />
            <Bar dataKey="dna" shape={chartPillBar("dna", { goal })} {...motion} />
            <ReferenceLine x={point.week} {...chartFocusLine} />
            <ReferenceDot x={point.week} y={point.dna} {...chartFocusDot} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

/* Horizontal ---------------------------------------------------------- */

export function HorizontalBarDemo() {
  const motion = useChartAnimation()
  const [hover, setHover] = React.useState<number | null>(null)
  return (
    <Card className={CARD}>
      <CardContent className="grid gap-6 pt-6">
        <CardHead title="Bar Chart - Horizontal" description="DNA libraries prepared per week, weeks 1 to 6" />
        <ChartContainer config={libraryConfig} aria-label="DNA libraries prepared per week, as horizontal bars" className="aspect-auto h-64">
          <BarChart data={weekly} layout="vertical" margin={{ top: 0, right: 56, left: 0, bottom: 0 }} barCategoryGap="22%" onMouseMove={(s) => setHover(s?.isTooltipActive ? (s.activeTooltipIndex ?? null) : null)} onMouseLeave={() => setHover(null)}>
            <XAxis type="number" hide domain={[0, 330]} />
            <YAxis dataKey="week" type="category" tickLine={false} axisLine={false} width={44} tickFormatter={(_, i) => weekTick(i)} className="[&_text]:fill-foreground" />
            <ChartTooltip cursor={false} content={() => null} />
            <Bar dataKey="dna" fill="var(--color-dna)" radius={chartBarRadius} background={chartTrack("dna", hover === null ? undefined : { index: hover })} {...motion}>
              <LabelList dataKey="dna" content={chartBarLabel({ horizontal: true })} />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

/* Multiple: grouped ---------------------------------------------------- */

function useTwoSeriesFocus() {
  const focus = useChartFocus({
    count: weekly.length,
    defaultIndex: -1,
    describe: (i) => (i < 0 ? "Weeks 1 to 6: DNA 1,224 libraries, RNA 860" : `${weekly[i].week}: DNA ${weekly[i].dna} libraries, RNA ${weekly[i].rna}`),
  })
  const point = focus.index >= 0 ? weekly[focus.index] : undefined
  const total = point ? point.dna + point.rna : weekly.reduce((s, d) => s + d.dna + d.rna, 0)
  const detail = point ? `DNA ${fmtNum(point.dna)}, RNA ${fmtNum(point.rna)}` : "DNA 1,224, RNA 860"
  return { focus, point, total, detail }
}

export function MultipleBarDemo() {
  const motion = useChartAnimation()
  const { focus, point, total, detail } = useTwoSeriesFocus()
  return (
    <Card className={CARD}>
      <CardContent className="grid gap-6 pt-6">
        <CardHead title="Bar Chart - Multiple" description="DNA and RNA libraries prepared per week" />
        <ChartReadout value={fmtNum(total)} unit="libraries" label={point ? point.week : "Six weeks"} detail={detail} onClear={focus.isDefault ? undefined : focus.reset} />
        <ChartContainer config={libraryConfig} focus={focus} aria-label="DNA and RNA libraries prepared per week, grouped bars" className="aspect-auto h-64">
          <BarChart data={weekly} margin={{ top: 12, right: 0, left: 0, bottom: 0 }} barCategoryGap="10%" barGap={3} {...focus.chartProps}>
            <XAxis dataKey="week" tickLine={false} axisLine={false} tickMargin={10} interval={0} tickFormatter={(_, i) => weekTick(i)} />
            <YAxis orientation="right" tickLine={false} axisLine={false} width={40} domain={[0, 350]} ticks={[0, 100, 200, 300]} tick={chartTicks()} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
            <Bar dataKey="dna" fill="var(--color-dna)" radius={chartBarRadius} {...motion} />
            <Bar dataKey="rna" fill="var(--color-rna)" radius={chartBarRadius} {...motion} />
            {point && <ReferenceLine x={point.week} {...chartFocusLine} />}
            <ChartLegend content={<ChartLegendContent />} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

/* Stacked + Legend ------------------------------------------------------ */

export function StackedBarDemo() {
  const motion = useChartAnimation()
  const { focus, point, total, detail } = useTwoSeriesFocus()
  return (
    <Card className={CARD}>
      <CardContent className="grid gap-6 pt-6">
        <CardHead title="Bar Chart - Stacked + Legend" description="All libraries per week, split into DNA and RNA" />
        <ChartReadout value={fmtNum(total)} unit="libraries" label={point ? point.week : "Six weeks"} detail={detail} onClear={focus.isDefault ? undefined : focus.reset} />
        <ChartContainer config={stackConfig} focus={focus} aria-label="Libraries prepared per week, stacked by DNA and RNA" className="aspect-auto h-64">
          <BarChart data={weekly} margin={{ top: 12, right: 0, left: 0, bottom: 0 }} barCategoryGap="16%" {...focus.chartProps}>
            <XAxis dataKey="week" tickLine={false} axisLine={false} tickMargin={10} interval={0} tickFormatter={(_, i) => weekTick(i)} />
            <YAxis orientation="right" tickLine={false} axisLine={false} width={40} domain={[0, 500]} ticks={[0, 200, 400]} tick={chartTicks()} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
            <Bar dataKey="dna" stackId="a" fill="var(--color-dna)" {...chartSegment} {...motion} />
            <Bar dataKey="rna" stackId="a" fill="var(--color-rna)" {...chartSegment} {...motion} />
            {point && <ReferenceLine x={point.week} {...chartFocusLine} />}
            <ChartLegend content={<ChartLegendContent />} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

/* Label: value pills above the bars ------------------------------------- */

export function LabelBarDemo() {
  const motion = useChartAnimation()
  return (
    <Card className={CARD}>
      <CardContent className="grid gap-6 pt-6">
        <CardHead title="Bar Chart - Label" description="DNA libraries per week, each bar with its count" />
        <ChartContainer config={libraryConfig} aria-label="DNA libraries prepared per week, each bar labelled with its count" className="aspect-auto h-64">
          <BarChart data={weekly} margin={{ top: 32, right: 0, left: 0, bottom: 0 }} barCategoryGap="16%">
            <XAxis dataKey="week" tickLine={false} axisLine={false} tickMargin={10} interval={0} tickFormatter={(_, i) => weekTick(i)} />
            <ChartTooltip cursor={false} content={() => null} />
            <Bar dataKey="dna" fill="var(--color-dna)" radius={chartBarRadius} {...motion}>
              <LabelList dataKey="dna" content={chartBarLabel()} />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

/* Custom Label: names inside horizontal pill bars ------------------------ */

// Variants called in one exome, by predicted consequence (illustrative).
const consequences = [
  { name: "Synonymous", count: 275, color: "blue" },
  { name: "Missense", count: 200, color: "orange" },
  { name: "UTR", count: 187, color: "green" },
  { name: "Splice region", count: 173, color: "purple" },
  { name: "Nonsense", count: 90, color: "pink" },
]
const variantConfig = {
  count: { label: "Variants" },
  ...Object.fromEntries(consequences.map((s) => [s.name.toLowerCase().replace(/ /g, "-"), { label: s.name, color: `var(--${s.color})` }])),
} satisfies ChartConfig
const keyOf = (name: string) => name.toLowerCase().replace(/ /g, "-")
const variantData = consequences.map((s) => ({ ...s, key: keyOf(s.name), fill: `var(--color-${keyOf(s.name)})` }))

export function CustomLabelBarDemo() {
  const motion = useChartAnimation()
  return (
    <Card className={CARD}>
      <CardContent className="grid gap-6 pt-6">
        <CardHead title="Bar Chart - Custom Label" description="Variants in one exome by consequence, named inside each bar" />
        <ChartContainer config={variantConfig} aria-label="Variants by consequence: synonymous 275, missense 200, UTR 187, splice region 173, nonsense 90" className="aspect-auto h-64">
          <BarChart data={variantData} layout="vertical" margin={{ top: 0, right: 56, left: 0, bottom: 0 }} barCategoryGap="14%">
            <XAxis type="number" hide domain={[0, 300]} />
            <YAxis dataKey="name" type="category" hide />
            <ChartTooltip cursor={false} content={() => null} />
            <Bar dataKey="count" radius={chartBarRadius} {...motion}>
              {variantData.map((d) => (
                <Cell key={d.key} fill={d.fill} />
              ))}
              <LabelList dataKey="count" content={chartBarLabelPerColor(variantData)} />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

/** Names inside each bar in that bar's on-color (blue to --blue-foreground), the value as a pill after it. */
function chartBarLabelPerColor(rows: typeof variantData) {
  function Label(props: unknown) {
    const p = props as { index?: number } & Record<string, unknown>
    const i = p.index ?? 0
    const row = rows[i]
    const inside = chartBarLabel({ horizontal: true, position: "inside-start", onColor: `var(--${row.color}-foreground)`, text: () => row.name })
    // a name wider than its bar moves past the bar end, so the value pill steps out after it
    const { width = 0, height = 0 } = p as { width?: number; height?: number }
    const spill = Math.abs(width) < chartBarLabelNeeds(row.name, Math.abs(height)) ? row.name.length * 7.4 + 14 : 0
    const end = chartBarLabel({ horizontal: true, offset: spill })
    return (
      <g>
        {inside(props)}
        {end(props)}
      </g>
    )
  }
  return Label
}

/* Mixed: a color per row --------------------------------------------------- */

// Cell types in 1,000 peripheral blood mononuclear cells, typical proportions for a healthy donor.
const cellTypes = [
  { key: "t", label: "T cells", count: 560 },
  { key: "mono", label: "Monocytes", count: 180 },
  { key: "nk", label: "NK cells", count: 110 },
  { key: "b", label: "B cells", count: 100 },
  { key: "other", label: "Other", count: 50 },
]
const cellConfig = {
  count: { label: "Cells" },
  t: { label: "T cells", color: "var(--blue)" },
  mono: { label: "Monocytes", color: "var(--cyan)" },
  nk: { label: "NK cells", color: "var(--orange)" },
  b: { label: "B cells", color: "var(--green)" },
  other: { label: "Other", color: "var(--purple)" },
} satisfies ChartConfig
const cellData = cellTypes.map((b) => ({ ...b, fill: `var(--color-${b.key})` }))

export function MixedBarDemo() {
  const motion = useChartAnimation()
  const [hover, setHover] = React.useState<number | null>(null)
  return (
    <Card className={CARD}>
      <CardContent className="grid gap-6 pt-6">
        <CardHead title="Bar Chart - Mixed" description="Cell types per 1,000 blood mononuclear cells, one color per row" />
        <ChartContainer config={cellConfig} aria-label="Cell types per 1,000 blood mononuclear cells: T cells 560, monocytes 180, NK cells 110, B cells 100, other 50" className="aspect-auto h-64">
          <BarChart data={cellData} layout="vertical" margin={{ top: 0, right: 56, left: 0, bottom: 0 }} barCategoryGap="22%" onMouseMove={(s) => setHover(s?.isTooltipActive ? (s.activeTooltipIndex ?? null) : null)} onMouseLeave={() => setHover(null)}>
            <XAxis type="number" hide domain={[0, 650]} />
            <YAxis dataKey="key" type="category" tickLine={false} axisLine={false} width={84} tickFormatter={(v: string) => cellConfig[v as keyof typeof cellConfig]?.label as string} className="[&_text]:fill-foreground" />
            <ChartTooltip cursor={false} content={() => null} />
            <Bar dataKey="count" radius={chartBarRadius} background={chartTrack("t", hover === null ? undefined : { index: hover })} {...motion}>
              {cellData.map((d) => (
                <Cell key={d.key} fill={d.fill} />
              ))}
              <LabelList dataKey="count" content={chartBarLabel({ horizontal: true })} />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

/* Active: one bar in focus ---------------------------------------------------- */

export function ActiveBarDemo() {
  const motion = useChartAnimation()
  const focus = useChartFocus({
    count: cellTypes.length,
    defaultIndex: 0,
    describe: (i) => `${cellTypes[i].label}: ${cellTypes[i].count} per 1,000 cells`,
  })
  const point = cellTypes[Math.max(0, focus.index)]
  const total = cellTypes.reduce((s, b) => s + b.count, 0)
  return (
    <Card className={CARD}>
      <CardContent className="grid gap-6 pt-6">
        <CardHead title="Bar Chart - Active" description="Blood mononuclear cells by type. Hover, tap or use the arrow keys to move the highlight." />
        <ChartReadout
          value={fmtNum(point.count)}
          unit="per 1,000 cells"
          label={point.label}
          detail={`${Math.round((point.count / total) * 100)}% of mononuclear cells`}
          onClear={focus.isDefault ? undefined : focus.reset}
        />
        <ChartContainer config={cellConfig} focus={focus} aria-label="Blood mononuclear cells by type, with one type highlighted" className="aspect-auto h-56">
          <BarChart data={cellData} margin={{ top: 12, right: 0, left: 0, bottom: 0 }} barCategoryGap="14%" {...focus.chartProps}>
            <XAxis dataKey="key" tickLine={false} axisLine={false} tickMargin={10} interval={0} tickFormatter={(v: string) => cellConfig[v as keyof typeof cellConfig]?.label as string} />
            <ChartTooltip cursor={false} content={() => null} />
            <Bar dataKey="count" radius={chartBarRadius} {...motion}>
              {cellData.map((d, i) => (
                <Cell key={d.key} fill={focus.fill(d.key, i)} className="transition-[fill] duration-300 ease-(--ease-spring)" />
              ))}
            </Bar>
            <ReferenceDot x={point.key} y={point.count} {...chartFocusDot} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

/* Negative: pills on both sides of a zero line --------------------------------- */

// A p53 response 24 hours after DNA damage: its targets rise, proliferation genes fall.
// The directions are the textbook ones; the fold changes are illustrative.
const genes = [
  { gene: "CDKN1A", value: 2.6 },
  { gene: "MKI67", value: -1.9 },
  { gene: "BAX", value: 1.8 },
  { gene: "CCNB1", value: -2.1 },
  { gene: "MDM2", value: 2.2 },
].map((d) => ({ ...d, tick: d.gene }))
const foldConfig = {
  gain: { label: "Up", color: "var(--green)" },
  loss: { label: "Down", color: "var(--red)" },
} satisfies ChartConfig
const fc = (v: number) => `${v > 0 ? "+" : "−"}${Math.abs(v).toFixed(1)}`

export function NegativeBarDemo() {
  const motion = useChartAnimation()
  const focus = useChartFocus({
    count: genes.length,
    describe: (i) => `${genes[i].gene}: log2 fold change ${fc(genes[i].value)}, ${genes[i].value > 0 ? "up" : "down"} ${(2 ** Math.abs(genes[i].value)).toFixed(1)} times`,
  })
  const point = genes[Math.max(0, focus.index)]
  const up = genes.filter((d) => d.value > 0).length
  return (
    <Card className={CARD}>
      <CardContent className="grid gap-6 pt-6">
        <CardHead title="Bar Chart - Negative" description="Gene expression after DNA damage, log2 fold change against untreated cells" />
        <ChartReadout
          value={fc(point.value)}
          unit="log2 FC"
          label={point.gene}
          detail={`${(2 ** Math.abs(point.value)).toFixed(1)}× ${point.value > 0 ? "higher" : "lower"}${focus.isDefault ? `. ${up} of ${genes.length} genes up` : ""}`}
          onClear={focus.isDefault ? undefined : focus.reset}
        />
        <ChartContainer config={foldConfig} focus={focus} aria-label="Log2 fold change of five genes after DNA damage, up above zero and down below" className="aspect-auto h-80">
          <BarChart data={genes} margin={{ top: 32, right: 0, left: 0, bottom: 0 }} barCategoryGap="30%" {...focus.chartProps}>
            <XAxis dataKey="gene" tickLine={false} axisLine={false} tickMargin={10} interval={0} padding={{ left: 12, right: 12 }} tickFormatter={(_, i) => genes[i]?.tick ?? ""} />
            <YAxis hide domain={[-3, 3]} />
            <ChartTooltip cursor={false} content={() => null} />
            <ReferenceLine y={0} stroke="var(--outline-variant)" strokeWidth={2} strokeLinecap="round" ifOverflow="visible" />
            <Bar dataKey="value" radius={chartBarRadius} {...motion}>
              {genes.map((d) => (
                <Cell key={d.gene} fill={d.value >= 0 ? "var(--color-gain)" : "var(--color-loss)"} />
              ))}
              <LabelList dataKey="value" content={chartBarLabel({ format: fc })} />
            </Bar>
            <ReferenceLine x={point.gene} {...chartFocusLine} />
            <ReferenceDot x={point.gene} y={0} {...chartFocusDot} />
            <ChartLegend verticalAlign="bottom" content={<ChartLegendContent keys={["gain", "loss"]} />} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

/* Interactive: series switcher + period switcher + readout ------------------------ */

type Day = { key: string; date: Date; label: string; dna: number; rna: number }
const DAY = 86400000
const interactiveData: Day[] = (() => {
  const end = new Date(2026, 10, 15).getTime()
  let s = 4711
  const rnd = () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
  return Array.from({ length: 90 }, (_, i) => {
    const date = new Date(end - (89 - i) * DAY)
    const weekend = date.getDay() === 0 || date.getDay() === 6
    const swell = 1 + 0.35 * Math.sin(i / 9)
    // the lab runs a skeleton shift at weekends
    const dna = Math.round((weekend ? 12 : 58) * swell + rnd() * 18)
    const rna = Math.round((weekend ? 8 : 40) * swell + rnd() * 16)
    return {
      key: date.toISOString().slice(0, 10),
      date,
      label: new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric" }).format(date),
      dna,
      rna,
    }
  })
})()
const fmtTick = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" })

const RANGES = [
  { value: "7", label: "Last 7 days", short: "7D" },
  { value: "30", label: "Last 30 days", short: "30D" },
  { value: "90", label: "Last 3 months", short: "90D" },
] as const

export function InteractiveBarDemo() {
  const motion = useChartAnimation()
  const [range, setRange] = React.useState<(typeof RANGES)[number]["value"]>("30")
  const [active, setActive] = React.useState<"dna" | "rna">("dna")
  const rangeInfo = RANGES.find((r) => r.value === range)!
  const data = React.useMemo(() => interactiveData.slice(-Number(range)), [range])
  const totals = React.useMemo(
    () => ({ dna: data.reduce((s, d) => s + d.dna, 0), rna: data.reduce((s, d) => s + d.rna, 0) }),
    [data]
  )
  const focus = useChartFocus({
    count: data.length,
    describe: (i) => `${data[i].label}: ${fmtNum(data[i][active])} ${libraryConfig[active].label} samples`,
  })
  const point = data[Math.max(0, focus.index)]
  const shape = React.useMemo(() => chartPillBar(active), [active])
  const tickEvery = range === "7" ? 1 : range === "30" ? 7 : 14

  return (
    <Card className={CARD}>
      <CardContent className="grid gap-6 pt-6">
        <div className="grid gap-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <CardHead title="Bar Chart - Interactive" description={`Samples extracted per day, ${rangeInfo.label.toLowerCase()}`} />
            <ToggleGroup type="single" value={range} onValueChange={(v) => v && setRange(v as typeof range)} aria-label="Period">
              {RANGES.map((r) => (
                <ToggleGroupItem key={r.value} value={r.value} aria-label={r.label}>
                  {r.short}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
          <div role="group" aria-label="Series" className="grid grid-cols-2 gap-2">
            {(["dna", "rna"] as const).map((k) => {
              const on = active === k
              return (
                <button
                  key={k}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setActive(k)}
                  className={cn(
                    "state-layer tactile grid cursor-pointer gap-0.5 rounded-2xl p-3.5 text-start outline-none transition-[background-color] duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                    on ? "bg-secondary text-secondary-foreground" : "bg-surface-container text-foreground"
                  )}
                >
                  <span className="flex items-center gap-2 type-label-lg text-muted-foreground">
                    <span aria-hidden className="size-2.5 rounded-full" style={{ background: `var(--color-${k})` }} />
                    {libraryConfig[k].label}
                  </span>
                  <span className="type-headline-sm tabular-nums">{fmtNum(totals[k])}</span>
                </button>
              )
            })}
          </div>
        </div>
        <ChartReadout value={fmtNum(point[active])} unit="samples" label={point.label} onClear={focus.isDefault ? undefined : focus.reset} />
        <ChartContainer config={libraryConfig} focus={focus} aria-label={`${libraryConfig[active].label} samples extracted per day, ${rangeInfo.label.toLowerCase()}`} className="aspect-auto h-60">
          <BarChart data={data} margin={{ top: 12, right: 0, left: 0, bottom: 0 }} barCategoryGap={range === "90" ? "18%" : "14%"} {...focus.chartProps}>
            <XAxis
              dataKey="key"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              interval={0}
              tickFormatter={(_, i) => ((data.length - 1 - i) % tickEvery === 0 ? (range === "7" ? data[i].label.split(",")[0] : fmtTick.format(data[i].date)) : "")}
              padding={{ left: 4, right: 4 }}
            />
            <YAxis orientation="right" tickLine={false} axisLine={false} width={40} domain={[0, 120]} ticks={[0, 40, 80, 120]} tick={chartTicks()} />
            <ChartTooltip cursor={false} content={() => null} />
            <Bar key={active} dataKey={active} shape={shape} {...motion} />
            <ReferenceLine x={point.key} {...chartFocusLine} />
            <ReferenceDot x={point.key} y={point[active]} {...chartFocusDot} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

