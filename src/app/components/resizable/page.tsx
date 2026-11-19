"use client"

import * as React from "react"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/registry/nelumbo/ui/resizable"
import { List, ListItem } from "@/registry/nelumbo/ui/list"
import { Badge } from "@/registry/nelumbo/ui/badge"
import { Avatar } from "@/registry/nelumbo/ui/avatar"
import { Icon } from "@/registry/nelumbo/ui/icon"
import { PEOPLE } from "@/components/docs/people"
import { Code, PageHeader, Preview, PropsTable, Section } from "@/components/docs/primitives"

function Pane({ children, label }: { children?: React.ReactNode; label: string }) {
  return (
    <div className="flex h-full min-h-0 flex-col items-center justify-center gap-1 p-4 text-center">
      <p className="type-title-sm">{label}</p>
      {children && <p className="type-body-sm text-muted-foreground">{children}</p>}
    </div>
  )
}

const FOLDERS = [
  { icon: "inbox", name: "Inbox", count: 3 },
  { icon: "star", name: "Starred", count: 0 },
  { icon: "send", name: "Sent", count: 0 },
  { icon: "draft", name: "Drafts", count: 1 },
  { icon: "delete", name: "Trash", count: 0 },
] as const

const MAILS = [
  { who: PEOPLE[0], subject: "Review moved to Thursday", body: "The prototype needs one more pass before we show it. Can everyone confirm Thursday at 10?" },
  { who: PEOPLE[1], subject: "New easing curves", body: "The spring presets are in the motion doc. None of them overshoot now; the quick one still feels lively." },
  { who: PEOPLE[2], subject: "Icon subset", body: "The generated subset now covers every symbol used in the docs. Nothing is missing in dark mode." },
  { who: PEOPLE[3], subject: "Date picker fix", body: "Shipped the fix for the drifting header. Let me know if you still see it on narrow screens." },
]

export default function ResizablePage() {
  const [sizes, setSizes] = React.useState<number[]>([30, 70])
  const [open, setOpen] = React.useState(0)
  const mail = MAILS[open]

  return (
    <>
      <PageHeader eyebrow="Component 53" title="Resizable">
        Panels the person can resize by dragging a handle or with the arrow keys: an editor beside its preview, a
        sidebar, a mail list over a reading pane. There is no divider line. The panels are tonal surfaces with a
        few pixels of background between them, and the handle is a small grip that grows and turns primary when you
        reach for it.
      </PageHeader>

      <Section title="Install">
        <Code>{`npx shadcn@latest add @nelumbo/resizable`}</Code>
      </Section>

      <Section
        title="Horizontal"
        description="Drag the grip, or Tab to it and use the arrow keys (Home and End go to the limits). withHandle keeps the grip visible; without it the gap is quiet until you hover or focus it."
      >
        <Preview className="block">
          <div className="h-44">
          <ResizablePanelGroup direction="horizontal" onLayout={setSizes}>
            <ResizablePanel defaultSize={30} minSize={15}>
              <Pane label="Sidebar">{Math.round(sizes[0])}%</Pane>
            </ResizablePanel>
            <ResizableHandle withHandle aria-label="Resize sidebar" />
            <ResizablePanel defaultSize={70} minSize={20}>
              <Pane label="Content">{Math.round(sizes[1])}%</Pane>
            </ResizablePanel>
          </ResizablePanelGroup>
          </div>
        </Preview>
      </Section>

      <Section title="Without a visible grip" description="Leave out withHandle for a quieter layout. The grip fades in under the pointer and on keyboard focus.">
        <Preview className="block">
          <div className="h-32">
          <ResizablePanelGroup direction="horizontal">
            <ResizablePanel defaultSize={25}>
              <Pane label="One" />
            </ResizablePanel>
            <ResizableHandle aria-label="Resize one and two" />
            <ResizablePanel defaultSize={50}>
              <Pane label="Two" />
            </ResizablePanel>
            <ResizableHandle aria-label="Resize two and three" />
            <ResizablePanel defaultSize={25}>
              <Pane label="Three" />
            </ResizablePanel>
          </ResizablePanelGroup>
          </div>
        </Preview>
      </Section>

      <Section title="Vertical">
        <Preview className="block">
          <div className="h-72">
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel defaultSize={35} minSize={15}>
              <Pane label="Header" />
            </ResizablePanel>
            <ResizableHandle withHandle aria-label="Resize header" />
            <ResizablePanel defaultSize={65} minSize={20}>
              <Pane label="Body" />
            </ResizablePanel>
          </ResizablePanelGroup>
          </div>
        </Preview>
      </Section>

      <Section
        title="Nested"
        description="A mail layout: folders on the left, the list over a reading pane on the right. A panel that only holds another group is transparent, so the gaps stay consistent."
      >
        <Preview className="block">
          <div className="h-[30rem]">
          <ResizablePanelGroup direction="horizontal">
            <ResizablePanel defaultSize={24} minSize={16} maxSize={36} collapsible collapsedSize={0}>
              <nav aria-label="Folders" className="p-2">
                <List className="py-0">
                  {FOLDERS.map((f, i) => (
                    <ListItem key={f.name} icon={f.icon} selected={i === 0} trailing={f.count ? <Badge size="sm" aria-label={`${f.count} unread`}>{f.count}</Badge> : undefined} onClick={() => {}}>
                      {f.name}
                    </ListItem>
                  ))}
                </List>
              </nav>
            </ResizablePanel>
            <ResizableHandle withHandle aria-label="Resize folders" />
            <ResizablePanel defaultSize={76} className="overflow-hidden bg-transparent">
              <ResizablePanelGroup direction="vertical">
                <ResizablePanel defaultSize={45} minSize={20}>
                  <List className="p-2" aria-label="Messages">
                    {MAILS.map((m, i) => (
                      <ListItem
                        key={m.subject}
                        leading={<Avatar src={m.who.src} name={m.who.name} color="auto" />}
                        description={m.who.name}
                        selected={open === i}
                        onClick={() => setOpen(i)}
                      >
                        {m.subject}
                      </ListItem>
                    ))}
                  </List>
                </ResizablePanel>
                <ResizableHandle withHandle aria-label="Resize message list" />
                <ResizablePanel defaultSize={55} minSize={20}>
                  <article className="flex flex-col gap-3 p-6" aria-label="Message">
                    <div className="flex items-center gap-3">
                      <Avatar src={mail.who.src} name={mail.who.name} color="auto" />
                      <div>
                        <h3 className="type-title-md">{mail.subject}</h3>
                        <p className="type-body-sm text-muted-foreground">From {mail.who.name}</p>
                      </div>
                    </div>
                    <p className="type-body-md">{mail.body}</p>
                    <p className="flex items-center gap-1 type-label-md text-muted-foreground">
                      <Icon name="schedule" size={16} /> Today, 9:41
                    </p>
                  </article>
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>
          </ResizablePanelGroup>
          </div>
        </Preview>
      </Section>

      <Section title="Usage">
        <Code>{`import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"

// shadcn's API
<ResizablePanelGroup direction="horizontal" className="h-48">
  <ResizablePanel defaultSize={30}>Sidebar</ResizablePanel>
  <ResizableHandle withHandle />
  <ResizablePanel>Content</ResizablePanel>
</ResizablePanelGroup>

// A panel that only holds another group
<ResizablePanel className="overflow-hidden bg-transparent">
  <ResizablePanelGroup direction="vertical">…</ResizablePanelGroup>
</ResizablePanel>`}</Code>
      </Section>

      <Section title="Props">
        <PropsTable
          note="react-resizable-panels' own props (direction, onLayout, autoSaveId, minSize, collapsible …) work as is"
          rows={[
            ["ResizablePanelGroup direction", '"horizontal" | "vertical"', "", "Required"],
            ["ResizablePanel defaultSize / minSize / maxSize", "number (percent)", "", "Sizes are percentages of the group"],
            ["ResizablePanel className", "string", "rounded-2xl tonal surface", "Override for transparent or custom panels"],
            ["ResizableHandle withHandle", "boolean", "false", "Show the grip all the time. Otherwise it appears on hover and focus"],
            ["ResizableHandle aria-label", "string", "", "Names the separator for screen readers"],
            ["Keyboard", "", "", "Arrow keys resize, Home and End go to the limits, Enter collapses a collapsible panel"],
          ]}
        />
      </Section>
    </>
  )
}
