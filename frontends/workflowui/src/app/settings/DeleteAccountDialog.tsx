/**
 * DeleteAccountDialog - Confirmation dialog for account deletion
 */

'use client';

import React from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
} from '@metabuilder/m3';

interface DeleteAccountDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteAccountDialog({
  open,
  onClose,
  onConfirm,
}: DeleteAccountDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="delete-dialog-title"
      data-testid="delete-account-dialog"
    >
      <Box sx={{ p: 3 }}>
        <Typography
          id="delete-dialog-title"
          variant="h6"
          gutterBottom
        >
          Delete Account?
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 3 }}
        >
          This will permanently remove all your workspaces,
          workflows, and settings. This action cannot be undone.
        </Typography>
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            justifyContent: 'flex-end',
          }}
        >
          <Button
            onClick={onClose}
            data-testid="cancel-delete-btn"
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={onConfirm}
            data-testid="confirm-delete-btn"
          >
            Delete Permanently
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
}
