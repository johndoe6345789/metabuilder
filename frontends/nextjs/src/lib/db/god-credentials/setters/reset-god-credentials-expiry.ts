import { getGodCredentialsExpiryDuration } from '../getters/get-god-credentials-expiry-duration'
import { setGodCredentialsExpiry } from './set-god-credentials-expiry'

/**
 * Reset god credentials expiry to extend it by the configured duration
 */
export async function resetGodCredentialsExpiry(): Promise<void> {
  const duration = await getGodCredentialsExpiryDuration()
  const expiryTime = Date.now() + duration
  await setGodCredentialsExpiry(expiryTime)
}
