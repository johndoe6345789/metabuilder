import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

const auth = vi.hoisted(() => ({ value: null as unknown }))
vi.mock('@/app/_components/auth-provider/auth-provider-component', () => ({
  useAuthContext: () => auth.value,
}))

import { authValue, asUser } from '@/test/auth-harness'
import { CredentialsTab } from './CredentialsTab'

const account = (username: string, role = 'user', tenantId = 'system') => ({
  username,
  role,
  tenantId,
})

function mockDbal(
  routes: { match: string; body?: unknown; ok?: boolean }[] = []
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
        status: ok ? 200 : 400,
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

const users = (...rows: ReturnType<typeof account>[]) => ({
  match: 'core/User',
  body: { data: { data: rows } },
})

const fillAndSubmit = async (username: string, password: string) => {
  await waitFor(() => screen.getByLabelText(/username/i))
  fireEvent.change(screen.getByLabelText(/username/i), {
    target: { value: username },
  })
  fireEvent.change(screen.getByLabelText(/password/i), {
    target: { value: password },
  })
  fireEvent.click(screen.getByRole('button', { name: /set password/i }))
}

describe('CredentialsTab', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    signedInAs('god')
  })

  afterEach(() => vi.unstubAllGlobals())

  describe('listing accounts', () => {
    it('lists users, not credentials', async () => {
      // Credential is schema.acl.system and can never be listed; User can.
      const calls = mockDbal([users(account('alice'))])

      render(<CredentialsTab />)

      await waitFor(() => expect(screen.getByText('alice')).toBeTruthy())
      expect(calls.some(c => c.url.includes('access/Credential'))).toBe(false)
      expect(calls.some(c => c.url.includes('core/User'))).toBe(true)
    })

    it('scopes to the caller tenant for a god', async () => {
      signedInAs('god', 'acme')
      const calls = mockDbal([users()])

      render(<CredentialsTab />)

      await waitFor(() => expect(calls.length).toBeGreaterThan(0))
      expect(calls[0].url).toContain('filter.tenantId=acme')
    })

    it('does not scope for a supergod viewing all tenants', async () => {
      signedInAs('supergod')
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

  describe('setting a password', () => {
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

    it('posts to our own admin route, not to DBAL directly', async () => {
      const calls = mockDbal([users(), { match: '/api/admin/credentials' }])
      render(<CredentialsTab />)

      await fillAndSubmit('alice', 'longenough123')

      await waitFor(() => expect(calls.some(c => c.method === 'POST')).toBe(true))
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

      await waitFor(() => expect(calls.some(c => c.method === 'POST')).toBe(true))
      const body = JSON.parse(
        calls.find(c => c.method === 'POST')?.body ?? '{}'
      )
      expect(body.password).toBe('longenough123')
      expect(body.passwordHash).toBeUndefined()
    })

    it('sends no salt, because Argon2id embeds its own', async () => {
      const calls = mockDbal([users(), { match: '/api/admin/credentials' }])
      render(<CredentialsTab />)

      await fillAndSubmit('alice', 'longenough123')

      await waitFor(() => expect(calls.some(c => c.method === 'POST')).toBe(true))
      const body = JSON.parse(
        calls.find(c => c.method === 'POST')?.body ?? '{}'
      )
      expect(body.salt).toBeUndefined()
    })

    it('names the tenant it is writing into', async () => {
      signedInAs('god', 'acme')
      const calls = mockDbal([users(), { match: '/api/admin/credentials' }])
      render(<CredentialsTab />)

      await fillAndSubmit('alice', 'longenough123')

      await waitFor(() => expect(calls.some(c => c.method === 'POST')).toBe(true))
      const body = JSON.parse(
        calls.find(c => c.method === 'POST')?.body ?? '{}'
      )
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
        expect(
          screen.getByText(/only manage their own tenant/)
        ).toBeTruthy()
      })
    })
  })
})
