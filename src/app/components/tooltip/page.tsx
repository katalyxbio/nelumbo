"use client"

import * as React from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTitle, TooltipTrigger } from "@/registry/velvet/ui/tooltip"
import { IconButton } from "@/registry/velvet/ui/icon-button"
import { Button } from "@/registry/velvet/ui/button"
import { Icon, type IconName } from "@/registry/velvet/ui/icon"
import { Code, PageHeader, Preview, PropsTable, Section } from "@/components/docs/primitives"

const TOOLS: { icon: IconName; label: string; shortcut: string }[] = [
  { icon: "format_bold", label: "Bold", shortcut: "⌘B" },
  { icon: "format_italic", label: "Italic", shortcut: "⌘I" },
  { icon: "format_underlined", label: "Underline", shortcut: "⌘U" },
  { icon: "format_list_bulleted", label: "Bulleted list", shortcut: "⇧⌘8" },
  { icon: "link", label: "Insert link", shortcut: "⌘K" },
]

export default function TooltipPage() {
  return (
    <>
      <PageHeader eyebrow="Component 19" title="Tooltip">
        A short label that appears on hover or keyboard focus, for controls whose meaning isn&apos;t obvious, like icon
        buttons. It pops in on a quick spring and never holds anything you can click.
      </PageHeader>

      <Section title="Install">
        <Code>{`npx shadcn@latest add @velvet/tooltip`}</Code>
      </Section>

      <Section
        title="Toolbar"
        description="Shortcuts sit after the label. Wrap the toolbar in one TooltipProvider: after the first tooltip, moving to the next one shows it right away."
      >
        <Preview>
          <TooltipProvider>
            <div role="toolbar" aria-label="Formatting" className="flex gap-1 rounded-full bg-card p-1 shadow-e1">
              {TOOLS.map((t) => (
                <Tooltip key={t.label}>
                  <TooltipTrigger asChild>
                    <IconButton icon={t.icon} label={t.label} size="sm" />
                  </TooltipTrigger>
                  <TooltipContent shortcut={t.shortcut}>{t.label}</TooltipContent>
                </Tooltip>
              ))}
            </div>
          </TooltipProvider>
        </Preview>
      </Section>

      <Section title="Rich" description="A title and a sentence or two, for explaining a setting. Keep it to text; anything clickable belongs in a Popover.">
        <Preview>
          <div className="flex items-center gap-1 type-body-md">
            Smart compose
            <Tooltip>
              <TooltipTrigger asChild>
                <IconButton icon="info" label="About smart compose" size="xs" />
              </TooltipTrigger>
              <TooltipContent variant="rich" side="right">
                <TooltipTitle>Smart compose</TooltipTitle>
                Suggests the rest of a sentence as you type. Press Tab to accept a suggestion.
              </TooltipContent>
            </Tooltip>
          </div>
        </Preview>
      </Section>

      <Section title="Sides" description="Top is the default. It flips to stay on screen.">
        <Preview>
          {(["top", "right", "bottom", "left"] as const).map((side) => (
            <Tooltip key={side}>
              <TooltipTrigger asChild>
                <Button variant="secondary" className="capitalize">
                  {side}
                </Button>
              </TooltipTrigger>
              <TooltipContent side={side}>Tooltip on the {side}</TooltipContent>
            </Tooltip>
          ))}
          <Tooltip>
            <TooltipTrigger asChild>
              <span tabIndex={0} className="flex items-center gap-1 rounded-sm type-body-md text-muted-foreground underline decoration-dotted underline-offset-4 outline-none focus-visible:outline-2 focus-visible:outline-ring">
                <Icon name="schedule" size={18} />
                2h ago
              </span>
            </TooltipTrigger>
            <TooltipContent>Thursday 14 November, 10:42</TooltipContent>
          </Tooltip>
        </Preview>
      </Section>

      <Section title="Usage">
        <Code>{`import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip"

<Tooltip>
  <TooltipTrigger asChild>
    <IconButton icon="format_bold" label="Bold" />
  </TooltipTrigger>
  <TooltipContent shortcut="⌘B">Bold</TooltipContent>
</Tooltip>`}</Code>
      </Section>

      <Section title="Props" description="Other props go to Radix Tooltip (open, onOpenChange, delayDuration, side, align…).">
        <PropsTable
          rows={[
            ["TooltipContent variant", '"plain" | "rich"', '"plain"', "Rich: card with TooltipTitle"],
            ["TooltipContent shortcut", "string", "", "Keys shown after the label"],
            ["TooltipProvider delayDuration", "number", "400", "ms before the first tooltip shows"],
            ["TooltipProvider skipDelayDuration", "number", "300", "Window in which the next tooltip shows at once"],
          ]}
        />
      </Section>
    </>
  )
}
