import 'server-only'

import { DBALClient } from '@/lib/dbal-stub'
import type { DBALConfig } from '@/lib/dbal-stub'
import { dbalState } from './dbal-state.server'

/**
 * Initialize DBAL client for database operations
 */
export async function initializeDBAL(): Promise<void> {
  if (dbalState.initialized) {
    return
  }

  try {
    const config: DBALConfig = {
      mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
      adapter: 'prisma',
      database: {
        url: process.env.DATABASE_URL || 'file:./prisma/dev.db',
      },
      security: {
        sandbox: 'permissive',
        enableAuditLog: false,
      },
    }

    dbalState.client = new DBALClient(config)
    dbalState.initialized = true
    console.log('DBAL client initialized successfully')
  } catch (error) {
    console.error('Failed to initialize DBAL client:', error)
    dbalState.client = null
    dbalState.initialized = true
  }
}
