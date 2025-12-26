import { setGodCredentialsExpiry } from './set-god-credentials-expiry'
import { getGodCredentialsExpiryDuration } from './get-god-credentials-expiry-duration'

/**
 * Reset god credentials expiry to extend it by the configured duration
 */
export async function resetGodCredentialsExpiry(): Promise<void> {
  const duration = await getGodCredentialsExpiryDuration()
  const expiryTime = Date.now() + duration
  await setGodCredentialsExpiry(expiryTime)
}
