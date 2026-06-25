'use client';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '../../utils';
import { Button } from '../../inputs';

export type ConfirmDialogProps = {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmColor?: 'primary' | 'secondary' | 'error' | 'warning' | 'success';
  testId?: string;
};

/**
 * ConfirmDialog - A reusable confirmation dialog component.
 * Displays a message and provides confirm/cancel buttons.
 */
export function ConfirmDialog({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmColor = 'error',
  testId,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onClose={onCancel} data-testid={testId} role="alertdialog" aria-labelledby={testId ? `${testId}-title` : undefined}>
      <DialogTitle id={testId ? `${testId}-title` : undefined}>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>{cancelLabel}</Button>
        <Button onClick={onConfirm} color={confirmColor} variant="contained">
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ConfirmDialog;
