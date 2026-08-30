import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'

import { controlHint } from './control-hint'

describe('controlHint', () => {
  it('renders nothing when the control has no hint', () => {
    expect(controlHint({ hint: undefined })).toBeNull()
  })

  it('renders the hint text when the control declares one', () => {
    render(<>{controlHint({ hint: 'Pick a size' })}</>)
    expect(screen.getByText('Pick a size')).toBeTruthy()
  })
})
