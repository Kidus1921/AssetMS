import { QRCodeSVG } from 'qrcode.react'
import type { Asset } from '@/types/entities'

export function AssetLabelPreview({
  asset,
  organizationName,
  departmentLine,
}: {
  asset: Asset
  organizationName: string
  departmentLine?: string
}) {
  return (
    <div className="mx-auto w-[280px] rounded-lg border-2 border-foreground/80 bg-white p-4 text-center text-black shadow-sm">
      <p className="text-xs font-semibold tracking-widest">{organizationName.toUpperCase()}</p>
      <div className="my-3 flex justify-center">
        <QRCodeSVG value={asset.assetTag} size={120} />
      </div>
      <p className="font-mono text-sm font-bold">{asset.assetTag}</p>
      <p className="mt-1 text-xs leading-snug">{asset.name}</p>
      {departmentLine ? <p className="mt-2 text-[10px] text-gray-600">{departmentLine}</p> : null}
    </div>
  )
}
