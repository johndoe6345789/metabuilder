/**
 * CSS category configuration
 */
export interface CssCategory {
  name: string
  classes: string[]
}

/**
 * Dropdown configuration
 */
export interface DropdownConfig {
  id: string
  name: string
  label: string
  options: Array<{ value: string; label: string }>
}

/**
 * Component node in hierarchy
 */
export interface ComponentNode {
  id: string
  type: string
  parentId?: string
  childIds: string[]
  order: number
  pageId: string
}

/**
 * Component configuration
 */
export interface ComponentConfig {
  id: string
  componentId: string
  props: Record<string, unknown>
  styles: Record<string, unknown>
  events: Record<string, string>
  conditionalRendering?: {
    condition: string
    luaScriptId?: string
  }
}

/**
 * Full database schema type
 */
export interface DatabaseSchema {
  users: import('../types/level-types').User[]
  credentials: Record<string, string>
  workflows: import('../types/level-types').Workflow[]
  luaScripts: import('../types/level-types').LuaScript[]
  pages: import('../types/level-types').PageConfig[]
  schemas: import('../types/schema-types').ModelSchema[]
  appConfig: import('../types/level-types').AppConfiguration
  comments: import('../types/level-types').Comment[]
  componentHierarchy: Record<string, ComponentNode>
  componentConfigs: Record<string, ComponentConfig>
  godCredentialsExpiry: number
  passwordChangeTimestamps: Record<string, number>
  firstLoginFlags: Record<string, boolean>
  godCredentialsExpiryDuration: number
  cssClasses: CssCategory[]
  dropdownConfigs: DropdownConfig[]
  tenants: import('../types/level-types').Tenant[]
  powerTransferRequests: import('../types/level-types').PowerTransferRequest[]
  smtpConfig: import('../password').SMTPConfig
  passwordResetTokens: Record<string, string>
}

/**
 * Database keys enum
 */
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
