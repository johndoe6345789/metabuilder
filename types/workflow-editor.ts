/**
 * Workflow Editor Type Definitions
 * Shared types for workflow editor components and hooks
 */

// =============================================================================
// POSITION & GEOMETRY
// =============================================================================

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Rect extends Position, Size {}

// =============================================================================
// NODE TYPES
// =============================================================================

export interface NodeTypeDefinition {
  id: string;
  type: string;
  category: string;
  categoryName?: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  inputs: string[];
  outputs: string[];
  defaultConfig: Record<string, unknown>;
  language?: string;
}

export interface NodeCategory {
  id: string;
  name: string;
  color: string;
  icon?: string;
}

// =============================================================================
// WORKFLOW NODES
// =============================================================================

export interface WorkflowNode {
  id: string;
  type: string;
  name: string;
  position: Position;
  config: Record<string, unknown>;
  inputs: string[];
  outputs: string[];
}

// =============================================================================
// CONNECTIONS
// =============================================================================

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

// =============================================================================
// WORKFLOW
// =============================================================================

export interface Workflow {
  id: string;
  name: string;
  description: string;
  nodes: WorkflowNode[];
  connections: Connection[];
  createdAt: string;
  updatedAt: string;
  version?: string;
  tenantId?: string;
  tags?: string[];
}

// =============================================================================
// EXECUTION
// =============================================================================

export type ExecutionStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface ExecutionState {
  status: ExecutionStatus;
  startedAt?: number;
  completedAt?: number;
  error?: string;
  output?: unknown;
}

export interface NodeExecutionResult {
  nodeId: string;
  status: ExecutionStatus;
  startedAt: number;
  completedAt?: number;
  output?: unknown;
  error?: string;
  duration?: number;
}

export interface ExecutionResult {
  id: string;
  workflowId: string;
  status: ExecutionStatus;
  startedAt: number;
  completedAt?: number;
  error?: string;
  nodeResults: Record<string, NodeExecutionResult>;
}

// =============================================================================
// CANVAS STATE
// =============================================================================

export interface CanvasTransform {
  zoom: number;
  pan: Position;
}

export interface CanvasState extends CanvasTransform {
  isPanning: boolean;
  isDragging: boolean;
  isDrawingConnection: boolean;
}

// =============================================================================
// EDITOR STATE
// =============================================================================

export interface WorkflowEditorState {
  // Workflow data
  workflow: Workflow;

  // Canvas state
  canvas: CanvasState;

  // Selection
  selectedNodeId: string | null;
  selectedConnectionId: string | null;

  // UI state
  propertiesDialogOpen: boolean;
  nodeSearch: string;
  expandedCategories: Record<string, boolean>;

  // Persistence
  isDirty: boolean;
  isSaving: boolean;
  lastSaved: number | null;

  // Execution
  isExecuting: boolean;
  currentExecution: ExecutionResult | null;
}

// =============================================================================
// COMPONENT PROPS
// =============================================================================

export interface CanvasNodeProps {
  node: WorkflowNode;
  nodeType?: NodeTypeDefinition;
  isSelected: boolean;
  isDrawingConnection: boolean;
  onSelect: (nodeId: string) => void;
  onDoubleClick: (nodeId: string) => void;
  onDragStart: (e: React.MouseEvent, nodeId: string) => void;
  onConnectionStart: (nodeId: string, outputName: string, position: Position) => void;
  onConnectionEnd: (targetNodeId: string, targetInput: string) => void;
}

export interface ConnectionLineProps {
  connection: Connection;
  nodes: WorkflowNode[];
}

export interface NodePaletteProps {
  nodeSearch: string;
  onSearchChange: (value: string) => void;
  expandedCategories: Record<string, boolean>;
  onToggleCategory: (category: string) => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  onDragStart: (e: React.DragEvent, nodeType: NodeTypeDefinition) => void;
}

export interface PropertiesDialogProps {
  open: boolean;
  onClose: () => void;
  node: WorkflowNode | null;
  nodeType?: NodeTypeDefinition;
  onUpdateConfig: (nodeId: string, config: Record<string, unknown>) => void;
  onUpdateName: (nodeId: string, name: string) => void;
  onDelete: (nodeId: string) => void;
}

export interface EditorToolbarProps {
  workflowName: string;
  onNameChange: (name: string) => void;
  nodeCount: number;
  connectionCount: number;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  onBack: () => void;
  onSave: () => void;
  onRun: () => void;
}
