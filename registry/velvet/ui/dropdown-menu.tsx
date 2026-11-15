"use client"

import * as React from "react"
import { DropdownMenu as DropdownMenuPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { Icon } from "@/registry/velvet/ui/icon"
import { KbdShortcut, splitKeys } from "@/registry/velvet/ui/kbd"
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
export const menuPad = PAD
export const menuItem = cn(
  "relative flex h-10 cursor-pointer items-center gap-3 rounded-[calc(var(--radius-xl)-var(--menu-pad))] px-3 type-body-md outline-none select-none",
  // a hairline of space between rows, so neighbouring highlighted or selected rows stay separate pills
  "[&:not(:first-child)]:mt-0.5",
  "[--icon-size:20px] [--icon-opsz:20] [&_[data-slot=icon]]:text-muted-foreground",
  "transition-colors duration-100 data-highlighted:bg-foreground/[0.07] active:bg-foreground/[0.11]",
  // once the menu's sliding pill is measured (data-pill on the content), the pill draws the highlight
  "group-data-pill/menu:data-highlighted:bg-transparent group-data-pill/menu:data-[state=open]:bg-transparent",
  "data-disabled:pointer-events-none data-disabled:opacity-40",
  "data-inset:pl-11"
)
const item = menuItem

/** Groups and labels, shared by the Velvet menus (Dropdown, Context, Menubar). */
export const menuLabel = "px-3 pt-2 pb-1.5 type-label-md text-muted-foreground data-inset:pl-11"
/** The spacer that stands in for a separator line (no lines in menus). */
export const menuSpacer = "my-0 h-2 shrink-0 bg-transparent"
/** Sub-menu surface: sits beside its trigger. */
export const menuSubSurface = cn(floatingSurface, PAD, "min-w-44 overflow-hidden")

/**
 * Shortcut drawn as keycaps, like CommandShortcut ("⌘N" or "⌘ N" become
 * separate caps). Built on KbdShortcut; used by ContextMenu and Menubar.
 */
export { splitKeys }

export function MenuKeycaps({ className, children, slot, ...props }: React.ComponentProps<"span"> & { slot: string }) {
  return (
    <KbdShortcut data-slot={slot} className={cn("ml-auto shrink-0 pl-4", className)} {...props}>
      {children}
    </KbdShortcut>
  )
}

type Pill = { x: number; y: number; w: number; h: number; destructive: boolean; shown: boolean }

/**
 * The raised pill that springs between highlighted rows of a menu. Radix marks
 * the active row with data-highlighted (and keeps a sub-menu's trigger open),
 * so the pill follows those attributes. Measured with offset geometry, so the
 * menu's own open animation (a scale) does not skew it. Until it is measured
 * the rows draw their own highlight. Attach `ref` to the menu content (which
 * must be `relative isolate` and carry `group/menu`) and render <MenuPill/>.
 */
export function useMenuPill(forwarded?: React.Ref<HTMLDivElement>) {
  const own = React.useRef<HTMLDivElement | null>(null)
  const [pill, setPill] = React.useState<(Pill & { moved: boolean }) | null>(null)

  const ref = React.useCallback(
    (node: HTMLDivElement | null) => {
      own.current = node
      if (typeof forwarded === "function") forwarded(node)
      else if (forwarded) (forwarded as React.RefObject<HTMLDivElement | null>).current = node
    },
    [forwarded]
  )

  React.useLayoutEffect(() => {
    const menu = own.current
    if (!menu) return
    let frame = 0
    const measure = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const row =
          menu.querySelector<HTMLElement>("[data-highlighted]:not([data-disabled])") ??
          menu.querySelector<HTMLElement>('[data-slot$="sub-trigger"][data-state=open]')
        if (!row) return setPill((p) => (p && p.shown ? { ...p, shown: false } : p))
        const next = {
          x: row.offsetLeft,
          y: row.offsetTop,
          w: row.offsetWidth,
          h: row.offsetHeight,
          destructive: row.dataset.variant === "destructive",
          shown: true,
        }
        setPill((p) =>
          p && p.shown && p.x === next.x && p.y === next.y && p.w === next.w && p.h === next.h && p.destructive === next.destructive
            ? p
            : { ...next, moved: p !== null }
        )
      })
    }
    measure()
    const mo = new MutationObserver(measure)
    mo.observe(menu, { subtree: true, childList: true, attributes: true, attributeFilter: ["data-highlighted", "data-state"] })
    const ro = new ResizeObserver(measure)
    ro.observe(menu)
    return () => {
      cancelAnimationFrame(frame)
      mo.disconnect()
      ro.disconnect()
    }
  }, [])

  return { ref, pill, pillAttr: pill ? "" : undefined }
}

export function MenuPill({ pill }: { pill: ReturnType<typeof useMenuPill>["pill"] }) {
  return (
    <div
      aria-hidden
      data-slot="menu-indicator"
      className={cn(
        "pointer-events-none absolute top-0 left-0 -z-10 rounded-[calc(var(--radius-xl)-var(--menu-pad))] bg-surface-container-low shadow-e1 dark:bg-surface-bright",
        "transition-[translate,width,height,opacity,background-color] duration-[420ms,420ms,420ms,150ms,150ms] ease-(--ease-spring-bouncy) motion-reduce:transition-none",
        pill?.destructive && "bg-destructive/10 shadow-none dark:bg-destructive/15",
        (!pill || !pill.shown) && "opacity-0",
        pill && !pill.moved && "transition-none"
      )}
      style={pill ? { translate: `${pill.x}px ${pill.y}px`, width: pill.w, height: pill.h } : undefined}
    />
  )
}

/** The chosen option, filled in with the tonal container (radio items, Select, Combobox). */
export const menuItemSelected = cn(
  "data-[state=checked]:bg-secondary data-[state=checked]:text-secondary-foreground data-[state=checked]:data-highlighted:bg-secondary",
  "data-[state=checked]:data-highlighted:shadow-[inset_0_0_0_100vmax_color-mix(in_oklch,var(--foreground)_6%,transparent)]"
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

function DropdownMenuContent({ className, sideOffset = 6, collisionPadding = 8, children, ref, ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Content>) {
  const menu = useMenuPill(ref)
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        ref={menu.ref}
        data-slot="dropdown-menu-content"
        data-pill={menu.pillAttr}
        sideOffset={sideOffset}
        collisionPadding={collisionPadding}
        className={cn(
          floatingSurface,
          PAD,
          "group/menu relative isolate max-h-(--radix-dropdown-menu-content-available-height) min-w-48 overflow-x-hidden overflow-y-auto origin-(--radix-dropdown-menu-content-transform-origin)",
          className
        )}
        {...props}
      >
        <MenuPill pill={menu.pill} />
        {children}
      </DropdownMenuPrimitive.Content>
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
export function MenuIndicator({ children }: { children: React.ReactNode }) {
  return (
    <span className="grid size-5 shrink-0 place-items-center">
      <DropdownMenuPrimitive.ItemIndicator forceMount className="grid place-items-center">
        {children}
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
  )
}

export const menuCheck = (
  <Icon
    name="check"
    weight={600}
    className="text-foreground! scale-50 opacity-0 transition-[scale,opacity] duration-[396ms] ease-(--ease-spring-bouncy) [[data-state=checked]_&]:scale-100 [[data-state=checked]_&]:opacity-100"
  />
)

function DropdownMenuCheckboxItem({ className, children, ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem>) {
  return (
    <DropdownMenuPrimitive.CheckboxItem data-slot="dropdown-menu-checkbox-item" className={cn(item, className)} {...props}>
      <MenuIndicator>{menuCheck}</MenuIndicator>
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
        menuItemSelected,
        className
      )}
      {...props}
    >
      <MenuIndicator>{menuCheck}</MenuIndicator>
      {children}
    </DropdownMenuPrimitive.RadioItem>
  )
}

function DropdownMenuLabel({ className, inset, ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Label> & { inset?: boolean }) {
  return (
    <DropdownMenuPrimitive.Label
      data-slot="dropdown-menu-label"
      data-inset={inset || undefined}
      className={cn(menuLabel, className)}
      {...props}
    />
  )
}

function DropdownMenuSeparator({ className, ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
  return <DropdownMenuPrimitive.Separator data-slot="dropdown-menu-separator" className={cn(menuSpacer, className)} {...props} />
}

function DropdownMenuShortcut({ className, ...props }: React.ComponentProps<"span">) {
  return <MenuKeycaps slot="dropdown-menu-shortcut" className={className} {...props} />
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

function DropdownMenuSubContent({ className, sideOffset = 4, collisionPadding = 8, children, ref, ...props }: React.ComponentProps<typeof DropdownMenuPrimitive.SubContent>) {
  const menu = useMenuPill(ref)
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.SubContent
        ref={menu.ref}
        data-slot="dropdown-menu-sub-content"
        data-pill={menu.pillAttr}
        sideOffset={sideOffset}
        collisionPadding={collisionPadding}
        className={cn(menuSubSurface, "group/menu relative isolate origin-(--radix-dropdown-menu-content-transform-origin)", className)}
        {...props}
      >
        <MenuPill pill={menu.pill} />
        {children}
      </DropdownMenuPrimitive.SubContent>
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
