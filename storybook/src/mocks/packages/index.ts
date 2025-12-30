/**
 * Package mocks index
 * Import all mock packages to register them
 */

// Import packages to trigger registration
import './dashboard'
import './ui-level4'
import './user-manager'

// Re-export utilities
export { 
  getMockPackage, 
  listMockPackages, 
  executeMockRender,
  createDefaultContext,
} from '../lua-engine'
