"use client"

import * as React from "react"
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardMedia, CardTitle } from "@/registry/velvet/ui/card"
import { Button } from "@/registry/velvet/ui/button"
import { IconButton } from "@/registry/velvet/ui/icon-button"
import { Icon, type IconName } from "@/registry/velvet/ui/icon"
import { Code, PageHeader, Preview, PropsTable, Section } from "@/components/docs/primitives"

/** Abstract artwork from the theme colors, so it follows the palette and the mode. */
function Artwork({ seed = 0 }: { seed?: number }) {
  const spots = [
    ["20% 30%", "70% 80%", "90% 10%"],
    ["80% 20%", "15% 85%", "55% 50%"],
    ["50% 100%", "0% 0%", "100% 40%"],
  ][seed % 3]
  return (
    <div
      aria-hidden
      className="size-full"
      style={{
        background: `radial-gradient(circle at ${spots[0]}, color-mix(in oklch, var(--brand) 55%, transparent), transparent 55%),
          radial-gradient(circle at ${spots[1]}, var(--brand-container), transparent 60%),
          radial-gradient(circle at ${spots[2]}, color-mix(in oklch, var(--foreground) 18%, transparent), transparent 50%),
          var(--surface-container-high)`,
      }}
    />
  )
}

const GUIDES: { icon: IconName; title: string; body: string; meta: string }[] = [
  { icon: "palette", title: "Palettes from a seed", body: "Generate light and dark schemes from one brand color.", meta: "6 min read" },
  { icon: "animation", title: "Motion and springs", body: "When to use smooth, bouncy and snappy springs.", meta: "4 min read" },
  { icon: "rounded_corner", title: "Shape and radius", body: "One knob drives every corner in the system.", meta: "3 min read" },
]

export default function CardPage() {
  const [saved, setSaved] = React.useState(false)

  return (
    <>
      <PageHeader eyebrow="Component · 13" title="Card">
        Groups content and actions about one subject. Three surfaces: elevated, filled and outlined. A card can also be
        one big control, like a link to an article.
      </PageHeader>

      <Section title="Install">
        <Code>{`npx shadcn@latest add @velvet/card`}</Code>
      </Section>

      <Section title="Variants" description="Elevated is the default and floats on a soft shadow. Filled sits on a tonal surface, for grouping inside a page. Outlined is flat with a hairline, for dense or repeated layouts.">
        <Preview className="grid items-stretch gap-5 sm:grid-cols-3">
          {(["elevated", "filled", "outlined"] as const).map((v) => (
            <Card key={v} variant={v}>
              <CardHeader>
                <CardTitle className="capitalize">{v}</CardTitle>
                <CardDescription>
                  {v === "elevated" ? "Soft shadow, card surface." : v === "filled" ? "Tonal surface, no shadow." : "Hairline border, flat."}
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button size="sm" variant="secondary">
                  Open
                </Button>
              </CardFooter>
            </Card>
          ))}
        </Preview>
      </Section>

      <Section title="Header, content and actions" description="The header has a slot for an action in the corner. Footers hold buttons; put the main action last.">
        <Preview className="justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Storage</CardTitle>
              <CardDescription>18.4 GB of 25 GB used</CardDescription>
              <CardAction>
                <IconButton icon="more_vert" label="More options" />
              </CardAction>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="flex h-2 overflow-hidden rounded-full bg-surface-container-highest">
                <div className="w-[48%] bg-primary" />
                <div className="w-[16%] bg-brand" />
                <div className="w-[10%] bg-muted-foreground" />
              </div>
              <div className="flex gap-5 type-label-md text-muted-foreground">
                <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-primary" />Photos</span>
                <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-brand" />Documents</span>
                <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-muted-foreground" />Other</span>
              </div>
            </CardContent>
            <CardFooter className="justify-end">
              <Button variant="ghost">Manage</Button>
              <Button>Upgrade</Button>
            </CardFooter>
          </Card>
        </Preview>
      </Section>

      <Section title="With media" description="CardMedia placed first runs edge to edge and takes the card's corners. Give it an aspect ratio so the layout doesn't jump while an image loads.">
        <Preview className="grid items-start gap-5 sm:grid-cols-2">
          <Card>
            <CardMedia>
              <Artwork />
            </CardMedia>
            <CardHeader>
              <CardTitle>Velvet 1.0</CardTitle>
              <CardDescription>Tokens, springs and the full button family, ready for shadcn.</CardDescription>
              <CardAction>
                <IconButton toggle icon="bookmark" selectedIcon="bookmark_added" label="Save" pressed={saved} onPressedChange={setSaved} />
              </CardAction>
            </CardHeader>
            <CardFooter>
              <Button variant="secondary">Read the notes</Button>
            </CardFooter>
          </Card>
          <Card variant="outlined">
            <CardHeader>
              <CardTitle>Studio session</CardTitle>
              <CardDescription>Thursday, 10:00 to 11:30</CardDescription>
            </CardHeader>
            <CardMedia inset className="aspect-[2/1]">
              <Artwork seed={1} />
            </CardMedia>
            <CardContent className="text-muted-foreground">Inset media keeps the padding and gets its own corners.</CardContent>
          </Card>
        </Preview>
      </Section>

      <Section
        title="Interactive"
        description="Pass interactive and asChild with a link: the whole card becomes one link. Hover shows a faint overlay (elevated cards also lift), and pressing gives the same springy press as buttons. Don't nest other buttons inside."
      >
        <Preview className="grid items-stretch gap-5 sm:grid-cols-3">
          {GUIDES.map((g, i) => (
            <Card key={g.title} asChild interactive variant={i === 1 ? "filled" : i === 2 ? "outlined" : "elevated"}>
              <a href="#interactive" onClick={(e) => e.preventDefault()}>
                <CardHeader>
                  <Icon name={g.icon} size={24} className="mb-3 text-brand" />
                  <CardTitle>{g.title}</CardTitle>
                  <CardDescription>{g.body}</CardDescription>
                </CardHeader>
                <CardFooter className="mt-auto justify-between type-label-md text-muted-foreground">
                  {g.meta}
                  <Icon name="arrow_forward" />
                </CardFooter>
              </a>
            </Card>
          ))}
        </Preview>
      </Section>

      <Section title="Small" description="16px padding, for dashboards and dense grids.">
        <Preview className="grid items-stretch gap-4 sm:grid-cols-4">
          {[
            ["Visitors", "24.8k", "+12%"],
            ["Sign-ups", "1,204", "+4%"],
            ["Churn", "2.1%", "−0.3%"],
            ["Revenue", "$48.2k", "+9%"],
          ].map(([k, v, d]) => (
            <Card key={k} size="sm" variant="filled" className="gap-1">
              <CardContent className="type-label-md text-muted-foreground">{k}</CardContent>
              <CardContent className="flex items-baseline justify-between">
                <span className="type-headline-sm tabular-nums">{v}</span>
                <span className="type-label-md text-muted-foreground tabular-nums">{d}</span>
              </CardContent>
            </Card>
          ))}
        </Preview>
      </Section>

      <Section title="Usage">
        <Code>{`import { Card, CardHeader, CardTitle, CardDescription, CardAction, CardContent, CardFooter, CardMedia } from "@/components/ui/card"

<Card>
  <CardMedia><img src="/cover.jpg" alt="" /></CardMedia>
  <CardHeader>
    <CardTitle>Velvet 1.0</CardTitle>
    <CardDescription>Release notes</CardDescription>
    <CardAction><IconButton icon="more_vert" label="More" /></CardAction>
  </CardHeader>
  <CardFooter><Button>Read</Button></CardFooter>
</Card>

<Card asChild interactive variant="outlined">
  <Link href="/guides/motion">…</Link>
</Card>`}</Code>
      </Section>

      <Section title="Props">
        <PropsTable
          rows={[
            ["variant", '"elevated" | "filled" | "outlined"', '"elevated"', ""],
            ["size", '"default" | "sm"', '"default"', "24px or 16px padding"],
            ["interactive", "boolean", "false", "Hover, focus and press states for a card that is one control"],
            ["asChild", "boolean", "false", "Render as the child element, e.g. a link"],
            ["CardMedia inset", "boolean", "false", "Keep the padding and round the media's own corners"],
          ]}
        />
      </Section>
    </>
  )
}
