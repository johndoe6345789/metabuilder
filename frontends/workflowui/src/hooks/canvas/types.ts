/**
 * Canvas hook types for useProjectCanvas
 */

import type {
  UseCanvasZoomReturn,
  UseCanvasPanReturn,
  UseCanvasSelectionReturn,
  UseCanvasSettingsReturn,
  UseCanvasGridUtilsReturn,
} from '@metabuilder/hooks';
import type { UseCanvasItemsReturn } from './useCanvasItems';
import type { UseCanvasItemsOperationsReturn } from './useCanvasItemsOperations';
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
