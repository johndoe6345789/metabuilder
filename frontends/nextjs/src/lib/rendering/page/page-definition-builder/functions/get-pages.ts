import type { PageDefinition } from '@/lib/rendering/page/page-renderer'
import type { ComponentInstance } from './builder-types'
import { Database } from '@/lib/database'

export function getPages(): PageDefinition[] {
    return this.pages
}
