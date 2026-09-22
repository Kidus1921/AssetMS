import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { assetsService } from '@/services/assets.service'
import { maintenanceService } from '@/services/maintenance.service'
import { MAINTENANCE_PRIORITIES, MAINTENANCE_TYPES } from '@/types/enums'

export function MaintenanceDashboardPage() {
  const orders = useQuery({ queryKey: ['maintenance'], queryFn: () => maintenanceService.getWorkOrders() })
  const open = (orders.data ?? []).filter((o) => o.status === 'Open').length
  const inProgress = (orders.data ?? []).filter((o) => o.status === 'In Progress').length
  const completed = (orders.data ?? []).filter((o) => o.status === 'Completed').length
  const overdue = 4
  return (
    <div className="space-y-6">
      <PageHeader title="Maintenance Dashboard" />
      <div className="grid gap-4 sm:grid-cols-4">
        {[['Open Work Orders', open], ['In Progress', inProgress], ['Completed', completed], ['Overdue', overdue]].map(([l, v]) => (
          <Card key={l as string}><CardContent className="p-5"><p className="text-xs text-muted-foreground">{l}</p><p className="text-2xl font-bold">{v}</p></CardContent></Card>
        ))}
      </div>
    </div>
  )
}

export function WorkOrdersPage() {
  const queryClient = useQueryClient()
  const assets = useQuery({ queryKey: ['assets'], queryFn: () => assetsService.getAll() })
  const orders = useQuery({ queryKey: ['maintenance'], queryFn: () => maintenanceService.getWorkOrders() })
  const [form, setForm] = useState({
    assetId: '',
    problem: '',
    maintenanceType: 'Corrective' as const,
    priority: 'Medium' as const,
    reportedById: 'usr_sara',
    status: 'Open' as const,
  })

  const createMutation = useMutation({
    mutationFn: () => maintenanceService.createWorkOrder(form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance'] })
      toast.success('Work order created')
    },
  })

  return (
    <div className="space-y-6">
      <PageHeader title="Work Orders" description="Corrective, preventive, and emergency maintenance" />
      <Card>
        <CardContent className="grid gap-4 p-6 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Asset</Label>
            <Select value={form.assetId} onValueChange={(v) => setForm((f) => ({ ...f, assetId: v }))}>
              <SelectTrigger><SelectValue placeholder="Asset" /></SelectTrigger>
              <SelectContent>
                {(assets.data ?? []).slice(0, 30).map((a) => <SelectItem key={a.id} value={a.id}>{a.assetTag}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5"><Label>Problem</Label><Input value={form.problem} onChange={(e) => setForm((f) => ({ ...f, problem: e.target.value }))} /></div>
          <div className="space-y-1.5">
            <Label>Type</Label>
            <Select value={form.maintenanceType} onValueChange={(v) => setForm((f) => ({ ...f, maintenanceType: v as typeof form.maintenanceType }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{MAINTENANCE_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Priority</Label>
            <Select value={form.priority} onValueChange={(v) => setForm((f) => ({ ...f, priority: v as typeof form.priority }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{MAINTENANCE_PRIORITIES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <Button onClick={() => createMutation.mutate()}>Create Work Order</Button>
        </CardContent>
      </Card>
      <Card>
        <Table>
          <TableHeader><TableRow><TableHead>Asset</TableHead><TableHead>Problem</TableHead><TableHead>Type</TableHead><TableHead>Status</TableHead><TableHead /></TableRow></TableHeader>
          <TableBody>
            {(orders.data ?? []).map((o) => (
              <TableRow key={o.id}>
                <TableCell>{o.assetId}</TableCell>
                <TableCell>{o.problem}</TableCell>
                <TableCell>{o.maintenanceType}</TableCell>
                <TableCell>{o.status}</TableCell>
                <TableCell>
                  {o.status !== 'Completed' ? (
                    <Button size="sm" variant="outline" onClick={() => maintenanceService.updateWorkOrder(o.id, { status: 'Completed', completionDate: new Date().toISOString() }).then(() => { queryClient.invalidateQueries({ queryKey: ['maintenance'] }); toast.success('Completed') })}>Complete</Button>
                  ) : null}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}

export function SchedulesPage() {
  const schedules = useQuery({ queryKey: ['schedules'], queryFn: () => maintenanceService.getSchedules() })
  const assets = useQuery({ queryKey: ['assets'], queryFn: () => assetsService.getAll() })
  return (
    <div className="space-y-6">
      <PageHeader title="Preventive Maintenance" description="Schedules with overdue highlighting" />
      <div className="grid gap-4">
        {(schedules.data ?? []).map((s) => {
          const asset = assets.data?.find((a) => a.id === s.assetId)
          return (
            <Card key={s.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 p-5">
                <div>
                  <p className="font-medium">{asset?.name ?? s.assetId}</p>
                  <p className="text-sm text-muted-foreground">Every {s.frequencyMonths} months · Next: {new Date(s.nextMaintenanceDate).toLocaleDateString()}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${s.status === 'Overdue' ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'}`}>{s.status}</span>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
