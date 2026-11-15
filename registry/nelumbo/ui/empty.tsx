import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Nelumbo Empty
 *
 * Drop-in for shadcn's Empty (Empty, EmptyHeader, EmptyMedia, EmptyTitle,
 * EmptyDescription, EmptyContent). Use it where a list, table or page has
 * nothing to show yet: say what is missing, why, and what to do next.
 *
 *   <Empty>
 *     <EmptyHeader>
 *       <EmptyMedia variant="icon"><Icon name="folder_open" /></EmptyMedia>
 *       <EmptyTitle>No projects yet</EmptyTitle>
 *       <EmptyDescription>Create one to start collecting files and people.</EmptyDescription>
 *     </EmptyHeader>
 *     <EmptyContent><Button>New project</Button></EmptyContent>
 *   </Empty>
 *
 * - Empty `variant`: "default" (plain, no border) or "filled" (a tonal
 *   surface with rounded corners). shadcn's dashed border is not used; a
 *   `border-dashed` className still works if you want it.
 * - EmptyMedia `variant`: "default" (bare, for your own illustration),
 *   "icon" (a large tonal tile with the glyph filled) or "avatars" (for an
 *   AvatarGroup, e.g. "invite your team").
 * - EmptyMedia `layered`: the icon tile has two softer tiles tilted behind
 *   it. On by default; `layered={false}` for a single tile.
 */

const emptyVariants = cva(
  "flex min-w-0 flex-1 flex-col items-center justify-center gap-6 text-center text-balance p-6 md:p-12",
  {
    variants: {
      variant: {
        default: "",
        filled: "rounded-2xl bg-surface-container-low [--avatar-ring:var(--surface-container-low)]",
      },
    },
    defaultVariants: { variant: "default" },
  }
)

function Empty({ className, variant, ...props }: React.ComponentProps<"div"> & VariantProps<typeof emptyVariants>) {
  return <div data-slot="empty" data-variant={variant ?? "default"} className={cn(emptyVariants({ variant }), className)} {...props} />
}

function EmptyHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="empty-header" className={cn("flex max-w-sm flex-col items-center gap-2 text-center", className)} {...props} />
}

const mediaVariants = cva("relative isolate mb-2 flex shrink-0 items-center justify-center", {
  variants: {
    variant: {
      default: "[&_svg:not([class*='size-'])]:size-6",
      icon: [
        "size-16 rounded-[1.25rem] bg-surface-container-highest text-foreground",
        "[--icon-size:32px] [--icon-opsz:32] [--icon-fill:1] [&_svg:not([class*='size-'])]:size-7",
        "animate-in fade-in-0 zoom-in-90 duration-500 ease-(--ease-spring-bouncy) motion-reduce:animate-none",
      ],
      avatars: "[--avatar-ring:var(--background)]",
    },
    layered: { true: "", false: "" },
  },
  compoundVariants: [
    {
      variant: "icon",
      layered: true,
      class: [
        // two softer tiles tilted behind the main one
        "before:absolute before:inset-0 before:-z-10 before:-rotate-[9deg] before:rounded-[1.25rem] before:bg-surface-container-high before:content-['']",
        "after:absolute after:inset-0 after:-z-10 after:translate-x-1 after:rotate-[7deg] after:rounded-[1.25rem] after:bg-surface-container after:content-['']",
        "before:transition-transform after:transition-transform before:duration-500 after:duration-500 before:ease-(--ease-spring-bouncy) after:ease-(--ease-spring-bouncy)",
        "motion-reduce:before:transition-none motion-reduce:after:transition-none",
        "hover:before:-rotate-[13deg] hover:after:rotate-[11deg]",
      ],
    },
  ],
  defaultVariants: { variant: "default", layered: true },
})

function EmptyMedia({
  className,
  variant = "default",
  layered = true,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof mediaVariants>) {
  return (
    <div
      data-slot="empty-icon"
      data-variant={variant}
      className={cn(mediaVariants({ variant, layered }), className)}
      {...props}
    />
  )
}

function EmptyTitle({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="empty-title" className={cn("type-title-lg", className)} {...props} />
}

function EmptyDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="empty-description"
      className={cn("type-body-md text-muted-foreground [&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-foreground", className)}
      {...props}
    />
  )
}

function EmptyContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty-content"
      className={cn("flex w-full max-w-sm min-w-0 flex-col items-center gap-3 text-balance", className)}
      {...props}
    />
  )
}

export { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent, emptyVariants }
