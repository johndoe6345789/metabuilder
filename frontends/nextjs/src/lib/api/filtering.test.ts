/**
 * Tests for filtering and sorting utilities
 */

import { describe, it, expect } from 'vitest'
import {
  parseFilterString,
  parseFilterObject,
  buildQueryWhere,
  parseSortString,
  buildQueryOrderBy,
  isValidFieldName,
  validateFilters,
  validateSort,
} from './filtering'

describe('filtering and sorting utilities', () => {
  describe('parseFilterString', () => {
    it.each([
      { input: '', expected: [], description: 'empty string' },
      { input: 'name:John', expected: [{ field: 'name', operator: 'eq', value: 'John' }], description: 'simple equality' },
      { input: 'age:gt:18', expected: [{ field: 'age', operator: 'gt', value: 18 }], description: 'greater than' },
      { input: 'active:eq:true', expected: [{ field: 'active', operator: 'eq', value: true }], description: 'boolean true' },
      { input: 'deleted:eq:false', expected: [{ field: 'deleted', operator: 'eq', value: false }], description: 'boolean false' },
      { input: 'role:in:admin,user', expected: [{ field: 'role', operator: 'in', value: 'admin' }], description: 'in operator (first value)' },
      { input: 'name:contains:john', expected: [{ field: 'name', operator: 'contains', value: 'john' }], description: 'contains operator' },
      { input: 'email:startsWith:admin', expected: [{ field: 'email', operator: 'startsWith', value: 'admin' }], description: 'startsWith operator' },
    ])('should parse $description', ({ input, expected }) => {
      const result = parseFilterString(input)
      if (expected.length === 0) {
        expect(result).toEqual(expected)
      } else {
        expect(result[0]).toEqual(expected[0])
      }
    })

    it('should parse multiple filters', () => {
      const result = parseFilterString('name:John,age:gt:18,active:true')
      
      expect(result).toHaveLength(3)
      expect(result[0]).toEqual({ field: 'name', operator: 'eq', value: 'John' })
      expect(result[1]).toEqual({ field: 'age', operator: 'gt', value: 18 })
      expect(result[2]).toEqual({ field: 'active', operator: 'eq', value: true })
    })
  })

  describe('parseFilterObject', () => {
    it.each([
      { input: {}, expected: [], description: 'empty object' },
      { input: { name: 'John' }, expected: [{ field: 'name', operator: 'eq', value: 'John' }], description: 'simple equality' },
      { input: { age: 18 }, expected: [{ field: 'age', operator: 'eq', value: 18 }], description: 'numeric value' },
      { input: { active: true }, expected: [{ field: 'active', operator: 'eq', value: true }], description: 'boolean value' },
      { input: { name: null }, expected: [{ field: 'name', operator: 'eq', value: null }], description: 'null value' },
    ])('should parse $description', ({ input, expected }) => {
      const result = parseFilterObject(input)
      expect(result).toEqual(expected)
    })

    it('should parse operator objects', () => {
      const result = parseFilterObject({ age: { $gt: 18, $lt: 65 } })
      
      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({ field: 'age', operator: 'gt', value: 18 })
      expect(result[1]).toEqual({ field: 'age', operator: 'lt', value: 65 })
    })

    it('should parse multiple fields', () => {
      const result = parseFilterObject({ name: 'John', age: 30, active: true })
      
      expect(result).toHaveLength(3)
      expect(result).toContainEqual({ field: 'name', operator: 'eq', value: 'John' })
      expect(result).toContainEqual({ field: 'age', operator: 'eq', value: 30 })
      expect(result).toContainEqual({ field: 'active', operator: 'eq', value: true })
    })
  })

  describe('buildQueryWhere', () => {
    it.each([
      {
        input: [{ field: 'name', operator: 'eq' as const, value: 'John' }],
        expected: { name: 'John' },
        description: 'equality',
      },
      {
        input: [{ field: 'age', operator: 'gt' as const, value: 18 }],
        expected: { age: { gt: 18 } },
        description: 'greater than',
      },
      {
        input: [{ field: 'age', operator: 'gte' as const, value: 18 }],
        expected: { age: { gte: 18 } },
        description: 'greater than or equal',
      },
      {
        input: [{ field: 'age', operator: 'lt' as const, value: 65 }],
        expected: { age: { lt: 65 } },
        description: 'less than',
      },
      {
        input: [{ field: 'age', operator: 'lte' as const, value: 65 }],
        expected: { age: { lte: 65 } },
        description: 'less than or equal',
      },
      {
        input: [{ field: 'role', operator: 'in' as const, value: ['admin', 'user'] }],
        expected: { role: { in: ['admin', 'user'] } },
        description: 'in array',
      },
      {
        input: [{ field: 'role', operator: 'notIn' as const, value: ['guest'] }],
        expected: { role: { notIn: ['guest'] } },
        description: 'not in array',
      },
      {
        input: [{ field: 'name', operator: 'contains' as const, value: 'john' }],
        expected: { name: { contains: 'john', mode: 'insensitive' } },
        description: 'contains',
      },
      {
        input: [{ field: 'email', operator: 'startsWith' as const, value: 'admin' }],
        expected: { email: { startsWith: 'admin', mode: 'insensitive' } },
        description: 'startsWith',
      },
      {
        input: [{ field: 'name', operator: 'endsWith' as const, value: 'son' }],
        expected: { name: { endsWith: 'son', mode: 'insensitive' } },
        description: 'endsWith',
      },
      {
        input: [{ field: 'deletedAt', operator: 'isNull' as const }],
        expected: { deletedAt: null },
        description: 'is null',
      },
      {
        input: [{ field: 'deletedAt', operator: 'isNotNull' as const }],
        expected: { deletedAt: { not: null } },
        description: 'is not null',
      },
    ])('should build where clause for $description', ({ input, expected }) => {
      expect(buildQueryWhere(input)).toEqual(expected)
    })

    it('should build where clause with multiple conditions', () => {
      const conditions = [
        { field: 'name', operator: 'eq' as const, value: 'John' },
        { field: 'age', operator: 'gt' as const, value: 18 },
        { field: 'active', operator: 'eq' as const, value: true },
      ]

      const result = buildQueryWhere(conditions)

      expect(result).toEqual({
        name: 'John',
        age: { gt: 18 },
        active: true,
      })
    })
  })

  describe('parseSortString', () => {
    it.each([
      { input: '', expected: [], description: 'empty string' },
      { input: 'name', expected: [{ field: 'name', direction: 'asc' }], description: 'ascending' },
      { input: '-name', expected: [{ field: 'name', direction: 'desc' }], description: 'descending' },
      { input: 'name,-age', expected: [{ field: 'name', direction: 'asc' }, { field: 'age', direction: 'desc' }], description: 'multiple fields' },
    ])('should parse $description', ({ input, expected }) => {
      expect(parseSortString(input)).toEqual(expected)
    })
  })

  describe('buildQueryOrderBy', () => {
    it.each([
      {
        input: [{ field: 'name', direction: 'asc' as const }],
        expected: [{ name: 'asc' }],
        description: 'single ascending',
      },
      {
        input: [{ field: 'name', direction: 'desc' as const }],
        expected: [{ name: 'desc' }],
        description: 'single descending',
      },
      {
        input: [
          { field: 'name', direction: 'asc' as const },
          { field: 'age', direction: 'desc' as const },
        ],
        expected: [{ name: 'asc' }, { age: 'desc' }],
        description: 'multiple fields',
      },
    ])('should build orderBy for $description', ({ input, expected }) => {
      expect(buildQueryOrderBy(input)).toEqual(expected)
    })
  })

  describe('isValidFieldName', () => {
    it.each([
      { input: 'name', expected: true, description: 'simple field' },
      { input: 'user_name', expected: true, description: 'with underscore' },
      { input: 'user.name', expected: true, description: 'nested field' },
      { input: 'user.profile.name', expected: true, description: 'deeply nested' },
      { input: 'name123', expected: true, description: 'with numbers' },
      { input: 'name-field', expected: false, description: 'with hyphen' },
      { input: 'name field', expected: false, description: 'with space' },
      { input: 'name;DROP TABLE', expected: false, description: 'SQL injection attempt' },
      { input: '../../../etc/passwd', expected: false, description: 'path traversal' },
    ])('should validate $description', ({ input, expected }) => {
      expect(isValidFieldName(input)).toBe(expected)
    })
  })

  describe('validateFilters', () => {
    it('should validate valid filters', () => {
      const filters = [
        { field: 'name', operator: 'eq' as const, value: 'John' },
        { field: 'age', operator: 'gt' as const, value: 18 },
      ]

      const result = validateFilters(filters)

      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should reject invalid field names', () => {
      const filters = [
        { field: 'name;DROP TABLE', operator: 'eq' as const, value: 'John' },
      ]

      const result = validateFilters(filters)

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Invalid field name: name;DROP TABLE')
    })

    it('should reject invalid operators', () => {
      const filters = [
        { field: 'name', operator: 'invalid' as any, value: 'John' },
      ]

      const result = validateFilters(filters)

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Invalid operator: invalid')
    })

    it('should reject missing values for operators that need them', () => {
      const filters = [
        { field: 'name', operator: 'eq' as const, value: undefined },
      ]

      const result = validateFilters(filters)

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Operator eq requires a value')
    })
  })

  describe('validateSort', () => {
    it('should validate valid sort conditions', () => {
      const sorts = [
        { field: 'name', direction: 'asc' as const },
        { field: 'age', direction: 'desc' as const },
      ]

      const result = validateSort(sorts)

      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should reject invalid field names', () => {
      const sorts = [
        { field: 'name;DROP TABLE', direction: 'asc' as const },
      ]

      const result = validateSort(sorts)

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Invalid field name: name;DROP TABLE')
    })

    it('should reject invalid directions', () => {
      const sorts = [
        { field: 'name', direction: 'invalid' as any },
      ]

      const result = validateSort(sorts)

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Invalid sort direction: invalid')
    })
  })
})
