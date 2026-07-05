'use client'

import { useCallback, useState } from 'react'
import { idbDump, idbRestore } from '@/lib/persist/idb-kv'

/** Project-level export/import ("deploy" = ship the whole declarative bundle). */
export function useDeploy() {
  const [flash, setFlash] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const exportProject = useCallback(async () => {
    setBusy(true)
    try {
      const data = await idbDump()
      const blob = new Blob([JSON.stringify({ kind: 'metabuilder-project', version: 1, data }, null, 2)],
        { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `metabuilder-project-${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)
      setFlash('Project exported.')
    } finally { setBusy(false) }
  }, [])

  const importProject = useCallback(async (file: File) => {
    setBusy(true)
    try {
      const text = await file.text()
      const parsed = JSON.parse(text) as { data?: Record<string, unknown> }
      await idbRestore(parsed.data ?? (parsed as Record<string, unknown>))
      setFlash('Project imported — reloading…')
      setTimeout(() => { window.location.reload() }, 700)
    } catch {
      setFlash('Import failed — not a valid project file.')
    } finally { setBusy(false) }
  }, [])

  return { flash, busy, exportProject, importProject, clearFlash: () => setFlash(null) }
}
