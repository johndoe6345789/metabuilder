'use client'

import { Button } from '@/m3'
import { useVersions } from './use-versions'
import s from './VersionHistory.module.scss'

/** Reusable version-history control: lists snapshots for `storageKey` and
 * reverts to one via `onRevert`. Drop next to any Publish button. */
export function VersionHistory<T>({ storageKey, onRevert }: {
  storageKey: string
  onRevert: (data: T) => void
}) {
  const v = useVersions<T>(storageKey)

  const revert = async (id: string) => {
    const data = await v.restore(id)
    if (data !== null) onRevert(data)
    v.close()
  }

  return (
    <div className={s.wrap}>
      <Button variant="text" size="small" onClick={v.toggle}>
        ⟲ History{v.versions.length > 0 ? ` (${v.versions.length})` : ''}
      </Button>
      {v.open && (
        <div className={s.panel}>
          <div className={s.head}>Version history</div>
          {v.versions.length === 0 && <div className={s.empty}>No versions yet — publish to snapshot.</div>}
          {v.versions.map((snap, i) => (
            <div key={snap.id} className={s.row}>
              <div className={s.meta}>
                <span className={s.label}>{i === 0 ? 'Latest' : snap.label}</span>
                <span className={s.time}>{new Date(snap.at).toLocaleString()}</span>
              </div>
              <button className={s.revert} onClick={() => { void revert(snap.id) }}>Revert</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
