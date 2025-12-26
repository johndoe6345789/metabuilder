import type { User } from '@/lib/level-types'

export async function login(identifier: string, password: string, options?: { tenantId?: string }): Promise<User> {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      identifier,
      password,
      tenantId: options?.tenantId,
    }),
  })

  const payload = (await response.json().catch(() => null)) as { user?: User; error?: string } | null

  if (!response.ok || !payload?.user) {
    const message = payload?.error || 'Login failed'
    throw new Error(message)
  }

  return payload.user
}
