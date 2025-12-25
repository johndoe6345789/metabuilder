import { prisma } from '../prisma'

/**
 * Get all credentials as a username->passwordHash map
 */
export async function getCredentials(): Promise<Record<string, string>> {
  const credentials = await prisma.credential.findMany()
  const result: Record<string, string> = {}
  for (const cred of credentials) {
    result[cred.username] = cred.passwordHash
  }
  return result
}
