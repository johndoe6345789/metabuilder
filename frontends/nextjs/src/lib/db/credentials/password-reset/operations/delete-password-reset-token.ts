import { getAdapter } from '../dbal-client'
import { getPasswordResetTokens } from './get-password-reset-tokens'

/**
 * Delete a password reset token
 */
export async function deletePasswordResetToken(username: string): Promise<void> {
  const adapter = getAdapter()
  const tokens = await getPasswordResetTokens()
  delete tokens[username]
  
  const existing = await adapter.list('KeyValue', { filter: { key: 'db_password_reset_tokens' } })
  if (existing.data.length > 0) {
    const kv = existing.data[0] as any
    await adapter.update('KeyValue', kv.id || kv.key, { value: JSON.stringify(tokens) })
  } else {
    await adapter.create('KeyValue', { key: 'db_password_reset_tokens', value: JSON.stringify(tokens) })
  }
}
