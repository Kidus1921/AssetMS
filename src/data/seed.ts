import type {
  Asset,
  Assignment,
  AuditLogEntry,
  Building,
  Category,
  Department,
  Floor,
  MaintenanceWorkOrder,
  Notification,
  OrganizationSettings,
  PreventiveSchedule,
  Room,
  SubDepartment,
  Transfer,
  User,
  AssetType,
  AssetTimelineEvent,
} from '@/types/entities'
import type { AssetCondition, AssetStatus } from '@/types/enums'

const now = new Date()
const iso = (d: Date) => d.toISOString()

export const seedDepartments: Department[] = [
  { id: 'dept_rad', name: 'Radiology / Imaging', code: 'RAD' },
  { id: 'dept_lab', name: 'Laboratory', code: 'LAB' },
  { id: 'dept_phar', name: 'Pharmacy', code: 'PHR' },
  { id: 'dept_opd', name: 'OPD', code: 'OPD' },
  { id: 'dept_fin', name: 'Finance', code: 'FIN' },
  { id: 'dept_adm', name: 'Administration', code: 'ADM' },
  { id: 'dept_it', name: 'IT', code: 'IT' },
  { id: 'dept_hr', name: 'Human Resources', code: 'HR' },
]

export const seedSubDepartments: SubDepartment[] = [
  { id: 'sub_rad_img', departmentId: 'dept_rad', name: 'Imaging' },
  { id: 'sub_rad_us', departmentId: 'dept_rad', name: 'Ultrasound' },
  { id: 'sub_lab_chem', departmentId: 'dept_lab', name: 'Chemistry' },
  { id: 'sub_it_net', departmentId: 'dept_it', name: 'Networking' },
]

export const seedBuildings: Building[] = [
  { id: 'bld_1', name: 'Block 1 (Old)' },
  { id: 'bld_2', name: 'Block 2' },
  { id: 'bld_admin', name: 'Administration Block' },
]

export const seedFloors: Floor[] = [
  { id: 'fl_b1_g', buildingId: 'bld_1', name: 'Ground' },
  { id: 'fl_b1_1', buildingId: 'bld_1', name: 'First Floor' },
  { id: 'fl_b2_g', buildingId: 'bld_2', name: 'Ground' },
  { id: 'fl_b2_1', buildingId: 'bld_2', name: 'First Floor' },
]

export const seedRooms: Room[] = [
  { id: 'rm_elec', floorId: 'fl_b1_g', buildingId: 'bld_1', departmentId: 'dept_rad', subDepartmentId: 'sub_rad_img', name: 'ELEC', code: 'ELEC' },
  { id: 'rm_fnf', floorId: 'fl_b1_g', buildingId: 'bld_1', departmentId: 'dept_fin', name: 'FNF', code: 'FNF' },
  { id: 'rm_meq', floorId: 'fl_b1_1', buildingId: 'bld_1', departmentId: 'dept_rad', subDepartmentId: 'sub_rad_us', name: 'MEQ', code: 'MEQ' },
  { id: 'rm_lab_101', floorId: 'fl_b2_g', buildingId: 'bld_2', departmentId: 'dept_lab', subDepartmentId: 'sub_lab_chem', name: 'Room 101', code: '101' },
  { id: 'rm_it_srv', floorId: 'fl_b2_1', buildingId: 'bld_2', departmentId: 'dept_it', subDepartmentId: 'sub_it_net', name: 'Server Room', code: 'SRV' },
  { id: 'rm_opd_a', floorId: 'fl_b1_g', buildingId: 'bld_1', departmentId: 'dept_opd', name: 'OPD A', code: 'OPDA' },
  { id: 'rm_phar', floorId: 'fl_b1_1', buildingId: 'bld_1', departmentId: 'dept_phar', name: 'Dispensary', code: 'DSP' },
  { id: 'rm_hr', floorId: 'fl_b2_g', buildingId: 'bld_2', departmentId: 'dept_hr', name: 'HR Office', code: 'HRO' },
]

export const seedCategories: Category[] = [
  { id: 'cat_med', name: 'Medical Equipment' },
  { id: 'cat_it', name: 'IT Equipment' },
  { id: 'cat_furn', name: 'Furniture' },
  { id: 'cat_off', name: 'Office Equipment' },
  { id: 'cat_fac', name: 'Facilities' },
]

export const seedAssetTypes: AssetType[] = [
  { id: 'type_us', categoryId: 'cat_med', name: 'Ultrasound Machine' },
  { id: 'type_desk', categoryId: 'cat_it', name: 'Desktop Computer' },
  { id: 'type_laptop', categoryId: 'cat_it', name: 'Laptop' },
  { id: 'type_chair', categoryId: 'cat_furn', name: 'Office Swivel Chair' },
  { id: 'type_desk_f', categoryId: 'cat_furn', name: 'Office Desk' },
  { id: 'type_bed', categoryId: 'cat_med', name: 'Examination Bed' },
  { id: 'type_printer', categoryId: 'cat_off', name: 'Printer' },
  { id: 'type_ups', categoryId: 'cat_it', name: 'UPS' },
  { id: 'type_switch', categoryId: 'cat_it', name: 'Network Switch' },
  { id: 'type_monitor', categoryId: 'cat_it', name: 'Monitor' },
  { id: 'type_cab', categoryId: 'cat_furn', name: 'Cabinet' },
  { id: 'type_ac', categoryId: 'cat_fac', name: 'Air Conditioner' },
]

export const seedUsers: User[] = [
  { id: 'usr_kidus', name: 'Kidus Alemu', email: 'kidus@org.et', role: 'Asset Manager', departmentId: 'dept_adm' },
  { id: 'usr_sara', name: 'Sara Bekele', email: 'sara@org.et', role: 'Department Manager', departmentId: 'dept_rad' },
  { id: 'usr_daniel', name: 'Daniel Tesfaye', email: 'daniel@org.et', role: 'Technician', departmentId: 'dept_it' },
  { id: 'usr_hanna', name: 'Hanna Girma', email: 'hanna@org.et', role: 'Auditor', departmentId: 'dept_fin' },
  { id: 'usr_mike', name: 'Mikias Worku', email: 'mikias@org.et', role: 'Employee', departmentId: 'dept_lab' },
  { id: 'usr_admin', name: 'System Admin', email: 'admin@org.et', role: 'Super Admin', departmentId: 'dept_it' },
]

const assetTemplates: Array<{
  name: string
  typeId: string
  categoryId: string
  dept: string
  room: string
  building: string
  floor: string
  condition: AssetCondition
  status: AssetStatus
  cost: number
  manufacturer?: string
}> = [
  { name: 'Ultrasound Machine GE Voluson', typeId: 'type_us', categoryId: 'cat_med', dept: 'dept_rad', room: 'rm_meq', building: 'bld_1', floor: 'fl_b1_1', condition: 'Good', status: 'Active', cost: 850000, manufacturer: 'GE Healthcare' },
  { name: 'Dell OptiPlex Desktop Computer', typeId: 'type_desk', categoryId: 'cat_it', dept: 'dept_rad', room: 'rm_elec', building: 'bld_1', floor: 'fl_b1_g', condition: 'Good', status: 'Active', cost: 78000, manufacturer: 'Dell' },
  { name: 'HP EliteBook Laptop', typeId: 'type_laptop', categoryId: 'cat_it', dept: 'dept_it', room: 'rm_it_srv', building: 'bld_2', floor: 'fl_b2_1', condition: 'Excellent', status: 'In Use', cost: 95000, manufacturer: 'HP' },
  { name: 'Office Swivel Chair Ergonomic', typeId: 'type_chair', categoryId: 'cat_furn', dept: 'dept_fin', room: 'rm_fnf', building: 'bld_1', floor: 'fl_b1_g', condition: 'Fair', status: 'Active', cost: 8500 },
  { name: 'Office Desk Executive', typeId: 'type_desk_f', categoryId: 'cat_furn', dept: 'dept_adm', room: 'rm_fnf', building: 'bld_1', floor: 'fl_b1_g', condition: 'Good', status: 'Active', cost: 12000 },
  { name: 'Examination Bed Hydraulic', typeId: 'type_bed', categoryId: 'cat_med', dept: 'dept_opd', room: 'rm_opd_a', building: 'bld_1', floor: 'fl_b1_g', condition: 'Good', status: 'Active', cost: 45000 },
  { name: 'Canon imageRUNNER Printer', typeId: 'type_printer', categoryId: 'cat_off', dept: 'dept_adm', room: 'rm_fnf', building: 'bld_1', floor: 'fl_b1_g', condition: 'Good', status: 'Active', cost: 65000, manufacturer: 'Canon' },
  { name: 'APC Smart-UPS 1500VA', typeId: 'type_ups', categoryId: 'cat_it', dept: 'dept_it', room: 'rm_it_srv', building: 'bld_2', floor: 'fl_b2_1', condition: 'Good', status: 'Active', cost: 28000, manufacturer: 'APC' },
  { name: 'Cisco Catalyst Network Switch', typeId: 'type_switch', categoryId: 'cat_it', dept: 'dept_it', room: 'rm_it_srv', building: 'bld_2', floor: 'fl_b2_1', condition: 'Excellent', status: 'Active', cost: 120000, manufacturer: 'Cisco' },
  { name: 'Dell 27" Monitor U2722D', typeId: 'type_monitor', categoryId: 'cat_it', dept: 'dept_lab', room: 'rm_lab_101', building: 'bld_2', floor: 'fl_b2_g', condition: 'Good', status: 'Active', cost: 32000, manufacturer: 'Dell' },
  { name: 'Steel Filing Cabinet 4-Drawer', typeId: 'type_cab', categoryId: 'cat_furn', dept: 'dept_hr', room: 'rm_hr', building: 'bld_2', floor: 'fl_b2_g', condition: 'Fair', status: 'In Storage', cost: 15000 },
  { name: 'Split Air Conditioner 24000 BTU', typeId: 'type_ac', categoryId: 'cat_fac', dept: 'dept_rad', room: 'rm_elec', building: 'bld_1', floor: 'fl_b1_g', condition: 'Good', status: 'Active', cost: 85000, manufacturer: 'LG' },
]

function padTag(n: number) {
  return `AST-${String(n).padStart(6, '0')}`
}

export function buildSeedAssets(): Asset[] {
  const assets: Asset[] = []
  let tagNum = 1
  const statuses: AssetStatus[] = ['Active', 'In Use', 'Under Maintenance', 'Missing', 'In Storage']
  const conditions: AssetCondition[] = ['Excellent', 'Good', 'Fair', 'Poor', 'Damaged']

  for (let i = 0; i < 55; i++) {
    const t = assetTemplates[i % assetTemplates.length]
    const acquired = new Date(now)
    acquired.setMonth(acquired.getMonth() - (i % 36))
    const warrantyEnd = new Date(acquired)
    warrantyEnd.setFullYear(warrantyEnd.getFullYear() + 2)
    const status = i === 17 ? 'Missing' : i === 22 ? 'Under Maintenance' : t.status
    const condition = i === 31 ? 'Damaged' : conditions[i % conditions.length]
    const labelAttached = i % 9 !== 0

    assets.push({
      id: `ast_${tagNum}`,
      assetTag: padTag(tagNum),
      name: `${t.name}${i >= assetTemplates.length ? ` #${Math.floor(i / assetTemplates.length) + 1}` : ''}`,
      categoryId: t.categoryId,
      typeId: t.typeId,
      serialNumber: `SN-${10000 + tagNum}`,
      modelNumber: `MDL-${200 + (i % 50)}`,
      manufacturer: t.manufacturer,
      inventoryNumber: `INV-${5000 + tagNum}`,
      departmentId: t.dept,
      buildingId: t.building,
      floorId: t.floor,
      roomId: t.room,
      condition,
      status: statuses.includes(status) ? status : t.status,
      labelAttached,
      qaChecked: i % 4 !== 0,
      acquisitionDate: iso(acquired),
      purchaseDate: iso(acquired),
      acquisitionCost: t.cost + (i % 7) * 500,
      supplier: 'Ethio Medical Supplies PLC',
      warrantyStart: iso(acquired),
      warrantyEnd: iso(warrantyEnd),
      warrantyProvider: 'Authorized Dealer',
      usefulLifeYears: 5,
      salvageValue: Math.round(t.cost * 0.1),
      assignedUserId: i % 3 === 0 ? 'usr_mike' : i % 5 === 0 ? 'usr_sara' : undefined,
      lastVerifiedAt: i % 6 === 0 ? undefined : iso(new Date(now.getTime() - (i % 90) * 86400000)),
      createdAt: iso(acquired),
      updatedAt: iso(now),
    })
    tagNum++
  }
  return assets
}

export const seedAssignments: Assignment[] = [
  {
    id: 'asg_1',
    assetId: 'ast_2',
    userId: 'usr_sara',
    departmentId: 'dept_rad',
    locationSummary: 'Radiology / Block 1 (Old) / Ground / ELEC',
    assignedDate: iso(new Date(now.getFullYear(), 1, 3)),
    active: true,
    createdAt: iso(new Date(now.getFullYear(), 1, 3)),
  },
]

export const seedTransfers: Transfer[] = [
  {
    id: 'trf_1',
    assetId: 'ast_1',
    fromLocation: 'Radiology / Block 1 / Ground / ELEC',
    toLocation: 'Laboratory / Block 2 / Ground / Room 101',
    reason: 'Department reassignment',
    requestedById: 'usr_kidus',
    status: 'Transferred',
    createdAt: iso(new Date(now.getFullYear(), 5, 10)),
    completedAt: iso(new Date(now.getFullYear(), 5, 11)),
  },
]

export const seedMaintenance: MaintenanceWorkOrder[] = [
  {
    id: 'mnt_1',
    assetId: 'ast_1',
    problem: 'Calibration drift detected',
    maintenanceType: 'Calibration',
    priority: 'High',
    reportedById: 'usr_sara',
    assignedTechnicianId: 'usr_daniel',
    status: 'In Progress',
    startDate: iso(new Date(now.getTime() - 3 * 86400000)),
    vendor: 'GE Service',
    cost: 15000,
    createdAt: iso(new Date(now.getTime() - 5 * 86400000)),
    updatedAt: iso(now),
  },
  {
    id: 'mnt_2',
    assetId: 'ast_8',
    problem: 'Battery replacement',
    maintenanceType: 'Preventive',
    priority: 'Medium',
    reportedById: 'usr_daniel',
    status: 'Open',
    createdAt: iso(new Date(now.getTime() - 86400000)),
    updatedAt: iso(now),
  },
]

export const seedSchedules: PreventiveSchedule[] = [
  {
    id: 'sch_1',
    assetId: 'ast_1',
    frequencyMonths: 6,
    lastMaintenanceDate: iso(new Date(now.getFullYear(), 5, 10)),
    nextMaintenanceDate: iso(new Date(now.getFullYear(), 11, 10)),
    status: 'Scheduled',
  },
]

export const seedNotifications: Notification[] = [
  {
    id: 'ntf_1',
    title: 'Maintenance overdue',
    message: 'Work order for AST-000008 is overdue.',
    type: 'maintenance',
    read: false,
    createdAt: iso(new Date(now.getTime() - 3600000)),
    link: '/maintenance/work-orders',
  },
  {
    id: 'ntf_2',
    title: 'Warranty expiring soon',
    message: 'Dell OptiPlex AST-000002 warranty ends in 28 days.',
    type: 'warranty',
    read: false,
    createdAt: iso(new Date(now.getTime() - 7200000)),
    link: '/financial/acquisition',
  },
]

export const seedAuditLogs: AuditLogEntry[] = [
  {
    id: 'aud_1',
    timestamp: iso(new Date(now.getTime() - 86400000)),
    userId: 'usr_kidus',
    userName: 'Kidus Alemu',
    action: 'Asset Updated',
    entityType: 'asset',
    entityId: 'ast_2',
    summary: 'Kidus updated AST-000002',
    changes: 'Condition: Good → Fair',
  },
]

export const seedTimelines: AssetTimelineEvent[] = [
  { id: 'tl_1', assetId: 'ast_2', date: iso(new Date(now.getFullYear(), 0, 15)), title: 'Asset registered' },
  { id: 'tl_2', assetId: 'ast_2', date: iso(new Date(now.getFullYear(), 0, 16)), title: 'Label attached' },
  { id: 'tl_3', assetId: 'ast_2', date: iso(new Date(now.getFullYear(), 1, 3)), title: 'Assigned to Radiology' },
  { id: 'tl_4', assetId: 'ast_2', date: iso(new Date(now.getFullYear(), 3, 10)), title: 'Preventive maintenance completed' },
  { id: 'tl_5', assetId: 'ast_2', date: iso(new Date(now.getFullYear(), 5, 22)), title: 'Physical verification completed' },
]

export const seedSettings: OrganizationSettings = {
  name: 'Organization Asset Registry',
  currency: 'ETB',
  tagPrefix: 'AST',
}
