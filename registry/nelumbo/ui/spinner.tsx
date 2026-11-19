import * as React from "react"

import { cn } from "@/lib/utils"
import { LoadingIndicator } from "@/registry/nelumbo/ui/loading-indicator"

/**
 * Nelumbo Spinner
 *
 * Drop-in for shadcn's Spinner: it announces itself (role="status",
 * aria-label "Loading") and takes its size from className, `size-8` and so
 * on. It inherits the text color and, by default, the icon size around it,
 * so it sits in a button, badge or input without any setup.
 *
 *   <Spinner />
 *   <Spinner className="size-8" />
 *   <Spinner variant="shapes" className="size-10" />
 *   <Button disabled><Spinner />Saving</Button>
 *
 * - `variant="ring"` (default): an arc that turns while it grows and
 *   shrinks, like Material's indeterminate circular indicator.
 * - `variant="shapes"`: Nelumbo's LoadingIndicator, a soft shape that morphs
 *   while it turns. Better from about 32px up, for waits that feel long.
 *
 * For progress you can measure, use CircularProgress. With reduced motion
 * both variants slow right down (ring) or only pulse (shapes).
 */

const CSS = `
/* The tail runs at one steady speed and only the arc's length eases, so the head never stalls or jumps.
   The dash pattern is exactly the circle (100), so the last frame equals the first. */
@keyframes vlv-spin-tail { from { stroke-dashoffset: 0 } to { stroke-dashoffset: -100 } }
@keyframes vlv-spin-length {
  0%, 100% { stroke-dasharray: 8 92 }
  50% { stroke-dasharray: 70 30 }
}
@keyframes vlv-spin-turn { to { transform: rotate(360deg) } }
.vlv-spin-turn { animation: vlv-spin-turn 2s linear infinite; transform-origin: 50% 50%; will-change: transform }
.vlv-spin-arc { animation: vlv-spin-tail 1.5s linear infinite, vlv-spin-length 1.5s ease-in-out infinite }
@media (prefers-reduced-motion: reduce) {
  .vlv-spin-turn, .vlv-spin-arc { animation-duration: 4s }
}
`

type SpinnerProps = Omit<React.ComponentProps<"svg">, "children"> & {
  variant?: "ring" | "shapes"
}

function Spinner({ className, variant = "ring", ...props }: SpinnerProps) {
  const size = "size-[var(--icon-size,1.25em)] shrink-0"

  if (variant === "shapes") {
    const { "aria-label": label = "Loading", style, ...rest } = props as React.ComponentProps<"span">
    return (
      <span
        data-slot="spinner"
        data-variant="shapes"
        role="status"
        aria-label={label}
        className={cn("inline-grid", size, className)}
        style={style}
        {...rest}
      >
        <LoadingIndicator aria-hidden className="text-inherit" style={{ width: "100%", height: "100%" }} />
      </span>
    )
  }

  return (
    <svg
      data-slot="spinner"
      data-variant="ring"
      role="status"
      aria-label="Loading"
      viewBox="0 0 24 24"
      fill="none"
      className={cn(size, "vlv-spin-turn", className)}
      {...props}
    >
      <style href="nelumbo-spinner" precedence="default">
        {CSS}
      </style>
      <circle
        cx="12"
        cy="12"
        r="9"
        pathLength={100}
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        className="vlv-spin-arc"
      />
    </svg>
  )
}

export { Spinner, type SpinnerProps }
