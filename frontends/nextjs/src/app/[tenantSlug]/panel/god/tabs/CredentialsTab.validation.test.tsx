import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'

// Client-side validation before a submit ever reaches the server -- split
// out of CredentialsTab.setPassword.test.tsx to stay under the 80-line
// file limit.

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

describe('CredentialsTab password validation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    signedInAs(auth, 'god')
  })

  afterEach(() => vi.unstubAllGlobals())

  it.each([
    ['a username under three characters', 'ab', 'longenough123'],
    ['a password under eight characters', 'alice', 'short'],
  ])('refuses %s without calling the server', async (_l, user, pass) => {
    const calls = mockDbal([users()])
    render(<CredentialsTab />)

    await fillAndSubmit(user, pass)

    await waitFor(() => {
      expect(screen.getByText(/3\+ characters/)).toBeTruthy()
    })
    expect(calls.some(c => c.method === 'POST')).toBe(false)
  })
})
