import type {
  User,
  Workflow,
  LuaScript,
  PageConfig,
  AppConfiguration,
  Comment,
} from './level-types'
import type { ModelSchema } from './schema-types'

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
      await this.setCredential('god', await hashPassword('god123'))
      await this.setCredential('admin', await hashPassword('admin'))
      await this.setCredential('demo', await hashPassword('demo'))
      
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
      const oneHourFromNow = Date.now() + (60 * 60 * 1000)
      await this.setGodCredentialsExpiry(oneHourFromNow)
      return true
    }
    
    if (godPasswordChangeTime > expiry) {
      return false
    }
    
    return Date.now() < expiry
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
  }
}
