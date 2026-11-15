"use client"

import * as React from "react"
import { Switch } from "@/registry/nelumbo/ui/switch"
import { Icon, type IconName } from "@/registry/nelumbo/ui/icon"
import { Code, PageHeader, Preview, PropsTable, Section } from "@/components/docs/primitives"

const SETTINGS: { id: string; icon: IconName; title: string; body: string; on: boolean; disabled?: boolean }[] = [
  { id: "wifi", icon: "wifi", title: "Wi-Fi", body: "Connect to known networks automatically.", on: true },
  { id: "bluetooth", icon: "bluetooth", title: "Bluetooth", body: "Visible to nearby devices while settings are open.", on: false },
  { id: "dnd", icon: "do_not_disturb_on", title: "Do not disturb", body: "Silence calls and alerts until 7:00.", on: true },
  { id: "location", icon: "location_on", title: "Location history", body: "Managed by your organization.", on: false, disabled: true },
]

function Labelled({ children, text }: { children: React.ReactNode; text: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      {children}
      <span className="type-label-sm text-muted-foreground">{text}</span>
    </div>
  )
}

export default function SwitchPage() {
  const [values, setValues] = React.useState(() => Object.fromEntries(SETTINGS.map((s) => [s.id, s.on])))

  return (
    <>
      <PageHeader eyebrow="Component 09" title="Switch">
        Turns one setting on or off, right away. Off, the thumb is small and quiet; on, it grows and slides across a
        filled track. Press and hold to feel it swell.
      </PageHeader>

      <Section title="Install">
        <Code>{`npx shadcn@latest add @nelumbo/switch`}</Code>
      </Section>

      <Section title="States" description="Black when on, white in dark mode. Hover shows a soft halo around the thumb.">
        <Preview className="gap-8">
          <Labelled text="off">
            <Switch aria-label="Example, off" />
          </Labelled>
          <Labelled text="on">
            <Switch aria-label="Example, on" defaultChecked />
          </Labelled>
          <Labelled text="disabled">
            <Switch aria-label="Example, disabled" disabled />
          </Labelled>
          <Labelled text="disabled on">
            <Switch aria-label="Example, disabled on" disabled defaultChecked />
          </Labelled>
        </Preview>
      </Section>

      <Section
        title="Icons"
        description="A check and a cross inside the thumb make the state readable without color. The thumb stays full size in both states."
      >
        <Preview className="gap-8">
          <Labelled text="off">
            <Switch icons aria-label="With icons, off" />
          </Labelled>
          <Labelled text="on">
            <Switch icons aria-label="With icons, on" defaultChecked />
          </Labelled>
        </Preview>
      </Section>

      <Section title="Brand color" description="For a switch that should carry the accent, for example a feature you are promoting.">
        <Preview className="gap-8">
          <Switch color="brand" aria-label="Brand, off" />
          <Switch color="brand" aria-label="Brand, on" defaultChecked />
          <Switch color="brand" icons aria-label="Brand with icons, on" defaultChecked />
        </Preview>
      </Section>

      <Section title="Sizes" description="Default (52 × 32) and sm (40 × 24), for dense lists and table rows.">
        <Preview className="gap-8">
          <Labelled text="default">
            <Switch aria-label="Default size" defaultChecked />
          </Labelled>
          <Labelled text="sm">
            <Switch size="sm" aria-label="Small size" defaultChecked />
          </Labelled>
          <Labelled text="sm, icons">
            <Switch size="sm" icons aria-label="Small size with icons" defaultChecked />
          </Labelled>
        </Preview>
      </Section>

      <Section
        title="In a settings list"
        description="Wrap the row in a label, so clicking anywhere on it flips the switch. The title names the switch, and the description is read with it."
      >
        <div className="overflow-hidden rounded-3xl bg-card shadow-e1">
          {SETTINGS.map((s, i) => (
            <label
              key={s.id}
              htmlFor={`setting-${s.id}`}
              className={
                "state-layer flex items-center gap-4 px-5 py-4 hover:after:opacity-[0.04] " +
                (s.disabled ? "cursor-not-allowed" : "cursor-pointer") +
                (i > 0 ? " border-t border-border" : "")
              }
            >
              <Icon name={s.icon} className={s.disabled ? "text-muted-foreground/60" : "text-muted-foreground"} />
              <span className="flex min-w-0 flex-1 flex-col">
                <span className={"type-title-sm " + (s.disabled ? "text-muted-foreground" : "")}>{s.title}</span>
                <span id={`setting-${s.id}-desc`} className="type-body-sm text-muted-foreground">
                  {s.body}
                </span>
              </span>
              <Switch
                id={`setting-${s.id}`}
                aria-describedby={`setting-${s.id}-desc`}
                checked={values[s.id]}
                onCheckedChange={(v) => setValues((old) => ({ ...old, [s.id]: v }))}
                disabled={s.disabled}
              />
            </label>
          ))}
        </div>
      </Section>

      <Section title="Usage">
        <Code>{`import { Switch } from "@/components/ui/switch"

<label className="flex items-center justify-between gap-4">
  Wi-Fi
  <Switch checked={wifi} onCheckedChange={setWifi} />
</label>

<Switch icons color="brand" aria-label="Beta features" />`}</Code>
      </Section>

      <Section title="Props" description="Other props go to Radix Switch (checked, defaultChecked, onCheckedChange, name, required…).">
        <PropsTable
          rows={[
            ["icons", "boolean", "false", "Check and cross inside the thumb"],
            ["color", '"default" | "brand"', '"default"', ""],
            ["size", '"default" | "sm"', '"default"', "52 × 32 or 40 × 24"],
          ]}
        />
      </Section>
    </>
  )
}
