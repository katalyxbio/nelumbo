"use client"

import * as React from "react"
import { Checkbox as CheckboxPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

/**
 * Velvet Checkbox (built on Radix Checkbox)
 *
 *   <Checkbox aria-label="Accept" />
 *   <Checkbox checked="indeterminate" />
 *   <Checkbox color="brand" defaultChecked />
 *
 * An 18px box whose corners follow the text field radius (--radius-control). The check draws itself in, the box gives a
 * small springy press, and a 40px halo shows hover and press (the halo is
 * also the click target, so the small box is easy to hit).
 *
 * Set `aria-invalid` to show the error color.
 */
type CheckboxProps = Omit<React.ComponentProps<typeof CheckboxPrimitive.Root>, "color"> & {
  color?: "default" | "brand"
}

const COLORS = {
  default: "data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground",
  brand: "data-[state=checked]:border-brand data-[state=checked]:bg-brand data-[state=checked]:text-brand-foreground data-[state=indeterminate]:border-brand data-[state=indeterminate]:bg-brand data-[state=indeterminate]:text-brand-foreground",
}

/** Hover and press halo; also enlarges the hit area to 40px. Shared with Radio. */
export const selectionHalo = cn(
  "after:absolute after:top-1/2 after:left-1/2 after:size-10 after:-translate-1/2 after:rounded-full",
  "after:bg-foreground after:opacity-0 after:transition-opacity after:duration-150",
  "hover:after:opacity-[0.08] active:after:opacity-[0.12] disabled:after:opacity-0"
)

function Checkbox({ className, color = "default", ...props }: CheckboxProps) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "group/checkbox peer relative inline-grid size-[18px] shrink-0 cursor-pointer place-items-center rounded-control border-2 border-muted-foreground",
        "transition-[background-color,border-color,scale] duration-200 ease-(--ease-standard) hover:border-foreground",
        "active:scale-90 active:duration-100",
        COLORS[color],
        "aria-invalid:border-destructive aria-invalid:data-[state=checked]:border-destructive aria-invalid:data-[state=checked]:bg-destructive aria-invalid:data-[state=checked]:text-destructive-foreground",
        "aria-invalid:data-[state=indeterminate]:border-destructive aria-invalid:data-[state=indeterminate]:bg-destructive aria-invalid:data-[state=indeterminate]:text-destructive-foreground",
        "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        "disabled:cursor-not-allowed disabled:opacity-40",
        selectionHalo,
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator forceMount data-slot="checkbox-indicator" className="pointer-events-none size-3.5">
        <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="size-full">
          {/* the check draws itself in */}
          <path
            d="M3 7.2 5.8 10 11 4.2"
            pathLength={1}
            className={cn(
              "[stroke-dasharray:1] [stroke-dashoffset:1] group-data-[state=checked]/checkbox:[stroke-dashoffset:0]",
              "transition-[stroke-dashoffset] duration-200 ease-(--ease-emphasized) motion-reduce:transition-none"
            )}
          />
          {/* indeterminate: a dash that grows from the center */}
          <path
            d="M3.5 7h7"
            className={cn(
              "origin-center scale-x-0 group-data-[state=indeterminate]/checkbox:scale-x-100",
              "transition-[scale] duration-200 ease-(--ease-emphasized) motion-reduce:transition-none [transform-box:fill-box]"
            )}
          />
        </svg>
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox, type CheckboxProps }
