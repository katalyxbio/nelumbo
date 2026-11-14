"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { Icon, type IconName } from "@/registry/velvet/ui/icon"

/**
 * Velvet Input (text field)
 *
 *   <Input label="Email" type="email" icon="mail" description="We send the receipt here." />
 *   <Input variant="outlined" label="Phone" error="Enter the full number." />
 *
 * - `filled` (default): tonal container with an underline that thickens on focus.
 * - `outlined`: the label sits in a gap cut into the top border, so it works on
 *   any background (the gap is a real hole in the border, not a painted patch).
 *
 * The label floats with CSS only (`:placeholder-shown`), so it works for
 * controlled and uncontrolled inputs and for browser autofill. One variable,
 * `--float` (0 resting, 1 raised), drives the label, the icons and the notch.
 *
 * `className` goes on the outer wrapper; every other prop goes to the <input>,
 * and `ref` points at the <input>.
 */
type InputProps = Omit<React.ComponentProps<"input">, "size"> & {
  label?: string
  variant?: "filled" | "outlined"
  /** Leading Material Symbol. */
  icon?: IconName
  /** Trailing slot, for example an IconButton (size="sm") that clears or reveals. */
  trailing?: React.ReactNode
  /** Help text under the field. */
  description?: React.ReactNode
  /** Marks the field invalid. A string replaces the description. */
  error?: React.ReactNode | boolean
}

function Input({
  label,
  variant = "filled",
  icon,
  trailing,
  description,
  error,
  className,
  id,
  placeholder,
  disabled,
  ...props
}: InputProps) {
  const autoId = React.useId()
  const inputId = id ?? autoId
  const helpId = `${inputId}-help`
  const invalid = Boolean(error) || props["aria-invalid"] === true || props["aria-invalid"] === "true"
  const help = typeof error === "string" || React.isValidElement(error) ? error : description
  const filled = variant === "filled"
  const floating = Boolean(label)

  return (
    <div data-slot="input" className={cn("flex w-full flex-col gap-1.5", className)}>
      <div
        data-slot="input-field"
        data-variant={variant}
        data-invalid={invalid || undefined}
        data-disabled={disabled || undefined}
        className={cn(
          "group/field relative flex h-14 cursor-text items-center gap-3 rounded-field px-4",
          "[--icon-size:20px] [--icon-opsz:20] [--label-x:1rem] has-[[data-slot=input-icon]]:[--label-x:3rem]",
          // --float: 1 when the label is raised (focused or has a value)
          floating ? "[--float:1] has-[input:placeholder-shown:not(:focus)]:[--float:0]" : "[--float:0]",
          "transition-colors duration-200 ease-(--ease-standard)",
          filled && [
            "overflow-hidden bg-surface-container-high dark:bg-surface-container-highest",
            "hover:bg-surface-container-highest focus-within:bg-surface-container-highest",
            "dark:hover:bg-surface-bright dark:focus-within:bg-surface-bright",
            "data-invalid:bg-destructive-container/60 dark:data-invalid:bg-destructive-container/40",
          ],
          "data-disabled:pointer-events-none data-disabled:opacity-40"
        )}
      >
        {icon && (
          <Icon
            data-slot="input-icon"
            name={icon}
            className={cn(
              "text-muted-foreground group-data-invalid/field:text-destructive",
              filled && "translate-y-[calc(var(--float)*0.5rem)] transition-[translate] duration-200 ease-(--ease-standard)"
            )}
          />
        )}

        <input
          id={inputId}
          data-slot="input-control"
          disabled={disabled}
          aria-invalid={invalid || undefined}
          aria-describedby={help ? helpId : undefined}
          // a placeholder is needed for :placeholder-shown, which floats the label
          placeholder={placeholder ?? (floating ? " " : undefined)}
          className={cn(
            "peer h-full w-full min-w-0 flex-1 bg-transparent type-body-lg leading-6 text-foreground outline-none",
            "placeholder:text-muted-foreground disabled:cursor-not-allowed",
            "[&::-webkit-search-cancel-button]:hidden",
            floating && "placeholder:opacity-0 focus:placeholder:opacity-100 placeholder:transition-opacity",
            filled && floating && "pt-6 pb-2"
          )}
          {...props}
        />

        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              "pointer-events-none absolute top-0 left-(--label-x) max-w-[calc(100%-var(--label-x)-1rem)] origin-top-left truncate",
              "type-body-lg leading-6 text-muted-foreground",
              "group-focus-within/field:text-primary group-data-invalid/field:text-destructive",
              "transition-[translate,scale,color] duration-200 ease-(--ease-standard) motion-reduce:transition-none",
              "scale-[calc(1-var(--float)*0.25)]",
              filled
                ? // resting: centered (16px); raised: 7px from the top
                  "translate-y-[calc(1rem-var(--float)*9px)]"
                : // raised: centered on the top border, moved to the start of the field
                  "translate-x-[calc(var(--float)*(1rem-var(--label-x)))] translate-y-[calc(1rem-var(--float)*25px)]"
            )}
          >
            {label}
          </label>
        )}

        {invalid && (
          <Icon
            name="error"
            fill
            className={cn(
              "text-destructive",
              filled && "translate-y-[calc(var(--float)*0.5rem)] transition-[translate] duration-200 ease-(--ease-standard)"
            )}
          />
        )}
        {trailing && (
          <div
            data-slot="input-trailing"
            className={cn(
              "-me-2 flex items-center",
              filled && "translate-y-[calc(var(--float)*0.5rem)] transition-[translate] duration-200 ease-(--ease-standard)"
            )}
          >
            {trailing}
          </div>
        )}

        {filled ? (
          // active indicator: 1px at rest, 2px on focus or error
          <span
            aria-hidden
            className={cn(
              "pointer-events-none absolute inset-x-0 bottom-0 h-px bg-input transition-[height,background-color] duration-200",
              "group-hover/field:bg-foreground group-focus-within/field:h-0.5 group-focus-within/field:bg-primary",
              "group-data-invalid/field:h-0.5 group-data-invalid/field:bg-destructive"
            )}
          />
        ) : (
          // the border, with a gap the width of the raised label (fieldset + legend)
          <fieldset
            aria-hidden
            className={cn(
              "pointer-events-none absolute inset-x-0 -top-[5px] bottom-0 m-0 min-w-0 rounded-field border border-input px-3 text-left",
              "transition-colors duration-200 group-hover/field:border-foreground",
              "group-focus-within/field:border-2 group-focus-within/field:border-primary group-focus-within/field:px-[11px]",
              "group-data-invalid/field:border-2 group-data-invalid/field:border-destructive group-data-invalid/field:px-[11px]"
            )}
          >
            <legend
              className={cn(
                "invisible float-none block h-[11px] p-0 whitespace-nowrap",
                "max-w-[calc(var(--float)*100%+0.01px)] transition-[max-width] duration-200 ease-(--ease-standard)",
                "text-[calc(1.0625rem*0.75)] tracking-[-0.011em]"
              )}
            >
              {label && <span className="inline-block px-1">{label}</span>}
            </legend>
          </fieldset>
        )}
      </div>

      {help && (
        <p
          id={helpId}
          data-slot="input-description"
          className={cn("px-4 type-body-sm text-muted-foreground", invalid && "text-destructive", disabled && "opacity-40")}
        >
          {help}
        </p>
      )}
    </div>
  )
}

export { Input, type InputProps }
