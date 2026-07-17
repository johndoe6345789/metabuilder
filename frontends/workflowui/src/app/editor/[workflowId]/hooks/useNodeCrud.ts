/** useNodeCrud - Node creation via canvas drop and CRUD operations */

'use client';

import {
  type NodeType,
  type WorkflowNode,
  type Workflow,
  generateNodeId,
} from '@metabuilder/components/workflow-editor';
import {
  updateNodeConfig,
  updateNodeName,
  deleteNode,
} from './nodeCrudUtils';

interface NodeCrudParams {
  workflow: Workflow;
  setWorkflow: React.Dispatch<React.SetStateAction<Workflow>>;
  canvasOffset: { x: number; y: number };
  zoom: number;
  canvasRef: React.RefObject<HTMLDivElement>;
  setSelectedNodeId: (id: string | null) => void;
}

export function useNodeCrud({
  workflow, setWorkflow, canvasOffset, zoom,
  canvasRef, setSelectedNodeId,
}: NodeCrudParams) {
  const handleCanvasDrop = (
    e: React.DragEvent<HTMLDivElement>
  ) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('nodeType');
    if (!data) return;
    const nodeType: NodeType = JSON.parse(data);
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left - canvasOffset.x) / zoom;
    const y = (e.clientY - rect.top - canvasOffset.y) / zoom;
    const newNode: WorkflowNode = {
      id: generateNodeId(),
      type: nodeType.id,
      name: nodeType.name,
      position: { x, y },
      config: { ...nodeType.defaultConfig },
      inputs: [...nodeType.inputs],
      outputs: [...nodeType.outputs],
    };
    setWorkflow((prev) => ({
      ...prev,
      nodes: [...prev.nodes, newNode],
      updatedAt: new Date().toISOString(),
    }));
    setSelectedNodeId(newNode.id);
  };

  return {
    handleCanvasDrop,
    handleUpdateConfig: (
      id: string, config: Record<string, unknown>
    ) => updateNodeConfig(setWorkflow, id, config),
    handleUpdateName: (id: string, name: string) =>
      updateNodeName(setWorkflow, id, name),
    handleDeleteNode: (id: string) =>
      deleteNode(setWorkflow, id, setSelectedNodeId),
  };
}
