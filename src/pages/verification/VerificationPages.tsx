import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useLookupMaps } from '@/hooks/useLookupMaps'
import { assetsService } from '@/services/assets.service'
import { verificationService } from '@/services/verification.service'

export function VerificationPage() {
  const lookup = useLookupMaps()
  const queryClient = useQueryClient()
  const sessions = useQuery({ queryKey: ['verificationSessions'], queryFn: () => verificationService.listSessions() })
  const [filters, setFilters] = useState({ departmentId: '', roomId: '', verificationDate: new Date().toISOString().slice(0, 10), verifierId: 'usr_hanna' })
  const [activeSession, setActiveSession] = useState<string | null>(null)
  const lines = useQuery({
    queryKey: ['verificationLines', activeSession],
    queryFn: () => verificationService.getLines(activeSession!),
    enabled: !!activeSession,
  })
  const assets = useQuery({ queryKey: ['assets'], queryFn: () => assetsService.getAll() })

  const startMutation = useMutation({
    mutationFn: async () => {
      const expected = (assets.data ?? []).filter((a) => {
        if (filters.departmentId && a.departmentId !== filters.departmentId) return false
        if (filters.roomId && a.roomId !== filters.roomId) return false
        return true
      })
      return verificationService.startSession(
        {
          departmentId: filters.departmentId || lookup.departments[0]?.id,
          roomId: filters.roomId || undefined,
          verificationDate: filters.verificationDate,
          verifierId: filters.verifierId,
        },
        expected.map((a) => a.id),
      )
    },
    onSuccess: (session) => {
      setActiveSession(session.id)
      queryClient.invalidateQueries({ queryKey: ['verificationSessions'] })
      toast.success('Verification session started')
    },
  })

  const session = sessions.data?.find((s) => s.id === activeSession)
  const progress = session ? Math.round((session.verifiedCount / Math.max(session.expectedCount, 1)) * 100) : 0

  return (
    <div className="space-y-6">
      <PageHeader title="Physical Verification" description="Verify expected assets room by room" />
      {!activeSession ? (
        <Card>
          <CardContent className="grid gap-4 p-6 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Department</Label>
              <Select value={filters.departmentId} onValueChange={(v) => setFilters((f) => ({ ...f, departmentId: v }))}>
                <SelectTrigger><SelectValue placeholder="Department" /></SelectTrigger>
                <SelectContent>{lookup.departments.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Room</Label>
              <Select value={filters.roomId} onValueChange={(v) => setFilters((f) => ({ ...f, roomId: v }))}>
                <SelectTrigger><SelectValue placeholder="Room" /></SelectTrigger>
                <SelectContent>{lookup.rooms.map((r) => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>Verification Date</Label><Input type="date" value={filters.verificationDate} onChange={(e) => setFilters((f) => ({ ...f, verificationDate: e.target.value }))} /></div>
            <Button className="self-end" onClick={() => startMutation.mutate()}>Start Verification</Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="space-y-4 p-6">
            <div className="flex flex-wrap gap-4 text-sm">
              <span>Expected: {session?.expectedCount}</span>
              <span>Verified: {session?.verifiedCount}</span>
              <span>Missing: {session?.missingCount}</span>
              <span>Damaged: {session?.damagedCount}</span>
            </div>
            <div>
              <p className="mb-2 text-sm">{session?.verifiedCount} / {session?.expectedCount} Verified ({progress}%)</p>
              <Progress value={progress} />
            </div>
            <Table>
              <TableHeader><TableRow><TableHead>Asset</TableHead><TableHead>State</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {(lines.data ?? []).map((line) => {
                  const asset = assets.data?.find((a) => a.id === line.assetId)
                  return (
                    <TableRow key={line.id}>
                      <TableCell>{asset?.assetTag} {asset?.name}</TableCell>
                      <TableCell>{line.state}</TableCell>
                      <TableCell className="space-x-1">
                        <Button size="sm" variant="outline" onClick={() => verificationService.updateLine(activeSession!, line.id, 'Verified').then(() => queryClient.invalidateQueries({ queryKey: ['verificationLines', activeSession, 'verificationSessions'] }))}>Verify</Button>
                        <Button size="sm" variant="outline" onClick={() => verificationService.updateLine(activeSession!, line.id, 'Missing').then(() => queryClient.invalidateQueries({ queryKey: ['verificationLines', activeSession, 'verificationSessions'] }))}>Missing</Button>
                        <Button size="sm" variant="outline" onClick={() => verificationService.updateLine(activeSession!, line.id, 'Damaged').then(() => queryClient.invalidateQueries({ queryKey: ['verificationLines', activeSession, 'verificationSessions'] }))}>Damaged</Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
            <Button onClick={() => verificationService.completeSession(activeSession!).then(() => { toast.success('Verification completed'); setActiveSession(null) })}>Complete Session</Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export function ScanAssetsPage() {
  const [tag, setTag] = useState('')
  const asset = useQuery({ queryKey: ['assetByTag', tag], queryFn: () => assetsService.getByTag(tag), enabled: tag.length > 3 })
  return (
    <div className="space-y-6">
      <PageHeader title="Scan Assets" description="Simulated scanner — enter or scan asset tag" />
      <Card>
        <CardContent className="space-y-4 p-6">
          <Input placeholder="AST-000002" value={tag} onChange={(e) => setTag(e.target.value.toUpperCase())} />
          {asset.data ? (
            <div className="rounded-lg border p-4">
              <p className="font-mono text-sm">{asset.data.assetTag}</p>
              <p className="font-medium">{asset.data.name}</p>
              <p className="text-sm text-muted-foreground">{asset.data.status} · {asset.data.condition}</p>
            </div>
          ) : tag.length > 3 && !asset.isLoading ? (
            <p className="text-sm text-muted-foreground">No asset found</p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}

export function MissingAssetsPage() {
  const assets = useQuery({ queryKey: ['missingAssets'], queryFn: () => assetsService.getAll({ status: 'Missing' }) })
  const lookup = useLookupMaps()
  return (
    <div className="space-y-6">
      <PageHeader title="Missing Assets" />
      <Card>
        <Table>
          <TableHeader><TableRow><TableHead>Asset</TableHead><TableHead>Last Known Location</TableHead><TableHead>Assigned</TableHead><TableHead>Condition</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {(assets.data ?? []).map((a) => (
              <TableRow key={a.id}>
                <TableCell>{a.assetTag} — {a.name}</TableCell>
                <TableCell>{lookup.roomMap.get(a.roomId ?? '') ?? '—'}</TableCell>
                <TableCell>{a.assignedUserId ? lookup.userMap.get(a.assignedUserId) : '—'}</TableCell>
                <TableCell>{a.condition}</TableCell>
                <TableCell><Button size="sm" variant="outline" onClick={() => assetsService.update(a.id, { status: 'Active' }).then(() => toast.success('Marked found'))}>Mark Found</Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}

export function VerificationHistoryPage() {
  const sessions = useQuery({ queryKey: ['verificationSessions'], queryFn: () => verificationService.listSessions() })
  return (
    <div className="space-y-6">
      <PageHeader title="Verification History" />
      <Card>
        <Table>
          <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Expected</TableHead><TableHead>Verified</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
          <TableBody>
            {(sessions.data ?? []).map((s) => (
              <TableRow key={s.id}>
                <TableCell>{new Date(s.verificationDate).toLocaleDateString()}</TableCell>
                <TableCell>{s.expectedCount}</TableCell>
                <TableCell>{s.verifiedCount}</TableCell>
                <TableCell>{s.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
