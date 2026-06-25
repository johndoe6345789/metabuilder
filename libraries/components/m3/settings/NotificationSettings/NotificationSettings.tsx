/**
 * NotificationSettings Component
 * Notification preferences and email subscriptions (main composer)
 */

import React, { useState, useCallback } from 'react';
import { InAppNotificationSettings } from './InAppNotificationSettings';
import { EmailNotificationSettings } from './EmailNotificationSettings';
import { PushNotificationSettings } from './PushNotificationSettings';
import { NotificationHistorySettings } from './NotificationHistorySettings';
import { testId } from '../accessibility';

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
    <section

      data-testid={testId.settingsNotificationSection()}
      aria-label="Notification settings"
    >
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

      <div >
        <button
          className={""}
          onClick={handleSave}
          disabled={isSaving}
          data-testid={testId.settingsButton('save-preferences')}
          aria-busy={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save Preferences'}
        </button>
        {saveMessage && (
          <p

            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            {saveMessage}
          </p>
        )}
      </div>
    </section>
  );
};

export default NotificationSettings;
