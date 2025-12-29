// Types
export type { AccessRule, AuditLog, OperationType, ResourceType, SecurityContext } from './types'

// Core functions
export { logOperation } from './audit/log-operation'
export { createLoginSecurityContext } from './login/create-login-security-context'
export { getLoginLockoutInfo } from './login/get-login-lockout-info'
export { sanitizeInput } from './login/sanitize-input'
export { executeQuery } from './operations/execute-query'
export { ACCESS_RULES } from './query/access-rules'
export { checkAccess } from './query/check-access'
export { checkRateLimit } from './rate-limiting/check-rate-limit'
export { clearAllRateLimits } from './rate-limiting/clear-all-rate-limits'
export { clearRateLimit } from './rate-limiting/clear-rate-limit'

// Operations
export { listAuditLogs as getAuditLogs } from './operations/audit-log-store'
export { createComment } from './operations/crud/create-comment'
export { setCredential } from './operations/crud/set-credential'
export { verifyCredentials } from './operations/crud/verify-credentials'
export { getComments } from './operations/getters/entities/get-comments'
export { getLuaScripts } from './operations/getters/entities/get-lua-scripts'
export { getModelSchemas } from './operations/getters/entities/get-model-schemas'
export { getPageConfigs } from './operations/getters/entities/get-page-configs'
export { getWorkflows } from './operations/getters/entities/get-workflows'
export { createUser } from './operations/user/create-user'
export { deleteUser } from './operations/user/delete-user'
export { getUserById } from './operations/user/get-user-by-id'
export { getUsers } from './operations/user/get-users'
export { updateUser } from './operations/user/update-user'

// Import all for namespace class
import { logOperation } from './audit/log-operation'
import { createLoginSecurityContext } from './login/create-login-security-context'
import { getLoginLockoutInfo } from './login/get-login-lockout-info'
import { sanitizeInput } from './login/sanitize-input'
import { getAuditLogs } from './operations/audit-log-store'
import { createComment } from './operations/crud/create-comment'
import { setCredential } from './operations/crud/set-credential'
import { verifyCredentials } from './operations/crud/verify-credentials'
import { executeQuery } from './operations/execute-query'
import { getComments } from './operations/getters/entities/get-comments'
import { getLuaScripts } from './operations/getters/entities/get-lua-scripts'
import { getModelSchemas } from './operations/getters/entities/get-model-schemas'
import { getPageConfigs } from './operations/getters/entities/get-page-configs'
import { getWorkflows } from './operations/getters/entities/get-workflows'
import { createUser } from './operations/user/create-user'
import { deleteUser } from './operations/user/delete-user'
import { getUserById } from './operations/user/get-user-by-id'
import { getUsers } from './operations/user/get-users'
import { updateUser } from './operations/user/update-user'
import { ACCESS_RULES } from './query/access-rules'
import { checkAccess } from './query/check-access'
import { checkRateLimit } from './rate-limiting/check-rate-limit'
import { clearAllRateLimits } from './rate-limiting/clear-all-rate-limits'
import { clearRateLimit } from './rate-limiting/clear-rate-limit'

/**
 * SecureDatabase namespace class - groups all secure DB operations as static methods
 */
export class SecureDatabase {
  // Core
  static ACCESS_RULES = ACCESS_RULES
  static checkAccess = checkAccess
  static checkRateLimit = checkRateLimit
  static clearRateLimit = clearRateLimit
  static clearAllRateLimits = clearAllRateLimits
  static createLoginSecurityContext = createLoginSecurityContext
  static getLoginLockoutInfo = getLoginLockoutInfo
  static sanitizeInput = sanitizeInput
  static logOperation = logOperation
  static executeQuery = executeQuery

  // Operations
  static getUsers = getUsers
  static getUserById = getUserById
  static createUser = createUser
  static updateUser = updateUser
  static deleteUser = deleteUser
  static verifyCredentials = verifyCredentials
  static setCredential = setCredential
  static getAuditLogs = getAuditLogs
  static getWorkflows = getWorkflows
  static getLuaScripts = getLuaScripts
  static getPageConfigs = getPageConfigs
  static getModelSchemas = getModelSchemas
  static getComments = getComments
  static createComment = createComment
}
