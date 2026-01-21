import React from 'react'
import { render } from '@testing-library/react'
import { Skeleton } from './skeleton'

describe('Skeleton', () => {
  test('renders without crashing', () => {
    const { container } = render(<Skeleton />)
    expect(container).toBeInTheDocument()
  })

  test('renders a div element', () => {
    const { container } = render(<Skeleton />)
    const div = container.querySelector('div')
    expect(div).toBeInTheDocument()
  })

  test('applies skeleton classes', () => {
    const { container } = render(<Skeleton />)
    const div = container.querySelector('[data-slot="skeleton"]')
    expect(div).toBeInTheDocument()
  })

  test('has data-slot attribute', () => {
    const { container } = render(<Skeleton />)
    const div = container.querySelector('div')
    expect(div).toHaveAttribute('data-slot', 'skeleton')
  })

  test('applies default classes', () => {
    const { container } = render(<Skeleton />)
    const div = container.querySelector('div')
    expect(div?.className).toContain('bg-accent')
    expect(div?.className).toContain('animate-pulse')
    expect(div?.className).toContain('rounded-md')
  })

  test('accepts and applies custom className', () => {
    const { container } = render(<Skeleton className="custom-class" />)
    const div = container.querySelector('div')
    expect(div?.className).toContain('custom-class')
  })

  test('merges custom className with defaults', () => {
    const { container } = render(<Skeleton className="w-full h-12" />)
    const div = container.querySelector('div')
    const classes = div?.className || ''
    expect(classes).toContain('bg-accent')
    expect(classes).toContain('w-full')
    expect(classes).toContain('h-12')
  })

  test('forwards additional HTML attributes', () => {
    const { container } = render(<Skeleton id="test-skeleton" aria-label="Loading" />)
    const div = container.querySelector('div')
    expect(div).toHaveAttribute('id', 'test-skeleton')
    expect(div).toHaveAttribute('aria-label', 'Loading')
  })

  test('accepts style prop', () => {
    const { container } = render(<Skeleton style={{ width: '100px', height: '20px' }} />)
    const div = container.querySelector('div')
    expect(div).toHaveStyle('width: 100px')
    expect(div).toHaveStyle('height: 20px')
  })

  test('snapshot test', () => {
    const { container } = render(<Skeleton />)
    expect(container).toMatchSnapshot()
  })

  test('snapshot test with custom className', () => {
    const { container } = render(<Skeleton className="w-12 h-12 rounded-full" />)
    expect(container).toMatchSnapshot()
  })
})
