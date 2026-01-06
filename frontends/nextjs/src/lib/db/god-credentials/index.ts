import { getAdapter } from '../core/dbal-client'

/**
 * Get god credentials expiry timestamp
 */
export async function getGodCredentialsExpiry(): Promise<number> {
  const adapter = getAdapter()
  const result = await adapter.list('SystemConfig')
  const config = (result.data as Array<{ key: string; value?: string }>).find((c) => c.key === 'godCredentialsExpiry')
  return (config?.value !== null && config?.value !== undefined) ? Number(config.value) : 0
}

/**
 * Set god credentials expiry timestamp
 */
export async function setGodCredentialsExpiry(timestamp: number): Promise<void> {
  const adapter = getAdapter()
  await adapter.upsert(
    'SystemConfig',
    'key',
    'godCredentialsExpiry',
    { key: 'godCredentialsExpiry', value: String(timestamp) },
    { value: String(timestamp) }
  )
}

/**
 * Get first login flags
 */
export async function getFirstLoginFlags(): Promise<Record<string, boolean>> {
  const adapter = getAdapter()
  const result = await adapter.list('User')
  const users = result.data as Array<{ id?: string; firstLogin?: boolean }>
  const flags: Record<string, boolean> = {}
  for (const user of users) {
    if (user.id !== null && user.id !== undefined && user.firstLogin !== undefined) {
      flags[user.id] = Boolean(user.firstLogin)
    }
  }
  return flags
}

/**
 * Set first login flag for a user
 */
export async function setFirstLoginFlag(userId: string, flag: boolean): Promise<void> {
  const adapter = getAdapter()
  await adapter.update('User', userId, { firstLogin: flag })
}

/**
 * Get god credentials expiry duration
 */
export async function getGodCredentialsExpiryDuration(): Promise<number> {
  const adapter = getAdapter()
  const result = await adapter.list('SystemConfig')
  const config = (result.data as Array<{ key: string; value?: string }>).find((c) => c.key === 'godCredentialsExpiryDuration')
  return (config?.value !== null && config?.value !== undefined) ? Number(config.value) : 300000 // Default 5 minutes
}

/**
 * Set god credentials expiry duration
 */
export async function setGodCredentialsExpiryDuration(duration: number): Promise<void> {
  const adapter = getAdapter()
  await adapter.upsert(
    'SystemConfig',
    'key',
    'godCredentialsExpiryDuration',
    { key: 'godCredentialsExpiryDuration', value: String(duration) },
    { value: String(duration) }
  )
}

/**
 * Check if god credentials should be shown
 */
export async function shouldShowGodCredentials(): Promise<boolean> {
  const expiry = await getGodCredentialsExpiry()
  return expiry > Date.now()
}

/**
 * Reset god credentials expiry
 */
export async function resetGodCredentialsExpiry(): Promise<void> {
  const duration = await getGodCredentialsExpiryDuration()
  await setGodCredentialsExpiry(Date.now() + duration)
}
