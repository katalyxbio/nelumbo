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
  /** Tint this one with its type's container color (overrides the host's richColors). */
  richColors?: boolean
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
  /**
   * Show several at once, newest in front and the others tucked behind; hover
   * or focus fans them out. Off: one at a time with a queue (Material).
   */
  stack?: boolean
  /** How many a stack shows at once (sonner's name). */
  visibleToasts?: number
  /** Tint success, error, warning and info with their container colors. */
  richColors?: boolean
  className?: string
}

const GAP = 8 // between snackbars when fanned out
const PEEK = 14 // how far each tucked snackbar peeks out above the one in front

function Snackbars({ position = "bottom-center", offset = 0, stack = false, visibleToasts = 3, richColors = false, className }: SnackbarsProps) {
  const all = useItems()

  // Radix keeps a "paused" flag that sticks if the last toast is removed while hovered or
  // focused, and then the next one never times out. A fresh provider each time the list
  // empties clears it.
  const epoch = React.useRef(0)
  const wasEmpty = React.useRef(true)
  if (all.length && wasEmpty.current) epoch.current++
  wasEmpty.current = all.length === 0
  const providerKey = epoch.current

  // Remember where focus was before it entered the snackbars (F8, Tab), so it can go back there.
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

  const close = (item: Item) => set(items.map((i) => (i.id === item.id ? { ...i, open: false } : i)))
  const remove = (item: Item, byUser: boolean) => {
    if (!items.some((i) => i.id === item.id && !i.open)) return // already removed, or reopened by an update
    // Radix parks focus on the viewport after a close; send it back instead.
    const active = document.activeElement
    const othersLeft = items.some((i) => i.id !== item.id && i.open)
    if (active && viewportRef.current?.contains(active) && (!othersLeft || active === viewportRef.current)) {
      const back = returnFocus.current
      if (back?.isConnected) back.focus({ preventScroll: true })
      else (active as HTMLElement).blur()
    }
    set(items.filter((i) => i.id !== item.id))
    if (byUser) item.onDismiss?.(item.id)
    else item.onAutoClose?.(item.id)
  }

  // ---- stack layout: newest first; heights measured so the fan-out spaces them exactly
  const [expanded, setExpanded] = React.useState(false)
  const [heights, setHeights] = React.useState<Record<string, number>>({})
  const report = React.useCallback((id: SnackbarId, h: number) => setHeights((old) => (old[id] === h ? old : { ...old, [id]: h })), [])
  const shown = stack ? [...all].reverse() : all.slice(0, 1)
  const live = shown.filter((i) => i.open)
  const frontH = heights[String(live[0]?.id ?? shown[0]?.id)] ?? 48
  let viewportH = 0
  if (stack) {
    const visible = live.slice(0, visibleToasts)
    viewportH = expanded
      ? visible.reduce((sum, i, n) => sum + (heights[String(i.id)] ?? 48) + (n ? GAP : 0), 0)
      : frontH + Math.max(0, visible.length - 1) * PEEK
  }
  // Fan out on hover or focus. Native listeners: the snackbars are portaled into the viewport,
  // so React's synthetic enter/leave events don't see them as its children.
  React.useEffect(() => {
    const vp = viewportRef.current
    if (!vp || !stack) return
    const open = () => setExpanded(true)
    const closeIfIdle = () => {
      if (!vp.matches(":hover") && !vp.contains(document.activeElement)) setExpanded(false)
    }
    const onFocusOut = (e: FocusEvent) => {
      if (!vp.contains(e.relatedTarget as Node)) closeIfIdle()
    }
    vp.addEventListener("pointerenter", open)
    vp.addEventListener("pointerleave", closeIfIdle)
    vp.addEventListener("focusin", open)
    vp.addEventListener("focusout", onFocusOut)
    return () => {
      vp.removeEventListener("pointerenter", open)
      vp.removeEventListener("pointerleave", closeIfIdle)
      vp.removeEventListener("focusin", open)
      vp.removeEventListener("focusout", onFocusOut)
    }
  }, [stack, providerKey]) // the viewport element is new after each provider remount
  // collapse again once there is nothing left to fan out
  React.useEffect(() => {
    if (!live.length) setExpanded(false)
  }, [live.length])

  return (
    <ToastPrimitive.Provider key={providerKey} swipeDirection="right" label="Notification">
      {shown.map((item) => {
        let layout: StackLayout | undefined
        if (stack) {
          const index = live.indexOf(item) // -1 while closing; the item keeps its last spot
          const i = Math.max(0, index)
          let y = i * PEEK
          if (expanded) {
            y = 0
            for (const before of live.slice(0, i)) y += (heights[String(before.id)] ?? 48) + GAP
          }
          layout = { index: i, y, expanded, frontH, hidden: i >= visibleToasts, report }
        }
        return (
          <SnackbarItem
            key={item.id}
            item={item}
            richColors={item.richColors ?? richColors}
            layout={layout}
            onOpenChange={(o) => !o && close(item)}
            onExited={(byUser) => remove(item, byUser)}
          />
        )
      })}
      <ToastPrimitive.Viewport
        ref={viewportRef}
        data-slot="snackbar-viewport"
        data-stack={stack || undefined}
        data-expanded={(stack && expanded) || undefined}
        style={{ "--snackbar-offset": `${offset}px`, height: stack ? viewportH : undefined } as React.CSSProperties}
        className={cn(
          "fixed bottom-[calc(1rem+var(--snackbar-offset)+env(safe-area-inset-bottom))] z-[60] flex w-full max-w-[min(36rem,calc(100vw-2rem))] flex-col outline-none",
          stack && "transition-[height] duration-[519ms] ease-(--ease-spring)",
          "left-1/2 -translate-x-1/2",
          (position === "bottom-start" || position === "bottom-left") && "sm:left-6 sm:translate-x-0",
          (position === "bottom-end" || position === "bottom-right") && "sm:right-6 sm:left-auto sm:translate-x-0",
          className
        )}
      />
    </ToastPrimitive.Provider>
  )
}

type StackLayout = {
  index: number
  /** px up from the bottom of the viewport */
  y: number
  expanded: boolean
  frontH: number
  hidden: boolean
  report: (id: SnackbarId, height: number) => void
}

// Light: the type's container color. Dark: a third of it blended into the dark surface, with the
// bright tone for the icon, the action and a faint edge, so it tints rather than floods.
// (Written out in full so Tailwind can find every class.)
const RICH: Partial<Record<SnackbarType, string>> = {
  success: cn(
    "bg-success-container text-success-container-foreground [--snackbar-accent:var(--success-container-foreground)]",
    "dark:bg-[color-mix(in_oklab,var(--success-container)_35%,var(--surface-container-high))] dark:text-foreground",
    "dark:inset-ring dark:inset-ring-[color-mix(in_oklab,var(--success)_22%,transparent)] dark:[--snackbar-accent:var(--success)]"
  ),
  error: cn(
    "bg-destructive-container text-destructive-container-foreground [--snackbar-accent:var(--destructive-container-foreground)]",
    "dark:bg-[color-mix(in_oklab,var(--destructive-container)_35%,var(--surface-container-high))] dark:text-foreground",
    "dark:inset-ring dark:inset-ring-[color-mix(in_oklab,var(--destructive)_22%,transparent)] dark:[--snackbar-accent:var(--destructive)]"
  ),
  warning: cn(
    "bg-warning-container text-warning-container-foreground [--snackbar-accent:var(--warning-container-foreground)]",
    "dark:bg-[color-mix(in_oklab,var(--warning-container)_35%,var(--surface-container-high))] dark:text-foreground",
    "dark:inset-ring dark:inset-ring-[color-mix(in_oklab,var(--warning)_22%,transparent)] dark:[--snackbar-accent:var(--warning)]"
  ),
  info: cn(
    "bg-brand-container text-brand-container-foreground [--snackbar-accent:var(--brand-container-foreground)]",
    "dark:bg-[color-mix(in_oklab,var(--brand-container)_35%,var(--surface-container-high))] dark:text-foreground",
    "dark:inset-ring dark:inset-ring-[color-mix(in_oklab,var(--brand)_22%,transparent)] dark:[--snackbar-accent:var(--brand)]"
  ),
}

type ItemProps = {
  item: Item
  richColors: boolean
  layout?: StackLayout
  onOpenChange: (open: boolean) => void
  onExited: (byUser: boolean) => void
}

function SnackbarItem({ item, richColors, layout, onOpenChange, onExited }: ItemProps) {
  const duration = item.duration ?? (item.type === "loading" ? Infinity : item.action ? 7000 : 4000)
  const ref = React.useRef<HTMLLIElement>(null)
  // set by anything the person does to close it; otherwise the timer did
  const byUser = React.useRef(false)
  const userClose = () => {
    byUser.current = true
  }
  const closable = item.closable ?? item.closeButton
  const icon = item.icon ?? TYPE_ICONS[item.type]
  const rich = richColors ? RICH[item.type] : undefined
  const stacked = !!layout
  // a closing snackbar keeps the spot it had while open
  const lastLayout = React.useRef(layout)
  if (item.open) lastLayout.current = layout
  if (!item.open && lastLayout.current && layout) layout = { ...lastLayout.current, expanded: layout.expanded }

  // Stack: enter by transition from below (keyframes would fight the stack transform).
  const [mounted, setMounted] = React.useState(!stacked)
  React.useEffect(() => {
    if (!stacked) return
    const raf = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(raf)
  }, [stacked])

  // Stack: measure the natural height whenever the content changes.
  const report = layout?.report
  React.useLayoutEffect(() => {
    const el = ref.current
    if (!el || !report) return
    const prev = el.style.height
    el.style.height = "auto"
    report(item.id, el.getBoundingClientRect().height)
    el.style.height = prev
  }, [report, item.id, item.message, item.description, item.type, item.action, closable])

  // Remove from the list once the closing animation or transition has finished.
  React.useEffect(() => {
    if (item.open) return
    const el = ref.current
    const done = () => onExited(byUser.current)
    const running = el?.getAnimations().filter((a) => a.playState === "running") ?? []
    if (!running.length) {
      const t = setTimeout(done, stacked ? 220 : 0)
      return () => clearTimeout(t)
    }
    Promise.all(running.map((a) => a.finished)).then(done, done)
  }, [item.open, onExited, stacked])

  // stack geometry
  let style: React.CSSProperties | undefined
  if (layout) {
    const { index, y, expanded, frontH, hidden } = layout
    const scale = expanded ? 1 : 1 - index * 0.05
    const lift = !mounted ? -100 : !item.open ? 0 : y
    style = {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 100 - index,
      height: !expanded && index > 0 ? frontH : undefined,
      transform: `translateY(${!mounted ? "100%" : `${-lift}px`}) scale(${!item.open ? scale * 0.96 : scale})`,
      transformOrigin: "bottom center",
      opacity: !mounted || !item.open || hidden ? 0 : 1,
      pointerEvents: hidden ? "none" : undefined,
      transition: "transform 519ms var(--ease-spring), opacity 200ms var(--ease-standard), height 519ms var(--ease-spring), background-color 200ms",
    }
  }

  return (
    <ToastPrimitive.Root
      ref={ref}
      data-slot="snackbar"
      data-type={item.type}
      data-rich={rich ? true : undefined}
      data-front={layout ? layout.index === 0 || undefined : undefined}
      open={item.open}
      onOpenChange={onOpenChange}
      duration={duration === Infinity ? 2147483647 : duration}
      type={item.urgent || item.type === "error" ? "foreground" : "background"}
      onEscapeKeyDown={userClose}
      onSwipeEnd={userClose}
      forceMount
      style={style}
      className={cn(
        "group/snackbar flex min-h-12 w-full flex-wrap items-center gap-x-2 overflow-hidden rounded-lg py-1.5 pr-2 pl-4 shadow-e3",
        rich ?? "bg-inverse-surface text-inverse-foreground [--snackbar-accent:var(--inverse-primary)]",
        "[--icon-size:20px] [--icon-opsz:20]",
        !stacked && [
          "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom-4 data-[state=open]:zoom-in-95",
          "data-[state=open]:duration-[519ms] data-[state=open]:ease-(--ease-spring)",
          "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=closed]:duration-150 data-[state=closed]:ease-(--ease-standard)",
        ],
        // swipe to dismiss (the `translate` property composes with the stack's transform)
        "data-[swipe=move]:translate-x-(--radix-toast-swipe-move-x) data-[swipe=cancel]:translate-x-0 data-[swipe=cancel]:transition-[translate] data-[swipe=cancel]:duration-300",
        "data-[swipe=end]:translate-x-[calc(100%+2rem)] data-[swipe=end]:transition-[translate] data-[swipe=end]:duration-200",
        "touch-none select-none motion-reduce:transition-none"
      )}
    >
      {/* tucked snackbars show only their edge, so hide their content */}
      <div
        className={cn(
          "flex min-w-0 flex-1 flex-wrap items-center gap-x-2 transition-opacity duration-200",
          layout && !layout.expanded && layout.index > 0 && "opacity-0"
        )}
      >
        {item.type === "loading" ? (
          <Spinner />
        ) : typeof icon === "string" ? (
          <Icon name={icon as IconName} className={cn("-ml-1 shrink-0", rich ? "text-(--snackbar-accent)" : "opacity-80")} />
        ) : icon ? (
          <span className="-ml-1 grid shrink-0 place-items-center">{icon}</span>
        ) : null}
        {item.description ? (
          <div className="flex min-w-0 flex-1 basis-[max-content] flex-col gap-0.5 py-2.5">
            <ToastPrimitive.Title className="type-title-sm text-pretty">{item.message}</ToastPrimitive.Title>
            <ToastPrimitive.Description className="type-body-sm text-pretty opacity-75">{item.description}</ToastPrimitive.Description>
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
                  "state-layer h-9 cursor-pointer rounded-full px-3 type-label-lg text-(--snackbar-accent)",
                  rich && "font-semibold underline-offset-4 hover:underline",
                  "outline-none focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-(--snackbar-accent)"
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
                  "state-layer grid size-9 cursor-pointer place-items-center rounded-full",
                  "outline-none focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-(--snackbar-accent)"
                )}
              >
                <Icon name="close" />
              </ToastPrimitive.Close>
            )}
          </div>
        )}
      </div>
    </ToastPrimitive.Root>
  )
}

/** Indeterminate spinner for loading snackbars. */
function Spinner() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className="-ml-1 size-5 shrink-0 animate-spin opacity-80 [animation-duration:900ms]">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2.5" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}

/** Sonner's name and defaults: stacks, like sonner. Pass stack={false} for the Material queue. */
function Toaster({ stack = true, ...props }: SnackbarsProps) {
  return <Snackbars stack={stack} {...props} />
}

export { Snackbars, Toaster, snackbar, toast, type SnackbarOptions, type SnackbarsProps, type SnackbarType, type SnackbarId }
