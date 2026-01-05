import type { SMTPConfig } from '../password'
import { getAdapter } from '../core/dbal-client'

/**
 * Set SMTP configuration (replaces existing)
 */
export async function setSMTPConfig(config: SMTPConfig): Promise<void> {
  const adapter = getAdapter()
  // Delete all existing
  const existing = await adapter.list('SMTPConfig')
  for (const item of existing.data as any[]) {
    await adapter.delete('SMTPConfig', item.id)
  }
  // Create new
  await adapter.create('SMTPConfig', {
    host: config.host,
    port: config.port,
    secure: config.secure,
    username: config.username,
    password: config.password,
    fromEmail: config.fromEmail,
    fromName: config.fromName,
  })
}
