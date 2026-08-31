import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'

const auth = vi.hoisted(() => ({ value: null as unknown }))
vi.mock('@/app/_components/auth-provider/auth-provider-component', () => ({
  useAuthContext: () => auth.value,
}))

import { CredentialsTab } from './CredentialsTab'
import { account, mockDbal, signedInAs, users } from './credentials-tab-test-helpers'

describe('CredentialsTab listing accounts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    signedInAs(auth, 'god')
  })

  afterEach(() => vi.unstubAllGlobals())

  it('lists users, not credentials', async () => {
    // Credential is schema.acl.system and can never be listed; User can.
    const calls = mockDbal([users(account('alice'))])

    render(<CredentialsTab />)

    await waitFor(() => expect(screen.getByText('alice')).toBeTruthy())
    expect(calls.some(c => c.url.includes('access/Credential'))).toBe(false)
    expect(calls.some(c => c.url.includes('core/User'))).toBe(true)
  })

  it('scopes to the caller tenant for a god', async () => {
    signedInAs(auth, 'god', 'acme')
    const calls = mockDbal([users()])

    render(<CredentialsTab />)

    await waitFor(() => expect(calls.length).toBeGreaterThan(0))
    expect(calls[0].url).toContain('filter.tenantId=acme')
  })

  it('does not scope for a supergod viewing all tenants', async () => {
    signedInAs(auth, 'supergod')
    const calls = mockDbal([users()])

    render(<CredentialsTab />)

    await waitFor(() => expect(calls.length).toBeGreaterThan(0))
    expect(calls[0].url).not.toContain('filter.tenantId')
  })

  it('drops a user row with no username', async () => {
    mockDbal([users(account('alice'), { tenantId: 'system' } as never)])

    render(<CredentialsTab />)

    await waitFor(() => expect(screen.getByText('alice')).toBeTruthy())
    expect(screen.getAllByText(/Set password/).length).toBe(2)
  })

  it('explains where to look when the list cannot be read', async () => {
    mockDbal([{ match: 'core/User', ok: false }])

    render(<CredentialsTab />)

    await waitFor(() => {
      expect(screen.getByText(/system\/core\/User/)).toBeTruthy()
    })
  })
})
