import type {
  AssetCondition,
  AssetStatus,
  DisposalStatus,
  DocumentType,
  MaintenancePriority,
  MaintenanceStatus,
  MaintenanceType,
  RequestStatus,
  TransferStatus,
  UserRole,
} from './enums'

export interface Department {
  id: string
  name: string
  code?: string
  description?: string
  status?: 'Active' | 'Inactive'
  isActive?: boolean
  createdAt?: string
}

export interface SubDepartment {
  id: string
  departmentId: string
  name: string
  code?: string
  description?: string
  status?: 'Active' | 'Inactive'
  isActive?: boolean
  createdAt?: string
}

export interface Building {
  id: string
  name: string
  code?: string
  description?: string
  status?: 'Active' | 'Inactive'
  isActive?: boolean
  createdAt?: string
}

export interface Floor {
  id: string
  buildingId: string
  name: string
  floorNumber?: string | number
  description?: string
  status?: 'Active' | 'Inactive'
  isActive?: boolean
  createdAt?: string
}

export interface Room {
  id: string
  floorId: string
  buildingId: string
  departmentId: string
  subDepartmentId?: string
  name: string
  code?: string
  description?: string
  status?: 'Active' | 'Inactive'
  isActive?: boolean
  createdAt?: string
}

export interface Category {
  id: string
  name: string
  description?: string
  status?: 'Active' | 'Inactive'
  isActive?: boolean
  createdAt?: string
}

export interface AssetType {
  id: string
  categoryId: string
  name: string
  description?: string
  status?: 'Active' | 'Inactive'
  isActive?: boolean
  createdAt?: string
}

export interface Manufacturer {
  id: string
  name: string
  code?: string
  description?: string
  status?: 'Active' | 'Inactive'
  isActive?: boolean
}

export interface Supplier {
  id: string
  name: string
  code?: string
  description?: string
  status?: 'Active' | 'Inactive'
  isActive?: boolean
}

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  departmentId?: string
  avatarUrl?: string
}

export interface Asset {
  id: string
  assetTag: string
  name: string
  categoryId: string
  typeId?: string
  serialNumber?: string
  modelNumber?: string
  manufacturer?: string
  inventoryNumber?: string
  barcode?: string
  departmentId: string
  subDepartmentId?: string
  buildingId?: string
  floorId?: string
  roomId?: string
  specificLocation?: string
  condition: AssetCondition
  status: AssetStatus
  labelAttached: boolean
  qaChecked: boolean
  purchaseDate?: string
  acquisitionDate?: string
  supplier?: string
  purchaseOrder?: string
  invoiceNumber?: string
  acquisitionCost?: number
  fundingSource?: string
  warrantyStart?: string
  warrantyEnd?: string
  warrantyProvider?: string
  usefulLifeYears?: number
  salvageValue?: number
  remarks?: string
  assignedUserId?: string
  lastVerifiedAt?: string
  createdAt: string
  updatedAt: string
}

export interface AssetDocument {
  id: string
  assetId: string
  name: string
  type: DocumentType
  uploadedAt: string
  sizeKb?: number
}

export interface AssetTimelineEvent {
  id: string
  assetId: string
  date: string
  title: string
  description?: string
}

export interface Assignment {
  id: string
  assetId: string
  userId: string
  departmentId: string
  locationSummary: string
  assignedDate: string
  expectedReturn?: string
  notes?: string
  active: boolean
  createdAt: string
}

export interface Transfer {
  id: string
  assetId: string
  fromLocation: string
  toLocation: string
  reason: string
  requestedById: string
  notes?: string
  status: TransferStatus
  createdAt: string
  completedAt?: string
}

export interface MaintenanceWorkOrder {
  id: string
  assetId: string
  problem: string
  maintenanceType: MaintenanceType
  priority: MaintenancePriority
  reportedById: string
  assignedTechnicianId?: string
  status: MaintenanceStatus
  startDate?: string
  completionDate?: string
  vendor?: string
  cost?: number
  resolution?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface PreventiveSchedule {
  id: string
  assetId: string
  frequencyMonths: number
  lastMaintenanceDate?: string
  nextMaintenanceDate: string
  status: 'Scheduled' | 'Overdue' | 'Completed'
}

export interface AssetRequest {
  id: string
  departmentId: string
  requestedItem: string
  categoryId: string
  quantity: number
  reason: string
  priority: MaintenancePriority
  requestedById: string
  status: RequestStatus
  createdAt: string
}

export interface ReceivingBatch {
  id: string
  supplier: string
  purchaseOrder: string
  invoice: string
  receivingDate: string
  status: 'Received' | 'Inspected' | 'Labeled' | 'Registered' | 'Available'
  items: ReceivingItem[]
  createdAt: string
}

export interface ReceivingItem {
  id: string
  assetName: string
  serialNumber?: string
  model?: string
  quantity: number
  unitCost: number
  warrantyMonths?: number
  condition: AssetCondition
}

export interface VerificationSession {
  id: string
  departmentId: string
  buildingId?: string
  floorId?: string
  roomId?: string
  verificationDate: string
  verifierId: string
  expectedCount: number
  verifiedCount: number
  missingCount: number
  unexpectedCount: number
  damagedCount: number
  status: 'In Progress' | 'Completed'
  createdAt: string
}

export interface VerificationLine {
  id: string
  sessionId: string
  assetId: string
  state: 'Expected' | 'Verified' | 'Missing' | 'Damaged' | 'Unexpected'
  note?: string
}

export interface DisposalRecord {
  id: string
  assetId: string
  reason: string
  condition: AssetCondition
  disposalMethod: string
  disposalDate?: string
  disposalValue?: number
  approvedById?: string
  notes?: string
  status: DisposalStatus
  createdAt: string
}

export interface Notification {
  id: string
  title: string
  message: string
  type: 'maintenance' | 'warranty' | 'missing' | 'verification' | 'transfer' | 'request' | 'system'
  read: boolean
  createdAt: string
  link?: string
}

export interface AuditLogEntry {
  id: string
  timestamp: string
  userId: string
  userName: string
  action: string
  entityType: string
  entityId: string
  summary: string
  changes?: string
}

export interface SavedTableView {
  id: string
  name: string
  page: string
  columnIds: string[]
  filters?: Record<string, string>
}

export interface OrganizationSettings {
  name: string
  currency: string
  tagPrefix: string
}
