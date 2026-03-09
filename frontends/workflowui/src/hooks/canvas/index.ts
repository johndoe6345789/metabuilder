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
  type UseCanvasGridUtilsReturn
} from '@metabuilder/hooks';

// App-specific hooks (use projectService, IndexedDB)
export { useCanvasItems } from './useCanvasItems';
export type { UseCanvasItemsReturn } from './useCanvasItems';
export { useCanvasItemsOperations } from './useCanvasItemsOperations';
export type { UseCanvasItemsOperationsReturn } from './useCanvasItemsOperations';

// Import for composite hook
import {
  useCanvasZoom,
  useCanvasPan,
  useCanvasSelection,
  useCanvasSettings,
  useCanvasGridUtils,
  type UseCanvasZoomReturn,
  type UseCanvasPanReturn,
  type UseCanvasSelectionReturn,
  type UseCanvasSettingsReturn,
  type UseCanvasGridUtilsReturn
} from '@metabuilder/hooks';
import { useCanvasItems, UseCanvasItemsReturn } from './useCanvasItems';
import { useCanvasItemsOperations, UseCanvasItemsOperationsReturn } from './useCanvasItemsOperations';
import type { CanvasPosition } from '@metabuilder/redux-slices';

export interface UseProjectCanvasReturn {
  // Structured API
  zoomHook: UseCanvasZoomReturn;
  panHook: UseCanvasPanReturn;
  selectionHook: UseCanvasSelectionReturn;
  itemsHook: UseCanvasItemsReturn;
  settingsHook: UseCanvasSettingsReturn;
  operationsHook: UseCanvasItemsOperationsReturn;
  gridUtilsHook: UseCanvasGridUtilsReturn;

  // Backward compatible flattened state
  canvasItems: any[];
  selectedItemIds: string[];
  selectedItems: any[];
  zoom: number;
  pan: CanvasPosition;
  gridSnap: boolean;
  showGrid: boolean;
  snapSize: number;
  isLoading: boolean;
  error: string | null;
  isDragging: boolean;
  isResizing: boolean;

  // Backward compatible operations
  loadCanvasItems: () => Promise<void>;
  createCanvasItem: (data: any) => Promise<any>;
  updateCanvasItem: (itemId: string, data: any) => Promise<any>;
  deleteCanvasItem: (itemId: string) => Promise<void>;
  bulkUpdateItems: (updates: any[]) => Promise<void>;
  zoom_in: () => void;
  zoom_out: () => void;
  reset_view: () => void;
  pan_canvas: (delta: CanvasPosition) => void;
  select_item: (itemId: string) => void;
  select_add: (itemId: string) => void;
  select_remove: (itemId: string) => void;
  select_toggle: (itemId: string) => void;
  select_clear: () => void;
  select_all_items: () => void;
  set_dragging: (isDragging: boolean) => void;
  set_resizing: (isResizing: boolean) => void;
  toggle_grid_snap: () => void;
  toggle_show_grid: () => void;
  set_snap_size: (size: number) => void;
  snap_to_grid: (position: CanvasPosition) => CanvasPosition;
}

/**
 * Compose all canvas hooks into a single interface
 * Provides backward-compatible API with snake_case methods for existing code
 */
export function useProjectCanvas(): UseProjectCanvasReturn {
  const zoomHook = useCanvasZoom();
  const panHook = useCanvasPan();
  const selectionHook = useCanvasSelection();
  const itemsHook = useCanvasItems();
  const settingsHook = useCanvasSettings();
  const operationsHook = useCanvasItemsOperations();
  const gridUtilsHook = useCanvasGridUtils();

  return {
    // Structured API for new code
    zoomHook,
    panHook,
    selectionHook,
    itemsHook,
    settingsHook,
    operationsHook,
    gridUtilsHook,

    // Backward compatible - flattened state
    canvasItems: itemsHook.canvasItems,
    selectedItemIds: selectionHook.selectedItemIds,
    selectedItems: selectionHook.selectedItems,
    zoom: zoomHook.zoom,
    pan: panHook.pan,
    gridSnap: settingsHook.gridSnap,
    showGrid: settingsHook.showGrid,
    snapSize: settingsHook.snapSize,
    isLoading: itemsHook.isLoading,
    error: itemsHook.error,
    isDragging: panHook.isDragging,
    isResizing: itemsHook.isResizing,

    // Backward compatible - canvas item operations
    loadCanvasItems: itemsHook.loadCanvasItems,
    createCanvasItem: operationsHook.createCanvasItem,
    updateCanvasItem: operationsHook.updateCanvasItem,
    deleteCanvasItem: itemsHook.deleteCanvasItem,
    bulkUpdateItems: operationsHook.bulkUpdateItems,

    // Backward compatible - viewport controls
    zoom_in: zoomHook.zoomIn,
    zoom_out: zoomHook.zoomOut,
    reset_view: zoomHook.resetView,
    pan_canvas: panHook.panBy,

    // Backward compatible - selection controls
    select_item: selectionHook.selectItem,
    select_add: selectionHook.addToSelection,
    select_remove: selectionHook.removeFromSelection,
    select_toggle: selectionHook.toggleSelection,
    select_clear: selectionHook.clearSelection,
    select_all_items: selectionHook.selectAllItems,

    // Backward compatible - interaction state
    set_dragging: panHook.setDraggingState,
    set_resizing: itemsHook.setResizingState,

    // Backward compatible - settings
    toggle_grid_snap: settingsHook.toggleGridSnap,
    toggle_show_grid: settingsHook.toggleShowGrid,
    set_snap_size: settingsHook.setSnapSizeValue,

    // Backward compatible - utilities
    snap_to_grid: gridUtilsHook.snapToGrid
  };
}

export default useProjectCanvas;
