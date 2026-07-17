'use client';

import {
  Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Button, Stack,
} from '@shared/m3';
import { useUploadForm } from '@/hooks';
import labels from '@/constants/ui-labels.json';

/** @brief Props for UploadDialog. */
export interface UploadDialogProps {
  open: boolean;
  onClose: () => void;
  onUpload: (key: string, file: File) => void;
  prefix?: string;
  testId?: string;
}

/**
 * @brief Dialog to upload a file to S3.
 * @param props - Dialog properties.
 */
export default function UploadDialog({
  open, onClose, onUpload,
  prefix = '',
  testId = 'upload-dialog',
}: UploadDialogProps) {
  const form = useUploadForm(
    prefix, onUpload, onClose,
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      data-testid={testId}
      aria-label={labels.dialogs.uploadFile}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>
        {labels.dialogs.uploadFile}
      </DialogTitle>
      <DialogContent>
        <Stack
          spacing={2}
          style={{ marginTop: 8 }}
        >
          <Button
            variant="outlined"
            onClick={() =>
              form.inputRef.current?.click()}
            aria-label={
              labels.dialogs.selectFile
            }
          >
            {form.file?.name
              ?? labels.dialogs.selectFile}
          </Button>
          <input
            ref={form.inputRef}
            type="file"
            hidden
            onChange={form.handleFileChange}
            data-testid="file-input"
          />
          <TextField
            fullWidth
            label={labels.dialogs.objectKey}
            value={form.key}
            onChange={(e) =>
              form.setKey(e.target.value)}
            data-testid="object-key-input"
            aria-label={
              labels.dialogs.objectKey
            }
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          {labels.dialogs.cancel}
        </Button>
        <Button
          onClick={form.handleUpload}
          variant="contained"
          disabled={!form.file || !form.key}
        >
          {labels.objects.upload}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
