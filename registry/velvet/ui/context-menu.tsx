"use client"

import * as React from "react"
import { ContextMenu as ContextMenuPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { Icon } from "@/registry/velvet/ui/icon"
import { floatingSurface } from "@/registry/velvet/ui/popover"
import {
  MenuIndicator,
  MenuKeycaps,
  MenuPill,
  menuCheck,
  menuItem,
  menuItemSelected,
  menuLabel,
  menuPad,
  menuSpacer,
  menuSubSurface,
  useMenuPill,
} from "@/registry/velvet/ui/dropdown-menu"

/**
 * Velvet Context Menu (built on Radix Context Menu)
 *
 * API-compatible with shadcn's ContextMenu: Trigger, Content, Group, Label,
 * Item (`inset`, `variant="destructive"`), CheckboxItem, RadioGroup, RadioItem,
 * Separator, Shortcut, Sub, SubTrigger, SubContent, Portal.
 *
 * It shares its rows, labels, check marks and surface with Velvet's
 * DropdownMenu. The menu springs open from the pointer, a raised pill slides
 * between rows, shortcuts are keycaps, and the separator is a gap, not a line.
 * Opens on right-click, a long-press on touch, and Shift+F10 / the Menu key.
 *
 *   <ContextMenu>
 *     <ContextMenuTrigger className="grid h-40 place-items-center rounded-2xl bg-surface-container-low">
 *       Right-click here
 *     </ContextMenuTrigger>
 *     <ContextMenuContent className="w-60">
 *       <ContextMenuItem><Icon name="content_copy" /> Copy <ContextMenuShortcut>⌘C</ContextMenuShortcut></ContextMenuItem>
 *       <ContextMenuSeparator />
 *       <ContextMenuItem variant="destructive"><Icon name="delete" /> Delete</ContextMenuItem>
 *     </ContextMenuContent>
 *   </ContextMenu>
 */

function ContextMenu(props: React.ComponentProps<typeof ContextMenuPrimitive.Root>) {
  return <ContextMenuPrimitive.Root data-slot="context-menu" {...props} />
}

function ContextMenuTrigger(props: React.ComponentProps<typeof ContextMenuPrimitive.Trigger>) {
  return <ContextMenuPrimitive.Trigger data-slot="context-menu-trigger" {...props} />
}

function ContextMenuGroup(props: React.ComponentProps<typeof ContextMenuPrimitive.Group>) {
  return <ContextMenuPrimitive.Group data-slot="context-menu-group" {...props} />
}

function ContextMenuPortal(props: React.ComponentProps<typeof ContextMenuPrimitive.Portal>) {
  return <ContextMenuPrimitive.Portal data-slot="context-menu-portal" {...props} />
}

function ContextMenuSub(props: React.ComponentProps<typeof ContextMenuPrimitive.Sub>) {
  return <ContextMenuPrimitive.Sub data-slot="context-menu-sub" {...props} />
}

function ContextMenuRadioGroup(props: React.ComponentProps<typeof ContextMenuPrimitive.RadioGroup>) {
  return <ContextMenuPrimitive.RadioGroup data-slot="context-menu-radio-group" {...props} />
}

function ContextMenuContent({ className, collisionPadding = 8, children, ref, ...props }: React.ComponentProps<typeof ContextMenuPrimitive.Content>) {
  const menu = useMenuPill(ref)
  return (
    <ContextMenuPrimitive.Portal>
      <ContextMenuPrimitive.Content
        ref={menu.ref}
        data-slot="context-menu-content"
        data-pill={menu.pillAttr}
        collisionPadding={collisionPadding}
        className={cn(
          floatingSurface,
          menuPad,
          "group/menu relative isolate max-h-(--radix-context-menu-content-available-height) min-w-48 overflow-x-hidden overflow-y-auto origin-(--radix-context-menu-content-transform-origin)",
          className
        )}
        {...props}
      >
        <MenuPill pill={menu.pill} />
        {children}
      </ContextMenuPrimitive.Content>
    </ContextMenuPrimitive.Portal>
  )
}

function ContextMenuItem({
  className,
  inset,
  variant = "default",
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Item> & { inset?: boolean; variant?: "default" | "destructive" }) {
  return (
    <ContextMenuPrimitive.Item
      data-slot="context-menu-item"
      data-inset={inset || undefined}
      data-variant={variant}
      className={cn(
        menuItem,
        variant === "destructive" &&
          "text-destructive data-highlighted:bg-destructive/10 active:bg-destructive/15 [&_[data-slot=icon]]:text-destructive!",
        className
      )}
      {...props}
    />
  )
}

function ContextMenuCheckboxItem({ className, children, ...props }: React.ComponentProps<typeof ContextMenuPrimitive.CheckboxItem>) {
  return (
    <ContextMenuPrimitive.CheckboxItem data-slot="context-menu-checkbox-item" className={cn(menuItem, className)} {...props}>
      <MenuIndicator>{menuCheck}</MenuIndicator>
      {children}
    </ContextMenuPrimitive.CheckboxItem>
  )
}

function ContextMenuRadioItem({ className, children, ...props }: React.ComponentProps<typeof ContextMenuPrimitive.RadioItem>) {
  return (
    <ContextMenuPrimitive.RadioItem data-slot="context-menu-radio-item" className={cn(menuItem, menuItemSelected, className)} {...props}>
      <MenuIndicator>{menuCheck}</MenuIndicator>
      {children}
    </ContextMenuPrimitive.RadioItem>
  )
}

function ContextMenuLabel({ className, inset, ...props }: React.ComponentProps<typeof ContextMenuPrimitive.Label> & { inset?: boolean }) {
  return <ContextMenuPrimitive.Label data-slot="context-menu-label" data-inset={inset || undefined} className={cn(menuLabel, className)} {...props} />
}

/** A gap between groups. Velvet menus have no lines, so it draws nothing; it keeps role="separator". */
function ContextMenuSeparator({ className, ...props }: React.ComponentProps<typeof ContextMenuPrimitive.Separator>) {
  return <ContextMenuPrimitive.Separator data-slot="context-menu-separator" className={cn(menuSpacer, className)} {...props} />
}

function ContextMenuShortcut(props: React.ComponentProps<"span">) {
  return <MenuKeycaps slot="context-menu-shortcut" {...props} />
}

function ContextMenuSubTrigger({ className, inset, children, ...props }: React.ComponentProps<typeof ContextMenuPrimitive.SubTrigger> & { inset?: boolean }) {
  return (
    <ContextMenuPrimitive.SubTrigger
      data-slot="context-menu-sub-trigger"
      data-inset={inset || undefined}
      className={cn(menuItem, "data-[state=open]:bg-foreground/[0.07]", className)}
      {...props}
    >
      {children}
      <Icon name="chevron_right" className="ml-auto -mr-1" />
    </ContextMenuPrimitive.SubTrigger>
  )
}

function ContextMenuSubContent({ className, collisionPadding = 8, children, ref, ...props }: React.ComponentProps<typeof ContextMenuPrimitive.SubContent>) {
  const menu = useMenuPill(ref)
  return (
    <ContextMenuPrimitive.Portal>
      <ContextMenuPrimitive.SubContent
        ref={menu.ref}
        data-slot="context-menu-sub-content"
        data-pill={menu.pillAttr}
        collisionPadding={collisionPadding}
        className={cn(menuSubSurface, "group/menu relative isolate origin-(--radix-context-menu-content-transform-origin)", className)}
        {...props}
      >
        <MenuPill pill={menu.pill} />
        {children}
      </ContextMenuPrimitive.SubContent>
    </ContextMenuPrimitive.Portal>
  )
}

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuCheckboxItem,
  ContextMenuRadioItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuGroup,
  ContextMenuPortal,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuRadioGroup,
}
