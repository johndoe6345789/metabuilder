import { getGodCredentialsExpiry } from './get-god-credentials-expiry'
import { setGodCredentialsExpiry } from './set-god-credentials-expiry'
import { getGodCredentialsExpiryDuration } from './get-god-credentials-expiry-duration'
import { getAdapter } from '../dbal-client'

/**
 * Check if god credentials should be shown
 */
export async function shouldShowGodCredentials(): Promise<boolean> {
  const adapter = getAdapter()
  const expiry = await getGodCredentialsExpiry()

  // Get god user's password change timestamp
  const godUser = await adapter.findFirst('User', {
    where: { username: 'god' },
  })
  const godPasswordChangeTime = godUser?.passwordChangeTimestamp ? Number(godUser.passwordChangeTimestamp) : 0

  if (expiry === 0) {
    const duration = await getGodCredentialsExpiryDuration()
    const expiryTime = Date.now() + duration
    await setGodCredentialsExpiry(expiryTime)
    return true
  }

  if (godPasswordChangeTime > expiry) {
    return false
  }

  return Date.now() < expiry
}
