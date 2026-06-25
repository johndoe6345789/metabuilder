/**
 * useWorkflowConnections Hook
 * Manages workflow connections between nodes
 */

import { useState, useCallback } from 'react';

export interface Position {
  x: number;
  y: number;
}

export interface Connection {
  id: string;
  sourceNodeId: string;
  sourceOutput: string;
  targetNodeId: string;
  targetInput: string;
}

export interface DrawingConnection {
  sourceNodeId: string;
  sourceOutput: string;
  startPosition: Position;
  currentPosition: Position;
}

export interface UseWorkflowConnectionsReturn {
  // State
  connections: Connection[];
  drawingConnection: DrawingConnection | null;
  isDrawing: boolean;

  // Connection CRUD
  addConnection: (connection: Connection) => boolean;
  removeConnection: (connectionId: string) => void;
  removeConnectionByEndpoints: (sourceNodeId: string, targetNodeId: string) => void;
  setConnections: (connections: Connection[]) => void;

  // Connection drawing
  startDrawing: (sourceNodeId: string, sourceOutput: string, startPosition: Position) => void;
  updateDrawing: (currentPosition: Position) => void;
  endDrawing: () => void;
  cancelDrawing: () => void;
  completeConnection: (targetNodeId: string, targetInput: string) => boolean;

  // Query
  getNodeConnections: (nodeId: string) => Connection[];
  getOutgoingConnections: (nodeId: string) => Connection[];
  getIncomingConnections: (nodeId: string) => Connection[];
  hasConnection: (sourceNodeId: string, sourceOutput: string, targetNodeId: string, targetInput: string) => boolean;

  // Cleanup
  removeNodeConnections: (nodeId: string) => void;
}

export interface UseWorkflowConnectionsOptions {
  initialConnections?: Connection[];
  onConnectionsChange?: (connections: Connection[]) => void;
  generateConnectionId?: () => string;
}

let connectionCounter = 0;
const defaultGenerateConnectionId = () => `conn_${++connectionCounter}_${Date.now()}`;

export function useWorkflowConnections(
  options: UseWorkflowConnectionsOptions = {}
): UseWorkflowConnectionsReturn {
  const {
    initialConnections = [],
    onConnectionsChange,
    generateConnectionId = defaultGenerateConnectionId,
  } = options;

  const [connections, setConnectionsState] = useState<Connection[]>(initialConnections);
  const [drawingConnection, setDrawingConnection] = useState<DrawingConnection | null>(null);

  // Internal helper to update connections and notify
  const updateConnections = useCallback(
    (updater: (prev: Connection[]) => Connection[]) => {
      setConnectionsState((prev) => {
        const next = updater(prev);
        onConnectionsChange?.(next);
        return next;
      });
    },
    [onConnectionsChange]
  );

  // Check if connection exists
  const hasConnection = useCallback(
    (sourceNodeId: string, sourceOutput: string, targetNodeId: string, targetInput: string) =>
      connections.some(
        (c) =>
          c.sourceNodeId === sourceNodeId &&
          c.sourceOutput === sourceOutput &&
          c.targetNodeId === targetNodeId &&
          c.targetInput === targetInput
      ),
    [connections]
  );

  // Connection CRUD
  const addConnection = useCallback(
    (connection: Connection): boolean => {
      // Prevent self-connection
      if (connection.sourceNodeId === connection.targetNodeId) {
        return false;
      }

      // Prevent duplicates
      if (
        hasConnection(
          connection.sourceNodeId,
          connection.sourceOutput,
          connection.targetNodeId,
          connection.targetInput
        )
      ) {
        return false;
      }

      updateConnections((prev) => [...prev, connection]);
      return true;
    },
    [hasConnection, updateConnections]
  );

  const removeConnection = useCallback(
    (connectionId: string) => {
      updateConnections((prev) => prev.filter((c) => c.id !== connectionId));
    },
    [updateConnections]
  );

  const removeConnectionByEndpoints = useCallback(
    (sourceNodeId: string, targetNodeId: string) => {
      updateConnections((prev) =>
        prev.filter((c) => !(c.sourceNodeId === sourceNodeId && c.targetNodeId === targetNodeId))
      );
    },
    [updateConnections]
  );

  const setConnections = useCallback(
    (newConnections: Connection[]) => {
      setConnectionsState(newConnections);
      onConnectionsChange?.(newConnections);
    },
    [onConnectionsChange]
  );

  // Connection drawing
  const startDrawing = useCallback(
    (sourceNodeId: string, sourceOutput: string, startPosition: Position) => {
      setDrawingConnection({
        sourceNodeId,
        sourceOutput,
        startPosition,
        currentPosition: startPosition,
      });
    },
    []
  );

  const updateDrawing = useCallback((currentPosition: Position) => {
    setDrawingConnection((prev) =>
      prev ? { ...prev, currentPosition } : null
    );
  }, []);

  const endDrawing = useCallback(() => {
    setDrawingConnection(null);
  }, []);

  const cancelDrawing = useCallback(() => {
    setDrawingConnection(null);
  }, []);

  const completeConnection = useCallback(
    (targetNodeId: string, targetInput: string): boolean => {
      if (!drawingConnection) return false;
      if (drawingConnection.sourceNodeId === targetNodeId) {
        cancelDrawing();
        return false;
      }

      const newConnection: Connection = {
        id: generateConnectionId(),
        sourceNodeId: drawingConnection.sourceNodeId,
        sourceOutput: drawingConnection.sourceOutput,
        targetNodeId,
        targetInput,
      };

      const success = addConnection(newConnection);
      cancelDrawing();
      return success;
    },
    [drawingConnection, generateConnectionId, addConnection, cancelDrawing]
  );

  // Query
  const getNodeConnections = useCallback(
    (nodeId: string) =>
      connections.filter((c) => c.sourceNodeId === nodeId || c.targetNodeId === nodeId),
    [connections]
  );

  const getOutgoingConnections = useCallback(
    (nodeId: string) => connections.filter((c) => c.sourceNodeId === nodeId),
    [connections]
  );

  const getIncomingConnections = useCallback(
    (nodeId: string) => connections.filter((c) => c.targetNodeId === nodeId),
    [connections]
  );

  // Cleanup
  const removeNodeConnections = useCallback(
    (nodeId: string) => {
      updateConnections((prev) =>
        prev.filter((c) => c.sourceNodeId !== nodeId && c.targetNodeId !== nodeId)
      );
    },
    [updateConnections]
  );

  return {
    connections,
    drawingConnection,
    isDrawing: drawingConnection !== null,
    addConnection,
    removeConnection,
    removeConnectionByEndpoints,
    setConnections,
    startDrawing,
    updateDrawing,
    endDrawing,
    cancelDrawing,
    completeConnection,
    getNodeConnections,
    getOutgoingConnections,
    getIncomingConnections,
    hasConnection,
    removeNodeConnections,
  };
}
