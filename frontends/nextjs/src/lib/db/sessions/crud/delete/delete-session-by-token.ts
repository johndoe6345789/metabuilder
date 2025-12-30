import { getAdapter } from '../../../core/dbal-client'

type DBALSessionRecord = {
  id: string
}

export async function deleteSessionByToken(token: string): Promise<boolean> {
  const adapter = getAdapter()
  const result = (await adapter.list('Session', { filter: { token } })) as {
    data: DBALSessionRecord[]
  }
  if (!result.data.length) return false
  const session = result.data[0]
  await adapter.delete('Session', session.id)
  return true
}
