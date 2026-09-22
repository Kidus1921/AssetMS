import type { AssetRequest } from '@/types/entities'
import type { RequestStatus } from '@/types/enums'
import { delay, generateId } from '@/lib/utils'
import { STORAGE_KEYS } from '@/storage/keys'
import { readStore, writeStore } from '@/storage/store'
import { notificationsService } from './notifications.service'

export const requestsService = {
  async list(): Promise<AssetRequest[]> {
    await delay()
    return readStore<AssetRequest[]>(STORAGE_KEYS.requests, [])
  },

  async create(input: Omit<AssetRequest, 'id' | 'status' | 'createdAt'>): Promise<AssetRequest> {
    await delay(400)
    const req: AssetRequest = {
      ...input,
      id: generateId('req'),
      status: 'Pending',
      createdAt: new Date().toISOString(),
    }
    const all = readStore<AssetRequest[]>(STORAGE_KEYS.requests, [])
    writeStore(STORAGE_KEYS.requests, [...all, req])
    await notificationsService.add({
      title: 'Asset request received',
      message: req.requestedItem,
      type: 'request',
      link: '/requests',
    })
    return req
  },

  async updateStatus(id: string, status: RequestStatus): Promise<AssetRequest> {
    await delay(300)
    const all = readStore<AssetRequest[]>(STORAGE_KEYS.requests, [])
    const idx = all.findIndex((r) => r.id === id)
    if (idx === -1) throw new Error('Request not found')
    all[idx] = { ...all[idx], status }
    writeStore(STORAGE_KEYS.requests, all)
    return all[idx]
  },
}
