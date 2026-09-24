import type { Building, Floor, Room } from '@/types/entities'
import { delay } from '@/lib/utils'
import { STORAGE_KEYS } from '@/storage/keys'
import { readStore, writeStore } from '@/storage/store'
import { isSupabaseConfigured, supabase, withSupabaseFallback } from '@/lib/supabase'

const fallbackBuildings = () => readStore<Building[]>(STORAGE_KEYS.buildings, [])
const fallbackFloors = () => readStore<Floor[]>(STORAGE_KEYS.floors, [])
const fallbackRooms = () => readStore<Room[]>(STORAGE_KEYS.rooms, [])

export const locationsService = {
  async getBuildings(): Promise<Building[]> {
    return withSupabaseFallback(async () => {
      if (!isSupabaseConfigured()) {
        return fallbackBuildings()
      }

      const { data, error } = await supabase.from('buildings').select('*').order('name')
      if (error) throw error

      return (data ?? []).map((row) => ({
        id: row.id,
        name: row.name,
        code: row.code ?? undefined,
        description: row.description ?? undefined,
        status: row.status ?? 'Active',
        isActive: row.is_active ?? true,
        createdAt: row.created_at ?? undefined,
      }))
    }, fallbackBuildings())
  },

  async getFloors(buildingId?: string): Promise<Floor[]> {
    return withSupabaseFallback(async () => {
      if (!isSupabaseConfigured()) {
        const all = fallbackFloors()
        return buildingId ? all.filter((f) => f.buildingId === buildingId) : all
      }

      let query = supabase.from('floors').select('*')
      if (buildingId) query = query.eq('building_id', buildingId)

      const { data, error } = await query.order('name')
      if (error) throw error

      return (data ?? []).map((row) => ({
        id: row.id,
        buildingId: row.building_id,
        name: row.name,
        floorNumber: row.floor_number ?? undefined,
        description: row.description ?? undefined,
        status: row.status ?? 'Active',
        isActive: row.is_active ?? true,
      }))
    }, fallbackFloors().filter((f) => !buildingId || f.buildingId === buildingId))
  },

  async getRooms(filters?: { floorId?: string; buildingId?: string; departmentId?: string }): Promise<Room[]> {
    return withSupabaseFallback(async () => {
      if (!isSupabaseConfigured()) {
        const all = fallbackRooms()
        return all.filter((room) => {
          if (filters?.floorId && room.floorId !== filters.floorId) return false
          if (filters?.buildingId && room.buildingId !== filters.buildingId) return false
          if (filters?.departmentId && room.departmentId !== filters.departmentId) return false
          return true
        })
      }

      let query = supabase.from('rooms').select('*')
      if (filters?.floorId) query = query.eq('floor_id', filters.floorId)
      if (filters?.buildingId) query = query.eq('building_id', filters.buildingId)
      if (filters?.departmentId) query = query.eq('department_id', filters.departmentId)

      const { data, error } = await query.order('name')
      if (error) throw error

      return (data ?? []).map((row) => ({
        id: row.id,
        floorId: row.floor_id,
        buildingId: row.building_id,
        departmentId: row.department_id,
        subDepartmentId: row.sub_department_id ?? undefined,
        name: row.name,
        code: row.code ?? row.room_number ?? undefined,
        description: row.description ?? undefined,
        status: row.status ?? 'Active',
        isActive: row.is_active ?? true,
      }))
    }, fallbackRooms().filter((room) => {
      if (filters?.floorId && room.floorId !== filters.floorId) return false
      if (filters?.buildingId && room.buildingId !== filters.buildingId) return false
      if (filters?.departmentId && room.departmentId !== filters.departmentId) return false
      return true
    }))
  },

  async getRoomById(id: string): Promise<Room | undefined> {
    await delay(200)
    return fallbackRooms().find((r) => r.id === id)
  },

  async createBuilding(payload: Partial<Building>): Promise<Building> {
    if (!isSupabaseConfigured()) {
      const item: Building = { id: `bld_${Date.now()}`, name: payload.name ?? 'New Building', status: 'Active', isActive: true }
      const all = readStore<Building[]>(STORAGE_KEYS.buildings, [])
      writeStore(STORAGE_KEYS.buildings, [item, ...all])
      return item
    }

    const { data, error } = await supabase.from('buildings').insert({
      name: payload.name,
      code: payload.code ?? null,
      description: payload.description ?? null,
      status: payload.status ?? 'Active',
      is_active: payload.isActive ?? true,
    }).select().single()

    if (error) throw error
    return {
      id: data.id,
      name: data.name,
      code: data.code ?? undefined,
      description: data.description ?? undefined,
      status: data.status ?? 'Active',
      isActive: data.is_active ?? true,
    }
  },
}
