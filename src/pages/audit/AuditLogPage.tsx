import { useQuery } from '@tanstack/react-query'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent } from '@/components/ui/card'
import { auditService } from '@/services/audit.service'

export function AuditLogPage() {
  const logs = useQuery({ queryKey: ['auditLogs'], queryFn: () => auditService.list() })

  return (
    <div className="space-y-6">
      <PageHeader title="Audit Log" description="Important operations recorded from the frontend" />
      <Card>
        <CardContent className="divide-y p-0">
          {(logs.data ?? []).map((log) => (
            <div key={log.id} className="px-4 py-4 text-sm">
              <p className="text-xs text-muted-foreground">{new Date(log.timestamp).toLocaleString()}</p>
              <p className="font-medium">{log.summary}</p>
              {log.changes ? <p className="text-muted-foreground">{log.changes}</p> : null}
              <p className="text-xs text-muted-foreground">{log.action} · {log.entityType}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
