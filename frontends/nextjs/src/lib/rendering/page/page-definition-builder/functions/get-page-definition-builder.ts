import type { PageDefinition } from './page-renderer'
import type { ComponentInstance } from './builder-types'
import { Database } from '@/lib/database'

export function getPageDefinitionBuilder(): PageDefinitionBuilder {
  if (!builderInstance) {
    builderInstance = new PageDefinitionBuilder()
  }
  return builderInstance
}
