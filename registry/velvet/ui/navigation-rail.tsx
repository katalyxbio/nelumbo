"use client"

import * as React from "react"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"
import { Icon, type IconName } from "@/registry/velvet/ui/icon"

/**
 * Velvet Navigation Rail (Material 3 Expressive style)
 *
 * Side navigation for medium and large screens: 3 to 7 destinations, an
 * optional menu button and FAB at the top, and an optional footer.
 *
 *   <NavigationRail aria-label="Main" expanded={open}>
 *     <NavigationRailHeader>
 *       <IconButton icon={open ? "menu_open" : "menu"} label="Menu" onClick={toggle} />
 *       <Fab icon="edit" label="Compose" extended={open} />
 *     </NavigationRailHeader>
 *     <NavigationRailItem asChild icon="inbox" label="Inbox" active badge={12}>
 *       <Link href="/inbox" />
 *     </NavigationRailItem>
 *     …
 *   </NavigationRail>
 *
 * - Collapsed (80px): the icon sits in a 56 x 32 pill with the label below.
 *   The active pill grows out from the center and its icon fills in.
 * - `expanded` (220px): the label moves beside the icon in a compact 40px
 *   row. An item with a `description` (a second line, shown only when
 *   expanded) grows to 56px to fit it.
 *   The width eases on the smooth spring; labels cross-fade.
 * - Items are links (`href`, or `asChild` with your router's Link) or
 *   buttons (`onClick`). The active one gets aria-current="page".
 * - `badge`: a count, or `true` for a dot.
 */
type RailContext = { expanded: boolean }
const Ctx = React.createContext<RailContext>({ expanded: false })

type NavigationRailProps = React.ComponentProps<"nav"> & { expanded?: boolean }

function NavigationRail({ className, expanded = false, children, ...props }: NavigationRailProps) {
  return (
    <Ctx.Provider value={{ expanded }}>
      <nav
        data-slot="navigation-rail"
        data-expanded={expanded || undefined}
        className={cn(
          "group/rail flex h-full shrink-0 flex-col gap-1 overflow-x-hidden overflow-y-auto py-4",
          "w-20 data-expanded:w-[13.75rem]",
          "transition-[width] duration-[519ms] ease-(--ease-spring) motion-reduce:transition-none",
          className
        )}
        {...props}
      >
        {children}
      </nav>
    </Ctx.Provider>
  )
}

/** Menu button and FAB, lined up with the items' icons and pills. */
function NavigationRailHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="navigation-rail-header"
      className={cn(
        // 12px in: a 56px FAB is centered in the 80px rail and lines up with the item pills when
        // expanded; smaller buttons get 8px more so their icon lines up with the item icons.
        "mb-6 flex flex-col items-start gap-5 px-3 [&>:not([data-slot=fab])]:ml-2",
        className
      )}
      {...props}
    />
  )
}

/** Pushes its content to the bottom of the rail (e.g. settings). */
function NavigationRailFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="navigation-rail-footer" className={cn("mt-auto flex flex-col gap-1 pt-4", className)} {...props} />
}

type NavigationRailItemProps = Omit<React.ComponentProps<"a">, "children"> & {
  icon: IconName
  label: string
  /** Second line under the label, shown only when expanded (e.g. "3 unread"). Makes the row 56px. */
  description?: string
  active?: boolean
  badge?: number | boolean
  disabled?: boolean
  /** Render as your own link component: pass it as the only child. */
  asChild?: boolean
  children?: React.ReactElement
  onClick?: React.MouseEventHandler<HTMLElement>
}

function NavigationRailItem({ className, icon, label, description, active = false, badge, disabled, asChild, href, children, ...props }: NavigationRailItemProps) {
  const { expanded } = React.useContext(Ctx)
  const Comp: React.ElementType = asChild ? Slot.Root : href ? "a" : "button"
  const showBadge = badge !== undefined && badge !== false
  const count = typeof badge === "number" ? (badge > 99 ? "99+" : String(badge)) : null

  // announced with the label, e.g. "Inbox, 12 new"
  // announced from content after the label, e.g. "Inbox, 12 new"
  const badgeSr = showBadge ? <span className="sr-only">{`, ${count ? `${count} new` : "new"}`}</span> : null

  const badgeEl = showBadge && (
    <span
      aria-hidden
      data-slot="navigation-rail-badge"
      className={cn(
        "rounded-full bg-destructive text-destructive-foreground",
        count ? "grid h-4 min-w-4 place-items-center px-1 text-[0.6875rem] leading-none font-semibold tabular-nums" : "size-1.5"
      )}
    >
      {count}
    </span>
  )

  // the pill: 56 x 32 around the icon, or the whole row when expanded (40px, 56px with a description)
  const pill = (
    <span
      className={cn(
        "relative flex h-8 w-14 shrink-0 items-center justify-center rounded-full",
        "transition-[width,height,padding] duration-[519ms] ease-(--ease-spring) motion-reduce:transition-none",
        description ? "group-data-expanded/rail:h-14" : "group-data-expanded/rail:h-10",
        "group-data-expanded/rail:w-full group-data-expanded/rail:justify-start group-data-expanded/rail:px-4"
      )}
    >
      {/* active indicator: grows from the center */}
      <span
        aria-hidden
        className={cn(
          "absolute inset-0 rounded-full bg-secondary",
          "scale-x-[0.4] opacity-0 transition-[scale,opacity] duration-[396ms] ease-(--ease-spring-snappy) motion-reduce:transition-none",
          "group-data-active/item:scale-x-100 group-data-active/item:opacity-100"
        )}
      />
      {/* hover / press layer */}
      <span
        aria-hidden
        className="absolute inset-0 rounded-full bg-foreground opacity-0 transition-opacity duration-150 group-hover/item:opacity-[0.07] group-active/item:opacity-[0.12] group-focus-visible/item:opacity-[0.1]"
      />
      <span className="relative grid place-items-center">
        <Icon
          name={icon}
          className="text-muted-foreground transition-colors group-hover/item:text-foreground group-data-active/item:text-secondary-foreground"
        />
        {/* badge on the icon (collapsed), or at the end of the row (expanded) */}
        <span
          className={cn(
            "absolute -top-1 left-[calc(100%-6px)] transition-opacity duration-200",
            count ? "" : "top-0 left-[calc(100%-2px)]",
            expanded && "opacity-0"
          )}
        >
          {badgeEl}
        </span>
      </span>
      <span
        aria-hidden={!expanded || undefined}
        className={cn(
          "relative flex min-w-0 flex-col text-left transition-opacity",
          expanded ? "ml-3 flex-1 opacity-100 delay-100 duration-300" : "w-0 flex-none opacity-0 duration-100"
        )}
      >
        <span className="truncate type-label-lg text-foreground">{label}</span>
        {description && <span className="truncate type-body-sm text-muted-foreground group-data-active/item:text-secondary-foreground/75">{description}</span>}
      </span>
      {expanded && showBadge && <span className="relative ml-2 shrink-0">{badgeEl}</span>}
    </span>
  )
  // label below the pill (collapsed)
  const below = (
    <span
      aria-hidden={expanded || undefined}
      className={cn(
        "max-w-full truncate px-1 text-center type-label-md transition-[opacity,height] duration-200",
        "text-muted-foreground group-hover/item:text-foreground group-data-active/item:font-semibold group-data-active/item:text-foreground",
        expanded ? "h-0 opacity-0" : "h-4 opacity-100 delay-75"
      )}
    >
      {label}
    </span>
  )

  return (
    <Comp
      data-slot="navigation-rail-item"
      data-active={active || undefined}
      aria-current={active ? "page" : undefined}
      href={asChild ? undefined : href}
      type={!asChild && !href ? "button" : undefined}
      disabled={!asChild && !href ? disabled : undefined}
      aria-disabled={(asChild || href) && disabled ? true : undefined}
      className={cn(
        "group/item relative flex w-full shrink-0 cursor-pointer flex-col items-center gap-1 px-3 py-1 outline-none select-none",
        "transition-[padding] duration-[519ms] ease-(--ease-spring)",
        "group-data-expanded/rail:gap-0 group-data-expanded/rail:py-0",
        "[--icon-size:24px] [--icon-opsz:24] data-active:[--icon-fill:1]",
        "focus-visible:[&>span:first-child]:outline-2 focus-visible:[&>span:first-child]:outline-offset-2 focus-visible:[&>span:first-child]:outline-ring",
        "disabled:pointer-events-none disabled:opacity-40 aria-disabled:pointer-events-none aria-disabled:opacity-40",
        className
      )}
      {...props}
    >
      {pill}
      {below}
      {asChild && <Slot.Slottable>{children}</Slot.Slottable>}
      {badgeSr}
    </Comp>
  )
}

export { NavigationRail, NavigationRailHeader, NavigationRailFooter, NavigationRailItem, type NavigationRailProps, type NavigationRailItemProps }
