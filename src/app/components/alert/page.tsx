"use client"

import * as React from "react"
import { Alert, AlertAction, AlertDescription, AlertTitle, type AlertVariant } from "@/registry/nelumbo/ui/alert"
import { Button } from "@/registry/nelumbo/ui/button"
import { Card } from "@/registry/nelumbo/ui/card"
import { Code, PageHeader, Preview, PropsTable, Section } from "@/components/docs/primitives"

const VARIANTS: { variant: AlertVariant; title: string; text: string }[] = [
  { variant: "default", title: "Heads up", text: "You can change this later in Settings." },
  { variant: "info", title: "Scheduled maintenance", text: "The dashboard will be read-only on Sunday from 02:00 to 03:00." },
  { variant: "success", title: "Backup finished", text: "All 1,240 files are safe in the cloud." },
  { variant: "warning", title: "Storage almost full", text: "You've used 92% of your space. Free some up to keep syncing." },
  { variant: "destructive", title: "Payment failed", text: "Your card was declined. Try another card to keep your plan." },
  { variant: "brand", title: "What's new", text: "Spring palettes and the new date picker are here." },
]

export default function AlertPage() {
  const [items, setItems] = React.useState(["a", "b"])
  const [round, setRound] = React.useState(0)

  return (
    <>
      <PageHeader eyebrow="Component 34" title="Alert">
        A message that stays in the page until it stops being true: a warning about a form, a notice about the
        account, a note above a table. For something brief that appears after an action, use Snackbar.
      </PageHeader>

      <Section title="Install">
        <Code>{`npx shadcn@latest add @nelumbo/alert`}</Code>
      </Section>

      <Section
        title="Variants"
        description="Neutral by default; tonal colors when the message carries meaning. Each variant picks its own icon. Destructive is announced at once (role alert); the others are announced politely (role status)."
      >
        <Preview className="flex-col items-stretch gap-3">
          {VARIANTS.map(({ variant, title, text }) => (
            <Alert key={variant} variant={variant}>
              <AlertTitle>{title}</AlertTitle>
              <AlertDescription>{text}</AlertDescription>
            </Alert>
          ))}
        </Preview>
      </Section>

      <Section title="Title only, and icons" description='A title alone makes a one-line notice. icon replaces the symbol, and icon={false} removes it.'>
        <Preview className="flex-col items-stretch gap-3">
          <Alert variant="info">
            <AlertTitle>Your trial ends in 3 days</AlertTitle>
          </Alert>
          <Alert variant="success" icon="cloud_done">
            <AlertTitle>Synced just now</AlertTitle>
          </Alert>
          <Alert variant="warning" icon={false}>
            <AlertTitle>No icon, when the color is enough</AlertTitle>
          </Alert>
          <Alert variant="default" icon="lightbulb">
            <AlertTitle>Tip</AlertTitle>
            <AlertDescription>Press / anywhere to start searching.</AlertDescription>
          </Alert>
        </Preview>
      </Section>

      <Section
        title="With actions"
        description="One or two buttons, with the action prop or an AlertAction child. Ghost and outline buttons take the alert's text color."
      >
        <Preview className="flex-col items-stretch gap-3">
          <Alert variant="warning">
            <AlertTitle>Unsaved changes</AlertTitle>
            <AlertDescription>You have edits in 3 files that haven&apos;t been published.</AlertDescription>
            <AlertAction>
              <Button size="sm">Publish</Button>
              <Button size="sm" variant="ghost">Review</Button>
            </AlertAction>
          </Alert>
          <Alert variant="destructive" action={<Button size="sm" variant="outline">Update card</Button>}>
            <AlertTitle>Payment failed</AlertTitle>
            <AlertDescription>Your card ending 4242 was declined.</AlertDescription>
          </Alert>
        </Preview>
      </Section>

      <Section
        title="Dismissible"
        description="onDismiss adds a close button. The alert collapses and fades out (just a fade with reduced motion), then the callback runs."
      >
        <Preview className="flex-col items-stretch gap-3">
          {items.includes("a") && (
            <Alert key={`a${round}`} variant="info" onDismiss={() => setItems((l) => l.filter((x) => x !== "a"))}>
              <AlertTitle>New comments</AlertTitle>
              <AlertDescription>Maya left 2 comments on your draft.</AlertDescription>
            </Alert>
          )}
          {items.includes("b") && (
            <Alert key={`b${round}`} variant="success" onDismiss={() => setItems((l) => l.filter((x) => x !== "b"))}>
              <AlertTitle>Invite sent</AlertTitle>
            </Alert>
          )}
          {items.length === 0 && (
            <Button
              variant="secondary"
              className="self-start"
              onClick={() => {
                setItems(["a", "b"])
                setRound((r) => r + 1)
              }}
            >
              Bring them back
            </Button>
          )}
        </Preview>
      </Section>

      <Section
        title="Banner"
        description={'layout="banner" is full width with square corners, for the top of a page or a card. Actions sit on the right on wide screens and drop below the text on narrow ones.'}
      >
        <Preview className="flex-col items-stretch gap-6">
          <Card variant="outlined" className="gap-0 py-0">
            <Alert
              layout="banner"
              variant="warning"
              onDismiss={() => {}}
              action={
                <>
                  <Button size="sm">Update now</Button>
                  <Button size="sm" variant="ghost">Later</Button>
                </>
              }
            >
              <AlertTitle>A new version is available</AlertTitle>
              <AlertDescription>Update to get the latest fixes. It takes about a minute.</AlertDescription>
            </Alert>
            <div className="p-6 type-body-md text-muted-foreground">Page content sits below the banner.</div>
          </Card>
          <Alert layout="banner" variant="brand" icon="campaign" className="rounded-2xl">
            <AlertTitle>Spring sale: 20% off until Sunday</AlertTitle>
          </Alert>
        </Preview>
      </Section>

      <Section title="Usage">
        <Code>{`import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/ui/alert"

// shadcn's API
<Alert variant="destructive">
  <AlertTitle>Payment failed</AlertTitle>
  <AlertDescription>Your card was declined.</AlertDescription>
</Alert>

// Nelumbo: tonal variants, actions, dismiss, banner
<Alert variant="warning" onDismiss={() => setSeen(true)}>
  <AlertTitle>Storage almost full</AlertTitle>
  <AlertDescription>You've used 92% of your space.</AlertDescription>
  <AlertAction>
    <Button size="sm">Upgrade</Button>
  </AlertAction>
</Alert>

<Alert layout="banner" variant="info" action={<Button size="sm">Details</Button>}>
  <AlertTitle>Scheduled maintenance on Sunday</AlertTitle>
</Alert>`}</Code>
      </Section>

      <Section title="Props">
        <PropsTable
          rows={[
            ["variant", '"default" | "info" | "success" | "warning" | "destructive" | "brand"', '"default"', "Neutral, tinted with a status color, or brand (a solid fill, distinct from info for any brand accent)"],
            ["layout", '"inline" | "banner"', '"inline"', "Banner: full width, square, actions on the right from sm up"],
            ["icon", "IconName | ReactNode | false", "per variant", "info, check_circle, warning, error, campaign; default has none"],
            ["action", "ReactNode", "", "One or two buttons. <AlertAction> children work the same"],
            ["onDismiss", "() => void", "", "Adds a close button; runs after the alert animates out"],
            ["dismissLabel", "string", '"Dismiss"', "Name of the close button"],
            ["role", "string", '"alert" for destructive, else "status"', "Override when needed"],
          ]}
        />
      </Section>
    </>
  )
}
