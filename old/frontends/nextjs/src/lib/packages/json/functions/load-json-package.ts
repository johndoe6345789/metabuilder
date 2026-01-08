import { readFile } from 'fs/promises'
import { join } from 'path'
import type { JSONComponent, JSONPackage, JSONPackageMetadata, JSONPermission } from '../types'

export async function loadJSONPackage(packagePath: string): Promise<JSONPackage> {
  const metadataPath = join(packagePath, 'package.json')
  const metadataContent = await readFile(metadataPath, 'utf-8')
  const metadata = JSON.parse(metadataContent) as JSONPackageMetadata

  let components: JSONComponent[] | undefined
  let hasComponents = false
  try {
    const componentsPath = join(packagePath, 'components', 'ui.json')
    const componentsContent = await readFile(componentsPath, 'utf-8')
    const componentsData = JSON.parse(componentsContent) as { components?: JSONComponent[] }
    components = componentsData.components ?? []
    hasComponents = Array.isArray(components) && components.length > 0
  } catch {
    // Components file doesn't exist
  }

  let permissions: JSONPermission[] | undefined
  let hasPermissions = false
  try {
    const permissionsPath = join(packagePath, 'permissions', 'roles.json')
    const permissionsContent = await readFile(permissionsPath, 'utf-8')
    const permissionsData = JSON.parse(permissionsContent) as { permissions?: JSONPermission[] }
    permissions = permissionsData.permissions ?? []
    hasPermissions = Array.isArray(permissions) && permissions.length > 0
  } catch {
    // Permissions file doesn't exist
  }

  let hasStyles = false
  try {
    const stylesPath = join(packagePath, 'styles', 'index.json')
    await readFile(stylesPath, 'utf-8')
    hasStyles = true
  } catch {
    // Styles don't exist
  }

  return {
    metadata,
    components,
    permissions,
    hasComponents,
    hasPermissions,
    hasStyles,
  }
}
