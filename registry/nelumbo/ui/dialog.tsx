"use client"

import * as React from "react"
import { Dialog as DialogPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { Icon, type IconName } from "@/registry/nelumbo/ui/icon"
import { IconButton } from "@/registry/nelumbo/ui/icon-button"

/**
 * Nelumbo Dialog (built on Radix Dialog)
 *
 * API-compatible with shadcn's Dialog (Dialog, DialogTrigger, DialogContent,
 * DialogHeader, DialogFooter, DialogTitle, DialogDescription, DialogClose),
 * plus:
 *  - DialogContent `size`: "sm" (400px), "default" (512px), "lg" (672px).
 *  - DialogIcon: a hero icon above the title; the header centers itself.
 *  - DialogBody: a scrolling region between header and footer, with hairlines
 *    that appear only while there is more to scroll.
 *
 * The dialog rises and settles on the smooth spring; the scrim fades in with
 * a slight blur. Closing is quick and quiet.
 *
 *   <Dialog>
 *     <DialogTrigger asChild><Button>Delete</Button></DialogTrigger>
 *     <DialogContent size="sm">
 *       <DialogHeader>
 *         <DialogIcon name="delete" />
 *         <DialogTitle>Delete 3 files?</DialogTitle>
 *         <DialogDescription>This can't be undone.</DialogDescription>
 *       </DialogHeader>
 *       <DialogFooter>
 *         <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
 *         <Button variant="destructive">Delete</Button>
 *       </DialogFooter>
 *     </DialogContent>
 *   </Dialog>
 */
function Dialog(props: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

function DialogTrigger(props: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogPortal(props: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

function DialogClose(props: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

/** The scrim. Shared with Sheet. */
const overlayClass = cn(
  "fixed inset-0 z-50 bg-black/35 backdrop-blur-[2px] dark:bg-black/60",
  "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:duration-300 data-[state=open]:ease-(--ease-standard)",
  "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:duration-200 data-[state=closed]:ease-(--ease-standard)"
)

function DialogOverlay({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return <DialogPrimitive.Overlay data-slot="dialog-overlay" className={cn(overlayClass, className)} {...props} />
}

const SIZES = {
  sm: "max-w-[25rem]",
  default: "max-w-lg",
  lg: "max-w-2xl",
}

/** A close button for the top-right corner. Shared with Sheet. */
function CornerClose({ className }: { className?: string }) {
  return (
    <DialogPrimitive.Close asChild>
      <IconButton icon="close" label="Close" size="sm" className={cn("absolute top-4 right-4", className)} />
    </DialogPrimitive.Close>
  )
}

type DialogContentProps = React.ComponentProps<typeof DialogPrimitive.Content> & {
  size?: keyof typeof SIZES
  showCloseButton?: boolean
}

function DialogContent({ className, children, size = "default", showCloseButton = true, ...props }: DialogContentProps) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        data-close-button={showCloseButton || undefined}
        className={cn(
          "fixed top-1/2 left-1/2 z-50 flex max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] -translate-1/2 flex-col gap-4 rounded-2xl p-6",
          "bg-card text-card-foreground shadow-e5 dark:bg-surface-container-high",
          "outline-none",
          SIZES[size],
          "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-[0.92] data-[state=open]:slide-in-from-bottom-3",
          "data-[state=open]:duration-[519ms] data-[state=open]:ease-(--ease-spring)",
          "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-[0.96]",
          "data-[state=closed]:duration-150 data-[state=closed]:ease-(--ease-standard)",
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && <CornerClose />}
      </DialogPrimitive.Content>
    </DialogPortal>
  )
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn(
        "flex flex-col gap-2 text-left",
        // leave room for the close button
        "in-data-close-button:pr-10",
        "has-data-dialog-icon:items-center has-data-dialog-icon:px-10 has-data-dialog-icon:text-center",
        className
      )}
      {...props}
    />
  )
}

/** Hero icon above the title. Use it for alerts and confirmations. */
function DialogIcon({ name, className, ...props }: Omit<React.ComponentProps<typeof Icon>, "name"> & { name: IconName }) {
  return <Icon data-dialog-icon="" name={name} size={24} className={cn("mb-2 text-brand", className)} {...props} />
}

function DialogTitle({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return <DialogPrimitive.Title data-slot="dialog-title" className={cn("type-headline-sm text-balance", className)} {...props} />
}

function DialogDescription({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("type-body-md text-pretty text-muted-foreground", className)}
      {...props}
    />
  )
}

/**
 * Scrolling content. Hairlines show at the top and bottom edges only while
 * there is more to scroll in that direction (scroll-driven, no JS).
 */
function DialogBody({ className, onScroll, ...props }: React.ComponentProps<"div">) {
  const ref = React.useRef<HTMLDivElement>(null)
  const [edges, setEdges] = React.useState({ top: false, bottom: false })
  const measure = React.useCallback(() => {
    const el = ref.current
    if (!el) return
    const top = el.scrollTop > 1
    const bottom = el.scrollTop + el.clientHeight < el.scrollHeight - 1
    setEdges((e) => (e.top === top && e.bottom === bottom ? e : { top, bottom }))
  }, [])
  React.useEffect(() => {
    const el = ref.current
    if (!el) return
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    if (el.firstElementChild) ro.observe(el.firstElementChild)
    return () => ro.disconnect()
  }, [measure])

  return (
    <div
      ref={ref}
      data-slot="dialog-body"
      data-scroll-top={edges.top || undefined}
      data-scroll-bottom={edges.bottom || undefined}
      tabIndex={edges.top || edges.bottom ? 0 : undefined}
      onScroll={(e) => {
        measure()
        onScroll?.(e)
      }}
      className={cn(
        "-mx-6 min-h-0 flex-1 overflow-y-auto overscroll-contain border-y border-transparent px-6 type-body-md",
        "transition-[border-color] duration-200 data-scroll-top:border-t-outline-variant data-scroll-bottom:border-b-outline-variant",
        "outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring",
        className
      )}
      {...props}
    />
  )
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn("mt-2 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogTrigger,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogIcon,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
  CornerClose,
  overlayClass,
}
