/**
 * Media Center Package
 * 
 * Dashboard for media processing, radio streaming, and TV channel management.
 */

import metadata from './metadata.json'
import components from './components.json'

export const packageSeed = {
  metadata,
  components,
  scripts: {
    lua: {
      media_api: () => import('./scripts/lua/media_api.lua?raw'),
      radio_helpers: () => import('./scripts/lua/radio_helpers.lua?raw'),
      tv_helpers: () => import('./scripts/lua/tv_helpers.lua?raw'),
    }
  }
}

export default packageSeed
