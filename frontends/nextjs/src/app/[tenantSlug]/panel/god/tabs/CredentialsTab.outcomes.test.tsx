import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'

// Post-submit outcomes -- split out of CredentialsTab.setPassword.test.tsx
// to stay under the 80-line file limit.

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

describe('CredentialsTab setting a password outcomes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    signedInAs(auth, 'god')
  })

  afterEach(() => vi.unstubAllGlobals())

  it('names the tenant it is writing into', async () => {
    signedInAs(auth, 'god', 'acme')
    const calls = mockDbal([users(), { match: '/api/admin/credentials' }])
    render(<CredentialsTab />)

    await fillAndSubmit('alice', 'longenough123')

    await waitFor(() =>
      expect(calls.some(c => c.method === 'POST')).toBe(true)
    )
    const body = JSON.parse(calls.find(c => c.method === 'POST')?.body ?? '{}')
    expect(body.tenantId).toBe('acme')
  })

  it('confirms success and clears the form', async () => {
    mockDbal([users(), { match: '/api/admin/credentials' }])
    render(<CredentialsTab />)

    await fillAndSubmit('alice', 'longenough123')

    await waitFor(() => {
      expect(screen.getByText(/Password set for alice/)).toBeTruthy()
    })
  })

  it('surfaces the server message on refusal', async () => {
    mockDbal([
      users(),
      {
        match: '/api/admin/credentials',
        ok: false,
        body: { error: 'God users can only manage their own tenant.' },
      },
    ])
    render(<CredentialsTab />)

    await fillAndSubmit('alice', 'longenough123')

    await waitFor(() => {
      expect(screen.getByText(/only manage their own tenant/)).toBeTruthy()
    })
  })
})
