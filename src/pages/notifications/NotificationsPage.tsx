import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { notificationsService } from '@/services/notifications.service'

export function NotificationsPage() {
  const queryClient = useQueryClient()
  const notifications = useQuery({ queryKey: ['notifications'], queryFn: () => notificationsService.list() })

  const markAll = useMutation({
    mutationFn: () => notificationsService.markAllRead(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        actions={<Button variant="outline" onClick={() => markAll.mutate()}>Mark all read</Button>}
      />
      <div className="space-y-3">
        {(notifications.data ?? []).map((n) => (
          <Card key={n.id} className={n.read ? 'opacity-70' : ''}>
            <CardContent className="flex items-start justify-between gap-4 p-4">
              <div>
                <p className="font-medium">{n.title}</p>
                <p className="text-sm text-muted-foreground">{n.message}</p>
                <p className="mt-1 text-xs text-muted-foreground">{new Date(n.createdAt).toLocaleString()}</p>
              </div>
              {n.link ? (
                <Button asChild size="sm" variant="outline">
                  <Link to={n.link}>Open</Link>
                </Button>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
