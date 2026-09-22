import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useLookupMaps } from '@/hooks/useLookupMaps'
import { assetsService } from '@/services/assets.service'
import { locationsService } from '@/services/locations.service'

function LocationTable({ rows }: { rows: { name: string; meta?: string }[] }) {
  return (
    <Card>
      <Table>
        <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Details</TableHead></TableRow></TableHeader>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.name}><TableCell>{r.name}</TableCell><TableCell className="text-muted-foreground">{r.meta}</TableCell></TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}

export function BuildingsPage() {
  const buildings = useQuery({ queryKey: ['buildings'], queryFn: () => locationsService.getBuildings() })
  return (
    <div className="space-y-6">
      <PageHeader title="Buildings" />
      <LocationTable rows={(buildings.data ?? []).map((b) => ({ name: b.name }))} />
    </div>
  )
}

export function FloorsPage() {
  const lookup = useLookupMaps()
  return (
    <div className="space-y-6">
      <PageHeader title="Floors" />
      <LocationTable rows={lookup.floors.map((f) => ({ name: f.name, meta: lookup.buildingMap.get(f.buildingId) }))} />
    </div>
  )
}

export function DepartmentsLocationPage() {
  const lookup = useLookupMaps()
  return (
    <div className="space-y-6">
      <PageHeader title="Departments" />
      <LocationTable rows={lookup.departments.map((d) => ({ name: d.name, meta: d.code }))} />
    </div>
  )
}

export function RoomsPage() {
  const { roomId } = useParams()
  const lookup = useLookupMaps()
  const roomDetail = useQuery({ queryKey: ['room', roomId], queryFn: () => locationsService.getRoomById(roomId!), enabled: !!roomId })
  const roomAssets = useQuery({
    queryKey: ['roomAssets', roomId],
    queryFn: () => assetsService.getAll({ roomId }),
    enabled: !!roomId,
  })

  if (roomId && roomDetail.data) {
    const r = roomDetail.data
    const good = (roomAssets.data ?? []).filter((a) => ['Excellent', 'Good'].includes(a.condition)).length
    const fair = (roomAssets.data ?? []).filter((a) => a.condition === 'Fair').length
    const damaged = (roomAssets.data ?? []).filter((a) => a.condition === 'Damaged').length
    const maintenance = (roomAssets.data ?? []).filter((a) => a.status === 'Under Maintenance').length
    return (
      <div className="space-y-6">
        <PageHeader title={`Room ${r.name}`} description={`${lookup.buildingMap.get(r.buildingId)} · ${lookup.floorMap.get(r.floorId)} · ${lookup.departmentMap.get(r.departmentId)}`} />
        <Card><CardContent className="grid grid-cols-2 gap-4 p-6 sm:grid-cols-5 text-sm">
          <Stat label="Total Assets" value={(roomAssets.data ?? []).length} />
          <Stat label="Good" value={good} />
          <Stat label="Fair" value={fair} />
          <Stat label="Damaged" value={damaged} />
          <Stat label="Maintenance" value={maintenance} />
        </CardContent></Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Rooms" description="Select a room row to open detail routes like /locations/rooms/:roomId" />
      <LocationTable
        rows={lookup.rooms.map((r) => ({
          name: r.name,
          meta: `${lookup.buildingMap.get(r.buildingId)} / ${lookup.departmentMap.get(r.departmentId)}`,
        }))}
      />
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-xl font-semibold">{value}</p>
    </div>
  )
}
