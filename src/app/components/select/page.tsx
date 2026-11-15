"use client"

import * as React from "react"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/registry/velvet/ui/select"
import {
  fieldButtonClass,
  fieldChevron,
} from "@/registry/velvet/ui/select"
import { Field } from "@/registry/velvet/ui/field"
import { Icon } from "@/registry/velvet/ui/icon"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/registry/velvet/ui/dropdown-menu"
import { LOCATIONS, pathTo } from "@/components/docs/locations"
import type { ComboboxOption } from "@/registry/velvet/ui/combobox"
import { Input } from "@/registry/velvet/ui/input"
import { Button } from "@/registry/velvet/ui/button"
import { Code, PageHeader, Preview, PropsTable, Section } from "@/components/docs/primitives"

const VARIANTS = ["filled", "outlined"] as const

const TIMEZONES: [string, [string, string][]][] = [
  ["Europe", [["Europe/London", "London (GMT+0)"], ["Europe/Paris", "Paris (GMT+1)"], ["Europe/Stockholm", "Stockholm (GMT+1)"], ["Europe/Athens", "Athens (GMT+2)"]]],
  ["Americas", [["America/New_York", "New York (GMT−5)"], ["America/Chicago", "Chicago (GMT−6)"], ["America/Los_Angeles", "Los Angeles (GMT−8)"], ["America/Sao_Paulo", "São Paulo (GMT−3)"]]],
  ["Asia and Pacific", [["Asia/Tokyo", "Tokyo (GMT+9)"], ["Asia/Singapore", "Singapore (GMT+8)"], ["Asia/Kolkata", "Mumbai (GMT+5:30)"], ["Australia/Sydney", "Sydney (GMT+11)"]]],
]

/**
 * Prototype: a Select whose options nest in cascading submenus. The field is
 * Velvet's Field with a Dropdown Menu behind it (Radix Select has no submenus).
 */
function CascadeSelect({
  label,
  variant,
  options,
  value,
  onValueChange,
}: {
  label: string
  variant?: "filled" | "outlined"
  options: readonly (ComboboxOption | string)[]
  value: string | null
  onValueChange: (v: string) => void
}) {
  const path = pathTo(value, options) ?? []
  const render = (nodes: readonly (ComboboxOption | string)[]) =>
    nodes.map((n) => {
      const o = typeof n === "string" ? { value: n, label: n } : n
      if (!o.children) {
        return (
          <DropdownMenuRadioItem key={o.value} value={o.value}>
            {o.label}
            {o.icon && <Icon name={o.icon} className="ms-auto" />}
          </DropdownMenuRadioItem>
        )
      }
      const inside = path.includes(o.label) && path.at(-1) !== o.label
      return (
        <DropdownMenuSub key={o.value}>
          <DropdownMenuSubTrigger className={inside ? "font-medium" : undefined}>
            {/* the icon stays on the left so the right holds only the chevron; filled when it holds the choice */}
            {o.icon ? (
              <Icon name={o.icon} fill={inside} className={inside ? "text-foreground!" : undefined} />
            ) : (
              <span className="grid size-5 shrink-0 place-items-center">
                {inside && <span aria-hidden className="size-1.5 rounded-full bg-primary" />}
              </span>
            )}
            <span className="flex-1 truncate">{o.label}</span>
            {inside && <span className="sr-only">, contains your choice</span>}
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="max-h-80 min-w-52 overflow-y-auto">{render(o.children)}</DropdownMenuSubContent>
        </DropdownMenuSub>
      )
    })

  return (
    <DropdownMenu>
      <Field label={label} variant={variant} trailing={fieldChevron} icon="location_on" className="max-w-sm">
        {/* eslint-disable-next-line @typescript-eslint/no-unused-vars */}
        {({ className, placeholder, ...control }) => (
          <>
            <DropdownMenuTrigger asChild>
              <button type="button" {...control} data-placeholder={value ? undefined : ""} className={fieldButtonClass(className, { label: true })}>
                <span className="truncate">
                  {path.length > 1 && <span className="text-muted-foreground">{path.slice(0, -1).join(" › ")} › </span>}
                  {path.at(-1)}
                </span>
              </button>
            </DropdownMenuTrigger>
            <span aria-hidden className="flex-1" />
          </>
        )}
      </Field>
      <DropdownMenuContent align="start" className="w-(--radix-dropdown-menu-trigger-width)">
        <DropdownMenuRadioGroup value={value ?? ""} onValueChange={onValueChange}>
          {render(options.slice(0, -1))}
          <DropdownMenuSeparator />
          {render(options.slice(-1))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default function SelectPage() {
  const [plan, setPlan] = React.useState("team")
  const [role, setRole] = React.useState<string>("")
  const [office, setOffice] = React.useState<string | null>("Sweden")

  return (
    <>
      <PageHeader eyebrow="Component · 24" title="Select">
        Pick one option from a list. The trigger is the same field as Input, label and all, so a Select sits in a
        form without looking like a different kind of thing. The list drops from the field at its full width.
      </PageHeader>

      <Section title="Install">
        <Code>{`npx shadcn@latest add @velvet/select`}</Code>
      </Section>

      <Section
        title="Variants"
        description="Filled and outlined, like Input. The label rests in the field until there's a value or the list opens; the chosen option is filled in and ticked."
      >
        <div className="grid gap-4 md:grid-cols-2">
          {VARIANTS.map((v) => (
            <Preview key={v} label={v} className="flex-col items-stretch gap-5 bg-card dark:bg-card">
              <Input variant={v} label="Project name" defaultValue="Spring campaign" autoComplete="off" />
              <Select value={plan} onValueChange={setPlan}>
                <SelectTrigger variant={v} label="Plan" icon="workspace_premium" description="You can change plans at any time.">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free" description="3 projects, 1 GB">Free</SelectItem>
                  <SelectItem value="pro" description="Unlimited projects, 100 GB">Pro</SelectItem>
                  <SelectItem value="team" description="Shared workspace, 1 TB">Team</SelectItem>
                  <SelectItem value="enterprise" description="Contact sales" disabled>
                    Enterprise
                  </SelectItem>
                </SelectContent>
              </Select>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger variant={v} label="Role">
                  <SelectValue placeholder="Choose a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewer" icon="visibility">Viewer</SelectItem>
                  <SelectItem value="commenter" icon="chat_bubble">Commenter</SelectItem>
                  <SelectItem value="editor" icon="edit">Editor</SelectItem>
                  <SelectSeparator />
                  <SelectItem value="admin" icon="shield_person">Admin</SelectItem>
                </SelectContent>
              </Select>
              <Select disabled defaultValue="eu">
                <SelectTrigger variant={v} label="Data region">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="eu">European Union</SelectItem>
                </SelectContent>
              </Select>
            </Preview>
          ))}
        </div>
      </Section>

      <Section
        title="Groups and long lists"
        description="Group labels and separators organise long lists. Past 20rem the list scrolls. Type a few letters to jump to an option."
      >
        <Preview className="flex-col items-stretch gap-5 sm:flex-row sm:items-start">
          <Select defaultValue="Europe/Stockholm">
            <SelectTrigger label="Time zone" icon="schedule" className="sm:w-80">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIMEZONES.map(([group, zones], i) => (
                <React.Fragment key={group}>
                  {i > 0 && <SelectSeparator />}
                  <SelectGroup>
                    <SelectLabel>{group}</SelectLabel>
                    {zones.map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </React.Fragment>
              ))}
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger variant="outlined" label="Error" error="Choose how to be told about errors." className="sm:w-72">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="push">Push notification</SelectItem>
              <SelectItem value="none">Don&apos;t tell me</SelectItem>
            </SelectContent>
          </Select>
        </Preview>
      </Section>

      <Section
        title="Without a label"
        description="Leave out label for shadcn's plain look, with the placeholder in the field: good in toolbars and table headers. size=&quot;sm&quot; is 48px."
      >
        <Preview className="gap-3">
          <Select defaultValue="30d">
            <SelectTrigger size="sm" variant="outlined" className="w-44" aria-label="Date range">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="12m">Last 12 months</SelectItem>
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger size="sm" className="w-44" aria-label="Sort by">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="date">Date modified</SelectItem>
              <SelectItem value="size">Size</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="secondary" size="sm">
            Apply
          </Button>
        </Preview>
      </Section>

      <Section
        title="Icons at the end"
        description='iconPosition="end" moves an item&apos;s icon to the far end, opposite the label, and the check moves to the start so the labels stay lined up.'
      >
        <Preview className="flex-col items-stretch gap-5 sm:flex-row sm:items-start">
          <Select defaultValue="team">
            <SelectTrigger label="Who can see this" className="sm:w-80">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="public" icon="public" iconPosition="end" description="Anyone with the link">
                Public
              </SelectItem>
              <SelectItem value="team" icon="group" iconPosition="end" description="People in Northwind">
                Team
              </SelectItem>
              <SelectItem value="private" icon="lock" iconPosition="end" description="Only you">
                Private
              </SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="high">
            <SelectTrigger variant="outlined" label="Priority" className="sm:w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="urgent" icon="priority_high" iconPosition="end">Urgent</SelectItem>
              <SelectItem value="high" icon="keyboard_double_arrow_up" iconPosition="end">High</SelectItem>
              <SelectItem value="medium" icon="drag_handle" iconPosition="end">Medium</SelectItem>
              <SelectItem value="low" icon="keyboard_double_arrow_down" iconPosition="end">Low</SelectItem>
            </SelectContent>
          </Select>
        </Preview>
      </Section>

      <Section
        title="Nested (prototype)"
        description="Cascading submenus: hover or press → to open a region, ← to go back. The field shows the path, and a dot marks the menus that hold the choice. Radix Select has no submenus, so this is the field with a Dropdown Menu behind it. Compare it with Combobox's drill-in panels."
      >
        <Preview className="flex-col items-stretch">
          <CascadeSelect label="Office" options={LOCATIONS} value={office} onValueChange={setOffice} />
        </Preview>
      </Section>

      <Section title="Usage">
        <Code>{`import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

<Select value={plan} onValueChange={setPlan}>
  <SelectTrigger label="Plan" description="You can change it later.">
    <SelectValue />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="free">Free</SelectItem>
    <SelectItem value="pro" icon="star" description="Unlimited projects">Pro</SelectItem>
  </SelectContent>
</Select>

// shadcn code works as is: no label, placeholder in the field
<SelectTrigger className="w-[180px]">
  <SelectValue placeholder="Theme" />
</SelectTrigger>`}</Code>
      </Section>

      <Section title="Props">
        <PropsTable
          rows={[
            ["SelectTrigger label", "string", "", "Floating label, as on Input"],
            ["SelectTrigger variant", '"filled" | "outlined"', '"filled"', ""],
            ["SelectTrigger size", '"default" | "sm"', '"default"', "56px or 48px"],
            ["SelectTrigger icon", "IconName", "", "Leading Material Symbol"],
            ["SelectTrigger description / error", "ReactNode", "", "Help text; error marks it invalid"],
            ["SelectTrigger className", "string", "", "On the field's wrapper; set the width here"],
            ["SelectItem icon / description", "IconName / ReactNode", "", "Shown in the list only, not in the field"],
            ["SelectItem iconPosition", '"start" | "end"', '"start"', "At the end, the icon sits opposite the label and the check moves to the start"],
            ["SelectContent position", '"popper" | "item-aligned"', '"popper"', "Below the field, or over it like macOS"],
          ]}
        />
      </Section>
    </>
  )
}
