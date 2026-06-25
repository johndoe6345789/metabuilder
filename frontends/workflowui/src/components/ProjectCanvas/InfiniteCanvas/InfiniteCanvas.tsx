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
import { useProjectCanvas } from '../../../hooks/canvas';
import { useCanvasKeyboardActions } from '../../../hooks/useCanvasKeyboardActions';
import { useCanvasTransform } from './useCanvasTransform';
import { useCanvasGrid } from './useCanvasGrid';
import { CanvasGrid } from './CanvasGrid';
import { CanvasContent } from './CanvasContent';
import { ZoomControls } from './ZoomControls';
import { PanHint } from './PanHint';
import { NavigationArrows } from './NavigationArrows';
import styles from '../InfiniteCanvas.module.scss';

interface InfiniteCanvasProps {
  children: React.ReactNode;
  onCanvasPan?: (pan: { x: number; y: number }) => void;
  onCanvasZoom?: (zoom: number) => void;
}

export const InfiniteCanvas: React.FC<InfiniteCanvasProps> = ({
  children,
  onCanvasPan,
  onCanvasZoom,
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const {
    zoom,
    pan,
    zoom_in,
    zoom_out,
    reset_view,
    snapSize,
  } = useProjectCanvas();

  const { isPanning, handleMouseDown, handleArrowPan, bindWheelListener } =
    useCanvasTransform(onCanvasPan, onCanvasZoom);

  const { gridOffset } = useCanvasGrid();

  useCanvasKeyboardActions();

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
      <CanvasGrid
        snapSize={snapSize}
        gridOffset={gridOffset}
      />

      <CanvasContent zoom={zoom} panX={pan.x} panY={pan.y}>
        {children}
      </CanvasContent>

      <ZoomControls
        zoom={zoom}
        onZoomIn={zoom_in}
        onZoomOut={zoom_out}
        onResetView={reset_view}
      />

      <PanHint />

      <NavigationArrows onPan={handleArrowPan} />
    </div>
  );
};

export default InfiniteCanvas;
