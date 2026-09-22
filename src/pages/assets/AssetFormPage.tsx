import type { ReactNode } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { useLookupMaps } from '@/hooks/useLookupMaps'
import { assetsService } from '@/services/assets.service'
import { departmentsService } from '@/services/departments.service'
import { ASSET_CONDITIONS, ASSET_STATUSES } from '@/types/enums'
import { assetFormSchema, type AssetFormValues } from './assetFormSchema'

export function AssetFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const lookup = useLookupMaps()

  const assetQuery = useQuery({
    queryKey: ['asset', id],
    queryFn: () => assetsService.getById(id!),
    enabled: isEdit,
  })

  const subDepartmentsQuery = useQuery({
    queryKey: ['subDepartments'],
    queryFn: () => departmentsService.getSubDepartments(),
  })

  const form = useForm<AssetFormValues>({
    resolver: zodResolver(assetFormSchema),
    defaultValues: {
      condition: 'Good',
      status: 'Active',
      labelAttached: false,
      qaChecked: false,
    },
  })

  const buildingId = form.watch('buildingId')
  const departmentId = form.watch('departmentId')
  const categoryId = form.watch('categoryId')

  const filteredFloors = lookup.floors.filter((f) => !buildingId || f.buildingId === buildingId)
  const filteredRooms = lookup.rooms.filter((r) => {
    if (buildingId && r.buildingId !== buildingId) return false
    if (form.watch('floorId') && r.floorId !== form.watch('floorId')) return false
    if (departmentId && r.departmentId !== departmentId) return false
    return true
  })
  const filteredSubDepts = (subDepartmentsQuery.data ?? []).filter((s) => s.departmentId === departmentId)
  const filteredTypes = lookup.types.filter((t) => t.categoryId === categoryId)

  useEffect(() => {
    if (assetQuery.data) {
      form.reset({
        name: assetQuery.data.name,
        categoryId: assetQuery.data.categoryId,
        typeId: assetQuery.data.typeId,
        manufacturer: assetQuery.data.manufacturer,
        modelNumber: assetQuery.data.modelNumber,
        serialNumber: assetQuery.data.serialNumber,
        assetTag: assetQuery.data.assetTag,
        inventoryNumber: assetQuery.data.inventoryNumber,
        barcode: assetQuery.data.barcode,
        departmentId: assetQuery.data.departmentId,
        subDepartmentId: assetQuery.data.subDepartmentId,
        buildingId: assetQuery.data.buildingId,
        floorId: assetQuery.data.floorId,
        roomId: assetQuery.data.roomId,
        specificLocation: assetQuery.data.specificLocation,
        condition: assetQuery.data.condition,
        status: assetQuery.data.status,
        labelAttached: assetQuery.data.labelAttached,
        qaChecked: assetQuery.data.qaChecked,
        purchaseDate: assetQuery.data.purchaseDate?.slice(0, 10),
        acquisitionDate: assetQuery.data.acquisitionDate?.slice(0, 10),
        supplier: assetQuery.data.supplier,
        purchaseOrder: assetQuery.data.purchaseOrder,
        invoiceNumber: assetQuery.data.invoiceNumber,
        acquisitionCost: assetQuery.data.acquisitionCost,
        fundingSource: assetQuery.data.fundingSource,
        warrantyStart: assetQuery.data.warrantyStart?.slice(0, 10),
        warrantyEnd: assetQuery.data.warrantyEnd?.slice(0, 10),
        warrantyProvider: assetQuery.data.warrantyProvider,
        usefulLifeYears: assetQuery.data.usefulLifeYears,
        remarks: assetQuery.data.remarks,
      })
    }
  }, [assetQuery.data, form])

  const mutation = useMutation({
    mutationFn: async (values: AssetFormValues) => {
      if (isEdit && id) {
        return assetsService.update(id, values)
      }
      return assetsService.create(values)
    },
    onSuccess: (asset) => {
      queryClient.invalidateQueries({ queryKey: ['assets'] })
      toast.success(isEdit ? 'Asset updated successfully' : 'Asset created successfully', {
        description: asset.assetTag,
      })
      navigate(`/assets/${asset.id}`)
    },
  })

  if (isEdit && assetQuery.isLoading) {
    return <Skeleton className="h-96 w-full" />
  }

  return (
    <form className="space-y-6" onSubmit={form.handleSubmit((v) => mutation.mutate(v))}>
      <PageHeader
        title={isEdit ? 'Edit Asset' : 'Add Asset'}
        description="Register assets with location, financial, and warranty details"
        actions={
          <Button variant="outline" asChild>
            <Link to={isEdit ? `/assets/${id}` : '/assets'}>Cancel</Link>
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Asset Identity</CardTitle></CardHeader>
          <CardContent className="grid gap-4">
            <Field label="Asset Name *" error={form.formState.errors.name?.message}>
              <Input {...form.register('name')} />
            </Field>
            <Field label="Asset Category *" error={form.formState.errors.categoryId?.message}>
              <Select value={form.watch('categoryId') ?? ''} onValueChange={(v) => form.setValue('categoryId', v, { shouldValidate: true })}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {lookup.categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Asset Type">
              <Select value={form.watch('typeId') ?? ''} onValueChange={(v) => form.setValue('typeId', v)}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  {filteredTypes.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Manufacturer"><Input {...form.register('manufacturer')} /></Field>
              <Field label="Model Number"><Input {...form.register('modelNumber')} /></Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Serial Number"><Input {...form.register('serialNumber')} /></Field>
              <Field label="Asset Tag"><Input {...form.register('assetTag')} placeholder="Auto-generated if empty" /></Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Inventory Number"><Input {...form.register('inventoryNumber')} /></Field>
              <Field label="Barcode"><Input {...form.register('barcode')} /></Field>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Location</CardTitle></CardHeader>
          <CardContent className="grid gap-4">
            <Field label="Department *" error={form.formState.errors.departmentId?.message}>
              <Select value={form.watch('departmentId') ?? ''} onValueChange={(v) => form.setValue('departmentId', v, { shouldValidate: true })}>
                <SelectTrigger><SelectValue placeholder="Department" /></SelectTrigger>
                <SelectContent>
                  {lookup.departments.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Sub-Department">
              <Select value={form.watch('subDepartmentId') ?? ''} onValueChange={(v) => form.setValue('subDepartmentId', v)}>
                <SelectTrigger><SelectValue placeholder="Sub-department" /></SelectTrigger>
                <SelectContent>
                  {filteredSubDepts.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Building">
              <Select value={form.watch('buildingId') ?? ''} onValueChange={(v) => { form.setValue('buildingId', v); form.setValue('floorId', ''); form.setValue('roomId', '') }}>
                <SelectTrigger><SelectValue placeholder="Building" /></SelectTrigger>
                <SelectContent>
                  {lookup.buildings.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Floor">
              <Select value={form.watch('floorId') ?? ''} onValueChange={(v) => { form.setValue('floorId', v); form.setValue('roomId', '') }}>
                <SelectTrigger><SelectValue placeholder="Floor" /></SelectTrigger>
                <SelectContent>
                  {filteredFloors.map((f) => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Room">
              <Select value={form.watch('roomId') ?? ''} onValueChange={(v) => form.setValue('roomId', v)}>
                <SelectTrigger><SelectValue placeholder="Room" /></SelectTrigger>
                <SelectContent>
                  {filteredRooms.map((r) => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Specific Location"><Input {...form.register('specificLocation')} /></Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Condition & Status</CardTitle></CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Condition">
                <Select value={form.watch('condition')} onValueChange={(v) => form.setValue('condition', v as AssetFormValues['condition'])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{ASSET_CONDITIONS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <Field label="Status">
                <Select value={form.watch('status')} onValueChange={(v) => form.setValue('status', v as AssetFormValues['status'])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{ASSET_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
            </div>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={form.watch('labelAttached')} onCheckedChange={(v) => form.setValue('labelAttached', !!v)} />
                Label Attached
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={form.watch('qaChecked')} onCheckedChange={(v) => form.setValue('qaChecked', !!v)} />
                QA Check
              </label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Financial & Warranty</CardTitle></CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Purchase Date"><Input type="date" {...form.register('purchaseDate')} /></Field>
              <Field label="Acquisition Date"><Input type="date" {...form.register('acquisitionDate')} /></Field>
            </div>
            <Field label="Acquisition Cost (ETB)"><Input type="number" {...form.register('acquisitionCost')} /></Field>
            <Field label="Supplier"><Input {...form.register('supplier')} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Warranty Start"><Input type="date" {...form.register('warrantyStart')} /></Field>
              <Field label="Warranty End"><Input type="date" {...form.register('warrantyEnd')} /></Field>
            </div>
            <Field label="Useful Life (years)"><Input type="number" {...form.register('usefulLifeYears')} /></Field>
            <Field label="Remarks"><Input {...form.register('remarks')} /></Field>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Asset'}</Button>
      </div>
    </form>
  )
}

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  )
}
