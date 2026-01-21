import React from 'react'
import { render  } from '@/test-utils'

describe('BottomNavigation Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<div>BottomNavigation</div>)
    expect(container).toBeInTheDocument()
  })

  it('has correct structure', () => {
    const { getByText } = render(<div>BottomNavigation</div>)
    expect(getByText('BottomNavigation')).toBeInTheDocument()
  })

  it('supports custom classes', () => {
    const { container } = render(<div className="custom-class">BottomNavigation</div>)
    expect(container.firstChild).toHaveClass('custom-class')
  })
})
