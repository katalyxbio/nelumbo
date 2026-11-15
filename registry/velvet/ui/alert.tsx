"use client"

import * as React from "react"
import { cva } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Icon, type IconName } from "@/registry/velvet/ui/icon"
import { IconButton } from "@/registry/velvet/ui/icon-button"

/**
 * Velvet Alert: an inline message that stays in the page.
 *
 * shadcn's API, so shadcn code works unchanged:
 *
 *   <Alert variant="destructive">
 *     <AlertTitle>Payment failed</AlertTitle>
 *     <AlertDescription>Your card was declined. Try another card.</AlertDescription>
 *   </Alert>
 *
 * Velvet additions:
 *
 *   <Alert variant="success" icon="cloud_done" onDismiss={() => setShown(false)}>
 *     <AlertTitle>Backup finished</AlertTitle>
 *     <AlertAction>
 *       <Button size="sm" variant="ghost">View log</Button>
 *     </AlertAction>
 *   </Alert>
 *
 *   <Alert layout="banner" variant="info" action={<Button size="sm">Update</Button>}>...</Alert>
 *
 * - `variant`: "default" (neutral, no icon unless you pass one), "info",
 *   "success", "warning", "destructive" or "brand". The tonal ones tint the
 *   whole alert with that palette color's container.
 * - `icon`: set per variant (info, check_circle, warning, error, campaign).
 *   Pass a Material Symbol name or any node to replace it, or `false` for none.
 * - Actions: an `action` prop, or an <AlertAction> child, for one or two
 *   buttons. Below the text in the inline layout; on the right from the
 *   `sm` breakpoint up in the banner layout.
 * - `onDismiss`: adds a close button. The alert collapses and fades out
 *   (just a fade with reduced motion), then onDismiss runs. The alert hides
 *   itself, so you only need the callback to remember it was dismissed.
 * - `layout="banner"`: full width and square-cornered, for the top of a page
 *   or a card.
 * - Announcing: destructive uses role="alert" (read out at once); the rest
 *   use role="status" (read out politely). Override with the `role` prop.
 *   Alerts that exist at page load are not announced by most screen
 *   readers: render them after an event for the announcement to happen.
 */

type AlertVariant = "default" | "info" | "success" | "warning" | "destructive" | "brand"

const alertVariants = cva("", {
  variants: {
    variant: {
      default: "bg-surface-container text-foreground [--alert-fg:var(--foreground)] [--alert-accent:var(--foreground)] dark:bg-surface-container-high",
      info: "bg-blue-container text-blue-container-foreground [--alert-fg:var(--blue-container-foreground)] [--alert-accent:var(--blue-container-foreground)] dark:[--alert-accent:var(--blue)]",
      success:
        "bg-success-container text-success-container-foreground [--alert-fg:var(--success-container-foreground)] [--alert-accent:var(--success-container-foreground)] dark:[--alert-accent:var(--success)]",
      warning:
        "bg-warning-container text-warning-container-foreground [--alert-fg:var(--warning-container-foreground)] [--alert-accent:var(--warning-container-foreground)] dark:[--alert-accent:var(--warning)]",
      destructive:
        "bg-destructive-container text-destructive-container-foreground [--alert-fg:var(--destructive-container-foreground)] [--alert-accent:var(--destructive-container-foreground)] dark:[--alert-accent:var(--destructive)]",
      brand:
        "bg-brand-container text-brand-container-foreground [--alert-fg:var(--brand-container-foreground)] [--alert-accent:var(--brand-container-foreground)] dark:[--alert-accent:var(--brand)]",
    },
  },
  defaultVariants: { variant: "default" },
})

const VARIANT_ICONS: Partial<Record<AlertVariant, IconName>> = {
  info: "info",
  success: "check_circle",
  warning: "warning",
  destructive: "error",
  brand: "campaign",
}

type AlertProps = Omit<React.ComponentProps<"div">, "title"> & {
  variant?: AlertVariant
  /** "inline" sits in the page; "banner" is full width and square, for the top of a page or card. */
  layout?: "inline" | "banner"
  /** A Material Symbol name or any node; `false` for none. Variants pick one for you. */
  icon?: IconName | React.ReactNode | false
  /** One or two buttons. You can also use <AlertAction> as a child. */
  action?: React.ReactNode
  /** Adds a close button; runs after the alert has animated out. */
  onDismiss?: () => void
  /** Accessible name of the close button. */
  dismissLabel?: string
}

function Alert({
  className,
  variant = "default",
  layout = "inline",
  icon,
  action,
  onDismiss,
  dismissLabel = "Dismiss",
  role,
  children,
  ...props
}: AlertProps) {
  const [phase, setPhase] = React.useState<"shown" | "leaving" | "gone">("shown")
  const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  React.useEffect(() => () => clearTimeout(timer.current), [])

  const dismiss = () => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    setPhase("leaving")
    timer.current = setTimeout(
      () => {
        setPhase("gone")
        onDismiss?.()
      },
      reduced ? 120 : 320
    )
  }

  if (phase === "gone") return null

  // <AlertAction> children move to the action area, next to the `action` prop
  const body: React.ReactNode[] = []
  const actions: React.ReactNode[] = []
  React.Children.forEach(children, (child) => {
    if (React.isValidElement(child) && child.type === AlertAction) actions.push(child)
    else body.push(child)
  })
  if (action) actions.unshift(<AlertAction key="action">{action}</AlertAction>)

  const glyph = icon === undefined ? VARIANT_ICONS[variant] : icon
  const iconNode = glyph === false || glyph == null ? null : typeof glyph === "string" ? <Icon name={glyph as IconName} /> : glyph
  const banner = layout === "banner"

  return (
    <div
      data-slot="alert"
      data-variant={variant}
      data-layout={layout}
      data-leaving={phase === "leaving" || undefined}
      role={role ?? (variant === "destructive" ? "alert" : "status")}
      className={cn(
        alertVariants({ variant }),
        // the root collapses (grid rows 1fr to 0fr) while it fades; the padding lives inside
        "grid grid-rows-[1fr] overflow-hidden transition-[grid-template-rows,opacity] duration-300 ease-emphasized motion-reduce:transition-[opacity] motion-reduce:duration-100",
        "data-leaving:grid-rows-[0fr] data-leaving:opacity-0",
        banner ? "w-full rounded-none" : "rounded-2xl",
        className
      )}
      {...props}
    >
      <div className={cn("flex min-h-0 items-start gap-3 py-3.5", banner ? "px-4 sm:px-6" : "px-4")}>
        {iconNode && (
          <span data-slot="alert-icon" className="grid h-[1.3125rem] shrink-0 place-items-center text-(--alert-accent)">
            {iconNode}
          </span>
        )}
        <div className={cn("flex min-w-0 flex-1 flex-col gap-3", banner && "sm:flex-row sm:items-center sm:gap-6")}>
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">{body}</div>
          {actions.length > 0 && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
        </div>
        {onDismiss && (
          <IconButton
            icon="close"
            label={dismissLabel}
            size="sm"
            onClick={dismiss}
            className="-mt-[0.4375rem] -mr-2 shrink-0 text-inherit"
          />
        )}
      </div>
    </div>
  )
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="alert-title" className={cn("type-title-sm", className)} {...props} />
}

function AlertDescription({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="alert-description" className={cn("type-body-md text-current/85 [&_p]:leading-relaxed", className)} {...props} />
}

/** One or two buttons. Ghost and outline buttons take the alert's text color. */
function AlertAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-action"
      className={cn(
        "flex flex-wrap items-center gap-2",
        "[&_[data-variant=ghost]]:text-(--alert-fg) [&_[data-variant=outline]]:border-current/30 [&_[data-variant=outline]]:text-(--alert-fg)",
        className
      )}
      {...props}
    />
  )
}

export { Alert, AlertTitle, AlertDescription, AlertAction, alertVariants, type AlertProps, type AlertVariant }
