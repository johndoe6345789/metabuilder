import { Database } from '@/lib/database'
import type { PageDefinition } from '@/lib/rendering/page/page-renderer'

import type { ComponentInstance } from './builder-types'

export function getPages(): PageDefinition[] {
  return this.pages
}
