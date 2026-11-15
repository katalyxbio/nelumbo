"use client"

import * as React from "react"
import { ScrollArea as ScrollAreaPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

/**
 * Nelumbo ScrollArea (built on Radix ScrollArea)
 *
 * shadcn's API, so shadcn code works unchanged:
 *
 *   <ScrollArea className="h-72 w-48 rounded-2xl">
 *     <div className="p-4">…</div>
 *   </ScrollArea>
 *
 *   <ScrollArea className="w-96 whitespace-nowrap">
 *     <div className="flex w-max gap-4 p-4">…</div>
 *     <ScrollBar orientation="horizontal" />
 *   </ScrollArea>
 *
 * Nelumbo additions:
 *
 *   <ScrollArea fade className="h-72 rounded-2xl">…</ScrollArea>
 *
 * - The thumb is a thin, rounded bar (6px) in the foreground color at low
 *   opacity. It grows to 10px with a spring while the area is hovered, and
 *   has no track background. Bars sit a few pixels in from the edge.
 * - `type` defaults to "hover": bars appear while the pointer is over the
 *   area and fade out `scrollHideDelay` ms (600) after it leaves. Use
 *   "always" or "scroll" to keep them visible.
 * - `fade`: soft fades at the edges that have more content to scroll to.
 *   Each edge fades in and out only while there is content beyond it, so the
 *   first and last items are never dimmed.
 * - The viewport is focusable (Tab) only while it can scroll, with a focus
 *   ring. Arrow keys, Page Up/Down, Home and End scroll it natively.
 * - Label a scrollable region with `aria-label` or `aria-labelledby`; the
 *   label goes on the viewport, which then has role "region".
 *
 * Put `<ScrollBar orientation="horizontal" />` anywhere inside ScrollArea; it
 * is rendered beside the viewport, not inside the scrolling content. A
 * vertical bar is always there unless you pass your own.
 */

// Fade edges: the mask uses these, and they animate with the registered
// properties (browsers without @property jump to the end state).
const CSS = `
@property --vlv-fade-top { syntax: "<length>"; inherits: false; initial-value: 0px }
@property --vlv-fade-bottom { syntax: "<length>"; inherits: false; initial-value: 0px }
@property --vlv-fade-start { syntax: "<length>"; inherits: false; initial-value: 0px }
@property --vlv-fade-end { syntax: "<length>"; inherits: false; initial-value: 0px }
.vlv-scroll-fade {
  --vlv-fade-size: 32px;
  transition: --vlv-fade-top 240ms var(--ease-standard), --vlv-fade-bottom 240ms var(--ease-standard),
    --vlv-fade-start 240ms var(--ease-standard), --vlv-fade-end 240ms var(--ease-standard);
  mask-image:
    linear-gradient(to bottom, transparent, #000 var(--vlv-fade-top), #000 calc(100% - var(--vlv-fade-bottom)), transparent),
    linear-gradient(to right, transparent, #000 var(--vlv-fade-start), #000 calc(100% - var(--vlv-fade-end)), transparent);
  mask-composite: intersect;
  -webkit-mask-image:
    linear-gradient(to bottom, transparent, #000 var(--vlv-fade-top), #000 calc(100% - var(--vlv-fade-bottom)), transparent),
    linear-gradient(to right, transparent, #000 var(--vlv-fade-start), #000 calc(100% - var(--vlv-fade-end)), transparent);
  -webkit-mask-composite: source-in;
}
@media (prefers-reduced-motion: reduce) {
  .vlv-scroll-fade { transition: none }
}
`

function Keyframes() {
  return (
    <style href="nelumbo-scroll-area" precedence="default">
      {CSS}
    </style>
  )
}

type Edges = { top: boolean; bottom: boolean; start: boolean; end: boolean; scrollable: boolean }
const NO_EDGES: Edges = { top: false, bottom: false, start: false, end: false, scrollable: false }

function sameEdges(a: Edges, b: Edges) {
  return a.top === b.top && a.bottom === b.bottom && a.start === b.start && a.end === b.end && a.scrollable === b.scrollable
}

/** Tracks which directions have content beyond the viewport's visible box. */
function useScrollEdges(ref: React.RefObject<HTMLDivElement | null>, fade: boolean) {
  const [edges, setEdges] = React.useState<Edges>(NO_EDGES)

  React.useEffect(() => {
    const el = ref.current
    if (!el) return

    const update = () => {
      const maxY = el.scrollHeight - el.clientHeight
      const maxX = el.scrollWidth - el.clientWidth
      const y = el.scrollTop
      // scrollLeft is negative in RTL, so compare magnitudes
      const x = Math.abs(el.scrollLeft)
      const next: Edges = {
        top: fade && y > 1,
        bottom: fade && y < maxY - 1,
        start: fade && x > 1,
        end: fade && x < maxX - 1,
        scrollable: maxY > 1 || maxX > 1,
      }
      setEdges((prev) => (sameEdges(prev, next) ? prev : next))
    }

    update()
    el.addEventListener("scroll", update, { passive: true })
    const ro = new ResizeObserver(update)
    ro.observe(el)
    if (el.firstElementChild) ro.observe(el.firstElementChild)
    return () => {
      el.removeEventListener("scroll", update)
      ro.disconnect()
    }
  }, [ref, fade])

  return edges
}

function ScrollBar({
  className,
  orientation = "vertical",
  forceMount = true,
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>) {
  const vertical = orientation === "vertical"
  return (
    <ScrollAreaPrimitive.ScrollAreaScrollbar
      data-slot="scroll-area-scrollbar"
      data-orientation={orientation}
      orientation={orientation}
      forceMount={forceMount}
      className={cn(
        "flex touch-none select-none",
        // the track is transparent; the box is wide enough for the thumb's hover size, with a little air at the edges
        vertical ? "h-full w-4 flex-col items-center py-1" : "h-4 w-full flex-row items-center px-1",
        // hover type fades the bars; hidden ones let pointers through
        "transition-opacity duration-300 ease-standard motion-reduce:transition-none",
        "data-[state=hidden]:pointer-events-none data-[state=hidden]:opacity-0",
        className
      )}
      {...props}
    >
      <ScrollAreaPrimitive.ScrollAreaThumb
        data-slot="scroll-area-thumb"
        className={cn(
          // Radix sets an inline size on the thumb; the ! classes win over it
          "relative rounded-full bg-foreground/30 transition-[width,height,background-color] duration-300 ease-spring hover:bg-foreground/50 data-[state=hidden]:hidden motion-reduce:transition-none",
          vertical
            ? "mx-auto w-1.5! group-hover/scroll-area:w-2.5!"
            : "my-auto h-1.5! group-hover/scroll-area:h-2.5!"
        )}
      />
    </ScrollAreaPrimitive.ScrollAreaScrollbar>
  )
}

function isScrollBar(child: React.ReactNode): child is React.ReactElement<React.ComponentProps<typeof ScrollBar>> {
  return React.isValidElement(child) && child.type === ScrollBar
}

type ScrollAreaProps = React.ComponentProps<typeof ScrollAreaPrimitive.Root> & {
  /** Soft fades at the edges that have more content to scroll to. */
  fade?: boolean
  /** Viewport label (used when the viewport is scrollable). */
  "aria-label"?: string
  "aria-labelledby"?: string
}

function ScrollArea({
  className,
  children,
  type = "hover",
  scrollHideDelay = 600,
  fade = false,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  ...props
}: ScrollAreaProps) {
  const viewportRef = React.useRef<HTMLDivElement>(null)
  const edges = useScrollEdges(viewportRef, fade)

  const kids = React.Children.toArray(children)
  const bars = kids.filter(isScrollBar)
  const content = kids.filter((child) => !isScrollBar(child))
  const hasVertical = bars.some((bar) => (bar.props.orientation ?? "vertical") === "vertical")

  const fadeVars = fade
    ? ({
        "--vlv-fade-top": edges.top ? "var(--vlv-fade-size)" : "0px",
        "--vlv-fade-bottom": edges.bottom ? "var(--vlv-fade-size)" : "0px",
        "--vlv-fade-start": edges.start ? "var(--vlv-fade-size)" : "0px",
        "--vlv-fade-end": edges.end ? "var(--vlv-fade-size)" : "0px",
      } as React.CSSProperties)
    : undefined

  return (
    <>
      {fade && <Keyframes />}
      <ScrollAreaPrimitive.Root
        data-slot="scroll-area"
        type={type}
        scrollHideDelay={scrollHideDelay}
        className={cn("group/scroll-area relative min-h-0 min-w-0", className)}
        {...props}
      >
        <ScrollAreaPrimitive.Viewport
          ref={viewportRef}
          data-slot="scroll-area-viewport"
          role={edges.scrollable && (ariaLabel || ariaLabelledBy) ? "region" : undefined}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          tabIndex={edges.scrollable ? 0 : undefined}
          style={fadeVars}
          className={cn(
            "peer size-full rounded-[inherit] outline-none",
            fade && "vlv-scroll-fade"
          )}
        >
          {content}
        </ScrollAreaPrimitive.Viewport>
        {/* the focus ring is drawn here, not on the viewport, so the fade mask doesn't cut it */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit] peer-focus-visible:outline-2 peer-focus-visible:-outline-offset-2 peer-focus-visible:outline-ring"
        />
        {!hasVertical && <ScrollBar />}
        {bars}
        <ScrollAreaPrimitive.Corner />
      </ScrollAreaPrimitive.Root>
    </>
  )
}

export { ScrollArea, ScrollBar, type ScrollAreaProps }
