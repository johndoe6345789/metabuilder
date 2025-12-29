import 'server-only'

import { Database } from '@/lib/database'
import type { PackageContent } from '@/lib/package-types'
import { mergeByKey } from '../utils/merge-by-key'
import { mergeRecords } from '../utils/merge-records'

export async function installPackageContent(
  packageId: string,
  content: PackageContent
): Promise<void> {
  const [schemas, pages, workflows, luaScripts, hierarchy, configs] = await Promise.all([
    Database.getSchemas(),
    Database.getPages(),
    Database.getWorkflows(),
    Database.getLuaScripts(),
    Database.getComponentHierarchy(),
    Database.getComponentConfigs(),
  ])

  const mergedSchemas = mergeByKey(schemas, content.schemas, schema => schema.name)
  const mergedPages = mergeByKey(pages, content.pages, page => page.id)
  const mergedWorkflows = mergeByKey(workflows, content.workflows, workflow => workflow.id)
  const mergedLuaScripts = mergeByKey(luaScripts, content.luaScripts, script => script.id)
  const mergedHierarchy = mergeRecords(hierarchy, content.componentHierarchy)
  const mergedConfigs = mergeRecords(configs, content.componentConfigs)

  await Promise.all([
    Database.setSchemas(mergedSchemas),
    Database.setPages(mergedPages),
    Database.setWorkflows(mergedWorkflows),
    Database.setLuaScripts(mergedLuaScripts),
    Database.setComponentHierarchy(mergedHierarchy),
    Database.setComponentConfigs(mergedConfigs),
  ])

  if (content.cssClasses) {
    const cssClasses = await Database.getCssClasses()
    const mergedCssClasses = mergeByKey(cssClasses, content.cssClasses, category => category.name)
    await Database.setCssClasses(mergedCssClasses)
  }

  if (content.dropdownConfigs) {
    const dropdowns = await Database.getDropdownConfigs()
    const mergedDropdowns = mergeByKey(dropdowns, content.dropdownConfigs, config => config.id)
    await Database.setDropdownConfigs(mergedDropdowns)
  }

  if (content.seedData) {
    await Database.setPackageData(packageId, content.seedData)
  }
}
