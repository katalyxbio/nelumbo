"use client"

import * as React from "react"
import { CircularProgress, Progress } from "@/registry/nelumbo/ui/progress"
import { Slider } from "@/registry/nelumbo/ui/slider"
import { Button } from "@/registry/nelumbo/ui/button"
import { Card } from "@/registry/nelumbo/ui/card"
import { Icon, type IconName } from "@/registry/nelumbo/ui/icon"
import { Code, PageHeader, Preview, PropsTable, Section } from "@/components/docs/primitives"

function Labelled({ children, text, className }: { children: React.ReactNode; text: string; className?: string }) {
  return (
    <div className={className ?? "flex flex-col items-center gap-3"}>
      {children}
      <span className="type-label-sm text-muted-foreground">{text}</span>
    </div>
  )
}

const FILES: { name: string; icon: IconName; size: string; speed: number }[] = [
  { name: "Brand guidelines.pdf", icon: "picture_as_pdf", size: "8.4 MB", speed: 9 },
  { name: "Launch film.mp4", icon: "movie", size: "212 MB", speed: 3 },
  { name: "Photos, spring.zip", icon: "folder_zip", size: "64 MB", speed: 5 },
]

function Uploads() {
  const [values, setValues] = React.useState<number[]>(() => FILES.map(() => 0))
  const [running, setRunning] = React.useState(false)
  React.useEffect(() => {
    if (!running) return
    const id = setInterval(() => {
      setValues((v) => {
        const next = v.map((x, i) => Math.min(100, x + FILES[i].speed * (0.6 + Math.random() * 0.8)))
        if (next.every((x) => x >= 100)) setRunning(false)
        return next
      })
    }, 300)
    return () => clearInterval(id)
  }, [running])
  const start = () => {
    setValues(FILES.map(() => 0))
    setRunning(true)
  }
  return (
    <Card variant="outlined" className="w-full max-w-md gap-0 p-2">
      <div className="flex items-center justify-between gap-3 px-3 pt-2 pb-3">
        <p className="type-title-sm">Uploads</p>
        <Button size="sm" variant="secondary" onClick={start} disabled={running}>
          <Icon name="upload" />
          {running ? "Uploading…" : values.some((x) => x > 0) ? "Upload again" : "Start upload"}
        </Button>
      </div>
      {FILES.map((f, i) => {
        const v = Math.round(values[i])
        const done = v >= 100
        return (
          <div key={f.name} className="flex items-center gap-3 rounded-xl px-3 py-3">
            <Icon name={done ? "check_circle" : f.icon} fill={done} className={done ? "text-success" : "text-muted-foreground"} />
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <div className="flex items-baseline justify-between gap-3">
                <span id={`up-${i}`} className="type-body-md truncate">{f.name}</span>
                <span className="type-label-sm shrink-0 text-muted-foreground tabular-nums">{done ? f.size : `${v}%`}</span>
              </div>
              <Progress value={v} aria-labelledby={`up-${i}`} />
            </div>
          </div>
        )
      })}
    </Card>
  )
}

export default function ProgressPage() {
  const [value, setValue] = React.useState(64)

  return (
    <>
      <PageHeader eyebrow="Component 26" title="Progress">
        Shows how far along a task is, or that it&apos;s under way when you can&apos;t tell. Bars for files, steps and
        pages; circles for compact spots. A small gap and a stop dot mark what&apos;s left, so it reads without color.
      </PageHeader>

      <Section title="Install">
        <Code>{`npx shadcn@latest add @nelumbo/progress`}</Code>
      </Section>

      <Section
        title="Linear"
        description="Pass value for determinate progress. Leave it out when you can't measure the wait: two bars sweep across the track instead. Drag the slider to see the indicator, the gap and the track move together."
      >
        <Preview className="flex-col items-stretch gap-8">
          <Slider value={[value]} onValueChange={([v]) => setValue(v)} aria-label="Progress value" valueLabel formatValue={(v) => `${v}%`} className="max-w-sm" />
          <div className="grid gap-8 md:grid-cols-2">
            <Labelled text="determinate" className="flex flex-col gap-3">
              <Progress value={value} aria-label="Example, determinate" />
            </Labelled>
            <Labelled text="indeterminate" className="flex flex-col gap-3">
              <Progress aria-label="Example, indeterminate" />
            </Labelled>
            <Labelled text='size="thick"' className="flex flex-col gap-3">
              <Progress size="thick" value={value} aria-label="Example, thick" />
            </Labelled>
            <Labelled text='color="brand"' className="flex flex-col gap-3">
              <Progress color="brand" value={value} aria-label="Example, brand" />
            </Labelled>
          </div>
        </Preview>
      </Section>

      <Section
        title="Wavy"
        description='shape="wavy" turns the indicator into a travelling wave: livelier, for longer waits and moments you want to feel alive, like a sync or an install. The track stays flat.'
      >
        <Preview className="grid gap-8 md:grid-cols-2">
          <Labelled text="determinate" className="flex flex-col gap-3">
            <Progress shape="wavy" value={value} aria-label="Wavy, determinate" />
          </Labelled>
          <Labelled text="indeterminate" className="flex flex-col gap-3">
            <Progress shape="wavy" aria-label="Wavy, indeterminate" />
          </Labelled>
          <Labelled text='size="thick"' className="flex flex-col gap-3">
            <Progress shape="wavy" size="thick" value={value} aria-label="Wavy, thick" />
          </Labelled>
          <Labelled text='color="brand"' className="flex flex-col gap-3">
            <Progress shape="wavy" color="brand" value={value} aria-label="Wavy, brand" />
          </Labelled>
        </Preview>
      </Section>

      <Section
        title="Circular"
        description="The same, as a ring. Set size and thickness in px; put a value or an icon inside as children."
      >
        <Preview className="items-end gap-10">
          <Labelled text="determinate">
            <CircularProgress value={value} aria-label="Circular, determinate" />
          </Labelled>
          <Labelled text="indeterminate">
            <CircularProgress aria-label="Circular, indeterminate" />
          </Labelled>
          <Labelled text="wavy">
            <CircularProgress shape="wavy" value={value} aria-label="Circular wavy, determinate" />
          </Labelled>
          <Labelled text="wavy, indeterminate">
            <CircularProgress shape="wavy" aria-label="Circular wavy, indeterminate" />
          </Labelled>
          <Labelled text="brand, 24px">
            <CircularProgress color="brand" size={24} thickness={3} value={value} aria-label="Circular, small" />
          </Labelled>
          <Labelled text="with a label">
            <CircularProgress size={72} thickness={6} value={value} aria-label="Storage used">
              <span className="type-label-lg tabular-nums">{value}%</span>
            </CircularProgress>
          </Labelled>
        </Preview>
      </Section>

      <Section title="In context" description="Each bar is named by its file with aria-labelledby, so a screen reader hears “Launch film.mp4, 40%”.">
        <Preview className="justify-center">
          <Uploads />
        </Preview>
      </Section>

      <Section title="Usage">
        <Code>{`import { CircularProgress, Progress } from "@/components/ui/progress"

<Progress value={40} aria-label="Uploading" />
<Progress aria-label="Loading" />                      // indeterminate
<Progress shape="wavy" size="thick" value={60} aria-label="Installing" />

<CircularProgress value={72} size={72} thickness={6} aria-label="Storage used">
  <span>72%</span>
</CircularProgress>`}</Code>
      </Section>

      <Section title="Props">
        <PropsTable
          rows={[
            ["value", "number | null", "", "Leave out or pass null for indeterminate"],
            ["max", "number", "100", ""],
            ["shape", '"flat" | "wavy"', '"flat"', "Wavy: a travelling wave on the indicator"],
            ["color", '"auto" | "neutral" | "brand"', '"auto"', "Black (white in dark mode), or the accent"],
            ["Progress size", '"default" | "thick"', '"default"', "4px or 8px"],
            ["CircularProgress size", "number", "40", "Diameter in px"],
            ["CircularProgress thickness", "number", "4", "Stroke width in px"],
            ["getValueLabel", "(value, max) => string", "", "What screen readers hear; defaults to a percentage"],
          ]}
          note="Name every indicator with aria-label or aria-labelledby."
        />
      </Section>
    </>
  )
}
