/**
 * ViewportSettings Component
 * Viewport zoom defaults
 */

import React from 'react';
import styles from '../sections.module.scss';

interface ViewportSettingsProps {
  defaultZoom: number;
  minZoom: number;
  maxZoom: number;
  onSettingChange: (key: string, value: any) => void;
}

export const ViewportSettings: React.FC<ViewportSettingsProps> = ({
  defaultZoom,
  minZoom,
  maxZoom,
  onSettingChange,
}) => {
  return (
    <div className={styles.subsection}>
      <h3 className={styles.subsectionTitle}>Viewport Defaults</h3>

      <div className={styles.settingRow}>
        <label htmlFor="defaultZoom" className={styles.label}>
          Default Zoom: <span className={styles.value}>{defaultZoom}%</span>
        </label>
        <input
          id="defaultZoom"
          type="range"
          min="50"
          max="200"
          step="10"
          value={defaultZoom}
          onChange={(e) => onSettingChange('defaultZoom', parseInt(e.target.value))}
          className={styles.slider}
        />
      </div>

      <div className={styles.settingRow}>
        <label htmlFor="minZoom" className={styles.label}>
          Minimum Zoom: <span className={styles.value}>{minZoom}%</span>
        </label>
        <input
          id="minZoom"
          type="range"
          min="5"
          max="100"
          step="5"
          value={minZoom}
          onChange={(e) => onSettingChange('minZoom', parseInt(e.target.value))}
          className={styles.slider}
        />
      </div>

      <div className={styles.settingRow}>
        <label htmlFor="maxZoom" className={styles.label}>
          Maximum Zoom: <span className={styles.value}>{maxZoom}%</span>
        </label>
        <input
          id="maxZoom"
          type="range"
          min="200"
          max="500"
          step="50"
          value={maxZoom}
          onChange={(e) => onSettingChange('maxZoom', parseInt(e.target.value))}
          className={styles.slider}
        />
      </div>
    </div>
  );
};

export default ViewportSettings;
