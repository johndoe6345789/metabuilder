/** Which of the three declared vault views applies right now. */

import type { Controller } from './vault-context'
import type { VaultViewDefinition } from './vault-view'

export type VaultViewKey = keyof VaultViewDefinition['views']

export function selectVaultView(vault: Controller): VaultViewKey {
  if (vault.authLoading) return 'loading'
  return vault.authenticated ? 'unlocked' : 'locked'
}
