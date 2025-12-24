// Package Loader - Glues all modular packages together

import adminDialogComponents from '../../packages/admin_dialog/seed/components.json'
import adminDialogMetadata from '../../packages/admin_dialog/seed/metadata.json'
import adminDialogExamples from '../../packages/admin_dialog/static_content/examples.json'

import dataTableComponents from '../../packages/data_table/seed/components.json'
import dataTableMetadata from '../../packages/data_table/seed/metadata.json'
import dataTableExamples from '../../packages/data_table/static_content/examples.json'

import formBuilderComponents from '../../packages/form_builder/seed/components.json'
import formBuilderMetadata from '../../packages/form_builder/seed/metadata.json'
import formBuilderExamples from '../../packages/form_builder/static_content/examples.json'

import navMenuComponents from '../../packages/nav_menu/seed/components.json'
import navMenuMetadata from '../../packages/nav_menu/seed/metadata.json'

import dashboardComponents from '../../packages/dashboard/seed/components.json'
import dashboardMetadata from '../../packages/dashboard/seed/metadata.json'

import notificationCenterComponents from '../../packages/notification_center/seed/components.json'
import notificationCenterMetadata from '../../packages/notification_center/seed/metadata.json'

export interface LuaScriptFile {
  name: string
  path: string
  code: string
  category?: string
  description?: string
}

export interface PackageDefinition {
  packageId: string
  name: string
  version: string
  description: string
  author: string
  category: string
  dependencies: string[]
  exports: {
    components: string[]
    scripts?: string[]
    states?: string[]
    handlers?: string[]
  }
  shadowcnComponents?: string[]
  components: any[]
  scripts?: string
  scriptFiles?: LuaScriptFile[]
  examples?: any
}

export interface PackageRegistry {
  [packageId: string]: PackageDefinition
}

// Load single Lua script file (legacy support)
async function loadLuaScript(packageId: string): Promise<string> {
  try {
    const response = await fetch(`/packages/${packageId}/seed/scripts.lua`)
    if (!response.ok) return ''
    return await response.text()
  } catch (error) {
    console.warn(`Could not load Lua scripts for package ${packageId}:`, error)
    return ''
  }
}

// Load all Lua scripts from scripts folder
async function loadLuaScriptsFolder(packageId: string): Promise<LuaScriptFile[]> {
  const scriptFiles: LuaScriptFile[] = []
  
  try {
    // Try to load scripts manifest (lists all script files in the folder)
    const manifestResponse = await fetch(`/packages/${packageId}/seed/scripts/manifest.json`)
    
    if (manifestResponse.ok) {
      const manifest = await manifestResponse.json()
      
      // Load each script file listed in the manifest
      for (const scriptInfo of manifest.scripts || []) {
        try {
          const scriptResponse = await fetch(`/packages/${packageId}/seed/scripts/${scriptInfo.file}`)
          if (scriptResponse.ok) {
            const code = await scriptResponse.text()
            scriptFiles.push({
              name: scriptInfo.name || scriptInfo.file,
              path: `scripts/${scriptInfo.file}`,
              code,
              category: scriptInfo.category,
              description: scriptInfo.description
            })
          }
        } catch (error) {
          console.warn(`Could not load script ${scriptInfo.file} for package ${packageId}:`, error)
        }
      }
    } else {
      // Fallback: try to load common script names
      const commonScriptNames = [
        'init.lua',
        'handlers.lua',
        'validators.lua',
        'utils.lua',
        'state.lua',
        'actions.lua'
      ]
      
      for (const filename of commonScriptNames) {
        try {
          const scriptResponse = await fetch(`/packages/${packageId}/seed/scripts/${filename}`)
          if (scriptResponse.ok) {
            const code = await scriptResponse.text()
            scriptFiles.push({
              name: filename.replace('.lua', ''),
              path: `scripts/${filename}`,
              code,
              category: 'auto-discovered'
            })
          }
        } catch (error) {
          // Silently skip missing files in fallback mode
        }
      }
    }
  } catch (error) {
    console.warn(`Could not load scripts folder for package ${packageId}:`, error)
  }
  
  return scriptFiles
}

// Build package registry
export async function buildPackageRegistry(): Promise<PackageRegistry> {
  const registry: PackageRegistry = {}

  // Admin Dialog Package
  const adminDialogScripts = await loadLuaScript('admin_dialog')
  const adminDialogScriptFiles = await loadLuaScriptsFolder('admin_dialog')
  registry['admin_dialog'] = {
    ...adminDialogMetadata,
    components: adminDialogComponents,
    scripts: adminDialogScripts,
    scriptFiles: adminDialogScriptFiles,
    examples: adminDialogExamples
  }

  // Data Table Package
  const dataTableScripts = await loadLuaScript('data_table')
  const dataTableScriptFiles = await loadLuaScriptsFolder('data_table')
  registry['data_table'] = {
    ...dataTableMetadata,
    components: dataTableComponents,
    scripts: dataTableScripts,
    scriptFiles: dataTableScriptFiles,
    examples: dataTableExamples
  }

  // Form Builder Package
  const formBuilderScripts = await loadLuaScript('form_builder')
  const formBuilderScriptFiles = await loadLuaScriptsFolder('form_builder')
  registry['form_builder'] = {
    ...formBuilderMetadata,
    components: formBuilderComponents,
    scripts: formBuilderScripts,
    scriptFiles: formBuilderScriptFiles,
    examples: formBuilderExamples
  }

  // Navigation Menu Package
  const navMenuScripts = await loadLuaScript('nav_menu')
  const navMenuScriptFiles = await loadLuaScriptsFolder('nav_menu')
  registry['nav_menu'] = {
    ...navMenuMetadata,
    components: navMenuComponents,
    scripts: navMenuScripts,
    scriptFiles: navMenuScriptFiles,
    examples: {}
  }

  // Dashboard Package
  const dashboardScripts = await loadLuaScript('dashboard')
  const dashboardScriptFiles = await loadLuaScriptsFolder('dashboard')
  registry['dashboard'] = {
    ...dashboardMetadata,
    components: dashboardComponents,
    scripts: dashboardScripts,
    scriptFiles: dashboardScriptFiles,
    examples: {}
  }

  // Notification Center Package
  const notificationCenterScripts = await loadLuaScript('notification_center')
  const notificationCenterScriptFiles = await loadLuaScriptsFolder('notification_center')
  registry['notification_center'] = {
    ...notificationCenterMetadata,
    components: notificationCenterComponents,
    scripts: notificationCenterScripts,
    scriptFiles: notificationCenterScriptFiles,
    examples: {}
  }

  return registry
}

// Get package by ID
export function getPackage(registry: PackageRegistry, packageId: string): PackageDefinition | undefined {
  return registry[packageId]
}

// Get all packages in a category
export function getPackagesByCategory(registry: PackageRegistry, category: string): PackageDefinition[] {
  return Object.values(registry).filter(pkg => pkg.category === category)
}

// Get package components
export function getPackageComponents(pkg: PackageDefinition): any[] {
  return pkg.components || []
}

// Get package scripts (Lua code)
export function getPackageScripts(pkg: PackageDefinition): string {
  return pkg.scripts || ''
}

// Get package script files (multiple Lua files)
export function getPackageScriptFiles(pkg: PackageDefinition): LuaScriptFile[] {
  return pkg.scriptFiles || []
}

// Get all scripts combined (legacy + new format)
export function getAllPackageScripts(pkg: PackageDefinition): { legacy: string; files: LuaScriptFile[] } {
  return {
    legacy: pkg.scripts || '',
    files: pkg.scriptFiles || []
  }
}

// Get package examples
export function getPackageExamples(pkg: PackageDefinition): any {
  return pkg.examples || {}
}

// Check if package dependencies are met
export function checkDependencies(registry: PackageRegistry, packageId: string): {
  satisfied: boolean
  missing: string[]
} {
  const pkg = registry[packageId]
  if (!pkg) {
    return { satisfied: false, missing: [packageId] }
  }

  const missing: string[] = []
  for (const depId of pkg.dependencies) {
    if (!registry[depId]) {
      missing.push(depId)
    }
  }

  return {
    satisfied: missing.length === 0,
    missing
  }
}

// Install package components into database
export async function installPackageComponents(pkg: PackageDefinition, db: any): Promise<void> {
  const components = getPackageComponents(pkg)
  
  for (const component of components) {
    await db.set('components', component.id, component)
  }
}

// Install package scripts into database
export async function installPackageScripts(pkg: PackageDefinition, db: any): Promise<void> {
  // Install legacy single script file if it exists
  const legacyScripts = getPackageScripts(pkg)
  if (legacyScripts) {
    await db.set('lua_scripts', `package_${pkg.packageId}`, {
      id: `package_${pkg.packageId}`,
      name: `${pkg.name} Scripts`,
      code: legacyScripts,
      category: 'package',
      packageId: pkg.packageId
    })
  }

  // Install new multi-file scripts
  const scriptFiles = getPackageScriptFiles(pkg)
  for (const scriptFile of scriptFiles) {
    const scriptId = `package_${pkg.packageId}_${scriptFile.name}`
    await db.set('lua_scripts', scriptId, {
      id: scriptId,
      name: `${pkg.name} - ${scriptFile.name}`,
      code: scriptFile.code,
      category: scriptFile.category || 'package',
      packageId: pkg.packageId,
      path: scriptFile.path,
      description: scriptFile.description
    })
  }
}

// Install entire package
export async function installPackage(
  registry: PackageRegistry,
  packageId: string,
  db: any
): Promise<{ success: boolean; error?: string }> {
  const pkg = getPackage(registry, packageId)
  
  if (!pkg) {
    return { success: false, error: `Package ${packageId} not found` }
  }

  // Check dependencies
  const depCheck = checkDependencies(registry, packageId)
  if (!depCheck.satisfied) {
    return {
      success: false,
      error: `Missing dependencies: ${depCheck.missing.join(', ')}`
    }
  }

  try {
    // Install components
    await installPackageComponents(pkg, db)

    // Install scripts
    await installPackageScripts(pkg, db)

    // Mark package as installed
    await db.set('installed_packages', packageId, {
      packageId,
      name: pkg.name,
      version: pkg.version,
      installedAt: Date.now()
    })

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: `Installation failed: ${error}`
    }
  }
}

// Uninstall package
export async function uninstallPackage(
  registry: PackageRegistry,
  packageId: string,
  db: any
): Promise<{ success: boolean; error?: string }> {
  const pkg = getPackage(registry, packageId)
  
  if (!pkg) {
    return { success: false, error: `Package ${packageId} not found` }
  }

  try {
    // Remove components
    const components = getPackageComponents(pkg)
    for (const component of components) {
      await db.delete('components', component.id)
    }

    // Remove scripts
    await db.delete('lua_scripts', `package_${pkg.packageId}`)

    // Remove from installed packages
    await db.delete('installed_packages', packageId)

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: `Uninstallation failed: ${error}`
    }
  }
}

// Get all installed packages
export async function getInstalledPackages(db: any): Promise<string[]> {
  try {
    const installed = await db.getAll('installed_packages')
    return Object.keys(installed || {})
  } catch (error) {
    return []
  }
}

// Check if package is installed
export async function isPackageInstalled(packageId: string, db: any): Promise<boolean> {
  try {
    const pkg = await db.get('installed_packages', packageId)
    return !!pkg
  } catch (error) {
    return false
  }
}

// Export all packages for seeding
export function exportAllPackagesForSeed(registry: PackageRegistry) {
  const seedData: any = {
    components: [],
    scripts: [],
    packages: []
  }

  for (const [packageId, pkg] of Object.entries(registry)) {
    // Add components
    seedData.components.push(...getPackageComponents(pkg))

    // Add legacy single script
    const legacyScripts = getPackageScripts(pkg)
    if (legacyScripts) {
      seedData.scripts.push({
        id: `package_${packageId}`,
        name: `${pkg.name} Scripts`,
        code: legacyScripts,
        category: 'package',
        packageId
      })
    }

    // Add multi-file scripts
    const scriptFiles = getPackageScriptFiles(pkg)
    for (const scriptFile of scriptFiles) {
      seedData.scripts.push({
        id: `package_${packageId}_${scriptFile.name}`,
        name: `${pkg.name} - ${scriptFile.name}`,
        code: scriptFile.code,
        category: scriptFile.category || 'package',
        packageId,
        path: scriptFile.path,
        description: scriptFile.description
      })
    }

    // Add package metadata
    seedData.packages.push({
      packageId,
      name: pkg.name,
      version: pkg.version,
      description: pkg.description,
      author: pkg.author,
      category: pkg.category
    })
  }

  return seedData
}
