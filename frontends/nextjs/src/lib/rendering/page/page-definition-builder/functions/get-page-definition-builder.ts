import { Database } from '@/lib/database'
import type { PageDefinition } from '@/lib/rendering/page/page-renderer'

import type { ComponentInstance } from './builder-types'

export function getPageDefinitionBuilder(): PageDefinitionBuilder {
  if (!builderInstance) {
    builderInstance = new PageDefinitionBuilder()
  }
  return builderInstance
}
