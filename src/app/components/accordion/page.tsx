"use client"

import * as React from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/registry/velvet/ui/accordion"
import { Switch } from "@/registry/velvet/ui/switch"
import { Badge } from "@/registry/velvet/ui/badge"
import { Code, PageHeader, Preview, PropsTable, Section } from "@/components/docs/primitives"

const FAQ = [
  ["How long does shipping take?", "Orders leave the studio within a day. Delivery takes two to four working days in the EU and the UK, and five to eight elsewhere. You get a tracking link as soon as it ships."],
  ["Can I return something I've opened?", "Yes, for 30 days. Unused items go back for a full refund; if something is faulty we pay the postage and send a replacement."],
  ["Do you ship internationally?", "To most countries. Duties are shown at checkout, so there are no surprises at the door."],
  ["How do I look after the linen?", "Wash it cold with like colors and dry it flat or on low heat. It softens with every wash."],
]

function Setting({ label, defaultChecked }: { label: string; defaultChecked?: boolean }) {
  const id = React.useId()
  return (
    <div className="flex items-center justify-between gap-4 py-1.5">
      <label htmlFor={id} className="type-body-md text-foreground">
        {label}
      </label>
      <Switch id={id} defaultChecked={defaultChecked} />
    </div>
  )
}

export default function AccordionPage() {
  const [open, setOpen] = React.useState<string[]>(["notifications"])

  return (
    <>
      <PageHeader eyebrow="Component 33" title="Accordion">
        A stack of headings that each open to show more. Use it for questions and answers, or for settings that
        would otherwise make a long page. Built on Radix, with shadcn&apos;s API.
      </PageHeader>

      <Section title="Install">
        <Code>{`npx shadcn@latest add @velvet/accordion`}</Code>
      </Section>

      <Section
        title="Plain, one open at a time"
        description={'type="single" with collapsible lets the open item close again. Rows sit on the surface and are spaced apart, with no divider lines.'}
      >
        <Preview className="justify-center">
          <Accordion type="single" collapsible defaultValue="item-0" className="w-full max-w-xl">
            {FAQ.map(([q, a], i) => (
              <AccordionItem key={q} value={`item-${i}`}>
                <AccordionTrigger>{q}</AccordionTrigger>
                <AccordionContent>{a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Preview>
      </Section>

      <Section
        title="Segmented, several open"
        description={'variant="segmented" puts each item on its own tile, like List. The open tile is a touch more prominent and rounds all round. type="multiple" lets any number stay open; icon and description add a leading symbol and a second line.'}
      >
        <Preview className="justify-center">
          <Accordion type="multiple" variant="segmented" value={open} onValueChange={setOpen} className="w-full max-w-xl">
            <AccordionItem value="notifications">
              <AccordionTrigger icon="notifications" description="Alerts, sounds and quiet hours">
                Notifications
              </AccordionTrigger>
              <AccordionContent inset>
                <Setting label="Push notifications" defaultChecked />
                <Setting label="Email summary" />
                <Setting label="Quiet hours, 22:00 to 7:00" defaultChecked />
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="display">
              <AccordionTrigger icon="palette" description="Theme, text size, motion">
                Display
              </AccordionTrigger>
              <AccordionContent inset>
                <Setting label="Dark theme" />
                <Setting label="Reduce motion" />
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="privacy">
              <AccordionTrigger icon="lock" description="Sign-in, devices, data">
                <span className="flex items-center gap-2">
                  Privacy and security <Badge size="sm" variant="success">Good</Badge>
                </span>
              </AccordionTrigger>
              <AccordionContent inset>
                <Setting label="Two-step verification" defaultChecked />
                <Setting label="Sign out other devices" />
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="storage">
              <AccordionTrigger icon="cloud" description="18.4 GB of 25 GB used">
                Storage
              </AccordionTrigger>
              <AccordionContent inset>Free up space by clearing the cache, or move older files to the archive.</AccordionContent>
            </AccordionItem>
          </Accordion>
        </Preview>
      </Section>

      <Section
        title="Plain, with icons"
        description="The plain variant takes icons and descriptions too. Keyboard: Tab to a heading, Enter or Space to open it, Up and Down to move between headings, Home and End to jump."
      >
        <Preview className="justify-center">
          <Accordion type="single" collapsible className="w-full max-w-xl">
            <AccordionItem value="a">
              <AccordionTrigger icon="local_shipping" description="Free over 60 euros">Delivery</AccordionTrigger>
              <AccordionContent inset>Standard delivery is free on orders over 60 euros, otherwise 4.50.</AccordionContent>
            </AccordionItem>
            <AccordionItem value="b">
              <AccordionTrigger icon="redeem" description="Wrapping and a note">Gifts</AccordionTrigger>
              <AccordionContent inset>Add recycled wrapping and a handwritten note at checkout.</AccordionContent>
            </AccordionItem>
            <AccordionItem value="c">
              <AccordionTrigger icon="support_agent" description="Mon to Fri, 9:00 to 17:00" disabled>Talk to us</AccordionTrigger>
              <AccordionContent inset>Closed.</AccordionContent>
            </AccordionItem>
          </Accordion>
        </Preview>
      </Section>

      <Section title="Usage">
        <Code>{`import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

// shadcn's API
<Accordion type="single" collapsible>
  <AccordionItem value="shipping">
    <AccordionTrigger>How long does shipping take?</AccordionTrigger>
    <AccordionContent>Two to four working days.</AccordionContent>
  </AccordionItem>
</Accordion>

// Velvet: tiles, an icon and a description
<Accordion type="multiple" variant="segmented">
  <AccordionItem value="display">
    <AccordionTrigger icon="palette" description="Theme, text size">Display</AccordionTrigger>
    <AccordionContent inset>...</AccordionContent>
  </AccordionItem>
</Accordion>`}</Code>
      </Section>

      <Section title="Props">
        <PropsTable
          note="Radix's own props (type, collapsible, value, defaultValue, onValueChange) work as is"
          rows={[
            ["Accordion variant", '"plain" | "segmented"', '"plain"', "Segmented: each item on its own tile, 2px apart"],
            ["Accordion type", '"single" | "multiple"', "", "Required, from Radix"],
            ["AccordionTrigger icon", "IconName", "", "A leading Material Symbol"],
            ["AccordionTrigger description", "ReactNode", "", "A quieter line under the title"],
            ["AccordionContent inset", "boolean", "false", "Indent to line up with the title when the trigger has an icon"],
            ["AccordionItem disabled", "boolean", "false", "From Radix"],
          ]}
        />
      </Section>
    </>
  )
}
