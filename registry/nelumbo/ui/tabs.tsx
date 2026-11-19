"use client"

import * as React from "react"
import { Tabs as TabsPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { Icon, type IconName } from "@/registry/nelumbo/ui/icon"

/**
 * Nelumbo Tabs (built on Radix Tabs)
 *
 * API-compatible with shadcn's Tabs (Tabs, TabsList, TabsTrigger,
 * TabsContent), plus:
 *  - TabsList `variant`: "pill" (default: a raised pill on a tonal track,
 *    like shadcn) or "underline" (Material primary tabs: a 3px bar under the
 *    label, on a hairline).
 *  - The indicator is one element that slides and resizes between tabs on
 *    the smooth spring, instead of each tab fading its own background.
 *  - TabsList `color="brand"`: brand underline (underline variant).
 *  - TabsList `fullWidth`: tabs share the width equally.
 *  - TabsTrigger `icon` and `badge` (a count, or `true` for a dot).
 *  - Underline lists scroll sideways when the tabs don't fit.
 *
 *   <Tabs defaultValue="overview">
 *     <TabsList variant="underline">
 *       <TabsTrigger value="overview">Overview</TabsTrigger>
 *       <TabsTrigger value="activity" badge={3}>Activity</TabsTrigger>
 *     </TabsList>
 *     <TabsContent value="overview">…</TabsContent>
 *   </Tabs>
 */
function Tabs({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return <TabsPrimitive.Root data-slot="tabs" className={cn("flex max-w-full min-w-0 flex-col gap-4", className)} {...props} />
}

type TabsListProps = React.ComponentProps<typeof TabsPrimitive.List> & {
  variant?: "pill" | "underline"
  color?: "default" | "brand"
  fullWidth?: boolean
}

const LIST = {
  pill: "h-11 gap-1 rounded-full bg-surface-container-high p-1 dark:bg-surface-container",
  underline: "h-12 overflow-x-auto overflow-y-hidden border-b border-outline-variant [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
}

const INDICATOR = {
  pill: "inset-y-1 rounded-full bg-card shadow-e2 dark:bg-surface-container-highest",
  underline: "bottom-0 h-[3px] rounded-t-full",
}

function TabsList({ className, variant = "pill", color = "default", fullWidth = false, children, ...props }: TabsListProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const [box, setBox] = React.useState<{ x: number; w: number } | null>(null)
  const [ready, setReady] = React.useState(false)

  // Measure the active tab (for underline: its label) and move the indicator there.
  const measure = React.useCallback(() => {
    const list = ref.current
    const tab = list?.querySelector<HTMLElement>("[role=tab][data-state=active]")
    if (!list || !tab) return setBox(null)
    const target = variant === "underline" ? (tab.querySelector<HTMLElement>("[data-tab-content]") ?? tab) : tab
    const l = list.getBoundingClientRect()
    const t = target.getBoundingClientRect()
    setBox({ x: t.left - l.left + list.scrollLeft, w: t.width })
    if (variant === "underline" && list.scrollWidth > list.clientWidth) tab.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" })
  }, [variant])

  React.useLayoutEffect(() => {
    const list = ref.current
    if (!list) return
    measure()
    // turn transitions on after the first placement, so it doesn't slide in from 0
    const raf = requestAnimationFrame(() => setReady(true))
    const mo = new MutationObserver(measure)
    mo.observe(list, { attributes: true, attributeFilter: ["data-state"], subtree: true })
    const ro = new ResizeObserver(measure)
    ro.observe(list)
    list.querySelectorAll("[role=tab]").forEach((t) => ro.observe(t))
    return () => {
      cancelAnimationFrame(raf)
      mo.disconnect()
      ro.disconnect()
    }
  }, [measure])

  return (
    <TabsPrimitive.List
      ref={ref}
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(
        "group/tabs-list relative isolate flex w-fit max-w-full items-stretch",
        LIST[variant],
        fullWidth && "w-full *:flex-1",
        className
      )}
      {...props}
    >
      {children}
      <span
        aria-hidden
        data-slot="tabs-indicator"
        className={cn(
          "pointer-events-none absolute left-0 -z-10 w-(--w) translate-x-(--x)",
          INDICATOR[variant],
          variant === "underline" && (color === "brand" ? "z-10 bg-brand" : "z-10 bg-primary"),
          ready && "transition-[translate,width] duration-[519ms] ease-(--ease-spring) motion-reduce:transition-none",
          !box && "opacity-0"
        )}
        style={{ "--x": `${box?.x ?? 0}px`, "--w": `${box?.w ?? 0}px` } as React.CSSProperties}
      />
    </TabsPrimitive.List>
  )
}

type TabsTriggerProps = React.ComponentProps<typeof TabsPrimitive.Trigger> & {
  icon?: IconName
  /** A count, or true for a dot. */
  badge?: number | boolean
}

function TabsTrigger({ className, icon, badge, children, ...props }: TabsTriggerProps) {
  const hasBadge = badge !== undefined && badge !== false
  const badgeText = typeof badge === "number" ? `${badge} new` : "new"
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "state-layer relative inline-flex shrink-0 cursor-pointer items-center justify-center whitespace-nowrap select-none",
        "type-label-lg text-muted-foreground transition-colors duration-200 hover:text-foreground data-[state=active]:text-foreground",
        "[--icon-size:18px] [--icon-opsz:20] data-[state=active]:[--icon-fill:1]",
        // pill
        "group-data-[variant=pill]/tabs-list:rounded-full group-data-[variant=pill]/tabs-list:px-5 group-data-[variant=pill]/tabs-list:data-[state=active]:font-semibold",
        "group-data-[variant=pill]/tabs-list:data-[state=active]:after:opacity-0",
        // underline
        "group-data-[variant=underline]/tabs-list:px-4 group-data-[variant=underline]/tabs-list:after:rounded-t-lg",
        "outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring",
        "disabled:pointer-events-none disabled:opacity-40",
        className
      )}
      {...props}
    >
      <span data-tab-content className="inline-flex items-center gap-2">
        {icon && <Icon name={icon} />}
        {children}
        {/* announced with the label from content, e.g. "Inbox, 12 new" (an aria-label would hide the visible text) */}
        {hasBadge && <span className="sr-only">, {badgeText}</span>}
        {hasBadge && (
          <span
            aria-hidden
            data-slot="tabs-badge"
            className={cn(
              "rounded-full bg-destructive text-destructive-foreground",
              typeof badge === "number" ? "grid h-4 min-w-4 place-items-center px-1 text-[0.6875rem] leading-none font-semibold tabular-nums" : "size-1.5"
            )}
          >
            {typeof badge === "number" ? badge : null}
          </span>
        )}
      </span>
    </TabsPrimitive.Trigger>
  )
}

function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn(
        "flex-1 outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring",
        "data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:slide-in-from-bottom-1 data-[state=active]:duration-300 data-[state=active]:ease-(--ease-emphasized)",
        className
      )}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent, type TabsListProps, type TabsTriggerProps }
