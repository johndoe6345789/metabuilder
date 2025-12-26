import { getAdapter } from '../../../core/dbal-client'

export async function deleteSessionByToken(token: string): Promise<boolean> {
  const adapter = getAdapter()
  const result = await adapter.list('Session', { filter: { token } })
  if (!result.data.length) return false
  const session = result.data[0] as any
  await adapter.delete('Session', session.id)
  return true
}
