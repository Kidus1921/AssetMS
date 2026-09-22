import {
  buildSeedAssets,
  seedAssetTypes,
  seedAssignments,
  seedAuditLogs,
  seedBuildings,
  seedCategories,
  seedDepartments,
  seedFloors,
  seedMaintenance,
  seedNotifications,
  seedRooms,
  seedSchedules,
  seedSettings,
  seedSubDepartments,
  seedTimelines,
  seedTransfers,
  seedUsers,
} from '@/data/seed'
import { STORAGE_KEYS } from './keys'
import { readStore, removeStore, writeStore } from './store'

export function initializeStorage(): void {
  const initialized = readStore<boolean>(STORAGE_KEYS.initialized, false)
  if (initialized) return

  writeStore(STORAGE_KEYS.assets, buildSeedAssets())
  writeStore(STORAGE_KEYS.departments, seedDepartments)
  writeStore(STORAGE_KEYS.subDepartments, seedSubDepartments)
  writeStore(STORAGE_KEYS.buildings, seedBuildings)
  writeStore(STORAGE_KEYS.floors, seedFloors)
  writeStore(STORAGE_KEYS.rooms, seedRooms)
  writeStore(STORAGE_KEYS.categories, seedCategories)
  writeStore(STORAGE_KEYS.assetTypes, seedAssetTypes)
  writeStore(STORAGE_KEYS.users, seedUsers)
  writeStore(STORAGE_KEYS.assignments, seedAssignments)
  writeStore(STORAGE_KEYS.transfers, seedTransfers)
  writeStore(STORAGE_KEYS.maintenance, seedMaintenance)
  writeStore(STORAGE_KEYS.schedules, seedSchedules)
  writeStore(STORAGE_KEYS.notifications, seedNotifications)
  writeStore(STORAGE_KEYS.auditLogs, seedAuditLogs)
  writeStore(STORAGE_KEYS.timelines, seedTimelines)
  writeStore(STORAGE_KEYS.settings, seedSettings)
  writeStore(STORAGE_KEYS.documents, [])
  writeStore(STORAGE_KEYS.requests, [])
  writeStore(STORAGE_KEYS.receiving, [])
  writeStore(STORAGE_KEYS.verificationSessions, [])
  writeStore(STORAGE_KEYS.verificationLines, [])
  writeStore(STORAGE_KEYS.disposals, [])
  writeStore(STORAGE_KEYS.savedViews, [])
  writeStore(STORAGE_KEYS.currentUserId, 'usr_kidus')
  writeStore(STORAGE_KEYS.initialized, true)
}

export function resetDemoData(): void {
  Object.values(STORAGE_KEYS).forEach((key) => removeStore(key))
  initializeStorage()
}
