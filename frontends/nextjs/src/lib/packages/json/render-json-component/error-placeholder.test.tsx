import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'

import { Placeholder } from './error-placeholder'

describe('Placeholder', () => {
  it('renders its children', () => {
    render(<Placeholder tone="error">Broke</Placeholder>)
    expect(screen.getByText('Broke')).toBeTruthy()
  })

  it('styles the error tone with a solid red border', () => {
    const { container } = render(<Placeholder tone="error">x</Placeholder>)
    const div = container.firstElementChild as HTMLElement
    expect(div.style.border).toContain('solid')
    expect(div.style.border).toContain('red')
  })

  it('styles the warning tone with a solid yellow border', () => {
    const { container } = render(<Placeholder tone="warning">x</Placeholder>)
    const div = container.firstElementChild as HTMLElement
    expect(div.style.border).toContain('yellow')
  })

  it('styles the ref-warning tone with a dashed orange border', () => {
    const { container } = render(
      <Placeholder tone="ref-warning">x</Placeholder>
    )
    const div = container.firstElementChild as HTMLElement
    expect(div.style.border).toContain('dashed')
    expect(div.style.border).toContain('orange')
  })
})
