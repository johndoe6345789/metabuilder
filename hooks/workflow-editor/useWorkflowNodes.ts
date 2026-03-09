/**
 * useWorkflowNodes Hook
 * Manages workflow node state: CRUD operations, selection, dragging
 */

import { useState, useCallback } from 'react';

export interface Position {
  x: number;
  y: number;
}

export interface WorkflowNode {
  id: string;
  type: string;
  name: string;
  position: Position;
  config: Record<string, unknown>;
  inputs: string[];
  outputs: string[];
}

export interface UseWorkflowNodesReturn {
  // State
  nodes: WorkflowNode[];
  selectedNodeId: string | null;
  draggingNodeId: string | null;

  // Node CRUD
  addNode: (node: WorkflowNode) => void;
  updateNode: (nodeId: string, updates: Partial<WorkflowNode>) => void;
  deleteNode: (nodeId: string) => void;
  setNodes: (nodes: WorkflowNode[]) => void;

  // Node position
  moveNode: (nodeId: string, position: Position) => void;

  // Node config
  updateNodeConfig: (nodeId: string, config: Record<string, unknown>) => void;
  updateNodeName: (nodeId: string, name: string) => void;

  // Selection
  selectNode: (nodeId: string | null) => void;
  clearSelection: () => void;

  // Dragging
  startDrag: (nodeId: string, offsetX: number, offsetY: number) => void;
  updateDrag: (position: Position) => void;
  endDrag: () => void;
  dragOffset: { x: number; y: number };

  // Utilities
  getNode: (nodeId: string) => WorkflowNode | undefined;
  getSelectedNode: () => WorkflowNode | undefined;
}

export interface UseWorkflowNodesOptions {
  initialNodes?: WorkflowNode[];
  onNodesChange?: (nodes: WorkflowNode[]) => void;
}

export function useWorkflowNodes(options: UseWorkflowNodesOptions = {}): UseWorkflowNodesReturn {
  const { initialNodes = [], onNodesChange } = options;

  const [nodes, setNodesState] = useState<WorkflowNode[]>(initialNodes);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Internal helper to update nodes and notify
  const updateNodes = useCallback(
    (updater: (prev: WorkflowNode[]) => WorkflowNode[]) => {
      setNodesState((prev) => {
        const next = updater(prev);
        onNodesChange?.(next);
        return next;
      });
    },
    [onNodesChange]
  );

  // Node CRUD
  const addNode = useCallback(
    (node: WorkflowNode) => {
      updateNodes((prev) => [...prev, node]);
    },
    [updateNodes]
  );

  const updateNode = useCallback(
    (nodeId: string, updates: Partial<WorkflowNode>) => {
      updateNodes((prev) =>
        prev.map((n) => (n.id === nodeId ? { ...n, ...updates } : n))
      );
    },
    [updateNodes]
  );

  const deleteNode = useCallback(
    (nodeId: string) => {
      updateNodes((prev) => prev.filter((n) => n.id !== nodeId));
      if (selectedNodeId === nodeId) {
        setSelectedNodeId(null);
      }
    },
    [updateNodes, selectedNodeId]
  );

  const setNodes = useCallback(
    (newNodes: WorkflowNode[]) => {
      setNodesState(newNodes);
      onNodesChange?.(newNodes);
    },
    [onNodesChange]
  );

  // Node position
  const moveNode = useCallback(
    (nodeId: string, position: Position) => {
      updateNodes((prev) =>
        prev.map((n) =>
          n.id === nodeId
            ? { ...n, position: { x: Math.max(0, position.x), y: Math.max(0, position.y) } }
            : n
        )
      );
    },
    [updateNodes]
  );

  // Node config
  const updateNodeConfig = useCallback(
    (nodeId: string, config: Record<string, unknown>) => {
      updateNode(nodeId, { config });
    },
    [updateNode]
  );

  const updateNodeName = useCallback(
    (nodeId: string, name: string) => {
      updateNode(nodeId, { name });
    },
    [updateNode]
  );

  // Selection
  const selectNode = useCallback((nodeId: string | null) => {
    setSelectedNodeId(nodeId);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedNodeId(null);
  }, []);

  // Dragging
  const startDrag = useCallback((nodeId: string, offsetX: number, offsetY: number) => {
    setDraggingNodeId(nodeId);
    setDragOffset({ x: offsetX, y: offsetY });
  }, []);

  const updateDrag = useCallback(
    (position: Position) => {
      if (draggingNodeId) {
        moveNode(draggingNodeId, {
          x: position.x - dragOffset.x,
          y: position.y - dragOffset.y,
        });
      }
    },
    [draggingNodeId, dragOffset, moveNode]
  );

  const endDrag = useCallback(() => {
    setDraggingNodeId(null);
  }, []);

  // Utilities
  const getNode = useCallback(
    (nodeId: string) => nodes.find((n) => n.id === nodeId),
    [nodes]
  );

  const getSelectedNode = useCallback(
    () => (selectedNodeId ? getNode(selectedNodeId) : undefined),
    [selectedNodeId, getNode]
  );

  return {
    nodes,
    selectedNodeId,
    draggingNodeId,
    addNode,
    updateNode,
    deleteNode,
    setNodes,
    moveNode,
    updateNodeConfig,
    updateNodeName,
    selectNode,
    clearSelection,
    startDrag,
    updateDrag,
    endDrag,
    dragOffset,
    getNode,
    getSelectedNode,
  };
}
