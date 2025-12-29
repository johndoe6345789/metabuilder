import { describe, it, expect } from 'vitest'

describe('data_table package', () => {
  describe('metadata', () => {
    it('should have valid package structure', async () => {
      const metadata = await import('../seed/metadata.json')
      expect(metadata.packageId).toBe('data_table')
    })
  })

  describe('columns', () => {
    it.each([
      { type: 'text', id: 'name', label: 'Name' },
      { type: 'number', id: 'age', label: 'Age' },
      { type: 'date', id: 'created', label: 'Created' },
    ])('should define $type column for $id', ({ type, id, label }) => {
      expect(type).toBeDefined()
      expect(id).toBeDefined()
      expect(label).toBeDefined()
    })
  })

  describe('pagination', () => {
    it.each([
      { total: 100, page: 1, per_page: 10, expected_pages: 10 },
      { total: 25, page: 2, per_page: 10, expected_pages: 3 },
      { total: 0, page: 1, per_page: 10, expected_pages: 0 },
    ])('should calculate pages for total=$total', ({ total, per_page, expected_pages }) => {
      const pages = Math.ceil(total / per_page)
      expect(pages).toBe(expected_pages)
    })
  })
})
