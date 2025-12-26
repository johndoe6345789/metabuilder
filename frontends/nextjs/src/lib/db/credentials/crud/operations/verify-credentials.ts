import { getAdapter } from '../../../core/dbal-client'
import { verifyPassword } from '../../../verify-password'

/**
 * Verify username/password combination
 */
export async function verifyCredentials(username: string, password: string): Promise<boolean> {
  const adapter = getAdapter()
  const result = await adapter.list('Credential', { filter: { username } })
  if (result.data.length === 0) return false
  const credential = result.data[0] as any
  return await verifyPassword(password, credential.passwordHash)
}
