"use client"

import * as React from "react"
import { Button } from "@/registry/velvet/ui/button"
import { Checkbox } from "@/registry/velvet/ui/checkbox"
import { Icon } from "@/registry/velvet/ui/icon"
import { Input } from "@/registry/velvet/ui/input"
import { RadioGroup, RadioGroupItem } from "@/registry/velvet/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/registry/velvet/ui/select"
import { Switch } from "@/registry/velvet/ui/switch"
import { Textarea } from "@/registry/velvet/ui/textarea"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from "@/registry/velvet/ui/field"
import { Code, PageHeader, Preview, PropsTable, Section } from "@/components/docs/primitives"

const PLANS = [
  { value: "starter", title: "Starter", text: "1 project, community support." },
  { value: "pro", title: "Pro", text: "Unlimited projects, priority support." },
  { value: "team", title: "Team", text: "Shared libraries and roles." },
]

export default function FieldPage() {
  const [plan, setPlan] = React.useState("pro")
  const [notify, setNotify] = React.useState({ mail: true, push: false })
  const [email, setEmail] = React.useState("maya@")
  const [agree, setAgree] = React.useState(false)
  const [submitted, setSubmitted] = React.useState(false)
  const emailBad = !/^\S+@\S+\.\S+$/.test(email)

  return (
    <>
      <PageHeader eyebrow="Component 62" title="Field">
        The layout of a form: a label, a control, a description and an error, stacked or in a row, grouped into
        fieldsets. Drop-in for shadcn&apos;s Field. Velvet text fields keep their floating label, and checkbox,
        radio and switch rows can become selectable cards.
      </PageHeader>

      <Section title="Install">
        <Code>{`npx shadcn@latest add @velvet/field`}</Code>
      </Section>

      <Section
        title="Payment form"
        description="FieldSet and FieldLegend name a group, FieldGroup spaces the fields. A FieldLabel beside a Velvet Input or Select becomes its floating label, so nothing is drawn twice, while the id, aria-invalid and aria-describedby are wired for you."
      >
        <Preview className="justify-center">
          <form className="w-full max-w-md" onSubmit={(e) => e.preventDefault()}>
            <FieldGroup>
              <FieldSet>
                <FieldLegend>Payment method</FieldLegend>
                <FieldDescription>All transactions are secure and encrypted.</FieldDescription>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="card-name">Name on card</FieldLabel>
                    <Input id="card-name" autoComplete="cc-name" />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="card-number">Card number</FieldLabel>
                    <Input id="card-number" inputMode="numeric" autoComplete="cc-number" icon="credit_card" />
                    <FieldDescription>Enter your 16 digit card number.</FieldDescription>
                  </Field>
                  <div className="grid grid-cols-3 gap-4">
                    <Field>
                      <FieldLabel>Month</FieldLabel>
                      <Select>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {["01", "02", "03", "04", "05", "06"].map((m) => (
                            <SelectItem key={m} value={m}>{m}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field>
                      <FieldLabel>Year</FieldLabel>
                      <Select>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {["2027", "2028", "2029", "2030"].map((y) => (
                            <SelectItem key={y} value={y}>{y}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="cvv">CVV</FieldLabel>
                      <Input id="cvv" inputMode="numeric" autoComplete="cc-csc" />
                    </Field>
                  </div>
                </FieldGroup>
              </FieldSet>
              <FieldSeparator />
              <FieldSet>
                <FieldLegend>Billing address</FieldLegend>
                <FieldDescription>The address that matches your card.</FieldDescription>
                <FieldGroup>
                  <Field orientation="horizontal">
                    <Checkbox id="same-as-shipping" defaultChecked />
                    <FieldLabel htmlFor="same-as-shipping" className="font-normal">
                      Same as shipping address
                    </FieldLabel>
                  </Field>
                </FieldGroup>
              </FieldSet>
              <FieldSet>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="comments">Comments</FieldLabel>
                    <Textarea id="comments" />
                  </Field>
                </FieldGroup>
              </FieldSet>
              <Field orientation="horizontal">
                <Button type="submit">Submit</Button>
                <Button variant="outline" type="button">Cancel</Button>
              </Field>
            </FieldGroup>
          </form>
        </Preview>
      </Section>

      <Section
        title="Choice cards"
        description="A FieldLabel that wraps a Field is a card. The whole card is the target for its radio, checkbox or switch; selecting it fills it with the secondary color and its corners spring from round to squarer."
      >
        <Preview className="items-start justify-center gap-10">
          <FieldGroup className="w-full max-w-sm">
            <FieldSet>
              <FieldLegend variant="label">Plan</FieldLegend>
              <FieldDescription>Radio cards: one choice.</FieldDescription>
              <RadioGroup value={plan} onValueChange={setPlan} className="gap-2">
                {PLANS.map((p) => (
                  <FieldLabel key={p.value} htmlFor={`plan-${p.value}`}>
                    <Field orientation="horizontal">
                      <FieldContent>
                        <FieldTitle>{p.title}</FieldTitle>
                        <FieldDescription>{p.text}</FieldDescription>
                      </FieldContent>
                      <RadioGroupItem value={p.value} id={`plan-${p.value}`} />
                    </Field>
                  </FieldLabel>
                ))}
              </RadioGroup>
            </FieldSet>
          </FieldGroup>
          <FieldGroup className="w-full max-w-sm">
            <FieldSet>
              <FieldLegend variant="label">Notify me</FieldLegend>
              <FieldDescription>Checkbox and switch cards.</FieldDescription>
              <FieldGroup className="gap-2">
                <FieldLabel htmlFor="n-mail">
                  <Field orientation="horizontal">
                    <FieldContent>
                      <FieldTitle>Email</FieldTitle>
                      <FieldDescription>A summary every morning.</FieldDescription>
                    </FieldContent>
                    <Checkbox id="n-mail" checked={notify.mail} onCheckedChange={(v) => setNotify((n) => ({ ...n, mail: v === true }))} />
                  </Field>
                </FieldLabel>
                <FieldLabel htmlFor="n-push">
                  <Field orientation="horizontal">
                    <FieldContent>
                      <FieldTitle>Push</FieldTitle>
                      <FieldDescription>Only for mentions and replies.</FieldDescription>
                    </FieldContent>
                    <Switch id="n-push" checked={notify.push} onCheckedChange={(v) => setNotify((n) => ({ ...n, push: v }))} />
                  </Field>
                </FieldLabel>
              </FieldGroup>
            </FieldSet>
          </FieldGroup>
        </Preview>
      </Section>

      <Section
        title="Horizontal"
        description='orientation="horizontal" puts the control beside its text, for settings rows. A FieldContent holds the title and description; a switch centers on the row, a checkbox lines up with the first line.'
      >
        <Preview className="justify-center">
          <FieldSet className="w-full max-w-md">
            <FieldLegend>Privacy</FieldLegend>
            <FieldGroup>
              <Field orientation="horizontal">
                <FieldContent>
                  <FieldLabel htmlFor="s-discover">Discoverable</FieldLabel>
                  <FieldDescription>People can find you by your email address.</FieldDescription>
                </FieldContent>
                <Switch id="s-discover" defaultChecked />
              </Field>
              <Field orientation="horizontal">
                <FieldContent>
                  <FieldLabel htmlFor="s-read">Read receipts</FieldLabel>
                  <FieldDescription>Show when you have seen a message.</FieldDescription>
                </FieldContent>
                <Switch id="s-read" />
              </Field>
              <Field orientation="horizontal" data-disabled>
                <FieldContent>
                  <FieldLabel htmlFor="s-lock">Lock after 5 minutes</FieldLabel>
                  <FieldDescription>Managed by your organization.</FieldDescription>
                </FieldContent>
                <Switch id="s-lock" defaultChecked disabled />
              </Field>
              <Field orientation="horizontal">
                <Checkbox id="s-terms" defaultChecked />
                <FieldContent>
                  <FieldLabel htmlFor="s-terms">Share anonymous usage data</FieldLabel>
                  <FieldDescription>Helps us find what to fix first.</FieldDescription>
                </FieldContent>
              </Field>
            </FieldGroup>
          </FieldSet>
        </Preview>
      </Section>

      <Section
        title="Responsive"
        description='orientation="responsive" stacks until its FieldGroup is 28rem wide (a container query, not the window), then sits in a row. Drag the right edge of the frame to try it.'
      >
        <Preview className="items-stretch justify-center">
          <div className="w-full max-w-2xl resize-x overflow-auto rounded-2xl bg-surface-container p-4 dark:bg-surface-container-high">
            <FieldGroup>
              <Field orientation="responsive" floating={false}>
                <FieldContent>
                  <FieldLabel htmlFor="r-name">Display name</FieldLabel>
                  <FieldDescription>Shown on your public profile.</FieldDescription>
                </FieldContent>
                <Input id="r-name" className="@md/field-group:max-w-64" />
              </Field>
              <FieldSeparator>or</FieldSeparator>
              <Field orientation="responsive" floating={false}>
                <FieldContent>
                  <FieldLabel htmlFor="r-bio">Bio</FieldLabel>
                  <FieldDescription>A line or two.</FieldDescription>
                </FieldContent>
                <Textarea id="r-bio" className="@md/field-group:max-w-64" />
              </Field>
            </FieldGroup>
          </div>
        </Preview>
      </Section>

      <Section
        title="Errors"
        description="Put data-invalid on the Field: the label, the control and a choice card turn red and the Velvet field gets aria-invalid. FieldError is always mounted, so screen readers hear it, and it opens with a spring. Give it an errors array (react-hook-form, Zod; duplicates are merged) or children."
      >
        <Preview className="items-start justify-center gap-10">
          <FieldGroup className="w-full max-w-sm">
            <Field data-invalid={emailBad}>
              <FieldLabel htmlFor="e-mail">Email</FieldLabel>
              <Input id="e-mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <FieldDescription>We send the receipt here.</FieldDescription>
              <FieldError errors={emailBad ? [{ message: "Enter a full address, like name@example.com." }] : []} />
            </Field>
            <Field data-invalid={submitted && !agree}>
              <Field orientation="horizontal">
                <Checkbox id="e-agree" checked={agree} aria-invalid={submitted && !agree} onCheckedChange={(v) => setAgree(v === true)} />
                <FieldLabel htmlFor="e-agree">I accept the terms</FieldLabel>
              </Field>
              <FieldError>{submitted && !agree ? "You need to accept the terms to continue." : null}</FieldError>
            </Field>
            <Field orientation="horizontal">
              <Button type="button" onClick={() => setSubmitted(true)}>Continue</Button>
              <Button type="button" variant="ghost" onClick={() => { setSubmitted(false); setAgree(false) }}>Reset</Button>
            </Field>
          </FieldGroup>
          <FieldGroup className="w-full max-w-sm">
            <Field data-invalid>
              <FieldLabel htmlFor="e-pw">Password</FieldLabel>
              <Input id="e-pw" type="password" defaultValue="abc" />
              <FieldError
                errors={[{ message: "At least 8 characters." }, { message: "Add a number." }, { message: "At least 8 characters." }]}
              />
            </Field>
            <FieldLabel htmlFor="e-card">
              <Field orientation="horizontal" data-invalid>
                <FieldContent>
                  <FieldTitle>Debit card</FieldTitle>
                  <FieldDescription>Not available in your region.</FieldDescription>
                </FieldContent>
                <Checkbox id="e-card" aria-invalid />
              </Field>
            </FieldLabel>
          </FieldGroup>
        </Preview>
      </Section>

      <Section title="Separator" description="FieldSeparator is spacing, not a line. With text, the text sits centered in the gap.">
        <Preview className="justify-center">
          <FieldGroup className="w-full max-w-sm">
            <Field>
              <Button variant="outline" type="button"><Icon name="mail" />Continue with email</Button>
            </Field>
            <FieldSeparator>Or continue with</FieldSeparator>
            <Field>
              <Button variant="outline" type="button"><Icon name="passkey" />Use a passkey</Button>
            </Field>
          </FieldGroup>
        </Preview>
      </Section>

      <Section title="Usage">
        <Code>{`import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSeparator, FieldSet, FieldTitle } from "@/components/ui/field"

<FieldSet>
  <FieldLegend>Account</FieldLegend>
  <FieldGroup>
    <Field data-invalid={!!errors.email}>
      <FieldLabel htmlFor="email">Email</FieldLabel>   {/* becomes the Input's floating label */}
      <Input id="email" type="email" />
      <FieldDescription>We send the receipt here.</FieldDescription>
      <FieldError errors={[errors.email]} />
    </Field>

    {/* a choice card */}
    <FieldLabel htmlFor="news">
      <Field orientation="horizontal">
        <FieldContent>
          <FieldTitle>Newsletter</FieldTitle>
          <FieldDescription>One email a month.</FieldDescription>
        </FieldContent>
        <Checkbox id="news" />
      </Field>
    </FieldLabel>
  </FieldGroup>
</FieldSet>`}</Code>
      </Section>

      <Section title="Props">
        <PropsTable
          rows={[
            ["Field orientation", '"vertical" | "horizontal" | "responsive"', '"vertical"', "Responsive switches at 28rem of the enclosing FieldGroup."],
            ["Field data-invalid", "boolean", "false", "Red label, aria-invalid on a Velvet field, error state on cards."],
            ["Field data-disabled", "boolean", "false", "Dims the label and description."],
            ["Field floating", "boolean", "true", "false keeps a separate FieldLabel beside a Velvet text field."],
            ["FieldLabel", "Label props", "", "Wrapping a Field makes it a choice card. Beside a Velvet text field with a string child, it becomes that field's label."],
            ["FieldError errors", "Array<{ message?: string }>", "", "Deduplicated; several messages become a list. Or pass children."],
            ["FieldLegend variant", '"legend" | "label"', '"legend"', "Legend is a title, label is a small label."],
            ["FieldSeparator", "div props", "", "Spacing; children are centered text. No line."],
            ["FieldGroup / FieldSet / FieldContent / FieldTitle / FieldDescription", "", "", "Layout parts; same as shadcn."],
          ]}
        />
      </Section>
    </>
  )
}
