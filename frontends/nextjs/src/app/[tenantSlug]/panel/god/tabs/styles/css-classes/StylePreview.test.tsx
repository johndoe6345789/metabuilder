import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'

import { StylePreview } from './StylePreview'

describe('StylePreview', () => {
  it('renders a scoped stylesheet rule for the declarations', () => {
    const { container } = render(
      <StylePreview id="c1" css={{ color: 'red' }} />
    )
    expect(container.querySelector('style')?.textContent).toContain(
      'color: red'
    )
  })

  it('scopes the rule to a class derived from the id', () => {
    const { container } = render(
      <StylePreview id="c1" css={{ color: 'red' }} />
    )
    expect(container.querySelector('.sp-c1')).not.toBeNull()
  })

  it('strips characters unsafe in a CSS class from the id', () => {
    const { container } = render(
      <StylePreview id="a b/c" css={{}} />
    )
    expect(container.querySelector('style')?.textContent).toContain('.sp-abc')
  })

  it('shows the sample sentence', () => {
    render(<StylePreview id="c1" css={{}} />)
    expect(
      screen.getByText('The quick brown fox jumps over the lazy dog.')
    ).toBeTruthy()
  })
})
