import type { SMTPConfig } from '../password'
import { getAdapter } from '../core/dbal-client'

type DBALSMTPConfig = SMTPConfig

/**
 * Get SMTP configuration
 */
export async function getSMTPConfig(): Promise<SMTPConfig | null> {
  const adapter = getAdapter()
  const result = (await adapter.list('SMTPConfig')) as { data: DBALSMTPConfig[] }
  const config = result.data[0]
  if (config === undefined) return null

  return {
    host: config.host,
    port: config.port,
    secure: config.secure,
    username: config.username,
    password: config.password,
    fromEmail: config.fromEmail,
    fromName: config.fromName,
  }
}
