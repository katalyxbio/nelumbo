"use client"

import * as React from "react"
import { DayPicker, type DateRange, type DayPickerProps } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Icon } from "@/registry/velvet/ui/icon"

/**
 * Velvet Calendar (Material 3 style, built on react-day-picker like shadcn's)
 *
 *   <Calendar mode="single" selected={date} onSelect={setDate} />
 *   <Calendar mode="range" selected={range} onSelect={setRange} numberOfMonths={2} />
 *
 * Every DayPicker prop works (mode, selected, onSelect, disabled, startMonth,
 * endMonth, locale, weekStartsOn, ...), so shadcn's Calendar code carries over.
 *
 * - Days are 40px circles: the selection is filled, today is outlined, a
 *   range is a soft band between two filled ends.
 * - With one month, the title opens a year grid (as in Material's picker);
 *   `yearPicker={false}` turns that off. With several, each has its title.
 * - Months slide as you page through them (not with reduced motion).
 * - Outside days are hidden by default; `showOutsideDays` shows them.
 */

const CSS = `
.vlv-cal td { position: relative; padding: 0 }
.vlv-cal td::before { content: none; position: absolute; inset: 0; background: var(--secondary) }
.vlv-cal td.vlv-rm::before { content: "" }
.vlv-cal td.vlv-rs::before { content: ""; left: 50% }
.vlv-cal td.vlv-re::before { content: ""; right: 50% }
.vlv-cal td.vlv-rs.vlv-re::before { content: none }
.vlv-cal td.vlv-rm:first-child::before, .vlv-cal td.vlv-re:first-child::before { border-radius: 9999px 0 0 9999px }
.vlv-cal td.vlv-rm:last-child::before, .vlv-cal td.vlv-rs:last-child::before { border-radius: 0 9999px 9999px 0 }
.vlv-cal td.vlv-rm > button { color: var(--secondary-foreground) }
.vlv-cal td[data-selected]:not(.vlv-rm) > button { background: var(--primary); color: var(--primary-foreground) }
.vlv-cal td[data-today]:not([data-selected]) > button { box-shadow: inset 0 0 0 1px var(--foreground); font-weight: 600 }
.vlv-cal td[data-outside] > button { color: var(--muted-foreground) }
.vlv-cal td[data-disabled] > button { opacity: 0.38; cursor: default }
.vlv-cal td[data-disabled] > button::after { display: none }
@keyframes vlv-cal-in-left { from { transform: translateX(-40%); opacity: 0 } }
@keyframes vlv-cal-in-right { from { transform: translateX(40%); opacity: 0 } }
@keyframes vlv-cal-out-left { to { transform: translateX(-40%); opacity: 0 } }
@keyframes vlv-cal-out-right { to { transform: translateX(40%); opacity: 0 } }
@keyframes vlv-cal-fade-in { from { opacity: 0 } }
@keyframes vlv-cal-fade-out { to { opacity: 0 } }
.vlv-cal .vlv-wbe { animation: vlv-cal-in-left 320ms var(--ease-emphasized, ease) forwards }
.vlv-cal .vlv-wae { animation: vlv-cal-in-right 320ms var(--ease-emphasized, ease) forwards }
.vlv-cal .vlv-wbx { animation: vlv-cal-out-left 220ms var(--ease-standard, ease) forwards }
.vlv-cal .vlv-wax { animation: vlv-cal-out-right 220ms var(--ease-standard, ease) forwards }
.vlv-cal .vlv-cin { animation: vlv-cal-fade-in 320ms var(--ease-standard, ease) forwards }
.vlv-cal .vlv-cout { animation: vlv-cal-fade-out 160ms var(--ease-standard, ease) forwards }
@media (prefers-reduced-motion: reduce) {
  .vlv-cal .vlv-wbe, .vlv-cal .vlv-wae, .vlv-cal .vlv-wbx, .vlv-cal .vlv-wax, .vlv-cal .vlv-cin, .vlv-cal .vlv-cout { animation-duration: 1ms }
}
`

const navButton = cn(
  "state-layer grid size-10 shrink-0 cursor-pointer place-items-center rounded-full text-foreground outline-none",
  "focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring",
  "disabled:cursor-default disabled:opacity-38 aria-disabled:cursor-default aria-disabled:opacity-38",
  "[--icon-size:20px] [--icon-opsz:20]"
)

const monthStart = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1)

/** The first selected date, whatever the mode, to open on. */
function firstSelected(selected: unknown): Date | undefined {
  if (selected instanceof Date) return selected
  if (Array.isArray(selected)) return selected[0]
  if (selected && typeof selected === "object" && "from" in selected) return (selected as DateRange).from
  return undefined
}

type CalendarProps = DayPickerProps & {
  /** With one month, the title opens a year grid. */
  yearPicker?: boolean
  /**
   * BCP 47 tag for month and weekday names, through Intl (no date-fns
   * locale needed). A date-fns \`locale\`, if you pass one, still drives
   * everything else.
   */
  lang?: string
}

function Calendar({
  className,
  classNames,
  showOutsideDays = false,
  yearPicker = true,
  numberOfMonths = 1,
  month: monthProp,
  defaultMonth,
  onMonthChange,
  startMonth,
  endMonth,
  components,
  animate = true,
  lang: langProp,
  formatters,
  ...props
}: CalendarProps) {
  const lang = langProp ?? props.locale?.code ?? "en-US"
  const names = React.useMemo(
    () => ({
      weekday: new Intl.DateTimeFormat(lang, { weekday: "narrow" }),
      caption: new Intl.DateTimeFormat(lang, { month: "long", year: "numeric" }),
    }),
    [lang]
  )
  const [ownMonth, setOwnMonth] = React.useState(() => monthStart(defaultMonth ?? firstSelected((props as { selected?: unknown }).selected) ?? new Date()))
  const month = monthProp ?? ownMonth
  const setMonth = (m: Date) => {
    const next = monthStart(m)
    if (monthProp === undefined) setOwnMonth(next)
    onMonthChange?.(next)
  }
  const [view, setView] = React.useState<"days" | "years">("days")
  const single = numberOfMonths === 1
  const ownHeader = single

  const title = names.caption.format(month)
  const prev = new Date(month.getFullYear(), month.getMonth() - 1, 1)
  const prevDisabled = Boolean(startMonth && prev < monthStart(startMonth))
  const nextDisabled = Boolean(endMonth && monthStart(new Date(month.getFullYear(), month.getMonth() + numberOfMonths - 1, 1)) >= monthStart(endMonth))
  const gridId = React.useId()

  return (
    <div data-slot="calendar" className={cn("vlv-cal relative w-fit select-none [--cell:2.5rem]", className)}>
      <style href="velvet-calendar" precedence="default">
        {CSS}
      </style>
      {ownHeader && (
        <div className="mb-1 flex h-10 items-center justify-between gap-2">
          {yearPicker ? (
            <button
              type="button"
              data-slot="calendar-title"
              aria-expanded={view === "years"}
              aria-controls={gridId}
              aria-label={view === "years" ? `${title}, choose a day` : `${title}, choose a year`}
              onClick={() => setView((v) => (v === "days" ? "years" : "days"))}
              className={cn(
                "state-layer flex h-10 cursor-pointer items-center gap-1 rounded-full ps-3 pe-2 type-title-sm text-foreground outline-none",
                "focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring"
              )}
            >
              <span aria-live="polite">{title}</span>
              <Icon
                name="arrow_drop_down"
                className={cn("text-muted-foreground transition-[rotate] duration-[396ms] ease-(--ease-spring) motion-reduce:transition-none", view === "years" && "rotate-180")}
              />
            </button>
          ) : (
            <span aria-live="polite" className="ps-3 type-title-sm">
              {title}
            </span>
          )}
          <div className={cn("flex items-center transition-opacity duration-200", view === "years" && "pointer-events-none opacity-0")} aria-hidden={view === "years" || undefined}>
            <button type="button" className={navButton} aria-label="Previous month" disabled={prevDisabled} onClick={() => setMonth(prev)} tabIndex={view === "years" ? -1 : undefined}>
              <Icon name="chevron_left" />
            </button>
            <button type="button" className={navButton} aria-label="Next month" disabled={nextDisabled} onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} tabIndex={view === "years" ? -1 : undefined}>
              <Icon name="chevron_right" />
            </button>
          </div>
        </div>
      )}

      {view === "years" ? (
        <YearGrid
          id={gridId}
          month={month}
          from={startMonth?.getFullYear() ?? new Date().getFullYear() - 100}
          to={endMonth?.getFullYear() ?? new Date().getFullYear() + 50}
          onPick={(y) => {
            let m = new Date(y, month.getMonth(), 1)
            if (startMonth && m < monthStart(startMonth)) m = monthStart(startMonth)
            if (endMonth && m > monthStart(endMonth)) m = monthStart(endMonth)
            setMonth(m)
            setView("days")
          }}
          onClose={() => setView("days")}
        />
      ) : (
        <div id={gridId}>
          <DayPicker
            showOutsideDays={showOutsideDays}
            numberOfMonths={numberOfMonths}
            month={month}
            onMonthChange={setMonth}
            startMonth={startMonth}
            endMonth={endMonth}
            hideNavigation={ownHeader}
            navLayout={ownHeader ? undefined : "around"}
            animate={animate}
            classNames={{
              root: "relative",
              months: "relative flex flex-col gap-6 sm:flex-row",
              month: "relative flex flex-col overflow-hidden",
              month_caption: ownHeader ? "sr-only" : "flex h-10 items-center justify-center type-title-sm",
              caption_label: "",
              button_previous: cn(navButton, "absolute top-0 left-0 z-[2]"),
              button_next: cn(navButton, "absolute top-0 right-0 z-[2]"),
              chevron: "",
              month_grid: "border-collapse",
              weekdays: "flex",
              weekday: "grid size-(--cell) place-items-center type-label-md font-normal text-muted-foreground",
              weeks: "flex flex-col gap-1",
              week: "flex",
              day: "size-(--cell)",
              day_button: cn(
                "state-layer relative z-[1] grid size-(--cell) cursor-pointer place-items-center rounded-full type-body-md text-foreground tabular-nums outline-none",
                "transition-[background-color,color] duration-150",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              ),
              range_start: "vlv-rs",
              range_middle: "vlv-rm",
              range_end: "vlv-re",
              selected: "",
              today: "",
              outside: "",
              disabled: "",
              hidden: "invisible",
              weeks_before_enter: "vlv-wbe",
              weeks_after_enter: "vlv-wae",
              weeks_before_exit: "vlv-wbx",
              weeks_after_exit: "vlv-wax",
              caption_before_enter: "vlv-cin",
              caption_after_enter: "vlv-cin",
              caption_before_exit: "vlv-cout",
              caption_after_exit: "vlv-cout",
              ...classNames,
            }}
            formatters={{
              formatWeekdayName: (d) => names.weekday.format(d),
              formatCaption: (d) => names.caption.format(d),
              ...formatters,
            }}
            components={{
              Chevron: ({ orientation }) => <Icon name={orientation === "left" ? "chevron_left" : orientation === "right" ? "chevron_right" : "keyboard_arrow_down"} />,
              ...components,
            }}
            {...(props as DayPickerProps)}
          />
        </div>
      )}
    </div>
  )
}

function YearGrid({ id, month, from, to, onPick, onClose }: { id: string; month: Date; from: number; to: number; onPick: (y: number) => void; onClose: () => void }) {
  const ref = React.useRef<HTMLDivElement>(null)
  const year = month.getFullYear()
  const thisYear = new Date().getFullYear()
  const years = React.useMemo(() => Array.from({ length: to - from + 1 }, (_, i) => from + i), [from, to])

  // open on the shown year, centered and focused
  React.useLayoutEffect(() => {
    const el = ref.current?.querySelector<HTMLButtonElement>(`[data-year="${year}"]`)
    if (!el || !ref.current) return
    ref.current.scrollTop = el.offsetTop - ref.current.clientHeight / 2 + el.offsetHeight / 2
    el.focus({ preventScroll: true })
  }, [year])

  const onKeyDown = (e: React.KeyboardEvent) => {
    const cur = Number((document.activeElement as HTMLElement | null)?.dataset.year)
    if (!cur) return
    const step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -3, ArrowDown: 3, Home: -(cur - from), End: to - cur }[e.key]
    if (e.key === "Escape") {
      e.preventDefault()
      e.stopPropagation()
      onClose()
      return
    }
    if (step === undefined) return
    e.preventDefault()
    const target = Math.min(to, Math.max(from, cur + step))
    ref.current?.querySelector<HTMLButtonElement>(`[data-year="${target}"]`)?.focus()
  }

  return (
    <div
      ref={ref}
      id={id}
      role="group"
      aria-label="Years"
      onKeyDown={onKeyDown}
      className="grid h-[calc(var(--cell)*7+1.5rem)] w-[calc(var(--cell)*7)] auto-rows-[3.25rem] grid-cols-3 content-start overflow-y-auto overscroll-contain px-1 [scrollbar-width:thin] animate-in fade-in-0 duration-200"
    >
      {years.map((y) => (
        <span key={y} className="grid place-items-center">
          <button
            type="button"
            data-year={y}
            tabIndex={y === year ? 0 : -1}
            aria-current={y === year ? "true" : undefined}
            onClick={() => onPick(y)}
            className={cn(
              "state-layer h-9 w-[4.5rem] cursor-pointer rounded-full type-body-lg tabular-nums outline-none",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
              y === year ? "bg-primary text-primary-foreground" : "text-foreground",
              y === thisYear && y !== year && "shadow-[inset_0_0_0_1px_var(--foreground)]"
            )}
          >
            {y}
          </button>
        </span>
      ))}
    </div>
  )
}

export { Calendar, type CalendarProps, type DateRange }
