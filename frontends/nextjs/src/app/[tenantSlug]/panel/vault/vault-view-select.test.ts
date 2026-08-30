import { describe, expect, it } from 'vitest'

import { selectVaultView } from './vault-view-select'

const vault = (over: Record<string, unknown> = {}) => ({
  authLoading: false,
  authenticated: false,
  ...over,
}) as never

describe('selectVaultView', () => {
  it('is loading while auth resolves, before authenticated is known', () => {
    const state = vault({ authLoading: true, authenticated: true })
    expect(selectVaultView(state)).toBe('loading')
  })

  it('is unlocked once authenticated', () => {
    expect(selectVaultView(vault({ authenticated: true }))).toBe('unlocked')
  })

  it('is locked when not authenticated and not loading', () => {
    expect(selectVaultView(vault())).toBe('locked')
  })
})
