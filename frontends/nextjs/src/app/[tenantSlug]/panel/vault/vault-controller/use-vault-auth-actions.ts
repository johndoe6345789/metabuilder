'use client'

import type { useRouter } from 'next/navigation'
import { loginVaultMaster, logoutVaultMaster } from '../vault-api'
import type { VaultDraft, VaultEntry } from '../vault-types'
import { draftFromEntry } from '../vault-normalize'
import type { VaultNotice } from './use-vault-state'

interface Args {
  router: ReturnType<typeof useRouter>
  refresh: () => Promise<VaultEntry[]>
  masterPassword: string
  setMasterPassword: (value: string) => void
  setAuthenticated: (authed: boolean) => void
  setSaving: (saving: boolean) => void
  setEntries: (entries: VaultEntry[]) => void
  setDraft: (draft: VaultDraft) => void
  setSearch: (value: string) => void
  showNotice: (kind: VaultNotice['kind'], message: string) => void
}

/** Unlocking and locking the vault with the master password. */
export function useVaultAuthActions({
  router,
  refresh,
  masterPassword,
  setMasterPassword,
  setAuthenticated,
  setSaving,
  setEntries,
  setDraft,
  setSearch,
  showNotice,
}: Args) {
  const unlock = async () => {
    if (masterPassword.trim().length === 0) return
    try {
      setSaving(true)
      if (!(await loginVaultMaster(masterPassword.trim()))) {
        showNotice('error', 'Invalid master password.')
        return
      }
      setAuthenticated(true)
      setMasterPassword('')
      const next = await refresh()
      router.push(next[0] !== undefined ? `/vault/${next[0].slug}` : '/vault/new')
      showNotice('success', 'Vault unlocked.')
    } catch (error) {
      showNotice(
        'error',
        error instanceof Error ? error.message : 'Unlock failed'
      )
    } finally {
      setSaving(false)
    }
  }

  const lock = async () => {
    await logoutVaultMaster()
    setAuthenticated(false)
    setEntries([])
    setDraft(draftFromEntry(null))
    setSearch('')
    router.push('/vault')
  }

  return { unlock, lock }
}
