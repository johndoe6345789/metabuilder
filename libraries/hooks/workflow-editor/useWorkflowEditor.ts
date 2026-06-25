/**
 * useWorkflowEditor Hook (Master Composition)
 * Composes all workflow editor hooks into a single unified interface
 * Following the pattern from hooks/editor/useEditor.ts
 */

import { useCallback, useMemo } from 'react';
import { useWorkflowCanvas, UseWorkflowCanvasReturn } from './useWorkflowCanvas';
import { useWorkflowNodes, UseWorkflowNodesReturn } from './useWorkflowNodes';
import { useWorkflowConnections, UseWorkflowConnectionsReturn } from './useWorkflowConnections';
import { useNodeTypes, UseNodeTypesReturn } from './useNodeTypes';
import { useWorkflowExecution, UseWorkflowExecutionReturn } from './useWorkflowExecution';
import { useWorkflowPersistence, UseWorkflowPersistenceReturn } from './useWorkflowPersistence';
import type {
  Workflow,
  WorkflowNode,
  Connection,
  Position,
  NodeTypeDefinition,
} from '../../types/workflow-editor';

export interface UseWorkflowEditorReturn {
  // Composed hooks for fine-grained access
  canvasHook: UseWorkflowCanvasReturn;
  nodesHook: UseWorkflowNodesReturn;
  connectionsHook: UseWorkflowConnectionsReturn;
  nodeTypesHook: UseNodeTypesReturn;
  executionHook: UseWorkflowExecutionReturn;
  persistenceHook: UseWorkflowPersistenceReturn;

  // Flattened workflow state
  workflow: Workflow;
  nodes: WorkflowNode[];
  connections: Connection[];

  // Flattened canvas state
  zoom: number;
  pan: Position;
  isPanning: boolean;

  // Flattened selection state
  selectedNodeId: string | null;
  selectedNode: WorkflowNode | undefined;
  selectedNodeType: NodeTypeDefinition | undefined;

  // Flattened node types
  nodeTypes: NodeTypeDefinition[];
  filteredNodeTypes: NodeTypeDefinition[];
  nodeSearch: string;
  setNodeSearch: (query: string) => void;

  // Common operations
  addNodeFromPalette: (nodeType: NodeTypeDefinition, position: Position) => WorkflowNode;
  deleteSelectedNode: () => void;
  updateSelectedNodeConfig: (config: Record<string, unknown>) => void;
  updateSelectedNodeName: (name: string) => void;

  // State flags
  isDirty: boolean;
  isSaving: boolean;
  isExecuting: boolean;
}

export interface UseWorkflowEditorOptions {
  workflowId: string;
  initialWorkflow?: Partial<Workflow>;
  onSave?: (workflow: Workflow) => Promise<void>;
  onLoad?: (workflowId: string) => Promise<Workflow>;
  autoSaveEnabled?: boolean;
}

let nodeCounter = 0;
const generateNodeId = () => `node_${++nodeCounter}_${Date.now()}`;

export function useWorkflowEditor(options: UseWorkflowEditorOptions): UseWorkflowEditorReturn {
  const { workflowId, initialWorkflow, onSave, onLoad, autoSaveEnabled = false } = options;

  // Initialize canvas
  const canvasHook = useWorkflowCanvas();

  // Initialize nodes with callback for dirty tracking
  const nodesHook = useWorkflowNodes({
    initialNodes: initialWorkflow?.nodes || [
      {
        id: 'node_1',
        type: 'manual',
        name: 'Start',
        position: { x: 100, y: 200 },
        config: {},
        inputs: [],
        outputs: ['main'],
      },
    ],
  });

  // Initialize connections
  const connectionsHook = useWorkflowConnections({
    initialConnections: initialWorkflow?.connections || [],
  });

  // Initialize node types
  const nodeTypesHook = useNodeTypes();

  // Initialize execution
  const executionHook = useWorkflowExecution();

  // Build current workflow object
  const workflow = useMemo<Workflow>(
    () => ({
      id: workflowId,
      name: initialWorkflow?.name || 'My Workflow',
      description: initialWorkflow?.description || '',
      nodes: nodesHook.nodes,
      connections: connectionsHook.connections,
      createdAt: initialWorkflow?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }),
    [workflowId, initialWorkflow, nodesHook.nodes, connectionsHook.connections]
  );

  // Initialize persistence
  const persistenceHook = useWorkflowPersistence({
    workflow,
    onSave,
    onLoad,
    autoSaveEnabled,
  });

  // Get selected node and its type
  const selectedNode = nodesHook.getSelectedNode();
  const selectedNodeType = selectedNode
    ? nodeTypesHook.getNodeType(selectedNode.type)
    : undefined;

  // Add node from palette
  const addNodeFromPalette = useCallback(
    (nodeType: NodeTypeDefinition, position: Position): WorkflowNode => {
      const newNode: WorkflowNode = {
        id: generateNodeId(),
        type: nodeType.id,
        name: nodeType.name,
        position,
        config: { ...nodeType.defaultConfig },
        inputs: [...nodeType.inputs],
        outputs: [...nodeType.outputs],
      };
      nodesHook.addNode(newNode);
      nodesHook.selectNode(newNode.id);
      persistenceHook.markDirty();
      return newNode;
    },
    [nodesHook, persistenceHook]
  );

  // Delete selected node
  const deleteSelectedNode = useCallback(() => {
    if (nodesHook.selectedNodeId) {
      connectionsHook.removeNodeConnections(nodesHook.selectedNodeId);
      nodesHook.deleteNode(nodesHook.selectedNodeId);
      persistenceHook.markDirty();
    }
  }, [nodesHook, connectionsHook, persistenceHook]);

  // Update selected node config
  const updateSelectedNodeConfig = useCallback(
    (config: Record<string, unknown>) => {
      if (nodesHook.selectedNodeId) {
        nodesHook.updateNodeConfig(nodesHook.selectedNodeId, config);
        persistenceHook.markDirty();
      }
    },
    [nodesHook, persistenceHook]
  );

  // Update selected node name
  const updateSelectedNodeName = useCallback(
    (name: string) => {
      if (nodesHook.selectedNodeId) {
        nodesHook.updateNodeName(nodesHook.selectedNodeId, name);
        persistenceHook.markDirty();
      }
    },
    [nodesHook, persistenceHook]
  );

  return {
    // Composed hooks
    canvasHook,
    nodesHook,
    connectionsHook,
    nodeTypesHook,
    executionHook,
    persistenceHook,

    // Flattened workflow state
    workflow,
    nodes: nodesHook.nodes,
    connections: connectionsHook.connections,

    // Flattened canvas state
    zoom: canvasHook.zoom,
    pan: canvasHook.pan,
    isPanning: canvasHook.isPanning,

    // Flattened selection state
    selectedNodeId: nodesHook.selectedNodeId,
    selectedNode,
    selectedNodeType,

    // Flattened node types
    nodeTypes: nodeTypesHook.nodeTypes,
    filteredNodeTypes: nodeTypesHook.filteredNodeTypes,
    nodeSearch: nodeTypesHook.searchQuery,
    setNodeSearch: nodeTypesHook.setSearchQuery,

    // Common operations
    addNodeFromPalette,
    deleteSelectedNode,
    updateSelectedNodeConfig,
    updateSelectedNodeName,

    // State flags
    isDirty: persistenceHook.isDirty,
    isSaving: persistenceHook.isSaving,
    isExecuting: executionHook.isExecuting,
  };
}
