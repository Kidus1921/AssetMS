import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency } from '@/lib/utils'
import { reportsService } from '@/services/reports.service'

const COLORS = ['#16a34a', '#22c55e', '#4ade80', '#86efac', '#f59e0b', '#ef4444']

export function DashboardPage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: () => reportsService.getDashboardStats(),
  })

  if (isError) {
    return (
      <div className="rounded-xl border p-8 text-center">
        <h2 className="font-semibold">Something went wrongg</h2>
        <p className="mt-2 text-sm text-muted-foreground">We couldn&apos;t load the dashboard.</p>
        <Button className="mt-4" onClick={() => refetch()}>
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Welcome Back"
        description="Asset lifecycle overview across your organization"
        actions={
          <>
            <Button variant="outline" asChild>
              <Link to="/reports">Reports</Link>
            </Button>
            <Button asChild>
              <Link to="/assets/new">+ Add Asset</Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        {[
          ['Total Assets', data?.totalAssets],
          ['Active Assets', data?.activeAssets],
          ['Under Maintenance', data?.underMaintenance],
          ['Missing', data?.missing],
          ['Damaged', data?.damaged],
          ['Unlabeled', data?.unlabeled],
        ].map(([label, value]) => (
          <Card key={label as string}>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">{label}</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-8 w-20" /> : <p className="text-2xl font-bold">{value}</p>}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          ['Total Acquisition Value', data ? formatCurrency(data.totalAcquisition) : '—'],
          ['Current Estimated Value', data ? formatCurrency(data.currentEstimatedValue) : '—'],
          ['Maintenance Cost', data ? formatCurrency(data.maintenanceCost) : '—'],
        ].map(([label, value]) => (
          <Card key={label as string}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">{label}</CardTitle>
            </CardHeader>
            <CardContent>{isLoading ? <Skeleton className="h-7 w-32" /> : <p className="text-xl font-semibold">{value}</p>}</CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Assets by Department</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            {isLoading ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.byDepartment ?? []}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#16a34a" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Assets by Condition</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            {isLoading ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data?.byCondition ?? []} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90}>
                    {(data?.byCondition ?? []).map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Asset Status</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.byStatus ?? []} layout="vertical">
                <XAxis type="number" allowDecimals={false} />
                <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#15803d" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Maintenance Overview</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            {(data?.maintenanceOverview ?? []).map((item) => (
              <div key={item.name} className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">{item.name}</p>
                <p className="text-xl font-semibold">{item.value}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {(data?.recentActivity ?? []).map((item) => (
              <div key={item.id} className="flex gap-3 border-l-2 border-primary/30 pl-4">
                <div>
                  <p className="text-sm">{item.text}</p>
                  <p className="text-xs text-muted-foreground">{new Date(item.date).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            {[
              ['/assets/new', '+ Add Asset'],
              ['/verification/scan', 'Scan Asset'],
              ['/assets/import', 'Import Excel'],
              ['/transfers', 'Create Transfer'],
              ['/maintenance/work-orders', 'Create Maintenance'],
              ['/verification', 'Start Verification'],
            ].map(([href, label]) => (
              <Button key={href} variant="outline" className="justify-start" asChild>
                <Link to={href}>{label}</Link>
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
