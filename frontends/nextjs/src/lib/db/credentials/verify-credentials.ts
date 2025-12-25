import { prisma } from '../prisma'
import { verifyPassword } from '../hash-password'

/**
 * Verify username/password combination
 */
export async function verifyCredentials(username: string, password: string): Promise<boolean> {
  const credential = await prisma.credential.findUnique({ where: { username } })
  if (!credential) return false
  return await verifyPassword(password, credential.passwordHash)
}
