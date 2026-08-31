'use client'

import type { Dispatch, SetStateAction } from 'react'
import type { VaultDraft, VaultEntry } from '../vault-types'
import type { VaultTabId } from '../vault-view'

interface Args {
  setDraft: Dispatch<SetStateAction<VaultDraft>>
  setSearch: (value: string) => void
  setMasterPassword: (value: string) => void
  setEditorTab: (tab: VaultTabId) => void
  reload: () => Promise<void>
  lock: () => Promise<void>
  newEntry: () => void
  save: () => Promise<void>
  remove: () => Promise<void>
  selectEntry: (entry: VaultEntry) => void
  unlock: () => Promise<void>
  copyUsername: () => void
  copyPassword: () => void
  copyTurbologin: () => void
}

/** The declarative-view-facing event map -- one name per action the
 *  vault-view config can bind a button to. `updateDraft` uses the
 *  functional setState form so several calls in the same event batch
 *  (e.g. filling in multiple fields at once in a test) each see the
 *  previous one's change, rather than racing off one stale snapshot. */
export function useVaultEvents(args: Args) {
  return {
    reload: args.reload,
    lock: args.lock,
    new: args.newEntry,
    save: args.save,
    delete: args.remove,
    selectEntry: args.selectEntry,
    setSearch: args.setSearch,
    setMasterPassword: args.setMasterPassword,
    unlock: args.unlock,
    setEditorTab: args.setEditorTab,
    updateDraft: (key: keyof VaultDraft, value: string) => {
      args.setDraft(current => ({ ...current, [key]: value }))
    },
    copyUsername: args.copyUsername,
    copyPassword: args.copyPassword,
    copyTurbologin: args.copyTurbologin,
  }
}
