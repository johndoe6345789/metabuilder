import { describe, it, expect, beforeEach } from 'vitest'
import {
  getModelKey,
  getRecordsKey,
  findModel,
  getFieldLabel,
  getModelLabel,
  getModelLabelPlural,
  getHelpText,
  generateId,
  validateField,
  validateRecord,
  getDefaultValue,
  createEmptyRecord,
  sortRecords,
  filterRecords,
} from '@/lib/schema-utils'
import type { FieldSchema, ModelSchema, SchemaConfig } from '@/lib/schema-types'

describe('schema-utils', () => {
  // Test data setup
  const mockField: FieldSchema = {
    name: 'email',
    type: 'email',
    label: 'Email Address',
    required: true,
    helpText: 'Enter a valid email',
  }

  const mockModel: ModelSchema = {
    name: 'User',
    label: 'User Account',
    labelPlural: 'Users',
    fields: [
      { name: 'id', type: 'string', required: true },
      { name: 'name', type: 'string', required: true, label: 'Full Name' },
      { name: 'email', type: 'email', required: true },
      { name: 'age', type: 'number' },
    ],
  }

  const mockSchema: SchemaConfig = {
    apps: [
      {
        name: 'TestApp',
        models: [mockModel],
      },
    ],
  }

  describe('getModelKey', () => {
    it.each([
      { appName: 'MyApp', modelName: 'User', expected: 'MyApp_User' },
      { appName: 'app-v2', modelName: 'User_Profile', expected: 'app-v2_User_Profile' },
      { appName: '', modelName: 'Model', expected: '_Model' },
    ])('should generate key "$expected" for app=$appName, model=$modelName', ({ appName, modelName, expected }) => {
      const result = getModelKey(appName, modelName)
      expect(result).toBe(expected)
    })
  })

  describe('getRecordsKey', () => {
    it('should generate a records key with prefix', () => {
      const result = getRecordsKey('MyApp', 'User')
      expect(result).toBe('records_MyApp_User')
    })

    it('should include records prefix', () => {
      const result = getRecordsKey('app', 'data')
      expect(result).toMatch(/^records_/)
    })
  })

  describe('findModel', () => {
    it('should find a model by app and model name', () => {
      const result = findModel(mockSchema, 'TestApp', 'User')
      expect(result).toBeDefined()
      expect(result?.name).toBe('User')
    })

    it('should return undefined if app not found', () => {
      const result = findModel(mockSchema, 'NonExistentApp', 'User')
      expect(result).toBeUndefined()
    })

    it('should return undefined if model not found in app', () => {
      const result = findModel(mockSchema, 'TestApp', 'NonExistentModel')
      expect(result).toBeUndefined()
    })

    it('should handle multiple apps correctly', () => {
      const multiAppSchema: SchemaConfig = {
        apps: [
          { name: 'App1', models: [{ name: 'Model1', fields: [] }] },
          { name: 'App2', models: [{ name: 'Model2', fields: [] }] },
        ],
      }
      const result = findModel(multiAppSchema, 'App2', 'Model2')
      expect(result?.name).toBe('Model2')
    })
  })

  describe('getFieldLabel', () => {
    it.each([
      { field: mockField, expected: 'Email Address', description: 'custom label' },
      { field: { name: 'email', type: 'email' }, expected: 'Email', description: 'auto-capitalized field name' },
      { field: { name: 'firstName', type: 'string' }, expected: 'FirstName', description: 'multi-word field name' },
    ])('should return $description', ({ field, expected }) => {
      const result = getFieldLabel(field as FieldSchema)
      expect(result).toBe(expected)
    })
  })

  describe('getModelLabel', () => {
    it('should return custom label if provided', () => {
      const result = getModelLabel(mockModel)
      expect(result).toBe('User Account')
    })

    it('should auto-capitalize model name if no label', () => {
      const model: ModelSchema = { name: 'user', fields: [] }
      const result = getModelLabel(model)
      expect(result).toBe('User')
    })
  })

  describe('getModelLabelPlural', () => {
    it('should return custom plural label if provided', () => {
      const result = getModelLabelPlural(mockModel)
      expect(result).toBe('Users')
    })

    it('should auto-pluralize if no labelPlural', () => {
      const model: ModelSchema = { name: 'User', label: 'User', fields: [] }
      const result = getModelLabelPlural(model)
      expect(result).toBe('Users')
    })
  })

  describe('getHelpText', () => {
    it('should return help text if string', () => {
      const result = getHelpText(mockField)
      expect(result).toBe('Enter a valid email')
    })

    it('should join array help text with spaces', () => {
      const field: FieldSchema = {
        name: 'test',
        type: 'string',
        helpText: ['Please enter', 'your email'],
      }
      const result = getHelpText(field)
      expect(result).toBe('Please enter your email')
    })

    it('should return empty string if no help text', () => {
      const field: FieldSchema = { name: 'test', type: 'string' }
      const result = getHelpText(field)
      expect(result).toBe('')
    })
  })

  describe('generateId', () => {
    it('should generate a unique ID', () => {
      const id1 = generateId()
      const id2 = generateId()
      expect(id1).not.toBe(id2)
    })

    it('should generate a string ID', () => {
      const id = generateId()
      expect(typeof id).toBe('string')
    })

    it('should generate a non-empty ID', () => {
      const id = generateId()
      expect(id.length).toBeGreaterThan(0)
    })
  })

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
      const errors = validateRecord(mockModel, record)
      expect(errors.email).toBeTruthy()
    })

    it('should return empty errors for valid record', () => {
      const record = {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        age: 30,
      }
      const errors = validateRecord(mockModel, record)
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

  describe('getDefaultValue', () => {
    it.each([
      { field: { name: 'count', type: 'number', default: 42 }, expected: 42, description: 'custom default' },
      { field: { name: 'text', type: 'string' }, expected: '', description: 'string type' },
      { field: { name: 'count', type: 'number' }, expected: 0, description: 'number type' },
      { field: { name: 'active', type: 'boolean' }, expected: false, description: 'boolean type' },
      { field: { name: 'birthDate', type: 'date' }, expected: null, description: 'date type' },
      { field: { name: 'createdAt', type: 'datetime' }, expected: null, description: 'datetime type' },
      {
        field: {
          name: 'status',
          type: 'select',
          choices: [
            { label: 'Active', value: 'active' },
            { label: 'Inactive', value: 'inactive' },
          ],
        },
        expected: 'active',
        description: 'select type returns first choice',
      },
    ])('should return $description', ({ field, expected }) => {
      const result = getDefaultValue(field as FieldSchema)
      expect(result).toBe(expected)
    })
  })

  describe('createEmptyRecord', () => {
    it('should create a record with all fields', () => {
      const record = createEmptyRecord(mockModel)
      expect(record.id).toBeDefined()
      expect(record.name).toBe('')
      expect(record.email).toBe('')
      expect(record.age).toBe(0)
    })

    it('should generate unique ID', () => {
      const record1 = createEmptyRecord(mockModel)
      const record2 = createEmptyRecord(mockModel)
      expect(record1.id).not.toBe(record2.id)
    })

    it('should set createdAt for datetime fields', () => {
      const model: ModelSchema = {
        name: 'Post',
        fields: [
          { name: 'id', type: 'string' },
          { name: 'createdAt', type: 'datetime' },
          { name: 'title', type: 'string' },
        ],
      }
      const record = createEmptyRecord(model)
      expect(record.createdAt).toBeTruthy()
      expect(typeof record.createdAt).toBe('string')
    })
  })

  describe('sortRecords', () => {
    let records: any[]

    beforeEach(() => {
      records = [
        { name: 'Charlie', age: 30 },
        { name: 'Alice', age: 25 },
        { name: 'Bob', age: 35 },
        { name: null, age: 20 },
      ]
    })

    it.each([
      { field: 'name', direction: 'asc' as const, expectedFirst: 'Alice', expectedLast: null },
      { field: 'name', direction: 'desc' as const, expectedFirst: 'Charlie', expectedLast: null },
      { field: 'age', direction: 'asc' as const, expectedFirst: 20, expectedLast: 35 },
      { field: 'age', direction: 'desc' as const, expectedFirst: 35, expectedLast: 20 },
    ])('should sort by $field in $direction order', ({ field, direction, expectedFirst }) => {
      const sorted = sortRecords(records, field, direction)
      expect(sorted[0][field]).toBe(expectedFirst)
    })

    it('should put null values at the end', () => {
      const sorted = sortRecords(records, 'name', 'asc')
      expect(sorted[sorted.length - 1].name).toBeNull()
    })

    it('should not mutate original array', () => {
      const original = [...records]
      sortRecords(records, 'name', 'asc')
      expect(records).toEqual(original)
    })
  })

  describe('filterRecords', () => {
    let records: any[]

    beforeEach(() => {
      records = [
        { name: 'Alice Johnson', email: 'alice@example.com', status: 'active' },
        { name: 'Bob Smith', email: 'bob@example.com', status: 'inactive' },
        { name: 'Charlie Brown', email: 'charlie@example.com', status: 'active' },
      ]
    })

    it.each([
      { searchTerm: 'alice', searchFields: ['name'], filters: {}, expectedCount: 1 },
      { searchTerm: 'ALICE', searchFields: ['name'], filters: {}, expectedCount: 1 },
      { searchTerm: 'bob', searchFields: ['name', 'email'], filters: {}, expectedCount: 1 },
      { searchTerm: '', searchFields: ['name'], filters: { status: 'active' }, expectedCount: 2 },
      { searchTerm: 'charlie', searchFields: ['name'], filters: { status: 'active' }, expectedCount: 1 },
      { searchTerm: '', searchFields: ['name'], filters: {}, expectedCount: 3 },
    ])(
      'should filter with searchTerm=$searchTerm, fields=$searchFields, filters=$filters',
      ({ searchTerm, searchFields, filters, expectedCount }) => {
        const result = filterRecords(records, searchTerm, searchFields, filters)
        expect(result.length).toBe(expectedCount)
      }
    )

    it('should handle null/undefined filter values', () => {
      const result = filterRecords(records, '', ['name'], {
        status: 'active',
        missing: null,
      })
      expect(result.length).toBe(2)
    })

    it('should not mutate original array', () => {
      const original = [...records]
      filterRecords(records, 'alice', ['name'], {})
      expect(records).toEqual(original)
    })
  })
})
