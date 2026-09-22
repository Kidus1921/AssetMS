import type { OrganizationSettings, SavedTableView } from '@/types/entities'
import { delay } from '@/lib/utils'
import { STORAGE_KEYS } from '@/storage/keys'
import { readStore, writeStore } from '@/storage/store'
import { resetDemoData } from '@/storage/init'

export const settingsService = {
  async getOrganization(): Promise<OrganizationSettings> {
    await delay(200)
    return readStore<OrganizationSettings>(STORAGE_KEYS.settings, {
      name: 'Organization',
      currency: 'ETB',
      tagPrefix: 'AST',
    })
  },

  async updateOrganization(patch: Partial<OrganizationSettings>): Promise<OrganizationSettings> {
    await delay(300)
    const current = readStore<OrganizationSettings>(STORAGE_KEYS.settings, {
      name: 'Organization',
      currency: 'ETB',
      tagPrefix: 'AST',
    })
    const updated = { ...current, ...patch }
    writeStore(STORAGE_KEYS.settings, updated)
    return updated
  },

  async getSavedViews(page: string): Promise<SavedTableView[]> {
    await delay(200)
    return readStore<SavedTableView[]>(STORAGE_KEYS.savedViews, []).filter((v) => v.page === page)
  },

  async saveView(view: Omit<SavedTableView, 'id'>): Promise<SavedTableView> {
    await delay(200)
    const item: SavedTableView = { ...view, id: `view_${Date.now()}` }
    const all = readStore<SavedTableView[]>(STORAGE_KEYS.savedViews, [])
    writeStore(STORAGE_KEYS.savedViews, [...all, item])
    return item
  },

  async resetDemoData(): Promise<void> {
    await delay(500)
    resetDemoData()
  },
}
