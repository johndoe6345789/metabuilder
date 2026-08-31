'use client'

import type { useRouter } from 'next/navigation'
import type { VaultEntry } from '../vault-types'
import type { VaultTabId } from '../vault-view'
import type { VaultNotice } from './use-vault-state'

interface Args {
  router: ReturnType<typeof useRouter>
  refresh: () => Promise<VaultEntry[]>
  setEditorTab: (tab: VaultTabId) => void
  showNotice: (kind: VaultNotice['kind'], message: string) => void
}

/** Moving between vault entries and reloading the list from DBAL. */
export function useVaultNavigation({
  router,
  refresh,
  setEditorTab,
  showNotice,
}: Args) {
  const selectEntry = (entry: VaultEntry) => {
    setEditorTab('identity')
    router.push(`/vault/${encodeURIComponent(entry.slug)}`)
  }

  const newEntry = () => {
    setEditorTab('identity')
    router.push('/vault/new')
  }

  const reload = async () => {
    const next = await refresh()
    router.push(next[0] !== undefined ? `/vault/${next[0].slug}` : '/vault/new')
    showNotice('info', 'Vault reloaded from DBAL.')
  }

  return { selectEntry, newEntry, reload }
}
