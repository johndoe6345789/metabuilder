import { Database } from '@/lib/database'
import type { LuaEngine } from '@/lib/lua-engine'
import { executeLuaScriptWithProfile } from '@/lib/lua/execute-lua-script-with-profile'
import type { ComponentInstance } from '@/lib/types/builder-types'
import type { User } from '@/lib/types/level-types'

export async function checkPermissions(
  page: PageDefinition,
  user: User | null
): Promise<{ allowed: boolean; reason?: string }> {
  if (!page.permissions) {
    return { allowed: true }
  }

  if (page.permissions.requiresAuth && !user) {
    return { allowed: false, reason: 'Authentication required' }
  }

  if (page.permissions.requiredRole) {
    const roleHierarchy = ['public', 'user', 'moderator', 'admin', 'god', 'supergod']
    const userRole = user?.role ?? 'public'
    const userRoleIndex = roleHierarchy.indexOf(userRole)
    const requiredRoleIndex = roleHierarchy.indexOf(page.permissions.requiredRole)

    if (requiredRoleIndex >= 0 && userRoleIndex >= 0 && userRoleIndex < requiredRoleIndex) {
      return { allowed: false, reason: 'Insufficient permissions' }
    }
  }

  if (page.permissions.customCheck) {
    try {
      const result = await this.executeLuaScript(page.permissions.customCheck, {
        data: { user },
      })
      if (!result) {
        return { allowed: false, reason: 'Custom permission check failed' }
      }
    } catch (error) {
      return { allowed: false, reason: 'Permission check error' }
    }
  }

  return { allowed: true }
}
