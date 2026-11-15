"use client"

import * as React from "react"
import { Select as SelectPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { FieldShell as Field, type FieldShellOptions as FieldProps } from "@/registry/velvet/ui/field-shell"
import { Icon, type IconName } from "@/registry/velvet/ui/icon"
import { menuItem, menuItemSelected, menuPad } from "@/registry/velvet/ui/dropdown-menu"
import { floatingSurface } from "@/registry/velvet/ui/popover"

/**
 * Velvet Select (built on Radix Select)
 *
 * API-compatible with shadcn's Select. The trigger is a Velvet text field
 * (filled or outlined, floating label, help and error text), so a Select sits
 * in a form next to an Input and looks like one. The list drops below the
 * field at its full width and grows out of it on the spring; the chosen
 * option is filled in, as in the Dropdown Menu.
 *
 *   <Select value={plan} onValueChange={setPlan}>
 *     <SelectTrigger label="Plan" description="You can change it later.">
 *       <SelectValue />
 *     </SelectTrigger>
 *     <SelectContent>
 *       <SelectItem value="free">Free</SelectItem>
 *       <SelectItem value="pro" icon="star" description="Unlimited projects">Pro</SelectItem>
 *     </SelectContent>
 *   </Select>
 *
 * Without a label it is a plain field showing `<SelectValue placeholder>`.
 * `className` on SelectTrigger goes on the field's wrapper (set its width
 * there); `position="item-aligned"` on SelectContent gives the macOS-style list
 * that opens over the field instead.
 */

/** The arrow at the end of a field that opens a list; turns over while it's open. */
const fieldChevron = (
  <Icon
    name="arrow_drop_down"
    className={cn(
      "pointer-events-none me-1 text-muted-foreground transition-[rotate] duration-[396ms] ease-(--ease-spring)",
      "group-has-[[data-state=open]]/field:rotate-180 group-has-[[data-state=open]]/field:text-primary motion-reduce:transition-none"
    )}
  />
)

/**
 * Classes for a button that fills a Field (pass the control class Field gives
 * you). It covers the whole field, so a popup anchors to the field. Mark it
 * data-placeholder while empty so the label rests.
 */
function fieldButtonClass(controlClass: string, { label, invalid, compact }: { label?: boolean; invalid?: boolean; compact?: boolean }) {
  return cn(
    controlClass,
    "absolute inset-0 z-[1] flex cursor-pointer items-center rounded-field text-left",
    "ps-(--label-x)",
    compact ? "pe-8" : "pe-12",
    invalid && (compact ? "pe-14" : "pe-[5.25rem]"),
    "data-placeholder:text-muted-foreground",
    // with a label, the placeholder only shows once the label has risen
    label && "data-placeholder:not-data-[state=open]:text-transparent"
  )
}

function Select(props: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />
}

function SelectGroup(props: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />
}

function SelectValue({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" className={cn("truncate", className)} {...props} />
}

type SelectTriggerProps = Omit<React.ComponentProps<typeof SelectPrimitive.Trigger>, "size"> &
  Omit<FieldProps, "trailing">

function SelectTrigger({
  label,
  variant,
  size,
  icon,
  description,
  error,
  className,
  id,
  disabled,
  children,
  "aria-invalid": ariaInvalid,
  ...props
}: SelectTriggerProps) {
  const invalid = Boolean(error) || ariaInvalid === true || ariaInvalid === "true"
  return (
    <Field
      {...{ label, variant, size, icon, description, error, className, id, disabled, ariaInvalid }}
      trailing={fieldChevron}
    >
      {/* a button has no placeholder attribute; Radix marks it data-placeholder instead */}
      {/* eslint-disable-next-line @typescript-eslint/no-unused-vars */}
      {({ className: controlClass, placeholder, ...control }) => (
        <>
          {/* The trigger covers the whole field, so the list anchors to the field and any of it opens the list. */}
          <SelectPrimitive.Trigger
            data-slot="select-trigger"
            className={fieldButtonClass(controlClass, { label: Boolean(label) && size !== "xs", invalid, compact: size === "xs" })}
            {...control}
            {...props}
          >
            {children}
          </SelectPrimitive.Trigger>
          <span aria-hidden className="flex-1" />
        </>
      )}
    </Field>
  )
}

function SelectContent({
  className,
  children,
  position = "popper",
  sideOffset = 4,
  collisionPadding = 8,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  const popper = position === "popper"
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        position={position}
        sideOffset={popper ? sideOffset : undefined}
        collisionPadding={collisionPadding}
        className={cn(
          floatingSurface,
          "relative min-w-32 overflow-hidden",
          popper &&
            "max-h-[min(var(--radix-select-content-available-height),20rem)] w-(--radix-select-trigger-width) origin-(--radix-select-content-transform-origin)",
          className
        )}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn(
            menuPad,
            popper && "h-(--radix-select-trigger-height) w-full min-w-(--radix-select-trigger-width) scroll-my-1.5"
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
}

function SelectLabel({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn("px-3 pt-2 pb-1.5 type-label-md text-muted-foreground", className)}
      {...props}
    />
  )
}

type SelectItemProps = React.ComponentProps<typeof SelectPrimitive.Item> & {
  /** Material Symbol, shown in the list but not in the field. */
  icon?: IconName
  /** Put the icon before the label (default) or at the far end, opposite it. */
  iconPosition?: "start" | "end"
  /** Second line, shown in the list but not in the field. */
  description?: React.ReactNode
}

const itemCheck = (
  <Icon
    name="check"
    weight={600}
    className="text-secondary-foreground! animate-in zoom-in-50 fade-in-0 duration-[396ms] ease-(--ease-spring-bouncy)"
  />
)

function SelectItem({ className, children, icon, iconPosition = "start", description, ...props }: SelectItemProps) {
  const end = iconPosition === "end"
  // the check takes the side the icon doesn't
  const check = (
    <span className="grid size-5 shrink-0 place-items-center">
      <SelectPrimitive.ItemIndicator>{itemCheck}</SelectPrimitive.ItemIndicator>
    </span>
  )
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      data-icon-position={icon ? iconPosition : undefined}
      className={cn(menuItem, menuItemSelected, description && "h-auto min-h-14 py-2", className)}
      {...props}
    >
      {end ? check : icon && <Icon name={icon} />}
      <span className="flex min-w-0 flex-1 flex-col">
        <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
        {description && <span className="truncate type-body-sm text-muted-foreground in-data-[state=checked]:text-secondary-foreground/75">{description}</span>}
      </span>
      {end ? icon && <Icon name={icon} /> : check}
    </SelectPrimitive.Item>
  )
}

function SelectSeparator({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn("-mx-1.5 my-1.5 h-px bg-outline-variant", className)}
      {...props}
    />
  )
}

const scrollButton = "flex h-7 cursor-default items-center justify-center text-muted-foreground [--icon-size:20px] [--icon-opsz:20]"

function SelectScrollUpButton({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return (
    <SelectPrimitive.ScrollUpButton data-slot="select-scroll-up-button" className={cn(scrollButton, className)} {...props}>
      <Icon name="keyboard_arrow_up" />
    </SelectPrimitive.ScrollUpButton>
  )
}

function SelectScrollDownButton({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return (
    <SelectPrimitive.ScrollDownButton data-slot="select-scroll-down-button" className={cn(scrollButton, className)} {...props}>
      <Icon name="keyboard_arrow_down" />
    </SelectPrimitive.ScrollDownButton>
  )
}


// lets FormItem recognise this control without importing it
SelectTrigger.formControl = "field" as const

export {
  fieldButtonClass,
  fieldChevron,
  itemCheck,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
  type SelectItemProps,
  type SelectTriggerProps,
}
