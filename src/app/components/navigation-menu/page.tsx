"use client"

import * as React from "react"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuFeatured,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuRichLink,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/registry/velvet/ui/navigation-menu"
import { Icon, type IconName } from "@/registry/velvet/ui/icon"
import { Code, PageHeader, Preview, PropsTable, Section } from "@/components/docs/primitives"

type Entry = { icon: IconName; title: string; description: string }

const PRODUCTS: Entry[] = [
  { icon: "bolt", title: "Automations", description: "Run work on a schedule or a trigger." },
  { icon: "monitoring", title: "Analytics", description: "See what changed, and why." },
  { icon: "inbox", title: "Inbox", description: "One place for every conversation." },
  { icon: "extension", title: "Integrations", description: "Connect the tools you already use." },
]

const SOLUTIONS: Entry[] = [
  { icon: "rocket_launch", title: "Startups", description: "Ship the first version faster." },
  { icon: "apartment", title: "Enterprise", description: "Controls and audit for large teams." },
  { icon: "school", title: "Education", description: "Free for classrooms and clubs." },
]

const RESOURCES: Entry[] = [
  { icon: "menu_book", title: "Guides", description: "Step by step, start to finish." },
  { icon: "forum", title: "Community", description: "Ask questions, share what you built." },
  { icon: "support_agent", title: "Support", description: "Talk to a person within the hour." },
  { icon: "newspaper", title: "Changelog", description: "Everything that shipped, by week." },
]

function Links({ items }: { items: Entry[] }) {
  return (
    <ul className="grid content-start gap-1">
      {items.map((e) => (
        <li key={e.title}>
          <NavigationMenuRichLink asChild icon={e.icon} title={e.title} description={e.description}>
            <a href="#" onClick={(ev) => ev.preventDefault()} />
          </NavigationMenuRichLink>
        </li>
      ))}
    </ul>
  )
}

function SiteMenu({ viewport = true, indicator = false, current = "Pricing", label }: { viewport?: boolean; indicator?: boolean; current?: string; label: string }) {
  const link = (label: string) => (
    <NavigationMenuItem>
      <NavigationMenuLink asChild active={current === label} className={navigationMenuTriggerStyle()}>
        <a href="#" onClick={(e) => e.preventDefault()}>
          {label}
        </a>
      </NavigationMenuLink>
    </NavigationMenuItem>
  )
  return (
    <NavigationMenu viewport={viewport} aria-label={label}>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Products</NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="grid gap-2 sm:w-[37rem] sm:grid-cols-[1fr_13rem]">
              <Links items={PRODUCTS} />
              <NavigationMenuFeatured asChild icon="stars" title="Velvet 2.0" description="Smarter automations, a new inbox, and a calmer dashboard.">
                <a href="#" onClick={(e) => e.preventDefault()} />
              </NavigationMenuFeatured>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Solutions</NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="grid sm:w-[22rem]">
              <Links items={SOLUTIONS} />
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Resources</NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="grid gap-2 sm:w-[32rem] sm:grid-cols-2">
              <Links items={RESOURCES.slice(0, 2)} />
              <Links items={RESOURCES.slice(2)} />
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
        {link("Pricing")}
        {link("Docs")}
        {indicator && <NavigationMenuIndicator />}
      </NavigationMenuList>
    </NavigationMenu>
  )
}

export default function NavigationMenuPage() {
  return (
    <>
      <PageHeader eyebrow="Component 54" title="Navigation Menu">
        The main navigation of a site: a row of links, some of which open a panel of choices. Hover, click or
        use the arrow keys; the raised pill follows you, and the panel reshapes itself to fit what it holds.
      </PageHeader>

      <Section title="Install">
        <Code>{`npx shadcn@latest add @velvet/navigation-menu`}</Code>
      </Section>

      <Section
        title="Product site header"
        description="Three panels and two plain links. Move between Products, Solutions and Resources: the surface springs to the size of the next panel and its content slides in from the side you came from. Pricing is the current page (aria-current)."
      >
        <Preview className="min-h-[46rem] items-start sm:min-h-[30rem] justify-center">
          <header className="flex w-full flex-col items-center gap-4 sm:flex-row sm:justify-between">
            <span className="flex items-center gap-2 type-title-md">
              <span className="flex size-9 items-center justify-center rounded-full bg-inverse-surface text-inverse-foreground [--icon-size:20px]">
                <Icon name="deployed_code" fill />
              </span>
              Acme
            </span>
            <SiteMenu label="Primary" />
            <span className="hidden w-24 sm:block" aria-hidden />
          </header>
        </Preview>
      </Section>

      <Section
        title="Panels under their own items"
        description='viewport={false} drops the shared surface: each panel is its own popover under its item, which suits a short menu. Add NavigationMenuIndicator for a small notch that springs between triggers.'
      >
        <Preview className="min-h-[42rem] items-start sm:min-h-[24rem] justify-start">
          <SiteMenu viewport={false} current="Docs" label="Secondary" />
        </Preview>
      </Section>

      <Section
        title="Keyboard"
        description="Tab moves into the menu and then out of it. Left and Right move between triggers and links, Enter or Space opens a panel, Tab moves into it and Tab and the arrow keys move through its links, and Escape closes the panel and returns to its trigger."
      >
        <Preview className="min-h-[46rem] items-start sm:min-h-[28rem] justify-center">
          <SiteMenu indicator label="Keyboard demo" />
        </Preview>
      </Section>

      <Section title="Usage">
        <Code>{`import {
  NavigationMenu, NavigationMenuContent, NavigationMenuFeatured, NavigationMenuItem,
  NavigationMenuLink, NavigationMenuList, NavigationMenuRichLink,
  NavigationMenuTrigger, navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"

<NavigationMenu>
  <NavigationMenuList>
    <NavigationMenuItem>
      <NavigationMenuTrigger>Products</NavigationMenuTrigger>
      <NavigationMenuContent>
        <div className="grid gap-2 sm:w-[37rem] sm:grid-cols-[1fr_13rem]">
          <ul className="grid gap-1">
            <li>
              <NavigationMenuRichLink asChild icon="bolt" title="Automations" description="Run work on a schedule.">
                <Link href="/automations" />
              </NavigationMenuRichLink>
            </li>
          </ul>
          <NavigationMenuFeatured asChild icon="stars" title="Velvet 2.0" description="What's new.">
            <Link href="/new" />
          </NavigationMenuFeatured>
        </div>
      </NavigationMenuContent>
    </NavigationMenuItem>
    <NavigationMenuItem>
      <NavigationMenuLink asChild active={pathname === "/pricing"} className={navigationMenuTriggerStyle()}>
        <Link href="/pricing">Pricing</Link>
      </NavigationMenuLink>
    </NavigationMenuItem>
  </NavigationMenuList>
</NavigationMenu>`}</Code>
        <div className="flex flex-col gap-8 pt-4">
          <PropsTable
            rows={[
              ["viewport", "boolean", "true", "NavigationMenu: render panels in one shared surface that morphs between them; false opens each under its item"],
              ["value / defaultValue / onValueChange", "string", "", "Radix: the open item, controlled or not"],
              ["delayDuration / skipDelayDuration", "number", "200 / 300", "Radix: hover open delay, and the window in which moving to another trigger opens it at once"],
              ["active", "boolean", "false", "NavigationMenuLink: the current page; sets aria-current and an inverse fill"],
              ["icon", "IconName", "", "NavigationMenuRichLink and NavigationMenuFeatured: the Material Symbol"],
              ["title / description", "ReactNode", "", "NavigationMenuRichLink and NavigationMenuFeatured: the text"],
              ["asChild", "boolean", "false", "Link parts: render your router's Link as the only child"],
            ]}
            note="The list, items, triggers, content, link, indicator and viewport pass every other Radix prop through. Below the sm breakpoint the menu fills the width, the track wraps, and panels become a single column."
          />
        </div>
      </Section>
    </>
  )
}
