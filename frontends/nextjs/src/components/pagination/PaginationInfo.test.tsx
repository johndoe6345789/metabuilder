import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PaginationInfo } from './PaginationInfo'
import type { PaginationMetadata } from '@/lib/api/pagination'

describe('PaginationInfo', () => {
  const createMetadata = (overrides?: Partial<PaginationMetadata>): PaginationMetadata => ({
    page: 1,
    limit: 20,
    total: 100,
    totalPages: 5,
    hasNextPage: true,
    hasPreviousPage: false,
    ...overrides,
  })

  it.each([
    {
      name: 'first page of many',
      metadata: createMetadata({ page: 1, limit: 20, total: 100 }),
      expectedText: 'Showing 1-20 of 100 items',
    },
    {
      name: 'middle page',
      metadata: createMetadata({ page: 3, limit: 20, total: 100 }),
      expectedText: 'Showing 41-60 of 100 items',
    },
    {
      name: 'last page with partial results',
      metadata: createMetadata({ page: 5, limit: 20, total: 85 }),
      expectedText: 'Showing 81-85 of 85 items',
    },
    {
      name: 'single page with few items',
      metadata: createMetadata({ page: 1, limit: 20, total: 5 }),
      expectedText: 'Showing 1-5 of 5 items',
    },
    {
      name: 'page with 1 item',
      metadata: createMetadata({ page: 1, limit: 20, total: 1 }),
      expectedText: 'Showing 1-1 of 1 items',
    },
  ])('should display correct text for $name', ({ metadata, expectedText }) => {
    render(<PaginationInfo metadata={metadata} />)
    
    expect(screen.getByText(expectedText)).toBeDefined()
  })

  it('should display "No items found" when total is 0', () => {
    const metadata = createMetadata({ page: 1, limit: 20, total: 0, totalPages: 0 })
    
    render(<PaginationInfo metadata={metadata} />)
    
    expect(screen.getByText('No items found')).toBeDefined()
  })

  it('should handle different page sizes correctly', () => {
    const testCases = [
      { page: 1, limit: 10, total: 50, expected: 'Showing 1-10 of 50 items' },
      { page: 2, limit: 10, total: 50, expected: 'Showing 11-20 of 50 items' },
      { page: 1, limit: 50, total: 100, expected: 'Showing 1-50 of 100 items' },
      { page: 3, limit: 50, total: 125, expected: 'Showing 101-125 of 125 items' },
    ]

    testCases.forEach(({ page, limit, total, expected }) => {
      const metadata = createMetadata({ page, limit, total })
      const { unmount } = render(<PaginationInfo metadata={metadata} />)
      
      expect(screen.getByText(expected)).toBeDefined()
      
      unmount()
    })
  })
})
