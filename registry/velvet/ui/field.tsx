"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { Icon, type IconName } from "@/registry/velvet/ui/icon"

/**
 * Velvet Field: the shell shared by Input and Textarea.
 *
 * Draws the container (filled or outlined), the floating label, icons, the
 * notched border and the help text. The control itself is passed in by a
 * render function, which receives the id, aria attributes and class it needs.
 *
 * The label floats with CSS only (`:placeholder-shown`), so it works for
 * controlled and uncontrolled controls and for browser autofill. One variable,
 * `--float` (0 resting, 1 raised), drives the label, the icons and the notch.
 * Size is a set of variables too, so every position below is one formula.
 */
export type FieldProps = {
  label?: string
  variant?: "filled" | "outlined"
  /** default 56px, sm 48px. */
  size?: "default" | "sm"
  /** Leading Material Symbol. */
  icon?: IconName
  /** Trailing slot, for example an IconButton (size="sm") that clears or reveals. */
  trailing?: React.ReactNode
  /** Help text under the field. */
  description?: React.ReactNode
  /** Marks the field invalid. A string replaces the description. */
  error?: React.ReactNode | boolean
}

type ControlProps = {
  id: string
  disabled?: boolean
  placeholder?: string
  "aria-invalid"?: true
  "aria-describedby"?: string
  className: string
}

type FieldShellProps = FieldProps & {
  id?: string
  className?: string
  disabled?: boolean
  placeholder?: string
  ariaInvalid?: React.AriaAttributes["aria-invalid"]
  multiline?: boolean
  /** Single-line field that grows taller when its content wraps (chips). */
  grow?: boolean
  /** Shown at the end of the help row, e.g. a character count. */
  meta?: React.ReactNode
  children: (control: ControlProps) => React.ReactNode
}

const SIZES = {
  // field height, resting label offset, raised label offset (filled), value padding (filled)
  default: "[--field-h:3.5rem] [--label-rest:1rem] [--label-raised:7px] [--value-pt:1.5rem] [--value-pb:0.5rem]",
  sm: "[--field-h:3rem] [--label-rest:0.75rem] [--label-raised:4px] [--value-pt:1.25rem] [--value-pb:0.25rem]",
}

const slide = "transition-[translate] duration-200 ease-(--ease-standard) motion-reduce:transition-none"

function Field({
  label,
  variant = "filled",
  size = "default",
  icon,
  trailing,
  description,
  error,
  id,
  className,
  disabled,
  placeholder,
  ariaInvalid,
  multiline,
  grow,
  meta,
  children,
}: FieldShellProps) {
  const autoId = React.useId()
  const controlId = id ?? autoId
  const helpId = `${controlId}-help`
  const invalid = Boolean(error) || ariaInvalid === true || ariaInvalid === "true"
  const help = typeof error === "string" || React.isValidElement(error) ? error : description
  const filled = variant === "filled"
  const floating = Boolean(label)
  // single-line filled fields move icons down with the text when the label rises
  const iconShift = filled && !multiline && "translate-y-[calc(var(--float)*0.5rem)]"

  return (
    <div data-slot="field" className={cn("flex w-full flex-col gap-1.5", className)}>
      <div
        data-slot="field-container"
        data-variant={variant}
        data-invalid={invalid || undefined}
        data-disabled={disabled || undefined}
        className={cn(
          "group/field relative flex cursor-text gap-3 rounded-field px-4",
          SIZES[size],
          multiline
            ? // padding lives on the container, so scrolled text clips below the label
              cn("items-start", filled && floating ? "pt-(--value-pt) pb-[calc(var(--value-pb)+0.25rem)]" : "py-(--label-rest)")
            : cn(grow ? "min-h-(--field-h)" : "h-(--field-h)", "items-center"),
          "[--icon-size:20px] [--icon-opsz:20] [--label-x:1rem] has-[[data-slot=field-icon]]:[--label-x:3rem]",
          // the label rests while an input shows its placeholder, or a button control
          // (Select) marks itself data-placeholder and is closed
          floating
            ? "[--float:1] has-[:is(input,textarea):placeholder-shown:not(:focus)]:[--float:0] has-[>button[data-placeholder]:not([data-state=open])]:[--float:0]"
            : "[--float:0]",
          "transition-colors duration-200 ease-(--ease-standard)",
          filled && [
            "overflow-hidden bg-surface-container-high dark:bg-surface-container-highest",
            "hover:bg-surface-container-highest focus-within:bg-surface-container-highest",
            "dark:hover:bg-surface-bright dark:focus-within:bg-surface-bright",
            "data-invalid:bg-destructive-container/60 dark:data-invalid:bg-destructive-container/40",
          ],
          "data-disabled:pointer-events-none data-disabled:opacity-40",
          "has-[>button:disabled]:pointer-events-none has-[>button:disabled]:opacity-40"
        )}
      >
        {icon && (
          <Icon
            data-slot="field-icon"
            name={icon}
            className={cn("shrink-0 text-muted-foreground group-data-invalid/field:text-destructive", iconShift, slide)}
          />
        )}

        {children({
          id: controlId,
          disabled,
          // a placeholder is needed for :placeholder-shown, which floats the label
          placeholder: placeholder ?? (floating ? " " : undefined),
          "aria-invalid": invalid || undefined,
          "aria-describedby": help ? helpId : undefined,
          className: cn(
            "w-full min-w-0 flex-1 bg-transparent type-body-lg leading-6 text-foreground outline-none",
            "placeholder:text-muted-foreground disabled:cursor-not-allowed",
            floating && "placeholder:opacity-0 placeholder:transition-opacity focus:placeholder:opacity-100",
            multiline
              ? "resize-none"
              : cn("h-full", filled && floating && "pt-(--value-pt) pb-(--value-pb)")
          ),
        })}

        {label && (
          <label
            htmlFor={controlId}
            className={cn(
              "pointer-events-none absolute top-0 left-(--label-x) max-w-[calc(100%-var(--label-x)-1rem)] origin-top-left truncate",
              "type-body-lg leading-6 text-muted-foreground",
              "group-focus-within/field:text-primary group-data-invalid/field:text-destructive",
              "transition-[translate,scale,color] duration-200 ease-(--ease-standard) motion-reduce:transition-none",
              "scale-[calc(1-var(--float)*0.25)]",
              filled
                ? // resting: on the text line; raised: near the top
                  "translate-y-[calc(var(--label-rest)-var(--float)*(var(--label-rest)-var(--label-raised)))]"
                : // raised: centered on the top border, moved to the start of the field
                  "translate-x-[calc(var(--float)*(1rem-var(--label-x)))] translate-y-[calc(var(--label-rest)-var(--float)*(var(--label-rest)+9px))]"
            )}
          >
            {label}
          </label>
        )}

        {invalid && !multiline && <Icon name="error" fill className={cn("shrink-0 text-destructive", iconShift, slide)} />}
        {trailing && (
          <div data-slot="field-trailing" className={cn("-me-2 flex shrink-0 items-center", iconShift, slide)}>
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

      {(help || meta) && (
        <div className={cn("flex gap-4 px-4 type-body-sm text-muted-foreground", disabled && "opacity-40")}>
          {help && (
            <p id={helpId} data-slot="field-description" className={cn("flex-1", invalid && "text-destructive")}>
              {help}
            </p>
          )}
          {meta && <span className="ms-auto shrink-0 tabular-nums">{meta}</span>}
        </div>
      )}
    </div>
  )
}

export { Field }
