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
import { autoRegisterPackages } from '../auto-loader'

// Packages known to have good components.json files
const AUTO_LOAD_PACKAGES = [
  'arcade_lobby',
  'audit_log',
  'dashboard',
  'data_table',
  'form_builder',
  'nav_menu',
  'notification_center',
  'stats_grid',
  'ui_footer',
  'ui_header',
]

// Initialize on module load
let initialized = false
export async function initializeMocks(): Promise<void> {
  if (initialized) return
  initialized = true
  
  // Auto-load from real packages first
  const autoLoaded = await autoRegisterPackages(AUTO_LOAD_PACKAGES)
  console.log(`[Mocks] Auto-loaded ${autoLoaded.length} packages from workspace:`, autoLoaded)
  
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
} from '../lua-engine'

// Export JSON utilities
export { getRenderDescriptions, executeJsonMock } from '../json-loader'

// Export auto-loader utilities
export { autoLoadPackage, loadPackageComponents, loadPackageMetadata } from '../auto-loader'
