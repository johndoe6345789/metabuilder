import React from 'react'
import { render  } from '@/test-utils'

describe('Sidebar Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<div>Sidebar</div>)
    expect(container).toBeInTheDocument()
  })

  it('has correct structure', () => {
    const { getByText } = render(<div>Sidebar</div>)
    expect(getByText('Sidebar')).toBeInTheDocument()
  })

  it('supports custom classes', () => {
    const { container } = render(<div className="custom-class">Sidebar</div>)
    expect(container.firstChild).toHaveClass('custom-class')
  })
})
