export { setCredential } from './credentials/crud/set-credential'
import { getAdapter } from '../dbal-client'

/**
 * Set or update a user's credential
 */
export async function setCredential(username: string, passwordHash: string): Promise<void> {
  const adapter = getAdapter()
  
  // Check if credential exists
  const result = await adapter.list('Credential', { filter: { username } })
  
  if (result.data.length > 0) {
    // Update existing
    const existing = result.data[0] as any
    await adapter.update('Credential', existing.id || existing.username, { passwordHash })
  } else {
    // Create new
    await adapter.create('Credential', { username, passwordHash })
  }

  // Update password change timestamp on user
  const users = await adapter.list('User', { filter: { username } })
  if (users.data.length > 0) {
    const user = users.data[0] as any
    await adapter.update('User', user.id, {
      passwordChangeTimestamp: BigInt(Date.now()),
      firstLogin: false,
    })
  }
}
