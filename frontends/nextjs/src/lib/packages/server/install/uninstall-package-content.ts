import 'server-only'

import { Database } from '@/lib/database'
import type { PackageContent } from '@/lib/package-types'
import { omitRecordKeys } from './omit-record-keys'

export async function uninstallPackageContent(packageId: string, content: PackageContent): Promise<void> {
  const [schemas, pages, workflows, luaScripts, hierarchy, configs] = await Promise.all([
    Database.getSchemas(),
    Database.getPages(),
    Database.getWorkflows(),
    Database.getLuaScripts(),
    Database.getComponentHierarchy(),
    Database.getComponentConfigs(),
  ])

  const schemaNames = new Set(content.schemas.map((schema) => schema.name))
  const pageIds = new Set(content.pages.map((page) => page.id))
  const workflowIds = new Set(content.workflows.map((workflow) => workflow.id))
  const luaIds = new Set(content.luaScripts.map((script) => script.id))
  const componentIds = new Set(Object.keys(content.componentHierarchy))
  const configIds = new Set(Object.keys(content.componentConfigs))

  await Promise.all([
    Database.setSchemas(schemas.filter((schema) => !schemaNames.has(schema.name))),
    Database.setPages(pages.filter((page) => !pageIds.has(page.id))),
    Database.setWorkflows(workflows.filter((workflow) => !workflowIds.has(workflow.id))),
    Database.setLuaScripts(luaScripts.filter((script) => !luaIds.has(script.id))),
    Database.setComponentHierarchy(omitRecordKeys(hierarchy, componentIds)),
    Database.setComponentConfigs(omitRecordKeys(configs, configIds)),
  ])

  if (content.cssClasses) {
    const cssClasses = await Database.getCssClasses()
    const cssNames = new Set(content.cssClasses.map((category) => category.name))
    await Database.setCssClasses(cssClasses.filter((category) => !cssNames.has(category.name)))
  }

  if (content.dropdownConfigs) {
    const dropdowns = await Database.getDropdownConfigs()
    const dropdownIds = new Set(content.dropdownConfigs.map((config) => config.id))
    await Database.setDropdownConfigs(dropdowns.filter((config) => !dropdownIds.has(config.id)))
  }

  await Database.deletePackageData(packageId)
}
