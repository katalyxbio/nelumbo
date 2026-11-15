"use client"

import * as React from "react"
import { Textarea } from "@/registry/nelumbo/ui/textarea"
import { Button } from "@/registry/nelumbo/ui/button"
import { Code, PageHeader, Preview, PropsTable, Section } from "@/components/docs/primitives"

const VARIANTS = ["filled", "outlined"] as const

export default function TextareaPage() {
  const [bio, setBio] = React.useState("Architect in Stockholm. I draw kitchens, mostly.")

  return (
    <>
      <PageHeader eyebrow="Component 08" title="Textarea">
        The multi-line sibling of Input, with the same styles and floating label. It grows as you type, so short notes
        stay small and long ones get room.
      </PageHeader>

      <Section title="Install" description="Installs Field, the shell it shares with Input.">
        <Code>{`npx shadcn@latest add @nelumbo/textarea`}</Code>
      </Section>

      <Section
        title="Variants"
        description="The label rests on the first line and rises on focus. Type a few lines: the box grows up to maxRows, then scrolls."
      >
        <div className="grid gap-4 md:grid-cols-2">
          {VARIANTS.map((v) => (
            <Preview key={v} label={v} className="flex-col items-stretch gap-5 bg-card dark:bg-card">
              <Textarea variant={v} label="Message" description="Visible to everyone on the project." />
              <Textarea
                variant={v}
                label="Bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={160}
                rows={2}
                error={bio.trim().length === 0 && "Add a short bio."}
              />
              <Textarea variant={v} label="Notes" defaultValue="Locked after sign-off." disabled rows={2} />
              <div className="flex gap-2">
                <Button>Send</Button>
                <Button variant="ghost">Cancel</Button>
              </div>
            </Preview>
          ))}
        </div>
      </Section>

      <Section title="Sizes" description="sm tightens the padding, for comments and dense panels.">
        <Preview className="grid items-start gap-5 bg-card sm:grid-cols-2 dark:bg-card">
          <Textarea label="Comment (default)" rows={2} />
          <Textarea size="sm" label="Comment (sm)" rows={2} />
        </Preview>
      </Section>

      <Section title="Without a label" description="The placeholder stays visible. Give the field an aria-label.">
        <Preview className="bg-card dark:bg-card">
          <Textarea variant="outlined" placeholder="Write a reply…" aria-label="Reply" rows={2} className="max-w-xl" />
        </Preview>
      </Section>

      <Section title="Usage">
        <Code>{`import { Textarea } from "@/components/ui/textarea"

<Textarea label="Message" maxLength={280} description="Visible to the whole team." />
<Textarea variant="outlined" size="sm" label="Comment" rows={2} maxRows={6} />`}</Code>
      </Section>

      <Section title="Props" description="className goes to the wrapper; all other props and the ref go to the <textarea>.">
        <PropsTable
          rows={[
            ["label", "string", "", "Floating label. Leave out and set aria-label instead"],
            ["variant", '"filled" | "outlined"', '"filled"', ""],
            ["size", '"default" | "sm"', '"default"', ""],
            ["rows", "number", "3", "Starting height in lines"],
            ["maxRows", "number", "8", "Grows to this many lines, then scrolls"],
            ["maxLength", "number", "", "Also shows a character count"],
            ["description", "ReactNode", "", "Help text, linked with aria-describedby"],
            ["error", "ReactNode | boolean", "", "Marks the field invalid; a message replaces the description"],
          ]}
        />
      </Section>
    </>
  )
}
