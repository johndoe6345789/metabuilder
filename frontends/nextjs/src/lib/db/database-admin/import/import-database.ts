import { setAppConfig } from '../../app-config'
import { setComments } from '../../comments'
import { setComponentConfigs, setComponentHierarchy } from '../../components'
import { setLuaScripts } from '../../lua-scripts'
import { setPages } from '../../pages'
import { setSchemas } from '../../schemas'
import type { DatabaseSchema } from '../../types'
import { setUsers } from '../../users'
import { setWorkflows } from '../../workflows'

/**
 * Import database contents from JSON string
 */
export async function importDatabase(jsonData: string): Promise<void> {
  try {
    const data = JSON.parse(jsonData) as Partial<DatabaseSchema>

    if (data.users) await setUsers(data.users)
    if (data.workflows) await setWorkflows(data.workflows)
    if (data.luaScripts) await setLuaScripts(data.luaScripts)
    if (data.pages) await setPages(data.pages)
    if (data.schemas) await setSchemas(data.schemas)
    if (data.appConfig) await setAppConfig(data.appConfig)
    if (data.comments) await setComments(data.comments)
    if (data.componentHierarchy) await setComponentHierarchy(data.componentHierarchy)
    if (data.componentConfigs) await setComponentConfigs(data.componentConfigs)
  } catch {
    throw new Error('Failed to import database: Invalid JSON')
  }
}
