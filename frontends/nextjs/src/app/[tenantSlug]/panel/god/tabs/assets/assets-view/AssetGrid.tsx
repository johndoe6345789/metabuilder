'use client'

import { Typography } from '@/m3'
import type { Asset } from '../use-assets'
import { AssetCard } from './AssetCard'
import s from '../AssetsTab.module.scss'

export interface AssetGridProps {
  assets: Asset[]
  loading: boolean
  tenant: string
  busy: boolean
  copiedKey: string | null
  onCopy: (asset: Asset) => void
  onDelete: (asset: Asset) => void
}

/** The stored files, or a loading/empty message in their place. */
export function AssetGrid(props: AssetGridProps) {
  if (props.loading) {
    return (
      <Typography variant="body2" className={s.hint}>
        Loading files…
      </Typography>
    )
  }
  if (props.assets.length === 0) {
    return (
      <Typography variant="body2" className={s.hint}>
        No files yet. Add a logo and you can use it on any page.
      </Typography>
    )
  }
  return (
    <div className={s.grid}>
      {props.assets.map(asset => (
        <AssetCard
          key={asset.key}
          asset={asset}
          tenant={props.tenant}
          busy={props.busy}
          copied={props.copiedKey === asset.key}
          onCopy={() => {
            props.onCopy(asset)
          }}
          onDelete={() => {
            props.onDelete(asset)
          }}
        />
      ))}
    </div>
  )
}
