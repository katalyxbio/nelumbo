import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Velvet Skeleton
 *
 *   <Skeleton className="h-4 w-40" />
 *   <Skeleton className="size-10 rounded-full" />
 *
 * A placeholder in the shape of content that is on its way. A soft light
 * sweeps across it; with reduced motion it pulses instead. Same API as
 * shadcn's Skeleton: size and round it with className.
 *
 * Skeletons are hidden from screen readers. Mark the region that is loading
 * with aria-busy, and announce when it's ready if that matters.
 */
const CSS = `
@keyframes vlv-shimmer { from { transform: translateX(-100%) } to { transform: translateX(100%) } }
@keyframes vlv-skeleton-pulse { 50% { opacity: 0.55 } }
.vlv-shimmer::after { animation: vlv-shimmer 1.6s var(--ease-standard, ease-in-out) infinite }
@media (prefers-reduced-motion: reduce) {
  .vlv-shimmer { animation: vlv-skeleton-pulse 2s ease-in-out infinite }
  .vlv-shimmer::after { display: none }
}
`

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden
      className={cn(
        "vlv-shimmer relative isolate overflow-hidden rounded-md bg-surface-container-highest",
        "after:absolute after:inset-0 after:-translate-x-full after:bg-linear-to-r after:from-transparent after:via-surface-bright/70 after:to-transparent",
        className
      )}
      {...props}
    >
      <style href="velvet-skeleton" precedence="default">
        {CSS}
      </style>
    </div>
  )
}

export { Skeleton }
