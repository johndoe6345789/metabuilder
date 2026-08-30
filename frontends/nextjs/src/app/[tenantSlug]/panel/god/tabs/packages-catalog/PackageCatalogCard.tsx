'use client'

import { Chip } from '@/m3'
import type { ProductPackage } from '../packages-tab-data'
import s from '../PackagesTab.module.scss'

export interface PackageCatalogCardProps {
  pkg: ProductPackage
  installed: boolean
  busy: boolean
  blocked: boolean
  onInstall: () => void
  onUninstall: () => void
}

/** One catalog entry: what it does, and whether it's on for this tenant. */
export function PackageCatalogCard({
  pkg,
  installed,
  busy,
  blocked,
  onInstall,
  onUninstall,
}: PackageCatalogCardProps) {
  return (
    <div className={`${s.card} ${installed ? s.active : ''}`}>
      <div
        className={s.iconWrap}
        style={{
          background: `color-mix(in srgb, ${pkg.color} 15%, transparent)`,
        }}
      >
        <span className="material-symbols-rounded" style={{ color: pkg.color }}>
          {pkg.icon}
        </span>
      </div>
      <div className={s.meta}>
        <div className={s.nameRow}>
          <span className={s.name}>{pkg.name}</span>
          {installed && <Chip label="Installed" size="small" color="success" />}
        </div>
        <p className={s.tagline}>{pkg.tagline}</p>
        <ul className={s.features}>
          {pkg.features.map(f => (
            <li key={f}>{f}</li>
          ))}
        </ul>
      </div>
      <div className={s.foot}>
        {installed ? (
          <button className={s.btnRemove} disabled={busy} onClick={onUninstall}>
            {busy ? 'Removing…' : 'Remove'}
          </button>
        ) : (
          <button
            className={s.btnInstall}
            disabled={busy || blocked}
            onClick={onInstall}
          >
            {busy ? 'Installing…' : 'Install'}
          </button>
        )}
      </div>
    </div>
  )
}
