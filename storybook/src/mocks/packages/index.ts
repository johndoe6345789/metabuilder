/**
 * Package mocks index
 * 
 * JSON-driven mocks are now preferred!
 * Add new mocks as JSON files in ../data/*.json
 * 
 * Legacy TypeScript mocks are still imported for backwards compatibility.
 */

// Register JSON-based mocks (preferred)
import { registerJsonMocks } from '../json-loader'
registerJsonMocks()

// Legacy TypeScript mocks (kept for reference, but JSON takes precedence)
// import './dashboard'
// import './ui-level4'
// import './user-manager'

// Re-export utilities
export { 
  getMockPackage, 
  listMockPackages, 
  executeMockRender,
  createDefaultContext,
} from '../lua-engine'

// Export JSON utilities
export { getRenderDescriptions, executeJsonMock } from '../json-loader'
