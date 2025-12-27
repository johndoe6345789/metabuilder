import { Database } from '@/lib/database'
import { downloadZip, exportDatabaseSnapshot } from '@/lib/packages/core/package-export'

export const generateSnapshotExport = async () => {
  const [schemas, pages, workflows, luaScripts, componentHierarchy, componentConfigs, cssClasses, dropdownConfigs] =
    await Promise.all([
      Database.getSchemas(),
      Database.getPages(),
      Database.getWorkflows(),
      Database.getLuaScripts(),
      Database.getComponentHierarchy(),
      Database.getComponentConfigs(),
      Database.getCssClasses(),
      Database.getDropdownConfigs(),
    ])

  const blob = await exportDatabaseSnapshot(
    schemas,
    pages,
    workflows,
    luaScripts,
    componentHierarchy,
    componentConfigs,
    cssClasses,
    dropdownConfigs
  )

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
  downloadZip(blob, `database-snapshot-${timestamp}.zip`)
}
