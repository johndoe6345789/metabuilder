/**
 * PushNotificationSettings Component
 * Sound and desktop notification preferences
 */

import React from 'react';

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
    <div >
      <h3 >Sound & Desktop</h3>

      <div >
        <label >
          <input
            type="checkbox"
            checked={soundEnabled}
            onChange={(e) => onSettingChange('soundEnabled', e.target.checked)}
          />
          <span>Enable Sound</span>
        </label>
        <p >Play sound when notifications arrive</p>
      </div>

      <div >
        <label >
          <input
            type="checkbox"
            checked={desktopNotifications}
            onChange={(e) => onSettingChange('desktopNotifications', e.target.checked)}
          />
          <span>Desktop Notifications</span>
        </label>
        <p >Show browser desktop notifications</p>
      </div>
    </div>
  );
};

export default PushNotificationSettings;
