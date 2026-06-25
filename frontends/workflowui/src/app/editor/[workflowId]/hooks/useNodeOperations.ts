/**
 * useNodeOperations - Composes node drag, CRUD, and connection
 * operations for the workflow editor canvas
 */

'use client';

import type { Workflow } from '@/../../../components/workflow-editor';
import type { DrawingConnection } from './useCanvasInteraction';
import { useNodeDrag } from './useNodeDrag';
import { useNodeConnections } from './useNodeConnections';

interface NodeOperationsParams {
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

export function useNodeOperations({
  workflow,
  setWorkflow,
  canvasOffset,
  zoom,
  draggingNodeId,
  setDraggingNodeId,
  dragOffset,
  setDragOffset,
  drawingConnection,
  setDrawingConnection,
  canvasRef,
}: NodeOperationsParams) {
  const drag = useNodeDrag({
    workflow,
    setWorkflow,
    canvasOffset,
    zoom,
    draggingNodeId,
    setDraggingNodeId,
    dragOffset,
    setDragOffset,
    canvasRef,
  });

  const connections = useNodeConnections({
    workflow,
    setWorkflow,
    drawingConnection,
    setDrawingConnection,
  });

  return {
    ...drag,
    ...connections,
  };
}
