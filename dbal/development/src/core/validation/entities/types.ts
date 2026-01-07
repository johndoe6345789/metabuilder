/**
 * @file types.ts
 * @description Entity validation types
 */

import type {
  User,
  Credential,
  Session,
  PageConfig,
  ComponentNode,
  Workflow,
  LuaScript,
  InstalledPackage,
  PackageData,
  Tenant,
  ModelSchema,
  AppConfiguration,
  SystemConfig,
  SMTPConfig,
  CssCategory,
  DropdownConfig,
  Comment,
  ErrorLog,
  PowerTransferRequest,
} from '../../foundation/types'

export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

export type {
  User,
  Credential,
  Session,
  PageConfig,
  ComponentNode,
  Workflow,
  LuaScript,
  InstalledPackage,
  PackageData,
  Tenant,
  ModelSchema,
  AppConfiguration,
  SystemConfig,
  SMTPConfig,
  CssCategory,
  DropdownConfig,
  Comment,
  ErrorLog,
  PowerTransferRequest,
}
