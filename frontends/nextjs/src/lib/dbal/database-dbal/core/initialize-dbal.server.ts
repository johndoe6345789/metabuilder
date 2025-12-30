// import 'server-only'

import { DBALClient } from '@/dbal'
import type { DBALConfig } from '@/dbal/runtime/config'

import { dbalState } from './dbal-state.server'

/**
 * Initialize DBAL client for database operations
 * Supports both development (TypeScript) and production (C++ daemon) modes
 */
export async function initializeDBAL(): Promise<void> {
  if (dbalState.initialized) {
    return
  }

  const endpoint = process.env.DBAL_WS_URL || process.env.NEXT_PUBLIC_DBAL_WS_URL
  const mode = endpoint
    ? 'production'
    : process.env.DBAL_MODE === 'production'
      ? 'production'
      : 'development'
  const databaseUrl = process.env.DATABASE_URL || 'file:./prisma/dev.db'
  const engine = process.env.DBAL_SQL_ENGINE?.toLowerCase() === 'mysql' ? 'mysql' : 'postgres'
  const auth = process.env.DBAL_API_KEY ? { apiKey: process.env.DBAL_API_KEY } : undefined

  const config: DBALConfig = {
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

  dbalState.client = new DBALClient(config)
  dbalState.initialized = true
  console.log(
    `DBAL client initialized in ${mode} mode${endpoint ? ' with WebSocket endpoint' : ''}`
  )
}
