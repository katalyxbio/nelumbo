"use client"

import * as React from "react"
import { Icon } from "@/registry/nelumbo/ui/icon"
import { Button } from "@/registry/nelumbo/ui/button"
import { Code, PageHeader, Preview, Section } from "@/components/docs/primitives"

const PROPS = [
  ["variant", '"default" | "secondary" | "elevated" | "outline" | "ghost" | "destructive" | "link"', '"default"', "elevated"],
  ["size", '"xs" | "sm" | "default" | "lg" | "xl" | "icon-xs" | "icon-sm" | "icon" | "icon-lg"', '"default"', "xs, xl, icon-xs"],
  ["shape", '"pill" | "square"', '"pill"', "new"],
  ["loading", "boolean", "false", "new"],
  ["asChild", "boolean", "false", ""],
]

export default function ButtonPage() {
  const [sending, setSending] = React.useState(false)

  return (
    <>
      <PageHeader eyebrow="Component 01" title="Button">
        A drop-in replacement for shadcn&apos;s Button. Same props and variant names, so existing code keeps
        working, with a new elevated variant, a pressed shape morph and a loading state.
      </PageHeader>

      <Section title="Install" description="Install the theme once per project, then the component.">
        <Code>{`npx shadcn@latest add https://<your-registry>/r/theme.json\nnpx shadcn@latest add https://<your-registry>/r/button.json`}</Code>
      </Section>

      <Section
        title="Variants"
        description="Ordered by emphasis. Use one default button per view for the main action. Secondary is the neutral tonal button, for everything that supports it; elevated lifts off busy backgrounds."
      >
        <Preview>
          <Button>Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="elevated">Elevated</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Delete</Button>
          <Button variant="link">Link</Button>
        </Preview>
      </Section>

      <Section title="Sizes" description="Heights follow a 4px grid: 28, 32, 40, 48, 56. Default is 40, Material's standard target.">
        <Preview>
          <Button size="xs">Extra small</Button>
          <Button size="sm">Small</Button>
          <Button>Default</Button>
          <Button size="lg">Large</Button>
          <Button size="xl">Extra large</Button>
        </Preview>
      </Section>

      <Section
        title="Shape"
        description="Pill is the default. Square uses the theme radius. Both tighten their corners while pressed and spring back on release. Press and hold to see it."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Preview label="pill">
            <Button size="lg">Continue</Button>
            <Button size="lg" variant="secondary">Save draft</Button>
            <Button size="icon-lg" variant="secondary" aria-label="Add"><Icon name="add" /></Button>
          </Preview>
          <Preview label="square">
            <Button size="lg" shape="square">Continue</Button>
            <Button size="lg" shape="square" variant="secondary">Save draft</Button>
            <Button size="icon-lg" shape="square" variant="secondary" aria-label="Add"><Icon name="add" /></Button>
          </Preview>
        </div>
      </Section>

      <Section title="With icons" description="Icons size to the label (1.3em, about 18px on a default button) and padding tightens on the icon side automatically.">
        <Preview>
          <Button><Icon name="send" /> Send invite</Button>
          <Button variant="secondary">Continue <Icon name="arrow_forward" /></Button>
          <Button variant="outline"><Icon name="download" /> Export CSV</Button>
          <Button variant="destructive"><Icon name="delete" /> Remove member</Button>
          <Button variant="ghost" size="icon" aria-label="Like"><Icon name="favorite" /></Button>
          <Button variant="elevated" size="icon" aria-label="Add"><Icon name="add" /></Button>
        </Preview>
      </Section>

      <Section title="States" description="Loading replaces the leading icon with a spinner, sets aria-busy and blocks clicks without changing the button's width much.">
        <Preview>
          <Button
            loading={sending}
            onClick={() => {
              setSending(true)
              setTimeout(() => setSending(false), 1800)
            }}
          >
            <Icon name="send" /> {sending ? "Sending" : "Send invite"}
          </Button>
          <Button loading variant="secondary">Saving</Button>
          <Button disabled>Disabled</Button>
          <Button disabled variant="outline">Disabled</Button>
          <Button asChild variant="link">
            <a href="#props">As a link</a>
          </Button>
        </Preview>
      </Section>

      <Section title="Usage">
        <Code>{`import { Button } from "@/components/ui/button"

<Button variant="secondary" shape="square" loading={isSaving}>
  <Save /> Save draft
</Button>`}</Code>
      </Section>

      <Section id="props" title="Props" description="Everything else is passed to the underlying button element.">
        <div tabIndex={0} className="overflow-x-auto rounded-2xl border border-border outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
          <table className="w-full min-w-[640px] text-left type-body-sm">
            <thead className="bg-surface-container-low type-label-md text-muted-foreground dark:bg-surface-container">
              <tr>
                <th className="px-4 py-3 font-[520]">Prop</th>
                <th className="px-4 py-3 font-[520]">Type</th>
                <th className="px-4 py-3 font-[520]">Default</th>
                <th className="px-4 py-3 font-[520]">Beyond shadcn</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {PROPS.map(([name, type, def, extra]) => (
                <tr key={name}>
                  <td className="px-4 py-3 font-mono type-label-md">{name}</td>
                  <td className="px-4 py-3 font-mono type-label-sm text-muted-foreground">{type}</td>
                  <td className="px-4 py-3 font-mono type-label-sm">{def}</td>
                  <td className="px-4 py-3 type-label-md">
                    {extra && <span className="rounded-full bg-brand-container px-2 py-0.5 text-brand-container-foreground">{extra}</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </>
  )
}
