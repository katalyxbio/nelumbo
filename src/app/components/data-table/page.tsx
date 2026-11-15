"use client"

import * as React from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTable, DataTableColumnHeader } from "@/registry/velvet/ui/data-table"
import { Avatar } from "@/registry/velvet/ui/avatar"
import { Badge } from "@/registry/velvet/ui/badge"
import { Button } from "@/registry/velvet/ui/button"
import { Icon } from "@/registry/velvet/ui/icon"
import { IconButton } from "@/registry/velvet/ui/icon-button"
import { Switch } from "@/registry/velvet/ui/switch"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/registry/velvet/ui/dropdown-menu"
import { PEOPLE } from "@/components/docs/people"
import { Code, PageHeader, Preview, PropsTable, Section } from "@/components/docs/primitives"

type Status = "Active" | "Invited" | "Suspended"
type Member = { id: string; name: string; email: string; src?: string; role: string; status: Status; amount: number; joined: string }

const FIRST = ["Maya", "Kenji", "Léa", "Omar", "Sofía", "Tomás", "Aisha", "Ravi", "Noor", "Elif", "Jonas", "Priya", "Mateo", "Ingrid", "Chidi", "Hana"]
const LAST = ["Kowalski", "Watanabe", "Martin", "Haddad", "Ramírez", "Novák", "Bello", "Iyer", "Okafor", "Lindqvist", "Fischer", "Nair"]
const ROLES = ["Designer", "Engineer", "Researcher", "Product manager", "Writer", "Analyst"]
const STATUSES: Status[] = ["Active", "Active", "Active", "Invited", "Active", "Suspended"]

// Deterministic sample data, so server and client render the same thing.
const MEMBERS: Member[] = Array.from({ length: 48 }, (_, i) => {
  const first = FIRST[i % FIRST.length]
  const last = LAST[(i * 5 + Math.floor(i / 4)) % LAST.length]
  const p = i < PEOPLE.length ? PEOPLE[i] : undefined
  const name = p?.name ?? `${first} ${last}`
  const month = ((i * 7) % 12) + 1
  const day = ((i * 11) % 27) + 1
  return {
    id: `u${i + 1}`,
    name,
    email: `${name.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z]+/g, ".")}@velvet.test`,
    src: p?.src,
    role: p ? (["Designer", "Engineer", "Engineer", "Engineer", "Engineer", "Researcher", "Writer", "Analyst"][i] ?? ROLES[i % 6]) : ROLES[(i * 3) % ROLES.length],
    status: STATUSES[(i * 5) % STATUSES.length],
    amount: Math.round((((i * 7919) % 9000) + 250 + (i % 7) * 0.37) * 100) / 100,
    joined: `2025-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
  }
})

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" })
const dateFmt = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })
const norm = (s: string) => s.replace(/[  ]/g, " ")
const fmtDate = (iso: string) => norm(dateFmt.format(new Date(iso + "T00:00:00Z")))

const STATUS_VARIANT = { Active: "success", Invited: "warning", Suspended: "destructive" } as const

function buildColumns(onRemove: (m: Member) => void): ColumnDef<Member>[] {
  return [
    {
      accessorKey: "name",
      meta: { label: "Name" },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar size="sm" src={row.original.src} name={row.original.name} color="auto" />
          <span className="font-medium">{row.original.name}</span>
        </div>
      ),
    },
    {
      accessorKey: "email",
      meta: { label: "Email", className: "text-muted-foreground" },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
    },
    {
      accessorKey: "role",
      meta: { label: "Role" },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Role" />,
    },
    {
      accessorKey: "status",
      meta: { label: "Status" },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
      cell: ({ row }) => (
        <Badge size="sm" variant={STATUS_VARIANT[row.original.status]} dot>
          {row.original.status}
        </Badge>
      ),
    },
    {
      accessorKey: "joined",
      meta: { label: "Joined" },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Joined" />,
      cell: ({ row }) => <span className="text-muted-foreground">{fmtDate(row.original.joined)}</span>,
    },
    {
      accessorKey: "amount",
      meta: { label: "Amount", align: "end" },
      header: ({ column }) => <DataTableColumnHeader column={column} title="Amount" />,
      cell: ({ row }) => <span className="tabular-nums">{money.format(row.original.amount)}</span>,
    },
    {
      id: "actions",
      enableHiding: false,
      meta: { align: "end", headerClassName: "w-14" },
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <IconButton icon="more_horiz" label={`Actions for ${row.original.name}`} size="sm" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => navigator.clipboard?.writeText(row.original.email)}>
              <Icon name="content_copy" /> Copy email
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Icon name="edit" /> Edit member
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onSelect={() => onRemove(row.original)}>
              <Icon name="delete" /> Remove
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]
}

export default function DataTablePage() {
  const [data, setData] = React.useState(MEMBERS)
  const [loading, setLoading] = React.useState(false)
  const [compact, setCompact] = React.useState(false)
  const columns = React.useMemo(() => buildColumns((m) => setData((d) => d.filter((x) => x.id !== m.id))), [])

  return (
    <>
      <PageHeader eyebrow="Component · 36" title="Data Table">
        A table you can use as it is, built on TanStack Table: sortable columns, row selection, search, a column
        menu, pagination, and loading and empty states. Define columns the way shadcn&apos;s data table examples do.
      </PageHeader>

      <Section title="Install">
        <Code>{`npx shadcn@latest add @velvet/data-table`}</Code>
      </Section>

      <Section
        title="Team"
        description="Click a header to sort (again to reverse, once more to clear). Tick rows to get the selection bar; the select-all box shows a dash when only some of the page is selected. Search nonsense such as “zzz” to see the empty state, and use the switches to try loading and compact rows."
      >
        <div className="flex flex-wrap items-center gap-6">
          <label className="flex items-center gap-3 type-label-lg">
            <Switch checked={loading} onCheckedChange={setLoading} /> Loading
          </label>
          <label className="flex items-center gap-3 type-label-lg">
            <Switch checked={compact} onCheckedChange={setCompact} /> Compact rows
          </label>
          <Button variant="outline" size="sm" onClick={() => setData(MEMBERS)}>
            <Icon name="restart_alt" /> Reset data
          </Button>
        </div>
        <Preview className="block p-3 sm:p-6">
          <DataTable
            aria-label="Team members"
            columns={columns}
            data={data}
            getRowId={(m) => m.id}
            selectable
            getRowLabel={(m) => m.name}
            searchPlaceholder="Search people"
            loading={loading}
            density={compact ? "compact" : "comfortable"}
            initialColumnVisibility={{ joined: false }}
            bulkActions={({ rows, clear }) => (
              <>
                <Button size="sm" variant="ghost">
                  <Icon name="mail" /> Email
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    const ids = new Set(rows.map((r) => r.id))
                    setData((d) => d.filter((x) => !ids.has(x.id)))
                    clear()
                  }}
                >
                  <Icon name="delete" /> Remove
                </Button>
              </>
            )}
          />
        </Preview>
      </Section>

      <Section title="Empty" description="With no rows, the table shows an empty state. Pass emptyState for your own.">
        <Preview className="block p-3 sm:p-6">
          <DataTable aria-label="Empty example" columns={columns.slice(0, 4)} data={[]} search={false} columnMenu={false} pagination={false} />
        </Preview>
      </Section>

      <Section title="Usage">
        <Code>{`import type { ColumnDef } from "@tanstack/react-table"
import { DataTable, DataTableColumnHeader } from "@/components/ui/data-table"

type Member = { id: string; name: string; email: string; amount: number }

const columns: ColumnDef<Member>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
  },
  { accessorKey: "email", header: "Email", enableSorting: false },
  {
    accessorKey: "amount",
    meta: { align: "end" },
    header: ({ column }) => <DataTableColumnHeader column={column} title="Amount" />,
    cell: ({ row }) => <span className="tabular-nums">{money.format(row.original.amount)}</span>,
  },
]

<DataTable
  aria-label="Team members"
  columns={columns}
  data={members}
  getRowId={(m) => m.id}
  selectable
  getRowLabel={(m) => m.name}
  loading={isLoading}
  bulkActions={({ rows, clear }) => (
    <Button size="sm" variant="ghost" onClick={() => { remove(rows); clear() }}>Remove</Button>
  )}
/>

// Define columns outside the component (or memoize them), like any TanStack table.
// Format numbers and dates with a fixed locale so server and client agree.`}</Code>
      </Section>

      <Section title="Props">
        <PropsTable
          rows={[
            ["columns", "ColumnDef<TData>[]", "", "TanStack column definitions"],
            ["data", "TData[]", "", ""],
            ["getRowId", "(row, index) => string", "index", "Stable ids keep selection through sorting and new data"],
            ["selectable / getRowLabel", "boolean / (row) => string", "false", "Checkbox column; getRowLabel names each box"],
            ["onSelectionChange", "(rows) => void", "", "Selected rows that match the search"],
            ["bulkActions", "({ rows, table, clear }) => ReactNode", "", "Buttons shown in the selection bar"],
            ["search / searchPlaceholder", "boolean / string", "true / \"Search\"", "Global filter over every column"],
            ["columnMenu", "boolean", "true", "The Columns menu"],
            ["toolbar", "ReactNode", "", "Extra toolbar content, before the Columns menu"],
            ["pagination / pageSize / pageSizeOptions", "boolean / number / number[]", "true / 10 / [5, 10, 20, 50]", ""],
            ["initialSorting / initialColumnVisibility", "SortingState / VisibilityState", "", ""],
            ["loading", "boolean", "false", "Skeleton rows, aria-busy"],
            ["emptyState", "ReactNode", "", "Replaces the default empty state"],
            ["density / stickyHeader", "", '"comfortable" / false', "As Table"],
            ["column meta", "{ align, label, className, headerClassName }", "", "Alignment, menu name and cell classes"],
            ["DataTableColumnHeader", "{ column, title }", "", "Sort button for a header; the cell gets aria-sort"],
            ["DataTablePagination, DataTableViewOptions, selectColumn", "", "", "The parts, for tables you wire up yourself"],
          ]}
        />
      </Section>
    </>
  )
}
