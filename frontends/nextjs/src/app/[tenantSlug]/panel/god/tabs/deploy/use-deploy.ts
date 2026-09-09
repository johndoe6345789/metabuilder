'use client'

import { useCallback, useState } from 'react'
import { idbDump, idbRestore } from '@/lib/persist/idb-kv'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { rehydrate, type GodState } from '@/store/slices/god-slice'
import { useCurrentTenantScope } from '../use-current-tenant-scope'
import { buildBundle, readBundle, refuseImport } from './project-bundle'

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
  // Whose editor this is. The file records it, and an import checks it:
  // the god slice carries the page tree, the CSS, the workflows and the
  // SMTP password, and a bundle used to become whoever opened it.
  const { tenant } = useCurrentTenantScope()
  const god = useAppSelector(s => s.god as GodState)
  const [flash, setFlash] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const exportProject = useCallback(async () => {
    setBusy(true)
    try {
      const idb = await idbDump() // versions, webchat, etc.
      const blob = new Blob(
        [JSON.stringify(buildBundle(tenant, god, idb), null, 2)],
        { type: 'application/json' }
      )
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const day = new Date().toISOString().slice(0, 10)
      a.download = `metabuilder-${tenant}-${day}.json`
      a.click()
      URL.revokeObjectURL(url)
      setFlash('Project exported.')
    } finally {
      setBusy(false)
    }
  }, [god, tenant])

  const importProject = useCallback(
    async (file: File) => {
      setBusy(true)
      try {
        const read = readBundle(await file.text())
        if (!read.ok) {
          setFlash(read.reason)
          return
        }
        const refusal = refuseImport(read.bundle, tenant)
        if (refusal !== null) {
          setFlash(refusal)
          return
        }
        const { god: state, idb } = read.bundle
        if (state != null) dispatch(rehydrate(state as GodState))
        if (idb != null) await idbRestore(idb as Record<string, unknown>)
        setFlash('Project imported.')
      } catch {
        setFlash('Import failed — the file could not be read.')
      } finally {
        setBusy(false)
      }
    },
    [dispatch, tenant]
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
