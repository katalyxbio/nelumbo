"use client"

import * as React from "react"
import { Popover as PopoverPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { Field, type FieldProps } from "@/registry/velvet/ui/field"
import { Icon, type IconName } from "@/registry/velvet/ui/icon"
import { IconButton } from "@/registry/velvet/ui/icon-button"
import { Spinner } from "@/registry/velvet/ui/button"
import { menuItem, menuItemSelected, menuPad } from "@/registry/velvet/ui/dropdown-menu"
import { floatingSurface } from "@/registry/velvet/ui/popover"

/**
 * Velvet Combobox: a text field you type into to filter a list of options.
 *
 *   <Combobox label="Country" options={countries} value={country} onValueChange={setCountry} />
 *   <Combobox multiple label="Labels" options={labels} value={picked} onValueChange={setPicked} />
 *
 * It's the same field as Input and Select, and the list is the same list as
 * Select's. Typing filters (ignoring case and accents) and bolds the matched
 * part of each option.
 *
 * - `multiple`: chosen options become chips inside the field. The field grows
 *   when they wrap, the list stays open while you pick, and Backspace in the
 *   empty input removes the last chip.
 * - Nested: give an option `children` and it opens a panel of its own, with a
 *   back row at the top. Typing searches every level at once and lists the
 *   matches under their path ("Europe › Nordics").
 * - `iconPosition="end"` puts option icons at the far end, opposite the label
 *   (per option, or for the whole list).
 * - Async: pass `filter={false}`, fetch in `onInputValueChange`, and set
 *   `loading` while you wait.
 *
 * Keyboard (ARIA combobox pattern):
 * - The input keeps focus the whole time.
 * - ↑ and ↓ move through the options; Enter picks one.
 * - → or Enter opens a nested panel; ← goes back.
 * - Escape closes the list and puts back the chosen value.
 * - Alt+↓ opens the list without moving.
 */

type ComboboxOption = {
  value: string
  label: string
  description?: React.ReactNode
  icon?: IconName
  /** Overrides the Combobox's iconPosition for this option. */
  iconPosition?: "start" | "end"
  disabled?: boolean
  /** Options with the same group are listed together under it. */
  group?: string
  /** Extra words that should match, e.g. a country's code. */
  keywords?: string[]
  /** Makes this option a parent: it opens a nested panel instead of being chosen. */
  children?: readonly (ComboboxOption | string)[]
}

type ComboboxBaseProps = Omit<FieldProps, "trailing"> & {
  options: readonly (ComboboxOption | string)[]
  placeholder?: string
  /** Shown when nothing matches. */
  emptyMessage?: React.ReactNode
  /** Controlled text in the input. */
  inputValue?: string
  onInputValueChange?: (text: string) => void
  /** `false` turns off local filtering (filter on the server instead), or pass your own test. */
  filter?: false | ((option: ComboboxOption, query: string) => boolean)
  /** Shows a spinner while options load. */
  loading?: boolean
  /** Where option icons go: before the label, or at the far end. Default "start". */
  iconPosition?: "start" | "end"
  /** Show a clear button once there's a value. Default true. */
  clearable?: boolean
  disabled?: boolean
  required?: boolean
  /** Submits the value (or one value per chip) with a form. */
  name?: string
  id?: string
  className?: string
  autoFocus?: boolean
  "aria-label"?: string
}

type ComboboxSingleProps = ComboboxBaseProps & {
  multiple?: false
  value?: string | null
  defaultValue?: string | null
  onValueChange?: (value: string | null) => void
}

type ComboboxMultipleProps = ComboboxBaseProps & {
  multiple: true
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (value: string[]) => void
}

type ComboboxProps = ComboboxSingleProps | ComboboxMultipleProps

/** An option placed in the tree: its ancestors, its normalized children. */
type TreeNode = Omit<ComboboxOption, "children"> & { path: TreeNode[]; kids?: TreeNode[]; back?: true }

// ---------- matching

const strip = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase()

/** Where `query` matches inside `text`, ignoring case and accents, as [start, end) in `text`. */
function findMatch(text: string, query: string): [number, number] | null {
  const q = strip(query.trim())
  if (!q) return null
  let folded = ""
  const at: number[] = [] // folded index -> text index
  let i = 0
  for (const ch of text) {
    const f = strip(ch)
    for (let k = 0; k < f.length; k++) at.push(i)
    folded += f
    i += ch.length
  }
  const start = folded.indexOf(q)
  if (start < 0) return null
  const last = at[start + q.length - 1]
  return [at[start], last + (text.codePointAt(last)! > 0xffff ? 2 : 1)]
}

const defaultFilter = (o: ComboboxOption, q: string) =>
  findMatch(o.label, q) !== null || (o.keywords ?? []).some((k) => findMatch(k, q) !== null)

function Highlight({ text, query }: { text: string; query: string }) {
  const m = query ? findMatch(text, query) : null
  if (!m) return <>{text}</>
  return (
    <>
      {text.slice(0, m[0])}
      <span className="font-semibold">{text.slice(m[0], m[1])}</span>
      {text.slice(m[1])}
    </>
  )
}

function useControllable<T>(value: T | undefined, defaultValue: T, onChange?: (v: T) => void) {
  const [inner, setInner] = React.useState(defaultValue)
  const controlled = value !== undefined
  const current = controlled ? value : inner
  const set = React.useCallback(
    (v: T) => {
      if (!controlled) setInner(v)
      onChange?.(v)
    },
    [controlled, onChange]
  )
  return [current, set] as const
}

function toTree(raw: readonly (ComboboxOption | string)[], path: TreeNode[] = []): TreeNode[] {
  return raw.map((r) => {
    const { children, ...o } = typeof r === "string" ? { value: r, label: r } : r
    const node: TreeNode = { ...o, path }
    if (children) node.kids = toTree(children, [...path, node])
    return node
  })
}

const leavesOf = (nodes: TreeNode[]): TreeNode[] => nodes.flatMap((n) => (n.kids ? leavesOf(n.kids) : [n]))

type Section = { group?: string; items: TreeNode[] }

/** Display sections (by group, in first-seen order) and the same options flat, for the keyboard. */
function arrange(nodes: TreeNode[], groupOf: (n: TreeNode) => string | undefined) {
  const order: (string | undefined)[] = []
  const groups = new Map<string | undefined, TreeNode[]>()
  for (const n of nodes) {
    const g = groupOf(n)
    if (!groups.has(g)) {
      groups.set(g, [])
      order.push(g)
    }
    groups.get(g)!.push(n)
  }
  const sections: Section[] = order.map((g) => ({ group: g, items: groups.get(g)! }))
  return { sections, flat: sections.flatMap((s) => s.items) }
}

const check = (
  <Icon
    name="check"
    weight={600}
    className="text-secondary-foreground! animate-in zoom-in-50 fade-in-0 duration-[396ms] ease-(--ease-spring-bouncy)"
  />
)

// ---------- component

function Combobox(props: ComboboxProps) {
  const {
    label,
    variant = "filled",
    size,
    icon,
    description,
    error,
    options: rawOptions,
    placeholder,
    emptyMessage = "No results",
    inputValue,
    onInputValueChange,
    filter = defaultFilter,
    loading,
    iconPosition = "start",
    clearable = true,
    disabled,
    required,
    name,
    id,
    className,
    autoFocus,
    multiple,
  } = props

  const tree = React.useMemo(() => toTree(rawOptions), [rawOptions])
  const leaves = React.useMemo(() => leavesOf(tree), [tree])
  const byValue = React.useMemo(() => new Map(leaves.map((o) => [o.value, o])), [leaves])
  const nested = leaves.length !== tree.length || tree.some((n) => n.kids)

  // the selection, always as a list
  const [selected, setSelected] = useControllable<string[]>(
    multiple ? props.value : props.value === undefined ? undefined : props.value === null ? [] : [props.value],
    multiple ? (props.defaultValue ?? []) : props.defaultValue ? [props.defaultValue] : [],
    React.useCallback(
      (v: string[]) => (multiple ? (props.onValueChange as ComboboxMultipleProps["onValueChange"])?.(v) : (props.onValueChange as ComboboxSingleProps["onValueChange"])?.(v[0] ?? null)),
      [multiple, props.onValueChange]
    )
  )
  const selectedLabel = !multiple && selected[0] !== undefined ? (byValue.get(selected[0])?.label ?? selected[0]) : ""

  const [text, setTextState] = useControllable(inputValue, selectedLabel, onInputValueChange)
  const [dirty, setDirty] = React.useState(false) // typed since the list opened
  const [open, setOpen] = React.useState(false)
  const [active, setActive] = React.useState(-1)
  const [trail, setTrail] = React.useState<string[]>([]) // values of the parents we're inside
  const [dir, setDir] = React.useState<1 | -1>(1)

  const inputRef = React.useRef<HTMLInputElement>(null)
  const autoId = React.useId()
  const baseId = id ?? autoId
  const listId = `${baseId}-list`
  const optionId = (i: number) => `${baseId}-opt-${i}`

  // keep the text in step with a single selection changed from outside
  React.useEffect(() => {
    if (!multiple && !dirty && inputValue === undefined) setTextState(selectedLabel)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLabel])

  const query = dirty ? text : ""
  const searching = Boolean(query.trim() && filter)

  /** The panel for a trail: a back row (when nested), then that level's options by group. */
  const browse = React.useCallback(
    (t: string[]) => {
      let level = tree
      const parents: TreeNode[] = []
      for (const v of t) {
        const p = level.find((n) => n.value === v && n.kids)
        if (!p) break
        parents.push(p)
        level = p.kids!
      }
      const { sections, flat } = arrange(level, (n) => n.group)
      const parent = parents.at(-1)
      if (!parent) return { sections, flat, parent }
      const back: TreeNode = { value: `${parent.value}::back`, label: parent.label, path: parent.path, back: true }
      return { sections, flat: [back, ...flat], parent, back }
    },
    [tree]
  )

  const view = React.useMemo(() => {
    if (searching && filter) {
      const hit = (n: TreeNode) => filter(n, query)
      const found = leaves.filter((l) => hit(l) || l.path.some(hit))
      return { ...arrange(found, (n) => (n.path.length ? n.path.map((p) => p.label).join(" › ") : n.group)), parent: undefined, back: undefined }
    }
    return browse(trail)
  }, [searching, filter, query, leaves, browse, trail])
  const { flat, sections, parent, back } = view

  const enabledFrom = (list: TreeNode[], start: number, step: 1 | -1) => {
    const n = list.length
    for (let k = 0; k < n; k++) {
      const i = (((start + step * k) % n) + n) % n
      if (!list[i].disabled) return i
    }
    return -1
  }

  /** Index of the first selected option in a panel, else its first real option. */
  const landingIndex = (list: TreeNode[], skipBack: boolean) => {
    const sel = list.findIndex((o) => !o.back && (selected.includes(o.value) || (o.kids && leavesOf(o.kids).some((l) => selected.includes(l.value)))))
    if (sel >= 0) return sel
    return enabledFrom(list, skipBack && list[0]?.back ? 1 : 0, 1)
  }

  const openList = (highlight: "selected" | "last" | "none" = "selected") => {
    if (disabled) return
    // open where the current choice lives
    const sel = !multiple && selected[0] ? byValue.get(selected[0]) : undefined
    const t = sel ? sel.path.map((p) => p.value) : []
    setTrail(t)
    setDir(1)
    setOpen(true)
    const panel = browse(t).flat
    if (highlight === "none") return setActive(-1)
    if (highlight === "last") return setActive(enabledFrom(panel, panel.length - 1, -1))
    setActive(landingIndex(panel, true))
  }

  const enter = (n: TreeNode) => {
    const t = [...n.path.map((p) => p.value), n.value]
    setTrail(t)
    setDir(1)
    if (dirty && text) {
      setTextState(multiple ? "" : selectedLabel)
      setDirty(false)
    }
    setActive(landingIndex(browse(t).flat, true))
  }

  const goBack = () => {
    if (!trail.length) return
    const left = trail.at(-1)!
    const t = trail.slice(0, -1)
    setTrail(t)
    setDir(-1)
    setActive(browse(t).flat.findIndex((o) => o.value === left))
  }

  const close = () => {
    setOpen(false)
    setActive(-1)
    // emptying the text of a single combobox clears it
    if (!multiple && dirty && !text.trim() && selected.length) {
      setSelected([])
      setDirty(false)
      return
    }
    if (dirty || text !== (multiple ? "" : selectedLabel)) setTextState(multiple ? "" : selectedLabel)
    setDirty(false)
  }

  const pick = (o: TreeNode) => {
    if (o.disabled) return
    if (o.back) return goBack()
    if (o.kids) return enter(o)
    if (multiple) {
      setSelected(selected.includes(o.value) ? selected.filter((v) => v !== o.value) : [...selected, o.value])
      if (text) setTextState("")
      setDirty(false)
    } else {
      setSelected([o.value])
      setTextState(o.label)
      setDirty(false)
      setOpen(false)
      setActive(-1)
    }
  }

  const clear = () => {
    setSelected([])
    setTextState("")
    setDirty(false)
    inputRef.current?.focus()
  }

  // after typing (or new async results), keep the highlight on a real option
  React.useEffect(() => {
    if (!open || !dirty) return
    setActive(query.trim() ? enabledFrom(flat, 0, 1) : -1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, rawOptions])

  React.useEffect(() => {
    if (open && active >= 0) document.getElementById(optionId(active))?.scrollIntoView({ block: "nearest" })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, open, trail])

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing) return
    const current = open && active >= 0 ? flat[active] : undefined
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        if (!open) openList(e.altKey ? "none" : "selected")
        else if (!e.altKey) setActive(enabledFrom(flat, active + 1, 1))
        break
      case "ArrowUp":
        e.preventDefault()
        if (e.altKey) close()
        else if (!open) openList("last")
        else setActive(enabledFrom(flat, active < 0 ? flat.length - 1 : active - 1, -1))
        break
      case "ArrowRight":
        // only while browsing: in typed text the arrows move the caret
        if (current?.kids && !current.disabled && !query.trim()) {
          e.preventDefault()
          enter(current)
        }
        break
      case "ArrowLeft":
        if (open && trail.length && !searching && !query.trim()) {
          e.preventDefault()
          goBack()
        }
        break
      case "Enter":
        if (current) {
          e.preventDefault()
          pick(current)
        }
        break
      case "Escape":
        if (open) {
          e.preventDefault()
          e.stopPropagation()
          close()
        }
        break
      case "Backspace":
        if (multiple && !text && selected.length) setSelected(selected.slice(0, -1))
        break
      case "Tab":
        if (open) close()
        break
    }
  }

  const floating = Boolean(label)
  const filled = variant === "filled"
  const hasValue = selected.length > 0 || Boolean(text)
  const results = flat.filter((o) => !o.back).length
  const status = !open
    ? ""
    : dirty && query.trim()
      ? loading
        ? "Loading"
        : results
          ? `${results} ${results === 1 ? "result" : "results"}`
          : String(emptyMessage)
      : parent
        ? `${parent.label}, ${results} ${results === 1 ? "option" : "options"}`
        : ""

  const trailing = (
    <>
      {loading && <Spinner className="mx-1.5 text-muted-foreground [--icon-size:18px]" />}
      {clearable && hasValue && !disabled && (
        <IconButton
          icon="close"
          label={multiple ? "Clear all" : "Clear"}
          size="sm"
          tabIndex={-1}
          onPointerDown={(e) => e.preventDefault()}
          onClick={clear}
          className="text-muted-foreground"
        />
      )}
      <IconButton
        icon="arrow_drop_down"
        label={open ? "Hide options" : "Show options"}
        size="sm"
        tabIndex={-1}
        disabled={disabled}
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        onPointerDown={(e) => e.preventDefault()}
        onClick={() => {
          inputRef.current?.focus()
          if (open) close()
          else openList()
        }}
        className={cn(
          "text-muted-foreground [&_[data-slot=icon]]:transition-[rotate] [&_[data-slot=icon]]:duration-[396ms] [&_[data-slot=icon]]:ease-(--ease-spring)",
          open && "text-primary [&_[data-slot=icon]]:rotate-180"
        )}
      />
    </>
  )

  const inputProps = (control: { id: string; disabled?: boolean; placeholder?: string; "aria-invalid"?: true; "aria-describedby"?: string }) => ({
    ...control,
    // with chips there's no placeholder, so the label stays raised
    placeholder: multiple && selected.length ? undefined : control.placeholder,
    ref: inputRef,
    role: "combobox" as const,
    type: "text",
    autoComplete: "off",
    autoCorrect: "off",
    spellCheck: false,
    autoFocus,
    required: required && selected.length === 0,
    "aria-label": props["aria-label"],
    "aria-autocomplete": "list" as const,
    "aria-expanded": open,
    "aria-controls": open ? listId : undefined,
    "aria-activedescendant": open && active >= 0 ? optionId(active) : undefined,
    value: text,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      setTextState(e.target.value)
      setDirty(true)
      if (!open) {
        setTrail([])
        setOpen(true)
      }
    },
    onClick: () => !open && openList(),
    onKeyDown,
    onBlur: () => open && close(),
  })

  /** How many chosen options sit under a parent, or the chosen one's label. */
  const chosenUnder = (n: TreeNode) => {
    const under = leavesOf(n.kids!).filter((l) => selected.includes(l.value))
    if (!under.length) return null
    return multiple ? String(under.length) : under[0].label
  }

  const row = (o: TreeNode, i: number) => {
    const isSelected = !o.kids && !o.back && selected.includes(o.value)
    const end = (o.iconPosition ?? iconPosition) === "end"
    const iconEl = o.icon && <Icon name={o.icon} />
    const common = {
      id: optionId(i),
      role: "option" as const,
      "data-highlighted": i === active ? "" : undefined,
      onPointerMove: () => !o.disabled && i !== active && setActive(i),
      onClick: () => pick(o),
    }

    if (o.back) {
      return (
        <div
          key={o.value}
          {...common}
          aria-selected={false}
          aria-label={`Back from ${o.label}`}
          data-slot="combobox-back"
          className={cn(menuItem, "mb-1.5 type-title-sm font-medium [&_[data-slot=icon]]:text-foreground!")}
        >
          <Icon name="arrow_back" />
          <span className="truncate">{o.label}</span>
        </div>
      )
    }

    const chosen = o.kids ? chosenUnder(o) : null
    const selectionMark = multiple ? (
      <span
        aria-hidden
        className={cn(
          "grid size-[18px] shrink-0 place-items-center rounded-control border-2 border-muted-foreground transition-colors",
          isSelected && "border-primary bg-primary text-primary-foreground [&_[data-slot=icon]]:text-primary-foreground!"
        )}
      >
        {isSelected && <Icon name="check" weight={700} className="[--icon-size:14px] animate-in zoom-in-50 duration-[396ms] ease-(--ease-spring-bouncy)" />}
      </span>
    ) : (
      <span className="grid size-5 shrink-0 place-items-center">{isSelected && check}</span>
    )
    // single choice: the check takes whichever side the icon doesn't
    // A parent always keeps its icon on the left, so the right side holds only
    // the chevron; the icon takes the slot a leaf uses for its check, keeping labels aligned.
    const lead = o.kids
      ? (iconEl ?? (multiple || end ? <span className="size-5 shrink-0" /> : null))
      : multiple
        ? selectionMark
        : end
          ? selectionMark
          : null

    return (
      <div
        key={o.value}
        {...common}
        aria-selected={isSelected}
        aria-disabled={o.disabled || undefined}
        data-slot={o.kids ? "combobox-parent" : "combobox-item"}
        data-state={isSelected ? "checked" : "unchecked"}
        data-disabled={o.disabled ? "" : undefined}
        className={cn(menuItem, menuItemSelected, o.description && "h-auto min-h-14 py-2")}
      >
        {lead}
        {!end && !o.kids && iconEl}
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate">
            <Highlight text={o.label} query={query} />
            {o.kids && <span className="sr-only">, {chosen ? `${chosen} chosen, ` : ""}has more options</span>}
          </span>
          {o.description && (
            <span className="truncate type-body-sm text-muted-foreground in-data-[state=checked]:text-secondary-foreground/75">
              {o.description}
            </span>
          )}
        </span>
        {o.kids ? (
          <>
            {chosen &&
              (multiple ? (
                <span aria-hidden className="grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1.5 type-label-sm text-primary-foreground tabular-nums">
                  {chosen}
                </span>
              ) : (
                <span aria-hidden className="max-w-[45%] truncate type-body-sm text-muted-foreground">
                  {chosen}
                </span>
              ))}
            <Icon name="chevron_right" className="-me-1" />
          </>
        ) : (
          <>
            {end && iconEl}
            {!multiple && !end && selectionMark}
          </>
        )}
      </div>
    )
  }

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={(o) => !o && close()}>
      <Field
        {...{ label, variant, size, icon, description, error, className, disabled }}
        id={baseId}
        placeholder={placeholder}
        grow={multiple}
        trailing={trailing}
      >
        {({ className: controlClass, ...control }) => (
          <>
            <PopoverPrimitive.Anchor aria-hidden className="pointer-events-none absolute inset-0" />
            {multiple ? (
              <div
                className={cn(
                  "flex min-w-0 flex-1 flex-wrap items-center gap-1.5",
                  filled && floating ? "pt-(--value-pt) pb-(--value-pb)" : "py-2"
                )}
              >
                {selected.map((v) => {
                  const text = byValue.get(v)?.label ?? v
                  return (
                    <span
                      key={v}
                      data-slot="combobox-chip"
                      className="inline-flex h-6 max-w-full min-w-0 items-center gap-0.5 rounded-field bg-secondary ps-2 pe-0.5 type-label-md text-secondary-foreground"
                    >
                      <span className="truncate">{text}</span>
                      {!disabled && (
                        <button
                          type="button"
                          tabIndex={-1}
                          aria-label={`Remove ${text}`}
                          onPointerDown={(e) => e.preventDefault()}
                          onClick={() => {
                            setSelected(selected.filter((x) => x !== v))
                            inputRef.current?.focus()
                          }}
                          className="grid size-5 cursor-pointer place-items-center rounded-[4px] [--icon-size:16px] [--icon-opsz:20] hover:bg-foreground/10"
                        >
                          <Icon name="close" />
                        </button>
                      )}
                    </span>
                  )
                })}
                <input
                  data-slot="combobox-input"
                  {...inputProps(control)}
                  className={cn(
                    "h-6 min-w-8 flex-1 bg-transparent type-body-lg leading-6 text-foreground outline-none placeholder:text-muted-foreground",
                    floating && "placeholder:opacity-0 placeholder:transition-opacity focus:placeholder:opacity-100"
                  )}
                />
              </div>
            ) : (
              <input data-slot="combobox-input" {...inputProps(control)} className={controlClass} />
            )}
            {name &&
              (selected.length ? selected : [""]).map((v, i) => <input key={i} type="hidden" name={name} value={v} />)}
            <span className="sr-only" aria-live="polite" aria-atomic>
              {status}
            </span>
          </>
        )}
      </Field>

      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          data-slot="combobox-content"
          data-nested={nested || undefined}
          side="bottom"
          align="start"
          sideOffset={4}
          collisionPadding={8}
          onOpenAutoFocus={(e) => e.preventDefault()}
          onCloseAutoFocus={(e) => e.preventDefault()}
          onInteractOutside={(e) => {
            // a press on the field itself is not "outside"
            const field = inputRef.current?.closest("[data-slot=field-container]")
            if (field?.contains(e.target as Node)) e.preventDefault()
          }}
          // keep focus in the input while the list is pressed or scrolled
          onPointerDown={(e) => e.preventDefault()}
          // options are reached from the input (aria-activedescendant), never by Tab
          tabIndex={-1}
          className={cn(
            floatingSurface,
            menuPad,
            "max-h-[min(var(--radix-popover-content-available-height),20rem)] w-(--radix-popover-trigger-width) overflow-x-hidden overflow-y-auto overscroll-contain",
            "origin-(--radix-popover-content-transform-origin) scroll-py-1.5"
          )}
        >
          <div
            // a new panel slides in from the side it came from
            key={searching ? "search" : trail.join("/")}
            id={listId}
            role="listbox"
            aria-label={parent ? `${label ?? props["aria-label"] ?? "Options"}: ${parent.label}` : (label ?? props["aria-label"])}
            aria-multiselectable={multiple || undefined}
            className={cn(
              nested && !searching && "animate-in fade-in-0 duration-300 ease-(--ease-spring) motion-reduce:animate-none",
              nested && !searching && (dir === 1 ? "slide-in-from-right-6" : "slide-in-from-left-6")
            )}
          >
            {back && (
              <div className="-mx-1.5 border-b border-outline-variant px-1.5">{row(back, 0)}</div>
            )}
            {sections.map(({ group, items }, si) => {
              const body = items.map((o) => row(o, flat.indexOf(o)))
              if (group === undefined) return <React.Fragment key={`_${si}`}>{body}</React.Fragment>
              const gid = `${baseId}-g-${si}`
              return (
                <div
                  key={group}
                  role="group"
                  aria-labelledby={gid}
                  className={cn((si > 0 || back) && "-mx-1.5 mt-1.5 border-t border-outline-variant px-1.5 pt-1.5", si === 0 && back && "mt-0 border-t-0")}
                >
                  <div id={gid} className="px-3 pt-2 pb-1.5 type-label-md text-muted-foreground">
                    {group}
                  </div>
                  {body}
                </div>
              )
            })}
          </div>
          {!results && (
            <div className="flex h-10 items-center gap-3 px-3 type-body-md text-muted-foreground [--icon-size:18px]">
              {loading ? (
                <>
                  <Spinner /> Loading…
                </>
              ) : (
                emptyMessage
              )}
            </div>
          )}
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
}

export { Combobox, type ComboboxOption, type ComboboxProps }
