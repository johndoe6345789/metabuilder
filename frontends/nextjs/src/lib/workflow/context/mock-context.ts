/** A context for tests and previews, with nothing to validate against. */

import { v4 as uuidv4 } from 'uuid'
import type { WorkflowDefinition } from '@metabuilder/workflow'
import type {
  ExtendedWorkflowContext,
  RequestContext,
} from './context-types'
import { defaultExecutionLimits } from './execution-limits'

export function createMockContext(
  workflow: WorkflowDefinition,
  overrides?: Partial<RequestContext>
): ExtendedWorkflowContext {
  const request: RequestContext = {
    tenantId: workflow.tenantId,
    userId: 'test-user-123',
    userEmail: 'test@example.com',
    userLevel: 2,
    ipAddress: '127.0.0.1',
    userAgent: 'Test Client',
    ...overrides,
  }

  return {
    executionId: uuidv4(),
    tenantId: request.tenantId,
    userId: request.userId,
    user: {
      id: request.userId,
      email: request.userEmail,
      level: request.userLevel,
    },
    trigger: {
      nodeId: workflow.nodes[0]?.id ?? 'trigger',
      kind: 'manual',
      enabled: true,
      metadata: {},
    },
    triggerData: {},
    variables: {},
    secrets: {},
    multiTenant: {
      enforced: true,
      tenantId: request.tenantId,
      userId: request.userId,
      userLevel: request.userLevel,
      userEmail: request.userEmail,
      requestedAt: new Date().toISOString(),
      executionMode: 'manual',
    },
    requestMetadata: {
      ipAddress: request.ipAddress,
      userAgent: request.userAgent,
    },
    executionLimits: defaultExecutionLimits(),
    credentialBindings: new Map(),
  }
}
