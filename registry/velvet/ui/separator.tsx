"use client"

import * as React from "react"
import { Separator as SeparatorPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

/**
 * Velvet Separator (built on Radix Separator)
 *
 * shadcn's API, so shadcn code works unchanged:
 *
 *   <Separator />
 *   <Separator orientation="vertical" className="h-6" />
 *
 * Velvet additions:
 *
 *   <Separator variant="inset" />          // a line that starts after a list's leading slot
 *   <Separator variant="space" />          // spacing only, no line
 *
 * Velvet prefers spacing to dividers. The default line is 1px and very faint
 * (outline-variant at half strength), so it separates without drawing the
 * eye. Reach for spacing first: a gap between groups usually does the job.
 *
 * - `variant`:
 *   - "line" (default): a faint hairline.
 *   - "inset": the same line, indented to line up with a List item's text
 *     (72px, past the 40px leading slot), for lines inside a list.
 *   - "space": renders only the space (16px across, or along, the axis), with
 *     no line. Use it as a gap between groups.
 * - `decorative` (default true): hidden from assistive tech. Pass false when
 *   the line separates two regions a screen reader user should notice.
 * - `orientation`: "horizontal" (default) or "vertical". A vertical line
 *   stretches to the height of a flex row (`self-stretch`).
 */

type SeparatorVariant = "line" | "inset" | "space"

type SeparatorProps = React.ComponentProps<typeof SeparatorPrimitive.Root> & {
  variant?: SeparatorVariant
}

function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  variant = "line",
  ...props
}: SeparatorProps) {
  const vertical = orientation === "vertical"

  return (
    <SeparatorPrimitive.Root
      data-slot="separator"
      data-variant={variant}
      data-orientation={orientation}
      orientation={orientation}
      decorative={decorative}
      className={cn(
        "shrink-0",
        variant === "space"
          ? vertical
            ? "w-4 self-stretch"
            : "h-4 w-full"
          : [
              "bg-outline-variant/50",
              vertical ? "w-px self-stretch" : variant === "inset" ? "h-px w-auto ms-[4.5rem]" : "h-px w-full",
            ],
        className
      )}
      {...props}
    />
  )
}

export { Separator, type SeparatorProps, type SeparatorVariant }
