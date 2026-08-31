'use client'

import type { useRouter } from 'next/navigation'
import { useVaultNavigation } from './use-vault-navigation'
import { useVaultAuthActions } from './use-vault-auth-actions'
import { useVaultEntryActions } from './use-vault-entry-actions'
import { useVaultCopyActions } from './use-vault-copy-actions'
import type { useVaultState } from './use-vault-state'
import type { VaultEntry } from '../vault-types'

interface Args {
  router: ReturnType<typeof useRouter>
  refresh: () => Promise<VaultEntry[]>
  state: ReturnType<typeof useVaultState>
  currentEntry: VaultEntry | null
}

/** Every user-triggered vault action, wired to the state and session
 *  pieces it needs -- one place that assembles all four action hooks
 *  so the top-level controller only has to spread one result. */
export function useVaultActions(args: Args) {
  const { router, refresh, state, currentEntry } = args
  const nav = useVaultNavigation({
    router,
    refresh,
    setEditorTab: state.setEditorTab,
    showNotice: state.showNotice,
  })
  const auth = useVaultAuthActions({
    router,
    refresh,
    masterPassword: state.masterPassword,
    setMasterPassword: state.setMasterPassword,
    setAuthenticated: state.setAuthenticated,
    setSaving: state.setSaving,
    setEntries: state.setEntries,
    setDraft: state.setDraft,
    setSearch: state.setSearch,
    showNotice: state.showNotice,
  })
  const entryActions = useVaultEntryActions({
    router,
    refresh,
    draft: state.draft,
    currentEntry,
    setDraft: state.setDraft,
    setSaving: state.setSaving,
    showNotice: state.showNotice,
  })
  const copyActions = useVaultCopyActions({
    draft: state.draft,
    showNotice: state.showNotice,
  })

  return { ...nav, ...auth, ...entryActions, ...copyActions }
}
