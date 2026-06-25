/**
 * CanvasZoomControls - Zoom in/out/reset buttons with level display
 */

import React from 'react';

interface CanvasZoomControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
}

export default function CanvasZoomControls({
  zoom,
  onZoomIn,
  onZoomOut,
  onResetView,
}: CanvasZoomControlsProps) {
  return (
    <div>
      <button
        onClick={onZoomOut}
        title="Zoom out"
        aria-label="Zoom out"
      >
        −
      </button>
      <span>{Math.round(zoom * 100)}%</span>
      <button
        onClick={onZoomIn}
        title="Zoom in"
        aria-label="Zoom in"
      >
        +
      </button>
      <button
        onClick={onResetView}
        title="Reset view"
        aria-label="Reset view"
      >
        ⟲
      </button>
    </div>
  );
}
