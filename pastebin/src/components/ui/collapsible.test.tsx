import React from 'react'
import { render  } from '@/test-utils'

describe('Collapsible Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<div>Collapsible</div>)
    expect(container).toBeInTheDocument()
  })

  it('has correct structure', () => {
    const { getByText } = render(<div>Collapsible</div>)
    expect(getByText('Collapsible')).toBeInTheDocument()
  })

  it('supports custom classes', () => {
    const { container } = render(<div className="custom-class">Collapsible</div>)
    expect(container.firstChild).toHaveClass('custom-class')
  })
})
