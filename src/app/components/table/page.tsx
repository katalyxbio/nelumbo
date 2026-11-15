"use client"

import * as React from "react"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/registry/velvet/ui/table"
import { Badge } from "@/registry/velvet/ui/badge"
import { Code, PageHeader, Preview, PropsTable, Section } from "@/components/docs/primitives"

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" })

const INVOICES = [
  { id: "INV-2041", client: "Northwind Studio", status: "Paid", method: "Card", amount: 2450 },
  { id: "INV-2042", client: "Fernhill Coffee", status: "Pending", method: "Bank transfer", amount: 380.5 },
  { id: "INV-2043", client: "Lumen Architects", status: "Paid", method: "Card", amount: 12900 },
  { id: "INV-2044", client: "Okafor and Daughters", status: "Overdue", method: "Bank transfer", amount: 1175.25 },
  { id: "INV-2045", client: "Tidewater Books", status: "Paid", method: "PayPal", amount: 640 },
  { id: "INV-2046", client: "Paper Moon Press", status: "Pending", method: "Card", amount: 89.99 },
]

const STATUS = { Paid: "success", Pending: "warning", Overdue: "destructive" } as const
const total = INVOICES.reduce((sum, i) => sum + i.amount, 0)

function InvoiceTable({ density, selected, sticky }: { density?: "comfortable" | "compact"; selected?: string; sticky?: boolean }) {
  return (
    <Table density={density} stickyHeader={sticky} containerClassName={sticky ? "max-h-64" : undefined}>
      <TableCaption>Invoices issued in May.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Invoice</TableHead>
          <TableHead>Client</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Method</TableHead>
          <TableHead className="text-end">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {INVOICES.map((i) => (
          <TableRow key={i.id} data-state={i.id === selected ? "selected" : undefined}>
            <TableCell className="font-medium whitespace-nowrap">{i.id}</TableCell>
            <TableCell className="whitespace-nowrap">{i.client}</TableCell>
            <TableCell>
              <Badge size="sm" variant={STATUS[i.status as keyof typeof STATUS]}>{i.status}</Badge>
            </TableCell>
            <TableCell className="whitespace-nowrap text-muted-foreground">{i.method}</TableCell>
            <TableCell className="text-end tabular-nums">{money.format(i.amount)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={4}>Total</TableCell>
          <TableCell className="text-end tabular-nums">{money.format(total)}</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  )
}

export default function TablePage() {
  return (
    <>
      <PageHeader eyebrow="Component · 35" title="Table">
        Rows and columns for comparing things. The same parts as shadcn&apos;s Table in a rounded, soft-headed
        container that scrolls sideways on small screens. For sorting, search, selection and paging, see Data Table.
      </PageHeader>

      <Section title="Install">
        <Code>{`npx shadcn@latest add @velvet/table`}</Code>
      </Section>

      <Section
        title="Invoices"
        description="A header surface and faint row dividers do the work of borders. Rows light up on hover, and the selected row is filled in (data-state=&quot;selected&quot;). Numbers are right-aligned with tabular figures."
      >
        <Preview className="block">
          <InvoiceTable selected="INV-2043" />
        </Preview>
      </Section>

      <Section title="Compact" description='density="compact" tightens rows from 56px to 40px, for tables that carry a lot of data.'>
        <Preview className="block">
          <InvoiceTable density="compact" />
        </Preview>
      </Section>

      <Section
        title="Sticky header"
        description="stickyHeader keeps the header in view while the body scrolls. Give the container a height with containerClassName."
      >
        <Preview className="block">
          <InvoiceTable sticky />
        </Preview>
      </Section>

      <Section title="Usage">
        <Code>{`import {
  Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"

<Table density="compact">
  <TableCaption>Invoices issued in May.</TableCaption>
  <TableHeader>
    <TableRow>
      <TableHead>Invoice</TableHead>
      <TableHead className="text-end">Amount</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {invoices.map((i) => (
      <TableRow key={i.id} data-state={i.id === selected ? "selected" : undefined}>
        <TableCell className="font-medium">{i.id}</TableCell>
        <TableCell className="text-end tabular-nums">{money.format(i.amount)}</TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>`}</Code>
      </Section>

      <Section title="Accessibility">
        <p className="max-w-2xl type-body-md text-muted-foreground">
          Real table elements, so screen readers announce rows and columns. Use TableCaption (or aria-label) to name
          the table. While the table overflows its container, the container can take focus, so keyboard users can scroll
          it with the arrow keys. For sortable columns, set aria-sort on the TableHead; Data Table does this for you.
        </p>
      </Section>

      <Section title="Props">
        <PropsTable
          rows={[
            ["Table density", '"comfortable" | "compact"', '"comfortable"', "Row height: 56px or 40px"],
            ["Table stickyHeader", "boolean", "false", "Header stays while the body scrolls; needs a container height"],
            ["Table containerClassName", "string", "", "Classes for the scroll container, such as max-h-96"],
            ["Table className", "string", "", "Classes for the <table>, such as min-w-max"],
            ["TableRow data-state", '"selected"', "", "Fills the row"],
            ["TableHead / TableCell", "th / td props", "", "Padding follows the density; checkbox cells narrow themselves"],
            ["TableHeader, TableBody, TableFooter, TableCaption", "", "", "As in shadcn"],
          ]}
        />
      </Section>
    </>
  )
}
