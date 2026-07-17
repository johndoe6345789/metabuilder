/**
 * SettingsPageHeader - Settings page title and icon
 */

'use client';

import React from 'react';
import { Box, Typography, Alert } from '@metabuilder/m3';
import { SettingsIcon } from '@icons/react';
import styles from '@scss/atoms/settings.module.scss';

interface SettingsPageHeaderProps {
  saveSuccess: boolean;
  onCloseSaveAlert: () => void;
}

export default function SettingsPageHeader({
  saveSuccess,
  onCloseSaveAlert,
}: SettingsPageHeaderProps) {
  return (
    <>
      <Box
        className={styles.pageHeader}
        data-testid="settings-header"
      >
        <Box
          sx={{ display: 'flex', alignItems: 'center', gap: 2 }}
        >
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 12,
              backgroundColor:
                'var(--mat-sys-secondary-container)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <SettingsIcon size={24} />
          </Box>
          <Box>
            <Typography
              variant="h4"
              component="h1"
              gutterBottom={false}
            >
              Settings
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
            >
              Configure your preferences and application behavior
            </Typography>
          </Box>
        </Box>
      </Box>

      {saveSuccess && (
        <Alert
          severity="success"
          onClose={onCloseSaveAlert}
          data-testid="save-success-alert"
        >
          Settings saved successfully!
        </Alert>
      )}
    </>
  );
}
