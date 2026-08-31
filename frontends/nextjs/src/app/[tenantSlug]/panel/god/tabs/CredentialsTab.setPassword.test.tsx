import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, waitFor } from '@testing-library/react'

// The password-set request itself -- split out of CredentialsTab.test.tsx
// (which covers listing) to stay under the 80-line file limit.

const auth = vi.hoisted(() => ({ value: null as unknown }))
vi.mock('@/app/_components/auth-provider/auth-provider-component', () => ({
  useAuthContext: () => auth.value,
}))

import { CredentialsTab } from './CredentialsTab'
import {
  mockDbal,
  signedInAs,
  users,
  fillAndSubmit,
} from './credentials-tab-test-helpers'

describe('CredentialsTab setting a password', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    signedInAs(auth, 'god')
  })

  afterEach(() => vi.unstubAllGlobals())

  it('posts to our own admin route, not to DBAL directly', async () => {
    const calls = mockDbal([users(), { match: '/api/admin/credentials' }])
    render(<CredentialsTab />)

    await fillAndSubmit('alice', 'longenough123')

    await waitFor(() =>
      expect(calls.some(c => c.method === 'POST')).toBe(true)
    )
    const post = calls.find(c => c.method === 'POST')
    expect(post?.url).toContain('/api/admin/credentials')
    expect(post?.url).not.toContain('access/Credential')
  })

  /**
   * The whole point of the fix: DBAL's verify_password is Argon2id only,
   * so the browser must send the plaintext to our own origin and let the
   * server hash it. A digest computed here could never be verified.
   */
  it('sends the plaintext password, not a hash', async () => {
    const calls = mockDbal([users(), { match: '/api/admin/credentials' }])
    render(<CredentialsTab />)

    await fillAndSubmit('alice', 'longenough123')

    await waitFor(() =>
      expect(calls.some(c => c.method === 'POST')).toBe(true)
    )
    const body = JSON.parse(calls.find(c => c.method === 'POST')?.body ?? '{}')
    expect(body.password).toBe('longenough123')
    expect(body.passwordHash).toBeUndefined()
  })

  it('sends no salt, because Argon2id embeds its own', async () => {
    const calls = mockDbal([users(), { match: '/api/admin/credentials' }])
    render(<CredentialsTab />)

    await fillAndSubmit('alice', 'longenough123')

    await waitFor(() =>
      expect(calls.some(c => c.method === 'POST')).toBe(true)
    )
    const body = JSON.parse(calls.find(c => c.method === 'POST')?.body ?? '{}')
    expect(body.salt).toBeUndefined()
  })
})
