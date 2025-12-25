import { SCRAMBLED_PASSWORDS } from './scrambled-passwords'

/**
 * Gets the scrambled password for a given username
 */
export function getScrambledPassword(username: string): string {
  return SCRAMBLED_PASSWORDS[username as keyof typeof SCRAMBLED_PASSWORDS] || ''
}
