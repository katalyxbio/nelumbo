"use client"

import * as React from "react"
import { Command as CommandPrimitive, useCommandState } from "cmdk"

import { cn } from "@/lib/utils"
import { Icon } from "@/registry/velvet/ui/icon"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/registry/velvet/ui/dialog"

/**
 * Velvet Command (built on cmdk 1.x and Velvet's Dialog)
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

function CommandInput({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Input>) {
  return (
    <div
      data-slot="command-input-wrapper"
      className="mx-2 mt-2 mb-1 flex h-12 shrink-0 items-center gap-3 rounded-lg px-3 has-[input:focus-visible]:outline-2 has-[input:focus-visible]:-outline-offset-2 has-[input:focus-visible]:outline-ring"
    >
      <Icon name="search" size={22} className="text-muted-foreground" />
      <CommandPrimitive.Input
        data-slot="command-input"
        className={cn(
          "flex h-10 w-full min-w-0 bg-transparent type-body-lg text-foreground outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-40",
          className
        )}
        {...props}
      />
    </div>
  )
}

function CommandList({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.List>) {
  return (
    <CommandPrimitive.List
      data-slot="command-list"
      className={cn(
        "max-h-[min(22rem,70dvh)] scroll-py-2 overflow-x-hidden overflow-y-auto overscroll-contain px-2 pb-2 outline-none transition-[height] duration-200 ease-(--ease-standard)",
        className
      )}
      {...props}
    />
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
        "[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pt-3 [&_[cmdk-group-heading]]:pb-1.5 [&_[cmdk-group-heading]]:type-label-md [&_[cmdk-group-heading]]:text-muted-foreground",
        // groups are separated by space, not lines
        "[&+[data-slot=command-group]]:mt-1",
        className
      )}
      {...props}
    />
  )
}

function CommandItem({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Item>) {
  return (
    <CommandPrimitive.Item
      data-slot="command-item"
      className={cn(
        "state-layer relative flex min-h-12 cursor-default items-center gap-3 rounded-lg px-3 py-2 type-body-lg text-foreground outline-none select-none",
        // highlighted row: the next surface tone up from the container
        "data-[selected=true]:bg-surface-container-highest",
        // leading icon: list-item size and tone
        "[&>[data-slot=icon]]:shrink-0 [&>[data-slot=icon]]:text-muted-foreground data-[selected=true]:[&>[data-slot=icon]]:text-foreground",
        "data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-40 data-[disabled=true]:after:hidden",
        className
      )}
      {...props}
    />
  )
}

function CommandShortcut({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="command-shortcut"
      className={cn(
        "ml-auto inline-flex h-6 min-w-6 shrink-0 items-center justify-center rounded-sm bg-surface-container-lowest px-1.5 font-sans type-label-sm tracking-wider text-muted-foreground",
        className
      )}
      {...props}
    />
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
