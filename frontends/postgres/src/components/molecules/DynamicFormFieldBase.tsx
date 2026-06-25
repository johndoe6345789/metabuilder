/**
 * Base field sub-components used by DynamicFormField.
 */

import type { FormField } from '@/utils/featureConfig';
import {
  Checkbox, FormControl, FormControlLabel,
  FormHelperText, InputLabel, MenuItem, Select, TextField,
} from '@metabuilder/components/m3';

export type FieldProps = {
  field: FormField;
  value: any;
  error: string | undefined;
  onChange: (value: any) => void;
  onBlur?: () => void;
  disabled?: boolean;
};

export function baseTextProps(
  field: FormField, error: string | undefined, disabled?: boolean,
) {
  return { fullWidth: true, disabled, error: Boolean(error), helperText: error };
}

export function TextLikeField(
  { field, value, error, onChange, onBlur, disabled }: FieldProps,
) {
  return (
    <TextField
      {...baseTextProps(field, error, disabled)}
      type={field.type} label={field.label}
      placeholder={field.placeholder} value={value || ''}
      onChange={e => onChange(e.target.value)} onBlur={onBlur}
      required={field.required}
      inputProps={{ minLength: field.minLength, maxLength: field.maxLength }}
    />
  );
}

export function NumberField(
  { field, value, error, onChange, onBlur, disabled }: FieldProps,
) {
  return (
    <TextField
      {...baseTextProps(field, error, disabled)}
      type="number" label={field.label}
      placeholder={field.placeholder} value={value ?? ''}
      onChange={e =>
        onChange(e.target.value ? Number(e.target.value) : null)}
      onBlur={onBlur} required={field.required}
      inputProps={{ min: field.min, max: field.max, step: field.step }}
      InputProps={{ startAdornment: field.prefix, endAdornment: field.suffix }}
    />
  );
}

export function SelectField(
  { field, value, error, onChange, onBlur, disabled }: FieldProps,
) {
  return (
    <FormControl {...baseTextProps(field, error, disabled)}>
      <InputLabel required={field.required}>{field.label}</InputLabel>
      <Select
        value={value || ''} label={field.label}
        onChange={e => onChange(e.target.value)} onBlur={onBlur}
      >
        {field.options?.map(o => (
          <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
        ))}
      </Select>
      {error && <FormHelperText error>{error}</FormHelperText>}
    </FormControl>
  );
}

export function CheckboxField(
  { field, value, error, onChange, disabled }: FieldProps,
) {
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
}
