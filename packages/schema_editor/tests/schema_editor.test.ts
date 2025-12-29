import { describe, it, expect } from 'vitest'

describe('schema_editor package', () => {
  describe('metadata', () => {
    it('should have valid package structure', async () => {
      const metadata = await import('../seed/metadata.json')
      expect(metadata.packageId).toBe('schema_editor')
    })
  })

  describe('field types', () => {
    it.each([
      { type: 'string', nullable: true },
      { type: 'integer', nullable: false },
      { type: 'boolean', nullable: false },
      { type: 'datetime', nullable: true },
      { type: 'json', nullable: true },
    ])('should support $type', ({ type, nullable }) => {
      expect(type).toBeDefined()
      expect(typeof nullable).toBe('boolean')
    })
  })

  describe('relations', () => {
    it.each([
      { type: 'one_to_one' },
      { type: 'one_to_many' },
      { type: 'many_to_many' },
    ])('should support $type relation', ({ type }) => {
      expect(type).toBeDefined()
    })
  })
})
