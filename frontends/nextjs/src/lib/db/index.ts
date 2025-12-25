// Types
export type { CssCategory, DropdownConfig, DatabaseSchema, ComponentNode, ComponentConfig } from './types'

// Core
export { hashPassword } from './hash-password'
export { verifyPassword } from './verify-password'
export { initializeDatabase } from './initialize-database'

// Domain re-exports
export * from './users'
export * from './credentials'
export * from './workflows'
export * from './lua-scripts'
export * from './pages'
export * from './schemas'

// Import all for namespace class
import { initializeDatabase } from './initialize-database'
import { hashPassword } from './hash-password'
import { verifyPassword } from './verify-password'
import * as users from './users'
import * as credentials from './credentials'
import * as workflows from './workflows'
import * as luaScripts from './lua-scripts'
import * as pages from './pages'
import * as schemas from './schemas'

/**
 * Database namespace class - groups all DB operations as static methods
 * No instance state - pure function container for backward compatibility
 */
export class Database {
  // Core
  static initializeDatabase = initializeDatabase
  static hashPassword = hashPassword
  static verifyPassword = verifyPassword

  // Users
  static getUsers = users.getUsers
  static setUsers = users.setUsers
  static addUser = users.addUser
  static updateUser = users.updateUser
  static deleteUser = users.deleteUser
  static getSuperGod = users.getSuperGod
  static transferSuperGodPower = users.transferSuperGodPower

  // Credentials
  static getCredentials = credentials.getCredentials
  static setCredential = credentials.setCredential
  static verifyCredentials = credentials.verifyCredentials
  static getPasswordChangeTimestamps = credentials.getPasswordChangeTimestamps
  static setPasswordChangeTimestamps = credentials.setPasswordChangeTimestamps
  static getPasswordResetTokens = credentials.getPasswordResetTokens
  static setPasswordResetToken = credentials.setPasswordResetToken
  static deletePasswordResetToken = credentials.deletePasswordResetToken

  // Workflows
  static getWorkflows = workflows.getWorkflows
  static setWorkflows = workflows.setWorkflows
  static addWorkflow = workflows.addWorkflow
  static updateWorkflow = workflows.updateWorkflow
  static deleteWorkflow = workflows.deleteWorkflow

  // Lua Scripts
  static getLuaScripts = luaScripts.getLuaScripts
  static setLuaScripts = luaScripts.setLuaScripts
  static addLuaScript = luaScripts.addLuaScript
  static updateLuaScript = luaScripts.updateLuaScript
  static deleteLuaScript = luaScripts.deleteLuaScript

  // Pages
  static getPages = pages.getPages
  static setPages = pages.setPages
  static addPage = pages.addPage
  static updatePage = pages.updatePage
  static deletePage = pages.deletePage

  // Schemas
  static getSchemas = schemas.getSchemas
  static setSchemas = schemas.setSchemas
  static addSchema = schemas.addSchema
  static updateSchema = schemas.updateSchema
  static deleteSchema = schemas.deleteSchema
}
