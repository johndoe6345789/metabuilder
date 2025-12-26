import { getAdapter } from '../../core/dbal-client'

export async function deleteSession(sessionId: string): Promise<boolean> {
  const adapter = getAdapter()
  return await adapter.delete('Session', sessionId)
}
