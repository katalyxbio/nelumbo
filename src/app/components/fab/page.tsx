"use client"

import * as React from "react"
import { Fab } from "@/registry/nelumbo/ui/fab"
import { Code, PageHeader, Preview, PropsTable, Section } from "@/components/docs/primitives"

const MESSAGES = [
  ["Ines Moreau", "Revised floor plan", "I moved the pantry wall 40 cm east so the island fits."],
  ["Tomás Reyes", "Invoice 2026-114", "Attached. Net 30 as usual, thanks for the quick turnaround."],
  ["Priya Natarajan", "Thursday standup", "Can we push to 10:30? I have a site visit at 9."],
  ["Jonas Berg", "Tile samples", "The matte grey arrived. The terracotta is back-ordered until December."],
  ["Hana Sato", "Permit update", "The city approved the window change. Stamped drawings attached."],
  ["Leo Martins", "Lighting plan", "Two options for the hallway. I lean towards the recessed one."],
  ["Ines Moreau", "Re: Revised floor plan", "Works for me. Can you check the clearance to the fridge?"],
]

export default function FabPage() {
  const [extended, setExtended] = React.useState(true)
  const lastTop = React.useRef(0)

  return (
    <>
      <PageHeader eyebrow="Component 06" title="FAB">
        The floating action button holds the single most important action on a screen. Use one per screen, at most.
      </PageHeader>

      <Section title="Install">
        <Code>{`npx shadcn@latest add @nelumbo/fab`}</Code>
      </Section>

      <Section title="Colors" description="Neutral container by default. Brand uses the accent container; solid is black (white in dark mode), for when the action must stand out against busy content.">
        <Preview className="gap-5">
          <Fab icon="edit" label="Compose" color="primary" />
          <Fab icon="edit" label="Compose" color="secondary" />
          <Fab icon="edit" label="Compose" color="brand" />
          <Fab icon="edit" label="Compose" color="surface" />
          <Fab icon="edit" label="Compose" color="solid" />
        </Preview>
      </Section>

      <Section title="Sizes" description="Small (40) for compact layouts, default (56), and large (96) for a hero action on big screens. Corners tighten while pressed.">
        <Preview className="items-end gap-5">
          <Fab icon="add" label="New task" size="sm" />
          <Fab icon="add" label="New task" />
          <Fab icon="add" label="New task" size="lg" />
        </Preview>
      </Section>

      <Section
        title="Extended"
        description="An extended FAB shows its label. Scroll the inbox: it collapses to the icon while you scroll down and opens again when you scroll up."
      >
        <div className="relative h-80 overflow-hidden rounded-3xl bg-surface-container-low dark:bg-surface-container-lowest">
          <div
            tabIndex={0} aria-label="Notes" role="region" className="h-full overflow-y-auto p-3 pb-24 outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
            onScroll={(e) => {
              const top = e.currentTarget.scrollTop
              if (Math.abs(top - lastTop.current) > 6) setExtended(top < lastTop.current || top < 8)
              lastTop.current = top
            }}
          >
            <ul className="flex flex-col gap-1.5">
              {[...MESSAGES, ...MESSAGES].map(([from, subject, body], i) => (
                <li key={i} className="flex flex-col gap-0.5 rounded-2xl bg-card px-4 py-3">
                  <div className="flex justify-between gap-3">
                    <span className="type-title-sm">{from}</span>
                    <span className="type-label-sm text-muted-foreground tabular-nums">{`${9 + (i % 8)}:${(i * 7) % 6}0`}</span>
                  </div>
                  <span className="type-label-lg">{subject}</span>
                  <span className="truncate type-body-sm text-muted-foreground">{body}</span>
                </li>
              ))}
            </ul>
          </div>
          <Fab icon="edit" label="Compose" extended={extended} className="absolute right-5 bottom-5" />
        </div>
      </Section>

      <Section title="Usage">
        <Code>{`<Fab icon="edit" label="Compose" extended={!scrollingDown} className="fixed right-6 bottom-6" />`}</Code>
      </Section>

      <Section title="Props">
        <PropsTable
          rows={[
            ["icon", "IconName", "required", ""],
            ["label", "string", "required", "Visible when extended; accessible name always"],
            ["extended", "boolean", "false", "Animates the label in and out"],
            ["color", '"primary" | "secondary" | "brand" | "surface" | "solid"', '"primary"', ""],
            ["size", '"sm" | "default" | "lg"', '"default"', "40, 56, 96 px"],
          ]}
        />
      </Section>
    </>
  )
}
