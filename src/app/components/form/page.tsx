"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import { Button } from "@/registry/velvet/ui/button"
import { Checkbox } from "@/registry/velvet/ui/checkbox"
import { DatePicker } from "@/registry/velvet/ui/date-picker"
import { Icon } from "@/registry/velvet/ui/icon"
import { IconButton } from "@/registry/velvet/ui/icon-button"
import { Input } from "@/registry/velvet/ui/input"
import { Label } from "@/registry/velvet/ui/label"
import { RadioGroup, RadioGroupItem } from "@/registry/velvet/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/registry/velvet/ui/select"
import { Slider } from "@/registry/velvet/ui/slider"
import { Snackbars, toast } from "@/registry/velvet/ui/snackbar"
import { Switch } from "@/registry/velvet/ui/switch"
import { Textarea } from "@/registry/velvet/ui/textarea"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/registry/velvet/ui/form"
import { Code, PageHeader, Preview, PropsTable, Section } from "@/components/docs/primitives"

const RULES = [
  { label: "8 characters", test: (v: string) => v.length >= 8 },
  { label: "A number", test: (v: string) => /\d/.test(v) },
  { label: "A capital letter", test: (v: string) => /[A-Z]/.test(v) },
]

const schema = z.object({
  name: z.string().trim().min(2, "Tell us your name, at least 2 letters."),
  email: z.string().min(1, "Enter your email.").pipe(z.email("That email doesn't look right, like name@example.com.")),
  password: z
    .string()
    .min(8, "Use at least 8 characters.")
    .regex(/\d/, "Add a number.")
    .regex(/[A-Z]/, "Add a capital letter."),
  role: z.string().min(1, "Choose the role that fits you best."),
  birthday: z.date({ error: "Enter your birthday." }).max(new Date(2013, 11, 31), "You need to be 13 or older."),
  seats: z.number().min(1),
  notify: z.boolean(),
  plan: z.enum(["free", "pro", "team"], { error: "Pick a plan to continue." }),
  bio: z.string().max(160, "Keep your bio under 160 characters."),
  terms: z.boolean().refine((v) => v, "Accept the terms to create your account."),
})
type Values = z.infer<typeof schema>

const defaults: Partial<Values> = {
  name: "",
  email: "",
  password: "",
  role: "",
  birthday: undefined,
  seats: 5,
  notify: true,
  plan: undefined,
  bio: "",
  terms: false,
}

const PLANS = [
  { value: "free", title: "Free", text: "One project, community support" },
  { value: "pro", title: "Pro", text: "Unlimited projects, priority support" },
  { value: "team", title: "Team", text: "Shared workspaces and admin controls" },
] as const

function SignUpForm() {
  const [show, setShow] = React.useState(false)
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: defaults as Values,
    mode: "onTouched",
  })
  const password = form.watch("password") ?? ""

  async function onSubmit(values: Values) {
    // pretend to talk to a server
    await new Promise((r) => setTimeout(r, 1400))
    toast.success("Account created", { description: `Welcome, ${values.name.split(" ")[0]}. We sent a link to ${values.email}.` })
    form.reset(defaults as Values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="grid gap-5" aria-label="Create account">
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full name</FormLabel>
                <FormControl>
                  <Input icon="person" autoComplete="name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" icon="mail" autoComplete="email" {...field} />
                </FormControl>
                <FormDescription>We send the receipt here.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  type={show ? "text" : "password"}
                  icon="lock"
                  autoComplete="new-password"
                  trailing={
                    <IconButton
                      toggle
                      size="sm"
                      icon="visibility"
                      selectedIcon="visibility_off"
                      label={show ? "Hide password" : "Show password"}
                      pressed={show}
                      onPressedChange={setShow}
                    />
                  }
                  {...field}
                />
              </FormControl>
              <FormDescription className="flex flex-wrap gap-x-4 gap-y-1">
                {RULES.map((r) => {
                  const met = r.test(password)
                  return (
                    <span key={r.label} className={met ? "inline-flex items-center gap-1 text-foreground" : "inline-flex items-center gap-1"}>
                      <Icon
                        name={met ? "check_circle" : "circle"}
                        fill={met}
                        className={met ? "text-success [--icon-size:16px]" : "[--icon-size:16px]"}
                      />
                      {r.label}
                      <span className="sr-only">{met ? ", done" : ", missing"}</span>
                    </span>
                  )
                })}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role</FormLabel>
                <Select value={field.value} onValueChange={field.onChange} name={field.name}>
                  <FormControl>
                    <SelectTrigger icon="work" onBlur={field.onBlur} ref={field.ref}>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="designer">Designer</SelectItem>
                    <SelectItem value="engineer">Engineer</SelectItem>
                    <SelectItem value="product">Product manager</SelectItem>
                    <SelectItem value="other">Something else</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="birthday"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Birthday</FormLabel>
                <FormControl>
                  <DatePicker icon="cake" value={field.value ?? null} onValueChange={(d) => field.onChange(d ?? undefined)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea maxLength={200} {...field} />
              </FormControl>
              <FormDescription>Optional. Shown on your profile, 160 characters at most.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="plan"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>Plan</FormLabel>
              <FormControl>
                <RadioGroup value={field.value ?? ""} onValueChange={field.onChange} onBlur={field.onBlur} className="gap-2">
                  {PLANS.map((p) => (
                    <Label
                      key={p.value}
                      className={
                        "items-start gap-3 rounded-field bg-surface-container-high px-4 py-3 transition-colors duration-200 hover:bg-surface-container-highest " +
                        "has-data-[state=checked]:bg-secondary has-data-[state=checked]:text-secondary-foreground dark:bg-surface-container-highest dark:hover:bg-surface-bright " +
                        "dark:has-data-[state=checked]:bg-secondary " +
                        "cursor-pointer " +
                        (fieldState.error ? "ring-1 ring-destructive" : "")
                      }
                    >
                      <RadioGroupItem value={p.value} aria-invalid={fieldState.error ? true : undefined} className="mt-0.5" />
                      <span className="grid gap-0.5">
                        <span>{p.title}</span>
                        <span className="type-body-sm font-normal text-muted-foreground">{p.text}</span>
                      </span>
                    </Label>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="seats"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Team size</FormLabel>
              <FormControl>
                <Slider min={1} max={50} step={1} value={[field.value]} onValueChange={([v]) => field.onChange(v)} valueLabel />
              </FormControl>
              <FormDescription>How many people will use the workspace. You can change it later.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notify"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between gap-4">
                <div className="grid gap-0.5">
                  <FormLabel>Product updates</FormLabel>
                  <FormDescription>Email me when something new ships.</FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="terms"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-start gap-3">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={(c) => field.onChange(c === true)} className="mt-0.5" />
                </FormControl>
                <FormLabel className="font-normal">I accept the terms of service and the privacy policy</FormLabel>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" loading={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Creating account" : "Create account"}
          </Button>
          <Button type="button" variant="ghost" disabled={form.formState.isSubmitting} onClick={() => form.reset(defaults as Values)}>
            Reset
          </Button>
        </div>
      </form>
    </Form>
  )
}

export default function FormPage() {
  return (
    <>
      <Snackbars />

      <PageHeader eyebrow="Component 50" title="Form">
        react-hook-form wiring for Velvet, with the same parts as shadcn&apos;s Form. Velvet&apos;s text fields keep one
        floating label, errors open with a spring and are announced, and a failed submit shakes what needs fixing.
      </PageHeader>

      <Section title="Install">
        <Code>{`npx shadcn@latest add @velvet/form @velvet/label`}</Code>
      </Section>

      <Section
        title="Sign-up form"
        description="Press Create account with nothing filled in: every problem shows at once, the invalid fields shake once and the first one takes focus. Fix a field and its message closes. Validation is a zod schema; the button shows its loading state while the (pretend) request runs."
      >
        <Preview className="block bg-card p-5 sm:p-8 dark:bg-card">
          <div className="mx-auto max-w-xl">
            <SignUpForm />
          </div>
        </Preview>
      </Section>

      <Section
        title="One label, not two"
        description="Input, Textarea, Select, Combobox, Date Picker and Time Picker draw their own floating label. Inside a FormItem the FormLabel text feeds that label instead of being drawn a second time, so shadcn forms port over without doubled labels. A FormLabel next to Checkbox, Switch, Radio Group or Slider is a normal label."
      >
        <Code>{`<FormItem>
  <FormLabel>Email</FormLabel>                 {/* becomes the field's floating label */}
  <FormControl><Input type="email" {...field} /></FormControl>
  <FormDescription>We send the receipt here.</FormDescription>
  <FormMessage />
</FormItem>

{/* keep a separate label above a field: */}
<FormItem field={false}>...</FormItem>
{/* the control is a Velvet field inside your own component: */}
<FormItem field>...</FormItem>`}</Code>
      </Section>

      <Section
        title="Accessibility"
        description="FormControl gives the control its id, aria-invalid and an aria-describedby that lists the description and, while there is an error, the message. FormMessage is a polite live region, so a screen reader reads the error as it opens. A radio group is named through aria-labelledby and a slider through aria-label. Fields that expose a ref get focus from react-hook-form after a failed submit; the date and time pickers are focused by Velvet."
      >
        <Code>{`<input id="…-form-item" aria-invalid="true" aria-describedby="…-form-item-description …-form-item-message">
<div id="…-form-item-message" aria-live="polite">Enter your email.</div>`}</Code>
      </Section>

      <Section title="Label" id="label" description="The plain label for controls that have no floating label of their own. It follows its control: put it after a peer control and it dims when that control is disabled and turns red when it is invalid.">
        <div className="grid gap-4 md:grid-cols-2">
          <Preview label="With a checkbox, switch and radio" className="flex-col items-start gap-4 bg-card dark:bg-card">
            <div className="flex items-center gap-3">
              <Checkbox id="lbl-news" defaultChecked />
              <Label htmlFor="lbl-news">Send me product news</Label>
            </div>
            <div className="flex items-center gap-3">
              <Switch id="lbl-dark" />
              <Label htmlFor="lbl-dark">Reduce motion</Label>
            </div>
            <RadioGroup defaultValue="a" aria-label="Density" className="gap-3">
              <div className="flex items-center gap-3">
                <RadioGroupItem id="lbl-a" value="a" />
                <Label htmlFor="lbl-a">Comfortable</Label>
              </div>
              <div className="flex items-center gap-3">
                <RadioGroupItem id="lbl-b" value="b" />
                <Label htmlFor="lbl-b">Compact</Label>
              </div>
            </RadioGroup>
          </Preview>
          <Preview label="Disabled and invalid, from the control" className="flex-col items-start gap-4 bg-card dark:bg-card">
            <div className="flex items-center gap-3">
              <Checkbox id="lbl-off" disabled />
              <Label htmlFor="lbl-off">Disabled option</Label>
            </div>
            <div className="flex items-center gap-3">
              <Checkbox id="lbl-bad" aria-invalid="true" />
              <Label htmlFor="lbl-bad">Needs your attention</Label>
            </div>
          </Preview>
        </div>
      </Section>

      <Section title="Usage">
        <Code>{`import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form"
import { Label } from "@/components/ui/label"

const form = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) })

<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
    <FormField control={form.control} name="role" render={({ field }) => (
      <FormItem>
        <FormLabel>Role</FormLabel>
        <Select value={field.value} onValueChange={field.onChange}>
          <FormControl><SelectTrigger ref={field.ref}><SelectValue /></SelectTrigger></FormControl>
          <SelectContent>...</SelectContent>
        </Select>
        <FormMessage />
      </FormItem>
    )} />
    <Button type="submit" loading={form.formState.isSubmitting}>Save</Button>
  </form>
</Form>`}</Code>
      </Section>

      <Section title="Props">
        <PropsTable
          note="Everything else matches shadcn's Form"
          rows={[
            ["FormItem field", "boolean", "auto", "true: treat the control as a Velvet field; false: keep a separate FormLabel"],
            ["FormLabel", "Label props", "", "Hidden when a Velvet field shows its text as the floating label"],
            ["FormControl", "Slot props", "", "Adds id, aria-invalid, aria-describedby (and aria-labelledby or aria-label where needed)"],
            ["FormMessage", "div props", "", "Error text or children. Always mounted, polite live region, spring open and close"],
            ["FormDescription", "p props", "", "Help text, linked through aria-describedby"],
            ["Label", "Radix Label props", "", "type-label-lg; follows peer disabled and aria-invalid, group data-disabled, data-error"],
          ]}
        />
      </Section>
    </>
  )
}
