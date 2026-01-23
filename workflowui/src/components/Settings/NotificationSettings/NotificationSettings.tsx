/**
 * NotificationSettings Component
 * Notification preferences and email subscriptions (main composer)
 */

import React, { useState, useCallback } from 'react';
import { InAppNotificationSettings } from './InAppNotificationSettings';
import { EmailNotificationSettings } from './EmailNotificationSettings';
import { PushNotificationSettings } from './PushNotificationSettings';
import { NotificationHistorySettings } from './NotificationHistorySettings';
import styles from '../sections.module.scss';

interface NotificationSettingsState {
  // In-App Notifications
  workflowExecuted: boolean;
  workflowFailed: boolean;
  projectShared: boolean;
  collaboratorJoined: boolean;

  // Email Notifications
  emailExecutionSummary: boolean;
  emailWeeklyDigest: boolean;
  emailSecurityAlerts: boolean;
  emailProductUpdates: boolean;

  // Sound & Desktop
  soundEnabled: boolean;
  desktopNotifications: boolean;
}

export const NotificationSettings: React.FC = () => {
  const [settings, setSettings] = useState<NotificationSettingsState>({
    // In-App Notifications
    workflowExecuted: true,
    workflowFailed: true,
    projectShared: true,
    collaboratorJoined: true,

    // Email Notifications
    emailExecutionSummary: true,
    emailWeeklyDigest: true,
    emailSecurityAlerts: true,
    emailProductUpdates: false,

    // Sound & Desktop
    soundEnabled: true,
    desktopNotifications: true,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const handleSettingChange = useCallback((key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaveMessage('');
  }, []);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      setSaveMessage('✓ Preferences saved');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      setSaveMessage('✗ Failed to save preferences');
    } finally {
      setIsSaving(false);
    }
  }, []);

  const handleClearHistoryItem = useCallback((id: string) => {
    // TODO: Implement clear single history item
  }, []);

  const handleClearAllHistory = useCallback(() => {
    // TODO: Implement clear all history
  }, []);

  return (
    <div className={styles.section}>
      <InAppNotificationSettings
        workflowExecuted={settings.workflowExecuted}
        workflowFailed={settings.workflowFailed}
        projectShared={settings.projectShared}
        collaboratorJoined={settings.collaboratorJoined}
        onSettingChange={handleSettingChange}
      />

      <EmailNotificationSettings
        emailExecutionSummary={settings.emailExecutionSummary}
        emailWeeklyDigest={settings.emailWeeklyDigest}
        emailSecurityAlerts={settings.emailSecurityAlerts}
        emailProductUpdates={settings.emailProductUpdates}
        onSettingChange={handleSettingChange}
      />

      <PushNotificationSettings
        soundEnabled={settings.soundEnabled}
        desktopNotifications={settings.desktopNotifications}
        onSettingChange={handleSettingChange}
      />

      <NotificationHistorySettings
        onClearItem={handleClearHistoryItem}
        onClearAll={handleClearAllHistory}
      />

      <div className={styles.saveSection}>
        <button
          className={`${styles.button} ${styles.primary}`}
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save Preferences'}
        </button>
        {saveMessage && <p className={styles.saveMessage}>{saveMessage}</p>}
      </div>
    </div>
  );
};

export default NotificationSettings;
