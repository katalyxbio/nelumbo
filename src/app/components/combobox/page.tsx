"use client"

import * as React from "react"
import { Combobox, type ComboboxOption } from "@/registry/nelumbo/ui/combobox"
import { LOCATIONS } from "@/components/docs/locations"
import { SegmentedButton, SegmentedButtonItem } from "@/registry/nelumbo/ui/segmented-button"
import { Code, PageHeader, Preview, PropsTable, Section } from "@/components/docs/primitives"

const VARIANTS = ["filled", "outlined"] as const

const COUNTRIES: ComboboxOption[] = [
  ["AR", "Argentina"], ["AU", "Australia"], ["AT", "Austria"], ["BE", "Belgium"], ["BR", "Brazil"], ["CA", "Canada"],
  ["CL", "Chile"], ["CO", "Colombia"], ["CI", "Côte d’Ivoire"], ["HR", "Croatia"], ["CW", "Curaçao"], ["CZ", "Czechia"],
  ["DK", "Denmark"], ["EG", "Egypt"], ["EE", "Estonia"], ["FI", "Finland"], ["FR", "France"], ["DE", "Germany"],
  ["GR", "Greece"], ["IS", "Iceland"], ["IN", "India"], ["IE", "Ireland"], ["IT", "Italy"], ["JP", "Japan"],
  ["KE", "Kenya"], ["MX", "Mexico"], ["NL", "Netherlands"], ["NZ", "New Zealand"], ["NO", "Norway"], ["PE", "Peru"],
  ["PL", "Poland"], ["PT", "Portugal"], ["RE", "Réunion"], ["SN", "Senegal"], ["SG", "Singapore"], ["KR", "South Korea"],
  ["ES", "Spain"], ["SE", "Sweden"], ["CH", "Switzerland"], ["TR", "Türkiye"], ["GB", "United Kingdom"], ["US", "United States"],
  ["UY", "Uruguay"], ["VN", "Vietnam"],
].map(([value, label]) => ({ value, label, keywords: [value] }))

const LABELS = ["Bug", "Design", "Documentation", "Accessibility", "Performance", "Good first issue", "Needs review", "Blocked", "Mobile", "Desktop"]

const PEOPLE: ComboboxOption[] = [
  { value: "ana", label: "Ana Oliveira", description: "Product design", group: "Design", icon: "person" },
  { value: "kenji", label: "Kenji Watanabe", description: "Motion and prototyping", group: "Design", icon: "person" },
  { value: "lea", label: "Léa Martin", description: "Design systems", group: "Design", icon: "person" },
  { value: "omar", label: "Omar Haddad", description: "Frontend", group: "Engineering", icon: "person" },
  { value: "sofia", label: "Sofía Ramírez", description: "Platform", group: "Engineering", icon: "person" },
  { value: "tomas", label: "Tomás Novák", description: "On leave until Monday", group: "Engineering", icon: "person", disabled: true },
  { value: "bots", label: "Release bot", description: "Runs the changelog", group: "Automations", icon: "smart_toy" },
]

const STATUSES: ComboboxOption[] = [
  { value: "backlog", label: "Backlog", icon: "radio_button_unchecked" },
  { value: "todo", label: "To do", icon: "circle" },
  { value: "progress", label: "In progress", icon: "clock_loader_40" },
  { value: "review", label: "In review", icon: "rate_review" },
  { value: "done", label: "Done", icon: "check_circle" },
  { value: "cancelled", label: "Cancelled", icon: "cancel" },
]

const CITIES = [
  "Amsterdam", "Athens", "Auckland", "Barcelona", "Berlin", "Bogotá", "Brussels", "Buenos Aires", "Cairo", "Cape Town",
  "Copenhagen", "Dublin", "Edinburgh", "Helsinki", "Istanbul", "Kraków", "Kyoto", "Lagos", "Lisbon", "London", "Lyon",
  "Madrid", "Marrakesh", "Melbourne", "Mexico City", "Milan", "Montréal", "Munich", "Nairobi", "Oslo", "Paris", "Porto",
  "Prague", "Reykjavík", "Rome", "São Paulo", "Seoul", "Seville", "Singapore", "Stockholm", "Sydney", "Tokyo", "Toronto",
  "Valencia", "Vancouver", "Vienna", "Warsaw", "Zürich",
]
const fold = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase()

/** Pretend server search: 600ms per request, the latest wins. */
function useCitySearch() {
  const [query, setQuery] = React.useState("")
  const [results, setResults] = React.useState<string[]>([])
  const [loading, setLoading] = React.useState(false)
  React.useEffect(() => {
    const q = fold(query.trim())
    if (!q) {
      setResults([])
      setLoading(false)
      return
    }
    setLoading(true)
    const t = setTimeout(() => {
      setResults(CITIES.filter((c) => fold(c).startsWith(q)))
      setLoading(false)
    }, 600)
    return () => clearTimeout(t)
  }, [query])
  return { query, setQuery, results, loading }
}

export default function ComboboxPage() {
  const [country, setCountry] = React.useState<string | null>("SE")
  const [labels, setLabels] = React.useState(["Design", "Accessibility"])
  const [assignee, setAssignee] = React.useState<string | null>(null)
  const [city, setCity] = React.useState<string | null>(null)
  const search = useCitySearch()
  const [office, setOffice] = React.useState<string | null>("Sweden")
  const [markets, setMarkets] = React.useState(["Japan", "Brazil"])
  const [style, setStyle] = React.useState<"cascade" | "drill">("cascade")
  const [submitted, setSubmitted] = React.useState<string | null>(null)

  return (
    <>
      <PageHeader eyebrow="Component 25" title="Combobox">
        A field you type into to find an option in a long list. Typing filters the list and bolds what matched,
        ignoring case and accents, so “cura” finds Curaçao. With multiple, choices become chips inside the field.
      </PageHeader>

      <Section title="Install">
        <Code>{`npx shadcn@latest add @nelumbo/combobox`}</Code>
      </Section>

      <Section
        title="Variants"
        description="The same field as Input and Select. Type to filter, ↑ and ↓ to move, Enter to choose, Escape to put the old value back. Country codes match too: try “ch”."
      >
        <div className="grid gap-4 md:grid-cols-2">
          {VARIANTS.map((v) => (
            <Preview key={v} label={v} className="flex-col items-stretch gap-5 bg-card dark:bg-card">
              <Combobox
                variant={v}
                label="Country"
                icon="public"
                options={COUNTRIES}
                value={country}
                onValueChange={setCountry}
                description="Where your invoices are sent."
              />
              <Combobox variant={v} label="Country of birth" options={COUNTRIES} placeholder="Start typing a country" emptyMessage="No countries match" />
              <Combobox variant={v} label="Billing country" options={COUNTRIES} defaultValue="FR" disabled />
            </Preview>
          ))}
        </div>
      </Section>

      <Section
        title="Multiple"
        description="Choices become chips and the field grows when they wrap. The list stays open while you pick, and Backspace in the empty input removes the last chip."
      >
        <div className="grid gap-4 md:grid-cols-2">
          {VARIANTS.map((v) => (
            <Preview key={v} label={v} className="flex-col items-stretch gap-5 bg-card dark:bg-card">
              <Combobox
                multiple
                variant={v}
                label="Labels"
                icon="label"
                options={LABELS}
                value={labels}
                onValueChange={setLabels}
                description={`${labels.length} selected`}
              />
              <Combobox multiple variant={v} label="Notify" options={PEOPLE} placeholder="Add people" />
            </Preview>
          ))}
        </div>
      </Section>

      <Section
        title="Groups, icons and descriptions"
        description="Options with a group are listed under it. Icons and descriptions show in the list; disabled options are skipped by the keyboard."
      >
        <Preview className="flex-col items-stretch">
          <Combobox
            label="Assign to"
            icon="assignment_ind"
            options={PEOPLE}
            value={assignee}
            onValueChange={setAssignee}
            className="max-w-sm"
          />
        </Preview>
      </Section>

      <Section
        title="Icons at the end"
        description='iconPosition="end" puts icons at the far end, opposite the label, for the whole list or per option. In a single choice, the check moves to the start.'
      >
        <Preview className="flex-col items-stretch">
          <Combobox label="Status" options={STATUSES} defaultValue="progress" iconPosition="end" className="max-w-sm" />
        </Preview>
      </Section>

      <Section
        title="Nested"
        description="Options with children open level by level. Cascade (the default) opens each level beside its parent, like a desktop menu; drill shows one level at a time with a back row. → or Enter goes in, ← comes back. Typing searches every level at once and groups the matches by path: try “nor” or “nordics”. A parent shows what you chose inside it. On a phone it always drills."
      >
        <SegmentedButton type="single" value={style} onValueChange={(v) => v && setStyle(v as "cascade" | "drill")} aria-label="Nested style" className="mb-4">
          <SegmentedButtonItem value="cascade">Cascade</SegmentedButtonItem>
          <SegmentedButtonItem value="drill">Drill</SegmentedButtonItem>
        </SegmentedButton>
        <div className="grid gap-4 md:grid-cols-2">
          <Preview label="single" className="flex-col items-stretch bg-card dark:bg-card">
            <Combobox label="Office" icon="location_on" options={LOCATIONS} value={office} onValueChange={setOffice} iconPosition="end" nestedStyle={style} />
          </Preview>
          <Preview label="multiple" className="flex-col items-stretch bg-card dark:bg-card">
            <Combobox multiple label="Markets" options={LOCATIONS} value={markets} onValueChange={setMarkets} iconPosition="end" nestedStyle={style} />
          </Preview>
        </div>
        <Code>{`const locations = [
  {
    value: "europe", label: "Europe", icon: "euro",
    children: [
      { value: "nordics", label: "Nordics", children: ["Denmark", "Finland", "Sweden"] },
      { value: "western", label: "Western Europe", children: ["France", "Ireland"] },
    ],
  },
  { value: "remote", label: "Anywhere (remote)" },
]

<Combobox label="Office" options={locations} value={office} onValueChange={setOffice} />`}</Code>
      </Section>

      <Section
        title="Searching a server"
        description="Turn off local filtering with filter={false}, search in onInputValueChange, and set loading while the request runs."
      >
        <Preview className="flex-col items-stretch">
          <Combobox
            variant="outlined"
            label="City"
            icon="location_on"
            options={search.results}
            filter={false}
            loading={search.loading}
            onInputValueChange={search.setQuery}
            value={city}
            onValueChange={setCity}
            emptyMessage={search.query.trim() ? "No cities found" : "Type to search cities"}
            className="max-w-sm"
          />
        </Preview>
        <Code>{`const [query, setQuery] = React.useState("")
const { data = [], isLoading } = useQuery({ queryKey: ["cities", query], queryFn: () => searchCities(query) })

<Combobox
  label="City"
  options={data}
  filter={false}
  loading={isLoading}
  onInputValueChange={setQuery}
  value={city}
  onValueChange={setCity}
/>`}</Code>
      </Section>

      <Section title="In a form" description="Give it a name to submit the value, one entry per chip with multiple.">
        <Preview className="flex-col items-stretch">
          <form
            className="flex max-w-sm flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault()
              const data = new FormData(e.currentTarget)
              setSubmitted(JSON.stringify({ country: data.get("country"), tags: data.getAll("tags") }))
            }}
          >
            <Combobox name="country" label="Ship to" options={COUNTRIES} defaultValue="JP" />
            <Combobox name="tags" multiple label="Tags" options={LABELS} defaultValue={["Mobile"]} />
            <button type="submit" className="sr-only">
              Submit
            </button>
            <p className="type-body-sm text-muted-foreground" aria-live="polite">
              {submitted ? `Submitted ${submitted}` : "Press Enter in a closed field to submit."}
            </p>
          </form>
        </Preview>
      </Section>

      <Section title="Usage">
        <Code>{`import { Combobox } from "@/components/ui/combobox"

// options are strings, or { value, label, description?, icon?, group?, keywords?, disabled? }
<Combobox label="Country" options={countries} value={country} onValueChange={setCountry} />

<Combobox multiple label="Labels" options={["Bug", "Design", "Docs"]} value={labels} onValueChange={setLabels} />`}</Code>
      </Section>

      <Section title="Props">
        <PropsTable
          rows={[
            ["options", "(string | ComboboxOption)[]", "", "{ value, label, description?, icon?, iconPosition?, group?, keywords?, disabled?, children? }"],
            ["option children", "(string | ComboboxOption)[]", "", "Makes it a parent that opens a nested panel"],
            ["iconPosition", '"start" | "end"', '"start"', "Option icons before the label or at the far end"],
            ["nestedStyle", '"cascade" | "drill"', '"cascade"', "Side menus, or one panel at a time; phones always drill"],
            ["searchable", "boolean", "true", "false makes it a select (NestedSelect)"],
            ["displayPath", "boolean", "false", "Show the chosen option's path in the field"],
            ["value / defaultValue", "string | null, or string[] with multiple", "", "onValueChange gets the same type"],
            ["multiple", "boolean", "false", "Chips in the field; the list stays open"],
            ["inputValue / onInputValueChange", "string / (text) => void", "", "The typed text"],
            ["filter", "false | (option, query) => boolean", "label and keywords, ignoring case and accents", "false for server search"],
            ["loading", "boolean", "false", "Spinner in the field, and in an empty list"],
            ["emptyMessage", "ReactNode", '"No results"', ""],
            ["clearable", "boolean", "true", "Clear button once there's a value"],
            ["name", "string", "", "Hidden input(s) for forms"],
            ["label, variant, size, icon, description, error", "", "", "As on Input"],
          ]}
        />
      </Section>
    </>
  )
}
