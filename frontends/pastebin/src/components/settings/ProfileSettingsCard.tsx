'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, Button, FormLabel, MaterialIcon } from '@metabuilder/components/fakemui';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { selectCurrentUser, selectUserProfile } from '@/store/selectors';
import { updateMyProfile, fetchUserProfile } from '@/store/slices/profilesSlice';
import { MarkdownRenderer } from '@/components/error/MarkdownRenderer';
import styles from './settings-card.module.scss';
import profileStyles from './profile-settings-card.module.scss';

export function ProfileSettingsCard() {
  const user = useAppSelector(selectCurrentUser);
  const profile = useAppSelector(state => user ? selectUserProfile(state, user.username) : null);
  const dispatch = useAppDispatch();
  const [bio, setBio] = useState('');
  const [bioLoaded, setBioLoaded] = useState(false);
  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Fetch the full profile (including bio) on mount
  useEffect(() => {
    if (user?.username) dispatch(fetchUserProfile(user.username));
  }, [user?.username, dispatch]);

  // Populate bio from the fetched profile once
  useEffect(() => {
    if (profile?.bio !== undefined && !bioLoaded) {
      setBio(profile.bio);
      setBioLoaded(true);
    }
  }, [profile, bioLoaded]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await dispatch(updateMyProfile(bio)).unwrap();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch { /* error handled by slice */ }
    setSaving(false);
  };

  if (!user) return null;

  return (
    <Card>
      <CardHeader>
        <div className={styles.headerIconRow}>
          <MaterialIcon name="manage_accounts" className={styles.iconPrimary} size={20} aria-hidden="true" />
          <h3 className={styles.cardTitle}>Profile</h3>
        </div>
        <p className={styles.cardDescription}>Customize how others see you.</p>
      </CardHeader>
      <CardContent>
        <div className={styles.contentStackSm}>
          <div className={profileStyles.field}>
            <FormLabel htmlFor="profile-username">Username</FormLabel>
            <input
              id="profile-username"
              type="text"
              value={`@${user.username}`}
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
                  onClick={() => setPreview(false)}
                  className={`${profileStyles.tabBtn} ${!preview ? profileStyles.tabActive : ''}`}
                >
                  Write
                </button>
                <button
                  type="button"
                  onClick={() => setPreview(true)}
                  className={`${profileStyles.tabBtn} ${preview ? profileStyles.tabActive : ''}`}
                >
                  Preview
                </button>
              </div>
            </div>
            {preview ? (
              <div className={profileStyles.previewBox}>
                {bio.trim()
                  ? <MarkdownRenderer content={bio} animate={false} />
                  : <p className={profileStyles.previewEmpty}>Nothing to preview.</p>
                }
              </div>
            ) : (
              <textarea
                id="profile-bio"
                value={bio}
                onChange={e => setBio(e.target.value)}
                rows={5}
                placeholder="Tell people about yourself… (markdown supported)"
                className={profileStyles.textarea}
                aria-label="Bio"
              />
            )}
          </div>

          <Button
            onClick={handleSave}
            disabled={saving}
            aria-label="Save profile"
          >
            <MaterialIcon name={saved ? 'check' : 'save'} size={16} aria-hidden="true" />
            {saving ? 'Saving…' : saved ? 'Saved!' : 'Save Profile'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
