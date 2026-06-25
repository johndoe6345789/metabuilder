/**
 * PreferencesNotifications - Notification toggle switches
 */

'use client';

import React from 'react';
import {
  Box,
  Typography,
  Switch,
  FormControlLabel,
} from '@metabuilder/m3';

interface PreferencesNotificationsProps {
  notifications: boolean;
  setNotifications: (v: boolean) => void;
  emailUpdates: boolean;
  setEmailUpdates: (v: boolean) => void;
}

export default function PreferencesNotifications({
  notifications,
  setNotifications,
  emailUpdates,
  setEmailUpdates,
}: PreferencesNotificationsProps) {
  return (
    <>
      <Box>
        <FormControlLabel
          control={
            <Switch
              checked={notifications}
              onChange={(e) =>
                setNotifications(e.target.checked)
              }
              data-testid="notifications-switch"
            />
          }
          label="Enable notifications"
        />
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: 'block', ml: 4 }}
        >
          Receive in-app notifications for workflow events
        </Typography>
      </Box>

      <Box>
        <FormControlLabel
          control={
            <Switch
              checked={emailUpdates}
              onChange={(e) =>
                setEmailUpdates(e.target.checked)
              }
              data-testid="email-updates-switch"
            />
          }
          label="Email updates"
        />
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: 'block', ml: 4 }}
        >
          Receive email notifications for important updates
        </Typography>
      </Box>
    </>
  );
}
