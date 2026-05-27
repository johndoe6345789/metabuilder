/**
 * Field-level and form-level validation logic from features.json.
 */

import { useCallback } from 'react';
import type { FormField, FormSchema } from '@/utils/featureConfig';
import { getValidationRule } from '@/utils/featureConfig';

type ValidationErrors = Record<string, string>;

export function useFormValidation(schema: FormSchema | undefined) {
  const validateField = useCallback(
    (field: FormField, value: any): string | null => {
      if (field.required && (value === undefined || value === null || value === '')) {
        return `${field.label} is required`;
      }
      if (value !== undefined && value !== null && value !== '') {
        if (field.type === 'text' || field.type === 'textarea') {
          const s = String(value);
          if (field.minLength && s.length < field.minLength) {
            return `${field.label} must be at least ${field.minLength} characters`;
          }
          if (field.maxLength && s.length > field.maxLength) {
            return `${field.label} must be at most ${field.maxLength} characters`;
          }
        }
        if (field.type === 'number') {
          const n = Number(value);
          if (Number.isNaN(n)) return `${field.label} must be a valid number`;
          if (field.min !== undefined && n < field.min) {
            return `${field.label} must be at least ${field.min}`;
          }
          if (field.max !== undefined && n > field.max) {
            return `${field.label} must be at most ${field.max}`;
          }
        }
        if (field.validation) {
          const rule = getValidationRule(field.validation);
          if (rule && !new RegExp(rule.pattern).test(String(value))) {
            return rule.message;
          }
        }
      }
      return null;
    },
    [],
  );

  const validateForm = useCallback(
    (
      values: Record<string, any>,
      setErrors: (e: ValidationErrors) => void,
    ): boolean => {
      if (!schema) return true;
      const newErrors: ValidationErrors = {};
      let isValid = true;
      schema.fields.forEach((field) => {
        const err = validateField(field, values[field.name]);
        if (err) { newErrors[field.name] = err; isValid = false; }
      });
      setErrors(newErrors);
      return isValid;
    },
    [schema, validateField],
  );

  return { validateField, validateForm };
}
