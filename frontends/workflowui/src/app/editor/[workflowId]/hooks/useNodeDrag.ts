/** useNodeDrag - Node drag and selection state */

'use client';

import { useState, type MouseEvent } from 'react';
import type { Workflow } from '@metabuilder/components/workflow-editor';
import type { DrawingConnection } from './useCanvasInteraction';
import { useNodeCrud } from './useNodeCrud';
import { useNodeDragMove } from './useNodeDragMove';

interface NodeDragParams {
  workflow: Workflow;
  setWorkflow: React.Dispatch<React.SetStateAction<Workflow>>;
  canvasOffset: { x: number; y: number };
  zoom: number;
  draggingNodeId: string | null;
  setDraggingNodeId: (id: string | null) => void;
  dragOffset: { x: number; y: number };
  setDragOffset: (offset: { x: number; y: number }) => void;
  drawingConnection: DrawingConnection | null;
  setDrawingConnection: (c: DrawingConnection | null) => void;
  canvasRef: React.RefObject<HTMLDivElement>;
}

export function useNodeDrag({
  workflow, setWorkflow, canvasOffset, zoom,
  draggingNodeId, setDraggingNodeId,
  dragOffset, setDragOffset, canvasRef,
}: NodeDragParams) {
  const [selectedNodeId, setSelectedNodeId] = useState<
    string | null
  >(null);
  const [propertiesDialogOpen, setPropertiesDialogOpen] =
    useState(false);

  const selectedNode =
    workflow.nodes.find((n) => n.id === selectedNodeId) || null;

  const crud = useNodeCrud({
    workflow, setWorkflow, canvasOffset, zoom,
    canvasRef, setSelectedNodeId,
  });

  const { handleNodeDragMove, handleNodeDragEnd } =
    useNodeDragMove({
      draggingNodeId, dragOffset, canvasOffset, zoom,
      setWorkflow, setDraggingNodeId,
    });

  const handleNodeSelect = (nodeId: string) =>
    setSelectedNodeId(nodeId);

  const handleNodeDoubleClick = (nodeId: string) => {
    setSelectedNodeId(nodeId);
    setPropertiesDialogOpen(true);
  };

  const handleNodeDragStart = (
    e: MouseEvent, nodeId: string
  ) => {
    const node = workflow.nodes.find((n) => n.id === nodeId);
    if (!node) return;
    setDraggingNodeId(nodeId);
    setDragOffset({
      x: e.clientX - node.position.x * zoom - canvasOffset.x,
      y: e.clientY - node.position.y * zoom - canvasOffset.y,
    });
  };

  return {
    selectedNodeId, setSelectedNodeId,
    selectedNode, propertiesDialogOpen,
    setPropertiesDialogOpen, handleNodeSelect,
    handleNodeDoubleClick, handleNodeDragStart,
    handleNodeDragMove, handleNodeDragEnd,
    ...crud,
  };
}
