import React from 'react'
import { render  } from '@/test-utils'

describe('Table Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<div>Table</div>)
    expect(container).toBeInTheDocument()
  })

  it('has correct structure', () => {
    const { getByText } = render(<div>Table</div>)
    expect(getByText('Table')).toBeInTheDocument()
  })

  it('supports custom classes', () => {
    const { container } = render(<div className="custom-class">Table</div>)
    expect(container.firstChild).toHaveClass('custom-class')
  })
})
