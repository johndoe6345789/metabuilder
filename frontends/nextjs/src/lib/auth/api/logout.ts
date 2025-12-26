export async function logout(): Promise<void> {
  const response = await fetch('/api/auth/logout', { method: 'POST' })
  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null
    const message = payload?.error || 'Logout failed'
    throw new Error(message)
  }
}
