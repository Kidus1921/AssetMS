import type { Department, SubDepartment } from '@/types/entities'
import { delay } from '@/lib/utils'
import { STORAGE_KEYS } from '@/storage/keys'
import { readStore } from '@/storage/store'
import { isSupabaseConfigured, supabase, withSupabaseFallback } from '@/lib/supabase'

const fallbackDepartments = () => readStore<Department[]>(STORAGE_KEYS.departments, [])
const fallbackSubDepartments = () => readStore<SubDepartment[]>(STORAGE_KEYS.subDepartments, [])

export const departmentsService = {
  async getDepartments(): Promise<Department[]> {
    return withSupabaseFallback(async () => {
      if (!isSupabaseConfigured()) {
        return fallbackDepartments()
      }

      const { data, error } = await supabase.from('departments').select('*').order('name')
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
    }, fallbackDepartments())
  },

  async getSubDepartments(departmentId?: string): Promise<SubDepartment[]> {
    return withSupabaseFallback(async () => {
      if (!isSupabaseConfigured()) {
        const all = fallbackSubDepartments()
        return departmentId ? all.filter((s) => s.departmentId === departmentId) : all
      }

      let query = supabase.from('sub_departments').select('*')
      if (departmentId) query = query.eq('department_id', departmentId)

      const { data, error } = await query.order('name')
      if (error) throw error

      return (data ?? []).map((row) => ({
        id: row.id,
        departmentId: row.department_id,
        name: row.name,
        code: row.code ?? undefined,
        description: row.description ?? undefined,
        status: row.status ?? 'Active',
        isActive: row.is_active ?? true,
        createdAt: row.created_at ?? undefined,
      }))
    }, fallbackSubDepartments().filter((s) => !departmentId || s.departmentId === departmentId))
  },

  async createDepartment(payload: Partial<Department>): Promise<Department> {
    await delay(200)
    if (!isSupabaseConfigured()) {
      const item: Department = { id: `dept_${Date.now()}`, name: payload.name ?? 'New Department', status: 'Active', isActive: true }
      return item
    }

    const { data, error } = await supabase
      .from('departments')
      .insert({
        name: payload.name,
        code: payload.code ?? null,
        description: payload.description ?? null,
        status: payload.status ?? 'Active',
        is_active: payload.isActive ?? true,
      })
      .select()
      .single()

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
