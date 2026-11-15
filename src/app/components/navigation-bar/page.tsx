"use client"

import * as React from "react"
import { NavigationBar, NavigationBarItem } from "@/registry/velvet/ui/navigation-bar"
import { type IconName } from "@/registry/velvet/ui/icon"
import { Code, PageHeader, Preview, PropsTable, Section } from "@/components/docs/primitives"

const TABS: { id: string; icon: IconName; label: string; badge?: number | boolean }[] = [
  { id: "home", icon: "home", label: "Home" },
  { id: "search", icon: "search", label: "Search" },
  { id: "library", icon: "library_music", label: "Library", badge: 3 },
  { id: "profile", icon: "person", label: "Profile", badge: true },
]

const SCREENS: Record<string, { title: string; lines: string[] }> = {
  home: { title: "Good evening", lines: ["Made for you", "Recently played", "New releases"] },
  search: { title: "Search", lines: ["Browse all", "Podcasts", "Charts"] },
  library: { title: "Library", lines: ["3 new episodes", "Playlists", "Albums"] },
  profile: { title: "Profile", lines: ["Account", "Listening history", "Settings"] },
}

function Phone({ inline = false }: { inline?: boolean }) {
  const [active, setActive] = React.useState("home")
  const s = SCREENS[active]
  return (
    <div
      className={
        "flex flex-col overflow-hidden rounded-[2.25rem] border-[6px] border-inverse-surface bg-background shadow-e3 dark:border-surface-container-highest " +
        (inline ? "h-[22rem] w-full max-w-2xl" : "h-[36rem] w-[19rem]")
      }
    >
      <div className="flex flex-1 flex-col gap-4 overflow-hidden p-5">
        <p className="pt-4 type-headline-sm">{s.title}</p>
        {s.lines.map((l, i) => (
          <div key={l} className="flex items-center gap-3">
            <span className="size-12 shrink-0 rounded-xl" style={{ background: `color-mix(in oklab, var(--brand) ${30 - i * 8}%, var(--surface-container-high))` }} />
            <span className="flex flex-col gap-1.5">
              <span className="type-title-sm">{l}</span>
              <span className="h-2 w-24 rounded-full bg-surface-container-high" />
            </span>
          </div>
        ))}
      </div>
      <NavigationBar aria-label="Example app" inline={inline}>
        {TABS.map((t) => (
          <NavigationBarItem key={t.id} icon={t.icon} label={t.label} badge={t.badge} active={active === t.id} onClick={() => setActive(t.id)} />
        ))}
      </NavigationBar>
    </div>
  )
}

export default function NavigationBarPage() {
  return (
    <>
      <PageHeader eyebrow="Component 23" title="Navigation Bar">
        Bottom navigation for phones, with three to five destinations. The phone sibling of the Navigation Rail: same
        items, same pill that grows from the center, same icons that fill in.
      </PageHeader>

      <Section title="Install">
        <Code>{`npx shadcn@latest add @velvet/navigation-bar`}</Code>
      </Section>

      <Section title="Stacked" description="The default: icon in a pill, label below, 64px tall plus the home-indicator inset. Badges show a count or a dot.">
        <Preview className="justify-center py-8">
          <Phone />
        </Preview>
      </Section>

      <Section title="Inline" description="Icon and label side by side, for wider windows such as a large phone in landscape.">
        <Preview className="justify-center py-8">
          <Phone inline />
        </Preview>
      </Section>

      <Section
        title="Rail or bar"
        description="Use the bar on compact windows and the rail from medium up. Both take the same items, so switching is a breakpoint."
      >
        <Code>{`const items = destinations.map((d) => ({ icon: d.icon, label: d.label, href: d.href, active: pathname === d.href }))

<NavigationRail aria-label="Main" className="hidden md:flex">
  {items.map((i) => <NavigationRailItem key={i.href} {...i} />)}
</NavigationRail>
<NavigationBar aria-label="Main" className="md:hidden">
  {items.map((i) => <NavigationBarItem key={i.href} {...i} />)}
</NavigationBar>`}</Code>
      </Section>

      <Section title="Usage" description="Pin it to the bottom of the viewport. If you use snackbars, give the host an offset so they clear the bar.">
        <Code>{`import { NavigationBar, NavigationBarItem } from "@/components/ui/navigation-bar"

<NavigationBar aria-label="Main" className="fixed inset-x-0 bottom-0">
  <NavigationBarItem asChild icon="home" label="Home" active={pathname === "/"}>
    <Link href="/" />
  </NavigationBarItem>
  <NavigationBarItem href="/library" icon="library_music" label="Library" badge={3} />
</NavigationBar>

<Snackbars offset={80} />`}</Code>
      </Section>

      <Section title="Props">
        <PropsTable
          rows={[
            ["NavigationBar inline", "boolean", "false", "Icon and label side by side"],
            ["Item icon / label", "IconName / string", "", "Required"],
            ["Item active", "boolean", "false", "Pill, filled icon, aria-current=page"],
            ["Item badge", "number | boolean", "", "A count (99+ max), or a dot"],
            ["Item href / asChild", "string / boolean", "", "Link instead of button"],
            ["Item disabled", "boolean", "false", ""],
          ]}
        />
      </Section>
    </>
  )
}
