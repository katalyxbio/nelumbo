"use client"

import * as React from "react"
import { Chip, ChipGroup, FilterChip, InputChip } from "@/registry/velvet/ui/chip"
import { type IconName } from "@/registry/velvet/ui/icon"
import { Code, PageHeader, Preview, PropsTable, Section } from "@/components/docs/primitives"

const CUISINES: { label: string; icon?: IconName }[] = [
  { label: "Coffee", icon: "local_cafe" },
  { label: "Bakery", icon: "bakery_dining" },
  { label: "Vegan", icon: "eco" },
  { label: "Open now", icon: "schedule" },
]
const TAGS = ["Design", "Engineering", "Research", "Writing", "Product", "Marketing", "Support"]
const PEOPLE = [
  { name: "Maya Lin", initials: "ML" },
  { name: "Theo Park", initials: "TP" },
  { name: "Ines Duarte", initials: "ID" },
]

export default function ChipPage() {
  const [tags, setTags] = React.useState<string[]>(["Design", "Research"])
  const [people, setPeople] = React.useState(PEOPLE)
  const [draft, setDraft] = React.useState("")
  const inputRef = React.useRef<HTMLInputElement>(null)

  const add = () => {
    const name = draft.trim()
    if (!name) return
    setPeople((p) => [...p, { name, initials: name.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase() }])
    setDraft("")
  }

  return (
    <>
      <PageHeader eyebrow="Component 14" title="Chip">
        Small, compact controls: an action, a filter, or a value someone entered. Chips share the small corner radius
        of text fields, so they read as part of a form rather than as buttons.
      </PageHeader>

      <Section title="Install">
        <Code>{`npx shadcn@latest add @velvet/chip`}</Code>
      </Section>

      <Section title="Assist" description="A shortcut to a related action, usually with an icon. Elevated chips stand out on images and maps.">
        <Preview>
          <Chip icon="event">Add to calendar</Chip>
          <Chip icon="directions">Directions</Chip>
          <Chip icon="share">Share</Chip>
          <Chip icon="call" disabled>
            Call
          </Chip>
        </Preview>
        <Preview className="bg-[linear-gradient(135deg,var(--brand-container),var(--surface-container-high))]!">
          <Chip elevated icon="event">
            Add to calendar
          </Chip>
          <Chip elevated icon="directions">
            Directions
          </Chip>
        </Preview>
      </Section>

      <Section
        title="Filter"
        description="Toggles, read out as pressed or not. When selected, a chip fills in and a check slides in. If it has an icon, the icon turns into the check."
      >
        <Preview className="flex-col items-start gap-5">
          <ChipGroup aria-label="Topics">
            {TAGS.map((t) => (
              <FilterChip
                key={t}
                selected={tags.includes(t)}
                onSelectedChange={(on) => setTags((old) => (on ? [...old, t] : old.filter((x) => x !== t)))}
              >
                {t}
              </FilterChip>
            ))}
          </ChipGroup>
          <ChipGroup aria-label="Places">
            {CUISINES.map((c, i) => (
              <FilterChip key={c.label} icon={c.icon} defaultSelected={i === 2}>
                {c.label}
              </FilterChip>
            ))}
            <FilterChip trailingIcon="arrow_drop_down">Price</FilterChip>
          </ChipGroup>
        </Preview>
      </Section>

      <Section title="Brand color" description="Selected filter chips can use the accent container.">
        <Preview>
          <ChipGroup aria-label="Plan">
            <FilterChip color="brand" defaultSelected>
              Monthly
            </FilterChip>
            <FilterChip color="brand">Yearly</FilterChip>
            <FilterChip color="brand" icon="bolt" defaultSelected>
              Fast shipping
            </FilterChip>
          </ChipGroup>
        </Preview>
      </Section>

      <Section
        title="Input"
        description="A value someone entered, such as a recipient or a tag, with a button to remove it. Backspace or Delete on that button removes the chip too."
      >
        <Preview>
          <div
            className="flex w-full flex-wrap items-center gap-2 rounded-field bg-surface-container-highest px-3 py-2.5 focus-within:outline-2 focus-within:outline-ring"
            onClick={() => inputRef.current?.focus()}
          >
            <span className="type-body-md text-muted-foreground">To</span>
            {people.map((p) => (
              <InputChip key={p.name} avatar={p.initials} onRemove={() => setPeople((old) => old.filter((x) => x.name !== p.name))}>
                {p.name}
              </InputChip>
            ))}
            <input
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === ",") {
                  e.preventDefault()
                  add()
                } else if (e.key === "Backspace" && !draft && people.length) {
                  setPeople((p) => p.slice(0, -1))
                }
              }}
              aria-label="Add recipient"
              placeholder={people.length ? "" : "Add people"}
              className="h-8 min-w-24 flex-1 bg-transparent type-body-md outline-none placeholder:text-muted-foreground"
            />
          </div>
        </Preview>
        <Preview>
          <InputChip icon="description" onRemove={() => {}}>
            brief.pdf
          </InputChip>
          <InputChip icon="tag">design-system</InputChip>
          <InputChip icon="tag" disabled onRemove={() => {}}>
            locked
          </InputChip>
        </Preview>
      </Section>

      <Section title="Suggestion" description="Suggested replies or searches, usually text only. Put them in a scrolling row on small screens.">
        <Preview className="flex-col items-stretch">
          <ChipGroup scroll aria-label="Suggested replies">
            {["Sounds good!", "Can we do 3pm instead?", "I'll send the files tonight", "Thanks, Maya", "Let's talk tomorrow"].map((s) => (
              <Chip key={s} variant="suggestion">
                {s}
              </Chip>
            ))}
          </ChipGroup>
        </Preview>
      </Section>

      <Section title="Usage">
        <Code>{`import { Chip, FilterChip, InputChip, ChipGroup } from "@/components/ui/chip"

<Chip icon="event">Add to calendar</Chip>

<ChipGroup aria-label="Topics">
  <FilterChip selected={design} onSelectedChange={setDesign}>Design</FilterChip>
  <FilterChip icon="eco">Vegan</FilterChip>
  <FilterChip trailingIcon="arrow_drop_down">Price</FilterChip>
</ChipGroup>

<InputChip avatar="ML" onRemove={() => remove("maya")}>Maya Lin</InputChip>`}</Code>
      </Section>

      <Section title="Props">
        <PropsTable
          rows={[
            ["Chip variant", '"assist" | "suggestion"', '"assist"', "A button; supports asChild"],
            ["icon / trailingIcon", "IconName", "", "Chip and FilterChip; InputChip takes icon"],
            ["elevated", "boolean", "false", "Chip and FilterChip: shadow instead of a border"],
            ["FilterChip selected", "boolean", "", "Controlled; or defaultSelected, with onSelectedChange"],
            ["FilterChip color", '"default" | "brand"', '"default"', "Selected fill"],
            ["InputChip avatar", "string | ReactNode", "", "Image URL, or initials in a circle"],
            ["InputChip onRemove", "() => void", "", "Shows the remove button"],
            ["ChipGroup scroll", "boolean", "false", "One scrolling row instead of wrapping"],
          ]}
        />
      </Section>
    </>
  )
}
