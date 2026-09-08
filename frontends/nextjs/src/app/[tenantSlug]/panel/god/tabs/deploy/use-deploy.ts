'use client'

import { useCallback, useState } from 'react'
import { idbDump, idbRestore } from '@/lib/persist/idb-kv'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { rehydrate, type GodState } from '@/store/slices/god-slice'

/**
 * Export and import this browser's editor state.
 *
 * The god slice plus the IndexedDB tier: drafts, staged changes and
 * version history. Deliberately named for what it carries, because the
 * tab's copy used to promise "routes, component trees, workflows, styles,
 * packages" -- which are published DBAL rows, none of which appear in the
 * file, and none of which importing can restore. A founder who exported
 * before a migration would have got a bundle with none of their live site
 * in it.
 */
export function useDeploy() {
  const dispatch = useAppDispatch()
  const god = useAppSelector(s => s.god as GodState)
  const [flash, setFlash] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const exportProject = useCallback(async () => {
    setBusy(true)
    try {
      const idb = await idbDump() // versions, webchat, etc.
      const blob = new Blob(
        [
          JSON.stringify(
            { kind: 'metabuilder-project', version: 2, god, idb },
            null,
            2
          ),
        ],
        { type: 'application/json' }
      )
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `metabuilder-project-${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)
      setFlash('Project exported.')
    } finally {
      setBusy(false)
    }
  }, [god])

  const importProject = useCallback(
    async (file: File) => {
      setBusy(true)
      try {
        const parsed = JSON.parse(await file.text()) as {
          god?: GodState
          idb?: Record<string, unknown>
        }
        if (parsed.god !== undefined) dispatch(rehydrate(parsed.god))
        if (parsed.idb !== undefined) await idbRestore(parsed.idb)
        setFlash('Project imported.')
      } catch {
        setFlash('Import failed — not a valid project file.')
      } finally {
        setBusy(false)
      }
    },
    [dispatch]
  )

  return {
    flash,
    busy,
    exportProject,
    importProject,
    clearFlash: () => {
      setFlash(null)
    },
  }
}
