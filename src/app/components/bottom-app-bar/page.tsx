"use client"

import * as React from "react"
import {
  BottomAppBar,
  BottomAppBarAction,
  BottomAppBarActions,
  BottomAppBarFab,
  TopAppBar,
  TopAppBarNavigation,
  TopAppBarTitle,
} from "@/registry/nelumbo/ui/app-bar"
import { Code, PageHeader, Preview, PropsTable, Section } from "@/components/docs/primitives"
import { InboxList, PhoneFrame } from "../top-app-bar/inbox"

function Demo({ label, floating, hideOnScroll, fab = true }: { label: string; floating?: boolean; hideOnScroll?: boolean; fab?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <p className="type-label-md text-muted-foreground">{label}</p>
      <PhoneFrame label={`${label}, scrollable`} className="relative">
        {(scroller) => (
          <div className="flex min-h-full flex-col">
            <TopAppBar as="div" scrollBehavior="elevate" scrollTarget={scroller}>
              <TopAppBarNavigation />
              <TopAppBarTitle as="h3">Inbox</TopAppBarTitle>
            </TopAppBar>
            <div className="flex-1">
              <InboxList />
            </div>
            <BottomAppBar aria-label="Message actions" floating={floating} hideOnScroll={hideOnScroll} scrollTarget={scroller}>
              <BottomAppBarActions>
                <BottomAppBarAction icon="check_box" label="Select" />
                <BottomAppBarAction icon="archive" label="Archive" />
                <BottomAppBarAction icon="label" label="Label" />
                <BottomAppBarAction icon="more_vert" label="More options" />
              </BottomAppBarActions>
              {fab && <BottomAppBarFab icon="edit" label="Compose" />}
            </BottomAppBar>
          </div>
        )}
      </PhoneFrame>
    </div>
  )
}

const grid = "grid-cols-[repeat(auto-fit,minmax(0,22rem))] justify-center items-start gap-x-8 gap-y-10"

export default function BottomAppBarPage() {
  return (
    <>
      <PageHeader eyebrow="Component 65" title="Bottom App Bar">
        Actions for the current screen, with the primary one as a FAB at the end. It is not navigation: for
        destinations use the Navigation Bar. Scroll inside each frame to see it respond.
      </PageHeader>

      <Section title="Install">
        <Code>{`npx shadcn@latest add @nelumbo/app-bar`}</Code>
        <p className="type-body-sm text-muted-foreground">
          Top and bottom bars share one scroll engine, so they ship together in the app-bar item.
        </p>
      </Section>

      <Section title="Standard" description="80px on surface-container, plus the home-indicator inset. Up to four actions at the start and an optional FAB at the end.">
        <Preview className={"grid " + grid}>
          <Demo label="Actions and FAB" />
          <Demo label="Actions only" fab={false} />
        </Preview>
      </Section>

      <Section
        title="Hide on scroll"
        description="The bar slides down while you scroll down and returns the moment you scroll up, or when keyboard focus moves into it."
      >
        <Preview className={"grid " + grid}>
          <Demo label="Hide on scroll" hideOnScroll />
        </Preview>
      </Section>

      <Section title="Floating" description="Material 3 Expressive: a rounded 64px bar that floats above the content instead of docking to the edge.">
        <Preview className={"grid " + grid}>
          <Demo label="Floating" floating />
          <Demo label="Floating, hides on scroll" floating hideOnScroll />
        </Preview>
      </Section>

      <Section title="Usage" description="Place it as the last child of the scroller. It is position: sticky at the bottom.">
        <Code>{`import { BottomAppBar, BottomAppBarActions, BottomAppBarAction, BottomAppBarFab } from "@/components/ui/app-bar"

<div ref={scroller} className="h-dvh overflow-y-auto">
  <Messages />
  <BottomAppBar aria-label="Message actions" hideOnScroll scrollTarget={scroller}>
    <BottomAppBarActions>
      <BottomAppBarAction icon="check_box" label="Select" />
      <BottomAppBarAction icon="archive" label="Archive" />
    </BottomAppBarActions>
    <BottomAppBarFab icon="edit" label="Compose" />
  </BottomAppBar>
</div>`}</Code>
      </Section>

      <Section title="Props">
        <PropsTable
          rows={[
            ["BottomAppBar floating", "boolean", "false", "Rounded 64px bar that floats"],
            ["hideOnScroll", "boolean", "false", "Slide away scrolling down"],
            ["scrollTarget", "RefObject | HTMLElement", "window", "The scrolling container"],
            ["aria-label", "string", "", "Gives the bar role=toolbar and a name"],
            ["BottomAppBarActions", "children", "", "Up to four BottomAppBarAction"],
            ["BottomAppBarAction", "IconButton props", "", "48px button with a tooltip; label required"],
            ["BottomAppBarFab", "Fab props", "", "The primary action at the end"],
          ]}
        />
      </Section>
    </>
  )
}
