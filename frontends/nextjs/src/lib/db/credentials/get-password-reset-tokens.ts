import { prisma } from '../prisma'

/**
 * Get password reset tokens
 */
export async function getPasswordResetTokens(): Promise<Record<string, string>> {
  const kv = await prisma.keyValue.findUnique({ where: { key: 'db_password_reset_tokens' } })
  return kv ? JSON.parse(kv.value) : {}
}
