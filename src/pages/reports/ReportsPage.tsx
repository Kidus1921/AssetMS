import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { reportsService } from '@/services/reports.service'
import { assetsService } from '@/services/assets.service'

const sections = [
  {
    title: 'Asset Reports',
    items: ['Complete Asset Register', 'Assets by Department', 'Assets by Building', 'Assets by Room', 'Assets by Category', 'Assets by Condition', 'Assets by Status', 'Unlabeled Assets'],
  },
  {
    title: 'Maintenance Reports',
    items: ['Maintenance History', 'Maintenance Cost', 'Overdue Maintenance', 'Preventive Maintenance'],
  },
  {
    title: 'Verification Reports',
    items: ['Missing Assets', 'Verified Assets', 'Unverified Assets', 'Damaged Assets'],
  },
  {
    title: 'Financial Reports',
    items: ['Acquisition Value', 'Current Value', 'Depreciation', 'Maintenance Cost'],
  },
]

export function ReportsPage() {
  const exportRegister = async () => {
    const assets = await assetsService.getAll()
    reportsService.exportCsv(
      assets.map((a) => ({
        assetTag: a.assetTag,
        name: a.name,
        status: a.status,
        condition: a.condition,
        acquisitionCost: a.acquisitionCost,
      })),
      'asset-register.csv',
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="Filter, preview, print, and export reports in the browser"
        actions={<Button onClick={() => void exportRegister()}>Export CSV</Button>}
      />
      <div className="grid gap-4 lg:grid-cols-2">
        {sections.map((section) => (
          <Card key={section.title}>
            <CardHeader><CardTitle>{section.title}</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {section.items.map((item) => (
                <div key={item} className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm">
                  <span>{item}</span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => window.print()}>Print</Button>
                    <Button size="sm" variant="outline" onClick={() => void exportRegister()}>Export</Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
