"use client"

import * as React from "react"
import { Play } from "lucide-react"
import { paletteRamps } from "@/lib/velvet/scheme"
import { Button } from "@/registry/velvet/ui/button"
import { Code, PageHeader, Preview, Section } from "@/components/docs/primitives"
import { useStudio } from "@/components/docs/studio"

const ROLE_GROUPS = [
  ["primary", "primary-foreground", "primary-container", "primary-container-foreground"],
  ["tertiary", "tertiary-foreground", "tertiary-container", "tertiary-container-foreground"],
  ["destructive", "destructive-foreground", "destructive-container", "destructive-container-foreground"],
  ["success", "success-foreground", "success-container", "success-container-foreground"],
  ["warning", "warning-foreground", "warning-container", "warning-container-foreground"],
] as const

const SURFACES = [
  "surface-container-lowest",
  "surface-container-low",
  "surface-container",
  "surface-container-high",
  "surface-container-highest",
]

const TYPE_ROLES = [
  ["display-md", "Quiet confidence"],
  ["headline-md", "Settings and privacy"],
  ["title-lg", "Notification preferences"],
  ["title-sm", "Weekly digest"],
  ["body-lg", "We send one summary every Monday morning with the changes your team made last week."],
  ["body-md", "You can pause the digest at any time. Paused digests resume on the next Monday."],
  ["label-lg", "Save changes"],
  ["label-sm", "LAST EDITED 2 MIN AGO"],
]

// full class names so Tailwind can see them
const TYPE_CLASS: Record<string, string> = {
  "display-md": "type-display-md",
  "headline-md": "type-headline-md",
  "title-lg": "type-title-lg",
  "title-sm": "type-title-sm",
  "body-lg": "type-body-lg",
  "body-md": "type-body-md",
  "label-lg": "type-label-lg",
  "label-sm": "type-label-sm",
}

export default function FoundationsPage() {
  const { seed, vibrance } = useStudio()
  const ramps = React.useMemo(() => paletteRamps({ seed, vibrance }), [seed, vibrance])

  return (
    <>
      <PageHeader eyebrow="Foundations" title="One seed color. Every token, in both themes.">
        Velvet keeps Material You&apos;s tonal model and rebuilds the details: calmer chroma, tinted neutrals, a surface
        ladder for depth, tinted two-layer shadows and spring motion. Every role maps onto shadcn&apos;s variables, so
        existing components keep working. Pick a seed in the sidebar to regenerate this page.
      </PageHeader>

      <Section
        title="Install"
        description="Generate a theme from your brand color, then add it to any shadcn project (Tailwind v4)."
      >
        <Code>{`npm run theme -- --seed "${seed}"${vibrance !== 1 ? ` --vibrance ${vibrance}` : ""}\nnpm run registry:build\n\nnpx shadcn@latest add https://<your-registry>/r/theme.json`}</Code>
      </Section>

      <Section
        title="Color roles"
        description={
          <>Each accent comes as four roles: the color, the content on it, a soft container, and the content on the container. shadcn&apos;s <code className="font-mono type-body-sm">primary</code>, <code className="font-mono type-body-sm">destructive</code> and the rest keep their meaning.</>
        }
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {ROLE_GROUPS.map(([base, on, container, onContainer]) => (
            <div key={base} className="overflow-hidden rounded-2xl border border-border bg-card">
              <div className="flex h-20 items-end p-3.5 type-label-lg" style={{ background: `var(--${base})`, color: `var(--${on})` }}>
                {base}
              </div>
              <div className="flex h-14 items-end p-3.5 type-label-md" style={{ background: `var(--${container})`, color: `var(--${onContainer})` }}>
                {container}
              </div>
            </div>
          ))}
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="flex h-20 items-end bg-secondary p-3.5 type-label-lg text-secondary-foreground">secondary</div>
            <div className="flex h-14 items-end bg-muted p-3.5 type-label-md text-muted-foreground">muted</div>
          </div>
        </div>
      </Section>

      <Section
        title="Surfaces"
        description="Five container tones replace flat gray. In light mode they step down from white; in dark mode they step up, so raised layers read as lighter, the way lit objects do."
      >
        <div className="grid grid-cols-2 gap-2 rounded-3xl bg-background p-2 ring-1 ring-border sm:grid-cols-5">
          {SURFACES.map((s) => (
            <div key={s} className="flex h-28 items-end rounded-2xl p-3 type-label-sm text-foreground" style={{ background: `var(--${s})` }}>
              {s.replace("surface-container", "container") || "container"}
            </div>
          ))}
        </div>
      </Section>

      <Section title="Tonal palettes" description="HCT tones 0 to 100. Roles pick tones from these ramps, so contrast is predictable for any seed.">
        <div className="flex flex-col gap-2 overflow-x-auto pb-1">
          {Object.entries(ramps).map(([name, ramp]) => (
            <div key={name} className="flex min-w-[560px] items-center gap-3">
              <span className="w-28 shrink-0 type-label-md text-muted-foreground">{name}</span>
              <div className="flex flex-1 overflow-hidden rounded-xl ring-1 ring-border">
                {ramp.map((t) => (
                  <div key={t.tone} title={`${name} ${t.tone}: ${t.color}`} className="flex h-9 flex-1 items-end justify-center pb-1 text-[0.625rem] tabular-nums" style={{ background: t.color, color: t.tone >= 50 ? "#000" : "#fff" }}>
                    {t.tone}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="Elevation"
        description={<>Two layers per level: a tight contact shadow and a soft ambient one, both tinted with the seed&apos;s neutral. Use <code className="font-mono type-body-sm">shadow-e1</code> to <code className="font-mono type-body-sm">shadow-e5</code>; pair with <code className="font-mono type-body-sm">inset-shadow-highlight</code> on filled controls.</>}
      >
        <div className="grid grid-cols-2 gap-5 rounded-3xl bg-surface-container p-6 sm:grid-cols-5 sm:p-8">
          {[1, 2, 3, 4, 5].map((e) => (
            <div key={e} className="flex aspect-[4/3] max-w-full flex-col justify-end rounded-2xl bg-card p-3.5" style={{ boxShadow: `var(--shadow-e${e})` }}>
              <span className="type-title-sm">e{e}</span>
              <span className="type-label-sm text-muted-foreground">{["Cards", "Raised buttons", "Menus", "Dialogs", "Drag"][e - 1]}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Shape" description={<>One knob, <code className="font-mono type-body-sm">--radius</code> (default 14px), drives the whole scale. Controls use pill shapes that tighten while pressed.</>}>
        <div className="flex flex-wrap items-end gap-4">
          {["xs", "sm", "md", "lg", "xl", "2xl", "3xl"].map((r) => (
            <div key={r} className="flex flex-col items-center gap-2">
              <div className="size-16 border border-outline-variant bg-primary-container" style={{ borderRadius: `var(--radius-${r})` }} />
              <span className="type-label-sm text-muted-foreground">{r}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Type roles" description="Material's role names with tighter optical tracking at large sizes. Each role sets size, line height, tracking and weight in one class.">
        <div className="flex flex-col divide-y divide-border rounded-3xl border border-border bg-card">
          {TYPE_ROLES.map(([role, sample]) => (
            <div key={role} className="flex flex-col gap-1 px-5 py-4 sm:flex-row sm:items-baseline sm:gap-6">
              <code className="w-32 shrink-0 font-mono type-label-sm text-muted-foreground">type-{role}</code>
              <span className={`${TYPE_CLASS[role]} min-w-0`}>{sample}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Motion" description="Springs are simulated at build time and shipped as CSS linear() easings, so they run on the compositor with no JavaScript.">
        <MotionDemo />
      </Section>

      <Section title="Interaction" description={<><code className="font-mono type-body-sm">state-layer</code> adds a hover, focus and press overlay in the content color. <code className="font-mono type-body-sm">tactile</code> compresses on press and springs back on release. Every interactive component uses both.</>}>
        <Preview>
          <Button>Press and hold</Button>
          <Button variant="tonal">Tonal</Button>
          <Button variant="elevated">Elevated</Button>
          <button type="button" className="state-layer tactile cursor-pointer rounded-2xl border border-outline-variant bg-card px-5 py-4 text-left type-label-lg outline-none focus-visible:outline-2 focus-visible:outline-ring">
            Any surface
            <span className="block type-body-sm text-muted-foreground">state-layer tactile</span>
          </button>
        </Preview>
      </Section>
    </>
  )
}

const EASINGS = [
  ["ease-spring", "Default movement"],
  ["ease-spring-bouncy", "Press release, toggles"],
  ["ease-spring-snappy", "Micro feedback"],
  ["ease-emphasized", "Large transitions"],
]

function MotionDemo() {
  const [on, setOn] = React.useState(false)
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 rounded-3xl bg-surface-container-low p-5 dark:bg-surface-container-lowest">
        {EASINGS.map(([name, use]) => (
          <div key={name} className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-4">
            <div className="w-48 shrink-0">
              <code className="font-mono type-label-sm">{name}</code>
              <p className="type-body-sm text-muted-foreground">{use}</p>
            </div>
            <div className="relative h-10 min-w-0 flex-1 rounded-full bg-surface-container-high">
              <div
                className="absolute top-1 size-8 rounded-full bg-primary shadow-e2 inset-shadow-highlight motion-reduce:transition-none"
                style={{
                  left: on ? "calc(100% - 2.25rem)" : "0.25rem",
                  transition: `left 700ms var(--${name})`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
      <div>
        <Button variant="tonal" onClick={() => setOn((v) => !v)}>
          <Play /> Play
        </Button>
      </div>
    </div>
  )
}
