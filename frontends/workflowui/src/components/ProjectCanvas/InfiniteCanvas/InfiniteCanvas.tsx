/**
 * InfiniteCanvas Component
 * Main component composing all canvas sub-components
 * Handles zoom, pan, grid, and navigation UI
 *
 * Keyboard Shortcuts:
 * - Ctrl/Cmd+A: Select all workflow cards
 * - Delete/Backspace: Delete selected cards
 * - Ctrl/Cmd+D: Duplicate selected cards
 * - Ctrl/Cmd+F: Open search/filter dialog
 * - Escape: Clear selection
 * - Arrow Keys: Pan canvas (when not in input)
 */

import React, { useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useProjectCanvas } from '../../../hooks/canvas';
import { useCanvasKeyboard } from '../../../hooks/useCanvasKeyboard';
import { useCanvasTransform } from './useCanvasTransform';
import { useCanvasGrid } from './useCanvasGrid';
import {
  deleteCanvasItems,
  duplicateCanvasItems,
  selectCanvasItems,
  selectSelectedItemIds,
  setSelection
} from '@metabuilder/redux-slices';
import { CanvasGrid } from './CanvasGrid';
import { CanvasContent } from './CanvasContent';
import { ZoomControls } from './ZoomControls';
import { PanHint } from './PanHint';
import { NavigationArrows } from './NavigationArrows';
import styles from '../InfiniteCanvas.module.scss';
import type { RootState } from '../../../store/store';

interface InfiniteCanvasProps {
  children: React.ReactNode;
  onCanvasPan?: (pan: { x: number; y: number }) => void;
  onCanvasZoom?: (zoom: number) => void;
}

export const InfiniteCanvas: React.FC<InfiniteCanvasProps> = ({
  children,
  onCanvasPan,
  onCanvasZoom
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch();
  const { zoom, pan, zoom_in, zoom_out, reset_view, snapSize } = useProjectCanvas();

  const selectedItemIds = useSelector((state: RootState) => selectSelectedItemIds(state));
  const canvasItems = useSelector((state: RootState) => selectCanvasItems(state));

  const { isPanning, handleMouseDown, handleArrowPan, bindWheelListener } =
    useCanvasTransform(onCanvasPan, onCanvasZoom);

  const { gridOffset } = useCanvasGrid();

  /**
   * Handle select all keyboard shortcut
   * Dispatches action to select all canvas items
   */
  const handleSelectAll = () => {
    const allItemIds = canvasItems.map((item) => item.id);
    dispatch(setSelection(new Set(allItemIds)));
  };

  /**
   * Handle delete keyboard shortcut
   * Removes all selected items from the canvas
   */
  const handleDeleteSelected = () => {
    if (selectedItemIds.size > 0) {
      const itemsToDelete = Array.from(selectedItemIds);
      dispatch(deleteCanvasItems(itemsToDelete));
    }
  };

  /**
   * Handle duplicate keyboard shortcut
   * Creates copies of selected items with offset positions
   */
  const handleDuplicateSelected = () => {
    if (selectedItemIds.size > 0) {
      const itemsToDuplicate = Array.from(selectedItemIds);
      dispatch(duplicateCanvasItems(itemsToDuplicate));
    }
  };

  /**
   * Handle search keyboard shortcut
   * Placeholder for search dialog integration in Phase 4
   */
  const handleSearch = () => {
    // TODO Phase 4: Integrate with search dialog
    console.log('Search triggered - Phase 4 integration pending');
  };

  // Initialize keyboard event handler
  useCanvasKeyboard({
    onSelectAll: handleSelectAll,
    onDeleteSelected: handleDeleteSelected,
    onDuplicateSelected: handleDuplicateSelected,
    onSearch: handleSearch
  });

  // Bind wheel listener to canvas element
  useEffect(() => {
    return bindWheelListener(canvasRef.current);
  }, [bindWheelListener]);

  return (
    <div
      ref={canvasRef}
      className={styles.canvas}
      onMouseDown={handleMouseDown}
      style={{ cursor: isPanning ? 'grabbing' : 'grab' }}
    >
      <CanvasGrid snapSize={snapSize} gridOffset={gridOffset} />

      <CanvasContent zoom={zoom} panX={pan.x} panY={pan.y}>
        {children}
      </CanvasContent>

      <ZoomControls zoom={zoom} onZoomIn={zoom_in} onZoomOut={zoom_out} onResetView={reset_view} />

      <PanHint />

      <NavigationArrows onPan={handleArrowPan} />
    </div>
  );
};

export default InfiniteCanvas;
