import type { Asset } from '@/types/entities'
import { delay } from '@/lib/utils'
import { assetsService } from './assets.service'
import { departmentsService } from './departments.service'

export interface DashboardStats {
  totalAssets: number
  activeAssets: number
  underMaintenance: number
  missing: number
  damaged: number
  unlabeled: number
  totalAcquisition: number
  currentEstimatedValue: number
  maintenanceCost: number
  byDepartment: { name: string; count: number }[]
  byCondition: { name: string; value: number }[]
  byStatus: { name: string; value: number }[]
  maintenanceOverview: { name: string; value: number }[]
  recentActivity: { id: string; text: string; date: string }[]
}

function straightLineValue(asset: Asset): number {
  if (!asset.acquisitionCost || !asset.acquisitionDate || !asset.usefulLifeYears) {
    return asset.acquisitionCost ?? 0
  }
  const acquired = new Date(asset.acquisitionDate).getTime()
  const years = (Date.now() - acquired) / (365.25 * 86400000)
  const annual = (asset.acquisitionCost - (asset.salvageValue ?? 0)) / asset.usefulLifeYears
  const depreciated = asset.acquisitionCost - annual * Math.min(years, asset.usefulLifeYears)
  return Math.max(depreciated, asset.salvageValue ?? 0)
}

export const reportsService = {
  async getDashboardStats(): Promise<DashboardStats> {
    await delay(600)
    const [assets, departments] = await Promise.all([
      assetsService.getAll(),
      departmentsService.getDepartments(),
    ])

    const byDeptMap = new Map<string, number>()
    assets.forEach((a) => byDeptMap.set(a.departmentId, (byDeptMap.get(a.departmentId) ?? 0) + 1))

    const byConditionMap = new Map<string, number>()
    assets.forEach((a) => byConditionMap.set(a.condition, (byConditionMap.get(a.condition) ?? 0) + 1))

    const byStatusMap = new Map<string, number>()
    assets.forEach((a) => byStatusMap.set(a.status, (byStatusMap.get(a.status) ?? 0) + 1))

    const totalAcquisition = assets.reduce((s, a) => s + (a.acquisitionCost ?? 0), 0)
    const currentEstimatedValue = assets.reduce((s, a) => s + straightLineValue(a), 0)

    return {
      totalAssets: assets.length,
      activeAssets: assets.filter((a) => ['Active', 'In Use'].includes(a.status)).length,
      underMaintenance: assets.filter((a) => a.status === 'Under Maintenance').length,
      missing: assets.filter((a) => ['Missing', 'Lost'].includes(a.status)).length,
      damaged: assets.filter((a) => a.condition === 'Damaged').length,
      unlabeled: assets.filter((a) => !a.labelAttached).length,
      totalAcquisition,
      currentEstimatedValue: Math.round(currentEstimatedValue),
      maintenanceCost: 472000,
      byDepartment: departments.map((d) => ({
        name: d.name.split('/')[0].trim(),
        count: byDeptMap.get(d.id) ?? 0,
      })),
      byCondition: [...byConditionMap.entries()].map(([name, value]) => ({ name, value })),
      byStatus: [...byStatusMap.entries()].map(([name, value]) => ({ name, value })),
      maintenanceOverview: [
        { name: 'Overdue', value: 4 },
        { name: 'Due This Week', value: 7 },
        { name: 'Due This Month', value: 18 },
        { name: 'Completed', value: 42 },
      ],
      recentActivity: [
        { id: '1', text: 'Asset AST-000124 registered', date: new Date().toISOString() },
        { id: '2', text: 'Asset AST-000131 transferred', date: new Date().toISOString() },
        { id: '3', text: 'Maintenance completed', date: new Date().toISOString() },
        { id: '4', text: 'Asset AST-000214 verified', date: new Date().toISOString() },
        { id: '5', text: 'New asset request created', date: new Date().toISOString() },
      ],
    }
  },

  exportCsv(rows: Record<string, unknown>[], filename: string): void {
    if (!rows.length) return
    const headers = Object.keys(rows[0])
    const csv = [
      headers.join(','),
      ...rows.map((r) => headers.map((h) => JSON.stringify(r[h] ?? '')).join(',')),
    ].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  },
}
