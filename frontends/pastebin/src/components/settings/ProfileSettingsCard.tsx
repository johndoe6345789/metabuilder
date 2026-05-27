'use client';

import {
  Card, CardContent, CardHeader,
  Button, FormLabel, MaterialIcon,
} from '@metabuilder/components/fakemui';
import { MarkdownRenderer } from '@/components/error/MarkdownRenderer';
import { useProfileSettings } from './hooks/useProfileSettings';
import styles from './settings-card.module.scss';
import profileStyles from './profile-settings-card.module.scss';

export function ProfileSettingsCard() {
  const vm = useProfileSettings();

  if (!vm.user) return null;

  return (
    <Card>
      <CardHeader>
        <div className={styles.headerIconRow}>
          <MaterialIcon
            name="manage_accounts"
            className={styles.iconPrimary}
            size={20}
            aria-hidden="true"
          />
          <h3 className={styles.cardTitle}>Profile</h3>
        </div>
        <p className={styles.cardDescription}>
          Customize how others see you.
        </p>
      </CardHeader>
      <CardContent>
        <div className={styles.contentStackSm}>
          <div className={profileStyles.field}>
            <FormLabel htmlFor="profile-username">
              Username
            </FormLabel>
            <input
              id="profile-username"
              type="text"
              value={`@${vm.user.username}`}
              readOnly
              className={profileStyles.readonlyInput}
              aria-label="Username (read-only)"
            />
          </div>

          <div className={profileStyles.field}>
            <div className={profileStyles.bioHeader}>
              <FormLabel htmlFor="profile-bio">Bio</FormLabel>
              <div className={profileStyles.tabRow}>
                <button
                  type="button"
                  onClick={() => vm.setPreview(false)}
                  className={`${profileStyles.tabBtn} ${
                    !vm.preview ? profileStyles.tabActive : ''
                  }`}
                >
                  Write
                </button>
                <button
                  type="button"
                  onClick={() => vm.setPreview(true)}
                  className={`${profileStyles.tabBtn} ${
                    vm.preview ? profileStyles.tabActive : ''
                  }`}
                >
                  Preview
                </button>
              </div>
            </div>
            {vm.preview ? (
              <div className={profileStyles.previewBox}>
                {vm.bio.trim() ? (
                  <MarkdownRenderer
                    content={vm.bio}
                    animate={false}
                  />
                ) : (
                  <p className={profileStyles.previewEmpty}>
                    Nothing to preview.
                  </p>
                )}
              </div>
            ) : (
              <textarea
                id="profile-bio"
                value={vm.bio}
                onChange={e => vm.setBio(e.target.value)}
                rows={5}
                placeholder="Tell people about yourself… (markdown supported)"
                className={profileStyles.textarea}
                aria-label="Bio"
              />
            )}
          </div>

          <Button
            onClick={vm.handleSave}
            disabled={vm.saving}
            aria-label="Save profile"
          >
            <MaterialIcon
              name={vm.saved ? 'check' : 'save'}
              size={16}
              aria-hidden="true"
            />
            {vm.saving
              ? 'Saving…'
              : vm.saved
                ? 'Saved!'
                : 'Save Profile'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
