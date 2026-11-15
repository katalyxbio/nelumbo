"use client"

import * as React from "react"
import { Slot } from "radix-ui"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Icon } from "@/registry/nelumbo/ui/icon"

/**
 * Nelumbo Pagination
 *
 * API-compatible with shadcn's Pagination: Pagination, PaginationContent,
 * PaginationItem, PaginationLink (`isActive`, `size`, `asChild`),
 * PaginationPrevious, PaginationNext, PaginationEllipsis. Nelumbo adds
 * `paginationRange` to compute the numbers and ellipses to render.
 *
 * Page links are round, sized like Nelumbo's IconButton. The current page
 * (`isActive`, aria-current="page") is a tonal secondary fill; the others sit
 * on the state layer only. Previous and Next show a chevron with a label that
 * hides below the sm breakpoint. Set aria-disabled on the first or last page
 * to dim a control.
 *
 *   const range = paginationRange(page, 12)
 *
 *   <Pagination>
 *     <PaginationContent>
 *       <PaginationItem><PaginationPrevious href="#" onClick={prev} /></PaginationItem>
 *       {range.map((p, i) => (
 *         <PaginationItem key={i}>
 *           {p === "ellipsis" ? <PaginationEllipsis /> : (
 *             <PaginationLink href="#" isActive={p === page} onClick={go(p)}>{p}</PaginationLink>
 *           )}
 *         </PaginationItem>
 *       ))}
 *       <PaginationItem><PaginationNext href="#" onClick={next} /></PaginationItem>
 *     </PaginationContent>
 *   </Pagination>
 */

const paginationLinkVariants = cva(
  [
    "tactile state-layer inline-flex shrink-0 cursor-pointer items-center justify-center gap-1 rounded-full no-underline select-none",
    "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
    "[&_[data-slot=icon]]:shrink-0",
    "aria-disabled:pointer-events-none aria-disabled:opacity-40",
  ],
  {
    variants: {
      size: {
        sm: "h-8 min-w-8 px-0 type-label-md [--icon-opsz:20] [--icon-size:18px]",
        default: "h-10 min-w-10 px-0 type-label-lg [--icon-opsz:20] [--icon-size:20px]",
        lg: "h-12 min-w-12 px-0 type-label-lg [--icon-opsz:22] [--icon-size:22px]",
        icon: "size-10 px-0 type-label-lg [--icon-opsz:20] [--icon-size:20px]",
      },
    },
    defaultVariants: { size: "default" },
  }
)

type PaginationLinkSize = NonNullable<VariantProps<typeof paginationLinkVariants>["size"]>

/**
 * The numbers and ellipses for a pager, e.g. paginationRange(5, 12) gives
 * [1, 2, 3, 4, 5, 6, 7, "ellipsis", 12]. The first and last page always show,
 * `siblings` pages either side of the current page, and a gap of one page is
 * shown as that page rather than an ellipsis.
 */
export function paginationRange(page: number, pageCount: number, siblings = 1): (number | "ellipsis")[] {
  const count = Math.max(0, Math.floor(pageCount))
  if (count === 0) return []
  const current = Math.min(Math.max(Math.floor(page), 1), count)
  const s = Math.max(0, Math.floor(siblings))
  const range = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, i) => from + i)

  // Everything fits: no ellipses needed.
  if (count <= s * 2 + 5) return range(1, count)

  const left = Math.max(current - s, 1)
  const right = Math.min(current + s, count)
  const showLeft = left > 3
  const showRight = right < count - 2

  if (!showLeft && showRight) return [...range(1, 3 + s * 2), "ellipsis", count]
  if (showLeft && !showRight) return [1, "ellipsis", ...range(count - (2 + s * 2), count)]
  if (showLeft && showRight) return [1, "ellipsis", ...range(left, right), "ellipsis", count]
  return range(1, count)
}

function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      data-slot="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    />
  )
}

/**
 * The current page sits on an inverse pill that springs from page to page.
 * The pill is measured from whichever link has aria-current="page", so it
 * follows any markup; until it is measured the link draws its own fill.
 */
function PaginationContent({ className, children, ...props }: React.ComponentProps<"ul">) {
  const ref = React.useRef<HTMLUListElement>(null)
  const [pill, setPill] = React.useState<{ x: number; y: number; w: number; h: number; moved: boolean } | null>(null)

  React.useLayoutEffect(() => {
    const ul = ref.current
    if (!ul) return
    const measure = () => {
      const a = ul.querySelector<HTMLElement>('[aria-current="page"]')
      if (!a) return setPill(null)
      const r = a.getBoundingClientRect()
      const o = ul.getBoundingClientRect()
      const next = { x: r.left - o.left, y: r.top - o.top, w: r.width, h: r.height }
      setPill((p) =>
        p && p.x === next.x && p.y === next.y && p.w === next.w && p.h === next.h ? p : { ...next, moved: p !== null }
      )
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(ul)
    const mo = new MutationObserver(measure)
    mo.observe(ul, { subtree: true, childList: true, attributes: true, attributeFilter: ["aria-current"] })
    return () => {
      ro.disconnect()
      mo.disconnect()
    }
  }, [])

  return (
    <ul
      ref={ref}
      data-slot="pagination-content"
      data-pill={pill ? "" : undefined}
      className={cn("group/pagination relative isolate flex flex-row flex-wrap items-center justify-center gap-1", className)}
      {...props}
    >
      <li
        aria-hidden
        role="none"
        data-slot="pagination-indicator"
        className={cn(
          "pointer-events-none absolute top-0 left-0 -z-10 rounded-full bg-inverse-surface",
          pill?.moved &&
            "transition-[translate,width,height] duration-500 ease-(--ease-spring-bouncy) motion-reduce:transition-none",
          !pill && "hidden"
        )}
        style={pill ? { translate: `${pill.x}px ${pill.y}px`, width: pill.w, height: pill.h } : undefined}
      />
      {children}
    </ul>
  )
}

function PaginationItem({ className, ...props }: React.ComponentProps<"li">) {
  return <li data-slot="pagination-item" className={cn("inline-flex", className)} {...props} />
}

type PaginationLinkProps = React.ComponentProps<"a"> & {
  /** The current page: aria-current="page" and the tonal fill. */
  isActive?: boolean
  size?: PaginationLinkSize
  /** Render the link styles on your own element (for example a router Link). */
  asChild?: boolean
}

function PaginationLink({ className, isActive, size = "default", asChild, ...props }: PaginationLinkProps) {
  const Comp = asChild ? Slot.Root : "a"
  return (
    <Comp
      data-slot="pagination-link"
      data-active={isActive || undefined}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        paginationLinkVariants({ size }),
        isActive
          ? // the pill behind the list draws the fill once measured
            "bg-inverse-surface text-inverse-foreground group-data-pill/pagination:bg-transparent [&::after]:hidden"
          : "bg-transparent text-muted-foreground hover:text-foreground",
        className
      )}
      {...props}
    />
  )
}

function PaginationPrevious({ className, ...props }: Omit<PaginationLinkProps, "isActive">) {
  return (
    <PaginationLink
      aria-label="Go to previous page"
      data-slot="pagination-previous"
      className={cn("gap-1 bg-surface-container-high text-foreground hover:text-foreground sm:w-auto sm:pr-4 sm:pl-3 dark:bg-surface-container-highest", className)}
      {...props}
    >
      <Icon name="chevron_left" />
      <span className="hidden sm:inline">Previous</span>
    </PaginationLink>
  )
}

function PaginationNext({ className, ...props }: Omit<PaginationLinkProps, "isActive">) {
  return (
    <PaginationLink
      aria-label="Go to next page"
      data-slot="pagination-next"
      className={cn("gap-1 bg-surface-container-high text-foreground hover:text-foreground sm:w-auto sm:pr-3 sm:pl-4 dark:bg-surface-container-highest", className)}
      {...props}
    >
      <span className="hidden sm:inline">Next</span>
      <Icon name="chevron_right" />
    </PaginationLink>
  )
}

function PaginationEllipsis({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="pagination-ellipsis"
      className={cn("flex size-10 items-center justify-center text-muted-foreground", className)}
      {...props}
    >
      <Icon name="more_horiz" size={20} />
      <span className="sr-only">More pages</span>
    </span>
  )
}

export {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
  type PaginationLinkProps,
}
