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

const MONTHS = ["January", "February", "March", "April", "May", "June"]
const monthly = [
  { desktop: 186, mobile: 80, other: 45 },
  { desktop: 305, mobile: 200, other: 100 },
  { desktop: 237, mobile: 120, other: 150 },
  { desktop: 73, mobile: 190, other: 50 },
  { desktop: 209, mobile: 130, other: 100 },
  { desktop: 214, mobile: 140, other: 160 },
].map((d, i) => ({ ...d, month: MONTHS[i], label: `${MONTHS[i]} 2026` }))

const SINGLE = { desktop: { label: "Desktop", color: "var(--blue)" } } satisfies ChartConfig
const DUO = {
  desktop: { label: "Desktop", color: "var(--blue)" },
  mobile: { label: "Mobile", color: "var(--orange)" },
} satisfies ChartConfig
const TRIO = {
  desktop: { label: "Desktop", color: "var(--blue)" },
  mobile: { label: "Mobile", color: "var(--orange)" },
  other: { label: "Other", color: "var(--green)" },
} satisfies ChartConfig

const tickMonth = (v: string) => v.slice(0, 3)
const chartMargin = { top: 12, right: 0, left: 0, bottom: 0 }
const xPad = { left: 14, right: 14 }

function trend(i: number, key: "desktop" | "mobile") {
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

const avgDesktop = Math.round(monthly.reduce((s, d) => s + d.desktop, 0) / monthly.length)

export function SingleAreaDemo({ id, title, description, curve = "monotone", average = false }: { id: string; title: string; description: string; curve?: Curve; average?: boolean }) {
  const motion = useChartAnimation()
  const focus = useChartFocus({
    count: monthly.length,
    describe: (i) => `${monthly[i].label}: ${monthly[i].desktop} visitors`,
  })
  const i = Math.max(0, focus.index)
  const point = monthly[i]
  const fill = `url(#fill-${id})`
  return (
    <Frame title={title} description={description}>
      <ChartReadout value={fmtNum(point.desktop)} unit="visitors" label={point.label} detail={trend(i, "desktop")} onClear={focus.isDefault ? undefined : focus.reset} />
      <ChartContainer config={SINGLE} focus={focus} aria-label="Desktop visitors by month, January to June" className="aspect-auto h-56">
        <AreaChart data={monthly} margin={chartMargin} {...focus.chartProps}>
          <defs>
            <ChartGradient id={`fill-${id}`} k="desktop" />
          </defs>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={10} padding={xPad} tickFormatter={tickMonth} />
          <YAxis
            orientation="right"
            tickLine={false}
            axisLine={false}
            width={40}
            domain={[0, 300]}
            ticks={average ? [0, 100, avgDesktop, 300] : [0, 100, 200, 300]}
            tick={chartTicks({ highlight: average ? { [avgDesktop]: "var(--color-desktop)" } : {} })}
          />
          <ChartTooltip cursor={false} content={() => null} />
          {average && <ReferenceLine y={avgDesktop} stroke="var(--muted-foreground)" strokeWidth={2} strokeDasharray="1 6" strokeLinecap="round" />}
          <Area {...chartArea("desktop", fill)} type={curve} {...motion} />
          <ReferenceLine x={point.month} {...chartFocusLine} />
          <ReferenceDot x={point.month} y={point.desktop} {...chartFocusDot} />
        </AreaChart>
      </ChartContainer>
    </Frame>
  )
}

/* Gradient: two overlapping series, desktop in the readout ---------- */

export function GradientAreaDemo() {
  const motion = useChartAnimation()
  const focus = useChartFocus({
    count: monthly.length,
    describe: (i) => `${monthly[i].label}: ${monthly[i].desktop} desktop and ${monthly[i].mobile} mobile visitors`,
  })
  const i = Math.max(0, focus.index)
  const point = monthly[i]
  return (
    <Frame title="Area Chart - Gradient" description="Desktop and mobile visitors for the last 6 months">
      <ChartReadout
        value={fmtNum(point.desktop)}
        unit="desktop"
        label={point.label}
        detail={`${fmtNum(point.mobile)} on mobile`}
        onClear={focus.isDefault ? undefined : focus.reset}
      />
      <ChartContainer config={DUO} focus={focus} aria-label="Desktop and mobile visitors by month, January to June" className="aspect-auto h-56">
        <AreaChart data={monthly} margin={chartMargin} {...focus.chartProps}>
          <defs>
            <ChartGradient id="fill-gradient-desktop" k="desktop" from={0.55} to={0} />
            <ChartGradient id="fill-gradient-mobile" k="mobile" from={0.5} to={0} />
          </defs>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={10} padding={xPad} tickFormatter={tickMonth} />
          <YAxis orientation="right" tickLine={false} axisLine={false} width={40} domain={[0, 300]} ticks={[0, 100, 200, 300]} tick={chartTicks()} />
          <ChartTooltip cursor={false} content={() => null} />
          <Area {...chartArea("mobile", "url(#fill-gradient-mobile)")} {...motion} />
          <Area {...chartArea("desktop", "url(#fill-gradient-desktop)")} {...motion} />
          <ReferenceLine x={point.month} {...chartFocusLine} />
          <ReferenceDot x={point.month} y={point.desktop} {...chartFocusDot} />
        </AreaChart>
      </ChartContainer>
    </Frame>
  )
}

/* Stacked, Legend, Expanded, Icons, Axes: inverse tooltip, focus line */

function DesktopIcon() {
  return <Icon name="desktop_windows" size={16} fill style={{ color: "var(--color-desktop)" }} />
}
function MobileIcon() {
  return <Icon name="smartphone" size={16} fill style={{ color: "var(--color-mobile)" }} />
}
const ICONS = {
  desktop: { label: "Desktop", color: "var(--blue)", icon: DesktopIcon },
  mobile: { label: "Mobile", color: "var(--orange)", icon: MobileIcon },
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
}: {
  id: string
  title: string
  description: string
  config?: ChartConfig
  expand?: boolean
  legend?: boolean
  axes?: boolean
  curve?: Curve
}) {
  const motion = useChartAnimation()
  const keys = Object.keys(config) as ("desktop" | "mobile" | "other")[]
  const focus = useChartFocus({
    count: monthly.length,
    defaultIndex: -1,
    describe: (i) => (i < 0 ? description : `${monthly[i].label}: ${keys.map((k) => `${monthly[i][k]} ${String(config[k].label).toLowerCase()}`).join(", ")}`),
  })
  const point = focus.index >= 0 ? monthly[focus.index] : undefined
  const name = (k: string) => String(config[k].label)
  return (
    <Frame title={title} description={description}>
      <ChartContainer config={config} focus={focus} aria-label={`${description}, ${keys.map(name).join(", ").toLowerCase()} by month`} className={axes ? "aspect-auto h-72" : "aspect-auto h-60"}>
        <AreaChart data={monthly} margin={chartMargin} stackOffset={expand ? "expand" : "none"} {...focus.chartProps}>
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
            <YAxis orientation="right" tickLine={false} axisLine={false} width={40} domain={[0, 600]} ticks={[0, 200, 400, 600]} tick={chartTicks()} />
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

export const stackedConfigs = { TRIO, ICONS }

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
      desktop: Math.round(150 + 70 * Math.sin(i / 9) + r() * 90 - (weekend ? 50 : 0)),
      mobile: Math.round(110 + 60 * Math.sin(i / 6 + 1) + r() * 80 + (weekend ? 40 : 0)),
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
  const visible = (["desktop", "mobile"] as const).filter((k) => !isHidden(k))
  const sum = (d: (typeof daily)[number]) => visible.reduce((s, k) => s + d[k], 0)
  const focus = useChartFocus({
    count: data.length,
    defaultIndex: -1,
    describe: (i) =>
      i < 0
        ? `${current.label}: ${fmtNum(data.reduce((s, d) => s + sum(d), 0))} visitors`
        : `${data[i].label}: ${visible.map((k) => `${data[i][k]} ${k}`).join(", ") || "no series shown"}`,
  })
  const point = focus.index >= 0 ? data[focus.index] : undefined
  const total = point ? sum(point) : data.reduce((s, d) => s + sum(d), 0)
  const top = Math.max(200, Math.ceil(Math.max(...data.map(sum)) / 100) * 100)
  const detail = visible.length
    ? visible.map((k) => `${fmtNum(point ? point[k] : data.reduce((s, d) => s + d[k], 0))} ${k}`).join(" and ")
    : "Turn a series back on"

  return (
    <Card className={cardClass}>
      <CardContent className="grid gap-6 pt-6">
        <div className="grid gap-1">
          <h3 className="type-title-md">Area Chart - Interactive</h3>
          <p className="type-body-md text-muted-foreground">Showing total visitors for the selected period</p>
        </div>
        <ToggleGroup type="single" value={range} onValueChange={(v) => v && setRange(v as typeof range)} aria-label="Time range" className="w-full *:flex-1">
          {RANGES.map((r) => (
            <ToggleGroupItem key={r.value} value={r.value} aria-label={r.label}>
              {r.short}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <ChartReadout value={fmtNum(total)} unit="visitors" label={point ? point.label : current.label} detail={detail} onClear={focus.isDefault ? undefined : focus.reset} />
        <ChartContainer config={DUO} focus={focus} aria-label={`Desktop and mobile visitors per day, ${current.label.toLowerCase()}`} className="aspect-auto h-64">
          <AreaChart data={data} margin={chartMargin} {...focus.chartProps}>
            <defs>
              <ChartGradient id="fill-int-desktop" k="desktop" from={0.55} to={0.05} />
              <ChartGradient id="fill-int-mobile" k="mobile" from={0.5} to={0.05} />
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={10} minTickGap={36} padding={xPad} tickFormatter={(v: string) => data.find((d) => d.date === v)?.tick ?? v} />
            <YAxis orientation="right" tickLine={false} axisLine={false} width={40} domain={[0, top]} ticks={[0, top / 2, top]} tick={chartTicks()} />
            <ChartTooltip cursor={false} content={() => null} />
            <Area {...chartArea("desktop", "url(#fill-int-desktop)")} stackId="a" hide={isHidden("desktop")} {...motion} />
            <Area {...chartArea("mobile", "url(#fill-int-mobile)")} stackId="a" hide={isHidden("mobile")} {...motion} />
            {point && <ReferenceLine x={point.date} {...chartFocusLine} />}
            {point && visible.length > 0 && <ReferenceDot x={point.date} y={sum(point)} {...chartFocusDot} />}
          </AreaChart>
        </ChartContainer>
        {/* series switch: outside the chart so the slider holds no nested controls */}
        <div role="group" aria-label="Series" className="flex flex-wrap justify-center gap-2">
          {(["desktop", "mobile"] as const).map((k) => {
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
