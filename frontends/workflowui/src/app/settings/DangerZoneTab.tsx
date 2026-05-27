/**
 * DangerZoneTab - Danger zone settings panel with delete account
 */

'use client';

import React from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardHeader,
  Alert,
} from '@metabuilder/fakemui';
import { WarningIcon } from '@/../../../icons/react';

interface DangerZoneTabProps {
  onDeleteClick: () => void;
}

export default function DangerZoneTab({
  onDeleteClick,
}: DangerZoneTabProps) {
  return (
    <Card data-testid="danger-zone-card">
      <CardHeader
        title="Danger Zone"
        sx={{
          backgroundColor: 'var(--mat-sys-error-container)',
        }}
      />
      <CardContent>
        <Alert
          severity="warning"
          icon={<WarningIcon />}
          sx={{ mb: 3 }}
        >
          Actions here cannot be undone. Proceed with caution.
        </Alert>
        <Box
          sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
        >
          <Typography variant="subtitle1">
            Delete Account
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Permanently delete your account and all data.
          </Typography>
          <Box>
            <Button
              variant="outlined"
              color="error"
              onClick={onDeleteClick}
              data-testid="delete-account-btn"
            >
              Delete Account
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
