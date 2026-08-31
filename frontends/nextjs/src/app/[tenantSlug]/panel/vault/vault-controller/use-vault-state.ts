'use client'

import { useCallback, useState } from 'react'
import type { VaultDraft, VaultEntry } from '../vault-types'
import type { VaultTabId } from '../vault-view'
import { draftFromEntry } from '../vault-normalize'

export type VaultNotice = {
  kind: 'success' | 'error' | 'info'
  message: string
}

/** Every primitive piece of vault state, with no cross-field logic --
 *  the hooks that derive from these live alongside them in this
 *  directory. */
export function useVaultState() {
  const [entries, setEntries] = useState<VaultEntry[]>([])
  const [draft, setDraft] = useState<VaultDraft>(draftFromEntry(null))
  const [authLoading, setAuthLoading] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)
  const [saving, setSaving] = useState(false)
  const [masterPassword, setMasterPassword] = useState('')
  const [search, setSearch] = useState('')
  const [notice, setNotice] = useState<VaultNotice | null>(null)
  const [editorTab, setEditorTab] = useState<VaultTabId>('identity')

  const showNotice = useCallback(
    (kind: VaultNotice['kind'], message: string) => {
      setNotice({ kind, message })
    },
    []
  )

  return {
    entries,
    setEntries,
    draft,
    setDraft,
    authLoading,
    setAuthLoading,
    authenticated,
    setAuthenticated,
    saving,
    setSaving,
    masterPassword,
    setMasterPassword,
    search,
    setSearch,
    notice,
    showNotice,
    editorTab,
    setEditorTab,
  }
}
