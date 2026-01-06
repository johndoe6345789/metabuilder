import { DBALClient as _DBALClient, type DBALConfig as _DBALConfig } from '@/dbal'
import { InMemoryKVStore } from '@/dbal/core/kv'
import { MemoryStorage } from '@/dbal/blob/providers/memory-storage'
import { setInitialized } from './is-initialized'

interface DBALIntegrationState {
  initialized?: boolean
  tenantManager?: unknown
  kvStore?: InMemoryKVStore
  blobStorage?: MemoryStorage
  client?: _DBALClient
}

const state: DBALIntegrationState = {}

/**
 * Initialize the DBAL client with configuration
 */
export async function initialize(config?: Partial<_DBALConfig>): Promise<void> {
  if (state.initialized) {
    console.warn('DBAL already initialized')
    return
  }

  try {
    // Initialize tenant manager (stub for now)
    state.tenantManager = { tenants: new Map() }
    
    // Initialize KV store
    state.kvStore = new InMemoryKVStore()

    // Initialize blob storage
    state.blobStorage = new MemoryStorage()

    // Initialize DBAL client
    const dbalConfig: _DBALConfig = {
      mode: 'development',
      adapter: config?.adapter || 'prisma',
      ...config,
    } as _DBALConfig

    state.client = new _DBALClient(dbalConfig)

    state.initialized = true
    setInitialized(true)
  } catch (error) {
    console.error('Failed to initialize DBAL:', error)
    throw error
  }
}
