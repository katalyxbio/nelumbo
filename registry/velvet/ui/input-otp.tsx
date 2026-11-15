"use client"

import * as React from "react"
import { OTPInput, OTPInputContext } from "input-otp"

import { cn } from "@/lib/utils"

export {
  REGEXP_ONLY_CHARS,
  REGEXP_ONLY_DIGITS,
  REGEXP_ONLY_DIGITS_AND_CHARS,
} from "input-otp"

/**
 * Velvet InputOTP: a one-time code made of slots, a drop-in for shadcn's InputOTP.
 *
 *   <InputOTP maxLength={6} aria-label="Verification code" autoComplete="one-time-code">
 *     <InputOTPGroup>
 *       <InputOTPSlot index={0} />
 *       <InputOTPSlot index={1} />
 *       <InputOTPSlot index={2} />
 *     </InputOTPGroup>
 *     <InputOTPSeparator />
 *     <InputOTPGroup>
 *       <InputOTPSlot index={3} />
 *       <InputOTPSlot index={4} />
 *       <InputOTPSlot index={5} />
 *     </InputOTPGroup>
 *   </InputOTP>
 *
 *   <InputOTP maxLength={6} pattern={REGEXP_ONLY_DIGITS_AND_CHARS} aria-invalid>...</InputOTP>
 *   <InputOTPGroup connected>...</InputOTPGroup>   // slots touch, one shape
 *
 * - Each slot is a filled box with the Field radius. The active slot takes the
 *   focused field's 2px primary outline and shows a blinking caret (steady when
 *   the user prefers reduced motion).
 * - `aria-invalid` on InputOTP draws every slot in the destructive outline.
 * - Digits use title-lg with tabular figures, so the code never shifts width.
 * - InputOTPSeparator is a short dash between groups.
 * - The hidden input is the real control: give it `aria-label` (or a
 *   `<label htmlFor>`), and `autoComplete="one-time-code"` for autofill.
 *
 * Built on input-otp 1.x. Props and exports match shadcn's InputOTP.
 */

const OTPFieldContext = React.createContext({ invalid: false })

const caretKeyframes = "@keyframes velvet-otp-caret{0%,50%{opacity:1}50.01%,100%{opacity:0}}"

function InputOTP({
  className,
  containerClassName,
  ...props
}: React.ComponentProps<typeof OTPInput>) {
  const ariaInvalid = props["aria-invalid"]
  const invalid = ariaInvalid === true || ariaInvalid === "true"

  return (
    <OTPFieldContext.Provider value={{ invalid }}>
      <style>{caretKeyframes}</style>
      <OTPInput
        data-slot="input-otp"
        containerClassName={cn(
          "relative flex items-center gap-2 has-disabled:cursor-not-allowed has-disabled:opacity-40",
          containerClassName
        )}
        className={cn("disabled:cursor-not-allowed", className)}
        {...props}
      />
    </OTPFieldContext.Provider>
  )
}

function InputOTPGroup({
  className,
  connected,
  ...props
}: React.ComponentProps<"div"> & {
  /** Slots touch and share one surface, with only the outer corners rounded. */
  connected?: boolean
}) {
  return (
    <div
      data-slot="input-otp-group"
      data-connected={connected || undefined}
      className={cn(
        "group/otp-group flex items-center",
        connected ? "gap-px" : "gap-1.5 sm:gap-2",
        className
      )}
      {...props}
    />
  )
}

function InputOTPSlot({
  index,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  /** Position of this slot in the code, starting at 0. */
  index: number
}) {
  const otp = React.useContext(OTPInputContext)
  const { invalid } = React.useContext(OTPFieldContext)
  const slot = otp?.slots[index]
  const char = slot?.char ?? null
  const isActive = Boolean(slot?.isActive)
  const hasFakeCaret = Boolean(slot?.hasFakeCaret)

  return (
    <div
      data-slot="input-otp-slot"
      data-active={isActive || undefined}
      data-invalid={invalid || undefined}
      className={cn(
        "relative flex h-14 w-10 shrink-0 items-center justify-center rounded-field sm:w-11",
        "bg-surface-container-high type-title-lg tabular-nums text-foreground",
        "transition-[background-color,box-shadow] duration-200 ease-(--ease-standard) motion-reduce:transition-none",
        "hover:bg-surface-container-highest dark:hover:bg-surface-bright",
        "data-active:bg-surface-container-highest data-active:ring-2 data-active:ring-inset data-active:ring-primary",
        "dark:data-active:bg-surface-bright",
        "data-invalid:bg-destructive-container/60 dark:data-invalid:bg-destructive-container/40",
        "data-invalid:data-active:ring-destructive",
        "data-invalid:ring-2 data-invalid:ring-inset data-invalid:ring-destructive",
        // connected groups: one shape, only the outer corners rounded
        "group-data-connected/otp-group:rounded-none",
        "group-data-connected/otp-group:first:rounded-s-field group-data-connected/otp-group:last:rounded-e-field",
        className
      )}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-6 w-0.5 rounded-full bg-foreground [animation:velvet-otp-caret_1.1s_steps(1)_infinite] motion-reduce:[animation:none]" />
        </div>
      )}
    </div>
  )
}

function InputOTPSeparator({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-otp-separator"
      role="separator"
      className={cn("h-0.5 w-3 shrink-0 rounded-full bg-outline", className)}
      {...props}
    />
  )
}

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator }
