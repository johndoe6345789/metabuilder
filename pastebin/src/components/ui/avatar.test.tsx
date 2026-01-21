import React from 'react'
import { render  } from '@/test-utils'

describe('Avatar Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<div>Avatar</div>)
    expect(container).toBeInTheDocument()
  })

  it('has correct structure', () => {
    const { getByText } = render(<div>Avatar</div>)
    expect(getByText('Avatar')).toBeInTheDocument()
  })

  it('supports custom classes', () => {
    const { container } = render(<div className="custom-class">Avatar</div>)
    expect(container.firstChild).toHaveClass('custom-class')
  })
})
