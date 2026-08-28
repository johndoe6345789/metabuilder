import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

const auth = vi.hoisted(() => ({ value: null as unknown }))
vi.mock('@/app/_components/auth-provider/auth-provider-component', () => ({
  useAuthContext: () => auth.value,
}))

import { authValue, asUser } from '@/test/auth-harness'
import { CredentialsTab } from './CredentialsTab'

const credential = (username: string, tenantId = 'system') => ({
  username,
  tenantId,
  salt: 'abc',
})

function mockDbal(
  routes: { match: string; body: unknown; ok?: boolean }[] = []
) {
  const calls: { url: string; method: string; body?: string }[] = []
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, init?: RequestInit) => {
      const u = String(url)
      calls.push({
        url: u,
        method: init?.method ?? 'GET',
        body: init?.body as string | undefined,
      })
      const route = routes.find(r => u.includes(r.match))
      const ok = route?.ok ?? true
      return {
        ok,
        status: ok ? 200 : 500,
        json: async () => route?.body ?? { data: { data: [] } },
        text: async () => 'error text',
      } as Response
    })
  )
  return calls
}

const signedInAs = (role: string, tenantId = 'system') => {
  auth.value = authValue(asUser({ role: role as never, tenantId }))
}

const typeInto = (placeholderOrLabel: RegExp, value: string) => {
  const field = screen.getByLabelText(placeholderOrLabel)
  fireEvent.change(field, { target: { value } })
}

describe('CredentialsTab', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    signedInAs('god')
  })

  afterEach(() => vi.unstubAllGlobals())

  describe('loading', () => {
    it('lists the credentials it fetched', async () => {
      mockDbal([
        {
          match: 'access/Credential',
          body: { data: { data: [credential('alice')] } },
        },
      ])

      render(<CredentialsTab />)

      await waitFor(() => expect(screen.getByText('alice')).toBeTruthy())
    })

    it('scopes the query to the caller tenant for a non-supergod', async () => {
      signedInAs('god', 'acme')
      const calls = mockDbal()

      render(<CredentialsTab />)

      await waitFor(() => expect(calls.length).toBeGreaterThan(0))
      const credentialCall = calls.find(c => c.url.includes('Credential'))
      expect(credentialCall?.url).toContain('filter.tenantId=acme')
    })

    it('does not scope to a tenant for a supergod viewing all', async () => {
      signedInAs('supergod')
      const calls = mockDbal()

      render(<CredentialsTab />)

      await waitFor(() => expect(calls.length).toBeGreaterThan(0))
      const credentialCall = calls.find(c => c.url.includes('Credential'))
      expect(credentialCall?.url).not.toContain('filter.tenantId')
    })

    it('does not ask for the tenant list unless supergod', async () => {
      signedInAs('god')
      const calls = mockDbal()

      render(<CredentialsTab />)

      await waitFor(() => expect(calls.length).toBeGreaterThan(0))
      expect(calls.some(c => c.url.includes('core/Tenant'))).toBe(false)
    })

    it('explains where to look when the list cannot be read', async () => {
      mockDbal([{ match: 'access/Credential', body: {}, ok: false }])

      render(<CredentialsTab />)

      await waitFor(() => {
        expect(
          screen.getByText(/system\/access\/Credential/)
        ).toBeTruthy()
      })
    })
  })

  describe('creating', () => {
    const fillAndSubmit = async (username: string, password: string) => {
      await waitFor(() => screen.getByLabelText(/username/i))
      typeInto(/username/i, username)
      typeInto(/password/i, password)
      fireEvent.click(screen.getByRole('button', { name: /create/i }))
    }

    it.each([
      ['a username under three characters', 'ab', 'longenough123'],
      ['a password under eight characters', 'alice', 'short'],
    ])('refuses %s without calling DBAL', async (_label, user, pass) => {
      const calls = mockDbal()
      render(<CredentialsTab />)

      await fillAndSubmit(user, pass)

      await waitFor(() => {
        expect(screen.getByText(/3\+ characters/)).toBeTruthy()
      })
      expect(calls.some(c => c.method === 'POST')).toBe(false)
    })

    it('posts a credential for a valid username and password', async () => {
      const calls = mockDbal()
      render(<CredentialsTab />)

      await fillAndSubmit('alice', 'longenough123')

      await waitFor(() => {
        expect(calls.some(c => c.method === 'POST')).toBe(true)
      })
    })

    /**
     * These three pin what the tab sends today. Every one of them is wrong
     * against the DBAL that receives it, and the tab's create cannot work
     * until that is addressed:
     *
     *  - the hash is an unsalted SHA-512, but verify_password is Argon2id
     *    only (argon2id_verify against an encoded $argon2id$ string), so a
     *    credential written this way can never authenticate;
     *  - a `salt` column is sent, which Argon2id does not use -- it embeds
     *    its own salt in the encoded hash;
     *  - the row is keyed by `username`, but every credential lookup is
     *    readIncludingSensitive("Credential", username), which queries the
     *    column literally named `id`.
     *
     * The supported write path is POST /admin/credentials, which takes the
     * plaintext and hashes it server-side. See the notes in the phase 31
     * commit message.
     */
    it('sends an unsalted SHA-512 hash, which Argon2id cannot verify', async () => {
      const calls = mockDbal()
      render(<CredentialsTab />)

      await fillAndSubmit('alice', 'longenough123')

      await waitFor(() => expect(calls.some(c => c.method === 'POST')).toBe(true))
      const body = JSON.parse(
        calls.find(c => c.method === 'POST')?.body ?? '{}'
      )
      // SHA-512 hex, not an $argon2id$ encoded string.
      expect(body.passwordHash).toMatch(/^[0-9a-f]{128}$/)
      expect(body.passwordHash.startsWith('$argon2id$')).toBe(false)
    })

    it('sends a salt column that Argon2id does not use', async () => {
      const calls = mockDbal()
      render(<CredentialsTab />)

      await fillAndSubmit('alice', 'longenough123')

      await waitFor(() => expect(calls.some(c => c.method === 'POST')).toBe(true))
      const body = JSON.parse(
        calls.find(c => c.method === 'POST')?.body ?? '{}'
      )
      expect(body.salt).toMatch(/^[0-9a-f]{32}$/)
    })

    it('keys the row by username, but lookups query id', async () => {
      const calls = mockDbal()
      render(<CredentialsTab />)

      await fillAndSubmit('alice', 'longenough123')

      await waitFor(() => expect(calls.some(c => c.method === 'POST')).toBe(true))
      const body = JSON.parse(
        calls.find(c => c.method === 'POST')?.body ?? '{}'
      )
      expect(body.username).toBe('alice')
      expect(body.id).toBeUndefined()
    })

    it('reports a refused write rather than claiming success', async () => {
      mockDbal([
        { match: 'access/Credential', body: {}, ok: false },
      ])
      render(<CredentialsTab />)

      await fillAndSubmit('alice', 'longenough123')

      await waitFor(() => {
        expect(screen.queryByText(/created for/)).toBeNull()
      })
    })
  })
})
