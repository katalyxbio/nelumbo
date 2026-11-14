"use client"

import * as React from "react"
import { RadioGroup, RadioGroupItem } from "@/registry/velvet/ui/radio-group"
import { Icon, type IconName } from "@/registry/velvet/ui/icon"
import { Code, PageHeader, Preview, PropsTable, Section } from "@/components/docs/primitives"
import { cn } from "@/lib/utils"

const SHIPPING: { value: string; icon: IconName; title: string; body: string; price: string }[] = [
  { value: "standard", icon: "local_shipping", title: "Standard", body: "3 to 5 business days", price: "Free" },
  { value: "express", icon: "bolt", title: "Express", body: "Next business day", price: "€12" },
  { value: "pickup", icon: "storefront", title: "Pick up in store", body: "Ready in 2 hours, Södermalm", price: "Free" },
]

export default function RadioGroupPage() {
  const [shipping, setShipping] = React.useState("standard")

  return (
    <>
      <PageHeader eyebrow="Component · 11" title="Radio Group">
        Picks exactly one option from a short list. The dot springs in from the center, and arrow keys move the
        selection.
      </PageHeader>

      <Section title="Install">
        <Code>{`npx shadcn@latest add @velvet/radio-group`}</Code>
      </Section>

      <Section title="Basic" description="Wrap each item and its text in a label so the whole line is clickable.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Preview label="default">
            <RadioGroup defaultValue="comfortable" aria-label="Density">
              {["Compact", "Comfortable", "Spacious"].map((d) => (
                <label key={d} className="flex cursor-pointer items-center gap-3 type-body-md">
                  <RadioGroupItem value={d.toLowerCase()} />
                  {d}
                </label>
              ))}
            </RadioGroup>
          </Preview>
          <Preview label="brand, with a disabled option">
            <RadioGroup defaultValue="monthly" aria-label="Billing">
              {["Monthly", "Yearly", "Lifetime"].map((d) => (
                <label key={d} className={cn("flex items-center gap-3 type-body-md", d === "Lifetime" ? "cursor-not-allowed text-muted-foreground" : "cursor-pointer")}>
                  <RadioGroupItem value={d.toLowerCase()} color="brand" disabled={d === "Lifetime"} />
                  {d}
                </label>
              ))}
            </RadioGroup>
          </Preview>
        </div>
      </Section>

      <Section
        title="As cards"
        description="For choices that need more than a word. The whole card is the label; the selected card gets a stronger border."
      >
        <Preview>
          <RadioGroup value={shipping} onValueChange={setShipping} aria-label="Shipping" className="w-full max-w-lg gap-2">
            {SHIPPING.map((s) => (
              <label
                key={s.value}
                className={cn(
                  "flex cursor-pointer items-center gap-4 rounded-2xl border bg-card p-4 transition-colors",
                  shipping === s.value ? "border-primary ring-1 ring-primary ring-inset" : "border-border hover:border-input"
                )}
              >
                <RadioGroupItem value={s.value} aria-describedby={`ship-${s.value}`} />
                <Icon name={s.icon} className="text-muted-foreground" />
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="type-title-sm">{s.title}</span>
                  <span id={`ship-${s.value}`} className="type-body-sm text-muted-foreground">
                    {s.body}
                  </span>
                </span>
                <span className="type-label-lg">{s.price}</span>
              </label>
            ))}
          </RadioGroup>
        </Preview>
      </Section>

      <Section title="Usage">
        <Code>{`import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

<RadioGroup value={plan} onValueChange={setPlan} aria-label="Plan">
  <label className="flex items-center gap-3">
    <RadioGroupItem value="free" /> Free
  </label>
  <label className="flex items-center gap-3">
    <RadioGroupItem value="pro" /> Pro
  </label>
</RadioGroup>`}</Code>
      </Section>

      <Section title="Props" description="RadioGroup takes Radix Radio Group props (value, defaultValue, onValueChange, orientation…).">
        <PropsTable
          rows={[
            ["Item: value", "string", "required", ""],
            ["Item: color", '"default" | "brand"', '"default"', ""],
            ["Item: aria-invalid", "boolean", "", "Error color"],
          ]}
        />
      </Section>
    </>
  )
}
