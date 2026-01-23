/**
 * LayoutSettings Component
 * Workflow card appearance preferences
 */

import React from 'react';
import styles from '../sections.module.scss';

interface LayoutSettingsProps {
  cardPreviewSize: 'small' | 'medium' | 'large';
  showCardDescriptions: boolean;
  cardAnimations: boolean;
  onSettingChange: (key: string, value: any) => void;
}

export const LayoutSettings: React.FC<LayoutSettingsProps> = ({
  cardPreviewSize,
  showCardDescriptions,
  cardAnimations,
  onSettingChange,
}) => {
  return (
    <div className={styles.subsection}>
      <h3 className={styles.subsectionTitle}>Workflow Cards</h3>

      <div className={styles.settingRow}>
        <label htmlFor="cardPreviewSize" className={styles.label}>
          Preview Size
        </label>
        <select
          id="cardPreviewSize"
          value={cardPreviewSize}
          onChange={(e) => onSettingChange('cardPreviewSize', e.target.value)}
          className={styles.select}
        >
          <option value="small">Small (200x150)</option>
          <option value="medium">Medium (300x200)</option>
          <option value="large">Large (400x250)</option>
        </select>
      </div>

      <div className={styles.settingRow}>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={showCardDescriptions}
            onChange={(e) => onSettingChange('showCardDescriptions', e.target.checked)}
          />
          <span>Show Card Descriptions</span>
        </label>
        <p className={styles.settingDescription}>Display workflow descriptions in cards</p>
      </div>

      <div className={styles.settingRow}>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={cardAnimations}
            onChange={(e) => onSettingChange('cardAnimations', e.target.checked)}
          />
          <span>Enable Animations</span>
        </label>
        <p className={styles.settingDescription}>Smooth transitions and hover effects</p>
      </div>
    </div>
  );
};

export default LayoutSettings;
