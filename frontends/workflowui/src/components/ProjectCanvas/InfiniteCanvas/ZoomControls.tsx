/**
 * ZoomControls Component
 * Bottom-right zoom indicator with zoom in/out and reset buttons
 * Shows current zoom percentage
 */

import React from 'react';
import styles from '../InfiniteCanvas.module.scss';

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
    <div className={styles.zoomIndicator}>
      <button
        className={styles.zoomButton}
        onClick={onZoomOut}
        title="Zoom out (Ctrl+Scroll)"
        aria-label="Zoom out"
      >
        −
      </button>
      <span className={styles.zoomValue}>{Math.round(zoom * 100)}%</span>
      <button
        className={styles.zoomButton}
        onClick={onZoomIn}
        title="Zoom in (Ctrl+Scroll)"
        aria-label="Zoom in"
      >
        +
      </button>
      <button
        className={styles.resetButton}
        onClick={onResetView}
        title="Reset view (Ctrl+0)"
        aria-label="Reset view"
      >
        ⟲
      </button>
    </div>
  );
};

export default ZoomControls;
