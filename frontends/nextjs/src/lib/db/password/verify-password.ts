import { hashPassword } from './hash-password'
import { timingSafeEqual } from 'crypto'

/**
 * Verify a password against a hash using timing-safe comparison
 * 
 * Uses constant-time comparison to prevent timing attacks where
 * an attacker could infer password validity by measuring response time.
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const inputHash = await hashPassword(password)
  
  // Convert strings to buffers for timing-safe comparison
  const inputBuffer = Buffer.from(inputHash, 'utf8')
  const hashBuffer = Buffer.from(hash, 'utf8')
  
  // Buffers must be same length for timingSafeEqual
  if (inputBuffer.length !== hashBuffer.length) {
    return false
  }
  
  return timingSafeEqual(inputBuffer, hashBuffer)
}
