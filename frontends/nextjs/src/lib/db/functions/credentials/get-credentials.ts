import { prisma } from '../../prisma'

/**
 * Get all credentials as username->hash map
 * @returns Record of username to password hash
 */
export const getCredentials = async (): Promise<Record<string, string>> => {
  const credentials = await prisma.credential.findMany()
  const result: Record<string, string> = {}
  for (const cred of credentials) {
    result[cred.username] = cred.passwordHash
  }
  return result
}
