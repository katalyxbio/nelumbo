import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Nelumbo Skeleton
 *
 *   <Skeleton className="h-4 w-40" />
 *   <Skeleton className="size-10 rounded-full" />
 *
 * A placeholder in the shape of content that is on its way. A soft light
 * sweeps across it in a seamless loop; with reduced motion it pulses instead. Same API as
 * shadcn's Skeleton: size and round it with className.
 *
 * Skeletons are hidden from screen readers. Mark the region that is loading
 * with aria-busy, and announce when it's ready if that matters.
 */
const CSS = `
@keyframes vlv-shimmer { to { background-position-x: 200% } }
@keyframes vlv-skeleton-pulse { 50% { opacity: 0.55 } }
.vlv-shimmer::after {
  content: ""; position: absolute; inset: 0;
  background: linear-gradient(90deg, transparent, color-mix(in oklab, var(--surface-bright) 70%, transparent), transparent) 0 0 / 200% 100% repeat-x;
  animation: vlv-shimmer 2s linear infinite;
}
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
        className
      )}
      {...props}
    >
      <style href="nelumbo-skeleton" precedence="default">
        {CSS}
      </style>
    </div>
  )
}

export { Skeleton }
