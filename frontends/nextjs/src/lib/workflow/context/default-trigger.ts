/** The trigger a run gets when nothing supplied one. */

import type { WorkflowDefinition, WorkflowTrigger } from '@metabuilder/workflow'
import type { RequestContext } from './context-types'

export function buildDefaultTrigger(
  workflow: Pick<WorkflowDefinition, 'nodes'>,
  request: Pick<RequestContext, 'userId' | 'tenantId'>,
  startTime: number = Date.now()
): WorkflowTrigger {
  return {
    nodeId: workflow.nodes[0]?.id ?? 'trigger-0',
    kind: 'manual',
    enabled: true,
    metadata: {
      startTime,
      triggeredBy: 'api',
      userId: request.userId,
      tenantId: request.tenantId,
    },
  }
}
