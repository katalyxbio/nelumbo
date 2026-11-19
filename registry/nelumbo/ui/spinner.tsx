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
/* Every moving part is a rotation, so the compositor runs it off the main thread and a busy page can't make it stutter.
   Two half-circle arcs swing inside left/right clippers (that is what grows and shrinks the arc), a thin patch
   hides the seam at the top, a layer steps forward 135deg per beat, and the whole thing turns steadily. */
.vlv-spin { position: relative; display: inline-block; vertical-align: middle }
.vlv-spin-c, .vlv-spin-l { position: absolute; inset: 0 }
.vlv-spin-c { animation: vlv-spin-c 1568ms linear infinite }
.vlv-spin-l { display: flex; animation: vlv-spin-l 5332ms cubic-bezier(0.4, 0, 0.2, 1) infinite both }
.vlv-spin-clip { position: relative; width: 50%; height: 100%; overflow: hidden }
.vlv-spin-gap { position: absolute; top: 0; left: 47.5%; width: 5%; height: 100%; overflow: hidden }
.vlv-spin svg { position: absolute; top: 0; display: block; max-width: none; height: 100% !important }
.vlv-spin-clip svg { width: 200% !important; left: 0 }
.vlv-spin-clip + .vlv-spin-gap + .vlv-spin-clip svg { left: -100% }
.vlv-spin-gap svg { width: 2000% !important; left: -950%; transform: rotate(180deg) }
.vlv-spin-a { animation: vlv-spin-a 1333ms cubic-bezier(0.4, 0, 0.2, 1) infinite both }
.vlv-spin-b { animation: vlv-spin-b 1333ms cubic-bezier(0.4, 0, 0.2, 1) infinite both }
@keyframes vlv-spin-c { to { transform: rotate(360deg) } }
@keyframes vlv-spin-l {
  0% { transform: rotate(0deg) } 12.5% { transform: rotate(135deg) } 25% { transform: rotate(270deg) }
  37.5% { transform: rotate(405deg) } 50% { transform: rotate(540deg) } 62.5% { transform: rotate(675deg) }
  75% { transform: rotate(810deg) } 87.5% { transform: rotate(945deg) } 100% { transform: rotate(1080deg) }
}
@keyframes vlv-spin-a { 0%, 100% { transform: rotate(265deg) } 50% { transform: rotate(130deg) } }
@keyframes vlv-spin-b { 0%, 100% { transform: rotate(-265deg) } 50% { transform: rotate(-130deg) } }
@media (prefers-reduced-motion: reduce) {
  .vlv-spin-c { animation-duration: 4704ms }
  .vlv-spin-l { animation-duration: 15996ms }
  .vlv-spin-a, .vlv-spin-b { animation-duration: 3999ms }
}
`

/** Most of the ring's bottom half, before rotation. Each side trims its hidden end (the left one at 9 o'clock, the right
 *  one at 3) so that end's round cap never pokes past the clipper's edge. The patch draws it a little thinner so no edge shows. */
function Arc({ className, thin, late }: { className?: string; thin?: boolean; late?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
      <circle
        cx="12"
        cy="12"
        r="9"
        pathLength={100}
        stroke="currentColor"
        strokeWidth={thin ? 2 : 2.5}
        strokeDasharray="46 154"
        strokeDashoffset={late ? -4 : 0}
        strokeLinecap="round"
      />
    </svg>
  )
}

type SpinnerProps = Omit<React.ComponentProps<"span">, "children"> & {
  variant?: "ring" | "shapes"
}

function Spinner({ className, variant = "ring", "aria-label": label = "Loading", ...props }: SpinnerProps) {
  const size = "size-[var(--icon-size,1.25em)] shrink-0"

  if (variant === "shapes") {
    const { style, ...rest } = props
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
    <span data-slot="spinner" data-variant="ring" role="status" aria-label={label} className={cn("vlv-spin", size, className)} {...props}>
      <style href="nelumbo-spinner" precedence="default">
        {CSS}
      </style>
      <span className="vlv-spin-c">
        <span className="vlv-spin-l">
          <span className="vlv-spin-clip">
            <Arc className="vlv-spin-a" />
          </span>
          <span className="vlv-spin-gap">
            <Arc thin />
          </span>
          <span className="vlv-spin-clip">
            <Arc className="vlv-spin-b" late />
          </span>
        </span>
      </span>
    </span>
  )
}

export { Spinner, type SpinnerProps }
