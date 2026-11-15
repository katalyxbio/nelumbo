"use client"

import * as React from "react"
import { Collapsible, CollapsibleChevron, CollapsibleContent, CollapsibleTrigger } from "@/registry/velvet/ui/collapsible"
import { Button } from "@/registry/velvet/ui/button"
import { Icon, type IconName } from "@/registry/velvet/ui/icon"
import { Code, PageHeader, Preview, PropsTable, Section } from "@/components/docs/primitives"

const REVIEWERS = [
  ["Maya Kowalski", "Approved"],
  ["Kenji Watanabe", "Requested changes"],
  ["Léa Martin", "Approved"],
  ["Omar Haddad", "Pending"],
  ["Sofía Ramírez", "Pending"],
  ["Tomás Novák", "Approved"],
]

function ReviewerList() {
  const [open, setOpen] = React.useState(false)
  return (
    <Collapsible open={open} onOpenChange={setOpen} className="w-full max-w-sm rounded-2xl bg-card p-2 shadow-e1 dark:bg-surface-container-high">
      <p className="px-3 pt-2 pb-1 type-title-sm">Reviewers</p>
      <ul className="flex flex-col">
        {REVIEWERS.slice(0, 3).map(([n, s]) => (
          <li key={n} className="flex items-center justify-between gap-3 rounded-xl px-3 py-2 type-body-md">
            {n}
            <span className="text-muted-foreground">{s}</span>
          </li>
        ))}
      </ul>
      <CollapsibleContent>
        <ul className="flex flex-col">
          {REVIEWERS.slice(3).map(([n, s]) => (
            <li key={n} className="flex items-center justify-between gap-3 rounded-xl px-3 py-2 type-body-md">
              {n}
              <span className="text-muted-foreground">{s}</span>
            </li>
          ))}
        </ul>
      </CollapsibleContent>
      <CollapsibleTrigger chevron className="mt-1 ml-1">
        {open ? "Show fewer" : "Show 3 more"}
      </CollapsibleTrigger>
    </Collapsible>
  )
}

type Node = { name: string; children?: Node[]; icon?: IconName }
const TREE: Node[] = [
  {
    name: "src",
    children: [
      {
        name: "components",
        children: [{ name: "button.tsx" }, { name: "dialog.tsx" }, { name: "hover-card.tsx" }],
      },
      { name: "lib", children: [{ name: "utils.ts" }] },
      { name: "app.tsx" },
    ],
  },
  { name: "public", children: [{ name: "logo.svg" }] },
  { name: "package.json" },
]

function Folder({ node, defaultOpen = false }: { node: Node; defaultOpen?: boolean }) {
  const [open, setOpen] = React.useState(defaultOpen)
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="state-layer group/row flex min-h-9 w-full items-center gap-2 rounded-lg px-2 type-body-md">
        <CollapsibleChevron name="chevron_right" className="text-muted-foreground group-data-[state=open]/collapsible-trigger:rotate-90" />
        <Icon name={open ? "folder_open" : "folder"} fill className="text-muted-foreground" />
        {node.name}
      </CollapsibleTrigger>
      <CollapsibleContent>
        <Tree nodes={node.children ?? []} className="ml-5 pl-2" />
      </CollapsibleContent>
    </Collapsible>
  )
}

function Tree({ nodes, className }: { nodes: Node[]; className?: string }) {
  return (
    <ul className={className}>
      {nodes.map((n, i) => (
        <li key={n.name}>
          {n.children ? (
            <Folder node={n} defaultOpen={i === 0 && n.name === "src"} />
          ) : (
            <div className="flex min-h-9 items-center gap-2 rounded-lg py-1 pr-2 pl-2 type-body-md">
              <span className="size-6 shrink-0" />
              <Icon name="description" className="text-muted-foreground" />
              {n.name}
            </div>
          )}
        </li>
      ))}
    </ul>
  )
}

export default function CollapsiblePage() {
  return (
    <>
      <PageHeader eyebrow="Component 45" title="Collapsible">
        One region that opens and closes under its trigger. Where Accordion manages a set of items, Collapsible is the
        single building block: a &quot;show more&quot;, a file tree, an advanced section.
      </PageHeader>

      <Section title="Install">
        <Code>{`npx shadcn@latest add @velvet/collapsible`}</Code>
      </Section>

      <Section title="Show more" description="The chevron prop adds a trailing chevron that turns on a spring. The extra rows grow in with a height animation and a fade.">
        <Preview>
          <ReviewerList />
        </Preview>
      </Section>

      <Section title="Repository files" description="Nest them: each folder is a Collapsible, and CollapsibleChevron takes any glyph and any rotation.">
        <Preview className="items-start">
          <div className="w-full max-w-sm rounded-2xl bg-card p-2 shadow-e1 dark:bg-surface-container-high">
            <Tree nodes={TREE} />
          </div>
        </Preview>
      </Section>

      <Section title="With a button" description="Use asChild to make any Velvet button the trigger and drop CollapsibleChevron inside it.">
        <Preview className="items-start">
          <Collapsible className="flex w-full max-w-sm flex-col gap-3">
            <CollapsibleTrigger asChild>
              <Button variant="secondary" className="self-start">
                Advanced options
                <CollapsibleChevron />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <p className="rounded-2xl bg-surface-container p-4 type-body-md text-muted-foreground dark:bg-surface-container-high">
                Keep the original file name, flatten folders and skip files over 50 MB. These apply to this export only.
              </p>
            </CollapsibleContent>
          </Collapsible>
        </Preview>
      </Section>

      <Section title="Usage">
        <Code>{`import { Collapsible, CollapsibleTrigger, CollapsibleContent, CollapsibleChevron } from "@/components/ui/collapsible"

<Collapsible>
  <CollapsibleTrigger chevron>Show 3 more</CollapsibleTrigger>
  <CollapsibleContent>…</CollapsibleContent>
</Collapsible>

<Collapsible>
  <CollapsibleTrigger asChild>
    <Button variant="secondary">Advanced <CollapsibleChevron /></Button>
  </CollapsibleTrigger>
  <CollapsibleContent>…</CollapsibleContent>
</Collapsible>`}</Code>
      </Section>

      <Section title="Props" description="Other props go to Radix Collapsible (open, defaultOpen, onOpenChange, disabled). Enter and Space toggle.">
        <PropsTable
          rows={[
            ["CollapsibleTrigger chevron", "boolean | IconName", "false", "Trailing chevron that turns when open (not with asChild)"],
            ["CollapsibleChevron name", "IconName", '"keyboard_arrow_down"', "Rotates 180 degrees on a spring; override with a className for other turns"],
          ]}
        />
      </Section>
    </>
  )
}
