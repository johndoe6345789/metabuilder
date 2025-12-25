import { hashPassword } from './hash-password'

/**
 * Verify a password against a hash
 * @param password - The plain text password
 * @param hash - The hash to compare against
 * @returns True if password matches hash
 */
export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  const inputHash = await hashPassword(password)
  return inputHash === hash
}
