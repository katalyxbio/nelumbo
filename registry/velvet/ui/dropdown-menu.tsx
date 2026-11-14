"use client"

import * as React from "react"
import { DropdownMenu as DropdownMenuPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { Icon } from "@/registry/velvet/ui/icon"
import { floatingSurface } from "@/registry/velvet/ui/popover"

/**
 * Velvet Dropdown Menu (built on Radix Dropdown Menu)
 *
 * API-compatible with shadcn's DropdownMenu: Content, Group, Label, Item
 * (`inset`, `variant="destructive"`), CheckboxItem, RadioGroup, RadioItem,
 * Separator, Shortcut, Sub, SubTrigger, SubContent.
 *
 * The menu grows out of its trigger on the spring. Items are 40px tall and
 * their corners follow the menu's (concentric), Material Symbols icons sit in
 * a 20px slot, and the chosen radio item is filled in with the tonal
 * container, not just checked.
 *
 *   <DropdownMenu>
 *     <DropdownMenuTrigger asChild><IconButton icon="more_vert" label="More" /></DropdownMenuTrigger>
 *     <DropdownMenuContent align="end">
 *       <DropdownMenuItem><Icon name="edit" /> Rename <DropdownMenuShortcut>F2</DropdownMenuShortcut></DropdownMenuItem>
 *       <DropdownMenuSeparator />
 *       <DropdownMenuItem variant="destructive"><Icon name="delete" /> Delete</DropdownMenuItem>
 *     </DropdownMenuContent>
 *   </DropdownMenu>
 */

// Item corners: the menu radius minus its padding, so the curves are concentric.
const PAD = "p-1.5 [--menu-pad:0.375rem]"
const item = cn(
  "relative flex h-10 cursor-pointer items-center gap-3 rounded-[calc(var(--radius-xl)-var(--menu-pad))] px-3 type-body-md outline-none select-none",
  "[--icon-size:20px] [--icon-opsz:20] [&_[data-slot=icon]]:text-muted-foreground",
  "transition-colors duration-100 data-highlighted:bg-foreground/[0.07] active:bg-foreground/[0.11]",
  "data-disabled:pointer-events-none data-disabled:opacity-40",
  "data-inset:pl-11"
)

function DropdownMenu(props: React.ComponentProps<typeof DropdownMenuPrimitive.Root>) {
  return <DropdownMenuPrimitive.Root data-slot="dropdown-menu" {...props} />
}

function DropdownMenuPortal(props: React.ComponentProps<typeof DropdownMenuPrimitive.Portal>) {
  return <DropdownMenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />
}

function DropdownMenuTrigger(props: React.ComponentProps<typeof DropdownMenuPrimitive.Trigger>) {
  return <DropdownMenuPrimitive.Trigger data-slot="dropdown-menu-trigger" {...props} />
}

function DropdownMenuContent({ className, sideOffset = 6, collisionPadding = 8, ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Content>) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        data-slot="dropdown-menu-content"
        sideOffset={sideOffset}
        collisionPadding={collisionPadding}
        className={cn(
          floatingSurface,
          PAD,
          "max-h-(--radix-dropdown-menu-content-available-height) min-w-48 overflow-x-hidden overflow-y-auto origin-(--radix-dropdown-menu-content-transform-origin)",
          className
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  )
}

function DropdownMenuGroup(props: React.ComponentProps<typeof DropdownMenuPrimitive.Group>) {
  return <DropdownMenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />
}

type ItemProps = React.ComponentProps<typeof DropdownMenuPrimitive.Item> & {
  inset?: boolean
  variant?: "default" | "destructive"
}

function DropdownMenuItem({ className, inset, variant = "default", ...props }: ItemProps) {
  return (
    <DropdownMenuPrimitive.Item
      data-slot="dropdown-menu-item"
      data-inset={inset || undefined}
      data-variant={variant}
      className={cn(
        item,
        variant === "destructive" &&
          "text-destructive data-highlighted:bg-destructive/10 active:bg-destructive/15 [&_[data-slot=icon]]:text-destructive!",
        className
      )}
      {...props}
    />
  )
}

/** Leading slot that shows a check while selected. */
function Indicator({ children }: { children: React.ReactNode }) {
  return (
    <span className="grid size-5 shrink-0 place-items-center">
      <DropdownMenuPrimitive.ItemIndicator forceMount className="grid place-items-center">
        {children}
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
  )
}

const check = (
  <Icon
    name="check"
    weight={600}
    className="text-foreground! scale-50 opacity-0 transition-[scale,opacity] duration-[396ms] ease-(--ease-spring-bouncy) [[data-state=checked]_&]:scale-100 [[data-state=checked]_&]:opacity-100"
  />
)

function DropdownMenuCheckboxItem({ className, children, ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem>) {
  return (
    <DropdownMenuPrimitive.CheckboxItem data-slot="dropdown-menu-checkbox-item" className={cn(item, className)} {...props}>
      <Indicator>{check}</Indicator>
      {children}
    </DropdownMenuPrimitive.CheckboxItem>
  )
}

function DropdownMenuRadioGroup(props: React.ComponentProps<typeof DropdownMenuPrimitive.RadioGroup>) {
  return <DropdownMenuPrimitive.RadioGroup data-slot="dropdown-menu-radio-group" {...props} />
}

function DropdownMenuRadioItem({ className, children, ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.RadioItem>) {
  return (
    <DropdownMenuPrimitive.RadioItem
      data-slot="dropdown-menu-radio-item"
      className={cn(
        item,
        "data-[state=checked]:bg-secondary data-[state=checked]:text-secondary-foreground data-[state=checked]:data-highlighted:bg-secondary",
        "data-[state=checked]:data-highlighted:shadow-[inset_0_0_0_100vmax_color-mix(in_oklch,var(--foreground)_6%,transparent)]",
        className
      )}
      {...props}
    >
      <Indicator>{check}</Indicator>
      {children}
    </DropdownMenuPrimitive.RadioItem>
  )
}

function DropdownMenuLabel({ className, inset, ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Label> & { inset?: boolean }) {
  return (
    <DropdownMenuPrimitive.Label
      data-slot="dropdown-menu-label"
      data-inset={inset || undefined}
      className={cn("px-3 pt-2 pb-1.5 type-label-md text-muted-foreground data-inset:pl-11", className)}
      {...props}
    />
  )
}

function DropdownMenuSeparator({ className, ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
  return <DropdownMenuPrimitive.Separator data-slot="dropdown-menu-separator" className={cn("-mx-1.5 my-1.5 h-px bg-outline-variant", className)} {...props} />
}

function DropdownMenuShortcut({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-slot="dropdown-menu-shortcut" className={cn("ml-auto pl-4 type-label-md tracking-wider text-muted-foreground", className)} {...props} />
}

function DropdownMenuSub(props: React.ComponentProps<typeof DropdownMenuPrimitive.Sub>) {
  return <DropdownMenuPrimitive.Sub data-slot="dropdown-menu-sub" {...props} />
}

function DropdownMenuSubTrigger({ className, inset, children, ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.SubTrigger> & { inset?: boolean }) {
  return (
    <DropdownMenuPrimitive.SubTrigger
      data-slot="dropdown-menu-sub-trigger"
      data-inset={inset || undefined}
      className={cn(item, "data-[state=open]:bg-foreground/[0.07]", className)}
      {...props}
    >
      {children}
      <Icon name="chevron_right" className="ml-auto -mr-1" />
    </DropdownMenuPrimitive.SubTrigger>
  )
}

function DropdownMenuSubContent({ className, sideOffset = 4, collisionPadding = 8, ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.SubContent>) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.SubContent
        data-slot="dropdown-menu-sub-content"
        sideOffset={sideOffset}
        collisionPadding={collisionPadding}
        className={cn(floatingSurface, PAD, "min-w-44 overflow-hidden origin-(--radix-dropdown-menu-content-transform-origin)", className)}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  )
}

export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
}
