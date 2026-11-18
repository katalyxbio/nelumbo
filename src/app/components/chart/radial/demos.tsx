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

const cardCls = "[--card:var(--surface-container-low)]"

/* Simple: run QC for one library, in percent ------------------------ */

// Quality metrics for one exome library on a short-read run, in percent: bases at
// Q30 or better, reads aligned, reads on target, target covered 20x or deeper, and
// clusters passing filter (PF). Illustrative values.
const qc = [
  { key: "q30", label: "Q30", value: 92, fill: "var(--color-q30)" },
  { key: "aligned", label: "Aligned", value: 88, fill: "var(--color-aligned)" },
  { key: "target", label: "On target", value: 74, fill: "var(--color-target)" },
  { key: "cov", label: "20x", value: 96, fill: "var(--color-cov)" },
  { key: "pf", label: "PF", value: 81, fill: "var(--color-pf)" },
]

const qcConfig = {
  value: { label: "Percent" },
  q30: { label: "Q30", color: "var(--blue)" },
  aligned: { label: "Aligned", color: "var(--orange)" },
  target: { label: "On target", color: "var(--green)" },
  cov: { label: "20x", color: "var(--purple)" },
  pf: { label: "PF", color: "var(--pink)" },
} satisfies ChartConfig

const QC_KEYS = ["q30", "aligned", "target", "cov", "pf"]
const qcSummary = qc.map((d) => `${qcConfig[d.key as keyof typeof qcConfig].label} ${d.value}%`).join(", ")

function CardTop({ title, description }: { title: string; description: string }) {
  return (
    <CardHeader>
      <CardTitle className="type-title-lg">{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
  )
}

function QcPass() {
  return (
    <div className="flex items-center gap-2">
      <Badge variant="success" icon="check">
        Pass
      </Badge>
      <span className="type-body-md text-muted-foreground">all five above the lab&apos;s thresholds</span>
    </div>
  )
}

export function RadialSimpleDemo() {
  const motion = useChartAnimation()
  return (
    <Card className={cardCls}>
      <CardTop title="Radial Chart" description="Run QC for one exome library, in percent" />
      <CardContent>
        <ChartContainer config={qcConfig} aria-label={`Run QC for one library: ${qcSummary}`} className="mx-auto aspect-square max-h-[320px]">
          <RadialBarChart data={qc} cy="42%" innerRadius="22%" outerRadius="84%" barSize={18} startAngle={90} endAngle={-270}>
            <PolarAngleAxis type="number" domain={[0, 100]} tick={false} axisLine={false} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel nameKey="key" />} />
            <RadialBar dataKey="value" shape={chartRadialShape({ trackAmount: 14 })} {...motion} />
            <ChartLegend verticalAlign="bottom" content={<ChartLegendContent keys={QC_KEYS} />} />
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
      <CardContent>
        <QcPass />
      </CardContent>
    </Card>
  )
}

/* Label ---------------------------------------------------------------- */

export function RadialLabelDemo() {
  const motion = useChartAnimation()
  return (
    <Card className={cardCls}>
      <CardTop title="Radial Chart - Label" description="The name sits in a chip at the start of each bar" />
      <CardContent>
        <ChartContainer config={qcConfig} aria-label={`Run QC with labels: ${qcSummary}`} className="mx-auto aspect-square max-h-[320px]">
          <RadialBarChart data={qc} innerRadius="16%" outerRadius="100%" barSize={20} startAngle={90} endAngle={-270}>
            <PolarAngleAxis type="number" domain={[0, 100]} tick={false} axisLine={false} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel nameKey="key" />} />
            <RadialBar dataKey="value" shape={chartRadialShape({ trackAmount: 14 })} {...motion}>
              <LabelList dataKey="label" content={chartRadialLabel({ height: 18 })} />
            </RadialBar>
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
      <CardContent>
        <QcPass />
      </CardContent>
    </Card>
  )
}

/* Grid ----------------------------------------------------------------- */

export function RadialGridDemo() {
  const motion = useChartAnimation()
  return (
    <Card className={cardCls}>
      <CardTop title="Radial Chart - Grid" description="Dotted round-dot circles guide each bar" />
      <CardContent>
        <ChartContainer config={qcConfig} aria-label={`Run QC on a dotted grid: ${qcSummary}`} className="mx-auto aspect-square max-h-[320px]">
          <RadialBarChart data={qc} cy="42%" innerRadius="22%" outerRadius="84%" barSize={16} startAngle={90} endAngle={-270}>
            <PolarAngleAxis type="number" domain={[0, 100]} tick={false} axisLine={false} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel nameKey="key" />} />
            <RadialBar dataKey="value" shape={chartRadialShape({ track: "dots" })} {...motion} />
            <ChartLegend verticalAlign="bottom" content={<ChartLegendContent keys={QC_KEYS} />} />
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
      <CardContent>
        <QcPass />
      </CardContent>
    </Card>
  )
}

/* Text: one bar, a big number ------------------------------------------ */

const readsConfig = { reads: { label: "Reads", color: "var(--cyan)" } } satisfies ChartConfig

export function RadialTextDemo() {
  const motion = useChartAnimation()
  const data = [{ key: "reads", reads: 312, fill: "var(--color-reads)" }]
  return (
    <Card className={cardCls}>
      <CardTop title="Radial Chart - Text" description="Reads so far against a 400 million target" />
      <CardContent>
        <div className="relative mx-auto aspect-square max-h-[320px]">
          <ChartContainer config={readsConfig} aria-label="Radial chart: 312 of 400 million reads sequenced" className="aspect-square h-full">
            <RadialBarChart data={data} innerRadius="70%" outerRadius="100%" barSize={30} startAngle={90} endAngle={-270}>
              <PolarAngleAxis type="number" domain={[0, 400]} tick={false} axisLine={false} />
              <RadialBar dataKey="reads" shape={chartRadialShape({ trackAmount: 18 })} {...motion} />
            </RadialBarChart>
          </ChartContainer>
          <ChartRadialReadout value="312" unit="M" label="Reads so far" />
        </div>
      </CardContent>
      <CardContent className="flex items-center gap-2">
        <Icon name="schedule" className="size-5 text-muted-foreground" />
        <span className="type-body-md text-muted-foreground">78% of target, about 6 h left in the run</span>
      </CardContent>
    </Card>
  )
}

/* Shape: a progress ring ----------------------------------------------- */

const wellsConfig = { wells: { label: "Wells imaged", color: "var(--purple)" } } satisfies ChartConfig

export function RadialShapeDemo() {
  const motion = useChartAnimation()
  const data = [{ key: "wells", wells: 84, fill: "var(--color-wells)" }]
  return (
    <Card className={cardCls}>
      <CardTop title="Radial Chart - Shape" description="A thick tonal track with round caps: a 96-well plate being imaged" />
      <CardContent>
        <div className="relative mx-auto aspect-square max-h-[320px]">
          <ChartContainer config={wellsConfig} aria-label="Progress ring: 84 of 96 wells imaged" className="aspect-square h-full">
            <RadialBarChart data={data} innerRadius="74%" outerRadius="100%" barSize={34} startAngle={90} endAngle={-270}>
              <PolarAngleAxis type="number" domain={[0, 96]} tick={false} axisLine={false} />
              <RadialBar dataKey="wells" shape={chartRadialShape({ trackAmount: 22 })} {...motion} />
            </RadialBarChart>
          </ChartContainer>
          <ChartRadialReadout value="84" unit="/ 96" label="Wells imaged" />
        </div>
      </CardContent>
      <CardContent className="flex items-center gap-2">
        <Icon name="grid_view" className="size-5 text-muted-foreground" />
        <span className="type-body-md text-muted-foreground">Row H next, 4 fields per well in 3 channels</span>
      </CardContent>
    </Card>
  )
}

/* Stacked: a half ring ------------------------------------------------- */

// Two parts of one quantity, so two tones of one color; the chips name them.
const readsByKind = {
  unique: { label: "Unique", color: "var(--blue)" },
  duplicate: { label: "Duplicate", color: "color-mix(in oklab, var(--blue) 55%, var(--card))" },
} satisfies ChartConfig

export function RadialStackedDemo() {
  const motion = useChartAnimation()
  const data = [{ run: "Run 2611", unique: 268, duplicate: 44 }]
  const total = data[0].unique + data[0].duplicate
  const angles = { startAngle: 180, endAngle: 0 }
  return (
    <Card className={cardCls}>
      <CardTop title="Radial Chart - Stacked" description="Reads so far, unique and duplicate, against a 400 million target" />
      <CardContent>
        <div className="relative mx-auto aspect-[2/1.15] w-full max-w-[380px]">
          <ChartContainer config={readsByKind} aria-label={`Half ring of reads: ${data[0].unique} million unique and ${data[0].duplicate} million duplicate, ${total} million of a 400 million target`} className="aspect-auto h-full">
            <RadialBarChart data={data} cy="88%" innerRadius="140%" outerRadius="205%" barSize={34} {...angles}>
              <PolarAngleAxis type="number" domain={[0, 400]} tick={false} axisLine={false} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
              <RadialBar dataKey="unique" stackId="a" fill="var(--color-unique)" shape={chartRadialShape({ ...angles, gap: true, cornerRadius: 12 })} {...motion} />
              <RadialBar dataKey="duplicate" stackId="a" fill="var(--color-duplicate)" shape={chartRadialShape({ ...angles, track: false, gap: true, cornerRadius: 12 })} {...motion} />
            </RadialBarChart>
          </ChartContainer>
          <ChartRadialReadout half value={total} unit="M" label="Reads" />
        </div>
        <ul className="mt-4 flex flex-wrap justify-center gap-2">
          {(["unique", "duplicate"] as const).map((k) => (
            <li key={k} className="inline-flex h-7 items-center gap-1.5 rounded-full bg-secondary px-2.5 type-label-md text-secondary-foreground">
              <span aria-hidden className="size-2.5 rounded-full" style={{ background: readsByKind[k].color }} />
              {readsByKind[k].label}
              <span className="tabular-nums text-muted-foreground">{data[0][k]}M</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

/* Gauge: incubator CO2 on its bands ----------------------------------- */

// The reading fills the bands up to it; past it each band stays tonal. Green is
// the setpoint band, amber and red are outside it.
const gaugeConfig = {
  low: { label: "Low", color: "var(--amber)" },
  ok: { label: "In range", color: "var(--green)" },
  high: { label: "High", color: "var(--red)" },
} satisfies ChartConfig

const BANDS = [
  { key: "low", from: 3, to: 4.5 },
  { key: "ok", from: 4.5, to: 5.5 },
  { key: "high", from: 5.5, to: 7 },
] as const

export function RadialGaugeDemo() {
  const motion = useChartAnimation()
  const co2 = 5.1
  const angles = { startAngle: 180, endAngle: 0 }
  const [min, max] = [BANDS[0].from, BANDS[BANDS.length - 1].to]
  // each band is a filled part up to the reading and a tonal rest, so the reading shows in its band's color
  const row: Record<string, number> = {}
  const series: { id: string; color: string; on: boolean }[] = []
  for (const z of BANDS) {
    const on = Math.max(0, Math.min(co2, z.to) - z.from)
    const off = z.to - z.from - on
    row[`${z.key}On`] = on
    row[`${z.key}Off`] = off
    series.push({ id: `${z.key}On`, color: `var(--color-${z.key})`, on: true }, { id: `${z.key}Off`, color: `var(--color-${z.key})`, on: false })
  }
  const band = BANDS.find((z) => co2 >= z.from && co2 < z.to) ?? BANDS[0]
  return (
    <Card className={cardCls}>
      <CardTop title="Gauge" description="Incubator CO2 now, against its setpoint band" />
      <CardContent>
        <div className="relative mx-auto aspect-[2/1.15] w-full max-w-[380px]">
          <ChartContainer config={gaugeConfig} aria-label={`Gauge: incubator CO2 at ${co2}%, ${gaugeConfig[band.key].label.toLowerCase()} (4.5 to 5.5%)`} className="aspect-auto h-full">
            <RadialBarChart data={[row]} cy="88%" innerRadius="140%" outerRadius="205%" barSize={30} {...angles}>
              <PolarAngleAxis type="number" domain={[0, max - min]} tick={false} axisLine={false} />
              {series.map((s) => (
                <RadialBar
                  key={s.id}
                  dataKey={s.id}
                  stackId="co2"
                  fill={s.on ? s.color : chartTrackColor(s.color, 30)}
                  shape={chartRadialShape({ ...angles, track: false, gap: true, cornerRadius: 10 })}
                  {...motion}
                />
              ))}
            </RadialBarChart>
          </ChartContainer>
          <ChartRadialReadout half value={co2.toFixed(1)} unit="% CO2" label={gaugeConfig[band.key].label} />
          <span aria-hidden className="absolute bottom-0 left-[4%] type-label-md text-muted-foreground tabular-nums">{min}%</span>
          <span aria-hidden className="absolute right-[4%] bottom-0 type-label-md text-muted-foreground tabular-nums">{max}%</span>
        </div>
        <ul className="mt-4 flex flex-wrap justify-center gap-2">
          {BANDS.map((z) => (
            <li key={z.key} className="inline-flex h-7 items-center gap-1.5 rounded-full bg-secondary px-2.5 type-label-md text-secondary-foreground">
              <span aria-hidden className="size-2.5 rounded-full" style={{ background: gaugeConfig[z.key].color }} />
              {gaugeConfig[z.key].label}
              <span className="tabular-nums text-muted-foreground">
                {z.from} to {z.to}%
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
