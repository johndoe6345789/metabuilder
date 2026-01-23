/**
 * SecuritySettings Component
 * Main composition component for security-related settings
 */

import React, { useCallback } from 'react';
import { PasswordSecuritySettings } from './PasswordSecuritySettings';
import { TwoFactorSettings } from './TwoFactorSettings';
import { SessionManagementSettings } from './SessionManagementSettings';
import { AccountDeletionSettings } from './AccountDeletionSettings';
import styles from '../sections.module.scss';

interface SecuritySettingsProps {
  onAccountDeleted?: () => void;
  userEmail?: string;
}

export const SecuritySettings: React.FC<SecuritySettingsProps> = ({
  onAccountDeleted,
  userEmail = 'john@example.com'
}) => {
  const handlePasswordChanged = useCallback(() => {
    // Could trigger notification here
  }, []);

  const handleTwoFactorStatusChange = useCallback((enabled: boolean) => {
    // Could trigger notification here
  }, []);

  const handleSessionsCleared = useCallback(() => {
    // Could trigger notification here
  }, []);

  return (
    <div className={styles.section}>
      <PasswordSecuritySettings onPasswordChanged={handlePasswordChanged} />
      <SessionManagementSettings onSessionsCleared={handleSessionsCleared} />
      <TwoFactorSettings onStatusChange={handleTwoFactorStatusChange} />
      <AccountDeletionSettings
        userEmail={userEmail}
        onAccountDeleted={onAccountDeleted}
      />
    </div>
  );
};

export default SecuritySettings;
