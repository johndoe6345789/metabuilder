import { prisma } from '../prisma'
import { getPasswordResetTokens } from './get-password-reset-tokens'

/**
 * Delete a password reset token
 */
export async function deletePasswordResetToken(username: string): Promise<void> {
  const tokens = await getPasswordResetTokens()
  delete tokens[username]
  await prisma.keyValue.upsert({
    where: { key: 'db_password_reset_tokens' },
    update: { value: JSON.stringify(tokens) },
    create: { key: 'db_password_reset_tokens', value: JSON.stringify(tokens) },
  })
}
