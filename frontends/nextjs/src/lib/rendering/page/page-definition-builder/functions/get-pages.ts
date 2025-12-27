import type { PageDefinition } from './page-renderer'
import type { ComponentInstance } from './builder-types'
import { Database } from '@/lib/database'

export function getPages(): PageDefinition[] {
    return this.pages
}
