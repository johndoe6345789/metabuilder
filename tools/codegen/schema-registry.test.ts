import { describe, it, expect } from 'vitest'
import {
  computeSchemaChecksum,
  entityToPrisma,
  fieldToPrisma,
  type PackageSchemaEntity,
  type PackageSchemaField,
} from './schema-registry'

describe('schema-registry', () => {
  describe('computeSchemaChecksum', () => {
    it.each([
      {
        name: 'simple entity',
        entity: {
          name: 'TestEntity',
          version: '1.0',
          fields: {
            id: { type: 'cuid', primary: true },
            name: { type: 'string', required: true },
          },
        },
        expectLength: 16,
      },
      {
        name: 'entity with indexes',
        entity: {
          name: 'IndexedEntity',
          version: '1.0',
          fields: {
            id: { type: 'cuid', primary: true },
            tenantId: { type: 'string', index: true },
          },
          indexes: [{ fields: ['tenantId'] }],
        },
        expectLength: 16,
      },
    ])('computes $name checksum', ({ entity, expectLength }) => {
      const checksum = computeSchemaChecksum(entity as PackageSchemaEntity)
      expect(checksum).toHaveLength(expectLength)
      expect(typeof checksum).toBe('string')
    })

    it('returns same checksum for identical entities', () => {
      const entity: PackageSchemaEntity = {
        name: 'Test',
        version: '1.0',
        fields: { id: { type: 'cuid', primary: true } },
      }
      const checksum1 = computeSchemaChecksum(entity)
      const checksum2 = computeSchemaChecksum(entity)
      expect(checksum1).toBe(checksum2)
    })

    it('returns different checksum for different entities', () => {
      const entity1: PackageSchemaEntity = {
        name: 'Test1',
        version: '1.0',
        fields: { id: { type: 'cuid', primary: true } },
      }
      const entity2: PackageSchemaEntity = {
        name: 'Test2',
        version: '1.0',
        fields: { id: { type: 'cuid', primary: true } },
      }
      const checksum1 = computeSchemaChecksum(entity1)
      const checksum2 = computeSchemaChecksum(entity2)
      expect(checksum1).not.toBe(checksum2)
    })

    it('ignores description changes', () => {
      const entity1: PackageSchemaEntity = {
        name: 'Test',
        version: '1.0',
        description: 'Description 1',
        fields: { id: { type: 'cuid', primary: true } },
      }
      const entity2: PackageSchemaEntity = {
        name: 'Test',
        version: '1.0',
        description: 'Description 2',
        fields: { id: { type: 'cuid', primary: true } },
      }
      expect(computeSchemaChecksum(entity1)).toBe(computeSchemaChecksum(entity2))
    })
  })

  describe('fieldToPrisma', () => {
    it.each([
      {
        name: 'id',
        field: { type: 'cuid', primary: true, generated: true },
        expected: '  id String @id @default(cuid())',
      },
      {
        name: 'name',
        field: { type: 'string', required: true },
        expected: '  name String',
      },
      {
        name: 'nullable',
        field: { type: 'string', nullable: true },
        expected: '  nullable String?',
      },
      {
        name: 'count',
        field: { type: 'int', default: 0 },
        expected: '  count Int @default(0)',
      },
      {
        name: 'enabled',
        field: { type: 'boolean', default: false },
        expected: '  enabled Boolean @default(false)',
      },
      {
        name: 'timestamp',
        field: { type: 'bigint', required: true },
        expected: '  timestamp BigInt',
      },
      {
        name: 'unique',
        field: { type: 'string', unique: true },
        expected: '  unique String @unique',
      },
    ])('converts $name field to Prisma', ({ name, field, expected }) => {
      const result = fieldToPrisma(name, field as PackageSchemaField)
      expect(result).toBe(expected)
    })
  })

  describe('entityToPrisma', () => {
    it('generates complete Prisma model', () => {
      const entity: PackageSchemaEntity = {
        name: 'AuditLog',
        version: '1.0',
        fields: {
          id: { type: 'cuid', primary: true, generated: true },
          tenantId: { type: 'string', required: true },
          action: { type: 'string', required: true },
          timestamp: { type: 'bigint', required: true },
        },
        indexes: [
          { fields: ['tenantId'] },
          { fields: ['timestamp'] },
        ],
      }

      const prisma = entityToPrisma(entity)
      
      expect(prisma).toContain('model AuditLog {')
      expect(prisma).toContain('id String @id @default(cuid())')
      expect(prisma).toContain('tenantId String')
      expect(prisma).toContain('action String')
      expect(prisma).toContain('timestamp BigInt')
      expect(prisma).toContain('@@index([tenantId])')
      expect(prisma).toContain('@@index([timestamp])')
      expect(prisma).toContain('}')
    })

    it('generates unique index', () => {
      const entity: PackageSchemaEntity = {
        name: 'Test',
        version: '1.0',
        fields: {
          id: { type: 'cuid', primary: true },
          tenantId: { type: 'string' },
          slug: { type: 'string' },
        },
        indexes: [
          { fields: ['tenantId', 'slug'], unique: true },
        ],
      }

      const prisma = entityToPrisma(entity)
      expect(prisma).toContain('@@unique([tenantId, slug])')
    })

    it('generates relations', () => {
      const entity: PackageSchemaEntity = {
        name: 'Post',
        version: '1.0',
        fields: {
          id: { type: 'cuid', primary: true },
          authorId: { type: 'string' },
        },
        relations: [
          {
            name: 'author',
            type: 'belongsTo',
            entity: 'User',
            field: 'authorId',
            onDelete: 'Cascade',
          },
        ],
      }

      const prisma = entityToPrisma(entity)
      expect(prisma).toContain('author User @relation(fields: [authorId], references: [id], onDelete: Cascade)')
    })
  })
})
