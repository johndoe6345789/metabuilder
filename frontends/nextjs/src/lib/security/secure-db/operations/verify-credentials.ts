import { prisma } from '../../db/prisma'
import type { SecurityContext } from './types'
import { executeQuery } from './execute-query'
import { sanitizeInput } from './sanitize-input'

/**
 * Verify user credentials with security checks
 */
export async function verifyCredentials(
  ctx: SecurityContext, 
  username: string, 
  password: string
): Promise<boolean> {
  const sanitizedUsername = sanitizeInput(username)
  
  return executeQuery(
    ctx,
    'credential',
    'READ',
    async () => {
      const credential = await prisma.credential.findUnique({
        where: { username: sanitizedUsername },
      })
      
      if (!credential) return false
      
      const encoder = new TextEncoder()
      const data = encoder.encode(password)
      const hashBuffer = await crypto.subtle.digest('SHA-512', data)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
      
      return hashHex === credential.passwordHash
    },
    sanitizedUsername
  )
}
