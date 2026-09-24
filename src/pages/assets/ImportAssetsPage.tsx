import { useState } from 'react'
import * as XLSX from 'xlsx'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { assetsService } from '@/services/assets.service'
import { departmentsService } from '@/services/departments.service'
import { locationsService } from '@/services/locations.service'
import { ASSET_CONDITIONS, type AssetCondition } from '@/types/enums'

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

const fieldLabelMap: Record<SystemField, string> = {
  Department: 'Department',
  Building: 'Building',
  Floor: 'Floor',
  'Sub-Department': 'Sub-Department',
  Room: 'Room',
  'Asset Type': 'Asset Type',
  'Asset Name': 'Asset Name',
  'Serial Number': 'Serial Number',
  'Model Number': 'Model Number',
  Condition: 'Condition',
  'Label Attached': 'Label Attached',
  Remarks: 'Remarks',
}

function getMappedValue(row: Record<string, string>, mapping: Record<string, SystemField | ''>, field: SystemField): string {
  const col = Object.entries(mapping).find(([, value]) => value === field)?.[0]
  return col ? String(row[col] ?? '').trim() : ''
}

function normalizeLookupValue(value: string): string {
  return value.trim().toLowerCase().replace(/[()\/\-]+/g, ' ').replace(/\s+/g, ' ')
}

function matchesLookup(value: string, name?: string, code?: string): boolean {
  const normalized = normalizeLookupValue(value)
  return normalized.length > 0 && [name, code].filter(Boolean).some((candidate) => normalizeLookupValue(candidate!) === normalized)
}

function normalizeAssetCondition(value: string): AssetCondition | '' {
  const trimmed = value.trim()
  if (!trimmed) return ''

  const normalized = trimmed.toLowerCase().replace(/[^a-z]+/g, ' ').trim()
  const aliases: Record<string, AssetCondition> = {
    excellent: 'Excellent',
    good: 'Good',
    fair: 'Fair',
    poor: 'Poor',
    bad: 'Poor',
    'needs maintenance': 'Poor',
    'need maintenance': 'Poor',
    'requires maintenance': 'Poor',
    'needs repair': 'Poor',
    'need repair': 'Poor',
    damaged: 'Damaged',
    'non functional': 'Non-functional',
    'not working': 'Non-functional',
    'out of service': 'Non-functional',
  }

  if (aliases[normalized]) {
    return aliases[normalized]
  }

  return ASSET_CONDITIONS.includes(trimmed as AssetCondition) ? (trimmed as AssetCondition) : ''
}

export function ImportAssetsPage() {
  const queryClient = useQueryClient()
  const [rows, setRows] = useState<ParsedRow[]>([])
  const [columns, setColumns] = useState<string[]>([])
  const [mapping, setMapping] = useState<Record<string, SystemField | ''>>({})
  const [selectedFileName, setSelectedFileName] = useState('')

  const onFile = async (file: File) => {
    const buffer = await file.arrayBuffer()
    const wb = XLSX.read(buffer)
    const sheet = wb.Sheets[wb.SheetNames[0]]
    const json = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, { defval: '' })
    const cols = json.length ? Object.keys(json[0]) : []
    setSelectedFileName(file.name)
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
        const department = raw[cols.find((c) => auto[c] === 'Department') ?? '']
        if (!department?.trim()) errors.push('missing department')

        const conditionColumn = cols.find((c) => auto[c] === 'Condition')
        const conditionValue = conditionColumn ? raw[conditionColumn]?.trim() ?? '' : ''
        if (conditionValue && !normalizeAssetCondition(conditionValue)) {
          errors.push('invalid condition')
        }

        const nameColumn = cols.find((c) => auto[c] === 'Asset Name')
        const assetName = nameColumn ? raw[nameColumn]?.trim() : ''
        if (!assetName && nameColumn) {
          raw[nameColumn] = 'N/A'
        }

        return { raw, valid: errors.length === 0, errors }
      }),
    )
  }

  const validCount = rows.filter((r) => r.valid).length
  const invalidCount = rows.length - validCount

  const importMutation = useMutation({
    mutationFn: async () => {
      const depts = await departmentsService.getDepartments()
      const buildings = await locationsService.getBuildings()
      const floors = await locationsService.getFloors()
      const categories = await assetsService.getCategories()
      const defaultCat = categories[0]?.id ?? ''

      if (!defaultCat) {
        throw new Error('No asset categories exist. Add a category before importing assets.')
      }

      const validRows = rows.filter((r) => r.valid)
      for (const row of validRows) {
        const departmentName = getMappedValue(row.raw, mapping, 'Department')
        const buildingName = getMappedValue(row.raw, mapping, 'Building')
        const floorName = getMappedValue(row.raw, mapping, 'Floor')
        const department = depts.find((item) => matchesLookup(departmentName, item.name, item.code))
        const building = buildings.find((item) => matchesLookup(buildingName, item.name, item.code))
        const floor = floors.find(
          (item) => matchesLookup(floorName, item.name) && (!building || item.buildingId === building.id),
        )

        if (!department) throw new Error(`Department not found: ${departmentName}`)
        if (buildingName && !building) throw new Error(`Building not found: ${buildingName}`)
        if (floorName && !floor) throw new Error(`Floor not found: ${floorName}`)

        const assetName = getMappedValue(row.raw, mapping, 'Asset Name') || 'N/A'
        const rawCondition = getMappedValue(row.raw, mapping, 'Condition')
        const condition = normalizeAssetCondition(rawCondition) || 'Good'

        await assetsService.create({
          name: assetName,
          categoryId: defaultCat,
          departmentId: department.id,
          buildingId: building?.id,
          floorId: floor?.id,
          condition,
          status: 'Active',
          labelAttached: getMappedValue(row.raw, mapping, 'Label Attached').toLowerCase() === 'yes',
          qaChecked: false,
          serialNumber: getMappedValue(row.raw, mapping, 'Serial Number') || undefined,
          modelNumber: getMappedValue(row.raw, mapping, 'Model Number') || undefined,
          remarks: getMappedValue(row.raw, mapping, 'Remarks') || undefined,
        })
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] })
      toast.success(`Imported ${validCount} valid records`)
      setRows([])
      setColumns([])
      setMapping({})
      setSelectedFileName('')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Import failed')
    },
  })

  const invalidRows = rows.filter((row) => !row.valid)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Import Assets"
        description="Upload an Excel or CSV file, preview the rows, and import only valid records to the database."
      />

      <Card>
        <CardHeader>
          <CardTitle>Upload Excel File</CardTitle>
        </CardHeader>
        <CardContent>
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed bg-muted/20 px-6 py-16 text-center">
            <p className="font-medium">Drag & drop or click to upload</p>
            <p className="mt-1 text-sm text-muted-foreground">Supported: .xlsx, .xls, .csv</p>
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) void onFile(file)
              }}
            />
          </label>

          {selectedFileName ? (
            <p className="mt-3 text-sm text-muted-foreground">Selected file: {selectedFileName}</p>
          ) : null}
        </CardContent>
      </Card>

      {rows.length ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Map Columns</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {columns.map((col) => (
                <div key={col} className="grid grid-cols-2 items-center gap-3 text-sm">
                  <span>{col}</span>
                  <Select
                    value={mapping[col] ?? ''}
                    onValueChange={(value) => setMapping((current) => ({ ...current, [col]: value as SystemField | '' }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="System field" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">— Skip —</SelectItem>
                      {systemFields.map((field) => (
                        <SelectItem key={field} value={field}>
                          {fieldLabelMap[field]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Preview & validation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs defaultValue="preview" className="w-full">
                <TabsList>
                  <TabsTrigger value="preview">Preview & validation</TabsTrigger>
                  <TabsTrigger value="issues">Rows with issues ({invalidCount})</TabsTrigger>
                </TabsList>

                <TabsContent value="preview" className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <p>{rows.length.toLocaleString()} rows detected</p>
                    <p className="text-emerald-700">✓ {validCount.toLocaleString()} valid</p>
                    {invalidCount ? <p className="text-amber-700">⚠ {invalidCount} rows with issues (will not import)</p> : null}
                  </div>

                  <div className="overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>#</TableHead>
                          {columns.map((col) => (
                            <TableHead key={col}>{col}</TableHead>
                          ))}
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {rows.slice(0, 12).map((row, index) => (
                          <TableRow key={`${index}-${Object.values(row.raw).join('-')}`}>
                            <TableCell>{index + 1}</TableCell>
                            {columns.map((col) => (
                              <TableCell key={`${index}-${col}`}>{row.raw[col] ?? ''}</TableCell>
                            ))}
                            <TableCell>
                              {row.valid ? (
                                <span className="text-emerald-600">Valid</span>
                              ) : (
                                <span className="text-amber-600">{row.errors.join(', ') || 'Invalid'}</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>

                <TabsContent value="issues" className="space-y-4">
                  {invalidRows.length ? (
                    <div className="overflow-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>#</TableHead>
                            {columns.map((col) => (
                              <TableHead key={col}>{col}</TableHead>
                            ))}
                            <TableHead>Issue</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {invalidRows.map((row, index) => (
                            <TableRow key={`issue-${index}-${Object.values(row.raw).join('-')}`}>
                              <TableCell>{index + 1}</TableCell>
                              {columns.map((col) => (
                                <TableCell key={`issue-${index}-${col}`}>{row.raw[col] ?? ''}</TableCell>
                              ))}
                              <TableCell className="text-amber-600">{row.errors.join(', ')}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No rows with issues.</p>
                  )}
                </TabsContent>
              </Tabs>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" onClick={() => { setRows([]); setColumns([]); setMapping({}); setSelectedFileName('') }}>
                  Cancel
                </Button>
                <Button onClick={() => importMutation.mutate()} disabled={!validCount || importMutation.isPending}>
                  {importMutation.isPending ? 'Importing...' : 'Import Valid Records'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  )
}
