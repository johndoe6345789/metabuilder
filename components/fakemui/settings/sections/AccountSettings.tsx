/**
 * AccountSettings Component
 * User profile and account information
 */

import React, { useState, useCallback } from 'react';
import { testId, aria } from '../accessibility';

export const AccountSettings: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: 'John Doe',
    email: 'john@example.com',
    username: 'johndoe',
    bio: 'Workflow enthusiast'
  });
  const [originalData] = useState(formData);
  const [isSaving, setIsSaving] = useState(false);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      // API call would go here
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsEditing(false);
      // Show success notification
    } catch (error) {
      console.error('Failed to save profile:', error);
    } finally {
      setIsSaving(false);
    }
  }, []);

  const handleCancel = useCallback(() => {
    setFormData(originalData);
    setIsEditing(false);
  }, [originalData]);

  return (
    <section  data-testid={testId.settingsPanel()} aria-label="Account settings">
      <h2  id="account-settings-title">Profile Information</h2>

      {/* Avatar Section */}
      <div >
        <div >
          <img
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=johndoe"
            alt="User avatar"

          />
        </div>
        {isEditing && (
          <button >Change Avatar</button>
        )}
      </div>

      {/* Form Fields */}
      <div >
        <label htmlFor="fullName" >
          Full Name
        </label>
        <input
          id="fullName"
          type="text"
          name="fullName"
          value={formData.fullName}
          onChange={handleInputChange}
          disabled={!isEditing}
          className={""}
        />
      </div>

      <div >
        <label htmlFor="email" >
          Email Address
        </label>
        <input
          id="email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          disabled={!isEditing}
          className={""}
        />
        <p >Your email is used for login and notifications</p>
      </div>

      <div >
        <label htmlFor="username" >
          Username
        </label>
        <input
          id="username"
          type="text"
          name="username"
          value={formData.username}
          onChange={handleInputChange}
          disabled={!isEditing}
          className={""}
        />
        <p >Your unique identifier on the platform</p>
      </div>

      <div >
        <label htmlFor="bio" >
          Bio
        </label>
        <textarea
          id="bio"
          name="bio"
          value={formData.bio}
          onChange={handleInputChange}
          disabled={!isEditing}
          className={""}
          rows={4}
        />
        <p >Tell us about yourself (optional)</p>
      </div>

      {/* Action Buttons */}
      <div >
        {!isEditing ? (
          <button
            className={""}
            onClick={() => setIsEditing(true)}
            data-testid={testId.settingsButton('edit-profile')}
          >
            Edit Profile
          </button>
        ) : (
          <>
            <button
              className={""}
              onClick={handleSave}
              disabled={isSaving}
              data-testid={testId.settingsButton('save-profile')}
              aria-busy={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
            <button

              onClick={handleCancel}
              data-testid={testId.settingsButton('cancel-profile')}
            >
              Cancel
            </button>
          </>
        )}
      </div>

      {/* Account Info */}
      <div  role="region" aria-label="Account information">
        <h3 >Account Information</h3>
        <div >
          <span >Account Created:</span>
          <span >January 15, 2024</span>
        </div>
        <div >
          <span >Last Login:</span>
          <span >Today at 2:34 PM</span>
        </div>
        <div >
          <span >Active Sessions:</span>
          <span >2</span>
        </div>
      </div>
    </section>
  );
};

export default AccountSettings;
