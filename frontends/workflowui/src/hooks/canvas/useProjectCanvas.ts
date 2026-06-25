/**
 * useProjectCanvas - Composes all canvas sub-hooks
 */

import {
  useCanvasZoom,
  useCanvasPan,
  useCanvasSelection,
  useCanvasSettings,
  useCanvasGridUtils,
} from '@metabuilder/hooks';
import { useCanvasItems } from './useCanvasItems';
import { useCanvasItemsOperations } from './useCanvasItemsOperations';
import type { UseProjectCanvasReturn } from './types';

export function useProjectCanvas(): UseProjectCanvasReturn {
  const zoomHook = useCanvasZoom();
  const panHook = useCanvasPan();
  const selectionHook = useCanvasSelection();
  const itemsHook = useCanvasItems();
  const settingsHook = useCanvasSettings();
  const operationsHook = useCanvasItemsOperations();
  const gridUtilsHook = useCanvasGridUtils();

  return {
    zoomHook,
    panHook,
    selectionHook,
    itemsHook,
    settingsHook,
    operationsHook,
    gridUtilsHook,

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

    loadCanvasItems: itemsHook.loadCanvasItems,
    createCanvasItem: operationsHook.createCanvasItem,
    updateCanvasItem: operationsHook.updateCanvasItem,
    deleteCanvasItem: itemsHook.deleteCanvasItem,
    bulkUpdateItems: operationsHook.bulkUpdateItems,

    zoom_in: zoomHook.zoomIn,
    zoom_out: zoomHook.zoomOut,
    reset_view: zoomHook.resetView,
    pan_canvas: panHook.panBy,

    select_item: selectionHook.selectItem,
    select_add: selectionHook.addToSelection,
    select_remove: selectionHook.removeFromSelection,
    select_toggle: selectionHook.toggleSelection,
    select_clear: selectionHook.clearSelection,
    select_all_items: selectionHook.selectAllItems,

    set_dragging: panHook.setDraggingState,
    set_resizing: itemsHook.setResizingState,

    toggle_grid_snap: settingsHook.toggleGridSnap,
    toggle_show_grid: settingsHook.toggleShowGrid,
    set_snap_size: settingsHook.setSnapSizeValue,

    snap_to_grid: gridUtilsHook.snapToGrid,
  };
}

export default useProjectCanvas;
