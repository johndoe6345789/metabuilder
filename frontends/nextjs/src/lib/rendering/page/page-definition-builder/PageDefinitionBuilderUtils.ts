// Auto-generated class wrapper
import { buildLevel2UserDashboard } from './functions/build-level2-user-dashboard'
import { buildLevel3AdminPanel } from './functions/build-level3-admin-panel'
import { getPageDefinitionBuilder } from './functions/get-page-definition-builder'
import { getPages } from './functions/get-pages'
import { buildLevel1Homepage } from './functions/homepage/build-level1-homepage'
import { initializeDefaultPages } from './functions/initialize-default-pages'

/**
 * PageDefinitionBuilderUtils - Class wrapper for 6 functions
 *
 * This is a convenience wrapper. Prefer importing individual functions.
 */
export class PageDefinitionBuilderUtils {
  static async initializeDefaultPages(): Promise<void> {
    return await initializeDefaultPages(...(arguments as any))
  }

  static buildLevel1Homepage(): PageDefinition {
    return buildLevel1Homepage(...(arguments as any))
  }

  static buildLevel2UserDashboard(): PageDefinition {
    return buildLevel2UserDashboard(...(arguments as any))
  }

  static buildLevel3AdminPanel(): PageDefinition {
    return buildLevel3AdminPanel(...(arguments as any))
  }

  static getPages(): PageDefinition[] {
    return getPages(...(arguments as any))
  }

  static getPageDefinitionBuilder(): PageDefinitionBuilder {
    return getPageDefinitionBuilder(...(arguments as any))
  }
}
