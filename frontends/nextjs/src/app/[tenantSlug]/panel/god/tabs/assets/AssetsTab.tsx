'use client'

/**
 * Files: logos and images a page can use.
 *
 * Named for what it holds rather than the store behind it -- someone adding
 * a logo does not need to know the word bucket, or that there is an S3
 * service at all. Copying the address of a file is the main thing anyone
 * comes here to do, so that is the primary action on every row.
 */

import { useRef } from 'react'
import { useAuthContext } from '@/app/_components/auth-provider/auth-provider-component'
import { normalizeTenantId } from '@/lib/tenant/workspace-paths'
import { assetUrl, useAssets, type Asset } from './use-assets'
import { useCopyFeedback } from './use-copy-feedback'
import { AssetDropZone } from './assets-view/AssetDropZone'
import { AssetGrid } from './assets-view/AssetGrid'
import s from './AssetsTab.module.scss'

export function AssetsTab() {
  const auth = useAuthContext()
  const tenant = normalizeTenantId(auth.user?.tenantId)
  const { assets, loading, busy, error, upload, remove } = useAssets(tenant)
  const picker = useRef<HTMLInputElement>(null)
  const { copiedKey, copy } = useCopyFeedback()

  const handleDelete = (asset: Asset): void => {
    if (window.confirm(`Delete ${asset.key}?`)) void remove(asset.key)
  }

  return (
    <div className={s.root}>
      <AssetDropZone
        busy={busy}
        pickerRef={picker}
        onFile={file => {
          if (file) void upload(file)
        }}
      />

      {error !== null && (
        <div className={s.error} role="alert">
          <span className="material-symbols-rounded" aria-hidden="true">
            error
          </span>
          {error}
        </div>
      )}

      <AssetGrid
        assets={assets}
        loading={loading}
        tenant={tenant}
        busy={busy}
        copiedKey={copiedKey}
        onCopy={asset => {
          copy(asset.key, assetUrl(tenant, asset.key))
        }}
        onDelete={handleDelete}
      />
    </div>
  )
}
