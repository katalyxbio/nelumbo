"use client"

import * as React from "react"
import { Kbd, KbdGroup, KbdShortcut } from "@/registry/nelumbo/ui/kbd"
import { Button } from "@/registry/nelumbo/ui/button"
import { IconButton } from "@/registry/nelumbo/ui/icon-button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/registry/nelumbo/ui/tooltip"
import { Code, PageHeader, Preview, PropsTable, Section } from "@/components/docs/primitives"

export default function KbdPage() {
  return (
    <>
      <PageHeader eyebrow="Component 56" title="Kbd">
        A keycap for showing a key or a shortcut: a small raised key with a darker lower edge. It is the same
        cap Command and the menus use for their shortcuts, so a shortcut looks the same everywhere.
      </PageHeader>

      <Section title="Install">
        <Code>{`npx shadcn@latest add @nelumbo/kbd`}</Code>
      </Section>

      <Section title="Keys and groups" description="Kbd is one key. KbdGroup sets several side by side with a small gap.">
        <Preview className="gap-6">
          <Kbd>Esc</Kbd>
          <Kbd>⌘</Kbd>
          <Kbd>Enter</Kbd>
          <KbdGroup>
            <Kbd>⌘</Kbd>
            <Kbd>⇧</Kbd>
            <Kbd>P</Kbd>
          </KbdGroup>
          <KbdGroup>
            <Kbd>Ctrl</Kbd>
            <Kbd>K</Kbd>
          </KbdGroup>
        </Preview>
      </Section>

      <Section
        title="Shortcut strings"
        description='KbdShortcut turns a string into separate caps: "⌘⇧P", "⌘ K" or "Ctrl+Shift+K". Screen readers hear the whole string once, not each key.'
      >
        <Preview className="gap-6">
          <KbdShortcut>⌘⇧P</KbdShortcut>
          <KbdShortcut>Ctrl+Shift+K</KbdShortcut>
          <KbdShortcut>⌥⌘B</KbdShortcut>
          <KbdShortcut>Esc</KbdShortcut>
        </Preview>
      </Section>

      <Section title="In text and buttons" description="Keycaps sit on the text baseline's center, so they work inline and inside a button.">
        <Preview className="flex-col items-start gap-4">
          <p className="type-body-md">
            Press <Kbd>/</Kbd> to focus the search, or <KbdShortcut>⌘K</KbdShortcut> to open the command palette.
          </p>
          <Button variant="outline">
            Save
            <KbdShortcut>⌘S</KbdShortcut>
          </Button>
        </Preview>
      </Section>

      <Section
        title="On dark surfaces"
        description='Inside a tooltip (hover or focus the button) the cap switches to the inverse look and gets smaller by itself. Anywhere else on a dark surface, use variant="inverse": it is a translucent tint of the text color, so it works on black and on white.'
      >
        <Preview className="gap-6">
          <Tooltip>
            <TooltipTrigger asChild>
              <IconButton icon="format_bold" label="Bold" />
            </TooltipTrigger>
            <TooltipContent side="right">
              Bold
              <KbdGroup>
                <Kbd>⌘</Kbd>
                <Kbd>B</Kbd>
              </KbdGroup>
            </TooltipContent>
          </Tooltip>
          <div className="ml-24 flex items-center gap-3 rounded-2xl bg-inverse-surface px-4 py-3 text-inverse-foreground">
            <span className="type-label-lg">Undo</span>
            <KbdShortcut variant="inverse">⌘Z</KbdShortcut>
          </div>
        </Preview>
      </Section>

      <Section title="Props">
        <PropsTable
          rows={[
            ["Kbd variant", '"default" | "inverse"', '"default"', "Inverse tints the key with the text color, for dark surfaces."],
            ["Kbd ...props", "ComponentProps<'kbd'>", "", "Rendered as a <kbd> with data-slot=kbd."],
            ["KbdGroup ...props", "ComponentProps<'span'>", "", "Inline-flex row with a 4px gap."],
            ["KbdShortcut children", "string", "", "A shortcut such as ⌘⇧P or Ctrl+Shift+K. Anything else is drawn as one cap."],
            ["KbdShortcut variant", '"default" | "inverse"', '"default"', "Passed to every key."],
            ["splitKeys(shortcut)", "(string) => string[]", "", "The parser behind KbdShortcut."],
          ]}
        />
      </Section>
    </>
  )
}
