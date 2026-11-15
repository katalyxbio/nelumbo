"use client"

import * as React from "react"
import { ScrollArea, ScrollBar } from "@/registry/velvet/ui/scroll-area"
import { Code, PageHeader, Preview, Section, PropsTable } from "@/components/docs/primitives"

const TAGS = [
  "Linen", "Oat", "Sage", "Clay", "Ink", "Dune", "Moss", "Pebble", "Salt", "Birch",
  "Fern", "Dusk", "Coral", "Slate", "Sand", "Plum", "Frost", "Ember", "Willow", "Cedar",
]

const GALLERY = [
  { title: "Morning light", tone: "bg-blue-container text-blue-container-foreground" },
  { title: "Coastal walk", tone: "bg-green-container text-green-container-foreground" },
  { title: "Old town", tone: "bg-amber-container text-amber-container-foreground" },
  { title: "Night market", tone: "bg-purple-container text-purple-container-foreground" },
  { title: "Harbour", tone: "bg-cyan-container text-cyan-container-foreground" },
  { title: "Hill path", tone: "bg-pink-container text-pink-container-foreground" },
  { title: "Forest edge", tone: "bg-orange-container text-orange-container-foreground" },
]

const TILES = Array.from({ length: 60 }, (_, i) => i + 1)

function Tile({ n, className }: { n: number; className?: string }) {
  return (
    <div
      className={
        "grid place-items-center rounded-2xl bg-surface-container-high type-label-md text-muted-foreground " + (className ?? "")
      }
    >
      {n}
    </div>
  )
}

export default function ScrollAreaPage() {
  return (
    <>
      <PageHeader eyebrow="Component · 42" title="Scroll Area">
        A region that scrolls inside its box, with thin bars that appear when you hover and fade away after. Use it for
        long lists in a fixed panel, and for galleries that run past the edge. Built on Radix, with shadcn&apos;s API.
      </PageHeader>

      <Section title="Install">
        <Code>{`npx shadcn@latest add @velvet/scroll-area`}</Code>
      </Section>

      <Section
        title="Vertical list"
        description="A fixed-height box with a list inside. The bar appears on hover, or while you scroll with the wheel or keys. Tab to the list to scroll it from the keyboard: arrow keys, Page Up and Page Down, Home and End."
      >
        <Preview className="justify-center">
          <ScrollArea aria-label="Tags" className="h-72 w-full max-w-sm rounded-3xl bg-surface-container">
            <ul className="flex flex-col gap-1 p-2 pe-6">
              {TAGS.map((tag) => (
                <li key={tag} className="type-body-md rounded-2xl px-4 py-3 text-foreground hover:bg-surface-container-high">
                  {tag}
                </li>
              ))}
            </ul>
          </ScrollArea>
        </Preview>
      </Section>

      <Section
        title="Horizontal gallery"
        description={'Make the content wide and give the area a horizontal bar: add <ScrollBar orientation="horizontal" />. Leave a little room at the bottom so the bar does not sit on the cards.'}
      >
        <Preview className="justify-center">
          <ScrollArea aria-label="Photos" className="w-full max-w-xl">
            <div className="flex w-max gap-3 px-1 pt-1 pb-5">
              {GALLERY.map((item) => (
                <div
                  key={item.title}
                  className={`flex h-44 w-56 shrink-0 flex-col justify-end rounded-3xl p-5 ${item.tone}`}
                >
                  <span className="type-title-md">{item.title}</span>
                </div>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </Preview>
      </Section>

      <Section
        title="Both directions"
        description="Content that is wide and tall gets both bars, with a small corner where they meet. Scrolling works with the wheel, trackpad, the bars or the keyboard."
      >
        <Preview className="justify-center">
          <ScrollArea aria-label="Calendar grid" className="h-64 w-full max-w-xl rounded-3xl bg-surface-container">
            <div className="grid w-[760px] grid-cols-10 gap-2 p-3 pe-5 pb-5">
              {TILES.map((n) => (
                <Tile key={n} n={n} className="aspect-square" />
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </Preview>
      </Section>

      <Section
        title="Fade edges"
        description="The fade prop softens the edge where content continues. An edge fades only while there is more content past it, so the first and last items are never dimmed. Scroll to the middle to see both edges."
      >
        <Preview className="justify-center">
          <ScrollArea fade aria-label="Tags, faded" className="h-64 w-full max-w-sm rounded-3xl bg-surface-container">
            <ul className="flex flex-col gap-1 p-2 pe-6">
              {TAGS.map((tag) => (
                <li key={tag} className="type-body-md rounded-2xl px-4 py-3 text-foreground hover:bg-surface-container-high">
                  {tag}
                </li>
              ))}
            </ul>
          </ScrollArea>
          <ScrollArea fade aria-label="Photos, faded" className="w-full max-w-md">
            <div className="flex w-max gap-3 px-6 pb-5">
              {GALLERY.map((item) => (
                <div
                  key={item.title}
                  className={`flex h-36 w-40 shrink-0 flex-col justify-end rounded-3xl p-4 ${item.tone}`}
                >
                  <span className="type-title-sm">{item.title}</span>
                </div>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </Preview>
      </Section>

      <Section title="Usage">
        <Code>{`import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

// shadcn's API
<ScrollArea className="h-72 w-48 rounded-md border">
  <div className="p-4">…</div>
</ScrollArea>

// Horizontal gallery
<ScrollArea className="w-96">
  <div className="flex w-max gap-4 p-4">…</div>
  <ScrollBar orientation="horizontal" />
</ScrollArea>

// Velvet: soft edge fades that show only where there is more to see
<ScrollArea fade aria-label="Tags" className="h-72">…</ScrollArea>`}</Code>
      </Section>

      <Section title="Props">
        <PropsTable
          note="Radix's own props (type, scrollHideDelay, dir) work as is"
          rows={[
            ["ScrollArea fade", "boolean", "false", "Soft fades at the edges that have more content past them"],
            ["ScrollArea type", '"auto" | "always" | "scroll" | "hover"', '"hover"', "Velvet default: bars show on hover and fade out. Use always to keep them"],
            ["ScrollArea scrollHideDelay", "number", "600", "Milliseconds before the bars fade after the pointer leaves"],
            ["ScrollArea aria-label", "string", "", "Names the scrollable region (the viewport gets role region)"],
            ["ScrollBar orientation", '"vertical" | "horizontal"', '"vertical"', "A vertical bar is always there unless you pass one yourself"],
          ]}
        />
      </Section>
    </>
  )
}
