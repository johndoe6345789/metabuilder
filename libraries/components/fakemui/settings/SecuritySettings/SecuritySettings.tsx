/**
 * SecuritySettings Component
 * Main composition component for security-related settings
 */

import React, { useCallback } from 'react';
import { PasswordSecuritySettings } from './PasswordSecuritySettings';
import { TwoFactorSettings } from './TwoFactorSettings';
import { SessionManagementSettings } from './SessionManagementSettings';
import { AccountDeletionSettings } from './AccountDeletionSettings';
import { testId } from '../accessibility';

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
    <section

      data-testid={testId.settingsSecuritySection()}
      aria-label="Security settings"
    >
      <PasswordSecuritySettings onPasswordChanged={handlePasswordChanged} />
      <SessionManagementSettings onSessionsCleared={handleSessionsCleared} />
      <TwoFactorSettings onStatusChange={handleTwoFactorStatusChange} />
      <AccountDeletionSettings
        userEmail={userEmail}
        onAccountDeleted={onAccountDeleted}
      />
    </section>
  );
};

export default SecuritySettings;
