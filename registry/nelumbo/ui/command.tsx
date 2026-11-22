"use client"

import * as React from "react"
import { Command as CommandPrimitive, useCommandState } from "cmdk"

import { cn } from "@/lib/utils"
import { Icon } from "@/registry/nelumbo/ui/icon"
import { KbdShortcut } from "@/registry/nelumbo/ui/kbd"
import { SearchField, searchInputClasses, setNativeValue } from "@/registry/nelumbo/ui/search"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/registry/nelumbo/ui/dialog"

/**
 * Nelumbo Command (built on cmdk 1.x and Nelumbo's Dialog)
 *
 * API-compatible with shadcn's Command (Command, CommandDialog, CommandInput,
 * CommandList, CommandEmpty, CommandGroup, CommandItem, CommandShortcut,
 * CommandSeparator), plus CommandLoading.
 *
 *   <Command>
 *     <CommandInput placeholder="Search actions…" />
 *     <CommandList>
 *       <CommandEmpty>No results.</CommandEmpty>
 *       <CommandGroup heading="Create">
 *         <CommandItem onSelect={() => newFile()}>
 *           <Icon name="note_add" />
 *           New file
 *           <CommandShortcut>⌘N</CommandShortcut>
 *         </CommandItem>
 *         <CommandItem disabled>
 *           <Icon name="upload" />
 *           Upload
 *         </CommandItem>
 *       </CommandGroup>
 *       <CommandSeparator />
 *       <CommandGroup heading="Go to">…</CommandGroup>
 *     </CommandList>
 *   </Command>
 *
 *   <CommandDialog open={open} onOpenChange={setOpen}>
 *     <CommandInput placeholder="Type a command…" />
 *     <CommandList>…</CommandList>
 *   </CommandDialog>
 *
 * - The container is a rounded surface-container-high with the menu elevation.
 * - CommandInput is Nelumbo's search field (SearchField from search.tsx): a pill with
 *   the search icon, and a clear button that springs in while there is text. It empties
 *   cmdk's search, controlled or not, and keeps focus. The input is type="search".
 * - Filtering, arrow keys, Home/End and Enter come from cmdk.
 *   Escape closes CommandDialog (Radix Dialog).
 * - The highlighted item gets a surface-container-highest tone and the state
 *   layer. Items are 48px tall; a leading Icon sits at the list icon size.
 * - No lines anywhere: groups are separated by spacing, and CommandSeparator
 *   is an empty spacer (it is hidden while the user is searching).
 * - CommandEmpty and CommandLoading sit inside CommandList as disabled options,
 *   which keeps the listbox valid when no results are shown.
 * - CommandDialog's title and description are visually hidden by default, so
 *   screen readers hear what the dialog is. Pass `title` / `description` to name it.
 */

function Command({ className, ...props }: React.ComponentProps<typeof CommandPrimitive>) {
  return (
    <CommandPrimitive
      data-slot="command"
      className={cn(
        "flex h-full w-full min-w-0 flex-col overflow-hidden rounded-2xl bg-surface-container-high text-foreground shadow-e3 outline-none",
        className
      )}
      {...props}
    />
  )
}

type CommandDialogProps = React.ComponentProps<typeof Dialog> & {
  /** Accessible name of the dialog. Visually hidden. */
  title?: string
  /** Accessible description. Visually hidden. */
  description?: string
  /** Applied to the inner Command. */
  className?: string
}

function CommandDialog({
  title = "Command palette",
  description = "Search for a command to run...",
  className,
  children,
  ...props
}: CommandDialogProps) {
  return (
    <Dialog {...props}>
      <DialogContent
        data-slot="command-dialog-content"
        showCloseButton={false}
        className="max-w-xl gap-0 bg-transparent p-0 shadow-none"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <Command className={cn("min-h-0", className)}>{children}</Command>
      </DialogContent>
    </Dialog>
  )
}

function CommandInput({ className, ref, ...props }: React.ComponentProps<typeof CommandPrimitive.Input>) {
  const own = React.useRef<HTMLInputElement>(null)
  const hasValue = useCommandState((s) => s.search.length > 0)

  // cmdk renders type="text"; the palette's field is a search field
  React.useLayoutEffect(() => {
    if (own.current) own.current.type = "search"
  }, [])

  return (
    <SearchField
      data-slot="command-input-wrapper"
      size="sm"
      embedded
      hasValue={hasValue}
      // type into it again right away, whether the search is controlled or not
      onClear={() => {
        const input = own.current
        if (!input) return
        setNativeValue(input, "")
        input.focus()
      }}
      className={cn(
        "mx-2 mt-2 mb-1 w-auto bg-surface-container-highest",
        // the palette keeps focus in its field the whole time, so a ring would never
        // go away; the caret and the icon turning foreground mark it instead
        "has-[input:focus-visible]:outline-none"
      )}
    >
      <CommandPrimitive.Input
        data-slot="command-input"
        ref={(node: HTMLInputElement | null) => {
          own.current = node
          if (typeof ref === "function") ref(node)
          else if (ref) (ref as React.RefObject<HTMLInputElement | null>).current = node
        }}
        className={cn(searchInputClasses, "disabled:opacity-40", className)}
        {...props}
      />
    </SearchField>
  )
}

/**
 * The highlighted row sits on a raised pill. It springs from row to row as
 * the arrow keys move; under the pointer it stays put on each row instead of
 * chasing the cursor. Until it is measured, the row draws its own fill.
 */
function CommandList({ className, children, ref, ...props }: React.ComponentProps<typeof CommandPrimitive.List>) {
  const own = React.useRef<HTMLDivElement>(null)
  const [pill, setPill] = React.useState<{ y: number; x: number; w: number; h: number; moved: boolean } | null>(null)

  // the pill glides for the keyboard only
  const byPointer = React.useRef(false)

  React.useLayoutEffect(() => {
    const list = own.current
    if (!list) return
    const root = list.closest<HTMLElement>("[cmdk-root]") ?? list
    const key = () => (byPointer.current = false)
    const pointer = () => (byPointer.current = true)
    root.addEventListener("keydown", key, true)
    root.addEventListener("pointermove", pointer)
    let frame = 0
    const measure = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const sizer = list.querySelector<HTMLElement>("[cmdk-list-sizer]")
        const row = list.querySelector<HTMLElement>('[cmdk-item][data-selected="true"]')
        if (!sizer || !row) return setPill(null)
        const r = row.getBoundingClientRect()
        const o = sizer.getBoundingClientRect()
        // the dialog opens with a zoom, so screen rects are scaled; divide it back out
        const k = sizer.offsetWidth ? o.width / sizer.offsetWidth : 1
        const next = { x: (r.left - o.left) / k, y: (r.top - o.top) / k, w: row.offsetWidth, h: row.offsetHeight }
        setPill((p) =>
          p && p.x === next.x && p.y === next.y && p.w === next.w && p.h === next.h ? p : { ...next, moved: p !== null && !byPointer.current }
        )
      })
    }
    measure()
    const mo = new MutationObserver(measure)
    mo.observe(list, { subtree: true, childList: true, attributes: true, attributeFilter: ["data-selected", "hidden"] })
    const ro = new ResizeObserver(measure)
    ro.observe(list)
    return () => {
      cancelAnimationFrame(frame)
      root.removeEventListener("keydown", key, true)
      root.removeEventListener("pointermove", pointer)
      mo.disconnect()
      ro.disconnect()
    }
  }, [])

  return (
    <CommandPrimitive.List
      ref={(node: HTMLDivElement | null) => {
        own.current = node
        if (typeof ref === "function") ref(node)
        else if (ref) (ref as React.RefObject<HTMLDivElement | null>).current = node
      }}
      data-slot="command-list"
      data-pill={pill ? "" : undefined}
      className={cn(
        "group/command-list max-h-[min(22rem,70dvh)] scroll-py-2 overflow-x-hidden overflow-y-auto overscroll-contain px-2 pb-2 outline-none transition-[height] duration-200 ease-(--ease-standard)",
        "[&>[cmdk-list-sizer]]:relative [&>[cmdk-list-sizer]]:isolate",
        className
      )}
      {...props}
    >
      <div
        aria-hidden
        data-slot="command-indicator"
        className={cn(
          "pointer-events-none absolute top-0 left-0 -z-10 rounded-[0.875rem] bg-surface-container-lowest shadow-e1 dark:bg-surface-bright",
          pill?.moved && "transition-[translate,width,height] duration-[420ms] ease-(--ease-spring-bouncy) motion-reduce:transition-none",
          !pill && "hidden"
        )}
        style={pill ? { translate: `${pill.x}px ${pill.y}px`, width: pill.w, height: pill.h } : undefined}
      />
      {children}
    </CommandPrimitive.List>
  )
}

/**
 * Shown when nothing matches. It is a disabled, live option: a listbox must own
 * options or groups, and this keeps it valid while the list has none. Disabled
 * options are skipped by the arrow keys, and the message is announced as it changes.
 */
function CommandEmpty({ className, children, ...props }: React.ComponentProps<typeof CommandPrimitive.Empty>) {
  return (
    <CommandPrimitive.Empty asChild {...props}>
      <div
        role="option"
        aria-disabled="true"
        aria-selected="false"
        aria-live="polite"
        data-slot="command-empty"
        className={cn("py-8 text-center type-body-md text-muted-foreground", className)}
      >
        {children}
      </div>
    </CommandPrimitive.Empty>
  )
}

/**
 * Shown while results load. It sits inside CommandList as a disabled, live
 * option (see CommandEmpty for why). cmdk's own Loading is a progress bar, which
 * a listbox does not allow.
 */
function CommandLoading({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      role="option"
      aria-disabled="true"
      aria-selected="false"
      aria-live="polite"
      data-slot="command-loading"
      className={cn("flex items-center justify-center gap-3 py-8 type-body-md text-muted-foreground", className)}
      {...props}
    >
      {children ?? (
        <>
          <Icon name="progress_activity" size={20} className="animate-spin text-primary motion-reduce:animate-none" />
          <span>Searching…</span>
        </>
      )}
    </div>
  )
}

function CommandGroup({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Group>) {
  return (
    <CommandPrimitive.Group
      data-slot="command-group"
      className={cn(
        "overflow-hidden p-0 text-foreground",
        // heading: a label above the rows, no rule
        "[&_[cmdk-group-heading]]:px-2.5 [&_[cmdk-group-heading]]:pt-3 [&_[cmdk-group-heading]]:pb-1.5 [&_[cmdk-group-heading]]:type-label-md [&_[cmdk-group-heading]]:text-muted-foreground",
        // groups are separated by space, not lines
        "[&+[data-slot=command-group]]:mt-1",
        className
      )}
      {...props}
    />
  )
}

/**
 * A row. A leading Icon sits on a tonal tile that turns inverse, fills its
 * glyph and pops when the row is highlighted.
 */
function CommandItem({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Item>) {
  return (
    <CommandPrimitive.Item
      data-slot="command-item"
      className={cn(
        "relative flex min-h-13 cursor-default items-center gap-3 rounded-[0.875rem] px-2 py-1.5 type-body-lg text-foreground outline-none select-none",
        // the row fills itself until the list's sliding pill is measured
        "data-[selected=true]:bg-surface-container-lowest data-[selected=true]:shadow-e1 dark:data-[selected=true]:bg-surface-bright",
        "group-data-pill/command-list:data-[selected=true]:bg-transparent group-data-pill/command-list:data-[selected=true]:shadow-none",
        "dark:group-data-pill/command-list:data-[selected=true]:bg-transparent",
        // leading icon on a tile: the tile is a spread shadow, so the glyph box stays untouched
        "[--icon-size:20px] [--icon-opsz:20] [--tile:var(--surface-container-highest)]",
        "[&>[data-slot=icon]]:m-2 [&>[data-slot=icon]]:shrink-0 [&>[data-slot=icon]]:rounded-[2px] [&>[data-slot=icon]]:text-muted-foreground",
        "[&>[data-slot=icon]]:bg-(--tile) [&>[data-slot=icon]]:shadow-[0_0_0_8px_var(--tile)]",
        "[&>[data-slot=icon]]:transition-[background-color,box-shadow,color,scale,border-radius] [&>[data-slot=icon]]:duration-[200ms,200ms,200ms,420ms,420ms]",
        "[&>[data-slot=icon]]:ease-[var(--ease-standard),var(--ease-standard),var(--ease-standard),var(--ease-spring-bouncy),var(--ease-spring)]",
        "data-[selected=true]:[--tile:var(--inverse-surface)] data-[selected=true]:[&>[data-slot=icon]]:text-inverse-foreground",
        "data-[selected=true]:[&>[data-slot=icon]]:scale-105 data-[selected=true]:[&>[data-slot=icon]]:rounded-full data-[selected=true]:[--icon-fill:1]",
        "motion-reduce:[&>[data-slot=icon]]:transition-none",
        "data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-40",
        className
      )}
      {...props}
    />
  )
}

function CommandShortcut({ className, children, ...props }: React.ComponentProps<"span">) {
  // "⌘N" or "⌘ N" become separate keycaps
  return (
    <KbdShortcut data-slot="command-shortcut" className={cn("ml-auto shrink-0", className)} {...props}>
      {children}
    </KbdShortcut>
  )
}

/**
 * An empty spacer between groups, hidden while the user is searching. It is a
 * plain div rather than cmdk's separator: cmdk gives that role="separator",
 * which is not allowed inside the listbox.
 */
function CommandSeparator({ className, ...props }: React.ComponentProps<"div">) {
  const searching = useCommandState((s) => s.search.length > 0)
  if (searching) return null
  return <div data-slot="command-separator" aria-hidden className={cn("h-2 shrink-0", className)} {...props} />
}

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandLoading,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
  type CommandDialogProps,
}
