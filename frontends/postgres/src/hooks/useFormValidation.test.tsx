import { describe, expect, it, vi } from 'vitest';
import { renderHook } from '@testing-library/react';

vi.mock('@/lib/app-config', () => ({ BASE_PATH: '/postgres' }));
vi.mock('@/utils/featureConfig', async () => {
  return {
    getValidationRule: (key: string) => {
      if (key === 'email') {
        return {
          pattern: '^[^@]+@[^@]+\\.[^@]+$',
          message: 'Invalid email address',
        };
      }
      if (key === 'phone') {
        return {
          pattern: '^\\+?[\\d\\s\\-()]+$',
          message: 'Invalid phone number',
        };
      }
      return undefined;
    },
  };
});

import { useFormValidation } from './useFormValidation';

type FormField = {
  name: string;
  label: string;
  type: 'text' | 'email' | 'number' | 'textarea' | 'select' | 'checkbox' | 'date' | 'datetime';
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  validation?: string;
  placeholder?: string;
  step?: number;
  rows?: number;
  defaultValue?: any;
  options?: Array<{ value: string; label: string }>;
  prefix?: string;
  suffix?: string;
};

type FormSchema = {
  fields: FormField[];
  submitLabel: string;
  cancelLabel: string;
};

const textField = (overrides: Partial<FormField> = {}): FormField => ({
  name: 'username',
  label: 'Username',
  type: 'text',
  required: false,
  ...overrides,
});

const makeSchema = (fields: FormField[]): FormSchema => ({
  fields,
  submitLabel: 'Submit',
  cancelLabel: 'Cancel',
});

describe('useFormValidation', () => {
  describe('validateField', () => {
    it('should return null for valid non-required value', () => {
      const { result } = renderHook(() =>
        useFormValidation(makeSchema([textField()]) as any),
      );

      const err = result.current.validateField(textField() as any, 'Alice');
      expect(err).toBeNull();
    });

    it('should return error for empty required field', () => {
      const field = textField({ required: true });
      const { result } = renderHook(() =>
        useFormValidation(makeSchema([field]) as any),
      );

      expect(result.current.validateField(field as any, '')).toContain(
        'required',
      );
      expect(
        result.current.validateField(field as any, undefined),
      ).toContain('required');
      expect(result.current.validateField(field as any, null)).toContain(
        'required',
      );
    });

    it('should validate minLength on text fields', () => {
      const field = textField({ minLength: 5 });
      const { result } = renderHook(() =>
        useFormValidation(makeSchema([field]) as any),
      );

      expect(result.current.validateField(field as any, 'Hi')).toContain(
        'at least 5',
      );
      expect(
        result.current.validateField(field as any, 'Hello World'),
      ).toBeNull();
    });

    it('should validate maxLength on text fields', () => {
      const field = textField({ maxLength: 10 });
      const { result } = renderHook(() =>
        useFormValidation(makeSchema([field]) as any),
      );

      expect(
        result.current.validateField(
          field as any,
          'This is a very long string',
        ),
      ).toContain('at most 10');
      expect(
        result.current.validateField(field as any, 'short'),
      ).toBeNull();
    });

    it('should validate number fields', () => {
      const field: FormField = {
        name: 'age',
        label: 'Age',
        type: 'number',
        min: 0,
        max: 120,
      };
      const { result } = renderHook(() =>
        useFormValidation(makeSchema([field]) as any),
      );

      expect(result.current.validateField(field as any, 50)).toBeNull();
      expect(result.current.validateField(field as any, -1)).toContain(
        'at least 0',
      );
      expect(result.current.validateField(field as any, 200)).toContain(
        'at most 120',
      );
    });

    it('should return error for NaN number', () => {
      const field: FormField = {
        name: 'price',
        label: 'Price',
        type: 'number',
      };
      const { result } = renderHook(() =>
        useFormValidation(makeSchema([field]) as any),
      );

      expect(
        result.current.validateField(field as any, 'not-a-number'),
      ).toContain('valid number');
    });

    it('should validate via validation rule key', () => {
      const field = textField({ validation: 'email' });
      const { result } = renderHook(() =>
        useFormValidation(makeSchema([field]) as any),
      );

      // Valid email passes
      expect(
        result.current.validateField(field as any, 'user@example.com'),
      ).toBeNull();
      // Invalid email fails
      const err = result.current.validateField(
        field as any,
        'not-an-email',
      );
      expect(err).toBeTruthy();
    });
  });

  describe('validateForm', () => {
    it('should return true when all fields are valid', () => {
      const fields = [
        textField({ name: 'name', label: 'Name', required: true }),
      ];
      const schema = makeSchema(fields);
      const { result } = renderHook(() =>
        useFormValidation(schema as any),
      );

      const setErrors = vi.fn();
      const valid = result.current.validateForm({ name: 'Alice' }, setErrors);

      expect(valid).toBe(true);
      expect(setErrors).toHaveBeenCalledWith({});
    });

    it('should return false and populate errors for invalid fields', () => {
      const fields = [
        textField({ name: 'name', label: 'Name', required: true }),
      ];
      const schema = makeSchema(fields);
      const { result } = renderHook(() =>
        useFormValidation(schema as any),
      );

      const setErrors = vi.fn();
      const valid = result.current.validateForm({ name: '' }, setErrors);

      expect(valid).toBe(false);
      const errors = setErrors.mock.calls[0][0];
      expect(errors.name).toContain('required');
    });

    it('should return true with no errors when schema is undefined', () => {
      const { result } = renderHook(() => useFormValidation(undefined));

      const setErrors = vi.fn();
      const valid = result.current.validateForm({}, setErrors);

      expect(valid).toBe(true);
      expect(setErrors).not.toHaveBeenCalled();
    });

    it('should validate multiple fields', () => {
      const fields: FormField[] = [
        textField({ name: 'name', label: 'Name', required: true }),
        {
          name: 'age',
          label: 'Age',
          type: 'number',
          min: 1,
          max: 120,
        },
      ];
      const schema = makeSchema(fields);
      const { result } = renderHook(() =>
        useFormValidation(schema as any),
      );

      const setErrors = vi.fn();
      const valid = result.current.validateForm(
        { name: '', age: -5 },
        setErrors,
      );

      expect(valid).toBe(false);
      const errors = setErrors.mock.calls[0][0];
      expect(errors.name).toBeTruthy();
      expect(errors.age).toBeTruthy();
    });
  });
});
