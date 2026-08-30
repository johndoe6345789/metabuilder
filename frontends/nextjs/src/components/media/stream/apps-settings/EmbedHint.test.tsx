import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'

import { EmbedHint } from './EmbedHint'

describe('EmbedHint', () => {
  it('warns that most services block iframe embedding', () => {
    render(<EmbedHint />)
    expect(screen.getByText(/block iframe embedding/)).toBeTruthy()
  })
})
