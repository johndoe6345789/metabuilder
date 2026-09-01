import { describe, expect, it } from 'vitest'
import { Providers as ProvidersComponent } from './providers/providers-component'
import { useTheme as useThemeHook } from './providers/use-theme'
import { Providers, useTheme } from './providers'

describe('providers barrel', () => {
  it('re-exports Providers unchanged', () => {
    expect(Providers).toBe(ProvidersComponent)
  })

  it('re-exports useTheme unchanged', () => {
    expect(useTheme).toBe(useThemeHook)
  })
})
