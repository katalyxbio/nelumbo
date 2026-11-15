"use client"

import * as React from "react"
import { SplitButton, SplitButtonAction, SplitButtonItem, SplitButtonMenu } from "@/registry/nelumbo/ui/split-button"
import { Icon } from "@/registry/nelumbo/ui/icon"
import { Code, PageHeader, Preview, PropsTable, Section } from "@/components/docs/primitives"

export default function SplitButtonPage() {
  const [last, setLast] = React.useState("Nothing yet")

  return (
    <>
      <PageHeader eyebrow="Component 05" title="Split Button">
        One main action with related ones a click away. The main side runs the most common choice; the menu holds the
        alternatives.
      </PageHeader>

      <Section title="Install">
        <Code>{`npx shadcn@latest add @nelumbo/split-button`}</Code>
      </Section>

      <Section
        title="Variants"
        description="Open a menu: the trigger rounds out into a full pill and the chevron turns over. Arrow keys move through the items; Escape closes the menu."
      >
        <Preview className="flex-col items-start gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {(["default", "secondary", "elevated", "outline"] as const).map((v) => (
              <SplitButton key={v} variant={v}>
                <SplitButtonAction onClick={() => setLast(`Saved (${v})`)}>
                  <Icon name="save" /> Save
                </SplitButtonAction>
                <SplitButtonMenu label="More save options">
                  <SplitButtonItem icon="save_as" onSelect={() => setLast("Save as")}>Save as</SplitButtonItem>
                  <SplitButtonItem icon="content_copy" onSelect={() => setLast("Saved a copy")}>Save a copy</SplitButtonItem>
                  <SplitButtonItem icon="history" onSelect={() => setLast("Saved a version")}>Save a version</SplitButtonItem>
                </SplitButtonMenu>
              </SplitButton>
            ))}
          </div>
          <p className="type-body-sm text-muted-foreground">
            Last action: <span className="text-foreground">{last}</span>
          </p>
        </Preview>
      </Section>

      <Section title="Sizes">
        <Preview className="items-end">
          {(["sm", "default", "lg", "xl"] as const).map((s) => (
            <SplitButton key={s} size={s} variant="secondary">
              <SplitButtonAction>Merge</SplitButtonAction>
              <SplitButtonMenu label="Merge options">
                <SplitButtonItem icon="merge">Create a merge commit</SplitButtonItem>
                <SplitButtonItem icon="compress">Squash and merge</SplitButtonItem>
                <SplitButtonItem icon="low_priority">Rebase and merge</SplitButtonItem>
              </SplitButtonMenu>
            </SplitButton>
          ))}
        </Preview>
      </Section>

      <Section title="Usage">
        <Code>{`<SplitButton variant="secondary">
  <SplitButtonAction onClick={save}>Save</SplitButtonAction>
  <SplitButtonMenu label="More save options">
    <SplitButtonItem icon="save_as" onSelect={saveAs}>Save as</SplitButtonItem>
  </SplitButtonMenu>
</SplitButton>`}</Code>
      </Section>

      <Section title="Props">
        <PropsTable
          rows={[
            ["variant", '"default" | "secondary" | "elevated" | "outline" | "destructive"', '"default"', "Applies to both halves"],
            ["size", '"xs" | "sm" | "default" | "lg" | "xl"', '"default"', ""],
            ["Menu: label", "string", "required", "Accessible name of the trigger"],
            ["Menu: align", '"start" | "end"', '"end"', ""],
            ["Menu: open / onOpenChange", "", "", "Control the menu"],
            ["Item: icon", "IconName", "", ""],
            ["Item: onSelect", "(event) => void", "", "Radix DropdownMenu item"],
          ]}
        />
      </Section>
    </>
  )
}
