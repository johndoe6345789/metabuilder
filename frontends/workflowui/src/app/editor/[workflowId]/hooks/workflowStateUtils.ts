/**
 * workflowStateUtils - Factory functions for useWorkflowState
 */

import type { Workflow } from '@metabuilder/components/workflow-editor';

export function defaultWorkflow(id: string): Workflow {
  return {
    id: id || 'new',
    name: 'My Workflow',
    description: '',
    nodes: [
      {
        id: 'node_1',
        type: 'trigger.manual',
        name: 'Start',
        position: { x: 100, y: 200 },
        config: {},
        inputs: [],
        outputs: ['main'],
      },
    ],
    connections: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function buildSavePayload(workflow: Workflow) {
  return {
    name: workflow.name,
    description: workflow.description,
    version: '1.0.0',
    category: 'custom',
    status: 'draft' as const,
    nodes: workflow.nodes,
    connections: {},
    metadata: {},
  };
}
