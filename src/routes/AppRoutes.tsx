import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '@/layouts/AppLayout'
import { DashboardPage } from '@/pages/dashboard/DashboardPage'
import { AssetsPage } from '@/pages/assets/AssetsPage'
import { AssetFormPage } from '@/pages/assets/AssetFormPage'
import { AssetDetailPage } from '@/pages/assets/AssetDetailPage'
import { ImportAssetsPage } from '@/pages/assets/ImportAssetsPage'
import { AssignmentsPage, TransfersPage, RequestsPage, ReceivingPage } from '@/pages/operations/OperationsPages'
import { MaintenanceDashboardPage, WorkOrdersPage, SchedulesPage } from '@/pages/maintenance/MaintenancePages'
import {
  VerificationPage,
  ScanAssetsPage,
  MissingAssetsPage,
  VerificationHistoryPage,
} from '@/pages/verification/VerificationPages'
import { BuildingsPage, FloorsPage, DepartmentsLocationPage, RoomsPage } from '@/pages/locations/LocationsPages'
import { AcquisitionPage, DepreciationPage } from '@/pages/financial/FinancialPages'
import { ReportsPage } from '@/pages/reports/ReportsPage'
import { SettingsPage, CategoriesSettingsPage } from '@/pages/settings/SettingsPages'
import { NotificationsPage } from '@/pages/notifications/NotificationsPage'
import { AuditLogPage } from '@/pages/audit/AuditLogPage'
import { DisposalsPage } from '@/pages/disposals/DisposalsPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="assets" element={<AssetsPage />} />
        <Route path="assets/new" element={<AssetFormPage />} />
        <Route path="assets/import" element={<ImportAssetsPage />} />
        <Route path="assets/:id" element={<AssetDetailPage />} />
        <Route path="assets/:id/edit" element={<AssetFormPage />} />
        <Route path="locations" element={<Navigate to="/locations/buildings" replace />} />
        <Route path="locations/buildings" element={<BuildingsPage />} />
        <Route path="locations/floors" element={<FloorsPage />} />
        <Route path="locations/departments" element={<DepartmentsLocationPage />} />
        <Route path="locations/rooms" element={<RoomsPage />} />
        <Route path="locations/rooms/:roomId" element={<RoomsPage />} />
        <Route path="assignments" element={<AssignmentsPage />} />
        <Route path="transfers" element={<TransfersPage />} />
        <Route path="requests" element={<RequestsPage />} />
        <Route path="receiving" element={<ReceivingPage />} />
        <Route path="maintenance" element={<MaintenanceDashboardPage />} />
        <Route path="maintenance/work-orders" element={<WorkOrdersPage />} />
        <Route path="maintenance/schedules" element={<SchedulesPage />} />
        <Route path="verification" element={<VerificationPage />} />
        <Route path="verification/scan" element={<ScanAssetsPage />} />
        <Route path="verification/missing" element={<MissingAssetsPage />} />
        <Route path="verification/history" element={<VerificationHistoryPage />} />
        <Route path="financial" element={<Navigate to="/financial/acquisition" replace />} />
        <Route path="financial/acquisition" element={<AcquisitionPage />} />
        <Route path="financial/depreciation" element={<DepreciationPage />} />
        <Route path="disposals" element={<DisposalsPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="audit-log" element={<AuditLogPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="settings/users" element={<SettingsPage />} />
        <Route path="settings/categories" element={<CategoriesSettingsPage />} />
        <Route path="settings/locations" element={<BuildingsPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  )
}
