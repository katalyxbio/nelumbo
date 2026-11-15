"use client"

import * as React from "react"
import { Popover, PopoverClose, PopoverContent, PopoverDescription, PopoverHeader, PopoverTitle, PopoverTrigger } from "@/registry/velvet/ui/popover"
import { Button } from "@/registry/velvet/ui/button"
import { IconButton } from "@/registry/velvet/ui/icon-button"
import { Input } from "@/registry/velvet/ui/input"
import { Switch } from "@/registry/velvet/ui/switch"
import { Icon } from "@/registry/velvet/ui/icon"
import { Code, PageHeader, Preview, PropsTable, Section } from "@/components/docs/primitives"

const SWATCHES = [
  ["Ink", "oklch(0.25 0 0)"],
  ["Blue", "oklch(0.55 0.18 264)"],
  ["Teal", "oklch(0.6 0.11 190)"],
  ["Green", "oklch(0.62 0.15 150)"],
  ["Amber", "oklch(0.75 0.15 75)"],
  ["Coral", "oklch(0.66 0.17 30)"],
  ["Rose", "oklch(0.6 0.19 0)"],
  ["Violet", "oklch(0.55 0.2 300)"],
]

export default function PopoverPage() {
  const [copied, setCopied] = React.useState(false)
  const [color, setColor] = React.useState(SWATCHES[1])

  return (
    <>
      <PageHeader eyebrow="Component 17" title="Popover">
        A small panel anchored to its trigger, for quick tasks that don&apos;t deserve a dialog. It grows out of the
        trigger on a spring and is dismissed with Escape or a click outside.
      </PageHeader>

      <Section title="Install">
        <Code>{`npx shadcn@latest add @velvet/popover`}</Code>
      </Section>

      <Section title="Share a link" description="A header with a title and a sentence, then the task. Focus moves into the popover and returns to the trigger when it closes.">
        <Preview>
          <Popover onOpenChange={() => setCopied(false)}>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <Icon name="link" />
                Share
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <PopoverHeader>
                <PopoverTitle>Share link</PopoverTitle>
                <PopoverDescription>Anyone with the link can view this board.</PopoverDescription>
              </PopoverHeader>
              <div className="flex items-center gap-2">
                <Input size="sm" label="Link" readOnly defaultValue="velvet.design/b/q4-plan" className="flex-1" />
                <IconButton
                  variant="secondary"
                  icon={copied ? "check" : "content_copy"}
                  label={copied ? "Copied" : "Copy link"}
                  onClick={() => setCopied(true)}
                />
              </div>
              <label className="flex items-center justify-between gap-3 type-body-md">
                Allow comments
                <Switch size="sm" defaultChecked />
              </label>
            </PopoverContent>
          </Popover>
        </Preview>
      </Section>

      <Section title="A small form" description="For a couple of fields that change something in place.">
        <Preview>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="secondary">
                <Icon name="aspect_ratio" />
                Dimensions
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start">
              <PopoverHeader>
                <PopoverTitle>Dimensions</PopoverTitle>
                <PopoverDescription>Set the size of the frame.</PopoverDescription>
              </PopoverHeader>
              <div className="grid grid-cols-2 gap-3">
                <Input size="sm" label="Width" defaultValue="1440" trailing={<span className="type-label-md text-muted-foreground">px</span>} />
                <Input size="sm" label="Height" defaultValue="900" trailing={<span className="type-label-md text-muted-foreground">px</span>} />
              </div>
              <div className="flex justify-end gap-2">
                <PopoverClose asChild>
                  <Button size="sm" variant="ghost">
                    Cancel
                  </Button>
                </PopoverClose>
                <PopoverClose asChild>
                  <Button size="sm">Apply</Button>
                </PopoverClose>
              </div>
            </PopoverContent>
          </Popover>
        </Preview>
      </Section>

      <Section title="Picker" description="Popovers suit pickers: choose, and it closes.">
        <Preview>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <span className="size-4 rounded-full" style={{ background: color[1] }} />
                {color[0]}
                <Icon name="arrow_drop_down" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto">
              <div role="radiogroup" aria-label="Label color" className="grid grid-cols-4 gap-2">
                {SWATCHES.map((s) => (
                  <PopoverClose key={s[0]} asChild>
                    <button
                      role="radio"
                      aria-checked={s[0] === color[0]}
                      aria-label={s[0]}
                      onClick={() => setColor(s)}
                      className="tactile grid size-10 cursor-pointer place-items-center rounded-full text-white inset-ring inset-ring-foreground/15 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                      style={{ background: s[1] }}
                    >
                      {s[0] === color[0] && <Icon name="check" weight={600} />}
                    </button>
                  </PopoverClose>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </Preview>
      </Section>

      <Section title="Placement" description="side and align place it; it flips and shifts to stay on screen.">
        <Preview>
          {(["top", "right", "bottom", "left"] as const).map((side) => (
            <Popover key={side}>
              <PopoverTrigger asChild>
                <Button variant="secondary" className="capitalize">
                  {side}
                </Button>
              </PopoverTrigger>
              <PopoverContent side={side} className="w-56">
                <PopoverDescription>Opens on the {side}, growing out of the trigger.</PopoverDescription>
              </PopoverContent>
            </Popover>
          ))}
        </Preview>
      </Section>

      <Section title="Usage">
        <Code>{`import { Popover, PopoverTrigger, PopoverContent, PopoverHeader, PopoverTitle, PopoverDescription } from "@/components/ui/popover"

<Popover>
  <PopoverTrigger asChild><Button>Share</Button></PopoverTrigger>
  <PopoverContent>
    <PopoverHeader>
      <PopoverTitle>Share link</PopoverTitle>
      <PopoverDescription>Anyone with the link can view.</PopoverDescription>
    </PopoverHeader>
    …
  </PopoverContent>
</Popover>`}</Code>
      </Section>

      <Section title="Props" description="Other props go to Radix Popover (open, onOpenChange, modal, side, alignOffset…).">
        <PropsTable
          rows={[
            ["align", '"start" | "center" | "end"', '"center"', ""],
            ["sideOffset", "number", "6", "Gap to the trigger"],
            ["collisionPadding", "number", "8", "Keeps it this far from the viewport edge"],
          ]}
        />
      </Section>
    </>
  )
}
