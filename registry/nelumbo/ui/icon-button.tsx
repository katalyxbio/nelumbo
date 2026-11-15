"use client"

import * as React from "react"
import { Toggle as TogglePrimitive } from "radix-ui"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Spinner } from "@/registry/nelumbo/ui/button"
import { Icon, type IconName } from "@/registry/nelumbo/ui/icon"

/**
 * Nelumbo IconButton
 *
 * Material 3 icon buttons with Nelumbo's tactile feel.
 *  - variants: standard, filled, secondary (Material's "tonal"), outlined
 *  - `toggle`: becomes a Radix Toggle. Selected state fills the icon (the
 *    Material Symbols FILL axis animates) and morphs the shape from pill to
 *    rounded square.
 *  - `width`: narrow | default | wide
 *  - `label` is required: it is the accessible name.
 *
 * Unselected toggles sit on a quiet container so the selected state reads as
 * a clear change in fill, not only in color.
 */
const iconButtonVariants = cva(
  [
    "tactile state-layer inline-flex shrink-0 cursor-pointer items-center justify-center select-none",
    "h-[var(--btn-h)] rounded-s-[var(--btn-radius-start,var(--btn-radius))] rounded-e-[var(--btn-radius-end,var(--btn-radius))] active:rounded-[var(--btn-radius-pressed)]",
    "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
    "disabled:pointer-events-none disabled:opacity-40 disabled:shadow-none data-loading:disabled:opacity-100",
    "aria-invalid:outline-2 aria-invalid:outline-offset-2 aria-invalid:outline-destructive",
    "[&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-[var(--icon-size)]",
    // selected: filled glyph, tighter corners
    "data-[state=on]:[--icon-fill:1] data-[state=on]:[--btn-radius:var(--btn-radius-selected)]",
  ],
  {
    variants: {
      variant: {
        standard: "bg-transparent text-muted-foreground data-[state=on]:text-primary",
        filled: [
          "bg-primary bg-linear-to-b from-white/10 to-transparent text-primary-foreground shadow-e1 inset-shadow-highlight hover:shadow-e2",
          "data-[state=off]:bg-surface-container-highest data-[state=off]:bg-none data-[state=off]:text-primary data-[state=off]:shadow-none data-[state=off]:inset-shadow-none",
        ],
        secondary: [
          "bg-secondary text-secondary-foreground hover:shadow-e1",
          "data-[state=off]:bg-surface-container-high data-[state=off]:text-muted-foreground dark:data-[state=off]:bg-surface-container-highest",
        ],
        outlined: [
          "border border-outline-variant bg-transparent text-muted-foreground hover:border-outline",
          "data-[state=on]:border-transparent data-[state=on]:bg-inverse-surface data-[state=on]:text-inverse-foreground",
        ],
      },
      size: {
        // Icon-to-button ratio shrinks as buttons grow (0.57 -> 0.43), so
        // larger buttons gain air around the glyph instead of a bigger glyph.
        xs: "[--btn-h:1.75rem] [--icon-size:16px] [--icon-opsz:20]",
        sm: "[--btn-h:2rem] [--icon-size:18px] [--icon-opsz:20]",
        default: "[--btn-h:2.5rem] [--icon-size:20px] [--icon-opsz:20]",
        lg: "[--btn-h:3rem] [--icon-size:22px] [--icon-opsz:22]",
        xl: "[--btn-h:3.5rem] [--icon-size:24px] [--icon-opsz:24]",
      },
      width: {
        narrow: "w-[calc(var(--btn-h)*0.8+var(--btn-px-delta,0px)*2)]",
        default: "w-[calc(var(--btn-h)+var(--btn-px-delta,0px)*2)]",
        wide: "w-[calc(var(--btn-h)*1.4+var(--btn-px-delta,0px)*2)]",
      },
      shape: {
        pill: "[--btn-radius:calc(var(--btn-h)/2)] [--btn-radius-pressed:calc(var(--btn-h)/3.2)] [--btn-radius-selected:calc(var(--btn-h)/3.2)]",
        square:
          "[--btn-radius:min(var(--radius-lg),calc(var(--btn-h)/3))] [--btn-radius-pressed:calc(var(--btn-h)/5)] [--btn-radius-selected:calc(var(--btn-h)/2)]",
      },
    },
    defaultVariants: { variant: "standard", size: "default", width: "default", shape: "pill" },
  }
)

type BaseProps = VariantProps<typeof iconButtonVariants> & {
  /** Accessible name. Required: icon-only controls have no visible text. */
  label: string
  /** Material Symbols name. Or pass any icon as children. */
  icon?: IconName
  /** Icon shown while selected (toggle only), e.g. "bookmark" -> "bookmark_added". */
  selectedIcon?: IconName
  loading?: boolean
  children?: React.ReactNode
}

type ActionProps = BaseProps &
  Omit<React.ComponentProps<"button">, "children"> & {
    toggle?: false
  }

type ToggleProps = BaseProps &
  Omit<React.ComponentProps<typeof TogglePrimitive.Root>, "children"> & {
    toggle: true
  }

type IconButtonProps = ActionProps | ToggleProps

function IconButton(props: IconButtonProps) {
  const { label, icon, selectedIcon, loading = false, variant, size, width, shape, className, children, toggle, disabled, ...rest } = props

  // Controlled or uncontrolled pressed state, so the selected icon can swap.
  const t = rest as Partial<React.ComponentProps<typeof TogglePrimitive.Root>>
  const [innerPressed, setInnerPressed] = React.useState(t.defaultPressed ?? false)
  const pressed = t.pressed ?? innerPressed

  const glyph = loading ? (
    <Spinner />
  ) : children ? (
    children
  ) : icon ? (
    <Icon name={toggle && pressed && selectedIcon ? selectedIcon : icon} />
  ) : null

  const shared = {
    "data-slot": "icon-button",
    "aria-label": label,
    "aria-busy": loading || undefined,
    "data-loading": loading || undefined,
    disabled: disabled || loading,
    className: cn(iconButtonVariants({ variant, size, width, shape }), className),
  }

  if (toggle) {
    const { onPressedChange, ...toggleRest } = t
    delete toggleRest.pressed
    delete toggleRest.defaultPressed
    return (
      <TogglePrimitive.Root
        {...(toggleRest as object)}
        {...shared}
        pressed={pressed}
        onPressedChange={(v) => {
          setInnerPressed(v)
          onPressedChange?.(v)
        }}
      >
        {glyph}
      </TogglePrimitive.Root>
    )
  }

  return (
    <button type="button" {...(rest as React.ComponentProps<"button">)} {...shared}>
      {glyph}
    </button>
  )
}

export { IconButton, iconButtonVariants, type IconButtonProps }
