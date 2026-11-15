"use client"

import * as React from "react"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type Column,
  type ColumnDef,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
  type Table as TanstackTable,
  type VisibilityState,
} from "@tanstack/react-table"

import { cn } from "@/lib/utils"
import { Button } from "@/registry/nelumbo/ui/button"
import { Checkbox } from "@/registry/nelumbo/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/registry/nelumbo/ui/dropdown-menu"
import { Icon, type IconName } from "@/registry/nelumbo/ui/icon"
import { IconButton } from "@/registry/nelumbo/ui/icon-button"
import { Input } from "@/registry/nelumbo/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/registry/nelumbo/ui/select"
import { Skeleton } from "@/registry/nelumbo/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/registry/nelumbo/ui/table"

/**
 * Nelumbo Data Table (built on @tanstack/react-table v8)
 *
 *   const columns: ColumnDef<Person>[] = [
 *     { accessorKey: "name", header: ({ column }) => <DataTableColumnHeader column={column} title="Name" /> },
 *     { accessorKey: "role", header: "Role", enableSorting: false },
 *     {
 *       accessorKey: "amount",
 *       header: ({ column }) => <DataTableColumnHeader column={column} title="Amount" />,
 *       meta: { align: "end" },
 *       cell: ({ row }) => <span className="tabular-nums">{fmt(row.getValue("amount"))}</span>,
 *     },
 *   ]
 *
 *   <DataTable
 *     columns={columns}
 *     data={people}
 *     selectable
 *     getRowLabel={(p) => p.name}
 *     bulkActions={({ rows }) => <Button size="sm" variant="ghost">Delete {rows.length}</Button>}
 *   />
 *
 * Out of the box: sortable headers (a button with an arrow; the header cell
 * carries aria-sort), row selection with a tri-state select-all, a search
 * field, a column menu, a selection bar with a slot for bulk actions,
 * pagination with rows per page, an empty state and skeleton rows while
 * `loading`. Turn parts off with `search={false}`, `columnMenu={false}`,
 * `selectable={false}` or `pagination={false}`.
 *
 * Column `meta` (typed below): `align` ("start" | "center" | "end") for a
 * column and its header, `label` for the column menu, `className` and
 * `headerClassName` for its cells.
 *
 * The state lives inside. For anything more (server-side paging, filters per
 * column) build on `useReactTable` yourself and reuse DataTableColumnHeader,
 * DataTablePagination, DataTableViewOptions and the Table parts.
 */

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData, TValue> {
    align?: "start" | "center" | "end"
    /** Name in the column menu; falls back to a string header, then the id. */
    label?: string
    className?: string
    headerClassName?: string
  }
}

const ALIGN = { start: "text-start", center: "text-center", end: "text-end" } as const

/** A column header with a sort button. Pass it from the column's `header`. */
function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: {
  column: Column<TData, TValue>
  title: string
  className?: string
}) {
  const align = column.columnDef.meta?.align ?? "start"
  if (!column.getCanSort()) {
    return <span className={className}>{title}</span>
  }
  const sorted = column.getIsSorted()
  return (
    <button
      type="button"
      data-slot="data-table-sort"
      onClick={column.getToggleSortingHandler()}
      className={cn(
        "state-layer group/sort inline-flex h-8 cursor-pointer items-center gap-1 rounded-full px-3 type-label-md whitespace-nowrap select-none",
        align === "end" ? "-me-3 flex-row-reverse" : align === "center" ? "" : "-ms-3",
        sorted ? "text-foreground" : "text-muted-foreground",
        "outline-none focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-ring",
        className
      )}
    >
      {title}
      <Icon
        name="arrow_upward"
        weight={500}
        className={cn(
          "[--icon-size:16px] [--icon-opsz:20] transition-[rotate,opacity] duration-200 ease-(--ease-standard) motion-reduce:transition-none",
          sorted === "desc" && "rotate-180",
          sorted ? "opacity-100" : "opacity-0 group-hover/sort:opacity-50 group-focus-visible/sort:opacity-50"
        )}
      />
    </button>
  )
}

/** A leading checkbox column: select-all in the header (indeterminate when some are selected), one per row. */
function selectColumn<TData>(getRowLabel?: (row: TData) => string): ColumnDef<TData> {
  return {
    id: "select",
    enableSorting: false,
    enableHiding: false,
    header: ({ table }) => (
      <Checkbox
        aria-label="Select all"
        checked={table.getIsAllPageRowsSelected() ? true : table.getIsSomePageRowsSelected() ? "indeterminate" : false}
        onCheckedChange={(v) => table.toggleAllPageRowsSelected(v === true)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        aria-label={getRowLabel ? `Select row ${getRowLabel(row.original)}` : "Select row"}
        checked={row.getIsSelected()}
        disabled={!row.getCanSelect()}
        onCheckedChange={(v) => row.toggleSelected(v === true)}
      />
    ),
  }
}

function columnLabel<TData>(column: Column<TData, unknown>) {
  const header = column.columnDef.header
  return column.columnDef.meta?.label ?? (typeof header === "string" ? header : column.id)
}

/** A "Columns" button with a menu of checkbox items to show and hide columns. */
function DataTableViewOptions<TData>({ table, label = "Columns" }: { table: TanstackTable<TData>; label?: string }) {
  const columns = table.getAllColumns().filter((c) => c.getCanHide())
  if (!columns.length) return null
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="shrink-0">
          <Icon name="view_column" />
          {label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel className="px-3 pt-2 pb-1.5 type-label-md text-muted-foreground">Show columns</DropdownMenuLabel>
        {columns.map((column) => (
          <DropdownMenuCheckboxItem
            key={column.id}
            checked={column.getIsVisible()}
            onCheckedChange={(v) => column.toggleVisibility(v === true)}
            // keep the menu open so several columns can be toggled
            onSelect={(e) => e.preventDefault()}
          >
            {columnLabel(column)}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/** Rows per page, a range label ("1–10 of 48") and previous and next buttons. */
function DataTablePagination<TData>({
  table,
  pageSizeOptions = [5, 10, 20, 50],
  className,
}: {
  table: TanstackTable<TData>
  pageSizeOptions?: number[]
  className?: string
}) {
  const { pageIndex, pageSize } = table.getState().pagination
  const total = table.getFilteredRowModel().rows.length
  const from = total === 0 ? 0 : pageIndex * pageSize + 1
  const to = Math.min(total, (pageIndex + 1) * pageSize)
  return (
    <div data-slot="data-table-pagination" className={cn("flex flex-wrap items-center justify-end gap-x-6 gap-y-2 type-body-sm text-muted-foreground", className)}>
      <div className="flex items-center gap-3">
        <span>Rows per page</span>
        <Select value={String(pageSize)} onValueChange={(v) => table.setPageSize(Number(v))}>
          <SelectTrigger size="xs" aria-label="Rows per page" className="w-24">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {pageSizeOptions.map((n) => (
              <SelectItem key={n} value={String(n)}>
                {n}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-1">
        <span aria-live="polite" className="min-w-24 px-2 text-center tabular-nums">
          {total === 0 ? "0 results" : `${from}–${to} of ${total}`}
        </span>
        <IconButton icon="chevron_left" label="Previous page" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} />
        <IconButton icon="chevron_right" label="Next page" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} />
      </div>
    </div>
  )
}

type BulkContext<TData> = { rows: TData[]; table: TanstackTable<TData>; clear: () => void }

type DataTableProps<TData, TValue = unknown> = {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  /** Stable id per row, so selection survives sorting and new data. Defaults to the index. */
  getRowId?: (row: TData, index: number) => string
  /** Add a checkbox column and row selection. */
  selectable?: boolean
  /** Names a row for its checkbox: "Select row Maya Kowalski". */
  getRowLabel?: (row: TData) => string
  onSelectionChange?: (rows: TData[]) => void
  /** Shown in the selection bar while rows are selected. */
  bulkActions?: (context: BulkContext<TData>) => React.ReactNode
  /** Search field over every column. `false` hides it. */
  search?: boolean
  searchPlaceholder?: string
  /** "Columns" menu to show and hide columns. `false` hides it. */
  columnMenu?: boolean
  /** Extra toolbar content, after the search field. */
  toolbar?: React.ReactNode
  /** `false` shows every row without a footer. */
  pagination?: boolean
  pageSize?: number
  pageSizeOptions?: number[]
  initialSorting?: SortingState
  initialColumnVisibility?: VisibilityState
  loading?: boolean
  /** Replaces the default empty state. */
  emptyState?: React.ReactNode
  density?: "comfortable" | "compact"
  stickyHeader?: boolean
  /** Names the table for screen readers. */
  "aria-label"?: string
  className?: string
  containerClassName?: string
}

function DataTable<TData, TValue = unknown>({
  columns,
  data,
  getRowId,
  selectable = false,
  getRowLabel,
  onSelectionChange,
  bulkActions,
  search = true,
  searchPlaceholder = "Search",
  columnMenu = true,
  toolbar,
  pagination: paginate = true,
  pageSize = 10,
  pageSizeOptions,
  initialSorting = [],
  initialColumnVisibility = {},
  loading = false,
  emptyState,
  density = "comfortable",
  stickyHeader,
  "aria-label": ariaLabel,
  className,
  containerClassName,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>(initialSorting)
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({})
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>(initialColumnVisibility)
  const [globalFilter, setGlobalFilter] = React.useState("")
  const [pageState, setPageState] = React.useState<PaginationState>({ pageIndex: 0, pageSize })

  const allColumns = React.useMemo(
    () => (selectable ? [selectColumn<TData>(getRowLabel) as ColumnDef<TData, TValue>, ...columns] : columns),
    [selectable, getRowLabel, columns]
  )

  const table = useReactTable({
    data,
    columns: allColumns,
    getRowId,
    state: { sorting, rowSelection, columnVisibility, globalFilter, ...(paginate ? { pagination: pageState } : {}) },
    enableRowSelection: selectable,
    sortDescFirst: false,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPageState,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    ...(paginate ? { getPaginationRowModel: getPaginationRowModel() } : {}),
  })

  const selected = table.getFilteredSelectedRowModel().rows.map((r) => r.original)
  const count = selected.length
  const onSelectionRef = React.useRef(onSelectionChange)
  React.useEffect(() => {
    onSelectionRef.current = onSelectionChange
  })
  const firstRun = React.useRef(true)
  React.useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false
      return
    }
    onSelectionRef.current?.(table.getFilteredSelectedRowModel().rows.map((r) => r.original))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowSelection, globalFilter])

  const rows = table.getRowModel().rows
  const visibleColumns = table.getVisibleLeafColumns().length
  const showSearch = search
  const showMenu = columnMenu && table.getAllColumns().some((c) => c.getCanHide())
  const showToolbar = showSearch || showMenu || Boolean(toolbar)
  const selecting = selectable && count > 0

  return (
    <div data-slot="data-table" className={cn("flex w-full min-w-0 flex-col gap-3", className)}>
      {/* announces selection and loading without moving focus */}
      <div role="status" className="sr-only">
        {loading ? "Loading" : selectable && count > 0 ? `${count} of ${table.getFilteredRowModel().rows.length} rows selected` : ""}
      </div>

      {(showToolbar || selectable) && (
        <div data-slot="data-table-toolbar" className="flex min-h-12 flex-wrap items-center gap-2">
          {selecting ? (
            <div
              data-slot="data-table-selection"
              className="flex min-h-12 w-full items-center gap-2 rounded-full bg-secondary ps-2 pe-3 text-secondary-foreground animate-in fade-in-0 duration-200 motion-reduce:animate-none"
            >
              <IconButton icon="close" label="Clear selection" size="sm" onClick={() => table.resetRowSelection()} />
              <span className="me-auto type-label-lg tabular-nums">{count} selected</span>
              {bulkActions?.({ rows: selected, table, clear: () => table.resetRowSelection() })}
            </div>
          ) : (
            <>
              {showSearch && (
                <Input
                  size="xs"
                  type="search"
                  icon="search"
                  aria-label={searchPlaceholder}
                  placeholder={searchPlaceholder}
                  value={globalFilter}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  className="max-w-sm min-w-0 flex-1 basis-56"
                  trailing={
                    globalFilter ? (
                      <IconButton icon="close" label="Clear search" size="xs" onClick={() => setGlobalFilter("")} />
                    ) : undefined
                  }
                />
              )}
              <div className="ms-auto flex items-center gap-2">
                {toolbar}
                {showMenu && <DataTableViewOptions table={table} />}
              </div>
            </>
          )}
        </div>
      )}

      <Table
        density={density}
        stickyHeader={stickyHeader}
        aria-label={ariaLabel}
        aria-busy={loading || undefined}
        className="min-w-max"
        containerClassName={containerClassName}
      >
        <TableHeader>
          {table.getHeaderGroups().map((group) => (
            <TableRow key={group.id}>
              {group.headers.map((header) => {
                const meta = header.column.columnDef.meta
                const canSort = header.column.getCanSort()
                const sorted = header.column.getIsSorted()
                return (
                  <TableHead
                    key={header.id}
                    colSpan={header.colSpan}
                    aria-sort={canSort ? (sorted === "asc" ? "ascending" : sorted === "desc" ? "descending" : "none") : undefined}
                    className={cn(ALIGN[meta?.align ?? "start"], meta?.headerClassName)}
                  >
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {loading ? (
            Array.from({ length: paginate ? Math.min(pageState.pageSize, 10) : 5 }, (_, i) => (
              <TableRow key={i} aria-hidden>
                {table.getVisibleLeafColumns().map((column, j) => (
                  <TableCell key={column.id} className={ALIGN[column.columnDef.meta?.align ?? "start"]}>
                    {column.id === "select" ? (
                      <Skeleton className="size-[18px] rounded-control" />
                    ) : (
                      <Skeleton
                        className={cn("h-4", column.columnDef.meta?.align === "end" && "ms-auto")}
                        style={{ width: `${56 + ((i * 7 + j * 13) % 5) * 9}%`, maxWidth: "12rem" }}
                      />
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : rows.length ? (
            rows.map((row) => (
              <TableRow key={row.id} data-state={row.getIsSelected() ? "selected" : undefined}>
                {row.getVisibleCells().map((cell) => {
                  const meta = cell.column.columnDef.meta
                  return (
                    <TableCell key={cell.id} className={cn("whitespace-nowrap", ALIGN[meta?.align ?? "start"], meta?.className)}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  )
                })}
              </TableRow>
            ))
          ) : (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={visibleColumns || 1} className="p-0!">
                {emptyState ?? <DataTableEmpty filtered={globalFilter !== ""} query={globalFilter} />}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {paginate && <DataTablePagination table={table} pageSizeOptions={pageSizeOptions} />}
    </div>
  )
}

/** The default empty state; also useful for your own `emptyState`. */
function DataTableEmpty({
  icon,
  title,
  description,
  filtered,
  query,
}: {
  icon?: IconName
  title?: string
  description?: string
  filtered?: boolean
  query?: string
}) {
  return (
    <div data-slot="data-table-empty" className="sticky start-0 flex w-[100cqw] max-w-full flex-col items-center gap-3 px-6 py-14 text-center">
      <span className="grid size-14 place-items-center rounded-full bg-surface-container-high text-muted-foreground [--icon-size:28px] [--icon-opsz:28]">
        <Icon name={icon ?? (filtered ? "search_off" : "inbox")} />
      </span>
      <div className="flex flex-col gap-1">
        <p className="type-title-sm text-foreground">{title ?? (filtered ? "No results" : "Nothing here yet")}</p>
        <p className="type-body-md text-muted-foreground">
          {description ?? (filtered ? `Nothing matches “${query}”. Try a different word.` : "There are no rows to show.")}
        </p>
      </div>
    </div>
  )
}

export {
  DataTable,
  DataTableColumnHeader,
  DataTableEmpty,
  DataTablePagination,
  DataTableViewOptions,
  selectColumn,
  type DataTableProps,
}
