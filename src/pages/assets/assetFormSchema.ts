import { z } from 'zod'
import { ASSET_CONDITIONS, ASSET_STATUSES } from '@/types/enums'

export const assetFormSchema = z.object({
  name: z.string().min(2, 'Asset name is required'),
  categoryId: z.string().min(1, 'Category is required'),
  typeId: z.string().optional(),
  manufacturer: z.string().optional(),
  modelNumber: z.string().optional(),
  serialNumber: z.string().optional(),
  assetTag: z.string().optional(),
  inventoryNumber: z.string().optional(),
  barcode: z.string().optional(),
  departmentId: z.string().min(1, 'Department is required'),
  subDepartmentId: z.string().optional(),
  buildingId: z.string().optional(),
  floorId: z.string().optional(),
  roomId: z.string().optional(),
  specificLocation: z.string().optional(),
  condition: z.enum(ASSET_CONDITIONS),
  status: z.enum(ASSET_STATUSES),
  labelAttached: z.boolean(),
  qaChecked: z.boolean(),
  purchaseDate: z.string().optional(),
  acquisitionDate: z.string().optional(),
  supplier: z.string().optional(),
  purchaseOrder: z.string().optional(),
  invoiceNumber: z.string().optional(),
  acquisitionCost: z.coerce.number().optional(),
  fundingSource: z.string().optional(),
  warrantyStart: z.string().optional(),
  warrantyEnd: z.string().optional(),
  warrantyProvider: z.string().optional(),
  usefulLifeYears: z.coerce.number().optional(),
  remarks: z.string().optional(),
})

export type AssetFormValues = z.infer<typeof assetFormSchema>
