import { DBALClient } from '@/lib/dbal-stub'
import type { User as DBALUser } from '@/lib/dbal-stub/core/types'
import type { User } from './level-types'

let dbalInstance: DBALClient | null = null

export function getDBALClient(user?: User, session?: { id: string; token: string }): DBALClient {
  if (!dbalInstance || user) {
    const auth = user && session ? {
      user: {
        id: user.id,
        username: user.username,
        role: user.role as 'user' | 'admin' | 'god' | 'supergod'
      },
      session: {
        id: session.id,
        token: session.token,
        expiresAt: new Date(Date.now() + 86400000)
      }
    } : undefined

    dbalInstance = new DBALClient({
      mode: 'development',
      adapter: 'prisma',
      database: {
        url: process.env.DATABASE_URL
      },
      auth,
      security: {
        sandbox: auth ? 'strict' : 'disabled',
        enableAuditLog: true
      },
      performance: {
        queryTimeout: 30000
      }
    })
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
