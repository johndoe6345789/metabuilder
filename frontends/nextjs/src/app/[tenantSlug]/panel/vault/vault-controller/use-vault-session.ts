'use client'

import { useCallback, useEffect } from 'react'
import { loadVaultEntries, loadVaultSession } from '../vault-api'
import type { VaultEntry } from '../vault-types'
import type { VaultNotice } from './use-vault-state'

interface Args {
  setEntries: (entries: VaultEntry[]) => void
  setAuthenticated: (authed: boolean) => void
  setAuthLoading: (loading: boolean) => void
  showNotice: (kind: VaultNotice['kind'], message: string) => void
}

/** Loads the existing DBAL session (if any) once on mount, and exposes
 *  `refresh` to reload the entry list on demand afterward. */
export function useVaultSession({
  setEntries,
  setAuthenticated,
  setAuthLoading,
  showNotice,
}: Args) {
  const refresh = useCallback(async () => {
    try {
      const nextEntries = await loadVaultEntries()
      setEntries(nextEntries)
      return nextEntries
    } catch (error) {
      showNotice(
        'error',
        error instanceof Error ? error.message : 'Vault unavailable'
      )
      return []
    }
  }, [setEntries, showNotice])

  useEffect(() => {
    let alive = true
    void loadVaultSession()
      .then(isAuthed => {
        if (!alive) return
        setAuthenticated(isAuthed)
        if (!isAuthed) return
        void refresh()
      })
      .catch(() => {
        if (alive) setAuthenticated(false)
      })
      .finally(() => {
        if (alive) setAuthLoading(false)
      })
    return () => {
      alive = false
    }
  }, [refresh, setAuthLoading, setAuthenticated])

  return { refresh }
}
