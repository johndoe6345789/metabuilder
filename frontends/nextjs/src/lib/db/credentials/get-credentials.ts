import { getAdapter } from '../dbal-client'

/**
 * Get all credentials as a username->passwordHash map
 */
export async function getCredentials(): Promise<Record<string, string>> {
  const adapter = getAdapter()
  const result = await adapter.list('Credential')
  const credentials: Record<string, string> = {}
  for (const cred of result.data as any[]) {
    credentials[cred.username] = cred.passwordHash
  }
  return credentials
}
