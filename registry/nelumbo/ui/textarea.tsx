"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { FieldShell as Field, type FieldShellOptions as FieldProps } from "@/registry/nelumbo/ui/field-shell"

/**
 * Nelumbo Textarea
 *
 *   <Textarea label="Message" maxLength={280} description="Visible to the whole team." />
 *
 * Same look and props as Input (filled by default, or outlined; size default
 * or sm). The label rests on the first line. The box grows with its content
 * from `rows` lines up to `maxRows` lines, then scrolls. With `maxLength`,
 * a character count shows at the end of the help row.
 *
 * `className` goes on the outer wrapper; every other prop goes to the
 * <textarea>, and `ref` points at the <textarea>.
 */
type TextareaProps = React.ComponentProps<"textarea"> &
  Omit<FieldProps, "icon" | "trailing"> & {
    /** Lines the box grows to before it scrolls. Default 8. */
    maxRows?: number
  }

function Textarea({
  label,
  variant,
  indicator,
  size,
  description,
  error,
  className,
  id,
  placeholder,
  disabled,
  rows = 3,
  maxRows = 8,
  maxLength,
  style,
  onChange,
  "aria-invalid": ariaInvalid,
  ...props
}: TextareaProps) {
  const controlled = props.value !== undefined
  const [typed, setTyped] = React.useState(() => String(props.defaultValue ?? "").length)
  const count = controlled ? String(props.value ?? "").length : typed

  return (
    <Field
      multiline
      meta={maxLength !== undefined && `${count} / ${maxLength}`}
      {...{ label, variant, indicator, size, description, error, className, id, placeholder, disabled, ariaInvalid }}
    >
      {({ className: controlClass, ...control }) => (
        <textarea
          data-slot="textarea"
          rows={rows}
          maxLength={maxLength}
          // grows with its content (field-sizing), between rows and maxRows lines
          className={cn(controlClass, "field-sizing-content")}
          style={{
            minHeight: `${rows * 1.5}rem`,
            maxHeight: `${maxRows * 1.5}rem`,
            ...style,
          }}
          onChange={(e) => {
            if (!controlled) setTyped(e.target.value.length)
            onChange?.(e)
          }}
          {...control}
          {...props}
        />
      )}
    </Field>
  )
}


// lets FormItem recognise this control without importing it
Textarea.formControl = "field" as const

export { Textarea, type TextareaProps }
