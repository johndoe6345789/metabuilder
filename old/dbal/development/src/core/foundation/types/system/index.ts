export interface Tenant {
  id: string
  name: string
  slug: string
  ownerId: string
  createdAt: bigint
  homepageConfig?: string | null
  settings?: string | null
}

export interface CreateTenantInput {
  id?: string
  name: string
  slug: string
  ownerId: string
  createdAt?: bigint
  homepageConfig?: string | null
  settings?: string | null
}

export interface UpdateTenantInput {
  name?: string
  slug?: string
  ownerId?: string
  createdAt?: bigint
  homepageConfig?: string | null
  settings?: string | null
}

export interface ModelSchema {
  id: string
  tenantId?: string | null
  name: string
  label?: string | null
  labelPlural?: string | null
  icon?: string | null
  fields: string
  listDisplay?: string | null
  listFilter?: string | null
  searchFields?: string | null
  ordering?: string | null
  validations?: string | null
  hooks?: string | null
}

export interface CreateModelSchemaInput {
  id?: string
  tenantId?: string | null
  name: string
  label?: string | null
  labelPlural?: string | null
  icon?: string | null
  fields: string
  listDisplay?: string | null
  listFilter?: string | null
  searchFields?: string | null
  ordering?: string | null
  validations?: string | null
  hooks?: string | null
}

export interface UpdateModelSchemaInput {
  tenantId?: string | null
  name?: string
  label?: string | null
  labelPlural?: string | null
  icon?: string | null
  fields?: string
  listDisplay?: string | null
  listFilter?: string | null
  searchFields?: string | null
  ordering?: string | null
  validations?: string | null
  hooks?: string | null
}

export interface AppConfiguration {
  id: string
  name: string
  schemas: string
  workflows: string
  pages: string
  theme: string
}

export interface CreateAppConfigurationInput {
  id?: string
  name: string
  schemas: string
  workflows: string
  pages: string
  theme: string
}

export interface UpdateAppConfigurationInput {
  name?: string
  schemas?: string
  workflows?: string
  pages?: string
  theme?: string
}

export interface SystemConfig {
  key: string
  value: string
}

export interface CreateSystemConfigInput {
  key: string
  value: string
}

export interface UpdateSystemConfigInput {
  value?: string
}

export interface SMTPConfig {
  id: string
  host: string
  port: number
  secure: boolean
  username: string
  password: string
  fromEmail: string
  fromName: string
}

export interface CreateSMTPConfigInput {
  id?: string
  host: string
  port: number
  secure: boolean
  username: string
  password: string
  fromEmail: string
  fromName: string
}

export interface UpdateSMTPConfigInput {
  host?: string
  port?: number
  secure?: boolean
  username?: string
  password?: string
  fromEmail?: string
  fromName?: string
}

export interface CssCategory {
  id: string
  name: string
  classes: string
}

export interface CreateCssCategoryInput {
  id?: string
  name: string
  classes: string
}

export interface UpdateCssCategoryInput {
  name?: string
  classes?: string
}

export interface DropdownConfig {
  id: string
  name: string
  label: string
  options: string
}

export interface CreateDropdownConfigInput {
  id?: string
  name: string
  label: string
  options: string
}

export interface UpdateDropdownConfigInput {
  name?: string
  label?: string
  options?: string
}

export interface Comment {
  id: string
  tenantId?: string | null
  userId: string
  content: string
  createdAt: bigint
  updatedAt?: bigint | null
  parentId?: string | null
  entityType?: string | null
  entityId?: string | null
}

export interface CreateCommentInput {
  id?: string
  tenantId?: string | null
  userId: string
  content: string
  createdAt?: bigint
  updatedAt?: bigint | null
  parentId?: string | null
  entityType?: string | null
  entityId?: string | null
}

export interface UpdateCommentInput {
  tenantId?: string | null
  userId?: string
  content?: string
  createdAt?: bigint
  updatedAt?: bigint | null
  parentId?: string | null
  entityType?: string | null
  entityId?: string | null
}

export interface ErrorLog {
  id: string
  timestamp: bigint
  level: string
  message: string
  stack?: string | null
  context?: string | null
  userId?: string | null
  username?: string | null
  tenantId?: string | null
  source?: string | null
  resolved: boolean
  resolvedAt?: bigint | null
  resolvedBy?: string | null
}

export interface CreateErrorLogInput {
  id?: string
  timestamp: bigint
  level: string
  message: string
  stack?: string | null
  context?: string | null
  userId?: string | null
  username?: string | null
  tenantId?: string | null
  source?: string | null
  resolved?: boolean
  resolvedAt?: bigint | null
  resolvedBy?: string | null
}

export interface UpdateErrorLogInput {
  timestamp?: bigint
  level?: string
  message?: string
  stack?: string | null
  context?: string | null
  userId?: string | null
  username?: string | null
  tenantId?: string | null
  source?: string | null
  resolved?: boolean
  resolvedAt?: bigint | null
  resolvedBy?: string | null
}

export interface PowerTransferRequest {
  id: string
  fromUserId: string
  toUserId: string
  status: string
  createdAt: bigint
  expiresAt: bigint
}

export interface CreatePowerTransferRequestInput {
  id?: string
  fromUserId: string
  toUserId: string
  status: string
  createdAt?: bigint
  expiresAt: bigint
}

export interface UpdatePowerTransferRequestInput {
  fromUserId?: string
  toUserId?: string
  status?: string
  createdAt?: bigint
  expiresAt?: bigint
}
