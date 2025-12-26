import 'server-only'

import { Database } from '@/lib/database'
import type { PackageContent } from '@/lib/package-types'

export async function installPackageContent(packageId: string, content: PackageContent): Promise<void> {
  const [schemas, pages, workflows, luaScripts, hierarchy, configs] = await Promise.all([
    Database.getSchemas(),
    Database.getPages(),
    Database.getWorkflows(),
    Database.getLuaScripts(),
    Database.getComponentHierarchy(),
    Database.getComponentConfigs(),
  ])

  await Promise.all([
    Database.setSchemas([...schemas, ...content.schemas]),
    Database.setPages([...pages, ...content.pages]),
    Database.setWorkflows([...workflows, ...content.workflows]),
    Database.setLuaScripts([...luaScripts, ...content.luaScripts]),
    Database.setComponentHierarchy({ ...hierarchy, ...content.componentHierarchy }),
    Database.setComponentConfigs({ ...configs, ...content.componentConfigs }),
  ])

  if (content.cssClasses) {
    const cssClasses = await Database.getCssClasses()
    await Database.setCssClasses([...cssClasses, ...content.cssClasses])
  }

  if (content.dropdownConfigs) {
    const dropdowns = await Database.getDropdownConfigs()
    await Database.setDropdownConfigs([...dropdowns, ...content.dropdownConfigs])
  }

  if (content.seedData) {
    await Database.setPackageData(packageId, content.seedData)
  }
}
