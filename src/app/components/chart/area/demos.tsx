"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, ReferenceDot, ReferenceLine, XAxis, YAxis } from "recharts"

import { cn } from "@/lib/utils"
import { Badge } from "@/registry/nelumbo/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/registry/nelumbo/ui/card"
import {
  ChartContainer,
  ChartGradient,
  ChartLegend,
  ChartLegendContent,
  ChartReadout,
  ChartTooltip,
  ChartTooltipContent,
  chartArea,
  chartFocusDot,
  chartFocusLine,
  chartTicks,
  useChartAnimation,
  useChartFocus,
  useSeriesVisibility,
  type ChartConfig,
} from "@/registry/nelumbo/ui/chart"
import { Icon } from "@/registry/nelumbo/ui/icon"
import { ToggleGroup, ToggleGroupItem } from "@/registry/nelumbo/ui/toggle-group"

/* deterministic demo data ------------------------------------------ */

function rng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const fmtNum = (n: number) => Math.round(n).toLocaleString("en-US")

// A sequencing core's monthly output in gigabases, short-read and long-read. Illustrative.
const MONTHS = ["January", "February", "March", "April", "May", "June"]
type Row = { month: string; label: string } & Record<string, number | string>
const monthly = [
  { short: 410, long: 120 },
  { short: 470, long: 150 },
  { short: 455, long: 170 },
  { short: 380, long: 160 },
  { short: 515, long: 210 },
  { short: 545, long: 240 },
].map((d, i) => ({ ...d, month: MONTHS[i], label: `${MONTHS[i]} 2026` }))

// HeLa cells released from a double thymidine block: cells in each phase, of 10,000 counted.
// The synchronized population moves through S, then G2/M, and back into G1. Illustrative.
const cellCycle = [
  { g1: 5500, s: 3500, g2m: 1000 },
  { g1: 1500, s: 7500, g2m: 1000 },
  { g1: 1000, s: 4500, g2m: 4500 },
  { g1: 4500, s: 1500, g2m: 4000 },
  { g1: 6500, s: 2000, g2m: 1500 },
  { g1: 5000, s: 3500, g2m: 1500 },
].map((d, i) => ({ ...d, month: `${i * 3} h`, label: `${i * 3} h after release` }))

const SINGLE = { short: { label: "Short-read", color: "var(--blue)" } } satisfies ChartConfig
const DUO = {
  short: { label: "Short-read", color: "var(--blue)" },
  long: { label: "Long-read", color: "var(--orange)" },
} satisfies ChartConfig
const PHASES = {
  g1: { label: "G1", color: "var(--blue)" },
  s: { label: "S", color: "var(--orange)" },
  g2m: { label: "G2/M", color: "var(--green)" },
} satisfies ChartConfig

const tickMonth = (v: string) => (/^\d/.test(v) ? v : v.slice(0, 3))
const chartMargin = { top: 12, right: 0, left: 16, bottom: 0 }
const xPad = { left: 14, right: 14 }

function trend(i: number, key: "short" | "long") {
  const cur = monthly[i][key]
  const prev = monthly[i - 1]?.[key]
  if (prev === undefined) return <span>First month shown</span>
  const pct = ((cur - prev) / prev) * 100
  const up = pct >= 0
  return (
    <Badge variant={up ? "success" : "destructive"} icon={up ? "trending_up" : "trending_down"}>
      {up ? "+" : "-"}
      {Math.abs(pct).toFixed(1)}% on {MONTHS[i - 1]}
    </Badge>
  )
}

const cardClass = "[--card:var(--surface-container-low)]"

function Frame({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <Card className={cardClass}>
      <CardHeader>
        <CardTitle className="type-title-md">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">{children}</CardContent>
    </Card>
  )
}

/* Default, Linear, Step, Gradient: one series, readout and focus ----- */

type Curve = "monotone" | "linear" | "step"

const avgShort = Math.round(monthly.reduce((s, d) => s + d.short, 0) / monthly.length)

export function SingleAreaDemo({ id, title, description, curve = "monotone", average = false }: { id: string; title: string; description: string; curve?: Curve; average?: boolean }) {
  const motion = useChartAnimation()
  const focus = useChartFocus({
    count: monthly.length,
    describe: (i) => `${monthly[i].label}: ${monthly[i].short} gigabases`,
  })
  const i = Math.max(0, focus.index)
  const point = monthly[i]
  const fill = `url(#fill-${id})`
  return (
    <Frame title={title} description={description}>
      <ChartReadout value={fmtNum(point.short)} unit="Gb" label={point.label} detail={trend(i, "short")} onClear={focus.isDefault ? undefined : focus.reset} />
      <ChartContainer config={SINGLE} focus={focus} aria-label="Short-read gigabases sequenced each month, January to June 2026" className="aspect-auto h-56">
        <AreaChart data={monthly} margin={chartMargin} {...focus.chartProps}>
          <defs>
            <ChartGradient id={`fill-${id}`} k="short" />
          </defs>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="month" interval="preserveStartEnd" tickLine={false} axisLine={false} tickMargin={10} padding={xPad} tickFormatter={tickMonth} />
          <YAxis
            orientation="right"
            tickLine={false}
            axisLine={false}
            width={40}
            domain={[0, 600]}
            ticks={average ? [0, 200, avgShort, 600] : [0, 200, 400, 600]}
            tick={chartTicks({ highlight: average ? { [avgShort]: "var(--color-short)" } : {} })}
          />
          <ChartTooltip cursor={false} content={() => null} />
          {average && <ReferenceLine y={avgShort} stroke="var(--muted-foreground)" strokeWidth={2} strokeDasharray="1 6" strokeLinecap="round" />}
          <Area {...chartArea("short", fill)} type={curve} {...motion} />
          <ReferenceLine x={point.month} {...chartFocusLine} />
          <ReferenceDot x={point.month} y={point.short} {...chartFocusDot} />
        </AreaChart>
      </ChartContainer>
    </Frame>
  )
}

/* Gradient: two overlapping series, short-read in the readout ------- */

export function GradientAreaDemo() {
  const motion = useChartAnimation()
  const focus = useChartFocus({
    count: monthly.length,
    describe: (i) => `${monthly[i].label}: ${monthly[i].short} gigabases short-read and ${monthly[i].long} long-read`,
  })
  const i = Math.max(0, focus.index)
  const point = monthly[i]
  return (
    <Frame title="Area Chart - Gradient" description="Gigabases sequenced each month, short-read and long-read">
      <ChartReadout
        value={fmtNum(point.short)}
        unit="Gb short-read"
        label={point.label}
        detail={`${fmtNum(point.long)} Gb long-read`}
        onClear={focus.isDefault ? undefined : focus.reset}
      />
      <ChartContainer config={DUO} focus={focus} aria-label="Short-read and long-read gigabases sequenced each month, January to June 2026" className="aspect-auto h-56">
        <AreaChart data={monthly} margin={chartMargin} {...focus.chartProps}>
          <defs>
            <ChartGradient id="fill-gradient-short" k="short" from={0.55} to={0} />
            <ChartGradient id="fill-gradient-long" k="long" from={0.5} to={0} />
          </defs>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="month" interval="preserveStartEnd" tickLine={false} axisLine={false} tickMargin={10} padding={xPad} tickFormatter={tickMonth} />
          <YAxis orientation="right" tickLine={false} axisLine={false} width={40} domain={[0, 600]} ticks={[0, 200, 400, 600]} tick={chartTicks()} />
          <ChartTooltip cursor={false} content={() => null} />
          <Area {...chartArea("long", "url(#fill-gradient-long)")} {...motion} />
          <Area {...chartArea("short", "url(#fill-gradient-short)")} {...motion} />
          <ReferenceLine x={point.month} {...chartFocusLine} />
          <ReferenceDot x={point.month} y={point.short} {...chartFocusDot} />
        </AreaChart>
      </ChartContainer>
    </Frame>
  )
}

/* Stacked, Legend, Expanded, Icons, Axes: inverse tooltip, focus line */

// short lines and long lines: short and long reads
function ShortIcon() {
  return <Icon name="format_align_left" size={16} style={{ color: "var(--color-short)" }} />
}
function LongIcon() {
  return <Icon name="format_align_justify" size={16} style={{ color: "var(--color-long)" }} />
}
const ICONS = {
  short: { label: "Short-read", color: "var(--blue)", icon: ShortIcon },
  long: { label: "Long-read", color: "var(--orange)", icon: LongIcon },
} satisfies ChartConfig

const percentTick = chartTicks({ format: (v) => `${Math.round(v * 100)}%` })

export function StackedAreaDemo({
  id,
  title,
  description,
  config = DUO,
  expand = false,
  legend = false,
  axes = false,
  curve = "monotone",
  data = monthly,
  unit = "Gb",
}: {
  id: string
  title: string
  description: string
  config?: ChartConfig
  /** Rows with a month (the x label), a label for the tooltip, and a number per config key. */
  data?: Row[]
  /** For the screen reader's account of a point. */
  unit?: string
  expand?: boolean
  legend?: boolean
  axes?: boolean
  curve?: Curve
}) {
  const motion = useChartAnimation()
  const keys = Object.keys(config)
  const focus = useChartFocus({
    count: data.length,
    defaultIndex: -1,
    describe: (i) => (i < 0 ? description : `${data[i].label}: ${keys.map((k) => `${fmtNum(Number(data[i][k]))} ${unit} ${String(config[k].label)}`).join(", ")}`),
  })
  const point = focus.index >= 0 ? data[focus.index] : undefined
  const top = Math.ceil(Math.max(...data.map((d) => keys.reduce((s, k) => s + Number(d[k]), 0))) / 200) * 200
  const name = (k: string) => String(config[k].label)
  return (
    <Frame title={title} description={description}>
      <ChartContainer config={config} focus={focus} aria-label={`${description}: ${keys.map(name).join(", ")}`} className={axes ? "aspect-auto h-72" : "aspect-auto h-60"}>
        <AreaChart data={data} margin={chartMargin} stackOffset={expand ? "expand" : "none"} {...focus.chartProps}>
          <defs>
            {keys.map((k) => (
              <ChartGradient key={k} id={`fill-${id}-${k}`} k={k} from={expand ? 0.6 : 0.5} to={expand ? 0.3 : 0.06} />
            ))}
          </defs>
          <CartesianGrid vertical={axes} />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickMargin={10}
            padding={xPad}
            tickFormatter={tickMonth}
            tickLine={axes ? { stroke: "var(--outline-variant)", strokeWidth: 2, strokeLinecap: "round" } : false}
            tickSize={axes ? 6 : 0}
          />
          {expand ? (
            <YAxis orientation="right" tickLine={false} axisLine={false} width={44} domain={[0, 1]} ticks={[0, 0.5, 1]} tick={percentTick} />
          ) : (
            <YAxis orientation="right" tickLine={false} axisLine={false} width={40} domain={[0, top]} ticks={[0, top / 2, top]} tick={chartTicks()} />
          )}
          <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" labelFormatter={(_, p) => p?.[0]?.payload?.label} />} />
          {keys.map((k) => (
            <Area key={k} {...chartArea(k, `url(#fill-${id}-${k})`)} type={curve} stackId="a" {...motion} />
          ))}
          {point && <ReferenceLine x={point.month} {...chartFocusLine} />}
          {legend && <ChartLegend content={<ChartLegendContent />} />}
        </AreaChart>
      </ChartContainer>
    </Frame>
  )
}

export const stackedConfigs = { PHASES, ICONS }
export const stackedData = { cellCycle }

/* Interactive: period switcher, total readout, series chips --------- */

const pad2 = (n: number) => String(n).padStart(2, "0")
const fmtDay = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" })
const fmtFull = new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric" })

const daily = (() => {
  const r = rng(4242)
  return Array.from({ length: 90 }, (_, i) => {
    const d = new Date(2026, 10, 15 - (89 - i))
    const weekend = d.getDay() === 0 || d.getDay() === 6
    return {
      date: `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`,
      tick: fmtDay.format(d),
      label: i === 89 ? "Today" : fmtFull.format(d),
      // the sequencers run every day; output follows how many flow cells were loaded
      short: Math.round(16 + 5 * Math.sin(i / 9) + r() * 9 - (weekend ? 6 : 0)),
      long: Math.round(5 + 2 * Math.sin(i / 6 + 1) + r() * 4),
    }
  })
})()

const RANGES = [
  { value: "90", short: "90D", label: "Last 3 months", days: 90 },
  { value: "30", short: "30D", label: "Last 30 days", days: 30 },
  { value: "7", short: "7D", label: "Last 7 days", days: 7 },
] as const

export function InteractiveAreaDemo() {
  const motion = useChartAnimation()
  const [range, setRange] = React.useState<(typeof RANGES)[number]["value"]>("90")
  const { hiddenKeys, toggle, isHidden } = useSeriesVisibility()
  const current = RANGES.find((r) => r.value === range)!
  const data = React.useMemo(() => daily.slice(-current.days), [current.days])
  const visible = (["short", "long"] as const).filter((k) => !isHidden(k))
  const sum = (d: (typeof daily)[number]) => visible.reduce((s, k) => s + d[k], 0)
  const focus = useChartFocus({
    count: data.length,
    defaultIndex: -1,
    describe: (i) =>
      i < 0
        ? `${current.label}: ${fmtNum(data.reduce((s, d) => s + sum(d), 0))} gigabases`
        : `${data[i].label}: ${visible.map((k) => `${data[i][k]} Gb ${DUO[k].label}`).join(", ") || "no series shown"}`,
  })
  const point = focus.index >= 0 ? data[focus.index] : undefined
  const total = point ? sum(point) : data.reduce((s, d) => s + sum(d), 0)
  const top = Math.max(20, Math.ceil(Math.max(...data.map(sum)) / 10) * 10)
  const detail = visible.length
    ? visible.map((k) => `${fmtNum(point ? point[k] : data.reduce((s, d) => s + d[k], 0))} Gb ${DUO[k].label.toLowerCase()}`).join(" and ")
    : "Turn a series back on"

  return (
    <Card className={cardClass}>
      <CardContent className="grid gap-6 pt-6">
        <div className="grid gap-1">
          <h3 className="type-title-md">Area Chart - Interactive</h3>
          <p className="type-body-md text-muted-foreground">Gigabases sequenced each day, for the selected period. Illustrative.</p>
        </div>
        <ToggleGroup type="single" value={range} onValueChange={(v) => v && setRange(v as typeof range)} aria-label="Time range" className="w-full *:flex-1">
          {RANGES.map((r) => (
            <ToggleGroupItem key={r.value} value={r.value} aria-label={r.label}>
              {r.short}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <ChartReadout value={fmtNum(total)} unit="Gb" label={point ? point.label : current.label} detail={detail} onClear={focus.isDefault ? undefined : focus.reset} />
        <ChartContainer config={DUO} focus={focus} aria-label={`Short-read and long-read gigabases per day, ${current.label.toLowerCase()}`} className="aspect-auto h-64">
          <AreaChart data={data} margin={chartMargin} {...focus.chartProps}>
            <defs>
              <ChartGradient id="fill-int-short" k="short" from={0.55} to={0.05} />
              <ChartGradient id="fill-int-long" k="long" from={0.5} to={0.05} />
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={10} minTickGap={36} padding={xPad} tickFormatter={(v: string) => data.find((d) => d.date === v)?.tick ?? v} />
            <YAxis orientation="right" tickLine={false} axisLine={false} width={40} domain={[0, top]} ticks={[0, top / 2, top]} tick={chartTicks()} />
            <ChartTooltip cursor={false} content={() => null} />
            <Area {...chartArea("short", "url(#fill-int-short)")} stackId="a" hide={isHidden("short")} {...motion} />
            <Area {...chartArea("long", "url(#fill-int-long)")} stackId="a" hide={isHidden("long")} {...motion} />
            {point && <ReferenceLine x={point.date} {...chartFocusLine} />}
            {point && visible.length > 0 && <ReferenceDot x={point.date} y={sum(point)} {...chartFocusDot} />}
          </AreaChart>
        </ChartContainer>
        {/* series switch: outside the chart so the slider holds no nested controls */}
        <div role="group" aria-label="Series" className="flex flex-wrap justify-center gap-2">
          {(["short", "long"] as const).map((k) => {
            const off = hiddenKeys.includes(k)
            return (
              <button
                key={k}
                type="button"
                aria-pressed={!off}
                onClick={() => toggle(k)}
                className={cn(
                  "state-layer tactile inline-flex h-9 cursor-pointer items-center gap-2 rounded-full px-3.5 type-label-lg outline-none transition-[background-color,color] duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                  off ? "bg-transparent text-muted-foreground" : "bg-secondary text-secondary-foreground"
                )}
              >
                <span
                  aria-hidden
                  className="size-2.5 rounded-full"
                  style={{ backgroundColor: DUO[k].color, boxShadow: off ? `inset 0 0 0 1.5px ${DUO[k].color}` : undefined, ...(off && { backgroundColor: "transparent" }) }}
                />
                {DUO[k].label}
                <span className="tabular-nums text-muted-foreground">{fmtNum(data.reduce((s, d) => s + d[k], 0))}</span>
              </button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
