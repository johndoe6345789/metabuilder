/**
 * ViewToolbar Component
 * Zoom and pan controls
 */

import React from 'react';
import { useEditor } from '../../../hooks';

interface ViewToolbarProps {
  onMenuOpen?: () => void;
}

export const ViewToolbar: React.FC<ViewToolbarProps> = ({ onMenuOpen }) => {
  const { zoom, zoomIn, zoomOut, resetZoom } = useEditor();

  return (
    <div >
      <div >
        <button
          className="btn btn-ghost btn-sm btn-icon"
          onClick={zoomOut}
          title="Zoom out (Ctrl+-)"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="11" cy="11" r="8" strokeWidth="2" />
            <path d="m21 21-4.35-4.35" strokeWidth="2" />
            <line x1="8" y1="11" x2="14" y2="11" strokeWidth="2" />
          </svg>
        </button>

        <span >{Math.round(zoom * 100)}%</span>

        <button
          className="btn btn-ghost btn-sm btn-icon"
          onClick={zoomIn}
          title="Zoom in (Ctrl++)"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="11" cy="11" r="8" strokeWidth="2" />
            <path d="m21 21-4.35-4.35" strokeWidth="2" />
            <line x1="11" y1="8" x2="11" y2="14" strokeWidth="2" />
            <line x1="8" y1="11" x2="14" y2="11" strokeWidth="2" />
          </svg>
        </button>

        <button
          className="btn btn-ghost btn-sm"
          onClick={resetZoom}
          title="Reset zoom (Ctrl+0)"
        >
          100%
        </button>
      </div>

      <button
        className="btn btn-ghost btn-sm btn-icon"
        onClick={onMenuOpen}
        title="More options"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="5" r="2" />
          <circle cx="12" cy="12" r="2" />
          <circle cx="12" cy="19" r="2" />
        </svg>
      </button>
    </div>
  );
};

export default ViewToolbar;
