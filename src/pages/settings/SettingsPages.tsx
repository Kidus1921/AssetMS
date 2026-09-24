import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { permissionMatrix } from '@/lib/permissions'
import { assetsService } from '@/services/assets.service'
import { settingsService } from '@/services/settings.service'

export function SettingsPage() {
  const org = useQuery({ queryKey: ['orgSettings'], queryFn: () => settingsService.getOrganization() })
  const queryClient = useQueryClient()

  const saveOrg = useMutation({
    mutationFn: (patch: { name?: string; currency?: string }) => settingsService.updateOrganization(patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orgSettings'] })
      toast.success('Settings saved')
    },
  })

  const reset = useMutation({
    mutationFn: () => assetsService.resetDatabase(),
    onSuccess: () => {
      queryClient.clear()
      toast.success('Database reset to blank state')
      window.location.href = '/dashboard'
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Database reset failed')
    },
  })

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Organization configuration and demo controls" />
      <Card>
        <CardHeader><CardTitle>Organization Settings</CardTitle></CardHeader>
        <CardContent className="grid max-w-md gap-4">
          <Input
            defaultValue={org.data?.name}
            placeholder="Organization name"
            onBlur={(e) => saveOrg.mutate({ name: e.target.value })}
          />
          <Input
            defaultValue={org.data?.currency}
            placeholder="Currency"
            onBlur={(e) => saveOrg.mutate({ currency: e.target.value })}
          />
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>User Roles (simulated)</CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link to="/audit-log">Audit Log</Link>
          </Button>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role</TableHead>
                <TableHead>View</TableHead>
                <TableHead>Create</TableHead>
                <TableHead>Edit</TableHead>
                <TableHead>Delete</TableHead>
                <TableHead>Approve</TableHead>
                <TableHead>Maintenance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {permissionMatrix().map((row) => (
                <TableRow key={row.role}>
                  <TableCell>{row.role}</TableCell>
                  <TableCell>{row.view}</TableCell>
                  <TableCell>{row.create}</TableCell>
                  <TableCell>{row.edit}</TableCell>
                  <TableCell>{row.delete}</TableCell>
                  <TableCell>{row.approve}</TableCell>
                  <TableCell>{row.maintenance}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Database Reset</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Clears the current asset database back to a blank state before new imports or fresh setup.
          </p>
          <Button variant="destructive" onClick={() => reset.mutate()} disabled={reset.isPending}>
            {reset.isPending ? 'Resetting...' : 'Rollback to blank DB'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export function CategoriesSettingsPage() {
  const categories = useQuery({ queryKey: ['categories'], queryFn: () => assetsService.getCategories() })
  return (
    <div className="space-y-6">
      <PageHeader title="Asset Categories" />
      <Card>
        <Table>
          <TableHeader><TableRow><TableHead>Name</TableHead></TableRow></TableHeader>
          <TableBody>
            {(categories.data ?? []).map((c) => <TableRow key={c.id}><TableCell>{c.name}</TableCell></TableRow>)}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
