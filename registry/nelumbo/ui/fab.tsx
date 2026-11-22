import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Icon, type IconName } from "@/registry/nelumbo/ui/icon"

/**
 * Nelumbo FAB (floating action button)
 *
 * The screen's primary action, floating above content.
 *  - `color`: primary | secondary | brand | surface (container tones,
 *    Material 3 style) and `solid` (the filled primary, for maximum emphasis)
 *  - `size`: sm 40 / default 56 / lg 96, rounded-square shape that tightens on press
 *  - `extended`: shows the label next to the icon. Toggle it (for example
 *    collapse while the page scrolls) and the label animates in and out.
 *
 * `label` is always required: it's the accessible name when collapsed.
 */
const fabVariants = cva(
  [
    "tactile state-layer group/fab inline-flex shrink-0 cursor-pointer items-center justify-center select-none",
    "h-[var(--fab-h)] min-w-[var(--fab-h)] px-[var(--fab-pad)]",
    "rounded-[var(--fab-radius)] active:rounded-[calc(var(--fab-radius)*0.7)]",
    "shadow-e3 hover:shadow-e4 active:shadow-e3 [--press-scale:0.95]",
    "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
    "disabled:pointer-events-none disabled:opacity-40 disabled:shadow-none",
  ],
  {
    variants: {
      color: {
        primary: "bg-primary-container text-primary-container-foreground",
        secondary: "bg-secondary text-secondary-foreground",
        brand: "bg-brand-container text-brand-container-foreground",
        surface: "bg-surface-container-high text-primary dark:bg-surface-container-highest",
        solid: "bg-primary text-primary-foreground",
      },
      size: {
        sm: "[--fab-h:2.5rem] [--fab-radius:0.75rem] [--fab-pad:0.5rem] [--icon-size:20px] [--icon-opsz:20] type-label-lg",
        default: "[--fab-h:3.5rem] [--fab-radius:1rem] [--fab-pad:1rem] [--icon-size:24px] [--icon-opsz:24] type-label-lg",
        lg: "[--fab-h:6rem] [--fab-radius:1.75rem] [--fab-pad:1.875rem] [--icon-size:36px] [--icon-opsz:40] type-title-md",
      },
    },
    defaultVariants: { color: "brand", size: "default" },
  }
)

type FabProps = Omit<React.ComponentProps<"button">, "color"> &
  VariantProps<typeof fabVariants> & {
    icon: IconName
    /** Accessible name; also the visible text when extended. */
    label: string
    extended?: boolean
  }

function Fab({ className, color, size, icon, label, extended = false, type = "button", ...props }: FabProps) {
  return (
    <button
      type={type}
      data-slot="fab"
      data-extended={extended || undefined}
      aria-label={extended ? undefined : label}
      className={cn(fabVariants({ color, size }), extended && "pe-[calc(var(--fab-pad)*1.25)]", className)}
      {...props}
    >
      <Icon name={icon} />
      {/* label width animates between 0 and its natural size */}
      <span
        aria-hidden={!extended}
        className={cn(
          "inline-grid grid-cols-[0fr] opacity-0 transition-[grid-template-columns,opacity,margin] duration-400 ease-[var(--ease-spring)] motion-reduce:transition-none",
          extended && "ms-3 grid-cols-[1fr] opacity-100"
        )}
      >
        <span className="overflow-hidden whitespace-nowrap">{label}</span>
      </span>
    </button>
  )
}

export { Fab, fabVariants, type FabProps }
