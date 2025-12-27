import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  SimplePagination,
  TablePagination,
} from './index'

describe('Pagination components', () => {
  it('triggers onChange for root Pagination', () => {
    const handleChange = vi.fn()
    render(<Pagination count={3} page={1} onChange={handleChange} />)

    fireEvent.click(screen.getByRole('button', { name: 'Go to page 2' }))

    expect(handleChange).toHaveBeenCalledWith(2)
  })

  it('handles SimplePagination controls', () => {
    const onPrevious = vi.fn()
    const onNext = vi.fn()
    render(
      <SimplePagination
        hasPrevious={false}
        hasNext
        onPrevious={onPrevious}
        onNext={onNext}
        previousLabel="Prev"
        nextLabel="Next"
      />
    )

    expect(screen.getByText('Prev').closest('button')?.disabled).toBe(true)
    fireEvent.click(screen.getByText('Next'))

    expect(onNext).toHaveBeenCalled()
  })

  it('navigates TablePagination pages', () => {
    const onPageChange = vi.fn()
    const onPageSizeChange = vi.fn()
    render(
      <TablePagination
        count={30}
        page={2}
        pageSize={10}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        showFirstLastButtons={false}
      />
    )

    expect(screen.getByText('11-20 of 30')).toBeDefined()

    fireEvent.click(screen.getByRole('button', { name: 'Go to next page' }))

    expect(onPageChange).toHaveBeenCalledWith(3)
  })

  it('renders content wrappers', () => {
    render(
      <PaginationContent>
        <PaginationItem>
          <PaginationLink isActive>1</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
      </PaginationContent>
    )

    expect(screen.getByRole('list')).toBeDefined()
    expect(screen.getAllByRole('listitem')).to.have.length(2)
  })

  it('renders link variants', () => {
    const handleClick = vi.fn()
    render(
      <PaginationLink onClick={handleClick} isActive>
        5
      </PaginationLink>
    )

    fireEvent.click(screen.getByRole('button'))

    expect(handleClick).toHaveBeenCalled()
  })

  it('wraps icon links for previous and next', () => {
    const onPrevious = vi.fn()
    const onNext = vi.fn()
    render(
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious onClick={onPrevious} />
        </PaginationItem>
        <PaginationItem>
          <PaginationNext onClick={onNext} />
        </PaginationItem>
      </PaginationContent>
    )

    const buttons = screen.getAllByRole('button')
    fireEvent.click(buttons[0])
    fireEvent.click(buttons[1])

    expect(onPrevious).toHaveBeenCalled()
    expect(onNext).toHaveBeenCalled()
  })

  it('renders ellipsis marker', () => {
    render(<PaginationEllipsis />)

    expect(screen.getByText('...')).toBeDefined()
  })
})
