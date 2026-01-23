/**
 * AccountSettings Component
 * User profile and account information
 */

import React, { useState, useCallback } from 'react';
import styles from './sections.module.scss';
import { testId, aria } from '../../../utils/accessibility';

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
    <section className={styles.section} data-testid={testId.settingsPanel()} aria-label="Account settings">
      <h2 className={styles.sectionTitle} id="account-settings-title">Profile Information</h2>

      {/* Avatar Section */}
      <div className={styles.avatarSection}>
        <div className={styles.avatarContainer}>
          <img
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=johndoe"
            alt="User avatar"
            className={styles.avatar}
          />
        </div>
        {isEditing && (
          <button className={styles.changeAvatarButton}>Change Avatar</button>
        )}
      </div>

      {/* Form Fields */}
      <div className={styles.formGroup}>
        <label htmlFor="fullName" className={styles.label}>
          Full Name
        </label>
        <input
          id="fullName"
          type="text"
          name="fullName"
          value={formData.fullName}
          onChange={handleInputChange}
          disabled={!isEditing}
          className={`${styles.input} ${!isEditing ? styles.disabled : ''}`}
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="email" className={styles.label}>
          Email Address
        </label>
        <input
          id="email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          disabled={!isEditing}
          className={`${styles.input} ${!isEditing ? styles.disabled : ''}`}
        />
        <p className={styles.hint}>Your email is used for login and notifications</p>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="username" className={styles.label}>
          Username
        </label>
        <input
          id="username"
          type="text"
          name="username"
          value={formData.username}
          onChange={handleInputChange}
          disabled={!isEditing}
          className={`${styles.input} ${!isEditing ? styles.disabled : ''}`}
        />
        <p className={styles.hint}>Your unique identifier on the platform</p>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="bio" className={styles.label}>
          Bio
        </label>
        <textarea
          id="bio"
          name="bio"
          value={formData.bio}
          onChange={handleInputChange}
          disabled={!isEditing}
          className={`${styles.textarea} ${!isEditing ? styles.disabled : ''}`}
          rows={4}
        />
        <p className={styles.hint}>Tell us about yourself (optional)</p>
      </div>

      {/* Action Buttons */}
      <div className={styles.actions}>
        {!isEditing ? (
          <button
            className={`${styles.button} ${styles.primary}`}
            onClick={() => setIsEditing(true)}
            data-testid={testId.settingsButton('edit-profile')}
          >
            Edit Profile
          </button>
        ) : (
          <>
            <button
              className={`${styles.button} ${styles.primary}`}
              onClick={handleSave}
              disabled={isSaving}
              data-testid={testId.settingsButton('save-profile')}
              aria-busy={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              className={styles.button}
              onClick={handleCancel}
              data-testid={testId.settingsButton('cancel-profile')}
            >
              Cancel
            </button>
          </>
        )}
      </div>

      {/* Account Info */}
      <div className={styles.infoSection} role="region" aria-label="Account information">
        <h3 className={styles.infoTitle}>Account Information</h3>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>Account Created:</span>
          <span className={styles.infoValue}>January 15, 2024</span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>Last Login:</span>
          <span className={styles.infoValue}>Today at 2:34 PM</span>
        </div>
        <div className={styles.infoRow}>
          <span className={styles.infoLabel}>Active Sessions:</span>
          <span className={styles.infoValue}>2</span>
        </div>
      </div>
    </section>
  );
};

export default AccountSettings;
