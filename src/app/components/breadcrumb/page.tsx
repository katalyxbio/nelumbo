"use client"

import * as React from "react"
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/registry/velvet/ui/breadcrumb"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/registry/velvet/ui/dropdown-menu"
import { Card } from "@/registry/velvet/ui/card"
import { Icon } from "@/registry/velvet/ui/icon"
import { Code, PageHeader, Preview, PropsTable, Section } from "@/components/docs/primitives"

const stop = (e: React.MouseEvent) => e.preventDefault()

export default function BreadcrumbPageDocs() {
  return (
    <>
      <PageHeader eyebrow="Component 38" title="Breadcrumb">
        The path to the current page, from the top of the site down. Each step is a link; the last one is the page you
        are on and is not a link. Use it under a page title or in a toolbar, not as navigation on its own.
      </PageHeader>

      <Section title="Install">
        <Code>{`npx shadcn@latest add @velvet/breadcrumb`}</Code>
      </Section>

      <Section
        title="Basic"
        description='The current page is a BreadcrumbPage with aria-current="page", set in a tonal chip. Links are muted pills that fill with the state layer on hover and squeeze when pressed.'
      >
        <Preview className="justify-start">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="#" onClick={stop}>Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="#" onClick={stop}>Components</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </Preview>
      </Section>

      <Section
        title="Contained"
        description='variant="contained" sets the trail on a tonal track and raises the current page on it, like the selected segment of a segmented button. Icons in links and in the page sit at 18px; the page&apos;s icon fills.'
      >
        <Preview className="flex-col items-start gap-4">
          <Breadcrumb variant="contained">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="#" onClick={stop}>
                  <Icon name="home" />
                  Home
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="#" onClick={stop}>
                  <Icon name="folder" />
                  Projects
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>
                  <Icon name="description" />
                  Q3 report
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <Breadcrumb variant="contained">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="#" onClick={stop}>Settings</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Notifications</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </Preview>
      </Section>

      <Section
        title="Collapsed"
        description="When the trail is long, fold the middle steps into an ellipsis. The ellipsis is a DropdownMenu trigger, so the hidden steps open in a menu. The trigger is announced as More."
      >
        <Preview className="justify-start">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="#" onClick={stop}>Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <DropdownMenu>
                  <DropdownMenuTrigger className="state-layer flex items-center rounded-full outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
                    <BreadcrumbEllipsis />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem>Docs</DropdownMenuItem>
                    <DropdownMenuItem>Foundations</DropdownMenuItem>
                    <DropdownMenuItem>Motion</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="#" onClick={stop}>Components</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </Preview>
      </Section>

      <Section title="Custom separator" description="Pass children to BreadcrumbSeparator to replace the chevron. Separators stay hidden from assistive tech either way.">
        <Preview className="justify-start">
          <Breadcrumb>
            <BreadcrumbList className="gap-x-2">
              <BreadcrumbItem>
                <BreadcrumbLink href="#" onClick={stop}>Projects</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>/</BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbLink href="#" onClick={stop}>Velvet</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>/</BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbPage>Settings</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </Preview>
      </Section>

      <Section
        title="Long trail, on a phone"
        description="At 390px the trail wraps onto a second line rather than scrolling sideways. A long page name is capped and cut with an ellipsis, and its full text stays in the DOM for screen readers."
      >
        <Card variant="outlined" className="w-full max-w-sm p-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="#" onClick={stop}>Workspace</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="#" onClick={stop}>Design systems</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="#" onClick={stop}>Velvet</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="#" onClick={stop}>Components</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem className="max-w-[14rem]">
                <BreadcrumbPage className="max-w-full"><span className="truncate">Navigation and wayfinding patterns</span></BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </Card>
      </Section>

      <Section title="Your own link" description="asChild gives the link styles to your element, such as a router Link. The state layer and focus ring come with it.">
        <Preview className="justify-start">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <a href="#" onClick={stop}>Home</a>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </Preview>
      </Section>

      <Section title="Usage">
        <Code>{`import {
  Breadcrumb, BreadcrumbEllipsis, BreadcrumbItem, BreadcrumbLink,
  BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

<Breadcrumb>
  <BreadcrumbList>
    <BreadcrumbItem>
      <BreadcrumbLink asChild><Link href="/">Home</Link></BreadcrumbLink>
    </BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem>
      <BreadcrumbPage>Settings</BreadcrumbPage>
    </BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>`}</Code>
      </Section>

      <Section title="Props">
        <PropsTable
          rows={[
            ["Breadcrumb", "nav props", "", 'Labelled "breadcrumb" by default'],
            ["Breadcrumb variant", '"plain" | "contained"', '"plain"', "contained sets the trail on a tonal track with the page raised on it"],
            ["BreadcrumbList", "ol props", "", "Wraps onto more lines on narrow screens"],
            ["BreadcrumbItem", "li props", "", ""],
            ["BreadcrumbLink", "a props, asChild", "false", "Muted link; asChild styles your own element"],
            ["BreadcrumbPage", "span props", "", "The current page: aria-current=\"page\""],
            ["BreadcrumbSeparator", "children", "chevron_right", "Replaces the default chevron; hidden from assistive tech"],
            ["BreadcrumbEllipsis", "span props", "", "Collapsed steps; announced as More"],
          ]}
        />
      </Section>
    </>
  )
}
