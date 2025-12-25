import { DBALClient } from '@/lib/dbal-stub'
import type { DBALConfig } from '@/lib/dbal-stub'
import type { User } from '../../types/level-types'
import { dbalClientState } from './dbal-client-state'

export function createDBALClient(user?: User, session?: { id: string; token: string }): DBALClient {
  if (!dbalClientState.instance || user) {
    const config: DBALConfig = {
      mode: 'development',
      adapter: 'prisma',
      database: {
        url: process.env.DATABASE_URL,
      },
      security: {
        sandbox: user && session ? 'strict' : 'permissive',
        enableAuditLog: true,
      },
    }

    dbalClientState.instance = new DBALClient(config)
  }

  return dbalClientState.instance
}
