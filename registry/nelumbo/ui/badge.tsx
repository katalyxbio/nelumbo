import * as React from "react"
import { Slot } from "radix-ui"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Icon, type IconName } from "@/registry/nelumbo/ui/icon"

/**
 * Nelumbo Badge and NotificationBadge
 *
 *   <Badge>New</Badge>                                   // shadcn's variants work as is
 *   <Badge variant="success" dot>Live</Badge>
 *   <Badge variant="warning" icon="schedule">Due soon</Badge>
 *
 *   <NotificationBadge count={3}>
 *     <IconButton icon="notifications" label="Notifications, 3 new" />
 *   </NotificationBadge>
 *   <NotificationBadge dot><Avatar ... /></NotificationBadge>
 *
 * Badge is a small label for status, category or count, set next to
 * content. Black and white by default, tonal palette colors for meaning.
 * - `dot`: a leading dot in the badge's accent, for live status.
 * - `icon`: a leading Material Symbol.
 * - `size`: default (24px) or sm (20px).
 *
 * NotificationBadge sits on the corner of what it wraps (an icon, an icon
 * button, an avatar): a dot, or a count that caps at `max` ("999+"). It
 * springs in and out. It's hidden from screen readers, so put the count in
 * the wrapped control's name ("Notifications, 3 new").
 */

const badgeVariants = cva(
  [
    "inline-flex w-fit shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-full border border-transparent whitespace-nowrap",
    "type-label-md [&_[data-slot=icon]]:[--icon-size:14px] [&_[data-slot=icon]]:-mx-0.5",
    "transition-[color,background-color,border-color,box-shadow] duration-150",
    "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
  ],
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [--dot:var(--primary-foreground)] [a&]:hover:bg-primary/88",
        secondary: "bg-secondary text-secondary-foreground [--dot:var(--secondary-foreground)] [a&]:hover:bg-secondary/80",
        outline: "border-outline-variant text-foreground [--dot:var(--foreground)] [a&]:hover:bg-accent",
        destructive: "bg-destructive-container text-destructive-container-foreground [--dot:var(--destructive)] [a&]:hover:bg-destructive-container/80",
        brand: "bg-brand-container text-brand-container-foreground [--dot:var(--brand)] [a&]:hover:bg-brand-container/80",
        success: "bg-success-container text-success-container-foreground [--dot:var(--success)] [a&]:hover:bg-success-container/80",
        warning: "bg-warning-container text-warning-container-foreground [--dot:var(--warning)] [a&]:hover:bg-warning-container/80",
        info: "bg-blue-container text-blue-container-foreground [--dot:var(--blue)] [a&]:hover:bg-blue-container/80",
      },
      size: {
        default: "h-6 px-2.5",
        sm: "h-5 px-2 text-[0.6875rem]",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
)

type BadgeProps = React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & {
    asChild?: boolean
    dot?: boolean
    icon?: IconName
  }

function Badge({ className, variant, size, asChild = false, dot = false, icon, children, ...props }: BadgeProps) {
  const Comp = asChild ? Slot.Root : "span"
  return (
    <Comp data-slot="badge" data-variant={variant ?? "default"} className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {dot && <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-(--dot)" />}
      {icon && <Icon name={icon} />}
      <Slot.Slottable>{children}</Slot.Slottable>
    </Comp>
  )
}

type NotificationBadgeProps = React.ComponentProps<"span"> & {
  /** A number shows a count; leave it out for a dot. 0 hides the badge. */
  count?: number
  /** Counts above this show as "max+". */
  max?: number
  /** Show a dot even with a count. */
  dot?: boolean
  /** Hide the badge (it springs away). */
  invisible?: boolean
  /**
   * What it's wrapping: a bare 24px "icon", an icon "button" (the badge
   * sits on the button's icon, not its outer edge), or an "avatar" (on
   * the circle's edge, with a ring).
   */
  placement?: "icon" | "button" | "avatar"
}

const PLACEMENT = {
  icon: { count: "-top-1.5 left-[calc(100%-12px)] origin-bottom-left", dot: "top-0 right-0" },
  button: { count: "top-[calc(50%-18px)] left-1/2 origin-bottom-left", dot: "top-[calc(50%-12px)] left-[calc(50%+6px)]" },
  avatar: {
    count: "-top-1 left-[calc(100%-14px)] origin-bottom-left shadow-[0_0_0_2px_var(--avatar-ring,var(--background))]",
    dot: "top-[4%] right-[4%] size-2.5 shadow-[0_0_0_2px_var(--avatar-ring,var(--background))]",
  },
}

function NotificationBadge({ className, count, max = 999, dot, invisible, placement = "icon", children, ...props }: NotificationBadgeProps) {
  const showCount = !dot && count !== undefined
  const hidden = invisible || (showCount && count <= 0)
  const text = showCount ? (count > max ? `${max}+` : String(count)) : null

  return (
    <span data-slot="notification-badge" className={cn("relative inline-flex shrink-0", className)} {...props}>
      {children}
      <span
        aria-hidden
        data-slot="notification-badge-indicator"
        data-hidden={hidden || undefined}
        className={cn(
          "pointer-events-none absolute z-[1] rounded-full bg-destructive text-destructive-foreground",
          "transition-[scale,opacity] duration-500 ease-(--ease-spring-bouncy) data-hidden:scale-0 data-hidden:opacity-0 data-hidden:duration-200 data-hidden:ease-(--ease-standard)",
          "motion-reduce:transition-opacity",
          text
            ? "grid h-4 min-w-4 place-items-center px-1 text-[0.6875rem] leading-none font-semibold tabular-nums"
            : "size-1.5",
          PLACEMENT[placement][text ? "count" : "dot"]
        )}
      >
        {text}
      </span>
    </span>
  )
}

export { Badge, badgeVariants, NotificationBadge, type BadgeProps, type NotificationBadgeProps }
