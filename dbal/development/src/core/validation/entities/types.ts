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
} from '../../foundation/types'

export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

export type { User, Credential, Session, PageConfig, ComponentNode, Workflow, LuaScript, InstalledPackage, PackageData }
