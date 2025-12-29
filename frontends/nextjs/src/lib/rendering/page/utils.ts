import type { ComponentInstance } from '@/lib/types/builder-types'
import type { User, UserRole } from '@/lib/types/level-types'
import type { PageDefinition } from './page-renderer'

export function createMockPage(id: string, options: Partial<PageDefinition> = {}): PageDefinition {
  return {
    id,
    level: options.level ?? 1,
    title: options.title ?? `Page ${id}`,
    layout: options.layout ?? 'default',
    components: (options.components as ComponentInstance[] | undefined) ?? [],
    permissions: options.permissions,
    luaScripts: options.luaScripts,
    metadata: options.metadata,
  }
}

export function createMockUser(role: UserRole | string, id = 'user1'): User {
  return {
    id,
    username: `User ${id}`,
    role: role as UserRole,
    email: `${id}@test.com`,
    createdAt: Date.now(),
  }
}
