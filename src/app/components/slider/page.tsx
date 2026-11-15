"use client"

import * as React from "react"
import { Slider } from "@/registry/velvet/ui/slider"
import { Icon } from "@/registry/velvet/ui/icon"
import { Code, PageHeader, Preview, PropsTable, Section } from "@/components/docs/primitives"

const price = (v: number) => `$${v}`

function Row({ title, value, children }: { title: string; value: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline justify-between">
        <span className="type-title-sm">{title}</span>
        <span className="type-label-lg text-muted-foreground tabular-nums">{value}</span>
      </div>
      {children}
    </div>
  )
}

export default function SliderPage() {
  const [range, setRange] = React.useState([120, 480])
  const [radius, setRadius] = React.useState([12])
  const [quality, setQuality] = React.useState([80])

  return (
    <>
      <PageHeader eyebrow="Component 12" title="Slider">
        Picks a value from a range. A thick rounded track and a slim handle with breathing room on both sides; press
        it and the handle thins, drag it and a bubble shows the value.
      </PageHeader>

      <Section title="Install">
        <Code>{`npx shadcn@latest add @velvet/slider`}</Code>
      </Section>

      <Section title="Basic" description="The dot at the end of the track marks where it stops. Tab to the handle and use the arrow keys; Page Up and Down move in bigger steps.">
        <Preview className="flex-col items-stretch gap-8 px-8 pt-14">
          <Slider aria-label="Volume" defaultValue={[40]} valueLabel />
          <Slider aria-label="Volume, disabled" defaultValue={[60]} disabled />
        </Preview>
      </Section>

      <Section title="Range" description="Pass two values for a range. Each handle is announced as the minimum or the maximum.">
        <Preview className="flex-col items-stretch gap-3 px-8 pt-14">
          <Slider aria-label="Price" min={0} max={600} step={10} value={range} onValueChange={setRange} valueLabel formatValue={price} minStepsBetweenThumbs={1} />
          <div className="flex justify-between type-label-lg tabular-nums text-muted-foreground">
            <span>{price(range[0])}</span>
            <span>{price(range[1])}</span>
          </div>
        </Preview>
      </Section>

      <Section title="Steps" description="With marks, a dot shows every step. Use it for a handful of choices, not for fine steps.">
        <Preview className="flex-col items-stretch gap-8 px-8 pt-14">
          <Slider aria-label="Rating" min={1} max={5} step={1} defaultValue={[4]} marks valueLabel formatValue={(v) => `${v} ★`} />
          <Slider aria-label="Spacing" min={0} max={40} step={4} defaultValue={[12, 28]} marks valueLabel />
        </Preview>
      </Section>

      <Section title="Large, with an icon" description="The lg size is made for media and device controls. The icon sits inside the filled part, and moves past the handle when there is no room.">
        <Preview className="flex-col items-stretch gap-6 px-8">
          <Slider size="lg" icon="volume_up" aria-label="Media volume" defaultValue={[64]} />
          <Slider size="lg" icon="light_mode" aria-label="Brightness" defaultValue={[6]} color="brand" />
        </Preview>
      </Section>

      <Section title="Brand color" description="For a slider that should carry the accent.">
        <Preview className="flex-col items-stretch gap-8 px-8 pt-14">
          <Slider color="brand" aria-label="Warmth" defaultValue={[70]} valueLabel formatValue={(v) => `${v}%`} />
        </Preview>
      </Section>

      <Section title="In a form" description="Show the value next to the title so it reads at a glance, and pass formatValue so screen readers hear the same text.">
        <div className="flex flex-col gap-6 rounded-3xl bg-card p-6 shadow-e1">
          <div className="flex items-center gap-3">
            <Icon name="tune" className="text-muted-foreground" />
            <span className="type-title-md">Export settings</span>
          </div>
          <Row title="Corner radius" value={`${radius[0]} px`}>
            <Slider aria-label="Corner radius" max={32} value={radius} onValueChange={setRadius} formatValue={(v) => `${v} px`} />
          </Row>
          <Row title="Quality" value={`${quality[0]}%`}>
            <Slider aria-label="Quality" min={10} max={100} step={10} marks value={quality} onValueChange={setQuality} formatValue={(v) => `${v}%`} />
          </Row>
        </div>
      </Section>

      <Section title="Usage">
        <Code>{`import { Slider } from "@/components/ui/slider"

<Slider aria-label="Volume" defaultValue={[40]} valueLabel />

<Slider
  aria-label="Price"
  max={600}
  step={10}
  value={range}
  onValueChange={setRange}
  formatValue={(v) => \`$\${v}\`}
/>

<Slider size="lg" icon="volume_up" aria-label="Media volume" />`}</Code>
      </Section>

      <Section title="Props" description="Other props go to Radix Slider (value, defaultValue, onValueChange, onValueCommit, min, max, step, minStepsBetweenThumbs, name…).">
        <PropsTable
          rows={[
            ["size", '"default" | "lg"', '"default"', "16px or 40px track"],
            ["color", '"default" | "brand"', '"default"', ""],
            ["marks", "boolean", "false", "A dot for every step"],
            ["valueLabel", "boolean", "false", "Bubble with the value while dragging or focused"],
            ["formatValue", "(value: number) => string", "String", "Used by the bubble and as aria-valuetext"],
            ["icon", "IconName", "", "lg only, single value"],
          ]}
        />
      </Section>
    </>
  )
}
