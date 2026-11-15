"use client"

import * as React from "react"
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/registry/nelumbo/ui/context-menu"
import { Icon } from "@/registry/nelumbo/ui/icon"
import { Code, PageHeader, Preview, PropsTable, Section } from "@/components/docs/primitives"

const area =
  "grid h-48 w-full max-w-xl place-items-center rounded-2xl bg-surface-container-high p-6 text-center type-body-md text-muted-foreground outline-none select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring data-[state=open]:text-foreground dark:bg-surface-container"

export default function ContextMenuPage() {
  const [last, setLast] = React.useState<string | null>(null)
  const [grid, setGrid] = React.useState(true)
  const [rulers, setRulers] = React.useState(false)
  const [zoom, setZoom] = React.useState("100")

  return (
    <>
      <PageHeader eyebrow="Component 48" title="Context Menu">
        A menu of actions for the thing under the pointer. It springs open from where you clicked, shares its rows with
        the Dropdown Menu, and a raised pill slides between them as you move.
      </PageHeader>

      <Section title="Install">
        <Code>{`npx shadcn@latest add @nelumbo/context-menu`}</Code>
      </Section>

      <Section
        title="Actions"
        description="Right-click the area. On touch, press and hold; on a keyboard, focus it and press Shift+F10 or the Menu key. Icons on the left, keycap shortcuts on the right, a submenu, and a destructive action set apart at the end."
      >
        <Preview className="flex-col items-start gap-4">
          <ContextMenu>
            <ContextMenuTrigger tabIndex={0} aria-label="Canvas. Right-click, long-press, or press Shift+F10 for actions." className={area}>
              <span className="flex flex-col items-center gap-2">
                <Icon name="ads_click" size={28} />
                Right-click, long-press, or press Shift+F10
              </span>
            </ContextMenuTrigger>
            <ContextMenuContent className="w-64">
              <ContextMenuGroup>
                <ContextMenuItem onSelect={() => setLast("Cut")}>
                  <Icon name="content_cut" />
                  Cut
                  <ContextMenuShortcut>⌘X</ContextMenuShortcut>
                </ContextMenuItem>
                <ContextMenuItem onSelect={() => setLast("Copy")}>
                  <Icon name="content_copy" />
                  Copy
                  <ContextMenuShortcut>⌘C</ContextMenuShortcut>
                </ContextMenuItem>
                <ContextMenuItem onSelect={() => setLast("Paste")}>
                  <Icon name="content_paste" />
                  Paste
                  <ContextMenuShortcut>⌘V</ContextMenuShortcut>
                </ContextMenuItem>
                <ContextMenuSub>
                  <ContextMenuSubTrigger>
                    <Icon name="ios_share" />
                    Share
                  </ContextMenuSubTrigger>
                  <ContextMenuSubContent>
                    <ContextMenuItem onSelect={() => setLast("Share by email")}>
                      <Icon name="mail" />
                      Email
                    </ContextMenuItem>
                    <ContextMenuItem onSelect={() => setLast("Copy link")}>
                      <Icon name="link" />
                      Copy link
                    </ContextMenuItem>
                    <ContextMenuItem onSelect={() => setLast("Share to team")}>
                      <Icon name="group" />
                      Team
                    </ContextMenuItem>
                  </ContextMenuSubContent>
                </ContextMenuSub>
                <ContextMenuItem disabled>
                  <Icon name="lock" />
                  Lock layer
                </ContextMenuItem>
              </ContextMenuGroup>
              <ContextMenuSeparator />
              <ContextMenuItem variant="destructive" onSelect={() => setLast("Delete")}>
                <Icon name="delete" />
                Delete
                <ContextMenuShortcut>⌫</ContextMenuShortcut>
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
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
          <ContextMenu>
            <ContextMenuTrigger tabIndex={0} aria-label="Artboard. Right-click, long-press, or press Shift+F10 for view options." className={area}>
              <span className="flex flex-col items-center gap-2">
                <Icon name="grid_view" size={28} />
                View options (grid {grid ? "on" : "off"}, rulers {rulers ? "on" : "off"}, {zoom}%)
              </span>
            </ContextMenuTrigger>
            <ContextMenuContent className="w-60">
              <ContextMenuLabel>Show</ContextMenuLabel>
              <ContextMenuCheckboxItem checked={grid} onCheckedChange={setGrid} onSelect={(e) => e.preventDefault()}>
                Grid
                <ContextMenuShortcut>⌘G</ContextMenuShortcut>
              </ContextMenuCheckboxItem>
              <ContextMenuCheckboxItem checked={rulers} onCheckedChange={setRulers} onSelect={(e) => e.preventDefault()}>
                Rulers
                <ContextMenuShortcut>⌘R</ContextMenuShortcut>
              </ContextMenuCheckboxItem>
              <ContextMenuSeparator />
              <ContextMenuLabel>Zoom</ContextMenuLabel>
              <ContextMenuRadioGroup value={zoom} onValueChange={setZoom}>
                <ContextMenuRadioItem value="50">50%</ContextMenuRadioItem>
                <ContextMenuRadioItem value="100">100%</ContextMenuRadioItem>
                <ContextMenuRadioItem value="200">200%</ContextMenuRadioItem>
              </ContextMenuRadioGroup>
            </ContextMenuContent>
          </ContextMenu>
        </Preview>
      </Section>

      <Section title="Usage">
        <Code>{`import { ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem, ContextMenuShortcut, ContextMenuSeparator } from "@/components/ui/context-menu"

<ContextMenu>
  <ContextMenuTrigger className="grid h-40 place-items-center rounded-2xl bg-surface-container-high">
    Right-click here
  </ContextMenuTrigger>
  <ContextMenuContent className="w-60">
    <ContextMenuItem>
      <Icon name="content_copy" /> Copy <ContextMenuShortcut>⌘C</ContextMenuShortcut>
    </ContextMenuItem>
    <ContextMenuSeparator />
    <ContextMenuItem variant="destructive">
      <Icon name="delete" /> Delete
    </ContextMenuItem>
  </ContextMenuContent>
</ContextMenu>`}</Code>
      </Section>

      <Section
        title="Props"
        description="Everything else is Radix Context Menu (onOpenChange, modal, onSelect, checked, value…). The trigger is not a button: give it tabIndex={0} if keyboard users should reach it, since Shift+F10 and the Menu key open the menu from whatever has focus."
      >
        <PropsTable
          rows={[
            ["ContextMenuItem variant", '"default" | "destructive"', '"default"', ""],
            ["inset", "boolean", "false", "Item, Label, SubTrigger: align with items that have an icon"],
            ["ContextMenuShortcut", "string", "", 'Drawn as keycaps: "⌘C" and "⌘ C" become two caps'],
          ]}
        />
      </Section>
    </>
  )
}
