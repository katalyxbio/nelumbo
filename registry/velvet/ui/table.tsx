"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Velvet Table
 *
 * Same parts as shadcn's Table, so shadcn code works unchanged.
 *
 *   <Table density="compact">
 *     <TableCaption>Invoices from May</TableCaption>
 *     <TableHeader>
 *       <TableRow><TableHead>Invoice</TableHead><TableHead className="text-end">Amount</TableHead></TableRow>
 *     </TableHeader>
 *     <TableBody>
 *       <TableRow><TableCell>INV-001</TableCell><TableCell className="text-end">$250.00</TableCell></TableRow>
 *     </TableBody>
 *     <TableFooter>...</TableFooter>
 *   </Table>
 *
 * - The table sits in a rounded container that scrolls sideways when it is
 *   wider than its space (phones), so the page itself never does. The
 *   container takes keyboard focus while it overflows, so it can be scrolled
 *   with the arrow keys. `containerClassName` styles it.
 * - A soft header surface and faint row dividers stand in for heavy borders;
 *   rows light up on hover and `data-state="selected"` fills them.
 * - `density`: "comfortable" (default, 56px rows) or "compact" (40px).
 * - `stickyHeader`: the header stays put while the body scrolls. Give the
 *   container a height: `containerClassName="max-h-96"`.
 * - Put `tabular-nums` and `text-end` on numeric columns.
 */

type TableProps = React.ComponentProps<"table"> & {
  density?: "comfortable" | "compact"
  stickyHeader?: boolean
  containerClassName?: string
}

function Table({ className, containerClassName, density = "comfortable", stickyHeader = false, ...props }: TableProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const [scrollable, setScrollable] = React.useState(false)

  // Keyboard users can only scroll a container that can take focus.
  React.useEffect(() => {
    const el = ref.current
    if (!el) return
    const measure = () => setScrollable(el.scrollWidth > el.clientWidth || el.scrollHeight > el.clientHeight)
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    if (el.firstElementChild) ro.observe(el.firstElementChild)
    return () => ro.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      data-slot="table-container"
      tabIndex={scrollable ? 0 : undefined}
      className={cn(
        "@container relative w-full overflow-auto rounded-2xl bg-surface-container-lowest ring-1 ring-outline-variant/60 ring-inset",
        "outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring",
        containerClassName
      )}
    >
      <table
        data-slot="table"
        data-density={density}
        data-sticky={stickyHeader || undefined}
        className={cn("group/table w-full caption-bottom border-collapse text-left type-body-md", className)}
        {...props}
      />
    </div>
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return <thead data-slot="table-header" className={cn("bg-surface-container-low dark:bg-surface-container", className)} {...props} />
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return <tbody data-slot="table-body" className={cn("[&>tr:last-child]:border-b-0", className)} {...props} />
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn("bg-surface-container-low font-medium dark:bg-surface-container [&>tr]:border-b-0", className)}
      {...props}
    />
  )
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "border-b border-outline-variant/40 transition-colors duration-150 motion-reduce:transition-none",
        "[tbody>&]:hover:bg-foreground/[0.04] data-[state=selected]:bg-secondary [tbody>&]:data-[state=selected]:hover:bg-secondary",
        "[thead>&]:border-b-0",
        className
      )}
      {...props}
    />
  )
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "h-12 px-4 text-left align-middle type-label-md whitespace-nowrap text-muted-foreground",
        "group-data-[density=compact]/table:h-10 group-data-[density=compact]/table:px-3",
        "group-data-[sticky]/table:sticky group-data-[sticky]/table:top-0 group-data-[sticky]/table:z-10 group-data-[sticky]/table:bg-surface-container-low dark:group-data-[sticky]/table:bg-surface-container",
        "[&:has([role=checkbox])]:w-14 [&:has([role=checkbox])]:pe-0",
        className
      )}
      {...props}
    />
  )
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "px-4 py-3.5 align-middle",
        "group-data-[density=compact]/table:px-3 group-data-[density=compact]/table:py-2",
        "[&:has([role=checkbox])]:w-14 [&:has([role=checkbox])]:pe-0",
        className
      )}
      {...props}
    />
  )
}

function TableCaption({ className, ...props }: React.ComponentProps<"caption">) {
  return <caption data-slot="table-caption" className={cn("px-4 py-4 type-body-sm text-muted-foreground", className)} {...props} />
}

export { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow, type TableProps }
