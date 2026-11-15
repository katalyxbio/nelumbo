"use client"

import * as React from "react"
import { TimePicker } from "@/registry/velvet/ui/time-picker"
import { Code, PageHeader, Preview, PropsTable, Section } from "@/components/docs/primitives"

export default function TimePickerPage() {
  const [start, setStart] = React.useState<string | null>("09:30")
  const [slot, setSlot] = React.useState<string | null>(null)

  return (
    <>
      <PageHeader eyebrow="Component · 32" title="Time Picker">
        Type a time into the field, or open the clock under it. The value is always a 24-hour &quot;HH:mm&quot;
        string, whatever the display, so it travels through forms and APIs unchanged.
      </PageHeader>

      <Section title="Install">
        <Code>{`npx shadcn@latest add @velvet/time-picker`}</Code>
      </Section>

      <Section
        title="Field"
        description="Type in the locale's format. In 12-hour, “930p” and “9:30 pm” both become 9:30 PM; the colon and day period fill themselves in. A wrong time is flagged when you leave the field. The clock button, or Alt+↓, opens the picker."
      >
        <Preview className="grid items-start gap-6 md:grid-cols-2">
          <TimePicker label="Start time" icon="flight_takeoff" value={start} onValueChange={setStart} />
          <TimePicker variant="outlined" label="End time" defaultValue="17:45" />
          <TimePicker label="Reminder" size="sm" />
          <TimePicker variant="outlined" label="Doors open" error="Choose a time." />
        </Preview>
        <p className="type-body-sm text-muted-foreground">Start time value: {start ?? "null"}</p>
      </Section>

      <Section
        title="The picker"
        description="Large hour and minute chips choose which part you're editing. Drag the hand or press a number; after the hour, the dial moves on to minutes. What you pick is a draft until OK. Arrow keys change the focused chip, digits can be typed, Enter confirms."
      >
        <Preview className="grid items-start gap-6 md:grid-cols-2">
          <TimePicker label="Meeting" defaultValue="14:15" />
          <TimePicker variant="outlined" label="Meeting (24-hour)" hourCycle="h23" defaultValue="14:15" />
        </Preview>
      </Section>

      <Section
        title="24-hour locales"
        description="The locale decides the format. The 24-hour dial has two rings: 1 to 12 outside, 13 to 00 inside. Override with hourCycle."
      >
        <Preview className="grid items-start gap-6 md:grid-cols-2">
          <TimePicker label="Abflug" locale="de-DE" icon="schedule" defaultValue="06:45" />
          <TimePicker variant="outlined" label="Départ" locale="fr-FR" />
        </Preview>
      </Section>

      <Section
        title="Step, min and max"
        description="Only times on the step are allowed, counted from min. The dial greys out hours and minutes that aren't, and the hand snaps to the nearest allowed one. Typing an unavailable time says why."
      >
        <Preview className="grid items-start gap-6 md:grid-cols-2">
          <TimePicker label="Appointment" step={15} min="09:00" max="17:00" description="Every 15 minutes, 9 AM to 5 PM." value={slot} onValueChange={setSlot} />
          <TimePicker variant="outlined" label="Pickup" locale="de-DE" step={30} min="06:00" max="22:00" description="Alle 30 Minuten, 06:00 bis 22:00." />
        </Preview>
      </Section>

      <Section
        title="List mode"
        description="For dense UIs: scrollable hour and minute columns (and AM/PM) instead of the dial. Each column is a listbox with arrow keys."
      >
        <Preview className="grid items-start gap-6 md:grid-cols-2">
          <TimePicker mode="list" label="Check-in" defaultValue="15:00" step={5} />
          <TimePicker mode="list" variant="outlined" label="Check-out" locale="de-DE" defaultValue="11:00" />
        </Preview>
      </Section>

      <Section title="Usage">
        <Code>{`import { TimePicker } from "@/components/ui/time-picker"

<TimePicker label="Start time" value={time} onValueChange={setTime} />   // "09:30" or null
<TimePicker label="Abflug" locale="de-DE" />                              // 24-hour
<TimePicker label="Appointment" step={15} min="09:00" max="17:00" />
<TimePicker label="Check-in" mode="list" name="checkin" />               // submits "15:00"`}</Code>
      </Section>

      <Section title="Props">
        <PropsTable
          rows={[
            ["value / defaultValue", "string | null", "", '24-hour "HH:mm"'],
            ["onValueChange", "(value: string | null) => void", "", "Fires when a typed time is complete and allowed, and on OK"],
            ["min / max", "string", "", 'Earliest and latest time, "HH:mm"'],
            ["step", "number", "1", "Minutes between allowed times, counted from min"],
            ["locale", "string", '"en-US"', "Decides 12 or 24 hour, and the AM/PM labels"],
            ["hourCycle", '"h11" | "h12" | "h23" | "h24"', "", "Overrides the locale"],
            ["mode", '"dial" | "list"', '"dial"', "The picker's layout"],
            ["name", "string", "", 'Submits "HH:mm" through a hidden input'],
            ["label, variant, size, icon, description, error", "", "", "As on Input"],
            ["required / disabled", "boolean", "", ""],
          ]}
        />
      </Section>
    </>
  )
}
