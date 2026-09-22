import { useState } from 'react'
import * as XLSX from 'xlsx'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { assetsService } from '@/services/assets.service'
import { departmentsService } from '@/services/departments.service'
import { ASSET_CONDITIONS } from '@/types/enums'

const systemFields = [
  'Department',
  'Building',
  'Floor',
  'Sub-Department',
  'Room',
  'Asset Type',
  'Asset Name',
  'Serial Number',
  'Model Number',
  'Condition',
  'Label Attached',
  'Remarks',
] as const

type SystemField = (typeof systemFields)[number]

interface ParsedRow {
  raw: Record<string, string>
  valid: boolean
  errors: string[]
}

export function ImportAssetsPage() {
  const queryClient = useQueryClient()
  const [rows, setRows] = useState<ParsedRow[]>([])
  const [columns, setColumns] = useState<string[]>([])
  const [mapping, setMapping] = useState<Record<string, SystemField | ''>>({})

  const onFile = async (file: File) => {
    const buffer = await file.arrayBuffer()
    const wb = XLSX.read(buffer)
    const sheet = wb.Sheets[wb.SheetNames[0]]
    const json = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, { defval: '' })
    const cols = json.length ? Object.keys(json[0]) : []
    setColumns(cols)
    const auto: Record<string, SystemField | ''> = {}
    cols.forEach((c) => {
      const lower = c.toLowerCase()
      if (lower.includes('department')) auto[c] = 'Department'
      else if (lower.includes('building')) auto[c] = 'Building'
      else if (lower.includes('floor')) auto[c] = 'Floor'
      else if (lower.includes('room')) auto[c] = 'Room'
      else if (lower.includes('item') || lower.includes('name')) auto[c] = 'Asset Name'
      else if (lower.includes('serial')) auto[c] = 'Serial Number'
      else if (lower.includes('model')) auto[c] = 'Model Number'
      else if (lower.includes('condition')) auto[c] = 'Condition'
      else auto[c] = ''
    })
    setMapping(auto)
    setRows(
      json.map((raw) => {
        const errors: string[] = []
        if (!raw[cols.find((c) => auto[c] === 'Department') ?? '']) errors.push('missing department')
        const condCol = cols.find((c) => auto[c] === 'Condition')
        if (condCol && raw[condCol] && !ASSET_CONDITIONS.includes(raw[condCol] as (typeof ASSET_CONDITIONS)[number]))
          errors.push('invalid condition')
        return { raw, valid: errors.length === 0, errors }
      }),
    )
  }

  const validCount = rows.filter((r) => r.valid).length
  const invalidCount = rows.length - validCount

  const importMutation = useMutation({
    mutationFn: async () => {
      const depts = await departmentsService.getDepartments()
      const categories = await assetsService.getCategories()
      const defaultDept = depts[0]?.id ?? ''
      const defaultCat = categories[0]?.id ?? ''
      for (const row of rows.filter((r) => r.valid)) {
        const get = (field: SystemField) => {
          const col = Object.entries(mapping).find(([, v]) => v === field)?.[0]
          return col ? String(row.raw[col] ?? '') : ''
        }
        await assetsService.create({
          name: get('Asset Name') || 'Imported Asset',
          categoryId: defaultCat,
          departmentId: defaultDept,
          condition: (ASSET_CONDITIONS.includes(get('Condition') as (typeof ASSET_CONDITIONS)[number])
            ? get('Condition')
            : 'Good') as (typeof ASSET_CONDITIONS)[number],
          status: 'Active',
          labelAttached: get('Label Attached').toLowerCase() === 'yes',
          qaChecked: false,
          serialNumber: get('Serial Number'),
          modelNumber: get('Model Number'),
          remarks: get('Remarks'),
        })
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] })
      toast.success(`Imported ${validCount} valid records`)
      setRows([])
    },
  })

  return (
    <div className="space-y-6">
      <PageHeader title="Import Assets" description="Upload Excel or CSV and map columns before importing valid rows only" />
      <Card>
        <CardHeader><CardTitle>Upload Excel File</CardTitle></CardHeader>
        <CardContent>
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed bg-muted/20 px-6 py-16 text-center">
            <p className="font-medium">Drag & drop or click to upload</p>
            <p className="mt-1 text-sm text-muted-foreground">Supported: .xlsx, .csv</p>
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) void onFile(f)
              }}
            />
          </label>
        </CardContent>
      </Card>

      {rows.length ? (
        <>
          <Card>
            <CardHeader><CardTitle>Column Mapping</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {columns.map((col) => (
                <div key={col} className="grid grid-cols-2 items-center gap-3 text-sm">
                  <span>{col}</span>
                  <Select
                    value={mapping[col] ?? ''}
                    onValueChange={(v) => setMapping((m) => ({ ...m, [col]: v as SystemField | '' }))}
                  >
                    <SelectTrigger><SelectValue placeholder="System field" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">— Skip —</SelectItem>
                      {systemFields.map((f) => (
                        <SelectItem key={f} value={f}>{f}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Validation</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>{rows.length.toLocaleString()} rows detected</p>
              <p className="text-emerald-700">✓ {validCount.toLocaleString()} valid</p>
              {invalidCount ? <p className="text-amber-700">⚠ {invalidCount} rows with issues (will not import)</p> : null}
              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setRows([])}>Cancel</Button>
                <Button onClick={() => importMutation.mutate()} disabled={!validCount || importMutation.isPending}>
                  Import Valid Records
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  )
}
