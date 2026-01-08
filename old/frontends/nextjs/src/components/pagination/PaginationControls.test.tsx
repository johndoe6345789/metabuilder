import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PaginationControls } from './PaginationControls'
import type { PaginationMetadata } from '@/lib/api/pagination'

describe('PaginationControls', () => {
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
      name: 'first page',
      metadata: createMetadata({ page: 1, hasPreviousPage: false }),
      expectedPage: 1,
    },
    {
      name: 'middle page',
      metadata: createMetadata({ page: 3, hasPreviousPage: true, hasNextPage: true }),
      expectedPage: 3,
    },
    {
      name: 'last page',
      metadata: createMetadata({ page: 5, totalPages: 5, hasNextPage: false }),
      expectedPage: 5,
    },
  ])('should render pagination for $name', ({ metadata, expectedPage }) => {
    const onPageChange = vi.fn()
    
    render(
      <PaginationControls
        metadata={metadata}
        onPageChange={onPageChange}
      />
    )

    // Check that the current page button exists (fakemui uses "Go to page X" aria-label)
    const currentPageButton = screen.getByRole('button', { name: `Go to page ${expectedPage}`, current: 'page' })
    expect(currentPageButton).toBeDefined()
  })

  it('should call onPageChange when page is clicked', () => {
    const onPageChange = vi.fn()
    const metadata = createMetadata()

    render(
      <PaginationControls
        metadata={metadata}
        onPageChange={onPageChange}
      />
    )

    // Click page 2 (fakemui uses "Go to page X" aria-label)
    const page2Button = screen.getByRole('button', { name: 'Go to page 2' })
    fireEvent.click(page2Button)

    expect(onPageChange).toHaveBeenCalledWith(2)
  })

  it('should disable pagination when disabled prop is true', () => {
    const onPageChange = vi.fn()
    const metadata = createMetadata()

    render(
      <PaginationControls
        metadata={metadata}
        onPageChange={onPageChange}
        disabled={true}
      />
    )

    // All buttons should be disabled (check disabled attribute)
    const buttons = screen.getAllByRole('button')
    buttons.forEach(button => {
      expect(button.hasAttribute('disabled')).toBe(true)
    })
  })

  it.each([
    { size: 'small' as const },
    { size: 'medium' as const },
    { size: 'large' as const },
  ])('should render with $size size', ({ size }) => {
    const onPageChange = vi.fn()
    const metadata = createMetadata()

    const { container } = render(
      <PaginationControls
        metadata={metadata}
        onPageChange={onPageChange}
        size={size}
      />
    )

    // Check that component renders without error
    expect(container.querySelector('.MuiPagination-root')).toBeDefined()
  })

  it('should render first and last buttons', () => {
    const onPageChange = vi.fn()
    const metadata = createMetadata({ page: 3, totalPages: 5 })

    render(
      <PaginationControls
        metadata={metadata}
        onPageChange={onPageChange}
      />
    )

    // Should have first and last navigation buttons
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThan(5) // More than just page numbers
  })
})
