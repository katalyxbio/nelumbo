"use client"

import * as React from "react"
import { cva } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Fab, type FabProps } from "@/registry/nelumbo/ui/fab"
import { IconButton, type IconButtonProps } from "@/registry/nelumbo/ui/icon-button"
import { SearchBar } from "@/registry/nelumbo/ui/search"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/registry/nelumbo/ui/tooltip"

/**
 * Nelumbo App Bars (Material 3 Top App Bar and Bottom App Bar)
 *
 * Both bars live in this file because they share one scroll engine
 * (`useBarScroll`): install "app-bar" and you get TopAppBar and BottomAppBar.
 *
 *   <div ref={scroller} className="h-dvh overflow-y-auto">
 *     <TopAppBar variant="large" scrollBehavior="collapse" scrollTarget={scroller}>
 *       <TopAppBarNavigation />
 *       <TopAppBarTitle subtitle="12 unread">Inbox</TopAppBarTitle>
 *       <TopAppBarActions>
 *         <TopAppBarAction icon="search" label="Search" />
 *         <TopAppBarAction icon="more_vert" label="More" />
 *       </TopAppBarActions>
 *     </TopAppBar>
 *     ...content...
 *     <BottomAppBar hideOnScroll scrollTarget={scroller}>
 *       <BottomAppBarActions>
 *         <BottomAppBarAction icon="check_box" label="Select" />
 *         <BottomAppBarAction icon="edit" label="Edit" />
 *       </BottomAppBarActions>
 *       <BottomAppBarFab icon="add" label="Compose" />
 *     </BottomAppBar>
 *   </div>
 *
 * TopAppBar
 * - `variant`: "small" (64px, title inline), "center" (centered title),
 *   "medium" (112px, title moves below the icons), "large" (152px headline).
 * - `scrollBehavior`:
 *     "none"     the bar rests on the page background.
 *     "elevate"  once content scrolls under it the bar fills with surface-container
 *                and lifts (the fill ramps in over the first 16px).
 *     "collapse" medium and large only: the headline shrinks and cross-fades into the
 *                small inline title as you scroll, driven by scroll position (CSS
 *                custom property --bar-p, 0 to 1). When scrolling stops half way it
 *                springs to the nearest end (`settle`, on by default). On small and
 *                center it behaves like "elevate".
 *     "hide"     slides away scrolling down, returns scrolling up, and whenever focus
 *                moves into it.
 * - `scrollTarget`: a ref or element for the scrolling container. Default: the window.
 *   The bar is `position: sticky`, so it must be a descendant of that scroller.
 * - `as`: "header" (default) or "div". Give a page-level bar role="banner" if it is
 *   not already a direct child of body. Titles are h1 by default (`as` on
 *   TopAppBarTitle: h1 | h2 | h3 | p | div). In medium and large the headline is the
 *   one real heading; the inline copy that fades in is aria-hidden.
 * - TopAppBarSearch is the search-in-app-bar pattern: a Nelumbo SearchBar that fills the bar.
 *
 * BottomAppBar
 * - An 80px surface-container bar (plus the home-indicator inset) with up to four
 *   actions at the start and an optional FAB at the end.
 * - `floating` (M3 Expressive): a rounded 64px bar that floats above the content.
 * - `hideOnScroll`: slides down scrolling down, back up scrolling up, and when focused.
 * - Reduced motion: no springs and no slide transitions; the scroll-driven values still apply.
 */

/* ----------------------------------------------------------------------- */
/* scroll engine                                                           */

type ScrollTarget = React.RefObject<HTMLElement | null> | HTMLElement | null | undefined

type BarScrollOptions = {
  target?: ScrollTarget
  /** Pixels of scroll over which the headline collapses. 0 disables collapse. */
  range?: number
  /** Fill the bar (elevate) as content scrolls under it. */
  fill?: boolean
  /** Slide away on scroll down. `1` slides up out of view (top bar), `-1` slides down (bottom bar). */
  hide?: 1 | -1 | 0
  settle?: boolean
}

const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v))

function useBarScroll(ref: React.RefObject<HTMLElement | null>, { target, range = 0, fill = false, hide = 0, settle = true }: BarScrollOptions) {
  React.useEffect(() => {
    const bar = ref.current
    if (!bar) return
    const el = target && "current" in target ? target.current : (target ?? null)
    const scroller: HTMLElement | Window = el ?? window
    const read = () => Math.max(0, el ? el.scrollTop : window.scrollY)
    const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches

    let raf = 0
    let last = read()
    let run = 0 // distance scrolled in the current direction
    let hidden = false
    let idle = 0
    let pointerDown = false
    let anim = 0

    const setHidden = (v: boolean) => {
      if (v === hidden) return
      hidden = v
      bar.toggleAttribute("data-hidden", v)
    }

    const apply = () => {
      raf = 0
      const y = read()
      const p = range ? clamp(y / range) : 0
      bar.style.setProperty("--bar-p", p.toFixed(4))
      bar.toggleAttribute("data-scrolled", y > 0.5)
      bar.toggleAttribute("data-collapsed", range > 0 && p >= 1)
      if (fill || range) bar.style.setProperty("--bar-fill", (range ? p : clamp(y / 16)).toFixed(4))
      if (hide) {
        const dy = y - last
        run = Math.sign(dy) === Math.sign(run) ? run + dy : dy
        if (y <= 0) setHidden(false)
        else if (run > 12 && y > bar.offsetHeight) setHidden(true)
        else if (run < -8) setHidden(false)
      }
      last = y
    }

    const stopAnim = () => {
      cancelAnimationFrame(anim)
      anim = 0
    }

    // Spring the scroll position to the nearest end of the collapse range.
    const settleTo = (goal: number) => {
      const set = (v: number) => (el ? (el.scrollTop = v) : window.scrollTo(0, v))
      if (reduced()) return set(goal)
      let pos = read()
      let vel = 0
      let prev = performance.now()
      const step = (now: number) => {
        const dt = Math.min(0.032, (now - prev) / 1000)
        prev = now
        // critically damped spring: no overshoot, so the bar never bounces past its ends
        vel += (170 * (goal - pos) - 26 * vel) * dt
        pos += vel * dt
        if (Math.abs(goal - pos) < 0.4 && Math.abs(vel) < 4) {
          set(goal)
          anim = 0
          return
        }
        set(pos)
        anim = requestAnimationFrame(step)
      }
      anim = requestAnimationFrame(step)
    }

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(apply)
      if (range && settle) {
        clearTimeout(idle)
        idle = window.setTimeout(() => {
          const y = read()
          if (pointerDown || y <= 0.5 || y >= range - 0.5 || anim) return
          settleTo(y / range >= 0.5 ? range : 0)
        }, 160)
      }
    }
    const interrupt = () => stopAnim()
    const down = () => {
      pointerDown = true
      stopAnim()
    }
    const up = () => {
      pointerDown = false
      onScroll()
    }
    const onFocus = () => setHidden(false)

    apply()
    scroller.addEventListener("scroll", onScroll, { passive: true })
    scroller.addEventListener("wheel", interrupt, { passive: true })
    scroller.addEventListener("keydown", interrupt)
    scroller.addEventListener("touchstart", down, { passive: true })
    scroller.addEventListener("touchend", up, { passive: true })
    scroller.addEventListener("pointerdown", down, { passive: true })
    scroller.addEventListener("pointerup", up, { passive: true })
    bar.addEventListener("focusin", onFocus)
    return () => {
      scroller.removeEventListener("scroll", onScroll)
      scroller.removeEventListener("wheel", interrupt)
      scroller.removeEventListener("keydown", interrupt)
      scroller.removeEventListener("touchstart", down)
      scroller.removeEventListener("touchend", up)
      scroller.removeEventListener("pointerdown", down)
      scroller.removeEventListener("pointerup", up)
      bar.removeEventListener("focusin", onFocus)
      cancelAnimationFrame(raf)
      stopAnim()
      clearTimeout(idle)
    }
  }, [ref, target, range, fill, hide, settle])
}

function useMergedRef<T>(...refs: (React.Ref<T> | undefined)[]) {
  return React.useCallback(
    (node: T | null) => {
      for (const r of refs) {
        if (typeof r === "function") r(node)
        else if (r) (r as React.RefObject<T | null>).current = node
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    refs
  )
}

/** An icon button with a tooltip, sized for a bar (48px target). */
function BarAction({ label, size = "lg", ...props }: IconButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <IconButton {...(props as IconButtonProps)} label={label} size={size} />
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

/* ----------------------------------------------------------------------- */
/* TopAppBar                                                               */

const EXPANDED = { small: 64, center: 64, medium: 112, large: 152 } as const
type TopAppBarVariant = keyof typeof EXPANDED
type ScrollBehavior = "none" | "elevate" | "collapse" | "hide"

type BarContext = { variant: TopAppBarVariant }
const BarCtx = React.createContext<BarContext>({ variant: "small" })

const topBar = cva(
  [
    "group/top-bar relative isolate z-20 grid h-(--bar-h) w-full shrink-0 items-start text-foreground",
    "grid-rows-[4rem_1fr] [--bar-h:4rem] [--bar-collapsed:4rem]",
    // the hide slide
    "transition-transform duration-[450ms] ease-(--ease-spring) motion-reduce:duration-0 data-hidden:-translate-y-[calc(100%+1px)]",
  ],
  {
    variants: {
      variant: {
        small: "grid-cols-[auto_1fr_auto]",
        center: "grid-cols-[1fr_auto_1fr]",
        medium: "grid-cols-[auto_1fr_auto] [--bar-h:7rem]",
        large: "grid-cols-[auto_1fr_auto] [--bar-h:9.5rem]",
      },
    },
  }
)

type TopAppBarProps = Omit<React.ComponentProps<"header">, "ref"> & {
  variant?: TopAppBarVariant
  scrollBehavior?: ScrollBehavior
  /** The scrolling container. Defaults to the window. */
  scrollTarget?: ScrollTarget
  /** Spring a half-collapsed bar to its nearest end when scrolling stops (collapse only). */
  settle?: boolean
  /** Render a `header` (default) or a plain `div`. */
  as?: "header" | "div"
  ref?: React.Ref<HTMLElement>
}

function TopAppBar({
  className,
  variant = "small",
  scrollBehavior = "none",
  scrollTarget,
  settle = true,
  as: Comp = "header",
  style,
  children,
  ref,
  ...props
}: TopAppBarProps) {
  const inner = React.useRef<HTMLElement>(null)
  const merged = useMergedRef<HTMLElement>(inner, ref)
  const expanded = variant === "medium" || variant === "large"
  const collapse = scrollBehavior === "collapse" && expanded
  useBarScroll(inner, {
    target: scrollTarget,
    range: collapse ? EXPANDED[variant] - 64 : 0,
    fill: scrollBehavior === "elevate" || scrollBehavior === "hide" || scrollBehavior === "collapse",
    hide: scrollBehavior === "hide" ? 1 : 0,
    settle,
  })

  return (
    <BarCtx.Provider value={{ variant }}>
      <Comp
        ref={merged as React.Ref<never>}
        data-slot="top-app-bar"
        data-variant={variant}
        data-scroll-behavior={scrollBehavior}
        className={cn(
          topBar({ variant }),
          // sticky; a collapsing bar sticks with only its 64px row showing
          collapse ? "sticky top-[calc(var(--bar-collapsed)-var(--bar-h))]" : "sticky top-0",
          className
        )}
        style={
          {
            ...(expanded ? { "--inline-o": collapse ? "clamp(0, calc((var(--bar-p, 0) - 0.5) * 2), 1)" : "0" } : null),
            ...(collapse
              ? {
                  "--head-o": "max(0, calc(1 - var(--bar-p, 0) * 1.7))",
                  "--head-s": "calc(1 - var(--bar-p, 0) * 0.3)",
                  "--row-y": "calc(var(--bar-p, 0) * (var(--bar-h) - var(--bar-collapsed)))",
                }
              : null),
            ...style,
          } as React.CSSProperties
        }
        {...props}
      >
        {/* the page-colored base, and the tonal fill that fades in on scroll */}
        <span aria-hidden data-slot="top-app-bar-base" className="absolute inset-0 -z-20 bg-background" />
        <span
          aria-hidden
          data-slot="top-app-bar-fill"
          className={cn(
            "absolute inset-0 -z-10 bg-surface-container shadow-e2 dark:bg-surface-container-low",
            "opacity-[var(--bar-fill,0)]",
            // collapse is driven continuously by scroll position; the others ease the ramp
            !collapse && "transition-opacity duration-200 ease-(--ease-standard) motion-reduce:transition-none"
          )}
        />
        {children}
      </Comp>
    </BarCtx.Provider>
  )
}

/** Shared placement: the first row, shifted down while a collapsing bar scrolls so it stays put. */
const rowCell = "row-start-1 translate-y-[var(--row-y,0px)] self-center"

type TopAppBarNavigationProps = Partial<IconButtonProps> & { children?: React.ReactNode }

/** The leading icon button (menu by default; pass icon="arrow_back" for a back button). */
function TopAppBarNavigation({ className, icon = "menu", label = "Open navigation", children, ...props }: TopAppBarNavigationProps) {
  return (
    <div data-slot="top-app-bar-navigation" className={cn(rowCell, "col-start-1 flex ps-1 pe-1", className)}>
      {children ?? <BarAction {...(props as IconButtonProps)} icon={icon} label={label} />}
    </div>
  )
}

type TopAppBarTitleProps = Omit<React.ComponentProps<"div">, "title"> & {
  /** A second, quieter line (M3 Expressive). */
  subtitle?: React.ReactNode
  /** Heading element. Default h1. */
  as?: "h1" | "h2" | "h3" | "p" | "div"
}

/**
 * The title. In "medium" and "large" it renders twice: the headline below the icons
 * (the real heading) and a small inline copy (aria-hidden) that fades in on collapse.
 */
function TopAppBarTitle({ className, subtitle, as: Heading = "h1", children, ...props }: TopAppBarTitleProps) {
  const { variant } = React.useContext(BarCtx)
  const expanded = variant === "medium" || variant === "large"
  const centered = variant === "center"
  const lines = (title: string, sub: string) => (
    <>
      <span className={title}>{children}</span>
      {subtitle && <span className={cn("block truncate type-label-md text-muted-foreground", sub)}>{subtitle}</span>}
    </>
  )

  return (
    <>
      <div
        data-slot="top-app-bar-title"
        aria-hidden={expanded || undefined}
        className={cn(
          rowCell,
          "col-start-2 min-w-0 px-3",
          centered && "text-center",
          expanded && "pointer-events-none opacity-[var(--inline-o,0)] translate-y-[calc(var(--row-y,0px)+(1-var(--inline-o,0))*0.5rem)]",
          !expanded && className
        )}
      >
        {expanded ? (
          lines("block truncate type-title-lg", "")
        ) : (
          <Heading className="m-0 font-[inherit]" {...(props as object)}>
            {lines("block truncate type-title-lg", "")}
          </Heading>
        )}
      </div>
      {expanded && (
        <Heading
          data-slot="top-app-bar-headline"
          className={cn(
            "col-span-3 row-start-2 min-w-0 origin-bottom-left self-end px-4 font-[inherit]",
            variant === "large" ? "pb-5" : "pb-3",
            "opacity-[var(--head-o,1)] scale-[var(--head-s,1)]",
            className
          )}
          {...(props as object)}
        >
          <span className={cn("block text-balance", variant === "large" ? "type-headline-lg" : "type-headline-sm")}>{children}</span>
          {subtitle && <span className="block truncate type-label-lg text-muted-foreground">{subtitle}</span>}
        </Heading>
      )}
    </>
  )
}

/** Trailing actions: a row of icon buttons. Keep it to three, then an overflow menu. */
function TopAppBarActions({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="top-app-bar-actions" className={cn(rowCell, "col-start-3 flex items-center ps-1 pe-1", className)} {...props} />
}

/** An IconButton sized for the bar (48px) with a tooltip. */
const TopAppBarAction = BarAction

type TopAppBarSearchProps = React.ComponentProps<typeof SearchBar>

/** Search in the bar: a SearchBar filling the row. Use it instead of a title. */
function TopAppBarSearch({ className, size = "sm", ...props }: TopAppBarSearchProps) {
  return (
    <div data-slot="top-app-bar-search" className={cn(rowCell, "col-span-3 col-start-1 min-w-0 px-4")}>
      <SearchBar size={size} className={className} {...props} />
    </div>
  )
}

/* ----------------------------------------------------------------------- */
/* BottomAppBar                                                            */

type BottomAppBarProps = Omit<React.ComponentProps<"div">, "ref"> & {
  /** M3 Expressive: a rounded bar that floats above the content. */
  floating?: boolean
  /** Slide down while scrolling down, return while scrolling up. */
  hideOnScroll?: boolean
  /** The scrolling container. Defaults to the window. */
  scrollTarget?: ScrollTarget
  /** "header"/"footer" semantics are not right for a toolbar: it renders role="toolbar" when named. */
  "aria-label"?: string
  ref?: React.Ref<HTMLElement>
}

function BottomAppBar({ className, floating = false, hideOnScroll = false, scrollTarget, children, ref, ...props }: BottomAppBarProps) {
  const inner = React.useRef<HTMLElement>(null)
  const merged = useMergedRef<HTMLElement>(inner, ref)
  useBarScroll(inner, { target: scrollTarget, hide: hideOnScroll ? -1 : 0 })
  const label = props["aria-label"]

  return (
    <div
      ref={merged as React.Ref<HTMLDivElement>}
      data-slot="bottom-app-bar"
      data-floating={floating || undefined}
      role={label ? "toolbar" : undefined}
      className={cn(
        "relative z-20 flex shrink-0 items-center justify-between gap-2 text-foreground",
        "transition-transform duration-[450ms] ease-(--ease-spring) motion-reduce:duration-0",
        floating
          ? // 64px pill that floats a little above the bottom edge
            "sticky bottom-[calc(1rem+env(safe-area-inset-bottom))] mx-4 mb-[calc(1rem+env(safe-area-inset-bottom))] h-16 rounded-[1.75rem] bg-surface-container-high ps-2 pe-2 shadow-e2 dark:bg-surface-container-highest data-hidden:translate-y-[calc(100%+3rem)]"
          : "sticky bottom-0 h-[calc(5rem+env(safe-area-inset-bottom))] bg-surface-container pb-[env(safe-area-inset-bottom)] ps-2 pe-4 dark:bg-surface-container-low data-hidden:translate-y-full",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

/** Up to four actions at the bar's start. */
function BottomAppBarActions({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="bottom-app-bar-actions" className={cn("flex items-center gap-1", className)} {...props} />
}

/** An IconButton sized for the bar (48px) with a tooltip. */
const BottomAppBarAction = BarAction

/** The bar's FAB, at the end. A Nelumbo Fab with its shadow pulled down to sit in the bar. */
function BottomAppBarFab({ className, ...props }: FabProps) {
  return <Fab data-slot="bottom-app-bar-fab" className={cn("shadow-e1 hover:shadow-e2 active:shadow-e1", className)} {...props} />
}

export {
  TopAppBar,
  TopAppBarNavigation,
  TopAppBarTitle,
  TopAppBarActions,
  TopAppBarAction,
  TopAppBarSearch,
  BottomAppBar,
  BottomAppBarActions,
  BottomAppBarAction,
  BottomAppBarFab,
  useBarScroll,
  type TopAppBarProps,
  type TopAppBarVariant,
  type BottomAppBarProps,
}
