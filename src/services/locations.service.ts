import type { Building, Floor, Room } from '@/types/entities'
import { delay } from '@/lib/utils'
import { STORAGE_KEYS } from '@/storage/keys'
import { readStore } from '@/storage/store'

export const locationsService = {
  async getBuildings(): Promise<Building[]> {
    await delay()
    return readStore<Building[]>(STORAGE_KEYS.buildings, [])
  },
  async getFloors(buildingId?: string): Promise<Floor[]> {
    await delay()
    const all = readStore<Floor[]>(STORAGE_KEYS.floors, [])
    return buildingId ? all.filter((f) => f.buildingId === buildingId) : all
  },
  async getRooms(filters?: { floorId?: string; buildingId?: string; departmentId?: string }): Promise<Room[]> {
    await delay()
    let all = readStore<Room[]>(STORAGE_KEYS.rooms, [])
    if (filters?.floorId) all = all.filter((r) => r.floorId === filters.floorId)
    if (filters?.buildingId) all = all.filter((r) => r.buildingId === filters.buildingId)
    if (filters?.departmentId) all = all.filter((r) => r.departmentId === filters.departmentId)
    return all
  },
  async getRoomById(id: string): Promise<Room | undefined> {
    await delay(200)
    return readStore<Room[]>(STORAGE_KEYS.rooms, []).find((r) => r.id === id)
  },
}
