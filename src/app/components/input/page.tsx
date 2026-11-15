"use client"

import * as React from "react"
import { Input } from "@/registry/velvet/ui/input"
import { IconButton } from "@/registry/velvet/ui/icon-button"
import { Button } from "@/registry/velvet/ui/button"
import { Code, PageHeader, Preview, PropsTable, Section } from "@/components/docs/primitives"

const VARIANTS = ["filled", "outlined"] as const

export default function InputPage() {
  const [show, setShow] = React.useState(false)
  const [query, setQuery] = React.useState("velvet")
  const [phone, setPhone] = React.useState("+46 70 12")
  const phoneError = phone.replace(/\D/g, "").length < 10 ? "Enter the full number, with country code." : undefined

  return (
    <>
      <PageHeader eyebrow="Component 07" title="Input">
        A text field with a floating label. The label rests inside the field and moves up when you focus or type, so
        the field stays compact and is never left without a name.
      </PageHeader>

      <Section title="Install">
        <Code>{`npx shadcn@latest add @velvet/input`}</Code>
      </Section>

      <Section
        title="Variants"
        description="Filled is the default: a soft container with an underline that thickens on focus. Outlined puts the label in a gap in the top border. Click into the fields."
      >
        <div className="grid gap-4 md:grid-cols-2">
          {VARIANTS.map((v) => (
            <Preview key={v} label={v} className="flex-col items-stretch gap-5 bg-card dark:bg-card">
              <Input variant={v} label="Full name" icon="person" defaultValue="Maya Lindqvist" autoComplete="off" />
              <Input variant={v} label="Email" type="email" icon="mail" description="We send the receipt here." autoComplete="off" />
              <Input
                variant={v}
                label="Phone"
                type="tel"
                icon="call"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                error={phoneError}
                description="Ten digits or more."
                autoComplete="off"
              />
              <Input variant={v} label="Postal code" placeholder="e.g. 114 35" inputMode="numeric" description="Placeholder shows on focus." autoComplete="off" />
              <Input variant={v} label="Company" icon="apartment" defaultValue="Northwind Studio" disabled />
              <div className="flex gap-2">
                <Button>Continue</Button>
                <Button variant="ghost">Back</Button>
              </div>
            </Preview>
          ))}
        </div>
      </Section>

      <Section
        title="Sizes"
        description="Default is 56px. Use sm (48px) for dense forms and settings panels, and xs (36px) for toolbars and filters. xs drops the floating label: the label becomes the placeholder and still names the field for assistive tech. The icons and padding scale with it."
      >
        <div className="grid gap-4 md:grid-cols-2">
          {VARIANTS.map((v) => (
            <Preview key={v} label={v} className="flex-col items-stretch gap-4 bg-card dark:bg-card">
              {(["default", "sm"] as const).map((s) => (
                <Input key={s} variant={v} size={s} label={s === "sm" ? "City (sm)" : "City (default)"} icon="location_on" defaultValue="Stockholm" autoComplete="off" />
              ))}
              <Input variant={v} size="xs" label="Search people (xs)" icon="search" autoComplete="off" />
            </Preview>
          ))}
        </div>
      </Section>

      <Section
        title="Trailing actions"
        description="Put an Icon Button in the trailing slot to reveal a password or clear a search. Use size sm so it fits the field."
      >
        <Preview className="grid gap-5 sm:grid-cols-2">
          <Input
            label="Password"
            icon="lock"
            type={show ? "text" : "password"}
            defaultValue="correct horse"
            autoComplete="off"
            trailing={
              <IconButton
                toggle
                size="sm"
                icon="visibility"
                selectedIcon="visibility_off"
                label={show ? "Hide password" : "Show password"}
                pressed={show}
                onPressedChange={setShow}
              />
            }
          />
          <Input
            variant="outlined"
            label="Search"
            icon="search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoComplete="off"
            trailing={query && <IconButton size="sm" icon="close" label="Clear search" onClick={() => setQuery("")} />}
          />
        </Preview>
      </Section>

      <Section
        title="Without a label"
        description="Leave out label for search bars and inline edits. The placeholder then stays visible. Give the field an aria-label instead."
      >
        <Preview className="grid gap-5 sm:grid-cols-2">
          <Input icon="search" placeholder="Search files" aria-label="Search files" />
          <Input variant="outlined" icon="link" placeholder="Paste a link" aria-label="Link" />
        </Preview>
      </Section>

      <Section
        title="On any background"
        description="The gap in the outlined border is cut out of the border, not painted over it, so the background shows through."
      >
        <div className="grid gap-5 rounded-3xl bg-linear-to-br from-blue-container via-purple-container to-pink-container p-6 sm:grid-cols-2">
          <Input variant="outlined" label="Workspace name" defaultValue="Northwind" autoComplete="off" />
          <Input variant="outlined" label="Invite by email" icon="mail" autoComplete="off" />
        </div>
      </Section>

      <Section title="Usage">
        <Code>{`import { Input } from "@/components/ui/input"

<Input label="Email" type="email" icon="mail" description="We send the receipt here." />
<Input variant="outlined" label="Phone" error="Enter the full number." />

// react-hook-form: ref and field props go to the <input>
<Input label="Name" {...register("name")} error={errors.name?.message} />`}</Code>
      </Section>

      <Section title="Props" description="className goes to the wrapper; all other props and the ref go to the <input>.">
        <PropsTable
          rows={[
            ["label", "string", "", "Floating label. Leave out for search bars (then set aria-label)"],
            ["variant", '"filled" | "outlined"', '"filled"', ""],
            ["size", '"default" | "sm" | "xs"', '"default"', "56px, 48px, or 36px compact with the label as placeholder"],
            ["icon", "IconName", "", "Leading Material Symbol"],
            ["trailing", "ReactNode", "", "Trailing slot, e.g. an Icon Button with size sm"],
            ["description", "ReactNode", "", "Help text, linked with aria-describedby"],
            ["error", "ReactNode | boolean", "", "Marks the field invalid; a message replaces the description"],
            ["placeholder", "string", "", "With a label, shown only while focused"],
          ]}
        />
      </Section>
    </>
  )
}
