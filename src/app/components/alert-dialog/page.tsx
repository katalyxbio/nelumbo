"use client"

import * as React from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/registry/nelumbo/ui/alert-dialog"
import { Button } from "@/registry/nelumbo/ui/button"
import { Icon } from "@/registry/nelumbo/ui/icon"
import { Code, PageHeader, Preview, PropsTable, Section } from "@/components/docs/primitives"

export default function AlertDialogPage() {
  const [log, setLog] = React.useState("Nothing chosen yet.")

  return (
    <>
      <PageHeader eyebrow="Component 44" title="Alert Dialog">
        A modal that interrupts to confirm something that matters. Unlike a dialog it can&apos;t be dismissed by clicking
        outside: the person has to choose. Focus lands on Cancel, so a stray Enter is safe.
      </PageHeader>

      <Section title="Install">
        <Code>{`npx shadcn@latest add @nelumbo/alert-dialog`}</Code>
      </Section>

      <Section title="Destructive" description="variant='destructive' on the root makes the action a destructive button and tints the icon tile. The icon centers the header; the actions stay right-aligned (stacked full width on phones).">
        <Preview>
          <AlertDialog variant="destructive">
            <AlertDialogTrigger asChild>
              <Button variant="outline">
                <Icon name="delete" />
                Delete project
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader icon="delete">
                <AlertDialogTitle>Delete this project?</AlertDialogTitle>
                <AlertDialogDescription>
                  Aurora and its 24 files will be removed for everyone. You can restore it from the trash for 30 days.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => setLog("Project deleted.")}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <p role="status" className="type-body-md text-muted-foreground">
            {log}
          </p>
        </Preview>
      </Section>

      <Section title="With an icon" description="Without variant the tile is a neutral tonal one.">
        <Preview>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="secondary">
                <Icon name="logout" />
                Sign out
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent size="sm">
              <AlertDialogHeader icon="logout">
                <AlertDialogTitle>Sign out of Nelumbo?</AlertDialogTitle>
                <AlertDialogDescription>Unsaved changes on this device will be kept as a draft.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Stay signed in</AlertDialogCancel>
                <AlertDialogAction>Sign out</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </Preview>
      </Section>

      <Section title="Plain" description="Exactly shadcn's anatomy: left-aligned text, no icon.">
        <Preview>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline">Discard draft</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Discard this draft?</AlertDialogTitle>
                <AlertDialogDescription>The message and its attachments will be lost.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep editing</AlertDialogCancel>
                <AlertDialogAction variant="secondary">Discard</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </Preview>
      </Section>

      <Section title="Usage">
        <Code>{`import {
  AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader,
  AlertDialogFooter, AlertDialogTitle, AlertDialogDescription,
  AlertDialogAction, AlertDialogCancel,
} from "@/components/ui/alert-dialog"

<AlertDialog variant="destructive">
  <AlertDialogTrigger asChild><Button variant="outline">Delete</Button></AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader icon="delete">
      <AlertDialogTitle>Delete this project?</AlertDialogTitle>
      <AlertDialogDescription>This can't be undone.</AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction>Delete</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>`}</Code>
      </Section>

      <Section title="Props" description="Other props go to Radix AlertDialog (open, onOpenChange, defaultOpen) and its parts.">
        <PropsTable
          rows={[
            ["AlertDialog variant", '"default" | "destructive"', '"default"', "Destructive tints the icon tile and the action"],
            ["AlertDialogHeader icon", "IconName", "none", "Material Symbol in a tonal tile; centers the header"],
            ["AlertDialogContent size", '"sm" | "default"', '"default"', "Max width 22rem or 26rem"],
            ["AlertDialogAction variant", "Button variant", "per dialog", "Also size and shape"],
            ["AlertDialogCancel variant", "Button variant", '"ghost"', "Also size and shape"],
          ]}
        />
      </Section>
    </>
  )
}
