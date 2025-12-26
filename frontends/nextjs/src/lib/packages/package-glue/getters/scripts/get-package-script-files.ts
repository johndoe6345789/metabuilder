import type { LuaScriptFile, PackageDefinition } from './types'

// Get package script files (multiple Lua files)
export function getPackageScriptFiles(pkg: PackageDefinition): LuaScriptFile[] {
  return pkg.scriptFiles || []
}
