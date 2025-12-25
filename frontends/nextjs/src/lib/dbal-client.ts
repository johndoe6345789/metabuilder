import { DBALClient, type DBALUser, type DBALConfig } from '@/lib/dbal-stub'
import type { User } from './level-types'

let dbalInstance: DBALClient | null = null

export function getDBALClient(user?: User, session?: { id: string; token: string }): DBALClient {
  if (!dbalInstance || user) {
    const config: DBALConfig = {
      mode: 'development',
      adapter: 'prisma',
      database: {
        url: process.env.DATABASE_URL
      },
      security: {
        sandbox: user && session ? 'strict' : 'permissive',
        enableAuditLog: true
      }
    }

    dbalInstance = new DBALClient(config)
  }

  return dbalInstance
}

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

export { DBALClient }
export type { DBALUser }
