/**
 * Atomic Components Library
 * Minimal, reusable components with no business logic
 */

import type { AlertProps, ButtonProps, CardProps, CheckboxProps, ChipProps, CircularProgressProps, IconButtonProps, PaperProps, SelectProps, TextFieldProps, TypographyProps } from '@mui/material';
import {

  Box,

  CircularProgress,

  FormControlLabel,

  MenuItem,
  Alert as MuiAlert,
  Button as MuiButton,
  Card as MuiCard,
  Checkbox as MuiCheckbox,
  Chip as MuiChip,
  IconButton as MuiIconButton,
  Paper as MuiPaper,
  Select as MuiSelect,
  TextField as MuiTextField,
  Typography as MuiTypography,

} from '@mui/material';
import React from 'react';

/**
 * Atomic Button - Pure presentation, no logic
 */
export function Button(props: ButtonProps) {
  return <MuiButton {...props} />;
}

/**
 * Atomic TextField - Pure presentation, no logic
 */
export function TextField(props: TextFieldProps) {
  return <MuiTextField {...props} />;
}

/**
 * Atomic Typography - Pure presentation, no logic
 */
export function Typography(props: TypographyProps) {
  return <MuiTypography {...props} />;
}

/**
 * Atomic Select - Pure presentation, no logic
 */
export function Select(props: SelectProps & { options?: Array<{ value: string; label: string }> }) {
  const { options = [], ...selectProps } = props;

  return (
    <MuiSelect {...selectProps}>
      {options.map(option => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </MuiSelect>
  );
}

/**
 * Atomic Checkbox - Pure presentation, no logic
 */
export function Checkbox(props: CheckboxProps & { label?: string }) {
  const { label, ...checkboxProps } = props;

  if (label) {
    return (
      <FormControlLabel
        control={<MuiCheckbox {...checkboxProps} />}
        label={label}
      />
    );
  }

  return <MuiCheckbox {...checkboxProps} />;
}

/**
 * Atomic IconButton - Pure presentation, no logic
 */
export function IconButton(props: IconButtonProps) {
  return <MuiIconButton {...props} />;
}

/**
 * Atomic Paper - Pure presentation, no logic
 */
export function Paper(props: PaperProps) {
  return <MuiPaper {...props} />;
}

/**
 * Atomic Card - Pure presentation, no logic
 */
export function Card(props: CardProps) {
  return <MuiCard {...props} />;
}

/**
 * Atomic Chip - Pure presentation, no logic
 */
export function Chip(props: ChipProps) {
  return <MuiChip {...props} />;
}

/**
 * Atomic Alert - Pure presentation, no logic
 */
export function Alert(props: AlertProps) {
  return <MuiAlert {...props} />;
}

/**
 * Atomic Loading Spinner - Pure presentation, no logic
 */
export function LoadingSpinner(props: CircularProgressProps) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3, ...props.sx }}>
      <CircularProgress {...props} />
    </Box>
  );
}

/**
 * Atomic Container - Simple Box wrapper with common styling
 */
export function Container({ children, ...props }: React.PropsWithChildren<{ sx?: any }>) {
  return (
    <Box sx={{ p: 3, ...props.sx }}>
      {children}
    </Box>
  );
}

/**
 * Atomic Stack - Vertical or horizontal flex layout
 */
export function Stack({
  children,
  direction = 'column',
  spacing = 2,
  ...props
}: React.PropsWithChildren<{
  direction?: 'row' | 'column';
  spacing?: number;
  sx?: any;
}>) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: direction,
        gap: spacing,
        ...props.sx,
      }}
    >
      {children}
    </Box>
  );
}

/**
 * Atomic Empty State - Shows when there's no data
 */
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
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 6,
        textAlign: 'center',
      }}
    >
      {icon && <Box sx={{ mb: 2, opacity: 0.5 }}>{icon}</Box>}
      <Typography variant="body1" color="text.secondary" gutterBottom>
        {message}
      </Typography>
      {action && <Box sx={{ mt: 2 }}>{action}</Box>}
    </Box>
  );
}

/**
 * Atomic Error Display - Shows error messages
 */
export function ErrorDisplay({
  error,
  onRetry,
}: {
  error: string | null;
  onRetry?: () => void;
}) {
  if (!error) {
    return null;
  }

  return (
    <Alert
      severity="error"
      action={
        onRetry
          ? (
              <Button size="small" onClick={onRetry}>
                Retry
              </Button>
            )
          : undefined
      }
    >
      {error}
    </Alert>
  );
}

/**
 * Atomic Success Display - Shows success messages
 */
export function SuccessDisplay({
  message,
  onClose,
}: {
  message: string | null;
  onClose?: () => void;
}) {
  if (!message) {
    return null;
  }

  return (
    <Alert severity="success" onClose={onClose}>
      {message}
    </Alert>
  );
}
