"use client"

import * as React from "react"
import { Spinner } from "@/registry/velvet/ui/spinner"
import { Button } from "@/registry/velvet/ui/button"
import { Badge } from "@/registry/velvet/ui/badge"
import { Input } from "@/registry/velvet/ui/input"
import { Code, PageHeader, Preview, PropsTable, Section } from "@/components/docs/primitives"

function Labelled({ children, text }: { children: React.ReactNode; text: string }) {
  return (
    <div className="flex flex-col items-center gap-3">
      {children}
      <span className="type-label-sm text-muted-foreground">{text}</span>
    </div>
  )
}

export default function SpinnerPage() {
  const [text, setText] = React.useState("velvet")

  return (
    <>
      <PageHeader eyebrow="Component 57" title="Spinner">
        A small indicator for a wait you can&apos;t measure. It is a drop-in for shadcn&apos;s Spinner: it announces
        &quot;Loading&quot; to screen readers, takes its size from className and its color from the text around it.
      </PageHeader>

      <Section title="Install">
        <Code>{`npx shadcn@latest add @velvet/spinner`}</Code>
      </Section>

      <Section
        title="Variants"
        description='The ring is an arc that turns while it grows and shrinks, like Material&apos;s indeterminate circular indicator. "shapes" is the LoadingIndicator, a soft form that morphs as it turns; it reads best from about 32px up.'
      >
        <Preview className="gap-10">
          <Labelled text="ring">
            <Spinner className="size-8" />
          </Labelled>
          <Labelled text="shapes">
            <Spinner variant="shapes" className="size-12" />
          </Labelled>
        </Preview>
      </Section>

      <Section title="Sizes and color" description="Size with a size-* class. The color is the current text color, so text-brand or text-muted-foreground just work.">
        <Preview className="gap-8">
          <Spinner className="size-4" />
          <Spinner className="size-6" />
          <Spinner className="size-8" />
          <Spinner className="size-12" />
          <Spinner className="size-8 text-brand" />
          <Spinner className="size-8 text-muted-foreground" />
          <Spinner variant="shapes" className="size-10 text-brand" />
        </Preview>
      </Section>

      <Section title="In buttons" description="Place it first in the label. Button's own loading prop uses the same kind of arc and also blocks interaction.">
        <Preview className="gap-3">
          <Button disabled>
            <Spinner />
            Saving
          </Button>
          <Button variant="secondary" disabled>
            <Spinner />
            Please wait
          </Button>
          <Button variant="outline" disabled>
            <Spinner />
            Loading
          </Button>
          <Button loading>Using the loading prop</Button>
        </Preview>
      </Section>

      <Section title="In badges and inputs" description="In a badge it takes the badge's text color; in an input, use the trailing slot.">
        <Preview className="items-start gap-6">
          <Badge variant="secondary">
            <Spinner />
            Syncing
          </Badge>
          <Badge variant="info">
            <Spinner />
            Processing
          </Badge>
          <div className="w-72">
            <Input
              label="Username"
              icon="person"
              value={text}
              onChange={(e) => setText(e.target.value)}
              trailing={<Spinner className="size-5" aria-label="Checking availability" />}
              description="Checking if it is free."
            />
          </div>
        </Preview>
      </Section>

      <Section title="Props">
        <PropsTable
          rows={[
            ["variant", '"ring" | "shapes"', '"ring"', "Arc, or the morphing LoadingIndicator."],
            ["className", "string", "", "Size with size-*; defaults to the icon size around it (1.25em)."],
            ["aria-label", "string", '"Loading"', "Name announced by screen readers. The element has role=status."],
          ]}
        />
      </Section>
    </>
  )
}
