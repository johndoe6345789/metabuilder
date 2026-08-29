/** What a vault-view binding is resolved against. */

import type { useVaultController } from './useVaultController'
import type { vaultView } from './vault-view'

export type Controller = ReturnType<typeof useVaultController>

export type Context = { vault: Controller; view: typeof vaultView } &
  Record<string, unknown>
