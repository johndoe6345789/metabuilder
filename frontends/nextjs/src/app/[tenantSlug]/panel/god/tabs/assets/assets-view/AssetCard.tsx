'use client'

import { assetUrl, type Asset } from '../use-assets'
import { formatAssetSize, isImageAsset } from '../asset-format'
import s from '../AssetsTab.module.scss'

export interface AssetCardProps {
  asset: Asset
  tenant: string
  busy: boolean
  copied: boolean
  onCopy: () => void
  onDelete: () => void
}

/** One stored file: a thumbnail, its size, and copy/delete controls. */
export function AssetCard(props: AssetCardProps) {
  const { asset } = props

  return (
    <figure className={s.card}>
      <div className={s.thumb}>
        {isImageAsset(asset.key) ? (
          <img src={assetUrl(props.tenant, asset.key)} alt={asset.key} />
        ) : (
          <span className="material-symbols-rounded" aria-hidden="true">
            description
          </span>
        )}
      </div>
      <figcaption className={s.meta}>
        <span className={s.name} title={asset.key}>
          {asset.key}
        </span>
        <span className={s.sub}>{formatAssetSize(asset.size)}</span>
      </figcaption>
      <div className={s.actions}>
        <button type="button" className={s.action} onClick={props.onCopy}>
          <span className="material-symbols-rounded" aria-hidden="true">
            {props.copied ? 'check' : 'link'}
          </span>
          {props.copied ? 'Copied' : 'Copy address'}
        </button>
        <button
          type="button"
          className={`${s.action} ${s.danger}`}
          disabled={props.busy}
          onClick={props.onDelete}
        >
          <span className="material-symbols-rounded" aria-hidden="true">
            delete
          </span>
          Delete
        </button>
      </div>
    </figure>
  )
}
