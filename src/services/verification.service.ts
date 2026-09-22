import type { VerificationLine, VerificationSession } from '@/types/entities'
import { delay, generateId } from '@/lib/utils'
import { STORAGE_KEYS } from '@/storage/keys'
import { readStore, writeStore } from '@/storage/store'
import { recordAudit } from './audit.service'
import { assetsService } from './assets.service'

export const verificationService = {
  async listSessions(): Promise<VerificationSession[]> {
    await delay()
    return readStore<VerificationSession[]>(STORAGE_KEYS.verificationSessions, [])
  },

  async getLines(sessionId: string): Promise<VerificationLine[]> {
    await delay()
    return readStore<VerificationLine[]>(STORAGE_KEYS.verificationLines, []).filter(
      (l) => l.sessionId === sessionId,
    )
  },

  async startSession(
    input: Omit<
      VerificationSession,
      'id' | 'expectedCount' | 'verifiedCount' | 'missingCount' | 'unexpectedCount' | 'damagedCount' | 'status' | 'createdAt'
    >,
    assetIds: string[],
  ): Promise<VerificationSession> {
    await delay(500)
    const session: VerificationSession = {
      ...input,
      id: generateId('ver'),
      expectedCount: assetIds.length,
      verifiedCount: 0,
      missingCount: 0,
      unexpectedCount: 0,
      damagedCount: 0,
      status: 'In Progress',
      createdAt: new Date().toISOString(),
    }
    const sessions = readStore<VerificationSession[]>(STORAGE_KEYS.verificationSessions, [])
    writeStore(STORAGE_KEYS.verificationSessions, [...sessions, session])
    const lines: VerificationLine[] = assetIds.map((assetId) => ({
      id: generateId('vl'),
      sessionId: session.id,
      assetId,
      state: 'Expected',
    }))
    const allLines = readStore<VerificationLine[]>(STORAGE_KEYS.verificationLines, [])
    writeStore(STORAGE_KEYS.verificationLines, [...allLines, ...lines])
    return session
  },

  async updateLine(sessionId: string, lineId: string, state: VerificationLine['state'], note?: string): Promise<void> {
    await delay(300)
    const lines = readStore<VerificationLine[]>(STORAGE_KEYS.verificationLines, [])
    const updated = lines.map((l) => (l.id === lineId ? { ...l, state, note } : l))
    writeStore(STORAGE_KEYS.verificationLines, updated)
    const sessionLines = updated.filter((l) => l.sessionId === sessionId)
    const counts = {
      verifiedCount: sessionLines.filter((l) => l.state === 'Verified').length,
      missingCount: sessionLines.filter((l) => l.state === 'Missing').length,
      unexpectedCount: sessionLines.filter((l) => l.state === 'Unexpected').length,
      damagedCount: sessionLines.filter((l) => l.state === 'Damaged').length,
    }
    const sessions = readStore<VerificationSession[]>(STORAGE_KEYS.verificationSessions, [])
    writeStore(
      STORAGE_KEYS.verificationSessions,
      sessions.map((s) => (s.id === sessionId ? { ...s, ...counts } : s)),
    )
    const line = updated.find((l) => l.id === lineId)
    if (line && state === 'Missing') {
      await assetsService.update(line.assetId, { status: 'Missing' })
    }
    if (line && state === 'Verified') {
      await assetsService.update(line.assetId, { lastVerifiedAt: new Date().toISOString() })
    }
  },

  async completeSession(sessionId: string): Promise<void> {
    await delay(300)
    const sessions = readStore<VerificationSession[]>(STORAGE_KEYS.verificationSessions, [])
    writeStore(
      STORAGE_KEYS.verificationSessions,
      sessions.map((s) => (s.id === sessionId ? { ...s, status: 'Completed' } : s)),
    )
    await recordAudit({
      action: 'Verification Completed',
      entityType: 'verification',
      entityId: sessionId,
      summary: 'Physical verification session completed',
    })
  },
}
