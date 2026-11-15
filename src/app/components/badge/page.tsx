"use client"

import * as React from "react"
import { Badge, NotificationBadge } from "@/registry/nelumbo/ui/badge"
import { Avatar } from "@/registry/nelumbo/ui/avatar"
import { IconButton } from "@/registry/nelumbo/ui/icon-button"
import { Button } from "@/registry/nelumbo/ui/button"
import { Icon } from "@/registry/nelumbo/ui/icon"
import { Code, PageHeader, Preview, PropsTable, Section } from "@/components/docs/primitives"

const VARIANTS = ["default", "secondary", "outline", "brand", "success", "warning", "destructive", "info"] as const

function Labelled({ children, text }: { children: React.ReactNode; text: string }) {
  return (
    <div className="flex flex-col items-center gap-3">
      {children}
      <span className="type-label-sm text-muted-foreground">{text}</span>
    </div>
  )
}

export default function BadgePage() {
  const [count, setCount] = React.useState(3)

  return (
    <>
      <PageHeader eyebrow="Component 29" title="Badge">
        Two kinds. Badge labels a status or category next to content. NotificationBadge sits on the corner of an
        icon or avatar to say something new is waiting.
      </PageHeader>

      <Section title="Install">
        <Code>{`npx shadcn@latest add @nelumbo/badge`}</Code>
      </Section>

      <Section title="Badge" description="Black and white for neutral labels; tonal palette colors when the badge carries meaning. shadcn's default, secondary, outline and destructive work as is.">
        <Preview className="gap-3">
          {VARIANTS.map((v) => (
            <Badge key={v} variant={v}>
              {v[0].toUpperCase() + v.slice(1)}
            </Badge>
          ))}
        </Preview>
      </Section>

      <Section title="Dots and icons" description="dot adds a status dot in the badge's accent; icon adds a leading Material Symbol. size=&quot;sm&quot; is 20px, for table rows and dense lists.">
        <Preview className="gap-3">
          <Badge variant="success" dot>Live</Badge>
          <Badge variant="warning" dot>Degraded</Badge>
          <Badge variant="destructive" dot>Outage</Badge>
          <Badge variant="outline" dot>Draft</Badge>
          <Badge variant="brand" icon="star">New</Badge>
          <Badge variant="secondary" icon="schedule">Due Friday</Badge>
          <Badge variant="info" icon="lock">Private</Badge>
          <Badge size="sm" variant="success">Paid</Badge>
          <Badge size="sm" variant="secondary">v2.4.0</Badge>
          <Badge asChild variant="outline" icon="tag">
            <a href="#">design-system</a>
          </Badge>
        </Preview>
      </Section>

      <Section title="In a heading" description="Next to a title, the badge lines up with the text.">
        <Preview className="flex-col items-start gap-4">
          <div className="flex items-center gap-3">
            <h3 className="type-title-lg">Spring campaign</h3>
            <Badge variant="success" dot>Live</Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="type-body-lg">Billing</span>
            <Badge size="sm" variant="brand">Pro</Badge>
          </div>
        </Preview>
      </Section>

      <Section
        title="NotificationBadge"
        description="A dot for something new, or a count that caps at max (999+ by default). It springs in and out. placement says what it sits on: a bare icon, an icon button, or an avatar. Screen readers don't see it, so put the count in the control's name."
      >
        <Preview className="flex-col items-center gap-8">
          <div className="flex flex-wrap items-end justify-center gap-10">
            <Labelled text="dot">
              <NotificationBadge>
                <Icon name="mail" />
              </NotificationBadge>
            </Labelled>
            <Labelled text="count">
              <NotificationBadge count={count}>
                <Icon name="chat_bubble" />
              </NotificationBadge>
            </Labelled>
            <Labelled text="max">
              <NotificationBadge count={1200}>
                <Icon name="inbox" />
              </NotificationBadge>
            </Labelled>
            <Labelled text="icon button">
              <NotificationBadge count={count} placement="button">
                <IconButton icon="notifications" label={count ? `Notifications, ${count} new` : "Notifications"} />
              </NotificationBadge>
            </Labelled>
            <Labelled text="icon button, dot">
              <NotificationBadge placement="button" invisible={count === 0}>
                <IconButton variant="outlined" icon="shopping_bag" label="Bag, updated" />
              </NotificationBadge>
            </Labelled>
            <Labelled text="avatar">
              <NotificationBadge count={count} placement="avatar">
                <Avatar size="lg" src="/avatars/1.svg" name="Maya Kowalski" />
              </NotificationBadge>
            </Labelled>
            <Labelled text="avatar, dot">
              <NotificationBadge placement="avatar" invisible={count === 0}>
                <Avatar size="lg" name="Omar Haddad" color="auto" />
              </NotificationBadge>
            </Labelled>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="secondary" onClick={() => setCount((c) => Math.max(0, c - 1))}>
              <Icon name="remove" />
              Read one
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setCount((c) => c + 1)}>
              <Icon name="add" />
              New message
            </Button>
          </div>
        </Preview>
      </Section>

      <Section title="Usage">
        <Code>{`import { Badge, NotificationBadge } from "@/components/ui/badge"

<Badge>New</Badge>
<Badge variant="success" dot>Live</Badge>
<Badge variant="secondary" icon="schedule" size="sm">Due Friday</Badge>

<NotificationBadge count={unread} placement="button">
  <IconButton icon="notifications" label={\`Notifications, \${unread} new\`} />
</NotificationBadge>`}</Code>
      </Section>

      <Section title="Props">
        <PropsTable
          rows={[
            ["Badge variant", '"default" | "secondary" | "outline" | "brand" | "success" | "warning" | "destructive" | "info"', '"default"', ""],
            ["Badge size", '"default" | "sm"', '"default"', "24px or 20px"],
            ["Badge dot", "boolean", "false", "Leading status dot"],
            ["Badge icon", "IconName", "", "Leading Material Symbol"],
            ["Badge asChild", "boolean", "false", "Render as your link"],
            ["NotificationBadge count", "number", "", "Leave out for a dot; 0 hides it"],
            ["NotificationBadge max", "number", "999", 'Above it, shows "999+"'],
            ["NotificationBadge placement", '"icon" | "button" | "avatar"', '"icon"', "What it sits on"],
            ["NotificationBadge invisible", "boolean", "false", "Hide it (it springs away)"],
          ]}
        />
      </Section>
    </>
  )
}
