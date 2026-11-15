"use client"

import * as React from "react"
import { List, ListDivider, ListItem, ListSubheader } from "@/registry/velvet/ui/list"
import { Avatar } from "@/registry/velvet/ui/avatar"
import { Badge } from "@/registry/velvet/ui/badge"
import { Switch } from "@/registry/velvet/ui/switch"
import { Checkbox } from "@/registry/velvet/ui/checkbox"
import { IconButton } from "@/registry/velvet/ui/icon-button"
import { Card } from "@/registry/velvet/ui/card"
import { PEOPLE } from "@/components/docs/people"
import { Code, PageHeader, Preview, PropsTable, Section } from "@/components/docs/primitives"

const THREADS = [
  { who: PEOPLE[0], text: "Can we move the review to Thursday? The prototype needs one more pass.", time: "9:41", unread: 2 },
  { who: PEOPLE[1], text: "New easing curves are in the motion doc, have a look when you can.", time: "8:15", unread: 0 },
  { who: PEOPLE[6], text: "Copy for the onboarding screens is ready for review.", time: "Yesterday", unread: 0 },
  { who: PEOPLE[3], text: "Shipped the fix for the date picker. Let me know if it still drifts.", time: "Mon", unread: 0 },
]

const TASKS = ["Review the spring palette", "Write release notes", "Update the icon subset", "Book the design crit room"]

export default function ListPage() {
  const [open, setOpen] = React.useState(0)
  const [settings, setSettings] = React.useState({ wifi: true, bluetooth: false, dnd: true })
  const [done, setDone] = React.useState<string[]>([TASKS[2]])

  return (
    <>
      <PageHeader eyebrow="Component 30" title="List">
        Rows of related things: people, messages, settings, files. Each row has a title with room on either side
        for an avatar or icon and for a time, a switch or an arrow. A whole row can be one link or button.
      </PageHeader>

      <Section title="Install">
        <Code>{`npx shadcn@latest add @velvet/list`}</Code>
      </Section>

      <Section
        title="Messages"
        description="Avatars lead, a time and a count trail. Each row is a button (onClick), so the whole row is one target; screen readers hear the name, then the message. The open conversation is selected."
      >
        <Preview className="justify-center">
          <Card variant="outlined" className="w-full max-w-md gap-0 p-2">
            <List aria-label="Conversations" className="py-0">
              {THREADS.map((t, i) => (
                <ListItem
                  key={t.who.name}
                  leading={<Avatar src={t.who.src} name={t.who.name} color="auto" />}
                  description={t.text}
                  meta={t.time}
                  trailing={t.unread ? <Badge size="sm" className="min-w-5 px-1.5" aria-label={`${t.unread} unread`}>{t.unread}</Badge> : undefined}
                  selected={open === i}
                  onClick={() => setOpen(i)}
                  align="top"
                >
                  {t.who.name}
                </ListItem>
              ))}
            </List>
          </Card>
        </Preview>
      </Section>

      <Section
        title="Segmented"
        description='variant="segmented" puts each row on its own tile, 2px apart, with the group&apos;s outer corners rounded. Subheaders and dividers start a new group. Rows can link somewhere (href) or hold a control.'
      >
        <Preview className="justify-center">
          <List variant="segmented" aria-label="Settings" className="w-full max-w-md">
            <ListSubheader>Connections</ListSubheader>
            <ListItem icon="wifi" description={settings.wifi ? "Studio 5G" : "Off"} trailing={<Switch aria-label="Wi-Fi" checked={settings.wifi} onCheckedChange={(v) => setSettings((s) => ({ ...s, wifi: v }))} />}>
              Wi-Fi
            </ListItem>
            <ListItem icon="bluetooth" description={settings.bluetooth ? "On" : "Off"} trailing={<Switch aria-label="Bluetooth" checked={settings.bluetooth} onCheckedChange={(v) => setSettings((s) => ({ ...s, bluetooth: v }))} />}>
              Bluetooth
            </ListItem>
            <ListItem icon="share" href="#" trailingIcon="chevron_right">
              Connected devices
            </ListItem>
            <ListSubheader>Display and sound</ListSubheader>
            <ListItem icon="palette" href="#" description="Dark theme, blue accent" trailingIcon="chevron_right">
              Display
            </ListItem>
            <ListItem icon="do_not_disturb_on" description="Until 7:00" trailing={<Switch aria-label="Do not disturb" checked={settings.dnd} onCheckedChange={(v) => setSettings((s) => ({ ...s, dnd: v }))} />}>
              Do not disturb
            </ListItem>
            <ListItem icon="volume_up" href="#" meta="70%" trailingIcon="chevron_right">
              Sound
            </ListItem>
            <ListDivider />
            <ListItem icon="info" href="#" description="Version 2.4.0" trailingIcon="chevron_right">
              About
            </ListItem>
          </List>
        </Preview>
      </Section>

      <Section
        title="Selection"
        description="With asChild, the title can be your own element. Here it's the checkbox's label, so a click anywhere on the row ticks it."
      >
        <Preview className="justify-center">
          <List aria-label="Tasks" className="w-full max-w-md">
            {TASKS.map((t, i) => {
              const id = `task-${i}`
              const checked = done.includes(t)
              return (
                <ListItem
                  key={t}
                  leading={<Checkbox id={id} checked={checked} onCheckedChange={(v) => setDone((d) => (v ? [...d, t] : d.filter((x) => x !== t)))} />}
                  asChild
                  trailing={<IconButton icon="more_vert" label={`More for ${t}`} size="sm" />}
                >
                  <label htmlFor={id} className={checked ? "text-muted-foreground line-through" : undefined}>
                    {t}
                  </label>
                </ListItem>
              )
            })}
          </List>
        </Preview>
      </Section>

      <Section title="Plain, with dividers" description="Static rows, with an overline, a description, and an inset divider that starts after the leading slot.">
        <Preview className="justify-center">
          <List aria-label="Team" className="w-full max-w-md">
            {PEOPLE.slice(0, 4).map((p, i) => (
              <React.Fragment key={p.name}>
                {i > 0 && <ListDivider inset />}
                <ListItem leading={<Avatar src={p.src} name={p.name} />} overline={i === 0 ? "Lead" : "Member"} description={p.role} meta={i === 0 ? <Badge variant="brand" size="sm">Owner</Badge> : undefined}>
                  {p.name}
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        </Preview>
      </Section>

      <Section title="Usage">
        <Code>{`import { List, ListDivider, ListItem, ListSubheader } from "@/components/ui/list"

<List variant="segmented">
  <ListSubheader>Connections</ListSubheader>
  <ListItem icon="wifi" description="Studio 5G" trailing={<Switch aria-label="Wi-Fi" />}>Wi-Fi</ListItem>
  <ListItem icon="palette" href="/settings/display" trailingIcon="chevron_right">Display</ListItem>
</List>

// your own link
<ListItem asChild leading={<Avatar name={user.name} />} description={user.email}>
  <Link href={\`/people/\${user.id}\`}>{user.name}</Link>
</ListItem>`}</Code>
      </Section>

      <Section title="Props">
        <PropsTable
          rows={[
            ["List variant", '"plain" | "segmented"', '"plain"', "Segmented: rows on tiles, grouped"],
            ["ListItem children", "ReactNode", "", "The title"],
            ["icon / leading", "IconName / ReactNode", "", "A Material Symbol, or an avatar, image or checkbox"],
            ["overline / description", "ReactNode", "", "Above and below the title; the description clamps to 2 lines"],
            ["meta", "ReactNode", "", "Short trailing text: a time, a count"],
            ["trailing / trailingIcon", "ReactNode / IconName", "", "A control (stays clickable), or an icon"],
            ["href / onClick / asChild", "", "", "Make the row one link or button; asChild for your own"],
            ["selected", "boolean", "false", "Filled, and aria-current"],
            ["disabled", "boolean", "false", ""],
            ["align", '"center" | "top"', '"center"', "Top for long descriptions"],
            ["ListDivider inset", "boolean", "false", "Start after the leading slot"],
          ]}
        />
      </Section>
    </>
  )
}
