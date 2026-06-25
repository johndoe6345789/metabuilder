/**
 * CanvasGridControls - Grid visibility and snap controls for the toolbar
 */

import React, { useCallback } from 'react';

interface CanvasGridControlsProps {
  showGrid: boolean;
  gridSnap: boolean;
  snapSize: number;
  onToggleShowGrid: () => void;
  onToggleGridSnap: () => void;
  onSnapSizeChange: (size: number) => void;
}

export default function CanvasGridControls({
  showGrid,
  gridSnap,
  snapSize,
  onToggleShowGrid,
  onToggleGridSnap,
  onSnapSizeChange,
}: CanvasGridControlsProps) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      onSnapSizeChange(parseInt(e.target.value, 10));
    },
    [onSnapSizeChange]
  );

  return (
    <div>
      <label>
        <input
          type="checkbox"
          checked={showGrid}
          onChange={onToggleShowGrid}
          aria-label="Toggle grid visibility"
        />
        <span>Grid</span>
      </label>

      <label>
        <input
          type="checkbox"
          checked={gridSnap}
          onChange={onToggleGridSnap}
          aria-label="Toggle grid snap"
        />
        <span>Snap</span>
      </label>

      {gridSnap && (
        <select
          value={snapSize}
          onChange={handleChange}
          aria-label="Grid snap size"
        >
          <option value={5}>5px</option>
          <option value={10}>10px</option>
          <option value={15}>15px</option>
          <option value={20}>20px</option>
          <option value={25}>25px</option>
          <option value={50}>50px</option>
        </select>
      )}
    </div>
  );
}
