import { Database } from '@/lib/database'
import type { LuaEngine } from '@/lib/lua-engine'
import { executeLuaScriptWithProfile } from '@/lib/lua/execute-lua-script-with-profile'
import type { ComponentInstance } from '@/lib/types/builder-types'
import type { User } from '@/lib/types/level-types'

export interface PageDefinition {
  id: string
  level: 1 | 2 | 3 | 4 | 5 | 6
  title: string
  description?: string
  layout: 'default' | 'sidebar' | 'dashboard' | 'blank'
  components: ComponentInstance[]
  luaScripts?: {
    onLoad?: string
    onUnload?: string
    handlers?: Record<string, string>
  }
  permissions?: {
    requiresAuth: boolean
    requiredRole?: string
    customCheck?: string
  }
  metadata?: {
    showHeader?: boolean
    showFooter?: boolean
    headerTitle?: string
    headerActions?: ComponentInstance[]
    sidebarItems?: Array<{
      id: string
      label: string
      icon: string
      action: 'navigate' | 'lua' | 'external'
      target: string
    }>
  }
}

export interface PageContext {
  user: User | null
  level: number
  isPreviewMode: boolean
  navigationHandlers: {
    onNavigate: (level: number) => void
    onLogout: () => void
  }
  luaEngine: LuaEngine
}

export class PageRenderer {
  private pages: Map<string, PageDefinition> = new Map()

  async registerPage(page: PageDefinition): Promise<void> {
    this.pages.set(page.id, page)
    const pageConfig = {
      id: page.id,
      path: `/_page_${page.id}`,
      title: page.title,
      level: page.level,
      componentTree: page.components,
      requiresAuth: page.permissions?.requiresAuth || false,
      requiredRole: page.permissions?.requiredRole as any
    }
    await Database.addPage(pageConfig)
  }

  async loadPages(): Promise<void> {
    const savedPages = await Database.getPages()
    savedPages.forEach(page => {
      const pageDef: PageDefinition = {
        id: page.id,
        level: page.level as 1 | 2 | 3 | 4 | 5 | 6,
        title: page.title,
        layout: 'default',
        components: page.componentTree,
        permissions: {
          requiresAuth: page.requiresAuth,
          requiredRole: page.requiredRole
        }
      }
      this.pages.set(page.id, pageDef)
    })
  }

  getPage(id: string): PageDefinition | undefined {
    return this.pages.get(id)
  }

  getPagesByLevel(level: number): PageDefinition[] {
    return Array.from(this.pages.values()).filter(p => p.level === level)
  }

  async executeLuaScript(scriptId: string, context: any): Promise<any> {
    const scripts = await Database.getLuaScripts()
    const script = scripts.find(s => s.id === scriptId)
    if (!script) {
      throw new Error(`Lua script not found: ${scriptId}`)
    }

    const result = await executeLuaScriptWithProfile(script.code, context, script)
    if (!result.success) {
      throw new Error(result.error || 'Lua execution failed')
    }

    return result.result
  }

  async checkPermissions(
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
          data: { user }
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

  async onPageLoad(page: PageDefinition, context: PageContext): Promise<void> {
    if (page.luaScripts?.onLoad) {
      await this.executeLuaScript(page.luaScripts.onLoad, {
        data: {
          user: context.user,
          level: context.level,
          isPreviewMode: context.isPreviewMode
        }
      })
    }
  }

  async onPageUnload(page: PageDefinition, context: PageContext): Promise<void> {
    if (page.luaScripts?.onUnload) {
      await this.executeLuaScript(page.luaScripts.onUnload, {
        data: {
          user: context.user,
          level: context.level
        }
      })
    }
  }
}

let pageRendererInstance: PageRenderer | null = null

export function getPageRenderer(): PageRenderer {
  if (!pageRendererInstance) {
    pageRendererInstance = new PageRenderer()
  }
  return pageRendererInstance
}
