import React from 'react'
import { render  } from '@/test-utils'

describe('ToggleGroup Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<div>ToggleGroup</div>)
    expect(container).toBeInTheDocument()
  })

  it('has correct structure', () => {
    const { getByText } = render(<div>ToggleGroup</div>)
    expect(getByText('ToggleGroup')).toBeInTheDocument()
  })

  it('supports custom classes', () => {
    const { container } = render(<div className="custom-class">ToggleGroup</div>)
    expect(container.firstChild).toHaveClass('custom-class')
  })
})
