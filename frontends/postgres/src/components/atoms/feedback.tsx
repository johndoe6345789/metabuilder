/**
 * Atomic feedback components: LoadingSpinner, EmptyState,
 * ErrorDisplay, SuccessDisplay.
 */

import type { AlertProps, CircularProgressProps } from '@mui/material';
import {
  Alert as MuiAlert,
  Box,
  Button as MuiButton,
  CircularProgress,
  Typography as MuiTypography,
} from '@mui/material';
import React from 'react';

export function Alert(props: AlertProps) {
  return <MuiAlert {...props} />;
}

export function LoadingSpinner(props: CircularProgressProps) {
  return (
    <Box
      sx={{ display: 'flex', justifyContent: 'center', p: 3, ...props.sx }}
    >
      <CircularProgress {...props} />
    </Box>
  );
}

export function EmptyState({
  message = 'No data available',
  icon,
  action,
}: {
  message?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <Box
      sx={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        p: 6, textAlign: 'center',
      }}
    >
      {icon && <Box sx={{ mb: 2, opacity: 0.5 }}>{icon}</Box>}
      <MuiTypography
        variant="body1"
        color="text.secondary"
        gutterBottom
      >
        {message}
      </MuiTypography>
      {action && <Box sx={{ mt: 2 }}>{action}</Box>}
    </Box>
  );
}

export function ErrorDisplay({
  error,
  onRetry,
}: {
  error: string | null;
  onRetry?: () => void;
}) {
  if (!error) return null;
  return (
    <Alert
      severity="error"
      action={
        onRetry
          ? (
              <MuiButton size="small" onClick={onRetry}>
                Retry
              </MuiButton>
            )
          : undefined
      }
    >
      {error}
    </Alert>
  );
}

export function SuccessDisplay({
  message,
  onClose,
}: {
  message: string | null;
  onClose?: () => void;
}) {
  if (!message) return null;
  return (
    <Alert severity="success" onClose={onClose}>
      {message}
    </Alert>
  );
}
