"use client"

import * as React from "react"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"
import { Icon, type IconName } from "@/registry/nelumbo/ui/icon"

/**
 * Nelumbo List (Material 3 style)
 *
 *   <List>
 *     <ListSubheader>Today</ListSubheader>
 *     <ListItem leading={<Avatar name="Maya Kowalski" />} description="Can we move the review?" meta="9:41">
 *       Maya Kowalski
 *     </ListItem>
 *     <ListItem icon="wifi" description="Connected" trailing={<Switch aria-label="Wi-Fi" />}>Wi-Fi</ListItem>
 *   </List>
 *
 *   <List variant="segmented">                      // rows on their own tiles, grouped
 *     <ListItem href="/settings/display" icon="palette" trailingIcon="chevron_right">Display</ListItem>
 *   </List>
 *
 * A ListItem's children are its title. Around it:
 * - `leading`: an avatar, image or checkbox; or `icon` for a Material Symbol.
 * - `overline` above the title, `description` below (clamped to 2 lines).
 * - `meta`: short trailing text such as a time or a count.
 * - `trailing`: a control (switch, checkbox, icon button); or `trailingIcon`.
 *
 * Interactive rows: pass `href`, `onClick`, or `asChild` with your own link
 * (`<ListItem asChild><Link href="/x">Title</Link></ListItem>`). The title
 * becomes the link or button and stretches over the whole row, so the row
 * is one click target while trailing controls stay separately clickable,
 * and screen readers hear the title, then the description.
 *
 * Variants:
 * - "plain": rows on the surface, highlighted on hover and when `selected`.
 * - "segmented": each row on its own tile, 2px apart, with the group's outer
 *   corners rounded: Android settings style.
 */

type ListVariant = "plain" | "segmented"
const ListContext = React.createContext<ListVariant>("plain")

type ListProps = React.ComponentProps<"ul"> & { variant?: ListVariant }

function List({ className, variant = "plain", ...props }: ListProps) {
  return (
    <ListContext.Provider value={variant}>
      <ul
        role="list"
        data-slot="list"
        data-variant={variant}
        className={cn("flex flex-col", variant === "segmented" ? "gap-0.5" : "gap-0.5 py-2", className)}
        {...props}
      />
    </ListContext.Provider>
  )
}

type ListItemProps = Omit<React.ComponentProps<"li">, "title" | "onClick"> & {
  leading?: React.ReactNode
  icon?: IconName
  overline?: React.ReactNode
  description?: React.ReactNode
  meta?: React.ReactNode
  trailing?: React.ReactNode
  trailingIcon?: IconName
  href?: string
  onClick?: React.MouseEventHandler<HTMLElement>
  /** Make your own link or button (the only child) the row's action. */
  asChild?: boolean
  selected?: boolean
  disabled?: boolean
  /** Align the leading and trailing parts to the top, for long descriptions. */
  align?: "center" | "top"
}

function ListItem({
  className,
  leading,
  icon,
  overline,
  description,
  meta,
  trailing,
  trailingIcon,
  href,
  onClick,
  asChild = false,
  selected = false,
  disabled = false,
  align = "center",
  children,
  ...props
}: ListItemProps) {
  const variant = React.useContext(ListContext)
  const descId = React.useId()
  const interactive = asChild || href !== undefined || onClick !== undefined

  const titleClass = cn(
    "min-w-0 truncate text-left type-body-lg text-foreground outline-none",
    // the action covers the whole row
    interactive && "cursor-pointer after:absolute after:inset-0 after:rounded-[inherit] after:content-['']",
    disabled && "cursor-default"
  )
  const actionProps = {
    "data-slot": "list-item-action",
    "aria-describedby": description ? descId : undefined,
    "aria-current": selected ? ("true" as const) : undefined,
    className: titleClass,
  }

  let title: React.ReactNode
  if (asChild) {
    title = (
      <Slot.Root {...actionProps} aria-disabled={disabled || undefined} onClick={onClick}>
        {children}
      </Slot.Root>
    )
  } else if (href !== undefined) {
    title = (
      <a {...actionProps} href={disabled ? undefined : href} aria-disabled={disabled || undefined} onClick={onClick}>
        {children}
      </a>
    )
  } else if (onClick) {
    title = (
      <button type="button" {...actionProps} disabled={disabled} onClick={onClick}>
        {children}
      </button>
    )
  } else {
    title = <span className={titleClass}>{children}</span>
  }

  const side = align === "top" ? "self-start" : "self-center"

  return (
    <li
      data-slot="list-item"
      data-selected={selected || undefined}
      data-disabled={disabled || undefined}
      data-interactive={interactive || undefined}
      className={cn(
        "relative flex min-h-14 items-center gap-4 px-4 py-2",
        variant === "segmented"
          ? "rounded-xs bg-surface-container first:rounded-t-2xl last:rounded-b-2xl dark:bg-surface-container-high"
          : "rounded-xl",
        description && "min-h-[4.5rem]",
        // selected: filled secondary, as in menus
        "data-selected:bg-secondary data-selected:[&_[data-slot=list-item-icon]]:text-secondary-foreground",
        interactive && "state-layer",
        // the action is inside, so show its focus on the row
        "has-[[data-slot=list-item-action]:focus-visible]:outline-2 has-[[data-slot=list-item-action]:focus-visible]:-outline-offset-2 has-[[data-slot=list-item-action]:focus-visible]:outline-ring",
        "data-disabled:opacity-40 data-disabled:after:hidden",
        className
      )}
      {...props}
    >
      {(leading || icon) && (
        <span
          data-slot="list-item-leading"
          // a control here (a checkbox) sits above the row's stretched target; an avatar stays under it
          className={cn("flex shrink-0 items-center has-[button,input,a]:relative has-[button,input,a]:z-[1]", side, align === "top" && "mt-0.5")}
        >
          {icon ? <Icon data-slot="list-item-icon" name={icon} className="text-muted-foreground" /> : leading}
        </span>
      )}
      <span className="flex min-w-0 flex-1 flex-col py-1">
        {overline && <span className="type-label-md truncate text-muted-foreground">{overline}</span>}
        {title}
        {description && (
          <span id={descId} className="line-clamp-2 type-body-md text-muted-foreground">
            {description}
          </span>
        )}
      </span>
      {(meta !== undefined || trailing || trailingIcon) && (
        <span data-slot="list-item-trailing" className={cn("flex shrink-0 items-center gap-3", side, align === "top" && "mt-1.5")}>
          {meta !== undefined && <span className="type-label-md text-muted-foreground tabular-nums">{meta}</span>}
          {/* controls sit above the stretched action so they stay clickable */}
          {trailing && <span className="relative z-[1] flex items-center">{trailing}</span>}
          {trailingIcon && <Icon name={trailingIcon} className="text-muted-foreground" />}
        </span>
      )}
    </li>
  )
}

function ListSubheader({ className, ...props }: React.ComponentProps<"li">) {
  const variant = React.useContext(ListContext)
  return (
    <li
      data-slot="list-subheader"
      className={cn(
        "flex items-center px-4 type-label-lg text-muted-foreground",
        variant === "segmented" ? "pt-4 pb-2 first:pt-0" : "h-12",
        // segmented: the rows after a subheader start a new rounded group
        variant === "segmented" && "[&+li]:rounded-t-2xl [li:has(+&)]:rounded-b-2xl",
        className
      )}
      {...props}
    />
  )
}

type ListDividerProps = React.ComponentProps<"li"> & {
  /** Start after the leading slot (an icon or a 40px avatar). */
  inset?: boolean
}

function ListDivider({ className, inset = false, ...props }: ListDividerProps) {
  const variant = React.useContext(ListContext)
  return (
    <li
      aria-hidden
      data-slot="list-divider"
      className={cn(
        "my-1 h-px shrink-0 bg-outline-variant",
        inset ? "ml-[4.5rem] mr-4" : "mx-0",
        variant === "segmented" && "my-2 bg-transparent [&+li]:rounded-t-2xl [li:has(+&)]:rounded-b-2xl",
        className
      )}
      {...props}
    />
  )
}

export { List, ListItem, ListSubheader, ListDivider, type ListProps, type ListItemProps }
