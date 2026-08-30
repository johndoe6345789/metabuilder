import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'

import { NowWatchingPanel } from './NowWatchingPanel'

describe('NowWatchingPanel', () => {
  it('shows the channel title', () => {
    render(
      <NowWatchingPanel title="News" url="https://x" onBack={vi.fn()} />
    )
    expect(screen.getByRole('heading', { name: 'News' })).toBeTruthy()
  })

  it('calls onBack when the back button is clicked', () => {
    const onBack = vi.fn()
    render(<NowWatchingPanel title="News" url="https://x" onBack={onBack} />)
    fireEvent.click(screen.getByText('← Back to guide'))
    expect(onBack).toHaveBeenCalledOnce()
  })
})
