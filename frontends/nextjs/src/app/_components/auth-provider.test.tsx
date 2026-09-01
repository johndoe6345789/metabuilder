import { describe, expect, it } from 'vitest'
import { AuthProviderComponent } from './auth-provider/auth-provider-component'
import { useAuth as useAuthHook } from './auth-provider/use-auth'
import { AuthProvider, useAuth } from './auth-provider'

describe('auth-provider barrel', () => {
  it('re-exports AuthProvider unchanged', () => {
    expect(AuthProvider).toBe(AuthProviderComponent)
  })

  it('re-exports useAuth unchanged', () => {
    expect(useAuth).toBe(useAuthHook)
  })
})
