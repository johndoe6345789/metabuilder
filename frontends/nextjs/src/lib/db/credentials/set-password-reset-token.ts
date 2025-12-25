import { prisma } from '../prisma'
import { getPasswordResetTokens } from './get-password-reset-tokens'

/**
 * Set a password reset token for a user
 */
export async function setPasswordResetToken(username: string, token: string): Promise<void> {
  const tokens = await getPasswordResetTokens()
  tokens[username] = token
  await prisma.keyValue.upsert({
    where: { key: 'db_password_reset_tokens' },
    update: { value: JSON.stringify(tokens) },
    create: { key: 'db_password_reset_tokens', value: JSON.stringify(tokens) },
  })
}
