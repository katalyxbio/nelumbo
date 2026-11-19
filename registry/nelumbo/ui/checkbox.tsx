"use client"

import * as React from "react"
import { Checkbox as CheckboxPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { Icon } from "@/registry/nelumbo/ui/icon"

/**
 * Nelumbo Checkbox (built on Radix Checkbox)
 *
 *   <Checkbox aria-label="Accept" />
 *   <Checkbox checked="indeterminate" />
 *   <Checkbox color="brand" defaultChecked />
 *
 * An 18px box whose corners follow the text field radius (--radius-control). The check is a Material Symbols glyph that wipes in, the box gives a
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
      <CheckboxPrimitive.Indicator forceMount data-slot="checkbox-indicator" className="pointer-events-none grid size-3.5 -translate-x-[0.3px] -translate-y-[1.5px] place-items-center">
        {/* Material Symbols glyphs; the check wipes in from the left, the dash from the center */}
        <Icon
          name="check"
          size={16}
          weight={700}
          className={cn(
            "col-start-1 row-start-1 [clip-path:inset(0_100%_0_0)] group-data-[state=checked]/checkbox:[clip-path:inset(0_0_0_0)]",
            "transition-[clip-path] duration-200 ease-(--ease-emphasized) motion-reduce:transition-none"
          )}
        />
        <Icon
          name="remove"
          size={16}
          weight={700}
          className={cn(
            "col-start-1 row-start-1 [clip-path:inset(0_50%_0_50%)] group-data-[state=indeterminate]/checkbox:[clip-path:inset(0_0_0_0)]",
            "transition-[clip-path] duration-200 ease-(--ease-emphasized) motion-reduce:transition-none"
          )}
        />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox, type CheckboxProps }
