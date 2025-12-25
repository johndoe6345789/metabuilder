// Types
export type { 
  OperationType, 
  ResourceType, 
  AuditLog, 
  SecurityContext, 
  AccessRule 
} from './types'

// Core functions
export { ACCESS_RULES } from './access-rules'
export { checkAccess } from './check-access'
export { checkRateLimit } from './check-rate-limit'
export { clearRateLimit } from './clear-rate-limit'
export { clearAllRateLimits } from './clear-all-rate-limits'
export { sanitizeInput } from './sanitize-input'
export { logOperation } from './log-operation'
export { executeQuery } from './execute-query'

// Operations
export { getUsers } from './operations/get-users'
export { getUserById } from './operations/get-user-by-id'
export { createUser } from './operations/create-user'
export { updateUser } from './operations/update-user'
export { deleteUser } from './operations/delete-user'
export { verifyCredentials } from './operations/verify-credentials'
export { setCredential } from './operations/set-credential'
export { getAuditLogs } from './operations/get-audit-logs'
export { getWorkflows } from './operations/get-workflows'
export { getLuaScripts } from './operations/get-lua-scripts'
export { getPageConfigs } from './operations/get-page-configs'
export { getModelSchemas } from './operations/get-model-schemas'
export { getComments } from './operations/get-comments'
export { createComment } from './operations/create-comment'

// Import all for namespace class
import { ACCESS_RULES } from './access-rules'
import { checkAccess } from './check-access'
import { checkRateLimit } from './check-rate-limit'
import { clearRateLimit } from './clear-rate-limit'
import { clearAllRateLimits } from './clear-all-rate-limits'
import { sanitizeInput } from './sanitize-input'
import { logOperation } from './log-operation'
import { executeQuery } from './execute-query'
import { getUsers } from './operations/get-users'
import { getUserById } from './operations/get-user-by-id'
import { createUser } from './operations/create-user'
import { updateUser } from './operations/update-user'
import { deleteUser } from './operations/delete-user'
import { verifyCredentials } from './operations/verify-credentials'
import { setCredential } from './operations/set-credential'
import { getAuditLogs } from './operations/get-audit-logs'
import { getWorkflows } from './operations/get-workflows'
import { getLuaScripts } from './operations/get-lua-scripts'
import { getPageConfigs } from './operations/get-page-configs'
import { getModelSchemas } from './operations/get-model-schemas'
import { getComments } from './operations/get-comments'
import { createComment } from './operations/create-comment'

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
