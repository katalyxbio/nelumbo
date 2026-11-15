"use client"

import * as React from "react"
import { Dialog as SheetPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { CornerClose, overlayClass } from "@/registry/nelumbo/ui/dialog"

/**
 * Nelumbo Sheet (built on Radix Dialog)
 *
 * API-compatible with shadcn's Sheet (Sheet, SheetTrigger, SheetContent with
 * `side`, SheetHeader, SheetFooter, SheetTitle, SheetDescription,
 * SheetClose), plus:
 *  - `floating`: the sheet stands off the edge by 8px with every corner
 *    rounded, instead of meeting the edge.
 *  - Bottom sheets get a drag handle. Drag down to dismiss: past a third of
 *    the height, or with a quick flick, it closes; otherwise it springs back.
 *    The handle is also a button that closes the sheet.
 *  - SheetBody: the scrolling middle part.
 *
 * Sheets slide in on the smooth spring and leave quickly.
 *
 *   <Sheet>
 *     <SheetTrigger asChild><Button>Filters</Button></SheetTrigger>
 *     <SheetContent side="right">
 *       <SheetHeader><SheetTitle>Filters</SheetTitle></SheetHeader>
 *       <SheetBody>…</SheetBody>
 *       <SheetFooter><Button>Show 24 results</Button></SheetFooter>
 *     </SheetContent>
 *   </Sheet>
 */

const SheetContext = React.createContext<{ close: () => void }>({ close: () => {} })

function Sheet({ open, defaultOpen = false, onOpenChange, ...props }: React.ComponentProps<typeof SheetPrimitive.Root>) {
  // Own the open state so a drag can close the sheet, controlled or not.
  const [inner, setInner] = React.useState(defaultOpen)
  const isOpen = open ?? inner
  const setOpen = React.useCallback(
    (v: boolean) => {
      setInner(v)
      onOpenChange?.(v)
    },
    [onOpenChange]
  )
  const ctx = React.useMemo(() => ({ close: () => setOpen(false) }), [setOpen])
  return (
    <SheetContext.Provider value={ctx}>
      <SheetPrimitive.Root data-slot="sheet" open={isOpen} onOpenChange={setOpen} {...props} />
    </SheetContext.Provider>
  )
}

function SheetTrigger(props: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />
}

function SheetClose(props: React.ComponentProps<typeof SheetPrimitive.Close>) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />
}

function SheetPortal(props: React.ComponentProps<typeof SheetPrimitive.Portal>) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />
}

function SheetOverlay({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
  return <SheetPrimitive.Overlay data-slot="sheet-overlay" className={cn(overlayClass, className)} {...props} />
}

type Side = "top" | "right" | "bottom" | "left"

const SIDES: Record<Side, { attached: string; floating: string; motion: string }> = {
  right: {
    attached: "inset-y-0 right-0 h-full w-[min(24rem,calc(100%-3rem))] rounded-l-2xl",
    floating: "inset-y-2 right-2 w-[min(24rem,calc(100%-3rem))] rounded-2xl",
    motion: "data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right",
  },
  left: {
    attached: "inset-y-0 left-0 h-full w-[min(24rem,calc(100%-3rem))] rounded-r-2xl",
    floating: "inset-y-2 left-2 w-[min(24rem,calc(100%-3rem))] rounded-2xl",
    motion: "data-[state=open]:slide-in-from-left data-[state=closed]:slide-out-to-left",
  },
  top: {
    attached: "inset-x-0 top-0 max-h-[85dvh] rounded-b-2xl",
    floating: "inset-x-2 top-2 max-h-[85dvh] rounded-2xl",
    motion: "data-[state=open]:slide-in-from-top data-[state=closed]:slide-out-to-top",
  },
  bottom: {
    attached: "inset-x-0 bottom-0 mx-auto max-h-[85dvh] w-full max-w-2xl rounded-t-3xl",
    floating: "inset-x-2 bottom-2 mx-auto max-h-[85dvh] max-w-2xl rounded-3xl",
    motion: "data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom",
  },
}

type SheetContentProps = React.ComponentProps<typeof SheetPrimitive.Content> & {
  side?: Side
  floating?: boolean
  showCloseButton?: boolean
}

function SheetContent({ className, children, side = "right", floating = false, showCloseButton, style, ...props }: SheetContentProps) {
  const bottom = side === "bottom"
  const drag = useDragToDismiss(bottom)
  const s = SIDES[side]

  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content
        ref={drag.ref}
        data-slot="sheet-content"
        data-side={side}
        data-close-button={(showCloseButton ?? !bottom) || undefined}
        className={cn(
          "fixed z-50 flex flex-col gap-4 overflow-hidden p-6 outline-none",
          "bg-card text-card-foreground shadow-e5 dark:bg-surface-container-high",
          floating ? s.floating : s.attached,
          bottom && "pt-0",
          s.motion,
          "data-[state=open]:animate-in data-[state=open]:duration-[519ms] data-[state=open]:ease-(--ease-spring)",
          "data-[state=closed]:animate-out data-[state=closed]:duration-200 data-[state=closed]:ease-(--ease-emphasized)",
          className
        )}
        style={{ ...drag.style, ...style }}
        {...props}
      >
        {bottom && <DragHandle {...drag.handleProps} />}
        {children}
        {(showCloseButton ?? !bottom) && <CornerClose />}
      </SheetPrimitive.Content>
    </SheetPortal>
  )
}

/** Pointer drag on the handle area moves a bottom sheet; release decides. */
function useDragToDismiss(enabled: boolean) {
  const { close } = React.useContext(SheetContext)
  const ref = React.useRef<HTMLDivElement>(null)
  const [dy, setDy] = React.useState(0)
  const [dragging, setDragging] = React.useState(false)
  const start = React.useRef<{ y: number; t: number; last: number; lt: number } | null>(null)

  const onPointerDown = (e: React.PointerEvent) => {
    if (!enabled || e.button !== 0) return
    e.currentTarget.setPointerCapture(e.pointerId)
    start.current = { y: e.clientY, t: e.timeStamp, last: e.clientY, lt: e.timeStamp }
    setDragging(true)
  }
  const onPointerMove = (e: React.PointerEvent) => {
    const s = start.current
    if (!s) return
    const d = e.clientY - s.y
    // pulling up resists; pulling down follows the finger
    setDy(d < 0 ? -Math.sqrt(-d) * 2 : d)
    s.last = e.clientY
    s.lt = e.timeStamp
  }
  const onPointerUp = (e: React.PointerEvent) => {
    const s = start.current
    if (!s) return
    start.current = null
    setDragging(false)
    const d = e.clientY - s.y
    const velocity = (e.clientY - s.last) / Math.max(1, e.timeStamp - s.lt) // px/ms, last segment
    const h = ref.current?.offsetHeight ?? 400
    // a tap on the handle closes too; the exit animation continues from where the finger left it
    if (Math.abs(d) < 4 || d > h / 3 || (d > 16 && velocity > 0.5)) close()
    else setDy(0)
  }

  return {
    ref,
    dragging,
    style: enabled
      ? ({
          translate: `0 ${Math.max(dy, -24)}px`,
          transition: dragging ? "none" : "translate 519ms var(--ease-spring-bouncy)",
        } as React.CSSProperties)
      : undefined,
    handleProps: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel: onPointerUp },
  }
}

function DragHandle(props: Pick<React.ComponentProps<"div">, "onPointerDown" | "onPointerMove" | "onPointerUp" | "onPointerCancel">) {
  return (
    <div data-slot="sheet-handle" className="-mx-6 flex shrink-0 cursor-grab touch-none justify-center pt-1.5 pb-1 active:cursor-grabbing" {...props}>
      <SheetPrimitive.Close
        aria-label="Close"
        onClick={(e) => {
          // pointer taps are handled by the drag logic; keyboard presses (detail 0) close here
          if (e.detail > 0) e.preventDefault()
        }}
        className="group/handle grid h-9 w-16 place-items-center rounded-full outline-none focus-visible:outline-2 focus-visible:outline-ring"
      >
        <span className="h-1 w-8 rounded-full bg-outline transition-[width] duration-200 group-hover/handle:w-10" />
      </SheetPrimitive.Close>
    </div>
  )
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="sheet-header" className={cn("flex flex-col gap-1.5 in-data-close-button:pr-10", className)} {...props} />
}

function SheetTitle({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return <SheetPrimitive.Title data-slot="sheet-title" className={cn("type-headline-sm text-balance", className)} {...props} />
}

function SheetDescription({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return <SheetPrimitive.Description data-slot="sheet-description" className={cn("type-body-md text-muted-foreground", className)} {...props} />
}

/** The scrolling middle of a sheet. */
function SheetBody({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="sheet-body" className={cn("-mx-6 min-h-0 flex-1 overflow-y-auto overscroll-contain px-6", className)} {...props} />
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="sheet-footer" className={cn("mt-auto flex flex-col gap-2 sm:flex-row sm:justify-end", className)} {...props} />
}

export { Sheet, SheetTrigger, SheetClose, SheetPortal, SheetOverlay, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetBody, SheetFooter }
