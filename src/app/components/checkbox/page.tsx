"use client"

import * as React from "react"
import { Checkbox } from "@/registry/velvet/ui/checkbox"
import { Code, PageHeader, Preview, PropsTable, Section } from "@/components/docs/primitives"

const TOPPINGS = ["Mozzarella", "Basil", "Roasted peppers", "Olives"]

function Labelled({ children, text }: { children: React.ReactNode; text: string }) {
  return (
    <div className="flex flex-col items-center gap-3">
      {children}
      <span className="type-label-sm text-muted-foreground">{text}</span>
    </div>
  )
}

export default function CheckboxPage() {
  const [picked, setPicked] = React.useState<string[]>(["Mozzarella", "Basil"])
  const [terms, setTerms] = React.useState(false)
  const [tried, setTried] = React.useState(false)
  const all = picked.length === TOPPINGS.length ? true : picked.length === 0 ? false : "indeterminate"

  return (
    <>
      <PageHeader eyebrow="Component 10" title="Checkbox">
        Picks any number of options from a list, or confirms a single statement. The check draws itself in; the box
        gives a small press.
      </PageHeader>

      <Section title="Install">
        <Code>{`npx shadcn@latest add @velvet/checkbox`}</Code>
      </Section>

      <Section title="States" description="Hover shows a 40px halo, which is also the click target, so the small box is easy to hit.">
        <Preview className="gap-8">
          <Labelled text="unchecked">
            <Checkbox aria-label="Unchecked" />
          </Labelled>
          <Labelled text="checked">
            <Checkbox aria-label="Checked" defaultChecked />
          </Labelled>
          <Labelled text="indeterminate">
            <Checkbox aria-label="Indeterminate" checked="indeterminate" />
          </Labelled>
          <Labelled text="error">
            <Checkbox aria-label="Error" aria-invalid />
          </Labelled>
          <Labelled text="error checked">
            <Checkbox aria-label="Error, checked" aria-invalid defaultChecked />
          </Labelled>
          <Labelled text="disabled">
            <Checkbox aria-label="Disabled" disabled />
          </Labelled>
          <Labelled text="disabled checked">
            <Checkbox aria-label="Disabled, checked" disabled defaultChecked />
          </Labelled>
          <Labelled text="brand">
            <Checkbox aria-label="Brand" color="brand" defaultChecked />
          </Labelled>
        </Preview>
      </Section>

      <Section
        title="Select all"
        description="A parent checkbox shows indeterminate while only some children are checked. Clicking it checks or clears them all."
      >
        <Preview className="flex-col items-start gap-1">
          <label className="flex cursor-pointer items-center gap-3 py-2 type-title-sm">
            <Checkbox checked={all} onCheckedChange={() => setPicked(all === true ? [] : TOPPINGS)} />
            Toppings
          </label>
          <div className="flex flex-col gap-1 ps-8">
            {TOPPINGS.map((t) => (
              <label key={t} className="flex cursor-pointer items-center gap-3 py-2 type-body-md">
                <Checkbox
                  checked={picked.includes(t)}
                  onCheckedChange={(v) => setPicked((p) => (v ? [...p, t] : p.filter((x) => x !== t)))}
                />
                {t}
              </label>
            ))}
          </div>
        </Preview>
      </Section>

      <Section title="Validation" description="Set aria-invalid and link a message with aria-describedby. Try submitting without checking the box.">
        <Preview className="flex-col items-start gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="flex cursor-pointer items-start gap-3 type-body-md">
              <Checkbox
                className="mt-0.5"
                checked={terms}
                onCheckedChange={(v) => setTerms(v === true)}
                aria-invalid={tried && !terms}
                aria-describedby="terms-error"
              />
              <span>
                I agree to the terms of service and the privacy policy.
              </span>
            </label>
            {tried && !terms && (
              <p id="terms-error" className="ps-8 type-body-sm text-destructive">
                You need to agree before you continue.
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => setTried(true)}
            className="rounded-full bg-primary px-5 py-2.5 type-label-lg text-primary-foreground outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            Create account
          </button>
        </Preview>
      </Section>

      <Section title="Usage">
        <Code>{`import { Checkbox } from "@/components/ui/checkbox"

<label className="flex items-center gap-3">
  <Checkbox checked={remember} onCheckedChange={(v) => setRemember(v === true)} />
  Remember me
</label>`}</Code>
      </Section>

      <Section title="Props" description="Other props go to Radix Checkbox (checked, defaultChecked, onCheckedChange, name, required…).">
        <PropsTable
          rows={[
            ["checked", 'boolean | "indeterminate"', "", "Controlled state"],
            ["color", '"default" | "brand"', '"default"', ""],
            ["aria-invalid", "boolean", "", "Error color"],
          ]}
        />
      </Section>
    </>
  )
}
