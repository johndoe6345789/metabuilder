'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '../../utils';
import { Button, TextField } from '../../inputs';

export type FormField = {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  defaultValue?: string | number | boolean;
};

export type FormDialogProps = {
  open: boolean;
  title: string;
  fields: FormField[];
  initialData?: Record<string, unknown>;
  onClose: () => void;
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
  submitLabel?: string;
  testId?: string;
};

/**
 * FormDialog - A reusable form dialog component.
 * Renders a dynamic form based on field definitions.
 */
export function FormDialog({
  open,
  title,
  fields,
  initialData,
  onClose,
  onSubmit,
  submitLabel = 'Submit',
  testId,
}: FormDialogProps) {
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({});
    }
  }, [initialData, open]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onSubmit(formData);
      setFormData({});
      onClose();
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (fieldName: string, value: unknown) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  return (
    <Dialog open={open} onClose={onClose} data-testid={testId} aria-labelledby={testId ? `${testId}-title` : undefined}>
      <DialogTitle id={testId ? `${testId}-title` : undefined}>{title}</DialogTitle>
      <DialogContent>
        {fields.map((field) => (
          <TextField
            key={field.name}
            fullWidth
            label={field.label}
            type={field.type || 'text'}
            required={field.required}
            value={
              formData[field.name] !== undefined
                ? String(formData[field.name])
                : String(field.defaultValue ?? '')
            }
            onChange={(e) => handleChange(field.name, e.target.value)}
            disabled={loading}
            sx={{ mb: 2 }}
          />
        ))}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {submitLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default FormDialog;
