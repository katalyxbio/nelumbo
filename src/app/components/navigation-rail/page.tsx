"use client"

import * as React from "react"
import { NavigationRail, NavigationRailFooter, NavigationRailHeader, NavigationRailItem } from "@/registry/velvet/ui/navigation-rail"
import { IconButton } from "@/registry/velvet/ui/icon-button"
import { Fab } from "@/registry/velvet/ui/fab"
import { type IconName } from "@/registry/velvet/ui/icon"
import { Code, PageHeader, Preview, PropsTable, Section } from "@/components/docs/primitives"

const DESTINATIONS: { id: string; icon: IconName; label: string; badge?: number | boolean; description: string }[] = [
  { id: "inbox", icon: "inbox", label: "Inbox", badge: 12, description: "12 unread" },
  { id: "chat", icon: "chat_bubble", label: "Chat", badge: true, description: "#design and 2 more" },
  { id: "meet", icon: "videocam", label: "Meet", description: "Next: 2:30 Standup" },
  { id: "files", icon: "folder", label: "Files", description: "18.4 of 25 GB" },
]

const BLURBS: Record<string, string> = {
  inbox: "12 unread conversations",
  chat: "New messages in #design",
  meet: "No meetings in the next hour",
  files: "Recently opened: Q4 plan, Brand guide",
  settings: "Theme, notifications, account",
}

function AppFrame({ expandable = true, descriptions = false, defaultExpanded = false }: { expandable?: boolean; descriptions?: boolean; defaultExpanded?: boolean }) {
  const [active, setActive] = React.useState("inbox")
  const [expanded, setExpanded] = React.useState(defaultExpanded)
  const current = [...DESTINATIONS, { id: "settings", label: "Settings" }].find((d) => d.id === active)!

  return (
    <div className="flex h-[34rem] w-full overflow-hidden rounded-3xl bg-surface-container-low shadow-e1 dark:bg-surface-container-lowest">
      <NavigationRail aria-label="App" expanded={expanded}>
        <NavigationRailHeader>
          {expandable && (
            <IconButton
              icon={expanded ? "menu_open" : "menu"}
              label={expanded ? "Collapse navigation" : "Expand navigation"}
              aria-expanded={expanded}
              onClick={() => setExpanded((e) => !e)}
            />
          )}
          <Fab icon="edit" label="Compose" extended={expanded} color="brand" />
        </NavigationRailHeader>
        {DESTINATIONS.map((d) => (
          <NavigationRailItem
            key={d.id}
            icon={d.icon}
            label={d.label}
            description={descriptions ? d.description : undefined}
            badge={descriptions ? undefined : d.badge}
            active={active === d.id} onClick={() => setActive(d.id)} />
        ))}
        <NavigationRailFooter>
          <NavigationRailItem icon="settings" label="Settings" active={active === "settings"} onClick={() => setActive("settings")} />
        </NavigationRailFooter>
      </NavigationRail>
      <main className="m-2 ml-0 flex flex-1 flex-col gap-2 rounded-2xl bg-card p-8 dark:bg-surface-container">
        <h3 className="type-headline-sm">{current.label}</h3>
        <p className="type-body-md text-muted-foreground">{BLURBS[active]}</p>
        <div className="mt-6 flex flex-col gap-3">
          {[0.9, 0.7, 0.8, 0.55].map((w, i) => (
            <div key={i} className="h-3 rounded-full bg-surface-container-high" style={{ width: `${w * 100}%` }} />
          ))}
        </div>
      </main>
    </div>
  )
}

export default function NavigationRailPage() {
  return (
    <>
      <PageHeader eyebrow="Component 21" title="Navigation Rail">
        Side navigation for tablets and desktops, with three to seven destinations. The active destination&apos;s pill
        grows out from the center and its icon fills in. Expand it and the labels slide in beside the icons.
      </PageHeader>

      <Section title="Install">
        <Code>{`npx shadcn@latest add @velvet/navigation-rail`}</Code>
      </Section>

      <Section
        title="Collapsed and expanded"
        description="The menu button toggles between the 80px rail and the 220px expanded rail, where each destination is a compact 40px row. The FAB extends with it. Badges show a count or a dot; settings sit in the footer."
      >
        <Preview className="p-3">
          <AppFrame />
        </Preview>
      </Section>

      <Section
        title="With descriptions"
        description="Expanded rows are a compact 40px. Give an item a description and its row grows to 56px to fit the second line; it's hidden while collapsed."
      >
        <Preview className="p-3">
          <AppFrame descriptions defaultExpanded />
        </Preview>
      </Section>

      <Section title="Rail only" description="Without the menu button, for layouts that never expand.">
        <Preview className="p-3">
          <AppFrame expandable={false} />
        </Preview>
      </Section>

      <Section title="Usage" description="Items are buttons with onClick, links with href, or your router's Link with asChild. The active item gets aria-current=page.">
        <Code>{`import { NavigationRail, NavigationRailHeader, NavigationRailItem, NavigationRailFooter } from "@/components/ui/navigation-rail"

<NavigationRail aria-label="Main" expanded={open}>
  <NavigationRailHeader>
    <IconButton icon="menu" label="Menu" onClick={() => setOpen(!open)} />
    <Fab icon="edit" label="Compose" extended={open} />
  </NavigationRailHeader>
  <NavigationRailItem asChild icon="inbox" label="Inbox" badge={12} active={pathname === "/inbox"}>
    <Link href="/inbox" />
  </NavigationRailItem>
  <NavigationRailItem href="/files" icon="folder" label="Files" />
  <NavigationRailFooter>
    <NavigationRailItem href="/settings" icon="settings" label="Settings" />
  </NavigationRailFooter>
</NavigationRail>`}</Code>
      </Section>

      <Section title="Props">
        <PropsTable
          rows={[
            ["NavigationRail expanded", "boolean", "false", "80px or 220px wide"],
            ["Item icon / label", "IconName / string", "", "Required"],
            ["Item active", "boolean", "false", "Pill, filled icon, aria-current=page"],
            ["Item badge", "number | boolean", "", "A count (99+ max), or a dot"],
            ["Item description", "string", "", "Second line when expanded; row grows from 40 to 56px"],
            ["Item href / asChild", "string / boolean", "", "Link instead of button"],
            ["Item disabled", "boolean", "false", ""],
          ]}
        />
      </Section>
    </>
  )
}
