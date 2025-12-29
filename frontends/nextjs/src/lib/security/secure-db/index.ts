// Types
export type { OperationType, ResourceType, AuditLog, SecurityContext, AccessRule } from './types'

// Core functions
export { ACCESS_RULES } from './query/access-rules'
export { checkAccess } from './query/check-access'
export { checkRateLimit } from './rate-limiting/check-rate-limit'
export { clearRateLimit } from './rate-limiting/clear-rate-limit'
export { clearAllRateLimits } from './rate-limiting/clear-all-rate-limits'
export { createLoginSecurityContext } from './login/create-login-security-context'
export { getLoginLockoutInfo } from './login/get-login-lockout-info'
export { sanitizeInput } from './login/sanitize-input'
export { logOperation } from './audit/log-operation'
export { executeQuery } from './operations/execute-query'

// Operations
export { getUsers } from './operations/user/get-users'
export { getUserById } from './operations/user/get-user-by-id'
export { createUser } from './operations/user/create-user'
export { updateUser } from './operations/user/update-user'
export { deleteUser } from './operations/user/delete-user'
export { verifyCredentials } from './operations/crud/verify-credentials'
export { setCredential } from './operations/crud/set-credential'
export { listAuditLogs as getAuditLogs } from './operations/audit-log-store'
export { getWorkflows } from './operations/getters/entities/get-workflows'
export { getLuaScripts } from './operations/getters/entities/get-lua-scripts'
export { getPageConfigs } from './operations/getters/entities/get-page-configs'
export { getModelSchemas } from './operations/getters/entities/get-model-schemas'
export { getComments } from './operations/getters/entities/get-comments'
export { createComment } from './operations/crud/create-comment'

// Import all for namespace class
import { ACCESS_RULES } from './query/access-rules'
import { checkAccess } from './query/check-access'
import { checkRateLimit } from './rate-limiting/check-rate-limit'
import { clearRateLimit } from './rate-limiting/clear-rate-limit'
import { clearAllRateLimits } from './rate-limiting/clear-all-rate-limits'
import { createLoginSecurityContext } from './login/create-login-security-context'
import { getLoginLockoutInfo } from './login/get-login-lockout-info'
import { sanitizeInput } from './login/sanitize-input'
import { logOperation } from './audit/log-operation'
import { executeQuery } from './operations/execute-query'
import { getUsers } from './operations/user/get-users'
import { getUserById } from './operations/user/get-user-by-id'
import { createUser } from './operations/user/create-user'
import { updateUser } from './operations/user/update-user'
import { deleteUser } from './operations/user/delete-user'
import { verifyCredentials } from './operations/crud/verify-credentials'
import { setCredential } from './operations/crud/set-credential'
import { getAuditLogs } from './operations/audit-log-store'
import { getWorkflows } from './operations/getters/entities/get-workflows'
import { getLuaScripts } from './operations/getters/entities/get-lua-scripts'
import { getPageConfigs } from './operations/getters/entities/get-page-configs'
import { getModelSchemas } from './operations/getters/entities/get-model-schemas'
import { getComments } from './operations/getters/entities/get-comments'
import { createComment } from './operations/crud/create-comment'

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
