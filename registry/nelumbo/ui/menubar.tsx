"use client"

import * as React from "react"
import { Menubar as MenubarPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { Icon } from "@/registry/nelumbo/ui/icon"
import { floatingSurface } from "@/registry/nelumbo/ui/popover"
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
} from "@/registry/nelumbo/ui/dropdown-menu"

/**
 * Nelumbo Menubar (built on Radix Menubar)
 *
 * API-compatible with shadcn's Menubar: Menubar, MenubarMenu, MenubarTrigger,
 * MenubarContent, MenubarItem (`inset`, `variant="destructive"`),
 * MenubarCheckboxItem, MenubarRadioGroup, MenubarRadioItem, MenubarLabel,
 * MenubarSeparator, MenubarShortcut, MenubarGroup, MenubarSub,
 * MenubarSubTrigger, MenubarSubContent, MenubarPortal.
 *
 * The bar is a tonal track. The open (or keyboard-focused) menu is a raised
 * segment that springs from trigger to trigger as you move across the bar with
 * the pointer or Left/Right. Menus share their rows, check marks, keycap
 * shortcuts and surface with Nelumbo's DropdownMenu, so they get the same
 * sliding highlight; the separator is a gap, not a line.
 *
 *   <Menubar>
 *     <MenubarMenu>
 *       <MenubarTrigger>File</MenubarTrigger>
 *       <MenubarContent>
 *         <MenubarItem><Icon name="note_add" /> New tab <MenubarShortcut>⌘T</MenubarShortcut></MenubarItem>
 *         <MenubarSeparator />
 *         <MenubarItem variant="destructive">Quit</MenubarItem>
 *       </MenubarContent>
 *     </MenubarMenu>
 *   </Menubar>
 */

function Menubar({ className, children, ref, ...props }: React.ComponentProps<typeof MenubarPrimitive.Root>) {
  const own = React.useRef<HTMLDivElement | null>(null)
  const setRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      own.current = node
      if (typeof ref === "function") ref(node)
      else if (ref) (ref as React.RefObject<HTMLDivElement | null>).current = node
    },
    [ref]
  )
  const [seg, setSeg] = React.useState<{ x: number; y: number; w: number; h: number; shown: boolean; moved: boolean } | null>(null)

  React.useLayoutEffect(() => {
    const bar = own.current
    if (!bar) return
    let frame = 0
    const measure = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const t =
          bar.querySelector<HTMLElement>('[data-slot=menubar-trigger][data-state=open]') ??
          bar.querySelector<HTMLElement>("[data-slot=menubar-trigger][data-highlighted]")
        if (!t) return setSeg((s) => (s && s.shown ? { ...s, shown: false } : s))
        const next = { x: t.offsetLeft, y: t.offsetTop, w: t.offsetWidth, h: t.offsetHeight, shown: true }
        setSeg((s) => (s && s.shown && s.x === next.x && s.y === next.y && s.w === next.w && s.h === next.h ? s : { ...next, moved: s !== null }))
      })
    }
    measure()
    const mo = new MutationObserver(measure)
    mo.observe(bar, { subtree: true, childList: true, attributes: true, attributeFilter: ["data-state", "data-highlighted"] })
    const ro = new ResizeObserver(measure)
    ro.observe(bar)
    return () => {
      cancelAnimationFrame(frame)
      mo.disconnect()
      ro.disconnect()
    }
  }, [])

  return (
    <MenubarPrimitive.Root
      ref={setRef}
      data-slot="menubar"
      data-segment={seg ? "" : undefined}
      className={cn(
        "group/menubar relative isolate inline-flex h-12 items-center gap-0.5 rounded-[1.25rem] bg-surface-container-high p-1 dark:bg-surface-container",
        className
      )}
      {...props}
    >
      <div
        aria-hidden
        data-slot="menubar-indicator"
        className={cn(
          "pointer-events-none absolute top-0 left-0 -z-10 rounded-[1rem] bg-surface-container-lowest shadow-e1 dark:bg-surface-container-highest",
          "transition-[translate,width,height,opacity] duration-[420ms,420ms,420ms,150ms] ease-(--ease-spring-bouncy) motion-reduce:transition-none",
          (!seg || !seg.shown) && "opacity-0",
          seg && !seg.moved && "transition-none"
        )}
        style={seg ? { translate: `${seg.x}px ${seg.y}px`, width: seg.w, height: seg.h } : undefined}
      />
      {children}
    </MenubarPrimitive.Root>
  )
}

function MenubarMenu(props: React.ComponentProps<typeof MenubarPrimitive.Menu>) {
  return <MenubarPrimitive.Menu {...props} />
}

function MenubarGroup(props: React.ComponentProps<typeof MenubarPrimitive.Group>) {
  return <MenubarPrimitive.Group data-slot="menubar-group" {...props} />
}

function MenubarPortal(props: React.ComponentProps<typeof MenubarPrimitive.Portal>) {
  return <MenubarPrimitive.Portal {...props} />
}

function MenubarRadioGroup(props: React.ComponentProps<typeof MenubarPrimitive.RadioGroup>) {
  return <MenubarPrimitive.RadioGroup data-slot="menubar-radio-group" {...props} />
}

function MenubarTrigger({ className, ...props }: React.ComponentProps<typeof MenubarPrimitive.Trigger>) {
  return (
    <MenubarPrimitive.Trigger
      data-slot="menubar-trigger"
      className={cn(
        "tactile flex h-10 cursor-pointer items-center gap-2 rounded-[1rem] px-4 type-label-lg text-muted-foreground outline-none select-none",
        "[--icon-size:18px] [--icon-opsz:20]",
        "data-[state=open]:text-foreground data-highlighted:text-foreground",
        "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring",
        "data-disabled:pointer-events-none data-disabled:opacity-40",
        className
      )}
      {...props}
    />
  )
}

function MenubarContent({
  className,
  align = "start",
  alignOffset = -4,
  sideOffset = 8,
  collisionPadding = 8,
  children,
  ref,
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Content>) {
  const menu = useMenuPill(ref)
  return (
    <MenubarPrimitive.Portal>
      <MenubarPrimitive.Content
        ref={menu.ref}
        data-slot="menubar-content"
        data-pill={menu.pillAttr}
        align={align}
        alignOffset={alignOffset}
        sideOffset={sideOffset}
        collisionPadding={collisionPadding}
        className={cn(
          floatingSurface,
          menuPad,
          // no exit animation: while the old menu fades out, Radix opens the next one and its focus handling
          // dismisses it again, so sweeping across the bar with the arrow keys would close the menu
          "group/menu relative isolate data-[state=closed]:animate-none! max-h-(--radix-menubar-content-available-height) min-w-52 overflow-x-hidden overflow-y-auto origin-(--radix-menubar-content-transform-origin)",
          className
        )}
        {...props}
      >
        <MenuPill pill={menu.pill} />
        {children}
      </MenubarPrimitive.Content>
    </MenubarPrimitive.Portal>
  )
}

function MenubarItem({
  className,
  inset,
  variant = "default",
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Item> & { inset?: boolean; variant?: "default" | "destructive" }) {
  return (
    <MenubarPrimitive.Item
      data-slot="menubar-item"
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

function MenubarCheckboxItem({ className, children, ...props }: React.ComponentProps<typeof MenubarPrimitive.CheckboxItem>) {
  return (
    <MenubarPrimitive.CheckboxItem data-slot="menubar-checkbox-item" className={cn(menuItem, className)} {...props}>
      <MenuIndicator>{menuCheck}</MenuIndicator>
      {children}
    </MenubarPrimitive.CheckboxItem>
  )
}

function MenubarRadioItem({ className, children, ...props }: React.ComponentProps<typeof MenubarPrimitive.RadioItem>) {
  return (
    <MenubarPrimitive.RadioItem data-slot="menubar-radio-item" className={cn(menuItem, menuItemSelected, className)} {...props}>
      <MenuIndicator>{menuCheck}</MenuIndicator>
      {children}
    </MenubarPrimitive.RadioItem>
  )
}

function MenubarLabel({ className, inset, ...props }: React.ComponentProps<typeof MenubarPrimitive.Label> & { inset?: boolean }) {
  return <MenubarPrimitive.Label data-slot="menubar-label" data-inset={inset || undefined} className={cn(menuLabel, className)} {...props} />
}

/** A gap between groups. Nelumbo menus have no lines, so it draws nothing; it keeps role="separator". */
function MenubarSeparator({ className, ...props }: React.ComponentProps<typeof MenubarPrimitive.Separator>) {
  return <MenubarPrimitive.Separator data-slot="menubar-separator" className={cn(menuSpacer, className)} {...props} />
}

function MenubarShortcut(props: React.ComponentProps<"span">) {
  return <MenuKeycaps slot="menubar-shortcut" {...props} />
}

function MenubarSub(props: React.ComponentProps<typeof MenubarPrimitive.Sub>) {
  return <MenubarPrimitive.Sub data-slot="menubar-sub" {...props} />
}

function MenubarSubTrigger({ className, inset, children, ...props }: React.ComponentProps<typeof MenubarPrimitive.SubTrigger> & { inset?: boolean }) {
  return (
    <MenubarPrimitive.SubTrigger
      data-slot="menubar-sub-trigger"
      data-inset={inset || undefined}
      className={cn(menuItem, "data-[state=open]:bg-foreground/[0.07]", className)}
      {...props}
    >
      {children}
      <Icon name="chevron_right" className="ml-auto -mr-1" />
    </MenubarPrimitive.SubTrigger>
  )
}

function MenubarSubContent({ className, collisionPadding = 8, children, ref, ...props }: React.ComponentProps<typeof MenubarPrimitive.SubContent>) {
  const menu = useMenuPill(ref)
  return (
    <MenubarPrimitive.Portal>
      <MenubarPrimitive.SubContent
        ref={menu.ref}
        data-slot="menubar-sub-content"
        data-pill={menu.pillAttr}
        collisionPadding={collisionPadding}
        className={cn(menuSubSurface, "group/menu relative isolate origin-(--radix-menubar-content-transform-origin)", className)}
        {...props}
      >
        <MenuPill pill={menu.pill} />
        {children}
      </MenubarPrimitive.SubContent>
    </MenubarPrimitive.Portal>
  )
}

export {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarSeparator,
  MenubarLabel,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarPortal,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarGroup,
  MenubarSub,
  MenubarShortcut,
}
