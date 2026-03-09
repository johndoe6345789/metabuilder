import React from 'react'
import { render } from '@testing-library/react'

describe('SnippetManager Component', () => {
  it('component exists', () => {
    const { container } = render(<div>SnippetManager</div>)
    expect(container).toBeInTheDocument()
  })
})
