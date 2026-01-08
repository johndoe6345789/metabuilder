import type {
  User,
  Workflow,
  LuaScript,
  PageConfig,
  AppConfiguration,
  Comment,
  Tenant,
  PowerTransferRequest,
} from './level-types'
import type { ModelSchema } from './schema-types'
import type { InstalledPackage } from './package-types'
import type { SMTPConfig } from './password-utils'

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

export interface DatabaseSchema {
  users: User[]
  credentials: Record<string, string>
  workflows: Workflow[]
  luaScripts: LuaScript[]
  pages: PageConfig[]
  schemas: ModelSchema[]
  appConfig: AppConfiguration
  comments: Comment[]
  componentHierarchy: Record<string, ComponentNode>
  componentConfigs: Record<string, ComponentConfig>
  godCredentialsExpiry: number
  passwordChangeTimestamps: Record<string, number>
  firstLoginFlags: Record<string, boolean>
  godCredentialsExpiryDuration: number
  cssClasses: CssCategory[]
  dropdownConfigs: DropdownConfig[]
  tenants: Tenant[]
  powerTransferRequests: PowerTransferRequest[]
  smtpConfig: SMTPConfig
  passwordResetTokens: Record<string, string>
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

export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-512', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  return hashHex
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const inputHash = await hashPassword(password)
  return inputHash === hash
}

export class Database {
  static async getUsers(): Promise<User[]> {
    return (await window.spark.kv.get<User[]>(DB_KEYS.USERS)) || []
  }

  static async setUsers(users: User[]): Promise<void> {
    await window.spark.kv.set(DB_KEYS.USERS, users)
  }

  static async addUser(user: User): Promise<void> {
    const users = await this.getUsers()
    users.push(user)
    await this.setUsers(users)
  }

  static async updateUser(userId: string, updates: Partial<User>): Promise<void> {
    const users = await this.getUsers()
    const index = users.findIndex(u => u.id === userId)
    if (index !== -1) {
      users[index] = { ...users[index], ...updates }
      await this.setUsers(users)
    }
  }

  static async deleteUser(userId: string): Promise<void> {
    const users = await this.getUsers()
    const filtered = users.filter(u => u.id !== userId)
    await this.setUsers(filtered)
  }

  static async getCredentials(): Promise<Record<string, string>> {
    return (await window.spark.kv.get<Record<string, string>>(DB_KEYS.CREDENTIALS)) || {}
  }

  static async setCredential(username: string, passwordHash: string): Promise<void> {
    const credentials = await this.getCredentials()
    credentials[username] = passwordHash
    await window.spark.kv.set(DB_KEYS.CREDENTIALS, credentials)
    
    const timestamps = await this.getPasswordChangeTimestamps()
    timestamps[username] = Date.now()
    await this.setPasswordChangeTimestamps(timestamps)
  }

  static async getPasswordChangeTimestamps(): Promise<Record<string, number>> {
    return (await window.spark.kv.get<Record<string, number>>(DB_KEYS.PASSWORD_CHANGE_TIMESTAMPS)) || {}
  }

  static async setPasswordChangeTimestamps(timestamps: Record<string, number>): Promise<void> {
    await window.spark.kv.set(DB_KEYS.PASSWORD_CHANGE_TIMESTAMPS, timestamps)
  }

  static async verifyCredentials(username: string, password: string): Promise<boolean> {
    const credentials = await this.getCredentials()
    const storedHash = credentials[username]
    if (!storedHash) return false
    return await verifyPassword(password, storedHash)
  }

  static async getWorkflows(): Promise<Workflow[]> {
    return (await window.spark.kv.get<Workflow[]>(DB_KEYS.WORKFLOWS)) || []
  }

  static async setWorkflows(workflows: Workflow[]): Promise<void> {
    await window.spark.kv.set(DB_KEYS.WORKFLOWS, workflows)
  }

  static async addWorkflow(workflow: Workflow): Promise<void> {
    const workflows = await this.getWorkflows()
    workflows.push(workflow)
    await this.setWorkflows(workflows)
  }

  static async updateWorkflow(workflowId: string, updates: Partial<Workflow>): Promise<void> {
    const workflows = await this.getWorkflows()
    const index = workflows.findIndex(w => w.id === workflowId)
    if (index !== -1) {
      workflows[index] = { ...workflows[index], ...updates }
      await this.setWorkflows(workflows)
    }
  }

  static async deleteWorkflow(workflowId: string): Promise<void> {
    const workflows = await this.getWorkflows()
    const filtered = workflows.filter(w => w.id !== workflowId)
    await this.setWorkflows(filtered)
  }

  static async getLuaScripts(): Promise<LuaScript[]> {
    return (await window.spark.kv.get<LuaScript[]>(DB_KEYS.LUA_SCRIPTS)) || []
  }

  static async setLuaScripts(scripts: LuaScript[]): Promise<void> {
    await window.spark.kv.set(DB_KEYS.LUA_SCRIPTS, scripts)
  }

  static async addLuaScript(script: LuaScript): Promise<void> {
    const scripts = await this.getLuaScripts()
    scripts.push(script)
    await this.setLuaScripts(scripts)
  }

  static async updateLuaScript(scriptId: string, updates: Partial<LuaScript>): Promise<void> {
    const scripts = await this.getLuaScripts()
    const index = scripts.findIndex(s => s.id === scriptId)
    if (index !== -1) {
      scripts[index] = { ...scripts[index], ...updates }
      await this.setLuaScripts(scripts)
    }
  }

  static async deleteLuaScript(scriptId: string): Promise<void> {
    const scripts = await this.getLuaScripts()
    const filtered = scripts.filter(s => s.id !== scriptId)
    await this.setLuaScripts(filtered)
  }

  static async getPages(): Promise<PageConfig[]> {
    return (await window.spark.kv.get<PageConfig[]>(DB_KEYS.PAGES)) || []
  }

  static async setPages(pages: PageConfig[]): Promise<void> {
    await window.spark.kv.set(DB_KEYS.PAGES, pages)
  }

  static async addPage(page: PageConfig): Promise<void> {
    const pages = await this.getPages()
    pages.push(page)
    await this.setPages(pages)
  }

  static async updatePage(pageId: string, updates: Partial<PageConfig>): Promise<void> {
    const pages = await this.getPages()
    const index = pages.findIndex(p => p.id === pageId)
    if (index !== -1) {
      pages[index] = { ...pages[index], ...updates }
      await this.setPages(pages)
    }
  }

  static async deletePage(pageId: string): Promise<void> {
    const pages = await this.getPages()
    const filtered = pages.filter(p => p.id !== pageId)
    await this.setPages(filtered)
  }

  static async getSchemas(): Promise<ModelSchema[]> {
    return (await window.spark.kv.get<ModelSchema[]>(DB_KEYS.SCHEMAS)) || []
  }

  static async setSchemas(schemas: ModelSchema[]): Promise<void> {
    await window.spark.kv.set(DB_KEYS.SCHEMAS, schemas)
  }

  static async addSchema(schema: ModelSchema): Promise<void> {
    const schemas = await this.getSchemas()
    schemas.push(schema)
    await this.setSchemas(schemas)
  }

  static async updateSchema(schemaName: string, updates: Partial<ModelSchema>): Promise<void> {
    const schemas = await this.getSchemas()
    const index = schemas.findIndex(s => s.name === schemaName)
    if (index !== -1) {
      schemas[index] = { ...schemas[index], ...updates }
      await this.setSchemas(schemas)
    }
  }

  static async deleteSchema(schemaName: string): Promise<void> {
    const schemas = await this.getSchemas()
    const filtered = schemas.filter(s => s.name !== schemaName)
    await this.setSchemas(filtered)
  }

  static async getAppConfig(): Promise<AppConfiguration | null> {
    const config = await window.spark.kv.get<AppConfiguration>(DB_KEYS.APP_CONFIG)
    return config || null
  }

  static async setAppConfig(config: AppConfiguration): Promise<void> {
    await window.spark.kv.set(DB_KEYS.APP_CONFIG, config)
  }

  static async getComments(): Promise<Comment[]> {
    return (await window.spark.kv.get<Comment[]>(DB_KEYS.COMMENTS)) || []
  }

  static async setComments(comments: Comment[]): Promise<void> {
    await window.spark.kv.set(DB_KEYS.COMMENTS, comments)
  }

  static async addComment(comment: Comment): Promise<void> {
    const comments = await this.getComments()
    comments.push(comment)
    await this.setComments(comments)
  }

  static async updateComment(commentId: string, updates: Partial<Comment>): Promise<void> {
    const comments = await this.getComments()
    const index = comments.findIndex(c => c.id === commentId)
    if (index !== -1) {
      comments[index] = { ...comments[index], ...updates }
      await this.setComments(comments)
    }
  }

  static async deleteComment(commentId: string): Promise<void> {
    const comments = await this.getComments()
    const filtered = comments.filter(c => c.id !== commentId)
    await this.setComments(filtered)
  }

  static async getComponentHierarchy(): Promise<Record<string, ComponentNode>> {
    return (await window.spark.kv.get<Record<string, ComponentNode>>(DB_KEYS.COMPONENT_HIERARCHY)) || {}
  }

  static async setComponentHierarchy(hierarchy: Record<string, ComponentNode>): Promise<void> {
    await window.spark.kv.set(DB_KEYS.COMPONENT_HIERARCHY, hierarchy)
  }

  static async addComponentNode(node: ComponentNode): Promise<void> {
    const hierarchy = await this.getComponentHierarchy()
    hierarchy[node.id] = node
    await this.setComponentHierarchy(hierarchy)
  }

  static async updateComponentNode(nodeId: string, updates: Partial<ComponentNode>): Promise<void> {
    const hierarchy = await this.getComponentHierarchy()
    if (hierarchy[nodeId]) {
      hierarchy[nodeId] = { ...hierarchy[nodeId], ...updates }
      await this.setComponentHierarchy(hierarchy)
    }
  }

  static async deleteComponentNode(nodeId: string): Promise<void> {
    const hierarchy = await this.getComponentHierarchy()
    delete hierarchy[nodeId]
    await this.setComponentHierarchy(hierarchy)
  }

  static async getComponentConfigs(): Promise<Record<string, ComponentConfig>> {
    return (await window.spark.kv.get<Record<string, ComponentConfig>>(DB_KEYS.COMPONENT_CONFIGS)) || {}
  }

  static async setComponentConfigs(configs: Record<string, ComponentConfig>): Promise<void> {
    await window.spark.kv.set(DB_KEYS.COMPONENT_CONFIGS, configs)
  }

  static async addComponentConfig(config: ComponentConfig): Promise<void> {
    const configs = await this.getComponentConfigs()
    configs[config.id] = config
    await this.setComponentConfigs(configs)
  }

  static async updateComponentConfig(configId: string, updates: Partial<ComponentConfig>): Promise<void> {
    const configs = await this.getComponentConfigs()
    if (configs[configId]) {
      configs[configId] = { ...configs[configId], ...updates }
      await this.setComponentConfigs(configs)
    }
  }

  static async deleteComponentConfig(configId: string): Promise<void> {
    const configs = await this.getComponentConfigs()
    delete configs[configId]
    await this.setComponentConfigs(configs)
  }

  static async initializeDatabase(): Promise<void> {
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
      const { getScrambledPassword } = await import('./auth')
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
        {
          name: 'Layout',
          classes: ['flex', 'flex-col', 'flex-row', 'grid', 'grid-cols-2', 'grid-cols-3', 'grid-cols-4', 'block', 'inline-block', 'inline', 'hidden'],
        },
        {
          name: 'Spacing',
          classes: ['p-0', 'p-1', 'p-2', 'p-3', 'p-4', 'p-6', 'p-8', 'm-0', 'm-1', 'm-2', 'm-3', 'm-4', 'm-6', 'm-8', 'gap-1', 'gap-2', 'gap-3', 'gap-4', 'gap-6', 'gap-8'],
        },
        {
          name: 'Sizing',
          classes: ['w-full', 'w-1/2', 'w-1/3', 'w-1/4', 'w-auto', 'h-full', 'h-screen', 'h-auto', 'min-h-screen', 'max-w-xs', 'max-w-sm', 'max-w-md', 'max-w-lg', 'max-w-xl', 'max-w-2xl', 'max-w-4xl', 'max-w-6xl', 'max-w-7xl'],
        },
        {
          name: 'Typography',
          classes: ['text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl', 'text-3xl', 'text-4xl', 'font-normal', 'font-medium', 'font-semibold', 'font-bold', 'text-left', 'text-center', 'text-right', 'uppercase', 'lowercase', 'capitalize'],
        },
        {
          name: 'Colors',
          classes: ['text-primary', 'text-secondary', 'text-accent', 'text-muted-foreground', 'bg-primary', 'bg-secondary', 'bg-accent', 'bg-background', 'bg-card', 'bg-muted', 'border-primary', 'border-secondary', 'border-accent', 'border-border'],
        },
        {
          name: 'Borders',
          classes: ['border', 'border-2', 'border-4', 'border-t', 'border-b', 'border-l', 'border-r', 'rounded', 'rounded-sm', 'rounded-md', 'rounded-lg', 'rounded-xl', 'rounded-2xl', 'rounded-full'],
        },
        {
          name: 'Effects',
          classes: ['shadow', 'shadow-sm', 'shadow-md', 'shadow-lg', 'shadow-xl', 'hover:shadow-lg', 'opacity-0', 'opacity-50', 'opacity-75', 'opacity-100', 'transition', 'transition-all', 'duration-200', 'duration-300', 'duration-500'],
        },
        {
          name: 'Positioning',
          classes: ['relative', 'absolute', 'fixed', 'sticky', 'top-0', 'bottom-0', 'left-0', 'right-0', 'z-10', 'z-20', 'z-30', 'z-40', 'z-50'],
        },
        {
          name: 'Alignment',
          classes: ['items-start', 'items-center', 'items-end', 'justify-start', 'justify-center', 'justify-end', 'justify-between', 'justify-around', 'self-start', 'self-center', 'self-end'],
        },
        {
          name: 'Interactivity',
          classes: ['cursor-pointer', 'cursor-default', 'pointer-events-none', 'select-none', 'hover:bg-accent', 'hover:text-accent-foreground', 'active:scale-95', 'disabled:opacity-50'],
        },
      ]
      await this.setCssClasses(defaultCssClasses)
    }

    const dropdowns = await this.getDropdownConfigs()
    if (dropdowns.length === 0) {
      const defaultDropdowns: DropdownConfig[] = [
        {
          id: 'dropdown_status',
          name: 'status_options',
          label: 'Status',
          options: [
            { value: 'draft', label: 'Draft' },
            { value: 'published', label: 'Published' },
            { value: 'archived', label: 'Archived' },
          ],
        },
        {
          id: 'dropdown_priority',
          name: 'priority_options',
          label: 'Priority',
          options: [
            { value: 'low', label: 'Low' },
            { value: 'medium', label: 'Medium' },
            { value: 'high', label: 'High' },
            { value: 'urgent', label: 'Urgent' },
          ],
        },
        {
          id: 'dropdown_category',
          name: 'category_options',
          label: 'Category',
          options: [
            { value: 'general', label: 'General' },
            { value: 'technical', label: 'Technical' },
            { value: 'business', label: 'Business' },
            { value: 'personal', label: 'Personal' },
          ],
        },
      ]
      await this.setDropdownConfigs(defaultDropdowns)
    }
  }

  static async exportDatabase(): Promise<string> {
    const data: Partial<DatabaseSchema> = {
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
      const data = JSON.parse(jsonData) as Partial<DatabaseSchema>
      
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

  static async getGodCredentialsExpiry(): Promise<number> {
    return (await window.spark.kv.get<number>(DB_KEYS.GOD_CREDENTIALS_EXPIRY)) || 0
  }

  static async setGodCredentialsExpiry(timestamp: number): Promise<void> {
    await window.spark.kv.set(DB_KEYS.GOD_CREDENTIALS_EXPIRY, timestamp)
  }

  static async getFirstLoginFlags(): Promise<Record<string, boolean>> {
    return (await window.spark.kv.get<Record<string, boolean>>(DB_KEYS.FIRST_LOGIN_FLAGS)) || {}
  }

  static async setFirstLoginFlag(username: string, isFirstLogin: boolean): Promise<void> {
    const flags = await this.getFirstLoginFlags()
    flags[username] = isFirstLogin
    await window.spark.kv.set(DB_KEYS.FIRST_LOGIN_FLAGS, flags)
  }

  static async shouldShowGodCredentials(): Promise<boolean> {
    const expiry = await this.getGodCredentialsExpiry()
    const passwordTimestamps = await this.getPasswordChangeTimestamps()
    const godPasswordChangeTime = passwordTimestamps['god'] || 0
    
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
    const duration = await window.spark.kv.get<number>(DB_KEYS.GOD_CREDENTIALS_EXPIRY_DURATION)
    return duration || (60 * 60 * 1000)
  }

  static async setGodCredentialsExpiryDuration(durationMs: number): Promise<void> {
    await window.spark.kv.set(DB_KEYS.GOD_CREDENTIALS_EXPIRY_DURATION, durationMs)
  }

  static async resetGodCredentialsExpiry(): Promise<void> {
    const duration = await this.getGodCredentialsExpiryDuration()
    const expiryTime = Date.now() + duration
    await this.setGodCredentialsExpiry(expiryTime)
  }

  static async getCssClasses(): Promise<CssCategory[]> {
    return (await window.spark.kv.get<CssCategory[]>(DB_KEYS.CSS_CLASSES)) || []
  }

  static async setCssClasses(classes: CssCategory[]): Promise<void> {
    await window.spark.kv.set(DB_KEYS.CSS_CLASSES, classes)
  }

  static async addCssCategory(category: CssCategory): Promise<void> {
    const classes = await this.getCssClasses()
    classes.push(category)
    await this.setCssClasses(classes)
  }

  static async updateCssCategory(categoryName: string, classes: string[]): Promise<void> {
    const categories = await this.getCssClasses()
    const index = categories.findIndex(c => c.name === categoryName)
    if (index !== -1) {
      categories[index].classes = classes
      await this.setCssClasses(categories)
    }
  }

  static async deleteCssCategory(categoryName: string): Promise<void> {
    const categories = await this.getCssClasses()
    const filtered = categories.filter(c => c.name !== categoryName)
    await this.setCssClasses(filtered)
  }

  static async getDropdownConfigs(): Promise<DropdownConfig[]> {
    return (await window.spark.kv.get<DropdownConfig[]>(DB_KEYS.DROPDOWN_CONFIGS)) || []
  }

  static async setDropdownConfigs(configs: DropdownConfig[]): Promise<void> {
    await window.spark.kv.set(DB_KEYS.DROPDOWN_CONFIGS, configs)
  }

  static async addDropdownConfig(config: DropdownConfig): Promise<void> {
    const configs = await this.getDropdownConfigs()
    configs.push(config)
    await this.setDropdownConfigs(configs)
  }

  static async updateDropdownConfig(id: string, updates: DropdownConfig): Promise<void> {
    const configs = await this.getDropdownConfigs()
    const index = configs.findIndex(c => c.id === id)
    if (index !== -1) {
      configs[index] = updates
      await this.setDropdownConfigs(configs)
    }
  }

  static async deleteDropdownConfig(id: string): Promise<void> {
    const configs = await this.getDropdownConfigs()
    const filtered = configs.filter(c => c.id !== id)
    await this.setDropdownConfigs(filtered)
  }

  static async clearDatabase(): Promise<void> {
    await window.spark.kv.delete(DB_KEYS.USERS)
    await window.spark.kv.delete(DB_KEYS.CREDENTIALS)
    await window.spark.kv.delete(DB_KEYS.WORKFLOWS)
    await window.spark.kv.delete(DB_KEYS.LUA_SCRIPTS)
    await window.spark.kv.delete(DB_KEYS.PAGES)
    await window.spark.kv.delete(DB_KEYS.SCHEMAS)
    await window.spark.kv.delete(DB_KEYS.APP_CONFIG)
    await window.spark.kv.delete(DB_KEYS.COMMENTS)
    await window.spark.kv.delete(DB_KEYS.COMPONENT_HIERARCHY)
    await window.spark.kv.delete(DB_KEYS.COMPONENT_CONFIGS)
    await window.spark.kv.delete(DB_KEYS.GOD_CREDENTIALS_EXPIRY)
    await window.spark.kv.delete(DB_KEYS.PASSWORD_CHANGE_TIMESTAMPS)
    await window.spark.kv.delete(DB_KEYS.FIRST_LOGIN_FLAGS)
    await window.spark.kv.delete(DB_KEYS.GOD_CREDENTIALS_EXPIRY_DURATION)
    await window.spark.kv.delete(DB_KEYS.CSS_CLASSES)
    await window.spark.kv.delete(DB_KEYS.DROPDOWN_CONFIGS)
  }

  static async getInstalledPackages(): Promise<InstalledPackage[]> {
    return (await window.spark.kv.get<InstalledPackage[]>(DB_KEYS.INSTALLED_PACKAGES)) || []
  }

  static async setInstalledPackages(packages: InstalledPackage[]): Promise<void> {
    await window.spark.kv.set(DB_KEYS.INSTALLED_PACKAGES, packages)
  }

  static async installPackage(packageData: InstalledPackage): Promise<void> {
    const packages = await this.getInstalledPackages()
    const exists = packages.find(p => p.packageId === packageData.packageId)
    if (!exists) {
      packages.push(packageData)
      await this.setInstalledPackages(packages)
    }
  }

  static async uninstallPackage(packageId: string): Promise<void> {
    const packages = await this.getInstalledPackages()
    const filtered = packages.filter(p => p.packageId !== packageId)
    await this.setInstalledPackages(filtered)
  }

  static async togglePackageEnabled(packageId: string, enabled: boolean): Promise<void> {
    const packages = await this.getInstalledPackages()
    const pkg = packages.find(p => p.packageId === packageId)
    if (pkg) {
      pkg.enabled = enabled
      await this.setInstalledPackages(packages)
    }
  }

  static async getPackageData(packageId: string): Promise<Record<string, any[]>> {
    const allData = (await window.spark.kv.get<Record<string, Record<string, any[]>>>(DB_KEYS.PACKAGE_DATA)) || {}
    return allData[packageId] || {}
  }

  static async setPackageData(packageId: string, data: Record<string, any[]>): Promise<void> {
    const allData = (await window.spark.kv.get<Record<string, Record<string, any[]>>>(DB_KEYS.PACKAGE_DATA)) || {}
    allData[packageId] = data
    await window.spark.kv.set(DB_KEYS.PACKAGE_DATA, allData)
  }

  static async deletePackageData(packageId: string): Promise<void> {
    const allData = (await window.spark.kv.get<Record<string, Record<string, any[]>>>(DB_KEYS.PACKAGE_DATA)) || {}
    delete allData[packageId]
    await window.spark.kv.set(DB_KEYS.PACKAGE_DATA, allData)
  }

  static async getTenants(): Promise<Tenant[]> {
    return (await window.spark.kv.get<Tenant[]>(DB_KEYS.TENANTS)) || []
  }

  static async setTenants(tenants: Tenant[]): Promise<void> {
    await window.spark.kv.set(DB_KEYS.TENANTS, tenants)
  }

  static async addTenant(tenant: Tenant): Promise<void> {
    const tenants = await this.getTenants()
    tenants.push(tenant)
    await this.setTenants(tenants)
  }

  static async updateTenant(tenantId: string, updates: Partial<Tenant>): Promise<void> {
    const tenants = await this.getTenants()
    const index = tenants.findIndex(t => t.id === tenantId)
    if (index !== -1) {
      tenants[index] = { ...tenants[index], ...updates }
      await this.setTenants(tenants)
    }
  }

  static async deleteTenant(tenantId: string): Promise<void> {
    const tenants = await this.getTenants()
    const filtered = tenants.filter(t => t.id !== tenantId)
    await this.setTenants(filtered)
  }

  static async getPowerTransferRequests(): Promise<PowerTransferRequest[]> {
    return (await window.spark.kv.get<PowerTransferRequest[]>(DB_KEYS.POWER_TRANSFER_REQUESTS)) || []
  }

  static async setPowerTransferRequests(requests: PowerTransferRequest[]): Promise<void> {
    await window.spark.kv.set(DB_KEYS.POWER_TRANSFER_REQUESTS, requests)
  }

  static async addPowerTransferRequest(request: PowerTransferRequest): Promise<void> {
    const requests = await this.getPowerTransferRequests()
    requests.push(request)
    await this.setPowerTransferRequests(requests)
  }

  static async updatePowerTransferRequest(requestId: string, updates: Partial<PowerTransferRequest>): Promise<void> {
    const requests = await this.getPowerTransferRequests()
    const index = requests.findIndex(r => r.id === requestId)
    if (index !== -1) {
      requests[index] = { ...requests[index], ...updates }
      await this.setPowerTransferRequests(requests)
    }
  }

  static async deletePowerTransferRequest(requestId: string): Promise<void> {
    const requests = await this.getPowerTransferRequests()
    const filtered = requests.filter(r => r.id !== requestId)
    await this.setPowerTransferRequests(filtered)
  }

  static async getSuperGod(): Promise<User | null> {
    const users = await this.getUsers()
    return users.find(u => u.role === 'supergod') || null
  }

  static async transferSuperGodPower(fromUserId: string, toUserId: string): Promise<void> {
    const users = await this.getUsers()
    const fromUser = users.find(u => u.id === fromUserId)
    const toUser = users.find(u => u.id === toUserId)
    
    if (!fromUser || !toUser) {
      throw new Error('User not found')
    }

    if (fromUser.role !== 'supergod') {
      throw new Error('Only supergod can transfer power')
    }

    fromUser.role = 'god'
    fromUser.isInstanceOwner = false
    toUser.role = 'supergod'
    toUser.isInstanceOwner = true

    await this.setUsers(users)
  }

  static async getSMTPConfig(): Promise<SMTPConfig | null> {
    return await window.spark.kv.get<SMTPConfig>(DB_KEYS.SMTP_CONFIG) || null
  }

  static async setSMTPConfig(config: SMTPConfig): Promise<void> {
    await window.spark.kv.set(DB_KEYS.SMTP_CONFIG, config)
  }

  static async getPasswordResetTokens(): Promise<Record<string, string>> {
    return (await window.spark.kv.get<Record<string, string>>(DB_KEYS.PASSWORD_RESET_TOKENS)) || {}
  }

  static async setPasswordResetToken(username: string, token: string): Promise<void> {
    const tokens = await this.getPasswordResetTokens()
    tokens[username] = token
    await window.spark.kv.set(DB_KEYS.PASSWORD_RESET_TOKENS, tokens)
  }

  static async deletePasswordResetToken(username: string): Promise<void> {
    const tokens = await this.getPasswordResetTokens()
    delete tokens[username]
    await window.spark.kv.set(DB_KEYS.PASSWORD_RESET_TOKENS, tokens)
  }
}
