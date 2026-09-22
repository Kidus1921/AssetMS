import type { MaintenanceWorkOrder, PreventiveSchedule } from '@/types/entities'
import { delay, generateId } from '@/lib/utils'
import { STORAGE_KEYS } from '@/storage/keys'
import { readStore, writeStore } from '@/storage/store'
import { recordAudit } from './audit.service'
import { assetsService } from './assets.service'
import { notificationsService } from './notifications.service'

export const maintenanceService = {
  async getWorkOrders(): Promise<MaintenanceWorkOrder[]> {
    await delay()
    return readStore<MaintenanceWorkOrder[]>(STORAGE_KEYS.maintenance, [])
  },

  async createWorkOrder(
    input: Omit<MaintenanceWorkOrder, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<MaintenanceWorkOrder> {
    await delay(400)
    const now = new Date().toISOString()
    const order: MaintenanceWorkOrder = { ...input, id: generateId('mnt'), createdAt: now, updatedAt: now }
    const all = readStore<MaintenanceWorkOrder[]>(STORAGE_KEYS.maintenance, [])
    writeStore(STORAGE_KEYS.maintenance, [...all, order])
    await assetsService.update(input.assetId, { status: 'Under Maintenance' })
    await recordAudit({
      action: 'Maintenance Created',
      entityType: 'maintenance',
      entityId: order.id,
      summary: `Work order created for asset ${input.assetId}`,
    })
    return order
  },

  async updateWorkOrder(id: string, patch: Partial<MaintenanceWorkOrder>): Promise<MaintenanceWorkOrder> {
    await delay(400)
    const all = readStore<MaintenanceWorkOrder[]>(STORAGE_KEYS.maintenance, [])
    const idx = all.findIndex((w) => w.id === id)
    if (idx === -1) throw new Error('Work order not found')
    const updated = { ...all[idx], ...patch, updatedAt: new Date().toISOString() }
    all[idx] = updated
    writeStore(STORAGE_KEYS.maintenance, all)
    if (patch.status === 'Completed') {
      await assetsService.update(updated.assetId, { status: 'Active' })
      await recordAudit({
        action: 'Maintenance Completed',
        entityType: 'maintenance',
        entityId: id,
        summary: 'Maintenance completed',
      })
      await notificationsService.add({
        title: 'Maintenance completed',
        message: `Work order ${id} completed`,
        type: 'maintenance',
        link: '/maintenance/work-orders',
      })
    }
    return updated
  },

  async getSchedules(): Promise<PreventiveSchedule[]> {
    await delay()
    return readStore<PreventiveSchedule[]>(STORAGE_KEYS.schedules, [])
  },
}
