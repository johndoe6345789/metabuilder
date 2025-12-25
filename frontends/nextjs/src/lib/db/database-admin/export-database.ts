import type { DatabaseSchema } from '../types'
import { getUsers } from '../users'
import { getWorkflows } from '../workflows'
import { getLuaScripts } from '../lua-scripts'
import { getPages } from '../pages'
import { getSchemas } from '../schemas'
import { getAppConfig } from '../app-config'
import { getComments } from '../comments'
import { getComponentHierarchy, getComponentConfigs } from '../components'

/**
 * Export database contents as JSON string
 */
export async function exportDatabase(): Promise<string> {
  const data: Partial<DatabaseSchema> = {
    users: await getUsers(),
    workflows: await getWorkflows(),
    luaScripts: await getLuaScripts(),
    pages: await getPages(),
    schemas: await getSchemas(),
    appConfig: (await getAppConfig()) || undefined,
    comments: await getComments(),
    componentHierarchy: await getComponentHierarchy(),
    componentConfigs: await getComponentConfigs(),
  }
  return JSON.stringify(data, null, 2)
}
