"use client"

import * as React from "react"
import { Separator } from "@/registry/nelumbo/ui/separator"
import { IconButton } from "@/registry/nelumbo/ui/icon-button"
import { Icon, type IconName } from "@/registry/nelumbo/ui/icon"
import { Code, PageHeader, Preview, Section, PropsTable } from "@/components/docs/primitives"

const ROWS: { icon: IconName; label: string; value: string }[] = [
  { icon: "wifi", label: "Wi-Fi", value: "Home network" },
  { icon: "bluetooth", label: "Bluetooth", value: "2 devices" },
  { icon: "notifications", label: "Notifications", value: "Quiet after 22:00" },

]

function Row({ icon, label, value }: { icon: IconName; label: string; value: string }) {
  return (
    <div className="flex items-center gap-4 px-4 py-3">
      <Icon name={icon} className="text-muted-foreground" />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="type-title-sm">{label}</span>
        <span className="type-body-md text-muted-foreground">{value}</span>
      </span>
    </div>
  )
}

export default function SeparatorPage() {
  return (
    <>
      <PageHeader eyebrow="Component 43" title="Separator">
        A thin line that splits content into parts. Nelumbo draws it very faint, and prefers space to lines: start with
        a gap between groups, and reach for a line only when the gap is not enough. Built on Radix, with shadcn&apos;s
        API.
      </PageHeader>

      <Section title="Install">
        <Code>{`npx shadcn@latest add @nelumbo/separator`}</Code>
      </Section>

      <Section
        title="Spacing first"
        description="Most groups need no line at all. A larger gap, with a heading for each group, says the same thing and keeps the page quiet."
      >
        <Preview className="block">
          <div className="flex max-w-sm flex-col gap-8">
            <div className="flex flex-col gap-1">
              <span className="type-label-md text-muted-foreground">Connections</span>
              <div className="flex flex-col gap-1">
                <Row {...ROWS[0]} />
                <Row {...ROWS[1]} />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="type-label-md text-muted-foreground">Alerts</span>
              <Row {...ROWS[2]} />
            </div>
          </div>
        </Preview>
      </Section>

      <Section
        title="Line"
        description="The default: a 1px hairline in outline-variant at half strength. It separates two blocks without drawing the eye. Pass decorative={false} when a screen reader user should hear the boundary."
      >
        <Preview className="block">
          <div className="flex max-w-sm flex-col gap-4">
            <p className="type-body-md">Notifications arrive as they happen. Quiet hours hold them until morning.</p>
            <Separator />
            <p className="type-body-md text-muted-foreground">Sound and vibration follow the same schedule.</p>
          </div>
        </Preview>
      </Section>

      <Section
        title="Inset"
        description="variant=&quot;inset&quot; starts the line after a list's leading slot (72px, the same indent as a List divider), so it runs under the text, not under the icon."
      >
        <Preview className="block">
          <div className="flex max-w-sm flex-col">
            <Row icon="wifi" label="Wi-Fi" value="Home network" />
            <Separator variant="inset" />
            <Row icon="bluetooth" label="Bluetooth" value="2 devices" />
            <Separator variant="inset" />
            <Row icon="flight" label="Travel mode" value="Off" />
          </div>
        </Preview>
      </Section>

      <Section
        title="Space"
        description='variant="space" renders only the gap, with no line. Use it where you would otherwise put a line between groups: the same break, no stroke.'
      >
        <Preview className="block">
          <div className="flex max-w-sm flex-col">
            <p className="type-body-md">Each group ends here.</p>
            <Separator variant="space" />
            <p className="type-body-md">The next group starts after a 16px gap.</p>
          </div>
        </Preview>
      </Section>

      <Section
        title="Vertical, in a toolbar"
        description="A vertical separator stretches to the height of its row. Use it to split groups of buttons in a toolbar."
      >
        <Preview className="justify-center">
          <div role="toolbar" aria-label="Text formatting" className="flex h-12 items-center gap-1 rounded-full bg-surface-container-high px-2">
            <IconButton icon="format_bold" label="Bold" variant="standard" size="sm" />
            <IconButton icon="format_italic" label="Italic" variant="standard" size="sm" />
            <IconButton icon="format_underlined" label="Underline" variant="standard" size="sm" />
            <Separator orientation="vertical" className="mx-2 my-2.5" />
            <IconButton icon="format_align_left" label="Align left" variant="standard" size="sm" />
            <IconButton icon="format_align_center" label="Align center" variant="standard" size="sm" />
            <IconButton icon="format_align_right" label="Align right" variant="standard" size="sm" />
            <Separator orientation="vertical" variant="space" className="w-2" />
            <IconButton icon="link" label="Insert link" variant="standard" size="sm" />
          </div>
        </Preview>
      </Section>

      <Section title="Usage">
        <Code>{`import { Separator } from "@/components/ui/separator"

// shadcn's API
<Separator />
<Separator orientation="vertical" className="h-6" />

// Nelumbo: a line that starts after a list's leading slot
<Separator variant="inset" />

// Nelumbo: spacing only, no line
<Separator variant="space" />`}</Code>
      </Section>

      <Section title="Props">
        <PropsTable
          note="Radix's own props (orientation, decorative) work as is"
          rows={[
            ["variant", '"line" | "inset" | "space"', '"line"', "Faint hairline, a hairline from 72px in (inset), or spacing with no line"],
            ["orientation", '"horizontal" | "vertical"', '"horizontal"', "A vertical line stretches to the height of a flex row"],
            ["decorative", "boolean", "true", "Hidden from assistive tech. Set false when the boundary matters"],
          ]}
        />
      </Section>
    </>
  )
}
