/**
 * ZoomControls Component
 * Bottom-right zoom indicator with zoom in/out and reset buttons
 * Shows current zoom percentage
 */

import React from 'react';
import styles from '../InfiniteCanvas.module.scss';
import { testId } from '../../../utils/accessibility';

interface ZoomControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
}

export const ZoomControls: React.FC<ZoomControlsProps> = ({
  zoom,
  onZoomIn,
  onZoomOut,
  onResetView
}) => {
  return (
    <div className={styles.zoomIndicator} role="toolbar" aria-label="Zoom controls">
      <button
        className={styles.zoomButton}
        onClick={onZoomOut}
        title="Zoom out (Ctrl+Scroll)"
        aria-label="Zoom out"
        data-testid={testId.canvasZoomOut()}
      >
        −
      </button>
      <span
        className={styles.zoomValue}
        role="status"
        aria-label={`Current zoom level: ${Math.round(zoom * 100)} percent`}
      >
        {Math.round(zoom * 100)}%
      </span>
      <button
        className={styles.zoomButton}
        onClick={onZoomIn}
        title="Zoom in (Ctrl+Scroll)"
        aria-label="Zoom in"
        data-testid={testId.canvasZoomIn()}
      >
        +
      </button>
      <button
        className={styles.resetButton}
        onClick={onResetView}
        title="Reset view (Ctrl+0)"
        aria-label="Reset view to 100% zoom"
        data-testid={testId.canvasZoomReset()}
      >
        ⟲
      </button>
    </div>
  );
};

export default ZoomControls;
