/** A workflow context, plus everything multi-tenancy adds to it. */

import type {
  CredentialRef,
  ExecutionLimits,
  WorkflowContext,
} from '@metabuilder/workflow'
import type { MultiTenantMetadata } from './context-types'

export interface ExtendedWorkflowContext extends WorkflowContext {
  multiTenant: MultiTenantMetadata
  requestMetadata?: {
    ipAddress?: string
    userAgent?: string
    originUrl?: string
    sessionId?: string
  }
  executionLimits: ExecutionLimits
  credentialBindings: Map<string, CredentialRef>
}
