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
}
