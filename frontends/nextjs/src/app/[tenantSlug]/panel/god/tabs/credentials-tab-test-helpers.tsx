import { vi } from 'vitest'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { authValue, asUser } from '@/test/auth-harness'

interface AuthMock {
  value: unknown
}

export const account = (username: string, role = 'user', tenantId = 'system') => ({
  username,
  role,
  tenantId,
})

export function mockDbal(
  routes: { match: string; body?: unknown; ok?: boolean }[] = []
) {
  const calls: { url: string; method: string; body?: string }[] = []
  vi.stubGlobal(
    'fetch',
    vi.fn((url: string, init?: RequestInit) => {
      const u = String(url)
      calls.push({
        url: u,
        method: init?.method ?? 'GET',
        body: init?.body as string | undefined,
      })
      const route = routes.find(r => u.includes(r.match))
      const ok = route?.ok ?? true
      const response = {
        ok,
        status: ok ? 200 : 400,
        // Real Response methods return promises -- CredentialsTab chains
        // .catch() off res.json(), so a synchronous stand-in breaks it.
        json: () => Promise.resolve(route?.body ?? { data: { data: [] } }),
        text: () => Promise.resolve('error text'),
      }
      // A deliberately partial Response double -- CredentialsTab only ever
      // reads .ok/.status/.json()/.text() from what fetch() returns.
      return Promise.resolve(response as unknown as Response)
    })
  )
  return calls
}

export const signedInAs = (auth: AuthMock, role: string, tenantId = 'system') => {
  auth.value = authValue(asUser({ role: role as never, tenantId }))
}

export const users = (...rows: ReturnType<typeof account>[]) => ({
  match: 'core/User',
  body: { data: { data: rows } },
})

export const fillAndSubmit = async (username: string, password: string) => {
  await waitFor(() => screen.getByLabelText(/username/i))
  fireEvent.change(screen.getByLabelText(/username/i), {
    target: { value: username },
  })
  fireEvent.change(screen.getByLabelText(/password/i), {
    target: { value: password },
  })
  fireEvent.click(screen.getByRole('button', { name: /set password/i }))
}
