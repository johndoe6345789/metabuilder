'use client';

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';
import { useEffect, useState } from 'react';

type FormField = {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  defaultValue?: any;
};

type FormDialogProps = {
  open: boolean;
  title: string;
  fields: FormField[];
  initialData?: any;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  submitLabel?: string;
};

export default function FormDialog({
  open,
  title,
  fields,
  initialData,
  onClose,
  onSubmit,
  submitLabel = 'Submit',
}: FormDialogProps) {
  const [formData, setFormData] = useState<any>({});
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

  const handleChange = (fieldName: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        {fields.map(field => (
          <TextField
            key={field.name}
            margin="normal"
            fullWidth
            label={field.label}
            type={field.type || 'text'}
            required={field.required}
            value={formData[field.name] !== undefined ? formData[field.name] : (field.defaultValue || '')}
            onChange={e => handleChange(field.name, e.target.value)}
            disabled={loading}
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
