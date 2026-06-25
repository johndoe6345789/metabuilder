/**
 * Hook for managing forms based on form schemas from features.json
 */

import { useCallback, useMemo, useState } from 'react';
import type { FormSchema } from '@/utils/featureConfig';
import { getFormSchema } from '@/utils/featureConfig';
import { useFormValidation } from './useFormValidation';

type ValidationErrors = Record<string, string>;

function getDefaultValues(s?: FormSchema): Record<string, any> {
  if (!s) return {};
  const d: Record<string, any> = {};
  s.fields.forEach((f) => {
    if (f.defaultValue !== undefined) d[f.name] = f.defaultValue;
  });
  return d;
}

export function useFormSchema(
  resourceName: string,
  initialData?: Record<string, any>,
) {
  const schema = getFormSchema(resourceName);
  if (!schema) {
    console.warn(`No form schema found for resource: ${resourceName}`);
  }
  const [values, setValues] = useState<Record<string, any>>(
    () => initialData || getDefaultValues(schema),
  );
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const { validateField, validateForm } = useFormValidation(schema);

  const handleChange = useCallback((fieldName: string, value: any) => {
    setValues(p => ({ ...p, [fieldName]: value }));
    setErrors((p) => {
      const n = { ...p };
      delete n[fieldName];
      return n;
    });
  }, []);

  const handleBlur = useCallback((fieldName: string) => {
    setTouched(p => ({ ...p, [fieldName]: true }));
    if (schema) {
      const field = schema.fields.find(f => f.name === fieldName);
      if (field) {
        const err = validateField(field, values[fieldName]);
        if (err) setErrors(p => ({ ...p, [fieldName]: err }));
      }
    }
  }, [schema, values, validateField]);

  const reset = useCallback((newData?: Record<string, any>) => {
    setValues(newData || getDefaultValues(schema));
    setErrors({});
    setTouched({});
  }, [schema]);

  const isValid = useMemo(
    () => Object.keys(errors).length === 0, [errors],
  );

  const isDirty = useMemo(() => {
    const d = getDefaultValues(schema);
    return Object.keys(values).some(k => values[k] !== d[k]);
  }, [values, schema]);

  return {
    schema, values, errors, touched, isValid, isDirty,
    handleChange, handleBlur,
    validateForm: (cb?: (e: ValidationErrors) => void) =>
      validateForm(values, cb ?? setErrors),
    reset,
  };
}
