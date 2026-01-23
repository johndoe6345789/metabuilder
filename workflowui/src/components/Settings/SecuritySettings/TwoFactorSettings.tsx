/**
 * TwoFactorSettings Component
 * Two-factor authentication management
 */

import React, { useState, useCallback } from 'react';

interface TwoFactorSettingsProps {
  onStatusChange?: (enabled: boolean) => void;
}

export const TwoFactorSettings: React.FC<TwoFactorSettingsProps> = ({ onStatusChange }) => {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [isEnabling, setIsEnabling] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [showBackupCodes, setShowBackupCodes] = useState(false);

  const handleEnableTwoFactor = useCallback(async () => {
    setShowSetup(true);
  }, []);

  const handleVerifyAndEnable = useCallback(async () => {
    if (verificationCode.length !== 6) {
      alert('Please enter a valid 6-digit code');
      return;
    }

    setIsEnabling(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      setTwoFactorEnabled(true);
      setShowSetup(false);
      setShowBackupCodes(true);
      setBackupCodes([
        'XXXX-XXXX-XXXX',
        'YYYY-YYYY-YYYY',
        'ZZZZ-ZZZZ-ZZZZ'
      ]);
      if (onStatusChange) onStatusChange(true);
    } catch (error) {
      alert('Failed to enable 2FA. Please try again.');
    } finally {
      setIsEnabling(false);
    }
  }, [verificationCode, onStatusChange]);

  const handleDisableTwoFactor = useCallback(async () => {
    if (confirm('Are you sure you want to disable two-factor authentication?')) {
      setTwoFactorEnabled(false);
      if (onStatusChange) onStatusChange(false);
    }
  }, [onStatusChange]);

  return (
    <div >
      <h3 >Two-Factor Authentication</h3>
      <p >
        Add an extra layer of security to your account
      </p>

      <div >
        <span>Status:</span>
        <span
          className={
            twoFactorEnabled ? "enabled" : "disabled"
          }
        >
          {twoFactorEnabled ? 'Enabled' : 'Not Enabled'}
        </span>
      </div>

      {!twoFactorEnabled && !showSetup && (
        <button
          className={""}
          onClick={handleEnableTwoFactor}
        >
          Enable 2FA
        </button>
      )}

      {showSetup && !twoFactorEnabled && (
        <div >
          <p >
            Scan this QR code with your authenticator app, then enter the 6-digit code:
          </p>
          <div >
            <label htmlFor="verificationCode" >
              Verification Code
            </label>
            <input
              id="verificationCode"
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.slice(0, 6))}
              
              placeholder="000000"
              maxLength={6}
            />
          </div>
          <div >
            <button
              className={""}
              onClick={handleVerifyAndEnable}
              disabled={isEnabling}
            >
              {isEnabling ? 'Enabling...' : 'Verify & Enable'}
            </button>
            <button  onClick={() => setShowSetup(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {showBackupCodes && twoFactorEnabled && (
        <div >
          <p >Save these backup codes in a safe place:</p>
          <div >
            {backupCodes.map((code, idx) => (
              <div key={idx} >
                {code}
              </div>
            ))}
          </div>
          <button
            className={""}
            onClick={() => setShowBackupCodes(false)}
          >
            I Saved My Backup Codes
          </button>
        </div>
      )}

      {twoFactorEnabled && !showBackupCodes && (
        <button
          className={""}
          onClick={handleDisableTwoFactor}
        >
          Disable 2FA
        </button>
      )}
    </div>
  );
};

export default TwoFactorSettings;
