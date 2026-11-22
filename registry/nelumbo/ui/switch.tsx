"use client"

import * as React from "react"
import { Switch as SwitchPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { Icon } from "@/registry/nelumbo/ui/icon"

/**
 * Nelumbo Switch (Material 3 style, built on Radix Switch)
 *
 *   <Switch aria-label="Wi-Fi" />
 *   <Switch icons defaultChecked />
 *
 * Off, the thumb is small and quiet on an outlined track; on, it grows and
 * slides across a filled track; while pressed it swells a little more. The
 * slide uses the bouncy spring, the size change the snappy one.
 *
 * - `icons`: a check (on) and a cross (off) inside the thumb. The thumb is
 *   full size in both states so the icon fits.
 * - `color`: "brand" (the accent, default) or "neutral" (black, white in dark mode).
 * - `size`: default 52 x 32, sm 40 x 24.
 *
 * Positions and sizes are CSS variables, so the states are one formula:
 * --x is the thumb's center, --d its diameter.
 */
type SwitchProps = Omit<React.ComponentProps<typeof SwitchPrimitive.Root>, "color"> & {
  icons?: boolean
  color?: "neutral" | "brand"
  size?: "default" | "sm"
}

const SIZES = {
  // track (outer), thumb center off/on, thumb diameter off/on/pressed, icon
  default:
    "h-8 w-[3.25rem] [--x-off:14px] [--x-on:34px] [--d-off:16px] [--d-on:24px] [--d-press:28px] [--icon-size:16px] [--icon-opsz:20]",
  sm: "h-6 w-10 [--x-off:10px] [--x-on:26px] [--d-off:12px] [--d-on:18px] [--d-press:22px] [--icon-size:12px] [--icon-opsz:20]",
}

const COLORS = {
  neutral: "data-[state=checked]:border-primary data-[state=checked]:bg-primary [--on-thumb:var(--primary-foreground)] [--on-icon:var(--primary)]",
  brand: "data-[state=checked]:border-brand data-[state=checked]:bg-brand [--on-thumb:var(--brand-foreground)] [--on-icon:var(--brand)]",
}

function Switch({ className, icons = false, color = "brand", size = "default", ...props }: SwitchProps) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-icons={icons || undefined}
      className={cn(
        "group/switch peer relative inline-flex shrink-0 cursor-pointer items-center rounded-full border-2",
        SIZES[size],
        // unselected: outlined track
        "border-input bg-surface-container-highest",
        COLORS[color],
        "transition-[background-color,border-color] duration-200 ease-(--ease-standard)",
        // thumb geometry
        "[--x:var(--x-off)] [--d:var(--d-off)] data-icons:[--d-off:var(--d-on)]",
        "data-[state=checked]:[--x:var(--x-on)] data-[state=checked]:[--d:var(--d-on)] active:[--d:var(--d-press)]!",
        "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        "disabled:cursor-not-allowed disabled:opacity-40",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none absolute top-1/2 left-0 grid size-(--d) place-items-center rounded-full",
          "translate-x-[calc(var(--x)-50%)] -translate-y-1/2",
          // unselected thumb: the outline color, darker on hover
          "bg-input text-surface-container-highest group-hover/switch:bg-muted-foreground",
          "data-[state=checked]:bg-(--on-thumb) data-[state=checked]:text-(--on-icon) group-hover/switch:data-[state=checked]:bg-(--on-thumb)",
          "shadow-e1 data-[state=unchecked]:shadow-none",
          "transition-[translate,width,height,background-color]",
          "[transition-duration:727ms,396ms,396ms,200ms]",
          "[transition-timing-function:var(--ease-spring-bouncy),var(--ease-spring-snappy),var(--ease-spring-snappy),var(--ease-standard)]",
          "motion-reduce:transition-none",
          // hover / press halo around the thumb
          "after:absolute after:top-1/2 after:left-1/2 after:size-[calc(var(--d-press)+12px)] after:-translate-1/2 after:rounded-full",
          "after:bg-foreground after:opacity-0 after:transition-opacity after:duration-150",
          "group-hover/switch:after:opacity-[0.08] group-active/switch:after:opacity-[0.12] group-disabled/switch:after:opacity-0"
        )}
      >
        {icons && (
          <>
            <Icon name="check" weight={600} className="col-start-1 row-start-1 transition-[opacity,scale] duration-200 [[data-state=unchecked]>&]:scale-50 [[data-state=unchecked]>&]:opacity-0" />
            <Icon name="close" weight={600} className="col-start-1 row-start-1 transition-[opacity,scale] duration-200 [[data-state=checked]>&]:scale-50 [[data-state=checked]>&]:opacity-0" />
          </>
        )}
      </SwitchPrimitive.Thumb>
    </SwitchPrimitive.Root>
  )
}

export { Switch, type SwitchProps }
