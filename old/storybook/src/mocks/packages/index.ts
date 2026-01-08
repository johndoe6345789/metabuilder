/**
 * Package mocks index
 * 
 * Three sources of mock data (in priority order):
 * 1. Auto-loaded from packages/{id}/seed/components.json (real data!)
 * 2. JSON files in ../data/*.json (manual overrides)
 * 3. Legacy TypeScript mocks (deprecated)
 */

// Register JSON-based mocks first (these can override auto-loaded)
import { registerJsonMocks } from '../json-loader'

// Auto-load packages that have components.json
import { autoRegisterPackage } from '../auto-loader'

// Initialize on module load
let initialized = false
export async function initializeMocks(): Promise<void> {
  if (initialized) return
  initialized = true
  
  // Fetch packages index and auto-load all packages
  try {
    const response = await fetch('/packages/index.json')
    const index = await response.json()
    const packageIds = index.packages?.map((p: { packageId: string }) => p.packageId) || []
    
    // Auto-load all packages in parallel
    const results = await Promise.all(
      packageIds.map(async (id: string) => {
        const success = await autoRegisterPackage(id)
        return success ? id : null
      })
    )
    
    const autoLoaded = results.filter(Boolean)
    console.log(`[Mocks] Auto-loaded ${autoLoaded.length}/${packageIds.length} packages from workspace`)
  } catch (err) {
    console.warn('[Mocks] Failed to load packages index:', err)
  }
  
  // Then register JSON overrides (these take precedence)
  registerJsonMocks()
  console.log('[Mocks] Registered JSON mock overrides')
}

// Re-export utilities
export {
  getMockPackage,
  listMockPackages,
  executeMockRender,
  createDefaultContext,
  registerJsonMocks,
  getRenderDescriptions,
  executeJsonMock,
} from '../json-loader'

// Export auto-loader utilities
export { autoLoadPackage, loadPackageComponents, loadPackageMetadata } from '../auto-loader'
