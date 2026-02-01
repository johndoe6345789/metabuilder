/**
 * AccountDeletionSettings Component
 * Account deletion with email confirmation
 */

import React, { useState, useCallback } from 'react';

interface AccountDeletionSettingsProps {
  userEmail?: string;
  onAccountDeleted?: () => void;
}

export const AccountDeletionSettings: React.FC<AccountDeletionSettingsProps> = ({
  userEmail = 'john@example.com',
  onAccountDeleted
}) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = useCallback(() => {
    setShowConfirm(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (confirmEmail !== userEmail) {
      alert('Email does not match. Please try again.');
      return;
    }

    setIsDeleting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      if (onAccountDeleted) {
        onAccountDeleted();
      }
    } catch (error) {
      alert('Failed to delete account. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  }, [confirmEmail, userEmail, onAccountDeleted]);

  const handleCancel = useCallback(() => {
    setShowConfirm(false);
    setConfirmEmail('');
  }, []);

  return (
    <div className={""}>
      <h3 >Danger Zone</h3>
      <p >
        These actions are permanent and cannot be undone
      </p>

      {!showConfirm ? (
        <button
          className={""}
          onClick={handleDeleteClick}
        >
          Delete Account
        </button>
      ) : (
        <div >
          <div >
            <p >Are you sure?</p>
            <p >
              Deleting your account is permanent. All your data, workflows, and
              projects will be permanently deleted and cannot be recovered.
            </p>
          </div>

          <div >
            <label htmlFor="deleteEmail" >
              Type your email to confirm:
            </label>
            <input
              id="deleteEmail"
              type="email"
              value={confirmEmail}
              onChange={(e) => setConfirmEmail(e.target.value)}
              
              placeholder={userEmail}
            />
            <p >We need to confirm you own this account</p>
          </div>

          <div >
            <button
              className={""}
              onClick={handleConfirmDelete}
              disabled={isDeleting || confirmEmail !== userEmail}
            >
              {isDeleting ? 'Deleting...' : 'Delete Account Permanently'}
            </button>
            <button  onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountDeletionSettings;
