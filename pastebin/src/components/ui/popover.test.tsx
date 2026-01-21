import React from 'react'
import { render  } from '@/test-utils'

describe('Popover Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<div>Popover</div>)
    expect(container).toBeInTheDocument()
  })

  it('has correct structure', () => {
    const { getByText } = render(<div>Popover</div>)
    expect(getByText('Popover')).toBeInTheDocument()
  })

  it('supports custom classes', () => {
    const { container } = render(<div className="custom-class">Popover</div>)
    expect(container.firstChild).toHaveClass('custom-class')
  })
})
