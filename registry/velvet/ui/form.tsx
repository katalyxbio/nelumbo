"use client"

import * as React from "react"
import { Slot } from "radix-ui"
import {
  Controller,
  FormProvider,
  useFormContext,
  useFormState,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from "react-hook-form"

import { cn } from "@/lib/utils"
import { Icon } from "@/registry/velvet/ui/icon"
import { Label } from "@/registry/velvet/ui/label"
import { FieldWiringContext } from "@/registry/velvet/ui/field"
import { Input } from "@/registry/velvet/ui/input"
import { Textarea } from "@/registry/velvet/ui/textarea"
import { SelectTrigger } from "@/registry/velvet/ui/select"
import { Combobox, NestedSelect } from "@/registry/velvet/ui/combobox"
import { DatePicker, DateRangePicker } from "@/registry/velvet/ui/date-picker"
import { TimePicker } from "@/registry/velvet/ui/time-picker"
import { RadioGroup } from "@/registry/velvet/ui/radio-group"
import { Slider } from "@/registry/velvet/ui/slider"

/**
 * Velvet Form (react-hook-form), a drop-in for shadcn's Form
 *
 *   const form = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) })
 *
 *   <Form {...form}>
 *     <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
 *       <FormField control={form.control} name="email" render={({ field }) => (
 *         <FormItem>
 *           <FormLabel>Email</FormLabel>
 *           <FormControl><Input type="email" {...field} /></FormControl>
 *           <FormDescription>We send the receipt here.</FormDescription>
 *           <FormMessage />
 *         </FormItem>
 *       )} />
 *     </form>
 *   </Form>
 *
 * Same exports and props as shadcn (Form, FormField, FormItem, FormLabel,
 * FormControl, FormDescription, FormMessage, useFormField). Velvet adds:
 *
 * - Text fields keep one label. Input, Textarea, Select, Combobox, DatePicker
 *   and TimePicker draw their own floating label, so FormItem notices a field
 *   inside FormControl and FormLabel's text becomes that field's label (the
 *   FormLabel itself is not drawn twice). Set `label` on the field to use
 *   another text, or `<FormItem field={false}>` to keep a separate label.
 * - FormControl wires id, aria-invalid and aria-describedby (description and
 *   message) into the control. Velvet fields receive them through the field
 *   shell, so their own help text still counts. RadioGroup gets
 *   aria-labelledby and Slider an aria-label from the FormLabel.
 * - FormMessage is always mounted as a polite live region and opens with a
 *   spring (height and fade) with an error icon. Its text is announced.
 * - After a failed submit every invalid item shakes once (not with reduced
 *   motion) and, if nothing invalid has focus yet, the first one is focused.
 *
 * Checkbox, Switch: put the control and its label in a row inside FormItem:
 *
 *   <FormItem>
 *     <div className="flex items-start gap-3">
 *       <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
 *       <div className="grid gap-1"><FormLabel>Accept the terms</FormLabel><FormDescription>...</FormDescription></div>
 *     </div>
 *     <FormMessage />
 *   </FormItem>
 */

const Form = FormProvider

type FormFieldContextValue<TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>> = {
  name: TName
}

const FormFieldContext = React.createContext<FormFieldContextValue>({} as FormFieldContextValue)

const FormField = <TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>({
  ...props
}: ControllerProps<TFieldValues, TName>) => (
  <FormFieldContext.Provider value={{ name: props.name }}>
    <Controller {...props} />
  </FormFieldContext.Provider>
)

type ControlKind = "field" | "radio" | "slider" | "other"

type FormItemContextValue = {
  id: string
  kind: ControlKind
  /** Text of the FormLabel, when it is a plain string. */
  labelText?: string
  /** A Velvet field draws the label, so FormLabel stays out of the way. */
  hideLabel: boolean
  hasDescription: boolean
  hasMessage: boolean
}

const FormItemContext = React.createContext<FormItemContextValue>({
  id: "",
  kind: "other",
  hideLabel: false,
  hasDescription: false,
  hasMessage: false,
})

const FIELD_TYPES = new Set<unknown>([Input, Textarea, SelectTrigger, Combobox, NestedSelect, DatePicker, DateRangePicker, TimePicker])

/** Walks FormItem's children (not into other components' output) for its label, control and helper parts. */
function inspect(children: React.ReactNode) {
  const found: { kind: ControlKind; control?: React.ReactElement<Record<string, unknown>>; label?: React.ReactNode; hasLabel: boolean; hasDescription: boolean; hasMessage: boolean } = {
    kind: "other",
    hasLabel: false,
    hasDescription: false,
    hasMessage: false,
  }
  const visit = (node: React.ReactNode) => {
    React.Children.forEach(node, (child) => {
      if (!React.isValidElement<{ children?: React.ReactNode }>(child)) return
      if (child.type === FormLabel) {
        found.hasLabel = true
        found.label = child.props.children
      } else if (child.type === FormDescription) found.hasDescription = true
      else if (child.type === FormMessage) found.hasMessage = true
      else if (child.type === FormControl) {
        const only = React.Children.toArray(child.props.children)[0]
        if (React.isValidElement<Record<string, unknown>>(only)) {
          found.control = only
          found.kind = FIELD_TYPES.has(only.type) ? "field" : only.type === RadioGroup ? "radio" : only.type === Slider ? "slider" : "other"
        }
      } else visit(child.props.children)
    })
  }
  visit(children)
  return found
}

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

type FormItemProps = React.ComponentProps<"div"> & {
  /** Force how the label is handled: true when the control is a Velvet field inside your own component, false to keep a separate FormLabel. */
  field?: boolean
}

function FormItem({ className, children, field: forceField, ...props }: FormItemProps) {
  const id = React.useId()
  const { name } = React.useContext(FormFieldContext)
  const { getFieldState } = useFormContext()
  const formState = useFormState({ name })
  const error = name ? getFieldState(name, formState).error : undefined
  const ref = React.useRef<HTMLDivElement>(null)

  const info = React.useMemo(() => inspect(children), [children])
  const kind: ControlKind = forceField === true ? "field" : forceField === false && info.kind === "field" ? "other" : info.kind
  const labelText = typeof info.label === "string" ? info.label : undefined
  const ownLabel = Boolean(info.control?.props.label)
  const hideLabel = kind === "field" && info.hasLabel && (ownLabel || labelText !== undefined)

  // after a failed submit: shake once, and make sure an invalid control has focus
  const submitCount = formState.submitCount
  const invalidNow = React.useRef(false)
  invalidNow.current = Boolean(error)
  React.useEffect(() => {
    if (!submitCount || !invalidNow.current) return
    const el = ref.current
    if (el && !prefersReducedMotion() && typeof el.animate === "function") {
      el.animate(
        [{ translate: "0" }, { translate: "-6px" }, { translate: "5px" }, { translate: "-3px" }, { translate: "2px" }, { translate: "0" }],
        { duration: 420, easing: "cubic-bezier(0.2, 0, 0, 1)" }
      )
    }
    // react-hook-form focuses controls that expose a ref; the rest (date and time pickers) are found by aria-invalid
    const raf = requestAnimationFrame(() => {
      if (document.activeElement?.getAttribute("aria-invalid") === "true") return
      const first = el?.closest("form")?.querySelector<HTMLElement>(
        'input[aria-invalid="true"], textarea[aria-invalid="true"], button[aria-invalid="true"]'
      )
      first?.focus()
    })
    return () => cancelAnimationFrame(raf)
  }, [submitCount])

  return (
    <FormItemContext.Provider
      value={{ id, kind, labelText, hideLabel, hasDescription: info.hasDescription, hasMessage: info.hasMessage }}
    >
      <div
        ref={ref}
        data-slot="form-item"
        data-invalid={error ? true : undefined}
        className={cn("group/form-item flex flex-col gap-1.5", className)}
        {...props}
      >
        {children}
      </div>
    </FormItemContext.Provider>
  )
}

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext)
  const itemContext = React.useContext(FormItemContext)
  const { getFieldState } = useFormContext()
  const formState = useFormState({ name: fieldContext.name })
  const fieldState = getFieldState(fieldContext.name, formState)

  if (!fieldContext) throw new Error("useFormField should be used within <FormField>")

  const { id } = itemContext
  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formLabelId: `${id}-form-label`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    kind: itemContext.kind,
    labelText: itemContext.labelText,
    hideLabel: itemContext.hideLabel,
    hasDescription: itemContext.hasDescription,
    hasMessage: itemContext.hasMessage,
    ...fieldState,
  }
}

function FormLabel({ className, children, ...props }: React.ComponentProps<typeof Label>) {
  const { error, formItemId, formLabelId, hideLabel } = useFormField()
  // a Velvet field already shows this text as its floating label
  if (hideLabel) return null
  return (
    <Label
      id={formLabelId}
      data-slot="form-label"
      data-error={!!error}
      className={className}
      htmlFor={formItemId}
      {...props}
    >
      {children}
    </Label>
  )
}

function FormControl({ children, ...props }: React.ComponentProps<typeof Slot.Root>) {
  const { error, formItemId, formDescriptionId, formMessageId, formLabelId, kind, labelText, hideLabel, hasDescription, hasMessage } = useFormField()
  const describedBy =
    [hasDescription ? formDescriptionId : undefined, error && hasMessage ? formMessageId : undefined].filter(Boolean).join(" ") || undefined
  const invalid = !!error

  if (kind === "field") {
    // the field shell takes id, aria-invalid and aria-describedby from the context; the label goes in by prop
    const only = React.Children.toArray(children)[0]
    const inject = hideLabel && labelText && React.isValidElement<{ label?: string }>(only) && !only.props.label
    return (
      <FieldWiringContext.Provider value={{ id: formItemId, describedBy, invalid }}>
        {inject ? <Slot.Root {...({ label: labelText } as object)} {...props}>{children}</Slot.Root> : children}
      </FieldWiringContext.Provider>
    )
  }

  return (
    <Slot.Root
      data-slot="form-control"
      id={formItemId}
      aria-describedby={describedBy}
      aria-invalid={invalid ? true : undefined}
      // a radio group is not a labelable element; a slider's thumbs take the name by aria-label
      aria-labelledby={kind === "radio" && !hideLabel ? formLabelId : undefined}
      aria-label={kind === "slider" ? labelText : undefined}
      {...props}
    >
      {children}
    </Slot.Root>
  )
}

function FormDescription({ className, ...props }: React.ComponentProps<"p">) {
  const { formDescriptionId, kind } = useFormField()
  return (
    <p
      id={formDescriptionId}
      data-slot="form-description"
      className={cn("type-body-sm text-muted-foreground", kind === "field" && "px-4", className)}
      {...props}
    />
  )
}

/**
 * The error text (or `children` when there is no error). Always mounted, so it
 * is a live region that announces the text; the box opens and closes with a
 * spring on height and opacity, and the icon pops in.
 */
function FormMessage({ className, children, ...props }: React.ComponentProps<"div">) {
  const { error, formMessageId, kind } = useFormField()
  const body = error ? String(error?.message ?? "") : children
  const open = Boolean(body)
  // keep the last text while the box closes
  const [kept, setKept] = React.useState<React.ReactNode>(body)
  if (open && body !== kept) setKept(body)

  return (
    <div
      id={formMessageId}
      data-slot="form-message"
      data-open={open || undefined}
      aria-live="polite"
      aria-atomic
      className={cn(
        "grid transition-[grid-template-rows,opacity,margin] duration-[500ms] ease-(--ease-spring) motion-reduce:transition-none",
        open ? "grid-rows-[1fr] opacity-100" : "-mt-1.5 grid-rows-[0fr] opacity-0 duration-200 ease-(--ease-standard)",
        className
      )}
      {...props}
    >
      <div className={cn("min-h-0 overflow-hidden", !open && "invisible transition-[visibility] delay-300 motion-reduce:transition-none")}>
        <p
          className={cn(
            "flex items-start gap-1.5 type-body-sm",
            kind === "field" && "px-4",
            error ? "text-destructive" : "text-muted-foreground",
            open && "motion-safe:animate-[velvet-form-pop_500ms_var(--ease-spring)]"
          )}
        >
          {error && <Icon name="error" fill className="mt-px shrink-0 [--icon-size:16px] [--icon-opsz:20]" />}
          <span>{kept}</span>
        </p>
      </div>
      <style href="velvet-form" precedence="default">{`@keyframes velvet-form-pop{0%{translate:0 -6px}100%{translate:0 0}}`}</style>
    </div>
  )
}

export { useFormField, Form, FormItem, FormLabel, FormControl, FormDescription, FormMessage, FormField }
