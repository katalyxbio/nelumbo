"use client"

import * as React from "react"
import { Button } from "@/registry/nelumbo/ui/button"
import { IconButton } from "@/registry/nelumbo/ui/icon-button"
import { ButtonGroup } from "@/registry/nelumbo/ui/button-group"
import { Icon } from "@/registry/nelumbo/ui/icon"
import { Code, PageHeader, Preview, PropsTable, Section } from "@/components/docs/primitives"

export default function ButtonGroupPage() {
  const [align, setAlign] = React.useState("left")

  return (
    <>
      <PageHeader eyebrow="Component 04" title="Button Group">
        Lays out related buttons as one unit. A wrapper only: it works with any Button or Icon Button, and adds no
        JavaScript.
      </PageHeader>

      <Section title="Install">
        <Code>{`npx shadcn@latest add @nelumbo/button-group`}</Code>
      </Section>

      <Section
        title="Standard"
        description="Separate buttons that react together: press and hold one and it widens while its neighbors make room."
      >
        <Preview>
          <ButtonGroup>
            <Button variant="secondary"><Icon name="reply" /> Reply</Button>
            <Button variant="secondary"><Icon name="reply_all" /> Reply all</Button>
            <Button variant="secondary"><Icon name="forward" /> Forward</Button>
          </ButtonGroup>
          <ButtonGroup>
            <IconButton variant="secondary" icon="undo" label="Undo" />
            <IconButton variant="secondary" icon="redo" label="Redo" />
            <IconButton variant="secondary" icon="content_cut" label="Cut" />
            <IconButton variant="secondary" icon="content_paste" label="Paste" />
          </ButtonGroup>
        </Preview>
      </Section>

      <Section
        title="Connected"
        description="A tight row with small inner corners. Selected toggles round out into full pills, so the choice reads from the shape as well as the color."
      >
        <Preview className="flex-col items-start gap-4">
          <ButtonGroup variant="connected" aria-label="Text alignment">
            {(
              [
                ["left", "format_align_left"],
                ["center", "format_align_center"],
                ["right", "format_align_right"],
                ["justify", "format_align_justify"],
              ] as const
            ).map(([a, icon]) => (
              <IconButton
                key={a}
                toggle
                variant="secondary"
                icon={icon}
                label={`Align ${a}`}
                pressed={align === a}
                onPressedChange={() => setAlign(a)}
              />
            ))}
          </ButtonGroup>
          <ButtonGroup variant="connected">
            <Button variant="outline">Previous</Button>
            <Button variant="outline">1</Button>
            <Button variant="outline">2</Button>
            <Button variant="outline">3</Button>
            <Button variant="outline">Next</Button>
          </ButtonGroup>
          <ButtonGroup variant="connected">
            <Button variant="default" size="lg">Publish</Button>
            <Button variant="default" size="lg">Schedule</Button>
          </ButtonGroup>
        </Preview>
      </Section>

      <Section title="Usage">
        <Code>{`<ButtonGroup variant="connected" aria-label="Text alignment">
  <IconButton toggle icon="format_align_left" label="Align left" />
  <IconButton toggle icon="format_align_center" label="Align center" />
</ButtonGroup>`}</Code>
      </Section>

      <Section title="Props">
        <PropsTable
          rows={[
            ["variant", '"standard" | "connected"', '"standard"', ""],
            ["aria-label", "string", "", "Name the group when the buttons work as one control"],
          ]}
        />
      </Section>
    </>
  )
}
