'use client';

import { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Button,
} from '@shared/m3';
import labels from '@/constants/ui-labels.json';

/** @brief Props for CreateBucketDialog. */
export interface CreateBucketDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (name: string) => void;
  testId?: string;
}

const NAME_RE =
  /^[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]$/;

/**
 * @brief Dialog to create a new S3 bucket.
 * @param props - Dialog properties.
 */
export default function CreateBucketDialog({
  open, onClose, onCreate,
  testId = 'create-bucket-dialog',
}: CreateBucketDialogProps) {
  const [name, setName] = useState('');
  const valid = NAME_RE.test(name);

  const handleCreate = () => {
    if (valid) {
      onCreate(name);
      setName('');
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      data-testid={testId}
      aria-label={labels.dialogs.createBucket}
      fullWidth
      maxWidth="xs"
    >
      <DialogTitle>
        {labels.dialogs.createBucket}
      </DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          label={labels.dialogs.bucketName}
          value={name}
          onChange={(e) =>
            setName(e.target.value)}
          error={name.length > 0 && !valid}
          helperText={
            name.length > 0 && !valid
              ? 'Lowercase, 3-63 chars'
              : ''
          }
          data-testid="bucket-name-input"
          aria-label={
            labels.dialogs.bucketName
          }
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          {labels.dialogs.cancel}
        </Button>
        <Button
          onClick={handleCreate}
          variant="contained"
          disabled={!valid}
        >
          {labels.dialogs.create}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
