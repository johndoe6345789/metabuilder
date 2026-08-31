'use client'

import { useParams, useRouter } from 'next/navigation'
import { useVaultState } from './vault-controller/use-vault-state'
import { useVaultSession } from './vault-controller/use-vault-session'
import { useCurrentEntry } from './vault-controller/use-current-entry'
import { useVaultViewFields } from './vault-controller/use-vault-view-fields'
import { useVaultActions } from './vault-controller/use-vault-actions'
import { useVaultEvents } from './vault-controller/use-vault-events'

export type { VaultNotice } from './vault-controller/use-vault-state'

export function useVaultController() {
  const router = useRouter()
  const params = useParams<{ slug?: string[] }>()
  const routeSlug = params.slug?.[0] ?? null

  const state = useVaultState()
  const { refresh } = useVaultSession({
    setEntries: state.setEntries,
    setAuthenticated: state.setAuthenticated,
    setAuthLoading: state.setAuthLoading,
    showNotice: state.showNotice,
  })
  const { currentEntry, visibleEntries } = useCurrentEntry({
    entries: state.entries,
    routeSlug,
    search: state.search,
    setDraft: state.setDraft,
  })
  const view = useVaultViewFields({
    draft: state.draft,
    editorTab: state.editorTab,
    saving: state.saving,
    currentEntry,
  })
  const actions = useVaultActions({ router, refresh, state, currentEntry })
  const events = useVaultEvents({
    setDraft: state.setDraft,
    setSearch: state.setSearch,
    setMasterPassword: state.setMasterPassword,
    setEditorTab: state.setEditorTab,
    ...actions,
  })

  return {
    entries: state.entries,
    visibleEntries,
    currentEntry,
    draft: state.draft,
    setDraft: state.setDraft,
    authLoading: state.authLoading,
    authenticated: state.authenticated,
    saving: state.saving,
    masterPassword: state.masterPassword,
    setMasterPassword: state.setMasterPassword,
    search: state.search,
    setSearch: state.setSearch,
    notice: state.notice,
    editorTab: state.editorTab,
    setEditorTab: state.setEditorTab,
    routeSlug,
    showNotice: state.showNotice,
    ...actions,
    events,
    ...view,
  }
}
