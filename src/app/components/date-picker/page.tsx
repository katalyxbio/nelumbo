"use client"

import * as React from "react"
import { Calendar, type DateRange } from "@/registry/velvet/ui/calendar"
import { DatePicker, DateRangePicker } from "@/registry/velvet/ui/date-picker"
import { Code, PageHeader, Preview, PropsTable, Section } from "@/components/docs/primitives"

// fixed "today" for the examples' defaults, so the page renders the same on the server and the client
const day = (y: number, m: number, d: number) => new Date(y, m - 1, d)
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)
const today = () => {
  const t = new Date()
  return new Date(t.getFullYear(), t.getMonth(), t.getDate())
}

const PRESETS = [
  { label: "Today", range: () => ({ from: today(), to: today() }) },
  { label: "Last 7 days", range: () => ({ from: addDays(today(), -6), to: today() }) },
  { label: "Last 30 days", range: () => ({ from: addDays(today(), -29), to: today() }) },
  {
    label: "This month",
    range: () => {
      const t = today()
      return { from: new Date(t.getFullYear(), t.getMonth(), 1), to: new Date(t.getFullYear(), t.getMonth() + 1, 0) }
    },
  },
  {
    label: "Last month",
    range: () => {
      const t = today()
      return { from: new Date(t.getFullYear(), t.getMonth() - 1, 1), to: new Date(t.getFullYear(), t.getMonth(), 0) }
    },
  },
]

const long = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" })

export default function DatePickerPage() {
  const [single, setSingle] = React.useState<Date | undefined>(day(2026, 11, 18))
  const [range, setRange] = React.useState<DateRange | undefined>({ from: day(2026, 11, 9), to: day(2026, 11, 13) })
  const [due, setDue] = React.useState<Date | null>(day(2026, 12, 4))
  const [trip, setTrip] = React.useState<DateRange | null>(null)
  const [report, setReport] = React.useState<DateRange | null>({ from: day(2026, 10, 1), to: day(2026, 10, 31) })

  return (
    <>
      <PageHeader eyebrow="Component 31" title="Date Picker">
        Pick a day or a range. Type a date straight into the field, or open the calendar under it. The calendar
        is also its own component, built on react-day-picker like shadcn&apos;s, so its props carry over.
      </PageHeader>

      <Section title="Install">
        <Code>{`npx shadcn@latest add @velvet/date-picker   # adds @velvet/calendar too`}</Code>
      </Section>

      <Section
        title="Calendar"
        description="Days are circles: the selection is filled, today is outlined, a range is a soft band between two filled ends. Months slide as you page. With one month, the title opens a year grid; arrow keys move through days and years."
      >
        <Preview className="flex-col items-center gap-8 lg:flex-row lg:items-start lg:justify-center">
          <div className="rounded-2xl bg-card p-3 shadow-e1 dark:bg-surface-container-high">
            <Calendar mode="single" selected={single} onSelect={setSingle} defaultMonth={day(2026, 11, 1)} />
          </div>
          <div className="rounded-2xl bg-card p-3 shadow-e1 dark:bg-surface-container-high">
            <Calendar mode="range" selected={range} onSelect={setRange} numberOfMonths={2} defaultMonth={day(2026, 11, 1)} />
          </div>
        </Preview>
      </Section>

      <Section
        title="Date picker"
        description="Type the date in the locale's order; the separators fill themselves in. Alt+↓ or the calendar button opens the calendar. A date outside min and max, or on a disabled day, is flagged when you leave the field."
      >
        <Preview className="grid items-start gap-6 md:grid-cols-2">
          <DatePicker label="Due date" icon="event" value={due} onValueChange={setDue} />
          <DatePicker
            variant="outlined"
            label="Delivery"
            min={day(2026, 11, 20)}
            max={day(2027, 2, 28)}
            disabledDays={{ dayOfWeek: [0, 6] }}
            description="Weekdays from Nov 20 to Feb 28."
          />
          <DatePicker label="Geburtsdatum" locale="de-DE" weekStartsOn={1} defaultValue={day(1990, 5, 23)} />
          <DatePicker variant="outlined" label="Start date" error="Choose a start date." />
        </Preview>
        <p className="type-body-sm text-muted-foreground">Due date: {due ? long.format(due) : "none"}</p>
      </Section>

      <Section
        title="Range picker"
        description="Two months side by side (one on a phone), with optional presets. What you pick is a draft until Apply, so looking around doesn't change the value. A new click after a full range starts a new one."
      >
        <Preview className="grid items-start gap-6 md:grid-cols-2">
          <DateRangePicker label="Report period" icon="bar_chart" presets={PRESETS} value={report} onValueChange={setReport} />
          <DateRangePicker variant="outlined" label="Trip" value={trip} onValueChange={setTrip} min={today()} description="Check-in to check-out." />
        </Preview>
      </Section>

      <Section title="Usage">
        <Code>{`import { DatePicker, DateRangePicker } from "@/components/ui/date-picker"
import { Calendar } from "@/components/ui/calendar"

<DatePicker label="Due date" value={date} onValueChange={setDate} />
<DatePicker label="Delivery" min={new Date()} disabledDays={{ dayOfWeek: [0, 6] }} name="delivery" />
<DatePicker label="Geburtsdatum" locale="de-DE" weekStartsOn={1} />

<DateRangePicker
  label="Report period"
  value={range}
  onValueChange={setRange}
  presets={[{ label: "Last 7 days", range: () => ({ from: addDays(new Date(), -6), to: new Date() }) }]}
/>

// shadcn's Calendar code works as is
<Calendar mode="single" selected={date} onSelect={setDate} />`}</Code>
      </Section>

      <Section title="Props">
        <PropsTable
          rows={[
            ["value / defaultValue", "Date | null  (range: DateRange | null)", "", ""],
            ["onValueChange", "(value) => void", "", "A typed date fires once it's complete and allowed"],
            ["min / max", "Date", "", "Earlier and later days are disabled, and the calendar stops there"],
            ["disabledDays", "Matcher | Matcher[]", "", "Any DayPicker matcher: dates, ranges, { dayOfWeek }"],
            ["locale", "string", '"en-US"', "Typed order and separator, month and weekday names"],
            ["weekStartsOn", "0–6", "0", "0 is Sunday"],
            ["name", "string", "", "Submits YYYY-MM-DD (a range as name[from] and name[to])"],
            ["label, variant, size, icon, description, error", "", "", "As on Input"],
            ["DateRangePicker presets", "{ label, range }[]", "", "range can be a function, worked out on open"],
            ["DateRangePicker numberOfMonths", "number", "2", "Phones show one"],
            ["Calendar yearPicker", "boolean", "true", "The title opens a year grid (one month only)"],
            ["Calendar lang", "string", '"en-US"', "Month and weekday names, through Intl"],
            ["Calendar showOutsideDays", "boolean", "false", ""],
          ]}
          note="Calendar takes every react-day-picker prop as well."
        />
      </Section>
    </>
  )
}
