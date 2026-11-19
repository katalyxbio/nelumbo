"use client"

import * as React from "react"

import { FieldShell as Field, type FieldShellOptions as FieldProps } from "@/registry/nelumbo/ui/field-shell"

/**
 * Nelumbo Input (text field)
 *
 *   <Input label="Email" type="email" icon="mail" description="We send the receipt here." />
 *   <Input variant="outlined" size="sm" label="Phone" error="Enter the full number." />
 *
 * - `filled` (default): tonal container; focus and error draw an underline. Pass `indicator` for a thin line at rest.
 * - `outlined`: the label sits in a gap cut into the top border, so it works on
 *   any background (the gap is a real hole in the border, not a painted patch).
 * - `size`: default 56px, sm 48px for dense forms, xs 36px for toolbars and filters.
 *   xs has no floating label: the label becomes the placeholder and the
 *   control's accessible name.
 *
 * `className` goes on the outer wrapper; every other prop goes to the <input>,
 * and `ref` points at the <input>.
 */
type InputProps = Omit<React.ComponentProps<"input">, "size"> & FieldProps

function Input({
  label,
  variant,
  indicator,
  size,
  icon,
  trailing,
  description,
  error,
  className,
  id,
  placeholder,
  disabled,
  "aria-invalid": ariaInvalid,
  ...props
}: InputProps) {
  return (
    <Field
      {...{ label, variant, indicator, size, icon, trailing, description, error, className, id, placeholder, disabled, ariaInvalid }}
    >
      {({ className: controlClass, ...control }) => (
        <input
          data-slot="input"
          className={`${controlClass} [&::-webkit-search-cancel-button]:hidden`}
          {...control}
          {...props}
        />
      )}
    </Field>
  )
}


// lets FormItem recognise this control without importing it
Input.formControl = "field" as const

export { Input, type InputProps }
