export const ASSET_CONDITIONS = [
  'Excellent',
  'Good',
  'Fair',
  'Poor',
  'Damaged',
  'Non-functional',
] as const

export type AssetCondition = (typeof ASSET_CONDITIONS)[number]

export const ASSET_STATUSES = [
  'Active',
  'In Use',
  'In Storage',
  'Under Maintenance',
  'Missing',
  'Lost',
  'Retired',
  'Disposed',
  'Pending Disposal',
] as const

export type AssetStatus = (typeof ASSET_STATUSES)[number]

export const MAINTENANCE_TYPES = [
  'Preventive',
  'Corrective',
  'Emergency',
  'Inspection',
  'Calibration',
] as const

export type MaintenanceType = (typeof MAINTENANCE_TYPES)[number]

export const MAINTENANCE_PRIORITIES = ['Low', 'Medium', 'High', 'Critical'] as const
export type MaintenancePriority = (typeof MAINTENANCE_PRIORITIES)[number]

export const MAINTENANCE_STATUSES = [
  'Open',
  'Assigned',
  'In Progress',
  'Waiting Parts',
  'Completed',
  'Cancelled',
] as const

export type MaintenanceStatus = (typeof MAINTENANCE_STATUSES)[number]

export const USER_ROLES = [
  'Super Admin',
  'Asset Manager',
  'Department Manager',
  'Technician',
  'Auditor',
  'Employee',
] as const

export type UserRole = (typeof USER_ROLES)[number]

export const REQUEST_STATUSES = ['Pending', 'Approved', 'Rejected', 'Fulfilled'] as const
export type RequestStatus = (typeof REQUEST_STATUSES)[number]

export const TRANSFER_STATUSES = ['Requested', 'Approved', 'Transferred'] as const
export type TransferStatus = (typeof TRANSFER_STATUSES)[number]

export const DISPOSAL_STATUSES = ['Pending Disposal', 'Approved', 'Disposed'] as const
export type DisposalStatus = (typeof DISPOSAL_STATUSES)[number]

export const DOCUMENT_TYPES = [
  'Purchase Invoice',
  'Warranty Certificate',
  'User Manual',
  'Maintenance Report',
  'Inspection Certificate',
  'Calibration Certificate',
  'Disposal Certificate',
  'Photo',
] as const

export type DocumentType = (typeof DOCUMENT_TYPES)[number]
