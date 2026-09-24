import type { Category } from '@/types/entities'
import { STORAGE_KEYS } from '@/storage/keys'
import { readStore } from '@/storage/store'
import { isSupabaseConfigured, supabase, withSupabaseFallback } from '@/lib/supabase'

const fallbackCategories = () => readStore<Category[]>(STORAGE_KEYS.categories, [])

export const categoriesService = {
  async getAll(): Promise<Category[]> {
    return withSupabaseFallback(async () => {
      if (!isSupabaseConfigured()) {
        return fallbackCategories()
      }

      const { data, error } = await supabase.from('asset_categories').select('*').order('name')
      if (error) throw error

      return (data ?? []).map((row) => ({
        id: row.id,
        name: row.name,
        description: row.description ?? undefined,
        status: row.status ?? 'Active',
        isActive: row.is_active ?? true,
      }))
    }, fallbackCategories())
  },
}
