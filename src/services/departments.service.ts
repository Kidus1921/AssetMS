import type { Department, SubDepartment } from '@/types/entities'
import { delay } from '@/lib/utils'
import { STORAGE_KEYS } from '@/storage/keys'
import { readStore } from '@/storage/store'

export const departmentsService = {
  async getDepartments(): Promise<Department[]> {
    await delay()
    return readStore<Department[]>(STORAGE_KEYS.departments, [])
  },
  async getSubDepartments(departmentId?: string): Promise<SubDepartment[]> {
    await delay()
    const all = readStore<SubDepartment[]>(STORAGE_KEYS.subDepartments, [])
    return departmentId ? all.filter((s) => s.departmentId === departmentId) : all
  },
}
