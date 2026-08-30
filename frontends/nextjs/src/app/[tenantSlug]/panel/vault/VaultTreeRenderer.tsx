'use client'

import { useVaultController } from './useVaultController'
import { vaultView } from './vault-view'
import { assertVaultHookDeclared } from './assert-vault-hook'
import { selectVaultView } from './vault-view-select'
import { VaultNode } from './VaultNode'
import type { Controller } from './vault-context'

function useDeclaredHooks(): { vault: Controller } {
  const vault = useVaultController()
  assertVaultHookDeclared(vaultView.hooks)
  return { vault }
}

export function VaultTreeRenderer() {
  const { vault } = useDeclaredHooks()
  return (
    <VaultNode
      node={vaultView.views[selectVaultView(vault)]}
      context={{ vault, view: vaultView }}
    />
  )
}
