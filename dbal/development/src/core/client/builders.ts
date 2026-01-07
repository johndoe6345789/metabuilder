import type { DBALAdapter } from '../../adapters/adapter'
import type { DBALConfig } from '../../runtime/config'
import { createAdapter } from './adapter-factory'
import {
  createComponentNodeOperations,
  createLuaScriptOperations,
  createInstalledPackageOperations,
  createPackageDataOperations,
  createPageConfigOperations,
  createSessionOperations,
  createUserOperations,
  createWorkflowOperations
} from '../entities'

export const buildAdapter = (config: DBALConfig): DBALAdapter => createAdapter(config)

export const buildEntityOperations = (adapter: DBALAdapter, tenantId?: string) => ({
  users: createUserOperations(adapter, tenantId),
  pageConfigs: createPageConfigOperations(adapter, tenantId),
  componentNodes: createComponentNodeOperations(adapter, tenantId),
  workflows: createWorkflowOperations(adapter, tenantId),
  luaScripts: createLuaScriptOperations(adapter, tenantId),
  installedPackages: createInstalledPackageOperations(adapter, tenantId),
  packageData: createPackageDataOperations(adapter),
  sessions: createSessionOperations(adapter, tenantId),
})
