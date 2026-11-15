"use client"

import * as React from "react"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/registry/velvet/ui/dropdown-menu"
import { Button } from "@/registry/velvet/ui/button"
import { IconButton } from "@/registry/velvet/ui/icon-button"
import { Icon } from "@/registry/velvet/ui/icon"
import { Code, PageHeader, Preview, PropsTable, Section } from "@/components/docs/primitives"

export default function DropdownMenuPage() {
  const [last, setLast] = React.useState<string | null>(null)
  const [cols, setCols] = React.useState({ owner: true, modified: true, size: false })
  const [sort, setSort] = React.useState("modified")

  return (
    <>
      <PageHeader eyebrow="Component 18" title="Dropdown Menu">
        A list of actions or options that opens from a button. Items are roomy, their corners follow the menu&apos;s, and
        the chosen option is filled in rather than just ticked.
      </PageHeader>

      <Section title="Install">
        <Code>{`npx shadcn@latest add @velvet/dropdown-menu`}</Code>
      </Section>

      <Section
        title="Actions"
        description="Icons on the left, shortcuts on the right, a submenu, and a destructive action set apart at the end. Arrow keys move, typing jumps to an item, Escape closes."
      >
        <Preview className="gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <IconButton icon="more_vert" label="File actions" variant="secondary" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-60">
              <DropdownMenuGroup>
                <DropdownMenuItem onSelect={() => setLast("Open")}>
                  <Icon name="open_in_new" />
                  Open
                  <DropdownMenuShortcut>↵</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setLast("Rename")}>
                  <Icon name="edit" />
                  Rename
                  <DropdownMenuShortcut>F2</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setLast("Duplicate")}>
                  <Icon name="content_copy" />
                  Duplicate
                  <DropdownMenuShortcut>⌘D</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Icon name="drive_file_move" />
                    Move to
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    {["Design", "Research", "Archive"].map((f) => (
                      <DropdownMenuItem key={f} onSelect={() => setLast(`Move to ${f}`)}>
                        <Icon name="folder" />
                        {f}
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={() => setLast("New folder")}>
                      <Icon name="create_new_folder" />
                      New folder…
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuItem disabled>
                  <Icon name="lock" />
                  Make private
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onSelect={() => setLast("Delete")}>
                <Icon name="delete" />
                Delete
                <DropdownMenuShortcut>⌫</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <span className="type-body-sm text-muted-foreground" aria-live="polite">
            {last ? `Chose “${last}”` : "Nothing chosen yet"}
          </span>
        </Preview>
      </Section>

      <Section
        title="Options"
        description="Checkbox items toggle without closing the menu; a radio group picks one, and the chosen row fills in with the tonal container."
      >
        <Preview>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Icon name="view_list" />
                View
                <Icon name="arrow_drop_down" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel>Columns</DropdownMenuLabel>
              {(Object.keys(cols) as (keyof typeof cols)[]).map((k) => (
                <DropdownMenuCheckboxItem
                  key={k}
                  checked={cols[k]}
                  onCheckedChange={(v) => setCols((c) => ({ ...c, [k]: v }))}
                  onSelect={(e) => e.preventDefault()}
                  className="capitalize"
                >
                  {k}
                </DropdownMenuCheckboxItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Sort by</DropdownMenuLabel>
              <DropdownMenuRadioGroup value={sort} onValueChange={setSort}>
                <DropdownMenuRadioItem value="name">Name</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="modified">Last modified</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="size">File size</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </Preview>
      </Section>

      <Section title="Account menu" description="A header row made from plain markup, then grouped items.">
        <Preview>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                aria-label="Account"
                className="tactile grid size-10 cursor-pointer place-items-center rounded-full bg-brand-container type-label-lg text-brand-container-foreground outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                ML
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64">
              <div className="flex items-center gap-3 px-3 pt-2 pb-3">
                <span className="grid size-10 place-items-center rounded-full bg-brand-container type-label-lg text-brand-container-foreground">ML</span>
                <span className="flex min-w-0 flex-col">
                  <span className="type-title-sm">Maya Lin</span>
                  <span className="truncate type-body-sm text-muted-foreground">maya@northwind.studio</span>
                </span>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Icon name="person" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Icon name="settings" />
                Settings
                <DropdownMenuShortcut>⌘,</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Icon name="help" />
                Help and feedback
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Icon name="logout" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </Preview>
      </Section>

      <Section title="Usage">
        <Code>{`import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuShortcut, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <IconButton icon="more_vert" label="More" />
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end">
    <DropdownMenuItem>
      <Icon name="edit" /> Rename <DropdownMenuShortcut>F2</DropdownMenuShortcut>
    </DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem variant="destructive">
      <Icon name="delete" /> Delete
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>`}</Code>
      </Section>

      <Section title="Props" description="Everything else is Radix Dropdown Menu (open, onOpenChange, modal, onSelect, checked, value…).">
        <PropsTable
          rows={[
            ["DropdownMenuItem variant", '"default" | "destructive"', '"default"', ""],
            ["inset", "boolean", "false", "Item, Label, SubTrigger: align with items that have an icon"],
            ["DropdownMenuContent sideOffset", "number", "6", ""],
          ]}
        />
      </Section>
    </>
  )
}
