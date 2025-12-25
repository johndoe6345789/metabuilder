import { getAdapter } from '../dbal-client'
import { getPasswordResetTokens } from './get-password-reset-tokens'

/**
 * Set a password reset token for a user
 */
export async function setPasswordResetToken(username: string, token: string): Promise<void> {
  const adapter = getAdapter()
  const tokens = await getPasswordResetTokens()
  tokens[username] = token
  
  const existing = await adapter.list('KeyValue', { filter: { key: 'db_password_reset_tokens' } })
  if (existing.data.length > 0) {
    const kv = existing.data[0] as any
    await adapter.update('KeyValue', kv.id || kv.key, { value: JSON.stringify(tokens) })
  } else {
    await adapter.create('KeyValue', { key: 'db_password_reset_tokens', value: JSON.stringify(tokens) })
  }
}
