import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type VisibilityState,
} from '@tanstack/react-table'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Download, MoreHorizontal, Printer, SlidersHorizontal } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { AssetConditionBadge, AssetStatusBadge } from '@/components/assets/AssetStatusBadge'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useLookupMaps } from '@/hooks/useLookupMaps'
import { formatDate } from '@/lib/utils'
import { assetsService, type AssetFilters } from '@/services/assets.service'
import { reportsService } from '@/services/reports.service'
import type { Asset } from '@/types/entities'
import { ASSET_CONDITIONS, ASSET_STATUSES } from '@/types/enums'

export function AssetsPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const lookup = useLookupMaps()
  const [sorting, setSorting] = useState<SortingState>([])
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [filters, setFilters] = useState<AssetFilters>({})

  const assetsQuery = useQuery({
    queryKey: ['assets', filters],
    queryFn: () => assetsService.getAll(filters),
  })

  const bulkMutation = useMutation({
    mutationFn: async ({ ids, patch }: { ids: string[]; patch: Partial<Asset> }) => {
      await assetsService.bulkUpdate(ids, patch)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] })
      toast.success('Bulk update completed')
      setRowSelection({})
    },
  })

  const columns = useMemo<ColumnDef<Asset>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected() ? true : table.getIsSomePageRowsSelected() ? 'indeterminate' : false}
            onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
          />
        ),
        cell: ({ row }) => (
          <Checkbox checked={row.getIsSelected()} onCheckedChange={(v) => row.toggleSelected(!!v)} />
        ),
      },
      { accessorKey: 'assetTag', header: 'Asset Tag', cell: ({ row }) => <span className="font-mono text-xs">{row.original.assetTag}</span> },
      { accessorKey: 'name', header: 'Asset Name', cell: ({ row }) => <Link className="font-medium hover:underline" to={`/assets/${row.original.id}`}>{row.original.name}</Link> },
      { id: 'category', header: 'Category', cell: ({ row }) => lookup.categoryMap.get(row.original.categoryId) ?? '—' },
      { id: 'department', header: 'Department', cell: ({ row }) => lookup.departmentMap.get(row.original.departmentId) ?? '—' },
      { id: 'building', header: 'Building', cell: ({ row }) => (row.original.buildingId ? lookup.buildingMap.get(row.original.buildingId) : '—') },
      { id: 'room', header: 'Room', cell: ({ row }) => (row.original.roomId ? lookup.roomMap.get(row.original.roomId) : '—') },
      { accessorKey: 'serialNumber', header: 'Serial Number' },
      { accessorKey: 'modelNumber', header: 'Model' },
      { accessorKey: 'condition', header: 'Condition', cell: ({ row }) => <AssetConditionBadge condition={row.original.condition} /> },
      { accessorKey: 'status', header: 'Status', cell: ({ row }) => <AssetStatusBadge status={row.original.status} /> },
      {
        id: 'label',
        header: 'Label',
        cell: ({ row }) => (row.original.labelAttached ? 'Yes' : 'No'),
      },
      {
        id: 'lastVerified',
        header: 'Last Verified',
        cell: ({ row }) => formatDate(row.original.lastVerifiedAt),
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate(`/assets/${row.original.id}`)}>View</DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate(`/assets/${row.original.id}/edit`)}>Edit</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [lookup, navigate],
  )

  const table = useReactTable({
    data: assetsQuery.data ?? [],
    columns,
    state: { sorting, rowSelection, columnVisibility },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  const selectedIds = table.getSelectedRowModel().rows.map((r) => r.original.id)

  const exportSelected = () => {
    const rows = (selectedIds.length ? assetsQuery.data?.filter((a) => selectedIds.includes(a.id)) : assetsQuery.data) ?? []
    reportsService.exportCsv(
      rows.map((a) => ({
        assetTag: a.assetTag,
        name: a.name,
        department: lookup.departmentMap.get(a.departmentId),
        status: a.status,
        condition: a.condition,
      })),
      'assets-export.csv',
    )
  }

  return (
    <div>
      <PageHeader
        title="Assets"
        description="Enterprise asset register with filtering, bulk actions, and export"
        actions={
          <>
            <Button variant="outline" asChild>
              <Link to="/assets/import">Import</Link>
            </Button>
            <Button variant="outline" onClick={exportSelected}>
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button asChild>
              <Link to="/assets/new">Add Assets</Link>
            </Button>
          </>
        }
      />

      <div className="mb-4 flex flex-col gap-3 rounded-xl border bg-card p-4 lg:flex-row lg:flex-wrap lg:items-center">
        <Input
          placeholder="Search name, tag, serial…"
          className="max-w-xs"
          value={filters.search ?? ''}
          onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
        />
        <Select value={filters.departmentId ?? 'all'} onValueChange={(v) => setFilters((f) => ({ ...f, departmentId: v === 'all' ? undefined : v }))}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder="Department" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All departments</SelectItem>
            {lookup.departments.map((d) => (
              <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filters.categoryId ?? 'all'} onValueChange={(v) => setFilters((f) => ({ ...f, categoryId: v === 'all' ? undefined : v }))}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {lookup.categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filters.status ?? 'all'} onValueChange={(v) => setFilters((f) => ({ ...f, status: v === 'all' ? undefined : (v as Asset['status']) }))}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {ASSET_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filters.condition ?? 'all'} onValueChange={(v) => setFilters((f) => ({ ...f, condition: v === 'all' ? undefined : (v as Asset['condition']) }))}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Condition" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All conditions</SelectItem>
            {ASSET_CONDITIONS.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <SlidersHorizontal className="h-4 w-4" />
              Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {table.getAllLeafColumns().filter((c) => c.id !== 'select').map((column) => (
              <DropdownMenuCheckboxItem
                key={column.id}
                checked={column.getIsVisible()}
                onCheckedChange={(v) => column.toggleVisibility(!!v)}
              >
                {column.id}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {selectedIds.length ? (
        <div className="mb-3 flex flex-wrap items-center gap-2 rounded-lg border bg-muted/40 px-3 py-2 text-sm">
          <span>{selectedIds.length} selected</span>
          <Button size="sm" variant="outline" onClick={() => bulkMutation.mutate({ ids: selectedIds, patch: { status: 'In Use' } })}>Assign</Button>
          <Button size="sm" variant="outline" onClick={() => navigate('/transfers')}>Transfer</Button>
          <Button size="sm" variant="outline" onClick={() => bulkMutation.mutate({ ids: selectedIds, patch: { status: 'Active' } })}>Change Status</Button>
          <Button size="sm" variant="outline" onClick={() => bulkMutation.mutate({ ids: selectedIds, patch: { condition: 'Good' } })}>Change Condition</Button>
          <Button size="sm" variant="outline" onClick={exportSelected}>Export</Button>
          <Button size="sm" variant="outline" onClick={() => window.print()}><Printer className="h-4 w-4" />Print</Button>
        </div>
      ) : null}

      <div className="rounded-xl border bg-card">
        {assetsQuery.isLoading || lookup.isLoading ? (
          <div className="space-y-2 p-4">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
        ) : (
          <>
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((hg) => (
                  <TableRow key={hg.id}>
                    {hg.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                      No assets found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <div className="flex items-center justify-between border-t px-4 py-3 text-sm">
              <span className="text-muted-foreground">
                Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Previous</Button>
                <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Next</Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
