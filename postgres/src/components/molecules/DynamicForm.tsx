/**
 * Dynamic Form Renderer
 * Renders forms based on form schemas from features.json
 */

import type { FormField } from '@/utils/featureConfig';
import {
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import React from 'react';

type DynamicFormProps = {
  fields: FormField[];
  values: Record<string, any>;
  errors: Record<string, string>;
  onChange: (fieldName: string, value: any) => void;
  onBlur?: (fieldName: string) => void;
  disabled?: boolean;
};

/**
 * Render a single form field based on its type
 */
function renderField(
  field: FormField,
  value: any,
  error: string | undefined,
  onChange: (value: any) => void,
  onBlur?: () => void,
  disabled?: boolean,
) {
  const commonProps = {
    fullWidth: true,
    disabled,
    error: Boolean(error),
    helperText: error,
  };

  switch (field.type) {
    case 'text':
    case 'email':
      return (
        <TextField
          {...commonProps}
          type={field.type}
          label={field.label}
          placeholder={field.placeholder}
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          onBlur={onBlur}
          required={field.required}
          inputProps={{
            minLength: field.minLength,
            maxLength: field.maxLength,
          }}
        />
      );

    case 'number':
      return (
        <TextField
          {...commonProps}
          type="number"
          label={field.label}
          placeholder={field.placeholder}
          value={value ?? ''}
          onChange={e => onChange(e.target.value ? Number(e.target.value) : null)}
          onBlur={onBlur}
          required={field.required}
          inputProps={{
            min: field.min,
            max: field.max,
            step: field.step,
          }}
          InputProps={{
            startAdornment: field.prefix,
            endAdornment: field.suffix,
          }}
        />
      );

    case 'textarea':
      return (
        <TextField
          {...commonProps}
          multiline
          rows={field.rows || 4}
          label={field.label}
          placeholder={field.placeholder}
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          onBlur={onBlur}
          required={field.required}
          inputProps={{
            maxLength: field.maxLength,
          }}
        />
      );

    case 'select':
      return (
        <FormControl {...commonProps}>
          <InputLabel required={field.required}>{field.label}</InputLabel>
          <Select
            value={value || ''}
            label={field.label}
            onChange={e => onChange(e.target.value)}
            onBlur={onBlur}
          >
            {field.options?.map(option => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
          {error && <FormHelperText error>{error}</FormHelperText>}
        </FormControl>
      );

    case 'checkbox':
      return (
        <FormControl error={Boolean(error)}>
          <FormControlLabel
            control={(
              <Checkbox
                checked={Boolean(value)}
                onChange={e => onChange(e.target.checked)}
                disabled={disabled}
              />
            )}
            label={field.label}
          />
          {error && <FormHelperText error>{error}</FormHelperText>}
        </FormControl>
      );

    case 'date':
      return (
        <TextField
          {...commonProps}
          type="date"
          label={field.label}
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          onBlur={onBlur}
          required={field.required}
          InputLabelProps={{ shrink: true }}
        />
      );

    case 'datetime':
      return (
        <TextField
          {...commonProps}
          type="datetime-local"
          label={field.label}
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          onBlur={onBlur}
          required={field.required}
          InputLabelProps={{ shrink: true }}
        />
      );

    default:
      console.warn(`Unknown field type: ${field.type}`);
      return null;
  }
}

/**
 * Dynamic Form Component
 * Renders a complete form based on schema from features.json
 */
export function DynamicForm({
  fields,
  values,
  errors,
  onChange,
  onBlur,
  disabled,
}: DynamicFormProps) {
  return (
    <Grid container spacing={2}>
      {fields.map((field) => {
        // Determine grid size based on field requirements
        const gridSize = field.type === 'textarea' || field.type === 'checkbox' ? 12 : 6;

        return (
          <Grid item xs={12} sm={gridSize} key={field.name}>
            {renderField(
              field,
              values[field.name],
              errors[field.name],
              value => onChange(field.name, value),
              onBlur ? () => onBlur(field.name) : undefined,
              disabled,
            )}
          </Grid>
        );
      })}
    </Grid>
  );
}

/**
 * Form Section - Groups related fields with a title
 */
export function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ mb: 2 }}>
        <Box component="h3" sx={{ m: 0, fontSize: '1.1rem', fontWeight: 500 }}>
          {title}
        </Box>
        {description && (
          <Box component="p" sx={{ m: 0, mt: 0.5, fontSize: '0.875rem', color: 'text.secondary' }}>
            {description}
          </Box>
        )}
      </Box>
      {children}
    </Box>
  );
}
