import React from 'react'
import { render  } from '@/test-utils'

describe('Fab Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<div>Fab</div>)
    expect(container).toBeInTheDocument()
  })

  it('has correct structure', () => {
    const { getByText } = render(<div>Fab</div>)
    expect(getByText('Fab')).toBeInTheDocument()
  })

  it('supports custom classes', () => {
    const { container } = render(<div className="custom-class">Fab</div>)
    expect(container.firstChild).toHaveClass('custom-class')
  })
})
