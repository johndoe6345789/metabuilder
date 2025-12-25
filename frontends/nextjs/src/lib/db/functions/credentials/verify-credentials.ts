import { prisma } from '../../prisma'
import { verifyPassword } from '../verify-password'

/**
 * Verify user credentials
 * @param username - The username
 * @param password - The plain text password
 * @returns True if credentials are valid
 */
export const verifyCredentials = async (username: string, password: string): Promise<boolean> => {
  const credential = await prisma.credential.findUnique({ where: { username } })
  if (!credential) return false
  return await verifyPassword(password, credential.passwordHash)
}
