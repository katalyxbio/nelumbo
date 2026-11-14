"use client"

import * as React from "react"
import { Snackbars, snackbar, toast } from "@/registry/velvet/ui/snackbar"
import { Button } from "@/registry/velvet/ui/button"
import { Icon } from "@/registry/velvet/ui/icon"
import { Checkbox } from "@/registry/velvet/ui/checkbox"
import { Code, PageHeader, Preview, PropsTable, Section } from "@/components/docs/primitives"

const MESSAGES = ["Weekly report", "Invoice #2024-118", "Design review notes"]

const wait = (ms: number, fail = false) => new Promise<number>((res, rej) => setTimeout(() => (fail ? rej(new Error("Network error")) : res(24)), ms))

export default function SnackbarPage() {
  const [inbox, setInbox] = React.useState(MESSAGES)
  const [failNext, setFailNext] = React.useState(false)

  const archive = () => {
    const [first, ...rest] = inbox
    if (!first) return
    setInbox(rest)
    snackbar(`“${first}” archived`, {
      action: { label: "Undo", altText: `Undo archiving ${first}`, onClick: () => setInbox((m) => [first, ...m]) },
    })
  }

  return (
    <>
      <Snackbars />

      <PageHeader eyebrow="Component · 22" title="Snackbar">
        A brief message about something the app just did, with at most one action. It rises in from the bottom on a
        spring, waits while you hover it, and can be swiped away.
      </PageHeader>

      <Section title="Install">
        <Code>{`npx shadcn@latest add @velvet/snackbar`}</Code>
      </Section>

      <Section title="Message" description="Short and in the past tense: what just happened. Gone after four seconds.">
        <Preview>
          <Button variant="secondary" onClick={() => snackbar("Photo saved to your library")}>
            Save photo
          </Button>
          <Button variant="secondary" onClick={() => snackbar("Link copied", { icon: "link" })}>
            <Icon name="link" />
            Copy link
          </Button>
        </Preview>
      </Section>

      <Section
        title="With an action"
        description="One action, usually Undo. It stays seven seconds so there's time to reach it, and F8 jumps to it from the keyboard."
      >
        <Preview className="flex-col items-start gap-4">
          <div className="flex w-full max-w-sm flex-col overflow-hidden rounded-2xl bg-card shadow-e1">
            {inbox.length ? (
              inbox.map((m, i) => (
                <div key={m} className={"flex items-center gap-3 px-4 py-3 type-body-md" + (i ? " border-t border-border" : "")}>
                  <Icon name="mail" className="text-muted-foreground" />
                  {m}
                </div>
              ))
            ) : (
              <p className="px-4 py-3 type-body-md text-muted-foreground">All caught up</p>
            )}
          </div>
          <Button onClick={archive} disabled={!inbox.length}>
            <Icon name="archive" />
            Archive first
          </Button>
        </Preview>
      </Section>

      <Section title="Longer messages" description="Two lines at most. When the text is long, the action moves below it.">
        <Preview>
          <Button
            variant="secondary"
            onClick={() =>
              snackbar("Your changes were saved, but 2 collaborators are still editing an older version of this page.", {
                action: { label: "Notify them", onClick: () => snackbar("Collaborators notified") },
              })
            }
          >
            Save page
          </Button>
        </Preview>
      </Section>

      <Section title="Persistent" description="For something that needs reading, keep it until it's dismissed and add a close button. Errors can interrupt screen readers with urgent.">
        <Preview>
          <Button
            variant="outline"
            onClick={() =>
              snackbar("Couldn't upload 3 files. Check your connection.", {
                icon: "cloud_off",
                closable: true,
                duration: Infinity,
                urgent: true,
                action: { label: "Retry", onClick: () => snackbar("Uploading 3 files…") },
              })
            }
          >
            Go offline
          </Button>
          <Button variant="ghost" onClick={() => snackbar.dismiss()}>
            Dismiss all
          </Button>
        </Preview>
      </Section>

      <Section title="Queue" description="One at a time, as in Material: later messages wait their turn instead of piling up.">
        <Preview>
          <Button
            variant="secondary"
            onClick={() => {
              snackbar("Exporting “Q4 plan”…", { duration: 2500 })
              snackbar("Export finished", { duration: 2500 })
              snackbar("Shared with Design team", { action: { label: "View", onClick: () => {} } })
            }}
          >
            Send three
          </Button>
        </Preview>
      </Section>

      <Section
        title="Sonner-style API"
        description="toast and Toaster are the same functions under sonner's names, with its types, descriptions and promise toasts. Types add an icon; they stay neutral in color, so the message carries the meaning."
      >
        <Preview>
          <Button variant="secondary" onClick={() => toast.success("Changes saved")}>
            Success
          </Button>
          <Button variant="secondary" onClick={() => toast.error("Couldn't save changes", { description: "You're offline. We'll retry when you reconnect." })}>
            Error
          </Button>
          <Button variant="secondary" onClick={() => toast.warning("Storage almost full", { action: { label: "Manage", onClick: () => {} } })}>
            Warning
          </Button>
          <Button variant="secondary" onClick={() => toast.info("Event created", { description: "Friday 14 November, 10:00" })}>
            Info with description
          </Button>
        </Preview>
        <Preview>
          <Button
            onClick={() =>
              toast.promise(wait(1800, failNext), {
                loading: "Uploading 24 photos…",
                success: (n) => `${n} photos uploaded`,
                error: (e) => `Upload failed: ${e instanceof Error ? e.message : "unknown error"}`,
              })
            }
          >
            <Icon name="upload" />
            Upload (promise)
          </Button>
          <label className="flex items-center gap-2 type-body-md text-muted-foreground">
            <Checkbox checked={failNext} onCheckedChange={(v) => setFailNext(v === true)} />
            Make it fail
          </label>
        </Preview>
        <Code>{`// Coming from shadcn's Sonner? Change the imports:
- import { toast } from "sonner"
- import { Toaster } from "@/components/ui/sonner"
+ import { toast, Toaster } from "@/components/ui/snackbar"

toast.success("Changes saved")
toast.error("Couldn't save", { description: "You're offline." })
toast.promise(upload(), {
  loading: "Uploading…",
  success: (n) => \`\${n} photos uploaded\`,
  error: "Upload failed",
})

// Differences: one at a time instead of a stack, bottom positions only,
// neutral colors (no richColors), a single action (no cancel), no toast.custom.`}</Code>
      </Section>

      <Section title="Usage" description="Mount the host once, near the root of your app. Above a navigation bar, pass offset so snackbars clear it.">
        <Code>{`// app/layout.tsx
import { Snackbars } from "@/components/ui/snackbar"

<body>
  {children}
  <Snackbars />               {/* or <Snackbars offset={80} /> above a navigation bar */}
</body>

// anywhere
import { snackbar } from "@/components/ui/snackbar"

snackbar("Message archived", {
  action: { label: "Undo", onClick: restore },
})`}</Code>
      </Section>

      <Section title="Options">
        <PropsTable
          rows={[
            ["snackbar / toast", "(message, options?) => id", "", ".success .error .warning .info .loading .message .promise .dismiss"],
            ["description", "ReactNode", "", "Second line; the message reads as a title"],
            ["action", "{ label, onClick, altText? }", "", "One action; altText describes it for screen readers"],
            ["icon", "IconName | ReactNode", "", "Leading icon; types set one"],
            ["id", "number | string", "", "Reuse to update a snackbar in place"],
            ["closable / closeButton", "boolean", "false", "Close button"],
            ["duration", "number (ms)", "4000, 7000 with an action", "Infinity keeps it; loading stays until updated"],
            ["urgent", "boolean", "false (true for errors)", "Announce assertively"],
            ["onDismiss / onAutoClose", "(id) => void", "", "Closed by the person / by the timer"],
            ["<Snackbars position>", '"bottom-center" | "bottom-start" | "bottom-end"', '"bottom-center"', "Also bottom-left / bottom-right; <Toaster> is the same"],
            ["<Snackbars offset>", "number (px)", "0", "Extra bottom space"],
          ]}
          note="Notes"
        />
      </Section>
    </>
  )
}
