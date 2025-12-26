import { getAdapter } from '../../core/dbal-client'

/**
 * Set god credentials expiry duration in ms
 */
export async function setGodCredentialsExpiryDuration(durationMs: number): Promise<void> {
  const adapter = getAdapter()
  await adapter.upsert('SystemConfig', {
    where: { key: 'god_credentials_expiry_duration' },
    update: { value: durationMs.toString() },
    create: { key: 'god_credentials_expiry_duration', value: durationMs.toString() },
  })
}
