/**
 * PushNotificationSettings Component
 * Sound and desktop notification preferences
 */

import React from 'react';
import styles from '../sections.module.scss';

interface PushNotificationSettingsProps {
  soundEnabled: boolean;
  desktopNotifications: boolean;
  onSettingChange: (key: string, value: any) => void;
}

export const PushNotificationSettings: React.FC<PushNotificationSettingsProps> = ({
  soundEnabled,
  desktopNotifications,
  onSettingChange,
}) => {
  return (
    <div className={styles.subsection}>
      <h3 className={styles.subsectionTitle}>Sound & Desktop</h3>

      <div className={styles.settingRow}>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={soundEnabled}
            onChange={(e) => onSettingChange('soundEnabled', e.target.checked)}
          />
          <span>Enable Sound</span>
        </label>
        <p className={styles.settingDescription}>Play sound when notifications arrive</p>
      </div>

      <div className={styles.settingRow}>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={desktopNotifications}
            onChange={(e) => onSettingChange('desktopNotifications', e.target.checked)}
          />
          <span>Desktop Notifications</span>
        </label>
        <p className={styles.settingDescription}>Show browser desktop notifications</p>
      </div>
    </div>
  );
};

export default PushNotificationSettings;
