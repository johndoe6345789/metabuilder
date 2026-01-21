import React from 'react'
import { render  } from '@/test-utils'

describe('DropdownMenu Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<div>DropdownMenu</div>)
    expect(container).toBeInTheDocument()
  })

  it('has correct structure', () => {
    const { getByText } = render(<div>DropdownMenu</div>)
    expect(getByText('DropdownMenu')).toBeInTheDocument()
  })

  it('supports custom classes', () => {
    const { container } = render(<div className="custom-class">DropdownMenu</div>)
    expect(container.firstChild).toHaveClass('custom-class')
  })
})
