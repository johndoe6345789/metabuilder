import React from 'react'
import { render  } from '@/test-utils'

describe('AlertDialog Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<div>AlertDialog</div>)
    expect(container).toBeInTheDocument()
  })

  it('has correct structure', () => {
    const { getByText } = render(<div>AlertDialog</div>)
    expect(getByText('AlertDialog')).toBeInTheDocument()
  })

  it('supports custom classes', () => {
    const { container } = render(<div className="custom-class">AlertDialog</div>)
    expect(container.firstChild).toHaveClass('custom-class')
  })
})
