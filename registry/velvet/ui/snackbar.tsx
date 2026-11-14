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
 *
 * Sonner-compatible: `toast` and `Toaster` are the same functions under
 * sonner's names, so `import { toast } from "sonner"` can become an import
 * from this file:
 *
 *   toast.success("Saved")                 toast.error("Couldn't save")
 *   toast.warning / toast.info / toast.message / toast.loading
 *   toast("Event created", { description: "Friday, 10:00" })
 *   toast.promise(save(), { loading: "Saving…", success: "Saved", error: "Couldn't save" })
 *   toast("Uploading…", { id })            // same id updates it in place
 *   toast.dismiss(id) / toast.dismiss()    // one, or all
 *
 * - One at a time, as in Material: later calls wait in a queue (sonner stacks).
 * - It rises in on the smooth spring and leaves with a quick fade.
 * - Pauses while hovered or focused, and when the window loses focus.
 *   Swipe it right to dismiss. F8 moves focus to it.
 * - Announced politely to screen readers; errors (and `urgent: true`)
 *   announce assertively.
 * - Default duration: 4s, or 7s with an action; loading stays until updated.
 * - Long messages wrap and the action moves below them.
 */

type SnackbarType = "default" | "success" | "error" | "warning" | "info" | "loading"
type SnackbarId = number | string

type SnackbarOptions = {
  /** Reuse an id to update a snackbar in place (it keeps its spot and doesn't re-animate). */
  id?: SnackbarId
  /** A second, quieter line. The message then reads as a title. */
  description?: React.ReactNode
  action?: { label: string; onClick: () => void; /** Describes the action for screen readers, e.g. "Undo archiving". */ altText?: string }
  /** A Material Symbols name, or any node. Types set one for you. */
  icon?: IconName | React.ReactNode
  closable?: boolean
  /** Sonner's name for `closable`. */
  closeButton?: boolean
  /** ms; Infinity keeps it until dismissed. */
  duration?: number
  urgent?: boolean
  /** Closed by the person: action, close button, swipe or Escape. */
  onDismiss?: (id: SnackbarId) => void
  /** Closed because its time ran out. */
  onAutoClose?: (id: SnackbarId) => void
}

type Item = SnackbarOptions & { id: SnackbarId; type: SnackbarType; message: React.ReactNode; open: boolean }

const TYPE_ICONS: Partial<Record<SnackbarType, IconName>> = {
  success: "check_circle",
  error: "error",
  warning: "warning",
  info: "info",
}

// ---- a tiny store, so snackbar() works outside React

let items: Item[] = []
let nextId = 1
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())
const set = (next: Item[]) => {
  items = next
  emit()
}

function show(type: SnackbarType, message: React.ReactNode, options: SnackbarOptions = {}): SnackbarId {
  const existing = options.id !== undefined ? items.find((i) => i.id === options.id && i.open) : undefined
  const id = existing?.id ?? options.id ?? nextId++
  // an update replaces the content; unset options don't carry over from the old type
  const item: Item = { ...options, id, type, message, open: true }
  set(existing ? items.map((i) => (i.id === id ? item : i)) : [...items.filter((i) => i.id !== id), item])
  return id
}

function snackbar(message: React.ReactNode, options?: SnackbarOptions) {
  return show("default", message, options)
}

snackbar.message = (message: React.ReactNode, options?: SnackbarOptions) => show("default", message, options)
snackbar.success = (message: React.ReactNode, options?: SnackbarOptions) => show("success", message, options)
snackbar.error = (message: React.ReactNode, options?: SnackbarOptions) => show("error", message, options)
snackbar.warning = (message: React.ReactNode, options?: SnackbarOptions) => show("warning", message, options)
snackbar.info = (message: React.ReactNode, options?: SnackbarOptions) => show("info", message, options)
snackbar.loading = (message: React.ReactNode, options?: SnackbarOptions) => show("loading", message, options)

type PromiseMessages<T> = {
  loading: React.ReactNode
  success: React.ReactNode | ((data: T) => React.ReactNode)
  error: React.ReactNode | ((error: unknown) => React.ReactNode)
  description?: React.ReactNode
  finally?: () => void
}

/** Shows `loading`, then turns the same snackbar into `success` or `error`. */
snackbar.promise = <T,>(promise: Promise<T> | (() => Promise<T>), messages: PromiseMessages<T>, options?: SnackbarOptions) => {
  const id = show("loading", messages.loading, { ...options, description: messages.description })
  const p = typeof promise === "function" ? promise() : promise
  const settled = p.then(
    (data) => {
      show("success", typeof messages.success === "function" ? messages.success(data) : messages.success, { ...options, id })
      return data
    },
    (error: unknown) => {
      show("error", typeof messages.error === "function" ? messages.error(error) : messages.error, { ...options, id })
      throw error
    }
  )
  settled.finally(() => messages.finally?.()).catch(() => {})
  return { id, unwrap: () => settled }
}

/** Close one snackbar by id, or all of them. Queued ones are dropped without showing. */
snackbar.dismiss = (id?: SnackbarId) => {
  const targets = id === undefined ? items.map((i) => i.id) : [id]
  const showing = items[0]?.id
  set(items.filter((i) => !targets.includes(i.id) || i.id === showing).map((i) => (targets.includes(i.id) ? { ...i, open: false } : i)))
}

/** Sonner's name for snackbar(). */
const toast = snackbar

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
  /** Bottom center (default), or a bottom corner on wide screens. Sonner's bottom-left / bottom-right work too. */
  position?: "bottom-center" | "bottom-start" | "bottom-end" | "bottom-left" | "bottom-right"
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
  const remove = (item: Item, byUser: boolean) => {
    if (!items.some((i) => i.id === item.id && !i.open)) return // already removed, or reopened by an update
    // Radix parks focus on the empty viewport after a close; send it back instead.
    const active = document.activeElement
    if (active && viewportRef.current?.contains(active)) {
      const back = returnFocus.current
      if (back?.isConnected) back.focus({ preventScroll: true })
      else (active as HTMLElement).blur()
    }
    set(items.filter((i) => i.id !== item.id))
    if (byUser) item.onDismiss?.(item.id)
    else item.onAutoClose?.(item.id)
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
          onExited={(byUser) => remove(current, byUser)}
        />
      )}
      <ToastPrimitive.Viewport
        ref={viewportRef}
        data-slot="snackbar-viewport"
        style={{ "--snackbar-offset": `${offset}px` } as React.CSSProperties}
        className={cn(
          "fixed bottom-[calc(1rem+var(--snackbar-offset)+env(safe-area-inset-bottom))] z-[60] flex w-full max-w-[min(36rem,calc(100vw-2rem))] flex-col outline-none",
          "left-1/2 -translate-x-1/2",
          (position === "bottom-start" || position === "bottom-left") && "sm:left-6 sm:translate-x-0",
          (position === "bottom-end" || position === "bottom-right") && "sm:right-6 sm:left-auto sm:translate-x-0",
          className
        )}
      />
    </ToastPrimitive.Provider>
  )
}

function SnackbarItem({ item, onOpenChange, onExited }: { item: Item; onOpenChange: (open: boolean) => void; onExited: (byUser: boolean) => void }) {
  const duration = item.duration ?? (item.type === "loading" ? Infinity : item.action ? 7000 : 4000)
  const ref = React.useRef<HTMLLIElement>(null)
  // set by anything the person does to close it; otherwise the timer did
  const byUser = React.useRef(false)
  const userClose = () => {
    byUser.current = true
  }
  const closable = item.closable ?? item.closeButton
  const icon = item.icon ?? TYPE_ICONS[item.type]

  // Remove from the queue once the closing animation has finished.
  React.useEffect(() => {
    if (item.open) return
    const el = ref.current
    const done = () => onExited(byUser.current)
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
      type={item.urgent || item.type === "error" ? "foreground" : "background"}
      data-type={item.type}
      onEscapeKeyDown={userClose}
      onSwipeEnd={userClose}
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
      {item.type === "loading" ? (
        <Spinner />
      ) : typeof icon === "string" ? (
        <Icon name={icon as IconName} className="-ml-1 shrink-0 text-inverse-foreground/80" />
      ) : icon ? (
        <span className="-ml-1 grid shrink-0 place-items-center">{icon}</span>
      ) : null}
      {item.description ? (
        <div className="flex min-w-0 flex-1 basis-[max-content] flex-col gap-0.5 py-2.5">
          <ToastPrimitive.Title className="type-title-sm text-pretty">{item.message}</ToastPrimitive.Title>
          <ToastPrimitive.Description className="type-body-sm text-pretty text-inverse-foreground/75">{item.description}</ToastPrimitive.Description>
        </div>
      ) : (
        <ToastPrimitive.Description className="min-w-0 flex-1 basis-[max-content] py-2 type-body-md text-pretty">{item.message}</ToastPrimitive.Description>
      )}
      {(item.action || closable) && (
        <div className="ml-auto flex shrink-0 items-center gap-1">
          {item.action && (
            <ToastPrimitive.Action
              altText={item.action.altText ?? item.action.label}
              onClick={() => {
                userClose()
                item.action?.onClick()
              }}
              className={cn(
                "state-layer h-9 cursor-pointer rounded-full px-3 type-label-lg text-inverse-primary",
                "outline-none focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-inverse-primary"
              )}
            >
              {item.action.label}
            </ToastPrimitive.Action>
          )}
          {closable && (
            <ToastPrimitive.Close
              aria-label="Dismiss"
              onClick={userClose}
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

/** Indeterminate spinner for loading snackbars. */
function Spinner() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className="-ml-1 size-5 shrink-0 animate-spin text-inverse-foreground/80 [animation-duration:900ms]">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2.5" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

/** Sonner's name for <Snackbars />. */
const Toaster = Snackbars

export { Snackbars, Toaster, snackbar, toast, type SnackbarOptions, type SnackbarsProps, type SnackbarType, type SnackbarId }
