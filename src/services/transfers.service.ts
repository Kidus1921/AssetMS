import type { Transfer } from '@/types/entities'
import type { TransferStatus } from '@/types/enums'
import { delay, generateId } from '@/lib/utils'
import { STORAGE_KEYS } from '@/storage/keys'
import { readStore, writeStore } from '@/storage/store'
import { recordAudit } from './audit.service'
import { assetsService } from './assets.service'
import { notificationsService } from './notifications.service'

export const transfersService = {
  async list(): Promise<Transfer[]> {
    await delay()
    return readStore<Transfer[]>(STORAGE_KEYS.transfers, [])
  },

  async create(input: Omit<Transfer, 'id' | 'createdAt' | 'status'>): Promise<Transfer> {
    await delay(400)
    const transfer: Transfer = {
      ...input,
      id: generateId('trf'),
      status: 'Requested',
      createdAt: new Date().toISOString(),
    }
    const all = readStore<Transfer[]>(STORAGE_KEYS.transfers, [])
    writeStore(STORAGE_KEYS.transfers, [...all, transfer])
    await recordAudit({
      action: 'Transfer Requested',
      entityType: 'transfer',
      entityId: transfer.id,
      summary: `Transfer requested for ${input.assetId}`,
    })
    return transfer
  },

  async updateStatus(id: string, status: TransferStatus, locationPatch?: {
    departmentId?: string
    buildingId?: string
    floorId?: string
    roomId?: string
  }): Promise<Transfer> {
    await delay(400)
    const all = readStore<Transfer[]>(STORAGE_KEYS.transfers, [])
    const idx = all.findIndex((t) => t.id === id)
    if (idx === -1) throw new Error('Transfer not found')
    const updated: Transfer = {
      ...all[idx],
      status,
      completedAt: status === 'Transferred' ? new Date().toISOString() : all[idx].completedAt,
    }
    all[idx] = updated
    writeStore(STORAGE_KEYS.transfers, all)
    if (status === 'Transferred' && locationPatch) {
      await assetsService.update(updated.assetId, locationPatch)
      await recordAudit({
        action: 'Asset Transferred',
        entityType: 'transfer',
        entityId: id,
        summary: `Asset transferred to ${updated.toLocation}`,
      })
      await notificationsService.add({
        title: 'Transfer approved',
        message: updated.toLocation,
        type: 'transfer',
        link: '/transfers',
      })
    }
    return updated
  },
}
