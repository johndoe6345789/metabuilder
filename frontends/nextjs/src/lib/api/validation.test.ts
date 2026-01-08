/**
 * Tests for validation utilities
 */

import { describe, it, expect } from 'vitest'
import { z } from 'zod'
import {
  generateFieldSchema,
  generateEntitySchema,
  validateEntity,
  formatValidationErrors,
  createValidationMiddleware,
  commonSchemas,
  type EntityDefinition,
  type FieldDefinition,
} from './validation'

describe('validation utilities', () => {
  describe('generateFieldSchema', () => {
    it.each([
      { field: { name: 'name', type: 'string' as const }, value: 'John', shouldPass: true, description: 'string field' },
      { field: { name: 'age', type: 'number' as const }, value: 25, shouldPass: true, description: 'number field' },
      { field: { name: 'active', type: 'boolean' as const }, value: true, shouldPass: true, description: 'boolean field' },
      { field: { name: 'createdAt', type: 'date' as const }, value: new Date(), shouldPass: true, description: 'date field' },
      { field: { name: 'createdAt', type: 'date' as const }, value: '2024-01-01', shouldPass: true, description: 'date from string' },
    ])('should generate schema for $description', ({ field, value, shouldPass }) => {
      const schema = generateFieldSchema(field)
      const result = schema.safeParse(value)
      
      expect(result.success).toBe(shouldPass)
    })

    it('should generate enum schema', () => {
      const field: FieldDefinition = {
        name: 'role',
        type: 'enum',
        enum: ['admin', 'user', 'guest'],
      }

      const schema = generateFieldSchema(field)

      expect(schema.safeParse('admin').success).toBe(true)
      expect(schema.safeParse('invalid').success).toBe(false)
    })

    it('should generate array schema', () => {
      const field: FieldDefinition = {
        name: 'tags',
        type: 'array',
        arrayItemType: 'string',
      }

      const schema = generateFieldSchema(field)

      expect(schema.safeParse(['tag1', 'tag2']).success).toBe(true)
      expect(schema.safeParse([1, 2]).success).toBe(false)
      expect(schema.safeParse('not-array').success).toBe(false)
    })

    it('should generate object schema', () => {
      const field: FieldDefinition = {
        name: 'profile',
        type: 'object',
        objectFields: [
          { name: 'firstName', type: 'string', required: true },
          { name: 'lastName', type: 'string', required: true },
        ],
      }

      const schema = generateFieldSchema(field)

      expect(schema.safeParse({ firstName: 'John', lastName: 'Doe' }).success).toBe(true)
      expect(schema.safeParse({ firstName: 'John' }).success).toBe(false) // missing lastName
      expect(schema.safeParse('not-object').success).toBe(false)
    })

    it('should handle optional fields', () => {
      const field: FieldDefinition = {
        name: 'nickname',
        type: 'string',
        required: false,
      }

      const schema = generateFieldSchema(field)

      expect(schema.safeParse('Nick').success).toBe(true)
      expect(schema.safeParse(undefined).success).toBe(true)
    })

    it('should handle default values', () => {
      const field: FieldDefinition = {
        name: 'count',
        type: 'number',
        required: false,
        default: 0,
      }

      const schema = generateFieldSchema(field)
      const result = schema.safeParse(undefined)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toBe(0)
      }
    })

    it('should apply min validation for strings', () => {
      const field: FieldDefinition = {
        name: 'username',
        type: 'string',
        validation: [{ type: 'min', value: 3 }],
      }

      const schema = generateFieldSchema(field)

      expect(schema.safeParse('ab').success).toBe(false)
      expect(schema.safeParse('abc').success).toBe(true)
    })

    it('should apply max validation for strings', () => {
      const field: FieldDefinition = {
        name: 'username',
        type: 'string',
        validation: [{ type: 'max', value: 10 }],
      }

      const schema = generateFieldSchema(field)

      expect(schema.safeParse('a'.repeat(11)).success).toBe(false)
      expect(schema.safeParse('a'.repeat(10)).success).toBe(true)
    })

    it('should apply min/max validation for numbers', () => {
      const field: FieldDefinition = {
        name: 'age',
        type: 'number',
        validation: [
          { type: 'min', value: 18 },
          { type: 'max', value: 100 },
        ],
      }

      const schema = generateFieldSchema(field)

      expect(schema.safeParse(17).success).toBe(false)
      expect(schema.safeParse(18).success).toBe(true)
      expect(schema.safeParse(100).success).toBe(true)
      expect(schema.safeParse(101).success).toBe(false)
    })

    it('should apply pattern validation', () => {
      const field: FieldDefinition = {
        name: 'username',
        type: 'string',
        validation: [{ type: 'pattern', value: '^[a-z]+$' }],
      }

      const schema = generateFieldSchema(field)

      expect(schema.safeParse('abc').success).toBe(true)
      expect(schema.safeParse('ABC').success).toBe(false)
      expect(schema.safeParse('abc123').success).toBe(false)
    })

    it('should apply email validation', () => {
      const field: FieldDefinition = {
        name: 'email',
        type: 'string',
        validation: [{ type: 'email' }],
      }

      const schema = generateFieldSchema(field)

      expect(schema.safeParse('user@example.com').success).toBe(true)
      expect(schema.safeParse('invalid-email').success).toBe(false)
    })

    it('should apply url validation', () => {
      const field: FieldDefinition = {
        name: 'website',
        type: 'string',
        validation: [{ type: 'url' }],
      }

      const schema = generateFieldSchema(field)

      expect(schema.safeParse('https://example.com').success).toBe(true)
      expect(schema.safeParse('not-a-url').success).toBe(false)
    })
  })

  describe('generateEntitySchema', () => {
    it('should generate schema for entity with multiple fields', () => {
      const entity: EntityDefinition = {
        name: 'User',
        fields: [
          { name: 'id', type: 'string', required: true },
          { name: 'name', type: 'string', required: true },
          { name: 'email', type: 'string', required: true, validation: [{ type: 'email' }] },
          { name: 'age', type: 'number', required: false },
          { name: 'active', type: 'boolean', required: true },
        ],
      }

      const schema = generateEntitySchema(entity)

      const validUser = {
        id: '123',
        name: 'John Doe',
        email: 'john@example.com',
        age: 30,
        active: true,
      }

      expect(schema.safeParse(validUser).success).toBe(true)

      const invalidUser = {
        id: '123',
        name: 'John Doe',
        email: 'invalid-email',
        active: true,
      }

      expect(schema.safeParse(invalidUser).success).toBe(false)
    })

    it('should handle nested objects', () => {
      const entity: EntityDefinition = {
        name: 'Post',
        fields: [
          { name: 'id', type: 'string', required: true },
          {
            name: 'author',
            type: 'object',
            required: true,
            objectFields: [
              { name: 'id', type: 'string', required: true },
              { name: 'name', type: 'string', required: true },
            ],
          },
        ],
      }

      const schema = generateEntitySchema(entity)

      const validPost = {
        id: '1',
        author: { id: '2', name: 'John' },
      }

      expect(schema.safeParse(validPost).success).toBe(true)

      const invalidPost = {
        id: '1',
        author: { id: '2' }, // missing name
      }

      expect(schema.safeParse(invalidPost).success).toBe(false)
    })
  })

  describe('validateEntity', () => {
    const userEntity: EntityDefinition = {
      name: 'User',
      fields: [
        { name: 'name', type: 'string', required: true },
        { name: 'email', type: 'string', required: true, validation: [{ type: 'email' }] },
        { name: 'age', type: 'number', required: false },
      ],
    }

    it('should validate correct data', () => {
      const data = { name: 'John', email: 'john@example.com', age: 30 }
      const result = validateEntity(data, userEntity)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual(data)
      }
    })

    it('should reject invalid data', () => {
      const data = { name: 'John', email: 'invalid-email' }
      const result = validateEntity(data, userEntity)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.errors).toBeDefined()
      }
    })

    it('should reject missing required fields', () => {
      const data = { name: 'John' } // missing email
      const result = validateEntity(data, userEntity)

      expect(result.success).toBe(false)
    })
  })

  describe('formatValidationErrors', () => {
    it('should format Zod errors into user-friendly messages', () => {
      const schema = z.object({
        name: z.string().min(3),
        email: z.string().email(),
        age: z.number().min(18),
      })

      const result = schema.safeParse({ name: 'ab', email: 'invalid', age: 17 })

      if (!result.success) {
        const formatted = formatValidationErrors(result.error)

        expect(formatted.name).toBeDefined()
        expect(formatted.email).toBeDefined()
        expect(formatted.age).toBeDefined()
        expect(formatted.name?.[0]).toContain('3')
        expect(formatted.email?.[0]).toContain('email')
        expect(formatted.age?.[0]).toContain('18')
      }
    })

    it('should handle nested field errors', () => {
      const schema = z.object({
        profile: z.object({
          firstName: z.string().min(1),
          lastName: z.string().min(1),
        }),
      })

      const result = schema.safeParse({ profile: { firstName: '', lastName: '' } })

      if (!result.success) {
        const formatted = formatValidationErrors(result.error)

        expect(formatted['profile.firstName']).toBeDefined()
        expect(formatted['profile.lastName']).toBeDefined()
      }
    })
  })

  describe('createValidationMiddleware', () => {
    it('should create middleware that validates data', async () => {
      const entity: EntityDefinition = {
        name: 'User',
        fields: [
          { name: 'name', type: 'string', required: true },
          { name: 'email', type: 'string', required: true, validation: [{ type: 'email' }] },
        ],
      }

      const middleware = createValidationMiddleware(entity)

      const validData = { name: 'John', email: 'john@example.com' }
      const validResult = await middleware(validData)

      expect(validResult.valid).toBe(true)
      if (validResult.valid) {
        expect(validResult.data).toEqual(validData)
      }

      const invalidData = { name: 'John', email: 'invalid-email' }
      const invalidResult = await middleware(invalidData)

      expect(invalidResult.valid).toBe(false)
      if (!invalidResult.valid) {
        expect(invalidResult.errors.email).toBeDefined()
      }
    })
  })

  describe('commonSchemas', () => {
    it.each([
      { schema: 'email', value: 'user@example.com', shouldPass: true, description: 'valid email' },
      { schema: 'email', value: 'invalid', shouldPass: false, description: 'invalid email' },
      { schema: 'url', value: 'https://example.com', shouldPass: true, description: 'valid URL' },
      { schema: 'url', value: 'not-a-url', shouldPass: false, description: 'invalid URL' },
      { schema: 'uuid', value: '123e4567-e89b-12d3-a456-426614174000', shouldPass: true, description: 'valid UUID' },
      { schema: 'uuid', value: 'not-a-uuid', shouldPass: false, description: 'invalid UUID' },
      { schema: 'phoneNumber', value: '+1234567890', shouldPass: true, description: 'valid phone' },
      { schema: 'phoneNumber', value: 'not-a-phone', shouldPass: false, description: 'invalid phone' },
      { schema: 'password', value: 'password123', shouldPass: true, description: 'valid password' },
      { schema: 'password', value: 'short', shouldPass: false, description: 'short password' },
      { schema: 'username', value: 'john_doe', shouldPass: true, description: 'valid username' },
      { schema: 'username', value: 'a', shouldPass: false, description: 'short username' },
      { schema: 'username', value: 'invalid username!', shouldPass: false, description: 'invalid username chars' },
    ])('should validate $description', ({ schema, value, shouldPass }) => {
      const result = commonSchemas[schema as keyof typeof commonSchemas].safeParse(value)
      expect(result.success).toBe(shouldPass)
    })

    it('should validate positive integers', () => {
      expect(commonSchemas.positiveInt.safeParse(1).success).toBe(true)
      expect(commonSchemas.positiveInt.safeParse(0).success).toBe(false)
      expect(commonSchemas.positiveInt.safeParse(-1).success).toBe(false)
      expect(commonSchemas.positiveInt.safeParse(1.5).success).toBe(false)
    })

    it('should validate non-negative integers', () => {
      expect(commonSchemas.nonNegativeInt.safeParse(0).success).toBe(true)
      expect(commonSchemas.nonNegativeInt.safeParse(1).success).toBe(true)
      expect(commonSchemas.nonNegativeInt.safeParse(-1).success).toBe(false)
      expect(commonSchemas.nonNegativeInt.safeParse(1.5).success).toBe(false)
    })
  })
})
