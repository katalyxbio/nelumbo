"use client"

import * as React from "react"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandLoading,
  CommandSeparator,
  CommandShortcut,
} from "@/registry/velvet/ui/command"
import { Button } from "@/registry/velvet/ui/button"
import { Icon, type IconName } from "@/registry/velvet/ui/icon"
import { Code, PageHeader, Preview, Section } from "@/components/docs/primitives"

type Action = { label: string; icon: IconName; shortcut?: string; disabled?: boolean }

const CREATE: Action[] = [
  { label: "New file", icon: "note_add", shortcut: "⌘N" },
  { label: "New folder", icon: "create_new_folder" },
  { label: "Upload", icon: "upload", shortcut: "⌘U", disabled: true },
]

const GO_TO: Action[] = [
  { label: "Home", icon: "home", shortcut: "⌘H" },
  { label: "Recent files", icon: "history" },
  { label: "Shared with me", icon: "group" },
  { label: "Settings", icon: "settings", shortcut: "⌘," },
]

const ACCOUNT: Action[] = [
  { label: "Dark theme", icon: "dark_mode" },
  { label: "Keyboard shortcuts", icon: "keyboard" },
  { label: "Sign out", icon: "logout" },
]

/**
 * The docs' PropsTable, with a focusable scroll region so it passes axe on phones.
 */
function PropsTable({ rows }: { rows: [string, string, string, string][] }) {
  return (
    <div
      role="region"
      aria-label="Props"
      tabIndex={0}
      className="overflow-x-auto rounded-2xl border border-border outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      <table className="w-full min-w-[640px] text-left type-body-sm">
        <thead className="bg-surface-container-low type-label-md text-muted-foreground dark:bg-surface-container">
          <tr>
            <th className="px-4 py-3">Prop</th>
            <th className="px-4 py-3">Type</th>
            <th className="px-4 py-3">Default</th>
            <th className="px-4 py-3">Notes</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map(([name, type, def, n]) => (
            <tr key={name}>
              <td className="px-4 py-3 font-mono type-label-md">{name}</td>
              <td className="px-4 py-3 font-mono type-label-sm text-muted-foreground">{type}</td>
              <td className="px-4 py-3 font-mono type-label-sm">{def}</td>
              <td className="px-4 py-3 type-body-sm text-muted-foreground">{n}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Rows({ items, onRun }: { items: Action[]; onRun?: (label: string) => void }) {
  return items.map((a) => (
    <CommandItem key={a.label} value={a.label} disabled={a.disabled} onSelect={() => onRun?.(a.label)}>
      <Icon name={a.icon} />
      {a.label}
      {a.shortcut && <CommandShortcut>{a.shortcut}</CommandShortcut>}
    </CommandItem>
  ))
}

export default function CommandPage() {
  const [open, setOpen] = React.useState(false)
  const [ran, setRan] = React.useState<string | null>(null)
  const [emptySearch, setEmptySearch] = React.useState("Quantum")

  // ⌘K / Ctrl+K toggles the palette from anywhere on the page
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  const run = (label: string) => {
    setRan(label)
    setOpen(false)
  }

  return (
    <>
      <PageHeader eyebrow="Component · 37" title="Command palette">
        A search box over a list of actions. Type to filter, move with the arrow keys, press Enter to run.
        Groups hold related actions, each row can carry an icon and a shortcut, and the palette can live inline
        on a page or open as a dialog from anywhere.
      </PageHeader>

      <Section title="Install">
        <Code>{`npx shadcn@latest add @velvet/command`}</Code>
      </Section>

      <Section
        title="Inline"
        description="Groups are separated by space, not lines. The highlighted row follows the pointer and the arrow keys. Disabled rows stay visible at 40%."
      >
        <Preview className="justify-center">
          <Command aria-label="Actions" className="w-full max-w-md">
            <CommandInput placeholder="Search actions…" />
            <CommandList>
              <CommandEmpty>No actions match your search.</CommandEmpty>
              <CommandGroup heading="Create">
                <Rows items={CREATE} onRun={run} />
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup heading="Go to">
                <Rows items={GO_TO} onRun={run} />
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup heading="Account">
                <Rows items={ACCOUNT} onRun={run} />
              </CommandGroup>
            </CommandList>
          </Command>
        </Preview>
        {ran && (
          <p className="type-body-md text-muted-foreground" role="status">
            Ran: {ran}
          </p>
        )}
      </Section>

      <Section
        title="Dialog"
        description="CommandDialog opens over the page from a button or from ⌘K (Ctrl K elsewhere). Escape closes it. Its title and description are for screen readers only."
      >
        <Preview className="items-center justify-center gap-4">
          <Button variant="outline" onClick={() => setOpen(true)}>
            <Icon name="search" />
            Open palette
            <CommandShortcut className="ml-1">⌘K</CommandShortcut>
          </Button>
        </Preview>
        <CommandDialog open={open} onOpenChange={setOpen} title="Command palette" description="Search for an action to run.">
          <CommandInput placeholder="Type a command or search…" />
          <CommandList>
            <CommandEmpty>No actions match your search.</CommandEmpty>
            <CommandGroup heading="Create">
              <Rows items={CREATE} onRun={run} />
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Go to">
              <Rows items={GO_TO} onRun={run} />
            </CommandGroup>
          </CommandList>
        </CommandDialog>
      </Section>

      <Section
        title="Empty state"
        description="CommandEmpty shows when nothing matches. The search is controlled here; clear it to see the list again."
      >
        <Preview className="justify-center">
          <Command aria-label="Search files" className="w-full max-w-md">
            <CommandInput placeholder="Search files…" value={emptySearch} onValueChange={setEmptySearch} />
            <CommandList>
              <CommandEmpty>
                <span className="flex flex-col items-center gap-2">
                  <Icon name="search_off" size={28} />
                  No files match “{emptySearch}”.
                </span>
              </CommandEmpty>
              <CommandGroup heading="Recent">
                <CommandItem>
                  <Icon name="description" />
                  Q3 planning notes
                </CommandItem>
                <CommandItem>
                  <Icon name="folder" />
                  Brand assets
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </Preview>
      </Section>

      <Section title="Loading" description="CommandLoading shows inside the list while results are fetched. It is announced politely, and the spinner stops under reduced motion.">
        <Preview className="justify-center">
          <Command aria-label="Search people" className="w-full max-w-md">
            <CommandInput placeholder="Search people…" />
            <CommandList>
              <CommandLoading />
            </CommandList>
          </Command>
        </Preview>
      </Section>

      <Section title="Usage">
        <Code>{`import {
  Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput,
  CommandItem, CommandList, CommandSeparator, CommandShortcut,
} from "@/components/ui/command"

const [open, setOpen] = React.useState(false)

React.useEffect(() => {
  const onKey = (e: KeyboardEvent) => {
    if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      setOpen((o) => !o)
    }
  }
  window.addEventListener("keydown", onKey)
  return () => window.removeEventListener("keydown", onKey)
}, [])

<CommandDialog open={open} onOpenChange={setOpen}>
  <CommandInput placeholder="Type a command…" />
  <CommandList>
    <CommandEmpty>No results.</CommandEmpty>
    <CommandGroup heading="Create">
      <CommandItem onSelect={() => { newFile(); setOpen(false) }}>
        <Icon name="note_add" />
        New file
        <CommandShortcut>⌘N</CommandShortcut>
      </CommandItem>
    </CommandGroup>
    <CommandSeparator />
  </CommandList>
</CommandDialog>`}</Code>
      </Section>

      <Section title="Props">
        <PropsTable
          rows={[
            ["Command", "", "", "Rounded surface-container-high container with menu elevation. Extra props go to cmdk"],
            ["CommandDialog open / onOpenChange", "boolean / (open) => void", "", "Controlled, like Dialog"],
            ["CommandDialog title / description", "string", '"Command palette"', "Visually hidden, read by screen readers"],
            ["CommandInput placeholder / value / onValueChange", "string", "", "Controlled search text"],
            ["CommandList", "", "", "Scrolls past about 22rem (70dvh)"],
            ["CommandEmpty", "ReactNode", "", "Shown when nothing matches"],
            ["CommandLoading", "ReactNode", "Spinner and “Searching…”", "Put it inside CommandList while results load"],
            ["CommandGroup heading", "ReactNode", "", "Muted label above the rows, no rule"],
            ["CommandItem onSelect / value", "(value) => void / string", "", "Enter or click runs it; value defaults to its text"],
            ["CommandItem disabled", "boolean", "false", "Shown at 40%, can't be highlighted"],
            ["CommandItem keywords", "string[]", "", "Extra terms that match the search"],
            ["CommandShortcut", "ReactNode", "", "Keycap on the trailing edge"],
            ["CommandSeparator", "", "", "Empty spacer between groups, hidden while searching"],
          ]}
        />
      </Section>
    </>
  )
}
