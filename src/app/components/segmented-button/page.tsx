"use client"

import * as React from "react"
import { SegmentedButton, SegmentedButtonItem } from "@/registry/velvet/ui/segmented-button"
import { Code, PageHeader, Preview, PropsTable, Section } from "@/components/docs/primitives"

export default function SegmentedButtonPage() {
  const [view, setView] = React.useState("week")
  const [filters, setFilters] = React.useState<string[]>(["open", "mine"])

  return (
    <>
      <PageHeader eyebrow="Component · 03" title="Segmented Button">
        Two to five related options in one connected control. Use it to switch a view or set a filter: choices that
        apply right away, with no submit step.
      </PageHeader>

      <Section title="Install">
        <Code>{`npx shadcn@latest add @velvet/segmented-button`}</Code>
      </Section>

      <Section title="Single select" description="Exactly one option stays selected, like a radio group. The check mark grows in on the selected segment; arrow keys move between options.">
        <Preview className="flex-col items-start gap-4">
          <SegmentedButton type="single" value={view} onValueChange={setView} aria-label="Calendar view">
            <SegmentedButtonItem value="day">Day</SegmentedButtonItem>
            <SegmentedButtonItem value="week">Week</SegmentedButtonItem>
            <SegmentedButtonItem value="month">Month</SegmentedButtonItem>
            <SegmentedButtonItem value="year">Year</SegmentedButtonItem>
          </SegmentedButton>
          <p className="type-body-sm text-muted-foreground">
            Showing the <span className="text-foreground">{view}</span> view.
          </p>
        </Preview>
      </Section>

      <Section title="Multiple select" description="Any combination, including none. With an icon, the check mark replaces the icon instead of adding width, so the segments don't shift.">
        <Preview className="flex-col items-start gap-4">
          <SegmentedButton type="multiple" value={filters} onValueChange={setFilters} aria-label="Filter issues">
            <SegmentedButtonItem value="open" icon="radio_button_unchecked">Open</SegmentedButtonItem>
            <SegmentedButtonItem value="mine" icon="person">Assigned to me</SegmentedButtonItem>
            <SegmentedButtonItem value="urgent" icon="priority_high">Urgent</SegmentedButtonItem>
          </SegmentedButton>
          <p className="type-body-sm text-muted-foreground tabular-nums">
            {filters.length ? `${filters.length} filter${filters.length > 1 ? "s" : ""} on` : "No filters"}
          </p>
        </Preview>
      </Section>

      <Section title="Sizes and options">
        <Preview className="flex-col items-start gap-4">
          <SegmentedButton type="single" size="sm" defaultValue="list" aria-label="Layout (small)">
            <SegmentedButtonItem value="list" icon="view_list">List</SegmentedButtonItem>
            <SegmentedButtonItem value="grid" icon="grid_view">Grid</SegmentedButtonItem>
          </SegmentedButton>
          <SegmentedButton type="single" defaultValue="list" aria-label="Layout">
            <SegmentedButtonItem value="list" icon="view_list">List</SegmentedButtonItem>
            <SegmentedButtonItem value="grid" icon="grid_view">Grid</SegmentedButtonItem>
            <SegmentedButtonItem value="board" icon="view_kanban" disabled>Board</SegmentedButtonItem>
          </SegmentedButton>
          <SegmentedButton type="single" size="lg" defaultValue="metric" aria-label="Units">
            <SegmentedButtonItem value="metric" check={false}>Metric (kg, km)</SegmentedButtonItem>
            <SegmentedButtonItem value="imperial" check={false}>Imperial (lb, mi)</SegmentedButtonItem>
          </SegmentedButton>
        </Preview>
      </Section>

      <Section title="Usage">
        <Code>{`<SegmentedButton type="single" value={view} onValueChange={setView} aria-label="Calendar view">
  <SegmentedButtonItem value="day">Day</SegmentedButtonItem>
  <SegmentedButtonItem value="week">Week</SegmentedButtonItem>
</SegmentedButton>`}</Code>
      </Section>

      <Section title="Props">
        <PropsTable
          rows={[
            ["type", '"single" | "multiple"', "required", "Single keeps one option selected"],
            ["value / defaultValue", "string | string[]", "", "Matches type"],
            ["onValueChange", "(value) => void", "", ""],
            ["size", '"sm" | "default" | "lg"', '"default"', "32, 40, 48 px"],
            ["aria-label", "string", "", "Name the group for screen readers"],
            ["Item: icon", "IconName", "", "The check replaces it when selected"],
            ["Item: check", "boolean", "true", "Turn off the check mark"],
          ]}
        />
      </Section>
    </>
  )
}
