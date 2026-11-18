"use client"

import * as React from "react"
import {
  Gel,
  DEFAULT_GEL,
  ENZYMES,
  LADDERS,
  autoGel,
  digest,
  gelField,
  resolves,
  type GelBuffer,
  type GelMode,
  type GelStain,
  type GelFocus,
  type GelLane,
  type GelSettings,
  type LadderId,
} from "@/registry/nelumbo/ui/gel"
import { parseGenBank } from "@/registry/nelumbo/ui/plasmid-map"
import { ChartReadout } from "@/registry/nelumbo/ui/chart"
import { Button } from "@/registry/nelumbo/ui/button"
import { Icon } from "@/registry/nelumbo/ui/icon"
import { Slider } from "@/registry/nelumbo/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/registry/nelumbo/ui/select"
import { SegmentedButton, SegmentedButtonItem } from "@/registry/nelumbo/ui/segmented-button"
import { ChipGroup, FilterChip } from "@/registry/nelumbo/ui/chip"
import { Code, PageHeader, Preview, PropsTable, Section } from "@/components/docs/primitives"
import { PGL3_GENBANK } from "../construct-map/data"

const PGL3 = parseGenBank(PGL3_GENBANK)
const cut = (...names: string[]) => digest(PGL3.sequence, Object.fromEntries(names.map((n) => [n, ENZYMES[n]])), { circular: true })

const DIGESTS: GelLane[] = [
  { label: "Ladder", ladder: "neb-1kb" },
  { label: "HindIII", bands: cut("HindIII") },
  { label: "HindIII + XbaI", bands: cut("HindIII", "XbaI") },
  { label: "NcoI + BamHI", bands: cut("NcoI", "BamHI") },
  { label: "XbaI + NotI", bands: cut("XbaI", "NotI") },
  { label: "DraI", bands: cut("DraI") },
  { label: "Uncut", bands: cut() },
]

const PICKABLE = ["HindIII", "XbaI", "BamHI", "NcoI", "NotI", "SalI", "KpnI", "ScaI", "SspI", "DraI"]
const fmtBp = (n: number) => (n >= 1000 ? `${(n / 1000).toLocaleString("en-US", { maximumFractionDigits: 1 })} kb` : `${n} bp`)

export default function GelPage() {
  return (
    <>
      <PageHeader eyebrow="Component 80" title="Gel">
        An agarose gel, simulated. Each band sits where a model of how DNA runs puts it for the gel&apos;s agarose,
        buffer, voltage and time, spreads as it would, and glows as bright as the DNA in it, drawn as a stain shows it.
        Lanes can come straight from a restriction digest of a sequence.
      </PageHeader>

      <Section title="Install">
        <Code>{`npx shadcn@latest add @nelumbo/gel`}</Code>
      </Section>

      <Section
        title="A digest"
        description="pGL3-Basic (4,818 bp) cut with single and double digests, the fragments computed from its sequence by digest. One cut linearizes it; two give two bands that add up to the whole; DraI's 19 bp piece runs off the end. Uncut, it runs as plasmid does: a supercoiled band ahead of its size and a fainter nicked one behind. Each lane holds 250 ng, shared by length, so shorter fragments are fainter. Hover a band for where it came from."
      >
        <Preview className="block">
          <Gel lanes={DIGESTS} />
        </Preview>
      </Section>

      <Section
        title="Run it"
        description="Agarose, buffer, voltage and time move every band as they would on the bench: more agarose pulls small fragments apart and crowds large ones near the wells; a higher field squeezes long fragments together. The loading dyes' fronts sit along the right. Fit picks the agarose, voltage, time and ladder that best separate the fragments."
      >
        <Preview className="block">
          <RunDemo />
        </Preview>
      </Section>

      <Section
        title="Stains and ideal bands"
        description='Ethidium bromide under UV (the default) and SYBR Safe under blue light in the colors a camera sees them, or printed dark on light as a gel doc prints it. mode="overlay" draws the ideal bands, each a line where its size runs, over the stained gel; mode="ideal" draws them alone, on a plain slab that follows the theme.'
      >
        <Preview className="grid gap-8 sm:grid-cols-2">
          {(
            [
              ["Ethidium bromide", { stain: "ethidium" }],
              ["SYBR Safe", { stain: "sybr" }],
              ["Print, ideal bands over it", { stain: "print", mode: "overlay" }],
              ["Ideal", { mode: "ideal" }],
            ] as const
          ).map(([name, look]) => (
            <div key={name} className="grid gap-2">
              <span className="type-label-lg text-muted-foreground">{name}</span>
              <Gel lanes={DIGESTS.slice(0, 4)} {...look} dyes={false} height={360} aria-label={`Gel, ${name}`} />
            </div>
          ))}
        </Preview>
      </Section>

      <Section
        title="Ladders"
        description="NEB's and GeneRuler's, each band at the mass its maker lists, so the landmark bands stand out as on a real gel. Each suits a gel: the 1 kb ladders spread out on a loose one, the 50 and 100 bp ones on a tight one, where the long ladders crowd at the wells."
      >
        <Preview className="block">
          <LadderDemo />
        </Preview>
      </Section>

      <Section title="Props">
        <PropsTable
          rows={[
            ["lanes", "GelLane[]", "", "label, and bands (size, mass, apparent, smear, description), or a ladder; ng loaded, shared by mass."],
            ["agarose / buffer", 'number, "tae" | "tbe"', '1, "tae"', "Agarose % w/v, 0.5 to 4; the running buffer."],
            ["volts / electrodes", "number, number", "100, 12", "Volts across electrodes this many cm apart: the field."],
            ["minutes / length", "number, number", "40, 8", "How long it runs; the gel's length from the wells, cm."],
            ["height", "number", "440", "The slab's height in px."],
            ["stain", '"ethidium" | "sybr" | "print"', '"ethidium"', "How it's imaged: under UV, under blue light, or printed dark on light."],
            ["mode", '"real" | "overlay" | "ideal"', '"real"', "As the stain shows it; the ideal bands drawn over it; or the ideal bands alone."],
            ["sizes / dyes", "boolean, boolean", "true, true", "The ladder's sizes on the left; the loading dyes' fronts on the right."],
            ["run / onRunProgress", "number, (minutes) => void", "", "Change run to play the gel from the wells; each frame's minutes."],
            ["selectable / onActiveChange", "boolean, (focus | null) => void", "false", "A keyboard stop: up and down a lane, left and right across lanes."],
            ["Model", "mobility, gelDistance, migration, spread, dyeFronts, resolves, autoGel", "", "Where a size runs and how wide; the dyes; the range a gel separates; the best gel and ladder for some sizes."],
            ["Helpers", "digest, ENZYMES, LADDERS, DEFAULT_GEL", "", "Fragments of a digest, linear or circular; common enzymes; NEB and GeneRuler ladders."],
          ]}
        />
      </Section>
    </>
  )
}

function Setting({ label, value, children }: { label: string; value?: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2">
      <div className="flex items-baseline justify-between gap-2">
        <span className="type-label-lg">{label}</span>
        {value && <span className="type-label-md text-muted-foreground tabular-nums">{value}</span>}
      </div>
      {children}
    </div>
  )
}

function RunDemo() {
  const [picked, setPicked] = React.useState<string[]>(["HindIII", "XbaI", "NcoI"])
  const [g, setG] = React.useState<GelSettings>(DEFAULT_GEL)
  const [ladder, setLadder] = React.useState<LadderId>("neb-1kb")
  const [run, setRun] = React.useState(0)
  const [stain, setStain] = React.useState<GelStain>("ethidium")
  const [mode, setMode] = React.useState<GelMode>("real")
  const [clock, setClock] = React.useState(DEFAULT_GEL.minutes)
  const [fitted, setFitted] = React.useState(false)
  const [focus, setFocus] = React.useState<GelFocus>(null)
  const set = <K extends keyof GelSettings>(k: K, v: GelSettings[K]) => {
    setFitted(false)
    if (k === "minutes") setClock(v as number)
    setG((s) => ({ ...s, [k]: v }))
  }
  const bands = picked.length ? cut(...picked) : cut()
  const label = picked.join(" + ") || "Uncut"
  const lanes: GelLane[] = [{ label: "Ladder", ladder }, { label: "Digest", bands }]
  const range = React.useMemo(() => resolves(g), [g])
  const fit = () => {
    const auto = autoGel(
      bands.map((b) => b.apparent ?? b.size),
      g
    )
    setG(auto.gel)
    setLadder(auto.ladder)
    setFitted(true)
    setRun((r) => r + 1)
  }
  return (
    <div className="grid gap-6">
      <ChipGroup aria-label="Enzymes">
        {PICKABLE.map((e) => (
          <FilterChip key={e} selected={picked.includes(e)} onSelectedChange={(on) => setPicked(on ? [...picked, e] : picked.filter((p) => p !== e))}>
            {e}
          </FilterChip>
        ))}
      </ChipGroup>
      <div className="grid items-start gap-6 md:grid-cols-[minmax(0,17rem)_minmax(0,1fr)]">
        <div className="grid gap-5 rounded-2xl bg-surface-container p-5">
          <Setting label="Agarose" value={`${g.agarose.toFixed(g.agarose < 1 ? 2 : 1)}%`}>
            <Slider aria-label="Agarose" min={0.5} max={4} step={0.05} value={[g.agarose]} onValueChange={([v]) => set("agarose", Math.round(v * 20) / 20)} />
          </Setting>
          <Setting label="Buffer">
            <SegmentedButton type="single" size="sm" value={g.buffer} onValueChange={(v) => v && set("buffer", v as GelBuffer)} aria-label="Buffer">
              <SegmentedButtonItem value="tae">TAE</SegmentedButtonItem>
              <SegmentedButtonItem value="tbe">TBE</SegmentedButtonItem>
            </SegmentedButton>
          </Setting>
          <Setting label="Voltage" value={`${g.volts} V, ${gelField(g).toFixed(1)} V/cm`}>
            <Slider aria-label="Voltage" min={20} max={200} step={5} value={[g.volts]} onValueChange={([v]) => set("volts", v)} />
          </Setting>
          <Setting label="Time" value={`${g.minutes} min`}>
            <Slider aria-label="Time" min={5} max={180} step={5} value={[g.minutes]} onValueChange={([v]) => set("minutes", v)} />
          </Setting>
          <Select value={ladder} onValueChange={(v) => setLadder(v as LadderId)}>
            <SelectTrigger label="Ladder" size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(LADDERS) as LadderId[]).map((id) => {
                const b = LADDERS[id].bands
                return (
                  <SelectItem key={id} value={id} description={`${fmtBp(b[b.length - 1][0])} to ${fmtBp(b[0][0])}`}>
                    {LADDERS[id].name}
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
          <Setting label="Imaged">
            <SegmentedButton type="single" size="sm" value={stain} onValueChange={(v) => v && setStain(v as GelStain)} aria-label="Stain">
              <SegmentedButtonItem value="ethidium">EtBr</SegmentedButtonItem>
              <SegmentedButtonItem value="sybr">SYBR</SegmentedButtonItem>
              <SegmentedButtonItem value="print">Print</SegmentedButtonItem>
            </SegmentedButton>
          </Setting>
          <Setting label="Bands">
            <SegmentedButton type="single" size="sm" value={mode} onValueChange={(v) => v && setMode(v as GelMode)} aria-label="Bands">
              <SegmentedButtonItem value="real">Real</SegmentedButtonItem>
              <SegmentedButtonItem value="overlay">Overlay</SegmentedButtonItem>
              <SegmentedButtonItem value="ideal">Ideal</SegmentedButtonItem>
            </SegmentedButton>
          </Setting>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={() => setRun((r) => r + 1)}>
              <Icon name="play_arrow" />
              Run
            </Button>
            <Button variant="secondary" size="sm" onClick={fit}>
              <Icon name="fit_screen" />
              Fit
            </Button>
          </div>
          <p className="type-body-sm text-muted-foreground">
            {fitted ? "Fitted to the fragments. " : ""}This gel separates about {fmtBp(range[0])} to {fmtBp(range[1])} well. Positions are modeled: expect them within 5–10% of a real gel.
          </p>
        </div>
        <div className="grid min-w-0 gap-4">
          <div className="min-h-[4.5rem]">
            {focus ? (
              <ChartReadout
                value={focus.data.size.toLocaleString("en-US")}
                unit="bp"
                label={lanes[focus.lane].label}
                detail={focus.data.description && <span className="type-body-sm text-muted-foreground">{focus.data.description}</span>}
              />
            ) : (
              <ChartReadout
                value={Math.round(clock)}
                unit={`of ${g.minutes} min`}
                label={`${g.agarose}% ${g.buffer.toUpperCase()}, ${g.volts} V`}
                detail={<span className="type-body-sm text-muted-foreground tabular-nums">{`${label}: ${bands.map((b) => b.size.toLocaleString("en-US")).join(", ")} bp`}</span>}
              />
            )}
          </div>
          <Gel lanes={lanes} {...g} stain={stain} mode={mode} run={run} onRunProgress={setClock} selectable onActiveChange={setFocus} height={480} aria-label="Digest run with these settings" />
        </div>
      </div>
    </div>
  )
}

function LadderDemo() {
  const [agarose, setAgarose] = React.useState("1")
  return (
    <div className="grid gap-6">
      <SegmentedButton type="single" size="sm" value={agarose} onValueChange={(v) => v && setAgarose(v)} aria-label="Agarose">
        {["0.8", "1", "1.5", "2.5"].map((p) => (
          <SegmentedButtonItem key={p} value={p}>
            {`${p}%`}
          </SegmentedButtonItem>
        ))}
      </SegmentedButton>
      <Gel
        lanes={(Object.keys(LADDERS) as LadderId[]).map((id) => ({ label: LADDERS[id].name.replace("GeneRuler ", "GR ").replace(" bp", "").replace(" Plus", "+"), ladder: id }))}
        agarose={Number(agarose)}
        minutes={45}
        sizes={false}
        height={460}
        aria-label={`Seven ladders on a ${agarose}% gel`}
      />
    </div>
  )
}
