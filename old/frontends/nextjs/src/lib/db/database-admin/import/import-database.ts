import { setAppConfig } from '../../app-config'
import { setComments } from '../../comments'
import { setComponentConfigs, setComponentHierarchy } from '../../components'
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

    if (data.users !== undefined) await setUsers(data.users)
    if (data.workflows !== undefined) await setWorkflows(data.workflows)
    if (data.pages !== undefined) await setPages(data.pages)
    if (data.schemas !== undefined) await setSchemas(data.schemas)
    if (data.appConfig !== undefined) await setAppConfig(data.appConfig)
    if (data.comments !== undefined) await setComments(data.comments)
    if (data.componentHierarchy !== undefined) await setComponentHierarchy(data.componentHierarchy)
    if (data.componentConfigs !== undefined) await setComponentConfigs(data.componentConfigs)
  } catch {
    throw new Error('Failed to import database: Invalid JSON')
  }
}
