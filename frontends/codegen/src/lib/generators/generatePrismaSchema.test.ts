import { describe, expect, it } from 'vitest'
import { generatePrismaSchema } from './generatePrismaSchema'
import type { DbModel } from '@/types/project'

describe('generatePrismaSchema', () => {
  it('generates a datasource and generator header', () => {
    const result = generatePrismaSchema([])
    expect(result).toContain('generator client')
    expect(result).toContain('provider = "prisma-client-js"')
    expect(result).toContain('datasource db')
    expect(result).toContain('provider = "postgresql"')
  })

  it('generates a model with basic fields', () => {
    const models: DbModel[] = [
      {
        id: 'm1',
        name: 'User',
        fields: [
          { id: 'f1', name: 'id', type: 'String', isRequired: true, isUnique: true, isArray: false },
          { id: 'f2', name: 'email', type: 'String', isRequired: true, isUnique: true, isArray: false },
        ],
      },
    ]
    const result = generatePrismaSchema(models)
    expect(result).toContain('model User {')
    expect(result).toContain('id String')
    expect(result).toContain('@unique')
    expect(result).toContain('email String')
  })

  it('adds array modifier for array fields', () => {
    const models: DbModel[] = [
      {
        id: 'm1',
        name: 'Post',
        fields: [
          { id: 'f1', name: 'tags', type: 'String', isRequired: false, isUnique: false, isArray: true },
        ],
      },
    ]
    const result = generatePrismaSchema(models)
    expect(result).toContain('tags String[]')
  })

  it('adds ? for optional (non-required) fields', () => {
    const models: DbModel[] = [
      {
        id: 'm1',
        name: 'Profile',
        fields: [
          { id: 'f1', name: 'bio', type: 'String', isRequired: false, isUnique: false, isArray: false },
        ],
      },
    ]
    const result = generatePrismaSchema(models)
    expect(result).toContain('bio String?')
  })

  it('adds @default for fields with default values', () => {
    const models: DbModel[] = [
      {
        id: 'm1',
        name: 'Config',
        fields: [
          {
            id: 'f1',
            name: 'active',
            type: 'Boolean',
            isRequired: true,
            isUnique: false,
            isArray: false,
            defaultValue: 'true',
          },
        ],
      },
    ]
    const result = generatePrismaSchema(models)
    expect(result).toContain('@default(true)')
  })

  it('handles multiple models', () => {
    const models: DbModel[] = [
      { id: 'm1', name: 'User', fields: [] },
      { id: 'm2', name: 'Post', fields: [] },
    ]
    const result = generatePrismaSchema(models)
    expect(result).toContain('model User {')
    expect(result).toContain('model Post {')
  })

  it('returns valid schema for empty models list', () => {
    const result = generatePrismaSchema([])
    expect(result).not.toContain('model ')
    expect(result).toContain('generator client')
  })
})
