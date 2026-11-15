"use client"

import * as React from "react"
import useEmblaCarousel, { type UseEmblaCarouselType } from "embla-carousel-react"

import { cn } from "@/lib/utils"
import { IconButton } from "@/registry/velvet/ui/icon-button"

/**
 * Velvet Carousel (built on Embla)
 *
 * shadcn's API, so shadcn code works unchanged (Carousel, CarouselContent,
 * CarouselItem, CarouselPrevious, CarouselNext, CarouselApi; `opts`,
 * `plugins`, `orientation`, `setApi`):
 *
 *   <Carousel className="w-full max-w-xs">
 *     <CarouselContent>
 *       <CarouselItem>…</CarouselItem>
 *     </CarouselContent>
 *     <CarouselPrevious />
 *     <CarouselNext />
 *   </Carousel>
 *
 * Velvet additions, inspired by Material 3's carousel:
 *
 *   <Carousel layout="multi-browse" aria-label="Photos">
 *     <CarouselContent className="h-72">
 *       <CarouselItem><Photo className="h-full" /></CarouselItem>
 *     </CarouselContent>
 *     <CarouselPrevious /><CarouselNext />
 *     <CarouselDots className="mt-4" />
 *   </Carousel>
 *
 * - `layout`
 *     "full" (default)    one item at a time, exactly like shadcn
 *     "uncontained"       equal items (basis 40%, set your own with a
 *                         basis-* class) that run off the edge
 *     "multi-browse"      one large item, a medium one and small ones. The
 *                         large item shrinks as it scrolls off while the next
 *                         one grows, driven by Embla's scroll position, so
 *                         it follows the finger. Needs a height
 *                         (CarouselContent className="h-72").
 *     "hero"              one large item and one small peek
 *   Multi-browse and hero lay the items out themselves: each CarouselItem
 *   becomes a card with a large radius (28px) that you fill (`h-full w-full`).
 *   The card sets `--carousel-p` (0 small .. 1 large), so labels can fade in
 *   as the item grows: style={{ opacity: "calc((var(--carousel-p) - 0.6) * 2.5)" }} (fully in only near full size). Keep labels
 *   on one line (whitespace-nowrap); the card clips them while it is narrow.
 *   Both work vertically too (give CarouselContent a height).
 * - CarouselPrevious / CarouselNext are tonal IconButtons that float over the
 *   edges and fade out at the ends. shadcn's `variant` / `size` props are
 *   accepted and mapped ("outline" becomes tonal).
 * - CarouselDots: one dot per scroll position. The active dot stretches into
 *   a pill with a spring. Every dot is a button.
 * - Arrow keys move between slides while focus is inside the carousel or on
 *   the viewport (Up and Down when vertical). Reduced motion jumps instead of
 *   animating. Roles follow shadcn: region/"carousel", group/"slide".
 */

type CarouselApi = UseEmblaCarouselType[1]
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>
type CarouselOptions = UseCarouselParameters[0]
type CarouselPlugin = UseCarouselParameters[1]
type CarouselLayout = "full" | "uncontained" | "multi-browse" | "hero"

type CarouselProps = {
  opts?: CarouselOptions
  plugins?: CarouselPlugin
  orientation?: "horizontal" | "vertical"
  setApi?: (api: CarouselApi) => void
  /** How items are sized. See the header. Default "full" (shadcn). */
  layout?: CarouselLayout
}

type CarouselContextProps = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0]
  api: CarouselApi
  scrollPrev: () => void
  scrollNext: () => void
  scrollTo: (index: number) => void
  canScrollPrev: boolean
  canScrollNext: boolean
  orientation: "horizontal" | "vertical"
  layout: CarouselLayout
} & Pick<CarouselProps, "opts">

const CarouselContext = React.createContext<CarouselContextProps | null>(null)

function useCarousel() {
  const context = React.useContext(CarouselContext)
  if (!context) throw new Error("useCarousel must be used within a <Carousel />")
  return context
}

const prefersReducedMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches

// ---------------------------------------------------------------------------
// Multi-browse and hero geometry. Embla scrolls a row of invisible "slots"
// (CarouselItem, `Q` wide) so drag, momentum, snapping and swipe stay native.
// Each frame the visible cards are placed from the scroll position `s`
// (measured in slots): the card at distance d from the focus has width
// f(d), large at 0, medium at 1, small further out, interpolated between.
// ---------------------------------------------------------------------------
const GAP = 8

type Geometry = { L: number; M: number; S: number; m: number; Q: number }

function geometry(layout: CarouselLayout, C: number): Geometry {
  const compact = C < 480
  if (layout === "hero") {
    const S = compact ? 48 : 72
    return { L: Math.max(S * 2, C - S - GAP), M: S, S, m: 1, Q: C / 2 }
  }
  const S = compact ? 40 : 56
  const M = S * 2
  const k = Math.max(0, Math.floor((C * 0.5 - M - 2 * GAP) / (S + GAP)))
  const L = Math.max(M + 8, C - M - k * S - (k + 1) * GAP)
  return { L, M, S, m: k + 1, Q: C / (k + 2) }
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t

function widthAt({ L, M, S }: Geometry, d: number) {
  if (d <= -1) return S
  if (d < 0) return lerp(S, L, 1 + d)
  if (d < 1) return lerp(L, M, d)
  if (d < 2) return lerp(M, S, d - 1)
  return S
}

function layoutCards(g: Geometry, n: number, s: number) {
  const widths: number[] = []
  const xs: number[] = []
  for (let i = 0; i < n; i++) widths.push(widthAt(g, i - s))
  const i0 = Math.min(n - 1, Math.max(0, Math.floor(s)))
  const t = s - i0
  xs[i0] = -t * (g.S + GAP)
  for (let i = i0 + 1; i < n; i++) xs[i] = xs[i - 1] + widths[i - 1] + GAP
  for (let i = i0 - 1; i >= 0; i--) xs[i] = xs[i + 1] - GAP - widths[i]
  return { widths, xs }
}

function Carousel({ orientation = "horizontal", opts, setApi, plugins, layout = "full", className, children, ...props }: React.ComponentProps<"div"> & CarouselProps) {
  const virtual = layout === "multi-browse" || layout === "hero"
  const [carouselRef, api] = useEmblaCarousel({ ...(virtual ? { align: "start" as const } : null), ...opts, axis: orientation === "horizontal" ? "x" : "y" }, plugins)
  const [canScrollPrev, setCanScrollPrev] = React.useState(false)
  const [canScrollNext, setCanScrollNext] = React.useState(false)
  const [ready, setReady] = React.useState(!virtual)

  const onSelect = React.useCallback((api: CarouselApi) => {
    if (!api) return
    setCanScrollPrev(api.canScrollPrev())
    setCanScrollNext(api.canScrollNext())
  }, [])

  const scrollPrev = React.useCallback(() => api?.scrollPrev(prefersReducedMotion()), [api])
  const scrollNext = React.useCallback(() => api?.scrollNext(prefersReducedMotion()), [api])
  const scrollTo = React.useCallback((i: number) => api?.scrollTo(i, prefersReducedMotion()), [api])

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      const prev = orientation === "horizontal" ? "ArrowLeft" : "ArrowUp"
      const next = orientation === "horizontal" ? "ArrowRight" : "ArrowDown"
      if (event.target instanceof HTMLElement && /^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName)) return
      if (event.key === prev) {
        event.preventDefault()
        scrollPrev()
      } else if (event.key === next) {
        event.preventDefault()
        scrollNext()
      }
    },
    [orientation, scrollPrev, scrollNext]
  )

  React.useEffect(() => {
    if (api && setApi) setApi(api)
  }, [api, setApi])

  React.useEffect(() => {
    if (!api) return
    onSelect(api)
    api.on("reInit", onSelect)
    api.on("select", onSelect)
    return () => {
      api.off("reInit", onSelect)
      api.off("select", onSelect)
    }
  }, [api, onSelect])

  // Multi-browse / hero: size the slots, then place the cards on every scroll frame.
  React.useEffect(() => {
    if (!api || !virtual) return
    const root = api.rootNode()
    const container = api.containerNode()
    const vertical = orientation === "vertical"
    let geo: Geometry | null = null

    const paint = () => {
      if (!geo) return
      const slides = api.slideNodes()
      const n = slides.length
      if (!n) return
      const kEnd = Math.max(0, n - 1 - geo.m)
      const raw = -api.internalEngine().location.get() / geo.Q
      const s = Math.min(kEnd, Math.max(0, raw))
      const { widths, xs } = layoutCards(geo, n, s)
      const span = geo.L - geo.S || 1
      for (let i = 0; i < n; i++) {
        const card = slides[i].firstElementChild as HTMLElement | null
        if (!card) continue
        const slotStart = (i - s) * geo.Q
        const d = xs[i] - slotStart + (s - raw) * geo.Q
        card.style.setProperty(vertical ? "height" : "width", `${widths[i]}px`)
        card.style.transform = vertical ? `translate3d(0, ${d}px, 0)` : `translate3d(${d}px, 0, 0)`
        card.style.setProperty("--carousel-p", String(Math.min(1, Math.max(0, (widths[i] - geo.S) / span))))
      }
      if (!slides[0].hasAttribute("data-painted")) slides.forEach((el) => el.setAttribute("data-painted", ""))
    }

    const measure = () => {
      const C = vertical ? root.clientHeight : root.clientWidth
      if (!C) return
      const next = geometry(layout, C)
      const changed = !geo || Math.abs(next.Q - geo.Q) > 0.5 || next.L !== geo.L
      geo = next
      if (changed) {
        container.style.setProperty("--carousel-slide", `${next.Q}px`)
        api.reInit()
      }
      paint()
      setReady(true)
    }

    // Slides label themselves ("3 of 8") unless the author did.
    const label = () => {
      const slides = api.slideNodes()
      slides.forEach((el, i) => {
        if (!el.hasAttribute("aria-label") && !el.hasAttribute("aria-labelledby")) el.setAttribute("aria-label", `${i + 1} of ${slides.length}`)
      })
    }

    measure()
    label()
    api.on("scroll", paint)
    api.on("settle", paint)
    api.on("reInit", paint)
    api.on("slidesChanged", label)
    const ro = new ResizeObserver(measure)
    ro.observe(root)
    return () => {
      api.off("scroll", paint)
      api.off("settle", paint)
      api.off("reInit", paint)
      api.off("slidesChanged", label)
      ro.disconnect()
    }
  }, [api, virtual, layout, orientation])

  return (
    <CarouselContext.Provider value={{ carouselRef, api, opts, orientation, layout, scrollPrev, scrollNext, scrollTo, canScrollPrev, canScrollNext }}>
      <div
        onKeyDownCapture={handleKeyDown}
        className={cn("relative", className)}
        role="region"
        aria-roledescription="carousel"
        data-slot="carousel"
        data-layout={layout}
        data-orientation={orientation}
        data-ready={ready ? "" : undefined}
        {...props}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  )
}

function CarouselContent({ className, ...props }: React.ComponentProps<"div">) {
  const { carouselRef, orientation, layout } = useCarousel()
  const virtual = layout === "multi-browse" || layout === "hero"

  return (
    <div
      ref={carouselRef}
      className="overflow-hidden rounded-[inherit] outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      data-slot="carousel-viewport"
      tabIndex={0}
    >
      <div
        className={cn(
          "flex",
          orientation === "horizontal" ? "-ml-2" : "-mt-2 flex-col",
          virtual && "m-0 h-64",
          className
        )}
        data-slot="carousel-content"
        {...props}
      />
    </div>
  )
}

function CarouselItem({ className, children, ...props }: React.ComponentProps<"div">) {
  const { orientation, layout } = useCarousel()
  const virtual = layout === "multi-browse" || layout === "hero"

  return (
    <div
      role="group"
      aria-roledescription="slide"
      data-slot="carousel-item"
      className={cn(
        "relative min-w-0 shrink-0 grow-0",
        virtual
          ? cn("basis-[var(--carousel-slide,30%)]", orientation === "horizontal" ? "h-full" : "w-full")
          : cn(
              layout === "uncontained" ? "basis-[40%]" : "basis-full",
              orientation === "horizontal" ? "pl-2" : "pt-2"
            ),
        className
      )}
      {...props}
    >
      {virtual ? (
        <div
          data-slot="carousel-card"
          className={cn(
            "absolute top-0 left-0 overflow-hidden rounded-[28px] bg-surface-container-high will-change-transform",
            orientation === "horizontal" ? "h-full" : "w-full",
            "transition-opacity duration-300 ease-(--ease-standard) in-[[data-slot=carousel]:not([data-ready])]:opacity-0"
          )}
        >
          {children}
        </div>
      ) : layout === "uncontained" ? (
        <div data-slot="carousel-card" className="h-full overflow-hidden rounded-[28px]">
          {children}
        </div>
      ) : (
        children
      )}
    </div>
  )
}

type NavButtonProps = Omit<React.ComponentProps<typeof IconButton>, "label" | "icon" | "variant" | "toggle"> & {
  label?: string
  variant?: React.ComponentProps<typeof IconButton>["variant"] | "outline" | "default" | "ghost"
}

const VARIANT_MAP = { outline: "secondary", default: "filled", ghost: "standard" } as const

function CarouselPrevious({ className, variant = "secondary", size, label = "Previous slide", ...props }: NavButtonProps) {
  const { orientation, scrollPrev, canScrollPrev } = useCarousel()
  const mapped = (VARIANT_MAP as Record<string, string>)[variant as string] ?? variant
  return (
    <IconButton
      data-slot="carousel-previous"
      variant={mapped as "secondary"}
      size={(size as string) === "icon" ? "default" : size}
      icon={orientation === "horizontal" ? "arrow_back" : "arrow_upward"}
      label={label}
      className={cn(
        "absolute z-10 shadow-e2 disabled:opacity-0",
        orientation === "horizontal" ? "top-1/2 left-3 -translate-y-1/2" : "top-3 left-1/2 -translate-x-1/2",
        className
      )}
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      {...(props as object)}
    />
  )
}

function CarouselNext({ className, variant = "secondary", size, label = "Next slide", ...props }: NavButtonProps) {
  const { orientation, scrollNext, canScrollNext } = useCarousel()
  const mapped = (VARIANT_MAP as Record<string, string>)[variant as string] ?? variant
  return (
    <IconButton
      data-slot="carousel-next"
      variant={mapped as "secondary"}
      size={(size as string) === "icon" ? "default" : size}
      icon={orientation === "horizontal" ? "arrow_forward" : "arrow_downward"}
      label={label}
      className={cn(
        "absolute z-10 shadow-e2 disabled:opacity-0",
        orientation === "horizontal" ? "top-1/2 right-3 -translate-y-1/2" : "bottom-3 left-1/2 -translate-x-1/2",
        className
      )}
      disabled={!canScrollNext}
      onClick={scrollNext}
      {...(props as object)}
    />
  )
}

/** One dot per scroll position. The active dot stretches into a pill with a spring. */
function CarouselDots({ className, ...props }: React.ComponentProps<"div">) {
  const { api, scrollTo, orientation } = useCarousel()
  const [state, setState] = React.useState({ count: 0, index: 0 })

  React.useEffect(() => {
    if (!api) return
    const update = () => setState({ count: api.scrollSnapList().length, index: api.selectedScrollSnap() })
    update()
    api.on("select", update)
    api.on("reInit", update)
    return () => {
      api.off("select", update)
      api.off("reInit", update)
    }
  }, [api])

  if (state.count < 2) return null

  return (
    <div
      role="group"
      aria-label="Choose slide"
      data-slot="carousel-dots"
      className={cn("flex items-center justify-center", orientation === "vertical" && "flex-col", className)}
      {...props}
    >
      {Array.from({ length: state.count }, (_, i) => {
        const active = i === state.index
        return (
          <button
            key={i}
            type="button"
            data-slot="carousel-dot"
            data-active={active ? "" : undefined}
            aria-label={`Go to slide ${i + 1}`}
            aria-current={active ? "true" : undefined}
            onClick={() => scrollTo(i)}
            className={cn(
              "group/dot grid cursor-pointer place-items-center rounded-full outline-none",
              "focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-ring",
              orientation === "horizontal" ? "h-6 min-w-6" : "min-h-6 w-6"
            )}
          >
            <span
              aria-hidden
              className={cn(
                "rounded-full bg-outline transition-[width,height,background-color,scale] duration-500 ease-(--ease-spring-bouncy) motion-reduce:transition-none",
                "group-hover/dot:bg-foreground group-active/dot:scale-90",
                active && "bg-inverse-surface group-hover/dot:bg-inverse-surface",
                orientation === "horizontal" ? "h-2" : "w-2",
                orientation === "horizontal" ? (active ? "w-6" : "w-2") : active ? "h-6" : "h-2"
              )}
            />
          </button>
        )
      })}
    </div>
  )
}

export { type CarouselApi, type CarouselLayout, Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext, CarouselDots }
