"use client"

import * as React from "react"
import { ToggleGroup as ToggleGroupPrimitive } from "radix-ui"
import { type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { toggleVariants, withLabels } from "@/registry/nelumbo/ui/toggle"

/**
 * Nelumbo ToggleGroup
 *
 * API-compatible with shadcn's ToggleGroup (type single | multiple, value,
 * defaultValue, onValueChange, variant, size) on Radix ToggleGroup, with
 * arrow-key roving focus. Nelumbo adds the `spacing` prop:
 *  - `spacing={0}` (default): connected, like Nelumbo's connected ButtonGroup.
 *    Outer corners keep the full pill, inner corners are small, and the
 *    selected item rounds out to a pill.
 *  - `spacing={n}`: items separated by n * 4px, each keeping its own pill.
 *
 * Items read `variant` and `size` from the group, so set them once.
 *
 * @example
 * <ToggleGroup type="single" defaultValue="left" aria-label="Alignment">
 *   <ToggleGroupItem value="left" aria-label="Align left"><Icon name="format_align_left" /></ToggleGroupItem>
 *   <ToggleGroupItem value="center" aria-label="Align center"><Icon name="format_align_center" /></ToggleGroupItem>
 * </ToggleGroup>
 */

type ToggleGroupContextValue = VariantProps<typeof toggleVariants> & { spacing: number }

const ToggleGroupContext = React.createContext<ToggleGroupContextValue>({
  size: "default",
  variant: "default",
  spacing: 0,
})

type ToggleGroupProps = React.ComponentProps<typeof ToggleGroupPrimitive.Root> &
  VariantProps<typeof toggleVariants> & {
    /** 0 connects the items; n > 0 separates them by n * 4px. */
    spacing?: number
  }

// Connected: one row of quiet tiles. The selected item turns inverse and
// swells into a full pill while its neighbours give way; pressing an item
// widens it and squeezes the rest, as in ButtonGroup.
const connectedClasses = [
  "gap-0.5",
  "*:[--press-scale:1]",
  "*:[--btn-radius-start:calc(var(--btn-h)/5)] *:[--btn-radius-end:calc(var(--btn-h)/5)]",
  "*:first:[--btn-radius-start:var(--btn-radius)] *:last:[--btn-radius-end:var(--btn-radius)]",
  "[&>[data-state=on][data-state]]:[--btn-radius-start:calc(var(--btn-h)/2)] [&>[data-state=on][data-state]]:[--btn-radius-end:calc(var(--btn-h)/2)]",
  "[&>[data-state=on]]:[--btn-px-delta:0.375rem]",
  "*:active:[--btn-px-delta:0.5rem]",
  "[&:has(>:active)>:not(:active)]:[--btn-px-delta:-0.125rem]",
]

// item colors in a connected group; cn() lets these replace the variant's
const connectedItem = {
  default: [
    "bg-surface-container-high text-muted-foreground dark:data-[state=off]:bg-surface-container-highest",
    "data-[state=on]:bg-inverse-surface data-[state=on]:text-inverse-foreground",
  ],
  outline: [
    "border-outline-variant bg-transparent",
    "data-[state=on]:bg-inverse-surface data-[state=on]:text-inverse-foreground",
  ],
}

function ToggleGroup({ className, variant, size, spacing = 0, style, children, ...props }: ToggleGroupProps) {
  const connected = spacing === 0
  return (
    <ToggleGroupPrimitive.Root
      data-slot="toggle-group"
      data-variant={variant ?? "default"}
      data-size={size ?? "default"}
      data-spacing={spacing}
      style={connected ? style : { gap: `${spacing * 0.25}rem`, ...style }}
      className={cn("inline-flex w-fit items-center rounded-none", connected && connectedClasses, className)}
      {...props}
    >
      <ToggleGroupContext.Provider value={{ variant, size, spacing }}>{children}</ToggleGroupContext.Provider>
    </ToggleGroupPrimitive.Root>
  )
}

function ToggleGroupItem({ className, children, variant, size, ...props }: React.ComponentProps<typeof ToggleGroupPrimitive.Item> & VariantProps<typeof toggleVariants>) {
  const context = React.useContext(ToggleGroupContext)
  const v = context.variant ?? variant
  const s = context.size ?? size
  return (
    <ToggleGroupPrimitive.Item
      data-slot="toggle-group-item"
      data-variant={v ?? "default"}
      data-size={s ?? "default"}
      className={cn(toggleVariants({ variant: v, size: s }), context.spacing === 0 && connectedItem[v ?? "default"], className)}
      {...props}
    >
      {withLabels(children)}
    </ToggleGroupPrimitive.Item>
  )
}

export { ToggleGroup, ToggleGroupItem, type ToggleGroupProps }
