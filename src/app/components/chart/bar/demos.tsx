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

const months = ["January", "February", "March", "April", "May", "June"]
const monthShort = (i: number) => months[i].slice(0, 3)

const monthly = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
].map((d, i) => ({ ...d, tick: monthShort(i) }))

const visitorsConfig = {
  desktop: { label: "Desktop", color: "var(--blue)" },
  mobile: { label: "Mobile", color: "var(--orange)" },
} satisfies ChartConfig

const monthTick = (i: number) => monthly[i]?.tick ?? ""

/* Default: pill bars, a goal line, badges on goal months ------------- */

export function DefaultBarDemo() {
  const motion = useChartAnimation()
  const goal = 200
  const focus = useChartFocus({
    count: monthly.length,
    describe: (i) => `${monthly[i].month}: ${monthly[i].desktop} visitors${monthly[i].desktop >= goal ? ", goal reached" : ""}`,
  })
  const point = monthly[Math.max(0, focus.index)]
  const prev = monthly[Math.max(0, focus.index) - 1]
  const delta = prev ? Math.round(((point.desktop - prev.desktop) / prev.desktop) * 100) : undefined
  return (
    <Card className={CARD}>
      <CardContent className="grid gap-6 pt-6">
        <CardHead title="Bar Chart" description="Desktop visitors, January to June 2026" />
        <ChartReadout
          value={fmtNum(point.desktop)}
          unit="visitors"
          label={point.month}
          detail={
            delta === undefined ? undefined : (
              <Badge variant={delta >= 0 ? "success" : "destructive"} icon={delta >= 0 ? "trending_up" : "trending_down"}>
                {delta >= 0 ? "+" : ""}
                {delta}% on {prev.month}
              </Badge>
            )
          }
          onClear={focus.isDefault ? undefined : focus.reset}
        />
        <ChartContainer config={visitorsConfig} focus={focus} aria-label="Desktop visitors per month, January to June, against a goal of 200" className="aspect-auto h-60">
          <BarChart data={monthly} margin={{ top: 12, right: 0, left: 0, bottom: 0 }} barCategoryGap="16%" {...focus.chartProps}>
            <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={10} interval={0} tickFormatter={(_, i) => monthTick(i)} />
            <YAxis orientation="right" tickLine={false} axisLine={false} width={44} domain={[0, 350]} ticks={[0, 100, goal, 350]} tick={chartTicks({ highlight: { [goal]: "var(--color-desktop)" } })} />
            <ChartTooltip cursor={false} content={() => null} />
            <ReferenceLine y={goal} {...chartGoalLine("desktop")} />
            <Bar dataKey="desktop" shape={chartPillBar("desktop", { goal })} {...motion} />
            <ReferenceLine x={point.month} {...chartFocusLine} />
            <ReferenceDot x={point.month} y={point.desktop} {...chartFocusDot} />
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
        <CardHead title="Bar Chart - Horizontal" description="Desktop visitors, January to June 2026" />
        <ChartContainer config={visitorsConfig} aria-label="Desktop visitors per month, as horizontal bars" className="aspect-auto h-64">
          <BarChart data={monthly} layout="vertical" margin={{ top: 0, right: 56, left: 0, bottom: 0 }} barCategoryGap="22%" onMouseMove={(s) => setHover(s?.isTooltipActive ? (s.activeTooltipIndex ?? null) : null)} onMouseLeave={() => setHover(null)}>
            <XAxis type="number" hide domain={[0, 330]} />
            <YAxis dataKey="month" type="category" tickLine={false} axisLine={false} width={44} tickFormatter={(_, i) => monthTick(i)} className="[&_text]:fill-foreground" />
            <ChartTooltip cursor={false} content={() => null} />
            <Bar dataKey="desktop" fill="var(--color-desktop)" radius={chartBarRadius} background={chartTrack("desktop", hover === null ? undefined : { index: hover })} {...motion}>
              <LabelList dataKey="desktop" content={chartBarLabel({ horizontal: true })} />
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
    count: monthly.length,
    defaultIndex: -1,
    describe: (i) => (i < 0 ? "January to June: desktop 1,224, mobile 860" : `${monthly[i].month}: desktop ${monthly[i].desktop}, mobile ${monthly[i].mobile}`),
  })
  const point = focus.index >= 0 ? monthly[focus.index] : undefined
  const total = point ? point.desktop + point.mobile : monthly.reduce((s, d) => s + d.desktop + d.mobile, 0)
  const detail = point ? `Desktop ${fmtNum(point.desktop)}, mobile ${fmtNum(point.mobile)}` : "Desktop 1,224, mobile 860"
  return { focus, point, total, detail }
}

export function MultipleBarDemo() {
  const motion = useChartAnimation()
  const { focus, point, total, detail } = useTwoSeriesFocus()
  return (
    <Card className={CARD}>
      <CardContent className="grid gap-6 pt-6">
        <CardHead title="Bar Chart - Multiple" description="Desktop and mobile visitors, January to June 2026" />
        <ChartReadout value={fmtNum(total)} unit="visitors" label={point ? point.month : "Six months"} detail={detail} onClear={focus.isDefault ? undefined : focus.reset} />
        <ChartContainer config={visitorsConfig} focus={focus} aria-label="Desktop and mobile visitors per month, grouped bars" className="aspect-auto h-64">
          <BarChart data={monthly} margin={{ top: 12, right: 0, left: 0, bottom: 0 }} barCategoryGap="10%" barGap={3} {...focus.chartProps}>
            <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={10} interval={0} tickFormatter={(_, i) => monthTick(i)} />
            <YAxis orientation="right" tickLine={false} axisLine={false} width={40} domain={[0, 350]} ticks={[0, 100, 200, 300]} tick={chartTicks()} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
            <Bar dataKey="desktop" fill="var(--color-desktop)" radius={chartBarRadius} {...motion} />
            <Bar dataKey="mobile" fill="var(--color-mobile)" radius={chartBarRadius} {...motion} />
            {point && <ReferenceLine x={point.month} {...chartFocusLine} />}
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
        <CardHead title="Bar Chart - Stacked + Legend" description="Desktop and mobile visitors, January to June 2026" />
        <ChartReadout value={fmtNum(total)} unit="visitors" label={point ? point.month : "Six months"} detail={detail} onClear={focus.isDefault ? undefined : focus.reset} />
        <ChartContainer config={visitorsConfig} focus={focus} aria-label="Desktop and mobile visitors per month, stacked bars" className="aspect-auto h-64">
          <BarChart data={monthly} margin={{ top: 12, right: 0, left: 0, bottom: 0 }} barCategoryGap="16%" {...focus.chartProps}>
            <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={10} interval={0} tickFormatter={(_, i) => monthTick(i)} />
            <YAxis orientation="right" tickLine={false} axisLine={false} width={40} domain={[0, 500]} ticks={[0, 200, 400]} tick={chartTicks()} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
            <Bar dataKey="desktop" stackId="a" fill="var(--color-desktop)" {...chartSegment} {...motion} />
            <Bar dataKey="mobile" stackId="a" fill="var(--color-mobile)" {...chartSegment} {...motion} />
            {point && <ReferenceLine x={point.month} {...chartFocusLine} />}
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
        <CardHead title="Bar Chart - Label" description="Desktop visitors, January to June 2026" />
        <ChartContainer config={visitorsConfig} aria-label="Desktop visitors per month, each bar labelled with its value" className="aspect-auto h-64">
          <BarChart data={monthly} margin={{ top: 32, right: 0, left: 0, bottom: 0 }} barCategoryGap="16%">
            <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={10} interval={0} tickFormatter={(_, i) => monthTick(i)} />
            <ChartTooltip cursor={false} content={() => null} />
            <Bar dataKey="desktop" fill="var(--color-desktop)" radius={chartBarRadius} {...motion}>
              <LabelList dataKey="desktop" content={chartBarLabel()} />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

/* Custom Label: names inside horizontal pill bars ------------------------ */

const sources = [
  { name: "Search", visitors: 275, color: "blue" },
  { name: "Direct", visitors: 200, color: "orange" },
  { name: "Social", visitors: 187, color: "green" },
  { name: "Email", visitors: 173, color: "purple" },
  { name: "Other", visitors: 90, color: "pink" },
]
const sourceConfig = {
  visitors: { label: "Visitors" },
  ...Object.fromEntries(sources.map((s) => [s.name.toLowerCase(), { label: s.name, color: `var(--${s.color})` }])),
} satisfies ChartConfig
const sourceData = sources.map((s) => ({ ...s, key: s.name.toLowerCase(), fill: `var(--color-${s.name.toLowerCase()})` }))

export function CustomLabelBarDemo() {
  const motion = useChartAnimation()
  return (
    <Card className={CARD}>
      <CardContent className="grid gap-6 pt-6">
        <CardHead title="Bar Chart - Custom Label" description="Visitors by source, labelled inside each bar" />
        <ChartContainer config={sourceConfig} aria-label="Visitors by source: search 275, direct 200, social 187, email 173, other 90" className="aspect-auto h-64">
          <BarChart data={sourceData} layout="vertical" margin={{ top: 0, right: 56, left: 0, bottom: 0 }} barCategoryGap="14%">
            <XAxis type="number" hide domain={[0, 300]} />
            <YAxis dataKey="name" type="category" hide />
            <ChartTooltip cursor={false} content={() => null} />
            <Bar dataKey="visitors" radius={chartBarRadius} {...motion}>
              {sourceData.map((d) => (
                <Cell key={d.key} fill={d.fill} />
              ))}
              <LabelList dataKey="visitors" content={chartBarLabelPerColor(sourceData)} />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

/** Names inside each bar in that bar's on-color (blue to --blue-foreground), the value as a pill after it. */
function chartBarLabelPerColor(rows: typeof sourceData) {
  function Label(props: unknown) {
    const p = props as { index?: number } & Record<string, unknown>
    const i = p.index ?? 0
    const row = rows[i]
    const inside = chartBarLabel({ horizontal: true, position: "inside-start", onColor: `var(--${row.color}-foreground)`, text: () => row.name })
    const end = chartBarLabel({ horizontal: true })
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

const browsers = [
  { key: "chrome", label: "Chrome", visitors: 275 },
  { key: "safari", label: "Safari", visitors: 200 },
  { key: "firefox", label: "Firefox", visitors: 187 },
  { key: "edge", label: "Edge", visitors: 173 },
  { key: "other", label: "Other", visitors: 90 },
]
const browserConfig = {
  visitors: { label: "Visitors" },
  chrome: { label: "Chrome", color: "var(--blue)" },
  safari: { label: "Safari", color: "var(--cyan)" },
  firefox: { label: "Firefox", color: "var(--orange)" },
  edge: { label: "Edge", color: "var(--green)" },
  other: { label: "Other", color: "var(--purple)" },
} satisfies ChartConfig
const browserData = browsers.map((b) => ({ ...b, fill: `var(--color-${b.key})` }))

export function MixedBarDemo() {
  const motion = useChartAnimation()
  const [hover, setHover] = React.useState<number | null>(null)
  return (
    <Card className={CARD}>
      <CardContent className="grid gap-6 pt-6">
        <CardHead title="Bar Chart - Mixed" description="Visitors by browser, one color per row" />
        <ChartContainer config={browserConfig} aria-label="Visitors by browser: Chrome 275, Safari 200, Firefox 187, Edge 173, other 90" className="aspect-auto h-64">
          <BarChart data={browserData} layout="vertical" margin={{ top: 0, right: 56, left: 0, bottom: 0 }} barCategoryGap="22%" onMouseMove={(s) => setHover(s?.isTooltipActive ? (s.activeTooltipIndex ?? null) : null)} onMouseLeave={() => setHover(null)}>
            <XAxis type="number" hide domain={[0, 300]} />
            <YAxis dataKey="key" type="category" tickLine={false} axisLine={false} width={64} tickFormatter={(v: string) => browserConfig[v as keyof typeof browserConfig]?.label as string} className="[&_text]:fill-foreground" />
            <ChartTooltip cursor={false} content={() => null} />
            <Bar dataKey="visitors" radius={chartBarRadius} background={chartTrack("chrome", hover === null ? undefined : { index: hover })} {...motion}>
              {browserData.map((d) => (
                <Cell key={d.key} fill={d.fill} />
              ))}
              <LabelList dataKey="visitors" content={chartBarLabel({ horizontal: true })} />
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
    count: browsers.length,
    defaultIndex: 0,
    describe: (i) => `${browsers[i].label}: ${browsers[i].visitors} visitors`,
  })
  const point = browsers[Math.max(0, focus.index)]
  const total = browsers.reduce((s, b) => s + b.visitors, 0)
  return (
    <Card className={CARD}>
      <CardContent className="grid gap-6 pt-6">
        <CardHead title="Bar Chart - Active" description="Visitors by browser. Hover, tap or use the arrow keys to move the highlight." />
        <ChartReadout
          value={fmtNum(point.visitors)}
          unit="visitors"
          label={point.label}
          detail={`${Math.round((point.visitors / total) * 100)}% of all visits`}
          onClear={focus.isDefault ? undefined : focus.reset}
        />
        <ChartContainer config={browserConfig} focus={focus} aria-label="Visitors by browser, with one browser highlighted" className="aspect-auto h-56">
          <BarChart data={browserData} margin={{ top: 12, right: 0, left: 0, bottom: 0 }} barCategoryGap="14%" {...focus.chartProps}>
            <XAxis dataKey="key" tickLine={false} axisLine={false} tickMargin={10} interval={0} tickFormatter={(v: string) => browserConfig[v as keyof typeof browserConfig]?.label as string} />
            <ChartTooltip cursor={false} content={() => null} />
            <Bar dataKey="visitors" radius={chartBarRadius} {...motion}>
              {browserData.map((d, i) => (
                <Cell key={d.key} fill={focus.fill(d.key, i)} className="transition-[fill] duration-300 ease-(--ease-spring)" />
              ))}
            </Bar>
            <ReferenceDot x={point.key} y={point.visitors} {...chartFocusDot} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

/* Negative: pills on both sides of a zero line --------------------------------- */

const balance = [
  { month: "January", value: 186 },
  { month: "February", value: -205 },
  { month: "March", value: -207 },
  { month: "April", value: 173 },
  { month: "May", value: -209 },
  { month: "June", value: 214 },
].map((d, i) => ({ ...d, tick: monthShort(i) }))
const balanceConfig = {
  gain: { label: "Gain", color: "var(--green)" },
  loss: { label: "Loss", color: "var(--red)" },
} satisfies ChartConfig

export function NegativeBarDemo() {
  const motion = useChartAnimation()
  const focus = useChartFocus({
    count: balance.length,
    describe: (i) => `${balance[i].month}: ${balance[i].value > 0 ? "+" : ""}${balance[i].value}`,
  })
  const point = balance[Math.max(0, focus.index)]
  const net = balance.reduce((s, d) => s + d.value, 0)
  return (
    <Card className={CARD}>
      <CardContent className="grid gap-6 pt-6">
        <CardHead title="Bar Chart - Negative" description="Monthly change, gains above the zero line and losses below" />
        <ChartReadout
          value={`${point.value > 0 ? "+" : "−"}${Math.abs(point.value)}`}
          unit="visitors"
          label={point.month}
          detail={focus.isDefault ? `Net ${net >= 0 ? "+" : "−"}${Math.abs(net)} over six months` : undefined}
          onClear={focus.isDefault ? undefined : focus.reset}
        />
        <ChartContainer config={balanceConfig} focus={focus} aria-label="Monthly change in visitors, gains above zero and losses below" className="aspect-auto h-80">
          <BarChart data={balance} margin={{ top: 32, right: 0, left: 0, bottom: 0 }} barCategoryGap="30%" {...focus.chartProps}>
            <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={10} interval={0} tickFormatter={(_, i) => balance[i]?.tick ?? ""} />
            <YAxis hide domain={[-250, 250]} />
            <ChartTooltip cursor={false} content={() => null} />
            <ReferenceLine y={0} stroke="var(--outline-variant)" strokeWidth={2} strokeLinecap="round" ifOverflow="visible" />
            <Bar dataKey="value" radius={chartBarRadius} {...motion}>
              {balance.map((d) => (
                <Cell key={d.month} fill={d.value >= 0 ? "var(--color-gain)" : "var(--color-loss)"} />
              ))}
              <LabelList dataKey="value" content={chartBarLabel({ format: (v) => `${v > 0 ? "+" : "−"}${Math.abs(v)}` })} />
            </Bar>
            <ReferenceLine x={point.month} {...chartFocusLine} />
            <ReferenceDot x={point.month} y={0} {...chartFocusDot} />
            <ChartLegend verticalAlign="bottom" content={<ChartLegendContent keys={["gain", "loss"]} />} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

/* Interactive: series switcher + period switcher + readout ------------------------ */

type Day = { key: string; date: Date; label: string; desktop: number; mobile: number }
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
    const desktop = Math.round((weekend ? 150 : 290) * swell + rnd() * 90)
    const mobile = Math.round((weekend ? 260 : 190) * swell + rnd() * 110)
    return {
      key: date.toISOString().slice(0, 10),
      date,
      label: new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric" }).format(date),
      desktop,
      mobile,
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
  const [active, setActive] = React.useState<"desktop" | "mobile">("desktop")
  const rangeInfo = RANGES.find((r) => r.value === range)!
  const data = React.useMemo(() => interactiveData.slice(-Number(range)), [range])
  const totals = React.useMemo(
    () => ({ desktop: data.reduce((s, d) => s + d.desktop, 0), mobile: data.reduce((s, d) => s + d.mobile, 0) }),
    [data]
  )
  const focus = useChartFocus({
    count: data.length,
    describe: (i) => `${data[i].label}: ${fmtNum(data[i][active])} ${visitorsConfig[active].label.toLowerCase()} visitors`,
  })
  const point = data[Math.max(0, focus.index)]
  const shape = React.useMemo(() => chartPillBar(active), [active])
  const tickEvery = range === "7" ? 1 : range === "30" ? 7 : 14

  return (
    <Card className={CARD}>
      <CardContent className="grid gap-6 pt-6">
        <div className="grid gap-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <CardHead title="Bar Chart - Interactive" description={`Visitors, ${rangeInfo.label.toLowerCase()}`} />
            <ToggleGroup type="single" value={range} onValueChange={(v) => v && setRange(v as typeof range)} aria-label="Period">
              {RANGES.map((r) => (
                <ToggleGroupItem key={r.value} value={r.value} aria-label={r.label}>
                  {r.short}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
          <div role="group" aria-label="Series" className="grid grid-cols-2 gap-2">
            {(["desktop", "mobile"] as const).map((k) => {
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
                    {visitorsConfig[k].label}
                  </span>
                  <span className="type-headline-sm tabular-nums">{fmtNum(totals[k])}</span>
                </button>
              )
            })}
          </div>
        </div>
        <ChartReadout value={fmtNum(point[active])} unit="visitors" label={point.label} onClear={focus.isDefault ? undefined : focus.reset} />
        <ChartContainer config={visitorsConfig} focus={focus} aria-label={`${visitorsConfig[active].label} visitors per day, ${rangeInfo.label.toLowerCase()}`} className="aspect-auto h-60">
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
            <YAxis orientation="right" tickLine={false} axisLine={false} width={40} domain={[0, 600]} ticks={[0, 200, 400, 600]} tick={chartTicks()} />
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

