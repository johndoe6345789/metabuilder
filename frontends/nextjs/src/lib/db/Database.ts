import { prisma } from '../prisma'
import type {
  User,
  Workflow,
  LuaScript,
  PageConfig,
  AppConfiguration,
  Comment,
  Tenant,
  PowerTransferRequest,
} from '../../types/level-types'
import type { ModelSchema } from '../types/schema-types'
import type { InstalledPackage } from '../package-types'
import type { SMTPConfig } from '../password-utils'

// Import individual functions (lambdas)
import { hashPassword } from './functions/hash-password'
import { verifyPassword } from './functions/verify-password'
import { initializeDatabase } from './functions/initialize-database'

// Users
import { getUsers } from './functions/users/get-users'
import { setUsers } from './functions/users/set-users'
import { addUser } from './functions/users/add-user'
import { updateUser } from './functions/users/update-user'
import { deleteUser } from './functions/users/delete-user'

// Credentials
import { getCredentials } from './functions/credentials/get-credentials'
import { setCredential } from './functions/credentials/set-credential'
import { verifyCredentials } from './functions/credentials/verify-credentials'
import { getPasswordChangeTimestamps } from './functions/credentials/get-password-change-timestamps'
import { setPasswordChangeTimestamps } from './functions/credentials/set-password-change-timestamps'

// Workflows
import { getWorkflows } from './functions/workflows/get-workflows'
import { setWorkflows } from './functions/workflows/set-workflows'
import { addWorkflow } from './functions/workflows/add-workflow'
import { updateWorkflow } from './functions/workflows/update-workflow'
import { deleteWorkflow } from './functions/workflows/delete-workflow'

// Lua Scripts
import { getLuaScripts } from './functions/lua-scripts/get-lua-scripts'
import { setLuaScripts } from './functions/lua-scripts/set-lua-scripts'
import { addLuaScript } from './functions/lua-scripts/add-lua-script'
import { updateLuaScript } from './functions/lua-scripts/update-lua-script'
import { deleteLuaScript } from './functions/lua-scripts/delete-lua-script'

// Pages
import { getPages } from './functions/pages/get-pages'
import { setPages } from './functions/pages/set-pages'
import { addPage } from './functions/pages/add-page'
import { updatePage } from './functions/pages/update-page'
import { deletePage } from './functions/pages/delete-page'

// Schemas
import { getSchemas } from './functions/schemas/get-schemas'
import { setSchemas } from './functions/schemas/set-schemas'
import { addSchema } from './functions/schemas/add-schema'
import { updateSchema } from './functions/schemas/update-schema'
import { deleteSchema } from './functions/schemas/delete-schema'

// Tenants
import { getTenants } from './functions/tenants/get-tenants'
import { setTenants } from './functions/tenants/set-tenants'
import { addTenant } from './functions/tenants/add-tenant'
import { updateTenant } from './functions/tenants/update-tenant'
import { deleteTenant } from './functions/tenants/delete-tenant'

// Re-export types from database.ts for compatibility
export interface CssCategory {
  name: string
  classes: string[]
}

export interface DropdownConfig {
  id: string
  name: string
  label: string
  options: Array<{ value: string; label: string }>
}

export interface ComponentNode {
  id: string
  type: string
  parentId?: string
  childIds: string[]
  order: number
  pageId: string
}

export interface ComponentConfig {
  id: string
  componentId: string
  props: Record<string, any>
  styles: Record<string, any>
  events: Record<string, string>
  conditionalRendering?: {
    condition: string
    luaScriptId?: string
  }
}

export const DB_KEYS = {
  USERS: 'db_users',
  CREDENTIALS: 'db_credentials',
  WORKFLOWS: 'db_workflows',
  LUA_SCRIPTS: 'db_lua_scripts',
  PAGES: 'db_pages',
  SCHEMAS: 'db_schemas',
  APP_CONFIG: 'db_app_config',
  COMMENTS: 'db_comments',
  COMPONENT_HIERARCHY: 'db_component_hierarchy',
  COMPONENT_CONFIGS: 'db_component_configs',
  GOD_CREDENTIALS_EXPIRY: 'db_god_credentials_expiry',
  PASSWORD_CHANGE_TIMESTAMPS: 'db_password_change_timestamps',
  FIRST_LOGIN_FLAGS: 'db_first_login_flags',
  GOD_CREDENTIALS_EXPIRY_DURATION: 'db_god_credentials_expiry_duration',
  CSS_CLASSES: 'db_css_classes',
  DROPDOWN_CONFIGS: 'db_dropdown_configs',
  INSTALLED_PACKAGES: 'db_installed_packages',
  PACKAGE_DATA: 'db_package_data',
  TENANTS: 'db_tenants',
  POWER_TRANSFER_REQUESTS: 'db_power_transfer_requests',
  SMTP_CONFIG: 'db_smtp_config',
  PASSWORD_RESET_TOKENS: 'db_password_reset_tokens',
} as const

/**
 * Database - Class wrapper for database operations
 * 
 * This class serves as a container for lambda functions related to database operations.
 * Each method delegates to an individual function file in the functions/ directory.
 * 
 * Pattern: "class is container for lambdas"
 * - Each lambda is defined in its own file under functions/
 * - This class wraps them for convenient namespaced access
 * - Can be used as Database.methodName() or import individual functions
 */
export class Database {
  // Core operations
  static initializeDatabase = initializeDatabase

  // User operations
  static getUsers = getUsers
  static setUsers = setUsers
  static addUser = addUser
  static updateUser = updateUser
  static deleteUser = deleteUser

  // Credential operations
  static getCredentials = getCredentials
  static setCredential = setCredential
  static verifyCredentials = verifyCredentials
  static getPasswordChangeTimestamps = getPasswordChangeTimestamps
  static setPasswordChangeTimestamps = setPasswordChangeTimestamps

  // Workflow operations
  static getWorkflows = getWorkflows
  static setWorkflows = setWorkflows
  static addWorkflow = addWorkflow
  static updateWorkflow = updateWorkflow
  static deleteWorkflow = deleteWorkflow

  // Lua Script operations
  static getLuaScripts = getLuaScripts
  static setLuaScripts = setLuaScripts
  static addLuaScript = addLuaScript
  static updateLuaScript = updateLuaScript
  static deleteLuaScript = deleteLuaScript

  // Page operations
  static getPages = getPages
  static setPages = setPages
  static addPage = addPage
  static updatePage = updatePage
  static deletePage = deletePage

  // Schema operations
  static getSchemas = getSchemas
  static setSchemas = setSchemas
  static addSchema = addSchema
  static updateSchema = updateSchema
  static deleteSchema = deleteSchema

  // Tenant operations
  static getTenants = getTenants
  static setTenants = setTenants
  static addTenant = addTenant
  static updateTenant = updateTenant
  static deleteTenant = deleteTenant

  // ==============================================
  // Functions that require additional refactoring
  // These are kept inline for now but can be split later
  // ==============================================

  static async getAppConfig(): Promise<AppConfiguration | null> {
    const config = await prisma.appConfiguration.findFirst()
    if (!config) return null

    return {
      id: config.id,
      name: config.name,
      schemas: JSON.parse(config.schemas),
      workflows: JSON.parse(config.workflows),
      luaScripts: JSON.parse(config.luaScripts),
      pages: JSON.parse(config.pages),
      theme: JSON.parse(config.theme),
    }
  }

  static async setAppConfig(config: AppConfiguration): Promise<void> {
    await prisma.appConfiguration.deleteMany()
    await prisma.appConfiguration.create({
      data: {
        id: config.id,
        name: config.name,
        schemas: JSON.stringify(config.schemas),
        workflows: JSON.stringify(config.workflows),
        luaScripts: JSON.stringify(config.luaScripts),
        pages: JSON.stringify(config.pages),
        theme: JSON.stringify(config.theme),
      },
    })
  }

  static async getComments(): Promise<Comment[]> {
    const comments = await prisma.comment.findMany()
    return comments.map(c => ({
      id: c.id,
      userId: c.userId,
      content: c.content,
      createdAt: Number(c.createdAt),
      updatedAt: c.updatedAt ? Number(c.updatedAt) : undefined,
      parentId: c.parentId || undefined,
    }))
  }

  static async setComments(comments: Comment[]): Promise<void> {
    await prisma.comment.deleteMany()
    for (const comment of comments) {
      await prisma.comment.create({
        data: {
          id: comment.id,
          userId: comment.userId,
          content: comment.content,
          createdAt: BigInt(comment.createdAt),
          updatedAt: comment.updatedAt ? BigInt(comment.updatedAt) : null,
          parentId: comment.parentId,
        },
      })
    }
  }

  static async addComment(comment: Comment): Promise<void> {
    await prisma.comment.create({
      data: {
        id: comment.id,
        userId: comment.userId,
        content: comment.content,
        createdAt: BigInt(comment.createdAt),
        updatedAt: comment.updatedAt ? BigInt(comment.updatedAt) : null,
        parentId: comment.parentId,
      },
    })
  }

  static async updateComment(commentId: string, updates: Partial<Comment>): Promise<void> {
    const data: any = {}
    if (updates.content !== undefined) data.content = updates.content
    if (updates.updatedAt !== undefined) data.updatedAt = BigInt(updates.updatedAt)

    await prisma.comment.update({
      where: { id: commentId },
      data,
    })
  }

  static async deleteComment(commentId: string): Promise<void> {
    await prisma.comment.delete({ where: { id: commentId } })
  }

  static async getComponentHierarchy(): Promise<Record<string, ComponentNode>> {
    const nodes = await prisma.componentNode.findMany()
    const result: Record<string, ComponentNode> = {}
    for (const node of nodes) {
      result[node.id] = {
        id: node.id,
        type: node.type,
        parentId: node.parentId || undefined,
        childIds: JSON.parse(node.childIds),
        order: node.order,
        pageId: node.pageId,
      }
    }
    return result
  }

  static async setComponentHierarchy(hierarchy: Record<string, ComponentNode>): Promise<void> {
    await prisma.componentNode.deleteMany()
    for (const node of Object.values(hierarchy)) {
      await prisma.componentNode.create({
        data: {
          id: node.id,
          type: node.type,
          parentId: node.parentId,
          childIds: JSON.stringify(node.childIds),
          order: node.order,
          pageId: node.pageId,
        },
      })
    }
  }

  static async addComponentNode(node: ComponentNode): Promise<void> {
    await prisma.componentNode.create({
      data: {
        id: node.id,
        type: node.type,
        parentId: node.parentId,
        childIds: JSON.stringify(node.childIds),
        order: node.order,
        pageId: node.pageId,
      },
    })
  }

  static async updateComponentNode(nodeId: string, updates: Partial<ComponentNode>): Promise<void> {
    const data: any = {}
    if (updates.type !== undefined) data.type = updates.type
    if (updates.parentId !== undefined) data.parentId = updates.parentId
    if (updates.childIds !== undefined) data.childIds = JSON.stringify(updates.childIds)
    if (updates.order !== undefined) data.order = updates.order
    if (updates.pageId !== undefined) data.pageId = updates.pageId

    await prisma.componentNode.update({
      where: { id: nodeId },
      data,
    })
  }

  static async deleteComponentNode(nodeId: string): Promise<void> {
    await prisma.componentNode.delete({ where: { id: nodeId } })
  }

  static async getComponentConfigs(): Promise<Record<string, ComponentConfig>> {
    const configs = await prisma.componentConfig.findMany()
    const result: Record<string, ComponentConfig> = {}
    for (const config of configs) {
      result[config.id] = {
        id: config.id,
        componentId: config.componentId,
        props: JSON.parse(config.props),
        styles: JSON.parse(config.styles),
        events: JSON.parse(config.events),
        conditionalRendering: config.conditionalRendering ? JSON.parse(config.conditionalRendering) : undefined,
      }
    }
    return result
  }

  static async setComponentConfigs(configs: Record<string, ComponentConfig>): Promise<void> {
    await prisma.componentConfig.deleteMany()
    for (const config of Object.values(configs)) {
      await prisma.componentConfig.create({
        data: {
          id: config.id,
          componentId: config.componentId,
          props: JSON.stringify(config.props),
          styles: JSON.stringify(config.styles),
          events: JSON.stringify(config.events),
          conditionalRendering: config.conditionalRendering ? JSON.stringify(config.conditionalRendering) : null,
        },
      })
    }
  }

  static async addComponentConfig(config: ComponentConfig): Promise<void> {
    await prisma.componentConfig.create({
      data: {
        id: config.id,
        componentId: config.componentId,
        props: JSON.stringify(config.props),
        styles: JSON.stringify(config.styles),
        events: JSON.stringify(config.events),
        conditionalRendering: config.conditionalRendering ? JSON.stringify(config.conditionalRendering) : null,
      },
    })
  }

  static async updateComponentConfig(configId: string, updates: Partial<ComponentConfig>): Promise<void> {
    const data: any = {}
    if (updates.componentId !== undefined) data.componentId = updates.componentId
    if (updates.props !== undefined) data.props = JSON.stringify(updates.props)
    if (updates.styles !== undefined) data.styles = JSON.stringify(updates.styles)
    if (updates.events !== undefined) data.events = JSON.stringify(updates.events)
    if (updates.conditionalRendering !== undefined) data.conditionalRendering = JSON.stringify(updates.conditionalRendering)

    await prisma.componentConfig.update({
      where: { id: configId },
      data,
    })
  }

  static async deleteComponentConfig(configId: string): Promise<void> {
    await prisma.componentConfig.delete({ where: { id: configId } })
  }

  static async getGodCredentialsExpiry(): Promise<number> {
    const config = await prisma.systemConfig.findUnique({ where: { key: 'god_credentials_expiry' } })
    return config ? Number(config.value) : 0
  }

  static async setGodCredentialsExpiry(timestamp: number): Promise<void> {
    await prisma.systemConfig.upsert({
      where: { key: 'god_credentials_expiry' },
      update: { value: timestamp.toString() },
      create: { key: 'god_credentials_expiry', value: timestamp.toString() },
    })
  }

  static async getFirstLoginFlags(): Promise<Record<string, boolean>> {
    const users = await prisma.user.findMany({
      select: { username: true, firstLogin: true },
    })
    const result: Record<string, boolean> = {}
    for (const user of users) {
      result[user.username] = user.firstLogin
    }
    return result
  }

  static async setFirstLoginFlag(username: string, isFirstLogin: boolean): Promise<void> {
    await prisma.user.update({
      where: { username },
      data: { firstLogin: isFirstLogin },
    })
  }

  static async shouldShowGodCredentials(): Promise<boolean> {
    const expiry = await this.getGodCredentialsExpiry()
    const user = await prisma.user.findUnique({
      where: { username: 'god' },
      select: { passwordChangeTimestamp: true },
    })
    const godPasswordChangeTime = user?.passwordChangeTimestamp ? Number(user.passwordChangeTimestamp) : 0

    if (expiry === 0) {
      const duration = await this.getGodCredentialsExpiryDuration()
      const expiryTime = Date.now() + duration
      await this.setGodCredentialsExpiry(expiryTime)
      return true
    }

    if (godPasswordChangeTime > expiry) {
      return false
    }

    return Date.now() < expiry
  }

  static async getGodCredentialsExpiryDuration(): Promise<number> {
    const config = await prisma.systemConfig.findUnique({ where: { key: 'god_credentials_expiry_duration' } })
    return config ? Number(config.value) : (60 * 60 * 1000)
  }

  static async setGodCredentialsExpiryDuration(durationMs: number): Promise<void> {
    await prisma.systemConfig.upsert({
      where: { key: 'god_credentials_expiry_duration' },
      update: { value: durationMs.toString() },
      create: { key: 'god_credentials_expiry_duration', value: durationMs.toString() },
    })
  }

  static async resetGodCredentialsExpiry(): Promise<void> {
    const duration = await this.getGodCredentialsExpiryDuration()
    const expiryTime = Date.now() + duration
    await this.setGodCredentialsExpiry(expiryTime)
  }

  static async getCssClasses(): Promise<CssCategory[]> {
    const categories = await prisma.cssCategory.findMany()
    return categories.map(c => ({
      name: c.name,
      classes: JSON.parse(c.classes),
    }))
  }

  static async setCssClasses(classes: CssCategory[]): Promise<void> {
    await prisma.cssCategory.deleteMany()
    for (const category of classes) {
      await prisma.cssCategory.create({
        data: {
          name: category.name,
          classes: JSON.stringify(category.classes),
        },
      })
    }
  }

  static async addCssCategory(category: CssCategory): Promise<void> {
    await prisma.cssCategory.create({
      data: {
        name: category.name,
        classes: JSON.stringify(category.classes),
      },
    })
  }

  static async updateCssCategory(categoryName: string, classes: string[]): Promise<void> {
    await prisma.cssCategory.update({
      where: { name: categoryName },
      data: { classes: JSON.stringify(classes) },
    })
  }

  static async deleteCssCategory(categoryName: string): Promise<void> {
    await prisma.cssCategory.delete({ where: { name: categoryName } })
  }

  static async getDropdownConfigs(): Promise<DropdownConfig[]> {
    const configs = await prisma.dropdownConfig.findMany()
    return configs.map(c => ({
      id: c.id,
      name: c.name,
      label: c.label,
      options: JSON.parse(c.options),
    }))
  }

  static async setDropdownConfigs(configs: DropdownConfig[]): Promise<void> {
    await prisma.dropdownConfig.deleteMany()
    for (const config of configs) {
      await prisma.dropdownConfig.create({
        data: {
          id: config.id,
          name: config.name,
          label: config.label,
          options: JSON.stringify(config.options),
        },
      })
    }
  }

  static async addDropdownConfig(config: DropdownConfig): Promise<void> {
    await prisma.dropdownConfig.create({
      data: {
        id: config.id,
        name: config.name,
        label: config.label,
        options: JSON.stringify(config.options),
      },
    })
  }

  static async updateDropdownConfig(id: string, updates: DropdownConfig): Promise<void> {
    await prisma.dropdownConfig.update({
      where: { id },
      data: {
        name: updates.name,
        label: updates.label,
        options: JSON.stringify(updates.options),
      },
    })
  }

  static async deleteDropdownConfig(id: string): Promise<void> {
    await prisma.dropdownConfig.delete({ where: { id } })
  }

  static async getInstalledPackages(): Promise<InstalledPackage[]> {
    const packages = await prisma.installedPackage.findMany()
    return packages.map(p => ({
      packageId: p.packageId,
      installedAt: Number(p.installedAt),
      version: p.version,
      enabled: p.enabled,
    }))
  }

  static async setInstalledPackages(packages: InstalledPackage[]): Promise<void> {
    await prisma.installedPackage.deleteMany()
    for (const pkg of packages) {
      await prisma.installedPackage.create({
        data: {
          packageId: pkg.packageId,
          installedAt: BigInt(pkg.installedAt),
          version: pkg.version,
          enabled: pkg.enabled,
        },
      })
    }
  }

  static async installPackage(packageData: InstalledPackage): Promise<void> {
    const exists = await prisma.installedPackage.findUnique({ where: { packageId: packageData.packageId } })
    if (!exists) {
      await prisma.installedPackage.create({
        data: {
          packageId: packageData.packageId,
          installedAt: BigInt(packageData.installedAt),
          version: packageData.version,
          enabled: packageData.enabled,
        },
      })
    }
  }

  static async uninstallPackage(packageId: string): Promise<void> {
    await prisma.installedPackage.delete({ where: { packageId } })
  }

  static async togglePackageEnabled(packageId: string, enabled: boolean): Promise<void> {
    await prisma.installedPackage.update({
      where: { packageId },
      data: { enabled },
    })
  }

  static async getPackageData(packageId: string): Promise<Record<string, any[]>> {
    const pkg = await prisma.packageData.findUnique({ where: { packageId } })
    return pkg ? JSON.parse(pkg.data) : {}
  }

  static async setPackageData(packageId: string, data: Record<string, any[]>): Promise<void> {
    await prisma.packageData.upsert({
      where: { packageId },
      update: { data: JSON.stringify(data) },
      create: { packageId, data: JSON.stringify(data) },
    })
  }

  static async deletePackageData(packageId: string): Promise<void> {
    await prisma.packageData.delete({ where: { packageId } })
  }

  static async getPowerTransferRequests(): Promise<PowerTransferRequest[]> {
    const requests = await prisma.powerTransferRequest.findMany()
    return requests.map(r => ({
      id: r.id,
      fromUserId: r.fromUserId,
      toUserId: r.toUserId,
      status: r.status as any,
      createdAt: Number(r.createdAt),
      expiresAt: Number(r.expiresAt),
    }))
  }

  static async setPowerTransferRequests(requests: PowerTransferRequest[]): Promise<void> {
    await prisma.powerTransferRequest.deleteMany()
    for (const request of requests) {
      await prisma.powerTransferRequest.create({
        data: {
          id: request.id,
          fromUserId: request.fromUserId,
          toUserId: request.toUserId,
          status: request.status,
          createdAt: BigInt(request.createdAt),
          expiresAt: BigInt(request.expiresAt),
        },
      })
    }
  }

  static async addPowerTransferRequest(request: PowerTransferRequest): Promise<void> {
    await prisma.powerTransferRequest.create({
      data: {
        id: request.id,
        fromUserId: request.fromUserId,
        toUserId: request.toUserId,
        status: request.status,
        createdAt: BigInt(request.createdAt),
        expiresAt: BigInt(request.expiresAt),
      },
    })
  }

  static async updatePowerTransferRequest(requestId: string, updates: Partial<PowerTransferRequest>): Promise<void> {
    const data: any = {}
    if (updates.status !== undefined) data.status = updates.status

    await prisma.powerTransferRequest.update({
      where: { id: requestId },
      data,
    })
  }

  static async deletePowerTransferRequest(requestId: string): Promise<void> {
    await prisma.powerTransferRequest.delete({ where: { id: requestId } })
  }

  static async getSuperGod(): Promise<User | null> {
    const user = await prisma.user.findFirst({
      where: { role: 'supergod' },
    })
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
  }

  static async transferSuperGodPower(fromUserId: string, toUserId: string): Promise<void> {
    await prisma.user.update({
      where: { id: fromUserId },
      data: { role: 'god', isInstanceOwner: false },
    })

    await prisma.user.update({
      where: { id: toUserId },
      data: { role: 'supergod', isInstanceOwner: true },
    })
  }

  static async getSMTPConfig(): Promise<SMTPConfig | null> {
    const config = await prisma.sMTPConfig.findFirst()
    if (!config) return null

    return {
      host: config.host,
      port: config.port,
      secure: config.secure,
      username: config.username,
      password: config.password,
      fromEmail: config.fromEmail,
      fromName: config.fromName,
    }
  }

  static async setSMTPConfig(config: SMTPConfig): Promise<void> {
    await prisma.sMTPConfig.deleteMany()
    await prisma.sMTPConfig.create({
      data: {
        host: config.host,
        port: config.port,
        secure: config.secure,
        username: config.username,
        password: config.password,
        fromEmail: config.fromEmail,
        fromName: config.fromName,
      },
    })
  }

  static async getPasswordResetTokens(): Promise<Record<string, string>> {
    const tokens = await prisma.passwordResetToken.findMany()
    const result: Record<string, string> = {}
    for (const token of tokens) {
      result[token.username] = token.token
    }
    return result
  }

  static async setPasswordResetToken(username: string, token: string): Promise<void> {
    await prisma.passwordResetToken.upsert({
      where: { username },
      update: { token },
      create: { username, token },
    })
  }

  static async deletePasswordResetToken(username: string): Promise<void> {
    await prisma.passwordResetToken.delete({ where: { username } })
  }

  static async clearDatabase(): Promise<void> {
    await prisma.user.deleteMany()
    await prisma.credential.deleteMany()
    await prisma.workflow.deleteMany()
    await prisma.luaScript.deleteMany()
    await prisma.pageConfig.deleteMany()
    await prisma.modelSchema.deleteMany()
    await prisma.appConfiguration.deleteMany()
    await prisma.comment.deleteMany()
    await prisma.componentNode.deleteMany()
    await prisma.componentConfig.deleteMany()
    await prisma.systemConfig.deleteMany()
    await prisma.cssCategory.deleteMany()
    await prisma.dropdownConfig.deleteMany()
    await prisma.installedPackage.deleteMany()
    await prisma.packageData.deleteMany()
    await prisma.tenant.deleteMany()
    await prisma.powerTransferRequest.deleteMany()
    await prisma.sMTPConfig.deleteMany()
    await prisma.passwordResetToken.deleteMany()
  }

  static async seedDefaultData(): Promise<void> {
    const users = await this.getUsers()
    const credentials = await this.getCredentials()

    if (users.length === 0) {
      const defaultUsers: User[] = [
        {
          id: 'user_supergod',
          username: 'supergod',
          email: 'supergod@builder.com',
          role: 'supergod',
          bio: 'Supreme administrator with multi-tenant control',
          createdAt: Date.now(),
          isInstanceOwner: true,
        },
        {
          id: 'user_god',
          username: 'god',
          email: 'god@builder.com',
          role: 'god',
          bio: 'System architect with full access to all levels',
          createdAt: Date.now(),
        },
        {
          id: 'user_admin',
          username: 'admin',
          email: 'admin@builder.com',
          role: 'admin',
          bio: 'Administrator with data management access',
          createdAt: Date.now(),
        },
        {
          id: 'user_demo',
          username: 'demo',
          email: 'demo@builder.com',
          role: 'user',
          bio: 'Demo user account',
          createdAt: Date.now(),
        },
      ]

      await this.setUsers(defaultUsers)
    }

    if (Object.keys(credentials).length === 0) {
      const { getScrambledPassword } = await import('../auth')
      await this.setCredential('supergod', await hashPassword(getScrambledPassword('supergod')))
      await this.setCredential('god', await hashPassword(getScrambledPassword('god')))
      await this.setCredential('admin', await hashPassword(getScrambledPassword('admin')))
      await this.setCredential('demo', await hashPassword(getScrambledPassword('demo')))

      await this.setFirstLoginFlag('supergod', true)
      await this.setFirstLoginFlag('god', true)
      await this.setFirstLoginFlag('admin', false)
      await this.setFirstLoginFlag('demo', false)
    }

    const appConfig = await this.getAppConfig()
    if (!appConfig) {
      const defaultConfig: AppConfiguration = {
        id: 'app_001',
        name: 'MetaBuilder App',
        schemas: [],
        workflows: [],
        luaScripts: [],
        pages: [],
        theme: {
          colors: {},
          fonts: {},
        },
      }
      await this.setAppConfig(defaultConfig)
    }

    const cssClasses = await this.getCssClasses()
    if (cssClasses.length === 0) {
      const defaultCssClasses: CssCategory[] = [
        { name: 'Layout', classes: ['flex', 'flex-col', 'flex-row', 'grid', 'grid-cols-2', 'grid-cols-3', 'grid-cols-4', 'block', 'inline-block', 'inline', 'hidden'] },
        { name: 'Spacing', classes: ['p-0', 'p-1', 'p-2', 'p-3', 'p-4', 'p-6', 'p-8', 'm-0', 'm-1', 'm-2', 'm-3', 'm-4', 'm-6', 'm-8', 'gap-1', 'gap-2', 'gap-3', 'gap-4', 'gap-6', 'gap-8'] },
        { name: 'Sizing', classes: ['w-full', 'w-1/2', 'w-1/3', 'w-1/4', 'w-auto', 'h-full', 'h-screen', 'h-auto', 'min-h-screen', 'max-w-xs', 'max-w-sm', 'max-w-md', 'max-w-lg', 'max-w-xl', 'max-w-2xl', 'max-w-4xl', 'max-w-6xl', 'max-w-7xl'] },
        { name: 'Typography', classes: ['text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl', 'text-3xl', 'text-4xl', 'font-normal', 'font-medium', 'font-semibold', 'font-bold', 'text-left', 'text-center', 'text-right', 'uppercase', 'lowercase', 'capitalize'] },
        { name: 'Colors', classes: ['text-primary', 'text-secondary', 'text-accent', 'text-muted-foreground', 'bg-primary', 'bg-secondary', 'bg-accent', 'bg-background', 'bg-card', 'bg-muted', 'border-primary', 'border-secondary', 'border-accent', 'border-border'] },
        { name: 'Borders', classes: ['border', 'border-2', 'border-4', 'border-t', 'border-b', 'border-l', 'border-r', 'rounded', 'rounded-sm', 'rounded-md', 'rounded-lg', 'rounded-xl', 'rounded-2xl', 'rounded-full'] },
        { name: 'Effects', classes: ['shadow', 'shadow-sm', 'shadow-md', 'shadow-lg', 'shadow-xl', 'hover:shadow-lg', 'opacity-0', 'opacity-50', 'opacity-75', 'opacity-100', 'transition', 'transition-all', 'duration-200', 'duration-300', 'duration-500'] },
        { name: 'Positioning', classes: ['relative', 'absolute', 'fixed', 'sticky', 'top-0', 'bottom-0', 'left-0', 'right-0', 'z-10', 'z-20', 'z-30', 'z-40', 'z-50'] },
        { name: 'Alignment', classes: ['items-start', 'items-center', 'items-end', 'justify-start', 'justify-center', 'justify-end', 'justify-between', 'justify-around', 'self-start', 'self-center', 'self-end'] },
        { name: 'Interactivity', classes: ['cursor-pointer', 'cursor-default', 'pointer-events-none', 'select-none', 'hover:bg-accent', 'hover:text-accent-foreground', 'active:scale-95', 'disabled:opacity-50'] },
      ]
      await this.setCssClasses(defaultCssClasses)
    }

    const dropdowns = await this.getDropdownConfigs()
    if (dropdowns.length === 0) {
      const defaultDropdowns: DropdownConfig[] = [
        { id: 'dropdown_status', name: 'status_options', label: 'Status', options: [{ value: 'draft', label: 'Draft' }, { value: 'published', label: 'Published' }, { value: 'archived', label: 'Archived' }] },
        { id: 'dropdown_priority', name: 'priority_options', label: 'Priority', options: [{ value: 'low', label: 'Low' }, { value: 'medium', label: 'Medium' }, { value: 'high', label: 'High' }, { value: 'urgent', label: 'Urgent' }] },
        { id: 'dropdown_category', name: 'category_options', label: 'Category', options: [{ value: 'general', label: 'General' }, { value: 'technical', label: 'Technical' }, { value: 'business', label: 'Business' }, { value: 'personal', label: 'Personal' }] },
      ]
      await this.setDropdownConfigs(defaultDropdowns)
    }
  }

  static async exportDatabase(): Promise<string> {
    const data = {
      users: await this.getUsers(),
      workflows: await this.getWorkflows(),
      luaScripts: await this.getLuaScripts(),
      pages: await this.getPages(),
      schemas: await this.getSchemas(),
      appConfig: (await this.getAppConfig()) || undefined,
      comments: await this.getComments(),
      componentHierarchy: await this.getComponentHierarchy(),
      componentConfigs: await this.getComponentConfigs(),
    }
    return JSON.stringify(data, null, 2)
  }

  static async importDatabase(jsonData: string): Promise<void> {
    try {
      const data = JSON.parse(jsonData)

      if (data.users) await this.setUsers(data.users)
      if (data.workflows) await this.setWorkflows(data.workflows)
      if (data.luaScripts) await this.setLuaScripts(data.luaScripts)
      if (data.pages) await this.setPages(data.pages)
      if (data.schemas) await this.setSchemas(data.schemas)
      if (data.appConfig) await this.setAppConfig(data.appConfig)
      if (data.comments) await this.setComments(data.comments)
      if (data.componentHierarchy) await this.setComponentHierarchy(data.componentHierarchy)
      if (data.componentConfigs) await this.setComponentConfigs(data.componentConfigs)
    } catch (error) {
      throw new Error('Failed to import database: Invalid JSON')
    }
  }
}

// Re-export standalone functions for direct import
export { hashPassword, verifyPassword }
