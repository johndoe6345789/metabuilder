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
  name?: string
  type: string
  parentId?: string
  childIds?: string[]
  order?: number
  pageId?: string
}

/**
 * Component configuration
 */
export interface ComponentConfig {
  id: string
  componentId: string
  props: Record<string, unknown>
  styles: Record<string, unknown>
  events?: Record<string, string>
  conditionalRendering?: {
    condition: string
  }
}

import type {
  AppConfiguration,
  Comment,
  PageConfig,
  PowerTransferRequest,
  Tenant,
  User,
  Workflow,
} from '../../types/level-types'
import type { ModelSchema } from '../../types/schema-types'
import type { SMTPConfig } from '../password'

/**
 * Full database schema type
 */
export interface DatabaseSchema {
  users: User[]
  credentials: Record<string, string>
  workflows: Workflow[]
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

/**
 * Database keys enum
 */
export const DB_KEYS = {
  USERS: 'db_users',
  CREDENTIALS: 'db_credentials',
  WORKFLOWS: 'db_workflows',
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
