"use client"

import * as React from "react"
import { Toggle as TogglePrimitive } from "radix-ui"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Nelumbo Toggle
 *
 * API-compatible with shadcn's Toggle (variant, size, pressed, defaultPressed,
 * onPressedChange), built on Radix Toggle. Nelumbo adds:
 *  - Pill corners and button heights that match Nelumbo's Button.
 *  - Selected (`data-state="on"`): a tonal secondary fill with the matching
 *    foreground. Unselected: transparent, with the state layer on hover.
 *  - `outline` variant: a 1px `outline` border. It stays visible in both
 *    states; the selected state swaps the border for the fill.
 *  - Icons (Nelumbo `<Icon />`) fill in when the toggle is on: the Material
 *    Symbols FILL axis animates to 1 through --icon-fill, like IconButton.
 *  - Icon-only toggles become square automatically. Pass `aria-label`.
 *
 * Use it for a single on/off setting in a toolbar, such as bold or pin. For
 * one-of-many choices, use ToggleGroup. For a bare icon action, use IconButton.
 *
 * @example
 * <Toggle aria-label="Bold"><Icon name="format_bold" /></Toggle>
 * <Toggle variant="outline" size="sm">Live</Toggle>
 */
const toggleVariants = cva(
  [
    "tactile state-layer inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap select-none",
    "h-[var(--btn-h)] px-[calc(var(--btn-px,0px)+var(--btn-px-delta,0px))] [--btn-radius:calc(var(--btn-h)/2)] [--btn-radius-pressed:calc(var(--btn-h)/3.2)]",
    // Per-side radii let ToggleGroup square off inner corners, as in ButtonGroup.
    "rounded-s-[var(--btn-radius-start,var(--btn-radius))] rounded-e-[var(--btn-radius-end,var(--btn-radius))] active:rounded-[var(--btn-radius-pressed)]",
        "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
    "disabled:pointer-events-none disabled:opacity-40",
    "aria-invalid:outline-2 aria-invalid:outline-offset-2 aria-invalid:outline-destructive",
    // icon-only: square, with no side padding
    "has-[>[data-slot=icon]:only-child]:w-[calc(var(--btn-h)+var(--btn-px-delta,0px)*2)] has-[>[data-slot=icon]:only-child]:px-0",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-[var(--icon-size)]",
    // selected: the glyph fills and the pill tightens into a rounded square,
    // so the change reads in shape as well as color
    "data-[state=on]:[--icon-fill:1] data-[state=on]:[--btn-radius:calc(var(--btn-h)/3.2)]",
  ],
  {
    variants: {
      variant: {
        default: [
          "bg-transparent text-muted-foreground hover:text-foreground",
          "data-[state=on]:bg-secondary data-[state=on]:text-secondary-foreground",
        ],
        outline: [
          "border border-outline bg-transparent text-muted-foreground hover:text-foreground",
          "data-[state=on]:border-transparent data-[state=on]:bg-inverse-surface data-[state=on]:text-inverse-foreground",
        ],
      },
      size: {
        sm: "h-8 [--btn-h:2rem] [--btn-px:0.75rem] [--icon-size:18px] [--icon-opsz:20] type-label-md",
        default: "h-10 [--btn-h:2.5rem] [--btn-px:1rem] [--icon-size:20px] [--icon-opsz:20] type-label-lg",
        lg: "h-12 [--btn-h:3rem] [--btn-px:1.25rem] [--icon-size:22px] [--icon-opsz:22] text-[0.9375rem] font-[520] tracking-[-0.006em]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

type ToggleProps = React.ComponentProps<typeof TogglePrimitive.Root> & VariantProps<typeof toggleVariants>

/**
 * Wraps bare text in a span. The icon-only rule in toggleVariants squares the
 * toggle when the icon is its only element child, and a bare text node would
 * not count against that, so labels must be elements.
 */
function withLabels(children: React.ReactNode): React.ReactNode {
  return React.Children.map(children, (child) =>
    typeof child === "string" || typeof child === "number" ? <span data-slot="toggle-label">{child}</span> : child
  )
}

function Toggle({ className, variant, size, children, ...props }: ToggleProps) {
  return (
    <TogglePrimitive.Root
      data-slot="toggle"
      data-variant={variant ?? "default"}
      data-size={size ?? "default"}
      className={cn(toggleVariants({ variant, size }), className)}
      {...props}
    >
      {withLabels(children)}
    </TogglePrimitive.Root>
  )
}

export { Toggle, toggleVariants, withLabels, type ToggleProps }
