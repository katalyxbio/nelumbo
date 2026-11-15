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

/* data, after shadcn's line chart examples ---------------------------- */

const MONTHS = ["January", "February", "March", "April", "May", "June"]
const desktop = [186, 305, 237, 73, 209, 214]
const mobile = [80, 200, 120, 190, 130, 140]
const monthly = MONTHS.map((month, i) => ({ month, tick: month.slice(0, 3), desktop: desktop[i], mobile: mobile[i] }))
const fmt = (n: number) => Math.round(n).toLocaleString("en-US")
const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0)
const avgDesktop = Math.round(sum(desktop) / desktop.length)

const cardClass = "[--card:var(--surface-container-low)]"
const margin = { top: 12, right: 0, left: 8, bottom: 0 }

const singleConfig = { desktop: { label: "Desktop", color: "var(--blue)" } } satisfies ChartConfig

function Heading({ title, description }: { title: string; description: string }) {
  return (
    <div className="grid gap-1">
      <h3 className="type-title-lg">{title}</h3>
      <p className="type-body-md text-muted-foreground">{description}</p>
    </div>
  )
}

/** Change against the previous point, as a tonal badge. */
function Trend({ now, before, against }: { now: number; before?: number; against?: string }) {
  if (before === undefined || before === 0) return <span>First month on record</span>
  const pct = ((now - before) / before) * 100
  const up = pct >= 0
  return (
    <Badge variant={up ? "success" : "destructive"} icon={up ? "trending_up" : "trending_down"}>
      {Math.abs(pct).toFixed(1)}% {up ? "up" : "down"} from {against}
    </Badge>
  )
}

/* One series with a readout and a focus: Default, Linear, Step, Dots ---- */

type DotKind = "none" | "dots" | "cookie" | "colors"

const BOLT = "M11 21h-1l1-7H7.5c-.58 0-.57-.32-.38-.66.19-.34.05-.08.07-.12C8.48 10.94 10.42 7.54 13 3h1l-1 7h3.5c.49 0 .56.33.47.51l-.07.15C12.96 17.55 11 21 11 21z"

const colorsConfig = {
  desktop: { label: "Desktop", color: "var(--blue)" },
  low: { label: "Under 150", color: "var(--orange)" },
  mid: { label: "150 to 249", color: "var(--blue)" },
  high: { label: "250 and up", color: "var(--green)" },
} satisfies ChartConfig
const bandOf = (v: number) => (v >= 250 ? "high" : v >= 150 ? "mid" : "low")

function ReadoutLine({
  title,
  description,
  aria,
  curve = "monotone",
  dots = "none",
  average = false,
  legendKeys,
  config = singleConfig,
}: {
  title: string
  description: string
  aria: string
  curve?: "monotone" | "linear" | "step"
  dots?: DotKind
  average?: boolean
  legendKeys?: string[]
  config?: ChartConfig
}) {
  const motion = useChartAnimation()
  const focus = useChartFocus({
    count: monthly.length,
    describe: (i) => `${monthly[i].month} 2026: ${fmt(monthly[i].desktop)} visitors`,
  })
  const i = Math.max(0, focus.index)
  const point = monthly[i]
  const peak = Math.max(...desktop)

  const dot =
    dots === "dots"
      ? chartDot("desktop")
      : dots === "cookie"
        ? chartCookieDot("desktop", { when: (d) => d.desktop === peak, glyph: BOLT, r: 13 })
        : dots === "colors"
          ? chartColorDot((d) => `var(--color-${bandOf(d.desktop)})`)
          : false

  return (
    <Card className={cardClass}>
      <CardContent className="grid gap-6 pt-6">
        <Heading title={title} description={description} />
        <ChartReadout
          value={fmt(point.desktop)}
          unit="visitors"
          label={`${point.month} 2026`}
          detail={<Trend now={point.desktop} before={monthly[i - 1]?.desktop} against={monthly[i - 1]?.month} />}
          onClear={focus.isDefault ? undefined : focus.reset}
        />
        <ChartContainer config={config} focus={focus} aria-label={aria} className="aspect-auto h-64">
          <LineChart data={monthly} margin={{ ...margin, top: dots === "cookie" ? 20 : margin.top }} {...focus.chartProps}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={10} tickFormatter={(v: string) => v.slice(0, 3)} />
            <YAxis
              orientation="right"
              tickLine={false}
              axisLine={false}
              width={40}
              domain={[0, 320]}
              ticks={average ? [0, 100, avgDesktop, 300] : [0, 100, 200, 300]}
              tick={chartTicks({ highlight: average ? { [avgDesktop]: "var(--color-desktop)" } : {} })}
            />
            <ChartTooltip cursor={false} content={() => null} />
            {average && (
              <ReferenceLine
                y={avgDesktop}
                stroke="var(--color-desktop)"
                strokeWidth={3}
                strokeDasharray="0 9"
                strokeLinecap="round"
                ifOverflow="extendDomain"
              />
            )}
            <Line {...chartLine("desktop")} type={curve} dot={dot} {...motion} />
            <ReferenceLine x={point.month} {...chartFocusLine} />
            <ReferenceDot x={point.month} y={point.desktop} {...chartFocusDot} />
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
    description="Visitors by month, January to June 2026. The dotted line is the average."
    aria="Desktop visitors by month, January to June 2026, smooth curve"
    average
  />
)
export const LineLinear = () => (
  <ReadoutLine
    title="Line Chart - Linear"
    description="Straight segments between months."
    aria="Desktop visitors by month, January to June 2026, straight segments"
    curve="linear"
  />
)
export const LineStep = () => (
  <ReadoutLine
    title="Line Chart - Step"
    description="Each month holds its value until the next."
    aria="Desktop visitors by month, January to June 2026, as steps"
    curve="step"
  />
)
export const LineDots = () => (
  <ReadoutLine
    title="Line Chart - Dots"
    description="Every month marked with a ringed dot."
    aria="Desktop visitors by month, January to June 2026, with a dot for each month"
    dots="dots"
  />
)
export const LineCustomDots = () => (
  <ReadoutLine
    title="Line Chart - Custom Dots"
    description="The best month wears a scalloped bolt."
    aria="Desktop visitors by month, January to June 2026, with a scalloped badge on February, the peak"
    dots="cookie"
  />
)
export const LineDotsColors = () => (
  <ReadoutLine
    title="Line Chart - Dots Colors"
    description="Each dot takes the color of its band."
    aria="Desktop visitors by month, January to June 2026, with dots colored by band: under 150, 150 to 249, and 250 and up"
    dots="colors"
    config={colorsConfig}
    legendKeys={["low", "mid", "high"]}
  />
)

/* Multiple: inverse tooltip and a focus line ------------------------- */

const multiConfig = {
  desktop: { label: "Desktop", color: "var(--blue)", swatch: "line" },
  mobile: { label: "Mobile", color: "var(--orange)", swatch: "line" },
} satisfies ChartConfig

export function LineMultiple() {
  const motion = useChartAnimation()
  const focus = useChartFocus({
    count: monthly.length,
    describe: (i) => `${monthly[i].month} 2026: ${monthly[i].desktop} desktop and ${monthly[i].mobile} mobile visitors`,
  })
  const point = monthly[Math.max(0, focus.index)]
  return (
    <Card className={cardClass}>
      <CardContent className="grid gap-6 pt-6">
        <div className="grid gap-3">
          <Heading title="Line Chart - Multiple" description="Desktop and mobile visitors, January to June 2026." />
          <div>
            <Trend now={monthly[5].desktop} before={monthly[4].desktop} against={monthly[4].month} />
          </div>
        </div>
        <ChartContainer config={multiConfig} focus={focus} aria-label="Desktop and mobile visitors by month, January to June 2026" className="aspect-auto h-72">
          <LineChart data={monthly} margin={margin} {...focus.chartProps}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={10} tickFormatter={(v: string) => v.slice(0, 3)} />
            <YAxis orientation="right" tickLine={false} axisLine={false} width={40} domain={[0, 320]} ticks={[0, 100, 200, 300]} tick={chartTicks()} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
            <Line {...chartLine("desktop")} {...motion} />
            <Line {...chartLine("mobile")} {...motion} />
            <ReferenceLine x={point.month} {...chartFocusLine} />
            <ReferenceDot x={point.month} y={point.desktop} {...chartFocusDot} />
            <ReferenceDot x={point.month} y={point.mobile} {...chartFocusDot} />
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
        <Heading title="Line Chart - Label" description="Visitors by month, January to June 2026, with each value on its point." />
        <ChartContainer
          config={singleConfig}
          aria-label="Desktop visitors by month: January 186, February 305, March 237, April 73, May 209, June 214"
          className="aspect-auto h-64"
        >
          <LineChart data={monthly} margin={{ top: 40, right: 26, left: 26, bottom: 0 }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={10} tickFormatter={(v: string) => v.slice(0, 3)} />
            <YAxis hide domain={[0, 340]} />
            <Line {...chartLine("desktop")} dot={chartDot("desktop")} {...motion}>
              <LabelList dataKey="desktop" content={chartPillLabel("desktop")} />
            </Line>
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

const browsers = [
  { name: "Chrome", visitors: 275 },
  { name: "Safari", visitors: 200 },
  { name: "Firefox", visitors: 187 },
  { name: "Edge", visitors: 173 },
  { name: "Other", visitors: 90 },
]
const browserConfig = { visitors: { label: "Visitors", color: "var(--purple)" } } satisfies ChartConfig
const browserColors = ["var(--blue)", "var(--orange)", "var(--pink)", "var(--cyan)", "var(--amber)"]

export function LineCustomLabel() {
  const motion = useChartAnimation()
  return (
    <Card className={cardClass}>
      <CardContent className="grid gap-6 pt-6">
        <Heading title="Line Chart - Custom Label" description="Visitors by browser, each point named in a chip." />
        <ChartContainer
          config={browserConfig}
          aria-label="Visitors by browser: Chrome 275, Safari 200, Firefox 187, Edge 173, Other 90"
          className="aspect-auto h-64"
        >
          <LineChart data={browsers} margin={{ top: 40, right: 28, left: 28, bottom: 8 }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="name" hide />
            <YAxis hide domain={[0, 300]} />
            <Line
              {...chartLine("visitors")}
              dot={chartColorDot((_, i) => browserColors[i % browserColors.length], { r: 6 })}
              {...motion}
            >
              <LabelList dataKey="visitors" content={chartPillLabel("visitors", { tone: "tonal", text: (_v, i) => browsers[i]?.name ?? "" })} />
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
      desktop: Math.round((weekend ? 150 : 270) * trend + noise(n + 1) * 120),
      mobile: Math.round((weekend ? 210 : 170) * trend + noise(n + 400) * 110),
    }
  })
})()

const interactiveConfig = {
  desktop: { label: "Desktop", color: "var(--blue)" },
  mobile: { label: "Mobile", color: "var(--orange)" },
} satisfies ChartConfig

const RANGES = [
  { value: "7D", label: "Last 7 days", days: 7 },
  { value: "30D", label: "Last 30 days", days: 30 },
  { value: "3M", label: "Last 3 months", days: 91 },
] as const
type Range = (typeof RANGES)[number]["value"]
type Series = "desktop" | "mobile"

export function LineInteractive() {
  const motion = useChartAnimation()
  const [range, setRange] = React.useState<Range>("30D")
  const [series, setSeries] = React.useState<Series>("desktop")
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
  const totals = { desktop: sum(data.map((d) => d.desktop)), mobile: sum(data.map((d) => d.mobile)) }
  const focus = useChartFocus({
    count: data.length,
    describe: (i) => `${data[i].label}: ${fmt(data[i][series])} ${interactiveConfig[series].label} visitors`,
  })
  const point = data[Math.max(0, focus.index)]
  const values = data.map((d) => d[series])
  const top = Math.ceil(Math.max(...values) / 100) * 100
  const avg = Math.round(sum(values) / values.length)
  const ticks = avg > top * 0.18 && avg < top * 0.86 ? [0, avg, top] : [0, Math.round(top / 2), top]
  const color = `var(--color-${series})`

  return (
    <Card className={cardClass}>
      <CardContent className="grid gap-6 pt-6">
        <Heading title="Line Chart - Interactive" description="Visitors by device. Pick a series and a period; the chart follows." />
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
          {(["desktop", "mobile"] as const).map((k) => {
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
          unit="visitors"
          label={point.label}
          detail={`${interactiveConfig[series].label}, ${rangeLabel.toLowerCase()}. Average ${fmt(avg)} a day.`}
          onClear={focus.isDefault ? undefined : focus.reset}
        />
        <ChartContainer
          config={interactiveConfig}
          focus={focus}
          aria-label={`${interactiveConfig[series].label} visitors a day, ${rangeLabel.toLowerCase()}`}
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
