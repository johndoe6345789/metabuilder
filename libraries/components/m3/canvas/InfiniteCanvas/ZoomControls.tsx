/**
 * ZoomControls Component
 * Bottom-right zoom indicator with zoom in/out and reset buttons
 * Shows current zoom percentage
 */

import React from 'react';
import { testId } from '@metabuilder/utils/accessibility';

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
    <div  role="toolbar" aria-label="Zoom controls">
      <button

        onClick={onZoomOut}
        title="Zoom out (Ctrl+Scroll)"
        aria-label="Zoom out"
        data-testid={testId.canvasZoomOut()}
      >
        −
      </button>
      <span

        role="status"
        aria-label={`Current zoom level: ${Math.round(zoom * 100)} percent`}
      >
        {Math.round(zoom * 100)}%
      </span>
      <button

        onClick={onZoomIn}
        title="Zoom in (Ctrl+Scroll)"
        aria-label="Zoom in"
        data-testid={testId.canvasZoomIn()}
      >
        +
      </button>
      <button

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
