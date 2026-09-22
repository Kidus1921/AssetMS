import type { User } from '@/types/entities'
import { delay } from '@/lib/utils'
import { STORAGE_KEYS } from '@/storage/keys'
import { readStore } from '@/storage/store'

export const usersService = {
  async getAll(): Promise<User[]> {
    await delay()
    return readStore<User[]>(STORAGE_KEYS.users, [])
  },
  async getById(id: string): Promise<User | undefined> {
    await delay(200)
    return readStore<User[]>(STORAGE_KEYS.users, []).find((u) => u.id === id)
  },
  async getCurrent(): Promise<User> {
    await delay(100)
    const users = readStore<User[]>(STORAGE_KEYS.users, [])
    const currentId = readStore<string>(STORAGE_KEYS.currentUserId, users[0]?.id ?? '')
    return users.find((u) => u.id === currentId) ?? users[0]
  },
}
