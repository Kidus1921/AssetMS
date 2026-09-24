import type { Asset, AssetTimelineEvent, AssetDocument, Category, AssetType } from '@/types/entities'
import type { AssetCondition, AssetStatus } from '@/types/enums'
import { delay, generateId } from '@/lib/utils'
import { STORAGE_KEYS } from '@/storage/keys'
import { readStore, writeStore } from '@/storage/store'
import { isSupabaseConfigured, supabase } from '@/lib/supabase'
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

function toAssetModel(row: any): Asset {
  return {
    id: row.id,
    assetTag: row.asset_tag ?? row.assetTag ?? 'AST-000000',
    name: row.name,
    categoryId: row.category_id ?? row.categoryId,
    typeId: row.type_id ?? row.typeId ?? undefined,
    serialNumber: row.serial_number ?? row.serialNumber ?? undefined,
    modelNumber: row.model_number ?? row.modelNumber ?? undefined,
    manufacturer: row.manufacturer ?? undefined,
    inventoryNumber: row.inventory_number ?? row.inventoryNumber ?? undefined,
    barcode: row.barcode ?? undefined,
    departmentId: row.department_id ?? row.departmentId,
    subDepartmentId: row.sub_department_id ?? row.subDepartmentId ?? undefined,
    buildingId: row.building_id ?? row.buildingId ?? undefined,
    floorId: row.floor_id ?? row.floorId ?? undefined,
    roomId: row.room_id ?? row.roomId ?? undefined,
    specificLocation: row.specific_location ?? row.specificLocation ?? undefined,
    condition: row.condition,
    status: row.status,
    labelAttached: Boolean(row.label_attached ?? row.labelAttached),
    qaChecked: Boolean(row.qa_checked ?? row.qaChecked),
    purchaseDate: row.purchase_date ?? row.purchaseDate ?? undefined,
    acquisitionDate: row.acquisition_date ?? row.acquisitionDate ?? undefined,
    supplier: row.supplier ?? undefined,
    purchaseOrder: row.purchase_order ?? row.purchaseOrder ?? undefined,
    invoiceNumber: row.invoice_number ?? row.invoiceNumber ?? undefined,
    acquisitionCost: row.acquisition_cost ?? row.acquisitionCost ?? undefined,
    fundingSource: row.funding_source ?? row.fundingSource ?? undefined,
    warrantyStart: row.warranty_start ?? row.warrantyStart ?? undefined,
    warrantyEnd: row.warranty_end ?? row.warrantyEnd ?? undefined,
    warrantyProvider: row.warranty_provider ?? row.warrantyProvider ?? undefined,
    usefulLifeYears: row.useful_life_years ?? row.usefulLifeYears ?? undefined,
    salvageValue: row.salvage_value ?? row.salvageValue ?? undefined,
    remarks: row.remarks ?? undefined,
    assignedUserId: row.assigned_user_id ?? row.assignedUserId ?? undefined,
    lastVerifiedAt: row.last_verified_at ?? row.lastVerifiedAt ?? undefined,
    createdAt: row.created_at ?? new Date().toISOString(),
    updatedAt: row.updated_at ?? row.updatedAt ?? new Date().toISOString(),
  }
}

const normalizeOptionalText = (value?: string, fallback = 'N/A') => {
  const cleaned = value?.trim() ?? ''
  return cleaned || fallback
}

export const assetsService = {
  async getAll(filters?: AssetFilters): Promise<Asset[]> {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.from('assets').select('*')
      if (error) throw error
      const all = (data ?? []).map(toAssetModel)
      return applyFilters(all, filters)
    }

    await delay()
    return applyFilters(readStore<Asset[]>(STORAGE_KEYS.assets, []), filters)
  },

  async getById(id: string): Promise<Asset | undefined> {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.from('assets').select('*').eq('id', id).maybeSingle()
      if (error) throw error
      return data ? toAssetModel(data) : undefined
    }

    await delay()
    return readStore<Asset[]>(STORAGE_KEYS.assets, []).find((a) => a.id === id)
  },

  async getByTag(tag: string): Promise<Asset | undefined> {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.from('assets').select('*').ilike('asset_tag', tag).maybeSingle()
      if (error) throw error
      return data ? toAssetModel(data) : undefined
    }

    await delay()
    return readStore<Asset[]>(STORAGE_KEYS.assets, []).find(
      (a) => a.assetTag.toLowerCase() === tag.toLowerCase(),
    )
  },

  async resetDatabase(): Promise<void> {
    if (isSupabaseConfigured()) {
      const { error } = await supabase.rpc('reset_asset_database')
      if (error) throw error
      return
    }

    const blankTables = [
      STORAGE_KEYS.assets,
      STORAGE_KEYS.departments,
      STORAGE_KEYS.subDepartments,
      STORAGE_KEYS.buildings,
      STORAGE_KEYS.floors,
      STORAGE_KEYS.rooms,
      STORAGE_KEYS.categories,
      STORAGE_KEYS.assetTypes,
      STORAGE_KEYS.users,
      STORAGE_KEYS.assignments,
      STORAGE_KEYS.transfers,
      STORAGE_KEYS.maintenance,
      STORAGE_KEYS.schedules,
      STORAGE_KEYS.requests,
      STORAGE_KEYS.receiving,
      STORAGE_KEYS.verificationSessions,
      STORAGE_KEYS.verificationLines,
      STORAGE_KEYS.disposals,
      STORAGE_KEYS.documents,
      STORAGE_KEYS.timelines,
      STORAGE_KEYS.notifications,
      STORAGE_KEYS.auditLogs,
      STORAGE_KEYS.savedViews,
      STORAGE_KEYS.currentUserId,
    ] as const

    for (const key of blankTables) {
      writeStore(key, key === STORAGE_KEYS.currentUserId ? '' : [])
    }
  },

  async create(input: Omit<Asset, 'id' | 'assetTag' | 'createdAt' | 'updatedAt'> & { assetTag?: string }): Promise<Asset> {
    const now = new Date().toISOString()

    if (isSupabaseConfigured()) {
      const payload = {
        asset_tag: input.assetTag ?? `AST-${Date.now()}`,
        name: input.name || 'N/A',
        category_id: input.categoryId,
        type_id: input.typeId ?? null,
        serial_number: input.serialNumber?.trim() || null,
        model_number: normalizeOptionalText(input.modelNumber),
        inventory_number: normalizeOptionalText(input.inventoryNumber),
        barcode: normalizeOptionalText(input.barcode),
        department_id: input.departmentId,
        sub_department_id: input.subDepartmentId ?? null,
        building_id: input.buildingId ?? null,
        floor_id: input.floorId ?? null,
        room_id: input.roomId ?? null,
        specific_location: normalizeOptionalText(input.specificLocation),
        condition: input.condition,
        status: input.status,
        label_attached: input.labelAttached,
        qa_checked: input.qaChecked,
        purchase_date: input.purchaseDate ?? null,
        acquisition_date: input.acquisitionDate ?? null,
        purchase_order: normalizeOptionalText(input.purchaseOrder),
        invoice_number: normalizeOptionalText(input.invoiceNumber),
        acquisition_cost: input.acquisitionCost ?? null,
        funding_source: normalizeOptionalText(input.fundingSource),
        warranty_start: input.warrantyStart ?? null,
        warranty_end: input.warrantyEnd ?? null,
        warranty_provider: normalizeOptionalText(input.warrantyProvider),
        useful_life_years: input.usefulLifeYears ?? null,
        salvage_value: input.salvageValue ?? null,
        remarks: normalizeOptionalText(input.remarks),
        assigned_user_id: input.assignedUserId ?? null,
        last_verified_at: input.lastVerifiedAt ?? null,
        created_at: now,
        updated_at: now,
      }

      const { data, error } = await supabase.from('assets').insert(payload).select().single()
      if (error) throw error
      const asset = toAssetModel(data)

      await recordAudit({ action: 'Asset Created', entityType: 'asset', entityId: asset.id, summary: `Asset ${asset.assetTag} created` })
      await notificationsService.add({ title: 'Asset registered', message: `${asset.assetTag} — ${asset.name}`, type: 'system', link: `/assets/${asset.id}` })
      return asset
    }

    await delay(500)
    const assets = readStore<Asset[]>(STORAGE_KEYS.assets, [])
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
    await recordAudit({ action: 'Asset Created', entityType: 'asset', entityId: asset.id, summary: `Asset ${asset.assetTag} created` })
    await notificationsService.add({ title: 'Asset registered', message: `${asset.assetTag} — ${asset.name}`, type: 'system', link: `/assets/${asset.id}` })
    return asset
  },

  async update(id: string, patch: Partial<Asset>): Promise<Asset> {
    if (isSupabaseConfigured()) {
      const current = await this.getById(id)
      if (!current) throw new Error('Asset not found')

      const payload: Record<string, any> = {}
      for (const [key, value] of Object.entries(patch)) {
        const dbKey = key.replace(/[A-Z]/g, (match) => `_${match.toLowerCase()}`)
        payload[dbKey] = value
      }

      const { data, error } = await supabase.from('assets').update({ ...payload, updated_at: new Date().toISOString() }).eq('id', id).select().single()
      if (error) throw error
      const updated = toAssetModel(data)
      const changes: string[] = []
      if (patch.condition && patch.condition !== current.condition) changes.push(`Condition: ${current.condition} → ${patch.condition}`)
      if (patch.status && patch.status !== current.status) changes.push(`Status: ${current.status} → ${patch.status}`)
      await recordAudit({ action: 'Asset Updated', entityType: 'asset', entityId: id, summary: `Updated ${updated.assetTag}`, changes: changes.join('; ') || undefined })
      return updated
    }

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
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.from('asset_categories').select('*').order('name')
      if (error) throw error
      return (data ?? []).map((row) => ({
        id: row.id,
        name: row.name,
        description: row.description ?? undefined,
        status: row.status ?? 'Active',
        isActive: row.is_active ?? true,
      }))
    }

    await delay(200)
    return readStore<Category[]>(STORAGE_KEYS.categories, [])
  },

  async getTypes(categoryId?: string): Promise<AssetType[]> {
    let all: AssetType[]
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.from('asset_types').select('*').order('name')
      if (error) throw error
      all = (data ?? []).map((row) => ({
        id: row.id,
        categoryId: row.category_id,
        name: row.name,
        description: row.description ?? undefined,
        status: row.status ?? 'Active',
        isActive: row.is_active ?? true,
      }))
    } else {
      await delay(200)
      all = readStore<AssetType[]>(STORAGE_KEYS.assetTypes, [])
    }
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
