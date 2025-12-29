import { initializeDatabase } from './initialize-database'
import { hashPassword } from '../password/hash-password'
import { verifyPassword } from '../password/verify-password'
import * as auth from '../auth'
import * as users from '../users'
import * as credentials from '../credentials'
import * as sessions from '../sessions'
import * as workflows from '../workflows'
import * as luaScripts from '../lua-scripts'
import * as pages from '../pages'
import * as schemas from '../schemas'
import * as comments from '../comments'
import * as appConfig from '../app-config'
import * as systemConfig from '../system-config'
import * as components from '../components'
import * as cssClasses from '../css-classes'
import * as dropdownConfigs from '../dropdown-configs'
import * as tenants from '../tenants'
import * as packages from '../packages'
import * as powerTransfers from '../power-transfers'
import * as smtpConfig from '../smtp-config'
import * as godCredentials from '../god-credentials'
import * as databaseAdmin from '../database-admin'
import * as errorLogs from '../error-logs'

export { initializeDatabase, hashPassword, verifyPassword }

/**
 * Database namespace class - groups all DB operations as static methods
 * No instance state - pure function container for backward compatibility
 */
export class Database {
  // Core
  static initializeDatabase = initializeDatabase
  static hashPassword = hashPassword
  static verifyPassword = verifyPassword

  // Auth
  static authenticateUser = auth.authenticateUser
  static getUserByUsername = auth.getUserByUsername
  static getUserByEmail = auth.getUserByEmail

  // Users
  static getUsers = users.getUsers
  static getUserById = users.getUserById
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

  // Sessions
  static createSession = sessions.createSession
  static getSessionById = sessions.getSessionById
  static getSessionByToken = sessions.getSessionByToken
  static updateSession = sessions.updateSession
  static deleteSession = sessions.deleteSession
  static deleteSessionByToken = sessions.deleteSessionByToken
  static listSessions = sessions.listSessions

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

  // System Config
  static getSystemConfigValue = systemConfig.getSystemConfigValue

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

  // CSS Classes
  static getCssClasses = cssClasses.getCssClasses
  static setCssClasses = cssClasses.setCssClasses
  static addCssCategory = cssClasses.addCssCategory
  static updateCssCategory = cssClasses.updateCssCategory
  static deleteCssCategory = cssClasses.deleteCssCategory

  // Dropdown Configs
  static getDropdownConfigs = dropdownConfigs.getDropdownConfigs
  static setDropdownConfigs = dropdownConfigs.setDropdownConfigs
  static addDropdownConfig = dropdownConfigs.addDropdownConfig
  static updateDropdownConfig = dropdownConfigs.updateDropdownConfig
  static deleteDropdownConfig = dropdownConfigs.deleteDropdownConfig

  // Tenants
  static getTenants = tenants.getTenants
  static setTenants = tenants.setTenants
  static addTenant = tenants.addTenant
  static updateTenant = tenants.updateTenant
  static deleteTenant = tenants.deleteTenant

  // Packages
  static getInstalledPackages = packages.getInstalledPackages
  static setInstalledPackages = packages.setInstalledPackages
  static installPackage = packages.installPackage
  static uninstallPackage = packages.uninstallPackage
  static togglePackageEnabled = packages.togglePackageEnabled
  static getPackageData = packages.getPackageData
  static setPackageData = packages.setPackageData
  static deletePackageData = packages.deletePackageData

  // Power Transfers
  static getPowerTransferRequests = powerTransfers.getPowerTransferRequests
  static setPowerTransferRequests = powerTransfers.setPowerTransferRequests
  static addPowerTransferRequest = powerTransfers.addPowerTransferRequest
  static updatePowerTransferRequest = powerTransfers.updatePowerTransferRequest
  static deletePowerTransferRequest = powerTransfers.deletePowerTransferRequest

  // SMTP Config
  static getSMTPConfig = smtpConfig.getSMTPConfig
  static setSMTPConfig = smtpConfig.setSMTPConfig

  // God Credentials
  static getGodCredentialsExpiry = godCredentials.getGodCredentialsExpiry
  static setGodCredentialsExpiry = godCredentials.setGodCredentialsExpiry
  static getFirstLoginFlags = godCredentials.getFirstLoginFlags
  static setFirstLoginFlag = godCredentials.setFirstLoginFlag
  static getGodCredentialsExpiryDuration = godCredentials.getGodCredentialsExpiryDuration
  static setGodCredentialsExpiryDuration = godCredentials.setGodCredentialsExpiryDuration
  static shouldShowGodCredentials = godCredentials.shouldShowGodCredentials
  static resetGodCredentialsExpiry = godCredentials.resetGodCredentialsExpiry

  // Database Admin
  static clearDatabase = databaseAdmin.clearDatabase
  static exportDatabase = databaseAdmin.exportDatabase
  static importDatabase = databaseAdmin.importDatabase
  static seedDefaultData = databaseAdmin.seedDefaultData

  // Error Logs
  static getErrorLogs = errorLogs.getErrorLogs
  static addErrorLog = errorLogs.addErrorLog
  static updateErrorLog = errorLogs.updateErrorLog
  static deleteErrorLog = errorLogs.deleteErrorLog
  static clearErrorLogs = errorLogs.clearErrorLogs
}
