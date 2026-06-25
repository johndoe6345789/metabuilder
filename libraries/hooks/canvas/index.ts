/**
 * Canvas Hooks Index
 * Exports shared canvas-related hooks (no app-specific dependencies)
 */

// Individual hooks for fine-grained usage
export { useCanvasZoom } from './useCanvasZoom';
export type { UseCanvasZoomReturn } from './useCanvasZoom';
export { useCanvasPan } from './useCanvasPan';
export type { UseCanvasPanReturn } from './useCanvasPan';
export { useCanvasSelection } from './useCanvasSelection';
export type { UseCanvasSelectionReturn } from './useCanvasSelection';
export { useCanvasSettings } from './useCanvasSettings';
export type { UseCanvasSettingsReturn } from './useCanvasSettings';
export { useCanvasGridUtils } from './useCanvasGridUtils';
export type { UseCanvasGridUtilsReturn } from './useCanvasGridUtils';

// NOTE: useCanvasItems and useCanvasItemsOperations are app-specific (need projectService, db)
// They live in workflowui/src/hooks/canvas/
// The composite useProjectCanvas also lives in workflowui/src/hooks/canvas/
