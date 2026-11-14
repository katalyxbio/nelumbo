import * as React from "react"
import { Slot } from "radix-ui"
import { cva, type VariantProps } from "class-variance-authority"
import { LoaderCircle } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * Velvet Button
 *
 * API-compatible with shadcn's Button (variant, size, asChild), plus:
 *  - variants: `tonal`, `elevated`
 *  - `shape`: "pill" (default) | "square". Both morph toward a tighter
 *    radius while pressed, then spring back.
 *  - `loading`: swaps the leading icon for a spinner and blocks interaction.
 *
 * Interaction is handled by two theme utilities:
 *  - `state-layer`: hover / focus / press overlay in the content color
 *  - `tactile`: press compression with a spring release
 */
const buttonVariants = cva(
  [
    "tactile state-layer inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap select-none",
    "rounded-[var(--btn-radius)] active:rounded-[var(--btn-radius-pressed)]",
    "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
    "disabled:pointer-events-none disabled:opacity-40 disabled:shadow-none aria-disabled:pointer-events-none aria-disabled:opacity-40",
    "aria-invalid:outline-2 aria-invalid:outline-offset-2 aria-invalid:outline-destructive",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-[1.15em]",
  ],
  {
    variants: {
      variant: {
        default:
          "bg-primary bg-linear-to-b from-white/10 to-transparent text-primary-foreground shadow-e1 inset-shadow-highlight hover:shadow-e2",
        tonal: "bg-primary-container text-primary-container-foreground hover:shadow-e1",
        secondary: "bg-secondary text-secondary-foreground hover:shadow-e1",
        elevated:
          "bg-surface-container-low text-primary shadow-e2 hover:shadow-e3 dark:bg-surface-container-high",
        outline:
          "border border-outline-variant bg-transparent text-foreground hover:border-outline",
        ghost: "bg-transparent text-foreground",
        destructive:
          "bg-destructive bg-linear-to-b from-white/10 to-transparent text-destructive-foreground shadow-e1 inset-shadow-highlight hover:shadow-e2 focus-visible:outline-destructive",
        link: "h-auto! px-0! text-primary underline-offset-4 after:hidden hover:underline active:scale-100",
      },
      size: {
        xs: "h-7 px-3 type-label-md [--btn-h:1.75rem] has-[>svg]:px-2.5",
        sm: "h-8 px-3.5 type-label-md [--btn-h:2rem] has-[>svg]:px-3",
        default: "h-10 px-5 type-label-lg [--btn-h:2.5rem] has-[>svg]:px-4",
        lg: "h-12 px-6 text-[0.9375rem] font-[520] tracking-[-0.006em] [--btn-h:3rem] has-[>svg]:px-5",
        xl: "h-14 gap-2.5 px-8 type-title-sm [--btn-h:3.5rem] has-[>svg]:px-7",
        "icon-xs": "size-7 [--btn-h:1.75rem]",
        "icon-sm": "size-8 [--btn-h:2rem]",
        icon: "size-10 [--btn-h:2.5rem]",
        "icon-lg": "size-12 [--btn-h:3rem]",
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
          {loading && <LoaderCircle aria-hidden className="animate-spin" />}
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

export { Button, buttonVariants, type ButtonProps }
