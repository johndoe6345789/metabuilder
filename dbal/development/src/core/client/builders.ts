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

export const buildEntityOperations = (adapter: DBALAdapter) => ({
  users: createUserOperations(adapter),
  pages: createPageOperations(adapter),
  components: createComponentOperations(adapter),
  workflows: createWorkflowOperations(adapter),
  luaScripts: createLuaScriptOperations(adapter),
  packages: createPackageOperations(adapter),
  sessions: createSessionOperations(adapter)
})
