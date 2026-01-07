/**
 * Load JSON package from filesystem
 */

import { promises as fs } from 'fs'
import path from 'path'

export interface JSONPackage {
  id: string
  components: unknown[]
  metadata: unknown
}

export async function loadJSONPackage(packageId: string): Promise<JSONPackage | null> {
  try {
    const packagePath = path.join(process.cwd(), 'packages', packageId, 'seed')
    
    // Load metadata
    const metadataPath = path.join(packagePath, 'metadata.json')
    const metadataContent = await fs.readFile(metadataPath, 'utf-8')
    const metadata = JSON.parse(metadataContent) as Record<string, unknown>
    
    // Load components if they exist
    let components: unknown[] = []
    const componentsPath = path.join(packagePath, 'components.json')
    try {
      const componentsContent = await fs.readFile(componentsPath, 'utf-8')
      components = JSON.parse(componentsContent) as unknown[]
    } catch {
      // Components file may not exist
    }
    
    return {
      id: packageId,
      components,
      metadata,
    }
  } catch {
    return null
  }
}
