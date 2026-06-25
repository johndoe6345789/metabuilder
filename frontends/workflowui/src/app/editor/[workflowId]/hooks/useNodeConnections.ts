/**
 * useNodeConnections - Node connection drawing and creation
 */

'use client';

import {
  type Position,
  type Workflow,
  generateConnectionId,
} from '@/../../../components/workflow-editor';
import type { DrawingConnection } from './useCanvasInteraction';

interface NodeConnectionsParams {
  workflow: Workflow;
  setWorkflow: React.Dispatch<React.SetStateAction<Workflow>>;
  drawingConnection: DrawingConnection | null;
  setDrawingConnection: (c: DrawingConnection | null) => void;
}

export function useNodeConnections({
  workflow,
  setWorkflow,
  drawingConnection,
  setDrawingConnection,
}: NodeConnectionsParams) {
  const handleConnectionStart = (
    nodeId: string,
    outputName: string,
    position: Position
  ) => {
    setDrawingConnection({
      sourceNodeId: nodeId,
      sourceOutput: outputName,
      startPosition: position,
      currentPosition: position,
    });
  };

  const handleConnectionEnd = (
    targetNodeId: string,
    targetInput: string
  ) => {
    if (
      !drawingConnection ||
      drawingConnection.sourceNodeId === targetNodeId
    ) {
      setDrawingConnection(null);
      return;
    }
    const isDuplicate = workflow.connections.some(
      (c) =>
        c.sourceNodeId === drawingConnection.sourceNodeId &&
        c.sourceOutput === drawingConnection.sourceOutput &&
        c.targetNodeId === targetNodeId &&
        c.targetInput === targetInput
    );
    if (isDuplicate) {
      setDrawingConnection(null);
      return;
    }
    setWorkflow((prev) => ({
      ...prev,
      connections: [
        ...prev.connections,
        {
          id: generateConnectionId(),
          sourceNodeId: drawingConnection.sourceNodeId,
          sourceOutput: drawingConnection.sourceOutput,
          targetNodeId,
          targetInput,
        },
      ],
      updatedAt: new Date().toISOString(),
    }));
    setDrawingConnection(null);
  };

  return {
    handleConnectionStart,
    handleConnectionEnd,
  };
}
