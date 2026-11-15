"use client"

import * as React from "react"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"
import { Icon } from "@/registry/nelumbo/ui/icon"

/**
 * Nelumbo Breadcrumb
 *
 * API-compatible with shadcn's Breadcrumb: Breadcrumb, BreadcrumbList,
 * BreadcrumbItem, BreadcrumbLink (`asChild`), BreadcrumbPage,
 * BreadcrumbSeparator, BreadcrumbEllipsis.
 *
 * Links are muted text that turns to foreground on hover, inside a rounded
 * state-layer pill. The current page is foreground and medium weight with
 * aria-current="page". Separators are a small chevron, hidden from assistive
 * tech; pass children to use your own (a "/" works). The trail wraps onto
 * more lines at phone width instead of overflowing.
 *
 *   <Breadcrumb>
 *     <BreadcrumbList>
 *       <BreadcrumbItem><BreadcrumbLink href="/">Home</BreadcrumbLink></BreadcrumbItem>
 *       <BreadcrumbSeparator />
 *       <BreadcrumbItem><BreadcrumbLink href="/projects">Projects</BreadcrumbLink></BreadcrumbItem>
 *       <BreadcrumbSeparator />
 *       <BreadcrumbItem><BreadcrumbPage>Nelumbo</BreadcrumbPage></BreadcrumbItem>
 *     </BreadcrumbList>
 *   </Breadcrumb>
 *
 *   // collapsed middle items, in a Nelumbo DropdownMenu
 *   <BreadcrumbItem>
 *     <DropdownMenu>
 *       <DropdownMenuTrigger className="state-layer flex items-center rounded-full outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
 *         <BreadcrumbEllipsis />
 *       </DropdownMenuTrigger>
 *       <DropdownMenuContent align="start">
 *         <DropdownMenuItem>Components</DropdownMenuItem>
 *       </DropdownMenuContent>
 *     </DropdownMenu>
 *   </BreadcrumbItem>
 *
 *   // your own router link
 *   <BreadcrumbLink asChild><Link href="/projects">Projects</Link></BreadcrumbLink>
 */

type BreadcrumbVariant = "plain" | "contained"

/**
 * `variant="contained"` sets the trail on a tonal track, with the current
 * page raised on it like a selected segment. "plain" (default) puts the
 * current page in a tonal chip and leaves the rest on the page.
 */
function Breadcrumb({ variant = "plain", className, ...props }: React.ComponentProps<"nav"> & { variant?: BreadcrumbVariant }) {
  return <nav aria-label="breadcrumb" data-slot="breadcrumb" data-variant={variant} className={cn("group/breadcrumb", className)} {...props} />
}

function BreadcrumbList({ className, ...props }: React.ComponentProps<"ol">) {
  return (
    <ol
      data-slot="breadcrumb-list"
      className={cn(
        "flex min-w-0 flex-wrap items-center gap-0.5 break-words text-muted-foreground type-label-lg",
        "[--icon-opsz:20] [--icon-size:18px]",
        "group-data-[variant=contained]/breadcrumb:w-fit group-data-[variant=contained]/breadcrumb:rounded-[1.25rem]",
        "group-data-[variant=contained]/breadcrumb:bg-surface-container-high group-data-[variant=contained]/breadcrumb:p-1",
        "dark:group-data-[variant=contained]/breadcrumb:bg-surface-container",
        className
      )}
      {...props}
    />
  )
}

function BreadcrumbItem({ className, ...props }: React.ComponentProps<"li">) {
  return <li data-slot="breadcrumb-item" className={cn("inline-flex min-w-0 items-center", className)} {...props} />
}

type BreadcrumbLinkProps = React.ComponentProps<"a"> & {
  /** Render the link styles on your own element (for example a router Link). */
  asChild?: boolean
}

const pill = "inline-flex h-8 min-w-0 items-center gap-1.5 rounded-full px-3 has-[>[data-slot=icon]:first-child]:ps-2"

function BreadcrumbLink({ asChild, className, ...props }: BreadcrumbLinkProps) {
  const Comp = asChild ? Slot.Root : "a"
  return (
    <Comp
      data-slot="breadcrumb-link"
      className={cn(
        pill,
        "tactile state-layer text-muted-foreground no-underline outline-none hover:text-foreground",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        className
      )}
      {...props}
    />
  )
}

function BreadcrumbPage({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="breadcrumb-page"
      aria-current="page"
      className={cn(
        pill,
        "font-medium text-secondary-foreground [--icon-fill:1]",
        "bg-secondary",
        // contained: the current page is the raised segment of the track
        "group-data-[variant=contained]/breadcrumb:bg-surface-container-lowest group-data-[variant=contained]/breadcrumb:text-foreground",
        "group-data-[variant=contained]/breadcrumb:shadow-e1 dark:group-data-[variant=contained]/breadcrumb:bg-surface-container-highest",
        className
      )}
      {...props}
    />
  )
}

function BreadcrumbSeparator({ children, className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="breadcrumb-separator"
      role="presentation"
      aria-hidden="true"
      className={cn(
        "inline-flex shrink-0 items-center px-0.5 text-outline [--icon-opsz:20] [--icon-size:16px]",
        className
      )}
      {...props}
    >
      {children ?? <Icon name="chevron_right" />}
    </li>
  )
}

function BreadcrumbEllipsis({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="breadcrumb-ellipsis"
      className={cn("flex size-8 items-center justify-center rounded-full text-muted-foreground", className)}
      {...props}
    >
      <Icon name="more_horiz" size={18} />
      <span className="sr-only">More</span>
    </span>
  )
}

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
  type BreadcrumbLinkProps,
}
