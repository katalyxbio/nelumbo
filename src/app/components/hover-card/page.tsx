"use client"

import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/registry/nelumbo/ui/hover-card"
import { Avatar, AvatarBadge } from "@/registry/nelumbo/ui/avatar"
import { Badge } from "@/registry/nelumbo/ui/badge"
import { Button } from "@/registry/nelumbo/ui/button"
import { Icon } from "@/registry/nelumbo/ui/icon"
import { PEOPLE } from "@/components/docs/people"
import { Code, PageHeader, Preview, PropsTable, Section } from "@/components/docs/primitives"

const MAYA = PEOPLE[0]

export default function HoverCardPage() {
  return (
    <>
      <PageHeader eyebrow="Component 46" title="Hover Card">
        A preview that appears when someone hovers or focuses a link. It springs out of the trigger and leaves when
        they move away. It only previews: never put the only way to do something in it.
      </PageHeader>

      <Section title="Install">
        <Code>{`npx shadcn@latest add @nelumbo/hover-card`}</Code>
      </Section>

      <Section title="Profile" description="Hover the name or tab to it. A card with an avatar, a status and a short bio.">
        <Preview>
          <p className="type-body-lg">
            Reviewed by{" "}
            <HoverCard>
              <HoverCardTrigger asChild>
                <a href="#maya" className="rounded-sm font-medium underline underline-offset-4 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
                  @maya
                </a>
              </HoverCardTrigger>
              <HoverCardContent className="w-80">
                <div className="flex gap-4">
                  <Avatar name={MAYA.name} src={MAYA.src} size="lg">
                    <AvatarBadge status="online" />
                  </Avatar>
                  <div className="flex min-w-0 flex-col gap-1">
                    <p className="type-title-md">{MAYA.name}</p>
                    <p className="type-body-sm text-muted-foreground">@maya</p>
                    <p className="pt-1 type-body-md">Leads product design and keeps the component library tidy.</p>
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      <Badge variant="brand">Design</Badge>
                      <Badge variant="secondary">Admin</Badge>
                    </div>
                    <p className="flex items-center gap-1.5 pt-2 type-body-sm text-muted-foreground">
                      <Icon name="calendar_month" size={18} />
                      Joined March 2023
                    </p>
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>{" "}
            and shipped on Friday.
          </p>
        </Preview>
      </Section>

      <Section title="Link preview" description="A title, a line of context and where it goes. Placement follows side and align and flips near edges.">
        <Preview>
          <HoverCard>
            <HoverCardTrigger asChild>
              <Button asChild variant="link">
                <a href="#motion">nelumbo.design/motion</a>
              </Button>
            </HoverCardTrigger>
            <HoverCardContent side="top" className="w-80 overflow-hidden p-0">
              <div aria-hidden className="h-24 bg-linear-to-br from-brand-container to-surface-container-high" />
              <div className="flex flex-col gap-1 p-4">
                <p className="type-title-md">Motion principles</p>
                <p className="type-body-md text-muted-foreground">
                  How Nelumbo uses springs to make state changes feel physical, and when to hold still.
                </p>
                <p className="flex items-center gap-1.5 pt-1 type-label-md text-muted-foreground">
                  <Icon name="public" size={16} />
                  nelumbo.design
                </p>
              </div>
            </HoverCardContent>
          </HoverCard>
        </Preview>
      </Section>

      <Section title="Placement" description="Radix props pass through.">
        <Preview>
          {(["top", "right", "bottom", "left"] as const).map((side) => (
            <HoverCard key={side}>
              <HoverCardTrigger asChild>
                <Button variant="secondary" className="capitalize">
                  {side}
                </Button>
              </HoverCardTrigger>
              <HoverCardContent side={side} className="w-56">
                Opens on the {side}, growing out of the trigger.
              </HoverCardContent>
            </HoverCard>
          ))}
        </Preview>
      </Section>

      <Section title="Usage">
        <Code>{`import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card"

<HoverCard>
  <HoverCardTrigger asChild><a href="/maya">@maya</a></HoverCardTrigger>
  <HoverCardContent>
    Maya Kowalski, Product design
  </HoverCardContent>
</HoverCard>`}</Code>
      </Section>

      <Section title="Props" description="Other props go to Radix HoverCard (open, onOpenChange, side, alignOffset…). Opens on hover and keyboard focus; Escape closes.">
        <PropsTable
          rows={[
            ["openDelay", "number", "250", "ms before opening (HoverCard)"],
            ["closeDelay", "number", "120", "ms before closing (HoverCard)"],
            ["align", '"start" | "center" | "end"', '"center"', ""],
            ["sideOffset", "number", "8", "Gap to the trigger"],
            ["collisionPadding", "number", "8", "Keeps it this far from the viewport edge"],
          ]}
        />
      </Section>
    </>
  )
}
