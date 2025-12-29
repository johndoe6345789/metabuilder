import type { User } from '@/lib/level-types'

export async function register(
  username: string,
  email: string,
  password: string,
  options?: { tenantId?: string; profilePicture?: string; bio?: string }
): Promise<User> {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username,
      email,
      password,
      tenantId: options?.tenantId,
      profilePicture: options?.profilePicture,
      bio: options?.bio,
    }),
  })

  const payload = (await response.json().catch(() => null)) as {
    user?: User
    error?: string
  } | null

  if (!response.ok || !payload?.user) {
    const message = payload?.error || 'Registration failed'
    throw new Error(message)
  }

  return payload.user
}
