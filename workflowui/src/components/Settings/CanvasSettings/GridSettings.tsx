/**
 * GridSettings Component
 * Grid appearance and snapping preferences
 */

import React from 'react';
import styles from '../sections.module.scss';

interface GridSettingsProps {
  gridVisible: boolean;
  gridSnapping: boolean;
  gridSize: number;
  gridStyle: 'dots' | 'lines';
  onSettingChange: (key: string, value: any) => void;
}

export const GridSettings: React.FC<GridSettingsProps> = ({
  gridVisible,
  gridSnapping,
  gridSize,
  gridStyle,
  onSettingChange,
}) => {
  return (
    <div className={styles.subsection}>
      <h3 className={styles.subsectionTitle}>Canvas Appearance</h3>

      <div className={styles.settingRow}>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={gridVisible}
            onChange={(e) => onSettingChange('gridVisible', e.target.checked)}
          />
          <span>Show Grid</span>
        </label>
        <p className={styles.settingDescription}>Display grid background on canvas</p>
      </div>

      <div className={styles.settingRow}>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={gridSnapping}
            onChange={(e) => onSettingChange('gridSnapping', e.target.checked)}
          />
          <span>Enable Grid Snapping</span>
        </label>
        <p className={styles.settingDescription}>Snap workflow cards to grid</p>
      </div>

      {gridSnapping && (
        <>
          <div className={styles.settingRow}>
            <label htmlFor="gridSize" className={styles.label}>
              Grid Size: <span className={styles.value}>{gridSize}px</span>
            </label>
            <input
              id="gridSize"
              type="range"
              min="5"
              max="50"
              step="5"
              value={gridSize}
              onChange={(e) => onSettingChange('gridSize', parseInt(e.target.value))}
              className={styles.slider}
            />
          </div>

          <div className={styles.settingRow}>
            <label htmlFor="gridStyle" className={styles.label}>
              Grid Style
            </label>
            <select
              id="gridStyle"
              value={gridStyle}
              onChange={(e) => onSettingChange('gridStyle', e.target.value)}
              className={styles.select}
            >
              <option value="dots">Dots</option>
              <option value="lines">Lines</option>
            </select>
          </div>
        </>
      )}
    </div>
  );
};

export default GridSettings;
