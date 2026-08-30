import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'

import { NowLine } from './NowLine'

describe('NowLine', () => {
  it('places itself at the given percentage into the grid', () => {
    const { container } = render(<NowLine nowPct={50} />)
    const line = container.firstElementChild as HTMLElement
    expect(line.style.left).toContain('0.5')
  })

  it('sits at the grid start for 0%', () => {
    const { container } = render(<NowLine nowPct={0} />)
    const line = container.firstElementChild as HTMLElement
    expect(line.style.left).toContain('0 * (100% - 168px)')
  })
})
