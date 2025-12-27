import 'server-only'

import { DBALClient as StubDBALClient } from '@/lib/dbal/dbal-stub'
import type { DBALConfig as StubDBALConfig } from '@/lib/dbal/dbal-stub'
import { DBALClient as RealDBALClient } from '@/dbal'
import type { DBALConfig as RealDBALConfig } from '@/dbal/runtime/config'
import { dbalState } from './dbal-state.server'

/**
 * Initialize DBAL client for database operations
 */
export async function initializeDBAL(): Promise<void> {
  if (dbalState.initialized) {
    return
  }

  const endpoint = process.env.DBAL_WS_URL || process.env.NEXT_PUBLIC_DBAL_WS_URL
  const mode = endpoint ? 'production' : process.env.DBAL_MODE === 'production' ? 'production' : 'development'
  const databaseUrl = process.env.DATABASE_URL || 'file:./prisma/dev.db'
  const engine = process.env.DBAL_SQL_ENGINE?.toLowerCase() === 'mysql' ? 'mysql' : 'postgres'
  const auth = process.env.DBAL_API_KEY ? { apiKey: process.env.DBAL_API_KEY } : undefined

  const config: RealDBALConfig = {
    mode,
    adapter: endpoint ? 'prisma' : engine,
    endpoint: endpoint ?? undefined,
    auth,
    database: {
      url: databaseUrl,
    },
    security: {
      sandbox: endpoint ? 'strict' : 'permissive',
      enableAuditLog: false,
    },
  }

  try {
    dbalState.client = new RealDBALClient(config)
    dbalState.initialized = true
    console.log('Real DBAL client initialized successfully')
  } catch (error) {
    console.warn('Falling back to stub DBAL client:', error)
    const stubConfig: StubDBALConfig = {
      mode,
      adapter: engine,
      auth,
      database: {
        url: databaseUrl,
      },
      security: {
        sandbox: 'permissive',
        enableAuditLog: false,
      },
    }
    dbalState.client = new StubDBALClient(stubConfig)
    dbalState.initialized = true
  }
}
