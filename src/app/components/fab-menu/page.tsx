"use client"

import * as React from "react"
import Link from "next/link"
import { FabMenu, FabMenuContent, FabMenuItem, FabMenuTrigger } from "@/registry/nelumbo/ui/fab-menu"
import { Button } from "@/registry/nelumbo/ui/button"
import { Code, PageHeader, Preview, PropsTable, Section } from "@/components/docs/primitives"

const NOTES = [
  ["Kitchen plan", "Move the pantry wall 40 cm east so the island fits."],
  ["Groceries", "Oat milk, lemons, basil, the good olive oil."],
  ["Reading list", "Designing Interfaces, The Shape of Design, Tools for Thought."],
  ["Trip to Lisbon", "Book the tram tour. Check the museum hours on Monday."],
  ["Standup", "Push to 10:30. Site visit at 9."],
  ["Gift ideas", "Ceramic set for Hana, a linocut print for Leo."],
]

/** A phone-sized screen. `transform-gpu` makes it the containing block of the menu's fixed scrim, so the scrim stays inside. */
function Phone({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={"relative h-[34rem] w-[19rem] shrink-0 transform-gpu overflow-hidden rounded-[2.25rem] border-[6px] border-inverse-surface bg-background shadow-e3 dark:border-surface-container-highest " + (className ?? "")}>
      <div className="flex h-full flex-col gap-3 overflow-hidden p-5">
        <p className="pt-3 type-headline-sm">{title}</p>
        <ul className="flex flex-col gap-2">
          {NOTES.map(([t, b]) => (
            <li key={t} className="flex flex-col gap-0.5 rounded-2xl bg-surface-container-low px-4 py-3 dark:bg-surface-container">
              <span className="type-title-sm">{t}</span>
              <span className="truncate type-body-sm text-muted-foreground">{b}</span>
            </li>
          ))}
        </ul>
      </div>
      {children}
    </div>
  )
}

export default function FabMenuPage() {
  const [open, setOpen] = React.useState(false)
  const [last, setLast] = React.useState("Nothing chosen yet")

  return (
    <>
      <PageHeader eyebrow="Component 67" title="FAB Menu">
        A <Link href="/components/fab" className="underline underline-offset-4">FAB</Link> that opens into a short list of related actions. Tap it and the
        actions spring out of it one after another, nearest first, while the button shrinks to a round close button and its plus turns into a cross.
      </PageHeader>

      <Section title="Install">
        <Code>{`npx shadcn@latest add @nelumbo/fab-menu`}</Code>
      </Section>

      <Section
        title="Create menu"
        description="Four to six actions, stacked above the FAB and aligned to its trailing edge. Items are tonal pills from the FAB's color family. Choosing one, or pressing Escape, closes the menu and returns focus to the button."
      >
        <Preview className="justify-center py-8">
          <Phone title="Notes">
            <FabMenu scrim className="absolute right-5 bottom-5">
              <FabMenuTrigger icon="add" label="Create" />
              <FabMenuContent aria-label="Create">
                <FabMenuItem icon="edit_note" onSelect={() => {}}>New note</FabMenuItem>
                <FabMenuItem icon="checklist">Checklist</FabMenuItem>
                <FabMenuItem icon="mic">Voice memo</FabMenuItem>
                <FabMenuItem icon="photo_camera">Scan document</FabMenuItem>
                <FabMenuItem icon="draw">Sketch</FabMenuItem>
              </FabMenuContent>
            </FabMenu>
          </Phone>
        </Preview>
      </Section>

      <Section title="Brand, with a scrim" description="color matches Fab. scrim dims the screen behind the open menu; a click on it closes the menu.">
        <Preview className="justify-center py-8">
          <Phone title="Notes">
            <FabMenu color="brand" scrim className="absolute right-5 bottom-5">
              <FabMenuTrigger icon="edit" label="Create" />
              <FabMenuContent aria-label="Create">
                <FabMenuItem icon="edit_note">New note</FabMenuItem>
                <FabMenuItem icon="checklist">Checklist</FabMenuItem>
                <FabMenuItem icon="mic">Voice memo</FabMenuItem>
                <FabMenuItem icon="photo_camera">Scan document</FabMenuItem>
              </FabMenuContent>
            </FabMenu>
          </Phone>
        </Preview>
      </Section>

      <Section
        title="Small, to the left"
        description={'size="sm" and side="left" lay the actions out in a row beside the FAB, for a compact toolbar. The arrow keys work along either axis.'}
      >
        <Preview className="justify-center py-8">
          <Phone title="Notes">
            <FabMenu color="secondary" size="sm" side="left" className="absolute right-5 bottom-5">
              <FabMenuTrigger icon="more_horiz" label="More" />
              <FabMenuContent aria-label="More">
                <FabMenuItem icon="share">Share</FabMenuItem>
                <FabMenuItem icon="delete">Delete</FabMenuItem>
              </FabMenuContent>
            </FabMenu>
          </Phone>
        </Preview>
      </Section>

      <Section
        title="Controlled"
        description="open and onOpenChange put the menu in your state. onSelect runs when an item is chosen; call event.preventDefault() in it to keep the menu open."
      >
        <Preview className="flex-col items-center gap-6 py-8">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button variant="outline" onClick={() => setOpen((o) => !o)}>{open ? "Close menu" : "Open menu"}</Button>
            <p role="status" className="type-body-md text-muted-foreground">Menu is {open ? "open" : "closed"}. {last}.</p>
          </div>
          <Phone title="Notes">
            <FabMenu color="surface" scrim open={open} onOpenChange={setOpen} className="absolute right-5 bottom-5">
              <FabMenuTrigger icon="add" label="Create" />
              <FabMenuContent aria-label="Create">
                <FabMenuItem icon="edit_note" onSelect={() => setLast("Chose New note")}>New note</FabMenuItem>
                <FabMenuItem icon="checklist" onSelect={() => setLast("Chose Checklist")}>Checklist</FabMenuItem>
                <FabMenuItem icon="mic" onSelect={() => setLast("Chose Voice memo")}>Voice memo</FabMenuItem>
                <FabMenuItem icon="draw" onSelect={(e) => { e.preventDefault(); setLast("Sketch keeps the menu open") }}>Sketch</FabMenuItem>
              </FabMenuContent>
            </FabMenu>
          </Phone>
        </Preview>
      </Section>

      <Section title="Accessibility" description="The menu button pattern. The trigger has aria-haspopup=menu and aria-expanded; the list is role=menu with menuitem children, labelled by the trigger.">
        <Preview className="block">
          <ul className="grid max-w-2xl list-disc gap-1.5 pl-5 type-body-md">
            <li>Enter, Space or a click opens it and focuses the first item. ArrowDown and ArrowUp on the button open it too, to the first or last item.</li>
            <li>Arrow keys move between items and wrap. Home and End jump to the ends. Typing letters jumps to the next item that starts with them.</li>
            <li>Escape, choosing an item or Tab closes the menu; Escape and choosing return focus to the button.</li>
            <li>With prefers-reduced-motion, the items only fade: no travel, scale or rotation.</li>
          </ul>
        </Preview>
      </Section>

      <Section title="Usage">
        <Code>{`import { FabMenu, FabMenuTrigger, FabMenuContent, FabMenuItem } from "@/components/ui/fab-menu"

<FabMenu color="brand" scrim className="fixed right-6 bottom-6">
  <FabMenuTrigger icon="edit" label="Create" />
  <FabMenuContent aria-label="Create">
    <FabMenuItem icon="edit_note" onSelect={newNote}>New note</FabMenuItem>
    <FabMenuItem icon="checklist" onSelect={newList}>Checklist</FabMenuItem>
    <FabMenuItem icon="mic">Voice memo</FabMenuItem>
  </FabMenuContent>
</FabMenu>`}</Code>
      </Section>

      <Section title="Props">
        <PropsTable
          note="FabMenu holds the state and layout; the trigger is a Fab-styled button, so it takes Fab's color and size from the menu."
          rows={[
            ["color", '"primary" | "secondary" | "brand" | "surface" | "solid"', '"primary"', "Same palette as Fab; items are tonal pills of it"],
            ["size", '"sm" | "default" | "lg"', '"default"', "Trigger 40 / 56 / 96 px; open it shrinks to 40 / 48 / 56"],
            ["side", '"top" | "bottom" | "left" | "right"', '"top"', "Where the items go. left and right lay them in a row"],
            ["align", '"start" | "center" | "end"', '"end"', "Along the FAB's edge"],
            ["scrim", "boolean", "false", "Dim the page behind the menu; clicking it closes"],
            ["open / defaultOpen", "boolean", "false", "Controlled / initial state"],
            ["onOpenChange", "(open: boolean) => void", "", ""],
            ["FabMenuTrigger icon, closeIcon", "IconName", '"add", "close"', "Closed and open glyphs"],
            ["FabMenuTrigger label", "string", '"Actions"', "Accessible name"],
            ["FabMenuItem icon", "IconName", "required", ""],
            ["FabMenuItem onSelect", "(event: Event) => void", "", "preventDefault() keeps the menu open"],
            ["FabMenuItem disabled", "boolean", "false", "Skipped by the arrow keys"],
          ]}
        />
      </Section>
    </>
  )
}
