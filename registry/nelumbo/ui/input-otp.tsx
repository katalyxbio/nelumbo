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
 * Nelumbo InputOTP: a one-time code made of slots, a drop-in for shadcn's InputOTP.
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
 * - Empty slots are tonal tiles with a short bar where the character lands.
 *   Each typed character pops in with a spring and turns its slot secondary.
 *   The slot being typed in grows, rounds its corners and takes the focus
 *   outline, so the cursor visibly travels along the code.
 * - `status="success"` washes the slots green in a wave from left to right;
 *   `status="error"` (or `aria-invalid`) shakes the code and turns it red.
 *   Motion is skipped when the user prefers reduced motion.
 * - Digits use title-lg with tabular figures, so the code never shifts width.
 * - InputOTPSeparator is a short dash between groups.
 * - The hidden input is the real control: give it `aria-label` (or a
 *   `<label htmlFor>`), and `autoComplete="one-time-code"` for autofill.
 *
 * Built on input-otp 1.x. Props and exports match shadcn's InputOTP.
 */

type OTPStatus = "success" | "error"

const OTPFieldContext = React.createContext<{ invalid: boolean; status?: OTPStatus; filled: boolean }>({ invalid: false, filled: false })

const keyframes = `
@keyframes nelumbo-otp-caret{0%,40%{opacity:1}55%,85%{opacity:0}100%{opacity:1}}
@keyframes nelumbo-otp-pop{0%{opacity:0;scale:.35;translate:0 6px}100%{opacity:1;scale:1;translate:0 0}}
@keyframes nelumbo-otp-wave{0%,100%{translate:0 0}40%{translate:0 -6px}}
@keyframes nelumbo-otp-shake{0%,100%{translate:0}20%{translate:-6px}40%{translate:5px}60%{translate:-3px}80%{translate:2px}}
@media (prefers-reduced-motion:reduce){[data-slot=input-otp-slot],[data-slot=input-otp-slot] *,[data-slot=input-otp]{animation:none!important}}
`

type InputOTPProps = React.ComponentProps<typeof OTPInput> & {
  /**
   * The verdict on a complete code. "success" washes the slots green in a
   * wave, "error" shakes them and turns them red. `aria-invalid` also
   * counts as an error.
   */
  status?: OTPStatus
}

function InputOTP({ className, containerClassName, status, ...props }: InputOTPProps) {
  const ariaInvalid = props["aria-invalid"]
  const invalid = status === "error" || ariaInvalid === true || ariaInvalid === "true"
  const st: OTPStatus | undefined = invalid ? "error" : status
  // replay the shake each time an error is reported
  const [shakes, setShakes] = React.useState(0)
  React.useEffect(() => {
    if (st === "error") setShakes((n) => n + 1)
  }, [st])
  const value = typeof props.value === "string" ? props.value : undefined

  return (
    <OTPFieldContext.Provider value={{ invalid, status: st, filled: value !== undefined && value.length === props.maxLength }}>
      <style href="nelumbo-input-otp" precedence="default">{keyframes}</style>
      <OTPInput
        data-slot="input-otp"
        data-status={st}
        containerClassName={cn(
          "relative flex items-center gap-2 has-disabled:cursor-not-allowed has-disabled:opacity-40",
          st === "error" && shakes > 0 && (shakes % 2 ? "animate-[nelumbo-otp-shake_420ms_var(--ease-standard)]" : "animate-[nelumbo-otp-shake_421ms_var(--ease-standard)]"),
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
  /** Slots sit on one tonal bar, with only the outer corners rounded. */
  connected?: boolean
}) {
  return (
    <div
      data-slot="input-otp-group"
      data-connected={connected || undefined}
      className={cn(
        "group/otp-group flex items-center",
        connected ? "gap-0.5" : "gap-1.5 sm:gap-2",
        className
      )}
      {...props}
    />
  )
}

function InputOTPSlot({
  index,
  className,
  style,
  ...props
}: React.ComponentProps<"div"> & {
  /** Position of this slot in the code, starting at 0. */
  index: number
}) {
  const otp = React.useContext(OTPInputContext)
  const { status } = React.useContext(OTPFieldContext)
  const slot = otp?.slots[index]
  const char = slot?.char ?? null
  const isActive = Boolean(slot?.isActive)
  const hasFakeCaret = Boolean(slot?.hasFakeCaret)

  return (
    <div
      data-slot="input-otp-slot"
      data-active={isActive || undefined}
      data-filled={char !== null || undefined}
      data-status={status}
      // one visual state at a time: a verdict, then the cursor, then a typed character
      data-look={status ?? (isActive ? "active" : char !== null ? "filled" : "empty")}
      style={{ ["--i" as string]: index, ...style }}
      className={cn(
        "relative flex h-14 w-11 shrink-0 items-center justify-center overflow-hidden sm:w-12",
        "rounded-field bg-surface-container-high type-title-lg tabular-nums text-foreground dark:bg-surface-container-highest",
        // shape and color settle with a spring; status colors sweep across the code
        "transition-[background-color,color,border-radius,scale,box-shadow] duration-[200ms,200ms,420ms,520ms,200ms]",
        "ease-[var(--ease-standard),var(--ease-standard),var(--ease-spring),var(--ease-spring-bouncy),var(--ease-standard)]",
        "motion-reduce:transition-none",
        // a typed character turns the slot tonal
        "data-[look=filled]:bg-secondary data-[look=filled]:text-secondary-foreground",
        // the slot being typed in grows, rounds, and takes the focus outline
        "data-[look=active]:z-10 data-[look=active]:scale-[1.06] data-[look=active]:rounded-[calc(var(--radius-field)*2)]",
        "data-[look=active]:bg-surface-container-highest data-[look=active]:shadow-[inset_0_0_0_2px_var(--primary)] dark:data-[look=active]:bg-surface-bright",
        "data-[look=success]:bg-success-container data-[look=success]:text-success-container-foreground",
        "data-[look=success]:[transition-delay:calc(var(--i)*45ms)] data-[look=success]:animate-[nelumbo-otp-wave_480ms_var(--ease-emphasized)_both]",
        "data-[look=success]:[animation-delay:calc(var(--i)*45ms)]",
        "data-[look=error]:bg-destructive-container data-[look=error]:text-destructive-container-foreground",
        "data-[look=error]:shadow-[inset_0_0_0_2px_var(--destructive)]",
        // connected: one bar, inner corners small
        "group-data-connected/otp-group:rounded-[calc(var(--radius-field)/3)]",
        "group-data-connected/otp-group:first:rounded-s-field group-data-connected/otp-group:last:rounded-e-field",
        "group-data-connected/otp-group:data-[look=active]:rounded-[calc(var(--radius-field)*2)]",
        className
      )}
      {...props}
    >
      {char !== null ? (
        <span key={char} className="animate-[nelumbo-otp-pop_380ms_var(--ease-spring-bouncy)_both]">
          {char}
        </span>
      ) : (
        // an empty slot shows a short bar where the character will land
        !hasFakeCaret && <span aria-hidden className="absolute bottom-3 h-0.5 w-3 rounded-full bg-outline-variant" />
      )}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-6 w-0.5 rounded-full bg-primary [animation:nelumbo-otp-caret_1s_var(--ease-standard)_infinite]" />
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
