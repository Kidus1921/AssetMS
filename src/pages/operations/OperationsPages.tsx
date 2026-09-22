import type { ReactNode } from 'react'
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
import { useLookupMaps } from '@/hooks/useLookupMaps'
import { formatDate } from '@/lib/utils'
import { assignmentsService } from '@/services/assignments.service'
import { assetsService } from '@/services/assets.service'
import { requestsService } from '@/services/requests.service'
import { transfersService } from '@/services/transfers.service'
import { usersService } from '@/services/users.service'
import { MAINTENANCE_PRIORITIES } from '@/types/enums'

export function AssignmentsPage() {
  const lookup = useLookupMaps()
  const queryClient = useQueryClient()
  const assignments = useQuery({ queryKey: ['assignments'], queryFn: () => assignmentsService.list() })
  const assets = useQuery({ queryKey: ['assets'], queryFn: () => assetsService.getAll() })
  const users = useQuery({ queryKey: ['users'], queryFn: () => usersService.getAll() })
  const [form, setForm] = useState({ assetId: '', userId: '', departmentId: '', locationSummary: '', assignedDate: new Date().toISOString().slice(0, 10), notes: '' })

  const mutation = useMutation({
    mutationFn: () => assignmentsService.assign(form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] })
      toast.success('Asset assigned successfully')
    },
  })

  return (
    <div className="space-y-6">
      <PageHeader title="Assignments" description="Assign assets to employees with location context" />
      <Card>
        <CardContent className="grid gap-4 p-6 md:grid-cols-2">
          <Field label="Asset">
            <Select value={form.assetId} onValueChange={(v) => setForm((f) => ({ ...f, assetId: v }))}>
              <SelectTrigger><SelectValue placeholder="Select asset" /></SelectTrigger>
              <SelectContent>
                {(assets.data ?? []).slice(0, 30).map((a) => (
                  <SelectItem key={a.id} value={a.id}>{a.assetTag} — {a.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Employee">
            <Select value={form.userId} onValueChange={(v) => setForm((f) => ({ ...f, userId: v }))}>
              <SelectTrigger><SelectValue placeholder="Employee" /></SelectTrigger>
              <SelectContent>
                {(users.data ?? []).map((u) => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Department">
            <Select value={form.departmentId} onValueChange={(v) => setForm((f) => ({ ...f, departmentId: v }))}>
              <SelectTrigger><SelectValue placeholder="Department" /></SelectTrigger>
              <SelectContent>
                {lookup.departments.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Location"><Input value={form.locationSummary} onChange={(e) => setForm((f) => ({ ...f, locationSummary: e.target.value }))} /></Field>
          <Field label="Assigned Date"><Input type="date" value={form.assignedDate} onChange={(e) => setForm((f) => ({ ...f, assignedDate: e.target.value }))} /></Field>
          <div className="flex items-end"><Button onClick={() => mutation.mutate()} disabled={!form.assetId || !form.userId}>Assign Asset</Button></div>
        </CardContent>
      </Card>
      <Card>
        <Table>
          <TableHeader><TableRow><TableHead>Asset</TableHead><TableHead>Employee</TableHead><TableHead>Location</TableHead><TableHead>Date</TableHead></TableRow></TableHeader>
          <TableBody>
            {(assignments.data ?? []).map((a) => (
              <TableRow key={a.id}>
                <TableCell>{a.assetId}</TableCell>
                <TableCell>{lookup.userMap.get(a.userId)}</TableCell>
                <TableCell>{a.locationSummary}</TableCell>
                <TableCell>{formatDate(a.assignedDate)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}

export function TransfersPage() {
  const assets = useQuery({ queryKey: ['assets'], queryFn: () => assetsService.getAll() })
  const transfers = useQuery({ queryKey: ['transfers'], queryFn: () => transfersService.list() })
  const queryClient = useQueryClient()
  const [form, setForm] = useState({ assetId: '', fromLocation: '', toLocation: '', reason: '', requestedById: 'usr_kidus', notes: '' })

  const createMutation = useMutation({
    mutationFn: () => transfersService.create(form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transfers'] })
      toast.success('Transfer requested')
    },
  })

  const approveMutation = useMutation({
    mutationFn: (id: string) => transfersService.updateStatus(id, 'Transferred'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transfers', 'assets'] })
      toast.success('Asset transferred successfully')
    },
  })

  return (
    <div className="space-y-6">
      <PageHeader title="Transfers" description="Request, approve, and complete asset transfers without losing history" />
      <Card>
        <CardContent className="grid gap-4 p-6 md:grid-cols-2">
          <Field label="Asset">
            <Select value={form.assetId} onValueChange={(v) => {
              const asset = assets.data?.find((a) => a.id === v)
              setForm((f) => ({
                ...f,
                assetId: v,
                fromLocation: asset ? `${asset.departmentId}` : f.fromLocation,
              }))
            }}>
              <SelectTrigger><SelectValue placeholder="Asset" /></SelectTrigger>
              <SelectContent>
                {(assets.data ?? []).slice(0, 40).map((a) => <SelectItem key={a.id} value={a.id}>{a.assetTag}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Current Location"><Input value={form.fromLocation} onChange={(e) => setForm((f) => ({ ...f, fromLocation: e.target.value }))} /></Field>
          <Field label="New Location"><Input value={form.toLocation} onChange={(e) => setForm((f) => ({ ...f, toLocation: e.target.value }))} /></Field>
          <Field label="Reason"><Input value={form.reason} onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))} /></Field>
          <Field label="Notes"><Input value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} /></Field>
          <Button onClick={() => createMutation.mutate()}>Submit Transfer</Button>
        </CardContent>
      </Card>
      <Card>
        <Table>
          <TableHeader><TableRow><TableHead>Asset</TableHead><TableHead>From</TableHead><TableHead>To</TableHead><TableHead>Status</TableHead><TableHead /></TableRow></TableHeader>
          <TableBody>
            {(transfers.data ?? []).map((t) => (
              <TableRow key={t.id}>
                <TableCell>{t.assetId}</TableCell>
                <TableCell className="max-w-[200px] truncate">{t.fromLocation}</TableCell>
                <TableCell className="max-w-[200px] truncate">{t.toLocation}</TableCell>
                <TableCell>{t.status}</TableCell>
                <TableCell>
                  {t.status !== 'Transferred' ? (
                    <Button size="sm" variant="outline" onClick={() => approveMutation.mutate(t.id)}>Mark Transferred</Button>
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

export function RequestsPage() {
  const lookup = useLookupMaps()
  const requests = useQuery({ queryKey: ['requests'], queryFn: () => requestsService.list() })
  const queryClient = useQueryClient()
  const [form, setForm] = useState({ departmentId: '', requestedItem: '', categoryId: '', quantity: 1, reason: '', priority: 'Medium' as const, requestedById: 'usr_mike' })

  const createMutation = useMutation({
    mutationFn: () => requestsService.create(form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] })
      toast.success('Asset request submitted')
    },
  })

  return (
    <div className="space-y-6">
      <PageHeader title="Asset Requests" description="Department requests with approval workflow" />
      <Card>
        <CardContent className="grid gap-4 p-6 md:grid-cols-2">
          <Field label="Department">
            <Select value={form.departmentId} onValueChange={(v) => setForm((f) => ({ ...f, departmentId: v }))}>
              <SelectTrigger><SelectValue placeholder="Department" /></SelectTrigger>
              <SelectContent>{lookup.departments.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Requested Item"><Input value={form.requestedItem} onChange={(e) => setForm((f) => ({ ...f, requestedItem: e.target.value }))} /></Field>
          <Field label="Quantity"><Input type="number" value={form.quantity} onChange={(e) => setForm((f) => ({ ...f, quantity: Number(e.target.value) }))} /></Field>
          <Field label="Priority">
            <Select value={form.priority} onValueChange={(v) => setForm((f) => ({ ...f, priority: v as typeof form.priority }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{MAINTENANCE_PRIORITIES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Reason"><Input value={form.reason} onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))} /></Field>
          <Button onClick={() => createMutation.mutate()}>Submit Request</Button>
        </CardContent>
      </Card>
      <Card>
        <Table>
          <TableHeader><TableRow><TableHead>Item</TableHead><TableHead>Dept</TableHead><TableHead>Qty</TableHead><TableHead>Status</TableHead><TableHead /></TableRow></TableHeader>
          <TableBody>
            {(requests.data ?? []).map((r) => (
              <TableRow key={r.id}>
                <TableCell>{r.requestedItem}</TableCell>
                <TableCell>{lookup.departmentMap.get(r.departmentId)}</TableCell>
                <TableCell>{r.quantity}</TableCell>
                <TableCell>{r.status}</TableCell>
                <TableCell className="space-x-2">
                  {r.status === 'Pending' ? (
                    <>
                      <Button size="sm" variant="outline" onClick={() => requestsService.updateStatus(r.id, 'Approved').then(() => queryClient.invalidateQueries({ queryKey: ['requests'] }))}>Approve</Button>
                      <Button size="sm" variant="outline" onClick={() => requestsService.updateStatus(r.id, 'Rejected').then(() => queryClient.invalidateQueries({ queryKey: ['requests'] }))}>Reject</Button>
                    </>
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

export function ReceivingPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Receiving" description="Receive → Inspect → Label → Register → Available" />
      <Card><CardContent className="p-6 text-sm text-muted-foreground">Receiving workflow UI ready — create batches and line items when connecting procurement modules.</CardContent></Card>
    </div>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  )
}
