"use client"

import * as React from "react"
import {
  SearchBar,
  SearchView,
  SearchViewEmpty,
  SearchViewFilters,
  SearchViewGroup,
  SearchViewItem,
  SearchViewList,
} from "@/registry/nelumbo/ui/search"
import { Avatar } from "@/registry/nelumbo/ui/avatar"
import { FilterChip } from "@/registry/nelumbo/ui/chip"
import { IconButton } from "@/registry/nelumbo/ui/icon-button"
import { Icon, type IconName } from "@/registry/nelumbo/ui/icon"
import { Code, PageHeader, Preview, PropsTable, Section } from "@/components/docs/primitives"

type Kind = "People" | "Docs" | "Files"
type Entry = { id: string; title: string; detail: string; kind: Kind; icon: IconName; person?: boolean }

const DATASET: Entry[] = [
  { id: "maya", title: "Maya Kowalski", detail: "Design lead, Berlin", kind: "People", icon: "person", person: true },
  { id: "arjun", title: "Arjun Patel", detail: "Engineering, Bengaluru", kind: "People", icon: "person", person: true },
  { id: "lena", title: "Lena Fischer", detail: "Research, Zurich", kind: "People", icon: "person", person: true },
  { id: "tomas", title: "Tomas Rivera", detail: "Support, Lisbon", kind: "People", icon: "person", person: true },
  { id: "keiko", title: "Keiko Tanaka", detail: "Product, Tokyo", kind: "People", icon: "person", person: true },
  { id: "d1", title: "Getting started", detail: "Install the theme and your first component", kind: "Docs", icon: "rocket_launch" },
  { id: "d2", title: "Theming and tokens", detail: "Brand accent, neutrals and the surface ladder", kind: "Docs", icon: "palette" },
  { id: "d3", title: "Motion and springs", detail: "Easings, durations and reduced motion", kind: "Docs", icon: "animation" },
  { id: "d4", title: "Accessibility", detail: "Contrast rules, focus and keyboard support", kind: "Docs", icon: "accessibility_new" },
  { id: "f1", title: "Q3 planning notes", detail: "Edited yesterday by Maya", kind: "Files", icon: "description" },
  { id: "f2", title: "Brand assets", detail: "Folder with 48 items", kind: "Files", icon: "folder" },
  { id: "f3", title: "Roadmap 2027", detail: "Slides, shared with the team", kind: "Files", icon: "slideshow" },
]

const KINDS: Kind[] = ["People", "Docs", "Files"]

/** Bolds the part of a title that matches the query. */
function Match({ text, query }: { text: string; query: string }) {
  const q = query.trim()
  const at = q ? text.toLowerCase().indexOf(q.toLowerCase()) : -1
  if (at < 0) return <>{text}</>
  return (
    <>
      {text.slice(0, at)}
      <span className="font-semibold">{text.slice(at, at + q.length)}</span>
      {text.slice(at + q.length)}
    </>
  )
}

function DemoView({ labelSuffix = "" }: { labelSuffix?: string }) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [kinds, setKinds] = React.useState<Kind[]>([])
  const [recent, setRecent] = React.useState(["Maya", "Accessibility", "Roadmap 2027"])
  const [opened, setOpened] = React.useState<string | null>(null)

  const q = query.trim().toLowerCase()
  const results = DATASET.filter(
    (e) => (kinds.length === 0 || kinds.includes(e.kind)) && (!q || `${e.title} ${e.detail}`.toLowerCase().includes(q))
  )
  const remember = (term: string) => {
    const t = term.trim()
    if (t) setRecent((r) => [t, ...r.filter((x) => x.toLowerCase() !== t.toLowerCase())].slice(0, 5))
  }
  const toggle = (k: Kind) => setKinds((s) => (s.includes(k) ? s.filter((x) => x !== k) : [...s, k]))

  return (
    <div className="flex w-full max-w-xl flex-col gap-4">
      <SearchView
        open={open}
        onOpenChange={setOpen}
        value={query}
        onValueChange={setQuery}
        onSubmit={remember}
        label={`Search the workspace${labelSuffix}`}
        placeholder="Search people, docs and files"
        trailing={<IconButton label="Voice search" icon="mic" />}
        avatar={<Avatar name="Maya Kowalski" size="sm" color="auto" />}
      >
        <SearchViewFilters aria-label="Filter by type">
          {KINDS.map((k) => (
            <FilterChip key={k} selected={kinds.includes(k)} onSelectedChange={() => toggle(k)}>
              {k}
            </FilterChip>
          ))}
        </SearchViewFilters>
        <SearchViewList aria-label="Search results">
          {!q && recent.length > 0 && (
            <SearchViewGroup heading="Recent searches">
              {recent.map((term) => (
                <SearchViewItem
                  key={term}
                  icon="history"
                  onSelect={() => setQuery(term)}
                  onRemove={() => setRecent((r) => r.filter((x) => x !== term))}
                  removeLabel={`Remove ${term} from recent searches`}
                >
                  {term}
                </SearchViewItem>
              ))}
            </SearchViewGroup>
          )}
          {(q || kinds.length > 0) &&
            (results.length > 0 ? (
              <SearchViewGroup heading={`${results.length} ${results.length === 1 ? "result" : "results"}`}>
                {results.map((e) => (
                  <SearchViewItem
                    key={e.id}
                    {...(e.person ? { leading: <Avatar name={e.title} size="sm" color="auto" /> } : { icon: e.icon })}
                    description={e.detail}
                    meta={e.kind}
                    onSelect={() => {
                      remember(query || e.title)
                      setOpened(e.title)
                    }}
                  >
                    <Match text={e.title} query={query} />
                  </SearchViewItem>
                ))}
              </SearchViewGroup>
            ) : (
              <SearchViewEmpty>
                <Icon name="search_off" size={28} />
                No results for “{query}”.
              </SearchViewEmpty>
            ))}
          {!q && kinds.length === 0 && recent.length === 0 && (
            <SearchViewEmpty>
              <Icon name="history" size={28} />
              Your recent searches show up here.
            </SearchViewEmpty>
          )}
        </SearchViewList>
      </SearchView>
      <p className="type-body-md text-muted-foreground" role="status">
        {opened ? `Opened: ${opened}` : "Pick a result with the arrow keys and Enter."}
      </p>
    </div>
  )
}

export default function SearchPage() {
  const [text, setText] = React.useState("")
  const [submitted, setSubmitted] = React.useState<string | null>(null)

  return (
    <>
      <PageHeader eyebrow="Component 55" title="Search">
        A search bar is a pill that holds a query; a search view is what it grows into, a docked panel on
        desktop and a full-screen view on phones, with recent searches, filters and results as a list. The
        command palette&apos;s text field is the same field.
      </PageHeader>

      <Section title="Install">
        <Code>{`npx shadcn@latest add @nelumbo/search`}</Code>
      </Section>

      <Section
        title="Search bar"
        description="A full pill on surface-container-high with no border; it lifts a little on hover and focus. The leading slot holds the search icon or a navigation icon button, trailing slots take icon buttons and an avatar. The clear button springs in as soon as there is text."
      >
        <Preview className="flex-col items-stretch gap-6">
          <SearchBar label="Search with menu and avatar" leading={<IconButton label="Menu" icon="menu" />} avatar={<Avatar name="Maya Kowalski" size="sm" color="auto" />} />
          <SearchBar
            label="Search with voice"
            placeholder="Search"
            trailing={<IconButton label="Voice search" icon="mic" />}
            value={text}
            onValueChange={setText}
            onSubmit={setSubmitted}
          />
          <SearchBar label="Small search" size="sm" placeholder="Search" />
          <SearchBar label="Extra small search" size="xs" placeholder="Search" defaultValue="Nelumbo" />
        </Preview>
        <p className="type-body-md text-muted-foreground" role="status">
          {submitted !== null ? `Submitted: ${submitted || "(empty)"}` : "Type in the second bar and press Enter."}
        </p>
      </Section>

      <Section
        title="Search view"
        description="Click or tab into the field. The bar's pill morphs into a panel whose height springs with its content, and the leading icon turns into a back arrow. Type to filter, move with ArrowUp and ArrowDown (the highlighted row sits on a raised pill that springs between rows), Enter to open a result, Escape to close; the focus stays in the field. Shift+Delete forgets a recent search, and so does its close button."
      >
        <Preview className="min-h-[32rem] items-start justify-center">
          <DemoView />
        </Preview>
      </Section>

      <Section
        title="Phones"
        description="Under 640px the same view opens full screen: the bar grows to fill the screen, the back arrow sits next to the input, the results fill the rest and the page behind stops scrolling. Tab stays inside it. Resize this window below 640px, or open the page on a phone, and open the search above."
      >
        <Preview className="justify-center">
          <div className="flex max-w-md items-start gap-3 type-body-md text-muted-foreground">
            <Icon name="smartphone" className="mt-0.5" />
            <p>Back, Escape or picking a result folds the view back into the bar.</p>
          </div>
        </Preview>
      </Section>

      <Section
        title="In the command palette"
        description="CommandInput is built from the same SearchField: a pill with the search icon and a clear button that springs in, with cmdk's own input inside (type search). Clearing empties cmdk's search whether it is controlled or not."
      >
        <Code>{`import { SearchField, searchInputClasses } from "@/components/ui/search"

<SearchField size="sm" embedded hasValue={value.length > 0} onClear={() => setValue("")}>
  <input className={searchInputClasses} value={value} onChange={(e) => setValue(e.target.value)} />
</SearchField>`}</Code>
      </Section>

      <Section title="Usage">
        <Code>{`import {
  SearchBar, SearchView, SearchViewFilters, SearchViewList,
  SearchViewGroup, SearchViewItem, SearchViewEmpty,
} from "@/components/ui/search"

<SearchBar label="Search the docs" value={q} onValueChange={setQ} onSubmit={run} />

<SearchView value={q} onValueChange={setQ} label="Search contacts" trailing={<IconButton label="Voice" icon="mic" />}>
  <SearchViewFilters aria-label="Filter by type">
    <FilterChip selected={people} onSelectedChange={setPeople}>People</FilterChip>
  </SearchViewFilters>
  <SearchViewList aria-label="Results">
    <SearchViewGroup heading="Recent searches">
      <SearchViewItem icon="history" onSelect={() => setQ("Maya")} onRemove={() => forget("Maya")}>
        Maya
      </SearchViewItem>
    </SearchViewGroup>
    {results.length === 0 && <SearchViewEmpty>No results</SearchViewEmpty>}
  </SearchViewList>
</SearchView>`}</Code>
      </Section>

      <Section title="Props">
        <PropsTable
          rows={[
            ["SearchBar value / defaultValue / onValueChange", "string / string / (value) => void", "", "Controlled or uncontrolled text"],
            ["SearchBar size", '"default" | "sm" | "xs"', '"default"', "56px, 48px or 40px tall"],
            ["SearchBar leading", "ReactNode | null", "search icon", "The search icon, or an IconButton such as menu"],
            ["SearchBar trailing / avatar", "ReactNode", "", "IconButtons after the clear button; an Avatar at the end"],
            ["SearchBar label", "string", "placeholder", "Names the search landmark and the input; give each bar its own"],
            ["SearchBar onSubmit / onClear", "(value) => void / () => void", "", "Enter; after the clear button empties the field"],
            ["SearchView open / defaultOpen / onOpenChange", "boolean / boolean / (open) => void", "", "Controlled or uncontrolled expansion"],
            ["SearchView value / onValueChange / onSubmit", "string / (value) => void", "", "Query text; onSubmit runs on Enter with nothing highlighted"],
            ["SearchView leading / trailing / avatar / size", "", "", "Like SearchBar; the leading slot turns into a back arrow while open"],
            ["SearchView closeOnSelect", "boolean", "true", "Close after a result is picked"],
            ["SearchViewFilters", "div props", "", "A scrolling row for FilterChips; give it an aria-label"],
            ["SearchViewList", "div props", "", "The listbox, with the raised pill that springs between rows"],
            ["SearchViewGroup heading", "ReactNode", "", "A muted label above a run of options, no rule"],
            ["SearchViewItem onSelect / onRemove", "() => void", "", "Enter or click; a remove button and Shift+Delete"],
            ["SearchViewItem icon / leading / description / meta / trailing", "", "", "Nelumbo ListItem props"],
            ["SearchViewEmpty", "ReactNode", "", "Shown when nothing matches, announced politely"],
            ["SearchField / searchFieldClasses", "", "", "The shared pill field and its classes, used by Command"],
          ]}
        />
      </Section>
    </>
  )
}
