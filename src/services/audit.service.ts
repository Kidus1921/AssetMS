import type { AuditLogEntry } from '@/types/entities'
import { generateId, delay } from '@/lib/utils'
import { STORAGE_KEYS } from '@/storage/keys'
import { readStore, writeStore } from '@/storage/store'
import { usersService } from './users.service'

export async function recordAudit(params: {
  action: string
  entityType: string
  entityId: string
  summary: string
  changes?: string
  userId?: string
}): Promise<void> {
  await delay(50)
  const user = params.userId
    ? (await usersService.getById(params.userId)) ?? (await usersService.getCurrent())
    : await usersService.getCurrent()
  const entry: AuditLogEntry = {
    id: generateId('aud'),
    timestamp: new Date().toISOString(),
    userId: user.id,
    userName: user.name,
    action: params.action,
    entityType: params.entityType,
    entityId: params.entityId,
    summary: params.summary,
    changes: params.changes,
  }
  const logs = readStore<AuditLogEntry[]>(STORAGE_KEYS.auditLogs, [])
  writeStore(STORAGE_KEYS.auditLogs, [entry, ...logs].slice(0, 500))
}

export const auditService = {
  async list(): Promise<AuditLogEntry[]> {
    await delay()
    return readStore<AuditLogEntry[]>(STORAGE_KEYS.auditLogs, [])
  },
  recordAudit,
}
