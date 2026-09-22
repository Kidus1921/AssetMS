import { Badge } from '@/components/ui/badge'
import type { AssetCondition, AssetStatus } from '@/types/enums'

export function AssetStatusBadge({ status }: { status: AssetStatus }) {
  const variant =
    status === 'Active' || status === 'In Use'
      ? 'success'
      : status === 'Under Maintenance'
        ? 'warning'
        : status === 'Missing' || status === 'Lost'
          ? 'danger'
          : 'secondary'
  return <Badge variant={variant}>{status}</Badge>
}

export function AssetConditionBadge({ condition }: { condition: AssetCondition }) {
  const variant =
    condition === 'Excellent' || condition === 'Good'
      ? 'success'
      : condition === 'Fair'
        ? 'warning'
        : condition === 'Damaged' || condition === 'Non-functional'
          ? 'danger'
          : 'secondary'
  return <Badge variant={variant}>{condition}</Badge>
}
