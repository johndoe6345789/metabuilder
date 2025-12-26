import type { LuaScriptFile, PackageDefinition } from './types'

// Get all scripts combined (legacy + new format)
export function getAllPackageScripts(pkg: PackageDefinition): { legacy: string; files: LuaScriptFile[] } {
  return {
    legacy: pkg.scripts || '',
    files: pkg.scriptFiles || [],
  }
}
