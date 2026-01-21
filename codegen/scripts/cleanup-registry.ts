#!/usr/bin/env tsx
/**
 * Cleanup script to remove obsolete wrapper references from registry
 */

import fs from 'fs'
import path from 'path'

const REGISTRY_FILE = path.resolve(process.cwd(), 'json-components-registry.json')

async function cleanupRegistry() {
  console.log('🧹 Cleaning up registry...\n')

  // Read registry
  const content = fs.readFileSync(REGISTRY_FILE, 'utf-8')
  const registry = JSON.parse(content)

  let cleanedCount = 0
  const cleanedComponents: string[] = []

  // Remove obsolete fields from all components
  if (registry.components) {
    for (const component of registry.components) {
      let modified = false

      if (component.wrapperRequired !== undefined) {
        delete component.wrapperRequired
        modified = true
      }

      if (component.wrapperComponent !== undefined) {
        delete component.wrapperComponent
        modified = true
      }

      if (modified) {
        cleanedCount++
        cleanedComponents.push(component.type || component.name || 'Unknown')
      }
    }
  }

  // Write back to file with proper formatting
  fs.writeFileSync(REGISTRY_FILE, JSON.stringify(registry, null, 2) + '\n')

  console.log(`✅ Cleaned ${cleanedCount} components\n`)

  if (cleanedComponents.length > 0) {
    console.log('📋 Cleaned components:')
    cleanedComponents.slice(0, 10).forEach(name => {
      console.log(`   • ${name}`)
    })
    if (cleanedComponents.length > 10) {
      console.log(`   ... and ${cleanedComponents.length - 10} more`)
    }
  }

  console.log('\n✨ Registry cleanup complete!')
}

cleanupRegistry().catch(error => {
  console.error('❌ Cleanup failed:', error)
  process.exit(1)
})
