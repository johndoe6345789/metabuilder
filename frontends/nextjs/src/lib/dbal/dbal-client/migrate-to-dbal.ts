import { getDBALClient } from './get-dbal-client'

export async function migrateToDBAL() {
  const client = getDBALClient()

  console.log('[DBAL Migration] Starting database migration to DBAL...')

  try {
    const capabilities = await client.capabilities()
    console.log('[DBAL Migration] Adapter capabilities:', capabilities)
    console.log('[DBAL Migration] DBAL is ready for use!')
    return true
  } catch (error) {
    console.error('[DBAL Migration] Failed to initialize DBAL:', error)
    return false
  }
}
