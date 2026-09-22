import { useQuery } from '@tanstack/react-query'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { assetsService } from '@/services/assets.service'
import { reportsService } from '@/services/reports.service'

function straightLine(cost: number, salvage: number, life: number, acquired?: string) {
  if (!acquired || !life) return cost
  const years = (Date.now() - new Date(acquired).getTime()) / (365.25 * 86400000)
  const annual = (cost - salvage) / life
  return Math.max(cost - annual * Math.min(years, life), salvage)
}

export function AcquisitionPage() {
  const stats = useQuery({ queryKey: ['dashboardStats'], queryFn: () => reportsService.getDashboardStats() })
  const assets = useQuery({ queryKey: ['assets'], queryFn: () => assetsService.getAll() })
  const now = new Date()
  const month = (assets.data ?? []).filter((a) => a.acquisitionDate && new Date(a.acquisitionDate).getMonth() === now.getMonth()).length
  const year = (assets.data ?? []).filter((a) => a.acquisitionDate && new Date(a.acquisitionDate).getFullYear() === now.getFullYear()).length

  return (
    <div className="space-y-6">
      <PageHeader title="Acquisition" description="Purchase value and acquisition trends (ETB)" />
      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader><CardTitle className="text-sm">Total Acquisition Cost</CardTitle></CardHeader><CardContent className="text-xl font-semibold">{stats.data ? formatCurrency(stats.data.totalAcquisition) : '—'}</CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Purchased This Month</CardTitle></CardHeader><CardContent className="text-xl font-semibold">{month}</CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Purchased This Year</CardTitle></CardHeader><CardContent className="text-xl font-semibold">{year}</CardContent></Card>
      </div>
      <Card>
        <CardHeader><CardTitle>Warranty Tracking</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {(assets.data ?? []).slice(0, 8).map((a) => {
            if (!a.warrantyEnd) return null
            const days = Math.ceil((new Date(a.warrantyEnd).getTime() - Date.now()) / 86400000)
            const urgency = days < 0 ? 'Expired' : days <= 30 ? 'Expiring Soon' : 'Active'
            return (
              <div key={a.id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                <div>
                  <p className="font-medium">{a.name}</p>
                  <p className="text-muted-foreground">Warranty ends {new Date(a.warrantyEnd).toLocaleDateString()}</p>
                </div>
                <span className={`rounded-full px-2 py-1 text-xs ${urgency === 'Expiring Soon' ? 'bg-amber-100 text-amber-800' : urgency === 'Expired' ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'}`}>
                  {urgency === 'Expiring Soon' ? `${days} days left` : urgency}
                </span>
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}

export function DepreciationPage() {
  const assets = useQuery({ queryKey: ['assets'], queryFn: () => assetsService.getAll() })
  return (
    <div className="space-y-6">
      <PageHeader title="Depreciation" description="Straight-line depreciation (frontend calculation)" />
      <Card>
        <CardContent className="divide-y p-0">
          {(assets.data ?? []).slice(0, 15).map((a) => {
            const current = straightLine(a.acquisitionCost ?? 0, a.salvageValue ?? 0, a.usefulLifeYears ?? 5, a.acquisitionDate)
            return (
              <div key={a.id} className="grid grid-cols-2 gap-2 px-4 py-3 text-sm md:grid-cols-4">
                <span className="font-medium">{a.assetTag}</span>
                <span>{formatCurrency(a.acquisitionCost ?? 0)}</span>
                <span>{formatCurrency(Math.round(current))}</span>
                <span className="text-muted-foreground">{a.usefulLifeYears ?? 5} yr life</span>
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}
