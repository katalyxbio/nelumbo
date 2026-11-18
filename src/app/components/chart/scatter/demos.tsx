"use client"

import * as React from "react"
import { Area, CartesianGrid, ComposedChart, Customized, Line, ReferenceDot, ReferenceLine, Scatter, ScatterChart, XAxis, YAxis, ZAxis } from "recharts"

import { Card, CardContent } from "@/registry/nelumbo/ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartPointLabels,
  ChartReadout,
  ChartTooltip,
  chartFocusDot,
  chartLinearFit,
  chartPoint,
  chartTicks,
  chartTintColor,
  useChartAnimation,
  useChartFocus,
  useSeriesVisibility,
  type ChartConfig,
} from "@/registry/nelumbo/ui/chart"

/* shared ------------------------------------------------------------- */

const cardClass = "[--card:var(--surface-container-low)]"

function Heading({ title, description }: { title: string; description: string }) {
  return (
    <div className="grid gap-1">
      <h3 className="type-title-lg">{title}</h3>
      <p className="type-body-md text-muted-foreground">{description}</p>
    </div>
  )
}

function DemoCard({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <Card className={cardClass}>
      <CardContent className="grid gap-5 pt-6">
        <Heading title={title} description={description} />
        {children}
      </CardContent>
    </Card>
  )
}

/** A seeded generator, so the illustrative data is the same on every render. */
function rng(seed: number) {
  let a = seed >>> 0
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  const normal = () => Math.sqrt(-2 * Math.log(1 - next())) * Math.cos(2 * Math.PI * next())
  return { next, normal }
}

const grid = <CartesianGrid vertical={false} strokeDasharray="1 5" strokeLinecap="round" className="stroke-outline-variant" />
const fmt = (v: number, d = 0) => v.toLocaleString("en-US", { maximumFractionDigits: d, minimumFractionDigits: d })
const sci = (v: number) => {
  if (v === 0) return "0"
  const e = Math.floor(Math.log10(v))
  return e >= -2 && e < 4 ? fmt(v, v < 1 ? 2 : 0) : `${(v / 10 ** e).toFixed(1)}e${e}`
}
/** 0.1, 1, 10, 100, 1k, 10k, 1M: powers of ten, short. */
const pow10 = (v: number) => {
  const e = Math.round(Math.log10(v))
  if (e < 0) return `0.${"0".repeat(-e - 1)}1`
  if (e < 3) return String(10 ** e)
  return e < 6 ? `${10 ** (e - 3)}k` : e < 9 ? `${10 ** (e - 6)}M` : `${10 ** (e - 9)}G`
}

/** The inverse tooltip, for points: a heading and rows of name and value. */
function PointTip({ title, rows }: { title: string; rows: [string, string][] }) {
  return (
    <div className="grid min-w-36 gap-1 rounded-xl bg-inverse-surface px-3 py-2 text-inverse-foreground shadow-e2">
      <span className="type-label-lg font-semibold">{title}</span>
      {rows.map(([k, v]) => (
        <span key={k} className="flex justify-between gap-4 type-label-md">
          <span className="opacity-80">{k}</span>
          <span className="tabular-nums">{v}</span>
        </span>
      ))}
    </div>
  )
}

/* Log axes: mRNA and protein copies per cell -------------------------- */

type Gene = { gene: string; mrna: number; protein: number }

const COPIES: Gene[] = (() => {
  const r = rng(7)
  return Array.from({ length: 140 }, (_, i) => {
    const m = 1.1 + 0.62 * r.normal()
    const p = 3.4 + 0.92 * m + 0.42 * r.normal()
    return { gene: `Gene ${i + 1}`, mrna: Math.max(0.2, 10 ** m), protein: 10 ** p }
  }).sort((a, b) => a.mrna - b.mrna)
})()
const logR = (() => {
  const xs = COPIES.map((d) => Math.log10(d.mrna))
  const ys = COPIES.map((d) => Math.log10(d.protein))
  const fit = chartLinearFit(xs.map((x, i) => ({ x, y: ys[i] })))
  return Math.sqrt(fit.r2)
})()

const copiesConfig = { genes: { label: "Genes", color: "var(--blue)" } } satisfies ChartConfig

export function ScatterLogDemo() {
  const motion = useChartAnimation()
  const focus = useChartFocus({
    count: COPIES.length,
    defaultIndex: -1,
    describe: (i) => (i < 0 ? `${COPIES.length} genes, Pearson r ${logR.toFixed(2)} on log scales` : `${COPIES[i].gene}: ${sci(COPIES[i].mrna)} mRNA, ${sci(COPIES[i].protein)} protein copies per cell`),
  })
  const d = focus.index >= 0 ? COPIES[focus.index] : null
  return (
    <DemoCard title="Scatter Chart - Log axes" description="mRNA and protein copies per cell for 140 genes, both on log scales. Illustrative, after the shape of genome-wide measurements in mouse fibroblasts.">
      {d ? (
        <ChartReadout value={sci(d.protein)} unit="proteins" label={d.gene} detail={<span className="type-body-sm text-muted-foreground">{sci(d.mrna)} mRNA copies per cell</span>} onClear={focus.reset} />
      ) : (
        <ChartReadout value={logR.toFixed(2)} unit="Pearson r" label="mRNA against protein" detail={<span className="type-body-sm text-muted-foreground">Point at a gene, or tab here and use the arrow keys</span>} />
      )}
      <ChartContainer config={copiesConfig} focus={focus} aria-label={`mRNA against protein copies per cell, ${COPIES.length} genes on log scales, Pearson r ${logR.toFixed(2)}`} className="aspect-auto h-72">
        <ScatterChart margin={{ top: 12, right: 8, left: 16, bottom: 8 }}>
          {grid}
          <XAxis type="number" dataKey="mrna" scale="log" domain={[0.1, 1000]} ticks={[0.1, 1, 10, 100, 1000]} tickFormatter={pow10} tickLine={false} axisLine={false} tickMargin={10} allowDataOverflow />
          <YAxis type="number" dataKey="protein" scale="log" domain={[100, 1e8]} ticks={[100, 1e4, 1e6, 1e8]} tickFormatter={pow10} orientation="right" tickLine={false} axisLine={false} width={44} tick={chartTicks({ format: pow10 })} allowDataOverflow />
          <Scatter
            data={COPIES}
            shape={chartPoint("genes", { r: 4, opacity: 0.85, fill: (_, i) => (focus.index < 0 || i === focus.index ? "var(--color-genes)" : chartTintColor("var(--color-genes)", 45)) })}
            onMouseEnter={(_: unknown, i: number) => focus.preview(i)}
            onMouseLeave={() => focus.preview(null)}
            onClick={(_: unknown, i: number) => focus.select(i)}
            {...motion}
          />
          {d && <ReferenceDot x={d.mrna} y={d.protein} {...chartFocusDot} />}
        </ScatterChart>
      </ChartContainer>
      <div className="flex justify-between type-label-md text-muted-foreground">
        <span>mRNA copies per cell</span>
        <span>Protein copies per cell</span>
      </div>
    </DemoCard>
  )
}

/* Two groups with a legend: cell and nuclear area ---------------------- */

type Cell = { cell: number; nucleus: number }

const lineOf = (seed: number, n: number, cell: [number, number], ratio: number, noise: number): Cell[] => {
  const r = rng(seed)
  return Array.from({ length: n }, () => {
    const c = Math.max(400, cell[0] + cell[1] * r.normal())
    return { cell: Math.round(c), nucleus: Math.round(c * ratio * (1 + noise * r.normal())) }
  })
}
const HELA = lineOf(11, 70, [1500, 380], 0.13, 0.12)
const U2OS = lineOf(23, 70, [2600, 650], 0.1, 0.12)

const cellsConfig = {
  hela: { label: "HeLa", color: "var(--blue)" },
  u2os: { label: "U2OS", color: "var(--orange)" },
} satisfies ChartConfig

export function ScatterGroupsDemo() {
  const motion = useChartAnimation()
  const vis = useSeriesVisibility()
  return (
    <DemoCard title="Scatter Chart - Groups" description="Cell area against nuclear area from imaging, two cell lines (illustrative). Tap a chip to hide a line.">
      <ChartContainer config={cellsConfig} aria-label="Cell area against nuclear area for HeLa and U2OS cells, 70 cells each: U2OS cells are larger with relatively smaller nuclei" className="aspect-auto h-72">
        <ScatterChart margin={{ top: 12, right: 8, left: 16, bottom: 0 }}>
          {grid}
          <XAxis type="number" dataKey="cell" name="Cell area" domain={[0, 5000]} ticks={[0, 1000, 2000, 3000, 4000, 5000]} tickFormatter={(v: number) => fmt(v)} tickLine={false} axisLine={false} tickMargin={10} />
          <YAxis type="number" dataKey="nucleus" name="Nuclear area" domain={[0, 500]} ticks={[0, 100, 200, 300, 400, 500]} orientation="right" tickLine={false} axisLine={false} width={40} tick={chartTicks()} />
          <ChartTooltip
            cursor={false}
            content={({ active, payload }) => {
              const p = payload?.[0]
              if (!active || !p) return null
              const c = p.payload as Cell
              return <PointTip title={cellsConfig[p.name as keyof typeof cellsConfig]?.label ?? "Cell"} rows={[["Cell area", `${fmt(c.cell)} µm²`], ["Nuclear area", `${fmt(c.nucleus)} µm²`], ["Ratio", `${((c.nucleus / c.cell) * 100).toFixed(1)}%`]]} />
            }}
          />
          <Scatter name="hela" data={HELA} shape={chartPoint("hela")} hide={vis.isHidden("hela")} {...motion} />
          <Scatter name="u2os" data={U2OS} shape={chartPoint("u2os")} hide={vis.isHidden("u2os")} {...motion} />
          <ChartLegend content={<ChartLegendContent hiddenKeys={vis.hiddenKeys} onToggle={vis.toggle} />} />
        </ScatterChart>
      </ChartContainer>
      <div className="flex justify-between type-label-md text-muted-foreground">
        <span>Cell area, µm²</span>
        <span>Nuclear area, µm²</span>
      </div>
    </DemoCard>
  )
}

/* A fit with its band: a Bradford standard curve ----------------------- */

const STANDARDS = (() => {
  const r = rng(5)
  return [0, 125, 250, 500, 750, 1000, 1500, 2000].flatMap((ug) => [0, 1, 2].map(() => ({ ug, a595: +(0.03 + 0.00047 * ug + 0.045 * r.normal()).toFixed(3) })))
})()
const FIT = chartLinearFit(STANDARDS.map((d) => ({ x: d.ug, y: d.a595 })))
const UNKNOWNS = [
  { name: "Lysate A", a595: 0.41 },
  { name: "Lysate B", a595: 0.62 },
  { name: "Lysate C", a595: 0.27 },
].map((u) => ({ ...u, ug: (u.a595 - FIT.intercept) / FIT.slope }))
const fitConfig = {
  standards: { label: "Standards", color: "var(--foreground)" },
  fit: { label: "Fit, 95% band", color: "var(--blue)" },
  samples: { label: "Samples", color: "var(--orange)" },
} satisfies ChartConfig

export function ScatterFitDemo() {
  const motion = useChartAnimation()
  const focus = useChartFocus({
    count: UNKNOWNS.length,
    defaultIndex: -1,
    describe: (i) => (i < 0 ? `Standard curve, R squared ${FIT.r2.toFixed(3)}` : `${UNKNOWNS[i].name}: absorbance ${UNKNOWNS[i].a595}, ${fmt(UNKNOWNS[i].ug)} micrograms per millilitre`),
  })
  const u = focus.index >= 0 ? UNKNOWNS[focus.index] : null
  return (
    <DemoCard title="Scatter Chart - Fit" description="A Bradford assay: BSA standards in triplicate, a least-squares line with its 95% confidence band, and three lysates read off the curve (illustrative).">
      {u ? (
        <ChartReadout value={fmt(u.ug)} unit="µg/mL" label={u.name} detail={<span className="type-body-sm text-muted-foreground tabular-nums">A595 {u.a595.toFixed(2)}</span>} onClear={focus.reset} />
      ) : (
        <ChartReadout
          value={FIT.r2.toFixed(3)}
          unit="R²"
          label="Standard curve"
          detail={<span className="type-body-sm text-muted-foreground tabular-nums">{`A595 = ${FIT.slope.toFixed(5)} × µg/mL + ${FIT.intercept.toFixed(3)}`}</span>}
        />
      )}
      <ChartContainer config={fitConfig} focus={focus} aria-label={`Bradford standard curve, R squared ${FIT.r2.toFixed(3)}, with three samples read off it`} className="aspect-auto h-72">
        <ComposedChart data={FIT.rows(0, 2000)} margin={{ top: 12, right: 8, left: 16, bottom: 0 }}>
          {grid}
          <XAxis type="number" dataKey="x" domain={[0, 2000]} ticks={[0, 500, 1000, 1500, 2000]} tickFormatter={(v: number) => fmt(v)} tickLine={false} axisLine={false} tickMargin={10} />
          <YAxis type="number" domain={[0, 1.1]} ticks={[0, 0.25, 0.5, 0.75, 1]} orientation="right" tickLine={false} axisLine={false} width={40} tick={chartTicks({ format: (v) => v.toFixed(2) })} />
          <Area dataKey="band" legendType="none" stroke="none" fill="var(--color-fit)" fillOpacity={0.16} isAnimationActive={false} />
          <Line dataKey="fit" name="fit" stroke="var(--color-fit)" strokeWidth={2.5} dot={false} activeDot={false} strokeLinecap="round" {...motion} />
          <Scatter name="standards" data={STANDARDS.map((d) => ({ x: d.ug, y: d.a595 }))} dataKey="y" shape={chartPoint("standards", { r: 3.5 })} {...motion} />
          {UNKNOWNS.map((s, i) => (
            <ReferenceLine key={s.name} segment={[{ x: 0, y: s.a595 }, { x: s.ug, y: s.a595 }]} stroke="var(--color-samples)" strokeDasharray="1 4" strokeLinecap="round" strokeWidth={1.5} opacity={u && i !== focus.index ? 0.35 : 1} />
          ))}
          <Scatter
            name="samples"
            data={UNKNOWNS.map((s) => ({ x: s.ug, y: s.a595 }))}
            dataKey="y"
            shape={chartPoint("samples", { r: 6, fill: (_, i) => (u && i !== focus.index ? chartTintColor("var(--color-samples)", 45) : "var(--color-samples)") })}
            onMouseEnter={(_: unknown, i: number) => focus.preview(i)}
            onMouseLeave={() => focus.preview(null)}
            onClick={(_: unknown, i: number) => focus.select(i)}
          />
          {u && <ReferenceDot x={u.ug} y={u.a595} {...chartFocusDot} />}
          <ChartLegend content={<ChartLegendContent nameKey="value" />} />
        </ComposedChart>
      </ChartContainer>
      <div className="flex justify-between type-label-md text-muted-foreground">
        <span>BSA, µg/mL</span>
        <span>A595</span>
      </div>
    </DemoCard>
  )
}

/* Bubbles: a gene set enrichment dot plot ------------------------------- */

const TERMS = [
  { term: "Response to hypoxia", fold: 4.6, genes: 38, q: 1e-12 },
  { term: "Glycolysis", fold: 4.1, genes: 24, q: 3e-9 },
  { term: "Angiogenesis", fold: 3.2, genes: 31, q: 2e-7 },
  { term: "HIF-1 signaling", fold: 3.8, genes: 19, q: 8e-7 },
  { term: "Collagen fibril organization", fold: 2.6, genes: 12, q: 4e-4 },
  { term: "Autophagy", fold: 1.9, genes: 27, q: 2e-3 },
  { term: "Cholesterol biosynthesis", fold: 2.2, genes: 9, q: 0.01 },
  { term: "Ribosome biogenesis", fold: 1.4, genes: 22, q: 0.04 },
]
const enrichConfig = { terms: { label: "Gene sets", color: "var(--purple)" } } satisfies ChartConfig
const tone = (q: number) => Math.max(30, Math.min(100, (-Math.log10(q) / 12) * 100))

export function ScatterBubbleDemo() {
  const motion = useChartAnimation()
  const rows = TERMS.map((t) => ({ ...t, nlq: -Math.log10(t.q) }))
  return (
    <DemoCard title="Scatter Chart - Bubble" description="Gene sets enriched among hypoxia-induced genes (illustrative). Dot size is the number of genes; a deeper tone is a smaller q-value.">
      <ChartContainer config={enrichConfig} aria-label={`Gene set enrichment: ${TERMS.map((t) => `${t.term}, ${t.fold} fold, ${t.genes} genes`).join("; ")}`} className="aspect-auto h-80">
        <ScatterChart margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
          <CartesianGrid horizontal={false} strokeDasharray="1 5" strokeLinecap="round" className="stroke-outline-variant" />
          <XAxis type="number" dataKey="fold" domain={[0, 5]} ticks={[0, 1, 2, 3, 4, 5]} tickFormatter={(v: number) => `${v}×`} tickLine={false} axisLine={false} tickMargin={10} />
          <YAxis type="category" dataKey="term" width={150} tickLine={false} axisLine={false} interval={0} tick={{ fontSize: 12 }} />
          <ZAxis type="number" dataKey="genes" range={[80, 900]} />
          <ChartTooltip
            cursor={false}
            content={({ active, payload }) => {
              const p = payload?.[0]?.payload as (typeof rows)[number] | undefined
              if (!active || !p) return null
              return <PointTip title={p.term} rows={[["Enrichment", `${p.fold}×`], ["Genes", String(p.genes)], ["q-value", p.q.toExponential(0)]]} />
            }}
          />
          <Scatter data={rows} shape={chartPoint("terms", { bubble: true, fill: (d) => `color-mix(in oklab, var(--color-terms) ${tone(d.q)}%, var(--chart-surface))` })} {...motion} />
        </ScatterChart>
      </ChartContainer>
      <div className="flex flex-wrap items-center justify-between gap-3 type-label-md text-muted-foreground">
        <span>Fold enrichment</span>
        <span className="flex items-center gap-2">
          q-value
          {[1e-2, 1e-6, 1e-12].map((q) => (
            <span key={q} className="flex items-center gap-1">
              <span aria-hidden className="size-3 rounded-full" style={{ background: `color-mix(in oklab, var(--purple) ${tone(q)}%, var(--surface-container-low))` }} />
              <span className="tabular-nums">{q.toExponential(0)}</span>
            </span>
          ))}
        </span>
      </div>
    </DemoCard>
  )
}

/* A volcano plot ------------------------------------------------------- */

type Hit = { gene: string; lfc: number; nlp: number; padj: number; dir: "up" | "down" | "ns" }

const UP = ["VEGFA", "CA9", "BNIP3", "PDK1", "SLC2A1", "LDHA", "NDRG1", "EGLN3", "ANKRD37", "P4HA1", "ADM", "ENO1", "PGK1", "ALDOA", "KDM3A", "ANGPTL4", "LOX", "ERO1A"]
const DOWN = ["MKI67", "CCNB1", "TOP2A", "CDC20", "E2F1", "MCM2", "PCNA", "AURKA", "BUB1", "CENPF", "HIST1H4C", "TYMS"]

const GENES: Hit[] = (() => {
  const r = rng(42)
  const out: Hit[] = []
  const add = (gene: string, lfc: number, p: number) => {
    const padj = Math.min(1, p * 40)
    const sig = padj < 0.05 && Math.abs(lfc) >= 1
    out.push({ gene, lfc: +lfc.toFixed(2), nlp: -Math.log10(p), padj, dir: sig ? (lfc > 0 ? "up" : "down") : "ns" })
  }
  UP.forEach((g, i) => add(g, 1.3 + 3.2 * r.next() * (1 - i / 30), 10 ** -(4 + 14 * r.next() * (1 - i / 24))))
  DOWN.forEach((g, i) => add(g, -(1.1 + 2.2 * r.next() * (1 - i / 24)), 10 ** -(3.5 + 9 * r.next() * (1 - i / 18))))
  for (let i = 0; i < 640; i++) {
    const lfc = 0.55 * r.normal()
    const p = Math.min(1, r.next() ** (1 + Math.abs(lfc) * 2.2))
    add(`Gene ${i + 1}`, lfc, Math.max(p, 1e-6))
  }
  return out
})()
const SIG = GENES.filter((g) => g.dir !== "ns").sort((a, b) => b.nlp - a.nlp)
const NS = GENES.filter((g) => g.dir === "ns")
const nUp = SIG.filter((g) => g.dir === "up").length
const nDown = SIG.length - nUp
const P_LINE = -Math.log10(0.05 / 40)

const volcanoConfig = {
  up: { label: "Up", color: "var(--red)" },
  down: { label: "Down", color: "var(--blue)" },
  ns: { label: "Not significant", color: "var(--outline)" },
} satisfies ChartConfig

type AxisMap = Record<string, { scale: (v: number) => number }>

export function ScatterVolcanoDemo() {
  const motion = useChartAnimation()
  const focus = useChartFocus({
    count: SIG.length,
    defaultIndex: -1,
    describe: (i) => (i < 0 ? `${nUp} genes up and ${nDown} down of ${GENES.length}` : `${SIG[i].gene}: log2 fold change ${SIG[i].lfc}, adjusted p ${SIG[i].padj.toExponential(1)}`),
  })
  const g = focus.index >= 0 ? SIG[focus.index] : null
  const labelled = g ? [g] : SIG.slice(0, 8)
  return (
    <DemoCard title="Scatter Chart - Volcano" description="Differential expression under hypoxia (illustrative): fold change against significance. Dotted lines mark a twofold change and an adjusted p of 0.05; the strongest hits are named.">
      {g ? (
        <ChartReadout
          value={`${g.lfc > 0 ? "+" : ""}${g.lfc.toFixed(2)}`}
          unit="log₂ fold"
          label={g.gene}
          detail={<span className="type-body-sm text-muted-foreground tabular-nums">{`${(2 ** Math.abs(g.lfc)).toFixed(1)}× ${g.lfc > 0 ? "up" : "down"}, adjusted p ${g.padj.toExponential(1)}`}</span>}
          onClear={focus.reset}
        />
      ) : (
        <ChartReadout value={SIG.length} unit="genes changed" label="Hypoxia against normoxia" detail={<span className="type-body-sm text-muted-foreground">{`${nUp} up, ${nDown} down, of ${GENES.length} measured`}</span>} />
      )}
      <ChartContainer config={volcanoConfig} focus={focus} aria-label={`Volcano plot of ${GENES.length} genes: ${nUp} up and ${nDown} down. Strongest: ${SIG.slice(0, 5).map((s) => s.gene).join(", ")}`} className="aspect-auto h-80">
        <ScatterChart margin={{ top: 28, right: 8, left: 16, bottom: 0 }}>
          {grid}
          <XAxis type="number" dataKey="lfc" domain={[-5, 5]} ticks={[-4, -2, 0, 2, 4]} tickLine={false} axisLine={false} tickMargin={10} />
          <YAxis type="number" dataKey="nlp" domain={[0, 16]} ticks={[0, 4, 8, 12, 16]} orientation="right" tickLine={false} axisLine={false} width={36} tick={chartTicks()} />
          <ReferenceLine x={-1} stroke="var(--outline)" strokeDasharray="1 4" strokeLinecap="round" strokeWidth={1.5} />
          <ReferenceLine x={1} stroke="var(--outline)" strokeDasharray="1 4" strokeLinecap="round" strokeWidth={1.5} />
          <ReferenceLine y={P_LINE} stroke="var(--outline)" strokeDasharray="1 4" strokeLinecap="round" strokeWidth={1.5} />
          <Scatter name="ns" data={NS} shape={chartPoint("ns", { r: 2.5, opacity: 0.5 })} isAnimationActive={false} />
          <Scatter name="down" data={[]} />
          <Scatter
            name="up"
            data={SIG}
            shape={chartPoint("up", { r: 4.5, fill: (d, i) => (g && i !== focus.index ? chartTintColor(`var(--color-${d.dir})`, 40) : `var(--color-${d.dir})`) })}
            onMouseEnter={(_: unknown, i: number) => focus.preview(i)}
            onMouseLeave={() => focus.preview(null)}
            onClick={(_: unknown, i: number) => focus.select(i)}
            {...motion}
          />
          {g && <ReferenceDot x={g.lfc} y={g.nlp} {...chartFocusDot} />}
          <Customized
            component={(props: { xAxisMap?: AxisMap; yAxisMap?: AxisMap; width?: number; height?: number }) => {
              const xs = props.xAxisMap && Object.values(props.xAxisMap)[0]?.scale
              const ys = props.yAxisMap && Object.values(props.yAxisMap)[0]?.scale
              if (!xs || !ys) return null
              return <ChartPointLabels points={labelled.map((h) => ({ x: xs(h.lfc), y: ys(h.nlp), text: h.gene }))} width={props.width} height={props.height} />
            }}
          />
          <ChartLegend content={<ChartLegendContent nameKey="value" />} />
        </ScatterChart>
      </ChartContainer>
      <div className="flex justify-between type-label-md text-muted-foreground">
        <span>log₂ fold change</span>
        <span>−log₁₀ p</span>
      </div>
    </DemoCard>
  )
}
