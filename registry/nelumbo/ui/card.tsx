import * as React from "react"
import { Slot } from "radix-ui"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Nelumbo Card
 *
 * API-compatible with shadcn's Card (Card, CardHeader, CardTitle,
 * CardDescription, CardAction, CardContent, CardFooter), plus:
 *  - variant: "elevated" (default, a soft shadow), "filled" (a tonal surface,
 *    no shadow) or "outlined" (a hairline border, flat).
 *  - size: "default" (24px padding) or "sm" (16px), for dense grids.
 *  - interactive: the whole card is one control. Use it with `asChild` and a
 *    link or button: hover shows a faint overlay and lifts elevated cards,
 *    pressing gives the same springy press as buttons. Don't put other
 *    buttons inside an interactive card.
 *  - CardMedia: a full-bleed image or illustration that takes the card's
 *    corners. Put it first (or last) in the card.
 *
 *   <Card>
 *     <CardHeader>
 *       <CardTitle>Storage</CardTitle>
 *       <CardDescription>18.4 GB of 25 GB used</CardDescription>
 *       <CardAction><IconButton icon="more_vert" label="More" /></CardAction>
 *     </CardHeader>
 *     <CardContent>…</CardContent>
 *     <CardFooter><Button>Upgrade</Button></CardFooter>
 *   </Card>
 *
 *   <Card asChild interactive variant="outlined">
 *     <a href="/guides/tokens">…</a>
 *   </Card>
 */
const cardVariants = cva(
  [
    "flex flex-col gap-(--card-gap) overflow-hidden rounded-xl py-(--card-p) text-card-foreground",
    // a media block at the top or bottom drops the outer padding and takes the corners
    "has-[>[data-slot=card-media]:first-child]:pt-0 has-[>[data-slot=card-media]:last-child]:pb-0",
  ],
  {
    variants: {
      variant: {
        elevated: "bg-card shadow-e1",
        filled: "bg-surface-container-high",
        outlined: "border border-outline-variant bg-card",
      },
      size: {
        default: "[--card-p:1.5rem] [--card-gap:1.5rem]",
        sm: "[--card-p:1rem] [--card-gap:1rem]",
      },
      interactive: {
        true: [
          "tactile state-layer cursor-pointer text-left [--press-scale:0.985]",
          "after:z-10 hover:after:opacity-[0.04] focus-visible:after:opacity-[0.06] active:after:opacity-[0.08]",
          "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
          "disabled:pointer-events-none disabled:opacity-40 aria-disabled:pointer-events-none aria-disabled:opacity-40",
        ],
        false: "",
      },
    },
    compoundVariants: [
      { variant: "elevated", interactive: true, class: "hover:shadow-e3 active:shadow-e1" },
      { variant: "filled", interactive: true, class: "hover:shadow-e1 active:shadow-none" },
      { variant: "outlined", interactive: true, class: "hover:border-outline" },
    ],
    defaultVariants: { variant: "elevated", size: "default", interactive: false },
  }
)

type CardProps = React.ComponentProps<"div"> & VariantProps<typeof cardVariants> & { asChild?: boolean }

function Card({ className, variant, size, interactive, asChild = false, ...props }: CardProps) {
  const Comp = asChild ? Slot.Root : "div"
  return (
    <Comp
      data-slot="card"
      data-variant={variant ?? "elevated"}
      data-interactive={interactive || undefined}
      className={cn(cardVariants({ variant, size, interactive }), className)}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1 px-(--card-p)",
        "has-data-[slot=card-action]:grid-cols-[1fr_auto]",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-title" className={cn("type-title-lg text-balance", className)} {...props} />
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-description" className={cn("type-body-md text-muted-foreground", className)} {...props} />
}

/** Top-right slot in the header, e.g. an icon button or a badge. */
function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn("col-start-2 row-span-2 row-start-1 -mt-1 -mr-2 self-start justify-self-end", className)}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-content" className={cn("px-(--card-p) type-body-md", className)} {...props} />
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-footer" className={cn("flex items-center gap-2 px-(--card-p)", className)} {...props} />
}

/**
 * Full-bleed media. Give it a fixed aspect ratio so the card doesn't jump
 * while an image loads. With `inset`, it keeps the card padding and gets its
 * own corners instead.
 */
function CardMedia({ className, inset = false, asChild = false, ...props }: React.ComponentProps<"div"> & { inset?: boolean; asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "div"
  return (
    <Comp
      data-slot={inset ? "card-media-inset" : "card-media"}
      className={cn(
        "relative aspect-video w-full overflow-hidden bg-surface-container-highest object-cover",
        inset && "mx-(--card-p) w-auto rounded-lg",
        className
      )}
      {...props}
    />
  )
}

export { Card, CardHeader, CardTitle, CardDescription, CardAction, CardContent, CardFooter, CardMedia, cardVariants, type CardProps }
