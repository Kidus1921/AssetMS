import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent } from '@/components/ui/card'

export function DisposalsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Disposal" description="Active → Pending Disposal → Approved → Disposed (records retained)" />
      <Card>
        <CardContent className="p-6 text-sm text-muted-foreground">
          Disposal workflow forms connect to the disposals service and preserve asset history without deletion.
        </CardContent>
      </Card>
    </div>
  )
}
