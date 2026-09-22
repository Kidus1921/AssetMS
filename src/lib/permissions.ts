import type { UserRole } from '@/types/enums'

type Action = 'view' | 'create' | 'edit' | 'delete' | 'approve' | 'maintenance'

const matrix: Record<UserRole, Partial<Record<Action, boolean>>> = {
  'Super Admin': { view: true, create: true, edit: true, delete: true, approve: true, maintenance: true },
  'Asset Manager': { view: true, create: true, edit: true, delete: false, approve: true, maintenance: true },
  'Department Manager': { view: true, create: true, edit: true, delete: false, approve: true, maintenance: false },
  Technician: { view: true, create: false, edit: false, delete: false, approve: false, maintenance: true },
  Auditor: { view: true, create: false, edit: false, delete: false, approve: false, maintenance: false },
  Employee: { view: true, create: true, edit: false, delete: false, approve: false, maintenance: false },
}

export function can(role: UserRole, action: Action): boolean {
  return matrix[role][action] ?? false
}

export function permissionMatrix(): Array<{ role: UserRole } & Record<Action, string>> {
  const actions: Action[] = ['view', 'create', 'edit', 'delete', 'approve', 'maintenance']
  return (Object.keys(matrix) as UserRole[]).map((role) => {
    const row = { role } as { role: UserRole } & Record<Action, string>
    actions.forEach((a) => {
      row[a] = matrix[role][a] ? '✓' : a === 'maintenance' && role === 'Technician' ? 'maintenance' : '—'
    })
    return row
  })
}
