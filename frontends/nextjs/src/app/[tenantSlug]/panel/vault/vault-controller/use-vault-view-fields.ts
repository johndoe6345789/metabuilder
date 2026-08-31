'use client'

import { useMemo } from 'react'
import { findOrFirst } from '@/lib/first-of'
import { vaultView, type VaultTabId } from '../vault-view'
import type { VaultDraft, VaultEntry } from '../vault-types'

interface Args {
  draft: VaultDraft
  editorTab: VaultTabId
  saving: boolean
  currentEntry: VaultEntry | null
}

/** The declarative vault-view config (tabs, editor actions), resolved
 *  against the current draft/tab/entry into what the editor renders. */
export function useVaultViewFields({
  draft,
  editorTab,
  saving,
  currentEntry,
}: Args) {
  const activeFields = useMemo(() => {
    const tab = findOrFirst(
      vaultView.tabs,
      candidate => candidate.id === editorTab,
      'Vault editor tabs'
    )
    return tab.fields.map(field => ({
      ...field,
      value: draft[field.key],
      inputType: field.type === 'textarea' ? 'text' : field.type,
      multiline: field.type === 'textarea',
    }))
  }, [draft, editorTab])

  const renderEditorActions = useMemo(
    () =>
      vaultView.editorActions.map(action => ({
        ...action,
        disabled:
          saving ||
          (action.requires?.some(key => (draft[key] ?? '').length === 0) ??
            false) ||
          (action.requiresEntry === true && currentEntry === null),
      })),
    [currentEntry, draft, saving]
  )

  const updatedLabel =
    currentEntry === null
      ? ''
      : `Updated ${new Date(currentEntry.updatedAt).toLocaleString()}`

  return { activeFields, renderEditorActions, updatedLabel }
}
