"use client"

import * as React from "react"
import { IconButton } from "@/registry/velvet/ui/icon-button"
import { Icon, type IconName } from "@/registry/velvet/ui/icon"
import { Code, PageHeader, Preview, Section } from "@/components/docs/primitives"

const VARIANTS = ["standard", "filled", "secondary", "outlined"] as const

const PROPS = [
  ["label", "string", "required", "Accessible name, read by screen readers"],
  ["icon", "IconName", "", "Material Symbols name, typed and autocompleted"],
  ["selectedIcon", "IconName", "", "Icon shown while selected (toggle only)"],
  ["variant", '"standard" | "filled" | "secondary" | "outlined"', '"standard"', ""],
  ["size", '"xs" | "sm" | "default" | "lg" | "xl"', '"default"', "Buttons 28 to 56 px, icons 16 to 24 px"],
  ["width", '"narrow" | "default" | "wide"', '"default"', ""],
  ["shape", '"pill" | "square"', '"pill"', "Selection swaps pill and square"],
  ["toggle", "boolean", "false", "Makes it a Radix Toggle"],
  ["pressed / defaultPressed / onPressedChange", "", "", "Toggle state, same as Radix Toggle"],
  ["loading", "boolean", "false", ""],
]

export default function IconButtonPage() {
  const [playing, setPlaying] = React.useState(false)

  return (
    <>
      <PageHeader eyebrow="Component 02" title="Icon Button">
        Material 3&apos;s four icon button styles, drawn with Material Symbols. As a toggle, the selected state fills
        the glyph and morphs the shape, so the change reads at a glance and not only through color.
      </PageHeader>

      <Section title="Install" description="Installs Icon and Button with it. Then load the icon font (see Icons below).">
        <Code>{`npx shadcn@latest add @velvet/icon-button`}</Code>
      </Section>

      <Section title="Variants" description="Ordered by emphasis. Standard suits toolbars and dense rows; filled marks the one key action in a group.">
        <Preview>
          {VARIANTS.map((v) => (
            <div key={v} className="flex flex-col items-center gap-2">
              <IconButton variant={v} icon={v === "filled" ? "add" : v === "secondary" ? "edit" : v === "outlined" ? "share" : "more_vert"} label={v} />
              <span className="type-label-sm text-muted-foreground">{v}</span>
            </div>
          ))}
        </Preview>
      </Section>

      <Section
        title="Toggle"
        description="Click to select. The icon's fill axis animates from outline to solid, and the corners tighten. Unselected toggles sit on a quiet container so both states look intentional."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {VARIANTS.map((v) => (
            <Preview key={v} label={v} className="gap-4">
              <IconButton toggle variant={v} icon="favorite" label="Favorite" />
              <IconButton toggle defaultPressed variant={v} icon="favorite" label="Favorite" />
              <IconButton toggle variant={v} icon="bookmark" selectedIcon="bookmark_added" label="Save" />
              <IconButton toggle defaultPressed variant={v} icon="bookmark" selectedIcon="bookmark_added" label="Save" />
            </Preview>
          ))}
        </div>
      </Section>

      <Section title="Sizes and widths" description="Glyphs use the matching optical size, so a 20px icon is drawn for 20px, with sturdier strokes than a scaled-down 24.">
        <Preview label="size" className="items-end">
          {(["xs", "sm", "default", "lg", "xl"] as const).map((s) => (
            <IconButton key={s} size={s} variant="secondary" icon="mic" label={`Record (${s})`} />
          ))}
        </Preview>
        <Preview label="width">
          {(["narrow", "default", "wide"] as const).map((w) => (
            <IconButton key={w} width={w} size="lg" variant="filled" icon="arrow_forward" label={`Next (${w})`} />
          ))}
        </Preview>
      </Section>

      <Section title="Shape" description="Pill toggles become rounded squares when selected; square toggles become pills. Press and hold any of them to see the pressed morph as well.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Preview label="pill">
            <IconButton toggle size="lg" variant="filled" icon="keep" label="Pin" />
            <IconButton toggle defaultPressed size="lg" variant="filled" icon="keep" label="Pin" />
          </Preview>
          <Preview label="square">
            <IconButton toggle shape="square" size="lg" variant="filled" icon="keep" label="Pin" />
            <IconButton toggle defaultPressed shape="square" size="lg" variant="filled" icon="keep" label="Pin" />
          </Preview>
        </div>
      </Section>

      <Section title="In context" description="A text toolbar of standard toggles, and player controls where the main action is wide and filled.">
        <div className="grid gap-4 lg:grid-cols-2">
          <Preview className="justify-center">
            <div className="flex items-center gap-1 rounded-full bg-card p-1.5 shadow-e2">
              <IconButton toggle size="sm" icon="format_bold" label="Bold" defaultPressed />
              <IconButton toggle size="sm" icon="format_italic" label="Italic" />
              <IconButton toggle size="sm" icon="format_underlined" label="Underline" />
              <span className="mx-1 h-5 w-px bg-border" />
              <IconButton size="sm" icon="link" label="Insert link" />
              <IconButton size="sm" icon="format_list_bulleted" label="Bulleted list" />
            </div>
          </Preview>
          <Preview className="justify-center gap-2">
            <IconButton variant="secondary" icon="skip_previous" label="Previous track" />
            <IconButton
              toggle
              variant="filled"
              size="xl"
              width="wide"
              icon="play_arrow"
              selectedIcon="pause"
              label={playing ? "Pause" : "Play"}
              pressed={playing}
              onPressedChange={setPlaying}
            />
            <IconButton variant="secondary" icon="skip_next" label="Next track" />
          </Preview>
        </div>
      </Section>

      <Section title="States">
        <Preview>
          <IconButton variant="filled" icon="cloud_upload" label="Uploading" loading />
          <IconButton variant="secondary" icon="cloud_upload" label="Uploading" loading />
          <IconButton variant="filled" icon="delete" label="Delete" disabled />
          <IconButton variant="outlined" icon="delete" label="Delete" disabled />
        </Preview>
      </Section>

      <Section
        id="icons"
        title="Icons"
        description={
          <>
            Velvet uses Material Symbols Rounded as a variable font. Every axis is a CSS variable, so components can drive
            icons without extra props. Try the axes below.
          </>
        }
      >
        <AxesPlayground />
        <Code>{`import { Icon } from "@/components/ui/icon"

<Icon name="favorite" />                   // decorative, 1.25em
<Icon name="favorite" fill weight={500} /> // filled, heavier
<Icon name="warning" size={20} label="Warning" />  // meaningful icon`}</Code>
        <div className="flex max-w-2xl flex-col gap-2 type-body-md text-muted-foreground">
          <p>
            <span className="text-foreground">Loading the font.</span> The full font is about 4.6 MB. In production, load
            only the icons you use, which is usually a few KB:
          </p>
        </div>
        <Code>{`// app/layout.tsx
import { materialSymbolsUrl } from "@/components/ui/icon"

<link rel="stylesheet" href={materialSymbolsUrl(["favorite", "settings", "add"])} />

// or self-host everything (simplest, heaviest):
import "material-symbols/rounded.css"`}</Code>
      </Section>

      <Section id="props" title="Props" description="Other props go to the underlying button, or to Radix Toggle when toggle is set.">
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full min-w-[640px] text-left type-body-sm">
            <thead className="bg-surface-container-low type-label-md text-muted-foreground dark:bg-surface-container">
              <tr>
                <th className="px-4 py-3">Prop</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Default</th>
                <th className="px-4 py-3">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {PROPS.map(([name, type, def, note]) => (
                <tr key={name}>
                  <td className="px-4 py-3 font-mono type-label-md">{name}</td>
                  <td className="px-4 py-3 font-mono type-label-sm text-muted-foreground">{type}</td>
                  <td className="px-4 py-3 font-mono type-label-sm">{def}</td>
                  <td className="px-4 py-3 type-body-sm text-muted-foreground">{note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </>
  )
}

const SAMPLE: IconName[] = ["home", "search", "notifications", "settings", "favorite", "shopping_bag", "calendar_month", "photo_camera"]

function AxesPlayground() {
  const [fill, setFill] = React.useState(false)
  const [weight, setWeight] = React.useState(400)
  const [grade, setGrade] = React.useState(0)
  const [size, setSize] = React.useState(32)

  const sliders = [
    { id: "wght", label: "Weight", value: weight, set: setWeight, min: 100, max: 700, step: 100 },
    { id: "grad", label: "Grade", value: grade, set: setGrade, min: -25, max: 200, step: 25 },
    { id: "opsz", label: "Size / optical size", value: size, set: setSize, min: 20, max: 48, step: 4 },
  ]

  return (
    <div className="grid gap-5 rounded-3xl bg-surface-container-low p-5 md:grid-cols-[1fr_260px] dark:bg-surface-container-lowest">
      <div className="flex min-h-40 flex-wrap content-center items-center justify-center gap-5 rounded-2xl bg-card p-6">
        {SAMPLE.map((n) => (
          <Icon key={n} name={n} fill={fill} weight={weight} grade={grade} size={size} className="text-foreground" />
        ))}
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="type-label-md">Fill</span>
          <IconButton toggle variant="secondary" size="sm" icon="format_color_fill" label="Fill icons" pressed={fill} onPressedChange={setFill} />
        </div>
        {sliders.map((s) => (
          <div key={s.id} className="flex flex-col gap-1.5">
            <div className="flex justify-between type-label-md">
              <label htmlFor={`axis-${s.id}`}>{s.label}</label>
              <span className="text-muted-foreground tabular-nums">{s.value}</span>
            </div>
            <input
              id={`axis-${s.id}`}
              type="range"
              min={s.min}
              max={s.max}
              step={s.step}
              value={s.value}
              onChange={(e) => s.set(Number(e.target.value))}
              className="w-full accent-primary"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
