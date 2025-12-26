import { getAdapter } from '../../../core/dbal-client'

/**
 * Get password reset tokens
 */
export async function getPasswordResetTokens(): Promise<Record<string, string>> {
  const adapter = getAdapter()
  const result = await adapter.list('KeyValue', { filter: { key: 'db_password_reset_tokens' } })
  if (result.data.length === 0) return {}
  const kv = result.data[0] as any
  return kv ? JSON.parse(kv.value) : {}
}
