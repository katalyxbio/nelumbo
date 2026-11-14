"use client"

import * as React from "react"
import { Toast as ToastPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { Icon, type IconName } from "@/registry/velvet/ui/icon"

/**
 * Velvet Snackbar (built on Radix Toast)
 *
 * Brief messages about something the app just did, with at most one action.
 * Put <Snackbars /> once near the root, then call snackbar() from anywhere:
 *
 *   snackbar("Message archived", { action: { label: "Undo", onClick: restore } })
 *   snackbar("Couldn't send. Check your connection.", { closable: true, duration: Infinity })
 *   snackbar.dismiss()        // the current one
 *
 * - One at a time, as in Material: later calls wait in a queue.
 * - It rises in on the smooth spring and leaves with a quick fade.
 * - Pauses while hovered or focused, and when the window loses focus.
 *   Swipe it right (or down) to dismiss. F8 moves focus to it.
 * - Announced politely to screen readers; `urgent: true` announces assertively.
 * - Default duration: 4s, or 7s with an action, so there is time to reach it.
 * - Long messages wrap and the action moves below them.
 */

type SnackbarOptions = {
  action?: { label: string; onClick: () => void; /** Describes the action for screen readers, e.g. "Undo archiving". */ altText?: string }
  icon?: IconName
  closable?: boolean
  /** ms; Infinity keeps it until dismissed. */
  duration?: number
  urgent?: boolean
  onDismiss?: () => void
}

type Item = SnackbarOptions & { id: number; message: React.ReactNode; open: boolean }

// ---- a tiny store, so snackbar() works outside React

let items: Item[] = []
let nextId = 1
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())
const set = (next: Item[]) => {
  items = next
  emit()
}

function snackbar(message: React.ReactNode, options: SnackbarOptions = {}) {
  const id = nextId++
  set([...items, { ...options, id, message, open: true }])
  return id
}

/** Close one snackbar by id, or the one showing. Queued ones are dropped without showing. */
snackbar.dismiss = (id?: number) => {
  const target = id ?? items[0]?.id
  if (target === undefined) return
  if (items[0]?.id === target) set(items.map((i) => (i.id === target ? { ...i, open: false } : i)))
  else set(items.filter((i) => i.id !== target))
}

function useItems() {
  return React.useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => items,
    () => items
  )
}

// ---- host

type SnackbarsProps = {
  /** Bottom center (default), or bottom start on wide screens. */
  position?: "bottom-center" | "bottom-start"
  /** Extra space at the bottom, e.g. 80 to sit above a navigation bar. */
  offset?: number
  className?: string
}

function Snackbars({ position = "bottom-center", offset = 0, className }: SnackbarsProps) {
  const all = useItems()
  const current = all[0]

  // Remember where focus was before it entered the snackbar (F8, Tab), so it can go back there.
  const viewportRef = React.useRef<HTMLOListElement>(null)
  const returnFocus = React.useRef<HTMLElement | null>(null)
  React.useEffect(() => {
    const onFocusIn = (e: FocusEvent) => {
      const t = e.target as HTMLElement
      if (!t.closest?.("[data-slot=snackbar-viewport]")) returnFocus.current = t
    }
    document.addEventListener("focusin", onFocusIn)
    return () => document.removeEventListener("focusin", onFocusIn)
  }, [])

  const close = (item: Item) => {
    // let the exit animation play, then show the next one
    set(items.map((i) => (i.id === item.id ? { ...i, open: false } : i)))
  }
  const remove = (item: Item) => {
    if (!items.some((i) => i.id === item.id)) return // already removed
    // Radix parks focus on the empty viewport after a close; send it back instead.
    const active = document.activeElement
    if (active && viewportRef.current?.contains(active)) {
      const back = returnFocus.current
      if (back?.isConnected) back.focus({ preventScroll: true })
      else (active as HTMLElement).blur()
    }
    set(items.filter((i) => i.id !== item.id))
    item.onDismiss?.()
  }

  return (
    // A fresh provider per snackbar: Radix keeps a "paused" flag that sticks if a toast is
    // removed while hovered or focused, which would stop the next one from ever timing out.
    <ToastPrimitive.Provider key={current?.id ?? 0} swipeDirection="right" label="Notification">
      {current && (
        <SnackbarItem
          key={current.id}
          item={current}
          onOpenChange={(o) => !o && close(current)}
          onExited={() => remove(current)}
        />
      )}
      <ToastPrimitive.Viewport
        ref={viewportRef}
        data-slot="snackbar-viewport"
        style={{ "--snackbar-offset": `${offset}px` } as React.CSSProperties}
        className={cn(
          "fixed bottom-[calc(1rem+var(--snackbar-offset)+env(safe-area-inset-bottom))] z-[60] flex w-full max-w-[min(36rem,calc(100vw-2rem))] flex-col outline-none",
          position === "bottom-center" ? "left-1/2 -translate-x-1/2" : "left-1/2 -translate-x-1/2 sm:left-6 sm:translate-x-0",
          className
        )}
      />
    </ToastPrimitive.Provider>
  )
}

function SnackbarItem({ item, onOpenChange, onExited }: { item: Item; onOpenChange: (open: boolean) => void; onExited: () => void }) {
  const duration = item.duration ?? (item.action ? 7000 : 4000)
  const ref = React.useRef<HTMLLIElement>(null)

  // Remove from the queue once the closing animation has finished.
  React.useEffect(() => {
    if (item.open) return
    const el = ref.current
    const done = () => onExited()
    if (!el || !el.getAnimations().length) {
      const t = setTimeout(done, 0)
      return () => clearTimeout(t)
    }
    Promise.all(el.getAnimations().map((a) => a.finished)).then(done, done)
  }, [item.open, onExited])

  return (
    <ToastPrimitive.Root
      ref={ref}
      data-slot="snackbar"
      open={item.open}
      onOpenChange={onOpenChange}
      duration={duration === Infinity ? 2147483647 : duration}
      type={item.urgent ? "foreground" : "background"}
      forceMount
      className={cn(
        "group/snackbar flex min-h-12 w-full flex-wrap items-center gap-x-2 rounded-lg py-1.5 pr-2 pl-4 shadow-e3",
        "bg-inverse-surface text-inverse-foreground",
        "[--icon-size:20px] [--icon-opsz:20]",
        "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom-4 data-[state=open]:zoom-in-95",
        "data-[state=open]:duration-[519ms] data-[state=open]:ease-(--ease-spring)",
        "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=closed]:duration-150 data-[state=closed]:ease-(--ease-standard)",
        // swipe to dismiss
        "data-[swipe=move]:translate-x-(--radix-toast-swipe-move-x) data-[swipe=cancel]:translate-x-0 data-[swipe=cancel]:transition-[translate] data-[swipe=cancel]:duration-300",
        "data-[swipe=end]:animate-out data-[swipe=end]:fade-out-0 data-[swipe=end]:slide-out-to-right-full data-[swipe=end]:duration-200",
        "touch-none select-none"
      )}
    >
      {item.icon && <Icon name={item.icon} className="-ml-1 shrink-0 text-inverse-foreground/80" />}
      <ToastPrimitive.Description className="min-w-0 flex-1 basis-[max-content] py-2 type-body-md text-pretty">{item.message}</ToastPrimitive.Description>
      {(item.action || item.closable) && (
        <div className="ml-auto flex shrink-0 items-center gap-1">
          {item.action && (
            <ToastPrimitive.Action
              altText={item.action.altText ?? item.action.label}
              onClick={item.action.onClick}
              className={cn(
                "state-layer h-9 cursor-pointer rounded-full px-3 type-label-lg text-inverse-primary",
                "outline-none focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-inverse-primary"
              )}
            >
              {item.action.label}
            </ToastPrimitive.Action>
          )}
          {item.closable && (
            <ToastPrimitive.Close
              aria-label="Dismiss"
              className={cn(
                "state-layer grid size-9 cursor-pointer place-items-center rounded-full text-inverse-foreground",
                "outline-none focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-inverse-primary"
              )}
            >
              <Icon name="close" />
            </ToastPrimitive.Close>
          )}
        </div>
      )}
    </ToastPrimitive.Root>
  )
}

export { Snackbars, snackbar, type SnackbarOptions, type SnackbarsProps }
