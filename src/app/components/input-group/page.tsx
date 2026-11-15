"use client"

import * as React from "react"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupKeys,
  InputGroupText,
  InputGroupTextarea,
} from "@/registry/velvet/ui/input-group"
import { Spinner } from "@/registry/velvet/ui/button"
import { Icon } from "@/registry/velvet/ui/icon"
import { IconButton } from "@/registry/velvet/ui/icon-button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/registry/velvet/ui/dropdown-menu"
import { Code, PageHeader, Preview, PropsTable, Section } from "@/components/docs/primitives"

function SearchExample() {
  const [q, setQ] = React.useState("")
  const [busy, setBusy] = React.useState(false)
  React.useEffect(() => {
    if (!q) return setBusy(false)
    setBusy(true)
    const t = setTimeout(() => setBusy(false), 900)
    return () => clearTimeout(t)
  }, [q])
  return (
    <InputGroup>
      <InputGroupAddon>
        <Icon name="search" />
      </InputGroupAddon>
      <InputGroupInput aria-label="Search the docs" placeholder="Search the docs" value={q} onChange={(e) => setQ(e.target.value)} />
      <InputGroupAddon align="inline-end">
        {busy ? (
          <>
            <Spinner />
            <span className="sr-only">Searching</span>
          </>
        ) : (
          !q && <InputGroupKeys>⌘K</InputGroupKeys>
        )}
      </InputGroupAddon>
    </InputGroup>
  )
}

function PasswordExample() {
  const [show, setShow] = React.useState(false)
  return (
    <InputGroup>
      <InputGroupAddon>
        <Icon name="lock" />
      </InputGroupAddon>
      <InputGroupInput
        aria-label="Password"
        type={show ? "text" : "password"}
        autoComplete="current-password"
        defaultValue="correct horse battery"
      />
      <InputGroupAddon align="inline-end">
        <InputGroupButton
          size="icon-xs"
          variant="ghost"
          aria-label={show ? "Hide password" : "Show password"}
          aria-pressed={show}
          onClick={() => setShow((s) => !s)}
        >
          <Icon name={show ? "visibility_off" : "visibility"} />
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  )
}

function CopyExample() {
  const [copied, setCopied] = React.useState(false)
  const link = "https://velvet.dev/invite/k3p9-x2m4"
  return (
    <InputGroup>
      <InputGroupAddon>
        <Icon name="link" />
      </InputGroupAddon>
      <InputGroupInput aria-label="Invite link" readOnly value={link} onFocus={(e) => e.currentTarget.select()} />
      <InputGroupAddon align="inline-end">
        <InputGroupButton
          size="sm"
          onClick={() => {
            navigator.clipboard?.writeText(link).catch(() => {})
            setCopied(true)
            setTimeout(() => setCopied(false), 1600)
          }}
        >
          <Icon name={copied ? "check" : "content_copy"} />
          {copied ? "Copied" : "Copy"}
        </InputGroupButton>
        <span role="status" className="sr-only">
          {copied ? "Link copied" : ""}
        </span>
      </InputGroupAddon>
    </InputGroup>
  )
}

const MODELS = ["Sonnet", "Opus", "Haiku"]

function ComposerExample() {
  const [text, setText] = React.useState("")
  const [model, setModel] = React.useState("Sonnet")
  const [sent, setSent] = React.useState<string | null>(null)
  const ready = text.trim().length > 0
  const send = () => {
    if (!ready) return
    setSent(text.trim())
    setText("")
  }
  return (
    <div className="flex flex-col gap-3">
      {sent && (
        <p role="status" className="type-body-md text-muted-foreground">
          Sent to {model}: {sent}
        </p>
      )}
      <InputGroup>
        <InputGroupTextarea
          aria-label="Message"
          placeholder="Ask anything"
          rows={2}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault()
              send()
            }
          }}
        />
        <InputGroupAddon align="block-end">
          <InputGroupButton size="icon-sm" variant="ghost" aria-label="Attach a file">
            <Icon name="add" />
          </InputGroupButton>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <InputGroupButton size="sm" variant="ghost" aria-label={`Model: ${model}`}>
                {model}
                <Icon name="keyboard_arrow_down" />
              </InputGroupButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuRadioGroup value={model} onValueChange={setModel}>
                {MODELS.map((m) => (
                  <DropdownMenuRadioItem key={m} value={m}>
                    {m}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="ms-auto flex items-center gap-2">
            {!ready && <InputGroupKeys>⌘↵</InputGroupKeys>}
            <IconButton
              label="Send"
              icon="arrow_upward"
              size="sm"
              variant={ready ? "filled" : "secondary"}
              shape={ready ? "square" : "pill"}
              disabled={!ready}
              onClick={send}
            />
          </div>
        </InputGroupAddon>
      </InputGroup>
    </div>
  )
}

export default function InputGroupPage() {
  return (
    <>
      <PageHeader eyebrow="Component 60" title="Input Group">
        One field with things inside it: a prefix, a unit, a keycap hint, a copy button, a send button. The whole group
        wears the same surface, focus line and error state as an Input, so it sits in a form beside one. Use Input with
        its icon and trailing slot first; reach for a group when the extras are text, buttons or a toolbar.
      </PageHeader>

      <Section title="Install">
        <Code>{`npx shadcn@latest add @velvet/input-group`}</Code>
      </Section>

      <Section
        title="Prefix and suffix"
        description="Text addons set the context of the value: a scheme, a currency, a domain. Clicking them puts the caret in the field."
      >
        <Preview className="flex-col items-stretch gap-4">
          <InputGroup>
            <InputGroupAddon>
              <InputGroupText>https://</InputGroupText>
            </InputGroupAddon>
            <InputGroupInput aria-label="Website" placeholder="velvet" />
            <InputGroupAddon align="inline-end">
              <InputGroupText>.com</InputGroupText>
            </InputGroupAddon>
          </InputGroup>
          <InputGroup>
            <InputGroupAddon>
              <InputGroupText>$</InputGroupText>
            </InputGroupAddon>
            <InputGroupInput aria-label="Price" inputMode="decimal" placeholder="0.00" defaultValue="249.00" />
            <InputGroupAddon align="inline-end">
              <InputGroupText>USD</InputGroupText>
            </InputGroupAddon>
          </InputGroup>
        </Preview>
      </Section>

      <Section
        title="Search with a keycap hint"
        description="The hint is drawn like the shortcuts in menus and hides once you type. A spinner takes its place while results load."
      >
        <Preview className="flex-col items-stretch">
          <SearchExample />
        </Preview>
      </Section>

      <Section
        title="Buttons"
        description="InputGroupButton is a tonal pill (secondary) by default; use variant ghost for quiet icon toggles. Sizes: xs, sm, icon-xs, icon-sm."
      >
        <Preview className="flex-col items-stretch gap-4">
          <PasswordExample />
          <CopyExample />
        </Preview>
      </Section>

      <Section
        title="Chat composer"
        description="Block addons put a toolbar above or below a textarea. The textarea grows with its text; the send button is a quiet pill until there is something to send, then it fills and springs into a rounded square. Cmd or Ctrl + Enter sends."
      >
        <Preview className="flex-col items-stretch">
          <ComposerExample />
        </Preview>
      </Section>

      <Section
        title="Block start"
        description="A block-start addon sits above the control: a label row, tags, or a reply-to quote."
      >
        <Preview className="flex-col items-stretch">
          <InputGroup>
            <InputGroupAddon align="block-start">
              <InputGroupText>
                <Icon name="reply" />
                Replying to Maya
              </InputGroupText>
            </InputGroupAddon>
            <InputGroupInput aria-label="Reply" placeholder="Write a reply" />
          </InputGroup>
        </Preview>
      </Section>

      <Section
        title="Invalid and disabled"
        description="Put aria-invalid on the control (or data-invalid on the group) and the whole group turns red with a thicker line. Disabled on the control dims it."
      >
        <Preview className="flex-col items-stretch gap-4">
          <div className="flex min-w-0 flex-col gap-1.5">
            <InputGroup>
              <InputGroupAddon>
                <Icon name="mail" />
              </InputGroupAddon>
              <InputGroupInput aria-label="Work email" aria-invalid aria-describedby="ig-err" defaultValue="maya@" />
              <InputGroupAddon align="inline-end">
                <InputGroupText>@velvet.dev</InputGroupText>
              </InputGroupAddon>
            </InputGroup>
            <p id="ig-err" className="px-3 type-body-sm text-destructive">
              Enter the part before the @ only.
            </p>
          </div>
          <InputGroup>
            <InputGroupAddon>
              <InputGroupText>https://</InputGroupText>
            </InputGroupAddon>
            <InputGroupInput aria-label="Locked website" disabled defaultValue="velvet" />
            <InputGroupAddon align="inline-end">
              <InputGroupText>.com</InputGroupText>
            </InputGroupAddon>
          </InputGroup>
        </Preview>
      </Section>

      <Section title="Usage">
        <Code>{`import {
  InputGroup, InputGroupAddon, InputGroupButton,
  InputGroupInput, InputGroupText, InputGroupTextarea,
} from "@/components/ui/input-group"

// shadcn's API, unchanged
<InputGroup>
  <InputGroupAddon><InputGroupText>https://</InputGroupText></InputGroupAddon>
  <InputGroupInput aria-label="Website" placeholder="velvet" />
  <InputGroupAddon align="inline-end"><InputGroupText>.com</InputGroupText></InputGroupAddon>
</InputGroup>

// Velvet adds keycaps and tonal pill buttons
<InputGroup>
  <InputGroupInput aria-label="Search" placeholder="Search" />
  <InputGroupAddon align="inline-end"><InputGroupKeys>⌘K</InputGroupKeys></InputGroupAddon>
</InputGroup>`}</Code>
      </Section>

      <Section title="Props">
        <PropsTable
          note="Part"
          rows={[
            ["InputGroup", "div props", "", "The field. Height 40px; grows when it has a block addon or a textarea"],
            ["InputGroupAddon align", '"inline-start" | "inline-end" | "block-start" | "block-end"', '"inline-start"', "Where the addon draws, whatever its place in the JSX. Click focuses the control"],
            ["InputGroupButton variant", "Button variant", '"secondary"', "Tonal pill; ghost for quiet toggles"],
            ["InputGroupButton size", '"xs" | "sm" | "icon-xs" | "icon-sm"', '"xs"', "Icon-only sizes need an aria-label"],
            ["InputGroupText", "span props", "", "Prefix or suffix text (https://, .com, USD). Icons inside take the text color"],
            ["InputGroupKeys", "span props", "", 'Keycap hint: "⌘K", "Ctrl+Enter"'],
            ["InputGroupInput", "input props", "", "Bare input; give it an aria-label (no floating label here)"],
            ["InputGroupTextarea", "textarea props", "rows 1", "Grows with its text up to 12rem, then scrolls"],
          ]}
        />
      </Section>
    </>
  )
}
