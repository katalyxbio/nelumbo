"use client"

import * as React from "react"
import Link from "next/link"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/registry/velvet/ui/empty"
import { Avatar, AvatarGroup } from "@/registry/velvet/ui/avatar"
import { Button } from "@/registry/velvet/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/registry/velvet/ui/card"
import { Icon } from "@/registry/velvet/ui/icon"
import { SearchBar } from "@/registry/velvet/ui/search"
import { Code, PageHeader, Preview, PropsTable, Section } from "@/components/docs/primitives"

export default function EmptyPage() {
  const [q, setQ] = React.useState("quarterly forecast")

  return (
    <>
      <PageHeader eyebrow="Component 58" title="Empty">
        What a list, table or page shows when it has nothing to show: a tile, a title, a sentence of help and the
        next step. A drop-in for shadcn&apos;s Empty, without the dashed border.
      </PageHeader>

      <Section title="Install">
        <Code>{`npx shadcn@latest add @velvet/empty`}</Code>
      </Section>

      <Section
        title="No projects yet"
        description='EmptyMedia variant="icon" is a large tonal tile with the glyph filled, with two softer tiles tilted behind it. Hover the tile and they fan out a little.'
      >
        <Preview className="flex-col items-stretch">
          <Card variant="filled" className="bg-card dark:bg-surface-container">
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Icon name="folder_open" />
                </EmptyMedia>
                <EmptyTitle>No projects yet</EmptyTitle>
                <EmptyDescription>Projects collect files, notes and people in one place. Create your first to get started.</EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <div className="flex gap-2">
                  <Button>Create project</Button>
                  <Button variant="ghost">Import</Button>
                </div>
              </EmptyContent>
            </Empty>
          </Card>
        </Preview>
      </Section>

      <Section title="No search results" description="Keep the search bar in view so the next query is one keystroke away.">
        <Preview className="flex-col items-stretch">
          <Card variant="filled" className="bg-card dark:bg-surface-container">
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Icon name="search_off" />
                </EmptyMedia>
                <EmptyTitle>No results for &ldquo;{q}&rdquo;</EmptyTitle>
                <EmptyDescription>Check the spelling, or try a broader term like a project or person&apos;s name.</EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <SearchBar label="Search again" value={q} onValueChange={setQ} />
              </EmptyContent>
            </Empty>
          </Card>
        </Preview>
      </Section>

      <Section title="Inbox zero, and a single tile" description="layered={false} draws one tile for a quieter, more celebratory feel.">
        <Preview className="flex-col items-stretch">
          <Card variant="filled" className="bg-card dark:bg-surface-container">
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon" layered={false}>
                  <Icon name="inbox" />
                </EmptyMedia>
                <EmptyTitle>You&apos;re all caught up</EmptyTitle>
                <EmptyDescription>New messages will show up here. Enjoy the quiet.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          </Card>
        </Preview>
      </Section>

      <Section title="Page not found" description="At page level a larger title and a way back.">
        <Preview className="flex-col items-stretch">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Icon name="explore_off" />
              </EmptyMedia>
              <EmptyTitle>404, page not found</EmptyTitle>
              <EmptyDescription>
                The page you are looking for moved or never existed. Try the <Link href="/">home page</Link>.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button asChild>
                <Link href="/">Back to home</Link>
              </Button>
            </EmptyContent>
          </Empty>
        </Preview>
      </Section>

      <Section title="Avatars" description='EmptyMedia variant="avatars" holds an AvatarGroup for team and sharing prompts.'>
        <Preview className="flex-col items-stretch">
          <Card variant="filled" className="bg-card dark:bg-surface-container [--avatar-ring:var(--card)]">
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="avatars">
                  <AvatarGroup>
                    <Avatar name="Maya Kowalski" color="auto" />
                    <Avatar name="Kenji Watanabe" color="auto" />
                    <Avatar name="Aisha Bello" color="auto" />
                  </AvatarGroup>
                </EmptyMedia>
                <EmptyTitle>Invite your team</EmptyTitle>
                <EmptyDescription>Nobody else is in this workspace yet. Invite people to share projects with them.</EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button>Invite people</Button>
              </EmptyContent>
            </Empty>
          </Card>
        </Preview>
      </Section>

      <Section title="Inside a card" description="Inside a Card, Empty takes the place of the content. Use the card's own header for the title of the whole panel.">
        <Preview className="flex-col items-stretch">
          <Card>
            <CardHeader>
              <CardTitle>Recent activity</CardTitle>
              <CardDescription>The last 30 days</CardDescription>
              <CardAction>
                <Button variant="ghost" size="sm">Filters</Button>
              </CardAction>
            </CardHeader>
            <CardContent>
              <Empty variant="filled">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Icon name="history" />
                  </EmptyMedia>
                  <EmptyTitle>Nothing yet</EmptyTitle>
                  <EmptyDescription>Edits and comments from your team will appear here.</EmptyDescription>
                </EmptyHeader>
              </Empty>
            </CardContent>
          </Card>
        </Preview>
      </Section>

      <Section title="Props">
        <PropsTable
          rows={[
            ["Empty variant", '"default" | "filled"', '"default"', "Plain, or a tonal rounded surface."],
            ["EmptyMedia variant", '"default" | "icon" | "avatars"', '"default"', "Bare, a tonal icon tile, or a slot for an AvatarGroup."],
            ["EmptyMedia layered", "boolean", "true", "Icon tile only: two soft tiles tilted behind it."],
            ["EmptyHeader / EmptyTitle / EmptyDescription / EmptyContent", "ComponentProps<'div'>", "", "Layout and type parts; all accept className."],
          ]}
        />
      </Section>
    </>
  )
}
