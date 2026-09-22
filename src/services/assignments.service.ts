import type { Assignment } from '@/types/entities'
import { delay, generateId } from '@/lib/utils'
import { STORAGE_KEYS } from '@/storage/keys'
import { readStore, writeStore } from '@/storage/store'
import { recordAudit } from './audit.service'
import { assetsService } from './assets.service'

export const assignmentsService = {
  async list(): Promise<Assignment[]> {
    await delay()
    return readStore<Assignment[]>(STORAGE_KEYS.assignments, [])
  },

  async getByAsset(assetId: string): Promise<Assignment[]> {
    await delay()
    return readStore<Assignment[]>(STORAGE_KEYS.assignments, [])
      .filter((a) => a.assetId === assetId)
      .sort((a, b) => new Date(b.assignedDate).getTime() - new Date(a.assignedDate).getTime())
  },

  async assign(input: Omit<Assignment, 'id' | 'createdAt' | 'active'>): Promise<Assignment> {
    await delay(400)
    const all = readStore<Assignment[]>(STORAGE_KEYS.assignments, [])
    const deactivated = all.map((a) =>
      a.assetId === input.assetId && a.active ? { ...a, active: false } : a,
    )
    const assignment: Assignment = {
      ...input,
      id: generateId('asg'),
      active: true,
      createdAt: new Date().toISOString(),
    }
    writeStore(STORAGE_KEYS.assignments, [...deactivated, assignment])
    await assetsService.update(input.assetId, {
      assignedUserId: input.userId,
      departmentId: input.departmentId,
      status: 'In Use',
    })
    await recordAudit({
      action: 'Asset Assigned',
      entityType: 'assignment',
      entityId: assignment.id,
      summary: `Asset assigned to ${input.userId}`,
    })
    return assignment
  },
}
