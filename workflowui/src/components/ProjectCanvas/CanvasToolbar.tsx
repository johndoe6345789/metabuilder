/**
 * CanvasToolbar Component
 * Floating toolbar for canvas operations (zoom, grid, auto-layout)
 */

import React, { useCallback } from 'react';
import { useProjectCanvas } from '../../hooks/canvas';
import styles from './CanvasToolbar.module.scss';

interface CanvasToolbarProps {
  onAddWorkflow?: () => void;
  onAutoLayout?: () => void;
  onOpenSettings?: () => void;
}

export const CanvasToolbar: React.FC<CanvasToolbarProps> = ({
  onAddWorkflow,
  onAutoLayout,
  onOpenSettings
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
    set_snap_size
  } = useProjectCanvas();

  const handleSnapSizeChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      set_snap_size(parseInt(e.target.value, 10));
    },
    [set_snap_size]
  );

  return (
    <div className={styles.toolbar}>
      {/* Zoom Controls */}
      <div className={styles.group}>
        <button
          className={styles.button}
          onClick={zoom_out}
          title="Zoom out"
          aria-label="Zoom out"
        >
          −
        </button>
        <span className={styles.value}>{Math.round(zoom * 100)}%</span>
        <button
          className={styles.button}
          onClick={zoom_in}
          title="Zoom in"
          aria-label="Zoom in"
        >
          +
        </button>
        <button
          className={styles.button}
          onClick={reset_view}
          title="Reset view"
          aria-label="Reset view"
        >
          ⟲
        </button>
      </div>

      {/* Divider */}
      <div className={styles.divider} />

      {/* Grid Controls */}
      <div className={styles.group}>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={showGrid}
            onChange={toggle_show_grid}
            aria-label="Toggle grid visibility"
          />
          <span>Grid</span>
        </label>

        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={gridSnap}
            onChange={toggle_grid_snap}
            aria-label="Toggle grid snap"
          />
          <span>Snap</span>
        </label>

        {gridSnap && (
          <select
            className={styles.select}
            value={snapSize}
            onChange={handleSnapSizeChange}
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

      {/* Divider */}
      <div className={styles.divider} />

      {/* Actions */}
      <div className={styles.group}>
        {onAddWorkflow && (
          <button
            className={`${styles.button} ${styles.primary}`}
            onClick={onAddWorkflow}
            title="Add workflow to canvas"
            aria-label="Add workflow"
          >
            + Add Workflow
          </button>
        )}

        {onAutoLayout && (
          <button
            className={styles.button}
            onClick={onAutoLayout}
            title="Auto-arrange workflows"
            aria-label="Auto-layout"
          >
            ⊞ Layout
          </button>
        )}

        {onOpenSettings && (
          <button
            className={styles.button}
            onClick={onOpenSettings}
            title="Canvas settings"
            aria-label="Settings"
          >
            ⚙
          </button>
        )}
      </div>
    </div>
  );
};

export default CanvasToolbar;
