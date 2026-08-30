import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'

import { ColorField } from './ColorField'

describe('ColorField', () => {
  it('shows the label', () => {
    render(<ColorField label="Background" value="#000" onChange={vi.fn()} />)
    expect(screen.getByText('Background')).toBeTruthy()
  })

  it('reports the picked color', () => {
    const onChange = vi.fn()
    const { container } = render(
      <ColorField label="Background" value="#000000" onChange={onChange} />
    )
    const input = container.querySelector('input[type="color"]')
    if (input === null) throw new Error('missing color input')
    fireEvent.change(input, { target: { value: '#ff0000' } })
    expect(onChange).toHaveBeenCalledWith('#ff0000')
  })
})
