import { fireEvent,render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { SearchBar } from './SearchBar'

describe('SearchBar', () => {
  it.each([
    { placeholder: 'Search...', value: '' },
    { placeholder: 'Find items...', value: 'test query' },
    { placeholder: 'Type to search', value: 'example' },
  ])('renders with placeholder "$placeholder" and value "$value"', ({ placeholder, value }) => {
    render(<SearchBar placeholder={placeholder} value={value} />)

    expect(screen.getByPlaceholderText(placeholder)).toBeTruthy()
    if (value) {
      expect(screen.getByDisplayValue(value)).toBeTruthy()
    }
  })

  it('shows search icon by default', () => {
    const { container } = render(<SearchBar />)

    // Search icon is always present
    expect(container.querySelector('svg')).toBeTruthy()
  })

  it.each([
    { showClearButton: true, value: 'test', shouldShowClear: true },
    { showClearButton: false, value: 'test', shouldShowClear: false },
    { showClearButton: true, value: '', shouldShowClear: false },
  ])(
    'handles clear button with showClearButton=$showClearButton, value="$value"',
    ({ showClearButton, value, shouldShowClear }) => {
      render(<SearchBar showClearButton={showClearButton} value={value} />)

      const clearButton = screen.queryByLabelText('clear search')
      if (shouldShowClear) {
        expect(clearButton).toBeTruthy()
      } else {
        expect(clearButton).toBeNull()
      }
    }
  )

  it('calls onClear when clear button is clicked', () => {
    const handleClear = vi.fn()
    const handleChange = vi.fn()
    render(<SearchBar value="test" onClear={handleClear} onChange={handleChange} />)

    const clearButton = screen.getByLabelText('clear search')
    fireEvent.click(clearButton)

    expect(handleClear).toHaveBeenCalled()
    expect(handleChange).toHaveBeenCalledWith('')
  })

  it.each([{ showFilterButton: true }, { showFilterButton: false }])(
    'renders filter button when showFilterButton=$showFilterButton',
    ({ showFilterButton }) => {
      render(<SearchBar showFilterButton={showFilterButton} />)

      const filterButton = screen.queryByLabelText('open filters')
      if (showFilterButton) {
        expect(filterButton).toBeTruthy()
      } else {
        expect(filterButton).toBeNull()
      }
    }
  )

  it('calls onFilterClick when filter button is clicked', () => {
    const handleFilterClick = vi.fn()
    render(<SearchBar showFilterButton onFilterClick={handleFilterClick} />)

    const filterButton = screen.getByLabelText('open filters')
    fireEvent.click(filterButton)

    expect(handleFilterClick).toHaveBeenCalled()
  })

  it('calls onChange when input value changes', () => {
    const handleChange = vi.fn()
    render(<SearchBar onChange={handleChange} />)

    const input = screen.getByPlaceholderText('Search...')
    fireEvent.change(input, { target: { value: 'new search' } })

    expect(handleChange).toHaveBeenCalledWith('new search')
  })
})
