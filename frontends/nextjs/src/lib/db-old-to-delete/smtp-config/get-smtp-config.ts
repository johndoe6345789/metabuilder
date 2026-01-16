import type { SMTPConfig } from '../password'
import { getAdapter } from '../core/dbal-client'

type DBALSMTPConfig = SMTPConfig

/**
 * Get SMTP configuration
 */
export async function getSMTPConfig(): Promise<SMTPConfig | null> {
  const adapter = getAdapter()
  const result = await adapter.list('SMTPConfig')
  const rawConfig = result.data[0] as unknown
  if (!rawConfig) return null

  const config = rawConfig as DBALSMTPConfig

  return {
    host: String(config.host),
    port: Number(config.port),
    secure: Boolean(config.secure),
    username: String(config.username),
    password: String(config.password),
    fromEmail: String(config.fromEmail),
    fromName: String(config.fromName),
  }
}
