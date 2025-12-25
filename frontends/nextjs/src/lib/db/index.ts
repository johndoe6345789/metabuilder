// Types
export type { CssCategory, DropdownConfig, DatabaseSchema, ComponentNode, ComponentConfig } from './types'

// DBAL Client
export { getAdapter, closeAdapter } from './dbal-client'
export type { DBALAdapter, ListOptions, ListResult } from './dbal-client'

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
export * from './comments'
export * from './app-config'
export * from './components'

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
import * as comments from './comments'
import * as appConfig from './app-config'
import * as components from './components'

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

  // Comments
  static getComments = comments.getComments
  static setComments = comments.setComments
  static addComment = comments.addComment
  static updateComment = comments.updateComment
  static deleteComment = comments.deleteComment

  // App Config
  static getAppConfig = appConfig.getAppConfig
  static setAppConfig = appConfig.setAppConfig

  // Components
  static getComponentHierarchy = components.getComponentHierarchy
  static setComponentHierarchy = components.setComponentHierarchy
  static addComponentNode = components.addComponentNode
  static updateComponentNode = components.updateComponentNode
  static deleteComponentNode = components.deleteComponentNode
  static getComponentConfigs = components.getComponentConfigs
  static setComponentConfigs = components.setComponentConfigs
  static addComponentConfig = components.addComponentConfig
  static updateComponentConfig = components.updateComponentConfig
  static deleteComponentConfig = components.deleteComponentConfig
}
