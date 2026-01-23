/** PasswordSecuritySettings Component - Password change management */

import React, { useState, useCallback } from 'react';
import styles from '../sections.module.scss';

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const PasswordSecuritySettings: React.FC<{ onPasswordChanged?: () => void }> = ({
  onPasswordChanged
}) => {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<PasswordForm>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [isChanging, setIsChanging] = useState(false);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  }, []);

  const validatePassword = useCallback((): boolean => {
    if (form.newPassword !== form.confirmPassword) {
      setError('New passwords do not match');
      return false;
    }
    if (form.newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.newPassword)) {
      setError('Password must contain uppercase, lowercase, and numbers');
      return false;
    }
    return true;
  }, [form.newPassword, form.confirmPassword]);

  const handleChangePassword = useCallback(async () => {
    if (!validatePassword()) return;
    setIsChanging(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowForm(false);
      onPasswordChanged?.();
    } catch (err) {
      setError('Failed to change password. Please try again.');
    } finally {
      setIsChanging(false);
    }
  }, [validatePassword, onPasswordChanged]);

  return (
    <div className={styles.subsection}>
      <h3 className={styles.subsectionTitle}>Change Password</h3>
      <p className={styles.description}>Keep your account secure with a strong password</p>
      {!showForm ? (
        <button
          className={`${styles.button} ${styles.secondary}`}
          onClick={() => setShowForm(true)}
        >
          Change Password
        </button>
      ) : (
        <div className={styles.formContainer}>
          <div className={styles.formGroup}>
            <label htmlFor="currentPassword" className={styles.label}>Current Password</label>
            <input
              id="currentPassword"
              type="password"
              name="currentPassword"
              value={form.currentPassword}
              onChange={handleInputChange}
              className={styles.input}
              placeholder="Enter your current password"
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="newPassword" className={styles.label}>New Password</label>
            <input
              id="newPassword"
              type="password"
              name="newPassword"
              value={form.newPassword}
              onChange={handleInputChange}
              className={styles.input}
              placeholder="Enter new password"
            />
            <p className={styles.hint}>Min 8 chars: uppercase, lowercase, numbers</p>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword" className={styles.label}>Confirm New Password</label>
            <input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleInputChange}
              className={styles.input}
              placeholder="Confirm new password"
            />
          </div>
          {error && <p className={styles.error}>{error}</p>}
          <div className={styles.actions}>
            <button
              className={`${styles.button} ${styles.primary}`}
              onClick={handleChangePassword}
              disabled={isChanging}
            >
              {isChanging ? 'Changing...' : 'Change Password'}
            </button>
            <button className={styles.button} onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PasswordSecuritySettings;
