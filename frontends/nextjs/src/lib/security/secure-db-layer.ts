import { prisma } from './prisma'
import type { User } from '../types/level-types'

export type OperationType = 'CREATE' | 'READ' | 'UPDATE' | 'DELETE'
export type ResourceType = 'user' | 'workflow' | 'luaScript' | 'pageConfig' | 
  'modelSchema' | 'comment' | 'componentNode' | 'componentConfig' | 'cssCategory' | 
  'dropdownConfig' | 'tenant' | 'powerTransfer' | 'smtpConfig' | 'credential'

export interface AuditLog {
  id: string
  timestamp: number
  userId: string
  username: string
  operation: OperationType
  resource: ResourceType
  resourceId: string
  success: boolean
  errorMessage?: string
  ipAddress?: string
  metadata?: Record<string, any>
}

export interface SecurityContext {
  user: User
  ipAddress?: string
  requestId?: string
}

export interface AccessRule {
  resource: ResourceType
  operation: OperationType
  allowedRoles: string[]
  customCheck?: (ctx: SecurityContext, resourceId?: string) => Promise<boolean>
}

const ACCESS_RULES: AccessRule[] = [
  { resource: 'user', operation: 'READ', allowedRoles: ['user', 'admin', 'god', 'supergod'] },
  { resource: 'user', operation: 'CREATE', allowedRoles: ['god', 'supergod'] },
  { resource: 'user', operation: 'UPDATE', allowedRoles: ['admin', 'god', 'supergod'] },
  { resource: 'user', operation: 'DELETE', allowedRoles: ['god', 'supergod'] },
  
  { resource: 'workflow', operation: 'READ', allowedRoles: ['admin', 'god', 'supergod'] },
  { resource: 'workflow', operation: 'CREATE', allowedRoles: ['god', 'supergod'] },
  { resource: 'workflow', operation: 'UPDATE', allowedRoles: ['god', 'supergod'] },
  { resource: 'workflow', operation: 'DELETE', allowedRoles: ['god', 'supergod'] },
  
  { resource: 'luaScript', operation: 'READ', allowedRoles: ['god', 'supergod'] },
  { resource: 'luaScript', operation: 'CREATE', allowedRoles: ['god', 'supergod'] },
  { resource: 'luaScript', operation: 'UPDATE', allowedRoles: ['god', 'supergod'] },
  { resource: 'luaScript', operation: 'DELETE', allowedRoles: ['god', 'supergod'] },
  
  { resource: 'pageConfig', operation: 'READ', allowedRoles: ['user', 'admin', 'god', 'supergod'] },
  { resource: 'pageConfig', operation: 'CREATE', allowedRoles: ['god', 'supergod'] },
  { resource: 'pageConfig', operation: 'UPDATE', allowedRoles: ['god', 'supergod'] },
  { resource: 'pageConfig', operation: 'DELETE', allowedRoles: ['god', 'supergod'] },
  
  { resource: 'modelSchema', operation: 'READ', allowedRoles: ['admin', 'god', 'supergod'] },
  { resource: 'modelSchema', operation: 'CREATE', allowedRoles: ['god', 'supergod'] },
  { resource: 'modelSchema', operation: 'UPDATE', allowedRoles: ['god', 'supergod'] },
  { resource: 'modelSchema', operation: 'DELETE', allowedRoles: ['god', 'supergod'] },
  
  { resource: 'comment', operation: 'READ', allowedRoles: ['user', 'admin', 'god', 'supergod'] },
  { resource: 'comment', operation: 'CREATE', allowedRoles: ['user', 'admin', 'god', 'supergod'] },
  { resource: 'comment', operation: 'UPDATE', allowedRoles: ['user', 'admin', 'god', 'supergod'] },
  { resource: 'comment', operation: 'DELETE', allowedRoles: ['admin', 'god', 'supergod'] },
  
  { resource: 'smtpConfig', operation: 'READ', allowedRoles: ['god', 'supergod'] },
  { resource: 'smtpConfig', operation: 'UPDATE', allowedRoles: ['supergod'] },
  
  { resource: 'credential', operation: 'UPDATE', allowedRoles: ['user', 'admin', 'god', 'supergod'] },
  
  { resource: 'tenant', operation: 'READ', allowedRoles: ['god', 'supergod'] },
  { resource: 'tenant', operation: 'CREATE', allowedRoles: ['supergod'] },
  { resource: 'tenant', operation: 'UPDATE', allowedRoles: ['supergod'] },
  { resource: 'tenant', operation: 'DELETE', allowedRoles: ['supergod'] },
]

export class SecureDatabase {
  private static rateLimitMap = new Map<string, number[]>()
  private static readonly RATE_LIMIT_WINDOW = 60000
  private static readonly MAX_REQUESTS_PER_WINDOW = 100

  private static async checkRateLimit(userId: string): Promise<boolean> {
    const now = Date.now()
    const userRequests = this.rateLimitMap.get(userId) || []
    
    const recentRequests = userRequests.filter(
      timestamp => now - timestamp < this.RATE_LIMIT_WINDOW
    )
    
    if (recentRequests.length >= this.MAX_REQUESTS_PER_WINDOW) {
      return false
    }
    
    recentRequests.push(now)
    this.rateLimitMap.set(userId, recentRequests)
    return true
  }

  private static async checkAccess(
    ctx: SecurityContext,
    resource: ResourceType,
    operation: OperationType,
    resourceId?: string
  ): Promise<boolean> {
    const rule = ACCESS_RULES.find(
      r => r.resource === resource && r.operation === operation
    )
    
    if (!rule) {
      return false
    }
    
    if (!rule.allowedRoles.includes(ctx.user.role)) {
      return false
    }
    
    if (rule.customCheck) {
      return await rule.customCheck(ctx, resourceId)
    }
    
    return true
  }

  private static sanitizeInput(input: any): any {
    if (typeof input === 'string') {
      return input.replace(/[<>'"]/g, '')
    }
    if (Array.isArray(input)) {
      return input.map(item => this.sanitizeInput(item))
    }
    if (typeof input === 'object' && input !== null) {
      const sanitized: any = {}
      for (const key in input) {
        sanitized[key] = this.sanitizeInput(input[key])
      }
      return sanitized
    }
    return input
  }

  private static async logOperation(
    ctx: SecurityContext,
    operation: OperationType,
    resource: ResourceType,
    resourceId: string,
    success: boolean,
    errorMessage?: string
  ): Promise<void> {
    const log: AuditLog = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      userId: ctx.user.id,
      username: ctx.user.username,
      operation,
      resource,
      resourceId,
      success,
      errorMessage,
      ipAddress: ctx.ipAddress,
    }
    
    try {
      // TODO: Replace with proper audit log storage
      // For now, just log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.log('[AUDIT]', log)
      }
      // In production, this would write to a persistent audit log table
      // await Database.addAuditLog(log)
    } catch (error) {
      console.error('Failed to log operation:', error)
    }
  }

  static async executeQuery<T>(
    ctx: SecurityContext,
    resource: ResourceType,
    operation: OperationType,
    queryFn: () => Promise<T>,
    resourceId: string = 'unknown'
  ): Promise<T> {
    const canProceed = await this.checkRateLimit(ctx.user.id)
    if (!canProceed) {
      await this.logOperation(ctx, operation, resource, resourceId, false, 'Rate limit exceeded')
      throw new Error('Rate limit exceeded. Please try again later.')
    }

    const hasAccess = await this.checkAccess(ctx, resource, operation, resourceId)
    if (!hasAccess) {
      await this.logOperation(ctx, operation, resource, resourceId, false, 'Access denied')
      throw new Error('Access denied. Insufficient permissions.')
    }

    try {
      const result = await queryFn()
      await this.logOperation(ctx, operation, resource, resourceId, true)
      return result
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      await this.logOperation(ctx, operation, resource, resourceId, false, errorMessage)
      throw error
    }
  }

  static async getUsers(ctx: SecurityContext): Promise<User[]> {
    return this.executeQuery(
      ctx,
      'user',
      'READ',
      async () => {
        const users = await prisma.user.findMany()
        return users.map(u => ({
          id: u.id,
          username: u.username,
          email: u.email,
          role: u.role as any,
          profilePicture: u.profilePicture || undefined,
          bio: u.bio || undefined,
          createdAt: Number(u.createdAt),
          tenantId: u.tenantId || undefined,
          isInstanceOwner: u.isInstanceOwner,
        }))
      },
      'all_users'
    )
  }

  static async getUserById(ctx: SecurityContext, userId: string): Promise<User | null> {
    return this.executeQuery(
      ctx,
      'user',
      'READ',
      async () => {
        const user = await prisma.user.findUnique({ where: { id: userId } })
        if (!user) return null
        return {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role as any,
          profilePicture: user.profilePicture || undefined,
          bio: user.bio || undefined,
          createdAt: Number(user.createdAt),
          tenantId: user.tenantId || undefined,
          isInstanceOwner: user.isInstanceOwner,
        }
      },
      userId
    )
  }

  static async createUser(ctx: SecurityContext, userData: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    const sanitized = this.sanitizeInput(userData)
    
    return this.executeQuery(
      ctx,
      'user',
      'CREATE',
      async () => {
        const user = await prisma.user.create({
          data: {
            id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            username: sanitized.username,
            email: sanitized.email,
            role: sanitized.role,
            profilePicture: sanitized.profilePicture,
            bio: sanitized.bio,
            createdAt: BigInt(Date.now()),
            tenantId: sanitized.tenantId,
            isInstanceOwner: sanitized.isInstanceOwner || false,
          },
        })
        return {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role as any,
          profilePicture: user.profilePicture || undefined,
          bio: user.bio || undefined,
          createdAt: Number(user.createdAt),
          tenantId: user.tenantId || undefined,
          isInstanceOwner: user.isInstanceOwner,
        }
      },
      'new_user'
    )
  }

  static async updateUser(ctx: SecurityContext, userId: string, updates: Partial<User>): Promise<User> {
    const sanitized = this.sanitizeInput(updates)
    
    return this.executeQuery(
      ctx,
      'user',
      'UPDATE',
      async () => {
        const user = await prisma.user.update({
          where: { id: userId },
          data: {
            username: sanitized.username,
            email: sanitized.email,
            role: sanitized.role,
            profilePicture: sanitized.profilePicture,
            bio: sanitized.bio,
            tenantId: sanitized.tenantId,
          },
        })
        return {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role as any,
          profilePicture: user.profilePicture || undefined,
          bio: user.bio || undefined,
          createdAt: Number(user.createdAt),
          tenantId: user.tenantId || undefined,
          isInstanceOwner: user.isInstanceOwner,
        }
      },
      userId
    )
  }

  static async deleteUser(ctx: SecurityContext, userId: string): Promise<void> {
    return this.executeQuery(
      ctx,
      'user',
      'DELETE',
      async () => {
        await prisma.user.delete({ where: { id: userId } })
      },
      userId
    )
  }

  static async verifyCredentials(ctx: SecurityContext, username: string, password: string): Promise<boolean> {
    const sanitizedUsername = this.sanitizeInput(username)
    
    return this.executeQuery(
      ctx,
      'credential',
      'READ',
      async () => {
        const credential = await prisma.credential.findUnique({
          where: { username: sanitizedUsername },
        })
        
        if (!credential) return false
        
        const encoder = new TextEncoder()
        const data = encoder.encode(password)
        const hashBuffer = await crypto.subtle.digest('SHA-512', data)
        const hashArray = Array.from(new Uint8Array(hashBuffer))
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
        
        return hashHex === credential.passwordHash
      },
      sanitizedUsername
    )
  }

  static async setCredential(ctx: SecurityContext, username: string, passwordHash: string): Promise<void> {
    const sanitized = this.sanitizeInput({ username, passwordHash })
    
    return this.executeQuery(
      ctx,
      'credential',
      'UPDATE',
      async () => {
        await prisma.credential.upsert({
          where: { username: sanitized.username },
          update: { passwordHash: sanitized.passwordHash },
          create: { username: sanitized.username, passwordHash: sanitized.passwordHash },
        })
      },
      sanitized.username
    )
  }

  static async getAuditLogs(ctx: SecurityContext, limit: number = 100): Promise<AuditLog[]> {
    if (ctx.user.role !== 'supergod' && ctx.user.role !== 'god') {
      throw new Error('Access denied. Only god-tier users can view audit logs.')
    }

    // TODO: Replace with proper database query
    // return await Database.getAuditLogs({ limit })
    return []
  }

  static async getWorkflows(ctx: SecurityContext) {
    return this.executeQuery(
      ctx,
      'workflow',
      'READ',
      async () => {
        const workflows = await prisma.workflow.findMany()
        return workflows.map(w => ({
          id: w.id,
          name: w.name,
          description: w.description || undefined,
          nodes: JSON.parse(w.nodes),
          edges: JSON.parse(w.edges),
          enabled: w.enabled,
        }))
      },
      'all_workflows'
    )
  }

  static async getLuaScripts(ctx: SecurityContext) {
    return this.executeQuery(
      ctx,
      'luaScript',
      'READ',
      async () => {
        const scripts = await prisma.luaScript.findMany()
        return scripts.map(s => ({
          id: s.id,
          name: s.name,
          description: s.description || undefined,
          code: s.code,
          parameters: JSON.parse(s.parameters),
          returnType: s.returnType || undefined,
        }))
      },
      'all_lua_scripts'
    )
  }

  static async getPageConfigs(ctx: SecurityContext) {
    return this.executeQuery(
      ctx,
      'pageConfig',
      'READ',
      async () => {
        const pages = await prisma.pageConfig.findMany()
        return pages.map(p => ({
          id: p.id,
          path: p.path,
          title: p.title,
          level: p.level,
          componentTree: JSON.parse(p.componentTree),
          requiresAuth: p.requiresAuth,
          requiredRole: p.requiredRole || undefined,
        }))
      },
      'all_page_configs'
    )
  }

  static async getModelSchemas(ctx: SecurityContext) {
    return this.executeQuery(
      ctx,
      'modelSchema',
      'READ',
      async () => {
        const schemas = await prisma.modelSchema.findMany()
        return schemas.map(s => ({
          id: s.id,
          name: s.name,
          label: s.label || undefined,
          labelPlural: s.labelPlural || undefined,
          icon: s.icon || undefined,
          fields: JSON.parse(s.fields),
          listDisplay: s.listDisplay ? JSON.parse(s.listDisplay) : undefined,
          listFilter: s.listFilter ? JSON.parse(s.listFilter) : undefined,
          searchFields: s.searchFields ? JSON.parse(s.searchFields) : undefined,
          ordering: s.ordering ? JSON.parse(s.ordering) : undefined,
        }))
      },
      'all_model_schemas'
    )
  }

  static async getComments(ctx: SecurityContext) {
    return this.executeQuery(
      ctx,
      'comment',
      'READ',
      async () => {
        const comments = await prisma.comment.findMany()
        return comments.map(c => ({
          id: c.id,
          userId: c.userId,
          content: c.content,
          createdAt: Number(c.createdAt),
          updatedAt: c.updatedAt ? Number(c.updatedAt) : undefined,
          parentId: c.parentId || undefined,
        }))
      },
      'all_comments'
    )
  }

  static async createComment(ctx: SecurityContext, commentData: any) {
    const sanitized = this.sanitizeInput(commentData)
    
    return this.executeQuery(
      ctx,
      'comment',
      'CREATE',
      async () => {
        const comment = await prisma.comment.create({
          data: {
            id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            userId: sanitized.userId,
            content: sanitized.content,
            createdAt: BigInt(Date.now()),
            parentId: sanitized.parentId,
          },
        })
        return {
          id: comment.id,
          userId: comment.userId,
          content: comment.content,
          createdAt: Number(comment.createdAt),
          updatedAt: comment.updatedAt ? Number(comment.updatedAt) : undefined,
          parentId: comment.parentId || undefined,
        }
      },
      'new_comment'
    )
  }
}
