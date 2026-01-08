import type { ComponentInstance } from './builder-types'
import type { User } from './level-types'
import { Database } from './database'
import { LuaEngine } from './lua-engine'

export interface PageDefinition {
  id: string
  level: 1 | 2 | 3 | 4 | 5
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
  private luaEngine: LuaEngine

  constructor() {
    this.luaEngine = new LuaEngine()
  }

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
        level: page.level as 1 | 2 | 3 | 4 | 5,
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

    const result = await this.luaEngine.execute(script.code, context)
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

    if (page.permissions.requiredRole && user) {
      const roleHierarchy = ['user', 'admin', 'god', 'supergod']
      const userRoleIndex = roleHierarchy.indexOf(user.role)
      const requiredRoleIndex = roleHierarchy.indexOf(page.permissions.requiredRole)

      if (userRoleIndex < requiredRoleIndex) {
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
