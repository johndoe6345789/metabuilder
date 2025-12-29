import { describe, expect,it } from 'vitest'

import type { FieldSchema, ModelSchema } from '@/lib/schema-types'
import { validateField, validateRecord } from '@/lib/schema-utils'

import { createMockModel } from './schema-utils.fixtures'

describe('schema-utils validation', () => {
  describe('validateField', () => {
    it.each([
      {
        name: 'required field empty',
        field: { name: 'email', type: 'email', required: true },
        value: '',
        shouldHaveError: true,
      },
      {
        name: 'non-required field empty',
        field: { name: 'nickname', type: 'string', required: false },
        value: '',
        shouldHaveError: false,
      },
      {
        name: 'invalid email',
        field: { name: 'email', type: 'email' },
        value: 'invalid',
        shouldHaveError: true,
      },
      {
        name: 'valid email',
        field: { name: 'email', type: 'email' },
        value: 'test@example.com',
        shouldHaveError: false,
      },
      {
        name: 'invalid URL',
        field: { name: 'website', type: 'url' },
        value: 'not a url',
        shouldHaveError: true,
      },
      {
        name: 'valid URL',
        field: { name: 'website', type: 'url' },
        value: 'https://example.com',
        shouldHaveError: false,
      },
      {
        name: 'number below min',
        field: { name: 'age', type: 'number', validation: { min: 0, max: 150 } },
        value: -1,
        shouldHaveError: true,
      },
      {
        name: 'number above max',
        field: { name: 'age', type: 'number', validation: { min: 0, max: 150 } },
        value: 200,
        shouldHaveError: true,
      },
      {
        name: 'valid number in range',
        field: { name: 'age', type: 'number', validation: { min: 0, max: 150 } },
        value: 25,
        shouldHaveError: false,
      },
      {
        name: 'string too short',
        field: { name: 'password', type: 'string', validation: { minLength: 8, maxLength: 20 } },
        value: 'short',
        shouldHaveError: true,
      },
      {
        name: 'string too long',
        field: { name: 'password', type: 'string', validation: { minLength: 8, maxLength: 20 } },
        value: 'verylongpasswordthatexceedslimit',
        shouldHaveError: true,
      },
      {
        name: 'valid string length',
        field: { name: 'password', type: 'string', validation: { minLength: 8, maxLength: 20 } },
        value: 'goodpass123',
        shouldHaveError: false,
      },
      {
        name: 'valid pattern match',
        field: { name: 'code', type: 'string', validation: { pattern: '^[A-Z]{3}-\\d{3}$' } },
        value: 'ABC-123',
        shouldHaveError: false,
      },
      {
        name: 'invalid pattern match',
        field: { name: 'code', type: 'string', validation: { pattern: '^[A-Z]{3}-\\d{3}$' } },
        value: 'abc-123',
        shouldHaveError: true,
      },
    ])('should $name', ({ field, value, shouldHaveError }) => {
      const result = validateField(field as FieldSchema, value)
      if (shouldHaveError) {
        expect(result).toBeTruthy()
      } else {
        expect(result).toBeNull()
      }
    })
  })

  describe('validateRecord', () => {
    it('should validate all fields in a record', () => {
      const record = { id: '1', name: 'John', email: 'invalid-email' }
      const errors = validateRecord(createMockModel(), record)
      expect(errors.email).toBeTruthy()
    })

    it('should return empty errors for valid record', () => {
      const record = {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        age: 30,
      }
      const errors = validateRecord(createMockModel(), record)
      expect(Object.keys(errors).length).toBe(0)
    })

    it('should skip non-editable fields', () => {
      const model: ModelSchema = {
        name: 'Post',
        fields: [
          { name: 'id', type: 'string', editable: false },
          { name: 'title', type: 'string', required: true },
        ],
      }
      const record = { title: '' }
      const errors = validateRecord(model, record)
      expect(errors.id).toBeUndefined()
      expect(errors.title).toBeTruthy()
    })
  })
})
