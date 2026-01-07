import type { DBALAdapter } from '../../adapters/adapter'
import type { DBALConfig } from '../../runtime/config'
import { createAdapter } from './adapter-factory'
import {
  createComponentOperations,
  createLuaScriptOperations,
  createPackageOperations,
  createPageOperations,
  createSessionOperations,
  createUserOperations,
  createWorkflowOperations
} from '../entities'

export const buildAdapter = (config: DBALConfig): DBALAdapter => createAdapter(config)

export const buildEntityOperations = (adapter: DBALAdapter, tenantId?: string) => ({
  users: createUserOperations(adapter, tenantId),
  pages: createPageOperations(adapter, tenantId),
  components: createComponentOperations(adapter, tenantId),
  workflows: createWorkflowOperations(adapter, tenantId),
  luaScripts: createLuaScriptOperations(adapter, tenantId),
  packages: createPackageOperations(adapter, tenantId),
  sessions: createSessionOperations(adapter, tenantId)
})
