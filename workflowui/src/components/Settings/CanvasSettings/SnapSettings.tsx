/**
 * SnapSettings Component
 * Auto-save and pan hotkey preferences
 */

import React from 'react';
import styles from '../sections.module.scss';

interface SnapSettingsProps {
  autoSave: boolean;
  autoSaveInterval: number;
  zoomInvert: boolean;
  panDirection: 'shift' | 'space' | 'middle';
  onSettingChange: (key: string, value: any) => void;
}

export const SnapSettings: React.FC<SnapSettingsProps> = ({
  autoSave,
  autoSaveInterval,
  zoomInvert,
  panDirection,
  onSettingChange,
}) => {
  return (
    <div className={styles.subsection}>
      <h3 className={styles.subsectionTitle}>Canvas Behavior</h3>

      <div className={styles.settingRow}>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={autoSave}
            onChange={(e) => onSettingChange('autoSave', e.target.checked)}
          />
          <span>Auto-Save</span>
        </label>
        <p className={styles.settingDescription}>Automatically save canvas state</p>
      </div>

      {autoSave && (
        <div className={styles.settingRow}>
          <label htmlFor="autoSaveInterval" className={styles.label}>
            Save Interval: <span className={styles.value}>{autoSaveInterval}s</span>
          </label>
          <input
            id="autoSaveInterval"
            type="range"
            min="10"
            max="120"
            step="10"
            value={autoSaveInterval}
            onChange={(e) => onSettingChange('autoSaveInterval', parseInt(e.target.value))}
            className={styles.slider}
          />
        </div>
      )}

      <div className={styles.settingRow}>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={zoomInvert}
            onChange={(e) => onSettingChange('zoomInvert', e.target.checked)}
          />
          <span>Invert Zoom Direction</span>
        </label>
        <p className={styles.settingDescription}>Reverse scroll wheel zoom direction</p>
      </div>

      <div className={styles.settingRow}>
        <label htmlFor="panDirection" className={styles.label}>
          Pan Hotkey
        </label>
        <select
          id="panDirection"
          value={panDirection}
          onChange={(e) => onSettingChange('panDirection', e.target.value)}
          className={styles.select}
        >
          <option value="shift">Shift + Drag</option>
          <option value="space">Space + Drag</option>
          <option value="middle">Middle Mouse Button</option>
        </select>
      </div>
    </div>
  );
};

export default SnapSettings;
