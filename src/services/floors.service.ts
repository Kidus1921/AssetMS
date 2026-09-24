import type { Floor } from '@/types/entities'
import { STORAGE_KEYS } from '@/storage/keys'
import { readStore } from '@/storage/store'
import { isSupabaseConfigured, supabase, withSupabaseFallback } from '@/lib/supabase'

const fallbackFloors = () => readStore<Floor[]>(STORAGE_KEYS.floors, [])

export const floorsService = {
  async getAll(buildingId?: string): Promise<Floor[]> {
    return withSupabaseFallback(async () => {
      if (!isSupabaseConfigured()) {
        return fallbackFloors().filter((floor) => !buildingId || floor.buildingId === buildingId)
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
    }, fallbackFloors().filter((floor) => !buildingId || floor.buildingId === buildingId))
  },
}
