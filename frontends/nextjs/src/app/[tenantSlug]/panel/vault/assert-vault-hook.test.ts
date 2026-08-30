import { describe, expect, it } from 'vitest'

import { assertVaultHookDeclared } from './assert-vault-hook'

describe('assertVaultHookDeclared', () => {
  it('is silent when the vault hook is declared correctly', () => {
    expect(() => {
      assertVaultHookDeclared([{ id: 'vault', hook: 'useVaultController' }])
    }).not.toThrow()
  })

  it('throws when no hook declares id "vault"', () => {
    expect(() => {
      assertVaultHookDeclared([{ id: 'other', hook: 'useVaultController' }])
    }).toThrow('Vault view must declare the useVaultController hook')
  })

  it('throws when the vault id names a different hook', () => {
    expect(() => {
      assertVaultHookDeclared([{ id: 'vault', hook: 'useSomethingElse' }])
    }).toThrow()
  })

  it('throws for an empty declaration list', () => {
    expect(() => {
      assertVaultHookDeclared([])
    }).toThrow()
  })
})
