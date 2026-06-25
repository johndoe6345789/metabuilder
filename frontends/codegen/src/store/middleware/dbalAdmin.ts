/**
 * DBAL admin endpoints — config, adapters, health, seed, sync.
 * Split: dbalAdminConfig.ts | dbalAdminSync.ts
 */
export type {
  DBALHealthResponse,
  DBALConfigResponse,
  DBALAdapterInfo,
  DBALSeedResult,
} from './dbalAdminConfig'
export {
  getDBALHealth,
  getDBALConfig,
  getDBALAdapters,
  testDBALConnection,
  switchDBALAdapter,
  seedDBAL,
} from './dbalAdminConfig'
export {
  syncAllToDBAL,
  fetchAllFromDBAL,
} from './dbalAdminSync'
