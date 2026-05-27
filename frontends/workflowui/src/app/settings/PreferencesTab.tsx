/**
 * PreferencesTab - User preferences settings panel
 */

'use client';

import React from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Divider,
} from '@metabuilder/fakemui';
import PreferencesAppearance from './PreferencesAppearance';
import PreferencesNotifications from './PreferencesNotifications';

interface PreferencesTabProps {
  theme: string;
  setTheme: (v: string) => void;
  language: string;
  setLanguage: (v: string) => void;
  notifications: boolean;
  setNotifications: (v: boolean) => void;
  emailUpdates: boolean;
  setEmailUpdates: (v: boolean) => void;
  onSave: () => void;
}

export default function PreferencesTab({
  theme,
  setTheme,
  language,
  setLanguage,
  notifications,
  setNotifications,
  emailUpdates,
  setEmailUpdates,
  onSave,
}: PreferencesTabProps) {
  return (
    <Card data-testid="preferences-card">
      <CardHeader title="User Preferences" />
      <CardContent>
        <Box
          sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}
        >
          <PreferencesAppearance
            theme={theme}
            setTheme={setTheme}
            language={language}
            setLanguage={setLanguage}
          />
          <Divider />
          <PreferencesNotifications
            notifications={notifications}
            setNotifications={setNotifications}
            emailUpdates={emailUpdates}
            setEmailUpdates={setEmailUpdates}
          />
        </Box>
      </CardContent>
      <CardActions>
        <Button
          variant="contained"
          onClick={onSave}
          data-testid="save-preferences-btn"
        >
          Save Preferences
        </Button>
      </CardActions>
    </Card>
  );
}
