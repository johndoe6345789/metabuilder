/**
 * InAppNotificationSettings Component
 * In-app notification preferences
 */

import React from 'react';
import styles from '../sections.module.scss';

interface InAppNotificationSettingsProps {
  workflowExecuted: boolean;
  workflowFailed: boolean;
  projectShared: boolean;
  collaboratorJoined: boolean;
  onSettingChange: (key: string, value: any) => void;
}

export const InAppNotificationSettings: React.FC<InAppNotificationSettingsProps> = ({
  workflowExecuted,
  workflowFailed,
  projectShared,
  collaboratorJoined,
  onSettingChange,
}) => {
  return (
    <div className={styles.subsection}>
      <h3 className={styles.subsectionTitle}>In-App Notifications</h3>
      <p className={styles.description}>
        Get notified about important events while using WorkflowUI
      </p>

      <div className={styles.settingRow}>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={workflowExecuted}
            onChange={(e) => onSettingChange('workflowExecuted', e.target.checked)}
          />
          <span>Workflow Executed</span>
        </label>
        <p className={styles.settingDescription}>Notify when a workflow completes</p>
      </div>

      <div className={styles.settingRow}>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={workflowFailed}
            onChange={(e) => onSettingChange('workflowFailed', e.target.checked)}
          />
          <span>Workflow Failed</span>
        </label>
        <p className={styles.settingDescription}>Alert when a workflow encounters an error</p>
      </div>

      <div className={styles.settingRow}>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={projectShared}
            onChange={(e) => onSettingChange('projectShared', e.target.checked)}
          />
          <span>Project Shared</span>
        </label>
        <p className={styles.settingDescription}>Notify when someone shares a project</p>
      </div>

      <div className={styles.settingRow}>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={collaboratorJoined}
            onChange={(e) => onSettingChange('collaboratorJoined', e.target.checked)}
          />
          <span>Collaborator Joined</span>
        </label>
        <p className={styles.settingDescription}>Notify when someone joins your project</p>
      </div>
    </div>
  );
};

export default InAppNotificationSettings;
