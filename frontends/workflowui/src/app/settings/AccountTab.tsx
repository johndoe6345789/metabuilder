/**
 * AccountTab - Account settings panel
 */

'use client';

import React from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Divider,
} from '@metabuilder/m3';

export default function AccountTab() {
  return (
    <Card data-testid="account-card">
      <CardHeader title="Account Settings" />
      <CardContent>
        <Box
          sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}
        >
          <TextField
            label="Email Address"
            type="email"
            defaultValue="user@example.com"
            helperText="Your email address for notifications"
            fullWidth
            data-testid="email-input"
          />
          <TextField
            label="Display Name"
            defaultValue="Workflow User"
            helperText="Your name as it appears in the app"
            fullWidth
            data-testid="display-name-input"
          />
          <Divider />
          <Typography variant="subtitle1">
            Change Password
          </Typography>
          <TextField
            label="Current Password"
            type="password"
            fullWidth
            data-testid="current-password-input"
          />
          <TextField
            label="New Password"
            type="password"
            fullWidth
            data-testid="new-password-input"
          />
          <TextField
            label="Confirm New Password"
            type="password"
            fullWidth
            data-testid="confirm-password-input"
          />
        </Box>
      </CardContent>
      <CardActions>
        <Button
          variant="contained"
          data-testid="save-account-btn"
        >
          Save Changes
        </Button>
      </CardActions>
    </Card>
  );
}
