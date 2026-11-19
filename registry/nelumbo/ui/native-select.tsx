"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { FieldShell as Field, type FieldShellOptions as FieldProps } from "@/registry/nelumbo/ui/field-shell"
import { Icon } from "@/registry/nelumbo/ui/icon"

/**
 * Nelumbo NativeSelect
 *
 * API-compatible with shadcn's NativeSelect: a real <select>, styled to match
 * Nelumbo's Select (same field surface, height, radius, chevron, focus and
 * invalid treatment). The browser draws the list, so you get the platform
 * picker on phones, perfect keyboard and type-ahead, and no JavaScript.
 *
 *   <NativeSelect label="Country" description="Used for tax." defaultValue="">
 *     <NativeSelectOption value="" disabled>Choose a country</NativeSelectOption>
 *     <NativeSelectOptGroup label="Europe">
 *       <NativeSelectOption value="de">Germany</NativeSelectOption>
 *     </NativeSelectOptGroup>
 *   </NativeSelect>
 *
 * - `label`, `variant` (filled | outlined), `icon`, `description`, `error`:
 *   same as Input. With a label it is always raised (a select always shows a
 *   value), so start with a disabled `value=""` option as the placeholder.
 * - `size`: default 56px, sm 48px, xs 36px (no floating label; `label` names
 *   the control for screen readers). Pass `aria-label` for a bare select.
 * - `className` goes on the field wrapper (set its width there); every other
 *   prop goes to the <select>, and `ref` points at it.
 * - Dark mode sets `color-scheme`, so the open list is dark too.
 * - Single choice only; for `multiple` use a listbox of your own.
 */
type NativeSelectProps = Omit<React.ComponentProps<"select">, "size"> & Omit<FieldProps, "trailing">

function NativeSelect({
  label,
  variant,
  indicator,
  size = "default",
  icon,
  description,
  error,
  className,
  id,
  disabled,
  children,
  "aria-invalid": ariaInvalid,
  ...props
}: NativeSelectProps) {
  const invalid = Boolean(error) || ariaInvalid === true || ariaInvalid === "true"
  const compact = size === "xs"
  const floating = Boolean(label) && !compact
  return (
    <Field
      {...{ label, variant, indicator, size, icon, description, error, className, id, disabled, ariaInvalid }}
      trailing={
        <Icon
          name="arrow_drop_down"
          className="pointer-events-none me-1 text-muted-foreground transition-colors duration-200 group-focus-within/field:text-primary"
        />
      }
    >
      {/* a select has no placeholder attribute */}
      {/* eslint-disable-next-line @typescript-eslint/no-unused-vars */}
      {({ className: controlClass, placeholder, ...control }) => (
        <>
          {/* covers the whole field so any part of it opens the picker */}
          <select
            data-slot="native-select"
            data-size={size}
            className={cn(
              controlClass,
              "absolute inset-0 z-[1] cursor-pointer appearance-none rounded-field ps-(--label-x)",
              compact ? "pe-8" : "pe-12",
              invalid && (compact ? "pe-14" : "pe-[5.25rem]"),
              !floating && !compact && "py-0",
              // the native list follows the theme
              "[color-scheme:light] dark:[color-scheme:dark] [&_option]:bg-surface-container [&_option]:text-foreground [&_optgroup]:bg-surface-container [&_optgroup]:text-foreground",
              "[&_option:disabled]:text-muted-foreground"
            )}
            {...control}
            {...props}
          >
            {children}
          </select>
          <span aria-hidden className="flex-1" />
        </>
      )}
    </Field>
  )
}

function NativeSelectOption(props: React.ComponentProps<"option">) {
  return <option data-slot="native-select-option" {...props} />
}

function NativeSelectOptGroup(props: React.ComponentProps<"optgroup">) {
  return <optgroup data-slot="native-select-optgroup" {...props} />
}

export { NativeSelect, NativeSelectOption, NativeSelectOptGroup, type NativeSelectProps }
