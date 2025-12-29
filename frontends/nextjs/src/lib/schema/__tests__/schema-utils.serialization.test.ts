import { beforeEach, describe, expect, it } from 'vitest'

import type { FieldSchema, ModelSchema } from '@/lib/schema-types'
import {
  createEmptyRecord,
  filterRecords,
  generateId,
  getDefaultValue,
  getFieldLabel,
  getHelpText,
  getModelLabel,
  getModelLabelPlural,
  sortRecords,
} from '@/lib/schema-utils'

import { createMockField, createMockModel } from './schema-utils.fixtures'

describe('schema-utils serialization', () => {
  describe('getFieldLabel', () => {
    it.each([
      { field: createMockField(), expected: 'Email Address', description: 'custom label' },
      {
        field: { name: 'email', type: 'email' },
        expected: 'Email',
        description: 'auto-capitalized field name',
      },
      {
        field: { name: 'firstName', type: 'string' },
        expected: 'FirstName',
        description: 'multi-word field name',
      },
    ])('should return $description', ({ field, expected }) => {
      const result = getFieldLabel(field as FieldSchema)
      expect(result).toBe(expected)
    })
  })

  describe('getModelLabel', () => {
    it('should return custom label if provided', () => {
      const result = getModelLabel(createMockModel())
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
      const result = getModelLabelPlural(createMockModel())
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
      const result = getHelpText(createMockField())
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

  describe('getDefaultValue', () => {
    it.each([
      {
        field: { name: 'count', type: 'number', default: 42 },
        expected: 42,
        description: 'custom default',
      },
      { field: { name: 'text', type: 'string' }, expected: '', description: 'string type' },
      { field: { name: 'count', type: 'number' }, expected: 0, description: 'number type' },
      { field: { name: 'active', type: 'boolean' }, expected: false, description: 'boolean type' },
      { field: { name: 'birthDate', type: 'date' }, expected: null, description: 'date type' },
      {
        field: { name: 'createdAt', type: 'datetime' },
        expected: null,
        description: 'datetime type',
      },
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
      const record = createEmptyRecord(createMockModel())
      expect(record.id).toBeDefined()
      expect(record.name).toBe('')
      expect(record.email).toBe('')
      expect(record.age).toBe(0)
    })

    it('should generate unique ID', () => {
      const record1 = createEmptyRecord(createMockModel())
      const record2 = createEmptyRecord(createMockModel())
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
      {
        searchTerm: 'charlie',
        searchFields: ['name'],
        filters: { status: 'active' },
        expectedCount: 1,
      },
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
