"use client"

import * as React from "react"
import {
  Sheet,
  SheetBody,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/registry/velvet/ui/sheet"
import { Button } from "@/registry/velvet/ui/button"
import { ChipGroup, FilterChip } from "@/registry/velvet/ui/chip"
import { Slider } from "@/registry/velvet/ui/slider"
import { Switch } from "@/registry/velvet/ui/switch"
import { Checkbox } from "@/registry/velvet/ui/checkbox"
import { Icon, type IconName } from "@/registry/velvet/ui/icon"
import { Code, PageHeader, Preview, PropsTable, Section } from "@/components/docs/primitives"

const SHARE: { icon: IconName; label: string }[] = [
  { icon: "link", label: "Copy link" },
  { icon: "mail", label: "Email" },
  { icon: "chat", label: "Message" },
  { icon: "qr_code_2", label: "QR code" },
  { icon: "download", label: "Download" },
  { icon: "print", label: "Print" },
]

function Filters() {
  const [price, setPrice] = React.useState([40, 160])
  return (
    <>
      <SheetBody className="flex flex-col gap-7 py-1">
        <div className="flex flex-col gap-3">
          <p className="type-title-sm">Cuisine</p>
          <ChipGroup aria-label="Cuisine">
            {["Italian", "Japanese", "Mexican", "Indian", "Thai", "Greek"].map((c, i) => (
              <FilterChip key={c} defaultSelected={i === 1}>
                {c}
              </FilterChip>
            ))}
          </ChipGroup>
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-baseline justify-between">
            <p className="type-title-sm">Price per person</p>
            <span className="type-label-lg text-muted-foreground tabular-nums">
              ${price[0]} to ${price[1]}
            </span>
          </div>
          <Slider aria-label="Price per person" min={0} max={200} step={10} value={price} onValueChange={setPrice} minStepsBetweenThumbs={1} formatValue={(v) => `$${v}`} />
        </div>
        <div className="flex flex-col gap-3">
          <p className="type-title-sm">Features</p>
          {["Outdoor seating", "Wheelchair accessible", "Takes reservations"].map((f, i) => (
            <label key={f} className="flex items-center gap-3 type-body-md">
              <Checkbox defaultChecked={i === 1} />
              {f}
            </label>
          ))}
        </div>
        <label className="flex items-center justify-between gap-4">
          <span className="flex flex-col">
            <span className="type-title-sm">Open now</span>
            <span className="type-body-sm text-muted-foreground">Hide places that are closed</span>
          </span>
          <Switch defaultChecked />
        </label>
      </SheetBody>
      <SheetFooter>
        <SheetClose asChild>
          <Button variant="ghost">Clear all</Button>
        </SheetClose>
        <SheetClose asChild>
          <Button>Show 24 places</Button>
        </SheetClose>
      </SheetFooter>
    </>
  )
}

export default function SheetPage() {
  return (
    <>
      <PageHeader eyebrow="Component · 16" title="Sheet">
        A panel that slides in from an edge for supporting content: filters, details, settings, share options. Bottom
        sheets can be dragged down to dismiss.
      </PageHeader>

      <Section title="Install">
        <Code>{`npx shadcn@latest add @velvet/sheet`}</Code>
      </Section>

      <Section title="Sides" description="Right is the default. The inner corners are rounded so the sheet reads as a layer above the page.">
        <Preview>
          {(["right", "left", "top", "bottom"] as const).map((side) => (
            <Sheet key={side}>
              <SheetTrigger asChild>
                <Button variant="outline" className="capitalize">
                  {side}
                </Button>
              </SheetTrigger>
              <SheetContent side={side}>
                <SheetHeader>
                  <SheetTitle className="capitalize">{side} sheet</SheetTitle>
                  <SheetDescription>Escape, the close button or a click on the scrim dismisses it.</SheetDescription>
                </SheetHeader>
                <SheetFooter>
                  <SheetClose asChild>
                    <Button>Done</Button>
                  </SheetClose>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          ))}
        </Preview>
      </Section>

      <Section title="Filters" description="A side sheet holding a full form: chips, a range slider, checkboxes and a switch. The middle scrolls; the footer stays put.">
        <Preview>
          <Sheet>
            <SheetTrigger asChild>
              <Button>
                <Icon name="tune" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
                <SheetDescription>Restaurants near Lisbon</SheetDescription>
              </SheetHeader>
              <Filters />
            </SheetContent>
          </Sheet>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="secondary">Floating</Button>
            </SheetTrigger>
            <SheetContent floating>
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
                <SheetDescription>Floating: 8px off the edge, every corner rounded.</SheetDescription>
              </SheetHeader>
              <Filters />
            </SheetContent>
          </Sheet>
        </Preview>
      </Section>

      <Section
        title="Bottom sheet"
        description="Bottom sheets have a drag handle instead of a close button. Drag down past a third of the height, or flick, to dismiss; otherwise it springs back. Tapping the handle closes it too."
      >
        <Preview>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline">
                <Icon name="share" />
                Share
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom">
              <SheetHeader className="items-center text-center">
                <SheetTitle>Share “Quarterly update”</SheetTitle>
                <SheetDescription>Anyone with the link can view</SheetDescription>
              </SheetHeader>
              <div className="grid grid-cols-3 gap-2 pb-2 sm:grid-cols-6">
                {SHARE.map((s) => (
                  <SheetClose key={s.label} asChild>
                    <button className="state-layer flex cursor-pointer flex-col items-center gap-2 rounded-xl py-3 outline-none focus-visible:outline-2 focus-visible:outline-ring">
                      <span className="grid size-12 place-items-center rounded-full bg-secondary text-secondary-foreground">
                        <Icon name={s.icon} size={22} />
                      </span>
                      <span className="type-label-md">{s.label}</span>
                    </button>
                  </SheetClose>
                ))}
              </div>
            </SheetContent>
          </Sheet>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="secondary">Floating bottom</Button>
            </SheetTrigger>
            <SheetContent side="bottom" floating>
              <SheetHeader>
                <SheetTitle>Floating bottom sheet</SheetTitle>
                <SheetDescription>Rounded on every corner, 8px above the edge. Good on large phones.</SheetDescription>
              </SheetHeader>
              <SheetFooter>
                <SheetClose asChild>
                  <Button>Got it</Button>
                </SheetClose>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </Preview>
      </Section>

      <Section title="Usage">
        <Code>{`import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetBody, SheetFooter, SheetClose } from "@/components/ui/sheet"

<Sheet>
  <SheetTrigger asChild><Button>Filters</Button></SheetTrigger>
  <SheetContent side="right">
    <SheetHeader><SheetTitle>Filters</SheetTitle></SheetHeader>
    <SheetBody>…</SheetBody>
    <SheetFooter><Button>Show results</Button></SheetFooter>
  </SheetContent>
</Sheet>`}</Code>
      </Section>

      <Section title="Props" description="Sheet, SheetTrigger and SheetClose take Radix Dialog props (open, onOpenChange…).">
        <PropsTable
          rows={[
            ["side", '"right" | "left" | "top" | "bottom"', '"right"', ""],
            ["floating", "boolean", "false", "8px off the edge, all corners rounded"],
            ["showCloseButton", "boolean", "true (false for bottom)", "Bottom sheets use the drag handle"],
            ["SheetBody", "", "", "The scrolling middle"],
          ]}
        />
      </Section>
    </>
  )
}
