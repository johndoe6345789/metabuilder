'use client'

import { Chip } from '@/m3'
import type { RegistryPackage } from '../use-package-registry'
import s from '../PackageManager.module.scss'

/** Icon, name, version and publish state. */
export function PackageHeader({ p }: { p: RegistryPackage }) {
  return (
    <>
      <div className={s.head}>
        <span className="material-symbols-rounded">{p.manifest.icon}</span>
        <div className={s.meta}>
          <span className={s.name}>{p.manifest.name}</span>
          <span className={s.ver}>
            v{p.manifest.version} · {p.manifest.category}
          </span>
        </div>
        <Chip
          label={p.publishedId != null ? 'Published' : 'Draft'}
          size="small"
          color={p.publishedId != null ? 'success' : 'default'}
        />
      </div>
      {p.manifest.description && (
        <p className={s.desc}>{p.manifest.description}</p>
      )}
    </>
  )
}
