"use client"

import * as React from "react"
import { RadioGroup as RadioGroupPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { selectionHalo } from "@/registry/nelumbo/ui/checkbox"

/**
 * Nelumbo Radio Group (built on Radix Radio Group)
 *
 *   <RadioGroup defaultValue="standard" aria-label="Shipping">
 *     <label><RadioGroupItem value="standard" /> Standard</label>
 *     <label><RadioGroupItem value="express" /> Express</label>
 *   </RadioGroup>
 *
 * A 20px ring; the selected dot grows in from the exact center. Arrow keys move
 * the selection, like native radios. The ring is the accent; `color="neutral"` on an item
 * makes it black, and `aria-invalid` gives the error color.
 */
function RadioGroup({ className, ...props }: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return <RadioGroupPrimitive.Root data-slot="radio-group" className={cn("grid gap-3", className)} {...props} />
}

type RadioGroupItemProps = Omit<React.ComponentProps<typeof RadioGroupPrimitive.Item>, "color"> & {
  color?: "auto" | "neutral" | "brand"
}

const COLORS = {
  neutral: "data-[state=checked]:border-primary [--radio-dot:var(--primary)]",
  auto: "data-[state=checked]:border-tone [--radio-dot:var(--tone)]",
  brand: "data-[state=checked]:border-brand [--radio-dot:var(--brand)]",
}

function RadioGroupItem({ className, color = "auto", ...props }: RadioGroupItemProps) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        "group/radio peer relative inline-grid aspect-square size-5 shrink-0 cursor-pointer place-items-center rounded-full border-2 border-muted-foreground",
        "transition-[border-color,scale] duration-200 ease-(--ease-standard) hover:border-foreground",
        "active:scale-90 active:duration-100",
        COLORS[color],
        "aria-invalid:border-destructive aria-invalid:[--radio-dot:var(--destructive)]",
        "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        "disabled:cursor-not-allowed disabled:opacity-40",
        selectionHalo,
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        forceMount
        data-slot="radio-group-indicator"
        className={cn(
          "pointer-events-none absolute inset-[3px] rounded-full bg-(--radio-dot) scale-0 data-[state=checked]:scale-100",
          "transition-[scale] duration-300 ease-(--ease-spring) data-[state=unchecked]:duration-150 data-[state=unchecked]:ease-(--ease-standard)",
          "motion-reduce:transition-none"
        )}
      />
    </RadioGroupPrimitive.Item>
  )
}


// lets FormItem recognise this control without importing it
RadioGroup.formControl = "radio" as const

export { RadioGroup, RadioGroupItem, type RadioGroupItemProps }
