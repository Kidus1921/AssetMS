import type { Building } from '@/types/entities'
import { STORAGE_KEYS } from '@/storage/keys'
import { readStore } from '@/storage/store'
import { isSupabaseConfigured, supabase, withSupabaseFallback } from '@/lib/supabase'

const fallbackBuildings = () => readStore<Building[]>(STORAGE_KEYS.buildings, [])

export const buildingsService = {
  async getAll(): Promise<Building[]> {
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
        createdAt: row.created_at ?? new Date().toISOString(),
      }))
    }, fallbackBuildings())
  },
}
