/**
 * Renders a single form field based on its type definition.
 * Sub-components are in DynamicFormFieldBase.tsx.
 */

import { TextField } from '@metabuilder/components/fakemui';
import {
  baseTextProps,
  CheckboxField,
  NumberField,
  SelectField,
  TextLikeField,
  type FieldProps,
} from './DynamicFormFieldBase';

export type { FieldProps };

export function DynamicFormField(props: FieldProps) {
  const { field } = props;
  switch (field.type) {
    case 'text':
    case 'email':
      return <TextLikeField {...props} />;
    case 'number':
      return <NumberField {...props} />;
    case 'textarea':
      return (
        <TextField
          {...baseTextProps(
            field,
            props.error,
            props.disabled,
          )}
          multiline
          rows={field.rows || 4}
          label={field.label}
          placeholder={field.placeholder}
          value={props.value || ''}
          onChange={e => props.onChange(e.target.value)}
          onBlur={props.onBlur}
          required={field.required}
          inputProps={{ maxLength: field.maxLength }}
        />
      );
    case 'select':
      return <SelectField {...props} />;
    case 'checkbox':
      return <CheckboxField {...props} />;
    case 'date':
      return (
        <TextField
          {...baseTextProps(
            field,
            props.error,
            props.disabled,
          )}
          type="date"
          label={field.label}
          value={props.value || ''}
          onChange={e => props.onChange(e.target.value)}
          onBlur={props.onBlur}
          required={field.required}
          InputLabelProps={{ shrink: true }}
        />
      );
    case 'datetime':
      return (
        <TextField
          {...baseTextProps(
            field,
            props.error,
            props.disabled,
          )}
          type="datetime-local"
          label={field.label}
          value={props.value || ''}
          onChange={e => props.onChange(e.target.value)}
          onBlur={props.onBlur}
          required={field.required}
          InputLabelProps={{ shrink: true }}
        />
      );
    default:
      console.warn(`Unknown field type: ${field.type}`);
      return null;
  }
}
