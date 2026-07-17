'use client'

import { useCallback, useEffect, useState } from 'react'
import { getVersion, listVersions, type Snapshot } from '@/lib/persist/versions'

/** Version list + open state for a persisted key's history. */
export function useVersions<T>(key: string) {
  const [versions, setVersions] = useState<Snapshot<T>[]>([])
  const [open, setOpen] = useState(false)

  const refresh = useCallback(() => {
    void listVersions<T>(key).then(setVersions)
  }, [key])

  useEffect(() => { refresh() }, [refresh])

  const toggle = useCallback(() => {
    setOpen((o) => { if (!o) refresh(); return !o })
  }, [refresh])

  const restore = useCallback(
    (id: string): Promise<T | null> => getVersion<T>(key, id),
    [key],
  )

  return { versions, open, toggle, close: () => setOpen(false), refresh, restore }
}
