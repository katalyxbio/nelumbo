"use client"

import * as React from "react"
import { CartesianGrid, LabelList, Line, LineChart, ReferenceDot, ReferenceLine, XAxis, YAxis } from "recharts"

import { cn } from "@/lib/utils"
import { Badge } from "@/registry/nelumbo/ui/badge"
import { Card, CardContent } from "@/registry/nelumbo/ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartReadout,
  ChartTooltip,
  ChartTooltipContent,
  chartColorDot,
  chartCookieDot,
  chartDot,
  chartFocusDot,
  chartFocusLine,
  chartLine,
  chartPillLabel,
  chartTicks,
  useChartAnimation,
  useChartFocus,
  type ChartConfig,
} from "@/registry/nelumbo/ui/chart"
import { ToggleGroup, ToggleGroupItem } from "@/registry/nelumbo/ui/toggle-group"

/* data: an E. coli growth curve, illustrative ---------------------------- */

// OD600 every two hours after inoculation: logistic growth from 0.05, the wild type
// to about 2, a slower mutant to about 1.4.
const HOURS = [0, 2, 4, 6, 8, 10]
const wt = [0.05, 0.19, 0.59, 1.26, 1.75, 1.93]
const mutant = [0.05, 0.13, 0.31, 0.63, 1.02, 1.32]
const growth = HOURS.map((h, i) => ({ hour: `${h} h`, wt: wt[i], mutant: mutant[i] }))
const fmt = (n: number) => Math.round(n).toLocaleString("en-US")
const fmtOD = (n: number) => n.toFixed(2)
const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0)
/** Where you would induce expression: mid-log. */
const INDUCE = 0.6
const odTicks = chartTicks({ format: (v) => (v === 0 ? "0" : v.toFixed(1)) })

const cardClass = "[--card:var(--surface-container-low)]"
const margin = { top: 12, right: 0, left: 16, bottom: 0 }

const singleConfig = { wt: { label: "OD600", color: "var(--blue)" } } satisfies ChartConfig

function Heading({ title, description }: { title: string; description: string }) {
  return (
    <div className="grid gap-1">
      <h3 className="type-title-lg">{title}</h3>
      <p className="type-body-md text-muted-foreground">{description}</p>
    </div>
  )
}

/** Fold change against the previous reading, as a tonal badge. */
function Trend({ now, before, against }: { now: number; before?: number; against?: string }) {
  if (before === undefined || before === 0) return <span>Inoculated at OD600 0.05</span>
  const fold = now / before
  const up = fold >= 1
  return (
    <Badge variant={up ? "success" : "destructive"} icon={up ? "trending_up" : "trending_down"}>
      {fold.toFixed(1)}× since {against}
    </Badge>
  )
}

/* One series with a readout and a focus: Default, Linear, Step, Dots ---- */

type DotKind = "none" | "dots" | "cookie" | "colors"

const BOLT = "M11 21h-1l1-7H7.5c-.58 0-.57-.32-.38-.66.19-.34.05-.08.07-.12C8.48 10.94 10.42 7.54 13 3h1l-1 7h3.5c.49 0 .56.33.47.51l-.07.15C12.96 17.55 11 21 11 21z"

// growth phase by OD600, roughly: lag below 0.2, stationary from 1.5
const colorsConfig = {
  wt: { label: "OD600", color: "var(--blue)" },
  lag: { label: "Lag", color: "var(--amber)" },
  log: { label: "Exponential", color: "var(--blue)" },
  stationary: { label: "Stationary", color: "var(--green)" },
} satisfies ChartConfig
const phaseOf = (v: number) => (v >= 1.5 ? "stationary" : v >= 0.2 ? "log" : "lag")

function ReadoutLine({
  title,
  description,
  aria,
  curve = "monotone",
  dots = "none",
  induction = false,
  legendKeys,
  config = singleConfig,
}: {
  title: string
  description: string
  aria: string
  curve?: "monotone" | "linear" | "step"
  dots?: DotKind
  induction?: boolean
  legendKeys?: string[]
  config?: ChartConfig
}) {
  const motion = useChartAnimation()
  const focus = useChartFocus({
    count: growth.length,
    describe: (i) => `${growth[i].hour}: OD600 ${fmtOD(growth[i].wt)}${dots === "colors" ? `, ${colorsConfig[phaseOf(growth[i].wt)].label.toLowerCase()} phase` : ""}`,
  })
  const i = Math.max(0, focus.index)
  const point = growth[i]
  // the reading closest to the induction OD
  const induced = wt.reduce((best, v, k) => (Math.abs(v - INDUCE) < Math.abs(wt[best] - INDUCE) ? k : best), 0)

  const dot =
    dots === "dots"
      ? chartDot("wt")
      : dots === "cookie"
        ? chartCookieDot("wt", { when: (_, k) => k === induced, glyph: BOLT, r: 13 })
        : dots === "colors"
          ? chartColorDot((d) => `var(--color-${phaseOf(d.wt)})`)
          : false

  return (
    <Card className={cardClass}>
      <CardContent className="grid gap-6 pt-6">
        <Heading title={title} description={description} />
        <ChartReadout
          value={fmtOD(point.wt)}
          unit="OD600"
          label={`${point.hour} after inoculation`}
          detail={<Trend now={point.wt} before={growth[i - 1]?.wt} against={growth[i - 1]?.hour} />}
          onClear={focus.isDefault ? undefined : focus.reset}
        />
        <ChartContainer config={config} focus={focus} aria-label={aria} className="aspect-auto h-64">
          <LineChart data={growth} margin={{ ...margin, top: dots === "cookie" ? 20 : margin.top }} {...focus.chartProps}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="hour" interval="preserveStartEnd" tickLine={false} axisLine={false} tickMargin={10} />
            <YAxis
              orientation="right"
              tickLine={false}
              axisLine={false}
              width={40}
              domain={[0, 2]}
              ticks={induction ? [0, INDUCE, 1, 1.5, 2] : [0, 0.5, 1, 1.5, 2]}
              tick={induction ? chartTicks({ highlight: { [INDUCE]: "var(--color-wt)" }, format: (v) => (v === 0 ? "0" : v.toFixed(1)) }) : odTicks}
            />
            <ChartTooltip cursor={false} content={() => null} />
            {induction && (
              <ReferenceLine
                y={INDUCE}
                stroke="var(--color-wt)"
                strokeWidth={3}
                strokeDasharray="0 9"
                strokeLinecap="round"
                ifOverflow="extendDomain"
              />
            )}
            <Line {...chartLine("wt")} type={curve} dot={dot} {...motion} />
            <ReferenceLine x={point.hour} {...chartFocusLine} />
            <ReferenceDot x={point.hour} y={point.wt} {...chartFocusDot} />
            {legendKeys && <ChartLegend content={<ChartLegendContent keys={legendKeys} />} />}
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export const LineDefault = () => (
  <ReadoutLine
    title="Line Chart"
    description="E. coli growth, OD600 every two hours. The dotted line is OD600 0.6, where you would induce."
    aria="E. coli growth curve, OD600 every two hours from 0 to 10 hours, smooth curve, with OD600 0.6 marked"
    induction
  />
)
export const LineLinear = () => (
  <ReadoutLine
    title="Line Chart - Linear"
    description="Straight segments between readings."
    aria="E. coli growth curve, OD600 every two hours, straight segments"
    curve="linear"
  />
)
export const LineStep = () => (
  <ReadoutLine
    title="Line Chart - Step"
    description="Each reading holds until the next."
    aria="E. coli growth curve, OD600 every two hours, as steps"
    curve="step"
  />
)
export const LineDots = () => (
  <ReadoutLine
    title="Line Chart - Dots"
    description="Every reading marked with a ringed dot."
    aria="E. coli growth curve, OD600 every two hours, with a dot for each reading"
    dots="dots"
  />
)
export const LineCustomDots = () => (
  <ReadoutLine
    title="Line Chart - Custom Dots"
    description="The reading where you would induce wears a scalloped bolt."
    aria="E. coli growth curve, OD600 every two hours, with a scalloped badge at 4 hours, OD600 0.59, the induction point"
    dots="cookie"
  />
)
export const LineDotsColors = () => (
  <ReadoutLine
    title="Line Chart - Dots Colors"
    description="Each reading takes the color of its growth phase."
    aria="E. coli growth curve, OD600 every two hours, with dots colored by growth phase: lag, exponential and stationary"
    dots="colors"
    config={colorsConfig}
    legendKeys={["lag", "log", "stationary"]}
  />
)

/* Multiple: inverse tooltip and a focus line ------------------------- */

const multiConfig = {
  wt: { label: "Wild type", color: "var(--blue)", swatch: "line" },
  mutant: { label: "Mutant", color: "var(--orange)", swatch: "line" },
} satisfies ChartConfig

export function LineMultiple() {
  const motion = useChartAnimation()
  const focus = useChartFocus({
    count: growth.length,
    describe: (i) => `${growth[i].hour}: wild type OD600 ${fmtOD(growth[i].wt)}, mutant ${fmtOD(growth[i].mutant)}`,
  })
  const point = growth[Math.max(0, focus.index)]
  const last = growth[growth.length - 1]
  return (
    <Card className={cardClass}>
      <CardContent className="grid gap-6 pt-6">
        <div className="grid gap-3">
          <Heading title="Line Chart - Multiple" description="Wild type and a slow-growing mutant, OD600 every two hours. Illustrative." />
          <div>
            <Badge variant="success" icon="trending_up">
              Wild type {(last.wt / last.mutant).toFixed(1)}× denser at {last.hour}
            </Badge>
          </div>
        </div>
        <ChartContainer config={multiConfig} focus={focus} aria-label="OD600 of the wild type and a mutant every two hours, 0 to 10 hours" className="aspect-auto h-72">
          <LineChart data={growth} margin={margin} {...focus.chartProps}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="hour" interval="preserveStartEnd" tickLine={false} axisLine={false} tickMargin={10} />
            <YAxis orientation="right" tickLine={false} axisLine={false} width={40} domain={[0, 2]} ticks={[0, 0.5, 1, 1.5, 2]} tick={odTicks} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" labelFormatter={(l) => `${l}, OD600`} />} />
            <Line {...chartLine("wt")} {...motion} />
            <Line {...chartLine("mutant")} {...motion} />
            <ReferenceLine x={point.hour} {...chartFocusLine} />
            <ReferenceDot x={point.hour} y={point.wt} {...chartFocusDot} />
            <ReferenceDot x={point.hour} y={point.mutant} {...chartFocusDot} />
            <ChartLegend content={<ChartLegendContent />} />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

/* Label and Custom Label: values and names as pills ------------------ */

export function LineLabel() {
  const motion = useChartAnimation()
  return (
    <Card className={cardClass}>
      <CardContent className="grid gap-6 pt-6">
        <Heading title="Line Chart - Label" description="E. coli growth, with each OD600 reading on its point." />
        <ChartContainer
          config={singleConfig}
          aria-label={`E. coli growth curve, OD600: ${growth.map((d) => `${d.hour} ${fmtOD(d.wt)}`).join(", ")}`}
          className="aspect-auto h-64"
        >
          <LineChart data={growth} margin={{ top: 40, right: 26, left: 26, bottom: 0 }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="hour" interval="preserveStartEnd" tickLine={false} axisLine={false} tickMargin={10} />
            <YAxis hide domain={[0, 2.2]} />
            <Line {...chartLine("wt")} dot={chartDot("wt")} {...motion}>
              <LabelList dataKey="wt" content={chartPillLabel("wt", { text: (v) => fmtOD(Number(v)) })} />
            </Line>
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

// E. coli doubling time on each carbon source, minutes, illustrative
const media = [
  { name: "LB", minutes: 20 },
  { name: "Glucose", minutes: 55 },
  { name: "Glycerol", minutes: 80 },
  { name: "Succinate", minutes: 95 },
  { name: "Acetate", minutes: 150 },
]
const mediaConfig = { minutes: { label: "Doubling time", color: "var(--purple)" } } satisfies ChartConfig
const mediaColors = ["var(--blue)", "var(--orange)", "var(--pink)", "var(--cyan)", "var(--amber)"]

export function LineCustomLabel() {
  const motion = useChartAnimation()
  return (
    <Card className={cardClass}>
      <CardContent className="grid gap-6 pt-6">
        <Heading title="Line Chart - Custom Label" description="E. coli doubling time on each carbon source, each point named in a chip. Illustrative." />
        <ChartContainer
          config={mediaConfig}
          aria-label={`E. coli doubling time by carbon source: ${media.map((m) => `${m.name} ${m.minutes} minutes`).join(", ")}`}
          className="aspect-auto h-64"
        >
          <LineChart data={media} margin={{ top: 40, right: 36, left: 36, bottom: 8 }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="name" hide />
            <YAxis hide domain={[0, 170]} />
            <Line
              {...chartLine("minutes")}
              dot={chartColorDot((_, i) => mediaColors[i % mediaColors.length], { r: 6 })}
              {...motion}
            >
              <LabelList dataKey="minutes" content={chartPillLabel("minutes", { tone: "tonal", text: (_v, i) => media[i]?.name ?? "" })} />
            </Line>
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

/* Interactive: series switcher with totals, period switcher ----------- */

const DAY = 86400000
const TODAY = new Date(2026, 10, 15)
const fmtDay = new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric" })
const fmtMonthDay = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" })
const fmtWeekday = new Intl.DateTimeFormat("en-US", { weekday: "short" })
const fmtMonthName = new Intl.DateTimeFormat("en-US", { month: "short" })

const daily = (() => {
  // a deterministic wave with a weekend dip, no randomness at render
  const noise = (n: number) => Math.sin(n * 12.9898) * 43758.5453 - Math.floor(Math.sin(n * 12.9898) * 43758.5453)
  return Array.from({ length: 91 }, (_, n) => {
    const d = new Date(TODAY.getTime() - (90 - n) * DAY)
    const weekend = d.getDay() === 0 || d.getDay() === 6
    const trend = 1 + n / 260
    return {
      date: d,
      key: d.toISOString().slice(0, 10),
      dna: Math.round((weekend ? 14 : 38) * trend + noise(n + 1) * (weekend ? 6 : 14)),
      rna: Math.round((weekend ? 8 : 24) * trend + noise(n + 400) * (weekend ? 5 : 10)),
    }
  })
})()

const interactiveConfig = {
  dna: { label: "DNA", color: "var(--blue)" },
  rna: { label: "RNA", color: "var(--orange)" },
} satisfies ChartConfig

const RANGES = [
  { value: "7D", label: "Last 7 days", days: 7 },
  { value: "30D", label: "Last 30 days", days: 30 },
  { value: "3M", label: "Last 3 months", days: 91 },
] as const
type Range = (typeof RANGES)[number]["value"]
type Series = "dna" | "rna"

export function LineInteractive() {
  const motion = useChartAnimation()
  const [range, setRange] = React.useState<Range>("30D")
  const [series, setSeries] = React.useState<Series>("dna")
  const { days, label: rangeLabel } = RANGES.find((r) => r.value === range)!

  const data = React.useMemo(
    () =>
      daily.slice(-days).map((d, i, all) => ({
        ...d,
        label: i === all.length - 1 ? "Today" : fmtDay.format(d.date),
        tick:
          range === "7D"
            ? fmtWeekday.format(d.date)
            : range === "30D"
              ? i % 7 === 3
                ? fmtMonthDay.format(d.date)
                : ""
              : d.date.getDate() === 1
                ? fmtMonthName.format(d.date)
                : "",
      })),
    [days, range]
  )
  const tickOf = new Map(data.map((d) => [d.key, d.tick]))
  const totals = { dna: sum(data.map((d) => d.dna)), rna: sum(data.map((d) => d.rna)) }
  const focus = useChartFocus({
    count: data.length,
    describe: (i) => `${data[i].label}: ${fmt(data[i][series])} ${interactiveConfig[series].label} samples`,
  })
  const point = data[Math.max(0, focus.index)]
  const values = data.map((d) => d[series])
  const top = Math.ceil(Math.max(...values) / 10) * 10
  const avg = Math.round(sum(values) / values.length)
  const ticks = avg > top * 0.18 && avg < top * 0.86 ? [0, avg, top] : [0, Math.round(top / 2), top]
  const color = `var(--color-${series})`

  return (
    <Card className={cardClass}>
      <CardContent className="grid gap-6 pt-6">
        <Heading title="Line Chart - Interactive" description="Samples received by a sequencing core each day, DNA and RNA. Pick a series and a period; the chart follows." />
        <ToggleGroup
          type="single"
          value={range}
          onValueChange={(v) => v && setRange(v as Range)}
          aria-label="Period"
          className="w-full *:flex-1"
        >
          {RANGES.map((r) => (
            <ToggleGroupItem key={r.value} value={r.value} aria-label={r.label}>
              {r.value}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <div role="group" aria-label="Series" className="grid grid-cols-2 gap-3">
          {(["dna", "rna"] as const).map((k) => {
            const on = series === k
            const c = interactiveConfig[k].color
            return (
              <button
                key={k}
                type="button"
                aria-pressed={on}
                onClick={() => setSeries(k)}
                style={{ backgroundColor: on ? `color-mix(in oklab, ${c} 20%, var(--card))` : undefined }}
                className={cn(
                  "state-layer tactile grid min-w-0 cursor-pointer gap-1 rounded-3xl p-4 text-start outline-none transition-[background-color] duration-200",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                  !on && "bg-surface-container"
                )}
              >
                <span className={cn("flex items-center gap-2 type-label-lg", on ? "text-foreground" : "text-muted-foreground")}>
                  <span aria-hidden className="size-2.5 rounded-full" style={{ background: c }} />
                  {interactiveConfig[k].label}
                </span>
                <span className="type-headline-md tabular-nums">{fmt(totals[k])}</span>
              </button>
            )
          })}
        </div>
        <ChartReadout
          value={fmt(point[series])}
          unit="samples"
          label={point.label}
          detail={`${interactiveConfig[series].label}, ${rangeLabel.toLowerCase()}. Average ${fmt(avg)} a day.`}
          onClear={focus.isDefault ? undefined : focus.reset}
        />
        <ChartContainer
          config={interactiveConfig}
          focus={focus}
          aria-label={`${interactiveConfig[series].label} samples received a day, ${rangeLabel.toLowerCase()}`}
          className="aspect-auto h-64"
        >
          <LineChart data={data} margin={margin} {...focus.chartProps}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="key" tickLine={false} axisLine={false} tickMargin={10} interval={0} tickFormatter={(k: string) => tickOf.get(k) ?? ""} />
            <YAxis
              orientation="right"
              tickLine={false}
              axisLine={false}
              width={40}
              domain={[0, top]}
              ticks={ticks}
              tick={chartTicks({ highlight: { [avg]: color } })}
            />
            <ChartTooltip cursor={false} content={() => null} />
            <ReferenceLine y={avg} stroke={color} strokeWidth={3} strokeDasharray="0 9" strokeLinecap="round" ifOverflow="extendDomain" />
            <Line key={series} {...chartLine(series)} dot={range === "7D" ? chartDot(series) : false} activeDot={false} {...motion} />
            <ReferenceLine x={point.key} {...chartFocusLine} />
            <ReferenceDot x={point.key} y={point[series]} {...chartFocusDot} />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
