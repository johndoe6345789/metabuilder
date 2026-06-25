/**
 * DBAL HTTP Client barrel.
 * Split to comply with ≤100 LOC rule:
 *   dbalConfig.ts — URL, tenant, entity map, helpers
 *   dbalCrud.ts   — entity CRUD operations
 *   dbalAdmin.ts  — admin endpoints, bulk ops
 */
export {
  DBAL_API_URL,
  DBAL_TENANT,
  DBAL_ADMIN_TOKEN,
  ENTITY_MAP,
  isConnectionError,
  entityUrl,
  adminUrl,
  adminHeaders,
} from './dbalConfig'

export {
  syncToDBAL,
  createInDBAL,
  fetchFromDBAL,
  listFromDBAL,
  deleteFromDBAL,
} from './dbalCrud'

export type {
  DBALHealthResponse,
  DBALConfigResponse,
  DBALAdapterInfo,
  DBALSeedResult,
} from './dbalAdmin'

export {
  getDBALHealth,
  getDBALConfig,
  getDBALAdapters,
  testDBALConnection,
  switchDBALAdapter,
  seedDBAL,
  syncAllToDBAL,
  fetchAllFromDBAL,
} from './dbalAdmin'
