"use client"

import * as React from "react"
import { SHAPE_NAMES, Shape, type ShapeName } from "@/registry/nelumbo/ui/shape"
import { LoadingIndicator } from "@/registry/nelumbo/ui/loading-indicator"
import { Button } from "@/registry/nelumbo/ui/button"
import { Icon, type IconName } from "@/registry/nelumbo/ui/icon"
import { Code, PageHeader, Preview, PropsTable, Section } from "@/components/docs/primitives"

const label = (n: string) => n.replace(/-/g, " ").replace(/^./, (c) => c.toUpperCase())

function Library() {
  const [current, setCurrent] = React.useState<ShapeName>("cookie-9")
  const [playing, setPlaying] = React.useState(false)
  const step = React.useCallback(
    (d: number) => setCurrent((c) => SHAPE_NAMES[(SHAPE_NAMES.indexOf(c) + d + SHAPE_NAMES.length) % SHAPE_NAMES.length]),
    []
  )
  React.useEffect(() => {
    if (!playing) return
    const t = setInterval(() => step(1), 1100)
    return () => clearInterval(t)
  }, [playing, step])

  return (
    <div className="grid min-w-0 gap-4 lg:grid-cols-[18rem_minmax(0,1fr)]">
      <div className="flex flex-col items-center justify-center gap-5 rounded-3xl bg-surface-container-low p-6 lg:sticky lg:top-6 lg:self-start dark:bg-surface-container-lowest">
        <Shape name={current} className="size-44 bg-brand-container" aria-hidden />
        <div className="flex flex-col items-center gap-0.5">
          <span className="type-title-md">{label(current)}</span>
          <code className="font-mono type-body-sm text-muted-foreground">name=&quot;{current}&quot;</code>
        </div>
        <div className="flex items-center gap-2">
          <Button size="icon-sm" variant="ghost" aria-label="Previous shape" onClick={() => step(-1)}>
            <Icon name="chevron_left" />
          </Button>
          <Button size="sm" variant="secondary" onClick={() => setPlaying((p) => !p)} aria-pressed={playing}>
            <Icon name={playing ? "pause" : "play_arrow"} />
            {playing ? "Pause" : "Play"}
          </Button>
          <Button size="icon-sm" variant="ghost" aria-label="Next shape" onClick={() => step(1)}>
            <Icon name="chevron_right" />
          </Button>
        </div>
      </div>
      <ul
        aria-label="Shapes"
        className="grid min-w-0 grid-cols-[repeat(auto-fill,minmax(6.5rem,1fr))] gap-1 rounded-3xl bg-surface-container-low p-3 dark:bg-surface-container-lowest"
      >
        {SHAPE_NAMES.map((n) => (
          <li key={n}>
            <button
              type="button"
              aria-pressed={n === current}
              onClick={() => {
                setPlaying(false)
                setCurrent(n)
              }}
              className="group flex w-full flex-col items-center gap-2 rounded-2xl px-2 pt-4 pb-3 outline-none transition-colors hover:bg-surface-container focus-visible:outline-2 focus-visible:outline-ring aria-pressed:bg-surface-container-highest"
            >
              <Shape name={n} morph={false} className="size-14 bg-primary" />
              <span className="type-label-sm text-muted-foreground group-aria-pressed:text-foreground">{label(n)}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

const PEOPLE: { name: string; initials: string; shape: ShapeName; tone: string }[] = [
  { name: "Maya Lin", initials: "ML", shape: "cookie-9", tone: "bg-brand-container text-brand-container-foreground" },
  { name: "Tomás Ortega", initials: "TO", shape: "clover-4", tone: "bg-success-container text-success-container-foreground" },
  { name: "Aiko Sato", initials: "AS", shape: "arch", tone: "bg-warning-container text-warning-container-foreground" },
  { name: "Priya Nair", initials: "PN", shape: "pentagon", tone: "bg-surface-container-highest text-foreground" },
  { name: "Jonas Berg", initials: "JB", shape: "flower", tone: "bg-inverse-surface text-inverse-foreground" },
]

const STEPS: { title: string; icon: IconName; shape: ShapeName }[] = [
  { title: "Extract RNA", icon: "science", shape: "cookie-9" },
  { title: "Build libraries", icon: "genetics", shape: "soft-burst" },
  { title: "Sequence", icon: "biotech", shape: "clover-4" },
  { title: "Analyse", icon: "monitoring", shape: "puffy" },
]

export default function ShapePage() {
  const [hover, setHover] = React.useState<number | null>(null)
  return (
    <>
      <PageHeader eyebrow="Component 85" title="Shape">
        Thirty-four soft shapes, from circles and pills to cookies, clovers, bursts and pixel shapes. Use them
        for avatars, image crops, icon containers and small moments of expression. Every shape morphs into every other.
      </PageHeader>

      <Section title="Install">
        <Code>{`npx shadcn@latest add @nelumbo/shape`}</Code>
      </Section>

      <Section title="Usage">
        <Code>{`import { Shape } from "@/components/ui/shape"

<Shape name="cookie-9" className="size-24 bg-brand-container" />
<Shape name="arch" className="size-40">
  <img src="/samples/organoid.jpg" alt="Liver organoid, day 14" />
</Shape>`}</Code>
      </Section>

      <Section
        title="Library"
        description="Pick a shape to morph the preview into it, or press Play to run through them all. Every shape has the same number of points, starting at 12 o'clock, so any shape morphs into any other."
      >
        <Library />
      </Section>

      <Section
        title="Avatars"
        description="A shape gives each person a recognizable mark. Keep one shape per person, so the shape itself helps people find someone in a long list."
      >
        <Preview className="gap-6">
          {PEOPLE.map((p) => (
            <div key={p.name} className="flex flex-col items-center gap-2">
              <Shape name={p.shape} className={`grid size-16 place-items-center ${p.tone}`} role="img" aria-label={p.name}>
                <span aria-hidden className="type-title-md">
                  {p.initials}
                </span>
              </Shape>
              <span className="type-label-md">{p.name}</span>
            </div>
          ))}
        </Preview>
      </Section>

      <Section
        title="Icon containers and morphing on hover"
        description="Change the name on hover or selection and the shape morphs with the standard easing, without a bounce. With reduced motion it switches at once."
      >
        <Preview className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {STEPS.map((s, i) => (
            <div
              key={s.title}
              onPointerEnter={() => setHover(i)}
              onPointerLeave={() => setHover(null)}
              className="flex flex-col items-center gap-3 rounded-2xl bg-card p-5 text-center shadow-e1"
            >
              <Shape name={hover === i ? "circle" : s.shape} className="grid size-16 place-items-center bg-brand-container text-brand-container-foreground">
                <span className="grid place-items-center">
                  <Icon name={s.icon} size={28} />
                </span>
              </Shape>
              <span className="type-label-lg">
                {i + 1}. {s.title}
              </span>
            </div>
          ))}
        </Preview>
      </Section>

      <Section
        title="Loading indicator"
        description="LoadingIndicator morphs through seven shapes from this library: soft burst, cookie 9, pentagon, pill, sunny, clover 4 and oval."
      >
        <Preview className="gap-10">
          <LoadingIndicator size={56} />
          <LoadingIndicator size={56} color="brand" contained />
        </Preview>
      </Section>

      <Section
        title="In your own CSS"
        description="shapePath returns the polygon() for any element, and SHAPE_NAMES lists every name."
      >
        <Code>{`import { shapePath, SHAPE_NAMES } from "@/components/ui/shape"

<figure style={{ clipPath: shapePath("clover-8") }}>…</figure>

// the loading indicator fits shapes in a circle so they can turn
shapePath("sunny", { fit: "circle" })`}</Code>
      </Section>

      <Section title="Props">
        <PropsTable
          rows={[
            ["name", "ShapeName", "—", `One of ${SHAPE_NAMES.length} shapes, e.g. "cookie-9", "arch", "pixel-circle".`],
            ["morph", "boolean", "true", "Morph when name changes."],
            ["children", "ReactNode", "—", "Clipped to the shape; an img or video fills it. The clip also cuts shadows and focus rings, so put those on a wrapper."],
            ["shapePath(name, options)", "string", "—", 'options.fit "box" (default) or "circle"; options.points (144).'],
          ]}
        />
      </Section>
    </>
  )
}
