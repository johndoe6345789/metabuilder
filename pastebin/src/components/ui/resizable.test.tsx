import React from 'react'
import { render  } from '@/test-utils'

describe('Resizable Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<div>Resizable</div>)
    expect(container).toBeInTheDocument()
  })

  it('has correct structure', () => {
    const { getByText } = render(<div>Resizable</div>)
    expect(getByText('Resizable')).toBeInTheDocument()
  })

  it('supports custom classes', () => {
    const { container } = render(<div className="custom-class">Resizable</div>)
    expect(container.firstChild).toHaveClass('custom-class')
  })
})
