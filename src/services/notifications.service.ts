import type { Notification } from '@/types/entities'
import { delay, generateId } from '@/lib/utils'
import { STORAGE_KEYS } from '@/storage/keys'
import { readStore, writeStore } from '@/storage/store'

export const notificationsService = {
  async list(): Promise<Notification[]> {
    await delay()
    return readStore<Notification[]>(STORAGE_KEYS.notifications, [])
  },
  async add(notification: Omit<Notification, 'id' | 'createdAt' | 'read'>): Promise<Notification> {
    await delay(100)
    const item: Notification = {
      ...notification,
      id: generateId('ntf'),
      read: false,
      createdAt: new Date().toISOString(),
    }
    const all = readStore<Notification[]>(STORAGE_KEYS.notifications, [])
    writeStore(STORAGE_KEYS.notifications, [item, ...all])
    return item
  },
  async markRead(id: string): Promise<void> {
    await delay(100)
    const all = readStore<Notification[]>(STORAGE_KEYS.notifications, [])
    writeStore(
      STORAGE_KEYS.notifications,
      all.map((n) => (n.id === id ? { ...n, read: true } : n)),
    )
  },
  async markAllRead(): Promise<void> {
    await delay(100)
    const all = readStore<Notification[]>(STORAGE_KEYS.notifications, [])
    writeStore(
      STORAGE_KEYS.notifications,
      all.map((n) => ({ ...n, read: true })),
    )
  },
}
