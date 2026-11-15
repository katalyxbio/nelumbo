"use client"

import * as React from "react"
import { dateMatchModifiers, type DateRange, type Matcher } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Field, type FieldProps } from "@/registry/velvet/ui/field"
import { Calendar } from "@/registry/velvet/ui/calendar"
import { IconButton } from "@/registry/velvet/ui/icon-button"
import { Button } from "@/registry/velvet/ui/button"
import { Icon } from "@/registry/velvet/ui/icon"
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from "@/registry/velvet/ui/popover"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/registry/velvet/ui/dialog"

/**
 * Velvet DatePicker and DateRangePicker (Material 3 "docked" pickers)
 *
 *   <DatePicker label="Due date" value={date} onValueChange={setDate} />
 *   <DateRangePicker label="Stay" value={range} onValueChange={setRange} presets={...} />
 *
 * DatePicker is a field you can type into, in the locale's numeric order
 * (MM/DD/YYYY in en-US, DD.MM.YYYY in de-DE); separators fill themselves
 * in. The calendar button opens a Calendar under the field. A date is
 * accepted once it's complete and allowed; a wrong one is flagged on blur.
 *
 * DateRangePicker opens two months side by side (one on a phone), with
 * optional presets ("Last 7 days"). The range is a draft until Apply, so
 * looking around doesn't change the value. Once a start date is picked,
 * hovering a later day previews the range up to it. Under 640px wide the
 * picker opens as a full-screen dialog instead of a popover: presets as
 * scrolling chips, months stacked and scrollable, and Cancel / Save pinned
 * at the bottom. (Decided when it opens, so there is no hydration mismatch.)
 *
 * Both take the field props (label, variant, size, icon, description,
 * error), `min` and `max`, `disabledDays` (any DayPicker matcher, e.g.
 * `{ dayOfWeek: [0, 6] }`), `locale` (a BCP 47 tag) and `weekStartsOn`.
 * `name` submits the value as YYYY-MM-DD (a range as name[from], name[to]).
 */

type Part = "day" | "month" | "year"
const LEN: Record<Part, number> = { day: 2, month: 2, year: 4 }
const HINT: Record<Part, string> = { day: "DD", month: "MM", year: "YYYY" }

/** The locale's numeric date order and separator. */
function dateShape(lang: string) {
  const parts = new Intl.DateTimeFormat(lang, { year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date(2026, 10, 15))
  const order = parts.filter((p) => p.type === "day" || p.type === "month" || p.type === "year").map((p) => p.type) as Part[]
  const sep = (parts.find((p) => p.type === "literal")?.value ?? "/").trim() || "/"
  return { order: order.length === 3 ? order : (["month", "day", "year"] as Part[]), sep }
}

const pad = (n: number, l: number) => String(n).padStart(l, "0")
const iso = (d: Date) => `${pad(d.getFullYear(), 4)}-${pad(d.getMonth() + 1, 2)}-${pad(d.getDate(), 2)}`
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())

function formatNumeric(d: Date, shape: ReturnType<typeof dateShape>) {
  const v: Record<Part, number> = { day: d.getDate(), month: d.getMonth() + 1, year: d.getFullYear() }
  return shape.order.map((p) => pad(v[p], LEN[p])).join(shape.sep)
}

/** Digits in, separators added after each full part (not when deleting). */
function mask(text: string, shape: ReturnType<typeof dateShape>, deleting: boolean) {
  let digits = text.replace(/\D/g, "").slice(0, 8)
  let out = ""
  for (let i = 0; i < shape.order.length && digits; i++) {
    const n = LEN[shape.order[i]]
    out += digits.slice(0, n)
    digits = digits.slice(n)
    const full = out.replace(/\D/g, "").length === shape.order.slice(0, i + 1).reduce((s, p) => s + LEN[p], 0)
    if (full && i < shape.order.length - 1 && (digits || !deleting)) out += shape.sep
  }
  return out
}

function parse(text: string, shape: ReturnType<typeof dateShape>): Date | null {
  const digits = text.replace(/\D/g, "")
  if (digits.length !== 8) return null
  const v = {} as Record<Part, number>
  let i = 0
  for (const p of shape.order) {
    v[p] = Number(digits.slice(i, i + LEN[p]))
    i += LEN[p]
  }
  const d = new Date(v.year, v.month - 1, v.day)
  return d.getFullYear() === v.year && d.getMonth() === v.month - 1 && d.getDate() === v.day ? d : null
}

function useControllable<T>(value: T | undefined, initial: T, onChange?: (v: T) => void) {
  const [own, setOwn] = React.useState(initial)
  const controlled = value !== undefined
  const current = controlled ? value : own
  const set = React.useCallback(
    (v: T) => {
      if (!controlled) setOwn(v)
      onChange?.(v)
    },
    [controlled, onChange]
  )
  return [current, set] as const
}

type Limits = { min?: Date; max?: Date; disabledDays?: Matcher | Matcher[] }

function limitsMatchers({ min, max, disabledDays }: Limits): Matcher[] {
  const m: Matcher[] = []
  if (min) m.push({ before: startOfDay(min) })
  if (max) m.push({ after: startOfDay(max) })
  if (disabledDays) m.push(...(Array.isArray(disabledDays) ? disabledDays : [disabledDays]))
  return m
}

/* ------------------------------------------------------------- DatePicker */

type DatePickerProps = Omit<FieldProps, "trailing"> &
  Limits & {
    value?: Date | null
    defaultValue?: Date | null
    onValueChange?: (date: Date | null) => void
    /** BCP 47 tag for the typed format and the calendar's month names. */
    locale?: string
    weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6
    name?: string
    required?: boolean
    disabled?: boolean
    id?: string
    className?: string
    /** Hint shown while typing; defaults to the format, e.g. MM/DD/YYYY. */
    placeholder?: string
    "aria-label"?: string
  }

function DatePicker({
  value: valueProp,
  defaultValue = null,
  onValueChange,
  min,
  max,
  disabledDays,
  locale = "en-US",
  weekStartsOn,
  name,
  required,
  disabled,
  id,
  className,
  placeholder,
  error,
  label,
  variant,
  size,
  icon,
  description,
  "aria-label": ariaLabel,
}: DatePickerProps) {
  const shape = React.useMemo(() => dateShape(locale), [locale])
  const [value, setValue] = useControllable<Date | null>(valueProp, defaultValue, onValueChange)
  const [text, setText] = React.useState(() => (value ? formatNumeric(value, shape) : ""))
  const [problem, setProblem] = React.useState<string | null>(null)
  const [open, setOpen] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const popId = React.useId()
  const matchers = React.useMemo(() => limitsMatchers({ min, max, disabledDays }), [min, max, disabledDays])
  const hint = shape.order.map((p) => HINT[p]).join(shape.sep)
  const long = new Intl.DateTimeFormat(locale, { dateStyle: "long" })

  // follow outside changes to the value
  const shown = value ? value.getTime() : null
  React.useEffect(() => {
    const parsed = parse(inputRef.current?.value ?? "", shape)
    if ((parsed?.getTime() ?? null) !== shown) setText(shown === null ? "" : formatNumeric(new Date(shown), shape))
    if (shown !== null) setProblem(null)
  }, [shown, shape])

  const allowed = (d: Date) => !dateMatchModifiers(d, matchers)
  const why = (d: Date) => {
    if (min && d < startOfDay(min)) return `Choose ${long.format(min)} or later.`
    if (max && d > startOfDay(max)) return `Choose ${long.format(max)} or earlier.`
    return "That date isn't available."
  }

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const deleting = e.target.value.length < text.length
    const next = mask(e.target.value, shape, deleting)
    setText(next)
    setProblem(null)
    if (!next) return setValue(null)
    const d = parse(next, shape)
    if (d && allowed(d)) setValue(d)
  }

  const onBlur = () => {
    if (!text) return setProblem(null)
    const d = parse(text, shape)
    if (!d) setProblem(`Enter a date as ${hint}.`)
    else if (!allowed(d)) setProblem(why(d))
    else setText(formatNumeric(d, shape))
  }

  const pick = (d: Date | undefined) => {
    if (!d) return
    setValue(d)
    setText(formatNumeric(d, shape))
    setProblem(null)
    setOpen(false)
    requestAnimationFrame(() => inputRef.current?.focus())
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Field
        {...{ label, variant, size, icon, id, className, disabled }}
        description={description ?? (label ? hint : undefined)}
        error={error ?? problem ?? undefined}
        placeholder={placeholder ?? hint}
        trailing={
          // a plain button rather than PopoverTrigger: the popover anchors to the whole field
          <IconButton
            icon="calendar_today"
            size="sm"
            label={value ? `Choose date, ${long.format(value)}` : "Choose date"}
            disabled={disabled}
            aria-haspopup="dialog"
            aria-expanded={open}
            aria-controls={open ? popId : undefined}
            onClick={() => setOpen((o) => !o)}
          />
        }
      >
        {(control) => (
          <>
            <input
              ref={inputRef}
              {...control}
              type="text"
              inputMode="numeric"
              autoComplete="off"
              aria-label={ariaLabel}
              required={required}
              value={text}
              onChange={onChange}
              onBlur={onBlur}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown" && e.altKey) {
                  e.preventDefault()
                  setOpen(true)
                }
              }}
            />
            <PopoverAnchor asChild>
              <span aria-hidden className="pointer-events-none absolute inset-0" />
            </PopoverAnchor>
            {name && <input type="hidden" name={name} value={value ? iso(value) : ""} />}
          </>
        )}
      </Field>
      <PopoverContent
        id={popId}
        align="start"
        className="max-h-(--radix-popover-content-available-height) w-auto overflow-y-auto overscroll-contain p-3"
        onOpenAutoFocus={(e) => e.preventDefault()}
        // without a PopoverTrigger, send focus back to the field ourselves
        onCloseAutoFocus={(e) => {
          e.preventDefault()
          inputRef.current?.focus()
        }}
        // clicks on the field (its calendar button included) are handled there
        onInteractOutside={(e) => {
          const t = e.target as Node | null
          if (t && inputRef.current?.closest("[data-slot=field-container]")?.contains(t)) e.preventDefault()
        }}
        aria-label={label ? `${label}: calendar` : "Calendar"}
      >
        <Calendar
          mode="single"
          autoFocus
          selected={value ?? undefined}
          onSelect={pick}
          disabled={matchers}
          startMonth={min}
          endMonth={max}
          weekStartsOn={weekStartsOn}
          lang={locale}
        />
      </PopoverContent>
    </Popover>
  )
}

/* -------------------------------------------------------- DateRangePicker */

type Preset = { label: string; range: DateRange | (() => DateRange) }

type DateRangePickerProps = Omit<FieldProps, "trailing"> &
  Limits & {
    value?: DateRange | null
    defaultValue?: DateRange | null
    onValueChange?: (range: DateRange | null) => void
    presets?: Preset[]
    locale?: string
    weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6
    /** Months shown side by side on wider screens (phones show one). */
    numberOfMonths?: number
    name?: string
    disabled?: boolean
    id?: string
    className?: string
    placeholder?: string
  }

function useNarrow() {
  const [narrow, setNarrow] = React.useState(false)
  React.useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)")
    const on = () => setNarrow(mq.matches)
    on()
    mq.addEventListener("change", on)
    return () => mq.removeEventListener("change", on)
  }, [])
  return narrow
}

function DateRangePicker({
  value: valueProp,
  defaultValue = null,
  onValueChange,
  presets,
  min,
  max,
  disabledDays,
  locale = "en-US",
  weekStartsOn,
  numberOfMonths = 2,
  name,
  disabled,
  id,
  className,
  placeholder = "Choose dates",
  error,
  label,
  variant,
  size,
  icon,
  description,
}: DateRangePickerProps) {
  const [value, setValue] = useControllable<DateRange | null>(valueProp, defaultValue, onValueChange)
  const [open, setOpen] = React.useState(false)
  // phones get a full-screen dialog; decided when opening, never during render
  const [full, setFull] = React.useState(false)
  const triggerRef = React.useRef<HTMLButtonElement>(null)
  const [draft, setDraft] = React.useState<DateRange | undefined>(value ?? undefined)
  const [month, setMonth] = React.useState<Date>(() => value?.from ?? new Date())
  const narrow = useNarrow()
  const matchers = React.useMemo(() => limitsMatchers({ min, max, disabledDays }), [min, max, disabledDays])
  const fmt = React.useMemo(() => new Intl.DateTimeFormat(locale, { month: "short", day: "numeric", year: "numeric" }), [locale])

  // ICU versions disagree on thin spaces around the dash; plain spaces render the same on server and client
  const describe = (r?: DateRange | null) => {
    if (!r?.from) return null
    const text = r.to ? fmt.formatRange(r.from, r.to) : `${fmt.format(r.from)} – …`
    return text.replace(/[\u2009\u202f\u00a0]/g, " ")
  }
  const nights = draft?.from && draft.to ? Math.round((startOfDay(draft.to).getTime() - startOfDay(draft.from).getTime()) / 86400000) + 1 : 0

  const onOpenChange = (o: boolean) => {
    if (o) {
      setFull(window.matchMedia("(max-width: 639px)").matches)
      setDraft(value ?? undefined)
      setMonth(value?.from ?? new Date())
    }
    setOpen(o)
  }

  const onSelect = (r: DateRange | undefined, day: Date) => {
    // with a full range (two different days), a new click starts over
    if (draft?.from && draft.to && startOfDay(draft.from).getTime() !== startOfDay(draft.to).getTime()) setDraft({ from: day, to: undefined })
    else setDraft(r)
  }

  const apply = () => {
    setValue(draft?.from ? { from: draft.from, to: draft.to ?? draft.from } : null)
    setOpen(false)
  }

  const shownText = describe(value)
  const months = narrow ? 1 : numberOfMonths
  const unchanged = Boolean(draft?.from) === Boolean(value?.from) && describe(draft) === describe(value)

  // full-screen list: a run of months from a bit before the range (or today), or from `min`
  const anchor = value?.from ?? new Date()
  const listStart = min ? new Date(min.getFullYear(), min.getMonth(), 1) : new Date(anchor.getFullYear(), anchor.getMonth() - 1, 1)
  const listCount = max
    ? Math.min(60, (max.getFullYear() - listStart.getFullYear()) * 12 + max.getMonth() - listStart.getMonth() + 1)
    : 18
  // open scrolled to the month of the current range (or today)
  const scrollTo = React.useCallback(
    (el: HTMLDivElement | null) => {
      if (!el) return
      const target = el.querySelector<HTMLElement>(`[data-day="${iso(anchor)}"]`)
      const month = target?.closest("table")?.parentElement
      if (month) el.scrollTop += month.getBoundingClientRect().top - el.getBoundingClientRect().top
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [open, full]
  )

  const presetList = (cls: string) =>
    presets && presets.length > 0 ? (
      <div role="group" aria-label="Presets" className={cls}>
        {presets.map((p) => {
          const r = typeof p.range === "function" ? p.range() : p.range
          const active = Boolean(draft?.from && draft.to && r.from && r.to && iso(draft.from) === iso(r.from) && iso(draft.to) === iso(r.to))
          return (
            <button
              key={p.label}
              type="button"
              aria-pressed={active}
              onClick={() => {
                setDraft(r)
                if (r.from) setMonth(narrow || !r.to ? r.from : new Date(r.to.getFullYear(), r.to.getMonth() - (months - 1), 1))
              }}
              className={cn(
                "state-layer h-9 shrink-0 cursor-pointer rounded-full px-3 text-left type-label-lg whitespace-nowrap outline-none",
                "focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring",
                active ? "bg-secondary text-secondary-foreground" : "text-foreground"
              )}
            >
              {p.label}
            </button>
          )
        })}
      </div>
    ) : null

  return (
    <Popover open={open && !full} onOpenChange={onOpenChange}>
      <Field
        {...{ label, variant, size, icon, description, error, id, className, disabled }}
        trailing={<Icon name="date_range" className="pointer-events-none me-1 text-muted-foreground" />}
      >
        {/* eslint-disable-next-line @typescript-eslint/no-unused-vars */}
        {({ className: controlClass, placeholder: _p, ...control }) => (
          <>
            <PopoverTrigger asChild>
              <button
                ref={triggerRef}
                type="button"
                data-slot="date-range-trigger"
                data-placeholder={shownText ? undefined : ""}
                data-state={open ? "open" : "closed"}
                className={cn(
                  controlClass,
                  "absolute inset-0 z-[1] flex cursor-pointer items-center rounded-field text-left ps-(--label-x) pe-12",
                  "data-placeholder:text-muted-foreground",
                  label && "data-placeholder:not-data-[state=open]:text-transparent"
                )}
                {...control}
              >
                <span className="truncate">{shownText ?? placeholder}</span>
              </button>
            </PopoverTrigger>
            <span aria-hidden className="flex-1" />
            {name && (
              <>
                <input type="hidden" name={`${name}[from]`} value={value?.from ? iso(value.from) : ""} />
                <input type="hidden" name={`${name}[to]`} value={value?.to ? iso(value.to) : ""} />
              </>
            )}
          </>
        )}
      </Field>
      <PopoverContent
        align="start"
        className="max-h-(--radix-popover-content-available-height) w-auto max-w-[calc(100vw-1rem)] gap-0 overflow-y-auto overscroll-contain p-0"
        aria-label={label ? `${label}: calendar` : "Calendar"}
      >
        <div className="flex flex-col sm:flex-row">
          {presetList("flex gap-1 overflow-x-auto p-2 pb-0 sm:w-44 sm:flex-col sm:overflow-visible sm:pe-0 sm:pb-2")}
          <div className="flex flex-col">
            <div className="flex justify-center p-3">
              <Calendar
                mode="range"
                autoFocus
                selected={draft}
                onSelect={onSelect}
                month={month}
                onMonthChange={setMonth}
                numberOfMonths={months}
                disabled={matchers}
                excludeDisabled
                startMonth={min}
                endMonth={max}
                weekStartsOn={weekStartsOn}
                lang={locale}
              />
            </div>
            {/* stays in view when the popover has to scroll */}
            <div className="sticky bottom-0 z-10 flex items-center gap-2 bg-card px-4 pt-1 pb-3 dark:bg-surface-container-high">
              <p className="flex min-w-0 flex-1 items-baseline gap-3 type-body-md" aria-live="polite">
                <span className="truncate">{describe(draft) ?? <span className="text-muted-foreground">Pick a start date</span>}</span>
                {nights > 1 && (
                  <span className="shrink-0 type-label-md text-muted-foreground">
                    <span className="sr-only">, </span>
                    {nights} days
                  </span>
                )}
              </p>
              {draft?.from && (
                <Button size="sm" variant="ghost" onClick={() => setDraft(undefined)}>
                  Clear
                </Button>
              )}
              <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={apply} disabled={unchanged}>
                Apply
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>

      <Dialog open={open && full} onOpenChange={onOpenChange}>
        <DialogContent
          showCloseButton={false}
          onCloseAutoFocus={(e) => {
            e.preventDefault()
            triggerRef.current?.focus()
          }}
          className="inset-0 h-dvh max-h-none w-full max-w-none translate-none gap-0 rounded-none p-0"
        >
          <div className="flex items-center gap-2 px-2 pt-2 pb-1">
            <DialogClose asChild>
              <IconButton icon="close" label="Close" />
            </DialogClose>
            <div className="min-w-0 flex-1">
              <DialogTitle className="type-title-md">{label ?? "Select dates"}</DialogTitle>
              <DialogDescription className="truncate type-body-md text-muted-foreground" aria-live="polite">
                {describe(draft) ?? "Pick a start date"}
                {nights > 1 && <span>, {nights} days</span>}
              </DialogDescription>
            </div>
          </div>
          {presetList("flex shrink-0 gap-1 overflow-x-auto px-3 py-2 [scrollbar-width:none]")}
          <div ref={scrollTo} className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-4">
            <Calendar
              mode="range"
              autoFocus
              selected={draft}
              onSelect={onSelect}
              month={listStart}
              numberOfMonths={listCount}
              hideNavigation
              disabled={matchers}
              excludeDisabled
              startMonth={min}
              endMonth={max}
              weekStartsOn={weekStartsOn}
              lang={locale}
              className="mx-auto [--cell:min(3rem,calc((100vw-2rem)/7))]"
              classNames={{ months: "relative flex flex-col gap-4", month_caption: "flex h-12 items-center ps-2 type-title-sm" }}
            />
          </div>
          <div className="flex shrink-0 items-center gap-2 bg-card px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] dark:bg-surface-container-high">
            {draft?.from ? (
              <Button variant="ghost" onClick={() => setDraft(undefined)}>
                Clear
              </Button>
            ) : null}
            <span className="flex-1" />
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={apply} disabled={unchanged}>
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Popover>
  )
}


// lets FormItem recognise this control without importing it
DatePicker.formControl = "field" as const
DateRangePicker.formControl = "field" as const

export { DatePicker, DateRangePicker, type DatePickerProps, type DateRangePickerProps, type DateRange }
