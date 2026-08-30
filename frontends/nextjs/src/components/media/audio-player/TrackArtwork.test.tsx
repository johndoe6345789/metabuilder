import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'

import { TrackArtwork } from './TrackArtwork'

describe('TrackArtwork', () => {
  it('shows the artwork image when given one', () => {
    render(<TrackArtwork artwork="https://x/art.png" title="Song" />)
    expect(screen.getByRole('img').getAttribute('src')).toBe(
      'https://x/art.png'
    )
  })

  it('shows a placeholder icon with no artwork', () => {
    render(<TrackArtwork artwork={undefined} title="Song" />)
    expect(screen.getByText('music_note')).toBeTruthy()
  })
})
