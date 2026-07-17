import crypto from 'crypto'
import { getVaultMasterPassword } from '@/lib/vault/master-password'

export const VAULT_COOKIE_NAME = 'vault_master_session'

export function createVaultSessionToken(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex')
}

export function getExpectedVaultSessionToken(): string | null {
  const password = getVaultMasterPassword()
  if (password === null) return null
  return createVaultSessionToken(password)
}

export function hasValidVaultSession(request: Request): boolean {
  const expected = getExpectedVaultSessionToken()
  if (expected === null) return false
  const cookieHeader = request.headers.get('cookie') ?? ''
  return cookieHeader
    .split(';')
    .map(part => part.trim())
    .some(part => part === `${VAULT_COOKIE_NAME}=${expected}`)
}
