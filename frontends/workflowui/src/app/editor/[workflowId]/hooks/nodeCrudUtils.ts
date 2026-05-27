/** nodeCrudUtils - Pure workflow node mutation helpers */

import type { Workflow } from '@/../../../../../components/workflow-editor';

type SetWorkflow = React.Dispatch<
  React.SetStateAction<Workflow>
>;

function stamp(prev: Workflow): Workflow {
  return { ...prev, updatedAt: new Date().toISOString() };
}

export function updateNodeConfig(
  setWorkflow: SetWorkflow,
  nodeId: string,
  config: Record<string, unknown>
) {
  setWorkflow((prev) => ({
    ...stamp(prev),
    nodes: prev.nodes.map((n) =>
      n.id === nodeId ? { ...n, config } : n
    ),
  }));
}

export function updateNodeName(
  setWorkflow: SetWorkflow,
  nodeId: string,
  name: string
) {
  setWorkflow((prev) => ({
    ...stamp(prev),
    nodes: prev.nodes.map((n) =>
      n.id === nodeId ? { ...n, name } : n
    ),
  }));
}

export function deleteNode(
  setWorkflow: SetWorkflow,
  nodeId: string,
  setSelectedNodeId: (id: string | null) => void
) {
  setWorkflow((prev) => ({
    ...stamp(prev),
    nodes: prev.nodes.filter((n) => n.id !== nodeId),
    connections: prev.connections.filter(
      (c) =>
        c.sourceNodeId !== nodeId &&
        c.targetNodeId !== nodeId
    ),
  }));
  setSelectedNodeId(null);
}
