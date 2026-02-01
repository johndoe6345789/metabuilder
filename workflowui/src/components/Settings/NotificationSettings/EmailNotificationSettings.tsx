/**
 * EmailNotificationSettings Component
 * Email notification preferences
 */

import React from 'react';

interface EmailNotificationSettingsProps {
  emailExecutionSummary: boolean;
  emailWeeklyDigest: boolean;
  emailSecurityAlerts: boolean;
  emailProductUpdates: boolean;
  onSettingChange: (key: string, value: any) => void;
}

export const EmailNotificationSettings: React.FC<EmailNotificationSettingsProps> = ({
  emailExecutionSummary,
  emailWeeklyDigest,
  emailSecurityAlerts,
  emailProductUpdates,
  onSettingChange,
}) => {
  return (
    <div >
      <h3 >Email Notifications</h3>
      <p >
        Receive email summaries and alerts
      </p>

      <div >
        <label >
          <input
            type="checkbox"
            checked={emailExecutionSummary}
            onChange={(e) => onSettingChange('emailExecutionSummary', e.target.checked)}
          />
          <span>Execution Summary</span>
        </label>
        <p >Daily summary of workflow executions</p>
      </div>

      <div >
        <label >
          <input
            type="checkbox"
            checked={emailWeeklyDigest}
            onChange={(e) => onSettingChange('emailWeeklyDigest', e.target.checked)}
          />
          <span>Weekly Digest</span>
        </label>
        <p >Weekly summary of activity and insights</p>
      </div>

      <div >
        <label >
          <input
            type="checkbox"
            checked={emailSecurityAlerts}
            onChange={(e) => onSettingChange('emailSecurityAlerts', e.target.checked)}
          />
          <span>Security Alerts</span>
        </label>
        <p >Important security and login notifications</p>
      </div>

      <div >
        <label >
          <input
            type="checkbox"
            checked={emailProductUpdates}
            onChange={(e) => onSettingChange('emailProductUpdates', e.target.checked)}
          />
          <span>Product Updates</span>
        </label>
        <p >New features and product announcements</p>
      </div>
    </div>
  );
};

export default EmailNotificationSettings;
