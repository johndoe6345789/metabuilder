/**
 * PerformanceSettings Component
 * Canvas performance optimization preferences
 */

import React from 'react';
import styles from '../sections.module.scss';

interface PerformanceSettingsProps {
  enableVirtualization: boolean;
  maxConcurrentRenders: number;
  onSettingChange: (key: string, value: any) => void;
}

export const ZoomSettings: React.FC<PerformanceSettingsProps> = ({
  enableVirtualization,
  maxConcurrentRenders,
  onSettingChange,
}) => {
  return (
    <div className={styles.subsection}>
      <h3 className={styles.subsectionTitle}>Performance</h3>

      <div className={styles.settingRow}>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={enableVirtualization}
            onChange={(e) => onSettingChange('enableVirtualization', e.target.checked)}
          />
          <span>Enable Virtualization</span>
        </label>
        <p className={styles.settingDescription}>
          Only render visible cards (recommended for 100+ workflows)
        </p>
      </div>

      {enableVirtualization && (
        <div className={styles.settingRow}>
          <label htmlFor="maxRenders" className={styles.label}>
            Max Concurrent Renders:{' '}
            <span className={styles.value}>{maxConcurrentRenders}</span>
          </label>
          <input
            id="maxRenders"
            type="range"
            min="10"
            max="200"
            step="10"
            value={maxConcurrentRenders}
            onChange={(e) => onSettingChange('maxConcurrentRenders', parseInt(e.target.value))}
            className={styles.slider}
          />
        </div>
      )}
    </div>
  );
};

export default ZoomSettings;
