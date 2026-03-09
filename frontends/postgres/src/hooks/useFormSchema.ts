/**
 * Hook for managing forms based on form schemas from features.json
 */

import type { FormField, FormSchema } from '@/utils/featureConfig';
import { useCallback, useMemo, useState } from 'react';
import { getFormSchema, getValidationRule } from '@/utils/featureConfig';

type ValidationErrors = Record<string, string>;

/**
 * Hook that provides form state management based on schemas from features.json
 */
export function useFormSchema(resourceName: string, initialData?: Record<string, any>) {
  const schema = getFormSchema(resourceName);

  if (!schema) {
    console.warn(`No form schema found for resource: ${resourceName}`);
  }

  const [values, setValues] = useState<Record<string, any>>(() =>
    initialData || getDefaultValues(schema),
  );
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Get default values from schema
  function getDefaultValues(formSchema?: FormSchema): Record<string, any> {
    if (!formSchema) {
      return {};
    }

    const defaults: Record<string, any> = {};
    formSchema.fields.forEach((field) => {
      if (field.defaultValue !== undefined) {
        defaults[field.name] = field.defaultValue;
      }
    });
    return defaults;
  }

  // Validate a single field
  const validateField = useCallback((field: FormField, value: any): string | null => {
    // Check required
    if (field.required && (value === undefined || value === null || value === '')) {
      return `${field.label} is required`;
    }

    // Check type-specific validations
    if (value !== undefined && value !== null && value !== '') {
      // Min/max length for text fields
      if (field.type === 'text' || field.type === 'textarea') {
        const strValue = String(value);
        if (field.minLength && strValue.length < field.minLength) {
          return `${field.label} must be at least ${field.minLength} characters`;
        }
        if (field.maxLength && strValue.length > field.maxLength) {
          return `${field.label} must be at most ${field.maxLength} characters`;
        }
      }

      // Min/max for number fields
      if (field.type === 'number') {
        const numValue = Number(value);
        if (Number.isNaN(numValue)) {
          return `${field.label} must be a valid number`;
        }
        if (field.min !== undefined && numValue < field.min) {
          return `${field.label} must be at least ${field.min}`;
        }
        if (field.max !== undefined && numValue > field.max) {
          return `${field.label} must be at most ${field.max}`;
        }
      }

      // Custom validation rules from features.json
      if (field.validation) {
        const rule = getValidationRule(field.validation);
        if (rule) {
          const regex = new RegExp(rule.pattern);
          if (!regex.test(String(value))) {
            return rule.message;
          }
        }
      }
    }

    return null;
  }, []);

  // Validate all fields
  const validateForm = useCallback((): boolean => {
    if (!schema) {
      return true;
    }

    const newErrors: ValidationErrors = {};
    let isValid = true;

    schema.fields.forEach((field) => {
      const error = validateField(field, values[field.name]);
      if (error) {
        newErrors[field.name] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [schema, values, validateField]);

  // Handle field change
  const handleChange = useCallback((fieldName: string, value: any) => {
    setValues(prev => ({ ...prev, [fieldName]: value }));

    // Clear error for this field
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  }, []);

  // Handle field blur
  const handleBlur = useCallback((fieldName: string) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));

    // Validate this field on blur
    if (schema) {
      const field = schema.fields.find(f => f.name === fieldName);
      if (field) {
        const error = validateField(field, values[fieldName]);
        if (error) {
          setErrors(prev => ({ ...prev, [fieldName]: error }));
        }
      }
    }
  }, [schema, values, validateField]);

  // Reset form
  const reset = useCallback((newData?: Record<string, any>) => {
    setValues(newData || getDefaultValues(schema));
    setErrors({});
    setTouched({});
  }, [schema]);

  // Check if form is valid
  const isValid = useMemo(() => {
    return Object.keys(errors).length === 0;
  }, [errors]);

  // Check if form has been modified
  const isDirty = useMemo(() => {
    const defaults = getDefaultValues(schema);
    return Object.keys(values).some(key => values[key] !== defaults[key]);
  }, [values, schema]);

  return {
    schema,
    values,
    errors,
    touched,
    isValid,
    isDirty,
    handleChange,
    handleBlur,
    validateForm,
    reset,
  };
}
