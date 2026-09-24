import type { LucideIcon } from 'lucide-react'
import {
  ArrowLeftRight,
  BarChart3,
  Bell,
  Building2,
  DollarSign,
  FileSpreadsheet,
  Home,
  Layers,
  MapPin,
  Package,
  PlusCircle,
  Settings,
  ShieldCheck,
  Trash2,
  Truck,
  Wrench,
} from 'lucide-react'

export interface NavItem {
  title: string
  href?: string
  icon?: LucideIcon
  children?: NavItem[]
}

export const mainNav: NavItem[] = [
  { title: 'Dashboard', href: '/dashboard', icon: Home },
  {
    title: 'Assets',
    icon: Package,
    children: [
      { title: 'All Assets', href: '/assets' },
      { title: 'Add Asset', href: '/assets/new', icon: PlusCircle },
      { title: 'Categories', href: '/settings/categories' },
      { title: 'Import Assets', href: '/assets/import', icon: FileSpreadsheet },
    ],
  },
  {
    title: 'Locations',
    icon: MapPin,
    children: [
      { title: 'Buildings', href: '/locations/buildings', icon: Building2 },
      { title: 'Floors', href: '/locations/floors', icon: Layers },
      { title: 'Departments', href: '/locations/departments' },
      { title: 'Rooms', href: '/locations/rooms' },
    ],
  },
  {
    title: 'Operations',
    icon: ArrowLeftRight,
    children: [
      { title: 'Assignments', href: '/assignments' },
      { title: 'Transfers', href: '/transfers' },
      { title: 'Asset Requests', href: '/requests' },
      { title: 'Receiving', href: '/receiving', icon: Truck },
    ],
  },
  {
    title: 'Maintenance',
    icon: Wrench,
    children: [
      { title: 'Dashboard', href: '/maintenance' },
      { title: 'Work Orders', href: '/maintenance/work-orders' },
      { title: 'Preventive Maintenance', href: '/maintenance/schedules' },
      { title: 'Schedule', href: '/maintenance/schedules' },
    ],
  },
  {
    title: 'Verification',
    icon: ShieldCheck,
    children: [
      { title: 'Physical Verification', href: '/verification' },
      { title: 'Scan Assets', href: '/verification/scan' },
      { title: 'Missing Assets', href: '/verification/missing' },
      { title: 'History', href: '/verification/history' },
    ],
  },
  {
    title: 'Financial',
    icon: DollarSign,
    children: [
      { title: 'Acquisition', href: '/financial/acquisition' },
      { title: 'Depreciation', href: '/financial/depreciation' },
      { title: 'Asset Costs', href: '/financial/acquisition' },
    ],
  },
  { title: 'Disposal', href: '/disposals', icon: Trash2 },
  { title: 'Reports', href: '/reports', icon: BarChart3 },
  { title: 'Notifications', href: '/notifications', icon: Bell },
  { title: 'Settings', href: '/settings', icon: Settings },
]

export const topNavLinks = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Assets', href: '/assets' },
  { label: 'Reports', href: '/reports' },
  { label: 'Documents', href: '/reports?tab=documents' },
]
