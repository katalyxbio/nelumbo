"use client"

import * as React from "react"
import { LabelList, PolarAngleAxis, RadialBar, RadialBarChart } from "recharts"

import { Badge } from "@/registry/nelumbo/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/registry/nelumbo/ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartRadialReadout,
  ChartTooltip,
  ChartTooltipContent,
  chartRadialLabel,
  chartRadialShape,
  chartTrackColor,
  useChartAnimation,
  type ChartConfig,
} from "@/registry/nelumbo/ui/chart"
import { Icon } from "@/registry/nelumbo/ui/icon"

const fmt = (n: number) => n.toLocaleString("en-US")
const cardCls = "[--card:var(--surface-container-low)]"

/* Simple: minutes by activity ------------------------------------------ */

const activity = [
  { key: "walk", label: "Walk", minutes: 275, fill: "var(--color-walk)" },
  { key: "run", label: "Run", minutes: 200, fill: "var(--color-run)" },
  { key: "cycle", label: "Cycle", minutes: 187, fill: "var(--color-cycle)" },
  { key: "swim", label: "Swim", minutes: 173, fill: "var(--color-swim)" },
  { key: "yoga", label: "Yoga", minutes: 90, fill: "var(--color-yoga)" },
]

const activityConfig = {
  minutes: { label: "Minutes" },
  walk: { label: "Walk", color: "var(--blue)" },
  run: { label: "Run", color: "var(--orange)" },
  cycle: { label: "Cycle", color: "var(--green)" },
  swim: { label: "Swim", color: "var(--purple)" },
  yoga: { label: "Yoga", color: "var(--pink)" },
} satisfies ChartConfig

const ACTIVITY_KEYS = ["walk", "run", "cycle", "swim", "yoga"]

function CardTop({ title, description }: { title: string; description: string }) {
  return (
    <CardHeader>
      <CardTitle className="type-title-lg">{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
  )
}

function ActivityTrend() {
  return (
    <div className="flex items-center gap-2">
      <Badge variant="success" icon="trending_up">
        5.2%
      </Badge>
      <span className="type-body-md text-muted-foreground">more active minutes than last week</span>
    </div>
  )
}

export function RadialSimpleDemo() {
  const motion = useChartAnimation()
  return (
    <Card className={cardCls}>
      <CardTop title="Radial chart" description="Active minutes by activity, Nov 9 to 15" />
      <CardContent>
        <ChartContainer config={activityConfig} aria-label="Radial chart of active minutes this week: walk 275, run 200, cycle 187, swim 173, yoga 90" className="mx-auto aspect-square max-h-[320px]">
          <RadialBarChart data={activity} innerRadius="26%" outerRadius="100%" barSize={20} startAngle={90} endAngle={-270}>
            <PolarAngleAxis type="number" domain={[0, 300]} tick={false} axisLine={false} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel nameKey="key" />} />
            <RadialBar dataKey="minutes" shape={chartRadialShape({ trackAmount: 14 })} {...motion} />
            <ChartLegend verticalAlign="bottom" content={<ChartLegendContent keys={ACTIVITY_KEYS} />} />
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
      <CardContent>
        <ActivityTrend />
      </CardContent>
    </Card>
  )
}

/* Label ---------------------------------------------------------------- */

export function RadialLabelDemo() {
  const motion = useChartAnimation()
  return (
    <Card className={cardCls}>
      <CardTop title="Radial chart: label" description="The name sits in a chip at the start of each bar" />
      <CardContent>
        <ChartContainer config={activityConfig} aria-label="Radial chart with labels: walk 275, run 200, cycle 187, swim 173, yoga 90 active minutes" className="mx-auto aspect-square max-h-[320px]">
          <RadialBarChart data={activity} innerRadius="16%" outerRadius="100%" barSize={20} startAngle={90} endAngle={-270}>
            <PolarAngleAxis type="number" domain={[0, 300]} tick={false} axisLine={false} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel nameKey="key" />} />
            <RadialBar dataKey="minutes" shape={chartRadialShape({ trackAmount: 14 })} {...motion}>
              <LabelList dataKey="label" content={chartRadialLabel({ height: 18 })} />
            </RadialBar>
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
      <CardContent>
        <ActivityTrend />
      </CardContent>
    </Card>
  )
}

/* Grid ----------------------------------------------------------------- */

export function RadialGridDemo() {
  const motion = useChartAnimation()
  return (
    <Card className={cardCls}>
      <CardTop title="Radial chart: grid" description="Dotted round-dot circles guide each bar" />
      <CardContent>
        <ChartContainer config={activityConfig} aria-label="Radial chart with a dotted grid: walk 275, run 200, cycle 187, swim 173, yoga 90 active minutes" className="mx-auto aspect-square max-h-[320px]">
          <RadialBarChart data={activity} innerRadius="26%" outerRadius="100%" barSize={18} startAngle={90} endAngle={-270}>
            <PolarAngleAxis type="number" domain={[0, 300]} tick={false} axisLine={false} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel nameKey="key" />} />
            <RadialBar dataKey="minutes" shape={chartRadialShape({ track: "dots" })} {...motion} />
            <ChartLegend verticalAlign="bottom" content={<ChartLegendContent keys={ACTIVITY_KEYS} />} />
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
      <CardContent>
        <ActivityTrend />
      </CardContent>
    </Card>
  )
}

/* Text: one bar, a big number ------------------------------------------ */

const stepsConfig = { steps: { label: "Steps", color: "var(--cyan)" } } satisfies ChartConfig

export function RadialTextDemo() {
  const motion = useChartAnimation()
  const data = [{ key: "steps", steps: 8240, fill: "var(--color-steps)" }]
  return (
    <Card className={cardCls}>
      <CardTop title="Radial chart: text" description="Today's steps against a 10,000 goal" />
      <CardContent>
        <div className="relative mx-auto aspect-square max-h-[320px]">
          <ChartContainer config={stepsConfig} aria-label="Radial chart: 8,240 of 10,000 steps today" className="aspect-square h-full">
            <RadialBarChart data={data} innerRadius="70%" outerRadius="100%" barSize={30} startAngle={90} endAngle={-270}>
              <PolarAngleAxis type="number" domain={[0, 10000]} tick={false} axisLine={false} />
              <RadialBar dataKey="steps" shape={chartRadialShape({ trackAmount: 18 })} {...motion} />
            </RadialBarChart>
          </ChartContainer>
          <ChartRadialReadout value={fmt(8240)} label="Steps today" />
        </div>
      </CardContent>
      <CardContent className="flex items-center gap-2">
        <Badge variant="success" icon="trending_up">
          12%
        </Badge>
        <span className="type-body-md text-muted-foreground">above your weekday average</span>
      </CardContent>
    </Card>
  )
}

/* Shape: a progress ring ----------------------------------------------- */

const sleepConfig = { score: { label: "Sleep score", color: "var(--purple)" } } satisfies ChartConfig

export function RadialShapeDemo() {
  const motion = useChartAnimation()
  const data = [{ key: "score", score: 84, fill: "var(--color-score)" }]
  return (
    <Card className={cardCls}>
      <CardTop title="Radial chart: shape" description="A thick tonal track with round caps, like a circular progress" />
      <CardContent>
        <div className="relative mx-auto aspect-square max-h-[320px]">
          <ChartContainer config={sleepConfig} aria-label="Progress ring: sleep score 84 out of 100" className="aspect-square h-full">
            <RadialBarChart data={data} innerRadius="74%" outerRadius="100%" barSize={34} startAngle={90} endAngle={-270}>
              <PolarAngleAxis type="number" domain={[0, 100]} tick={false} axisLine={false} />
              <RadialBar dataKey="score" shape={chartRadialShape({ trackAmount: 22 })} {...motion} />
            </RadialBarChart>
          </ChartContainer>
          <ChartRadialReadout value="84" unit="/ 100" label="Sleep score" />
        </div>
      </CardContent>
      <CardContent className="flex items-center gap-2">
        <Icon name="bedtime" className="size-5 text-muted-foreground" />
        <span className="type-body-md text-muted-foreground">7 h 42 min asleep, 4 min to fall asleep</span>
      </CardContent>
    </Card>
  )
}

/* Stacked: a half ring ------------------------------------------------- */

const zonesConfig = {
  moderate: { label: "Moderate", color: "var(--amber)" },
  vigorous: { label: "Vigorous", color: "var(--red)" },
} satisfies ChartConfig

export function RadialStackedDemo() {
  const motion = useChartAnimation()
  const data = [{ week: "Nov 9 to 15", moderate: 1260, vigorous: 570 }]
  const total = data[0].moderate + data[0].vigorous
  const angles = { startAngle: 180, endAngle: 0 }
  return (
    <Card className={cardCls}>
      <CardTop title="Radial chart: stacked" description="Active zone minutes this week, two series in a half ring" />
      <CardContent>
        <div className="relative mx-auto aspect-[2/1.15] w-full max-w-[380px]">
          <ChartContainer config={zonesConfig} aria-label={`Half ring of active zone minutes: ${fmt(data[0].moderate)} moderate and ${fmt(data[0].vigorous)} vigorous, ${fmt(total)} in total`} className="aspect-auto h-full">
            <RadialBarChart data={data} cy="88%" innerRadius="140%" outerRadius="205%" barSize={34} {...angles}>
              <PolarAngleAxis type="number" domain={[0, 2400]} tick={false} axisLine={false} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
              <RadialBar dataKey="moderate" stackId="a" fill="var(--color-moderate)" shape={chartRadialShape({ ...angles, gap: true, cornerRadius: 12 })} {...motion} />
              <RadialBar dataKey="vigorous" stackId="a" fill="var(--color-vigorous)" shape={chartRadialShape({ ...angles, track: false, gap: true, cornerRadius: 12 })} {...motion} />
            </RadialBarChart>
          </ChartContainer>
          <ChartRadialReadout half value={fmt(total)} unit="min" label="Zone minutes" />
        </div>
        <ul className="mt-4 flex flex-wrap justify-center gap-2">
          {(["moderate", "vigorous"] as const).map((k) => (
            <li key={k} className="inline-flex h-7 items-center gap-1.5 rounded-full bg-secondary px-2.5 type-label-md text-secondary-foreground">
              <span aria-hidden className="size-2.5 rounded-full" style={{ background: `var(--${k === "moderate" ? "amber" : "red"})` }} />
              {zonesConfig[k].label}
              <span className="tabular-nums text-muted-foreground">{fmt(data[0][k])}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

/* Gauge: heart rate zones ---------------------------------------------- */

const gaugeConfig = {
  light: { label: "Light", color: "var(--cyan)", swatch: 1 },
  moderate: { label: "Moderate", color: "var(--amber)", swatch: 2 },
  vigorous: { label: "Vigorous", color: "var(--orange)", swatch: 3 },
  peak: { label: "Peak", color: "var(--red)", swatch: 4 },
} satisfies ChartConfig

const ZONES = [
  { key: "light", from: 40, to: 113 },
  { key: "moderate", from: 113, to: 142 },
  { key: "vigorous", from: 142, to: 170 },
  { key: "peak", from: 170, to: 200 },
] as const

export function RadialGaugeDemo() {
  const motion = useChartAnimation()
  const bpm = 128
  const angles = { startAngle: 180, endAngle: 0 }
  const [min, max] = [ZONES[0].from, ZONES[ZONES.length - 1].to]
  // each zone is a filled part up to the reading and a tonal rest, so the reading shows in its zone's color
  const row: Record<string, number> = {}
  const series: { id: string; color: string; on: boolean }[] = []
  for (const z of ZONES) {
    const on = Math.max(0, Math.min(bpm, z.to) - z.from)
    const off = z.to - z.from - on
    row[`${z.key}On`] = on
    row[`${z.key}Off`] = off
    series.push({ id: `${z.key}On`, color: `var(--color-${z.key})`, on: true }, { id: `${z.key}Off`, color: `var(--color-${z.key})`, on: false })
  }
  const zone = ZONES.find((z) => bpm >= z.from && bpm < z.to) ?? ZONES[0]
  return (
    <Card className={cardCls}>
      <CardTop title="Gauge" description="Heart rate now, drawn on its zones" />
      <CardContent>
        <div className="relative mx-auto aspect-[2/1.15] w-full max-w-[380px]">
          <ChartContainer config={gaugeConfig} aria-label={`Gauge: heart rate ${bpm} beats per minute, in the ${gaugeConfig[zone.key].label.toLowerCase()} zone`} className="aspect-auto h-full">
            <RadialBarChart data={[row]} cy="88%" innerRadius="140%" outerRadius="205%" barSize={30} {...angles}>
              <PolarAngleAxis type="number" domain={[0, max - min]} tick={false} axisLine={false} />
              {series.map((s) => (
                <RadialBar
                  key={s.id}
                  dataKey={s.id}
                  stackId="hr"
                  fill={s.on ? s.color : chartTrackColor(s.color, 30)}
                  shape={chartRadialShape({ ...angles, track: false, gap: true, cornerRadius: 10 })}
                  {...motion}
                />
              ))}
            </RadialBarChart>
          </ChartContainer>
          <ChartRadialReadout half value={bpm} unit="bpm" label={`${gaugeConfig[zone.key].label} zone`} />
          <span aria-hidden className="absolute bottom-0 left-[4%] type-label-md text-muted-foreground tabular-nums">{min}</span>
          <span aria-hidden className="absolute right-[4%] bottom-0 type-label-md text-muted-foreground tabular-nums">{max}</span>
        </div>
        <ul className="mt-4 flex flex-wrap justify-center gap-2">
          {ZONES.map((z) => (
            <li key={z.key} className="inline-flex h-7 items-center gap-1.5 rounded-full bg-secondary px-2.5 type-label-md text-secondary-foreground">
              <svg aria-hidden width={(1 + ZONES.indexOf(z)) * 6} height={10} className="shrink-0">
                {Array.from({ length: 1 + ZONES.indexOf(z) }, (_, i) => (
                  <circle key={i} cx={3 + i * 6} cy={5} r={1.75} fill={gaugeConfig[z.key].color} />
                ))}
              </svg>
              {gaugeConfig[z.key].label}
              <span className="tabular-nums text-muted-foreground">{z.from} to {z.to}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
