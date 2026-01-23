/** PasswordSecuritySettings Component - Password change management */

import React, { useState, useCallback } from 'react';

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
    <div >
      <h3 >Change Password</h3>
      <p >Keep your account secure with a strong password</p>
      {!showForm ? (
        <button
          className={""}
          onClick={() => setShowForm(true)}
        >
          Change Password
        </button>
      ) : (
        <div >
          <div >
            <label htmlFor="currentPassword" >Current Password</label>
            <input
              id="currentPassword"
              type="password"
              name="currentPassword"
              value={form.currentPassword}
              onChange={handleInputChange}
              
              placeholder="Enter your current password"
            />
          </div>
          <div >
            <label htmlFor="newPassword" >New Password</label>
            <input
              id="newPassword"
              type="password"
              name="newPassword"
              value={form.newPassword}
              onChange={handleInputChange}
              
              placeholder="Enter new password"
            />
            <p >Min 8 chars: uppercase, lowercase, numbers</p>
          </div>
          <div >
            <label htmlFor="confirmPassword" >Confirm New Password</label>
            <input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleInputChange}
              
              placeholder="Confirm new password"
            />
          </div>
          {error && <p >{error}</p>}
          <div >
            <button
              className={""}
              onClick={handleChangePassword}
              disabled={isChanging}
            >
              {isChanging ? 'Changing...' : 'Change Password'}
            </button>
            <button  onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PasswordSecuritySettings;
