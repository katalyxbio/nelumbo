"use client"

import * as React from "react"
import { NavigationMenu as NavigationMenuPrimitive } from "radix-ui"
import { cva } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Icon, type IconName } from "@/registry/velvet/ui/icon"

/**
 * Velvet Navigation Menu (built on Radix Navigation Menu)
 *
 * API-compatible with shadcn's NavigationMenu (NavigationMenu, NavigationMenuList,
 * NavigationMenuItem, NavigationMenuTrigger, NavigationMenuContent, NavigationMenuLink,
 * NavigationMenuIndicator, NavigationMenuViewport, navigationMenuTriggerStyle, and the
 * `viewport` prop). Velvet adds NavigationMenuRichLink and NavigationMenuFeatured for the
 * panels.
 *
 *   <NavigationMenu>
 *     <NavigationMenuList>
 *       <NavigationMenuItem>
 *         <NavigationMenuTrigger>Products</NavigationMenuTrigger>
 *         <NavigationMenuContent>
 *           <div className="grid gap-1 sm:w-[34rem] sm:grid-cols-[1fr_12rem]">
 *             <ul className="grid gap-1">
 *               <li>
 *                 <NavigationMenuRichLink asChild icon="bolt" title="Automations" description="Run work on a schedule.">
 *                   <a href="/automations" />
 *                 </NavigationMenuRichLink>
 *               </li>
 *             </ul>
 *             <NavigationMenuFeatured asChild icon="rocket_launch" title="What's new" description="Spring release.">
 *               <a href="/new" />
 *             </NavigationMenuFeatured>
 *           </div>
 *         </NavigationMenuContent>
 *       </NavigationMenuItem>
 *       <NavigationMenuItem>
 *         <NavigationMenuLink asChild className={navigationMenuTriggerStyle()} active>
 *           <a href="/pricing">Pricing</a>
 *         </NavigationMenuLink>
 *       </NavigationMenuItem>
 *     </NavigationMenuList>
 *   </NavigationMenu>
 *
 * - The list is a tonal track. A raised pill springs to the open or hovered trigger or
 *   link (and to the keyboard focus); it rests behind the open trigger while a panel shows.
 * - The chevron turns over on the spring when its panel opens.
 * - By default panels render in one shared viewport, a popover surface that morphs its
 *   width and height on the spring between panels while the content slides in from the
 *   direction of travel. Pass `viewport={false}` and each panel opens under its own item.
 * - NavigationMenuLink `active` sets aria-current="page" and an inverse fill (tonal inside panels).
 * - Below the sm breakpoint the menu takes the full width, the track wraps onto
 *   further rows, and panels fill the width as a single column.
 * - No lines: panel links are separated by space.
 */

function NavigationMenu({
  className,
  children,
  viewport = true,
  ...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Root> & { viewport?: boolean }) {
  return (
    <NavigationMenuPrimitive.Root
      data-slot="navigation-menu"
      data-viewport={viewport}
      className={cn(
        "group/navigation-menu relative flex max-w-max flex-1 items-center justify-center max-sm:w-full max-sm:max-w-none",
        className
      )}
      {...props}
    >
      {children}
      {viewport && <NavigationMenuViewport />}
    </NavigationMenuPrimitive.Root>
  )
}

/**
 * A tonal track that holds the items. The raised pill is measured from whichever
 * trigger or link is open, hovered or focused, and springs between them.
 */
function NavigationMenuList({ className, children, ref, ...props }: React.ComponentProps<typeof NavigationMenuPrimitive.List>) {
  const own = React.useRef<HTMLUListElement | null>(null)
  const [pill, setPill] = React.useState<{ x: number; y: number; w: number; h: number; on: boolean; moved: boolean } | null>(null)
  const hover = React.useRef<HTMLElement | null>(null)

  React.useLayoutEffect(() => {
    const ul = own.current
    if (!ul) return
    let frame = 0
    const target = () => {
      const open = ul.querySelector<HTMLElement>('[data-slot="navigation-menu-trigger"][data-state="open"]')
      if (open) return open
      if (hover.current && ul.contains(hover.current)) return hover.current
      const focused = ul.querySelector<HTMLElement>(':is([data-slot="navigation-menu-trigger"],[data-slot="navigation-menu-link"]):focus-visible')
      return focused
    }
    const measure = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const el = target()
        setPill((p) => {
          if (!el) return p ? (p.on ? { ...p, on: false } : p) : null
          const r = el.getBoundingClientRect()
          const o = ul.getBoundingClientRect()
          const next = { x: r.left - o.left - ul.clientLeft, y: r.top - o.top - ul.clientTop, w: r.width, h: r.height }
          if (p && p.on && p.x === next.x && p.y === next.y && p.w === next.w && p.h === next.h) return p
          return { ...next, on: true, moved: !!p?.on }
        })
      })
    }
    const pick = (e: Event) => {
      const t = (e.target as Element | null)?.closest<HTMLElement>('[data-slot="navigation-menu-trigger"],[data-slot="navigation-menu-link"]')
      if (e.type === "pointerover" || e.type === "pointermove") {
        if (t && ul.contains(t)) hover.current = t
      }
      measure()
    }
    const leave = () => {
      hover.current = null
      measure()
    }
    ul.addEventListener("pointerover", pick)
    ul.addEventListener("pointerleave", leave)
    ul.addEventListener("focusin", measure)
    ul.addEventListener("focusout", measure)
    const mo = new MutationObserver(measure)
    mo.observe(ul, { subtree: true, childList: true, attributes: true, attributeFilter: ["data-state", "aria-expanded"] })
    const ro = new ResizeObserver(measure)
    ro.observe(ul)
    measure()
    return () => {
      cancelAnimationFrame(frame)
      ul.removeEventListener("pointerover", pick)
      ul.removeEventListener("pointerleave", leave)
      ul.removeEventListener("focusin", measure)
      ul.removeEventListener("focusout", measure)
      mo.disconnect()
      ro.disconnect()
    }
  }, [])

  return (
    <NavigationMenuPrimitive.List
      ref={(node: HTMLUListElement | null) => {
        own.current = node
        if (typeof ref === "function") ref(node)
        else if (ref) (ref as React.RefObject<HTMLUListElement | null>).current = node
      }}
      data-slot="navigation-menu-list"
      data-pill={pill?.on ? "" : undefined}
      className={cn(
        "group/nav-list relative isolate flex flex-1 list-none flex-wrap items-center justify-center gap-1 rounded-3xl bg-surface-container-high p-1 sm:rounded-full dark:bg-surface-container",
        className
      )}
      {...props}
    >
      <li
        aria-hidden
        role="none"
        data-slot="navigation-menu-pill"
        className={cn(
          "pointer-events-none absolute top-0 left-0 -z-10 rounded-full bg-surface-container-lowest shadow-e1 dark:bg-surface-bright",
          "transition-opacity duration-150 ease-(--ease-standard) motion-reduce:transition-none",
          pill?.moved &&
            "transition-[translate,width,height,opacity] duration-[420ms,420ms,420ms,150ms] ease-(--ease-spring-bouncy) motion-reduce:transition-[opacity]",
          !pill?.on && "opacity-0"
        )}
        style={pill ? { translate: `${pill.x}px ${pill.y}px`, width: pill.w, height: pill.h } : { opacity: 0 }}
      />
      {children}
    </NavigationMenuPrimitive.List>
  )
}

function NavigationMenuItem({ className, ...props }: React.ComponentProps<typeof NavigationMenuPrimitive.Item>) {
  return <NavigationMenuPrimitive.Item data-slot="navigation-menu-item" className={cn("sm:relative", className)} {...props} />
}

/** The pill look shared by triggers and top-level links. */
const navigationMenuTriggerStyle = cva(
  [
    "state-layer group inline-flex h-10 w-max cursor-pointer items-center justify-center gap-1 rounded-full bg-transparent px-4 type-label-lg whitespace-nowrap text-foreground no-underline select-none",
    "[--icon-opsz:20] [--icon-size:20px]",
    "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
    "disabled:pointer-events-none disabled:opacity-40 data-[disabled]:pointer-events-none data-[disabled]:opacity-40",
    "max-sm:px-3",
    // a trigger with its panel open is the one the raised pill rests behind
    "data-[state=open]:text-foreground",
    // the current page: an inverse pill, like the current page in Pagination
    "data-active:bg-inverse-surface data-active:text-inverse-foreground",
  ]
)

function NavigationMenuTrigger({ className, children, ...props }: React.ComponentProps<typeof NavigationMenuPrimitive.Trigger>) {
  return (
    <NavigationMenuPrimitive.Trigger
      data-slot="navigation-menu-trigger"
      className={cn(navigationMenuTriggerStyle(), className)}
      {...props}
    >
      {children}
      <Icon
        name="keyboard_arrow_down"
        className={cn(
          "relative -mr-1 transition-[rotate,font-variation-settings] duration-[500ms,300ms] ease-[var(--ease-spring-bouncy),var(--ease-standard)] motion-reduce:transition-none",
          "group-data-[state=open]:rotate-180 group-data-[state=open]:[--icon-fill:1]"
        )}
      />
    </NavigationMenuPrimitive.Trigger>
  )
}

/**
 * A panel. It slides in from the direction of travel and fades; with the shared
 * viewport the surface itself morphs between panels. Width: set it on the panel's
 * inner element (for example `sm:w-[34rem]`); on phones panels fill the menu.
 */
function NavigationMenuContent({ className, ...props }: React.ComponentProps<typeof NavigationMenuPrimitive.Content>) {
  return (
    <NavigationMenuPrimitive.Content
      data-slot="navigation-menu-content"
      className={cn(
        "top-0 left-0 w-full p-2 sm:w-max",
        "data-[motion^=from-]:animate-in data-[motion^=to-]:animate-out data-[motion^=from-]:fade-in data-[motion^=to-]:fade-out",
        "data-[motion^=from-]:duration-[480ms] data-[motion^=from-]:ease-(--ease-spring) data-[motion^=to-]:duration-150 data-[motion^=to-]:ease-(--ease-standard)",
        "data-[motion=from-end]:slide-in-from-right-16 data-[motion=from-start]:slide-in-from-left-16",
        "data-[motion=to-end]:slide-out-to-right-16 data-[motion=to-start]:slide-out-to-left-16",
        // without the shared viewport the panel is its own popover surface under its item
        "group-data-[viewport=false]/navigation-menu:absolute group-data-[viewport=false]/navigation-menu:max-sm:w-full group-data-[viewport=false]/navigation-menu:top-full group-data-[viewport=false]/navigation-menu:mt-2 group-data-[viewport=false]/navigation-menu:w-auto group-data-[viewport=false]/navigation-menu:overflow-hidden group-data-[viewport=false]/navigation-menu:rounded-3xl group-data-[viewport=false]/navigation-menu:bg-surface-container-high group-data-[viewport=false]/navigation-menu:shadow-e3",
        "group-data-[viewport=false]/navigation-menu:data-[state=open]:animate-in group-data-[viewport=false]/navigation-menu:data-[state=closed]:animate-out group-data-[viewport=false]/navigation-menu:data-[state=open]:fade-in-0 group-data-[viewport=false]/navigation-menu:data-[state=closed]:fade-out-0 group-data-[viewport=false]/navigation-menu:data-[state=open]:zoom-in-95 group-data-[viewport=false]/navigation-menu:data-[state=closed]:zoom-out-95",
        "group-data-[viewport=false]/navigation-menu:data-[state=open]:duration-[396ms] group-data-[viewport=false]/navigation-menu:data-[state=open]:ease-(--ease-spring)",
        "**:data-[slot=navigation-menu-link]:focus-visible:outline-2 **:data-[slot=navigation-menu-link]:focus-visible:outline-ring",
        className
      )}
      {...props}
    />
  )
}

/**
 * The shared popover surface. Radix publishes the active panel's size as CSS
 * variables, and the surface follows them on the spring.
 */
function NavigationMenuViewport({ className, ...props }: React.ComponentProps<typeof NavigationMenuPrimitive.Viewport>) {
  return (
    <div className="absolute top-full left-0 isolate z-50 flex w-full justify-center" data-slot="navigation-menu-viewport-wrapper">
      <NavigationMenuPrimitive.Viewport
        data-slot="navigation-menu-viewport"
        className={cn(
          "relative mt-2 h-(--radix-navigation-menu-viewport-height) w-full shrink-0 origin-top overflow-hidden rounded-3xl bg-surface-container-high text-foreground shadow-e3 sm:w-(--radix-navigation-menu-viewport-width)",
          "transition-[width,height] duration-[520ms] ease-(--ease-spring-bouncy) motion-reduce:transition-none",
          "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-[0.92] data-[state=open]:duration-[396ms] data-[state=open]:ease-(--ease-spring)",
          "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=closed]:duration-100",
          className
        )}
        {...props}
      />
    </div>
  )
}

/**
 * A top-level link or a link inside a panel. Compose it with
 * navigationMenuTriggerStyle() for a pill, or style it yourself. `active`
 * adds aria-current="page" and a fill.
 */
function NavigationMenuLink({ className, ...props }: React.ComponentProps<typeof NavigationMenuPrimitive.Link>) {
  return (
    <NavigationMenuPrimitive.Link
      data-slot="navigation-menu-link"
      className={cn(
        "state-layer rounded-2xl outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        "data-active:bg-secondary data-active:text-secondary-foreground",
        className
      )}
      {...props}
    />
  )
}

/** A small notch under the active trigger that springs between triggers. */
function NavigationMenuIndicator({ className, ...props }: React.ComponentProps<typeof NavigationMenuPrimitive.Indicator>) {
  return (
    <NavigationMenuPrimitive.Indicator
      data-slot="navigation-menu-indicator"
      className={cn(
        "top-full z-[1] flex h-2.5 items-end justify-center overflow-hidden",
        "transition-[transform,width] duration-[420ms] ease-(--ease-spring-bouncy) motion-reduce:transition-none",
        "data-[state=visible]:animate-in data-[state=hidden]:animate-out data-[state=hidden]:fade-out data-[state=visible]:fade-in",
        className
      )}
      {...props}
    >
      <div className="relative top-[60%] size-3 rotate-45 rounded-tl-[4px] bg-surface-container-high shadow-e1" />
    </NavigationMenuPrimitive.Indicator>
  )
}

/**
 * A rich link for panels: an icon on a tonal tile, a title and a description.
 * The tile is a spread box-shadow, so the glyph box stays exact. On hover or
 * focus the tile turns inverse, fills the glyph and rounds off.
 * Use `asChild` with your router's Link as the only child.
 */
function NavigationMenuRichLink({
  className,
  icon,
  title,
  description,
  children,
  asChild,
  ...props
}: Omit<React.ComponentProps<typeof NavigationMenuPrimitive.Link>, "title"> & {
  icon?: IconName
  title: React.ReactNode
  description?: React.ReactNode
}) {
  const body = (
    <>
      {icon && <Icon name={icon} />}
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="type-label-lg text-foreground">{title}</span>
        {description && <span className="type-body-sm text-muted-foreground">{description}</span>}
      </span>
    </>
  )
  return (
    <NavigationMenuLink
      asChild={asChild}
      data-slot="navigation-menu-rich-link"
      className={cn(
        "group/rich flex items-start gap-3 rounded-2xl px-3 py-2.5 no-underline",
        "hover:bg-surface-container-highest focus-visible:bg-surface-container-highest data-active:bg-secondary",
        "[--icon-size:20px] [--icon-opsz:20] [--tile:var(--surface-container-highest)] hover:[--tile:var(--inverse-surface)] focus-visible:[--tile:var(--inverse-surface)]",
        "[&_[data-slot=icon]]:m-2 [&_[data-slot=icon]]:shrink-0 [&_[data-slot=icon]]:rounded-[2px] [&_[data-slot=icon]]:text-foreground",
        "[&_[data-slot=icon]]:bg-(--tile) [&_[data-slot=icon]]:shadow-[0_0_0_8px_var(--tile)]",
        "[&_[data-slot=icon]]:transition-[background-color,box-shadow,color,scale,border-radius] [&_[data-slot=icon]]:duration-[200ms,200ms,200ms,420ms,420ms]",
        "[&_[data-slot=icon]]:ease-[var(--ease-standard),var(--ease-standard),var(--ease-standard),var(--ease-spring-bouncy),var(--ease-spring)]",
        "hover:[&_[data-slot=icon]]:text-inverse-foreground focus-visible:[&_[data-slot=icon]]:text-inverse-foreground",
        "hover:[&_[data-slot=icon]]:scale-105 hover:[&_[data-slot=icon]]:rounded-full focus-visible:[&_[data-slot=icon]]:scale-105 focus-visible:[&_[data-slot=icon]]:rounded-full",
        "hover:[--icon-fill:1] focus-visible:[--icon-fill:1]",
        "motion-reduce:[&_[data-slot=icon]]:transition-none",
        className
      )}
      {...props}
    >
      {asChild ? (
        React.isValidElement<{ children?: React.ReactNode }>(children)
          ? React.cloneElement(children, undefined, body)
          : null
      ) : (
        body
      )}
    </NavigationMenuLink>
  )
}

/**
 * A featured card on a brand-container gradient. The gradient drifts on hover.
 * Use `asChild` with your router's Link as the only child.
 */
function NavigationMenuFeatured({
  className,
  icon,
  title,
  description,
  children,
  asChild,
  ...props
}: Omit<React.ComponentProps<typeof NavigationMenuPrimitive.Link>, "title"> & {
  icon?: IconName
  title: React.ReactNode
  description?: React.ReactNode
}) {
  const body = (
    <>
      {icon && (
        <span className="mb-auto flex size-10 items-center justify-center rounded-full bg-brand text-brand-foreground [--icon-opsz:20] [--icon-size:20px]">
          <Icon name={icon} />
        </span>
      )}
      <span className="mt-6 flex flex-col gap-1">
        <span className="type-title-md">{title}</span>
        {description && <span className="type-body-sm opacity-90">{description}</span>}
      </span>
    </>
  )
  return (
    <NavigationMenuLink
      asChild={asChild}
      data-slot="navigation-menu-featured"
      className={cn(
        "tactile flex min-h-40 flex-col rounded-2xl p-4 text-brand-container-foreground no-underline",
        "bg-linear-to-br from-brand-container via-brand-container to-surface-container-highest bg-[length:220%_220%] bg-[position:0%_0%]",
        "transition-[background-position] duration-700 ease-(--ease-spring) hover:bg-[position:100%_100%] focus-visible:bg-[position:100%_100%] motion-reduce:transition-none",
        "data-active:bg-brand-container",
        className
      )}
      {...props}
    >
      {asChild ? (
        React.isValidElement<{ children?: React.ReactNode }>(children)
          ? React.cloneElement(children, undefined, body)
          : null
      ) : (
        body
      )}
    </NavigationMenuLink>
  )
}

export {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuIndicator,
  NavigationMenuViewport,
  NavigationMenuRichLink,
  NavigationMenuFeatured,
  navigationMenuTriggerStyle,
}
