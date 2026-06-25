/**
 * CanvasToolbar Component
 * Floating toolbar for canvas operations (zoom, grid, auto-layout)
 */

import React, { useCallback } from 'react';
import { useProjectCanvas } from '../../hooks/canvas';
import CanvasGridControls from './CanvasGridControls';
import CanvasZoomControls from './CanvasZoomControls';
import CanvasActionButtons from './CanvasActionButtons';

interface CanvasToolbarProps {
  onAddWorkflow?: () => void;
  onAutoLayout?: () => void;
  onOpenSettings?: () => void;
}

export const CanvasToolbar: React.FC<CanvasToolbarProps> = ({
  onAddWorkflow,
  onAutoLayout,
  onOpenSettings,
}) => {
  const {
    zoom_in,
    zoom_out,
    reset_view,
    zoom,
    gridSnap,
    toggle_grid_snap,
    showGrid,
    toggle_show_grid,
    snapSize,
    set_snap_size,
  } = useProjectCanvas();

  const handleSnapSizeChange = useCallback(
    (size: number) => {
      set_snap_size(size);
    },
    [set_snap_size]
  );

  return (
    <div>
      <CanvasZoomControls
        zoom={zoom}
        onZoomIn={zoom_in}
        onZoomOut={zoom_out}
        onResetView={reset_view}
      />

      <div />

      <CanvasGridControls
        showGrid={showGrid}
        gridSnap={gridSnap}
        snapSize={snapSize}
        onToggleShowGrid={toggle_show_grid}
        onToggleGridSnap={toggle_grid_snap}
        onSnapSizeChange={handleSnapSizeChange}
      />

      <div />

      <CanvasActionButtons
        onAddWorkflow={onAddWorkflow}
        onAutoLayout={onAutoLayout}
        onOpenSettings={onOpenSettings}
      />
    </div>
  );
};

export default CanvasToolbar;
