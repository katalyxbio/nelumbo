import * as React from "react"
import { Slot } from "radix-ui"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Spinner as RingSpinner } from "@/registry/nelumbo/ui/spinner"

/**
 * Nelumbo Button
 *
 * API-compatible with shadcn's Button (variant, size, asChild), plus:
 *  - variant: `elevated` (and `secondary` is Nelumbo's neutral tonal button)
 *  - `shape`: "pill" (default) | "square". Both morph toward a tighter
 *    radius while pressed, then spring back.
 *  - `loading`: swaps the leading icon for a spinner and blocks interaction.
 *  - Material Symbols icons (`<Icon />`) size to the label automatically.
 *
 * Interaction is handled by two theme utilities:
 *  - `state-layer`: hover / focus / press overlay in the content color
 *  - `tactile`: press compression with a spring release
 */
const buttonVariants = cva(
  [
    "tactile state-layer inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap select-none",
    // Per-side radii let groups square off inner corners (connected / split).
    "rounded-s-[var(--btn-radius-start,var(--btn-radius))] rounded-e-[var(--btn-radius-end,var(--btn-radius))] active:rounded-[var(--btn-radius-pressed)]",
    // Padding is a variable so groups can widen the pressed button.
    "px-[calc(var(--btn-px,0px)+var(--btn-px-delta,0px))]",
    "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
    "disabled:pointer-events-none disabled:opacity-40 disabled:shadow-none data-loading:disabled:opacity-100 aria-disabled:pointer-events-none aria-disabled:opacity-40",
    "aria-invalid:outline-2 aria-invalid:outline-offset-2 aria-invalid:outline-destructive",
    "[--icon-size:1.3em] [--icon-opsz:20] [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-[var(--icon-size)]",
  ],
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-e1 hover:shadow-e2",
        secondary: "bg-secondary text-secondary-foreground hover:shadow-e1",
        elevated:
          "bg-surface-container-low text-primary shadow-e2 hover:shadow-e3 dark:bg-surface-container-high",
        outline:
          "border border-outline-variant bg-transparent text-foreground hover:border-outline",
        ghost: "bg-transparent text-foreground",
        destructive:
          "bg-destructive text-destructive-foreground shadow-e1 hover:shadow-e2 focus-visible:outline-destructive",
        link: "h-auto! px-0! text-primary underline-offset-4 [--press-scale:1] after:hidden hover:underline",
      },
      size: {
        xs: "h-7 type-label-md [--btn-h:1.75rem] [--btn-px:0.75rem] has-[>[data-slot=icon]]:[--btn-px:0.625rem] has-[>svg]:[--btn-px:0.625rem]",
        sm: "h-8 type-label-md [--btn-h:2rem] [--btn-px:0.875rem] has-[>[data-slot=icon]]:[--btn-px:0.75rem] has-[>svg]:[--btn-px:0.75rem]",
        default: "h-10 type-label-lg [--btn-h:2.5rem] [--btn-px:1.25rem] has-[>[data-slot=icon]]:[--btn-px:1rem] has-[>svg]:[--btn-px:1rem]",
        lg: "h-12 text-[0.9375rem] font-[520] tracking-[-0.006em] [--btn-h:3rem] [--btn-px:1.5rem] has-[>[data-slot=icon]]:[--btn-px:1.25rem] has-[>svg]:[--btn-px:1.25rem] [--icon-opsz:24]",
        xl: "h-14 gap-2.5 type-title-sm [--btn-h:3.5rem] [--btn-px:2rem] has-[>[data-slot=icon]]:[--btn-px:1.75rem] has-[>svg]:[--btn-px:1.75rem] [--icon-opsz:24]",
        "icon-xs": "size-7 [--btn-h:1.75rem] [--btn-px:0px]",
        "icon-sm": "size-8 [--btn-h:2rem] [--btn-px:0px]",
        icon: "size-10 [--btn-h:2.5rem] [--btn-px:0px]",
        "icon-lg": "size-12 [--btn-h:3rem] [--btn-px:0px]",
      },
      shape: {
        pill: "[--btn-radius:calc(var(--btn-h)/2)] [--btn-radius-pressed:calc(var(--btn-h)/3.2)]",
        square:
          "[--btn-radius:min(var(--radius-lg),calc(var(--btn-h)/3))] [--btn-radius-pressed:calc(var(--btn-h)/5)]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      shape: "pill",
    },
  }
)

type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
    loading?: boolean
  }

function Button({
  className,
  variant,
  size,
  shape,
  asChild = false,
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant ?? "default"}
      data-loading={loading || undefined}
      aria-busy={loading || undefined}
      disabled={asChild ? undefined : disabled || loading}
      className={cn(buttonVariants({ variant, size, shape, className }))}
      {...props}
    >
      {asChild ? (
        children
      ) : (
        <>
          {loading && <Spinner />}
          {loading ? stripLeadingIcon(children) : children}
        </>
      )}
    </Comp>
  )
}

/** While loading, the spinner takes the place of a leading icon. */
function stripLeadingIcon(children: React.ReactNode) {
  const arr = React.Children.toArray(children)
  const first = arr[0]
  if (React.isValidElement(first) && typeof first.type !== "string") return arr.slice(1)
  return children
}

/**
 * The shared Spinner ring, decorative: inside a busy button the button itself
 * carries aria-busy, so the ring is hidden from assistive tech.
 */
function Spinner(props: React.ComponentProps<"svg">) {
  return <RingSpinner aria-hidden role="presentation" aria-label={undefined} {...props} />
}

export { Button, buttonVariants, Spinner, type ButtonProps }
