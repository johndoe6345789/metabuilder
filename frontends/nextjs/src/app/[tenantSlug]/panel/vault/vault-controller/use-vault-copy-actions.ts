'use client'

import type { VaultDraft } from '../vault-types'
import type { VaultNotice } from './use-vault-state'

interface Args {
  draft: VaultDraft
  showNotice: (kind: VaultNotice['kind'], message: string) => void
}

/** Copying credential fields to the clipboard. */
export function useVaultCopyActions({ draft, showNotice }: Args) {
  const copy = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value)
      showNotice('success', `${label} copied.`)
    } catch {
      showNotice('error', `Unable to copy ${label.toLowerCase()}.`)
    }
  }

  return {
    copyUsername: () => copy(draft.username, 'Username'),
    copyPassword: () => copy(draft.password, 'Password'),
    copyTurbologin: () =>
      copy(
        JSON.stringify({
          user: draft.username,
          pass: draft.password,
          rememberMe: true,
          loginMethod: 'password',
        }),
        'Turbologin'
      ),
  }
}
