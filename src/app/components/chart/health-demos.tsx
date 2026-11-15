"use client"

import * as React from "react"
import { Bar, BarChart, ComposedChart, Line, ReferenceDot, ReferenceLine, XAxis, YAxis } from "recharts"

import { Card, CardContent } from "@/registry/nelumbo/ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartReadout,
  ChartRings,
  ChartStages,
  ChartTooltip,
  ChartZoneGradient,
  chartFocusDot,
  chartFocusLine,
  chartGoalLine,
  chartLine,
  chartPillBar,
  chartTicks,
  chartZoneLine,
  useChartAnimation,
  useChartFocus,
  type ChartConfig,
  type ChartStage,
} from "@/registry/nelumbo/ui/chart"
import { IconButton } from "@/registry/nelumbo/ui/icon-button"
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

const TODAY = new Date(2026, 10, 15) // Sun, Nov 15 2026
const DAY = 86400000
const dayAt = (offset: number) => new Date(TODAY.getTime() + offset * DAY)
const fmtShort = new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric" })
const fmtNarrow = new Intl.DateTimeFormat("en-US", { weekday: "narrow" })
const fmtMonth = new Intl.DateTimeFormat("en-US", { month: "short" })
const fmtMonthDay = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" })
const fmtNum = (n: number) => Math.round(n).toLocaleString("en-US")

/* the period header: switcher, title, previous / next / back to today */

const PERIODS = [
  { value: "D", label: "Day" },
  { value: "W", label: "Week" },
  { value: "M", label: "Month" },
  { value: "3M", label: "3 months" },
  { value: "Y", label: "Year" },
] as const
type Period = (typeof PERIODS)[number]["value"]

function PeriodHeader({
  period,
  onPeriod,
  title,
  page,
  onPage,
  periods = PERIODS.map((p) => p.value),
}: {
  period: Period
  onPeriod: (p: Period) => void
  title: string
  page: number
  onPage: (p: number) => void
  periods?: Period[]
}) {
  return (
    <div className="grid gap-5">
      <ToggleGroup
        type="single"
        value={period}
        onValueChange={(v) => v && onPeriod(v as Period)}
        aria-label="Period"
        className="w-full *:flex-1"
      >
        {PERIODS.filter((p) => periods.includes(p.value)).map((p) => (
          <ToggleGroupItem key={p.value} value={p.value} aria-label={p.label}>
            {p.value}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <div className="flex items-center gap-2">
        <h3 className="me-auto type-headline-sm">{title}</h3>
        <IconButton variant="secondary" icon="chevron_left" label="Previous" onClick={() => onPage(page - 1)} />
        <IconButton variant="secondary" icon="chevron_right" label="Next" disabled={page >= 0} onClick={() => onPage(page + 1)} />
        <IconButton variant="secondary" icon="history" label="Back to today" disabled={page === 0} onClick={() => onPage(0)} />
      </div>
    </div>
  )
}

/* Steps: pill bars, goal line, badges on goal days ------------------ */

type StepPoint = { key: string; tick: string; label: string; value: number }

function stepsSeries(period: Period, page: number): { data: StepPoint[]; goal?: number; title: string; unit: string } {
  const r = rng(9001 + page * 31 + period.length * 7 + period.charCodeAt(0))
  const daySteps = (d: Date) => {
    const weekend = d.getDay() === 0 || d.getDay() === 6
    return Math.round((weekend ? 9800 : 6400) + r() * 5200)
  }
  if (period === "D") {
    const day = dayAt(page)
    const data = Array.from({ length: 24 }, (_, h) => {
      const active = h >= 7 && h <= 22
      const peak = h === 8 || h === 12 || h === 18 ? 2.6 : 1
      const future = page === 0 && h > 22
      return {
        key: `h${h}`,
        tick: h % 6 === 0 ? String(h) : "",
        label: `${String(h).padStart(2, "0")}:00`,
        value: future ? 0 : active ? Math.round((180 + r() * 620) * peak) : Math.round(r() * 40),
      }
    })
    return { data, title: page === 0 ? "Today" : fmtShort.format(day), unit: "steps" }
  }
  if (period === "W") {
    const end = page * 7
    const data = Array.from({ length: 7 }, (_, i) => {
      const d = dayAt(end - 6 + i)
      return { key: d.toISOString(), tick: fmtNarrow.format(d), label: page === 0 && i === 6 ? "Today" : fmtShort.format(d), value: daySteps(d) }
    })
    const title = page === 0 ? "This week" : `${fmtMonthDay.format(dayAt(end - 6))} – ${fmtMonthDay.format(dayAt(end))}`
    return { data, goal: 10000, title, unit: "steps" }
  }
  if (period === "M") {
    const end = page * 30
    const data = Array.from({ length: 30 }, (_, i) => {
      const d = dayAt(end - 29 + i)
      return { key: d.toISOString(), tick: i % 7 === 1 ? String(d.getDate()) : "", label: page === 0 && i === 29 ? "Today" : fmtShort.format(d), value: daySteps(d) }
    })
    return { data, goal: 10000, title: page === 0 ? "Last 30 days" : `${fmtMonthDay.format(dayAt(end - 29))} – ${fmtMonthDay.format(dayAt(end))}`, unit: "steps" }
  }
  if (period === "3M") {
    const end = page * 91
    const data = Array.from({ length: 13 }, (_, i) => {
      const d = dayAt(end - 90 + i * 7)
      return { key: d.toISOString(), tick: i % 4 === 0 ? fmtMonth.format(d) : "", label: `Week of ${fmtMonthDay.format(d)}`, value: 7600 + r() * 3600 }
    })
    return { data, goal: 10000, title: page === 0 ? "Last 3 months" : "Earlier", unit: "steps a day" }
  }
  const year = 2026 + page
  const data = Array.from({ length: 12 }, (_, m) => {
    const d = new Date(year, m, 1)
    const future = page === 0 && m > 10
    return { key: d.toISOString(), tick: fmtMonth.format(d).slice(0, 1), label: `${fmtMonth.format(d)} ${year}`, value: future ? 0 : 7200 + r() * 3800 }
  })
  return { data, goal: 10000, title: String(year), unit: "steps a day" }
}

const stepsConfig = { steps: { label: "Steps", color: "var(--cyan)" } } satisfies ChartConfig

export function StepsDemo() {
  const motion = useChartAnimation()
  const [period, setPeriod] = React.useState<Period>("W")
  const [page, setPage] = React.useState(0)
  const { data, goal, title, unit } = React.useMemo(() => stepsSeries(period, page), [period, page])
  const summary = period === "D" ? data.reduce((s, d) => s + d.value, 0) : undefined
  const focus = useChartFocus({
    count: data.length,
    defaultIndex: period === "D" ? -1 : data.findLastIndex((d) => d.value > 0),
    describe: (i) => (i < 0 ? `${title}: ${fmtNum(summary ?? 0)} ${unit}` : `${data[i].label}: ${fmtNum(data[i].value)} ${unit}`),
  })
  const point = focus.index >= 0 ? data[focus.index] : undefined
  const max = Math.max(...data.map((d) => d.value), goal ?? 0)
  const top = Math.ceil(max / 100) * 100
  const ticks = goal ? [0, Math.round(goal * 0.44), goal, top] : [0, Math.round(top / 2), top]

  return (
    <Card className="[--card:var(--surface-container-low)]">
      <CardContent className="grid gap-6 pt-6">
        <PeriodHeader
          period={period}
          onPeriod={(p) => {
            setPeriod(p)
            setPage(0)
          }}
          title={title}
          page={page}
          onPage={setPage}
        />
        <ChartReadout
          value={fmtNum(point ? point.value : (summary ?? 0))}
          unit={point ? unit : "steps"}
          label={point ? point.label : title}
          onClear={focus.isDefault ? undefined : focus.reset}
        />
        <ChartContainer config={stepsConfig} focus={focus} aria-label={`Steps, ${title.toLowerCase()}`} className="aspect-auto h-64">
          <BarChart data={data} margin={{ top: 12, right: 0, left: 0, bottom: 0 }} barCategoryGap={period === "M" ? "26%" : "12%"} {...focus.chartProps}>
            <XAxis dataKey="key" tickLine={false} axisLine={false} tickMargin={10} interval={0} tickFormatter={(_, i) => data[i]?.tick ?? ""} />
            <YAxis
              orientation="right"
              tickLine={false}
              axisLine={false}
              width={52}
              domain={[0, top]}
              ticks={ticks}
              tick={chartTicks({ highlight: goal ? { [goal]: "var(--color-steps)" } : {} })}
            />
            <ChartTooltip cursor={false} content={() => null} />
            {goal && <ReferenceLine y={goal} {...chartGoalLine("steps")} />}
            <Bar dataKey="value" shape={chartPillBar("steps", { goal, badge: period !== "M" })} {...motion} />
            {point && <ReferenceLine x={point.key} {...chartFocusLine} />}
            {point && <ReferenceDot x={point.key} y={point.value} {...chartFocusDot} />}
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

/* Heart rate, a day: zone lines, a line that changes color by zone --- */

const zonesConfig = {
  bpm: { label: "Heart rate" },
  light: { label: "Light", color: "var(--cyan)", swatch: 1 },
  moderate: { label: "Moderate", color: "var(--green)", swatch: 2 },
  vigorous: { label: "Vigorous", color: "var(--amber)", swatch: 3 },
  peak: { label: "Peak", color: "var(--red)", swatch: 4 },
} satisfies ChartConfig

const ZONES = [
  { key: "light", from: 30 },
  { key: "moderate", from: 113 },
  { key: "vigorous", from: 141 },
  { key: "peak", from: 176 },
] as const
const zoneOf = (bpm: number) => [...ZONES].reverse().find((z) => bpm >= z.from)?.key ?? "light"

const heartData = (() => {
  const r = rng(77)
  const out: { key: string; label: string; tick: string; bpm: number; range: [number, number] }[] = []
  for (let m = 0; m <= 21 * 60; m += 10) {
    const h = m / 60
    let base = h < 6.5 ? 52 : h < 7.5 ? 64 : 72
    if (h >= 18 && h < 18.75) base = 128 + Math.sin((h - 18) * 8) * 18 // a run
    if (h >= 12.4 && h < 12.7) base = 98
    const bpm = Math.round(base + (r() - 0.5) * 8)
    const lo = Math.round(bpm - 4 - r() * 6)
    const hi = Math.round(bpm + 4 + r() * (base > 100 ? 18 : 10))
    const hh = Math.floor(h)
    out.push({ key: `m${m}`, label: `${String(hh).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`, tick: m % 240 === 0 ? String(hh) : "", bpm, range: [lo, hi] })
  }
  return out
})()
const hrMin = Math.min(...heartData.map((d) => d.range[0]))
const hrMax = Math.max(...heartData.map((d) => d.range[1]))
const lineMin = Math.min(...heartData.map((d) => d.bpm))
const lineMax = Math.max(...heartData.map((d) => d.bpm))

export function HeartRateDemo() {
  const motion = useChartAnimation()
  const focus = useChartFocus({
    count: heartData.length,
    defaultIndex: -1,
    describe: (i) => (i < 0 ? `Today: ${hrMin} to ${hrMax} bpm` : `${heartData[i].label}: ${heartData[i].bpm} bpm, ${zoneOf(heartData[i].bpm)} zone`),
  })
  const point = focus.index >= 0 ? heartData[focus.index] : undefined
  return (
    <Card className="[--card:var(--surface-container-low)]">
      <CardContent className="grid gap-6 pt-6">
        <ChartReadout
          value={point ? point.bpm : `${hrMin}–${hrMax}`}
          unit="bpm"
          label={point ? point.label : "Today"}
          detail={point ? `${zonesConfig[zoneOf(point.bpm)].label} zone` : `High of ${hrMax} bpm in the vigorous zone, during a 45 minute run`}
          onClear={focus.isDefault ? undefined : focus.reset}
        />
        <ChartContainer config={zonesConfig} focus={focus} aria-label="Heart rate today, by zone" className="aspect-auto h-72">
          <ComposedChart data={heartData} margin={{ top: 8, right: 0, left: 8, bottom: 0 }} barCategoryGap="30%" {...focus.chartProps}>
            <defs>
              <ChartZoneGradient id="hr-zones" range={[lineMin, lineMax]} zones={[...ZONES]} />
            </defs>
            <XAxis dataKey="key" tickLine={false} axisLine={false} tickMargin={10} interval={0} tickFormatter={(_, i) => heartData[i]?.tick ?? ""} />
            <YAxis orientation="right" tickLine={false} axisLine={false} width={40} domain={[30, 180]} ticks={[30, 74, 113, 141, 176]} tick={chartTicks()} />
            <ChartTooltip cursor={false} content={() => null} />
            {ZONES.map((z) => (
              <ReferenceLine key={z.key} y={z.key === "light" ? 30 : z.from} {...chartZoneLine(z.key)} />
            ))}
            <Bar dataKey="range" fill="color-mix(in oklab, var(--foreground) 16%, transparent)" radius={999} isAnimationActive={false} />
            <Line {...chartLine("bpm")} stroke="url(#hr-zones)" strokeWidth={2.5} type="monotone" {...motion} />
            {point && <ReferenceLine x={point.key} {...chartFocusLine} />}
            {point && <ReferenceDot x={point.key} y={point.bpm} {...chartFocusDot} />}
            <ChartLegend content={<ChartLegendContent keys={["light", "moderate", "vigorous", "peak"]} />} />
          </ComposedChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

/* Resting heart rate: personal range band, dots in or out of range -- */

const restConfig = {
  range: { label: "Personal range", color: "var(--green)", swatch: "band" },
  inRange: { label: "In range", color: "var(--green)" },
  outRange: { label: "Out of range", color: "var(--red)" },
} satisfies ChartConfig

const restData = [
  { lo: 59, hi: 66, rhr: 60 },
  { lo: 57, hi: 66, rhr: 55 },
  { lo: 57, hi: 66, rhr: 58 },
  { lo: 57, hi: 66, rhr: 58 },
  { lo: 57, hi: 66, rhr: 58 },
  { lo: 57, hi: 65, rhr: 58 },
  { lo: 57, hi: 65, rhr: 58 },
].map((d, i) => {
  const day = dayAt(-6 + i)
  return { ...d, band: [d.lo, d.hi] as [number, number], key: day.toISOString(), tick: fmtNarrow.format(day), label: i === 6 ? "Today" : fmtShort.format(day), in: d.rhr >= d.lo && d.rhr <= d.hi }
})

function RestDot({ cx, cy, payload }: { cx?: number; cy?: number; payload?: (typeof restData)[number] }) {
  if (cx === undefined || cy === undefined || !payload) return <g />
  return <circle cx={cx} cy={cy} r={5} fill={payload.in ? "var(--color-inRange)" : "var(--color-outRange)"} stroke="var(--chart-surface)" strokeWidth={2} />
}

export function RestingHeartRateDemo() {
  const motion = useChartAnimation()
  const focus = useChartFocus({
    count: restData.length,
    describe: (i) => `${restData[i].label}: ${restData[i].rhr} bpm, ${restData[i].in ? "in" : "below"} your personal range of ${restData[i].lo} to ${restData[i].hi}`,
  })
  const point = restData[Math.max(0, focus.index)]
  return (
    <Card className="[--card:var(--surface-container-low)]">
      <CardContent className="grid gap-6 pt-6">
        <ChartReadout
          value={point.rhr}
          unit="bpm"
          label={point.label}
          detail={point.in ? undefined : `Below your personal range of ${point.lo}–${point.hi}`}
          onClear={focus.isDefault ? undefined : focus.reset}
        />
        <ChartContainer config={restConfig} focus={focus} aria-label="Resting heart rate this week against your personal range" className="aspect-auto h-64">
          <ComposedChart data={restData} margin={{ top: 8, right: 0, left: 0, bottom: 0 }} barCategoryGap={0} {...focus.chartProps}>
            <XAxis dataKey="key" tickLine={false} axisLine={false} tickMargin={10} tickFormatter={(_, i) => restData[i]?.tick ?? ""} />
            <YAxis orientation="right" tickLine={false} axisLine={false} width={36} domain={[53, 68]} ticks={[55, 59, 64, 68]} tick={chartTicks()} />
            <ChartTooltip cursor={false} content={() => null} />
            <Bar dataKey="band" fill="color-mix(in oklab, var(--color-range) 26%, var(--chart-surface))" stroke="color-mix(in oklab, var(--color-range) 26%, var(--chart-surface))" strokeWidth={1} isAnimationActive={false} />
            <Line dataKey="rhr" type="linear" stroke="var(--color-inRange)" strokeWidth={3} strokeLinecap="round" dot={<RestDot />} activeDot={false} {...motion} />
            <ReferenceLine x={point.key} {...chartFocusLine} />
            <ReferenceDot x={point.key} y={point.rhr} {...chartFocusDot} />
            <ChartLegend content={<ChartLegendContent keys={["range", "inRange", "outRange"]} />} />
          </ComposedChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

/* Sleep: stage lanes ------------------------------------------------ */

const sleepConfig = {
  awake: { label: "Awake", color: "var(--pink)" },
  restless: { label: "Restless", color: "var(--green)" },
  rem: { label: "REM", color: "var(--cyan)" },
  light: { label: "Light", color: "var(--blue)" },
  deep: { label: "Deep", color: "var(--purple)" },
} satisfies ChartConfig

const sleepData: ChartStage[] = (() => {
  const t0 = new Date(2026, 10, 15, 0, 58).getTime()
  const M = 60000
  const plan: [string, number][] = [
    ["awake", 6], ["light", 22], ["deep", 34], ["light", 8], ["rem", 10], ["light", 36], ["deep", 26], ["light", 14],
    ["rem", 46], ["light", 32], ["deep", 18], ["light", 12], ["rem", 22], ["light", 18], ["rem", 6], ["light", 24],
    ["rem", 8], ["light", 40], ["awake", 10], ["rem", 28],
  ]
  let t = t0
  const out: ChartStage[] = []
  for (const [stage, mins] of plan) {
    out.push({ stage, start: t, end: t + mins * M })
    t += mins * M
  }
  ;[14, 92, 104, 110, 140, 286, 300, 318, 326, 334, 348, 366, 408].forEach((m) => out.push({ stage: "restless", start: t0 + m * M }))
  return out
})()

export function SleepDemo() {
  return (
    <Card className="[--card:var(--surface-container-low)]">
      <CardContent className="grid gap-6 pt-6">
        <ChartReadout value="7h 42m" unit="00:58–08:56" detail="You spent 7h 58m in bed, with a sleep efficiency of 97%." />
        <ChartStages
          config={sleepConfig}
          data={sleepData}
          levels={["awake", "restless", "rem", "light", "deep"]}
          events={["restless"]}
          startCaption="Went to bed"
          endCaption="Out of bed"
          locale="en-GB"
        />
      </CardContent>
    </Card>
  )
}

/* Rings: daily goals ----------------------------------------------- */

const rings = [
  { key: "steps", label: "Steps", value: 11742, max: 10000, color: "var(--cyan)" },
  { key: "zone", label: "Zone minutes", value: 18, max: 22, unit: "min", color: "var(--amber)" },
  { key: "energy", label: "Energy", value: 2954, max: 2875, unit: "cal", color: "var(--pink)" },
]

export function RingsDemo() {
  return (
    <Card className="[--card:var(--surface-container-low)]">
      <CardContent className="flex flex-wrap items-center gap-8 pt-6">
        <ChartRings rings={rings} size={208} thickness={14} gap={4}>
          <div className="grid">
            <span className="type-headline-md font-[520] tabular-nums">2/3</span>
            <span className="type-label-md text-muted-foreground">goals met</span>
          </div>
        </ChartRings>
        <ul className="grid min-w-40 flex-1 gap-4">
          {rings.map((r) => (
            <li key={r.key} className="grid gap-0.5">
              <span className="flex items-center gap-2 type-label-lg text-muted-foreground">
                <span aria-hidden className="size-2.5 rounded-full" style={{ background: r.color }} />
                {r.label}
              </span>
              <span className="type-title-lg tabular-nums">
                {fmtNum(r.value)}
                <span className="type-body-md text-muted-foreground"> of {fmtNum(r.max)}{r.unit ? ` ${r.unit}` : ""}</span>
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
