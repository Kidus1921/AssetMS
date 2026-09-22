import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AssetConditionBadge, AssetStatusBadge } from '@/components/assets/AssetStatusBadge'
import { AssetLabelPreview } from '@/components/assets/AssetLabelPreview'
import { EmptyState } from '@/components/shared/EmptyState'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useLookupMaps } from '@/hooks/useLookupMaps'
import { formatCurrency, formatDate } from '@/lib/utils'
import { assignmentsService } from '@/services/assignments.service'
import { assetsService } from '@/services/assets.service'
import { maintenanceService } from '@/services/maintenance.service'
import { settingsService } from '@/services/settings.service'

export function AssetDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const lookup = useLookupMaps()

  const assetQuery = useQuery({ queryKey: ['asset', id], queryFn: () => assetsService.getById(id!), enabled: !!id })
  const timelineQuery = useQuery({ queryKey: ['timeline', id], queryFn: () => assetsService.getTimeline(id!), enabled: !!id })
  const docsQuery = useQuery({ queryKey: ['documents', id], queryFn: () => assetsService.getDocuments(id!), enabled: !!id })
  const assignmentsQuery = useQuery({ queryKey: ['assignments', id], queryFn: () => assignmentsService.getByAsset(id!), enabled: !!id })
  const maintenanceQuery = useQuery({ queryKey: ['maintenance'], queryFn: () => maintenanceService.getWorkOrders() })
  const orgQuery = useQuery({ queryKey: ['orgSettings'], queryFn: () => settingsService.getOrganization() })

  if (assetQuery.isLoading) return <Skeleton className="h-96 w-full" />
  if (!assetQuery.data) {
    return (
      <EmptyState
        title="Asset not found"
        description="The asset you are looking for does not exist."
        action={
          <Button asChild>
            <Link to="/assets">Back to assets</Link>
          </Button>
        }
      />
    )
  }

  const asset = assetQuery.data
  const dept = lookup.departmentMap.get(asset.departmentId)
  const room = asset.roomId ? lookup.roomMap.get(asset.roomId) : undefined
  const building = asset.buildingId ? lookup.buildingMap.get(asset.buildingId) : undefined
  const floor = asset.floorId ? lookup.floorMap.get(asset.floorId) : undefined
  const assigned = asset.assignedUserId ? lookup.userMap.get(asset.assignedUserId) : undefined
  const assetMaintenance = (maintenanceQuery.data ?? []).filter((m) => m.assetId === asset.id)

  const locationLine = [dept, building, floor, room].filter(Boolean).join(' / ')

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="font-mono text-sm text-muted-foreground">{asset.assetTag}</p>
          <h1 className="text-2xl font-semibold">{asset.name}</h1>
          <div className="mt-3 flex flex-wrap gap-2">
            <AssetStatusBadge status={asset.status} />
            <AssetConditionBadge condition={asset.condition} />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => navigate(`/assets/${asset.id}/edit`)}>Edit</Button>
          <Button variant="outline" onClick={() => navigate('/transfers')}>Transfer</Button>
          <Button variant="outline" onClick={() => navigate('/assignments')}>Assign</Button>
          <Button variant="outline" onClick={() => navigate('/maintenance/work-orders')}>Maintenance</Button>
          <Button variant="outline" onClick={() => navigate('/verification')}>Verify</Button>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="flex h-auto flex-wrap">
          {['overview', 'location', 'assignment', 'maintenance', 'documents', 'financial', 'verification', 'history'].map((t) => (
            <TabsTrigger key={t} value={t} className="capitalize">{t}</TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader><CardTitle>Asset Information</CardTitle></CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2 text-sm">
              <Info label="Category" value={lookup.categoryMap.get(asset.categoryId)} />
              <Info label="Type" value={asset.typeId ? lookup.typeMap.get(asset.typeId) : '—'} />
              <Info label="Serial" value={asset.serialNumber} />
              <Info label="Model" value={asset.modelNumber} />
              <Info label="Manufacturer" value={asset.manufacturer} />
              <Info label="Label" value={asset.labelAttached ? 'Attached' : 'Not attached'} />
              <Info label="QA Check" value={asset.qaChecked ? 'Passed' : 'Pending'} />
              <Info label="Last Verified" value={formatDate(asset.lastVerifiedAt)} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Asset Label</CardTitle></CardHeader>
            <CardContent>
              <AssetLabelPreview
                asset={asset}
                organizationName={orgQuery.data?.name ?? 'ORGANIZATION'}
                departmentLine={locationLine}
              />
              <Button className="mt-4 w-full" variant="outline" onClick={() => window.print()}>Print Label</Button>
            </CardContent>
          </Card>
          <Card className="lg:col-span-3">
            <CardHeader><CardTitle>Lifecycle Timeline</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {(timelineQuery.data ?? []).map((event) => (
                <div key={event.id} className="flex gap-4 border-l-2 border-primary/30 pl-4">
                  <div>
                    <p className="text-xs text-muted-foreground">{formatDate(event.date)}</p>
                    <p className="text-sm font-medium">{event.title}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="location">
          <Card>
            <CardContent className="grid gap-3 p-6 sm:grid-cols-2 text-sm">
              <Info label="Department" value={dept} />
              <Info label="Building" value={building} />
              <Info label="Floor" value={floor} />
              <Info label="Room" value={room} />
              <Info label="Specific Location" value={asset.specificLocation} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignment">
          <Card>
            <CardHeader><CardTitle>Current Assignment</CardTitle></CardHeader>
            <CardContent className="text-sm">
              <Info label="Assigned Person" value={assigned ?? 'Unassigned'} />
              {(assignmentsQuery.data ?? []).map((a) => (
                <div key={a.id} className="mt-4 rounded-lg border p-3">
                  <p className="font-medium">{lookup.userMap.get(a.userId)}</p>
                  <p className="text-muted-foreground">{a.locationSummary}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(a.assignedDate)} {a.active ? '(Active)' : ''}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance">
          {assetMaintenance.length ? (
            <div className="space-y-3">
              {assetMaintenance.map((m) => (
                <Card key={m.id}>
                  <CardContent className="flex items-center justify-between p-4 text-sm">
                    <div>
                      <p className="font-medium">{m.problem}</p>
                      <p className="text-muted-foreground">{m.maintenanceType} · {m.status}</p>
                    </div>
                    <Button variant="outline" size="sm">View</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No maintenance records"
              description="There are no maintenance records for this asset yet."
              action={<Button onClick={() => navigate('/maintenance/work-orders')}>Create Maintenance</Button>}
            />
          )}
        </TabsContent>

        <TabsContent value="documents">
          {docsQuery.data?.length ? (
            <Card>
              <CardContent className="divide-y p-0">
                {docsQuery.data.map((d) => (
                  <div key={d.id} className="flex items-center justify-between px-4 py-3 text-sm">
                    <span>{d.name}</span>
                    <span className="text-muted-foreground">{d.type}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : (
            <EmptyState title="No documents" description="Upload purchase invoices, manuals, and certificates (simulated in this phase)." />
          )}
        </TabsContent>

        <TabsContent value="financial">
          <Card>
            <CardContent className="grid gap-3 p-6 sm:grid-cols-2 text-sm">
              <Info label="Acquisition Cost" value={asset.acquisitionCost ? formatCurrency(asset.acquisitionCost) : '—'} />
              <Info label="Acquisition Date" value={formatDate(asset.acquisitionDate)} />
              <Info label="Supplier" value={asset.supplier} />
              <Info label="Funding Source" value={asset.fundingSource} />
              <Info label="Warranty End" value={formatDate(asset.warrantyEnd)} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="verification">
          <Card>
            <CardContent className="p-6 text-sm">
              <Info label="Last Verified" value={formatDate(asset.lastVerifiedAt)} />
              <Button className="mt-4" variant="outline" onClick={() => navigate('/verification')}>Start Verification</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardContent className="space-y-3 p-6">
              {(timelineQuery.data ?? []).map((e) => (
                <div key={e.id} className="text-sm">
                  <span className="text-muted-foreground">{formatDate(e.date)} — </span>
                  {e.title}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function Info({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium">{value || '—'}</p>
    </div>
  )
}
