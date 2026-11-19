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

/* Samples: pill bars, a plate a day as the goal, badges on goal days */

type SamplePoint = { key: string; tick: string; label: string; value: number }

// Samples through extraction; the goal is one 96-well plate a day.
const PLATE = 96

function samplesSeries(period: Period, page: number): { data: SamplePoint[]; goal?: number; title: string; unit: string } {
  const r = rng(9001 + page * 31 + period.length * 7 + period.charCodeAt(0))
  const daySamples = (d: Date) => {
    const weekend = d.getDay() === 0 || d.getDay() === 6
    return Math.round(weekend ? 18 + r() * 30 : 84 + r() * 34)
  }
  if (period === "D") {
    const day = dayAt(page)
    const data = Array.from({ length: 24 }, (_, h) => {
      const bench = h >= 8 && h <= 18
      const batch = h === 9 || h === 11 || h === 14 || h === 16 ? 2.4 : 1
      const future = page === 0 && h > 18
      return {
        key: `h${h}`,
        tick: h % 6 === 0 ? String(h) : "",
        label: `${String(h).padStart(2, "0")}:00`,
        value: future ? 0 : bench ? Math.round((3 + r() * 6) * batch) : 0,
      }
    })
    return { data, title: page === 0 ? "Today" : fmtShort.format(day), unit: "samples" }
  }
  if (period === "W") {
    const end = page * 7
    const data = Array.from({ length: 7 }, (_, i) => {
      const d = dayAt(end - 6 + i)
      return { key: d.toISOString(), tick: fmtNarrow.format(d), label: page === 0 && i === 6 ? "Today" : fmtShort.format(d), value: daySamples(d) }
    })
    const title = page === 0 ? "This week" : `${fmtMonthDay.format(dayAt(end - 6))} – ${fmtMonthDay.format(dayAt(end))}`
    return { data, goal: PLATE, title, unit: "samples" }
  }
  if (period === "M") {
    const end = page * 30
    const data = Array.from({ length: 30 }, (_, i) => {
      const d = dayAt(end - 29 + i)
      return { key: d.toISOString(), tick: i % 7 === 1 ? String(d.getDate()) : "", label: page === 0 && i === 29 ? "Today" : fmtShort.format(d), value: daySamples(d) }
    })
    return { data, goal: PLATE, title: page === 0 ? "Last 30 days" : `${fmtMonthDay.format(dayAt(end - 29))} – ${fmtMonthDay.format(dayAt(end))}`, unit: "samples" }
  }
  if (period === "3M") {
    const end = page * 91
    const data = Array.from({ length: 13 }, (_, i) => {
      const d = dayAt(end - 90 + i * 7)
      return { key: d.toISOString(), tick: i % 4 === 0 ? fmtMonth.format(d) : "", label: `Week of ${fmtMonthDay.format(d)}`, value: 66 + r() * 38 }
    })
    return { data, goal: PLATE, title: page === 0 ? "Last 3 months" : "Earlier", unit: "samples a day" }
  }
  const year = 2026 + page
  const data = Array.from({ length: 12 }, (_, m) => {
    const d = new Date(year, m, 1)
    const future = page === 0 && m > 10
    return { key: d.toISOString(), tick: fmtMonth.format(d).slice(0, 1), label: `${fmtMonth.format(d)} ${year}`, value: future ? 0 : 60 + r() * 42 }
  })
  return { data, goal: PLATE, title: String(year), unit: "samples a day" }
}

const samplesConfig = { samples: { label: "Samples", color: "var(--cyan)" } } satisfies ChartConfig

export function SamplesDemo() {
  const motion = useChartAnimation()
  const [period, setPeriod] = React.useState<Period>("W")
  const [page, setPage] = React.useState(0)
  const { data, goal, title, unit } = React.useMemo(() => samplesSeries(period, page), [period, page])
  const summary = period === "D" ? data.reduce((s, d) => s + d.value, 0) : undefined
  const focus = useChartFocus({
    count: data.length,
    defaultIndex: period === "D" ? -1 : data.findLastIndex((d) => d.value > 0),
    describe: (i) => (i < 0 ? `${title}: ${fmtNum(summary ?? 0)} ${unit}` : `${data[i].label}: ${fmtNum(data[i].value)} ${unit}`),
  })
  const point = focus.index >= 0 ? data[focus.index] : undefined
  const max = Math.max(...data.map((d) => d.value), goal ?? 0)
  const top = Math.ceil(max / 10) * 10
  const ticks = goal ? [0, 48, goal, top] : [0, Math.round(top / 2), top]

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
          unit={point ? unit : "samples"}
          label={point ? point.label : title}
          detail={goal && point ? (point.value >= goal ? "A full plate extracted" : `${fmtNum(goal - point.value)} short of a plate`) : undefined}
          onClear={focus.isDefault ? undefined : focus.reset}
        />
        <ChartContainer config={samplesConfig} focus={focus} aria-label={`Samples extracted, ${title.toLowerCase()}, against a goal of one 96-well plate a day`} className="aspect-auto h-64">
          <BarChart data={data} margin={{ top: 12, right: 0, left: 0, bottom: 0 }} barCategoryGap={period === "M" ? "26%" : "12%"} {...focus.chartProps}>
            <XAxis dataKey="key" tickLine={false} axisLine={false} tickMargin={10} interval={0} tickFormatter={(_, i) => data[i]?.tick ?? ""} />
            <YAxis
              orientation="right"
              tickLine={false}
              axisLine={false}
              width={40}
              domain={[0, top]}
              ticks={ticks}
              tick={chartTicks({ highlight: goal ? { [goal]: "var(--color-samples)" } : {} })}
            />
            <ChartTooltip cursor={false} content={() => null} />
            {goal && <ReferenceLine y={goal} {...chartGoalLine("samples")} />}
            <Bar dataKey="value" shape={chartPillBar("samples", { goal, badge: period !== "M" })} {...motion} />
            {point && <ReferenceLine x={point.key} {...chartFocusLine} />}
            {point && <ReferenceDot x={point.key} y={point.value} {...chartFocusDot} />}
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

/* Dissolved oxygen through a fed-batch run: zone lines, a line that changes color by zone */

const zonesConfig = {
  do: { label: "Dissolved oxygen" },
  anoxic: { label: "Limiting", color: "var(--red)", swatch: 1 },
  low: { label: "Low", color: "var(--amber)", swatch: 2 },
  target: { label: "Setpoint", color: "var(--green)", swatch: 3 },
  high: { label: "Excess", color: "var(--cyan)", swatch: 4 },
} satisfies ChartConfig

const ZONES = [
  { key: "anoxic", from: 0 },
  { key: "low", from: 20 },
  { key: "target", from: 30 },
  { key: "high", from: 60 },
] as const
const zoneOf = (v: number) => [...ZONES].reverse().find((z) => v >= z.from)?.key ?? "anoxic"

// E. coli in a 2 L fermenter: saturated at inoculation, drawn down as the culture
// grows, held at 40% by the stirrer, with a dip when the feed starts. Illustrative.
const doData = (() => {
  const r = rng(77)
  const out: { key: string; label: string; tick: string; do: number; range: [number, number] }[] = []
  for (let m = 0; m <= 24 * 60; m += 15) {
    const h = m / 60
    let base = h < 4 ? 98 - h * 6 : h < 8 ? 74 - (h - 4) * 9 : 40
    if (h >= 9 && h < 10) base = 40 - Math.sin((h - 9) * Math.PI) * 26 // feed starts
    if (h >= 16 && h < 16.5) base = 70 // stirrer step
    const v = Math.max(2, Math.round(base + (r() - 0.5) * 6))
    const lo = Math.max(0, Math.round(v - 3 - r() * 5))
    const hi = Math.min(100, Math.round(v + 3 + r() * 6))
    const hh = Math.floor(h)
    out.push({ key: `m${m}`, label: `${hh}h ${String(m % 60).padStart(2, "0")}m`, tick: m % 360 === 0 ? `${hh}h` : "", do: v, range: [lo, hi] })
  }
  return out
})()
const doMin = Math.min(...doData.map((d) => d.do))
const lineMin = Math.min(...doData.map((d) => d.do))
const lineMax = Math.max(...doData.map((d) => d.do))

export function OxygenDemo() {
  const motion = useChartAnimation()
  const focus = useChartFocus({
    count: doData.length,
    defaultIndex: -1,
    describe: (i) => (i < 0 ? `Run 0418: dissolved oxygen fell to ${doMin}% when the feed started` : `${doData[i].label}: ${doData[i].do}% dissolved oxygen, ${zonesConfig[zoneOf(doData[i].do)].label.toLowerCase()}`),
  })
  const point = focus.index >= 0 ? doData[focus.index] : undefined
  return (
    <Card className="[--card:var(--surface-container-low)]">
      <CardContent className="grid gap-6 pt-6">
        <ChartReadout
          value={point ? point.do : doMin}
          unit="% DO"
          label={point ? `${point.label} after inoculation` : "Run 0418, lowest"}
          detail={point ? zonesConfig[zoneOf(point.do)].label : "Held at a 40% setpoint, with one dip when the glucose feed started at 9 hours"}
          onClear={focus.isDefault ? undefined : focus.reset}
        />
        <ChartContainer config={zonesConfig} focus={focus} aria-label="Dissolved oxygen over a 24 hour fed-batch fermentation, by zone" className="aspect-auto h-72">
          <ComposedChart data={doData} margin={{ top: 8, right: 0, left: 8, bottom: 0 }} barCategoryGap="30%" {...focus.chartProps}>
            <defs>
              <ChartZoneGradient id="do-zones" range={[lineMin, lineMax]} zones={[...ZONES]} />
            </defs>
            <XAxis dataKey="key" tickLine={false} axisLine={false} tickMargin={10} interval={0} tickFormatter={(_, i) => doData[i]?.tick ?? ""} />
            <YAxis orientation="right" tickLine={false} axisLine={false} width={40} domain={[0, 100]} ticks={[0, 20, 30, 60, 100]} tick={chartTicks()} />
            <ChartTooltip cursor={false} content={() => null} />
            {ZONES.map((z) => (
              <ReferenceLine key={z.key} y={z.from} {...chartZoneLine(z.key)} />
            ))}
            <Bar dataKey="range" fill="color-mix(in oklab, var(--foreground) 16%, transparent)" radius={999} isAnimationActive={false} />
            <Line {...chartLine("do")} stroke="url(#do-zones)" strokeWidth={2.5} type="monotone" {...motion} />
            {point && <ReferenceLine x={point.key} {...chartFocusLine} />}
            {point && <ReferenceDot x={point.key} y={point.do} {...chartFocusDot} />}
            <ChartLegend content={<ChartLegendContent keys={["anoxic", "low", "target", "high"]} />} />
          </ComposedChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

/* qPCR positive control: accepted range band, dots in or out of range */

const ctConfig = {
  range: { label: "Accepted range", color: "var(--green)", swatch: "band" },
  inRange: { label: "In range", color: "var(--green)" },
  outRange: { label: "Out of range", color: "var(--red)" },
} satisfies ChartConfig

// The positive control's Ct on each day's run against mean ± 2 SD of the last 20 runs. Illustrative.
const ctData = [
  { lo: 23.6, hi: 25.8, ct: 24.4 },
  { lo: 23.6, hi: 25.8, ct: 26.3 },
  { lo: 23.6, hi: 25.8, ct: 25.1 },
  { lo: 23.6, hi: 25.8, ct: 24.8 },
  { lo: 23.6, hi: 25.8, ct: 24.6 },
  { lo: 23.7, hi: 25.8, ct: 24.9 },
  { lo: 23.7, hi: 25.8, ct: 24.7 },
].map((d, i) => {
  const day = dayAt(-6 + i)
  return { ...d, band: [d.lo, d.hi] as [number, number], key: day.toISOString(), tick: fmtNarrow.format(day), label: i === 6 ? "Today" : fmtShort.format(day), inRange: d.ct >= d.lo && d.ct <= d.hi }
})

function CtDot({ cx, cy, payload }: { cx?: number; cy?: number; payload?: (typeof ctData)[number] }) {
  if (cx === undefined || cy === undefined || !payload) return <g />
  return <circle cx={cx} cy={cy} r={5} fill={payload.inRange ? "var(--color-inRange)" : "var(--color-outRange)"} stroke="var(--chart-surface)" strokeWidth={2} />
}

export function ControlCtDemo() {
  const motion = useChartAnimation()
  const focus = useChartFocus({
    count: ctData.length,
    describe: (i) => `${ctData[i].label}: positive control Ct ${ctData[i].ct}, ${ctData[i].inRange ? "in" : "outside"} the accepted range of ${ctData[i].lo} to ${ctData[i].hi}`,
  })
  const point = ctData[Math.max(0, focus.index)]
  return (
    <Card className="[--card:var(--surface-container-low)]">
      <CardContent className="grid gap-6 pt-6">
        <ChartReadout
          value={point.ct.toFixed(1)}
          unit="Ct"
          label={`${point.label}, positive control`}
          detail={point.inRange ? undefined : `Late, above the accepted ${point.lo}–${point.hi}: the run was repeated`}
          onClear={focus.isDefault ? undefined : focus.reset}
        />
        <ChartContainer config={ctConfig} focus={focus} aria-label="qPCR positive control Ct this week against its accepted range" className="aspect-auto h-64">
          <ComposedChart data={ctData} margin={{ top: 8, right: 0, left: 0, bottom: 0 }} barCategoryGap={0} {...focus.chartProps}>
            <XAxis dataKey="key" tickLine={false} axisLine={false} tickMargin={10} tickFormatter={(_, i) => ctData[i]?.tick ?? ""} />
            <YAxis orientation="right" tickLine={false} axisLine={false} width={40} domain={[22.5, 27]} ticks={[23.6, 24.7, 25.8, 27]} tick={chartTicks()} />
            <ChartTooltip cursor={false} content={() => null} />
            <Bar dataKey="band" fill="color-mix(in oklab, var(--color-range) 26%, var(--chart-surface))" stroke="color-mix(in oklab, var(--color-range) 26%, var(--chart-surface))" strokeWidth={1} isAnimationActive={false} />
            <Line dataKey="ct" type="linear" stroke="var(--color-inRange)" strokeWidth={3} strokeLinecap="round" dot={<CtDot />} activeDot={false} {...motion} />
            <ReferenceLine x={point.key} {...chartFocusLine} />
            <ReferenceDot x={point.key} y={point.ct} {...chartFocusDot} />
            <ChartLegend content={<ChartLegendContent keys={["range", "inRange", "outRange"]} />} />
          </ComposedChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

/* Cell cycle: one cell's phases in a time-lapse, as stage lanes ----- */

const cycleConfig = {
  g1: { label: "G1", color: "var(--red)" },
  s: { label: "S", color: "var(--amber)" },
  g2: { label: "G2", color: "var(--green)" },
  m: { label: "Mitosis", color: "var(--purple)" },
} satisfies ChartConfig

// A HeLa cell with a FUCCI reporter, tracked for 34 hours through two divisions. Illustrative.
const cycleData: ChartStage[] = (() => {
  const t0 = new Date(2026, 10, 14, 18, 0).getTime()
  const M = 60000
  const plan: [string, number][] = [
    ["s", 180], ["g2", 210], ["m", 55], ["g1", 640], ["s", 470], ["g2", 230], ["m", 60], ["g1", 195],
  ]
  let t = t0
  const out: ChartStage[] = []
  for (const [stage, mins] of plan) {
    out.push({ stage, start: t, end: t + mins * M })
    t += mins * M
  }
  return out
})()

export function CellCycleDemo() {
  return (
    <Card className="[--card:var(--surface-container-low)]">
      <CardContent className="grid gap-6 pt-6">
        <ChartReadout value="23h 35m" unit="cycle" detail="From one division to the next, for cell 14 of a FUCCI HeLa time-lapse." />
        <ChartStages config={cycleConfig} data={cycleData} levels={["m", "g2", "s", "g1"]} startCaption="Imaging starts" endCaption="Imaging ends" locale="en-GB" />
      </CardContent>
    </Card>
  )
}

/* Rings: daily goals ----------------------------------------------- */

const rings = [
  { key: "plates", label: "Plates imaged", value: 42, max: 40, color: "var(--cyan)" },
  { key: "libraries", label: "Libraries through QC", value: 18, max: 24, color: "var(--amber)" },
  { key: "bases", label: "Sequenced", value: 312, max: 300, unit: "Gb", color: "var(--pink)" },
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
