'use client'

/**
 * Files: logos and images a page can use.
 *
 * Named for what it holds rather than the store behind it -- someone adding a
 * logo does not need to know the word bucket, or that there is an S3 service
 * at all. Copying the address of a file is the main thing anyone comes here
 * to do, so that is the primary action on every row.
 */

import { useRef, useState } from 'react'
import { Button, Typography } from '@/m3'
import { useAuthContext } from '@/app/_components/auth-provider/auth-provider-component'
import { normalizeTenantId } from '@/lib/tenant/workspace-paths'
import { assetUrl, useAssets, type Asset } from './use-assets'
import s from './AssetsTab.module.scss'

const IMAGE = /\.(png|jpe?g|gif|webp|svg|ico)$/i

function size(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export function AssetsTab() {
  const auth = useAuthContext()
  const tenant = normalizeTenantId(auth.user?.tenantId)
  const { assets, loading, busy, error, upload, remove } = useAssets(tenant)
  const picker = useRef<HTMLInputElement>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)

  const take = (files: FileList | null) => {
    const file = files?.[0]
    if (file) void upload(file)
  }

  const copy = (asset: Asset) => {
    void navigator.clipboard.writeText(assetUrl(tenant, asset.key))
    setCopied(asset.key)
    window.setTimeout(() => {
      setCopied(current => (current === asset.key ? null : current))
    }, 1600)
  }

  return (
    <div className={s.root}>
      <div
        className={`${s.drop} ${dragging ? s.dropActive : ''}`}
        onDragOver={event => {
          event.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => {
          setDragging(false)
        }}
        onDrop={event => {
          event.preventDefault()
          setDragging(false)
          take(event.dataTransfer.files)
        }}
      >
        <span className="material-symbols-rounded" aria-hidden="true">
          cloud_upload
        </span>
        <div>
          <div className={s.dropTitle}>Drop a file here to add it</div>
          <Typography variant="caption" className={s.hint}>
            Images and PDFs, up to 8MB
          </Typography>
        </div>
        <Button
          size="small"
          variant="contained"
          disabled={busy}
          onClick={() => picker.current?.click()}
        >
          {busy ? 'Uploading…' : 'Choose a file'}
        </Button>
        <input
          ref={picker}
          type="file"
          hidden
          accept="image/*,application/pdf"
          onChange={event => {
            take(event.target.files)
            // Let the same file be picked again after a failure.
            event.target.value = ''
          }}
        />
      </div>

      {error !== null && (
        <div className={s.error} role="alert">
          <span className="material-symbols-rounded" aria-hidden="true">
            error
          </span>
          {error}
        </div>
      )}

      {loading ? (
        <Typography variant="body2" className={s.hint}>
          Loading files…
        </Typography>
      ) : assets.length === 0 ? (
        <Typography variant="body2" className={s.hint}>
          No files yet. Add a logo and you can use it on any page.
        </Typography>
      ) : (
        <div className={s.grid}>
          {assets.map(asset => (
            <figure key={asset.key} className={s.card}>
              <div className={s.thumb}>
                {IMAGE.test(asset.key) ? (
                  <img src={assetUrl(tenant, asset.key)} alt={asset.key} />
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
                <span className={s.sub}>{size(asset.size)}</span>
              </figcaption>
              <div className={s.actions}>
                <button
                  type="button"
                  className={s.action}
                  onClick={() => {
                    copy(asset)
                  }}
                >
                  <span className="material-symbols-rounded" aria-hidden="true">
                    {copied === asset.key ? 'check' : 'link'}
                  </span>
                  {copied === asset.key ? 'Copied' : 'Copy address'}
                </button>
                <button
                  type="button"
                  className={`${s.action} ${s.danger}`}
                  disabled={busy}
                  onClick={() => {
                    if (window.confirm(`Delete ${asset.key}?`))
                      void remove(asset.key)
                  }}
                >
                  <span className="material-symbols-rounded" aria-hidden="true">
                    delete
                  </span>
                  Delete
                </button>
              </div>
            </figure>
          ))}
        </div>
      )}
    </div>
  )
}
