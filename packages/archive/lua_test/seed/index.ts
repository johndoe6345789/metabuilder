/**
 * lua_test package exports
 * Unit testing framework for Lua scripts in MetaBuilder packages
 */

import componentsJson from './components.json'
import metadataJson from './metadata.json'

// Export seed data for package loader
export const packageSeed = {
  metadata: metadataJson,
  components: componentsJson.components,
  scripts: [
    { name: 'init', file: 'init.lua', category: 'lifecycle' },
    { name: 'framework', file: 'framework.lua', category: 'core' },
    { name: 'assertions', file: 'assertions.lua', category: 'core' },
    { name: 'mocks', file: 'mocks.lua', category: 'utilities' },
    { name: 'runner', file: 'runner.lua', category: 'core' },
    { name: 'helpers', file: 'helpers.lua', category: 'utilities' },
  ],
}

export default packageSeed
