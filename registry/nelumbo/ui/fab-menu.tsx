"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { fabVariants } from "@/registry/nelumbo/ui/fab"
import { Icon, type IconName } from "@/registry/nelumbo/ui/icon"

/**
 * Nelumbo FAB Menu: a FAB that fans out into a short list of actions
 * (Material 3 Expressive). There is no shadcn equivalent.
 *
 *   <FabMenu color="brand">
 *     <FabMenuTrigger icon="edit" label="Create" />
 *     <FabMenuContent aria-label="Create">
 *       <FabMenuItem icon="description" onSelect={newNote}>New note</FabMenuItem>
 *       <FabMenuItem icon="checklist" onSelect={newList}>New checklist</FabMenuItem>
 *       <FabMenuItem icon="mic">Voice memo</FabMenuItem>
 *     </FabMenuContent>
 *   </FabMenu>
 *
 *   <FabMenu open={open} onOpenChange={setOpen} scrim side="left" size="sm">...</FabMenu>
 *
 *  - `color`: the same palette as Fab (primary | secondary | brand | surface | solid).
 *    The items are tonal pills from the same family; the open trigger takes the
 *    strong tone of it.
 *  - `size`: sm | default | lg, the Fab sizes. Open, the trigger shrinks to a round close
 *    button (lg 96 -> 56, default 56 -> 48) and its icon turns into a "close" on the spring.
 *  - `side`: where the items go: top (default) | bottom | left | right. `align`:
 *    end (default) | center | start, along the FAB's edge. The item nearest the FAB springs
 *    out first, the rest follow one after another; closing runs it in reverse.
 *  - `scrim`: dims the page behind the menu and closes it on click. The scrim is `fixed`, so
 *    it covers the viewport, or the nearest ancestor with a transform (give your screen
 *    `transform-gpu` to bound it, like the docs phone frame does).
 *  - `open` / `onOpenChange` / `defaultOpen`: controlled or uncontrolled.
 *
 * Built by hand rather than on Radix DropdownMenu. A Radix menu is portalled and positioned
 * by floating-ui; a FAB menu is neither: it stacks in a fixed direction out of a trigger that
 * morphs, must stay inside the screen it belongs to (a phone frame, a transformed container),
 * and has to stay mounted while its items play their exit. The WAI-ARIA menu button pattern
 * is small enough to implement exactly: the trigger has aria-haspopup="menu" and
 * aria-expanded; the content is role="menu" with role="menuitem" children; ArrowDown/Up
 * (and Left/Right) move between items and wrap, Home/End jump, typing a letter jumps to the
 * next item that starts with it, Escape closes and returns focus to the trigger, and so does
 * choosing an item. Tab closes the menu. ArrowUp/ArrowDown on the trigger open it and focus
 * the first/last item.
 *
 * Reduced motion: no travel, scale or rotation; the items only fade.
 */

type Side = "top" | "bottom" | "left" | "right"
type Align = "start" | "center" | "end"
type Color = "primary" | "secondary" | "brand" | "surface" | "solid"
type Size = NonNullable<NonNullable<Parameters<typeof fabVariants>[0]>["size"]>

// trigger / open trigger / item height / item icon
const SIZES: Record<Size, { h: string; open: string; item: string; icon: number }> = {
  sm: { h: "2.5rem", open: "2.5rem", item: "2.5rem", icon: 20 },
  default: { h: "3.5rem", open: "3rem", item: "3rem", icon: 24 },
  lg: { h: "6rem", open: "3.5rem", item: "3.5rem", icon: 24 },
}

// Tonal pills from the FAB's family, and the strong tone the open trigger takes.
const ITEM_COLORS: Record<Color, string> = {
  primary: "bg-primary-container text-primary-container-foreground",
  secondary: "bg-secondary text-secondary-foreground",
  brand: "bg-brand-container text-brand-container-foreground",
  surface: "bg-surface-container-high text-primary dark:bg-surface-container-highest",
  solid: "bg-primary-container text-primary-container-foreground",
}
const OPEN_COLORS: Record<Color, string> = {
  primary: "data-[open]:bg-primary data-[open]:text-primary-foreground",
  secondary: "data-[open]:bg-secondary-foreground data-[open]:text-secondary",
  brand: "data-[open]:bg-brand data-[open]:text-brand-foreground",
  surface: "data-[open]:bg-primary data-[open]:text-primary-foreground",
  solid: "",
}

const keyframes = `
[data-slot=fab-menu-scrim]{transition:opacity 260ms var(--ease-standard);opacity:0}
[data-slot=fab-menu-scrim][data-state=open]{opacity:1}
button[data-slot=fab-menu-trigger]{transition:scale 727ms var(--ease-spring-bouncy),height 480ms var(--ease-spring),min-width 480ms var(--ease-spring),padding 480ms var(--ease-spring),border-radius 480ms var(--ease-spring),box-shadow 200ms var(--ease-standard),background-color 200ms var(--ease-standard),color 200ms var(--ease-standard)}
button[data-slot=fab-menu-trigger]:active:not(:disabled){transition-duration:90ms;transition-timing-function:var(--ease-standard)}
[data-slot=fab-menu-trigger] [data-fm-icon]{transition:rotate 520ms var(--ease-spring-bouncy),opacity 160ms var(--ease-standard),scale 520ms var(--ease-spring-bouncy)}
[data-slot=fab-menu-trigger] [data-fm-icon=add]{rotate:0deg;opacity:1}
[data-slot=fab-menu-trigger] [data-fm-icon=close]{rotate:-135deg;opacity:0;scale:.5}
[data-slot=fab-menu-trigger][data-open] [data-fm-icon=add]{rotate:135deg;opacity:0;scale:.5}
[data-slot=fab-menu-trigger][data-open] [data-fm-icon=close]{rotate:0deg;opacity:1;scale:1}
[data-slot=fab-menu-item-wrap]{transition:translate 560ms var(--ease-spring-bouncy) var(--fm-d),scale 560ms var(--ease-spring-bouncy) var(--fm-d),opacity 200ms var(--ease-standard) var(--fm-d)}
[data-slot=fab-menu-content][data-state=closed] [data-slot=fab-menu-item-wrap]{translate:var(--fm-x) var(--fm-y);scale:.35;opacity:0;transition:translate 240ms var(--ease-standard) var(--fm-x-d),scale 240ms var(--ease-standard) var(--fm-x-d),opacity 160ms var(--ease-standard) var(--fm-x-d)}
[data-slot=fab-menu-content][data-side=top]{--fm-x:0px;--fm-y:calc(var(--fm-k)*(var(--fm-item-h) + .5rem)*.7)}
[data-slot=fab-menu-content][data-side=bottom]{--fm-x:0px;--fm-y:calc(var(--fm-k)*(var(--fm-item-h) + .5rem)*-.7)}
[data-slot=fab-menu-content][data-side=left]{--fm-y:0px;--fm-x:calc(var(--fm-k)*4.5rem*.7)}
[data-slot=fab-menu-content][data-side=right]{--fm-y:0px;--fm-x:calc(var(--fm-k)*4.5rem*-.7)}
@media (prefers-reduced-motion:reduce){
button[data-slot=fab-menu-trigger]{transition:background-color 120ms linear,color 120ms linear}
[data-slot=fab-menu-trigger] [data-fm-icon]{transition:opacity 120ms linear;rotate:0deg!important;scale:1!important}
[data-slot=fab-menu-item-wrap]{transition:opacity 150ms linear!important}
[data-slot=fab-menu-content][data-state=closed] [data-slot=fab-menu-item-wrap]{translate:none;scale:1;opacity:0}
[data-slot=fab-menu-scrim]{transition-duration:120ms}
}
`

type Ctx = {
  open: boolean
  setOpen: (open: boolean) => void
  color: Color
  size: Size
  side: Side
  align: Align
  scrim: boolean
  triggerId: string
  contentId: string
  pendingFocus: React.RefObject<"first" | "last" | null>
  triggerRef: React.RefObject<HTMLButtonElement | null>
  contentRef: React.RefObject<HTMLDivElement | null>
  focusItem: (which: "first" | "last") => void
}
const FabMenuContext = React.createContext<Ctx | null>(null)
function useFabMenu() {
  const c = React.useContext(FabMenuContext)
  if (!c) throw new Error("FabMenu parts must be used inside <FabMenu>")
  return c
}

const ItemIndex = React.createContext({ index: 0, count: 1 })

function useReducedMotion() {
  return React.useCallback(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, [])
}

type FabMenuProps = Omit<React.ComponentProps<"div">, "color"> & {
  color?: Color
  size?: Size
  side?: Side
  align?: Align
  /** Dim the page behind the open menu; a click on it closes the menu. */
  scrim?: boolean
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

function FabMenu({ className, style, color = "primary", size = "default", side = "top", align = "end", scrim = false, open: openProp, defaultOpen = false, onOpenChange, children, ...props }: FabMenuProps) {
  const [inner, setInner] = React.useState(defaultOpen)
  const controlled = openProp !== undefined
  const open = controlled ? openProp : inner
  const triggerRef = React.useRef<HTMLButtonElement | null>(null)
  const contentRef = React.useRef<HTMLDivElement | null>(null)
  const rootRef = React.useRef<HTMLDivElement | null>(null)
  const pendingFocus = React.useRef<"first" | "last" | null>(null)
  const id = React.useId()
  const onOpenChangeRef = React.useRef(onOpenChange)
  onOpenChangeRef.current = onOpenChange

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (!controlled) setInner(next)
      onOpenChangeRef.current?.(next)
    },
    [controlled]
  )

  const focusItem = React.useCallback((which: "first" | "last") => {
    const items = contentRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]:not([aria-disabled="true"])')
    if (!items?.length) return
    items[which === "first" ? 0 : items.length - 1].focus({ preventScroll: true })
  }, [])

  // Escape from anywhere, and a press outside, close the menu.
  React.useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !e.defaultPrevented) {
        e.preventDefault()
        setOpen(false)
        triggerRef.current?.focus({ preventScroll: true })
      }
    }
    const onDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("keydown", onKey)
    document.addEventListener("pointerdown", onDown)
    return () => {
      document.removeEventListener("keydown", onKey)
      document.removeEventListener("pointerdown", onDown)
    }
  }, [open, setOpen])

  // Opening moves focus into the menu: the first item, or the last after ArrowUp on the trigger.
  React.useEffect(() => {
    if (!open) return
    focusItem(pendingFocus.current ?? "first")
    pendingFocus.current = null
  }, [open, focusItem])

  // If the menu closes (also from outside, when controlled) while focus is in it, focus goes back to the trigger.
  React.useEffect(() => {
    if (!open && contentRef.current?.contains(document.activeElement)) triggerRef.current?.focus({ preventScroll: true })
  }, [open])

  const s = SIZES[size]
  const ctx: Ctx = { open, setOpen, color, size, side, align, scrim, triggerId: `${id}-trigger`, contentId: `${id}-menu`, pendingFocus, triggerRef, contentRef, focusItem }

  return (
    <FabMenuContext.Provider value={ctx}>
      <div
        ref={rootRef}
        data-slot="fab-menu"
        data-state={open ? "open" : "closed"}
        data-side={side}
        className={cn("relative inline-grid size-[var(--fm-h)] place-items-center", open && "z-30", className)}
        style={{ "--fm-h": s.h, "--fm-open-h": s.open, "--fm-item-h": s.item, ...style } as React.CSSProperties}
        {...props}
      >
        <style href="nelumbo-fab-menu" precedence="default">
          {keyframes}
        </style>
        {children}
      </div>
    </FabMenuContext.Provider>
  )
}

type FabMenuTriggerProps = Omit<React.ComponentProps<"button">, "color"> & {
  /** Icon while closed. */
  icon?: IconName
  /** Icon while open. */
  closeIcon?: IconName
  /** Accessible name. */
  label?: string
}

function FabMenuTrigger({ className, style, icon = "add", closeIcon = "close", label = "Actions", onClick, onKeyDown, ref, ...props }: FabMenuTriggerProps) {
  const { open, setOpen, color, size, triggerId, contentId, triggerRef, pendingFocus, focusItem } = useFabMenu()
  const s = SIZES[size]
  return (
    <button
      ref={(node) => {
        triggerRef.current = node
        if (typeof ref === "function") ref(node)
        else if (ref) ref.current = node
      }}
      id={triggerId}
      type="button"
      data-slot="fab-menu-trigger"
      data-open={open || undefined}
      aria-haspopup="menu"
      aria-expanded={open}
      aria-controls={open ? contentId : undefined}
      aria-label={label}
      className={cn(fabVariants({ color, size }), OPEN_COLORS[color], "col-start-1 row-start-1 grid place-items-center", className)}
      style={
        {
          ...(open ? { "--fab-h": s.open, "--fab-radius": `calc(${s.open} / 2)`, "--fab-pad": "0px", "--icon-size": "24px", "--icon-opsz": 24 } : { "--fab-pad": "0px" }),
          ...style,
        } as React.CSSProperties
      }
      onClick={(e) => {
        onClick?.(e)
        if (!e.defaultPrevented) setOpen(!open)
      }}
      onKeyDown={(e) => {
        onKeyDown?.(e)
        if (e.defaultPrevented) return
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
          e.preventDefault()
          const which = e.key === "ArrowDown" ? "first" : "last"
          if (open) focusItem(which)
          else {
            pendingFocus.current = which
            setOpen(true)
          }
        }
      }}
      {...props}
    >
      <Icon name={icon} data-fm-icon="add" className="[grid-area:1/1]" />
      <Icon name={closeIcon} data-fm-icon="close" className="[grid-area:1/1]" />
    </button>
  )
}

const POSITION: Record<Side, string> = {
  top: "bottom-full flex-col pb-[calc(var(--fm-inset)+0.5rem)]",
  bottom: "top-full flex-col pt-[calc(var(--fm-inset)+0.5rem)]",
  left: "right-full flex-row pr-[calc(var(--fm-inset)+0.5rem)]",
  right: "left-full flex-row pl-[calc(var(--fm-inset)+0.5rem)]",
}
const CROSS: Record<Side, Record<Align, string>> = {
  top: { end: "right-0 items-end pe-[var(--fm-inset)]", start: "left-0 items-start ps-[var(--fm-inset)]", center: "left-1/2 -translate-x-1/2 items-center" },
  bottom: { end: "right-0 items-end pe-[var(--fm-inset)]", start: "left-0 items-start ps-[var(--fm-inset)]", center: "left-1/2 -translate-x-1/2 items-center" },
  left: { end: "bottom-0 items-center pb-[var(--fm-inset)]", start: "top-0 items-center pt-[var(--fm-inset)]", center: "top-1/2 -translate-y-1/2 items-center" },
  right: { end: "bottom-0 items-center pb-[var(--fm-inset)]", start: "top-0 items-center pt-[var(--fm-inset)]", center: "top-1/2 -translate-y-1/2 items-center" },
}

function FabMenuContent({ className, style, children, onKeyDown, ref, ...props }: React.ComponentProps<"div">) {
  const { open, setOpen, side, align, scrim, triggerId, contentId, contentRef } = useFabMenu()
  const reduced = useReducedMotion()
  const [mounted, setMounted] = React.useState(open)
  const [shown, setShown] = React.useState(false)
  const typed = React.useRef({ text: "", timer: 0 as number | ReturnType<typeof setTimeout> })

  const kids = React.Children.toArray(children).filter(React.isValidElement)
  const count = kids.length

  React.useEffect(() => {
    if (open) {
      setMounted(true)
      let r2 = 0
      const r1 = requestAnimationFrame(() => {
        r2 = requestAnimationFrame(() => setShown(true))
      })
      return () => {
        cancelAnimationFrame(r1)
        cancelAnimationFrame(r2)
      }
    }
    setShown(false)
    const t = setTimeout(() => setMounted(false), reduced() ? 170 : 240 + count * 30 + 60)
    return () => clearTimeout(t)
  }, [open, count, reduced])

  if (!mounted && !open) return null

  const items = () => Array.from(contentRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]:not([aria-disabled="true"])') ?? [])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(e)
    if (e.defaultPrevented) return
    const list = items()
    const i = list.indexOf(document.activeElement as HTMLElement)
    const go = (n: number) => {
      e.preventDefault()
      list[(n + list.length) % list.length]?.focus({ preventScroll: true })
    }
    switch (e.key) {
      case "ArrowDown":
      case "ArrowRight":
        return go(i + 1)
      case "ArrowUp":
      case "ArrowLeft":
        return go(i < 0 ? list.length - 1 : i - 1)
      case "Home":
        return go(0)
      case "End":
        return go(list.length - 1)
      case "Tab":
        e.preventDefault()
        setOpen(false)
        document.getElementById(triggerId)?.focus({ preventScroll: true })
        return
    }
    // typeahead
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey && e.key !== " ") {
      const t = typed.current
      clearTimeout(t.timer)
      t.text += e.key.toLowerCase()
      t.timer = setTimeout(() => (t.text = ""), 700)
      const labels = list.map((el) => (el.querySelector("[data-slot=fab-menu-item-label]")?.textContent ?? el.textContent ?? "").trim().toLowerCase())
      const start = t.text.length > 1 ? Math.max(i, 0) : i + 1
      for (let n = 0; n < list.length; n++) {
        const idx = (start + n) % list.length
        if (labels[idx].startsWith(t.text)) {
          list[idx].focus({ preventScroll: true })
          break
        }
      }
    }
  }

  const state = open && shown ? "open" : "closed"
  return (
    <>
      {scrim && <FabMenuScrim open={open} shown={shown} onClose={() => setOpen(false)} />}
      <div
        ref={(node) => {
          contentRef.current = node
          if (typeof ref === "function") ref(node)
          else if (ref) ref.current = node
        }}
        id={contentId}
        role="menu"
        aria-labelledby={triggerId}
        aria-orientation={side === "left" || side === "right" ? "horizontal" : "vertical"}
        data-slot="fab-menu-content"
        data-state={state}
        data-side={side}
        data-align={align}
        inert={!open || undefined}
        className={cn("absolute z-10 flex gap-2", POSITION[side], CROSS[side][align], !open && "pointer-events-none", className)}
        style={{ "--fm-inset": `calc((var(--fm-h) - var(--fm-open-h)) / 2)`, ...style } as React.CSSProperties}
        onKeyDown={handleKeyDown}
        {...props}
      >
        {kids.map((child, index) => {
          // distance from the FAB decides who springs out first
          const near = side === "top" || side === "left" ? count - 1 - index : index
          const origin = `${side === "left" ? "right" : side === "right" ? "left" : align === "end" ? "right" : align === "start" ? "left" : "center"} ${side === "top" ? "bottom" : side === "bottom" ? "top" : "center"}`
          return (
            <div
              key={(child.key as React.Key) ?? index}
              role="none"
              data-slot="fab-menu-item-wrap"
              className="flex"
              style={
                {
                  "--fm-k": near + 1,
                  "--fm-d": `${near * 45}ms`,
                  "--fm-x-d": `${(count - 1 - near) * 30}ms`,
                  transformOrigin: origin,
                } as React.CSSProperties
              }
            >
              <ItemIndex.Provider value={{ index, count }}>{child}</ItemIndex.Provider>
            </div>
          )
        })}
      </div>
    </>
  )
}

function FabMenuScrim({ open, shown, onClose }: { open: boolean; shown: boolean; onClose: () => void }) {
  return (
    <span
      aria-hidden
      data-slot="fab-menu-scrim"
      data-state={open && shown ? "open" : "closed"}
      className={cn("fixed inset-0 -z-10 bg-background/70 backdrop-blur-[3px]", !open && "pointer-events-none")}
      onClick={onClose}
    />
  )
}

type FabMenuItemProps = Omit<React.ComponentProps<"button">, "color"> & {
  icon: IconName
  /** Called when the item is chosen. Call `event.preventDefault()` to keep the menu open. */
  onSelect?: (event: Event) => void
  disabled?: boolean
}

function FabMenuItem({ className, icon, children, onSelect, onClick, disabled, ...props }: FabMenuItemProps) {
  const { color, size, setOpen, triggerRef } = useFabMenu()
  return (
    <button
      type="button"
      role="menuitem"
      tabIndex={-1}
      data-slot="fab-menu-item"
      aria-disabled={disabled || undefined}
      className={cn(
        "tactile state-layer inline-flex cursor-pointer items-center gap-3 rounded-full whitespace-nowrap shadow-e2 outline-none select-none hover:shadow-e3 active:shadow-e2",
        "h-[var(--fm-item-h)] ps-4 pe-5 type-label-lg [--icon-opsz:24] [--icon-size:24px] [--press-scale:0.96]",
        size === "sm" && "ps-3 pe-4 [--icon-opsz:20] [--icon-size:20px]",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        "aria-disabled:pointer-events-none aria-disabled:opacity-40",
        ITEM_COLORS[color],
        className
      )}
      onClick={(e) => {
        if (disabled) return e.preventDefault()
        onClick?.(e)
        if (e.defaultPrevented) return
        const ev = new Event("select", { cancelable: true })
        onSelect?.(ev)
        if (!ev.defaultPrevented) {
          setOpen(false)
          triggerRef.current?.focus({ preventScroll: true })
        }
      }}
      {...props}
    >
      <Icon name={icon} />
      <span data-slot="fab-menu-item-label">{children}</span>
    </button>
  )
}

export { FabMenu, FabMenuTrigger, FabMenuContent, FabMenuItem, type FabMenuProps, type FabMenuTriggerProps, type FabMenuItemProps }
