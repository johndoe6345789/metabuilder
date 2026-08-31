'use client'

import type { useRouter } from 'next/navigation'
import {
  createVaultEntry,
  deleteVaultEntry,
  updateVaultEntry,
} from '../vault-api'
import type { VaultDraft, VaultEntry } from '../vault-types'
import { draftFromEntry } from '../vault-normalize'
import { buildSavePayload } from './build-save-payload'
import type { VaultNotice } from './use-vault-state'

interface Args {
  router: ReturnType<typeof useRouter>
  refresh: () => Promise<VaultEntry[]>
  draft: VaultDraft
  currentEntry: VaultEntry | null
  setDraft: (draft: VaultDraft) => void
  setSaving: (saving: boolean) => void
  showNotice: (kind: VaultNotice['kind'], message: string) => void
}

/** Saving (create or update) and deleting the entry currently open in
 *  the editor. */
export function useVaultEntryActions({
  router,
  refresh,
  draft,
  currentEntry,
  setDraft,
  setSaving,
  showNotice,
}: Args) {
  const save = async () => {
    const payload = buildSavePayload(draft)
    if (payload === null) {
      showNotice('error', 'Slug, title, username, and password are required.')
      return
    }
    try {
      setSaving(true)
      const saved =
        currentEntry === null
          ? await createVaultEntry(payload)
          : await updateVaultEntry(currentEntry.id, payload)
      await refresh()
      router.push(`/vault/${encodeURIComponent(saved.slug)}`)
      setDraft(draftFromEntry(saved))
      showNotice('success', `Saved ${saved.title}.`)
    } catch (error) {
      showNotice('error', error instanceof Error ? error.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const remove = async () => {
    if (currentEntry === null) return
    try {
      setSaving(true)
      await deleteVaultEntry(currentEntry.id)
      const next = await refresh()
      router.push(
        next[0] !== undefined ? `/vault/${next[0].slug}` : '/vault/new'
      )
      showNotice('info', `Deleted ${currentEntry.title}.`)
    } catch (error) {
      showNotice(
        'error',
        error instanceof Error ? error.message : 'Delete failed'
      )
    } finally {
      setSaving(false)
    }
  }

  return { save, remove }
}
