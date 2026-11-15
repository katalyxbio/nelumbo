"use client"

import * as React from "react"
import { Slot } from "radix-ui"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/registry/nelumbo/ui/collapsible"
import { Icon } from "@/registry/nelumbo/ui/icon"
import { IconButton } from "@/registry/nelumbo/ui/icon-button"
import { Input } from "@/registry/nelumbo/ui/input"
import { Badge } from "@/registry/nelumbo/ui/badge"
import { Separator } from "@/registry/nelumbo/ui/separator"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/registry/nelumbo/ui/sheet"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/registry/nelumbo/ui/tooltip"

/**
 * Nelumbo Sidebar
 *
 * A drop-in for shadcn's Sidebar: every export, prop and `data-*` hook is
 * kept (SidebarProvider, Sidebar with `side`, `variant` and `collapsible`,
 * SidebarTrigger, SidebarRail, SidebarInset, SidebarHeader/Footer/Content,
 * SidebarGroup and its label, action and content, SidebarMenu and its item,
 * button, action, badge, skeleton and sub-menu parts, SidebarInput,
 * SidebarSeparator, useSidebar). Cookie persistence and Ctrl/Cmd+B work the
 * same, and phones get Nelumbo's Sheet.
 *
 *   <SidebarProvider>
 *     <Sidebar collapsible="icon">
 *       <SidebarHeader>…</SidebarHeader>
 *       <SidebarContent>
 *         <SidebarGroup>
 *           <SidebarGroupLabel>Workspace</SidebarGroupLabel>
 *           <SidebarGroupContent>
 *             <SidebarMenu>
 *               <SidebarMenuItem>
 *                 <SidebarMenuButton isActive tooltip="Inbox">
 *                   <Icon name="inbox" />
 *                   <span>Inbox</span>
 *                 </SidebarMenuButton>
 *                 <SidebarMenuBadge>12</SidebarMenuBadge>
 *               </SidebarMenuItem>
 *             </SidebarMenu>
 *           </SidebarGroupContent>
 *         </SidebarGroup>
 *       </SidebarContent>
 *       <SidebarFooter>…</SidebarFooter>
 *       <SidebarRail />
 *     </Sidebar>
 *     <SidebarInset>
 *       <SidebarTrigger />
 *       …
 *     </SidebarInset>
 *   </SidebarProvider>
 *
 * How it looks:
 * - No lines anywhere. The panel is a surface-container-low tone with no
 *   border; groups are told apart by space (SidebarSeparator renders space
 *   only). "floating" lifts the panel off the edge with rounded corners and
 *   elevation; "inset" sets the page content on a raised, rounded card.
 * - The active item sits on a tonal (secondary) pill that SPRINGS from item
 *   to item, across groups and into sub-menus, and the active icon fills in.
 *   The pill is measured from `data-active="true"` (set by `isActive`), so it
 *   follows any markup. Until it is measured, the item draws its own fill.
 * - Icon mode: the width eases on the smooth spring, labels, badges and
 *   chevrons fade, and the icons stay put (they sit on the same 32px axis in
 *   both states, like the Navigation Rail). A MenuBadge shrinks to a dot on
 *   its icon. Tooltips (Nelumbo Tooltip) name each item while collapsed.
 * - Sub-menus: wrap an item in SidebarCollapsible and put SidebarMenuSub in
 *   SidebarCollapsibleContent. It opens with the accordion's height
 *   animation, and SidebarMenuChevron turns on a spring. (shadcn's own
 *   Collapsible works too, only without the height animation.)
 *
 * Nelumbo additions:
 * - SidebarProvider `contained`: lay the sidebar out inside the provider
 *   (absolute instead of fixed) so it can live in a card, a preview or a
 *   resizable pane. Give the provider a height and `overflow-hidden`.
 * - SidebarProvider `keyboardShortcut` ("b", or false) and `shortcutScope`
 *   ("window" or "provider": only while focus is inside this provider).
 * - SidebarProvider `cookieName` (or false to skip the cookie).
 * - SidebarInset `asChild`: render your own element, for example a div when
 *   the page already has a main landmark.
 * - SidebarMenuButton size "sm" | "default" | "lg", variant "default" | "outline"
 *   (outline = a raised tile).
 * - SidebarCollapsible, SidebarCollapsibleTrigger, SidebarCollapsibleContent,
 *   SidebarMenuChevron.
 *
 * Keyboard: Tab through items; Enter or Space activates; Ctrl/Cmd+B toggles;
 * Escape closes the mobile sheet.
 */

const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7
const SIDEBAR_WIDTH = "16rem"
const SIDEBAR_WIDTH_MOBILE = "18rem"
const SIDEBAR_WIDTH_ICON = "4rem"


/* ---------------------------------------------------------------- context */

type SidebarContextProps = {
  state: "expanded" | "collapsed"
  open: boolean
  setOpen: (open: boolean) => void
  openMobile: boolean
  setOpenMobile: (open: boolean) => void
  isMobile: boolean
  toggleSidebar: () => void
  contained: boolean
}

const SidebarContext = React.createContext<SidebarContextProps | null>(null)

function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) throw new Error("useSidebar must be used within a SidebarProvider.")
  return context
}

const MOBILE_QUERY = "(max-width: 767px)"

/** Phones (below 768px). False on the server and the first client render, so hydration matches. */
function useIsMobile() {
  return React.useSyncExternalStore(
    (notify) => {
      const mql = window.matchMedia(MOBILE_QUERY)
      mql.addEventListener("change", notify)
      return () => mql.removeEventListener("change", notify)
    },
    () => window.matchMedia(MOBILE_QUERY).matches,
    () => false
  )
}

type SidebarProviderProps = React.ComponentProps<"div"> & {
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
  /** Lay the sidebar out inside the provider (absolute) instead of against the viewport (fixed). */
  contained?: boolean
  /** Key for the Ctrl/Cmd shortcut that toggles the sidebar; false turns it off. */
  keyboardShortcut?: string | false
  /** "window" listens everywhere; "provider" only while focus is inside this provider. */
  shortcutScope?: "window" | "provider"
  /** Name of the cookie that remembers the open state; false skips the cookie. */
  cookieName?: string | false
}

function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
  contained = false,
  keyboardShortcut = "b",
  shortcutScope = "window",
  cookieName = "sidebar_state",
  className,
  style,
  children,
  onKeyDown,
  ...props
}: SidebarProviderProps) {
  const isMobile = useIsMobile()
  const [openMobile, setOpenMobile] = React.useState(false)
  const [_open, _setOpen] = React.useState(defaultOpen)
  const open = openProp ?? _open

  const setOpen = React.useCallback(
    (value: boolean | ((value: boolean) => boolean)) => {
      const next = typeof value === "function" ? value(open) : value
      if (setOpenProp) setOpenProp(next)
      else _setOpen(next)
      if (cookieName) document.cookie = `${cookieName}=${next}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`
    },
    [setOpenProp, open, cookieName]
  )

  const toggleSidebar = React.useCallback(
    () => (isMobile ? setOpenMobile((o) => !o) : setOpen((o) => !o)),
    [isMobile, setOpen]
  )

  const isShortcut = (e: { key: string; metaKey: boolean; ctrlKey: boolean }) =>
    keyboardShortcut !== false && e.key.toLowerCase() === keyboardShortcut && (e.metaKey || e.ctrlKey)

  React.useEffect(() => {
    if (shortcutScope !== "window" || keyboardShortcut === false) return
    const handler = (e: KeyboardEvent) => {
      if (isShortcut(e)) {
        e.preventDefault()
        toggleSidebar()
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toggleSidebar, keyboardShortcut, shortcutScope])

  const state = open ? "expanded" : "collapsed"
  const value = React.useMemo<SidebarContextProps>(
    () => ({ state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar, contained }),
    [state, open, setOpen, isMobile, openMobile, toggleSidebar, contained]
  )

  return (
    <SidebarContext.Provider value={value}>
      <TooltipProvider delayDuration={150}>
        <div
          data-slot="sidebar-wrapper"
          data-contained={contained || undefined}
          style={
            {
              "--sidebar-width": SIDEBAR_WIDTH,
              "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
              ...style,
            } as React.CSSProperties
          }
          className={cn(
            "group/sidebar-wrapper flex w-full text-foreground has-data-[variant=inset]:bg-surface-container-low",
            contained ? "relative h-full min-h-0 overflow-hidden" : "min-h-svh",
            className
          )}
          onKeyDown={(e) => {
            onKeyDown?.(e)
            if (shortcutScope === "provider" && !e.defaultPrevented && isShortcut(e)) {
              e.preventDefault()
              toggleSidebar()
            }
          }}
          {...props}
        >
          {children}
        </div>
      </TooltipProvider>
    </SidebarContext.Provider>
  )
}

/* ---------------------------------------------------------------- sidebar */

type SidebarProps = React.ComponentProps<"div"> & {
  side?: "left" | "right"
  variant?: "sidebar" | "floating" | "inset"
  collapsible?: "offcanvas" | "icon" | "none"
}

function Sidebar({ side = "left", variant = "sidebar", collapsible = "offcanvas", className, children, ...props }: SidebarProps) {
  const { isMobile, state, openMobile, setOpenMobile, contained } = useSidebar()
  const spaced = variant === "floating" || variant === "inset"

  if (collapsible === "none") {
    return (
      <div
        data-slot="sidebar"
        data-sidebar="sidebar"
        data-collapsible="none"
        data-variant={variant}
        data-side={side}
        className={cn("group/sidebar flex h-full w-(--sidebar-width) flex-col bg-surface-container-low text-foreground", className)}
        {...props}
      >
        {children}
      </div>
    )
  }

  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile}>
        <SheetContent
          data-sidebar="sidebar"
          data-slot="sidebar"
          data-mobile="true"
          side={side}
          floating={spaced}
          showCloseButton={false}
          style={{ "--sidebar-width": SIDEBAR_WIDTH_MOBILE } as React.CSSProperties}
          className={cn(
            "w-(--sidebar-width) max-w-[calc(100%-3rem)] gap-0 bg-surface-container-low p-0 text-foreground dark:bg-surface-container-low",
            className
          )}
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Sidebar</SheetTitle>
            <SheetDescription>Displays the mobile sidebar.</SheetDescription>
          </SheetHeader>
          <div className="relative flex h-full w-full flex-col">{children}</div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <div
      className="group/sidebar group peer hidden text-foreground md:block"
      data-state={state}
      data-collapsible={state === "collapsed" ? collapsible : ""}
      data-variant={variant}
      data-side={side}
      data-slot="sidebar"
    >
      {/* the gap: holds the sidebar's room in the layout, and animates with it */}
      <div
        data-slot="sidebar-gap"
        className={cn(
          "relative w-(--sidebar-width) bg-transparent transition-[width] duration-[519ms] ease-(--ease-spring) motion-reduce:transition-none",
          "group-data-[collapsible=offcanvas]:w-0",
          spaced ? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+1rem)]" : "group-data-[collapsible=icon]:w-(--sidebar-width-icon)"
        )}
      />
      <div
        data-slot="sidebar-container"
        className={cn(
          "inset-y-0 z-10 hidden w-(--sidebar-width) transition-[left,right,width] duration-[519ms] ease-(--ease-spring) motion-reduce:transition-none md:flex",
          contained ? "absolute h-full" : "fixed h-svh",
          side === "left"
            ? "left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]"
            : "right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]",
          spaced
            ? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+1rem)]"
            : "group-data-[collapsible=icon]:w-(--sidebar-width-icon)",
          className
        )}
        {...props}
      >
        <div
          data-sidebar="sidebar"
          data-slot="sidebar-inner"
          className={cn(
            "relative flex h-full w-full flex-col bg-surface-container-low",
            "group-data-[variant=floating]:rounded-2xl group-data-[variant=floating]:shadow-e2",
            "group-data-[variant=inset]:bg-transparent"
          )}
        >
          {children}
        </div>
      </div>
    </div>
  )
}

function SidebarTrigger({ className, onClick, ...props }: Omit<React.ComponentProps<typeof IconButton>, "icon" | "label"> & { label?: string }) {
  const { toggleSidebar, state, openMobile, isMobile } = useSidebar()
  const open = isMobile ? openMobile : state === "expanded"
  return (
    <IconButton
      data-sidebar="trigger"
      data-slot="sidebar-trigger"
      icon={open ? "left_panel_close" : "left_panel_open"}
      label="Toggle Sidebar"
      size="sm"
      className={className}
      onClick={(event) => {
        onClick?.(event)
        toggleSidebar()
      }}
      {...props}
    />
  )
}

/** A thin strip on the sidebar's edge: click it to collapse or expand. A soft grip shows on hover. */
function SidebarRail({ className, ...props }: React.ComponentProps<"button">) {
  const { toggleSidebar } = useSidebar()
  return (
    <button
      data-sidebar="rail"
      data-slot="sidebar-rail"
      aria-label="Toggle Sidebar"
      tabIndex={-1}
      onClick={toggleSidebar}
      title="Toggle Sidebar"
      className={cn(
        "group/rail absolute inset-y-0 z-20 hidden w-4 cursor-w-resize transition-colors sm:flex",
        "group-data-[side=left]:-right-4 group-data-[side=right]:left-0",
        "in-data-[side=left]:cursor-w-resize in-data-[side=right]:cursor-e-resize",
        "[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize",
        "items-center justify-center outline-none",
        "after:h-10 after:w-1 after:rounded-full after:bg-outline after:opacity-0 after:transition-[opacity,height] after:duration-200 hover:after:h-14 hover:after:opacity-60 focus-visible:after:opacity-80 motion-reduce:after:transition-none",
        className
      )}
      {...props}
    />
  )
}

function SidebarInset({ className, asChild = false, ...props }: React.ComponentProps<"main"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "main"
  return (
    <Comp
      data-slot="sidebar-inset"
      className={cn(
        "relative flex w-full min-w-0 flex-1 flex-col bg-background",
        "md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-2xl md:peer-data-[variant=inset]:shadow-e1",
        "md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-2 md:peer-data-[variant=inset]:peer-data-[side=right]:mr-0",
        "md:peer-data-[variant=inset]:transition-[margin] md:peer-data-[variant=inset]:duration-[519ms] md:peer-data-[variant=inset]:ease-(--ease-spring) motion-reduce:transition-none",
        className
      )}
      {...props}
    />
  )
}

function SidebarInput({ className, placeholder, "aria-label": ariaLabel, ...props }: Omit<React.ComponentProps<typeof Input>, "size" | "variant" | "label">) {
  return (
    <Input
      data-sidebar="input"
      data-slot="sidebar-input"
      size="xs"
      icon="search"
      label={ariaLabel ?? placeholder ?? "Search"}
      placeholder={placeholder}
      className={cn("w-full group-data-[collapsible=icon]/sidebar:hidden", className)}
      {...props}
    />
  )
}

function SidebarHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="sidebar-header" data-sidebar="header" className={cn("flex flex-col gap-2 p-2", className)} {...props} />
}

function SidebarFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="sidebar-footer" data-sidebar="footer" className={cn("flex flex-col gap-2 p-2", className)} {...props} />
}

/** Space between groups. Nelumbo sidebars have no lines, so this is only a gap. */
function SidebarSeparator({ className, ...props }: React.ComponentProps<typeof Separator>) {
  return <Separator data-slot="sidebar-separator" data-sidebar="separator" variant="space" className={cn("h-2", className)} {...props} />
}

const ACTIVE_ITEM = '[data-sidebar="menu-button"][data-active="true"], [data-sidebar="menu-sub-button"][data-active="true"]'
type Pill = { x: number; y: number; w: number; h: number; animate: boolean }

/**
 * The scrolling middle. The active item sits on a tonal pill that springs
 * between items, groups and sub-menus; it is measured from the item that
 * has data-active="true" (the last visible one wins) and follows layout
 * changes (collapsing, sub-menus opening) without lag.
 */
function SidebarContent({ className, children, ref, ...props }: React.ComponentProps<"div">) {
  const own = React.useRef<HTMLDivElement>(null)
  const [pill, setPill] = React.useState<Pill | null>(null)

  React.useLayoutEffect(() => {
    const el = own.current
    if (!el) return
    let loop = 0
    const measure = (animate: boolean) => {
      const items = [...el.querySelectorAll<HTMLElement>(ACTIVE_ITEM)].filter((e) => e.offsetWidth > 0)
      const item = items[items.length - 1]
      if (!item) return setPill(null)
      const r = item.getBoundingClientRect()
      const o = el.getBoundingClientRect()
      const next = { x: r.left - o.left + el.scrollLeft, y: r.top - o.top + el.scrollTop, w: r.width, h: r.height }
      setPill((p) =>
        p && p.x === next.x && p.y === next.y && p.w === next.w && p.h === next.h ? p : { ...next, animate: animate && p !== null }
      )
    }
    // sub-menus slide open with a CSS animation: follow them frame by frame
    const track = () => {
      cancelAnimationFrame(loop)
      const until = performance.now() + 700
      const step = () => {
        measure(false)
        if (performance.now() < until) loop = requestAnimationFrame(step)
      }
      step()
    }
    measure(false)
    const ro = new ResizeObserver(() => measure(false))
    ro.observe(el)
    const mo = new MutationObserver((records) => measure(records.some((r) => r.type === "attributes" && r.attributeName === "data-active")))
    mo.observe(el, { subtree: true, childList: true, attributes: true, attributeFilter: ["data-active"] })
    el.addEventListener("animationstart", track)
    return () => {
      cancelAnimationFrame(loop)
      ro.disconnect()
      mo.disconnect()
      el.removeEventListener("animationstart", track)
    }
  }, [])

  return (
    <div
      ref={(node) => {
        own.current = node
        if (typeof ref === "function") ref(node)
        else if (ref) (ref as React.RefObject<HTMLDivElement | null>).current = node
      }}
      data-slot="sidebar-content"
      data-sidebar="content"
      data-pill={pill ? "" : undefined}
      className={cn(
        "group/sidebar-content relative isolate flex min-h-0 flex-1 flex-col gap-1 overflow-auto group-data-[collapsible=icon]/sidebar:overflow-hidden",
        className
      )}
      {...props}
    >
      <div
        aria-hidden
        data-slot="sidebar-indicator"
        className={cn(
          "pointer-events-none absolute top-0 left-0 -z-10 rounded-full bg-secondary",
          pill?.animate && "transition-[translate,width,height] duration-[420ms] ease-(--ease-spring-bouncy) motion-reduce:transition-none",
          !pill && "hidden"
        )}
        style={pill ? { translate: `${pill.x}px ${pill.y}px`, width: pill.w, height: pill.h } : undefined}
      />
      {children}
    </div>
  )
}

/* ----------------------------------------------------------------- groups */

function SidebarGroup({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="sidebar-group" data-sidebar="group" className={cn("relative flex w-full min-w-0 flex-col p-2", className)} {...props} />
}

function SidebarGroupLabel({ className, asChild = false, ...props }: React.ComponentProps<"div"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "div"
  return (
    <Comp
      data-slot="sidebar-group-label"
      data-sidebar="group-label"
      className={cn(
        "flex h-8 shrink-0 items-center overflow-hidden px-3 type-label-md whitespace-nowrap text-muted-foreground outline-none select-none",
        "transition-opacity duration-200 ease-(--ease-standard) motion-reduce:transition-none",
        "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring",
        "group-data-[collapsible=icon]/sidebar:pointer-events-none group-data-[collapsible=icon]/sidebar:opacity-0",
        className
      )}
      {...props}
    />
  )
}

function SidebarGroupAction({ className, asChild = false, ...props }: React.ComponentProps<"button"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "button"
  return (
    <Comp
      data-slot="sidebar-group-action"
      data-sidebar="group-action"
      className={cn(
        "state-layer absolute! top-3 right-3 grid size-6 place-items-center rounded-full text-muted-foreground outline-none hover:text-foreground",
        "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring",
        "[&>[data-slot=icon]]:[--icon-size:18px] [&>[data-slot=icon]]:[--icon-opsz:20] [&>svg]:size-4 [&>svg]:shrink-0",
        "group-data-[collapsible=icon]/sidebar:hidden",
        className
      )}
      {...props}
    />
  )
}

function SidebarGroupContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="sidebar-group-content" data-sidebar="group-content" className={cn("w-full", className)} {...props} />
}

/* ------------------------------------------------------------------- menu */

function SidebarMenu({ className, ...props }: React.ComponentProps<"ul">) {
  return <ul data-slot="sidebar-menu" data-sidebar="menu" className={cn("flex w-full min-w-0 flex-col gap-1", className)} {...props} />
}

function SidebarMenuItem({ className, ...props }: React.ComponentProps<"li">) {
  return <li data-slot="sidebar-menu-item" data-sidebar="menu-item" className={cn("group/menu-item relative", className)} {...props} />
}

const menuButtonVariants = cva(
  [
    "state-layer peer/menu-button group/menu-button flex w-full items-center overflow-hidden rounded-full text-left whitespace-nowrap text-foreground outline-none",
    "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring",
    "disabled:pointer-events-none disabled:opacity-40 aria-disabled:pointer-events-none aria-disabled:opacity-40",
    // the active item: tonal, filled icon. The pill behind springs in; until it is measured the item fills itself.
    "data-[active=true]:bg-secondary data-[active=true]:text-secondary-foreground group-data-[pill]/sidebar-content:data-[active=true]:bg-transparent",
    "data-[active=true]:[--icon-fill:1]",
    "[&>[data-slot=icon]]:text-muted-foreground hover:[&>[data-slot=icon]]:text-foreground data-[active=true]:[&>[data-slot=icon]]:text-secondary-foreground",
    "[&>:first-child]:shrink-0 [&>span:not([data-slot])]:truncate [&>svg]:mx-0.5 [&>svg]:size-5 [&>svg]:shrink-0",
    // room for a trailing action or badge
    "group-has-data-[slot=sidebar-menu-action]/menu-item:pr-11 group-has-data-[slot=sidebar-menu-badge]/menu-item:pr-12",
    // icon mode: everything after the first child (label, chevron) fades; the first stays on the same axis
    "[&>:not(:first-child)]:transition-opacity [&>:not(:first-child)]:duration-150",
    "group-data-[collapsible=icon]/sidebar:[&>:not(:first-child)]:opacity-0",
  ],
  {
    variants: {
      variant: {
        default: "",
        outline: "bg-surface-container-lowest shadow-e1 dark:bg-surface-bright",
      },
      size: {
        default: "h-10 gap-3 px-3 type-label-lg [&>[data-slot=icon]]:[--icon-size:24px] [&>[data-slot=icon]]:[--icon-opsz:24]",
        sm: "h-8 gap-3 px-3 type-label-md [&>[data-slot=icon]]:mx-0.5 [&>[data-slot=icon]]:[--icon-size:20px] [&>[data-slot=icon]]:[--icon-opsz:20]",
        lg: "h-12 gap-3 px-2 type-label-lg [&>[data-slot=icon]]:mx-1 [&>[data-slot=icon]]:[--icon-size:24px] [&>[data-slot=icon]]:[--icon-opsz:24]",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
)

type SidebarMenuButtonProps = React.ComponentProps<"button"> & {
  asChild?: boolean
  isActive?: boolean
  /** Shown beside the item while the sidebar is collapsed to icons. */
  tooltip?: string | React.ComponentProps<typeof TooltipContent>
} & VariantProps<typeof menuButtonVariants>

function SidebarMenuButton({
  asChild = false,
  isActive = false,
  variant = "default",
  size = "default",
  tooltip,
  className,
  ...props
}: SidebarMenuButtonProps) {
  const Comp = asChild ? Slot.Root : "button"
  const { isMobile, state } = useSidebar()
  // Controlled, so a tooltip never opens (or swallows Escape) while labels are showing.
  const [tipOpen, setTipOpen] = React.useState(false)
  const tipEnabled = state === "collapsed" && !isMobile

  const button = (
    <Comp
      data-slot="sidebar-menu-button"
      data-sidebar="menu-button"
      data-size={size}
      data-active={isActive}
      aria-current={isActive ? "page" : undefined}
      className={cn(menuButtonVariants({ variant, size }), className)}
      {...props}
    />
  )

  if (!tooltip) return button
  const content = typeof tooltip === "string" ? { children: tooltip } : tooltip

  return (
    <Tooltip open={tipEnabled && tipOpen} onOpenChange={setTipOpen}>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent side="right" align="center" {...content} />
    </Tooltip>
  )
}

function SidebarMenuAction({
  className,
  asChild = false,
  showOnHover = false,
  ...props
}: React.ComponentProps<"button"> & { asChild?: boolean; showOnHover?: boolean }) {
  const Comp = asChild ? Slot.Root : "button"
  return (
    <Comp
      data-slot="sidebar-menu-action"
      data-sidebar="menu-action"
      className={cn(
        "state-layer absolute! top-1 right-2 grid size-8 place-items-center rounded-full text-muted-foreground outline-none hover:text-foreground",
        "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring",
        "[&>[data-slot=icon]]:[--icon-size:20px] [&>[data-slot=icon]]:[--icon-opsz:20] [&>svg]:size-5 [&>svg]:shrink-0",
        "peer-data-[size=sm]/menu-button:top-0 peer-data-[size=lg]/menu-button:top-2",
        "group-data-[collapsible=icon]/sidebar:hidden",
        showOnHover &&
          "transition-opacity group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 peer-data-[active=true]/menu-button:text-secondary-foreground md:opacity-0",
        className
      )}
      {...props}
    />
  )
}

/**
 * A count at the end of an item (a Nelumbo Badge). Collapsed to icons it
 * shrinks to a dot on the icon, so new activity still shows.
 */
function SidebarMenuBadge({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <Badge
      data-slot="sidebar-menu-badge"
      data-sidebar="menu-badge"
      size="sm"
      className={cn(
        "pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 bg-surface-container-highest tabular-nums text-foreground select-none",
        "transition-all duration-[519ms] ease-(--ease-spring) motion-reduce:transition-none",
        "peer-data-[size=sm]/menu-button:h-4 peer-data-[size=sm]/menu-button:px-1.5",
        "group-data-[collapsible=icon]/sidebar:top-2 group-data-[collapsible=icon]/sidebar:right-3.5 group-data-[collapsible=icon]/sidebar:h-2 group-data-[collapsible=icon]/sidebar:w-2",
        "group-data-[collapsible=icon]/sidebar:min-w-0 group-data-[collapsible=icon]/sidebar:bg-destructive group-data-[collapsible=icon]/sidebar:px-0 group-data-[collapsible=icon]/sidebar:text-[0px]",
        className
      )}
      {...props}
    />
  )
}

/** A loading row. The width is picked from the id, so server and client agree. */
function SidebarMenuSkeleton({ className, showIcon = false, ...props }: React.ComponentProps<"div"> & { showIcon?: boolean }) {
  const id = React.useId()
  const width = React.useMemo(() => {
    let h = 0
    for (const c of id) h = (h * 31 + c.charCodeAt(0)) % 41
    return `${50 + h}%`
  }, [id])

  return (
    <div data-slot="sidebar-menu-skeleton" data-sidebar="menu-skeleton" aria-hidden className={cn("flex h-10 items-center gap-3 px-3", className)} {...props}>
      {showIcon && <span className="size-6 shrink-0 animate-pulse rounded-full bg-surface-container-highest motion-reduce:animate-none" data-sidebar="menu-skeleton-icon" />}
      <span
        data-sidebar="menu-skeleton-text"
        className="h-4 max-w-(--skeleton-width) flex-1 animate-pulse rounded-full bg-surface-container-highest motion-reduce:animate-none"
        style={{ "--skeleton-width": width } as React.CSSProperties}
      />
    </div>
  )
}

/* ---------------------------------------------------------------- sub-menu */

/** Indented under its parent, with no guide line: the indent and the tonal pill do the work. */
function SidebarMenuSub({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="sidebar-menu-sub"
      data-sidebar="menu-sub"
      className={cn("ml-9 flex min-w-0 flex-col gap-1 py-1 group-data-[collapsible=icon]/sidebar:hidden", className)}
      {...props}
    />
  )
}

function SidebarMenuSubItem({ className, ...props }: React.ComponentProps<"li">) {
  return <li data-slot="sidebar-menu-sub-item" data-sidebar="menu-sub-item" className={cn("group/menu-sub-item relative", className)} {...props} />
}

function SidebarMenuSubButton({
  asChild = false,
  size = "md",
  isActive = false,
  className,
  ...props
}: React.ComponentProps<"a"> & { asChild?: boolean; size?: "sm" | "md"; isActive?: boolean }) {
  const Comp = asChild ? Slot.Root : "a"
  return (
    <Comp
      data-slot="sidebar-menu-sub-button"
      data-sidebar="menu-sub-button"
      data-size={size}
      data-active={isActive}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "state-layer flex min-w-0 cursor-pointer items-center gap-2 overflow-hidden rounded-full px-3 text-muted-foreground outline-none hover:text-foreground",
        "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring",
        "disabled:pointer-events-none disabled:opacity-40 aria-disabled:pointer-events-none aria-disabled:opacity-40",
        "[&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
        "data-[active=true]:bg-secondary data-[active=true]:text-secondary-foreground group-data-[pill]/sidebar-content:data-[active=true]:bg-transparent",
        size === "sm" ? "h-8 type-label-md" : "h-9 type-label-lg",
        className
      )}
      {...props}
    />
  )
}

/* ------------------------------------------------------------ collapsible */

/**
 * A sub-menu's wrapper (Radix Collapsible). Use it as the item:
 *
 *   <SidebarCollapsible asChild defaultOpen>
 *     <SidebarMenuItem>
 *       <SidebarCollapsibleTrigger asChild>
 *         <SidebarMenuButton><Icon name="folder" /><span>Projects</span><SidebarMenuChevron /></SidebarMenuButton>
 *       </SidebarCollapsibleTrigger>
 *       <SidebarCollapsibleContent><SidebarMenuSub>…</SidebarMenuSub></SidebarCollapsibleContent>
 *     </SidebarMenuItem>
 *   </SidebarCollapsible>
 */
// Sub-menus use the shared Collapsible, which ships the height-and-fade animation.
function SidebarCollapsible({ className, ...props }: React.ComponentProps<typeof Collapsible>) {
  return <Collapsible data-slot="sidebar-collapsible" className={cn("group/collapsible", className)} {...props} />
}

function SidebarCollapsibleTrigger(props: React.ComponentProps<typeof CollapsibleTrigger>) {
  return <CollapsibleTrigger data-slot="sidebar-collapsible-trigger" {...props} />
}

function SidebarCollapsibleContent(props: React.ComponentProps<typeof CollapsibleContent>) {
  return <CollapsibleContent data-slot="sidebar-collapsible-content" {...props} />
}

/** The chevron at the end of a collapsible item: turns on a spring as the sub-menu opens. */
function SidebarMenuChevron({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden
      data-slot="sidebar-menu-chevron"
      className={cn(
        "ml-auto grid size-6 shrink-0 place-items-center text-muted-foreground",
        "transition-transform duration-500 ease-(--ease-spring-bouncy) group-data-[state=open]/collapsible:rotate-90 motion-reduce:transition-none",
        className
      )}
      {...props}
    >
      <Icon name="chevron_right" />
    </span>
  )
}

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  SidebarCollapsible,
  SidebarCollapsibleTrigger,
  SidebarCollapsibleContent,
  SidebarMenuChevron,
  useSidebar,
  type SidebarProps,
  type SidebarProviderProps,
  type SidebarMenuButtonProps,
}
