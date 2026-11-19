"use client"

import * as React from "react"
import { flushSync } from "react-dom"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Icon } from "@/registry/nelumbo/ui/icon"
import { IconButton } from "@/registry/nelumbo/ui/icon-button"
import { ListItem, type ListItemProps } from "@/registry/nelumbo/ui/list"

/**
 * Nelumbo Search (Material 3 search bar and search view)
 *
 * SearchBar: a full pill on surface-container-high, no border.
 *
 *   <SearchBar label="Search the docs" placeholder="Search" value={q} onValueChange={setQ} />
 *   <SearchBar
 *     leading={<IconButton label="Menu" icon="menu" />}
 *     trailing={<IconButton label="Voice search" icon="mic" />}
 *     avatar={<Avatar name="Maya Kowalski" size="sm" />}
 *   />
 *   <SearchBar size="sm" />
 *
 * - `size`: default 56px, "sm" 48px, "xs" 40px.
 * - `leading`: the search icon by default; pass an IconButton (menu, arrow_back) to
 *   make it a control. `trailing` takes IconButtons, `avatar` an Avatar.
 * - A clear button springs in while there is text. It empties the field and keeps focus.
 * - The wrapper is role="search" named by `label`; the input is type="search" with the
 *   same accessible name. Give each bar on a page its own `label`.
 * - Controlled (`value` / `onValueChange`) or uncontrolled (`defaultValue`). Enter calls `onSubmit`.
 *
 * SearchView: what the bar grows into. On desktop the bar's pill morphs into a docked panel
 * whose height springs with its content; under 640px it opens as a full-screen view with the
 * input on top. The input is a combobox over the results (aria-controls,
 * aria-activedescendant): ArrowUp / ArrowDown move, Enter picks, Escape closes and the
 * focus stays in the field, Shift+Delete removes a recent search.
 *
 *   <SearchView value={q} onValueChange={setQ} open={open} onOpenChange={setOpen} label="Search contacts">
 *     <SearchViewFilters aria-label="Filter results">
 *       <FilterChip selected={f} onSelectedChange={setF}>People</FilterChip>
 *     </SearchViewFilters>
 *     <SearchViewList aria-label="Suggestions">
 *       <SearchViewGroup heading="Recent">
 *         <SearchViewItem icon="history" onSelect={pick} onRemove={() => forget("dialog")}>dialog</SearchViewItem>
 *       </SearchViewGroup>
 *       <SearchViewGroup heading="People">
 *         <SearchViewItem leading={<Avatar name="Maya Kowalski" />} description="Design" onSelect={open}>Maya Kowalski</SearchViewItem>
 *       </SearchViewGroup>
 *       {none && <SearchViewEmpty>No results</SearchViewEmpty>}
 *     </SearchViewList>
 *   </SearchView>
 *
 * - The highlighted row sits on a raised pill that springs from row to row, as in Command.
 * - Rows are Nelumbo List items (icon, avatar, description, meta, trailing).
 * - `SearchField` and `searchFieldClasses` are the shared pill field: Command's input is built on them.
 */

/* ----------------------------------------------------------------------- */
/* helpers                                                                 */

function useControllable<T>(value: T | undefined, defaultValue: T, onChange?: (v: T) => void) {
  const [inner, setInner] = React.useState(defaultValue)
  const controlled = value !== undefined
  const current = controlled ? (value as T) : inner
  const set = React.useCallback(
    (v: T) => {
      if (!controlled) setInner(v)
      onChange?.(v)
    },
    [controlled, onChange]
  )
  return [current, set] as const
}

function useMediaQuery(query: string) {
  return React.useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia(query)
      m.addEventListener("change", cb)
      return () => m.removeEventListener("change", cb)
    },
    () => window.matchMedia(query).matches,
    () => false
  )
}

/** Sets a field's text the way typing would, so React and cmdk see an input event. */
function setNativeValue(input: HTMLInputElement, next: string) {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set
  setter?.call(input, next)
  input.dispatchEvent(new Event("input", { bubbles: true }))
}

function assignRef<T>(ref: React.Ref<T> | undefined, node: T | null) {
  if (typeof ref === "function") ref(node)
  else if (ref) (ref as React.RefObject<T | null>).current = node
}

const reduceMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
const springEase = () =>
  (typeof window !== "undefined" && getComputedStyle(document.documentElement).getPropertyValue("--ease-spring-bouncy").trim()) ||
  "cubic-bezier(0.2, 0, 0, 1)"

/* ----------------------------------------------------------------------- */
/* the shared field                                                        */

const searchFieldClasses = cva(
  [
    "group/search relative flex h-(--search-h) w-full min-w-0 items-center rounded-full text-foreground",
    "transition-[box-shadow,background-color,border-radius] duration-200 ease-(--ease-standard)",
    "outline-none has-[input:disabled]:opacity-40",
    "has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-ring",
  ],
  {
    variants: {
      size: {
        default: "[--search-h:3.5rem] [--icon-size:24px] [--icon-opsz:24]",
        sm: "[--search-h:3rem] [--icon-size:22px] [--icon-opsz:22]",
        xs: "[--search-h:2.5rem] [--icon-size:20px] [--icon-opsz:20]",
      },
      embedded: {
        // a bar: its own tonal pill that lifts a little on hover and focus
        false: "bg-surface-container-high hover:shadow-e1 focus-within:shadow-e1",
        // inside a surface that already draws the pill (SearchView) or a palette
        true: "bg-transparent",
      },
    },
    defaultVariants: { size: "default", embedded: false },
  }
)

/** The text input's own classes: transparent, so the pill shows through. */
const searchInputClasses =
  "h-full min-w-0 flex-1 bg-transparent pr-2 type-body-lg text-foreground outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden"

type SearchFieldProps = Omit<React.ComponentProps<"div">, "children"> &
  VariantProps<typeof searchFieldClasses> & {
    /** Search icon by default. `null` for none. An IconButton makes it a control. */
    leading?: React.ReactNode
    /** Actions after the clear button (IconButtons). */
    trailing?: React.ReactNode
    /** An Avatar at the far end. */
    avatar?: React.ReactNode
    /** Show the clear button. */
    hasValue?: boolean
    onClear?: () => void
    clearLabel?: string
    /** The input. Give it `searchInputClasses`. */
    children: React.ReactNode
  }

function SearchField({
  className,
  size,
  embedded,
  leading,
  trailing,
  avatar,
  hasValue = false,
  onClear,
  clearLabel = "Clear search",
  children,
  ...props
}: SearchFieldProps) {
  return (
    <div data-slot="search-field" data-size={size ?? "default"} className={cn(searchFieldClasses({ size, embedded }), className)} {...props}>
      {leading !== null && (
        <span data-slot="search-field-leading" className="grid size-(--search-h) shrink-0 place-items-center text-muted-foreground group-focus-within/search:text-foreground">
          {leading === undefined ? <Icon name="search" /> : leading}
        </span>
      )}
      {leading === null && <span aria-hidden className="w-4 shrink-0" />}
      {children}
      {/* the clear button's cell grows from zero, so the text never jumps */}
      <span
        data-slot="search-field-clear"
        data-visible={hasValue || undefined}
        aria-hidden={hasValue ? undefined : true}
        inert={!hasValue}
        className={cn(
          "grid shrink-0 grid-cols-[0fr] data-visible:grid-cols-[1fr]",
          "transition-[grid-template-columns] duration-[560ms] ease-(--ease-spring-bouncy) motion-reduce:transition-none"
        )}
      >
        <span
          className={cn(
            "flex min-w-0 items-center overflow-hidden transition-[padding] duration-[560ms] ease-(--ease-spring) motion-reduce:transition-none",
            // with nothing after it, the button sits as far from the end as from the top and bottom
            hasValue && !trailing && !avatar && (size === "default" || size == null ? "pr-2" : "pr-1")
          )}
        >
          <IconButton
            icon="close"
            label={clearLabel}
            size={size === "xs" ? "sm" : "default"}
            tabIndex={hasValue ? 0 : -1}
            onClick={onClear}
            className={cn(
              "focus-visible:-outline-offset-2",
              "scale-50 opacity-0 transition-[scale,opacity] duration-[420ms] ease-(--ease-spring-bouncy) motion-reduce:transition-none",
              hasValue && "scale-100 opacity-100"
            )}
          />
        </span>
      </span>
      {trailing && <span data-slot="search-field-trailing" className="flex shrink-0 items-center gap-0.5 pr-1.5 text-muted-foreground">{trailing}</span>}
      {avatar && <span data-slot="search-field-avatar" className="flex shrink-0 items-center pr-3 pl-1">{avatar}</span>}
    </div>
  )
}

/* ----------------------------------------------------------------------- */
/* SearchBar                                                               */

type SearchBarProps = Omit<React.ComponentProps<"input">, "size" | "value" | "defaultValue" | "type" | "children" | "onSubmit"> &
  Pick<SearchFieldProps, "size" | "leading" | "trailing" | "avatar" | "clearLabel"> & {
    value?: string
    defaultValue?: string
    onValueChange?: (value: string) => void
    /** Enter. */
    onSubmit?: (value: string) => void
    /** Called after the clear button empties the field. */
    onClear?: () => void
    /** Names the search landmark and the input. Defaults to the placeholder, then "Search". */
    label?: string
    /** Goes on the pill. */
    className?: string
  }

function SearchBar({
  className,
  size,
  leading,
  trailing,
  avatar,
  clearLabel,
  value,
  defaultValue = "",
  onValueChange,
  onSubmit,
  onClear,
  label,
  placeholder = "Search",
  onChange,
  onKeyDown,
  ref,
  ...props
}: SearchBarProps) {
  const [text, setText] = useControllable(value, defaultValue, onValueChange)
  const input = React.useRef<HTMLInputElement>(null)
  const name = props["aria-label"] ?? label ?? placeholder ?? "Search"

  return (
    <SearchField
      role="search"
      aria-label={name}
      size={size}
      leading={leading}
      trailing={trailing}
      avatar={avatar}
      clearLabel={clearLabel}
      hasValue={text.length > 0}
      onClear={() => {
        setText("")
        onClear?.()
        input.current?.focus()
      }}
      className={className}
    >
      <input
        {...props}
        ref={(node) => {
          input.current = node
          assignRef(ref, node)
        }}
        data-slot="search-bar-input"
        type="search"
        aria-label={name}
        enterKeyHint="search"
        autoComplete="off"
        placeholder={placeholder}
        value={text}
        onChange={(e) => {
          setText(e.target.value)
          onChange?.(e)
        }}
        onKeyDown={(e) => {
          onKeyDown?.(e)
          if (!e.defaultPrevented && e.key === "Enter") onSubmit?.(text)
        }}
        className={searchInputClasses}
      />
    </SearchField>
  )
}

/* ----------------------------------------------------------------------- */
/* SearchView                                                              */

type RowHandlers = { select: () => void; remove?: () => void }

type ViewContext = {
  listId: string
  activeId: string | null
  setActiveId: (id: string | null) => void
  rows: React.RefObject<Map<string, RowHandlers>>
  pick: (run: () => void) => void
}

const ViewCtx = React.createContext<ViewContext | null>(null)
function useView() {
  const c = React.useContext(ViewCtx)
  if (!c) throw new Error("SearchViewList and its parts must be inside a SearchView")
  return c
}

const FOCUSABLE = "a[href],button:not([disabled]),input:not([disabled]),[tabindex]:not([tabindex='-1'])"

type SearchViewProps = {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  /** Enter with no highlighted result. */
  onSubmit?: (value: string) => void
  size?: SearchFieldProps["size"]
  placeholder?: string
  /** Names the search landmark and the input. */
  label?: string
  /** Shown while closed; the open view always shows a back arrow. */
  leading?: React.ReactNode
  trailing?: React.ReactNode
  avatar?: React.ReactNode
  /** Close the view after a result is picked. Default true. */
  closeOnSelect?: boolean
  /** Filters, results and anything else under the field. */
  children?: React.ReactNode
  className?: string
  inputRef?: React.Ref<HTMLInputElement>
}

function SearchView({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  value,
  defaultValue = "",
  onValueChange,
  onSubmit,
  size,
  placeholder = "Search",
  label = "Search",
  leading,
  trailing,
  avatar,
  closeOnSelect = true,
  children,
  className,
  inputRef,
}: SearchViewProps) {
  const [open, setOpen] = useControllable(openProp, defaultOpen, onOpenChange)
  const [text, setText] = useControllable(value, defaultValue, onValueChange)
  const [activeId, setActiveId] = React.useState<string | null>(null)
  const phone = useMediaQuery("(max-width: 39.99rem)")

  const listId = React.useId()
  const wrapper = React.useRef<HTMLDivElement>(null)
  const surface = React.useRef<HTMLDivElement>(null)
  const input = React.useRef<HTMLInputElement>(null)
  const rows = React.useRef(new Map<string, RowHandlers>())
  // focusing the field on purpose (after a pick, Escape, back) must not reopen the view
  const quiet = React.useRef(false)
  const closing = React.useRef(false)

  const focusField = () => {
    const el = input.current
    if (!el || document.activeElement === el) return
    quiet.current = true
    el.focus()
    quiet.current = false
  }

  const show = () => {
    if (!open && !closing.current) setOpen(true)
  }

  const hide = (returnFocus = true) => {
    if (!open || closing.current) return
    setActiveId(null)
    if (returnFocus) focusField()
    const el = surface.current
    const box = wrapper.current
    if (phone && el && box && !reduceMotion()) {
      // fold the full-screen view back into the bar
      const r = box.getBoundingClientRect()
      closing.current = true
      const anim = el.animate(
        [
          { clipPath: "inset(0px 0px 0px 0px round 0px)" },
          { clipPath: `inset(${r.top}px ${innerWidth - r.right}px ${innerHeight - r.bottom}px ${r.left}px round ${r.height / 2}px)` },
        ],
        { duration: 320, easing: "cubic-bezier(0.2, 0, 0, 1)", fill: "forwards" }
      )
      const done = () => {
        flushSync(() => setOpen(false))
        anim.cancel()
        closing.current = false
      }
      anim.finished.then(done, done)
    } else {
      setOpen(false)
    }
  }

  // phone: the bar grows into the full-screen view
  const wasOpen = React.useRef(false)
  React.useLayoutEffect(() => {
    const el = surface.current
    const box = wrapper.current
    if (open && !wasOpen.current && phone && el && box && !reduceMotion()) {
      const r = box.getBoundingClientRect()
      el.animate(
        [
          { clipPath: `inset(${r.top}px ${innerWidth - r.right}px ${innerHeight - r.bottom}px ${r.left}px round ${r.height / 2}px)` },
          { clipPath: "inset(0px 0px 0px 0px round 0px)" },
        ],
        { duration: 520, easing: springEase() }
      )
    }
    wasOpen.current = open
  }, [open, phone])

  // phone: the page behind does not scroll
  React.useEffect(() => {
    if (!(open && phone)) return
    const root = document.documentElement
    const prev = root.style.overflow
    root.style.overflow = "hidden"
    return () => {
      root.style.overflow = prev
    }
  }, [open, phone])

  // desktop: a press outside closes
  React.useEffect(() => {
    if (!open || phone) return
    const onDown = (e: PointerEvent) => {
      if (surface.current && !surface.current.contains(e.target as Node)) hide(false)
    }
    document.addEventListener("pointerdown", onDown)
    return () => document.removeEventListener("pointerdown", onDown)
  })

  // an active row that filtering removed is no longer the active descendant
  React.useEffect(() => {
    if (activeId && !document.getElementById(activeId)) setActiveId(null)
  })

  const options = () =>
    Array.from(document.getElementById(listId)?.querySelectorAll<HTMLElement>('[role="option"]:not([aria-disabled="true"])') ?? [])

  const move = (dir: 1 | -1) => {
    const list = options()
    if (!list.length) return
    const at = list.findIndex((o) => o.id === activeId)
    const next = at === -1 ? (dir === 1 ? 0 : list.length - 1) : (at + dir + list.length) % list.length
    setActiveId(list[next].id)
    list[next].scrollIntoView({ block: "nearest" })
  }

  const ctx = React.useMemo<ViewContext>(
    () => ({
      listId,
      activeId,
      setActiveId,
      rows,
      pick: (run) => {
        run()
        if (closeOnSelect) hide()
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [listId, activeId, closeOnSelect, open, phone]
  )

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing) return
    switch (e.key) {
      case "ArrowDown":
      case "ArrowUp":
        e.preventDefault()
        if (!open) show()
        else move(e.key === "ArrowDown" ? 1 : -1)
        break
      case "Enter": {
        const row = activeId ? rows.current.get(activeId) : undefined
        e.preventDefault()
        if (open && row) ctx.pick(row.select)
        else {
          onSubmit?.(text)
          if (closeOnSelect) hide()
        }
        break
      }
      case "Delete":
      case "Backspace": {
        // Shift+Delete forgets a recent search, like a browser's history list
        const row = activeId ? rows.current.get(activeId) : undefined
        if (e.shiftKey && open && row?.remove) {
          e.preventDefault()
          row.remove()
        }
        break
      }
      case "Escape":
        if (open) {
          e.preventDefault()
          e.stopPropagation()
          hide()
        }
        break
    }
  }

  // phone: Tab cycles inside the full-screen view
  const onSurfaceKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Tab" || !open || !phone || !surface.current) return
    const items = Array.from(surface.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.tabIndex >= 0 && !el.closest("[inert]"))
    if (!items.length) return
    const first = items[0]
    const last = items[items.length - 1]
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }

  // panel height follows its content, with a spring
  const inner = React.useRef<HTMLDivElement>(null)
  const [height, setHeight] = React.useState<number | null>(null)
  React.useLayoutEffect(() => {
    const el = inner.current
    if (!el) return
    const ro = new ResizeObserver(() => setHeight(el.getBoundingClientRect().height))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const barLeading = (
    <span className="grid place-items-center [&>*]:col-start-1 [&>*]:row-start-1">
      <span
        inert={open}
        className={cn(
          "grid place-items-center transition-[scale,opacity,rotate] duration-[420ms] ease-(--ease-spring-bouncy) motion-reduce:transition-none",
          open && "pointer-events-none scale-50 -rotate-90 opacity-0"
        )}
      >
        {leading === undefined ? <Icon name="search" /> : leading}
      </span>
      <span
        inert={!open}
        className={cn(
          "grid place-items-center transition-[scale,opacity,rotate] duration-[420ms] ease-(--ease-spring-bouncy) motion-reduce:transition-none",
          !open && "pointer-events-none scale-50 rotate-90 opacity-0"
        )}
      >
        <IconButton icon="arrow_back" label="Close search" size={size === "xs" ? "sm" : "default"} tabIndex={open ? 0 : -1} onClick={() => hide()} />
      </span>
    </span>
  )

  const sizeVars = size === "sm" ? "[--search-h:3rem]" : size === "xs" ? "[--search-h:2.5rem]" : "[--search-h:3.5rem]"

  return (
    <ViewCtx.Provider value={ctx}>
      <div ref={wrapper} data-slot="search-view" data-open={open || undefined} className={cn("relative h-(--search-h) w-full", sizeVars, className)}>
        <div
          ref={surface}
          data-slot="search-view-surface"
          data-open={open || undefined}
          onKeyDown={onSurfaceKeyDown}
          onBlur={(e) => {
            // Tab out of the docked view closes it (a press outside is handled above)
            if (!phone && open && e.relatedTarget && !surface.current?.contains(e.relatedTarget as Node)) hide(false)
          }}
          onMouseDown={(e) => {
            // dead space inside the view must not steal focus from the field
            if (!(e.target as HTMLElement).closest("input,button,a,[tabindex]")) e.preventDefault()
          }}
          className={cn(
            "flex flex-col overflow-hidden bg-surface-container-high text-foreground",
            "absolute inset-x-0 top-0 z-20 rounded-[calc(var(--search-h)/2)] hover:shadow-e1",
            "transition-[border-radius,box-shadow] duration-[520ms] ease-(--ease-spring) motion-reduce:transition-none",
            "has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-ring",
            // open: a docked panel, or the whole screen on phones
            "data-open:rounded-3xl data-open:shadow-e3 data-open:has-[input:focus-visible]:outline-none",
            "max-sm:data-open:fixed max-sm:data-open:inset-0 max-sm:data-open:z-50 max-sm:data-open:rounded-none max-sm:data-open:shadow-none"
          )}
        >
          <SearchField
            role="search"
            aria-label={label}
            embedded
            size={size}
            leading={barLeading}
            trailing={trailing}
            avatar={avatar}
            hasValue={text.length > 0}
            onClear={() => {
              setText("")
              setActiveId(null)
              input.current?.focus()
            }}
            className="shrink-0 rounded-[inherit] has-[input:focus-visible]:outline-none"
          >
            <input
              ref={(node) => {
                input.current = node
                assignRef(inputRef, node)
              }}
              data-slot="search-view-input"
              type="search"
              role="combobox"
              aria-label={label}
              aria-expanded={open}
              aria-haspopup="listbox"
              aria-controls={listId}
              aria-activedescendant={open ? (activeId ?? undefined) : undefined}
              aria-autocomplete="list"
              autoComplete="off"
              enterKeyHint="search"
              placeholder={placeholder}
              value={text}
              onChange={(e) => {
                setText(e.target.value)
                setActiveId(null)
                show()
              }}
              onFocus={() => {
                if (!quiet.current) show()
              }}
              onClick={show}
              onKeyDown={onKeyDown}
              className={searchInputClasses}
            />
          </SearchField>
          <div
            data-slot="search-view-panel"
            data-state={open ? "open" : "closed"}
            inert={!open}
            style={phone ? undefined : { height: open ? (height ?? "auto") : 0 }}
            className={cn(
              "overflow-x-hidden overflow-y-auto overscroll-contain",
              "transition-[height,visibility] duration-[520ms] ease-(--ease-spring) motion-reduce:transition-none",
              "max-h-[min(28rem,70dvh)] data-[state=closed]:invisible",
              "max-sm:max-h-none max-sm:flex-1 max-sm:data-[state=closed]:hidden"
            )}
          >
            <div ref={inner} className="flex flex-col gap-1 px-2 pt-1 pb-2">
              {children}
            </div>
          </div>
        </div>
      </div>
    </ViewCtx.Provider>
  )
}

/** A row of FilterChips under the field. Give it an aria-label. */
function SearchViewFilters({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      role="group"
      data-slot="search-view-filters"
      className={cn("-mx-1 flex gap-2 overflow-x-auto px-3 py-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden", className)}
      {...props}
    />
  )
}

/**
 * The listbox. The highlighted option sits on a raised pill that springs from row
 * to row (measured like Command's), and follows the list as it filters.
 */
function SearchViewList({ className, children, ...props }: React.ComponentProps<"div">) {
  const { listId, activeId } = useView()
  const own = React.useRef<HTMLDivElement>(null)
  const [pill, setPill] = React.useState<{ y: number; x: number; w: number; h: number; moved: boolean } | null>(null)

  React.useLayoutEffect(() => {
    const list = own.current
    if (!list) return
    let frame = 0
    const measure = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const row = list.querySelector<HTMLElement>('[role="option"][data-active="true"]')
        if (!row || !row.getClientRects().length) return setPill(null)
        const r = row.getBoundingClientRect()
        const o = list.getBoundingClientRect()
        const next = { x: r.left - o.left, y: r.top - o.top, w: r.width, h: r.height }
        setPill((p) => (p && p.x === next.x && p.y === next.y && p.w === next.w && p.h === next.h ? p : { ...next, moved: p !== null }))
      })
    }
    measure()
    const mo = new MutationObserver(measure)
    mo.observe(list, { subtree: true, childList: true, attributes: true, attributeFilter: ["data-active"] })
    const ro = new ResizeObserver(measure)
    ro.observe(list)
    return () => {
      cancelAnimationFrame(frame)
      mo.disconnect()
      ro.disconnect()
    }
  }, [activeId])

  return (
    <div
      ref={own}
      id={listId}
      role="listbox"
      data-slot="search-view-list"
      data-pill={pill ? "" : undefined}
      className={cn("group/search-list relative isolate flex flex-col gap-0.5 px-2 pb-2 outline-none", className)}
      {...props}
    >
      <div
        aria-hidden
        data-slot="search-view-indicator"
        className={cn(
          "pointer-events-none absolute top-0 left-0 -z-10 rounded-xl bg-surface-container-lowest shadow-e1 dark:bg-surface-bright",
          pill?.moved && "transition-[translate,width,height] duration-[420ms] ease-(--ease-spring-bouncy) motion-reduce:transition-none",
          !pill && "hidden"
        )}
        style={pill ? { translate: `${pill.x}px ${pill.y}px`, width: pill.w, height: pill.h } : undefined}
      />
      {children}
    </div>
  )
}

/** A labelled run of options: a muted heading, no rule. */
function SearchViewGroup({ heading, className, children, ...props }: Omit<React.ComponentProps<"div">, "children"> & { heading: React.ReactNode; children?: React.ReactNode }) {
  const id = React.useId()
  return (
    <div role="group" aria-labelledby={id} data-slot="search-view-group" className={cn("flex flex-col gap-0.5 [&+&]:mt-1", className)} {...props}>
      <div id={id} className="px-4 pt-3 pb-1 type-label-lg text-muted-foreground">
        {heading}
      </div>
      {children}
    </div>
  )
}

type SearchViewItemProps = Omit<ListItemProps, "onClick" | "href" | "asChild" | "selected" | "onSelect"> & {
  /** Runs on Enter or click. */
  onSelect?: () => void
  /** Adds a remove button (and Shift+Delete) for entries like recent searches. */
  onRemove?: () => void
  /** Accessible name of the remove button. */
  removeLabel?: string
}

/** One result: a Nelumbo ListItem as a listbox option. */
function SearchViewItem({ className, onSelect, onRemove, removeLabel, disabled, trailing, children, ...props }: SearchViewItemProps) {
  const { activeId, setActiveId, rows, pick } = useView()
  const id = React.useId()
  const active = activeId === id && !disabled
  const select = React.useRef(onSelect)
  const remove = React.useRef(onRemove)
  select.current = onSelect
  remove.current = onRemove

  React.useEffect(() => {
    if (disabled) return
    const map = rows.current
    map.set(id, { select: () => select.current?.(), remove: onRemove ? () => remove.current?.() : undefined })
    return () => {
      map.delete(id)
    }
  }, [id, rows, disabled, !!onRemove]) // eslint-disable-line react-hooks/exhaustive-deps

  const name = typeof children === "string" ? children : undefined

  const option = (
    <ListItem
      id={id}
      role="option"
      aria-selected={active}
      aria-disabled={disabled || undefined}
      data-active={active}
      disabled={disabled}
      onPointerMove={() => !disabled && activeId !== id && setActiveId(id)}
      onClickCapture={() => {
        if (!disabled) pick(() => select.current?.())
      }}
      trailing={trailing}
      className={cn(
        "cursor-pointer rounded-xl",
        onRemove && "pr-14",
        // the row fills itself until the list's sliding pill is measured
        "data-[active=true]:bg-surface-container-lowest data-[active=true]:shadow-e1 dark:data-[active=true]:bg-surface-bright",
        "group-data-pill/search-list:data-[active=true]:bg-transparent group-data-pill/search-list:data-[active=true]:shadow-none",
        "dark:group-data-pill/search-list:data-[active=true]:bg-transparent",
        // a leading Icon sits on a tile that turns inverse and fills when highlighted
        "[--tile:var(--surface-container-highest)] [&_[data-slot=list-item-icon]]:m-2 [&_[data-slot=list-item-icon]]:rounded-[2px]",
        "[&_[data-slot=list-item-icon]]:bg-(--tile) [&_[data-slot=list-item-icon]]:shadow-[0_0_0_8px_var(--tile)]",
        "[&_[data-slot=list-item-icon]]:transition-[background-color,box-shadow,color,scale,border-radius] [&_[data-slot=list-item-icon]]:duration-[200ms,200ms,200ms,420ms,420ms]",
        "[&_[data-slot=list-item-icon]]:ease-[var(--ease-standard),var(--ease-standard),var(--ease-standard),var(--ease-spring-bouncy),var(--ease-spring)]",
        "data-[active=true]:[--tile:var(--inverse-surface)] data-[active=true]:[&_[data-slot=list-item-icon]]:text-inverse-foreground",
        "data-[active=true]:[&_[data-slot=list-item-icon]]:scale-105 data-[active=true]:[&_[data-slot=list-item-icon]]:rounded-full data-[active=true]:[--icon-fill:1]",
        "motion-reduce:[&_[data-slot=list-item-icon]]:transition-none",
        "[&_[data-slot=list-item-icon]]:[--icon-size:20px] [&_[data-slot=list-item-icon]]:[--icon-opsz:20]",
        className
      )}
      {...props}
    >
      {children}
    </ListItem>
  )

  if (!onRemove) return option
  // The remove button sits beside the option, not inside it: an option's children are
  // presentational, so a control there is unreachable for assistive tech.
  return (
    <div role="presentation" data-slot="search-view-entry" className="relative" onPointerMove={() => !disabled && activeId !== id && setActiveId(id)}>
      {option}
      <IconButton
        data-search-remove=""
        icon="close"
        size="sm"
        label={removeLabel ?? (name ? `Remove ${name}` : "Remove")}
        // a pointer shortcut: keyboard and screen reader users remove with Shift+Delete
        tabIndex={-1}
        aria-hidden
        onClick={() => remove.current?.()}
        className="absolute top-1/2 right-3 z-[1] -translate-y-1/2"
      />
    </div>
  )
}

/**
 * Shown when nothing matches. A disabled, live option, so the listbox stays valid
 * and the message is announced as it changes.
 */
function SearchViewEmpty({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      role="option"
      aria-disabled="true"
      aria-selected="false"
      aria-live="polite"
      data-slot="search-view-empty"
      className={cn("flex flex-col items-center gap-2 py-10 text-center type-body-md text-muted-foreground", className)}
      {...props}
    >
      {children}
    </div>
  )
}

export {
  SearchBar,
  SearchView,
  SearchViewFilters,
  SearchViewList,
  SearchViewGroup,
  SearchViewItem,
  SearchViewEmpty,
  SearchField,
  searchFieldClasses,
  searchInputClasses,
  setNativeValue,
  type SearchBarProps,
  type SearchViewProps,
  type SearchFieldProps,
  type SearchViewItemProps,
}
