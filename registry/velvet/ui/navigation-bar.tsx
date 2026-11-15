"use client"

import * as React from "react"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"
import { Icon, type IconName } from "@/registry/velvet/ui/icon"

/**
 * Velvet Navigation Bar (Material 3 Expressive style)
 *
 * Bottom navigation for phones: 3 to 5 destinations. It's the compact
 * sibling of NavigationRail and takes the same item props.
 *
 *   <NavigationBar aria-label="Main">
 *     <NavigationBarItem asChild icon="home" label="Home" active>
 *       <Link href="/" />
 *     </NavigationBarItem>
 *     <NavigationBarItem href="/inbox" icon="inbox" label="Inbox" badge={3} />
 *   </NavigationBar>
 *
 * - Stacked (default, 64px tall): a 56 x 32 pill around the icon, label
 *   below. The active pill grows out from the center and the icon fills in.
 * - `inline`: icon and label side by side in one pill, for wider windows
 *   (large phones in landscape, small tablets).
 * - Pads itself for the home indicator (safe-area-inset-bottom).
 * - `badge`: a count, or `true` for a dot.
 */
type BarContext = { inline: boolean }
const Ctx = React.createContext<BarContext>({ inline: false })

type NavigationBarProps = React.ComponentProps<"nav"> & { inline?: boolean }

function NavigationBar({ className, inline = false, children, ...props }: NavigationBarProps) {
  return (
    <Ctx.Provider value={{ inline }}>
      <nav
        data-slot="navigation-bar"
        data-inline={inline || undefined}
        className={cn(
          "group/bar flex w-full shrink-0 items-stretch justify-around bg-surface-container pb-[env(safe-area-inset-bottom)] dark:bg-surface-container-low",
          // 64px plus the home-indicator inset
          "h-[calc(4rem+env(safe-area-inset-bottom))]",
          inline ? "justify-center gap-2 px-4" : "px-2",
          className
        )}
        {...props}
      >
        {children}
      </nav>
    </Ctx.Provider>
  )
}

type NavigationBarItemProps = Omit<React.ComponentProps<"a">, "children"> & {
  icon: IconName
  label: string
  active?: boolean
  badge?: number | boolean
  disabled?: boolean
  /** Render as your own link component: pass it as the only child. */
  asChild?: boolean
  children?: React.ReactElement
  onClick?: React.MouseEventHandler<HTMLElement>
}

function NavigationBarItem({ className, icon, label, active = false, badge, disabled, asChild, href, children, ...props }: NavigationBarItemProps) {
  const { inline } = React.useContext(Ctx)
  const Comp: React.ElementType = asChild ? Slot.Root : href ? "a" : "button"
  const showBadge = badge !== undefined && badge !== false
  const count = typeof badge === "number" ? (badge > 99 ? "99+" : String(badge)) : null
  // announced with the label, e.g. "Inbox, 3 new"
  // announced from content after the label, e.g. "Inbox, 12 new"
  const badgeSr = showBadge ? <span className="sr-only">{`, ${count ? `${count} new` : "new"}`}</span> : null

  const pill = (
    <span
      className={cn(
        "relative flex shrink-0 items-center justify-center rounded-full",
        inline ? "h-10 gap-3 px-4" : "h-8 w-14"
      )}
    >
      {/* active indicator: grows out from the center */}
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
        className="absolute inset-0 rounded-full bg-foreground opacity-0 transition-opacity duration-150 group-hover/item:opacity-[0.07] group-focus-visible/item:opacity-[0.1] group-active/item:opacity-[0.12]"
      />
      <span className="relative grid place-items-center">
        <Icon
          name={icon}
          className="text-muted-foreground transition-colors group-hover/item:text-foreground group-data-active/item:text-secondary-foreground"
        />
        {showBadge && (
          <span
            aria-hidden
            data-slot="navigation-bar-badge"
            className={cn(
              "absolute rounded-full bg-destructive text-destructive-foreground",
              count
                ? "-top-1 left-[calc(100%-6px)] grid h-4 min-w-4 place-items-center px-1 text-[0.6875rem] leading-none font-semibold tabular-nums"
                : "top-0 left-[calc(100%-2px)] size-1.5"
            )}
          >
            {count}
          </span>
        )}
      </span>
      {inline && <span className="relative type-label-lg text-foreground">{label}</span>}
    </span>
  )

  return (
    <Comp
      data-slot="navigation-bar-item"
      data-active={active || undefined}
      aria-current={active ? "page" : undefined}
      href={asChild ? undefined : href}
      type={!asChild && !href ? "button" : undefined}
      disabled={!asChild && !href ? disabled : undefined}
      aria-disabled={(asChild || href) && disabled ? true : undefined}
      className={cn(
        "group/item relative flex min-w-0 cursor-pointer flex-col items-center justify-center gap-1 outline-none select-none",
        inline ? "px-1" : "flex-1",
        "[--icon-size:24px] [--icon-opsz:24] data-active:[--icon-fill:1]",
        "focus-visible:[&>span:first-child]:outline-2 focus-visible:[&>span:first-child]:outline-offset-2 focus-visible:[&>span:first-child]:outline-ring",
        "disabled:pointer-events-none disabled:opacity-40 aria-disabled:pointer-events-none aria-disabled:opacity-40",
        className
      )}
      {...props}
    >
      {pill}
      {!inline && (
        <span
          className={cn(
            "max-w-full truncate px-1 text-center type-label-md",
            "text-muted-foreground group-hover/item:text-foreground group-data-active/item:font-semibold group-data-active/item:text-foreground"
          )}
        >
          {label}
        </span>
      )}
      {asChild && <Slot.Slottable>{children}</Slot.Slottable>}
      {badgeSr}
    </Comp>
  )
}

export { NavigationBar, NavigationBarItem, type NavigationBarProps, type NavigationBarItemProps }
