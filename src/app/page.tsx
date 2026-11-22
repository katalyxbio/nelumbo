"use client"

import * as React from "react"
import { Icon } from "@/registry/nelumbo/ui/icon"
import { ACCENT_NAMES, paletteRamps } from "@/lib/nelumbo/scheme"
import { Button } from "@/registry/nelumbo/ui/button"
import { Code, PageHeader, Preview, Section } from "@/components/docs/primitives"
import { useStudio } from "@/components/docs/studio"
import { Switch } from "@/registry/nelumbo/ui/switch"
import { Checkbox } from "@/registry/nelumbo/ui/checkbox"
import { Slider } from "@/registry/nelumbo/ui/slider"
import { Progress } from "@/registry/nelumbo/ui/progress"
import { FilterChip } from "@/registry/nelumbo/ui/chip"

const NEUTRAL_ROLES = [
  ["primary", "primary-foreground", "Primary actions"],
  ["primary-container", "primary-container-foreground", "Tonal buttons, selection"],
  ["secondary", "secondary-foreground", "Secondary fills"],
  ["muted", "muted-foreground", "Quiet areas, secondary text"],
  ["inverse-surface", "inverse-foreground", "Snackbars, tooltips"],
] as const

// sample tags: what an accent is for
const ACCENT_SAMPLES: Record<string, string> = {
  brand: "Focus, brand moments",
  blue: "In review",
  cyan: "Scheduled",
  green: "Shipped",
  amber: "Needs attention",
  orange: "Blocked",
  red: "Overdue",
  pink: "Design",
  purple: "Research",
}

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
  const { brand, neutral, vibrance } = useStudio()
  const ramps = React.useMemo(() => paletteRamps({ brand, neutral, vibrance }), [brand, neutral, vibrance])
  const themeArgs = [brand !== "blue" && `--brand ${brand.startsWith("#") ? `"${brand}"` : brand}`, neutral !== "pure" && `--neutral ${neutral}`, vibrance !== 1 && `--vibrance ${vibrance}`]
    .filter(Boolean)
    .join(" ")

  return (
    <>
      <PageHeader eyebrow="Foundations" title="Black and white by default. Color where it means something.">
        The interface is built from true neutrals: black, white and a ladder of grays for depth. Color comes from an
        accent palette, used for status, categories, charts and focus. Every role maps onto shadcn&apos;s variables, so
        existing components keep working. Change the brand accent or the gray temperature in the sidebar.
      </PageHeader>

      <Section
        title="Install"
        description="Generate the theme with your brand accent, then add it to any shadcn project (Tailwind v4)."
      >
        <Code>{`npm run theme${themeArgs ? ` -- ${themeArgs}` : ""}\nnpm run registry:build\n\nnpx shadcn@latest add @nelumbo/theme`}</Code>
      </Section>

      <Section
        title="Neutral roles"
        description="Everything structural is neutral. Primary is near-black in light mode and near-white in dark mode."
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {NEUTRAL_ROLES.map(([bg, fg, use]) => (
            <div key={bg} className="flex h-28 flex-col justify-end gap-0.5 rounded-2xl p-3.5 ring-1 ring-border" style={{ background: `var(--${bg})`, color: `var(--${fg})` }}>
              <span className="type-label-lg">{bg}</span>
              <span className="type-body-sm">{use}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="Accent palette"
        description={
          <>
            Eight accents plus the brand, each in four roles: the color, the content on it, a soft container and the content on the container. Use them for meaning, never for decoration. <code className="font-mono type-body-sm">destructive</code>, <code className="font-mono type-body-sm">success</code> and <code className="font-mono type-body-sm">warning</code> map to red, green and amber.
          </>
        }
      >
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
          {["brand", ...ACCENT_NAMES].map((n) => (
            <div key={n} className="flex flex-col overflow-hidden rounded-2xl bg-card ring-1 ring-border">
              <div className="flex h-16 items-end p-3 type-label-lg capitalize" style={{ background: `var(--${n})`, color: `var(--${n}-foreground)` }}>
                {n}
              </div>
              <div className="flex flex-col gap-2 p-3">
                <span
                  className="w-fit rounded-full px-2.5 py-1 type-label-sm"
                  style={{ background: `var(--${n}-container)`, color: `var(--${n}-container-foreground)` }}
                >
                  {ACCENT_SAMPLES[n]}
                </span>
                <span className="type-label-md" style={{ color: `var(--${n})` }}>
                  Text in {n}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="Surfaces"
        description="Five gray container tones give layers depth. In light mode they step down from white; in dark mode they step up, so raised layers read as lighter, the way lit objects do."
      >
        <div className="grid grid-cols-2 gap-2 rounded-3xl bg-background p-2 ring-1 ring-border sm:grid-cols-5">
          {SURFACES.map((s) => (
            <div key={s} className="flex h-28 items-end rounded-2xl p-3 type-label-sm text-foreground" style={{ background: `var(--${s})` }}>
              {s.replace("surface-container", "container") || "container"}
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="Dynamic color"
        description={<>The interface is black and white. Wrap a page or a section in <code className="font-mono type-body-sm">data-color=&quot;dynamic&quot;</code> and the controls inside it switch to the accent: selection, progress, navigation indicators, date and time selection, the FAB. Buttons, text and surfaces stay neutral. Nest <code className="font-mono type-body-sm">data-color=&quot;neutral&quot;</code> to turn it off again.</>}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {(["neutral", "dynamic"] as const).map((mode) => (
            <div key={mode} data-color={mode === "dynamic" ? "dynamic" : undefined} className="flex flex-col gap-5 rounded-(--radius-2xl) bg-surface-container-low p-6">
              <span className="type-label-md text-muted-foreground">{mode === "dynamic" ? 'data-color="dynamic"' : "Default"}</span>
              <div className="flex items-center gap-4">
                <Switch defaultChecked aria-label={`Switch, ${mode}`} />
                <Checkbox defaultChecked aria-label={`Checkbox, ${mode}`} />
                <FilterChip defaultSelected>Assayed</FilterChip>
              </div>
              <Slider defaultValue={[62]} aria-label={`Slider, ${mode}`} />
              <Progress value={48} aria-label={`Progress, ${mode}`} />
            </div>
          ))}
        </div>
        <Code>{`<section data-color="dynamic">
  <Switch />          {/* accent */}
  <Button>Save</Button> {/* still neutral */}
</section>`}</Code>
      </Section>

      <Section title="Tonal palettes" description="HCT tones 0 to 100. Roles pick tones from these ramps, so contrast is the same for every accent.">
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
        description={<>Two layers per level: a tight contact shadow and a soft ambient one, both cast in the neutral. Use <code className="font-mono type-body-sm">shadow-e1</code> to <code className="font-mono type-body-sm">shadow-e5</code>.</>}
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
          <Button variant="secondary">Secondary</Button>
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
                className="absolute top-1 size-8 rounded-full bg-primary shadow-e2 motion-reduce:transition-none"
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
        <Button variant="secondary" onClick={() => setOn((v) => !v)}>
          <Icon name="play_arrow" /> Play
        </Button>
      </div>
    </div>
  )
}
