import type { Asset, AssetTimelineEvent, AssetDocument, Category, AssetType } from '@/types/entities'
import type { AssetCondition, AssetStatus } from '@/types/enums'
import { delay, generateId } from '@/lib/utils'
import { STORAGE_KEYS } from '@/storage/keys'
import { readStore, writeStore } from '@/storage/store'
import { recordAudit } from './audit.service'
import { notificationsService } from './notifications.service'

export interface AssetFilters {
  search?: string
  departmentId?: string
  buildingId?: string
  floorId?: string
  roomId?: string
  categoryId?: string
  typeId?: string
  condition?: AssetCondition
  status?: AssetStatus
  labelAttached?: boolean
}

function nextAssetTag(assets: Asset[]): string {
  const settings = readStore<{ tagPrefix: string }>(STORAGE_KEYS.settings, { tagPrefix: 'AST' })
  const max = assets.reduce((m, a) => {
    const num = parseInt(a.assetTag.replace(/\D/g, ''), 10)
    return Number.isNaN(num) ? m : Math.max(m, num)
  }, 0)
  return `${settings.tagPrefix}-${String(max + 1).padStart(6, '0')}`
}

function applyFilters(assets: Asset[], filters?: AssetFilters): Asset[] {
  if (!filters) return assets
  let result = [...assets]
  if (filters.search) {
    const q = filters.search.toLowerCase()
    result = result.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.assetTag.toLowerCase().includes(q) ||
        (a.serialNumber?.toLowerCase().includes(q) ?? false),
    )
  }
  if (filters.departmentId) result = result.filter((a) => a.departmentId === filters.departmentId)
  if (filters.buildingId) result = result.filter((a) => a.buildingId === filters.buildingId)
  if (filters.floorId) result = result.filter((a) => a.floorId === filters.floorId)
  if (filters.roomId) result = result.filter((a) => a.roomId === filters.roomId)
  if (filters.categoryId) result = result.filter((a) => a.categoryId === filters.categoryId)
  if (filters.typeId) result = result.filter((a) => a.typeId === filters.typeId)
  if (filters.condition) result = result.filter((a) => a.condition === filters.condition)
  if (filters.status) result = result.filter((a) => a.status === filters.status)
  if (filters.labelAttached !== undefined)
    result = result.filter((a) => a.labelAttached === filters.labelAttached)
  return result
}

export const assetsService = {
  async getAll(filters?: AssetFilters): Promise<Asset[]> {
    await delay()
    return applyFilters(readStore<Asset[]>(STORAGE_KEYS.assets, []), filters)
  },

  async getById(id: string): Promise<Asset | undefined> {
    await delay()
    return readStore<Asset[]>(STORAGE_KEYS.assets, []).find((a) => a.id === id)
  },

  async getByTag(tag: string): Promise<Asset | undefined> {
    await delay()
    return readStore<Asset[]>(STORAGE_KEYS.assets, []).find(
      (a) => a.assetTag.toLowerCase() === tag.toLowerCase(),
    )
  },

  async create(input: Omit<Asset, 'id' | 'assetTag' | 'createdAt' | 'updatedAt'> & { assetTag?: string }): Promise<Asset> {
    await delay(500)
    const assets = readStore<Asset[]>(STORAGE_KEYS.assets, [])
    const now = new Date().toISOString()
    const asset: Asset = {
      ...input,
      id: generateId('ast'),
      assetTag: input.assetTag ?? nextAssetTag(assets),
      createdAt: now,
      updatedAt: now,
    }
    writeStore(STORAGE_KEYS.assets, [...assets, asset])
    const timelines = readStore<AssetTimelineEvent[]>(STORAGE_KEYS.timelines, [])
    writeStore(STORAGE_KEYS.timelines, [
      ...timelines,
      { id: generateId('tl'), assetId: asset.id, date: now, title: 'Asset registered' },
    ])
    await recordAudit({
      action: 'Asset Created',
      entityType: 'asset',
      entityId: asset.id,
      summary: `Asset ${asset.assetTag} created`,
    })
    await notificationsService.add({
      title: 'Asset registered',
      message: `${asset.assetTag} — ${asset.name}`,
      type: 'system',
      link: `/assets/${asset.id}`,
    })
    return asset
  },

  async update(id: string, patch: Partial<Asset>): Promise<Asset> {
    await delay(400)
    const assets = readStore<Asset[]>(STORAGE_KEYS.assets, [])
    const idx = assets.findIndex((a) => a.id === id)
    if (idx === -1) throw new Error('Asset not found')
    const prev = assets[idx]
    const updated: Asset = { ...prev, ...patch, updatedAt: new Date().toISOString() }
    assets[idx] = updated
    writeStore(STORAGE_KEYS.assets, assets)
    const changes: string[] = []
    if (patch.condition && patch.condition !== prev.condition)
      changes.push(`Condition: ${prev.condition} → ${patch.condition}`)
    if (patch.status && patch.status !== prev.status)
      changes.push(`Status: ${prev.status} → ${patch.status}`)
    await recordAudit({
      action: 'Asset Updated',
      entityType: 'asset',
      entityId: id,
      summary: `Updated ${updated.assetTag}`,
      changes: changes.join('; ') || undefined,
    })
    return updated
  },

  async bulkUpdate(ids: string[], patch: Partial<Asset>): Promise<void> {
    await delay(500)
    for (const id of ids) {
      await assetsService.update(id, patch)
    }
  },

  async getCategories(): Promise<Category[]> {
    await delay(200)
    return readStore<Category[]>(STORAGE_KEYS.categories, [])
  },

  async getTypes(categoryId?: string): Promise<AssetType[]> {
    await delay(200)
    const all = readStore<AssetType[]>(STORAGE_KEYS.assetTypes, [])
    return categoryId ? all.filter((t) => t.categoryId === categoryId) : all
  },

  async getTimeline(assetId: string): Promise<AssetTimelineEvent[]> {
    await delay()
    return readStore<AssetTimelineEvent[]>(STORAGE_KEYS.timelines, [])
      .filter((t) => t.assetId === assetId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  },

  async getDocuments(assetId: string): Promise<AssetDocument[]> {
    await delay()
    return readStore<AssetDocument[]>(STORAGE_KEYS.documents, []).filter((d) => d.assetId === assetId)
  },

  async addDocument(doc: Omit<AssetDocument, 'id' | 'uploadedAt'>): Promise<AssetDocument> {
    await delay(300)
    const item: AssetDocument = { ...doc, id: generateId('doc'), uploadedAt: new Date().toISOString() }
    const all = readStore<AssetDocument[]>(STORAGE_KEYS.documents, [])
    writeStore(STORAGE_KEYS.documents, [...all, item])
    return item
  },
}
