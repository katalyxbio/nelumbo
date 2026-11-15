"use client"

import { Avatar, AvatarBadge, AvatarFallback, AvatarGroup, AvatarImage } from "@/registry/nelumbo/ui/avatar"
import { Icon } from "@/registry/nelumbo/ui/icon"
import { PEOPLE } from "@/components/docs/people"
import { Code, PageHeader, Preview, PropsTable, Section } from "@/components/docs/primitives"

const SIZES = ["xs", "sm", "default", "lg", "xl"] as const

function Labelled({ children, text }: { children: React.ReactNode; text: string }) {
  return (
    <div className="flex flex-col items-center gap-3">
      {children}
      <span className="type-label-sm text-muted-foreground">{text}</span>
    </div>
  )
}

export default function AvatarPage() {
  return (
    <>
      <PageHeader eyebrow="Component 28" title="Avatar">
        A person, team or bot at a glance. A photo when there is one; otherwise initials on a tint that stays the
        same for each name, so people are easy to tell apart in a busy list.
      </PageHeader>

      <Section title="Install">
        <Code>{`npx shadcn@latest add @nelumbo/avatar`}</Code>
      </Section>

      <Section title="Image and initials" description="Pass src and name: the initials show until the image loads, or if it fails (the last one points at a missing file). name is also what screen readers hear.">
        <Preview className="items-end gap-8">
          {PEOPLE.slice(0, 3).map((p) => (
            <Labelled key={p.name} text={p.name.split(" ")[0]}>
              <Avatar size="lg" src={p.src} name={p.name} />
            </Labelled>
          ))}
          <Labelled text="neutral">
            <Avatar size="lg" name="Tomás Novák" />
          </Labelled>
          <Labelled text="broken image">
            <Avatar size="lg" src="/avatars/missing.png" name="Aisha Bello" color="auto" />
          </Labelled>
        </Preview>
      </Section>

      <Section title="Colors" description='color="auto" picks a palette tint from the name, so each person keeps theirs everywhere. Or set one: brand, red, orange, amber, green, cyan, blue, purple, pink.'>
        <Preview className="gap-3">
          {PEOPLE.map((p) => (
            <Avatar key={p.name} name={p.name} color="auto" />
          ))}
          <Avatar name="Release bot" color="brand" shape="rounded">
            <AvatarFallback>
              <Icon name="smart_toy" />
            </AvatarFallback>
          </Avatar>
        </Preview>
      </Section>

      <Section title="Sizes and shapes" description='xs 24, sm 32, default 40, lg 56, xl 80. shape="rounded" for teams, projects and bots.'>
        <Preview className="flex-col items-start gap-6">
          <div className="flex items-end gap-6">
            {SIZES.map((s) => (
              <Labelled key={s} text={s}>
                <Avatar size={s} src="/avatars/2.svg" name="Kenji Watanabe" />
              </Labelled>
            ))}
          </div>
          <div className="flex items-end gap-6">
            {SIZES.map((s) => (
              <Avatar key={s} size={s} shape="rounded" name="Northwind" color="purple" />
            ))}
          </div>
        </Preview>
      </Section>

      <Section title="Status" description="AvatarBadge cuts a status dot out of the avatar's corner: online, away, busy or offline, spoken as such. Or put a small icon in it. On a card, set --avatar-ring to the card color.">
        <Preview className="gap-8">
          {(["online", "away", "busy", "offline"] as const).map((s, i) => (
            <Labelled key={s} text={s}>
              <Avatar size="lg">
                <AvatarImage src={PEOPLE[i].src} alt={PEOPLE[i].name} />
                <AvatarFallback>{PEOPLE[i].name[0]}</AvatarFallback>
                <AvatarBadge status={s} />
              </Avatar>
            </Labelled>
          ))}
          <Labelled text="icon">
            <Avatar size="lg" shape="rounded" color="blue">
              <AvatarFallback>DS</AvatarFallback>
              <AvatarBadge className="bg-brand text-brand-foreground">
                <Icon name="verified" fill />
              </AvatarBadge>
            </Avatar>
          </Labelled>
          <Labelled text="small">
            <Avatar size="sm" src={PEOPLE[3].src} name={PEOPLE[3].name}>
              <AvatarBadge status="online" />
            </Avatar>
          </Labelled>
        </Preview>
      </Section>

      <Section title="Group" description='AvatarGroup overlaps avatars, each cut out with a ring, and folds the rest into "+N". The size passes down to every avatar.'>
        <Preview className="flex-col items-start gap-6">
          <AvatarGroup max={4} aria-label="Project members">
            {PEOPLE.map((p) => (
              <Avatar key={p.name} src={p.src} name={p.name} color="auto" />
            ))}
          </AvatarGroup>
          <AvatarGroup size="sm" aria-label="Reviewers">
            {PEOPLE.slice(2, 6).map((p) => (
              <Avatar key={p.name} src={p.src} name={p.name} color="auto" />
            ))}
          </AvatarGroup>
          <AvatarGroup size="lg" max={3} aria-label="Team">
            {PEOPLE.slice(3).map((p) => (
              <Avatar key={p.name} src={p.src} name={p.name} color="auto" />
            ))}
          </AvatarGroup>
        </Preview>
      </Section>

      <Section title="Usage">
        <Code>{`import { Avatar, AvatarBadge, AvatarFallback, AvatarGroup, AvatarImage } from "@/components/ui/avatar"

<Avatar src={user.photo} name={user.name} color="auto" />

// shadcn style
<Avatar size="lg">
  <AvatarImage src={user.photo} alt={user.name} />
  <AvatarFallback>MK</AvatarFallback>
  <AvatarBadge status="online" />
</Avatar>

<AvatarGroup max={4} aria-label="Project members">
  {members.map((m) => <Avatar key={m.id} src={m.photo} name={m.name} color="auto" />)}
</AvatarGroup>`}</Code>
      </Section>

      <Section title="Props">
        <PropsTable
          rows={[
            ["name", "string", "", "Initials, the auto color and the accessible name"],
            ["src", "string", "", "Image URL, when you don't pass children"],
            ["size", '"xs" | "sm" | "default" | "lg" | "xl"', '"default"', "24, 32, 40, 56 or 80px"],
            ["shape", '"circle" | "rounded"', '"circle"', ""],
            ["color", '"neutral" | "auto" | palette color', '"neutral"', "The initials' tint; auto picks one from the name"],
            ["AvatarBadge status", '"online" | "away" | "busy" | "offline"', "", "Or children for an icon"],
            ["AvatarGroup max", "number", "", "The rest fold into +N"],
            ["AvatarGroup size / shape", "", "", "Passed down to each avatar"],
          ]}
          note="Set --avatar-ring on a parent to match the surface behind badges and groups (it defaults to the page background)."
        />
      </Section>
    </>
  )
}
