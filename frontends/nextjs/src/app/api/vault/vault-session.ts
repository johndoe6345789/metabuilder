import crypto from 'crypto'
import { getVaultMasterPassword } from '@/lib/vault/master-password'

export const VAULT_COOKIE_NAME = 'vault_master_session'

// Fixed, application-specific salt for the KDF below. There's a single
// shared master password for the vault (no per-user accounts), so this
// isn't standing in for a per-user salt — its job is to defeat
// precomputed rainbow-table attacks if the derived token ever leaks.
const VAULT_TOKEN_SALT = 'metabuilder-vault-session-token-v1'

export function createVaultSessionToken(password: string): string {
  // scrypt is deliberately slow/memory-hard, unlike a plain SHA-256
  // digest, so a leaked token can't be brute-forced back to the master
  // password cheaply.
  return crypto.scryptSync(password, VAULT_TOKEN_SALT, 32).toString('hex')
}

export function getExpectedVaultSessionToken(): string | null {
  const password = getVaultMasterPassword()
  if (password === null) return null
  return createVaultSessionToken(password)
}

/** @brief Constant-time string comparison to avoid timing side channels. */
export function safeTokenEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  if (bufA.length !== bufB.length) return false
  return crypto.timingSafeEqual(bufA, bufB)
}

export function hasValidVaultSession(request: Request): boolean {
  const expected = getExpectedVaultSessionToken()
  if (expected === null) return false
  const cookieHeader = request.headers.get('cookie') ?? ''
  const prefix = `${VAULT_COOKIE_NAME}=`
  return cookieHeader
    .split(';')
    .map(part => part.trim())
    .some(
      part =>
        part.startsWith(prefix) &&
        safeTokenEqual(part.slice(prefix.length), expected)
    )
}
