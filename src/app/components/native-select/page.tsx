"use client"

import * as React from "react"
import { NativeSelect, NativeSelectOptGroup, NativeSelectOption } from "@/registry/nelumbo/ui/native-select"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/registry/nelumbo/ui/select"
import { Code, PageHeader, Preview, PropsTable, Section } from "@/components/docs/primitives"

const COUNTRIES: [string, string[]][] = [
  ["Europe", ["Germany", "France", "Portugal", "Sweden"]],
  ["Americas", ["Brazil", "Canada", "Mexico", "United States"]],
  ["Asia Pacific", ["Australia", "India", "Japan", "Singapore"]],
]

export default function NativeSelectPage() {
  const [value, setValue] = React.useState("")
  return (
    <>
      <PageHeader eyebrow="Component 61" title="Native Select">
        The browser&apos;s own select, dressed as a Nelumbo field. It has the same surface, height, chevron and focus
        line as Select, but the list is drawn by the platform: the wheel on iOS, the sheet on Android, the keyboard
        and type-ahead you already know on desktop.
      </PageHeader>

      <Section title="Install">
        <Code>{`npx shadcn@latest add @nelumbo/native-select`}</Code>
      </Section>

      <Section
        title="With a label"
        description="The label is always raised, because a select always shows a value. Start with a disabled empty option as the placeholder. Filled and outlined, like Input."
      >
        <Preview className="items-start">
          <NativeSelect label="Country" description="Used to work out tax." value={value} onChange={(e) => setValue(e.target.value)} className="max-w-xs">
            <NativeSelectOption value="" disabled>Choose a country</NativeSelectOption>
            {COUNTRIES.map(([group, items]) => (
              <NativeSelectOptGroup key={group} label={group}>
                {items.map((c) => (
                  <NativeSelectOption key={c} value={c}>{c}</NativeSelectOption>
                ))}
              </NativeSelectOptGroup>
            ))}
          </NativeSelect>
          <NativeSelect label="Language" variant="outlined" icon="translate" defaultValue="en" className="max-w-xs">
            <NativeSelectOption value="en">English</NativeSelectOption>
            <NativeSelectOption value="de">Deutsch</NativeSelectOption>
            <NativeSelectOption value="ja">日本語</NativeSelectOption>
          </NativeSelect>
        </Preview>
      </Section>

      <Section title="Sizes" description="default 56px, sm 48px, xs 36px. Without a floating label (xs, or no label) pass an aria-label or label so it has a name.">
        <Preview className="items-end">
          <NativeSelect label="Default" defaultValue="a" className="w-48">
            <NativeSelectOption value="a">Weekly</NativeSelectOption>
            <NativeSelectOption value="b">Monthly</NativeSelectOption>
          </NativeSelect>
          <NativeSelect label="Small" size="sm" defaultValue="a" className="w-48">
            <NativeSelectOption value="a">Weekly</NativeSelectOption>
            <NativeSelectOption value="b">Monthly</NativeSelectOption>
          </NativeSelect>
          <NativeSelect label="Frequency" size="xs" defaultValue="a" className="w-40">
            <NativeSelectOption value="a">Weekly</NativeSelectOption>
            <NativeSelectOption value="b">Monthly</NativeSelectOption>
          </NativeSelect>
          <NativeSelect aria-label="Without a label" defaultValue="a" className="w-48">
            <NativeSelectOption value="a">Weekly</NativeSelectOption>
            <NativeSelectOption value="b">Monthly</NativeSelectOption>
          </NativeSelect>
        </Preview>
      </Section>

      <Section title="Invalid and disabled">
        <Preview className="items-start">
          <NativeSelect label="Time zone" defaultValue="" error="Pick a time zone to schedule the call." className="max-w-xs">
            <NativeSelectOption value="" disabled>Choose a time zone</NativeSelectOption>
            <NativeSelectOption value="cet">Central European (CET)</NativeSelectOption>
            <NativeSelectOption value="pst">Pacific (PST)</NativeSelectOption>
          </NativeSelect>
          <NativeSelect label="Plan" disabled defaultValue="pro" className="max-w-xs">
            <NativeSelectOption value="pro">Pro</NativeSelectOption>
          </NativeSelect>
        </Preview>
      </Section>

      <Section
        title="Native Select or Select?"
        description="Both look like the same field. They differ in what opens."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2 rounded-3xl bg-surface-container-low p-6 dark:bg-surface-container-lowest">
            <h3 className="type-title-md">Native Select</h3>
            <ul className="flex list-disc flex-col gap-1.5 ps-5 type-body-md text-muted-foreground">
              <li>Phones and tablets: the system picker, with the right touch size and no scroll traps.</li>
              <li>Forms posted to a server or filled by password managers and autofill (country, state, time zone).</li>
              <li>Long lists such as 200 countries: type-ahead and platform scrolling for free.</li>
              <li>Plain text options only; the browser draws them, so no icons, descriptions or custom rows.</li>
            </ul>
          </div>
          <div className="flex flex-col gap-2 rounded-3xl bg-surface-container-low p-6 dark:bg-surface-container-lowest">
            <h3 className="type-title-md">Select</h3>
            <ul className="flex list-disc flex-col gap-1.5 ps-5 type-body-md text-muted-foreground">
              <li>Desktop UIs where the list should match the rest of the design.</li>
              <li>Options with icons, descriptions or a check mark on the chosen row.</li>
              <li>Short lists where the spring animation and the raised pill feel good.</li>
              <li>When you need to control the list&apos;s width, position or contents.</li>
            </ul>
          </div>
        </div>
        <Preview className="items-start">
          <NativeSelect label="Native" defaultValue="pro" className="w-56">
            <NativeSelectOption value="free">Free</NativeSelectOption>
            <NativeSelectOption value="pro">Pro</NativeSelectOption>
          </NativeSelect>
          <Select defaultValue="pro">
            <SelectTrigger label="Nelumbo Select" className="w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="free">Free</SelectItem>
              <SelectItem value="pro" icon="star" description="Unlimited projects">Pro</SelectItem>
            </SelectContent>
          </Select>
        </Preview>
      </Section>

      <Section title="Usage">
        <Code>{`import { NativeSelect, NativeSelectOptGroup, NativeSelectOption } from "@/components/ui/native-select"

// shadcn's API, unchanged
<NativeSelect>
  <NativeSelectOption value="">Select status</NativeSelectOption>
  <NativeSelectOption value="todo">Todo</NativeSelectOption>
</NativeSelect>

// Nelumbo: floating label, help and error text
<NativeSelect label="Country" description="Used for tax." defaultValue="">
  <NativeSelectOption value="" disabled>Choose a country</NativeSelectOption>
  <NativeSelectOptGroup label="Europe">
    <NativeSelectOption value="de">Germany</NativeSelectOption>
  </NativeSelectOptGroup>
</NativeSelect>`}</Code>
      </Section>

      <Section title="Props">
        <PropsTable
          rows={[
            ["label", "string", "", "Floating label (always raised). Names the control; sr-only at size xs"],
            ["variant", '"filled" | "outlined"', '"filled"', "Same as Input"],
            ["size", '"default" | "sm" | "xs"', '"default"', "56px, 48px, 36px. shadcn's sm still means smaller"],
            ["icon", "IconName", "", "Leading Material Symbol"],
            ["description", "ReactNode", "", "Help text under the field"],
            ["error", "ReactNode | boolean", "", "Marks invalid; a string replaces the description"],
            ["className", "string", "", "On the field wrapper (set the width here)"],
            ["...props", "select props", "", "value, defaultValue, onChange, name, required, aria-*; ref points at the select"],
          ]}
        />
      </Section>
    </>
  )
}
