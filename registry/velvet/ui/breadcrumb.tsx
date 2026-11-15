"use client"

import * as React from "react"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"
import { Icon } from "@/registry/velvet/ui/icon"

/**
 * Velvet Breadcrumb
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
 *       <BreadcrumbItem><BreadcrumbPage>Velvet</BreadcrumbPage></BreadcrumbItem>
 *     </BreadcrumbList>
 *   </Breadcrumb>
 *
 *   // collapsed middle items, in a Velvet DropdownMenu
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

function Breadcrumb({ ...props }: React.ComponentProps<"nav">) {
  return <nav aria-label="breadcrumb" data-slot="breadcrumb" {...props} />
}

function BreadcrumbList({ className, ...props }: React.ComponentProps<"ol">) {
  return (
    <ol
      data-slot="breadcrumb-list"
      className={cn(
        "flex min-w-0 flex-wrap items-center gap-x-1 gap-y-1 break-words text-muted-foreground type-label-lg",
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

function BreadcrumbLink({ asChild, className, ...props }: BreadcrumbLinkProps) {
  const Comp = asChild ? Slot.Root : "a"
  return (
    <Comp
      data-slot="breadcrumb-link"
      className={cn(
        "state-layer inline-flex h-8 items-center gap-1 rounded-full px-2.5 text-muted-foreground no-underline transition-colors duration-150 outline-none hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
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
      className={cn("inline-flex h-8 min-w-0 items-center px-2.5 font-medium text-foreground type-label-lg", className)}
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
        "inline-flex shrink-0 items-center text-muted-foreground [--icon-opsz:20] [--icon-size:16px] [&_[data-slot=icon]]:text-muted-foreground",
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
    <span data-slot="breadcrumb-ellipsis" className={cn("flex size-8 items-center justify-center text-muted-foreground", className)} {...props}>
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
