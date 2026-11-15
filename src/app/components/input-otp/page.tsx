"use client"

import * as React from "react"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
  REGEXP_ONLY_DIGITS,
  REGEXP_ONLY_DIGITS_AND_CHARS,
} from "@/registry/nelumbo/ui/input-otp"
import { Button } from "@/registry/nelumbo/ui/button"
import { Code, PageHeader, Preview, PropsTable, Section } from "@/components/docs/primitives"

const CORRECT = "123456"

export default function InputOtpPage() {
  const [value, setValue] = React.useState("")
  const [pin, setPin] = React.useState("")
  const [alnum, setAlnum] = React.useState("")
  const [code, setCode] = React.useState("")
  const [submitted, setSubmitted] = React.useState<null | "ok" | "bad">(null)

  const wrong = submitted === "bad"

  return (
    <>
      <PageHeader eyebrow="Component 40" title="Input OTP">
        A one-time code, typed one character per slot. Typing moves to the next slot, Backspace goes back, and pasting
        a whole code fills every slot. The active slot shows the focus outline and a caret.
      </PageHeader>

      <Section title="Install">
        <Code>{`npx shadcn@latest add @nelumbo/input-otp`}</Code>
      </Section>

      <Section
        title="Six digits"
        description="Two groups of three with a dash between them. Click the first slot or the label, then type or paste the code. The value is controlled: the line below shows it as it changes."
      >
        <Preview className="flex-col items-stretch gap-6">
          <div className="flex flex-col gap-3">
            <label htmlFor="otp-six" className="type-label-lg text-foreground">
              Verification code
            </label>
            <InputOTP
              id="otp-six"
              maxLength={6}
              pattern={REGEXP_ONLY_DIGITS}
              inputMode="numeric"
              autoComplete="one-time-code"
              value={value}
              onChange={setValue}
              aria-describedby="otp-six-help"
              className="w-full"
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup>
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
            <p id="otp-six-help" className="type-body-sm text-muted-foreground">
              We sent a 6-digit code to your phone.
            </p>
          </div>
          <p className="type-body-md text-muted-foreground" aria-live="polite">
            Value: <span className="font-mono text-foreground tabular-nums">{value || "empty"}</span>
            {" "}({value.length}/6)
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setValue("")}>
              Clear
            </Button>
            <Button variant="outline" onClick={() => setValue(CORRECT)}>
              Fill 123456
            </Button>
          </div>
        </Preview>
      </Section>

      <Section
        title="Verdicts"
        description="The code checks itself when the last character lands. status=&quot;success&quot; washes the slots green in a wave; status=&quot;error&quot; (or aria-invalid) shakes the code and turns it red, with the error text tied to the input by aria-describedby. Try 123456, then anything else. This one is a connected group: the slots share one bar."
      >
        <Preview className="flex-col items-stretch gap-6">
          <div className="flex flex-col gap-3">
            <label htmlFor="otp-connected" className="type-label-lg text-foreground">
              Sign-in code
            </label>
            <form
              className="flex flex-col gap-3"
              onSubmit={(e) => {
                e.preventDefault()
                setSubmitted(code === CORRECT ? "ok" : "bad")
              }}
            >
              <InputOTP
                id="otp-connected"
                maxLength={6}
                pattern={REGEXP_ONLY_DIGITS}
                inputMode="numeric"
                autoComplete="one-time-code"
                value={code}
                onChange={(v) => {
                  setCode(v)
                  setSubmitted(null)
                }}
                onComplete={(v: string) => setSubmitted(v === CORRECT ? "ok" : "bad")}
                status={submitted === "ok" ? "success" : undefined}
                aria-invalid={wrong || undefined}
                aria-describedby={wrong ? "otp-connected-error" : undefined}
                className="w-full"
              >
                <InputOTPGroup connected>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
              {wrong && (
                <p id="otp-connected-error" className="type-body-sm text-destructive">
                  That code is not right. Try 123456, or ask for a new one.
                </p>
              )}
              {submitted === "ok" && <p className="type-body-sm text-success">Signed in.</p>}
              <div className="flex gap-2">
                <Button type="submit" disabled={code.length < 6}>
                  Verify
                </Button>
              </div>
            </form>
          </div>
        </Preview>
      </Section>

      <Section
        title="Four-digit PIN"
        description="Any length works: set maxLength and give each slot an index. Two groups of two keep a PIN readable."
      >
        <Preview className="flex-col items-stretch gap-3">
          <label htmlFor="otp-pin" className="type-label-lg text-foreground">
            Card PIN
          </label>
          <InputOTP
            id="otp-pin"
            maxLength={4}
            pattern={REGEXP_ONLY_DIGITS}
            inputMode="numeric"
            autoComplete="off"
            value={pin}
            onChange={setPin}
            type="password"
            className="w-full"
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
            </InputOTPGroup>
          </InputOTP>
        </Preview>
      </Section>

      <Section
        title="Letters and digits"
        description="REGEXP_ONLY_DIGITS_AND_CHARS accepts letters and digits, useful for recovery codes. Input is kept to that pattern; pasted text that does not match is dropped."
      >
        <Preview className="flex-col items-stretch gap-3">
          <label htmlFor="otp-alnum" className="type-label-lg text-foreground">
            Recovery code
          </label>
          <InputOTP
            id="otp-alnum"
            maxLength={6}
            pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
            autoCapitalize="characters"
            autoComplete="off"
            value={alnum}
            onChange={(v) => setAlnum(v.toUpperCase())}
            className="w-full"
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </Preview>
      </Section>

      <Section title="Disabled" description="The whole code is inert and dimmed. Focus skips it.">
        <Preview className="flex-col items-stretch gap-3">
          <label htmlFor="otp-disabled" className="type-label-lg text-foreground">
            Code (sent in 0:42)
          </label>
          <InputOTP id="otp-disabled" maxLength={6} pattern={REGEXP_ONLY_DIGITS} disabled defaultValue="48" className="w-full">
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </Preview>
      </Section>

      <Section title="Props">
        <PropsTable
          rows={[
            ["maxLength", "number", "", "Number of slots. Required"],
            ["value / onChange", "string / (value) => void", "", "Controlled; onChange gets the whole code"],
            ["pattern", "RegExp string", "", "Use REGEXP_ONLY_DIGITS, REGEXP_ONLY_CHARS or REGEXP_ONLY_DIGITS_AND_CHARS"],
            ["onComplete", "() => void", "", "Called once every slot is filled"],
            ["status", '"success" | "error"', "", "Verdict on a complete code: a green wave, or a shake in red"],
            ["aria-invalid", "boolean", "false", "Same as status=\"error\"; pair with aria-describedby"],
            ["disabled", "boolean", "false", "Dims the code and removes it from the tab order"],
            ["autoComplete", "string", "", 'Use "one-time-code" so phones offer the SMS code'],
            ["aria-label / label for", "string", "", "Name the hidden input. A visible label with htmlFor works too"],
            ["InputOTPGroup connected", "boolean", "false", "Slots sit on one bar with small inner corners"],
            ["InputOTPSlot index", "number", "", "Position in the code, starting at 0"],
            ["InputOTPSeparator", "", "", "A short dash between groups; not announced as content"],
          ]}
        />
      </Section>
    </>
  )
}
