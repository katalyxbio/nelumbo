"use client"

import * as React from "react"
import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarGroup,
  MenubarItem,
  MenubarLabel,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "@/registry/velvet/ui/menubar"
import { Icon } from "@/registry/velvet/ui/icon"
import { Code, PageHeader, Preview, PropsTable, Section } from "@/components/docs/primitives"

export default function MenubarPage() {
  const [last, setLast] = React.useState<string | null>(null)
  const [bookmarks, setBookmarks] = React.useState(true)
  const [fullUrls, setFullUrls] = React.useState(false)
  const [profile, setProfile] = React.useState("maya")

  return (
    <>
      <PageHeader eyebrow="Component 49" title="Menubar">
        The row of menus along the top of an app. The bar is a tonal track, and the open menu is a raised segment that
        springs from trigger to trigger as you sweep across.
      </PageHeader>

      <Section title="Install">
        <Code>{`npx shadcn@latest add @velvet/menubar`}</Code>
      </Section>

      <Section
        title="App menubar"
        description="Click a menu, then move across the bar (or press Left and Right): the segment follows and the next menu opens. Down opens a menu, Right enters a submenu, Escape closes."
      >
        <Preview className="flex-col items-start gap-4">
          <Menubar aria-label="Application">
            <MenubarMenu>
              <MenubarTrigger>File</MenubarTrigger>
              <MenubarContent className="w-64">
                <MenubarGroup>
                  <MenubarItem onSelect={() => setLast("New tab")}>
                    <Icon name="tab_new_right" />
                    New tab
                    <MenubarShortcut>⌘T</MenubarShortcut>
                  </MenubarItem>
                  <MenubarItem onSelect={() => setLast("New window")}>
                    <Icon name="open_in_new" />
                    New window
                    <MenubarShortcut>⌘N</MenubarShortcut>
                  </MenubarItem>
                  <MenubarItem disabled>
                    <Icon name="visibility_off" />
                    New private window
                  </MenubarItem>
                  <MenubarSub>
                    <MenubarSubTrigger>
                      <Icon name="ios_share" />
                      Share
                    </MenubarSubTrigger>
                    <MenubarSubContent>
                      <MenubarItem onSelect={() => setLast("Email link")}>
                        <Icon name="mail" />
                        Email link
                      </MenubarItem>
                      <MenubarItem onSelect={() => setLast("Messages")}>
                        <Icon name="chat" />
                        Messages
                      </MenubarItem>
                      <MenubarItem onSelect={() => setLast("Notes")}>
                        <Icon name="sticky_note_2" />
                        Notes
                      </MenubarItem>
                    </MenubarSubContent>
                  </MenubarSub>
                </MenubarGroup>
                <MenubarSeparator />
                <MenubarItem onSelect={() => setLast("Print")}>
                  <Icon name="print" />
                  Print
                  <MenubarShortcut>⌘P</MenubarShortcut>
                </MenubarItem>
                <MenubarItem variant="destructive" onSelect={() => setLast("Quit")}>
                  <Icon name="logout" />
                  Quit
                  <MenubarShortcut>⌘Q</MenubarShortcut>
                </MenubarItem>
              </MenubarContent>
            </MenubarMenu>

            <MenubarMenu>
              <MenubarTrigger>Edit</MenubarTrigger>
              <MenubarContent className="w-60">
                <MenubarItem onSelect={() => setLast("Undo")}>
                  <Icon name="undo" />
                  Undo
                  <MenubarShortcut>⌘Z</MenubarShortcut>
                </MenubarItem>
                <MenubarItem onSelect={() => setLast("Redo")}>
                  <Icon name="redo" />
                  Redo
                  <MenubarShortcut>⇧⌘Z</MenubarShortcut>
                </MenubarItem>
                <MenubarSeparator />
                <MenubarItem onSelect={() => setLast("Cut")}>
                  <Icon name="content_cut" />
                  Cut
                  <MenubarShortcut>⌘X</MenubarShortcut>
                </MenubarItem>
                <MenubarItem onSelect={() => setLast("Copy")}>
                  <Icon name="content_copy" />
                  Copy
                  <MenubarShortcut>⌘C</MenubarShortcut>
                </MenubarItem>
                <MenubarItem onSelect={() => setLast("Paste")}>
                  <Icon name="content_paste" />
                  Paste
                  <MenubarShortcut>⌘V</MenubarShortcut>
                </MenubarItem>
              </MenubarContent>
            </MenubarMenu>

            <MenubarMenu>
              <MenubarTrigger>View</MenubarTrigger>
              <MenubarContent className="w-64">
                <MenubarLabel>Toolbars</MenubarLabel>
                <MenubarCheckboxItem checked={bookmarks} onCheckedChange={setBookmarks}>
                  Always show bookmarks bar
                </MenubarCheckboxItem>
                <MenubarCheckboxItem checked={fullUrls} onCheckedChange={setFullUrls}>
                  Always show full URLs
                </MenubarCheckboxItem>
                <MenubarSeparator />
                <MenubarItem inset onSelect={() => setLast("Reload")}>
                  Reload
                  <MenubarShortcut>⌘R</MenubarShortcut>
                </MenubarItem>
                <MenubarItem inset disabled>
                  Force reload
                  <MenubarShortcut>⇧⌘R</MenubarShortcut>
                </MenubarItem>
              </MenubarContent>
            </MenubarMenu>

            <MenubarMenu>
              <MenubarTrigger>Profiles</MenubarTrigger>
              <MenubarContent className="w-56">
                <MenubarRadioGroup value={profile} onValueChange={setProfile}>
                  <MenubarRadioItem value="maya">Maya</MenubarRadioItem>
                  <MenubarRadioItem value="jon">Jon</MenubarRadioItem>
                  <MenubarRadioItem value="guest">Guest</MenubarRadioItem>
                </MenubarRadioGroup>
                <MenubarSeparator />
                <MenubarItem inset onSelect={() => setLast("Edit profile")}>
                  Edit…
                </MenubarItem>
                <MenubarItem inset onSelect={() => setLast("Add profile")}>
                  Add profile…
                </MenubarItem>
              </MenubarContent>
            </MenubarMenu>
          </Menubar>
          <span className="type-body-sm text-muted-foreground" aria-live="polite">
            {last ? `Chose “${last}”` : "Nothing chosen yet"} (profile: {profile})
          </span>
        </Preview>
      </Section>

      <Section title="Usage">
        <Code>{`import { Menubar, MenubarMenu, MenubarTrigger, MenubarContent, MenubarItem, MenubarShortcut, MenubarSeparator } from "@/components/ui/menubar"

<Menubar>
  <MenubarMenu>
    <MenubarTrigger>File</MenubarTrigger>
    <MenubarContent>
      <MenubarItem>
        <Icon name="note_add" /> New tab <MenubarShortcut>⌘T</MenubarShortcut>
      </MenubarItem>
      <MenubarSeparator />
      <MenubarItem variant="destructive">Quit</MenubarItem>
    </MenubarContent>
  </MenubarMenu>
</Menubar>`}</Code>
      </Section>

      <Section title="Props" description="Everything else is Radix Menubar (value, onValueChange, loop, dir, onSelect, checked…).">
        <PropsTable
          rows={[
            ["MenubarItem variant", '"default" | "destructive"', '"default"', ""],
            ["inset", "boolean", "false", "Item, Label, SubTrigger: align with items that have an icon or check"],
            ["MenubarContent align", '"start" | "center" | "end"', '"start"', ""],
            ["MenubarShortcut", "string", "", 'Drawn as keycaps: "⇧⌘Z" becomes three caps'],
          ]}
        />
      </Section>
    </>
  )
}
