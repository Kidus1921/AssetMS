import type { Room } from '@/types/entities'
import { STORAGE_KEYS } from '@/storage/keys'
import { readStore } from '@/storage/store'
import { isSupabaseConfigured, supabase, withSupabaseFallback } from '@/lib/supabase'

const fallbackRooms = () => readStore<Room[]>(STORAGE_KEYS.rooms, [])

export const roomsService = {
  async getAll(filters?: { buildingId?: string; floorId?: string; departmentId?: string }): Promise<Room[]> {
    return withSupabaseFallback(async () => {
      if (!isSupabaseConfigured()) {
        const all = fallbackRooms()
        return all.filter((room) => {
          if (filters?.buildingId && room.buildingId !== filters.buildingId) return false
          if (filters?.floorId && room.floorId !== filters.floorId) return false
          if (filters?.departmentId && room.departmentId !== filters.departmentId) return false
          return true
        })
      }

      let query = supabase.from('rooms').select('*')
      if (filters?.buildingId) query = query.eq('building_id', filters.buildingId)
      if (filters?.floorId) query = query.eq('floor_id', filters.floorId)
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
      if (filters?.buildingId && room.buildingId !== filters.buildingId) return false
      if (filters?.floorId && room.floorId !== filters.floorId) return false
      if (filters?.departmentId && room.departmentId !== filters.departmentId) return false
      return true
    }))
  },
}
