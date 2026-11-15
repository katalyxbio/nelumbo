"use client"

import * as React from "react"
import { Avatar } from "@/registry/velvet/ui/avatar"
import { Badge } from "@/registry/velvet/ui/badge"
import { Button } from "@/registry/velvet/ui/button"
import { Icon } from "@/registry/velvet/ui/icon"
import { IconButton } from "@/registry/velvet/ui/icon-button"
import { Switch } from "@/registry/velvet/ui/switch"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemGroup,
  ItemHeader,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from "@/registry/velvet/ui/item"
import { PEOPLE } from "@/components/docs/people"
import { Code, PageHeader, Preview, PropsTable, Section } from "@/components/docs/primitives"

export default function ItemPage() {
  const [open, setOpen] = React.useState(1)
  const [wifi, setWifi] = React.useState(true)

  return (
    <>
      <PageHeader eyebrow="Component 63" title="Item">
        A flexible row for a thing with media, a title, a description and actions: settings, files, people. Drop-in
        for shadcn&apos;s Item, with List&apos;s paddings, type and state layer. Use it when you need more freedom than a
        List row: a header, a footer, or your own content inside.
      </PageHeader>

      <Section title="Install">
        <Code>{`npx shadcn@latest add @velvet/item`}</Code>
      </Section>

      <Section
        title="Variants"
        description="Default is bare, outline is a ring in outline-variant (drawn inside, not a border), muted is a tonal tile."
      >
        <Preview className="items-stretch justify-center gap-4">
          <div className="flex w-full max-w-md flex-col gap-3">
            <Item>
              <ItemMedia variant="icon"><Icon name="verified_user" /></ItemMedia>
              <ItemContent>
                <ItemTitle>Default</ItemTitle>
                <ItemDescription>Bare, on the surface.</ItemDescription>
              </ItemContent>
              <ItemActions><Button size="sm" variant="secondary">Review</Button></ItemActions>
            </Item>
            <Item variant="outline">
              <ItemMedia variant="icon"><Icon name="verified_user" /></ItemMedia>
              <ItemContent>
                <ItemTitle>Outline</ItemTitle>
                <ItemDescription>A ring, no border lines.</ItemDescription>
              </ItemContent>
              <ItemActions><Button size="sm" variant="secondary">Review</Button></ItemActions>
            </Item>
            <Item variant="muted">
              <ItemMedia variant="icon"><Icon name="verified_user" /></ItemMedia>
              <ItemContent>
                <ItemTitle>Muted</ItemTitle>
                <ItemDescription>A tonal tile.</ItemDescription>
              </ItemContent>
              <ItemActions><Button size="sm" variant="secondary">Review</Button></ItemActions>
            </Item>
            <Item variant="outline" size="sm">
              <ItemMedia><Icon name="check_circle" /></ItemMedia>
              <ItemContent>
                <ItemTitle>Small</ItemTitle>
              </ItemContent>
              <ItemActions><Icon name="chevron_right" /></ItemActions>
            </Item>
          </div>
        </Preview>
      </Section>

      <Section
        title="Group"
        description="An ItemGroup is a segmented surface like List: tiles 2px apart, outer corners rounded. ItemSeparator is spacing that starts a new group. asChild makes the whole item a link; the item gets a state layer and a press squeeze."
      >
        <Preview className="justify-center">
          <ItemGroup className="max-w-md">
            <Item asChild>
              <a href="#">
                <ItemMedia variant="icon"><Icon name="palette" /></ItemMedia>
                <ItemContent>
                  <ItemTitle>Display</ItemTitle>
                  <ItemDescription>Dark theme, blue accent</ItemDescription>
                </ItemContent>
                <ItemActions><Icon name="chevron_right" /></ItemActions>
              </a>
            </Item>
            <Item>
              <ItemMedia variant="icon"><Icon name="wifi" /></ItemMedia>
              <ItemContent>
                <ItemTitle>Wi-Fi</ItemTitle>
                <ItemDescription>{wifi ? "Studio 5G" : "Off"}</ItemDescription>
              </ItemContent>
              <ItemActions><Switch aria-label="Wi-Fi" checked={wifi} onCheckedChange={setWifi} /></ItemActions>
            </Item>
            <Item asChild>
              <a href="#">
                <ItemMedia variant="icon"><Icon name="volume_up" /></ItemMedia>
                <ItemContent>
                  <ItemTitle>Sound</ItemTitle>
                </ItemContent>
                <ItemActions><span className="type-label-md tabular-nums">70%</span><Icon name="chevron_right" /></ItemActions>
              </a>
            </Item>
            <ItemSeparator />
            <Item asChild>
              <a href="#">
                <ItemMedia variant="icon"><Icon name="info" /></ItemMedia>
                <ItemContent>
                  <ItemTitle>About</ItemTitle>
                  <ItemDescription>Version 2.4.0</ItemDescription>
                </ItemContent>
                <ItemActions><Icon name="chevron_right" /></ItemActions>
              </a>
            </Item>
          </ItemGroup>
        </Preview>
      </Section>

      <Section
        title="People, with selection"
        description="Image media for an avatar. onClick makes an item interactive, selected fills it with secondary and the icon tile inverts."
      >
        <Preview className="justify-center">
          <ItemGroup className="max-w-md" aria-label="Team">
            {PEOPLE.slice(0, 4).map((p, i) => (
              <Item key={p.name} selected={open === i} onClick={() => setOpen(i)} asChild>
                <button type="button" aria-pressed={open === i} className="text-left">
                  <ItemMedia><Avatar src={p.src} name={p.name} /></ItemMedia>
                  <ItemContent>
                    <ItemTitle>{p.name}</ItemTitle>
                    <ItemDescription>{p.role}</ItemDescription>
                  </ItemContent>
                  <ItemActions>{i === 0 && <Badge variant="brand" size="sm">Owner</Badge>}</ItemActions>
                </button>
              </Item>
            ))}
          </ItemGroup>
        </Preview>
      </Section>

      <Section title="Header and footer" description="ItemHeader and ItemFooter take a full row above and below the content (flex-basis 100%).">
        <Preview className="justify-center">
          <Item variant="muted" className="max-w-md">
            <ItemHeader>
              <span className="type-label-md text-muted-foreground">Invoice 2041</span>
              <Badge size="sm" variant="outline">Paid</Badge>
            </ItemHeader>
            <ItemMedia variant="icon"><Icon name="receipt_long" /></ItemMedia>
            <ItemContent>
              <ItemTitle>Studio plan, annual</ItemTitle>
              <ItemDescription>Billed to maya@example.com</ItemDescription>
            </ItemContent>
            <ItemActions><IconButton icon="download" label="Download invoice" size="sm" /></ItemActions>
            <ItemFooter>
              <span className="type-label-md text-muted-foreground">Nov 3</span>
              <span className="type-label-lg">$240.00</span>
            </ItemFooter>
          </Item>
        </Preview>
      </Section>

      <Section title="Usage">
        <Code>{`import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemSeparator, ItemTitle } from "@/components/ui/item"

<ItemGroup>
  <Item asChild>
    <a href="/settings/display">
      <ItemMedia variant="icon"><Icon name="palette" /></ItemMedia>
      <ItemContent>
        <ItemTitle>Display</ItemTitle>
        <ItemDescription>Dark theme, blue accent</ItemDescription>
      </ItemContent>
      <ItemActions><Icon name="chevron_right" /></ItemActions>
    </a>
  </Item>
  <ItemSeparator />
  <Item variant="outline" size="sm">…</Item>
</ItemGroup>`}</Code>
      </Section>

      <Section title="Props">
        <PropsTable
          rows={[
            ["Item variant", '"default" | "outline" | "muted"', '"default"', "Outline is a ring inside the item; in a group, default and muted are tiles."],
            ["Item size", '"default" | "sm"', '"default"', "Default is List's 56px row, sm is 44px."],
            ["Item asChild", "boolean", "false", "Render your own link or button; it takes the item's look."],
            ["Item interactive", "boolean", "asChild or onClick", "State layer, pointer and press squeeze."],
            ["Item selected", "boolean", "false", "Secondary fill; the icon tile inverts."],
            ["ItemGroup variant", '"segmented" | "plain"', '"segmented"', "Plain leaves items loose, 8px apart."],
            ["ItemMedia variant", '"default" | "icon" | "image"', '"default"', "Icon sits the glyph on a 40px tonal tile; image is a 40px rounded crop."],
            ["ItemSeparator", "div props", "", "Spacing; starts a new group of tiles. No line."],
            ["ItemContent / ItemTitle / ItemDescription / ItemActions / ItemHeader / ItemFooter", "", "", "Layout parts; same as shadcn."],
          ]}
        />
      </Section>
    </>
  )
}
