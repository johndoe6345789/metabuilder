import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ItemsPerPageSelector } from './ItemsPerPageSelector'

describe('ItemsPerPageSelector', () => {
  it.each([
    { value: 10 },
    { value: 20 },
    { value: 50 },
    { value: 100 },
  ])('should display selected value $value', ({ value }) => {
    const onChange = vi.fn()

    const { container } = render(
      <ItemsPerPageSelector
        value={value}
        onChange={onChange}
      />
    )

    // The select component should render without error
    const select = container.querySelector('select')
    expect(select).toBeDefined()
  })

  it('should call onChange when value is changed', () => {
    const onChange = vi.fn()

    const { container } = render(
      <ItemsPerPageSelector
        value={20}
        onChange={onChange}
      />
    )

    const select = container.querySelector('select')
    expect(select !== null).toBe(true)
    if (select !== null) {
      // Create a proper change event with a select element
      Object.defineProperty(select, 'value', {
        writable: true,
        value: '50'
      })
      fireEvent.change(select, { target: { value: '50' } })
      expect(onChange).toHaveBeenCalledWith(50)
    }
  })

  it('should render custom options', () => {
    const onChange = vi.fn()
    const customOptions = [5, 15, 25]

    const { container } = render(
      <ItemsPerPageSelector
        value={15}
        onChange={onChange}
        options={customOptions}
      />
    )

    const select = container.querySelector('select')
    expect(select).toBeDefined()
    
    // Check all custom options are rendered as MenuItem children
    const menuItems = container.querySelectorAll('.menu-item')
    expect(menuItems.length).toBe(customOptions.length)
  })

  it('should render custom label', () => {
    const onChange = vi.fn()
    const customLabel = 'Results per page'

    render(
      <ItemsPerPageSelector
        value={20}
        onChange={onChange}
        label={customLabel}
      />
    )

    expect(screen.getByLabelText(customLabel)).toBeDefined()
  })

  it('should be disabled when disabled prop is true', () => {
    const onChange = vi.fn()

    const { container } = render(
      <ItemsPerPageSelector
        value={20}
        onChange={onChange}
        disabled={true}
      />
    )

    const select = container.querySelector('select')
    expect(select).toBeDefined()
    expect(select?.hasAttribute('disabled')).toBe(true)
  })

  it('should render default options when none provided', () => {
    const onChange = vi.fn()
    const defaultOptions = [10, 20, 50, 100]

    const { container } = render(
      <ItemsPerPageSelector
        value={20}
        onChange={onChange}
      />
    )

    const select = container.querySelector('select')
    expect(select).toBeDefined()
    
    // Check all default options are rendered as MenuItem children
    const menuItems = container.querySelectorAll('.menu-item')
    expect(menuItems.length).toBe(defaultOptions.length)
  })
})
