/**
 * useNodeDragMove - Mouse move and end handlers for node dragging
 */

'use client';

import { useCallback, type MouseEvent } from 'react';
import type { Workflow } from '@metabuilder/components/workflow-editor';

interface NodeDragMoveParams {
  draggingNodeId: string | null;
  dragOffset: { x: number; y: number };
  canvasOffset: { x: number; y: number };
  zoom: number;
  setWorkflow: React.Dispatch<React.SetStateAction<Workflow>>;
  setDraggingNodeId: (id: string | null) => void;
}

export function useNodeDragMove({
  draggingNodeId,
  dragOffset,
  canvasOffset,
  zoom,
  setWorkflow,
  setDraggingNodeId,
}: NodeDragMoveParams) {
  const handleNodeDragMove = useCallback(
    (e: MouseEvent) => {
      if (!draggingNodeId) return;
      const newX =
        (e.clientX - dragOffset.x - canvasOffset.x) / zoom;
      const newY =
        (e.clientY - dragOffset.y - canvasOffset.y) / zoom;
      setWorkflow((prev) => ({
        ...prev,
        nodes: prev.nodes.map((n) =>
          n.id === draggingNodeId
            ? { ...n, position: { x: newX, y: newY } }
            : n
        ),
      }));
    },
    [
      draggingNodeId,
      dragOffset,
      canvasOffset,
      zoom,
      setWorkflow,
    ]
  );

  const handleNodeDragEnd = useCallback(() => {
    setDraggingNodeId(null);
  }, [setDraggingNodeId]);

  return { handleNodeDragMove, handleNodeDragEnd };
}
