"use client"

import * as React from "react"
import { Avatar } from "@/registry/velvet/ui/avatar"
import { IconButton } from "@/registry/velvet/ui/icon-button"
import {
  TopAppBar,
  TopAppBarAction,
  TopAppBarActions,
  TopAppBarNavigation,
  TopAppBarSearch,
  TopAppBarTitle,
  type TopAppBarProps,
} from "@/registry/velvet/ui/app-bar"
import { Code, PageHeader, Preview, PropsTable, Section } from "@/components/docs/primitives"
import { InboxList, PhoneFrame } from "./inbox"

function Demo({
  label,
  variant,
  scrollBehavior,
  title = "Inbox",
  subtitle,
  back,
  search,
}: Pick<TopAppBarProps, "variant" | "scrollBehavior"> & { label: string; title?: string; subtitle?: string; back?: boolean; search?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <p className="type-label-md text-muted-foreground">{label}</p>
      <PhoneFrame label={`${label}, scrollable`}>
        {(scroller) => (
          <>
            <TopAppBar variant={variant} scrollBehavior={scrollBehavior} scrollTarget={scroller} as="div">
              {search ? (
                <TopAppBarSearch
                  label="Search mail"
                  placeholder="Search mail"
                  leading={<IconButton label="Open navigation" icon="menu" />}
                  avatar={<Avatar name="Maya Kowalski" size="sm" color="auto" />}
                />
              ) : (
                <>
                  <TopAppBarNavigation icon={back ? "arrow_back" : "menu"} label={back ? "Back" : "Open navigation"} />
                  <TopAppBarTitle subtitle={subtitle} as="h3">
                    {title}
                  </TopAppBarTitle>
                  <TopAppBarActions>
                    <TopAppBarAction icon="search" label="Search" />
                    <TopAppBarAction icon="more_vert" label="More options" />
                  </TopAppBarActions>
                </>
              )}
            </TopAppBar>
            <InboxList />
          </>
        )}
      </PhoneFrame>
    </div>
  )
}

const grid = "grid-cols-[repeat(auto-fit,minmax(0,22rem))] justify-center items-start gap-x-8 gap-y-10"

export default function TopAppBarPage() {
  return (
    <>
      <PageHeader eyebrow="Component 64" title="Top App Bar">
        The bar at the head of a screen: navigation, title and actions. Four sizes, and four ways to respond to
        scrolling, including the headline that shrinks into the bar as you move down the list. Every demo below
        scrolls inside its own frame, so scroll the frame, not the page.
      </PageHeader>

      <Section title="Install">
        <Code>{`npx shadcn@latest add @velvet/app-bar`}</Code>
      </Section>

      <Section
        title="Variants"
        description="Small is 64px with the title inline. Center centers it. Medium (112px) and large (152px) move the title below the icons as a headline."
      >
        <Preview className={"grid " + grid}>
          <Demo label="Small" variant="small" scrollBehavior="none" />
          <Demo label="Center" variant="center" scrollBehavior="none" title="Inbox" back />
          <Demo label="Medium, collapse" variant="medium" scrollBehavior="collapse" />
          <Demo label="Large, collapse" variant="large" scrollBehavior="collapse" subtitle="12 unread" />
        </Preview>
      </Section>

      <Section
        title="Scroll behavior"
        description={
          <>
            <code className="font-mono">elevate</code> fills the bar with surface-container and lifts it as content scrolls under it.{" "}
            <code className="font-mono">hide</code> slides it away scrolling down and brings it back scrolling up (or when focus moves into it).{" "}
            <code className="font-mono">collapse</code> is driven by scroll position: the headline scales down and cross-fades into the inline title, and if you stop part way it springs to the nearest end.
          </>
        }
      >
        <Preview className={"grid " + grid}>
          <Demo label="Elevate" variant="small" scrollBehavior="elevate" />
          <Demo label="Hide on scroll" variant="center" scrollBehavior="hide" />
        </Preview>
      </Section>

      <Section
        title="Search in the bar"
        description="Put a SearchBar in the bar instead of a title. The leading slot takes the navigation button, the avatar sits at the far end."
      >
        <Preview className={"grid " + grid}>
          <Demo label="Search bar" variant="small" scrollBehavior="elevate" search />
        </Preview>
        <Code>{`<TopAppBar scrollBehavior="elevate" scrollTarget={scroller}>
  <TopAppBarSearch
    label="Search mail"
    leading={<IconButton label="Open navigation" icon="menu" />}
    avatar={<Avatar name="Maya Kowalski" size="sm" color="auto" />}
  />
</TopAppBar>`}</Code>
      </Section>

      <Section
        title="Landmarks and headings"
        description="The bar renders a header element, which is the page banner when it is a direct child of body; give it role=banner otherwise, or render a div with as=div (as in these demos, which sit inside the page's main). The title is an h1 by default; pick the level that fits with as. In medium and large the headline is the only real heading, and the small inline copy that fades in is aria-hidden."
      >
        <Code>{`<TopAppBar variant="large" role="banner" aria-label="Mail">
  <TopAppBarNavigation />
  <TopAppBarTitle as="h1">Inbox</TopAppBarTitle>
</TopAppBar>`}</Code>
      </Section>

      <Section title="Usage" description="The bar is position: sticky, so put it inside the scroller. Without scrollTarget it follows the window.">
        <Code>{`import { TopAppBar, TopAppBarNavigation, TopAppBarTitle, TopAppBarActions, TopAppBarAction } from "@/components/ui/app-bar"

const scroller = useRef<HTMLDivElement>(null)

<div ref={scroller} className="h-dvh overflow-y-auto">
  <TopAppBar variant="large" scrollBehavior="collapse" scrollTarget={scroller}>
    <TopAppBarNavigation icon="arrow_back" label="Back" onClick={back} />
    <TopAppBarTitle subtitle="12 unread">Inbox</TopAppBarTitle>
    <TopAppBarActions>
      <TopAppBarAction icon="search" label="Search" />
      <TopAppBarAction icon="more_vert" label="More options" />
    </TopAppBarActions>
  </TopAppBar>
  <Messages />
</div>`}</Code>
      </Section>

      <Section title="Props">
        <PropsTable
          rows={[
            ["TopAppBar variant", '"small" | "center" | "medium" | "large"', '"small"', "64, 64, 112 and 152px"],
            ["scrollBehavior", '"none" | "elevate" | "collapse" | "hide"', '"none"', "Collapse is for medium and large; on others it elevates"],
            ["scrollTarget", "RefObject | HTMLElement", "window", "The scrolling container the bar sits in"],
            ["settle", "boolean", "true", "Spring a half-collapsed bar to its nearest end"],
            ["as", '"header" | "div"', '"header"', "Landmark element"],
            ["TopAppBarNavigation", "IconButton props", "menu", "Leading button; icon, label, onClick, or children"],
            ["TopAppBarTitle subtitle", "ReactNode", "", "A quieter second line"],
            ["TopAppBarTitle as", '"h1" | "h2" | "h3" | "p" | "div"', '"h1"', "Heading element"],
            ["TopAppBarActions", "children", "", "Up to three TopAppBarAction, then an overflow"],
            ["TopAppBarAction", "IconButton props", "", "48px button with a tooltip; label required"],
            ["TopAppBarSearch", "SearchBar props", "", "Search in the bar"],
            ["--bar-p", "CSS variable", "", "Collapse progress 0 to 1, for your own effects"],
          ]}
        />
      </Section>
    </>
  )
}
