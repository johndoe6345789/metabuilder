import type { DBALConfig } from '../runtime/config'
import { DBALClient } from './client/client'
export { buildAdapter, buildEntityOperations } from './client/builders'
export { normalizeClientConfig, validateClientConfig } from './client/mappers'

export const createDBALClient = (config: DBALConfig) => new DBALClient(config)

export { DBALClient }
