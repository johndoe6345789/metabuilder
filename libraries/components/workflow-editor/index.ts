/**
 * Workflow Editor Components
 * Barrel export for all workflow editor components
 */

// Types
export type {
  Position,
  NodeType,
  WorkflowNode,
  Connection,
  Workflow,
  NodeCategory,
  NodeCategories,
} from './types';

// Node definitions and utilities
export {
  NODE_CATEGORIES,
  NODE_TYPES,
  generateNodeId,
  generateConnectionId,
} from './node-definitions';

// Icons
export {
  getNodeIcon,
  BackIcon,
  ZoomInIcon,
  ZoomOutIcon,
  ResetIcon,
  PlayIcon,
  ChevronDownIcon,
  NotificationIcon,
  WarningIcon,
} from './icons';

// Components
export { CanvasNode } from './CanvasNode';
export type { CanvasNodeProps } from './CanvasNode';

export { ConnectionLine } from './ConnectionLine';
export type { ConnectionLineProps } from './ConnectionLine';

export { PaletteNode } from './PaletteNode';
export type { PaletteNodeProps } from './PaletteNode';

export { NodePalette } from './NodePalette';
export type { NodePaletteProps } from './NodePalette';

export { PaletteHeader } from './PaletteHeader';
export { PaletteCategories } from './PaletteCategories';

export { PropertiesDialog } from './PropertiesDialog/index';
export type { PropertiesDialogProps } from './PropertiesDialog/index';

export { EditorToolbar } from './EditorToolbar';
export type { EditorToolbarProps } from './EditorToolbar';
