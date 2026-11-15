"use client"

import * as React from "react"
import { Icon, type IconName } from "@/registry/velvet/ui/icon"
import { Toggle } from "@/registry/velvet/ui/toggle"
import { ToggleGroup, ToggleGroupItem } from "@/registry/velvet/ui/toggle-group"
import { Code, PageHeader, Preview, PropsTable, Section } from "@/components/docs/primitives"

const FORMAT: { value: string; label: string; icon: IconName }[] = [
  { value: "bold", label: "Bold", icon: "format_bold" },
  { value: "italic", label: "Italic", icon: "format_italic" },
  { value: "underline", label: "Underline", icon: "format_underlined" },
]

const ALIGN: { value: string; label: string; icon: IconName }[] = [
  { value: "left", label: "Align left", icon: "format_align_left" },
  { value: "center", label: "Align center", icon: "format_align_center" },
  { value: "right", label: "Align right", icon: "format_align_right" },
  { value: "justify", label: "Justify", icon: "format_align_justify" },
]

export default function TogglePage() {
  const [bold, setBold] = React.useState(true)
  const [italic, setItalic] = React.useState(false)
  const [underline, setUnderline] = React.useState(false)
  const [align, setAlign] = React.useState("left")
  const [marks, setMarks] = React.useState<string[]>(["bold"])
  const [pinned, setPinned] = React.useState(false)

  return (
    <>
      <PageHeader eyebrow="Component · 41" title="Toggle and Toggle Group">
        A Toggle is one on/off setting, such as bold or pin. A Toggle Group holds several toggles that work together:
        pick one (alignment) or several (text styles). Both keep their state in aria-pressed and data-state, and the
        selected state fills in, tightens from a pill to a rounded square and, for icons, fills the glyph. In a connected group the selected item turns inverse and swells into a full pill while its neighbours give way.
      </PageHeader>

      <Section title="Install">
        <Code>{`npx shadcn@latest add @velvet/toggle @velvet/toggle-group`}</Code>
      </Section>

      <Section
        title="Text formatting"
        description="A toolbar of independent toggles. Each one is its own button with aria-pressed, so it works without a group."
      >
        <Preview>
          <div role="toolbar" aria-label="Text formatting" className="flex items-center gap-2">
            <Toggle aria-label="Bold" pressed={bold} onPressedChange={setBold}>
              <Icon name="format_bold" />
            </Toggle>
            <Toggle aria-label="Italic" pressed={italic} onPressedChange={setItalic}>
              <Icon name="format_italic" />
            </Toggle>
            <Toggle aria-label="Underline" pressed={underline} onPressedChange={setUnderline}>
              <Icon name="format_underlined" />
            </Toggle>
          </div>
        </Preview>
      </Section>

      <Section
        title="Toggle Group, multiple"
        description={'type="multiple" lets several items be on at once. The same toolbar as a connected group.'}
      >
        <Preview>
          <ToggleGroup type="multiple" value={marks} onValueChange={setMarks} aria-label="Text formatting">
            {FORMAT.map((f) => (
              <ToggleGroupItem key={f.value} value={f.value} aria-label={f.label}>
                <Icon name={f.icon} />
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </Preview>
      </Section>

      <Section
        title="Alignment, single"
        description={'type="single" holds one item on at a time. Clicking the selected item again turns it off, so this example ignores empty values to keep one on, like radio buttons.'}
      >
        <Preview>
          <ToggleGroup type="single" value={align} onValueChange={(v) => v && setAlign(v)} aria-label="Alignment">
            {ALIGN.map((a) => (
              <ToggleGroupItem key={a.value} value={a.value} aria-label={a.label}>
                <Icon name={a.icon} />
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </Preview>
      </Section>

      <Section
        title="Text and icon"
        description="A label beside the icon. The icon fills in when the item is on."
      >
        <Preview className="flex-wrap">
          <Toggle pressed={pinned} onPressedChange={setPinned}>
            <Icon name="keep" />
            Pin
          </Toggle>
          <ToggleGroup type="single" defaultValue="grid" aria-label="View">
            <ToggleGroupItem value="grid">
              <Icon name="grid_view" />
              Grid
            </ToggleGroupItem>
            <ToggleGroupItem value="list">
              <Icon name="view_list" />
              List
            </ToggleGroupItem>
          </ToggleGroup>
        </Preview>
      </Section>

      <Section
        title="Variants"
        description="default is a plain toggle. outline adds an outline border that stays visible while the toggle is off; the selected state drops the border for an inverse fill."
      >
        <Preview className="flex-col items-stretch gap-6">
          <div className="flex flex-wrap items-center gap-3">
            <Toggle aria-label="Bold" defaultPressed>
              <Icon name="format_bold" />
            </Toggle>
            <Toggle aria-label="Bold" variant="outline">
              <Icon name="format_bold" />
            </Toggle>
            <Toggle variant="outline" defaultPressed>
              Outline, on
            </Toggle>
          </div>
          <ToggleGroup variant="outline" type="multiple" defaultValue={["italic"]} aria-label="Text styles">
            {FORMAT.map((f) => (
              <ToggleGroupItem key={f.value} value={f.value} aria-label={f.label}>
                <Icon name={f.icon} />
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </Preview>
      </Section>

      <Section
        title="Sizes"
        description="sm, default and lg match the heights of Velvet's buttons (32, 40 and 48px). On a Toggle Group, set size once on the group."
      >
        <Preview className="flex-col items-start gap-4">
          {(["sm", "default", "lg"] as const).map((size) => (
            <ToggleGroup key={size} type="single" size={size} defaultValue="left" aria-label={`Alignment, ${size}`}>
              {ALIGN.slice(0, 3).map((a) => (
                <ToggleGroupItem key={a.value} value={a.value} aria-label={a.label}>
                  <Icon name={a.icon} />
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          ))}
          <div className="flex items-center gap-3">
            <Toggle size="sm" defaultPressed>
              Small
            </Toggle>
            <Toggle defaultPressed>Default</Toggle>
            <Toggle size="lg" defaultPressed>
              Large
            </Toggle>
          </div>
        </Preview>
      </Section>

      <Section
        title="Spacing"
        description="spacing 0 (the default) connects the items, with the same corners as a connected button group. A number separates them by that many 4px steps, and each item keeps its own shape."
      >
        <Preview className="flex-col items-start gap-6">
          <ToggleGroup type="single" defaultValue="center" spacing={2} aria-label="Alignment, spaced">
            {ALIGN.map((a) => (
              <ToggleGroupItem key={a.value} value={a.value} aria-label={a.label}>
                <Icon name={a.icon} />
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <ToggleGroup type="multiple" variant="outline" defaultValue={["bold"]} spacing={1} aria-label="Text styles, spaced">
            {FORMAT.map((f) => (
              <ToggleGroupItem key={f.value} value={f.value}>
                <Icon name={f.icon} />
                {f.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </Preview>
      </Section>

      <Section title="Disabled" description="Disabled items fade to 40% and stop responding. Arrow keys skip them.">
        <Preview className="flex-wrap gap-6">
          <Toggle disabled aria-label="Bold">
            <Icon name="format_bold" />
          </Toggle>
          <Toggle disabled variant="outline" defaultPressed>
            Outline, on
          </Toggle>
          <ToggleGroup type="single" defaultValue="left" aria-label="Alignment, disabled item">
            <ToggleGroupItem value="left" aria-label="Align left">
              <Icon name="format_align_left" />
            </ToggleGroupItem>
            <ToggleGroupItem value="center" aria-label="Align center" disabled>
              <Icon name="format_align_center" />
            </ToggleGroupItem>
            <ToggleGroupItem value="right" aria-label="Align right">
              <Icon name="format_align_right" />
            </ToggleGroupItem>
          </ToggleGroup>
        </Preview>
      </Section>

      <Section title="Toggle or Icon Button or Segmented Button?">
        <div className="grid gap-3 type-body-md text-muted-foreground sm:grid-cols-3">
          <p>
            <span className="font-medium text-foreground">Toggle</span> is an on/off setting inside a toolbar or form,
            with a text label or an icon. Use a Toggle Group when several related toggles belong together.
          </p>
          <p>
            <span className="font-medium text-foreground">Icon Button</span> is an icon-only action, or a toggle with
            an icon that changes shape when on (favorite, bookmark). Reach for it when the icon alone says what it does.
          </p>
          <p>
            <span className="font-medium text-foreground">Segmented Button</span> is a choice between two to five short
            options shown side by side, with a check mark on the selected one. Use it for view modes and filters where
            the choices need labels.
          </p>
        </div>
      </Section>

      <Section title="Usage">
        <Code>{`import { Toggle } from "@/components/ui/toggle"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Icon } from "@/components/ui/icon"

// shadcn's API
<Toggle aria-label="Bold" pressed={bold} onPressedChange={setBold}>
  <Icon name="format_bold" />
</Toggle>

<ToggleGroup type="single" value={align} onValueChange={setAlign} aria-label="Alignment">
  <ToggleGroupItem value="left" aria-label="Align left"><Icon name="format_align_left" /></ToggleGroupItem>
  <ToggleGroupItem value="center" aria-label="Align center"><Icon name="format_align_center" /></ToggleGroupItem>
</ToggleGroup>

// Velvet: variants and sizes on the group, spacing for separated items
<ToggleGroup type="multiple" variant="outline" size="sm" spacing={1} aria-label="Styles">
  ...
</ToggleGroup>`}</Code>
      </Section>

      <Section title="Props">
        <PropsTable
          note="Notes"
          rows={[
            ["pressed", "boolean", "", "Controlled state. Pair with onPressedChange"],
            ["defaultPressed", "boolean", "false", "Initial state when uncontrolled"],
            ["onPressedChange", "(pressed: boolean) => void", "", "Called on every change"],
            ["variant", '"default" | "outline"', '"default"', "outline adds an outline border"],
            ["size", '"sm" | "default" | "lg"', '"default"', "Heights 32, 40 and 48px, matching Button"],
            ["type", '"single" | "multiple"', "", "ToggleGroup only. single keeps one item on"],
            ["value / defaultValue", "string | string[]", "", "ToggleGroup selection. Arrays for multiple"],
            ["onValueChange", "(value) => void", "", "ToggleGroup selection change"],
            ["spacing", "number", "0", "ToggleGroup. 0 connects the items; n > 0 separates by n * 4px"],
            ["disabled", "boolean", "false", "Fades to 40% and skips arrow-key focus"],
            ["aria-label", "string", "", "Required on icon-only toggles and on each group"],
          ]}
        />
      </Section>
    </>
  )
}
