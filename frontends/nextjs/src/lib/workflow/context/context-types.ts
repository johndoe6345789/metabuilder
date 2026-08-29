/**
 * The shapes a multi-tenant workflow context is built from.
 *
 * Kept apart from the builder so the contract can be read on its own, and
 * so the helper modules that make each piece can import the types without
 * importing the builder.
 */

export type { ExtendedWorkflowContext } from './extended-context'
export type {
  ContextErrorCode,
  ContextValidationError,
  ContextValidationResult,
  ContextValidationWarning,
} from './validation-types'

/**
 * Who is asking, extracted from a verified session.
 *
 * `userLevel` is the workflow scale, 1..4: 1=viewer, 2=editor, 3=admin,
 * 4=super-admin. It is deliberately narrower than the app's own 0..5 role
 * ladder -- see `toWorkflowLevel`.
 */
export interface RequestContext {
  tenantId: string
  userId: string
  userEmail: string
  userLevel: number
  ipAddress?: string
  userAgent?: string
  originUrl?: string
  apiKey?: string
  sessionId?: string
}

export type ExecutionMode =
  | 'manual'
  | 'scheduled'
  | 'webhook'
  | 'api'
  | 'embedded'

/** Safety enforcement and audit information attached to every context. */
export interface MultiTenantMetadata {
  enforced: boolean
  tenantId: string
  userId: string
  userLevel: number
  userEmail: string
  requestedAt: string
  ipAddress?: string
  userAgent?: string
  sessionId?: string
  executionMode: ExecutionMode
}

export interface ContextBuilderOptions {
  allowCrossTenantAccess?: boolean
  enforceCredentialValidation?: boolean
  enforceSecretEncryption?: boolean
  captureRequestData?: boolean
  enableAuditLogging?: boolean
}

/** Trigger/variable data handed to the builder. */
export type DataRecord = Record<string, unknown>

export interface ContextRequestData {
  triggerData?: DataRecord
  variables?: DataRecord
  request?: unknown
  secrets?: Record<string, string>
}
