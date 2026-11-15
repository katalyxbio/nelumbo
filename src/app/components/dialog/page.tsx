"use client"

import * as React from "react"
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogIcon,
  DialogTitle,
  DialogTrigger,
} from "@/registry/nelumbo/ui/dialog"
import { Button } from "@/registry/nelumbo/ui/button"
import { Input } from "@/registry/nelumbo/ui/input"
import { Checkbox } from "@/registry/nelumbo/ui/checkbox"
import { Code, PageHeader, Preview, PropsTable, Section } from "@/components/docs/primitives"

const TERMS = [
  ["1. Your account", "You are responsible for the activity on your account and for keeping your password safe. Tell us right away if you think someone else has used it."],
  ["2. Your content", "You keep ownership of everything you upload. You give us permission to store and display it so the service can work, and nothing more."],
  ["3. Acceptable use", "Don't use the service to break the law, to send spam, or to interfere with other people's use of it. We may suspend accounts that do."],
  ["4. Payments", "Paid plans renew automatically each month or year. You can cancel at any time; the plan stays active until the end of the period you paid for."],
  ["5. Changes", "We'll tell you at least 30 days before any change to these terms that affects you, by email and in the app."],
  ["6. Ending the agreement", "You can delete your account whenever you like. We'll keep a backup of your content for 30 days in case you change your mind."],
  ["7. Liability", "The service is provided as is. To the extent the law allows, we are not liable for indirect losses."],
]

export default function DialogPage() {
  const [agreed, setAgreed] = React.useState(false)

  return (
    <>
      <PageHeader eyebrow="Component 15" title="Dialog">
        Asks for a decision, or a few details, without leaving the page. It rises and settles on a spring over a softly
        blurred scrim, and closes quickly and quietly.
      </PageHeader>

      <Section title="Install">
        <Code>{`npx shadcn@latest add @nelumbo/dialog`}</Code>
      </Section>

      <Section title="Basic" description="A title that asks the question, a sentence of context, and the actions. Put the main action last; Escape or a click on the scrim cancels.">
        <Preview>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Discard draft</Button>
            </DialogTrigger>
            <DialogContent size="sm" showCloseButton={false}>
              <DialogHeader>
                <DialogTitle>Discard this draft?</DialogTitle>
                <DialogDescription>Your changes to “Quarterly update” haven&apos;t been saved.</DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="ghost">Keep editing</Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button>Discard</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </Preview>
      </Section>

      <Section title="With an icon" description="A hero icon above the title centers the header. Use it for alerts and confirmations that deserve a beat of attention.">
        <Preview>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="destructive">Delete files</Button>
            </DialogTrigger>
            <DialogContent size="sm" showCloseButton={false}>
              <DialogHeader>
                <DialogIcon name="delete" className="text-destructive" />
                <DialogTitle>Delete 3 files?</DialogTitle>
                <DialogDescription>They&apos;ll be removed for everyone with access. This can&apos;t be undone.</DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="ghost">Cancel</Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button variant="destructive">Delete</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="secondary">Reset preferences</Button>
            </DialogTrigger>
            <DialogContent size="sm" showCloseButton={false}>
              <DialogHeader>
                <DialogIcon name="restart_alt" />
                <DialogTitle>Reset preferences?</DialogTitle>
                <DialogDescription>Theme, density and notifications go back to their defaults. Your content isn&apos;t touched.</DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="ghost">Cancel</Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button>Reset</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </Preview>
      </Section>

      <Section title="Form" description="For a few fields. The close button sits in the corner; focus starts on the first field.">
        <Preview>
          <Dialog>
            <DialogTrigger asChild>
              <Button>Edit profile</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit profile</DialogTitle>
                <DialogDescription>This is how others see you across the workspace.</DialogDescription>
              </DialogHeader>
              <form
                id="profile-form"
                className="flex flex-col gap-4"
                onSubmit={(e) => {
                  e.preventDefault()
                }}
              >
                <Input label="Name" defaultValue="Maya Lin" />
                <Input label="Title" defaultValue="Design lead" />
                <Input label="Email" icon="mail" type="email" defaultValue="maya@northwind.studio" description="Only visible to admins." />
              </form>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="ghost">Cancel</Button>
                </DialogClose>
                <Button type="submit" form="profile-form">
                  Save
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </Preview>
      </Section>

      <Section title="Scrolling content" description="DialogBody scrolls between a fixed header and footer. Hairlines appear at its edges only while there is more to read.">
        <Preview>
          <Dialog onOpenChange={(o) => o && setAgreed(false)}>
            <DialogTrigger asChild>
              <Button variant="outline">Review terms</Button>
            </DialogTrigger>
            <DialogContent className="max-h-[min(36rem,calc(100dvh-2rem))]">
              <DialogHeader>
                <DialogTitle>Terms of service</DialogTitle>
                <DialogDescription>Updated 1 November 2026</DialogDescription>
              </DialogHeader>
              <DialogBody className="flex flex-col gap-4 py-1">
                {TERMS.map(([h, b]) => (
                  <div key={h} className="flex flex-col gap-1">
                    <p className="type-title-sm">{h}</p>
                    <p className="text-muted-foreground">{b}</p>
                  </div>
                ))}
              </DialogBody>
              <label className="flex items-center gap-3 type-body-md">
                <Checkbox checked={agreed} onCheckedChange={(v) => setAgreed(v === true)} />I agree to the terms
              </label>
              <DialogFooter className="mt-0">
                <DialogClose asChild>
                  <Button variant="ghost">Not now</Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button disabled={!agreed}>Continue</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </Preview>
      </Section>

      <Section title="Sizes" description="sm (400px) for confirmations, default (512px) for forms, lg (672px) for richer content. On small screens every size keeps a 16px margin.">
        <Preview>
          {(["sm", "default", "lg"] as const).map((s) => (
            <Dialog key={s}>
              <DialogTrigger asChild>
                <Button variant="secondary">{s}</Button>
              </DialogTrigger>
              <DialogContent size={s}>
                <DialogHeader>
                  <DialogTitle>Size: {s}</DialogTitle>
                  <DialogDescription>Width follows the content up to the size&apos;s maximum.</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button>Done</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          ))}
        </Preview>
      </Section>

      <Section title="Usage">
        <Code>{`import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogIcon, DialogTitle, DialogDescription, DialogBody, DialogFooter, DialogClose } from "@/components/ui/dialog"

<Dialog>
  <DialogTrigger asChild><Button>Delete</Button></DialogTrigger>
  <DialogContent size="sm" showCloseButton={false}>
    <DialogHeader>
      <DialogIcon name="delete" />
      <DialogTitle>Delete 3 files?</DialogTitle>
      <DialogDescription>This can't be undone.</DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <DialogClose asChild><Button variant="ghost">Cancel</Button></DialogClose>
      <Button variant="destructive">Delete</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>`}</Code>
      </Section>

      <Section title="Props" description="Dialog, DialogTrigger and DialogClose take Radix Dialog props (open, onOpenChange, modal…).">
        <PropsTable
          rows={[
            ["DialogContent size", '"sm" | "default" | "lg"', '"default"', "400, 512 or 672px wide"],
            ["DialogContent showCloseButton", "boolean", "true", "Close button in the corner"],
            ["DialogIcon name", "IconName", "", "Hero icon; centers the header"],
            ["DialogBody", "", "", "Scrolling region with edge hairlines"],
          ]}
        />
      </Section>
    </>
  )
}
