import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'

import { TrackInfo } from './TrackInfo'

describe('TrackInfo', () => {
  it('shows the title and artist', () => {
    render(<TrackInfo title="Song" artist="Band" isLive={undefined} />)
    expect(screen.getByText('Song')).toBeTruthy()
    expect(screen.getByText('Band')).toBeTruthy()
  })

  it('falls back to "Unknown track" with no title', () => {
    render(
      <TrackInfo title={undefined} artist={undefined} isLive={undefined} />
    )
    expect(screen.getByText('Unknown track')).toBeTruthy()
  })

  it('shows a LIVE pill only when live', () => {
    render(<TrackInfo title="Song" artist="Band" isLive />)
    expect(screen.getByText('LIVE')).toBeTruthy()
  })

  it('shows no LIVE pill when not live', () => {
    render(<TrackInfo title="Song" artist="Band" isLive={false} />)
    expect(screen.queryByText('LIVE')).toBeNull()
  })
})
