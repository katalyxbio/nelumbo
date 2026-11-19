"use client"

import * as React from "react"
import { Toolbar, ToolbarButton, ToolbarFab, ToolbarSeparator, ToolbarToggleGroup, ToolbarToggleItem, useToolbarCollapse } from "@/registry/nelumbo/ui/toolbar"
import { ToggleGroup, ToggleGroupItem } from "@/registry/nelumbo/ui/toggle-group"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/registry/nelumbo/ui/dropdown-menu"
import { Icon } from "@/registry/nelumbo/ui/icon"
import { cn } from "@/lib/utils"
import { Code, PageHeader, PropsTable, Section } from "@/components/docs/primitives"

/** A bounded frame: demos never leave their box. */
function Frame({ className, children, label }: { className?: string; children: React.ReactNode; label?: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-2">
      {label && <p className="type-label-md text-muted-foreground">{label}</p>}
      <div className={cn("relative isolate overflow-hidden rounded-3xl bg-surface-container-low dark:bg-surface-container-lowest", className)}>{children}</div>
    </div>
  )
}

/** A neutral stand-in for an image or canvas. */
function CanvasMock({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("absolute inset-0 -z-10 bg-[radial-gradient(circle,var(--outline-variant)_1px,transparent_1.5px)] bg-[length:22px_22px]", className)}>
      <div className="absolute top-[12%] left-[10%] h-28 w-40 rotate-[-6deg] rounded-3xl bg-secondary" />
      <div className="absolute top-[18%] right-[14%] size-24 rounded-full bg-inverse-surface" />
      <div className="absolute top-[38%] left-[34%] h-20 w-48 rotate-[4deg] rounded-[2rem] bg-surface-container-highest" />
      <div className="absolute top-[8%] left-[46%] h-16 w-16 rounded-2xl bg-brand-container" />
    </div>
  )
}

function EditorDemo() {
  const [fmt, setFmt] = React.useState({ bold: false, italic: true, underline: false, list: false })
  const set = (k: keyof typeof fmt) => (v: boolean) => setFmt((f) => ({ ...f, [k]: v }))
  return (
    <Frame className="flex h-[26rem] flex-col">
      <div className="flex-1 overflow-hidden px-6 pt-6 sm:px-10">
        <p className="type-label-md text-muted-foreground">Studio notes</p>
        <h3 className="mt-1 type-headline-sm">Spring palette review</h3>
        <p className="mt-4 max-w-prose type-body-md text-muted-foreground">
          We tested the warm and cool neutrals against the new brand accent and kept the ones that hold their contrast in both themes.
        </p>
        <p
          className={cn(
            "mt-3 max-w-prose rounded-lg bg-secondary px-2 py-1 type-body-md text-secondary-foreground",
            fmt.bold && "font-bold",
            fmt.italic && "italic",
            fmt.underline && "underline",
            fmt.list && "list-item ms-5 list-disc"
          )}
        >
          Selected text takes the formatting from the toolbar below.
        </p>
      </div>
      <Toolbar aria-label="Format document" variant="docked" overflow>
        <ToolbarButton icon="undo" label="Undo" shortcut="⌘Z" />
        <ToolbarButton icon="redo" label="Redo" shortcut="⇧⌘Z" />
        <ToolbarSeparator />
        <ToolbarButton toggle icon="format_bold" label="Bold" shortcut="⌘B" pressed={fmt.bold} onPressedChange={set("bold")} />
        <ToolbarButton toggle icon="format_italic" label="Italic" shortcut="⌘I" pressed={fmt.italic} onPressedChange={set("italic")} />
        <ToolbarButton toggle icon="format_underlined" label="Underline" shortcut="⌘U" pressed={fmt.underline} onPressedChange={set("underline")} />
        <ToolbarSeparator />
        <ToolbarButton toggle icon="format_list_bulleted" label="Bulleted list" pressed={fmt.list} onPressedChange={set("list")} />
        <ToolbarButton icon="link" label="Insert link" />
      </Toolbar>
    </Frame>
  )
}

function CanvasDemo() {
  const [tool, setTool] = React.useState("brush")
  return (
    <Frame className="h-80">
      <CanvasMock />
      <div className="absolute inset-x-4 bottom-4 flex justify-center">
        <Toolbar aria-label="Canvas tools" variant="floating" overflow layoutClassName="pointer-events-auto">
          <ToolbarToggleGroup type="single" aria-label="Tool" value={tool} onValueChange={(v) => v && setTool(v)}>
            <ToolbarToggleItem value="brush" aria-label="Brush">
              <Icon name="brush" />
            </ToolbarToggleItem>
            <ToolbarToggleItem value="pen" aria-label="Pen">
              <Icon name="edit" />
            </ToolbarToggleItem>
            <ToolbarToggleItem value="eraser" aria-label="Eraser">
              <Icon name="ink_eraser" />
            </ToolbarToggleItem>
          </ToolbarToggleGroup>
          <ToolbarButton icon="undo" label="Undo" />
          <ToolbarButton icon="redo" label="Redo" />
          <ToolbarButton icon="layers" label="Layers" />
          <ToolbarFab icon="add" label="New shape" />
        </Toolbar>
      </div>
    </Frame>
  )
}

function SideDemo() {
  const [grid, setGrid] = React.useState(true)
  const [zoom, setZoom] = React.useState("fit")
  return (
    <Frame className="h-[26rem]">
      <CanvasMock />
      <div className="absolute inset-y-4 left-4 flex items-center">
        <Toolbar aria-label="View" variant="floating" orientation="vertical" layoutClassName="pointer-events-auto">
          <ToolbarButton icon="pan_tool" label="Pan" />
          <ToolbarButton toggle icon="grid_4x4" label="Show grid" pressed={grid} onPressedChange={setGrid} />
          <ToolbarSeparator />
          <ToolbarToggleGroup type="single" aria-label="Zoom" value={zoom} onValueChange={(v) => v && setZoom(v)}>
            <ToolbarToggleItem value="fit" aria-label="Fit to screen">
              <Icon name="fit_screen" />
            </ToolbarToggleItem>
            <ToolbarToggleItem value="in" aria-label="Zoom in">
              <Icon name="zoom_in" />
            </ToolbarToggleItem>
          </ToolbarToggleGroup>
          <ToolbarSeparator />
          <ToolbarButton icon="download" label="Export" />
        </Toolbar>
      </div>
      <div className="absolute inset-y-4 right-4 flex items-center">
        <Toolbar aria-label="Share" variant="floating" orientation="vertical" color="vibrant" edge="end" layoutClassName="pointer-events-auto">
          <ToolbarButton toggle icon="favorite" label="Like" />
          <ToolbarButton icon="chat_bubble" label="Comment" />
          <ToolbarButton icon="ios_share" label="Share" />
        </Toolbar>
      </div>
    </Frame>
  )
}

function ColorsDemo() {
  const bar = (color: "standard" | "vibrant" | "brand") => (
    <Toolbar aria-label={`${color} toolbar`} color={color} layoutClassName="pointer-events-auto">
      <ToolbarButton icon="share" label="Share" />
      <ToolbarButton toggle defaultPressed icon="favorite" label="Favorite" />
      <ToolbarButton toggle icon="bookmark" label="Bookmark" />
      <ToolbarSeparator />
      <ToolbarToggleGroup type="single" defaultValue="grid" aria-label={`${color} layout`}>
        <ToolbarToggleItem value="grid" aria-label="Grid">
          <Icon name="grid_view" />
        </ToolbarToggleItem>
        <ToolbarToggleItem value="list" aria-label="List">
          <Icon name="view_list" />
        </ToolbarToggleItem>
      </ToolbarToggleGroup>
    </Toolbar>
  )
  return (
    <Frame className="flex flex-col items-center gap-5 px-4 py-8">
      {bar("standard")}
      {bar("vibrant")}
      {bar("brand")}
    </Frame>
  )
}

function CollapseDemo() {
  const [mode, setMode] = React.useState<"shrink" | "hide">("shrink")
  const scroller = React.useRef<HTMLDivElement>(null)
  const collapsed = useToolbarCollapse(scroller)
  const [saved, setSaved] = React.useState(false)
  return (
    <div className="flex min-w-0 flex-col gap-3">
      <ToggleGroup type="single" value={mode} onValueChange={(v) => v && setMode(v as "shrink" | "hide")} aria-label="Collapse behavior" size="sm">
        <ToggleGroupItem value="shrink">Shrink</ToggleGroupItem>
        <ToggleGroupItem value="hide">Hide</ToggleGroupItem>
      </ToggleGroup>
      <Frame className="h-[26rem]" label="Scroll the article: it collapses while you scroll down and returns on the way up.">
        <div ref={scroller} tabIndex={0} aria-label="Article" role="region" className="h-[26rem] overflow-y-auto px-6 pt-6 pb-28 outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring">
          <h3 className="type-headline-sm">Designing with springs</h3>
          {Array.from({ length: 8 }, (_, i) => (
            <p key={i} className="mt-4 max-w-prose type-body-md text-muted-foreground">
              Motion that follows a damped spring feels physical because it starts fast and settles without passing its target. Tune stiffness for how quickly a control reacts and damping
              for how gently it lands, then reuse the same few curves everywhere.
            </p>
          ))}
        </div>
        <div className="pointer-events-none absolute inset-x-4 bottom-4 flex justify-center">
          <Toolbar aria-label="Article actions" collapsed={collapsed} collapse={mode} layoutClassName="pointer-events-auto">
            <ToolbarButton keep toggle icon="bookmark" label="Save" pressed={saved} onPressedChange={setSaved} />
            <ToolbarButton icon="share" label="Share" />
            <ToolbarButton icon="text_fields" label="Text size" />
            <ToolbarButton icon="headphones" label="Listen" />
            <ToolbarFab icon="chat" label="Comment" size="sm" />
          </Toolbar>
        </div>
      </Frame>
    </div>
  )
}

function OverflowDemo() {
  const [room, setRoom] = React.useState("wide")
  const [on, setOn] = React.useState({ bold: false, italic: false })
  const widths: Record<string, string> = { wide: "100%", medium: "20rem", narrow: "12.5rem" }
  return (
    <div className="flex min-w-0 flex-col gap-3">
      <ToggleGroup type="single" value={room} onValueChange={(v) => v && setRoom(v)} aria-label="Available room" size="sm">
        <ToggleGroupItem value="wide">Wide</ToggleGroupItem>
        <ToggleGroupItem value="medium">Medium</ToggleGroupItem>
        <ToggleGroupItem value="narrow">Narrow</ToggleGroupItem>
      </ToggleGroup>
      <Frame className="flex h-44 items-center justify-center px-4">
        <div style={{ width: widths[room] }} className="max-w-full transition-[width] duration-500 ease-(--ease-spring) motion-reduce:transition-none">
          <Toolbar aria-label="Overflowing toolbar" overflow>
            <ToolbarButton icon="undo" label="Undo" />
            <ToolbarButton icon="redo" label="Redo" />
            <ToolbarSeparator />
            <ToolbarButton toggle icon="format_bold" label="Bold" pressed={on.bold} onPressedChange={(v) => setOn((s) => ({ ...s, bold: v }))} />
            <ToolbarButton toggle icon="format_italic" label="Italic" pressed={on.italic} onPressedChange={(v) => setOn((s) => ({ ...s, italic: v }))} />
            <ToolbarSeparator />
            <ToolbarButton icon="link" label="Insert link" />
            <ToolbarButton icon="image" label="Insert image" />
            <ToolbarButton icon="comment" label="Comment" />
          </Toolbar>
        </div>
      </Frame>
    </div>
  )
}

const KEYS: [string, string][] = [
  ["Tab", "Moves focus into the toolbar, onto the last button you used, and out again on the next Tab. A toolbar is one tab stop."],
  ["Left / Right", "Horizontal toolbars: previous and next item. Focus wraps at the ends."],
  ["Up / Down", "Vertical toolbars: previous and next item."],
  ["Home / End", "First and last item."],
  ["Space / Enter", "Presses a button or flips a toggle. Toggles expose aria-pressed."],
  ["Escape", "Closes the overflow menu and returns focus to its button."],
]

export default function ToolbarPage() {
  return (
    <>
      <PageHeader eyebrow="Component 66" title="Toolbar">
        A toolbar groups the actions that apply to what is on screen. Docked, it is a full-width bar at the bottom of a surface; floating, it is a pill raised above content, optionally
        paired with a FAB. It has no shadcn equivalent, so there is nothing to swap in. It is one tab stop, and the arrow keys move between its buttons.
      </PageHeader>

      <Section title="Install">
        <Code>{`npx shadcn@latest add @nelumbo/toolbar`}</Code>
      </Section>

      <Section
        title="Docked"
        description="Full width, 64px tall, a tonal surface with the items spread evenly. Pressed toggles fill their glyph and morph from a pill into a rounded square. This one uses overflow: shrink the window and the buttons that no longer fit move into a More menu."
      >
        <EditorDemo />
      </Section>

      <Section
        title="Floating with a FAB"
        description="A pill with an e3 shadow and its items packed. ToolbarFab lives in the same JSX but renders beside the bar, outside role=toolbar. The tool picker is a connected toggle group: the selected tool swells and its neighbours give way."
      >
        <CanvasDemo />
      </Section>

      <Section
        title="Vertical"
        description='orientation="vertical" turns the pill into a column for the edge of a screen. Arrow keys switch to Up and Down, and tooltips open inward (set edge="end" on the trailing edge). The right one is vibrant.'
      >
        <SideDemo />
      </Section>

      <Section
        title="Colors"
        description="Standard sits on the surface ladder and pressed items turn inverse. Vibrant is inverse itself, with the pressed item flipping to the light fill. Brand uses the accent container. Each has a toggle group."
      >
        <ColorsDemo />
      </Section>

      <Section
        title="Collapse on scroll"
        description="Give a floating toolbar a collapsed state, usually from useToolbarCollapse. Shrink folds every item that is not marked keep into a small pill on a spring; hide slides the bar away and makes it inert. Docked toolbars always hide."
      >
        <CollapseDemo />
      </Section>

      <Section
        title="Overflow"
        description="Set overflow and the toolbar measures its room. Items that do not fit move, in order, into a More menu; toggles show as checked items. Resize the demo to watch it."
      >
        <OverflowDemo />
        <Frame className="flex h-44 items-center justify-center px-4">
          <Toolbar aria-label="Manual overflow">
            <ToolbarButton icon="edit" label="Edit" />
            <ToolbarButton icon="content_copy" label="Copy" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <ToolbarButton icon="more_horiz" label="More actions" />
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top">
                <DropdownMenuItem>
                  <Icon name="drive_file_move" /> Move
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Icon name="archive" /> Archive
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </Toolbar>
        </Frame>
        <Code>{`// Manual pattern: your own menu in the last slot
<Toolbar aria-label="Actions">
  <ToolbarButton icon="edit" label="Edit" />
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <ToolbarButton icon="more_horiz" label="More" />
    </DropdownMenuTrigger>
    <DropdownMenuContent>{/* ... */}</DropdownMenuContent>
  </DropdownMenu>
</Toolbar>`}</Code>
      </Section>

      <Section title="Keyboard">
        <dl className="grid max-w-2xl grid-cols-[auto_1fr] gap-x-6 gap-y-3 type-body-md">
          {KEYS.map(([k, d]) => (
            <React.Fragment key={k}>
              <dt>
                <kbd className="inline-flex h-6 items-center rounded-[0.4375rem] bg-surface-container-lowest px-2 font-sans type-label-md text-muted-foreground shadow-[inset_0_-1.5px_0_var(--outline-variant)] dark:bg-surface-container-highest">{k}</kbd>
              </dt>
              <dd className="text-muted-foreground">{d}</dd>
            </React.Fragment>
          ))}
        </dl>
      </Section>

      <Section title="Usage">
        <Code>{`<Toolbar aria-label="Text formatting" variant="floating">
  <ToolbarButton toggle icon="format_bold" label="Bold" shortcut="⌘B" pressed={bold} onPressedChange={setBold} />
  <ToolbarSeparator />
  <ToolbarToggleGroup type="single" defaultValue="left" aria-label="Alignment">
    <ToolbarToggleItem value="left" aria-label="Align left"><Icon name="format_align_left" /></ToolbarToggleItem>
    <ToolbarToggleItem value="center" aria-label="Align center"><Icon name="format_align_center" /></ToolbarToggleItem>
  </ToolbarToggleGroup>
  <ToolbarFab icon="edit" label="Compose" />
</Toolbar>`}</Code>
      </Section>

      <Section title="Props">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-3">
            <h3 className="type-title-md">Toolbar</h3>
            <PropsTable
              rows={[
                ["aria-label", "string", "required", "Names the toolbar for screen readers"],
                ["variant", '"docked" | "floating"', '"floating"', "Docked: full width, 64px, tonal. Floating: raised pill"],
                ["orientation", '"horizontal" | "vertical"', '"horizontal"', "Sets aria-orientation and the arrow keys"],
                ["color", '"standard" | "vibrant" | "brand"', '"standard"', "Surface, inverse, or accent container"],
                ["edge", '"start" | "end"', '"start"', "Vertical: which edge it sits on (tooltips, hide direction)"],
                ["collapsed", "boolean", "false", "Collapse state, e.g. from useToolbarCollapse"],
                ["collapse", '"shrink" | "hide"', '"shrink"', "Docked toolbars always hide"],
                ["overflow", "boolean", "false", "Move items that do not fit into a More menu"],
                ["overflowLabel", "string", '"More"', "Accessible name of the More button"],
                ["layoutClassName", "string", "", "Classes for the wrapper that holds the bar and its FAB"],
              ]}
            />
          </div>
          <div className="flex flex-col gap-3">
            <h3 className="type-title-md">ToolbarButton</h3>
            <PropsTable
              rows={[
                ["icon", "IconName", "", "Material Symbols name"],
                ["label", "string", "required", "Accessible name and tooltip"],
                ["toggle", "boolean", "false", "Pressed state with aria-pressed and the shape morph. Use controlled pressed if it can overflow"],
                ["selectedIcon", "IconName", "", "Glyph shown while pressed"],
                ["keep", "boolean", "false", 'Stays visible when the toolbar collapses ("shrink")'],
                ["shortcut", "string", "", "Keys shown in the tooltip"],
                ["...", "IconButton props", "", "size, width, onClick, disabled, loading"],
              ]}
            />
          </div>
          <div className="flex flex-col gap-3">
            <h3 className="type-title-md">ToolbarToggleGroup, ToolbarToggleItem, ToolbarSeparator, ToolbarFab, useToolbarCollapse</h3>
            <PropsTable
              rows={[
                ["ToolbarToggleGroup", 'type="single" | "multiple"', "required", "Radix toggle group props. Place groups before buttons that may overflow: groups never move into the menu"],
                ["ToolbarToggleItem", "value, aria-label", "required", "Icon-only item; give it an aria-label"],
                ["ToolbarSeparator", "", "", "Space only, no line"],
                ["ToolbarFab", "FabProps", "", "icon and label required. Color follows the toolbar. Renders beside the bar, as its own tab stop"],
                ["useToolbarCollapse", "(ref?, { threshold }) => boolean", "", "Collapses on scroll down, returns on scroll up. No ref follows the window"],
              ]}
              note="Notes"
            />
          </div>
        </div>
      </Section>
    </>
  )
}
