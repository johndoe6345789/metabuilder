/**
 * Tests for pagination utilities
 */

import { describe, it, expect } from 'vitest'
import {
  normalizePaginationParams,
  calculatePaginationMetadata,
  calculateOffset,
  createPaginationResponse,
  normalizeCursorPaginationParams,
  calculateCursorPaginationMetadata,
  createCursorPaginationResponse,
  encodeCursor,
  decodeCursor,
  getPageNumbers,
} from './pagination'

describe('pagination utilities', () => {
  describe('normalizePaginationParams', () => {
    it.each([
      { input: {}, expected: { page: 1, limit: 20 }, description: 'default values' },
      { input: { page: 2 }, expected: { page: 2, limit: 20 }, description: 'custom page' },
      { input: { limit: 50 }, expected: { page: 1, limit: 50 }, description: 'custom limit' },
      { input: { page: 3, limit: 30 }, expected: { page: 3, limit: 30 }, description: 'custom page and limit' },
      { input: { page: 0 }, expected: { page: 1, limit: 20 }, description: 'negative page to 1' },
      { input: { page: -5 }, expected: { page: 1, limit: 20 }, description: 'negative page to 1' },
      { input: { limit: 0 }, expected: { page: 1, limit: 1 }, description: 'zero limit to 1' },
      { input: { limit: -10 }, expected: { page: 1, limit: 1 }, description: 'negative limit to 1' },
      { input: { limit: 200 }, expected: { page: 1, limit: 100 }, description: 'limit capped at 100' },
    ])('should normalize $description', ({ input, expected }) => {
      expect(normalizePaginationParams(input)).toEqual(expected)
    })
  })

  describe('calculatePaginationMetadata', () => {
    it.each([
      {
        params: { page: 1, limit: 20 },
        total: 100,
        expected: { page: 1, limit: 20, total: 100, totalPages: 5, hasNextPage: true, hasPreviousPage: false },
        description: 'first page',
      },
      {
        params: { page: 3, limit: 20 },
        total: 100,
        expected: { page: 3, limit: 20, total: 100, totalPages: 5, hasNextPage: true, hasPreviousPage: true },
        description: 'middle page',
      },
      {
        params: { page: 5, limit: 20 },
        total: 100,
        expected: { page: 5, limit: 20, total: 100, totalPages: 5, hasNextPage: false, hasPreviousPage: true },
        description: 'last page',
      },
      {
        params: { page: 1, limit: 20 },
        total: 0,
        expected: { page: 1, limit: 20, total: 0, totalPages: 0, hasNextPage: false, hasPreviousPage: false },
        description: 'empty result set',
      },
      {
        params: { page: 1, limit: 20 },
        total: 15,
        expected: { page: 1, limit: 20, total: 15, totalPages: 1, hasNextPage: false, hasPreviousPage: false },
        description: 'single page result',
      },
    ])('should calculate metadata for $description', ({ params, total, expected }) => {
      expect(calculatePaginationMetadata(params, total)).toEqual(expected)
    })
  })

  describe('calculateOffset', () => {
    it.each([
      { page: 1, limit: 20, expected: 0, description: 'first page' },
      { page: 2, limit: 20, expected: 20, description: 'second page' },
      { page: 3, limit: 10, expected: 20, description: 'third page with limit 10' },
      { page: 5, limit: 25, expected: 100, description: 'fifth page with limit 25' },
    ])('should calculate offset for $description', ({ page, limit, expected }) => {
      expect(calculateOffset(page, limit)).toBe(expected)
    })
  })

  describe('createPaginationResponse', () => {
    it('should create complete pagination response', () => {
      const data = Array.from({ length: 20 }, (_, i) => ({ id: i + 1 }))
      const params = { page: 2, limit: 20 }
      const total = 100

      const response = createPaginationResponse(data, params, total)

      expect(response.data).toEqual(data)
      expect(response.meta).toEqual({
        page: 2,
        limit: 20,
        total: 100,
        totalPages: 5,
        hasNextPage: true,
        hasPreviousPage: true,
      })
    })
  })

  describe('normalizeCursorPaginationParams', () => {
    it.each([
      { input: {}, expected: { limit: 20, after: undefined, before: undefined }, description: 'default values' },
      { input: { limit: 50 }, expected: { limit: 50, after: undefined, before: undefined }, description: 'custom limit' },
      { input: { after: 'cursor1' }, expected: { limit: 20, after: 'cursor1', before: undefined }, description: 'with after cursor' },
      { input: { before: 'cursor2' }, expected: { limit: 20, after: undefined, before: 'cursor2' }, description: 'with before cursor' },
      { input: { limit: 200 }, expected: { limit: 100, after: undefined, before: undefined }, description: 'limit capped at 100' },
    ])('should normalize cursor params for $description', ({ input, expected }) => {
      expect(normalizeCursorPaginationParams(input)).toEqual(expected)
    })
  })

  describe('calculateCursorPaginationMetadata', () => {
    it('should calculate metadata with items', () => {
      const items = [
        { id: 'id1', name: 'Item 1' },
        { id: 'id2', name: 'Item 2' },
        { id: 'id3', name: 'Item 3' },
      ]

      const meta = calculateCursorPaginationMetadata(items, 3, true)

      expect(meta).toEqual({
        limit: 3,
        hasNextPage: true,
        hasPreviousPage: true,
        startCursor: 'id1',
        endCursor: 'id3',
      })
    })

    it('should calculate metadata with empty items', () => {
      const items: { id: string }[] = []

      const meta = calculateCursorPaginationMetadata(items, 20, false)

      expect(meta).toEqual({
        limit: 20,
        hasNextPage: false,
        hasPreviousPage: false,
        startCursor: undefined,
        endCursor: undefined,
      })
    })
  })

  describe('createCursorPaginationResponse', () => {
    it('should create cursor pagination response', () => {
      const data = [
        { id: 'id1', name: 'Item 1' },
        { id: 'id2', name: 'Item 2' },
      ]

      const response = createCursorPaginationResponse(data, 2, true)

      expect(response.data).toEqual(data)
      expect(response.meta).toEqual({
        limit: 2,
        hasNextPage: true,
        hasPreviousPage: true,
        startCursor: 'id1',
        endCursor: 'id2',
      })
    })
  })

  describe('cursor encoding/decoding', () => {
    it.each([
      { id: 'simple-id', description: 'simple ID' },
      { id: 'uuid-v4-1234-5678', description: 'UUID' },
      { id: '12345', description: 'numeric ID' },
      { id: 'special!@#$%', description: 'special characters' },
    ])('should encode and decode $description', ({ id }) => {
      const encoded = encodeCursor(id)
      const decoded = decodeCursor(encoded)
      
      expect(decoded).toBe(id)
      expect(encoded).not.toBe(id)
    })
  })

  describe('getPageNumbers', () => {
    it.each([
      { currentPage: 1, totalPages: 5, expected: [1, 2, 3, 4, 5], description: 'all pages visible' },
      { currentPage: 1, totalPages: 10, expected: [1, 2, 3, 4, 5, 6, 7], description: 'first page of many' },
      { currentPage: 5, totalPages: 10, expected: [2, 3, 4, 5, 6, 7, 8], description: 'middle page' },
      { currentPage: 10, totalPages: 10, expected: [4, 5, 6, 7, 8, 9, 10], description: 'last page' },
      { currentPage: 1, totalPages: 1, expected: [1], description: 'single page' },
      { currentPage: 2, totalPages: 3, expected: [1, 2, 3], description: 'few pages' },
    ])('should get page numbers for $description', ({ currentPage, totalPages, expected }) => {
      expect(getPageNumbers(currentPage, totalPages)).toEqual(expected)
    })

    it('should respect maxVisible parameter', () => {
      expect(getPageNumbers(5, 20, 5)).toEqual([3, 4, 5, 6, 7])
      expect(getPageNumbers(10, 20, 3)).toEqual([9, 10, 11])
    })
  })
})
