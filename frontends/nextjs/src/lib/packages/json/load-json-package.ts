/**
 * JSON Package Loader
 *
 * Loads packages in pure JSON format (no Lua execution)
 */

import { readFile } from 'fs/promises'
import { join } from 'path'

export interface JSONPackageMetadata {
  packageId: string
  name: string
  version: string
  description: string
  author?: string
  license?: string
  category?: string
  icon?: string
  minLevel?: number
  primary?: boolean
  dependencies?: Record<string, string>
  exports?: {
    components?: string[]
    scripts?: string[]
    types?: string[]
  }
  storybook?: {
    featured?: boolean
    excludeFromDiscovery?: boolean
    stories?: any[]
  }
}

export interface JSONComponent {
  id: string
  name: string
  description?: string
  props?: Array<{
    name: string
    type: string
    required?: boolean
    default?: any
    description?: string
  }>
  render?: {
    type: string
    template?: any
  }
}

export interface JSONPermission {
  id: string
  name: string
  description: string
  resource: string
  action: string
  scope?: string
  minLevel?: number
}

export interface JSONPackage {
  metadata: JSONPackageMetadata
  components?: JSONComponent[]
  permissions?: JSONPermission[]
  hasComponents: boolean
  hasPermissions: boolean
  hasStyles: boolean
}

/**
 * Load a JSON package from the filesystem
 */
export async function loadJSONPackage(packagePath: string): Promise<JSONPackage> {
  // Load package.json metadata
  const metadataPath = join(packagePath, 'package.json')
  const metadataContent = await readFile(metadataPath, 'utf-8')
  const metadata: JSONPackageMetadata = JSON.parse(metadataContent)

  // Load components if they exist
  let components: JSONComponent[] | undefined
  let hasComponents = false
  try {
    const componentsPath = join(packagePath, 'components', 'ui.json')
    const componentsContent = await readFile(componentsPath, 'utf-8')
    const componentsData = JSON.parse(componentsContent)
    components = componentsData.components || []
    hasComponents = components.length > 0
  } catch (error) {
    // Components file doesn't exist, that's okay
  }

  // Load permissions if they exist
  let permissions: JSONPermission[] | undefined
  let hasPermissions = false
  try {
    const permissionsPath = join(packagePath, 'permissions', 'roles.json')
    const permissionsContent = await readFile(permissionsPath, 'utf-8')
    const permissionsData = JSON.parse(permissionsContent)
    permissions = permissionsData.permissions || []
    hasPermissions = permissions.length > 0
  } catch (error) {
    // Permissions file doesn't exist, that's okay
  }

  // Check for styles
  let hasStyles = false
  try {
    const stylesPath = join(packagePath, 'styles', 'index.json')
    await readFile(stylesPath, 'utf-8')
    hasStyles = true
  } catch (error) {
    // Styles don't exist, that's okay
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

/**
 * Load all JSON packages from a directory
 */
export async function loadAllJSONPackages(packagesDir: string): Promise<JSONPackage[]> {
  const { readdir } = await import('fs/promises')

  try {
    const packageDirs = await readdir(packagesDir, { withFileTypes: true })
    const packages: JSONPackage[] = []

    for (const dir of packageDirs) {
      if (dir.isDirectory()) {
        try {
          const packagePath = join(packagesDir, dir.name)
          const pkg = await loadJSONPackage(packagePath)
          packages.push(pkg)
        } catch (error) {
          console.warn(`Failed to load package ${dir.name}:`, error)
        }
      }
    }

    return packages
  } catch (error) {
    console.error('Failed to load packages:', error)
    return []
  }
}

/**
 * Get package by ID
 */
export async function getJSONPackageById(
  packagesDir: string,
  packageId: string
): Promise<JSONPackage | null> {
  try {
    const packagePath = join(packagesDir, packageId)
    return await loadJSONPackage(packagePath)
  } catch (error) {
    console.error(`Failed to load package ${packageId}:`, error)
    return null
  }
}
