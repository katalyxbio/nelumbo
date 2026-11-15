"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { Icon } from "@/registry/nelumbo/ui/icon"
import { Label } from "@/registry/nelumbo/ui/label"
import { FieldWiringContext } from "@/registry/nelumbo/ui/field-shell"

/**
 * Nelumbo Field (form layout), a drop-in for shadcn's Field set
 *
 *   <FieldSet>
 *     <FieldLegend>Payment method</FieldLegend>
 *     <FieldDescription>All transactions are secure and encrypted.</FieldDescription>
 *     <FieldGroup>
 *       <Field>
 *         <FieldLabel htmlFor="name">Name on card</FieldLabel>
 *         <Input id="name" />
 *         <FieldDescription>As it appears on the card.</FieldDescription>
 *       </Field>
 *       <Field orientation="horizontal">
 *         <Switch id="save" />
 *         <FieldLabel htmlFor="save">Save this card</FieldLabel>
 *       </Field>
 *     </FieldGroup>
 *   </FieldSet>
 *
 * Same exports and props as shadcn: Field (orientation "vertical" | "horizontal"
 * | "responsive", data-invalid, data-disabled), FieldLabel, FieldDescription,
 * FieldError (errors array or children), FieldGroup, FieldSet, FieldLegend
 * (variant "legend" | "label"), FieldSeparator, FieldContent, FieldTitle.
 * Nelumbo adds:
 *
 * - One label for text fields. Input, Textarea, Select, Combobox, DatePicker and
 *   TimePicker draw their own floating label, so a FieldLabel with a plain
 *   string next to one becomes that field's label (it is not drawn twice).
 *   Field also wires id, aria-invalid (from data-invalid) and aria-describedby
 *   (FieldDescription and FieldError) into the control, as Form does. Use
 *   `<Field floating={false}>` to keep a separate FieldLabel.
 * - Choice cards. A FieldLabel that wraps a Field with a Checkbox, RadioGroupItem
 *   or Switch is a tonal card. Selecting it fills it with the secondary color and
 *   its corners spring from round to squarer, like the segmented buttons.
 * - FieldError is a polite live region that opens with a spring.
 * - FieldSeparator is spacing, with optional centered text, and no line.
 */

type FieldContextValue = {
  descriptionId?: string
  errorId?: string
  /** A Nelumbo field draws the label, so FieldLabel stays out of the way. */
  hideLabel: boolean
  controlId?: string
}

const InCardContext = React.createContext(false)

const FieldContext = React.createContext<FieldContextValue>({ hideLabel: false })

/** Nelumbo text controls mark themselves with a static `formControl = "field"`. */
const isNelumboField = (type: unknown) => (type as { formControl?: string } | null)?.formControl === "field"

type Found = { control: boolean; ownLabel: boolean; label?: string; hasLabel: boolean; hasDescription: boolean; hasError: boolean }

/** Walks the children (not into other components' output, nor nested Fields) for the label, control and helper parts. */
function inspect(children: React.ReactNode): Found {
  const found: Found = { control: false, ownLabel: false, hasLabel: false, hasDescription: false, hasError: false }
  const visit = (node: React.ReactNode) => {
    React.Children.forEach(node, (child) => {
      if (!React.isValidElement<{ children?: React.ReactNode; label?: unknown }>(child)) return
      if (child.type === Field) return
      if (child.type === FieldLabel) {
        found.hasLabel = true
        if (typeof child.props.children === "string") found.label = child.props.children
      } else if (child.type === FieldDescription) found.hasDescription = true
      else if (child.type === FieldError) found.hasError = true
      else if (isNelumboField(child.type)) {
        found.control = true
        if (child.props.label) found.ownLabel = true
        visit(child.props.children)
      } else visit(child.props.children)
    })
  }
  visit(children)
  return found
}

/** Gives the label text to the first Nelumbo field that has none. */
function injectLabel(children: React.ReactNode, label: string): React.ReactNode {
  let done = false
  const walk = (node: React.ReactNode): React.ReactNode =>
    React.Children.map(node, (child) => {
      if (done || !React.isValidElement<{ children?: React.ReactNode; label?: unknown }>(child) || child.type === Field) return child
      if (isNelumboField(child.type) && !child.props.label) {
        done = true
        return React.cloneElement(child, { label })
      }
      if (child.props.children == null) return child
      // Select and friends take their trigger as a child, so look inside any element
      const next = walk(child.props.children)
      return done ? React.cloneElement(child, undefined, next) : child
    })
  return walk(children)
}

function FieldSet({ className, ...props }: React.ComponentProps<"fieldset">) {
  return (
    <fieldset
      data-slot="field-set"
      className={cn(
        "m-0 flex min-w-0 flex-col gap-4 border-0 p-0",
        "has-[>[data-slot=checkbox-group]]:gap-3 has-[>[data-slot=radio-group]]:gap-3",
        className
      )}
      {...props}
    />
  )
}

type FieldLegendProps = React.ComponentProps<"legend"> & { variant?: "legend" | "label" }

function FieldLegend({ className, variant = "legend", ...props }: FieldLegendProps) {
  return (
    <legend
      data-slot="field-legend"
      data-variant={variant}
      className={cn(
        "mb-1.5 p-0 text-foreground",
        variant === "legend" ? "type-title-md" : "type-label-lg",
        className
      )}
      {...props}
    />
  )
}

/** A stack of fields, 24px apart. It is also the container that `orientation="responsive"` measures. */
function FieldGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-group"
      className={cn(
        "group/field-group @container/field-group flex w-full flex-col gap-6",
        "data-[slot=checkbox-group]:gap-3 *:data-[slot=field-group]:gap-4",
        className
      )}
      {...props}
    />
  )
}

type FieldProps = React.ComponentProps<"div"> & {
  orientation?: "vertical" | "horizontal" | "responsive"
  /** Set false to keep a separate FieldLabel next to a Nelumbo text field. */
  floating?: boolean
}

const ORIENTATION = {
  vertical: "flex-col [&>*]:w-full",
  horizontal: [
    "flex-row items-center gap-3 [--field-gap:0.75rem]",
    "[&>[data-slot=field-label]]:flex-auto",
    // a checkbox or radio lines up with the first line of the title; a switch centers on the row
    "has-[>[data-slot=field-content]]:items-start",
    "has-[>[data-slot=field-content]]:[&>[role=checkbox]]:mt-[3px] has-[>[data-slot=field-content]]:[&>[role=radio]]:mt-0.5",
    "has-[>[data-slot=field-content]]:[&>[role=switch]]:self-center",
  ],
  responsive: [
    "flex-col [&>*]:w-full [&>.sr-only]:w-auto",
    "@md/field-group:flex-row @md/field-group:items-center @md/field-group:gap-3 @md/field-group:[&>*]:w-auto",
    "@md/field-group:[&>[data-slot=field-label]]:flex-auto @md/field-group:[&>[data-slot=field-content]]:flex-auto",
    "@md/field-group:has-[>[data-slot=field-content]]:items-start",
  ],
}

function Field({ className, orientation = "vertical", floating = true, children, ...props }: FieldProps) {
  const id = React.useId()
  // inside a choice card the label already names the control; a group role would hide that text from the name
  const inCard = React.useContext(InCardContext)
  const info = React.useMemo(() => inspect(children), [children])
  const nelumbo = floating && info.control
  const hideLabel = nelumbo && info.hasLabel && (info.ownLabel || info.label !== undefined)
  const flag = (props as Record<string, unknown>)["data-invalid"]
  const invalid = flag === true || flag === "true"
  const controlId = `${id}-control`
  const descriptionId = info.hasDescription ? `${id}-description` : undefined
  const errorId = info.hasError ? `${id}-error` : undefined
  const describedBy = [descriptionId, invalid ? errorId : undefined].filter(Boolean).join(" ") || undefined

  let body = children
  if (nelumbo && hideLabel && info.label && !info.ownLabel) body = injectLabel(children, info.label)
  const ctx = React.useMemo(
    () => ({ descriptionId, errorId, hideLabel: Boolean(hideLabel), controlId: nelumbo ? controlId : undefined }),
    [descriptionId, errorId, hideLabel, nelumbo, controlId]
  )

  return (
    <FieldContext.Provider value={ctx}>
      <div
        role={inCard ? undefined : "group"}
        data-slot="field"
        data-orientation={orientation}
        className={cn(
          "group/field group flex w-full gap-2 [--field-gap:0.5rem] data-[disabled=true]:pointer-events-none",
          ORIENTATION[orientation],
          className
        )}
        {...props}
      >
        {nelumbo ? (
          <FieldWiringContext.Provider value={{ id: controlId, describedBy, invalid }}>{body}</FieldWiringContext.Provider>
        ) : (
          body
        )}
      </div>
    </FieldContext.Provider>
  )
}

/** Wraps a title and description beside a control (horizontal fields, choice cards). */
function FieldContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-content"
      className={cn("group/field-content flex min-w-0 flex-1 flex-col gap-0.5 [--field-gap:0.125rem]", className)}
      {...props}
    />
  )
}

/**
 * The label. Plain: a label-lg line. Wrapping a Field (a Checkbox, RadioGroupItem
 * or Switch with its title): a selectable tonal card.
 */
function FieldLabel({ className, children, htmlFor, ...props }: React.ComponentProps<typeof Label>) {
  const { hideLabel, controlId } = React.useContext(FieldContext)
  if (hideLabel) return null
  const card = React.Children.toArray(children).some((c) => React.isValidElement(c) && c.type === Field)

  return (
    <Label
      data-slot="field-label"
      data-card={card || undefined}
      htmlFor={htmlFor ?? (card ? undefined : controlId)}
      className={cn(
        "group/field-label w-fit leading-snug group-data-[invalid=true]/field:text-destructive group-data-[disabled=true]/field:opacity-40",
        "has-[>[data-slot=field]]:w-full has-[>[data-slot=field]]:flex-col has-[>[data-slot=field]]:items-stretch",
        card && [
          // a tonal card; selected = secondary fill, corners spring from round to squarer
          "tactile state-layer cursor-pointer rounded-2xl p-4 [--card-bg:var(--surface-container)] bg-(--card-bg)",
          "dark:not-has-[[data-state=checked]]:[--card-bg:var(--surface-container-high)]",
          "has-[[data-state=checked]]:[--card-bg:var(--secondary)] has-[[data-state=checked]]:rounded-lg has-[[data-state=checked]]:text-secondary-foreground",
          "has-[[data-state=checked]]:[&_[data-slot=field-title]]:text-secondary-foreground",
          "has-[[data-state=checked]]:[&_[data-slot=field-description]]:text-secondary-foreground/80",
          "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ring",
          "has-[[aria-invalid=true]]:[--card-bg:var(--destructive-container)]",
          "[--press-scale:0.985] has-[:disabled]:pointer-events-none has-[:disabled]:opacity-40",
        ],
        className
      )}
      {...props}
    >
      <InCardContext.Provider value={card}>{children}</InCardContext.Provider>
    </Label>
  )
}

/** A title line that is not a <label> (for example beside a Switch). */
function FieldTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-title"
      className={cn(
        "flex w-fit items-center gap-2 type-label-lg leading-snug text-foreground",
        "transition-colors duration-200 ease-(--ease-standard) group-data-[disabled=true]/field:opacity-40",
        className
      )}
      {...props}
    />
  )
}

function FieldDescription({ className, id, ...props }: React.ComponentProps<"p">) {
  const { descriptionId, controlId } = React.useContext(FieldContext)
  return (
    <p
      id={id ?? descriptionId}
      data-slot="field-description"
      className={cn(
        "type-body-sm text-muted-foreground transition-colors duration-200 ease-(--ease-standard)",
        // under a Nelumbo text field, line up with its text
        controlId && "px-4",
        "[&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-foreground",
        className
      )}
      {...props}
    />
  )
}

/** Spacing between groups of fields. With children, the text sits centered in the gap. There is no line. */
function FieldSeparator({ children, className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-separator"
      data-content={Boolean(children)}
      aria-hidden={children ? undefined : true}
      className={cn("-my-1 flex h-6 items-center justify-center", className)}
      {...props}
    >
      {children && (
        <span data-slot="field-separator-content" className="type-label-md text-muted-foreground">
          {children}
        </span>
      )}
    </div>
  )
}

type FieldErrorProps = React.ComponentProps<"div"> & {
  errors?: Array<{ message?: string } | undefined>
}

/**
 * The error text: `errors` (react-hook-form or Zod issues, deduplicated) or
 * `children`. Always mounted, so it is a polite live region that announces the
 * text; the box opens with a spring on height and opacity and the icon pops in.
 */
function FieldError({ className, children, errors, id, ...props }: FieldErrorProps) {
  const { errorId, controlId } = React.useContext(FieldContext)
  const messages = React.useMemo(() => {
    if (children) return null
    const unique = [...new Map((errors ?? []).filter((e) => e?.message).map((e) => [e!.message, e])).values()]
    return unique.map((e) => e!.message as string)
  }, [children, errors])
  const body: React.ReactNode = children
    ? children
    : messages && messages.length > 1
      ? (
          <ul className="ml-4 flex list-disc flex-col gap-1">
            {messages.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        )
      : messages?.[0]
  const open = Boolean(body)
  // keep the last text while the box closes
  const [kept, setKept] = React.useState<React.ReactNode>(body)
  if (open && body !== kept && typeof body !== "object") setKept(body)
  const shown = open ? body : kept

  return (
    <div
      id={id ?? errorId}
      aria-live="polite"
      aria-atomic
      data-slot="field-error"
      data-open={open || undefined}
      className={cn(
        "grid transition-[grid-template-rows,opacity,margin] duration-[500ms] ease-(--ease-spring) motion-reduce:transition-none",
        open
          ? "grid-rows-[1fr] opacity-100"
          : "-mt-(--field-gap) grid-rows-[0fr] opacity-0 duration-200 ease-(--ease-standard)",
        className
      )}
      {...props}
    >
      <div className={cn("min-h-0 overflow-hidden", !open && "invisible transition-[visibility] delay-300 motion-reduce:transition-none")}>
        <div
          className={cn(
            "flex items-start gap-1.5 type-body-sm text-destructive",
            controlId && "px-4",
            open && "motion-safe:animate-[nelumbo-field-pop_500ms_var(--ease-spring)]"
          )}
        >
          <Icon name="error" fill className="mt-px shrink-0 [--icon-size:16px] [--icon-opsz:20]" />
          <div className="min-w-0">{shown}</div>
        </div>
      </div>
      <style href="nelumbo-field" precedence="default">{`@keyframes nelumbo-field-pop{0%{translate:0 -6px}100%{translate:0 0}}`}</style>
    </div>
  )
}

export {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldContent,
  FieldTitle,
}
export type { FieldProps, FieldErrorProps }
