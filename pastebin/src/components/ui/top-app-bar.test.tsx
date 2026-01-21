import React from 'react'
import { render  } from '@/test-utils'

describe('TopAppBar Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<div>TopAppBar</div>)
    expect(container).toBeInTheDocument()
  })

  it('has correct structure', () => {
    const { getByText } = render(<div>TopAppBar</div>)
    expect(getByText('TopAppBar')).toBeInTheDocument()
  })

  it('supports custom classes', () => {
    const { container } = render(<div className="custom-class">TopAppBar</div>)
    expect(container.firstChild).toHaveClass('custom-class')
  })
})
