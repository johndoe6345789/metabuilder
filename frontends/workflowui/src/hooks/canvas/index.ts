/**
 * Canvas Hooks Index for WorkflowUI
 * Combines shared canvas hooks with app-specific implementations
 */

// Re-export shared hooks from @metabuilder/hooks
export {
  useCanvasZoom,
  useCanvasPan,
  useCanvasSelection,
  useCanvasSettings,
  useCanvasGridUtils,
  type UseCanvasZoomReturn,
  type UseCanvasPanReturn,
  type UseCanvasSelectionReturn,
  type UseCanvasSettingsReturn,
  type UseCanvasGridUtilsReturn,
} from '@metabuilder/hooks';

// App-specific hooks (use projectService, IndexedDB)
export { useCanvasItems } from './useCanvasItems';
export type { UseCanvasItemsReturn } from './useCanvasItems';
export {
  useCanvasItemsOperations,
} from './useCanvasItemsOperations';
export type {
  UseCanvasItemsOperationsReturn,
} from './useCanvasItemsOperations';

export type { UseProjectCanvasReturn } from './types';

// Composite hook
export { useProjectCanvas } from './useProjectCanvas';
export default useProjectCanvas from './useProjectCanvas';
