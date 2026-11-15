"use client"

import * as React from "react"
import { LoadingIndicator } from "@/registry/nelumbo/ui/loading-indicator"
import { Skeleton } from "@/registry/nelumbo/ui/skeleton"
import { Button } from "@/registry/nelumbo/ui/button"
import { Card } from "@/registry/nelumbo/ui/card"
import { Icon } from "@/registry/nelumbo/ui/icon"
import { Code, PageHeader, Preview, PropsTable, Section } from "@/components/docs/primitives"

function Labelled({ children, text }: { children: React.ReactNode; text: string }) {
  return (
    <div className="flex flex-col items-center gap-3">
      {children}
      <span className="type-label-sm text-muted-foreground">{text}</span>
    </div>
  )
}

function Article({ loading }: { loading: boolean }) {
  return (
    <Card variant="outlined" className="w-full max-w-sm gap-4 p-5" aria-busy={loading}>
      <div className="flex items-center gap-3">
        {loading ? (
          <>
            <Skeleton className="size-10 rounded-full" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-3.5 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
          </>
        ) : (
          <>
            <span className="grid size-10 place-items-center rounded-full bg-brand-container text-brand-container-foreground type-label-lg">MK</span>
            <div className="flex flex-col">
              <span className="type-title-sm">Maya Kowalski</span>
              <span className="type-body-sm text-muted-foreground">2 hours ago</span>
            </div>
          </>
        )}
      </div>
      {loading ? (
        <Skeleton className="aspect-video w-full rounded-xl" />
      ) : (
        <div className="grid aspect-video w-full place-items-center rounded-xl bg-linear-to-br from-brand-container to-surface-container-highest">
          <Icon name="landscape" size={40} className="text-brand-container-foreground" />
        </div>
      )}
      {loading ? (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-3.5 w-full" />
          <Skeleton className="h-3.5 w-full" />
          <Skeleton className="h-3.5 w-2/3" />
        </div>
      ) : (
        <p className="type-body-md text-muted-foreground">
          The spring collection lands next week. Here&apos;s a first look at the palette and the shoot in the hills above town.
        </p>
      )}
    </Card>
  )
}

export default function LoadingIndicatorPage() {
  const [loading, setLoading] = React.useState(true)
  const [refreshing, setRefreshing] = React.useState(false)
  const refresh = () => {
    setRefreshing(true)
    setTimeout(() => setRefreshing(false), 2600)
  }

  return (
    <>
      <PageHeader eyebrow="Component 27" title="Loading Indicator">
        For short waits you can&apos;t measure. A soft shape springs from one form to the next as it turns, so waiting
        feels calm rather than mechanical. Skeletons hold the place of content that&apos;s on its way.
      </PageHeader>

      <Section title="Install">
        <Code>{`npx shadcn@latest add @nelumbo/loading-indicator @nelumbo/skeleton`}</Code>
      </Section>

      <Section
        title="Loading indicator"
        description="Seven shapes in a loop: burst, cookie, pentagon, pill, sun, clover and oval. Contained puts it on a filled circle, for use over images or busy content. With reduced motion it stays still and gently pulses."
      >
        <Preview className="justify-center gap-10">
          <Labelled text="default">
            <LoadingIndicator />
          </Labelled>
          <Labelled text="contained">
            <LoadingIndicator contained />
          </Labelled>
          <Labelled text='color="brand"'>
            <LoadingIndicator color="brand" />
          </Labelled>
          <Labelled text="brand, contained">
            <LoadingIndicator color="brand" contained />
          </Labelled>
          <Labelled text="size={24}">
            <LoadingIndicator size={24} />
          </Labelled>
          <Labelled text="size={72}">
            <LoadingIndicator size={72} contained />
          </Labelled>
        </Preview>
      </Section>

      <Section title="In context" description="A contained indicator drops in over the list while it refreshes, as with pull to refresh.">
        <Preview className="justify-center">
          <Card variant="outlined" className="relative w-full max-w-sm gap-0 overflow-hidden p-2">
            <div className="flex items-center justify-between px-3 pt-2 pb-2">
              <p className="type-title-sm">Inbox</p>
              <Button size="sm" variant="secondary" onClick={refresh} disabled={refreshing}>
                <Icon name="refresh" />
                Refresh
              </Button>
            </div>
            <div
              className={
                "absolute inset-x-0 top-14 z-10 flex justify-center transition-[translate,opacity,scale] duration-500 ease-(--ease-spring-bouncy) " +
                (refreshing ? "translate-y-2 opacity-100" : "pointer-events-none -translate-y-6 scale-50 opacity-0")
              }
            >
              {refreshing && <LoadingIndicator contained className="shadow-e2" aria-label="Refreshing inbox" />}
            </div>
            <ul aria-busy={refreshing} className={"transition-opacity duration-300 " + (refreshing ? "opacity-50" : "")}>
              {["Quarterly review", "Design crit notes", "Your order has shipped", "Team offsite, final plan"].map((s, i) => (
                <li key={s} className="flex items-center gap-3 rounded-xl px-3 py-3">
                  <Icon name={i === 2 ? "local_shipping" : "mail"} className="text-muted-foreground" />
                  <span className="type-body-md">{s}</span>
                </li>
              ))}
            </ul>
          </Card>
        </Preview>
      </Section>

      <Section
        title="Skeleton"
        description="Placeholders in the shape of the content, with a soft light sweeping across. Size and round them with className, as in shadcn. Mark the region with aria-busy; skeletons themselves are hidden from screen readers."
      >
        <Preview className="flex-col items-center gap-5">
          <Button size="sm" variant="secondary" onClick={() => setLoading((l) => !l)} className="self-center">
            {loading ? "Show content" : "Show skeleton"}
          </Button>
          <Article loading={loading} />
        </Preview>
      </Section>

      <Section title="Usage">
        <Code>{`import { LoadingIndicator } from "@/components/ui/loading-indicator"
import { Skeleton } from "@/components/ui/skeleton"

<LoadingIndicator />                                  // aria-label="Loading"
<LoadingIndicator contained color="brand" size={64} aria-label="Refreshing" />

<div aria-busy={loading}>
  <Skeleton className="size-10 rounded-full" />
  <Skeleton className="h-4 w-40" />
</div>`}</Code>
      </Section>

      <Section title="Props">
        <PropsTable
          rows={[
            ["LoadingIndicator contained", "boolean", "false", "On a filled circle"],
            ["LoadingIndicator color", '"default" | "brand"', '"default"', ""],
            ["LoadingIndicator size", "number", "48", "Container in px; the shape is 38/48 of it"],
            ["LoadingIndicator aria-label", "string", '"Loading"', "What screen readers hear"],
            ["Skeleton className", "string", "", "Set the size and radius here"],
          ]}
        />
      </Section>
    </>
  )
}
