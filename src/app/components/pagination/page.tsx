"use client"

import * as React from "react"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  paginationRange,
} from "@/registry/nelumbo/ui/pagination"
import { Icon } from "@/registry/nelumbo/ui/icon"
import { Code, PageHeader, Preview, PropsTable, Section } from "@/components/docs/primitives"

/** A pager for `count` pages: previous, the numbers (with ellipses), next. */
function Pager({
  page,
  count,
  onPage,
  siblings = 1,
  compact = false,
  label = "Pages",
}: {
  page: number
  count: number
  onPage: (p: number) => void
  siblings?: number
  compact?: boolean
  label?: string
}) {
  const go = (p: number) => (e: React.MouseEvent) => {
    e.preventDefault()
    if (p >= 1 && p <= count && p !== page) onPage(p)
  }
  const range = paginationRange(page, count, siblings)
  return (
    <Pagination aria-label={label}>
      <PaginationContent>
        <PaginationItem>
          {compact ? (
            <PaginationLink href="#" size="icon" aria-label="Previous page" aria-disabled={page === 1 || undefined} onClick={go(page - 1)}>
              <Icon name="chevron_left" />
            </PaginationLink>
          ) : (
            <PaginationPrevious href="#" aria-disabled={page === 1 || undefined} onClick={go(page - 1)} />
          )}
        </PaginationItem>
        {range.map((p, i) =>
          p === "ellipsis" ? (
            <PaginationItem key={`e${i}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={p}>
              <PaginationLink href="#" isActive={p === page} aria-label={`Page ${p}`} size={compact ? "icon" : "default"} onClick={go(p)}>
                {p}
              </PaginationLink>
            </PaginationItem>
          )
        )}
        <PaginationItem>
          {compact ? (
            <PaginationLink href="#" size="icon" aria-label="Next page" aria-disabled={page === count || undefined} onClick={go(page + 1)}>
              <Icon name="chevron_right" />
            </PaginationLink>
          ) : (
            <PaginationNext href="#" aria-disabled={page === count || undefined} onClick={go(page + 1)} />
          )}
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}

export default function PaginationPageDocs() {
  const [page, setPage] = React.useState(3)
  const [bigPage, setBigPage] = React.useState(21)
  const [widePage, setWidePage] = React.useState(6)
  const [compactPage, setCompactPage] = React.useState(1)
  const [sizePage, setSizePage] = React.useState(2)

  return (
    <>
      <PageHeader eyebrow="Component 39" title="Pagination">
        Move through pages of results. Numbers, previous and next, with ellipses when there are too many pages to show.
        The current page is marked for assistive tech with aria-current. Pagination only moves between pages; it does
        not load them. Pair it with your data or a DataTable.
      </PageHeader>

      <Section title="Install">
        <Code>{`npx shadcn@latest add @nelumbo/pagination`}</Code>
      </Section>

      <Section
        title="Controlled"
        description="The page lives in your state. Previous and Next stop at the ends (aria-disabled keeps them focusable so the focus does not jump). The status line is announced when the page changes."
      >
        <Preview className="flex-col items-stretch gap-4">
          <Pager label="Pages" page={page} count={8} onPage={setPage} />
          <p className="text-center type-body-sm text-muted-foreground" aria-live="polite">
            Page {page} of 8
          </p>
        </Preview>
      </Section>

      <Section
        title="Many pages"
        description="paginationRange(page, count, siblings) gives the numbers to render, with ellipses where pages are skipped. siblings sets how many numbers show either side of the current page."
      >
        <Preview className="flex-col items-stretch gap-6">
          <div className="flex flex-col items-center gap-2">
            <p className="type-label-md text-muted-foreground">Siblings 1, page 21 of 42</p>
            <Pager label="Pages, one sibling" page={bigPage} count={42} onPage={setBigPage} />
          </div>
          <div className="flex flex-col items-center gap-2">
            <p className="type-label-md text-muted-foreground">Siblings 2, page 6 of 42</p>
            <Pager label="Pages, two siblings" page={widePage} count={42} onPage={setWidePage} siblings={2} />
          </div>
        </Preview>
      </Section>

      <Section
        title="Compact"
        description="Icons only, for toolbars and tight spaces. Give the icon buttons an aria-label; the page links keep their numbers."
      >
        <Preview className="justify-center">
          <Pager label="Pages, compact" page={compactPage} count={12} onPage={setCompactPage} compact />
        </Preview>
      </Section>

      <Section title="Sizes" description='size works as in shadcn: "sm", "default" and "lg" set the round target; "icon" is the square-ish icon-only size.'>
        <Preview className="flex-col items-stretch gap-4">
          {(["sm", "default", "lg"] as const).map((size) => (
            <Pagination aria-label={`Pages, ${size} size`} key={size} className="justify-start">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious href="#" size={size} onClick={(e) => e.preventDefault()} />
                </PaginationItem>
                {[1, 2, 3].map((p) => (
                  <PaginationItem key={p}>
                    <PaginationLink href="#" size={size} isActive={p === sizePage} aria-label={`Page ${p}`} onClick={(e) => { e.preventDefault(); setSizePage(p) }}>
                      {p}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext href="#" size={size} onClick={(e) => { e.preventDefault(); setSizePage((p) => Math.min(3, p + 1)) }} />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          ))}
        </Preview>
      </Section>

      <Section title="Usage">
        <Code>{`import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem,
  PaginationLink, PaginationNext, PaginationPrevious, paginationRange } from "@/components/ui/pagination"

<Pagination>
  <PaginationContent>
    <PaginationItem>
      <PaginationPrevious href="?page=\${page - 1}" aria-disabled={page === 1} />
    </PaginationItem>
    {paginationRange(page, pageCount).map((p, i) =>
      p === "ellipsis" ? (
        <PaginationItem key={i}><PaginationEllipsis /></PaginationItem>
      ) : (
        <PaginationItem key={p}>
          <PaginationLink href={\`?page=\${p}\`} isActive={p === page}>{p}</PaginationLink>
        </PaginationItem>
      )
    )}
    <PaginationItem>
      <PaginationNext href="?page=\${page + 1}" aria-disabled={page === pageCount} />
    </PaginationItem>
  </PaginationContent>
</Pagination>`}</Code>
      </Section>

      <Section title="Props">
        <PropsTable
          rows={[
            ["Pagination", "nav props", "", 'Labelled "pagination"'],
            ["PaginationLink", "a props, isActive, size, asChild", "", "isActive sets aria-current=\"page\" and moves the inverse pill to it with a spring"],
            ["size", '"sm" | "default" | "lg" | "icon"', '"default"', "Round target; icon is the icon-only size"],
            ["PaginationPrevious / PaginationNext", "a props", "", "Chevron and label; the label hides below sm"],
            ["PaginationEllipsis", "span props", "", "Skipped pages; announced as More pages"],
            ["paginationRange(page, pageCount, siblings)", "(number | \"ellipsis\")[]", "siblings = 1", "Pages to render, first and last always shown"],
          ]}
        />
      </Section>
    </>
  )
}
