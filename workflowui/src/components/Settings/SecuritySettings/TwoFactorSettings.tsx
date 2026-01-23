/**
 * TwoFactorSettings Component
 * Two-factor authentication management
 */

import React, { useState, useCallback } from 'react';
import styles from '../sections.module.scss';

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
    <div className={styles.subsection}>
      <h3 className={styles.subsectionTitle}>Two-Factor Authentication</h3>
      <p className={styles.description}>
        Add an extra layer of security to your account
      </p>

      <div className={styles.statusRow}>
        <span>Status:</span>
        <span
          className={
            twoFactorEnabled ? styles.statusEnabled : styles.statusDisabled
          }
        >
          {twoFactorEnabled ? 'Enabled' : 'Not Enabled'}
        </span>
      </div>

      {!twoFactorEnabled && !showSetup && (
        <button
          className={`${styles.button} ${styles.secondary}`}
          onClick={handleEnableTwoFactor}
        >
          Enable 2FA
        </button>
      )}

      {showSetup && !twoFactorEnabled && (
        <div className={styles.formContainer}>
          <p className={styles.hint}>
            Scan this QR code with your authenticator app, then enter the 6-digit code:
          </p>
          <div className={styles.formGroup}>
            <label htmlFor="verificationCode" className={styles.label}>
              Verification Code
            </label>
            <input
              id="verificationCode"
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.slice(0, 6))}
              className={styles.input}
              placeholder="000000"
              maxLength={6}
            />
          </div>
          <div className={styles.actions}>
            <button
              className={`${styles.button} ${styles.primary}`}
              onClick={handleVerifyAndEnable}
              disabled={isEnabling}
            >
              {isEnabling ? 'Enabling...' : 'Verify & Enable'}
            </button>
            <button className={styles.button} onClick={() => setShowSetup(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {showBackupCodes && twoFactorEnabled && (
        <div className={styles.formContainer}>
          <p className={styles.hint}>Save these backup codes in a safe place:</p>
          <div className={styles.codesList}>
            {backupCodes.map((code, idx) => (
              <div key={idx} className={styles.codeItem}>
                {code}
              </div>
            ))}
          </div>
          <button
            className={`${styles.button} ${styles.primary}`}
            onClick={() => setShowBackupCodes(false)}
          >
            I Saved My Backup Codes
          </button>
        </div>
      )}

      {twoFactorEnabled && !showBackupCodes && (
        <button
          className={`${styles.button} ${styles.danger}`}
          onClick={handleDisableTwoFactor}
        >
          Disable 2FA
        </button>
      )}
    </div>
  );
};

export default TwoFactorSettings;
